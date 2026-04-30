"use client";

import { useEffect, useState } from "react";
import { SavedStory, deleteStory, listStories } from "@/lib/library";

type Props = {
  onPick: (story: SavedStory) => void;
  onBack: () => void;
};

type Source = "cloud" | "local";

export function Library({ onPick, onBack }: Props) {
  const [stories, setStories] = useState<SavedStory[] | null>(null);
  const [source, setSource] = useState<Source>("cloud");

  useEffect(() => {
    let alive = true;
    (async () => {
      // Try the cloud first. If it isn't configured (no Upstash env on
      // server) or the request errors, fall back to per-device IndexedDB.
      try {
        const res = await fetch("/api/cloud-stories", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.configured && Array.isArray(data.stories)) {
            if (alive) {
              setStories(
                data.stories.map((s: SavedStory) => ({
                  id: s.id,
                  title: s.title,
                  paragraphs: s.paragraphs,
                  imageUrl: s.imageUrl ?? null,
                  imagePrompt: s.imagePrompt ?? "",
                  storyPrompt: s.storyPrompt ?? "",
                  createdAt: s.createdAt,
                })),
              );
              setSource("cloud");
            }
            return;
          }
        }
      } catch {
        // network fail, fall through to local
      }
      const local = await listStories().catch(() => []);
      if (alive) {
        setStories(local);
        setSource("local");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (source !== "local") return; // can't delete shared cloud stories
    await deleteStory(id);
    setStories((curr) => (curr ? curr.filter((s) => s.id !== id) : curr));
  }

  const headerLabel =
    source === "cloud" ? "📚 مكتبة الجميع" : "📚 مكتبتي";
  const emptyMessage =
    source === "cloud"
      ? "لا توجد قصص بعد. كن أول من يصنع قصة!"
      : "لم تصنع أي قصة بعد!";

  return (
    <section className="library">
      <button type="button" className="back-link" onClick={onBack}>
        ← رجوع
      </button>
      <h1 className="title">{headerLabel}</h1>

      {stories === null && <p className="library-empty">...جاري التحميل</p>}

      {stories !== null && stories.length === 0 && (
        <p className="library-empty">
          {emptyMessage}
          <br />
          ✨ ارجع واطلب من القمر قصة.
        </p>
      )}

      {stories !== null && stories.length > 0 && (
        <div className="library-grid">
          {stories.map((s) => (
            <div key={s.id} className="library-card-wrap">
              <button
                type="button"
                className="library-card"
                onClick={() => onPick(s)}
              >
                <div className="library-card-cover">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" />
                  ) : (
                    <span aria-hidden>📖</span>
                  )}
                </div>
                <div className="library-card-body">
                  <h3 className="library-card-title" dir="rtl" lang="ar">
                    {s.title}
                  </h3>
                  <span className="library-card-date">
                    {new Date(s.createdAt).toLocaleDateString("ar")}
                  </span>
                </div>
              </button>
              {source === "local" && (
                <button
                  type="button"
                  className="library-card-delete"
                  onClick={(e) => handleDelete(e, s.id)}
                  aria-label="احذف القصة"
                  title="احذف القصة"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

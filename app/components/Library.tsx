"use client";

import { useEffect, useState } from "react";
import { SavedStory, deleteStory, listStories } from "@/lib/library";

type Props = {
  onPick: (story: SavedStory) => void;
  onBack: () => void;
};

export function Library({ onPick, onBack }: Props) {
  const [stories, setStories] = useState<SavedStory[] | null>(null);

  useEffect(() => {
    let alive = true;
    listStories()
      .then((list) => {
        if (alive) setStories(list);
      })
      .catch(() => {
        if (alive) setStories([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await deleteStory(id);
    setStories((curr) => (curr ? curr.filter((s) => s.id !== id) : curr));
  }

  return (
    <section className="library">
      <button type="button" className="back-link" onClick={onBack}>
        ← رجوع
      </button>
      <h1 className="title">📚 مكتبتي</h1>

      {stories === null && (
        <p className="library-empty">...جاري التحميل</p>
      )}

      {stories !== null && stories.length === 0 && (
        <p className="library-empty">
          لم تصنع أي قصة بعد! ✨
          <br />
          ارجع واطلب من القمر قصة.
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
              <button
                type="button"
                className="library-card-delete"
                onClick={(e) => handleDelete(e, s.id)}
                aria-label="احذف القصة"
                title="احذف القصة"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

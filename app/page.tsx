"use client";

import { useState } from "react";
import { StoryDisplay } from "./components/StoryDisplay";
import { LoadingScreen } from "./components/LoadingScreen";
import { StoryFriend } from "./components/StoryFriend";
import { ChatInput } from "./components/ChatInput";
import { ThemeToggle } from "./components/ThemeToggle";
import { Library } from "./components/Library";
import { useShootingStar } from "./components/ShootingStar";
import { SavedStory, newStoryId, saveStory, updateStory } from "@/lib/library";

type Phase = "chat" | "loading" | "story" | "library" | "error";

type Turn = { role: "friend" | "kid"; text: string };

type GeneratedStory = {
  title: string;
  paragraphs: string[];
  imagePrompt: string;
};

const DEFAULT_FIRST_QUESTION = "ما القصة التي تريد سماعها الليلة؟ 🌙";
const DEFAULT_FIRST_CHIPS = [
  "تنين شجاع 🐉",
  "أميرة في الفضاء 🚀",
  "صديقان في الغابة 🌳",
  "فاجئني! ✨",
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("chat");
  const [history, setHistory] = useState<Turn[]>([
    { role: "friend", text: DEFAULT_FIRST_QUESTION },
  ]);
  const [chips, setChips] = useState<string[]>(DEFAULT_FIRST_CHIPS);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  const triggerShootingStar = useShootingStar();

  const currentQuestion =
    [...history].reverse().find((t) => t.role === "friend")?.text ?? DEFAULT_FIRST_QUESTION;

  async function sendKidMessage(text: string) {
    const newHistory: Turn[] = [...history, { role: "kid", text }];
    setHistory(newHistory);
    setDraft("");
    setThinking(true);
    triggerShootingStar();

    try {
      const res = await fetch("/api/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.ready && data.story_prompt) {
        await generateStory(data.story_prompt);
      } else if (data.question) {
        setHistory((h) => [...h, { role: "friend", text: data.question }]);
        setChips(Array.isArray(data.chips) ? data.chips.slice(0, 4) : []);
        setThinking(false);
      } else {
        throw new Error("استجابة غير متوقعة من المساعد");
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "حدث خطأ");
      setPhase("error");
      setThinking(false);
    }
  }

  async function generateStory(storyPrompt: string) {
    setPhase("loading");
    setThinking(false);
    setErrorMessage(null);
    setStory(null);
    setImageUrl(null);
    setImageError(null);
    triggerShootingStar();

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyPrompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
      }
      const data: GeneratedStory = await res.json();
      setStory(data);
      setPhase("story");
      triggerShootingStar();
      setTimeout(() => triggerShootingStar(), 600);

      // Save to local library immediately. Image will be patched in
      // when it lands so the library card has a thumbnail.
      const id = newStoryId();
      setCurrentStoryId(id);
      const saved: SavedStory = {
        id,
        title: data.title,
        paragraphs: data.paragraphs,
        imagePrompt: data.imagePrompt,
        imageUrl: null,
        storyPrompt,
        createdAt: Date.now(),
      };
      saveStory(saved).catch((err) => {
        console.warn("library save failed", err);
      });

      if (data.imagePrompt) {
        setImageLoading(true);
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: data.imagePrompt }),
        })
          .then(async (r) => {
            if (!r.ok) {
              const err = await r.json().catch(() => ({}));
              throw new Error(err.detail || err.error || `HTTP ${r.status}`);
            }
            const j = await r.json();
            setImageUrl(j.imageUrl);
            updateStory(id, { imageUrl: j.imageUrl }).catch(() => {});
          })
          .catch((e: unknown) => {
            setImageError(e instanceof Error ? e.message : "خطأ في الصورة");
          })
          .finally(() => setImageLoading(false));
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "حدث خطأ");
      setPhase("error");
    }
  }

  function handleStartOver() {
    setHistory([{ role: "friend", text: DEFAULT_FIRST_QUESTION }]);
    setChips(DEFAULT_FIRST_CHIPS);
    setDraft("");
    setStory(null);
    setImageUrl(null);
    setImageError(null);
    setErrorMessage(null);
    setCurrentStoryId(null);
    setPhase("chat");
  }

  function handleOpenLibrary() {
    setPhase("library");
  }

  function handlePickFromLibrary(saved: SavedStory) {
    setStory({
      title: saved.title,
      paragraphs: saved.paragraphs,
      imagePrompt: saved.imagePrompt,
    });
    setImageUrl(saved.imageUrl);
    setImageLoading(false);
    setImageError(null);
    setCurrentStoryId(saved.id);
    setPhase("story");
  }

  return (
    <main className="app">
      <div className="top-bar">
        <ThemeToggle />
        {phase !== "library" && (
          <button
            type="button"
            className="library-btn"
            onClick={handleOpenLibrary}
          >
            📚 مكتبتي
          </button>
        )}
      </div>

      {phase === "chat" && (
        <section className="chat-stage">
          <h1 className="title">📖 صانع القصص</h1>
          <StoryFriend question={currentQuestion} thinking={thinking} />
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={sendKidMessage}
            onChipTap={(chip) => sendKidMessage(chip)}
            chips={thinking ? [] : chips}
            disabled={thinking}
          />
        </section>
      )}

      {phase === "loading" && <LoadingScreen message="جاري كتابة قصتك السحرية..." />}

      {phase === "story" && story && (
        <StoryDisplay
          title={story.title}
          paragraphs={story.paragraphs}
          emojiRow="🌙 ✨"
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          imageError={imageError}
          onStartOver={handleStartOver}
        />
      )}

      {phase === "library" && (
        <Library onPick={handlePickFromLibrary} onBack={handleStartOver} />
      )}

      {phase === "error" && (
        <section>
          <h1 className="title">📖 صانع القصص</h1>
          <p className="error-text">⚠️ {errorMessage}</p>
          <div className="actions">
            <button type="button" className="btn" onClick={handleStartOver}>
              حاول مرة أخرى
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

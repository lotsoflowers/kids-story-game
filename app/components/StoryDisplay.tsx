"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  paragraphs: string[];
  emojiRow: string;
  imageUrl: string | null;
  imageLoading: boolean;
  imageError: string | null;
  onStartOver: () => void;
  onChange: () => void;
};

export function StoryDisplay({
  title,
  paragraphs,
  emojiRow,
  imageUrl,
  imageLoading,
  imageError,
  onStartOver,
  onChange,
}: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function handleListen() {
    if (audioUrl) {
      audioRef.current?.play();
      return;
    }
    setAudioLoading(true);
    setAudioError(null);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title}. ${paragraphs.join(" ")}` }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      // Wait for the next tick so the <audio> picks up the src.
      setTimeout(() => audioRef.current?.play(), 0);
    } catch (e) {
      setAudioError(e instanceof Error ? e.message : "فشل تحميل الصوت");
    } finally {
      setAudioLoading(false);
    }
  }

  return (
    <section>
      <div className="story-emoji-row" aria-hidden>
        {emojiRow}
      </div>

      <div className="cover">
        {imageLoading && (
          <div className="cover-placeholder">
            <span className="cover-spinner" aria-hidden />
            <span>جاري رسم الصورة...</span>
          </div>
        )}
        {!imageLoading && imageUrl && (
          <img src={imageUrl} alt="" className="cover-image" />
        )}
        {!imageLoading && !imageUrl && imageError && (
          <div className="cover-placeholder cover-error">🎨 (تعذّر إنشاء الصورة)</div>
        )}
      </div>

      <article className="story" dir="rtl" lang="ar">
        <h2 className="story-title">{title}</h2>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={handleListen}
          disabled={audioLoading}
        >
          {audioLoading ? "...جاري التحميل" : audioUrl ? "▶ Listen again" : "🔊 Listen"}
        </button>
        <button type="button" className="btn secondary" onClick={onStartOver}>
          Make a new story
        </button>
        <button type="button" className="btn secondary" onClick={onChange}>
          Change something
        </button>
      </div>

      {audioError && <p className="error-text">⚠️ {audioError}</p>}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} controls className="audio-player" />
      )}
    </section>
  );
}

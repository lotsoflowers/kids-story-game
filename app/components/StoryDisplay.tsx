"use client";

import { useEffect, useRef, useState } from "react";
import { useShootingStar } from "./ShootingStar";

type Props = {
  title: string;
  paragraphs: string[];
  emojiRow: string;
  imageUrl: string | null;
  imageLoading: boolean;
  imageError: string | null;
  onStartOver: () => void;
};

type SpeechState = "idle" | "loading" | "playing" | "paused" | "error";

// Pick the warmest-sounding Arabic voice the OS exposes. Falls back
// to whichever default voice the OS has if no Arabic voice is
// installed. Used only when the gtts route is unreachable.
function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const arabic = voices.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  const preferred =
    arabic.find((v) => /maged|fatima|salma|laila|amira|maha|sahar|sara/i.test(v.name)) ||
    arabic[0];
  return preferred ?? voices[0];
}

export function StoryDisplay({
  title,
  paragraphs,
  emojiRow,
  imageUrl,
  imageLoading,
  imageError,
  onStartOver,
}: Props) {
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const triggerShootingStar = useShootingStar();

  // Stop everything (gtts audio + speechSynthesis) when leaving the
  // page or switching to a different story.
  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stopAll();
    setSpeechState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  function stopAll() {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }

  // Browser TTS fallback — used when /api/narrate fails (e.g. Google
  // rate-limited us).
  function speakWithBrowser(text: string) {
    if (!window.speechSynthesis) {
      setSpeechError("متصفحك لا يدعم القراءة بصوت عال");
      setSpeechState("error");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-SA";
    u.rate = 0.92;
    u.pitch = 1.05;
    const voice = pickArabicVoice();
    if (voice) u.voice = voice;
    u.onend = () => setSpeechState("idle");
    u.onerror = (e) => {
      setSpeechError(e.error || "تعذّر تشغيل الصوت");
      setSpeechState("error");
    };
    synth.speak(u);
    setSpeechState("playing");
  }

  async function handleListen() {
    triggerShootingStar();

    // Toggle: if currently playing audio, pause; if paused, resume.
    if (speechState === "playing" && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setSpeechState("paused");
      return;
    }
    if (speechState === "paused" && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setSpeechState("playing");
      return;
    }

    // Fresh start. Try gtts first.
    stopAll();
    setSpeechError(null);
    setSpeechState("loading");
    const text = `${title}. ${paragraphs.join(" ")}`;

    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        throw new Error(`narrate ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setSpeechState("idle");
      audio.onerror = () => {
        // If gtts blob fails to play, fall back to speechSynthesis.
        speakWithBrowser(text);
      };
      await audio.play();
      setSpeechState("playing");
    } catch {
      // /api/narrate threw (network, 502, etc.) — fall back to the
      // browser's built-in TTS.
      speakWithBrowser(text);
    }
  }

  function handleStop() {
    stopAll();
    setSpeechState("idle");
  }

  const listenLabel =
    speechState === "loading"
      ? "...جاري التحميل"
      : speechState === "playing"
        ? "⏸ إيقاف مؤقت"
        : speechState === "paused"
          ? "▶ تابع"
          : "🔊 استمع";

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
          disabled={speechState === "loading"}
        >
          {listenLabel}
        </button>
        {(speechState === "playing" || speechState === "paused") && (
          <button type="button" className="btn secondary" onClick={handleStop}>
            ⏹ توقف
          </button>
        )}
        <button type="button" className="btn secondary" onClick={onStartOver}>
          ✨ قصة جديدة
        </button>
      </div>

      {speechError && <p className="error-text">⚠️ {speechError}</p>}
    </section>
  );
}

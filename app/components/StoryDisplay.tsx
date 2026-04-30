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

// Pick the warmest-sounding Arabic voice the OS exposes. Falls back to
// any Arabic-region voice, then the default voice if the OS has no
// Arabic TTS installed.
function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer female voices first since they read more like a storybook narrator.
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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const triggerShootingStar = useShootingStar();

  // Stop speech if the component unmounts or the story changes.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Cancel any prior utterance when the story content changes.
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setSpeechState("idle");
    }
  }, [title]);

  // Some browsers populate getVoices() asynchronously. Trigger a
  // re-render once they arrive so handleListen can pick the right one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const onChange = () => {
      // No state to set — pickArabicVoice reads voices fresh on click.
    };
    synth.addEventListener?.("voiceschanged", onChange);
    return () => synth.removeEventListener?.("voiceschanged", onChange);
  }, []);

  function handleListen() {
    triggerShootingStar();
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSpeechError("متصفحك لا يدعم القراءة بصوت عال");
      setSpeechState("error");
      return;
    }
    const synth = window.speechSynthesis;

    // Toggle: if already playing, pause; if paused, resume.
    if (speechState === "playing") {
      synth.pause();
      setSpeechState("paused");
      return;
    }
    if (speechState === "paused") {
      synth.resume();
      setSpeechState("playing");
      return;
    }

    // Fresh start.
    synth.cancel();
    setSpeechError(null);
    const text = `${title}. ${paragraphs.join(" ")}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-SA";
    u.rate = 0.92;
    u.pitch = 1.05;
    const voice = pickArabicVoice();
    if (voice) u.voice = voice;
    u.onstart = () => setSpeechState("playing");
    u.onend = () => setSpeechState("idle");
    u.onerror = (e) => {
      setSpeechError(e.error || "تعذّر تشغيل الصوت");
      setSpeechState("error");
    };
    utteranceRef.current = u;
    synth.speak(u);
    // Some browsers don't fire onstart reliably; flip state immediately.
    setSpeechState("playing");
  }

  function handleStop() {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSpeechState("idle");
  }

  const listenLabel =
    speechState === "playing"
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
        <button type="button" className="btn" onClick={handleListen}>
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

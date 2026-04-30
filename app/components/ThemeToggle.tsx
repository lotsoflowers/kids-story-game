"use client";

import { useTheme } from "@/lib/theme";

const LABELS: Record<string, string> = {
  auto: "تلقائي (حسب الوقت)",
  day: "وضع النهار",
  night: "وضع الليل",
};

const NEXT: Record<string, string> = {
  auto: "بدّل إلى وضع النهار",
  day: "بدّل إلى وضع الليل",
  night: "بدّل إلى الوضع التلقائي",
};

export function ThemeToggle() {
  const { mode, resolved, cycle } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle mode-${mode}`}
      onClick={cycle}
      aria-label={NEXT[mode]}
      title={`${LABELS[mode]} — انقر للتبديل`}
      data-resolved={resolved}
    >
      {mode === "auto" ? (
        <span className="icon icon-auto" aria-hidden>
          <span className="icon-auto-sun">☀️</span>
          <span className="icon-auto-moon">🌙</span>
        </span>
      ) : (
        <>
          <span className="icon icon-moon" aria-hidden>🌙</span>
          <span className="icon icon-sun" aria-hidden>☀️</span>
        </>
      )}
    </button>
  );
}

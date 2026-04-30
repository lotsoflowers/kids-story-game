"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const ariaLabel =
    theme === "night" ? "تبديل إلى وضع النهار" : "تبديل إلى وضع الليل";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="icon icon-moon" aria-hidden>🌙</span>
      <span className="icon icon-sun" aria-hidden>☀️</span>
    </button>
  );
}

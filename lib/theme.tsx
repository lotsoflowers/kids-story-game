"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeMode = "auto" | "day" | "night";
export type ResolvedTheme = "day" | "night";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  cycle: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "kids-story-theme";
const DEFAULT_MODE: ThemeMode = "auto";

// Day window: 6:00–18:59 local time. Outside that (19:00–05:59) is night.
function resolveAutoTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "night";
  const h = new Date().getHours();
  return h >= 6 && h < 19 ? "day" : "night";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "auto" || stored === "day" || stored === "night") return stored;
  return DEFAULT_MODE;
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  return mode === "auto" ? resolveAutoTheme() : mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with a stable default so SSR and the first client paint
  // agree; the inline bootstrap script in <head> already painted the
  // correct theme from localStorage before React hydrated.
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [resolved, setResolved] = useState<ResolvedTheme>("night");

  // Hydrate from localStorage post-mount.
  useEffect(() => {
    const stored = readStoredMode();
    setModeState(stored);
    setResolved(resolveMode(stored));
  }, []);

  // Apply the resolved theme to the DOM and persist mode.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", resolved);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, resolved]);

  // While in auto mode, re-evaluate every minute so the theme can
  // flip when the clock crosses 6 a.m. or 7 p.m. without the user
  // doing anything. We deliberately don't tick() inside this effect:
  // the hydrate effect (and the cycle handler) already set `resolved`
  // for the current moment, and a tick() here would race them on the
  // initial render when mode defaults to "auto" before hydrate flips
  // it to whatever's in localStorage.
  useEffect(() => {
    if (mode !== "auto") return;
    const id = window.setInterval(() => setResolved(resolveAutoTheme()), 60_000);
    return () => window.clearInterval(id);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    setResolved(resolveMode(m));
  }, []);

  const cycle = useCallback(() => {
    setModeState((m) => {
      const next: ThemeMode = m === "auto" ? "day" : m === "day" ? "night" : "auto";
      setResolved(resolveMode(next));
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, cycle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { mode: DEFAULT_MODE, resolved: "night", cycle: () => {}, setMode: () => {} };
  }
  return ctx;
}

// Inline script injected into <head>. Reads localStorage and sets
// data-theme on <html> before React hydrates so there's no flash of
// the wrong theme. Mirrors the resolveAutoTheme logic above.
export const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var m = localStorage.getItem('${STORAGE_KEY}');
    if (m !== 'auto' && m !== 'day' && m !== 'night') m = '${DEFAULT_MODE}';
    var resolved;
    if (m === 'auto') {
      var h = new Date().getHours();
      resolved = (h >= 6 && h < 19) ? 'day' : 'night';
    } else {
      resolved = m;
    }
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'night');
  }
})();
`;

"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function Clock() {
  // null until hydrated to avoid SSR-vs-client mismatch (server has no
  // notion of the user's local clock).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return null;

  const hour = now.getHours();
  const isDayHour = hour >= 6 && hour < 19;

  return (
    <div className="clock" aria-live="polite">
      <span className="clock-icon" aria-hidden>
        {isDayHour ? "☀️" : "🌙"}
      </span>
      <span className="clock-time">{formatTime(now)}</span>
      <span className="clock-date">{formatDate(now)}</span>
    </div>
  );
}

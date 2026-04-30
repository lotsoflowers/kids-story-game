// Both day and night chrome live here. Stars + moon are visible only
// when [data-theme="night"] (driven by CSS opacity tokens), and the
// sun is visible only when [data-theme="day"]. Clouds are visible in
// both with theme-tinted color. Positions are hardcoded so SSR and
// client agree on layout.

const stars: Array<{ x: number; y: number; size: number; delay: number; color: "yellow" | "white" }> = [
  { x: 4, y: 8, size: 2, delay: 0.0, color: "yellow" },
  { x: 11, y: 18, size: 3, delay: 1.2, color: "white" },
  { x: 17, y: 6, size: 2, delay: 2.1, color: "white" },
  { x: 24, y: 12, size: 2, delay: 0.6, color: "yellow" },
  { x: 32, y: 22, size: 3, delay: 1.8, color: "white" },
  { x: 39, y: 5, size: 2, delay: 0.3, color: "white" },
  { x: 46, y: 15, size: 2, delay: 2.4, color: "yellow" },
  { x: 54, y: 9, size: 3, delay: 1.0, color: "white" },
  { x: 62, y: 20, size: 2, delay: 0.8, color: "yellow" },
  { x: 71, y: 7, size: 2, delay: 1.5, color: "white" },
  { x: 79, y: 16, size: 2, delay: 2.7, color: "white" },
  { x: 86, y: 4, size: 3, delay: 0.9, color: "yellow" },
  { x: 93, y: 12, size: 2, delay: 1.4, color: "white" },
  { x: 7, y: 28, size: 2, delay: 0.4, color: "white" },
  { x: 19, y: 32, size: 2, delay: 2.0, color: "yellow" },
  { x: 28, y: 38, size: 3, delay: 1.3, color: "white" },
  { x: 36, y: 30, size: 2, delay: 0.7, color: "white" },
  { x: 45, y: 36, size: 2, delay: 2.2, color: "yellow" },
  { x: 53, y: 28, size: 2, delay: 1.6, color: "white" },
  { x: 61, y: 34, size: 3, delay: 0.5, color: "white" },
  { x: 70, y: 30, size: 2, delay: 2.5, color: "yellow" },
  { x: 78, y: 38, size: 2, delay: 1.1, color: "white" },
  { x: 88, y: 32, size: 2, delay: 0.2, color: "white" },
  { x: 96, y: 40, size: 2, delay: 1.9, color: "yellow" },
  { x: 3, y: 48, size: 2, delay: 1.7, color: "white" },
  { x: 14, y: 54, size: 3, delay: 0.6, color: "white" },
  { x: 26, y: 50, size: 2, delay: 2.3, color: "yellow" },
  { x: 38, y: 56, size: 2, delay: 1.0, color: "white" },
  { x: 50, y: 48, size: 2, delay: 0.4, color: "white" },
  { x: 64, y: 54, size: 2, delay: 2.6, color: "yellow" },
  { x: 75, y: 50, size: 3, delay: 1.4, color: "white" },
  { x: 84, y: 58, size: 2, delay: 0.8, color: "white" },
  { x: 92, y: 52, size: 2, delay: 2.0, color: "yellow" },
  { x: 9, y: 70, size: 2, delay: 1.6, color: "white" },
  { x: 22, y: 68, size: 2, delay: 0.5, color: "white" },
  { x: 41, y: 72, size: 2, delay: 2.2, color: "yellow" },
  { x: 58, y: 76, size: 2, delay: 1.1, color: "white" },
  { x: 73, y: 70, size: 2, delay: 0.3, color: "white" },
  { x: 89, y: 74, size: 3, delay: 1.8, color: "yellow" },
];

const clouds = [
  { y: 12, durationS: 80, delayS: -10, scale: 1.0 },
  { y: 42, durationS: 110, delayS: -55, scale: 1.3 },
  { y: 68, durationS: 95, delayS: -30, scale: 0.85 },
];

export function Sky() {
  return (
    <div className="sky" aria-hidden>
      <div className="moon">
        <div className="moon-glow" />
      </div>
      <div className="sun">
        <div className="sun-rays" />
      </div>
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star star-${s.color}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: `${c.y}%`,
            animationDuration: `${c.durationS}s`,
            animationDelay: `${c.delayS}s`,
            transform: `scale(${c.scale})`,
          }}
        />
      ))}
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ShootingStar = {
  id: number;
  xPct: number;
  yPct: number;
  angleDeg: number;
};

type ShootingStarContextValue = {
  trigger: () => void;
};

const ShootingStarContext = createContext<ShootingStarContextValue | null>(null);

const STAR_DURATION_MS = 1600;

export function ShootingStarProvider({ children }: { children: React.ReactNode }) {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const idRef = useRef(0);

  const trigger = useCallback(() => {
    const id = ++idRef.current;
    // Spawn somewhere in the upper-left half of the viewport so the
    // diagonal trail has room to travel into the upper-right area.
    const xPct = 5 + Math.random() * 50;
    const yPct = 5 + Math.random() * 30;
    const angleDeg = 20 + Math.random() * 25; // shallow downward diagonal
    setStars((s) => [...s, { id, xPct, yPct, angleDeg }]);
    setTimeout(() => {
      setStars((s) => s.filter((star) => star.id !== id));
    }, STAR_DURATION_MS);
  }, []);

  return (
    <ShootingStarContext.Provider value={{ trigger }}>
      {children}
      <div className="shooting-star-layer" aria-hidden>
        {stars.map((s) => (
          <div
            key={s.id}
            className="shooting-star-wrapper"
            style={{
              left: `${s.xPct}%`,
              top: `${s.yPct}%`,
              transform: `rotate(${s.angleDeg}deg)`,
            }}
          >
            <div className="shooting-star" />
          </div>
        ))}
      </div>
    </ShootingStarContext.Provider>
  );
}

export function useShootingStar() {
  const ctx = useContext(ShootingStarContext);
  // Outside the provider this is a no-op so server-rendered code paths
  // and tests don't blow up.
  return ctx?.trigger ?? (() => {});
}

"use client";

type Props = {
  question: string;
  thinking?: boolean;
};

export function StoryFriend({ question, thinking }: Props) {
  return (
    <div className="story-friend">
      <div className="friend">
        <div className="friend-sparkles" aria-hidden>
          <span className="sparkle sparkle-1">✦</span>
          <span className="sparkle sparkle-2">✦</span>
          <span className="sparkle sparkle-3">✦</span>
          <span className="sparkle sparkle-4">✦</span>
          <span className="sparkle sparkle-5">✦</span>
        </div>
        <div className="friend-glow" aria-hidden />
        <svg
          className="friend-svg"
          viewBox="0 0 200 280"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--friend-body-1)" />
              <stop offset="100%" stopColor="var(--friend-body-2)" />
            </linearGradient>
            <radialGradient id="skinGradient" cx="0.35" cy="0.3" r="0.85">
              <stop offset="0%" stopColor="var(--friend-skin-light)" />
              <stop offset="100%" stopColor="var(--friend-skin)" />
            </radialGradient>
          </defs>

          {/* Body / robe — drawn first so the head sits on top of the neck */}
          <path
            d="M 35 215 Q 100 188 165 215 L 178 280 L 22 280 Z"
            fill="url(#bodyGradient)"
          />
          {/* Sleeves (rounded shoulders) */}
          <ellipse cx="38" cy="225" rx="22" ry="32" fill="url(#bodyGradient)" />
          <ellipse cx="162" cy="225" rx="22" ry="32" fill="url(#bodyGradient)" />
          {/* Hands peeking forward */}
          <circle cx="68" cy="245" r="14" fill="url(#skinGradient)" />
          <circle cx="132" cy="245" r="14" fill="url(#skinGradient)" />
          {/* Tiny collar accent */}
          <path
            d="M 70 200 Q 100 215 130 200 L 130 210 Q 100 222 70 210 Z"
            className="friend-collar"
          />

          {/* Neck */}
          <rect
            x="84"
            y="170"
            width="32"
            height="28"
            rx="6"
            fill="url(#skinGradient)"
          />

          {/* Head */}
          <circle cx="100" cy="105" r="72" fill="url(#skinGradient)" />

          {/* Hair — soft fringe + crown swoop, drawn after head */}
          <path
            d="M 32 95
               Q 36 50 80 38
               Q 100 32 120 38
               Q 164 50 168 95
               Q 158 78 130 75
               Q 145 60 110 60
               Q 80 60 70 78
               Q 50 80 32 95 Z"
            className="friend-hair"
          />
          {/* A little tuft / ahoge for personality */}
          <path
            d="M 95 32 Q 100 12 115 22 Q 110 32 100 38 Z"
            className="friend-hair"
          />

          {/* Cheeks */}
          <ellipse cx="50" cy="130" rx="16" ry="11" className="friend-cheek" />
          <ellipse cx="150" cy="130" rx="16" ry="11" className="friend-cheek" />

          {/* Left eye */}
          <g className={`friend-eye-group${thinking ? " squint" : ""}`}>
            <ellipse
              cx="73"
              cy="105"
              rx="13"
              ry="17"
              className="friend-eye-pupil"
            />
            <circle cx="79" cy="98" r="5" className="friend-eye-shine" />
            <circle cx="69" cy="111" r="2" className="friend-eye-shine-small" />
          </g>

          {/* Right eye */}
          <g className={`friend-eye-group${thinking ? " squint" : ""}`}>
            <ellipse
              cx="127"
              cy="105"
              rx="13"
              ry="17"
              className="friend-eye-pupil"
            />
            <circle cx="133" cy="98" r="5" className="friend-eye-shine" />
            <circle cx="123" cy="111" r="2" className="friend-eye-shine-small" />
          </g>

          {/* Mouth */}
          {thinking ? (
            <ellipse cx="100" cy="148" rx="10" ry="6" className="friend-mouth-o" />
          ) : (
            <path
              d="M 75 144 Q 100 168 125 144"
              fill="none"
              strokeLinecap="round"
              className="friend-mouth-curve"
            />
          )}
        </svg>
      </div>

      <div className={`friend-bubble${thinking ? " thinking" : ""}`}>
        {thinking ? (
          <span className="thinking-dots" aria-label="thinking">
            <span /> <span /> <span />
          </span>
        ) : (
          <p dir="rtl" lang="ar">
            {question}
          </p>
        )}
      </div>
    </div>
  );
}

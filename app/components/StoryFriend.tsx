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
        <div className="friend-orb">
          <div className="friend-orb-glow" />
          <svg
            className="friend-face-svg"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            {/* Cheeks */}
            <ellipse cx="55" cy="125" rx="18" ry="12" className="friend-cheek" />
            <ellipse cx="145" cy="125" rx="18" ry="12" className="friend-cheek" />

            {/* Left eye */}
            <g className={`friend-eye-group${thinking ? " squint" : ""}`}>
              <ellipse cx="72" cy="92" rx="14" ry="18" className="friend-eye-pupil" />
              <circle cx="78" cy="86" r="5" className="friend-eye-shine" />
              <circle cx="68" cy="98" r="2" className="friend-eye-shine-small" />
            </g>

            {/* Right eye */}
            <g className={`friend-eye-group${thinking ? " squint" : ""}`}>
              <ellipse cx="128" cy="92" rx="14" ry="18" className="friend-eye-pupil" />
              <circle cx="134" cy="86" r="5" className="friend-eye-shine" />
              <circle cx="124" cy="98" r="2" className="friend-eye-shine-small" />
            </g>

            {/* Mouth */}
            {thinking ? (
              <ellipse cx="100" cy="135" rx="10" ry="6" className="friend-mouth-o" />
            ) : (
              <path
                d="M 75 130 Q 100 155 125 130"
                fill="none"
                strokeLinecap="round"
                className="friend-mouth-curve"
              />
            )}
          </svg>
        </div>
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

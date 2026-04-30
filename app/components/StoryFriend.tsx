"use client";

type Props = {
  question: string;
  thinking?: boolean;
};

export function StoryFriend({ question, thinking }: Props) {
  return (
    <div className="story-friend">
      <div className="friend-moon" aria-hidden>
        <div className="friend-moon-glow" />
        <div className="friend-face">
          <span className="friend-eye" />
          <span className="friend-eye" />
          <span className="friend-mouth" />
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

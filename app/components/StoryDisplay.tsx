import { Selections, buildStory, storyEmojiRow } from "@/lib/storyTemplate";

type Props = {
  selections: Selections;
  onStartOver: () => void;
  onChange: () => void;
};

export function StoryDisplay({ selections, onStartOver, onChange }: Props) {
  const paragraphs = buildStory(selections);
  const emojiRow = storyEmojiRow(selections);

  return (
    <section>
      <div className="story-emoji-row" aria-hidden>
        {emojiRow}
      </div>
      <article className="story">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      <div className="actions">
        <button type="button" className="btn" onClick={onStartOver}>
          Make a new story
        </button>
        <button type="button" className="btn secondary" onClick={onChange}>
          Change something
        </button>
      </div>
    </section>
  );
}

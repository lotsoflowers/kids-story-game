type Props = {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  onBack: () => void;
};

export function IdeaInput({ value, onChange, onGenerate, onBack }: Props) {
  return (
    <section>
      <button type="button" className="back-link" onClick={onBack}>
        ← Go back
      </button>
      <h2 className="step-question">Any special wishes for your story?</h2>
      <p className="subtitle" style={{ marginTop: "-12px" }}>
        Optional — type anything you'd like to happen, or skip and we'll surprise you!
      </p>
      <textarea
        className="idea-box"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="مثلاً: أريد قصة عن صديقين يبحثان عن قطة ضائعة... (or write in English)"
      />
      <div className="actions">
        <button type="button" className="btn" onClick={onGenerate}>
          ✨ Make my story
        </button>
      </div>
    </section>
  );
}

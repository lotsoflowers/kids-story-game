import { Choice, Step } from "@/lib/choices";
import { ChoiceCard } from "./ChoiceCard";

type Props = {
  step: Step;
  current?: Choice;
  onPick: (choice: Choice) => void;
  onBack?: () => void;
};

export function StepPicker({ step, current, onPick, onBack }: Props) {
  return (
    <section>
      {onBack && (
        <button type="button" className="back-link" onClick={onBack}>
          ← Go back
        </button>
      )}
      <h2 className="step-question">{step.question}</h2>
      <div className="choice-grid">
        {step.choices.map((choice) => (
          <ChoiceCard
            key={choice.id}
            choice={choice}
            selected={current?.id === choice.id}
            onSelect={onPick}
          />
        ))}
      </div>
    </section>
  );
}

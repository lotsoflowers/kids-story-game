import { Choice } from "@/lib/choices";

type Props = {
  choice: Choice;
  selected?: boolean;
  onSelect: (choice: Choice) => void;
};

export function ChoiceCard({ choice, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`choice-card${selected ? " selected" : ""}`}
      onClick={() => onSelect(choice)}
      aria-pressed={selected}
    >
      <span className="emoji" aria-hidden>
        {choice.emoji}
      </span>
      {choice.label}
    </button>
  );
}

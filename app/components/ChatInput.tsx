"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string) => void;
  onChipTap: (chip: string) => void;
  chips: string[];
  disabled?: boolean;
};

export function ChatInput({ value, onChange, onSend, onChipTap, chips, disabled }: Props) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Autofocus on first paint and after each turn so the kid can keep
  // typing without having to tap into the field.
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) onSend(trimmed);
    }
  }

  return (
    <div className="chat-input">
      <div className="chips">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="chip"
            onClick={() => onChipTap(chip)}
            disabled={disabled}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="input-row">
        <textarea
          ref={inputRef}
          className="chat-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب فكرتك أو اضغط على أحد الاقتراحات..."
          rows={2}
          disabled={disabled}
          dir="auto"
        />
        <button
          type="button"
          className="send-btn"
          onClick={() => {
            const trimmed = value.trim();
            if (trimmed) onSend(trimmed);
          }}
          disabled={disabled || !value.trim()}
          aria-label="Send"
        >
          ✨
        </button>
      </div>
    </div>
  );
}

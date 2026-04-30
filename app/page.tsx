"use client";

import { useState } from "react";
import { Choice, StepKey, steps } from "@/lib/choices";
import { Selections } from "@/lib/storyTemplate";
import { StepPicker } from "./components/StepPicker";
import { StoryDisplay } from "./components/StoryDisplay";

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Record<StepKey, Choice>>>({});
  const [showStory, setShowStory] = useState(false);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const currentChoice = selections[currentStep.key];

  const handlePick = (choice: Choice) => {
    const next = { ...selections, [currentStep.key]: choice };
    setSelections(next);
    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setShowStory(true);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleStartOver = () => {
    setSelections({});
    setStepIndex(0);
    setShowStory(false);
  };

  const handleChange = () => {
    setShowStory(false);
    setStepIndex(0);
  };

  const allChosen = steps.every((s) => selections[s.key]);

  return (
    <main className="app">
      <h1 className="title">📖 Story Builder</h1>
      <p className="subtitle">
        {showStory ? "Here is your one-of-a-kind story!" : "Make your own story in 5 little choices."}
      </p>

      {!showStory && (
        <div className="progress" aria-label={`Step ${stepIndex + 1} of ${totalSteps}`}>
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`progress-dot${i === stepIndex ? " active" : ""}${
                i < stepIndex ? " done" : ""
              }`}
            />
          ))}
        </div>
      )}

      {showStory && allChosen ? (
        <StoryDisplay
          selections={selections as Selections}
          onStartOver={handleStartOver}
          onChange={handleChange}
        />
      ) : (
        <StepPicker
          step={currentStep}
          current={currentChoice}
          onPick={handlePick}
          onBack={stepIndex > 0 ? handleBack : undefined}
        />
      )}
    </main>
  );
}

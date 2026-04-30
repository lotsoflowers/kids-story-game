"use client";

import { useState } from "react";
import { Choice, StepKey, steps } from "@/lib/choices";
import { StepPicker } from "./components/StepPicker";
import { StoryDisplay } from "./components/StoryDisplay";
import { IdeaInput } from "./components/IdeaInput";
import { LoadingScreen } from "./components/LoadingScreen";

type Phase = "pick" | "idea" | "loading" | "story" | "error";

type GeneratedStory = {
  title: string;
  paragraphs: string[];
  imagePrompt: string;
};

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Record<StepKey, Choice>>>({});
  const [idea, setIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("pick");
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const currentChoice = selections[currentStep?.key];

  const handlePick = (choice: Choice) => {
    const next = { ...selections, [currentStep.key]: choice };
    setSelections(next);
    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setPhase("idea");
    }
  };

  const handleBack = () => {
    if (phase === "idea") {
      setPhase("pick");
      setStepIndex(totalSteps - 1);
      return;
    }
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleStartOver = () => {
    setSelections({});
    setStepIndex(0);
    setIdea("");
    setStory(null);
    setImageUrl(null);
    setImageError(null);
    setErrorMessage(null);
    setPhase("pick");
  };

  const handleChange = () => {
    setStory(null);
    setImageUrl(null);
    setImageError(null);
    setStepIndex(0);
    setPhase("pick");
  };

  async function handleGenerate() {
    setPhase("loading");
    setErrorMessage(null);
    setStory(null);
    setImageUrl(null);
    setImageError(null);

    try {
      const selectionLabels = Object.fromEntries(
        Object.entries(selections).map(([k, v]) => [k, v?.label]),
      );

      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, selections: selectionLabels }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
      }

      const data: GeneratedStory = await res.json();
      setStory(data);
      setPhase("story");

      // Kick off image gen in the background — story renders without it.
      if (data.imagePrompt) {
        setImageLoading(true);
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: data.imagePrompt }),
        })
          .then(async (r) => {
            if (!r.ok) {
              const err = await r.json().catch(() => ({}));
              throw new Error(err.detail || err.error || `HTTP ${r.status}`);
            }
            const j = await r.json();
            setImageUrl(j.imageUrl);
          })
          .catch((e: unknown) => {
            setImageError(e instanceof Error ? e.message : "Image error");
          })
          .finally(() => setImageLoading(false));
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "حدث خطأ");
      setPhase("error");
    }
  }

  const emojiRow = steps
    .map((s) => selections[s.key]?.emoji)
    .filter(Boolean)
    .join(" ");

  return (
    <main className="app">
      <h1 className="title">📖 Story Builder</h1>
      <p className="subtitle">
        {phase === "story"
          ? "Here is your one-of-a-kind story!"
          : phase === "loading"
            ? "Magic in progress..."
            : "Make your own story in a few little choices."}
      </p>

      {phase === "pick" && (
        <>
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
          <StepPicker
            step={currentStep}
            current={currentChoice}
            onPick={handlePick}
            onBack={stepIndex > 0 ? handleBack : undefined}
          />
        </>
      )}

      {phase === "idea" && (
        <IdeaInput
          value={idea}
          onChange={setIdea}
          onGenerate={handleGenerate}
          onBack={handleBack}
        />
      )}

      {phase === "loading" && <LoadingScreen message="جاري كتابة قصتك السحرية..." />}

      {phase === "story" && story && (
        <StoryDisplay
          title={story.title}
          paragraphs={story.paragraphs}
          emojiRow={emojiRow}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          imageError={imageError}
          onStartOver={handleStartOver}
          onChange={handleChange}
        />
      )}

      {phase === "error" && (
        <section>
          <p className="error-text">⚠️ {errorMessage}</p>
          <div className="actions">
            <button type="button" className="btn" onClick={handleGenerate}>
              Try again
            </button>
            <button type="button" className="btn secondary" onClick={handleStartOver}>
              Start over
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

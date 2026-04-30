import { Choice, StepKey } from "./choices";

export type Selections = Record<StepKey, Choice>;

const problemSentences: Record<string, (s: Selections) => string> = {
  lost: (s) =>
    `${cap(s.hero.pronounPossessive ?? "their")} favorite shiny pebble had vanished, and the whole ${s.setting.noun} felt a little quieter without it.`,
  monster: (s) =>
    `A grumbly, rumbly monster was stomping around the ${s.setting.noun} and scaring all the smaller creatures.`,
  treasure: (s) =>
    `An old map said a sparkly treasure was hidden somewhere in the ${s.setting.noun}, and only a clever hero could find it.`,
  "sad-friend": (s) =>
    `${cap(s.hero.pronounPossessive ?? "their")} best friend was sitting alone in the ${s.setting.noun}, looking very, very sad.`,
  storm: (s) =>
    `Big purple clouds rolled across the ${s.setting.noun}, and the wind started to howl in a worried sort of way.`,
  stuck: (s) =>
    `Somehow, ${s.hero.pronoun ?? "they"} got tangled up in a sticky tangle deep in the ${s.setting.noun} and couldn't wiggle free.`,
};

const helperLines: Record<string, string> = {
  fairy: "Don't worry — a sprinkle of stardust always helps!",
  mermaid: "Tra-la-la! I know a secret song for tricky days.",
  owl: "Hoot — let's think this through, one step at a time.",
  kitten: "Mew! I'll squeeze into the tiny places you can't reach.",
  tree: "Creeeak. Old roots remember almost everything, you know.",
  frog: "Ribbit! Hop on, I'll bounce us right out of trouble!",
};

const endingParagraphs: Record<string, (s: Selections) => string> = {
  happy: (s) =>
    `And just like that, everything was wonderful again. The ${s.hero.noun} and the ${s.helper.noun} laughed and hugged, and the whole ${s.setting.noun} sparkled with joy.`,
  silly: (s) =>
    `Then the ${s.helper.noun} did the silliest dance anyone had ever seen, and the ${s.hero.noun} laughed so hard ${s.hero.pronoun ?? "they"} got the hiccups. The ${s.setting.noun} hiccupped right along with them. *HIC!*`,
  brave: (s) =>
    `The ${s.hero.noun} stood tall, took a deep breath, and did the bravest thing of all. Everyone in the ${s.setting.noun} cheered, because brave hearts shine brighter than stars.`,
  surprise: (s) =>
    `Suddenly — TA-DA! — a surprise rainbow popped out of nowhere, and on it was a basket of cupcakes, just for them. Nobody knew where it came from. (But the ${s.helper.noun} winked.)`,
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildStory(s: Selections): string[] {
  const heroNoun = s.hero.noun;
  const settingNoun = s.setting.noun;
  const helperNoun = s.helper.noun;
  const helperLine = helperLines[s.helper.id] ?? "I'm here to help!";
  const problemSentence = problemSentences[s.problem.id]?.(s) ?? "Something tricky was happening.";
  const endingPara = endingParagraphs[s.ending.id]?.(s) ?? "And they all lived happily ever after.";

  return [
    `Once upon a time, there was a ${heroNoun} who lived in a ${settingNoun}.`,
    `One bright morning, ${s.hero.pronoun ?? "they"} noticed that something was wrong. ${problemSentence}`,
    `Just then, a ${helperNoun} appeared with a friendly smile. "${helperLine}" said the ${helperNoun}.`,
    `Together, the ${heroNoun} and the ${helperNoun} thought and thought, and tried and tried, until at last they had a plan.`,
    endingPara + " The end.",
  ];
}

export function storyEmojiRow(s: Selections): string {
  return [s.hero.emoji, s.setting.emoji, s.problem.emoji, s.helper.emoji, s.ending.emoji].join(" ");
}

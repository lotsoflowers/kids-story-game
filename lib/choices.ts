export type Choice = {
  id: string;
  emoji: string;
  label: string;
  // The phrasing used in story sentences. Designed so the same noun
  // can be plugged into "a {noun}" and "the {noun}".
  noun: string;
  // Optional pronoun for sentences that refer to the hero again.
  pronoun?: "he" | "she" | "they" | "it";
  pronounPossessive?: "his" | "her" | "their" | "its";
};

export type StepKey = "hero" | "setting" | "problem" | "helper" | "ending";

export type Step = {
  key: StepKey;
  question: string;
  choices: Choice[];
};

export const heroes: Choice[] = [
  { id: "dragon", emoji: "🐉", label: "Dragon", noun: "little dragon", pronoun: "they", pronounPossessive: "their" },
  { id: "princess", emoji: "👸", label: "Princess", noun: "kind princess", pronoun: "she", pronounPossessive: "her" },
  { id: "robot", emoji: "🤖", label: "Robot", noun: "shiny robot", pronoun: "it", pronounPossessive: "its" },
  { id: "puppy", emoji: "🐶", label: "Puppy", noun: "wiggly puppy", pronoun: "he", pronounPossessive: "his" },
  { id: "lion", emoji: "🦁", label: "Lion cub", noun: "brave lion cub", pronoun: "he", pronounPossessive: "his" },
  { id: "wizard", emoji: "🧙", label: "Wizard", noun: "young wizard", pronoun: "they", pronounPossessive: "their" },
  { id: "bunny", emoji: "🐰", label: "Bunny", noun: "tiny bunny", pronoun: "she", pronounPossessive: "her" },
  { id: "astronaut", emoji: "👨‍🚀", label: "Astronaut", noun: "curious astronaut", pronoun: "they", pronounPossessive: "their" },
];

export const settings: Choice[] = [
  { id: "forest", emoji: "🌳", label: "Magic Forest", noun: "magic forest" },
  { id: "space", emoji: "🚀", label: "Outer Space", noun: "sparkling galaxy" },
  { id: "castle", emoji: "🏰", label: "Castle", noun: "sky-high castle" },
  { id: "beach", emoji: "🏖️", label: "Beach", noun: "sunny beach" },
  { id: "snow", emoji: "❄️", label: "Snowy Peak", noun: "snowy mountain" },
  { id: "ocean", emoji: "🌊", label: "Under the Sea", noun: "deep blue ocean" },
  { id: "jungle", emoji: "🌴", label: "Jungle", noun: "noisy jungle" },
  { id: "city", emoji: "🏙️", label: "Tiny Town", noun: "cozy little town" },
];

export const problems: Choice[] = [
  { id: "lost", emoji: "🔍", label: "Lost something", noun: "missing-thing problem" },
  { id: "monster", emoji: "👾", label: "Big monster", noun: "noisy monster problem" },
  { id: "treasure", emoji: "🏆", label: "Hidden treasure", noun: "buried-treasure mystery" },
  { id: "sad-friend", emoji: "💔", label: "Sad friend", noun: "sad-friend problem" },
  { id: "storm", emoji: "🌧️", label: "Big storm", noun: "stormy-sky trouble" },
  { id: "stuck", emoji: "🪤", label: "Stuck somewhere", noun: "stuck-and-can't-get-out trouble" },
];

export const helpers: Choice[] = [
  { id: "fairy", emoji: "🧚", label: "Fairy", noun: "twinkly fairy" },
  { id: "mermaid", emoji: "🧜", label: "Mermaid", noun: "singing mermaid" },
  { id: "owl", emoji: "🦉", label: "Wise Owl", noun: "wise old owl" },
  { id: "kitten", emoji: "🐱", label: "Kitten", noun: "fluffy kitten" },
  { id: "tree", emoji: "🌲", label: "Talking Tree", noun: "talking pine tree" },
  { id: "frog", emoji: "🐸", label: "Frog", noun: "hopping green frog" },
];

export const endings: Choice[] = [
  { id: "happy", emoji: "😄", label: "Happy", noun: "happy" },
  { id: "silly", emoji: "🤣", label: "Silly", noun: "silly" },
  { id: "brave", emoji: "💪", label: "Brave", noun: "brave" },
  { id: "surprise", emoji: "🎁", label: "Surprise!", noun: "surprise" },
];

export const steps: Step[] = [
  { key: "hero", question: "Pick your hero!", choices: heroes },
  { key: "setting", question: "Where does the story happen?", choices: settings },
  { key: "problem", question: "What's the problem?", choices: problems },
  { key: "helper", question: "Who shows up to help?", choices: helpers },
  { key: "ending", question: "How should it end?", choices: endings },
];

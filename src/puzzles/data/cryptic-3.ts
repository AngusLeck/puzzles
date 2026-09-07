import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-3",
  title: "Tell me I'm wrong",
  attribution: "AD",
  prompt: "Delayed again, means drizzle on fourth station? (5)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "T", s2: "R", s3: "A", s4: "I", s5: "N" } }],
  hints: [
    {
      size: "definition",
      text: '"Delayed again" is the definition.',
      highlight: { prompt: ["Delayed again"] },
    },
    {
      size: "wordplay",
      text: "one of our indicators is a selection indicator, another is a synonym indicator, we also have a simple joining indicator.",
      highlight: { prompt: ["fourth", "means", "on"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "station" and "drizzle".',
      highlight: { prompt: ["drizzle", "station"] },
    },
  ],
});

import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-17",
  title: "We always knew he was special",
  attribution: "RAD",
  releaseDate: "2026-08-28",
  prompt: "Parents of Angus D put 2 and 2 together. (5)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "A", s2: "D", s3: "D", s4: "E", s5: "D" } }],
  hints: [
    {
      size: "definition",
      text: '"put 2 and 2 together" is the definition.',
      highlight: { prompt: ["put 2 and 2 together"] },
    },
    {
      size: "wordplay",
      text: "Our indicator tells us to replace the letters of some of our fodder with the letters that come before them alphabetically.",
      highlight: { prompt: ["Parents of"] },
    },
    { size: "fodder", text: 'our fodder is "Angus D".', highlight: { prompt: ["Angus D"] } },
    {
      size: "bonus",
      text: "This clue requires an unprompted substitution (sorry!)",
      highlight: {},
    },
  ],
});

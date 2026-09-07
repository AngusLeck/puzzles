import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-13",
  title: "Spring clean",
  attribution: "AD",
  releaseDate: "2026-08-21",
  prompt: "Scrubbing stomach contents off rug was a shoulder workout (5)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "S", s2: "H", s3: "R", s4: "U", s5: "G" } }],
  hints: [
    {
      size: "definition",
      text: '"shoulder workout" is the definition.',
      highlight: { prompt: ["shoulder workout"] },
    },
    {
      size: "wordplay",
      text: "Our indicators are supposed to be read together and they tell us to discard some part of our fodder.",
      highlight: { prompt: ["Scrubbing", "contents off"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "stomach" and "rug".',
      highlight: { prompt: ["stomach", "rug"] },
    },
  ],
});

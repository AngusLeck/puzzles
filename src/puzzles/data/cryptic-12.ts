import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-12",
  title: "Stylish presentation",
  attribution: "AD",
  prompt: "Apathetic chappy dons hat for speech (4)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "C", s2: "H", s3: "A", s4: "T" } }],
  hints: [
    {
      size: "definition",
      text: '"speech" is the definition.',
      highlight: { prompt: ["speech"] },
    },
    {
      size: "wordplay",
      text: '"Apathetic" and "dons" are our indicators — one of them joins, the other takes something away. Think a bit abstractly about what the words actually mean.',
      highlight: { prompt: ["Apathetic", "dons"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "chappy" and "hat".',
      highlight: { prompt: ["chappy", "hat"] },
    },
  ],
});

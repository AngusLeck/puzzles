import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-8",
  title: "Dad's a bit deaf",
  attribution: "AD",
  releaseDate: "2026-08-14",
  prompt: "Tilting his head - dad eyed listening device. (4)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "I", s2: "P", s3: "A", s4: "D" } }],
  hints: [
    {
      size: "definition",
      text: '"device" is the definition.',
      highlight: { prompt: ["device"] },
    },
    {
      size: "wordplay",
      text: "One of our indicators turns a letter around until it becomes another, the letter is selected by some other indicators; one indicator tells us to read aloud another to reveal it's true purpose.",
      highlight: { prompt: ["Tilting", "his head", "eyed", "listening"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "dad" and "eye".',
      highlight: { prompt: ["dad eye"] },
    },
  ],
});

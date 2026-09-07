import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-4",
  title: "Mathematician avoids tank",
  attribution: "APD",
  prompt: "Fibonacci silently crept about armoured vehicle. (3)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "C", s2: "A", s3: "R" } }],
  hints: [
    {
      size: "definition",
      text: '"vehicle" is the definition.',
      highlight: { prompt: ["vehicle"] },
    },
    {
      size: "wordplay",
      text: "our indicator is a selection indicator, and an unusual one — it uses a famous number sequence to pick letters out of the words nearby.",
      highlight: { prompt: ["Fibonacci"] },
    },
    {
      size: "fodder",
      text: 'We\'ll find our letters amongst "silently crept about armoured".',
      highlight: { prompt: ["silently crept about armoured"] },
    },
  ],
});

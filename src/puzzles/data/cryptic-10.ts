import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-10",
  title: "Pranked the florist",
  attribution: "AAA!",
  prompt: "Shallot used to conceal flower. (5)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "L", s2: "O", s3: "T", s4: "U", s5: "S" } }],
  hints: [
    {
      size: "definition",
      text: '"flower" is the definition.',
      highlight: { prompt: ["flower"] },
    },
    {
      size: "wordplay",
      text: "Our indicator tells us to find the answer concealed within some neighboring fodder.",
      highlight: { prompt: ["conceal"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "shallot used".',
      highlight: { prompt: ["shallot used"] },
    },
  ],
});

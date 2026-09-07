import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-9",
  title: "EGG",
  attribution: "RD",
  prompt: "Where the egg is, no one knows. (6)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
    { id: "s6", x: 5, y: 0 },
  ],
  checks: [{ type: "any" }],
  hints: [
    {
      size: "small",
      text: "You can't make a clue without breaking a few eggs, just give it a go - have faith!",
      highlight: {},
    },
  ],
});

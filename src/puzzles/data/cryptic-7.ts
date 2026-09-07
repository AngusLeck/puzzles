import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-7",
  title: "Injustice",
  attribution: "RAD",
  prompt: "Charges dropped against employer over wage theft allegations. (9)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
    { id: "s6", x: 5, y: 0 },
    { id: "s7", x: 6, y: 0 },
    { id: "s8", x: 7, y: 0 },
    { id: "s9", x: 8, y: 0 },
  ],
  checks: [
    {
      type: "slots",
      answers: { s1: "U", s2: "N", s3: "I", s4: "O", s5: "N", s6: "I", s7: "S", s8: "E", s9: "D" },
    },
  ],
  hints: [
    {
      size: "definition",
      text: "it is a double definition — two definitions of one word",
      highlight: { prompt: ["Charges dropped against employer over wage theft allegations."] },
    },
    {
      size: "bonus",
      text: '"Charges" needn\'t be legal — think physics.',
      highlight: { prompt: ["Charges dropped"] },
    },
    {
      size: "bonus",
      text: "The target word is a heteronym (spelled one way, said two)",
      highlight: { prompt: ["Charges dropped", "against employer over wage theft allegations."] },
    },
  ],
});

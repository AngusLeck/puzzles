import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-6",
  title: "Something doesn't add up",
  attribution: "APD",
  prompt: "CFO fudged the numbers, wrote 5 - 4 + 50 / y? (6)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
    { id: "s6", x: 5, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "F", s2: "E", s3: "L", s4: "O", s5: "N", s6: "Y" } }],
  hints: [
    {
      size: "definition",
      text: '"CFO fudged the numbers" is the definition. The "?" tells us it\'s a bit of a stretch.',
      highlight: { prompt: ["CFO fudged the numbers"] },
    },
    {
      size: "wordplay",
      text: "our indicators are the maths symbols — between them they take letters away, add letters on. We've also been told to write something out",
      highlight: { prompt: ["wrote", "-", "+"] },
    },
    {
      size: "fodder",
      text: "We'll need to do quite a bit of substitution on our fodder to get the letters we need.",
      highlight: { prompt: ["5", "4", "50 / y"] },
    },
    {
      size: "bonus",
      text: 'a mathematician might read the fraction as 50 "on" y',
      highlight: { prompt: ["50 / y"] },
    },
  ],
});

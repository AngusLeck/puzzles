import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-5",
  title: "Coming to peace with a republic?",
  attribution: "APD",
  prompt:
    'King David the 5th, stripped of his title. Exclaimed "!&~#" initially. Got there in the end? (5)',
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "D", s2: "E", s3: "A", s4: "T", s5: "H" } }],
  hints: [
    {
      size: "definition",
      text: '"Got there in the end?" is the definition.',
      highlight: { prompt: ["Got there in the end?"] },
    },
    {
      size: "wordplay",
      text: "Two selection indicators here: they tell us which letters in our fodder we want. We've also been told to ignore some of the fodder, and to say some of the fodder out loud.",
      highlight: { prompt: ["the 5th", "stripped of his title", "initially", "Exclaimed"] },
    },
    {
      size: "fodder",
      text: 'Our fodder is "King David" and "!&~#".',
      highlight: { prompt: ["King David", "!&~#"] },
    },
  ],
});

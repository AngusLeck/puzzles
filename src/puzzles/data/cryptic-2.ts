import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-2",
  title: "Stew on this!",
  attribution: "RAD",
  prompt: "Cough heard by overzealous sheep shearer, making bean stew? (6)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
    { id: "s6", x: 5, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "C", s2: "O", s3: "F", s4: "F", s5: "E", s6: "E" } }],
  hints: [
    {
      size: "definition",
      text: '"bean stew?" is the definition, and the "?" tells us its a bit of a stretch.',
      highlight: { prompt: ["bean stew?"] },
    },
    {
      size: "wordplay",
      text: "one of our indicators is a homophone indicator, the other is a deletion indicator - with a modification that tells us to go a bit further",
      highlight: { prompt: ["heard", "overzealous", "shearer"] },
    },
    {
      size: "fodder",
      text: 'The words being worked on are "Cough" and "sheep".',
      highlight: { prompt: ["Cough", "sheep"] },
    },
  ],
});

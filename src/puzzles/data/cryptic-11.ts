import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-11",
  title: "Melbourne is too cold anyway",
  attribution: "AD",
  // A weekend drop: on the list for Sat–Sun only, then it rolls off. The link
  // keeps working forever.
  releaseDate: "2026-08-15",
  expiryDate: "2026-08-16",
  prompt: "Flotsam mysteriously housed welcome visitor (5)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "S", s2: "A", s3: "M", s4: "M", s5: "Y" } }],
  hints: [
    {
      size: "definition",
      text: '"welcome visitor" is our definition — who could that be?',
      highlight: { prompt: ["welcome visitor"] },
    },
    {
      size: "wordplay",
      text: '"housed" is a hidden word indicator: we\'ll find our solution contained in some neighbouring fodder.',
      highlight: { prompt: ["housed"] },
    },
    {
      size: "fodder",
      text: '"Flotsam mysteriously" is the fodder — we\'ll need to do something with it according to the indicator.',
      highlight: { prompt: ["Flotsam mysteriously"] },
    },
  ],
});

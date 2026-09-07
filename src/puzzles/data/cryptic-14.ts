import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-14",
  title: "Artistic advice",
  attribution: "AD",
  releaseDate: "2026-08-28",
  prompt: "Modus operandi: rotate, overlay, and CUT. (3)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "M", s2: "O", s3: "W" } }],
  hints: [
    { size: "definition", text: '"CUT" is the definition.', highlight: { prompt: ["CUT"] } },
    {
      size: "wordplay",
      text: "our indicators taken together describe a means of transforming and recombining our fodder with itself.",
      highlight: { prompt: ["rotate", "overlay"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "Modus operandi".',
      highlight: { prompt: ["Modus operandi"] },
    },
  ],
});

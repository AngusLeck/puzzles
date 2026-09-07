import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-16",
  title: "Site visit",
  attribution: "AD",
  releaseDate: "2026-09-11",
  prompt: "One might get turned around delving into endless ruins… hold my hand again? (7)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
    { id: "s6", x: 5, y: 0 },
    { id: "s7", x: 6, y: 0 },
  ],
  checks: [
    {
      type: "slots",
      answers: { s1: "R", s2: "E", s3: "U", s4: "N", s5: "I", s6: "O", s7: "N" },
    },
  ],
  hints: [
    {
      size: "definition",
      text: '"hold my hand again" is the definition.',
      highlight: { prompt: ["hold my hand again"] },
    },
    {
      size: "wordplay",
      text: "Three indicators: one turns a piece of fodder back to front, one docks a letter off the other, and the last sends the first fodder down into the second.",
      highlight: { prompt: ["might get turned around", "endless", "delving into"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "One" and "ruins".',
      highlight: { prompt: ["One", "ruins"] },
    },
  ],
});

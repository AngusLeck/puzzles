import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-15",
  title: "This is why we wait",
  attribution: "AD",
  releaseDate: "2026-09-04",
  prompt: "Counting again - rain covered rat found amongst two eggs. (13)",
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
    { id: "s10", x: 9, y: 0 },
    { id: "s11", x: 10, y: 0 },
    { id: "s12", x: 11, y: 0 },
    { id: "s13", x: 12, y: 0 },
  ],
  checks: [
    {
      type: "slots",
      answers: {
        s1: "R",
        s2: "E",
        s3: "A",
        s4: "G",
        s5: "G",
        s6: "R",
        s7: "E",
        s8: "G",
        s9: "A",
        s10: "T",
        s11: "I",
        s12: "N",
        s13: "G",
      },
    },
  ],
  hints: [
    {
      size: "definition",
      text: '"Counting again" is the definition.',
      highlight: { prompt: ["Counting again"] },
    },
    {
      size: "wordplay",
      text: "one of our indicators tells us to put some fodder around some other fodder, another tells us to repeat some fodder, and finally we have an indicator telling us to distribute the letters of some fodder amongst the letters of some other fodder.",
      highlight: { prompt: ["covered", "found amongst", "two"] },
    },
    {
      size: "fodder",
      text: 'our fodder is "rain", "rat" and "egg".',
      highlight: { prompt: ["rain", "rat", "egg"] },
    },
  ],
});

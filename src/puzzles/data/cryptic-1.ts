import { definePuzzle } from "../define";

export default definePuzzle({
  id: "cryptic-1",
  title: "If you don't like it you can too!",
  attribution: "AD",
  prompt: 'I would, I am - shortly, going to "suck an egg" as they say. (5)',
  tileGenerator: { type: "letters" },
  slots: [
    { id: "s1", x: 0, y: 0 },
    { id: "s2", x: 1, y: 0 },
    { id: "s3", x: 2, y: 0 },
    { id: "s4", x: 3, y: 0 },
    { id: "s5", x: 4, y: 0 },
  ],
  checks: [{ type: "slots", answers: { s1: "I", s2: "D", s3: "I", s4: "O", s5: "M" } }],
  hints: [
    {
      size: "definition",
      text: '"as they say" is the definition.',
      highlight: { prompt: ["as they say"] },
    },
    {
      size: "wordplay",
      text: "one of our indicators tells us to abbreviate some neighboring fodder, the other tells us to insert fodder into some other fodder.",
      highlight: { prompt: ["shortly", 'going to "suck an'] },
    },
    {
      size: "fodder",
      text: '"I would, I am" and "egg" is our fodder, but that\'s too many letters.',
      highlight: { prompt: ["I would, I am", "egg"] },
    },
  ],
});

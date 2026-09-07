import { definePuzzle } from "../define";

export default definePuzzle({
  id: "crossword-2",
  title: "Octonions Cross",
  subtitle: "Two clues so far — more to come",
  attribution: "AD",
  // 3 Across reads as "octonions choose 4": ⁿCᵣ notation with the octonions symbol
  // 𝕆 (U+1D546) as n and 4 as r. ^{…} / _{…} become <sup>/<sub> (see engine/richtext.ts).
  // 1 Down (INTEGRAL) crosses it on the shared T, 2 Down (ELSE) on the shared S.
  // ∈ is U+2208 (element of).
  prompt:
    "ACROSS\n3. ^{𝕆}C_{4}?! (4)\n\nDOWN\n1. the sum of all parts is vital (8)\n2. Otherwise ∈ { x | f(x) = c } (4)",
  tileGenerator: { type: "letters" },
  slots: [
    { id: "c0r0", x: 0, y: 0, label: "1" },
    { id: "c0r1", x: 0, y: 1 },
    { id: "c0r2", x: 0, y: 2, label: "3" },
    { id: "c0r3", x: 0, y: 3 },
    { id: "c0r4", x: 0, y: 4 },
    { id: "c0r5", x: 0, y: 5 },
    { id: "c0r6", x: 0, y: 6 },
    { id: "c0r7", x: 0, y: 7 },
    { id: "c3r0", x: 3, y: 0, label: "2" },
    { id: "c3r1", x: 3, y: 1 },
    { id: "c3r2", x: 3, y: 2 },
    { id: "c3r3", x: 3, y: 3 },
    { id: "c1r2", x: 1, y: 2 },
    { id: "c2r2", x: 2, y: 2 },
  ],
  checks: [
    {
      type: "slots",
      answers: {
        c0r0: "I",
        c0r1: "N",
        c0r2: "T",
        c0r3: "E",
        c0r4: "G",
        c0r5: "R",
        c0r6: "A",
        c0r7: "L",
        c3r0: "E",
        c3r1: "L",
        c3r2: "S",
        c3r3: "E",
        c1r2: "O",
        c2r2: "N",
      },
    },
  ],
  hints: [
    {
      size: "definition",
      text: '1 Down — "the sum of all parts" is one definition.',
      highlight: {
        prompt: ["the sum of all parts"],
        slots: ["c0r0", "c0r1", "c0r2", "c0r3", "c0r4", "c0r5", "c0r6", "c0r7"],
      },
    },
    {
      size: "definition",
      text: '1 Down — "vital" is the other definition.',
      highlight: {
        prompt: ["vital"],
        slots: ["c0r0", "c0r1", "c0r2", "c0r3", "c0r4", "c0r5", "c0r6", "c0r7"],
      },
    },
    {
      size: "definition",
      text: '2 Down — "Otherwise" is the definition.',
      highlight: { prompt: ["Otherwise"], slots: ["c3r0", "c3r1", "c3r2", "c3r3"] },
    },
    {
      size: "definition",
      text: "3 Across — the whole clue is the definition.",
      highlight: { prompt: ["𝕆C4?!"], slots: ["c0r2", "c1r2", "c2r2", "c3r2"] },
    },
    {
      size: "wordplay",
      text: "1 Down — it's a double definition, so no other wordplay.",
      highlight: {
        prompt: ["the sum of all parts", "vital"],
        slots: ["c0r0", "c0r1", "c0r2", "c0r3", "c0r4", "c0r5", "c0r6", "c0r7"],
      },
    },
    {
      size: "wordplay",
      text: "2 Down — ∈ is a hidden word indicator.",
      highlight: { prompt: ["∈"], slots: ["c3r0", "c3r1", "c3r2", "c3r3"] },
    },
    {
      size: "wordplay",
      text: "3 Across — C₄ indicates that some letters should be selected from neighbouring fodder.",
      highlight: { prompt: ["C4"], slots: ["c0r2", "c1r2", "c2r2", "c3r2"] },
    },
    {
      size: "fodder",
      text: "2 Down — the fodder is { x | f(x) = c }.",
      highlight: { prompt: ["{ x | f(x) = c }"], slots: ["c3r0", "c3r1", "c3r2", "c3r3"] },
    },
    {
      size: "fodder",
      text: "3 Across — the fodder is 𝕆, the octonions.",
      highlight: { prompt: ["𝕆"], slots: ["c0r2", "c1r2", "c2r2", "c3r2"] },
    },
    {
      size: "bonus",
      text: '2 Down — { x | f(x) = c } describes a "level set" of the function f.',
      highlight: { prompt: ["{ x | f(x) = c }"], slots: ["c3r0", "c3r1", "c3r2", "c3r3"] },
    },
    {
      size: "bonus",
      text: '3 Across — it can be read as "octonions choose 4".',
      highlight: { slots: ["c0r2", "c1r2", "c2r2", "c3r2"] },
    },
  ],
});

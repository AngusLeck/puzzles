// Puzzle definitions — edit this file by hand. See README.md for the schema.
// It's a .js file (not .json) only so the page also works when opened directly
// from disk (file://), where browsers block fetching .json files.
//
// Attribution key: AD = default (unattributed), RAD / RD / AP / APD as marked.
window.PUZZLES = [
  // --------------------------------------------------------------- cryptics
  {
    id: "cryptic-1",
    title: "Cryptic №1",
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
    checks: [
      {
        type: "slots",
        answers: { s1: "I", s2: "D", s3: "I", s4: "O", s5: "M" },
      },
    ],
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
  },

  {
    id: "cryptic-2",
    title: "Cryptic №2",
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
    checks: [
      {
        type: "slots",
        answers: { s1: "C", s2: "O", s3: "F", s4: "F", s5: "E", s6: "E" },
      },
    ],
    hints: [
      {
        size: "definition",
        text: '"bean stew?" is the definition, and the \"?\" tells us its a bit of a stretch.',
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
  },

  {
    id: "cryptic-3",
    title: "Cryptic №3",
    attribution: "AD",
    prompt: "Delayed again, means drizzle on fourth station? (5)",
    tileGenerator: { type: "letters" },
    slots: [
      { id: "s1", x: 0, y: 0 },
      { id: "s2", x: 1, y: 0 },
      { id: "s3", x: 2, y: 0 },
      { id: "s4", x: 3, y: 0 },
      { id: "s5", x: 4, y: 0 },
    ],
    checks: [
      {
        type: "slots",
        answers: { s1: "T", s2: "R", s3: "A", s4: "I", s5: "N" },
      },
    ],
    hints: [
      {
        size: "definition",
        text: '"Delayed again" is the definition.',
        highlight: { prompt: ["Delayed again"] },
      },
      {
        size: "wordplay",
        text: "one of our indicators is a selection indicator, another is a synonym indicator, we also have a simple joining indicator.",
        highlight: { prompt: ["fourth", "means", "on"] },
      },
      {
        size: "fodder",
        text: 'our fodder is "station" and "drizzle".',
        highlight: { prompt: ["drizzle", "station"] },
      },
    ],
  },

  {
    id: "cryptic-4",
    title: "Cryptic №4",
    attribution: "APD",
    prompt: "Fibonacci silently crept about armoured vehicle. (3)",
    tileGenerator: { type: "letters" },
    slots: [
      { id: "s1", x: 0, y: 0 },
      { id: "s2", x: 1, y: 0 },
      { id: "s3", x: 2, y: 0 },
    ],
    checks: [{ type: "slots", answers: { s1: "C", s2: "A", s3: "R" } }],
    hints: [
      {
        size: "definition",
        text: '"vehicle" is the definition.',
        highlight: { prompt: ["vehicle"] },
      },
      {
        size: "wordplay",
        text: "our indicator is a selection indicator, and an unusual one — it uses a famous number sequence to pick letters out of the words nearby.",
        highlight: { prompt: ["Fibonacci"] },
      },
      {
        size: "fodder",
        text: 'We\'ll find our letters amongst "silently crept about armoured".',
        highlight: { prompt: ["silently crept about armoured"] },
      },
    ],
  },

  {
    id: "cryptic-5",
    title: "Cryptic №5",
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
    checks: [
      {
        type: "slots",
        answers: { s1: "D", s2: "E", s3: "A", s4: "T", s5: "H" },
      },
    ],
    hints: [
      {
        size: "definition",
        text: '"Got there in the end?" is the definition.',
        highlight: { prompt: ["Got there in the end?"] },
      },
      {
        size: "wordplay",
        text: "Two selection indicators here: they tell us which letters in our fodder we want. We've also been told to ignore some of the fodder, and to say some of the fodder out loud.",
        highlight: {
          prompt: [
            "the 5th",
            "stripped of his title",
            "initially",
            "Exclaimed",
          ],
        },
      },
      {
        size: "fodder",
        text: 'Our fodder is "King David" and "!&~#".',
        highlight: { prompt: ["King David", "!&~#"] },
      },
    ],
  },

  {
    id: "cryptic-6",
    title: "Cryptic №6",
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
    checks: [
      {
        type: "slots",
        answers: { s1: "F", s2: "E", s3: "L", s4: "O", s5: "N", s6: "Y" },
      },
    ],
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
  },

  {
    id: "cryptic-7",
    title: "Cryptic №7",
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
        answers: {
          s1: "U",
          s2: "N",
          s3: "I",
          s4: "O",
          s5: "N",
          s6: "I",
          s7: "S",
          s8: "E",
          s9: "D",
        },
      },
    ],
    hints: [
      {
        size: "definition",
        text: "it is a double definition — two definitions of one word",
        highlight: {
          prompt: [
            "Charges dropped against employer over wage theft allegations.",
          ],
        },
      },
      {
        size: "bonus",
        text: '"Charges" needn\'t be legal — think physics.',
        highlight: { prompt: ["Charges dropped"] },
      },
      {
        size: "bonus",
        text: "The target word is a heteronym (spelled one way, said two)",
        highlight: {
          prompt: [
            "Charges dropped",
            "against employer over wage theft allegations.",
          ],
        },
      },
    ],
  },

  {
    id: "cryptic-8",
    title: "Cryptic №8",
    attribution: "AD",
    releaseDate: "2026-08-14",
    prompt: "Tilting his head - dad eyed listening device. (4)",
    tileGenerator: { type: "letters" },
    slots: [
      { id: "s1", x: 0, y: 0 },
      { id: "s2", x: 1, y: 0 },
      { id: "s3", x: 2, y: 0 },
      { id: "s4", x: 3, y: 0 },
    ],
    checks: [
      { type: "slots", answers: { s1: "I", s2: "P", s3: "A", s4: "D" } },
    ],
    hints: [
      {
        size: "definition",
        text: '"device" is the definition.',
        highlight: { prompt: ["device"] },
      },
      {
        size: "wordplay",
        text: "One of our indicators turns a letter around until it becomes another, the letter is selected by some other indicators; one indicator tells us to read aloud another to reveal it's true purpose.",
        highlight: { prompt: ["Tilting", "his head", "eyed", "listening"] },
      },
      {
        size: "fodder",
        text: 'our fodder is "dad" and "eye".',
        highlight: { prompt: ["dad eye"] },
      },
    ],
  },

  {
    id: "cryptic-9",
    title: "Cryptic №9",
    attribution: "RD",
    prompt: "Where the egg is, no one knows. (6)",
    tileGenerator: { type: "letters" },
    slots: [
      { id: "s1", x: 0, y: 0 },
      { id: "s2", x: 1, y: 0 },
      { id: "s3", x: 2, y: 0 },
      { id: "s4", x: 3, y: 0 },
      { id: "s5", x: 4, y: 0 },
      { id: "s6", x: 5, y: 0 },
    ],
    checks: [{ type: "any" }],
    hints: [
      {
        size: "small",
        text: "You can't make a clue without breaking a few eggs, just give it a go - have faith!",
        highlight: {},
      },
    ],
  },

  // ------------------------------------------------------- carpenter crossword
  {
    id: "crossword-1",
    title: "Carpenter's Cross",
    subtitle: "Three carpenters, one grid",
    attribution: "AD & AP",
    prompt:
      "ACROSS\n2. Carpenter left family holiday, married Ian in a church. (9)\n3. Carpenter confused heron is running the company. (11)  ·AP\n\nDOWN\n1. Carpenter ruined a metal bone. (10)  ·AP",
    tileGenerator: { type: "letters" },
    slotGap: 6,
    slots: [
      { id: "c5r0", x: 5, y: 0, label: "1" },
      { id: "c5r1", x: 5, y: 1 },
      { id: "c5r2", x: 5, y: 2 },
      { id: "c5r3", x: 5, y: 3 },
      { id: "c5r4", x: 5, y: 4 },
      { id: "c5r5", x: 5, y: 5 },
      { id: "c5r6", x: 5, y: 6 },
      { id: "c5r7", x: 5, y: 7 },
      { id: "c5r8", x: 5, y: 8 },
      { id: "c5r9", x: 5, y: 9 },

      { id: "c0r2", x: 0, y: 2, label: "2" },
      { id: "c1r2", x: 1, y: 2 },
      { id: "c2r2", x: 2, y: 2 },
      { id: "c3r2", x: 3, y: 2 },
      { id: "c4r2", x: 4, y: 2 },
      { id: "c6r2", x: 6, y: 2 },
      { id: "c7r2", x: 7, y: 2 },
      { id: "c8r2", x: 8, y: 2 },

      { id: "c0r7", x: 0, y: 7, label: "3" },
      { id: "c1r7", x: 1, y: 7 },
      { id: "c2r7", x: 2, y: 7 },
      { id: "c3r7", x: 3, y: 7 },
      { id: "c4r7", x: 4, y: 7 },
      { id: "c6r7", x: 6, y: 7 },
      { id: "c7r7", x: 7, y: 7 },
      { id: "c8r7", x: 8, y: 7 },
      { id: "c9r7", x: 9, y: 7 },
      { id: "c10r7", x: 10, y: 7 },
    ],
    checks: [
      {
        type: "slots",
        answers: {
          c5r0: "M",
          c5r1: "E",
          c5r2: "T",
          c5r3: "A",
          c5r4: "C",
          c5r5: "A",
          c5r6: "R",
          c5r7: "P",
          c5r8: "A",
          c5r9: "L",
          c0r2: "C",
          c1r2: "H",
          c2r2: "R",
          c3r2: "I",
          c4r2: "S",
          c6r2: "I",
          c7r2: "A",
          c8r2: "N",
          c0r7: "C",
          c1r7: "H",
          c2r7: "A",
          c3r7: "I",
          c4r7: "R",
          c6r7: "E",
          c7r7: "R",
          c8r7: "S",
          c9r7: "O",
          c10r7: "N",
        },
      },
    ],
    hints: [
      {
        size: "definition",
        text: '1 Down — "bone" is the definition.',
        highlight: {
          prompt: ["bone"],
          slots: [
            "c5r0",
            "c5r1",
            "c5r2",
            "c5r3",
            "c5r4",
            "c5r5",
            "c5r6",
            "c5r7",
            "c5r8",
            "c5r9",
          ],
        },
      },
      {
        size: "definition",
        text: '2 Across — "in a church" is the definition.',
        highlight: {
          prompt: ["in a church"],
          slots: [
            "c0r2",
            "c1r2",
            "c2r2",
            "c3r2",
            "c4r2",
            "c5r2",
            "c6r2",
            "c7r2",
            "c8r2",
          ],
        },
      },
      {
        size: "definition",
        text: '3 Across — "running the company" is the definition.',
        highlight: {
          prompt: ["running the company"],
          slots: [
            "c0r7",
            "c1r7",
            "c2r7",
            "c3r7",
            "c4r7",
            "c5r7",
            "c6r7",
            "c7r7",
            "c8r7",
            "c9r7",
            "c10r7",
          ],
        },
      },

      {
        size: "wordplay",
        text: '1 Down — one of our indicators signals an anagram; and note that "Carpenter" is doing wordplay in every clue here, not just setting the scene.',
        highlight: {
          prompt: ["ruined"],
          slots: [
            "c5r0",
            "c5r1",
            "c5r2",
            "c5r3",
            "c5r4",
            "c5r5",
            "c5r6",
            "c5r7",
            "c5r8",
            "c5r9",
          ],
        },
      },
      {
        size: "wordplay",
        text: "2 Across — our indicator is a charade: two parts joined side by side.",
        highlight: {
          prompt: ["married"],
          slots: [
            "c0r2",
            "c1r2",
            "c2r2",
            "c3r2",
            "c4r2",
            "c5r2",
            "c6r2",
            "c7r2",
            "c8r2",
          ],
        },
      },
      {
        size: "wordplay",
        text: "3 Across — our indicator signals an anagram.",
        highlight: {
          prompt: ["confused"],
          slots: [
            "c0r7",
            "c1r7",
            "c2r7",
            "c3r7",
            "c4r7",
            "c5r7",
            "c6r7",
            "c7r7",
            "c8r7",
            "c9r7",
            "c10r7",
          ],
        },
      },

      {
        size: "fodder",
        text: '1 Down — the anagram works on "a metal", and "Carpenter" lends a CARP.',
        highlight: {
          prompt: ["a metal"],
          slots: [
            "c5r0",
            "c5r1",
            "c5r2",
            "c5r3",
            "c5r4",
            "c5r5",
            "c5r6",
            "c5r7",
            "c5r8",
            "c5r9",
          ],
        },
      },
      {
        size: "fodder",
        text: '2 Across — the parts are CHRIST (the carpenter) and IAN. ("family holiday" is CHRISTMAS with -mas left off — the same CHRIST.)',
        highlight: {
          prompt: ["Ian"],
          slots: [
            "c0r2",
            "c1r2",
            "c2r2",
            "c3r2",
            "c4r2",
            "c5r2",
            "c6r2",
            "c7r2",
            "c8r2",
          ],
        },
      },
      {
        size: "fodder",
        text: '3 Across — the anagram works on "heron is", with a CARP from "Carpenter".',
        highlight: {
          prompt: ["heron is"],
          slots: [
            "c0r7",
            "c1r7",
            "c2r7",
            "c3r7",
            "c4r7",
            "c5r7",
            "c6r7",
            "c7r7",
            "c8r7",
            "c9r7",
            "c10r7",
          ],
        },
      },

      {
        size: "bonus",
        text: '2 Across has a wordier twin — try it from this instead: "Carpenter married Ian in a church. (9)" Same answer; the short clue is really a clue for the long one.',
        highlight: {
          slots: [
            "c0r2",
            "c1r2",
            "c2r2",
            "c3r2",
            "c4r2",
            "c5r2",
            "c6r2",
            "c7r2",
            "c8r2",
          ],
        },
      },
    ],
  },

  // ------------------------------------------------------- format demos
  {
    id: "connections-1",
    title: "Group of Four №1",
    subtitle: "Sort 16 tiles into four groups",
    attribution: "RAD",
    prompt:
      "Sort the sixteen tiles into four groups of four. Each row holds one complete group — any group can go in any row.",
    tileAspect: 1,
    slotGap: 8,
    chainTiles: false,
    tiles: [
      { id: "t01", text: "NAVY" },
      { id: "t02", text: "SKY" },
      { id: "t03", text: "ROYAL" },
      { id: "t04", text: "BABY" },
      { id: "t05", text: "KIDNEY" },
      { id: "t06", text: "RUNNER" },
      { id: "t07", text: "JELLY" },
      { id: "t08", text: "BLACK" },
      { id: "t09", text: "HEART" },
      { id: "t10", text: "LIVER" },
      { id: "t11", text: "BRAIN" },
      { id: "t12", text: "LUNG" },
      { id: "t13", text: "BRIDGE" },
      { id: "t14", text: "SNAP" },
      { id: "t15", text: "HEARTS" },
      { id: "t16", text: "SPIT" },
    ],
    slots: [
      { id: "r1c1", x: 0, y: 0 },
      { id: "r1c2", x: 1, y: 0 },
      { id: "r1c3", x: 2, y: 0 },
      { id: "r1c4", x: 3, y: 0 },
      { id: "r2c1", x: 0, y: 1.25 },
      { id: "r2c2", x: 1, y: 1.25 },
      { id: "r2c3", x: 2, y: 1.25 },
      { id: "r2c4", x: 3, y: 1.25 },
      { id: "r3c1", x: 0, y: 2.5 },
      { id: "r3c2", x: 1, y: 2.5 },
      { id: "r3c3", x: 2, y: 2.5 },
      { id: "r3c4", x: 3, y: 2.5 },
      { id: "r4c1", x: 0, y: 3.75 },
      { id: "r4c2", x: 1, y: 3.75 },
      { id: "r4c3", x: 2, y: 3.75 },
      { id: "r4c4", x: 3, y: 3.75 },
    ],
    checks: [
      {
        type: "categories",
        slotGroups: [
          ["r1c1", "r1c2", "r1c3", "r1c4"],
          ["r2c1", "r2c2", "r2c3", "r2c4"],
          ["r3c1", "r3c2", "r3c3", "r3c4"],
          ["r4c1", "r4c2", "r4c3", "r4c4"],
        ],
        categories: [
          { label: "Shades of blue", tiles: ["NAVY", "SKY", "ROYAL", "BABY"] },
          { label: "___ bean", tiles: ["KIDNEY", "RUNNER", "JELLY", "BLACK"] },
          { label: "Organs", tiles: ["HEART", "LIVER", "BRAIN", "LUNG"] },
          { label: "Card games", tiles: ["BRIDGE", "SNAP", "HEARTS", "SPIT"] },
        ],
      },
    ],
    hints: [
      {
        size: "small",
        text: "Four of these tiles are shades of one colour.",
        highlight: {},
      },
      {
        size: "small",
        text: 'One word can precede "bean".',
        highlight: { tiles: ["KIDNEY"] },
      },
      {
        size: "big",
        text: "HEART and HEARTS are in different groups: one is an organ, the other a card game.",
        highlight: { tiles: ["HEART", "HEARTS"] },
      },
      {
        size: "big",
        text: "The card games are BRIDGE, SNAP, HEARTS and SPIT.",
        highlight: { tiles: ["BRIDGE", "SNAP", "HEARTS", "SPIT"] },
      },
    ],
  },
];

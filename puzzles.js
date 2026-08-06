// Puzzle definitions — edit this file by hand. See README.md for the schema.
// It's a .js file (not .json) only so the page also works when opened directly
// from disk (file://), where browsers block fetching .json files.
//
// Attribution key: AD = default (unattributed), RAD / RD / AP / APD as marked.
window.PUZZLES = [

  // ---------------------------------------------------------------- warm-up
  {
    "id": "warmup-apple",
    "title": "Warm-up: Unscramble",
    "subtitle": "Get a feel for the tiles",
    "prompt": "Unscramble LEPPA to find a fruit (5).",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 },
      { "id": "s2", "x": 1, "y": 0 },
      { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 },
      { "id": "s5", "x": 4, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "A", "s2": "P", "s3": "P", "s4": "L", "s5": "E" } }
    ],
    "hints": [
      { "size": "small", "text": "One a day keeps the doctor away.", "highlight": { "prompt": ["fruit"] } },
      { "size": "big", "text": "It starts with A and ends with E.", "highlight": { "slots": ["s1", "s5"] } }
    ]
  },

  // --------------------------------------------------------------- cryptics
  {
    "id": "cryptic-idiom",
    "title": "Cryptic: suck an egg",
    "subtitle": "A gentle single clue",
    "attribution": "AD",
    "prompt": "I would, I am - shortly, going to \"suck an egg\" as they say. (5)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "I", "s2": "D", "s3": "I", "s4": "O", "s5": "M" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: \"as they say\" — a common turn of phrase.", "highlight": { "prompt": ["as they say"] } },
      { "size": "wordplay", "text": "\"I would\" and \"I am\", written \"shortly\", become contractions; \"suck an egg\" swallows an egg-shaped letter.", "highlight": { "prompt": ["I would, I am - shortly", "suck an egg"] } },
      { "size": "full parse", "text": "I'd + I'm = IDIM, then suck in an egg (O) → ID·I·O·M. Answer: IDIOM.", "highlight": { "slots": ["s1", "s2", "s3", "s4", "s5"] } }
    ]
  },

  {
    "id": "cryptic-coffee",
    "title": "Cryptic: bean stew",
    "subtitle": "Shear the sheep carefully",
    "attribution": "RAD",
    "prompt": "Cough heard by overzealous sheep shearer, making bean stew? (6)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }, { "id": "s6", "x": 5, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "C", "s2": "O", "s3": "F", "s4": "F", "s5": "E", "s6": "E" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: \"bean stew?\" — the question mark warns it's a loose, punny definition. Think of a drink brewed from beans.", "highlight": { "prompt": ["bean stew?"] } },
      { "size": "wordplay", "text": "\"heard\" flags a homophone; the \"shearer\" trims letters off a word — overzealously.", "highlight": { "prompt": ["Cough heard", "overzealous sheep shearer"] } },
      { "size": "full parse", "text": "COFF (\"cough\" heard) + EE (shear SHEEP down to HEE, then one snip too many → EE). Answer: COFFEE.", "highlight": { "slots": ["s1", "s2", "s3", "s4", "s5", "s6"] } }
    ]
  },

  {
    "id": "cryptic-train",
    "title": "Cryptic: forever delayed",
    "subtitle": "A single clue",
    "attribution": "AD",
    "prompt": "Delayed again, means drizzle on fourth station? (5)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "T", "s2": "R", "s3": "A", "s4": "I", "s5": "N" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: \"Delayed again\" — what is famous for always being delayed? A means of transport.", "highlight": { "prompt": ["Delayed again"] } },
      { "size": "wordplay", "text": "\"drizzle\" is a light kind of one word; \"fourth station\" singles out one letter.", "highlight": { "prompt": ["drizzle", "fourth station"] } },
      { "size": "full parse", "text": "T (the fourth letter of sta·T·ion) + RAIN (drizzle) = TRAIN.", "highlight": { "slots": ["s1", "s2", "s3", "s4", "s5"] } }
    ]
  },

  {
    "id": "cryptic-car",
    "title": "Cryptic: Fibonacci",
    "subtitle": "Count carefully",
    "attribution": "APD",
    "prompt": "Fibonacci silently crept about armoured vehicle. (3)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "C", "s2": "A", "s3": "R" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: just \"vehicle\" — not \"armoured vehicle\". \"Armoured\" is fodder; the surface wants you to picture a tank.", "highlight": { "prompt": ["vehicle"] } },
      { "size": "wordplay", "text": "\"Fibonacci\" sets a counting pattern — 0, 1, 1, 2 — for how many letters into each following word to reach.", "highlight": { "prompt": ["Fibonacci"] } },
      { "size": "full parse", "text": "Take 0 of \"silently\" (none), the 1st of \"Crept\", the 1st of \"About\", the 2nd of \"aRmoured\" → C + A + R = CAR.", "highlight": { "slots": ["s1", "s2", "s3"] } }
    ]
  },

  {
    "id": "cryptic-death",
    "title": "Cryptic: the end",
    "subtitle": "Name the symbols aloud",
    "attribution": "APD",
    "prompt": "King David the 5th, stripped of his title. Exclaimed \"!&~#\" initially. Got there in the end? (5)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "D", "s2": "E", "s3": "A", "s4": "T", "s5": "H" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: \"Got there in the end?\" — the ultimate destination.", "highlight": { "prompt": ["Got there in the end?"] } },
      { "size": "wordplay", "text": "\"the 5th\" points to the fifth letter of David once his \"title\" (King) is stripped; then the symbols must be named out loud, \"initially\".", "highlight": { "prompt": ["David the 5th", "!&~#"] } },
      { "size": "full parse", "text": "D (5th letter of DaviD) + E·A·T·H (Exclamation, Ampersand, Tilde, Hash — each symbol's name, first letters) = DEATH.", "highlight": { "slots": ["s1", "s2", "s3", "s4", "s5"] } }
    ]
  },

  {
    "id": "cryptic-felony",
    "title": "Cryptic: cooking the books",
    "subtitle": "Spell the numbers out",
    "attribution": "APD",
    "prompt": "CFO fudged the numbers, wrote 5 - 4 + 50 / y? (6)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }, { "id": "s6", "x": 5, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "F", "s2": "E", "s3": "L", "s4": "O", "s5": "N", "s6": "Y" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: \"CFO fudged the numbers\" — cooking the books is a crime.", "highlight": { "prompt": ["CFO fudged the numbers"] } },
      { "size": "wordplay", "text": "Spell the numerals out: 5 → FIVE, 4 → IV, 50 → L. And read \"/\" as the word \"on\".", "highlight": { "prompt": ["5 - 4 + 50 / y"] } },
      { "size": "full parse", "text": "FIVE minus IV = FE, plus L (50) = FEL, then / = ON, then Y → FEL·ON·Y = FELONY.", "highlight": { "slots": ["s1", "s2", "s3", "s4", "s5", "s6"] } }
    ]
  },

  {
    "id": "cryptic-unionised",
    "title": "Cryptic: two ways to read it",
    "subtitle": "A double definition with a twist",
    "attribution": "RAD",
    "prompt": "Charges dropped against employer over wage theft allegations. (9)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }, { "id": "s6", "x": 5, "y": 0 },
      { "id": "s7", "x": 6, "y": 0 }, { "id": "s8", "x": 7, "y": 0 }, { "id": "s9", "x": 8, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "U", "s2": "N", "s3": "I", "s4": "O", "s5": "N", "s6": "I", "s7": "S", "s8": "E", "s9": "D" } }
    ],
    "hints": [
      { "size": "definition", "text": "It's a double definition — and the trick is that the two meanings are pronounced differently (a heteronym).", "highlight": { "prompt": ["Charges dropped", "wage theft allegations"] } },
      { "size": "wordplay", "text": "\"Charges\" can mean electrical charges — ions. \"Charges dropped\" = without ions.", "highlight": { "prompt": ["Charges dropped"] } },
      { "size": "full parse", "text": "UN-IONISED (ions/charges removed) reads the same letters as UNIONISED (workers organised against a wage-thieving boss). Answer: UNIONISED.", "highlight": { "slots": ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"] } }
    ]
  },

  {
    "id": "cryptic-ipad",
    "title": "Cryptic: listening device",
    "subtitle": "Tilt a letter",
    "attribution": "AD",
    "prompt": "Tilting his head - dad eyed listening device. (4)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 },
      { "id": "s3", "x": 2, "y": 0 }, { "id": "s4", "x": 3, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "s1": "I", "s2": "P", "s3": "A", "s4": "D" } }
    ],
    "hints": [
      { "size": "definition", "text": "Definition: \"listening device\" — read very loosely and cheekily (it does play audio).", "highlight": { "prompt": ["listening device"] } },
      { "size": "wordplay", "text": "\"eyed\" gives you an eye = I; then a letter in \"dad\" gets tilted.", "highlight": { "prompt": ["dad eyed"] } },
      { "size": "full parse", "text": "I (eye, from \"eyed\") + PAD (\"dad\" with a d tilted round into a p) = IPAD.", "highlight": { "slots": ["s1", "s2", "s3", "s4"] } }
    ]
  },

  {
    "id": "cryptic-egg",
    "title": "Where's the egg?",
    "subtitle": "A RD original — there is no wrong answer",
    "attribution": "RD",
    "prompt": "Where the egg is, no one knows. (6)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "s1", "x": 0, "y": 0 }, { "id": "s2", "x": 1, "y": 0 }, { "id": "s3", "x": 2, "y": 0 },
      { "id": "s4", "x": 3, "y": 0 }, { "id": "s5", "x": 4, "y": 0 }, { "id": "s6", "x": 5, "y": 0 }
    ],
    "checks": [
      { "type": "any" }
    ],
    "hints": [
      { "size": "small", "text": "There genuinely is no answer. Fill the six slots with whatever letters you like and it counts as solved.", "highlight": {} }
    ]
  },

  // ------------------------------------------------------- carpenter crossword
  {
    "id": "carpenter-crossword",
    "title": "Carpenter's Cross",
    "subtitle": "Three carpenters, one grid",
    "attribution": "AD & AP",
    "prompt": "ACROSS\n2. Carpenter left family holiday, married Ian in a church. (9)\n3. Carpenter confused heron is running the company. (11)  ·AP\n\nDOWN\n1. Carpenter ruined a metal bone. (10)  ·AP",
    "tileGenerator": { "type": "letters" },
    "slotGap": 6,
    "slots": [
      { "id": "c5r0", "x": 5, "y": 0, "label": "1" },
      { "id": "c5r1", "x": 5, "y": 1 },
      { "id": "c5r2", "x": 5, "y": 2 },
      { "id": "c5r3", "x": 5, "y": 3 },
      { "id": "c5r4", "x": 5, "y": 4 },
      { "id": "c5r5", "x": 5, "y": 5 },
      { "id": "c5r6", "x": 5, "y": 6 },
      { "id": "c5r7", "x": 5, "y": 7 },
      { "id": "c5r8", "x": 5, "y": 8 },
      { "id": "c5r9", "x": 5, "y": 9 },

      { "id": "c0r2", "x": 0, "y": 2, "label": "2" },
      { "id": "c1r2", "x": 1, "y": 2 },
      { "id": "c2r2", "x": 2, "y": 2 },
      { "id": "c3r2", "x": 3, "y": 2 },
      { "id": "c4r2", "x": 4, "y": 2 },
      { "id": "c6r2", "x": 6, "y": 2 },
      { "id": "c7r2", "x": 7, "y": 2 },
      { "id": "c8r2", "x": 8, "y": 2 },

      { "id": "c0r7", "x": 0, "y": 7, "label": "3" },
      { "id": "c1r7", "x": 1, "y": 7 },
      { "id": "c2r7", "x": 2, "y": 7 },
      { "id": "c3r7", "x": 3, "y": 7 },
      { "id": "c4r7", "x": 4, "y": 7 },
      { "id": "c6r7", "x": 6, "y": 7 },
      { "id": "c7r7", "x": 7, "y": 7 },
      { "id": "c8r7", "x": 8, "y": 7 },
      { "id": "c9r7", "x": 9, "y": 7 },
      { "id": "c10r7", "x": 10, "y": 7 }
    ],
    "checks": [
      {
        "type": "slots",
        "answers": {
          "c5r0": "M", "c5r1": "E", "c5r2": "T", "c5r3": "A", "c5r4": "C",
          "c5r5": "A", "c5r6": "R", "c5r7": "P", "c5r8": "A", "c5r9": "L",
          "c0r2": "C", "c1r2": "H", "c2r2": "R", "c3r2": "I", "c4r2": "S",
          "c6r2": "I", "c7r2": "A", "c8r2": "N",
          "c0r7": "C", "c1r7": "H", "c2r7": "A", "c3r7": "I", "c4r7": "R",
          "c6r7": "E", "c7r7": "R", "c8r7": "S", "c9r7": "O", "c10r7": "N"
        }
      }
    ],
    "hints": [
      { "size": "definition", "text": "1 Down — definition is \"bone\". \"ruined\" is an anagram signal, and \"Carpenter\" hides CARP.", "highlight": { "prompt": ["a metal bone", "ruined"], "slots": ["c5r0", "c5r1", "c5r2", "c5r3", "c5r4", "c5r5", "c5r6", "c5r7", "c5r8", "c5r9"] } },
      { "size": "definition", "text": "2 Across — definition is \"in a church\" (a churchgoer). \"Carpenter\" points to one very famous carpenter.", "highlight": { "prompt": ["in a church"], "slots": ["c0r2", "c1r2", "c2r2", "c3r2", "c4r2", "c5r2", "c6r2", "c7r2", "c8r2"] } },
      { "size": "definition", "text": "3 Across — definition is \"running the company\". \"confused\" is an anagram signal.", "highlight": { "prompt": ["running the company", "confused"], "slots": ["c0r7", "c1r7", "c2r7", "c3r7", "c4r7", "c5r7", "c6r7", "c7r7", "c8r7", "c9r7", "c10r7"] } },

      { "size": "full parse", "text": "1 Down: CARP (from Carpenter) with an anagram (\"ruined\") of \"a metal\" wrapped around it → META·CARP·AL = METACARPAL.", "highlight": { "slots": ["c5r0", "c5r1", "c5r2", "c5r3", "c5r4", "c5r5", "c5r6", "c5r7", "c5r8", "c5r9"] } },
      { "size": "full parse", "text": "2 Across: CHRIST (the carpenter — also \"family holiday\" CHRISTMAS with the \"-mas\" left off) + IAN, married/joined on = CHRISTIAN.", "highlight": { "slots": ["c0r2", "c1r2", "c2r2", "c3r2", "c4r2", "c5r2", "c6r2", "c7r2", "c8r2"] } },
      { "size": "full parse", "text": "3 Across: anagram (\"confused\") of CARP (from Carpenter) + \"heron is\" = CHAIRPERSON.", "highlight": { "slots": ["c0r7", "c1r7", "c2r7", "c3r7", "c4r7", "c5r7", "c6r7", "c7r7", "c8r7", "c9r7", "c10r7"] } },

      { "size": "bonus", "text": "2 Across has a wordier twin — try solving it from this instead: \"Carpenter married Ian in a church. (9)\" Same answer; the short clue is really a clue for the long one.", "highlight": { "slots": ["c0r2", "c1r2", "c2r2", "c3r2", "c4r2", "c5r2", "c6r2", "c7r2", "c8r2"] } }
    ]
  },

  // ------------------------------------------------------- format demos
  {
    "id": "connections-1",
    "title": "Group of Four №1",
    "subtitle": "Sort 16 tiles into four groups",
    "attribution": "RAD",
    "prompt": "Sort the sixteen tiles into four groups of four. Each row holds one complete group — any group can go in any row.",
    "tileAspect": 2.4,
    "slotGap": 8,
    "chainTiles": false,
    "tiles": [
      { "id": "t01", "text": "NAVY" }, { "id": "t02", "text": "SKY" }, { "id": "t03", "text": "ROYAL" }, { "id": "t04", "text": "BABY" },
      { "id": "t05", "text": "KIDNEY" }, { "id": "t06", "text": "RUNNER" }, { "id": "t07", "text": "JELLY" }, { "id": "t08", "text": "BLACK" },
      { "id": "t09", "text": "HEART" }, { "id": "t10", "text": "LIVER" }, { "id": "t11", "text": "BRAIN" }, { "id": "t12", "text": "LUNG" },
      { "id": "t13", "text": "BRIDGE" }, { "id": "t14", "text": "SNAP" }, { "id": "t15", "text": "HEARTS" }, { "id": "t16", "text": "SPIT" }
    ],
    "slots": [
      { "id": "r1c1", "x": 0, "y": 0 }, { "id": "r1c2", "x": 1, "y": 0 }, { "id": "r1c3", "x": 2, "y": 0 }, { "id": "r1c4", "x": 3, "y": 0 },
      { "id": "r2c1", "x": 0, "y": 1.25 }, { "id": "r2c2", "x": 1, "y": 1.25 }, { "id": "r2c3", "x": 2, "y": 1.25 }, { "id": "r2c4", "x": 3, "y": 1.25 },
      { "id": "r3c1", "x": 0, "y": 2.5 }, { "id": "r3c2", "x": 1, "y": 2.5 }, { "id": "r3c3", "x": 2, "y": 2.5 }, { "id": "r3c4", "x": 3, "y": 2.5 },
      { "id": "r4c1", "x": 0, "y": 3.75 }, { "id": "r4c2", "x": 1, "y": 3.75 }, { "id": "r4c3", "x": 2, "y": 3.75 }, { "id": "r4c4", "x": 3, "y": 3.75 }
    ],
    "checks": [
      {
        "type": "categories",
        "slotGroups": [
          ["r1c1", "r1c2", "r1c3", "r1c4"], ["r2c1", "r2c2", "r2c3", "r2c4"],
          ["r3c1", "r3c2", "r3c3", "r3c4"], ["r4c1", "r4c2", "r4c3", "r4c4"]
        ],
        "categories": [
          { "label": "Shades of blue", "tiles": ["NAVY", "SKY", "ROYAL", "BABY"] },
          { "label": "___ bean", "tiles": ["KIDNEY", "RUNNER", "JELLY", "BLACK"] },
          { "label": "Organs", "tiles": ["HEART", "LIVER", "BRAIN", "LUNG"] },
          { "label": "Card games", "tiles": ["BRIDGE", "SNAP", "HEARTS", "SPIT"] }
        ]
      }
    ],
    "hints": [
      { "size": "small", "text": "Four of these tiles are shades of one colour.", "highlight": {} },
      { "size": "small", "text": "One word can precede \"bean\".", "highlight": { "tiles": ["KIDNEY"] } },
      { "size": "big", "text": "HEART and HEARTS are in different groups: one is an organ, the other a card game.", "highlight": { "tiles": ["HEART", "HEARTS"] } },
      { "size": "big", "text": "The card games are BRIDGE, SNAP, HEARTS and SPIT.", "highlight": { "tiles": ["BRIDGE", "SNAP", "HEARTS", "SPIT"] } }
    ]
  },

  {
    "id": "mini-cryptic-xmas",
    "title": "Christmas Special",
    "subtitle": "Unlocks on the day (release-date demo)",
    "attribution": "AD",
    "releaseDate": "2026-12-25",
    "prompt": "ACROSS\n1. Devil dancing about, bringing presents (5)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "x1", "x": 0, "y": 0, "label": "1" }, { "id": "x2", "x": 1, "y": 0 },
      { "id": "x3", "x": 2, "y": 0 }, { "id": "x4", "x": 3, "y": 0 }, { "id": "x5", "x": 4, "y": 0 }
    ],
    "checks": [
      { "type": "slots", "answers": { "x1": "S", "x2": "A", "x3": "N", "x4": "T", "x5": "A" } }
    ],
    "hints": [
      { "size": "small", "text": "\"dancing about\" signals an anagram of DEVIL's other name.", "highlight": { "prompt": ["dancing about"] } }
    ]
  }
];

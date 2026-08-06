// Puzzle definitions — edit this file by hand. See README.md for the schema.
// It's a .js file (not .json) only so the page also works when opened directly
// from disk (file://), where browsers block fetching .json files.
window.PUZZLES = [
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
      {
        "type": "slots",
        "answers": { "s1": "A", "s2": "P", "s3": "P", "s4": "L", "s5": "E" }
      }
    ],
    "hints": [
      {
        "size": "small",
        "text": "One a day keeps the doctor away.",
        "highlight": { "prompt": ["fruit"] }
      },
      {
        "size": "big",
        "text": "It starts with A and ends with E.",
        "highlight": { "slots": ["s1", "s5"] }
      }
    ]
  },

  {
    "id": "mini-cryptic-1",
    "title": "Mini Cryptic №1",
    "subtitle": "Three little clues, one bent grid",
    "attribution": "RAD",
    "prompt": "ACROSS\n1. Feline from scattered act (3)\n\nDOWN\n2. Craft concealed by departure (3)\n3. Drink brewed from eat (3)",
    "tileGenerator": { "type": "letters" },
    "slotGap": 5,
    "slots": [
      { "id": "c1", "x": 0, "y": 0, "label": "1" },
      { "id": "c2", "x": 1, "y": 0, "label": "2" },
      { "id": "c3", "x": 2, "y": 0, "label": "3" },
      { "id": "c4", "x": 1, "y": 1 },
      { "id": "c5", "x": 1, "y": 2 },
      { "id": "c6", "x": 2, "y": 1 },
      { "id": "c7", "x": 2, "y": 2 }
    ],
    "checks": [
      {
        "type": "slots",
        "answers": {
          "c1": "C", "c2": "A", "c3": "T",
          "c4": "R", "c5": "T",
          "c6": "E", "c7": "A"
        }
      }
    ],
    "hints": [
      {
        "size": "small",
        "text": "\"Scattered\" and \"brewed\" both signal anagrams.",
        "highlight": { "prompt": ["scattered", "brewed"] }
      },
      {
        "size": "small",
        "text": "\"Concealed by\" means the answer is hiding inside another word of the clue.",
        "highlight": { "prompt": ["concealed by departure"] }
      },
      {
        "size": "big",
        "text": "1 Across: rearrange the letters of ACT to get a small pet.",
        "highlight": { "slots": ["c1", "c2", "c3"], "prompt": ["act"] }
      },
      {
        "size": "big",
        "text": "2 Down hides in depARTure. 3 Down is EAT stirred into something you might drink hot.",
        "highlight": { "slots": ["c2", "c4", "c5", "c3", "c6", "c7"] }
      }
    ]
  },

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
      { "id": "t01", "text": "NAVY" },
      { "id": "t02", "text": "SKY" },
      { "id": "t03", "text": "ROYAL" },
      { "id": "t04", "text": "BABY" },
      { "id": "t05", "text": "KIDNEY" },
      { "id": "t06", "text": "RUNNER" },
      { "id": "t07", "text": "JELLY" },
      { "id": "t08", "text": "BLACK" },
      { "id": "t09", "text": "HEART" },
      { "id": "t10", "text": "LIVER" },
      { "id": "t11", "text": "BRAIN" },
      { "id": "t12", "text": "LUNG" },
      { "id": "t13", "text": "BRIDGE" },
      { "id": "t14", "text": "SNAP" },
      { "id": "t15", "text": "HEARTS" },
      { "id": "t16", "text": "SPIT" }
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
          ["r1c1", "r1c2", "r1c3", "r1c4"],
          ["r2c1", "r2c2", "r2c3", "r2c4"],
          ["r3c1", "r3c2", "r3c3", "r3c4"],
          ["r4c1", "r4c2", "r4c3", "r4c4"]
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
      {
        "size": "small",
        "text": "Four of these tiles are shades of one colour.",
        "highlight": {}
      },
      {
        "size": "small",
        "text": "Some tiles look like they belong together but don't — one word can precede \"bean\".",
        "highlight": { "tiles": ["KIDNEY"] }
      },
      {
        "size": "big",
        "text": "HEART and HEARTS are in different groups: one is an organ, the other a card game.",
        "highlight": { "tiles": ["HEART", "HEARTS"] }
      },
      {
        "size": "big",
        "text": "The card games are BRIDGE, SNAP, HEARTS and SPIT.",
        "highlight": { "tiles": ["BRIDGE", "SNAP", "HEARTS", "SPIT"] }
      }
    ]
  },

  {
    "id": "mini-cryptic-xmas",
    "title": "Christmas Special",
    "subtitle": "A festive mini cryptic",
    "releaseDate": "2026-12-25",
    "prompt": "ACROSS\n1. Devil dancing about, bringing presents (5)",
    "tileGenerator": { "type": "letters" },
    "slots": [
      { "id": "x1", "x": 0, "y": 0, "label": "1" },
      { "id": "x2", "x": 1, "y": 0 },
      { "id": "x3", "x": 2, "y": 0 },
      { "id": "x4", "x": 3, "y": 0 },
      { "id": "x5", "x": 4, "y": 0 }
    ],
    "checks": [
      {
        "type": "slots",
        "answers": { "x1": "S", "x2": "A", "x3": "N", "x4": "T", "x5": "A" }
      }
    ],
    "hints": [
      {
        "size": "small",
        "text": "\"Dancing about\" signals an anagram of DEVIL's other name.",
        "highlight": { "prompt": ["dancing about"] }
      }
    ]
  }
];

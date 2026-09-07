import { z } from "zod";
import { parseRichText } from "@/engine/richtext";

/**
 * The puzzle authoring schema. Every puzzle is the same generic shape — a
 * prompt, slots on a grid, tiles to fill them (fixed and/or generated) and a
 * list of checks that must all pass. Different puzzle *types* (cryptics,
 * crosswords, connections) are compositions of these pieces, not engine
 * features, so new formats are new data — and new check kinds are added in
 * `engine/checks.ts` without touching the rest of the engine.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const tileDefSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const tileGeneratorSchema = z.object({
  type: z.literal("letters"),
  /** Optional subset of the alphabet; defaults to A–Z. */
  letters: z.string().min(1).optional(),
});

export const slotDefSchema = z.object({
  id: z.string().min(1),
  /** Grid units; fractions allowed (e.g. y: 1.25 for row gaps). */
  x: z.number(),
  y: z.number(),
  /** Small corner label (crossword numbering). */
  label: z.union([z.string(), z.number()]).optional(),
  /** Large faded label filling the slot until a tile covers it. */
  centerLabel: z.union([z.string(), z.number()]).optional(),
});

const acceptedText = z.union([z.string(), z.array(z.string())]);

export const slotsCheckSchema = z.object({
  type: z.literal("slots"),
  /** Exact tile text per slot id (case-insensitive). */
  answers: z.record(z.string(), acceptedText),
});

export const categoriesCheckSchema = z.object({
  type: z.literal("categories"),
  /** Each group must hold exactly one full category (any category ↔ any group). */
  slotGroups: z.array(z.array(z.string()).min(1)).min(1),
  categories: z
    .array(z.object({ label: z.string().optional(), tiles: z.array(z.string()).min(1) }))
    .min(1),
});

export const anyCheckSchema = z.object({ type: z.literal("any") });

export const checkSchema = z.discriminatedUnion("type", [
  slotsCheckSchema,
  categoriesCheckSchema,
  anyCheckSchema,
]);

export const hintHighlightSchema = z.object({
  /** Substrings of the prompt (as displayed) to mark. */
  prompt: z.union([z.string(), z.array(z.string())]).optional(),
  /** Slot ids to glow. */
  slots: z.array(z.string()).optional(),
  /** Tile ids OR tile texts to glow. */
  tiles: z.array(z.string()).optional(),
});

export const hintSchema = z.object({
  /** Any label ("definition", "wordplay", "small"...). Each distinct size is a reveal button. */
  size: z.string().min(1),
  text: z.string(),
  highlight: hintHighlightSchema.optional(),
});

export const puzzleSchema = z
  .object({
    /** Stable, spoiler-free, unique. Keyed on for progress AND the #/<id> route — never rename. */
    id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "ids are lowercase kebab-case"),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    /** Listed from this local date (inclusive). Always playable via direct link regardless. */
    releaseDate: isoDate.optional(),
    /** Last local date on the list (inclusive). */
    expiryDate: isoDate.optional(),
    attribution: z.string().optional(),
    /** Plain text; newlines respected; `^{…}` / `_{…}` become superscript / subscript. */
    prompt: z.string().optional(),
    tiles: z.array(tileDefSchema).optional(),
    tileGenerator: tileGeneratorSchema.optional(),
    slots: z.array(slotDefSchema).min(1),
    /** Pixels between slots (default 8). */
    slotGap: z.number().nonnegative().optional(),
    /** Tile width / height (default 1). */
    tileAspect: z.number().positive().optional(),
    /** Side-by-side tiles snap into a draggable word. Defaults to ON when there is a tileGenerator. */
    chainTiles: z.boolean().optional(),
    checks: z.array(checkSchema).min(1),
    hints: z.array(hintSchema).optional(),
  })
  .superRefine((p, ctx) => {
    const slotIds = new Set<string>();
    for (const s of p.slots) {
      if (slotIds.has(s.id))
        ctx.addIssue({ code: "custom", message: `duplicate slot id "${s.id}"`, path: ["slots"] });
      slotIds.add(s.id);
    }
    const tileIds = new Set<string>();
    for (const t of p.tiles ?? []) {
      if (tileIds.has(t.id))
        ctx.addIssue({ code: "custom", message: `duplicate tile id "${t.id}"`, path: ["tiles"] });
      tileIds.add(t.id);
    }
    if (!p.tiles?.length && !p.tileGenerator)
      ctx.addIssue({ code: "custom", message: "a puzzle needs `tiles` and/or a `tileGenerator`" });
    p.checks.forEach((c, i) => {
      if (c.type === "slots") {
        for (const id of Object.keys(c.answers))
          if (!slotIds.has(id))
            ctx.addIssue({
              code: "custom",
              message: `answer for unknown slot "${id}"`,
              path: ["checks", i],
            });
      } else if (c.type === "categories") {
        for (const g of c.slotGroups)
          for (const id of g)
            if (!slotIds.has(id))
              ctx.addIssue({
                code: "custom",
                message: `slotGroup references unknown slot "${id}"`,
                path: ["checks", i],
              });
      }
    });
    (p.hints ?? []).forEach((h, i) => {
      for (const id of h.highlight?.slots ?? [])
        if (!slotIds.has(id))
          ctx.addIssue({
            code: "custom",
            message: `hint highlights unknown slot "${id}"`,
            path: ["hints", i],
          });
      if (h.highlight?.prompt) {
        const marks =
          typeof h.highlight.prompt === "string" ? [h.highlight.prompt] : h.highlight.prompt;
        const display = parseRichText(p.prompt ?? "").display.toLowerCase();
        for (const m of marks)
          if (!display.includes(m.toLowerCase()))
            ctx.addIssue({
              code: "custom",
              message: `hint highlight "${m}" is not in the prompt`,
              path: ["hints", i],
            });
      }
    });
  });

export type PuzzleDef = z.infer<typeof puzzleSchema>;
export type PuzzleInput = z.input<typeof puzzleSchema>;
export type TileDef = z.infer<typeof tileDefSchema>;
export type SlotDef = z.infer<typeof slotDefSchema>;
export type TileGenerator = z.infer<typeof tileGeneratorSchema>;
export type Check = z.infer<typeof checkSchema>;
export type SlotsCheck = z.infer<typeof slotsCheckSchema>;
export type CategoriesCheck = z.infer<typeof categoriesCheckSchema>;
export type Hint = z.infer<typeof hintSchema>;
export type HintHighlight = z.infer<typeof hintHighlightSchema>;

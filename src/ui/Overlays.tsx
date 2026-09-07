import type { RefObject } from "react";
import type { CategoryBackdrop } from "@/engine/engine";
import type { Hint } from "@/puzzles/schema";
import { CATEGORY_COLORS } from "./Board";

const stat = (n: number, word: string) => (n ? `${n} ${word}${n > 1 ? "s" : ""}` : `no ${word}s`);

/** "Solved!" card with category chips and the hint/mistake tally. Tap to dismiss. */
export function SolvedBanner({
  categories,
  hintsUsed,
  mistakes,
  top,
  onDismiss,
}: {
  categories: readonly CategoryBackdrop[];
  hintsUsed: number;
  mistakes: number;
  /** Sits below the clue panel rather than on top of it. */
  top: number | null;
  onDismiss: () => void;
}) {
  return (
    <button
      type="button"
      className="solvedBanner"
      data-testid="solved-banner"
      style={top != null ? { top } : undefined}
      onClick={onDismiss}
    >
      🎉 Solved!{" "}
      {categories.map((c, i) => (
        <span
          key={i}
          className="chip"
          style={{ background: CATEGORY_COLORS[c.categoryIndex % CATEGORY_COLORS.length] }}
        >
          {c.label}
        </span>
      ))}
      <span className="muted">
        {stat(hintsUsed, "hint")} · {stat(mistakes, "mistake")}
      </span>
      <span className="bx" aria-hidden="true">
        ✕
      </span>
    </button>
  );
}

/** Drop target for generated tiles; appears only while such a tile is dragged. */
export function TrashZone({
  show,
  hot,
  bottom,
  trashRef,
}: {
  show: boolean;
  hot: boolean;
  /** Raised above the tile bank when the bank is open. */
  bottom: number | null;
  trashRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={trashRef}
      className={["trashZone", show ? "show" : "", hot ? "hot" : ""].filter(Boolean).join(" ")}
      style={bottom != null ? { bottom } : undefined}
      aria-hidden="true"
    >
      ✕
    </div>
  );
}

/** The current hint's text; tapping dismisses it and clears its highlights. */
export function HintToast({ hint, onDismiss }: { hint: Hint; onDismiss: () => void }) {
  return (
    <button type="button" className="hintToast" data-testid="hint-toast" onClick={onDismiss}>
      <span>{hint.text}</span>
      <span className="x">✕</span>
    </button>
  );
}

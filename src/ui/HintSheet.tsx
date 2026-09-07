import { useEffect, useState } from "react";
import type { Engine } from "@/engine/engine";
import type { Hint } from "@/puzzles/schema";

interface Props {
  engine: Engine;
  open: boolean;
  revealedHints: readonly number[];
  onClose: () => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Bottom sheet: one reveal button per hint size (two-tap confirm), plus every
 * hint already revealed so they can be re-read and their highlights replayed.
 */
export function HintSheet({ engine, open, revealedHints, onClose }: Props) {
  const [armed, setArmed] = useState<string | null>(null);
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  // Mount, then slide in on the next frame; slide out, then unmount.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    setArmed(null);
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(null), 2500);
    return () => clearTimeout(t);
  }, [armed]);

  if (!mounted) return null;
  const hints = engine.hints;
  const revealed = revealedHints
    .map((i) => [i, hints[i]] as const)
    .filter((x): x is readonly [number, Hint] => !!x[1]);

  return (
    <>
      <div className={"sheetScrim" + (shown ? " open" : "")} onClick={onClose} />
      <div className={"hintSheet" + (shown ? " open" : "")} role="dialog" aria-label="Hints">
        <h2>Hints</h2>
        <p className="sheetSub">Revealed hints stay here so you can review them any time.</p>
        <div className="hintButtons">
          {engine.hintSizes().map((size) => {
            const remaining = engine.hintsRemaining(size);
            const isArmed = armed === size;
            return (
              <button
                type="button"
                key={size}
                className={"hbtn" + (isArmed ? " armed" : "")}
                disabled={remaining <= 0}
                onClick={() => {
                  if (!isArmed) return setArmed(size);
                  setArmed(null);
                  engine.revealNextHint(size);
                  onClose();
                }}
              >
                {isArmed ? `Reveal ${size} hint?` : `${cap(size)} hint · ${remaining} left`}
              </button>
            );
          })}
        </div>
        <div>
          {revealed.length === 0 && <p className="sheetSub">No hints revealed yet.</p>}
          {revealed.map(([index, hint]) => (
            <button
              type="button"
              key={index}
              className="revealedHint"
              onClick={() => {
                onClose();
                engine.applyHint(hint);
              }}
            >
              <span className="hintSize">{hint.size} hint</span>
              {hint.text}
              {hint.highlight && <span className="replay"> · tap to show highlights</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

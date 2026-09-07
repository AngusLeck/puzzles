import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useServices } from "@/app/services";
import { navigateTo } from "@/app/useHashRoute";
import { themeIcon } from "@/app/useTheme";
import { Engine } from "@/engine/engine";
import type { EngineEvent, Puzzle } from "@/engine/types";
import { nextTheme, usePrefs } from "@/state/prefs";
import { Board, type EventBus } from "./Board";
import { FloatButton } from "./FloatButton";
import { HintSheet } from "./HintSheet";
import { HintToast, SolvedBanner, TrashZone } from "./Overlays";
import { PromptPanel } from "./PromptPanel";
import { TileBank } from "./TileBank";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Two-tap confirm for destructive buttons: first tap arms, second (within `ms`) fires. */
function useArmed(ms: number): [boolean, (fire: () => void) => void] {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), ms);
    return () => clearTimeout(t);
  }, [armed, ms]);
  const press = useCallback(
    (fire: () => void) => {
      if (!armed) return setArmed(true);
      setArmed(false);
      fire();
    },
    [armed],
  );
  return [armed, press];
}

export function PuzzleView({ puzzle }: { puzzle: Puzzle }) {
  const { prefs, progress, sound } = useServices();
  const prefValues = usePrefs(prefs);

  // One engine per puzzle open. Events fan out to the synth and to the board's
  // one-shot effects (shake, confetti, slot flash).
  const listeners = useRef(new Set<(e: EngineEvent) => void>());
  const events = useMemo<EventBus>(
    () => ({
      subscribe(fn) {
        listeners.current.add(fn);
        return () => void listeners.current.delete(fn);
      },
    }),
    [],
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const promptCollapsedRef = useRef(false);

  const engine = useMemo(
    () =>
      new Engine({
        puzzle,
        progress,
        noHelp: () => prefs.get().noHelp,
        spawnBounds: () =>
          spawnBounds(
            boardRef.current,
            promptRef.current,
            bankRef.current,
            promptCollapsedRef.current,
            !!prefs.get().promptPos,
          ),
        onEvent: (e) => {
          sound.handle(e);
          for (const fn of listeners.current) fn(e);
        },
      }),
    [puzzle, progress, prefs, sound],
  );
  useEffect(() => () => engine.dispose(), [engine]);
  const snap = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  promptCollapsedRef.current = snap.promptCollapsed;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => {
    if (!snap.solved) setBannerDismissed(false);
  }, [snap.solved]);
  const [resetArmed, pressReset] = useArmed(2200);

  // Keyboard: type into the selected slot / group, or drop letters near the pointer.
  useEffect(() => {
    if (!engine.canType) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || sheetOpen) return;
      if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        engine.addLetter(e.key.toUpperCase(), true);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        engine.backspace();
      } else if (e.key.startsWith("Arrow")) {
        const map = {
          ArrowLeft: ["h", -1],
          ArrowRight: ["h", 1],
          ArrowUp: ["v", -1],
          ArrowDown: ["v", 1],
        } as const;
        const m = map[e.key as keyof typeof map];
        if (m) {
          e.preventDefault();
          engine.moveSelection(m[0], m[1]);
        }
      } else if (e.key === "Escape") engine.deselect();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [engine, sheetOpen]);

  // Escape closes the sheet / dismisses the hint.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSheetOpen(false);
      if (engine.getSnapshot().activeHint) engine.clearHighlights();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [engine]);

  // The solved banner sits *below* the clue (the original overlapped it).
  const [promptBottom, setPromptBottom] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = promptRef.current;
    if (!el || snap.promptCollapsed || prefValues.promptPos) return setPromptBottom(null);
    const measure = () => setPromptBottom(el.getBoundingClientRect().bottom + 8);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [snap.promptCollapsed, prefValues.promptPos, snap.promptMarks, puzzle.prompt]);

  const hasBank = !!puzzle.tileGenerator;
  const trashBottom =
    hasBank && snap.bankOpen && bankRef.current ? bankRef.current.offsetHeight + 14 : null;
  const showBanner = snap.solved && !bannerDismissed;

  return (
    <div className="puzzleView">
      <Board
        engine={engine}
        snapshot={snap}
        events={events}
        boardRef={boardRef}
        trashRef={trashRef}
      />

      <FloatButton className="backBtn" label="Back to puzzles" onClick={() => navigateTo(null)}>
        ←
      </FloatButton>
      <div className="topRight">
        <FloatButton label="Show / hide the clue" onClick={() => engine.togglePrompt()}>
          ☰
        </FloatButton>
        <FloatButton
          label={`Theme: ${prefValues.theme}. Tap to change`}
          onClick={() => prefs.set("theme", nextTheme(prefValues.theme))}
        >
          {themeIcon(prefValues.theme)}
        </FloatButton>
        <FloatButton
          label={prefValues.muted ? "Sound off. Tap to unmute" : "Sound on. Tap to mute"}
          onClick={() => sound.toggleMute()}
        >
          {prefValues.muted ? "🔇" : "🔊"}
        </FloatButton>
        <FloatButton
          label={
            prefValues.noHelp
              ? "No-help mode on: any mistake clears the whole board"
              : "Help mode: only wrong tiles pop out"
          }
          armed={prefValues.noHelp}
          onClick={() => prefs.set("noHelp", !prefValues.noHelp)}
        >
          {prefValues.noHelp ? "😈" : "👼"}
        </FloatButton>
        {engine.hints.length > 0 && (
          <FloatButton label="Get a hint" onClick={() => setSheetOpen(true)}>
            💡
          </FloatButton>
        )}
        <FloatButton
          label="Reset this puzzle"
          armed={resetArmed}
          onClick={() => pressReset(() => engine.reset())}
        >
          {resetArmed ? "Reset?" : "↺"}
        </FloatButton>
      </div>

      <PromptPanel
        prompt={puzzle.prompt ?? ""}
        attribution={puzzle.attribution}
        marks={snap.promptMarks}
        collapsed={snap.promptCollapsed}
        prefs={prefs}
        promptPos={prefValues.promptPos}
        panelRef={promptRef}
      />
      {showBanner && (
        <SolvedBanner
          categories={snap.categoryBackdrops}
          hintsUsed={snap.revealedHints.length}
          mistakes={snap.mistakes}
          top={promptBottom}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {hasBank && (
        <TileBank
          engine={engine}
          letters={puzzle.tileGenerator?.letters ?? ALPHABET}
          open={snap.bankOpen}
          boardRef={boardRef}
          trashRef={trashRef}
          bankRef={bankRef}
        />
      )}
      <TrashZone
        show={snap.dragging && snap.dragRemovable}
        hot={engine.overTrash}
        bottom={trashBottom}
        trashRef={trashRef}
      />

      <HintSheet
        engine={engine}
        open={sheetOpen}
        revealedHints={snap.revealedHints}
        onClose={() => setSheetOpen(false)}
      />
      {snap.activeHint && (
        <HintToast hint={snap.activeHint} onDismiss={() => engine.clearHighlights()} />
      )}
    </div>
  );
}

/** Board-space band clear of the clue panel and the tile bank, for randomly placed letters. */
function spawnBounds(
  board: HTMLDivElement | null,
  prompt: HTMLDivElement | null,
  bank: HTMLDivElement | null,
  promptCollapsed: boolean,
  promptMoved: boolean,
): { top: number; bottom: number } | null {
  if (!board) return null;
  const b = board.getBoundingClientRect();
  let top = 66;
  if (prompt && !promptCollapsed && !promptMoved)
    top = Math.max(top, prompt.getBoundingClientRect().bottom - b.top + 10);
  let bottom = Infinity;
  if (bank) bottom = bank.getBoundingClientRect().top - b.top - 10;
  return { top, bottom };
}

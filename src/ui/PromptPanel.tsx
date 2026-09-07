import {
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { clamp } from "@/engine/layout";
import { segmentPrompt } from "@/engine/richtext";
import type { Prefs, PrefsStore } from "@/state/prefs";

interface Props {
  prompt: string;
  attribution: string | undefined;
  marks: readonly string[];
  collapsed: boolean;
  prefs: PrefsStore;
  promptPos: Prefs["promptPos"];
  panelRef: RefObject<HTMLDivElement | null>;
}

/**
 * The floating clue. Drag the grip to move it (position persists across
 * puzzles); double-tap the grip to send it home. Hint highlights render as
 * <mark>, author `^{}`/`_{}` as <sup>/<sub>; no innerHTML anywhere.
 */
export function PromptPanel({
  prompt,
  attribution,
  marks,
  collapsed,
  prefs,
  promptPos,
  panelRef,
}: Props) {
  const segments = segmentPrompt(prompt, marks);
  const dragging = useRef<{ offX: number; offY: number; w: number; pointerId: number } | null>(
    null,
  );

  // Keep a placed panel on screen when the window changes size.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const apply = () => {
      if (promptPos) {
        el.style.left = clamp(promptPos.x, 4, window.innerWidth - el.offsetWidth - 4) + "px";
        el.style.top = clamp(promptPos.y, 4, window.innerHeight - 44) + "px";
      } else {
        el.style.left = "";
        el.style.top = "";
      }
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [promptPos, panelRef]);

  useEffect(() => () => void (dragging.current = null), []);

  const onGripDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragging.current = {
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      w: rect.width,
      pointerId: e.pointerId,
    };
    panel.classList.add("placed");
    panel.style.left = rect.left + "px";
    panel.style.top = rect.top + "px";
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onGripMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragging.current;
    const panel = panelRef.current;
    if (!d || !panel || d.pointerId !== e.pointerId) return;
    const x = clamp(e.clientX - d.offX, 4, window.innerWidth - d.w - 4);
    const y = clamp(e.clientY - d.offY, 4, window.innerHeight - 44);
    panel.style.left = x + "px";
    panel.style.top = y + "px";
  };
  const onGripUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragging.current;
    const panel = panelRef.current;
    if (!d || !panel || d.pointerId !== e.pointerId) return;
    dragging.current = null;
    prefs.set("promptPos", { x: parseFloat(panel.style.left), y: parseFloat(panel.style.top) });
  };
  const resetPos = () => prefs.set("promptPos", null);

  if (!segments.length) return null;
  return (
    <div
      ref={panelRef}
      className={["promptPanel", collapsed ? "collapsed" : "", promptPos ? "placed" : ""]
        .filter(Boolean)
        .join(" ")}
      data-testid="prompt-panel"
    >
      <div
        className="promptDrag"
        aria-label="Drag clue"
        title="Drag to move · double-tap to reset"
        onPointerDown={onGripDown}
        onPointerMove={onGripMove}
        onPointerUp={onGripUp}
        onPointerCancel={() => (dragging.current = null)}
        onDoubleClick={resetPos}
      />
      <div className="promptText">
        {segments.map((seg, i) => {
          let node = <>{seg.text}</>;
          if (seg.marked) node = <mark>{node}</mark>;
          if (seg.tag === "sup") node = <sup>{node}</sup>;
          if (seg.tag === "sub") node = <sub>{node}</sub>;
          return <span key={i}>{node}</span>;
        })}
        {attribution && <span className="attribution">— {attribution}</span>}
      </div>
    </div>
  );
}

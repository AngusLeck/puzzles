import { useSyncExternalStore } from "react";
import { navigateTo } from "@/app/useHashRoute";
import { useServices } from "@/app/services";
import { themeIcon } from "@/app/useTheme";
import { partitionForList } from "@/engine/release";
import { puzzles } from "@/puzzles";
import { nextTheme, usePrefs } from "@/state/prefs";
import { FloatButton } from "./FloatButton";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function ListView() {
  const { prefs, progress } = useServices();
  const { theme } = usePrefs(prefs);
  // Re-render when any progress record changes (returning from a puzzle).
  useSyncExternalStore(
    progress.subscribe,
    () => progress.version,
    () => progress.version,
  );

  const { released, upcoming } = partitionForList(puzzles);
  const next = upcoming[0];

  return (
    <div className="wrap">
      <FloatButton
        className="listTheme"
        label={`Theme: ${theme}. Tap to change`}
        onClick={() => prefs.set("theme", nextTheme(theme))}
      >
        {themeIcon(theme)}
      </FloatButton>
      <h1 className="listTitle">Puzzles</h1>
      <p className="tagline">Tiles &amp; slots. Drag, snap, solve.</p>
      <div>
        {released.length === 0 && <p className="upcomingNote">No puzzles released yet.</p>}
        {released.map((p) => {
          const pr = progress.get(p.id);
          const hintsUsed = pr.hints?.length ?? 0;
          const mistakes = pr.mistakes ?? 0;
          return (
            <button
              type="button"
              key={p.id}
              className="puzzleCard"
              onClick={() => navigateTo(p.id)}
            >
              <div className="cardTitle">{p.title}</div>
              {p.subtitle && <div className="cardSub">{p.subtitle}</div>}
              <div className="cardMeta">
                {pr.solved && <span className="badge solved">✓ Solved</span>}
                {hintsUsed > 0 && (
                  <span className="badge">💡 {plural(hintsUsed, "hint")} used</span>
                )}
                {mistakes > 0 && <span className="badge">✗ {plural(mistakes, "mistake")}</span>}
                {p.releaseDate && <span className="badge">{p.releaseDate}</span>}
                {p.expiryDate && <span className="badge">until {p.expiryDate}</span>}
                {p.attribution && <span className="badge">by {p.attribution}</span>}
              </div>
            </button>
          );
        })}
      </div>
      {next && (
        <p className="upcomingNote">
          {plural(upcoming.length, "more puzzle")} coming. Next on {next.releaseDate}.
        </p>
      )}
    </div>
  );
}

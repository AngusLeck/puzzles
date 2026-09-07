import { useEffect } from "react";
import { puzzleById } from "@/puzzles";
import { usePrefs } from "@/state/prefs";
import { ListView } from "@/ui/ListView";
import { PuzzleView } from "@/ui/PuzzleView";
import { TooltipProvider } from "@/ui/FloatButton";
import { ServicesProvider, useServices } from "./services";
import { clearHashSilently, useHashRoute } from "./useHashRoute";
import { useApplyTheme } from "./useTheme";

export function App() {
  return (
    <ServicesProvider>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </ServicesProvider>
  );
}

function Router() {
  const { prefs } = useServices();
  const { theme } = usePrefs(prefs);
  useApplyTheme(theme);

  const id = useHashRoute();
  // A direct link opens any puzzle, whatever the list is showing: one that
  // hasn't been released yet (handy for sharing a preview early) or one whose
  // run has ended. Links never rot.
  const puzzle = id ? puzzleById.get(id) : undefined;
  const unknown = !!id && !puzzle;
  useEffect(() => {
    if (unknown) clearHashSilently();
  }, [unknown]);

  useEffect(() => {
    document.body.classList.toggle("playing", !!puzzle);
    return () => document.body.classList.remove("playing");
  }, [puzzle]);

  return puzzle ? <PuzzleView key={puzzle.id} puzzle={puzzle} /> : <ListView />;
}

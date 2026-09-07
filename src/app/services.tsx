import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Sound } from "@/audio/sound";
import { createProgressStore, safeLocalStorage, type ProgressStore } from "@/engine/progress";
import { createPrefsStore, type PrefsStore } from "@/state/prefs";

/** App-wide singletons: persisted preferences, player progress, the synth. */
export interface Services {
  prefs: PrefsStore;
  progress: ProgressStore;
  sound: Sound;
}

const ServicesContext = createContext<Services | null>(null);

export function createServices(): Services {
  const storage = safeLocalStorage();
  const prefs = createPrefsStore(storage);
  const progress = createProgressStore(storage);
  const sound = new Sound({
    muted: prefs.get().muted,
    onMutedChange: (m) => prefs.set("muted", m),
  });
  return { prefs, progress, sound };
}

export function ServicesProvider({ children, value }: { children: ReactNode; value?: Services }) {
  const created = useMemo(() => value ?? createServices(), [value]);
  return <ServicesContext.Provider value={created}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const s = useContext(ServicesContext);
  if (!s) throw new Error("useServices outside <ServicesProvider>");
  return s;
}

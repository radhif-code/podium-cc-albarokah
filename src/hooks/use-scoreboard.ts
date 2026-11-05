import { useCallback, useEffect, useRef, useState } from "react";
import { TEAM_COLORS, type EventLogo, type Settings, type Team } from "@/lib/scoreboard";
import { changeScore, clampScore, createDefaultState, createId, decodeState, LEGACY_STORAGE_KEY, MAX_TEAMS, startTimer, STORAGE_KEY, undoScore, type SharedState } from "@/lib/shared-state";
export interface FloatingDelta { id: number; teamId: string; value: number }
function readState(): SharedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? decodeState(raw) ?? createDefaultState() : createDefaultState();
  } catch { return createDefaultState(); }
}
export function useScoreboard() {
  const [state, setState] = useState(readState);
  const stateRef = useRef(state);
  const [error, setError] = useState<string | null>(null);
  const [deltas, setDeltas] = useState<FloatingDelta[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const channel = useRef<BroadcastChannel | null>(null);
  const apply = useCallback((next: SharedState) => {
    const changes = next.teams.flatMap(t => {
      const old = stateRef.current.teams.find(x => x.id === t.id);
      return old && old.score !== t.score ? [{id: Date.now() + Math.random(), teamId: t.id, value: t.score - old.score}] : [];
    });
    stateRef.current = next;
    setState(next);
    if (changes.length) {
      setDeltas(prev => [...prev, ...changes]);
      const timeout = setTimeout(() => {
        setDeltas(prev => prev.filter(x => !changes.some(c => c.id === x.id)));
        timeouts.current = timeouts.current.filter(id => id !== timeout);
      }, 1600);
      timeouts.current.push(timeout);
    }
  }, []);
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const next = raw ? decodeState(raw) : null;
        if (next) apply(next);
      } catch { /* Display keeps its last good state if storage becomes unavailable. */ }
    };
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) refresh(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    if (typeof BroadcastChannel !== "undefined") {
      try { channel.current = new BroadcastChannel(STORAGE_KEY); channel.current.onmessage = refresh; } catch { /* Storage events are sufficient. */ }
    }
    refresh();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      channel.current?.close();
      channel.current = null;
      timeouts.current.forEach(clearTimeout);
    };
  }, [apply]);
  const commit = useCallback((update: (prev: SharedState) => SharedState): boolean => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const latest = raw ? decodeState(raw) ?? stateRef.current : stateRef.current;
      const next = update(latest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      apply(next);
      setError(null);
      try { channel.current?.postMessage("refresh"); } catch { /* storage event still delivers */ }
      return true;
    } catch {
      setError("Perubahan belum tersimpan. Penyimpanan browser tidak tersedia atau penuh. Unduh cadangan lalu coba logo berukuran lebih kecil.");
      return false;
    }
  }, [apply]);
  const adjustScore = useCallback((id: string, value: number) => { commit(s => changeScore(s, id, value, "adjust")); }, [commit]);
  const setScore = useCallback((id: string, value: number) => { commit(s => changeScore(s, id, value, "set")); }, [commit]);
  const resetScore = useCallback((id: string) => { commit(s => changeScore(s, id, s.teams.find(t => t.id === id)?.initialScore ?? 0, "set")); }, [commit]);
  const resetAllScores = useCallback(() => { commit(s => s.teams.reduce((next, t) => changeScore(next, t.id, t.initialScore, "set"), s)); }, [commit]);
  const updateSettings = useCallback((patch: Partial<Settings>) => { commit(s => {
    const settings = {...s.settings, ...patch};
    return {...s, settings, teams: s.teams.map(t => ({...t, score: clampScore(t.score, settings)})), history: patch.maxScore !== undefined ? [] : s.history};
  }); }, [commit]);
  const updateEventLogo = useCallback((id: string, patch: Partial<EventLogo>) => {
    commit(s => ({...s, settings: {...s.settings, eventLogos: s.settings.eventLogos.map(logo => logo.id === id ? {...logo, ...patch, id: logo.id} : logo)}}));
  }, [commit]);
  const updateTeam = useCallback((id: string, patch: Partial<Team>) => { commit(s => ({...s, teams: s.teams.map(t => t.id === id ? {...t, ...patch, id: t.id, score: clampScore(patch.score ?? t.score, s.settings)} : t)})); }, [commit]);
  const addTeam = useCallback(() => { commit(s => s.teams.length >= MAX_TEAMS ? s : {...s, teams: [...s.teams, {id: createId(), name: `Tim ${s.teams.length + 1}`, color: TEAM_COLORS[s.teams.length % TEAM_COLORS.length]!, logo: null, score: 0, initialScore: 0}]}); }, [commit]);
  const removeTeam = useCallback((id: string) => { commit(s => s.teams.length <= 2 ? s : {...s, teams: s.teams.filter(t => t.id !== id), history: s.history.filter(x => x.teamId !== id)}); }, [commit]);
  return {
    ...state, deltas, error, clearError: () => setError(null), adjustScore, setScore, resetScore, resetAllScores, updateSettings, updateEventLogo, updateTeam, addTeam, removeTeam,
    startTimer: () => commit(s => startTimer(s)), cancelTimer: () => commit(s => ({...s, timer: {endsAt: null, runId: null}})),
    undo: () => commit(undoScore), resetAll: () => commit(() => createDefaultState()), replaceState: (next: SharedState) => commit(() => next),
    exportState: () => JSON.stringify(stateRef.current, null, 2),
  };
}
export type Scoreboard = ReturnType<typeof useScoreboard>;
export function rankTeams(teams: Team[]): Team[] {
  // Stable registration order breaks visual ties; the audience sees equal rank numbers.
  return [...teams].sort((a, b) => b.score - a.score);
}

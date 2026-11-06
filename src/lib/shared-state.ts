import { DEFAULT_SETTINGS, DEFAULT_TEAMS, TEAM_COLORS, type Settings, type Team } from "./scoreboard";

export const STORAGE_KEY = "gemass-scoreboard-v2";
export const LEGACY_STORAGE_KEY = "gemass-scoreboard-v1";
let idSequence = 0;
export function createId(): string {
  return `${Date.now().toString(36)}-${(++idSequence).toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
export const MAX_TEAMS = 8;
export const SCORE_LIMIT = 999999;
export interface TimerState { endsAt: number | null; runId: string | null }
export interface ScoreAction { id: string; teamId: string; teamName: string; before: number; after: number; at: number }
export interface SharedState { version: 2; settings: Settings; teams: Team[]; timer: TimerState; history: ScoreAction[] }
export function createDefaultState(): SharedState {
  return { version: 2, settings: structuredClone(DEFAULT_SETTINGS), teams: structuredClone(DEFAULT_TEAMS), timer: { endsAt: null, runId: null }, history: [] };
}
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown, fallback: string, max = 100) => typeof x === "string" ? x.slice(0, max) : fallback;
const color = (x: unknown, fallback: string) => typeof x === "string" && /^#[a-f\d]{6}$/i.test(x) ? x : fallback;
const score = (x: unknown) => typeof x === "number" && Number.isFinite(x) ? Math.max(-SCORE_LIMIT, Math.min(SCORE_LIMIT, Math.round(x))) : 0;
const BUNDLED_LOGOS = new Set(DEFAULT_SETTINGS.eventLogos.map(item => item.src));
function logo(x: unknown): string | null {
  if (typeof x === "string" && BUNDLED_LOGOS.has(x)) return x;
  return typeof x === "string" && x.length <= 400000 && /^(data:image\/(png|jpeg|webp);base64,|https:\/\/)/.test(x) ? x : null;
}
const slots = (x: unknown, fallback: number[]) => Array.isArray(x) ? Array.from({length: 4}, (_, i) => Math.max(0, score(x[i]))) : [...fallback];
export function decodeState(raw: string): SharedState | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || !record(data['settings']) || !Array.isArray(data['teams']) || data['teams'].length < 2 || data['teams'].length > MAX_TEAMS) return null;
    const settings = data['settings'];
    const out = createDefaultState();
    out.settings = {
      eventLogoRevision: DEFAULT_SETTINGS.eventLogoRevision,
      competitionName: text(settings['competitionName'], DEFAULT_SETTINGS.competitionName, 70),
      location: settings['location'] === "DESA SRUNI" ? DEFAULT_SETTINGS.location : text(settings['location'], DEFAULT_SETTINGS.location, 70),
      badgeText: text(settings['badgeText'], DEFAULT_SETTINGS.badgeText, 90),
      themeColor: color(settings['themeColor'], DEFAULT_SETTINGS.themeColor),
      background: ["peach", "sky", "lavender", "sunset"].includes(String(settings['background'])) ? settings['background'] as Settings['background'] : DEFAULT_SETTINGS.background,
      plusValues: slots(settings['plusValues'] ?? settings['increments'], DEFAULT_SETTINGS.plusValues),
      minusValues: slots(settings['minusValues'], DEFAULT_SETTINGS.minusValues),
      maxScore: typeof settings['maxScore'] === "number" && settings['maxScore'] > 0 ? Math.max(1, score(settings['maxScore'])) : null,
      eventLogos: DEFAULT_SETTINGS.eventLogos.map(slot => {
        // Install the supplied three-logo set once when upgrading old saved data.
        // Scores, teams, and other settings are preserved; subsequent edits stay editable.
        if (settings['eventLogoRevision'] !== DEFAULT_SETTINGS.eventLogoRevision) return {...slot};
        const value = Array.isArray(settings['eventLogos']) ? settings['eventLogos'].find(item => record(item) && item['id'] === slot.id) : undefined;
        return { ...slot, label: record(value) ? text(value['label'], slot.label, 70) : slot.label, src: record(value) ? logo(value['src']) : slot.src };
      }),
    };
    const ids = new Set<string>();
    for (const value of data['teams']) {
      if (!record(value) || typeof value['id'] !== "string" || !value['id'] || ids.has(value['id'])) return null;
      ids.add(value['id']);
    }
    out.teams = data['teams'].map((value, i): Team => ({
      id: value.id, name: text(value.name, `Tim ${i + 1}`, 60), logo: logo(value.logo),
      color: color(value.color, TEAM_COLORS[i % TEAM_COLORS.length]!), score: clampScore(score(value.score), out.settings), initialScore: clampScore(score(value.initialScore), out.settings),
    }));
    const timer = data['timer'];
    if (record(timer) && typeof timer['endsAt'] === "number" && Number.isFinite(timer['endsAt']) && typeof timer['runId'] === "string") {
      out.timer = { endsAt: timer['endsAt'], runId: timer['runId'] };
    }
    if (Array.isArray(data['history'])) {
      out.history = data['history'].filter((x): x is ScoreAction => record(x) && typeof x['id'] === "string" && typeof x['teamId'] === "string" && typeof x['teamName'] === "string" && Number.isFinite(x['before']) && Number.isFinite(x['after']) && Number.isFinite(x['at'])).slice(-30).map(x => ({...x, before: clampScore(score(x.before), out.settings), after: clampScore(score(x.after), out.settings)}));
    }
    return out;
  } catch { return null; }
}
export function clampScore(value: number, settings: Settings): number {
  return Math.min(score(value), settings.maxScore ?? SCORE_LIMIT);
}
export function changeScore(state: SharedState, teamId: string, value: number, mode: "adjust" | "set"): SharedState {
  if (!Number.isFinite(value)) return state;
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return state;
  const next = clampScore(mode === "adjust" ? team.score + value : value, state.settings);
  if (next === team.score) return state;
  const action = { id: createId(), teamId, teamName: team.name, before: team.score, after: next, at: Date.now() };
  return { ...state, teams: state.teams.map(t => t.id === teamId ? {...t, score: next} : t), history: [...state.history, action].slice(-30) };
}
export function undoScore(state: SharedState): SharedState {
  const action = state.history.at(-1);
  if (!action) return state;
  return { ...state, teams: state.teams.map(t => t.id === action.teamId ? {...t, score: clampScore(action.before, state.settings)} : t), history: state.history.slice(0, -1) };
}
export function startTimer(state: SharedState, now = Date.now()): SharedState {
  return { ...state, timer: { endsAt: now + 5000, runId: createId() } };
}
export function remainingSeconds(timer: TimerState, now = Date.now()): number {
  return timer.endsAt === null ? 0 : Math.max(0, Math.min(5, Math.ceil((timer.endsAt - now) / 1000)));
}

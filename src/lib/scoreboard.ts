
export type BackgroundVariant = "peach" | "sky" | "lavender" | "sunset";

export interface Team {
  id: string;
  name: string;
  /** CDN url or data-url of the team logo; null renders initials */
  logo: string | null;
  /** hex accent color for avatars and progress bars */
  color: string;
  score: number;
  initialScore: number;
}

export interface EventLogo {
  id: string;
  label: string;
  src: string | null;
}

export interface Settings {
  eventLogoRevision: number;
  eventLogos: EventLogo[];
  competitionName: string;
  location: string;
  badgeText: string;
  /** hex accent color, drives gradients, badge and glows */
  themeColor: string;
  background: BackgroundVariant;
  /** ascending positive values for "+" buttons; 0 = slot unused */
  plusValues: number[];
  /** positive values for "−" buttons; 0 = slot unused */
  minusValues: number[];
  /** null = no cap */
  maxScore: number | null;
}

export const TEAM_COLORS = [
  "#f97316",
  "#0ea5e9",
  "#a855f7",
  "#ec4899",
  "#22c55e",
  "#eab308",
  "#14b8a6",
  "#f43f5e",
];

export const BACKGROUND_PRESETS: { id: BackgroundVariant; label: string }[] = [
  { id: "peach", label: "Peach & Cyan" },
  { id: "sky", label: "Sky & Lavender" },
  { id: "lavender", label: "Lavender & Pink" },
  { id: "sunset", label: "Sunset Pastel" },
];

export const THEME_PRESETS = [
  { color: "#ff7a3d", label: "Orange" },
  { color: "#38bdf8", label: "Sky" },
  { color: "#a855f7", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#10b981", label: "Emerald" },
  { color: "#f59e0b", label: "Gold" },
];

export const DEFAULT_SETTINGS: Settings = {
  eventLogoRevision: 1,
  eventLogos: [
    { id: "ldii", label: "LDII", src: "/logos/ldii.png" },
    { id: "gemass", label: "GEMASS", src: "/logos/logo-gemass.png" },
    { id: "ppg", label: "PPG", src: "/logos/logo-ppg.png" },
  ],
  competitionName: "CERDAS CERMAT",
  location: "DESA SRUNI",
  badgeText: "GEMA ANAK SHOLIH SHOLIHAH",
  themeColor: "#ff7a3d",
  background: "peach",
  plusValues: [50, 100, 0, 0],
  minusValues: [25, 0, 0, 0],
  maxScore: null,
};

export const DEFAULT_TEAMS: Team[] = [
  { id: "t1", name: "Tim LDII", logo: null, color: "#0ea5e9", score: 0, initialScore: 0 },
  { id: "t2", name: "Tim PPG", logo: null, color: "#f97316", score: 0, initialScore: 0 },
  { id: "t3", name: "Tim Al-Furqon", logo: null, color: "#a855f7", score: 0, initialScore: 0 },
  { id: "t4", name: "Tim Ashabul Kahfi", logo: null, color: "#ec4899", score: 0, initialScore: 0 },
];

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  const first = words[0]?.[0] ?? "?";
  const last = words[words.length - 1]?.[0] ?? "?";
  return (first + last).toUpperCase();
}

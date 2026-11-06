import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { DeltaLayer, ScoreNumber } from "@/components/scoreboard/ScoreDisplay";
import { rankTeams, type FloatingDelta } from "@/hooks/use-scoreboard";
import Avatar from "./Avatar";
import { type Settings, type Team } from "@/lib/scoreboard";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function OperatorCard({
  team,
  settings,
  rank,
  deltas,
  adjustScore,
  resetScore,
  setScore,
}: {
  team: Team;
  settings: Settings;
  rank: number;
  deltas: FloatingDelta[];
  adjustScore: (teamId: string, delta: number) => void;
  resetScore: (teamId: string) => void;
  setScore: (teamId: string, value: number) => void;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const submitManual = () => {
    const parsed = Number(manualValue);
    if (!manualValue.trim() || !Number.isFinite(parsed)) return;
    setScore(team.id, parsed);
    setManualValue("");
    setManualOpen(false);
  };

  return (
    <motion.div
      layout
      className="glass operator-team-card relative rounded-3xl p-4 sm:p-5"
      aria-label={`Kontrol skor ${team.name}`}
    >
      <div className="flex items-center gap-3">
        <Avatar team={team} />
        <div className="relative min-w-0 flex-1">
          <DeltaLayer deltas={deltas} teamId={team.id} />
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-base font-bold">{team.name}</p>
            {rank <= 3 && (
              <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold shadow-sm">
                {MEDALS[rank]}
              </span>
            )}
          </div>
          <ScoreNumber
            value={team.score}
            className="font-display text-4xl font-extrabold leading-tight"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          {[...new Set(settings.plusValues.filter((v) => v > 0))].map((inc) => (
            <button
              key={`plus-${inc}-${settings.plusValues.indexOf(inc)}`}
              onClick={() => adjustScore(team.id, inc)}
              className="flex-1 rounded-2xl bg-plus px-2 py-3 font-display text-xl font-extrabold text-plus-foreground shadow-lg shadow-plus/30 transition-transform duration-100 hover:brightness-110 active:scale-90"
            >
              +{inc}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[...new Set(settings.minusValues.filter((v) => v > 0))].map((inc) => (
            <button
              key={`minus-${inc}`}
              onClick={() => adjustScore(team.id, -inc)}
              className="flex-1 rounded-2xl bg-minus px-2 py-3 font-display text-xl font-extrabold text-minus-foreground shadow-lg shadow-minus/30 transition-transform duration-100 hover:brightness-110 active:scale-90"
            >
              −{inc}
            </button>
          ))}
        </div>
      </div>

      {manualOpen ? (
        <div className="mt-2.5 flex gap-2">
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitManual();
              if (e.key === "Escape") setManualOpen(false);
            }}
            aria-label={`Skor manual ${team.name}`}
            min={-999999}
            max={999999}
            placeholder={`Skor ${team.name}`}
            className="min-w-0 flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={submitManual}
            className="rounded-xl bg-theme px-4 py-2 text-sm font-bold text-theme-foreground shadow-md transition hover:brightness-110 active:scale-95"
          >
            Simpan
          </button>
          <button
            onClick={() => setManualOpen(false)}
            className="rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-sm transition hover:bg-white active:scale-95"
          >
            Batal
          </button>
        </div>
      ) : (
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => resetScore(team.id)}
            className="flex-1 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-sm transition hover:bg-white active:scale-95"
          >
            ⟲ Reset Skor
          </button>
          <button
            onClick={() => setManualOpen(true)}
            className="flex-1 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-foreground shadow-sm transition hover:bg-white active:scale-95"
          >
            ✎ Input Manual
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function OperatorPanel(props: {
  teams: Team[];
  settings: Settings;
  deltas: FloatingDelta[];
  adjustScore: (teamId: string, delta: number) => void;
  resetScore: (teamId: string) => void;
  setScore: (teamId: string, value: number) => void;
}) {
  const rankById = useMemo(() => {
    const sorted = rankTeams(props.teams);
    return new Map(sorted.map((t, i) => [t.id, i + 1]));
  }, [props.teams]);

  return (
    <section aria-label="Panel operator" className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Panel Operator</h2>
        <span className="h-px flex-1 bg-white/70" />
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
          {props.teams.length} Tim
        </span>
      </div>
      <div className="operator-cards">
      {props.teams.map((team) => (
        <OperatorCard
          key={team.id}
          team={team}
          settings={props.settings}
          rank={rankById.get(team.id) ?? 0}
          deltas={props.deltas}
          adjustScore={props.adjustScore}
          resetScore={props.resetScore}
          setScore={props.setScore}
        />
      ))}
      </div>
    </section>
  );
}

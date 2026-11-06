import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import confetti from "canvas-confetti";
import { DeltaLayer, ScoreNumber } from "./ScoreDisplay";
import Avatar from "./Avatar";
import { initialsOf, type Settings, type Team } from "@/lib/scoreboard";
import { rankTeams, type FloatingDelta } from "@/hooks/use-scoreboard";

const RANK_NAMES: Record<number, string> = {
  1: "PERINGKAT PERTAMA",
  2: "PERINGKAT KEDUA",
  3: "PERINGKAT KETIGA",
};

function WinnerCard({team, place, deltas}: {team: Team; place: number; deltas: FloatingDelta[]}) {
  const rankName = RANK_NAMES[place] ?? `PERINGKAT ${place}`;
  const scoreLength = String(team.score).length;
  return <motion.article
    layout
    key={team.id}
    transition={{type: "spring", stiffness: 140, damping: 24}}
    className={`podium-position place-${place}`}
    aria-label={`${team.name}, ${rankName.toLowerCase()}, ${team.score} poin`}
  >
    <div className="podium-card">
      {place === 1 && <span className="winner-crown" aria-hidden="true"><img src="/podium/crown.png" alt="" /></span>}
      <div className="podium-card-heading">
        <h3 title={team.name}>{team.name || "Tanpa nama"}</h3>
        <span>{rankName}</span>
      </div>
      <div className={`podium-photo ${team.logo ? "has-picture" : ""}`}>
        {team.logo
          ? <img src={team.logo} alt={`Foto atau logo ${team.name}`} />
          : <div className="podium-photo-placeholder" style={{"--team-accent": team.color} as CSSProperties} aria-hidden="true">
              <BookOpen size={85} strokeWidth={1.15} />
              <span>{initialsOf(team.name)}</span>
            </div>}
        <div className="podium-photo-shade" aria-hidden="true" />
        <div className={`podium-score ${scoreLength >= 6 ? "small-number" : ""}`}>
          <DeltaLayer deltas={deltas} teamId={team.id} />
          <ScoreNumber value={team.score} />
          <span className="points-label">POIN</span>
        </div>
      </div>
      <div className="podium-medal-bar" aria-hidden="true">
        <img className="podium-medal-art" src={`/podium/medal-${place}.png`} alt="" />
      </div>
    </div>
  </motion.article>;
}

export default function Leaderboard({ teams, deltas }: { teams: Team[]; settings: Settings; deltas: FloatingDelta[] }) {
  const ranked = useMemo(() => rankTeams(teams), [teams]);
  const previous = useRef(ranked[0]?.id);
  useEffect(() => {
    const leader = ranked[0];
    if (previous.current !== leader?.id && leader && (ranked.length === 1 || leader.score > (ranked[1]?.score ?? -Infinity))) {
      confetti({particleCount: 65, spread: 70, origin: {y: .45}, colors: ["#f6cb6b", "#e2a87a", "#f5e3b4"], disableForReducedMotion: true});
    }
    previous.current = leader?.id;
  }, [ranked]);
  const podium = [ranked[1], ranked[0], ranked[2]].filter((team): team is Team => !!team);

  return <section className="leaderboard" aria-label="Papan peringkat">
    <div className={`podium-lineup ${teams.length === 2 ? "two-teams" : ""}`}>
      {podium.map(team => <WinnerCard key={team.id} team={team} place={ranked.findIndex(t => t.id === team.id) + 1} deltas={deltas}/>)}
    </div>
    {ranked.length > 3 && <div className="other-teams" aria-label="Peringkat berikutnya">
      {ranked.slice(3).map((team,i) => <motion.div layout key={team.id} className="other-team">
        <span className="other-rank">{String(i+4).padStart(2,"0")}</span>
        <Avatar team={team}/>
        <h3 title={team.name}>{team.name}</h3>
        <div className="other-score"><DeltaLayer deltas={deltas} teamId={team.id}/><ScoreNumber value={team.score}/><span>POIN</span></div>
      </motion.div>)}
    </div>}
  </section>;
}

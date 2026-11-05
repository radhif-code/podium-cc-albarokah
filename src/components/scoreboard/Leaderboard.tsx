import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { DeltaLayer, ScoreNumber } from "./ScoreDisplay";
import Avatar from "./Avatar";
import { rankTeams, type FloatingDelta } from "@/hooks/use-scoreboard";
import type { Settings, Team } from "@/lib/scoreboard";

export default function Leaderboard({ teams, settings, deltas }: { teams: Team[]; settings: Settings; deltas: FloatingDelta[] }) {
  const ranked = useMemo(() => rankTeams(teams), [teams]);
  const previous = useRef(ranked[0]?.id);
  useEffect(() => {
    const leader = ranked[0];
    if (previous.current !== leader?.id && leader && leader.score > (ranked[1]?.score ?? 0)) {
      confetti({particleCount: 100, spread: 75, origin: {y: .45}, colors: ["#ffbe5b", "#ff9b88", "#c8b7f4", "#83d9dd"], disableForReducedMotion: true});
    }
    previous.current = leader?.id;
  }, [ranked]);
  const top = [ranked[1], ranked[0], ranked[2]].filter((t): t is Team => !!t);
  const denominator = settings.maxScore ?? Math.max(ranked[0]?.score ?? 0, 1);
  return <section className="leaderboard" aria-label="Papan peringkat">
    <div className="stage-section-title"><span /><Trophy size={17} /><h2>Podium Peringkat</h2><span /></div>
    <div className={`podium-lineup ${teams.length === 2 ? "two-teams" : ""}`}>
      {top.map(team => {
        const place = ranked.findIndex(t => t.id === team.id) + 1;
        return <motion.div layout key={team.id} transition={{type: "spring", stiffness: 140, damping: 24}} className={`podium-position place-${place}`}>
          <div className="podium-team glass">
            {place === 1 && <span className="winner-crown crown-float"><Crown size={33} fill="currentColor" strokeWidth={1.2} /></span>}
            <span className="team-place">{place === 1 ? "PERINGKAT PERTAMA" : place === 2 ? "PERINGKAT KEDUA" : "PERINGKAT KETIGA"}</span>
            <Avatar team={team} className="podium-avatar" />
            <h3 title={team.name}>{team.name || "Tanpa nama"}</h3>
            <div className="podium-score"><DeltaLayer deltas={deltas} teamId={team.id}/><ScoreNumber value={team.score}/></div>
            <span className="points-label">POIN</span>
            <div className="podium-progress"><motion.span initial={false} animate={{width: `${Math.max(0, Math.min(100, team.score / denominator * 100))}%`}} style={{background: team.color}}/></div>
          </div>
          <div className="podium-base"><span>{String(place).padStart(2,"0")}</span><i /></div>
        </motion.div>;
      })}
    </div>
    {ranked.length > 3 && <div className="other-teams">
      {ranked.slice(3).map((team,i) => <motion.div layout key={team.id} className="other-team glass-soft">
        <span className="other-rank">{String(i+4).padStart(2,"0")}</span><Avatar team={team}/><h3 title={team.name}>{team.name}</h3>
        <div className="other-score"><DeltaLayer deltas={deltas} teamId={team.id}/><ScoreNumber value={team.score}/><span>POIN</span></div>
      </motion.div>)}
    </div>}
  </section>;
}

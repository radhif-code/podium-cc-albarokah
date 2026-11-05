import { useEffect, useState } from "react";
import { initialsOf, type Team } from "@/lib/scoreboard";
export default function Avatar({ team, className = "" }: {team: Team; className?: string}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [team.logo]);
  return <span className={`team-avatar ${className}`} style={{"--team-color": team.color} as React.CSSProperties}>
    {team.logo && !failed ? <img src={team.logo} alt={team.name} onError={() => setFailed(true)} /> : <span>{initialsOf(team.name)}</span>}
  </span>;
}

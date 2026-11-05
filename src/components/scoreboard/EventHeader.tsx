import { Sparkles } from "lucide-react";
import type { Settings } from "@/lib/scoreboard";
export default function EventHeader({ settings }: { settings: Settings }) {
  const logos = settings.eventLogos.filter(logo => logo.src);
  return <header className="event-header">
    {logos.length > 0 ? <div className="event-logos">
      {logos.map(logo => <img key={logo.id} className={logo.id === "gemass" ? "event-logo-gemass" : ""} src={logo.src!} alt={logo.label} />)}
    </div> : <div className="event-wordmark"><Sparkles size={18} strokeWidth={1.8} /><span>GEMASS <b>•</b> DESA SRUNI</span></div>}
    <h1 className="title-gradient">{settings.competitionName || "CERDAS CERMAT"}</h1>
    <p className="event-location">{settings.location}</p>
    {settings.badgeText && <span className="event-badge"><span />{settings.badgeText}<span /></span>}
  </header>;
}

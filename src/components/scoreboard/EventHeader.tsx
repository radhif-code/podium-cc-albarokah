import type { Settings } from "@/lib/scoreboard";

/** Only the public-facing podium header changes; operator settings remain compatible. */
export default function EventHeader({ settings }: { settings: Settings }) {
  const ldii = settings.eventLogos.find(item => item.id === "ldii");
  const ppg = settings.eventLogos.find(item => item.id === "ppg");
  const wordmark = settings.eventLogos.find(item => item.id === "gemass");
  const wordmarkSrc = wordmark?.src === "/logos/logo-gemass.png"
    ? "/logos/logo-gemass-transparent.png"
    : wordmark?.src;
  const name = (settings.competitionName.trim() || "CERDAS CERMAT").toUpperCase();
  const heading = name.startsWith("LOMBA ") ? name : `LOMBA ${name}`;

  return <header className="event-header">
    <div className="institution-logo-bar" aria-label="Logo penyelenggara">
      <img src="/logos/logo-sekolah.png" alt="Logo lembaga" />
      {ldii?.src && <img src={ldii.src} alt={ldii.label} />}
      {ppg?.src && <img src={ppg.src} alt={ppg.label} />}
    </div>
    <div className="gemass-wordmark">
      {wordmarkSrc
        ? <img src={wordmarkSrc} alt={wordmark?.label || "GEMASS – Gema Anak Sholih Sholihah"} />
        : <div className="gemass-wordmark-text">GEMASS<small>{settings.badgeText}</small></div>}
    </div>
    <h1>{heading}</h1>
    <div className="final-ribbon"><span>GRAND FINAL</span></div>
    <p className="event-location">{settings.location}</p>
  </header>;
}

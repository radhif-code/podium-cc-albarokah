import { CirclePlay, Timer, X } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import type { Scoreboard } from "@/hooks/use-scoreboard";
export default function TimerPanel({ sb }: {sb: Scoreboard}) {
  const remaining = useCountdown(sb.timer);
  return <section className={`timer-control glass ${remaining ? "is-running" : ""}`} aria-label="Kontrol timer">
    <div className="section-heading"><span className="section-icon"><Timer size={20}/></span><div><h2>Waktu menjawab</h2><p>Mulai setelah soal selesai dibacakan.</p></div><span className="small-badge">OVERLAY</span></div>
    <div className="timer-control-face"><strong aria-live="polite">0{remaining || 5}<span>detik</span></strong><div><span className={`timer-status ${remaining ? "active" : ""}`}><i/>{remaining ? "Sedang berjalan" : sb.timer.endsAt ? "Waktu habis" : "Siap dimulai"}</span><p>{remaining ? "Hitung mundur tampil di atas podium." : "Podium tampil tanpa timer sampai dimulai."}</p></div></div>
    <div className="timer-actions"><button className="primary-button" onClick={sb.startTimer} disabled={remaining > 0}><CirclePlay size={20}/>{remaining ? "Timer berjalan…" : "Mulai 5 detik"}</button><button className="secondary-button" onClick={sb.cancelTimer} disabled={remaining === 0}><X size={18}/>Batalkan</button></div>
    <p className="timer-note">Timer hilang otomatis saat 5 detik berakhir.</p>
  </section>;
}

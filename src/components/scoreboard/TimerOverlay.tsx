import { Timer } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import type { TimerState } from "@/lib/shared-state";
export default function TimerOverlay({ timer }: {timer: TimerState}) {
  const remaining = useCountdown(timer);
  if (remaining <= 0) return null;
  return <div className={`timer-overlay ${remaining <= 2 ? "timer-urgent" : ""}`} role="timer" aria-label={`Waktu menjawab ${remaining} detik`}>
    <div className="countdown-panel"><span className="countdown-label"><Timer size={20}/>WAKTU MENJAWAB</span>
      <div className="countdown-ring"><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="109"/><circle key={timer.runId} className="countdown-stroke" cx="120" cy="120" r="109" style={{strokeDashoffset: 685 * (1 - Math.max(0, Math.min(1, ((timer.endsAt ?? 0) - Date.now()) / 5000)))}}/></svg><strong key={remaining}>{remaining}</strong></div>
      <span className="countdown-unit">DETIK</span><p>Silakan menjawab</p>
    </div>
  </div>;
}

import { useEffect, useState } from "react";
import { remainingSeconds, type TimerState } from "@/lib/shared-state";
export function useCountdown(timer: TimerState) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (remainingSeconds(timer) === 0) return;
    const id = window.setInterval(() => {
      tick(v => v + 1);
      if (remainingSeconds(timer) === 0) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [timer.endsAt, timer.runId]);
  return remainingSeconds(timer);
}

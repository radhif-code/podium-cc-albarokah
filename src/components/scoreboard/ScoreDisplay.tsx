import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FloatingDelta } from "@/hooks/use-scoreboard";

/** Smoothly counts toward the target value instead of jumping. */
export function useCountUp(value: number, duration = 550): number {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

export function ScoreNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const display = useCountUp(value);
  return (
    <span className={`tabular-nums ${className}`} aria-live="polite">
      {display}
    </span>
  );
}

/** Floating green/red +N / -N animation shown over a score. */
export function DeltaLayer({
  deltas,
  teamId,
}: {
  deltas: FloatingDelta[];
  teamId: string;
}) {
  const mine = deltas.filter((d) => d.teamId === teamId);
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      <AnimatePresence>
        {mine.map((d) => (
          <motion.span
            key={d.id}
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: -64, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, times: [0, 0.12, 0.7, 1], ease: "easeOut" }}
            className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-full px-2 py-0.5 font-display text-lg font-extrabold drop-shadow-sm ${
              d.value > 0 ? "bg-plus/15 text-plus" : "bg-minus/15 text-minus"
            }`}
          >
            {d.value > 0 ? `+${d.value}` : `${d.value}`}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

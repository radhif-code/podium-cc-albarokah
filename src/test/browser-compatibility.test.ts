import { describe, expect, it, vi } from "vitest";
import { changeScore, createDefaultState, startTimer } from "@/lib/shared-state";
describe("HTTP localhost and projector browser compatibility", () => {
  it("can score and start a timer when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});
    try {
      const scored = changeScore(createDefaultState(), "t1", 50, "adjust");
      expect(scored.teams[0]?.score).toBe(50);
      expect(startTimer(scored).timer.runId).toBeTruthy();
    } finally {vi.unstubAllGlobals();}
  });
});

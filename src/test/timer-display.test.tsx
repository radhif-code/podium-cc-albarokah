import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TimerOverlay from "@/components/scoreboard/TimerOverlay";
beforeEach(() => {vi.useFakeTimers();vi.setSystemTime(1000);});
afterEach(() => {cleanup();vi.useRealTimers();});
describe("projector timer", () => {
  it("stays invisible before the operator starts it", () => {
    render(<TimerOverlay timer={{endsAt:null,runId:null}}/>);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
  it("counts 5 to 1 and removes the entire overlay at five seconds", () => {
    render(<TimerOverlay timer={{endsAt:6000,runId:"question-one"}}/>);
    expect(screen.getByRole("timer")).toHaveAccessibleName("Waktu menjawab 5 detik");
    for(let seconds = 4;seconds>=1;seconds--) {
      act(() => {vi.advanceTimersByTime(1000);});
      expect(screen.getByRole("timer")).toHaveAccessibleName(`Waktu menjawab ${seconds} detik`);
    }
    act(() => {vi.advanceTimersByTime(1000);});
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
  it("uses remaining time after a refresh and can be cancelled", () => {
    vi.setSystemTime(4000);
    const {rerender} = render(<TimerOverlay timer={{endsAt:6000,runId:"question-one"}}/>);
    expect(screen.getByRole("timer")).toHaveAccessibleName("Waktu menjawab 2 detik");
    rerender(<TimerOverlay timer={{endsAt:null,runId:null}}/>);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
});

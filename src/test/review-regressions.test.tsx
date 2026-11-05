import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { useScoreboard } from "@/hooks/use-scoreboard";
import { createDefaultState, decodeState, STORAGE_KEY, undoScore } from "@/lib/shared-state";
beforeEach(() => {localStorage.clear(); window.history.replaceState({}, "", "/");});
afterEach(() => {cleanup();vi.useRealTimers();vi.restoreAllMocks();});
describe("review regressions", () => {
  it("hides display controls after activating fullscreen", async () => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, "requestFullscreen", {configurable:true, value:vi.fn().mockResolvedValue(undefined)});
    const {container} = render(<App/>);
    const button = screen.getByRole("button", {name:"Fullscreen podium"});
    await act(async () => {button.focus();fireEvent.click(button);});
    act(() => {vi.advanceTimersByTime(2600);});
    expect(container.querySelector(".podium-view")).not.toHaveClass("show-controls");
  });
  it("finishes an asynchronous logo upload without overwriting a newer label", () => {
    const {result} = renderHook(useScoreboard);
    const finishUpload = () => result.current.updateEventLogo("gemass", {src:"data:image/png;base64,aGVsbG8="});
    const latest = createDefaultState(); latest.settings.eventLogos[1]!.label = "Nama terbaru";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));
    act(finishUpload);
    expect(result.current.settings.eventLogos[1]?.label).toBe("Nama terbaru");
    expect(result.current.settings.eventLogos[1]?.src).toContain("data:image/png");
  });
  it("enforces the cap when loading or undoing imported history", () => {
    const data = createDefaultState(); data.settings.maxScore = 75;data.teams[0]!.score = 400;
    data.history.push({id:"history", teamId:"t1",teamName:"Test",before:500,after:400,at:1000});
    const decoded = decodeState(JSON.stringify(data))!;
    expect(decoded.teams[0]?.score).toBe(75);
    expect(undoScore(decoded).teams[0]?.score).toBe(75);
  });
});

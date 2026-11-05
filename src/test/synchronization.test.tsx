import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScoreboard } from "@/hooks/use-scoreboard";
import { createDefaultState, STORAGE_KEY } from "@/lib/shared-state";

beforeEach(() => {localStorage.clear();});
afterEach(() => {cleanup(); vi.restoreAllMocks();});
describe("operator synchronization", () => {
  it("retains every fast score click", () => {
    const {result} = renderHook(useScoreboard);
    act(() => {for(let i=0;i<10;i++) result.current.adjustScore("t1",50);});
    expect(result.current.teams[0]?.score).toBe(500);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).teams[0].score).toBe(500);
  });
  it("receives audience updates without writing them back", () => {
    const {result} = renderHook(useScoreboard);
    const remote = createDefaultState(); remote.teams[1]!.score = 250;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    const writes = vi.spyOn(Storage.prototype,"setItem");
    act(() => window.dispatchEvent(new StorageEvent("storage", {key:STORAGE_KEY,newValue:JSON.stringify(remote)})));
    expect(result.current.teams[1]?.score).toBe(250);
    expect(writes).not.toHaveBeenCalled();
  });
  it("reads the newest stored score before editing another team", () => {
    const {result} = renderHook(useScoreboard);
    const remote = createDefaultState(); remote.teams[1]!.score = 250;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    act(() => result.current.adjustScore("t1",50));
    expect(result.current.teams[1]?.score).toBe(250);
    expect(result.current.teams[0]?.score).toBe(50);
  });
  it("reports failed persistence and keeps the previous score", () => {
    const {result} = renderHook(useScoreboard);
    vi.spyOn(Storage.prototype,"setItem").mockImplementation(() => {throw new DOMException("full","QuotaExceededError");});
    act(() => result.current.adjustScore("t1",50));
    expect(result.current.teams[0]?.score).toBe(0);
    expect(result.current.error).toContain("belum tersimpan");
  });
  it("hydrates a saved scoreboard without resetting it on mount", () => {
    const data = createDefaultState(); data.teams[0]!.score = 300;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const writes = vi.spyOn(Storage.prototype,"setItem");
    const {result} = renderHook(useScoreboard);
    expect(result.current.teams[0]?.score).toBe(300);
    expect(writes).not.toHaveBeenCalled();
  });
});

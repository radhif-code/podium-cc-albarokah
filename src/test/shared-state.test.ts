import { describe, expect, it } from "vitest";
import { createDefaultState, decodeState, changeScore, undoScore, remainingSeconds, startTimer } from "@/lib/shared-state";

describe("shared scoreboard state", () => {
  it("applies repeated clicks to the latest score and supports undo", () => {
    let state = createDefaultState();
    state = changeScore(state, "t1", 50, "adjust");
    state = changeScore(state, "t1", 50, "adjust");
    expect(state.teams[0]?.score).toBe(100);
    expect(undoScore(state).teams[0]?.score).toBe(50);
  });
  it("supports negative scores and configured maximum without accepting invalid numbers", () => {
    const state = createDefaultState();
    state.settings.maxScore = 75;
    expect(changeScore(state, "t1", 100, "adjust").teams[0]?.score).toBe(75);
    expect(changeScore(state, "t1", -50, "adjust").teams[0]?.score).toBe(-50);
    expect(changeScore(state, "t1", NaN, "set")).toEqual(state);
  });
  it("keeps negative scores, initial scores and history through serialization, then undoes a penalty", () => {
    let state = createDefaultState();
    state.teams[0]!.initialScore = -125;
    state = changeScore(state, "t1", -50, "adjust");
    state = changeScore(state, "t1", -25, "adjust");
    expect(state.teams[0]?.score).toBe(-75);
    const reloaded = decodeState(JSON.stringify(state))!;
    expect(reloaded.teams[0]?.initialScore).toBe(-125);
    expect(reloaded.teams[0]?.score).toBe(-75);
    expect(reloaded.history.map(x => x.after)).toEqual([-50,-75]);
    expect(undoScore(reloaded).teams[0]?.score).toBe(-50);
  });
  it("bounds negative scores at the technical negative limit, while preserving maxScore cap", () => {
    let state = createDefaultState();
    state.settings.maxScore = 90;
    state = changeScore(state, "t1", -1500000, "set");
    expect(state.teams[0]?.score).toBe(-999999);
    expect(changeScore(state, "t1", 2000000, "adjust").teams[0]?.score).toBe(90);
  });
  it("migrates the original project without missing image URLs", () => {
    const result = decodeState(JSON.stringify({settings:{competitionName:"Lomba Lama"},teams:[
      {id:"a",name:"A",score:120,logo:"/logos/team-ldii.png"},
      {id:"b",name:"B",score:-2},
    ]}));
    expect(result?.settings.competitionName).toBe("Lomba Lama");
    expect(result?.settings.eventLogos).toHaveLength(3);
    expect(result?.teams[0]?.score).toBe(120);
    expect(result?.teams[0]?.logo).toBeNull();
    expect(result?.teams[1]?.score).toBe(-2);
  });
  it("rejects malformed backups, duplicate IDs and corrupted storage", () => {
    expect(decodeState("invalid JSON")).toBeNull();
    expect(decodeState('{"teams":[]}')).toBeNull();
    const data = createDefaultState();
    data.teams[1]!.id = data.teams[0]!.id;
    expect(decodeState(JSON.stringify(data))).toBeNull();
  });
  it("uses an absolute five-second deadline and disappears exactly when expired", () => {
    const state = startTimer(createDefaultState(), 1000);
    expect(state.timer.endsAt).toBe(6000);
    expect(remainingSeconds(state.timer, 1000)).toBe(5);
    expect(remainingSeconds(state.timer, 2000)).toBe(4);
    expect(remainingSeconds(state.timer, 5999)).toBe(1);
    expect(remainingSeconds(state.timer, 6000)).toBe(0);
    expect(remainingSeconds(state.timer, 9000)).toBe(0);
    expect(remainingSeconds(createDefaultState().timer, 1000)).toBe(0);
  });
  it("preserves running timer and logo after reloading serialized state", () => {
    const state = startTimer(createDefaultState(), Date.now());
    state.settings.eventLogos[0]!.src = "data:image/png;base64,aGVsbG8=";
    const loaded = decodeState(JSON.stringify(state));
    expect(loaded?.timer.endsAt).toBe(state.timer.endsAt);
    expect(loaded?.settings.eventLogos[0]?.src).toBe(state.settings.eventLogos[0]?.src);
  });
});

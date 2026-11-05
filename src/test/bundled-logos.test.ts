import { describe, expect, it } from "vitest";
import { createDefaultState, decodeState } from "@/lib/shared-state";
describe("three supplied event logos", () => {
  it("includes only LDII, GEMASS and PPG as ready-to-use defaults", () => {
    const state = createDefaultState();
    expect(state.settings.eventLogos.map(x => x.id)).toEqual(["ldii","gemass","ppg"]);
    expect(state.settings.eventLogos.map(x => x.src)).toEqual(["/logos/ldii.png","/logos/logo-gemass.png","/logos/logo-ppg.png"]);
  });
  it("adds the supplied logos to old saved settings without resetting scores", () => {
    const old = createDefaultState() as any;
    delete old.settings.eventLogoRevision;
    old.settings.eventLogos = ["ldii","gemass","ppg","event"].map(id => ({id,label:id,src:null}));
    old.teams[0].score = 350;
    const next = decodeState(JSON.stringify(old))!;
    expect(next.teams[0]?.score).toBe(350);
    expect(next.settings.eventLogos.map(x=>x.src)).toEqual(["/logos/ldii.png","/logos/logo-gemass.png","/logos/logo-ppg.png"]);
  });
  it("keeps bundled image paths after serialization and preserves later logo removal", () => {
    const state = createDefaultState();
    expect(decodeState(JSON.stringify(state))?.settings.eventLogos[1]?.src).toBe("/logos/logo-gemass.png");
    state.settings.eventLogos[0]!.src = null;
    expect(decodeState(JSON.stringify(state))?.settings.eventLogos[0]?.src).toBeNull();
  });
});

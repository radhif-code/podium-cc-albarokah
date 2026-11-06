import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "@/App";
import { createDefaultState, STORAGE_KEY } from "@/lib/shared-state";

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});
afterEach(cleanup);

describe("GEMASS Grand Final public podium", () => {
  it("shows the requested event identity and three genuine organization logos", () => {
    render(<App/>);
    expect(screen.getByRole("heading", {name: "LOMBA CERDAS CERMAT"})).toBeInTheDocument();
    expect(screen.getByText("GRAND FINAL")).toBeInTheDocument();
    expect(screen.getByText("SRUNI AL BAROKAH")).toBeInTheDocument();
    const logos = document.querySelectorAll(".podium-view .institution-logo-bar img");
    expect(logos).toHaveLength(3);
    expect((logos[0] as HTMLImageElement).src).toContain("/logos/logo-sekolah.png");
    expect((logos[1] as HTMLImageElement).src).toContain("/logos/ldii.png");
    expect((logos[2] as HTMLImageElement).src).toContain("/logos/logo-ppg.png");
    expect(document.querySelector(".podium-view .gemass-wordmark img")?.getAttribute("src")).toBe("/logos/logo-gemass-transparent.png");
  });
  it("renders larger gold first-place, smaller silver second-place and bronze third-place cards", () => {
    render(<App/>);
    const podium = screen.getByRole("region", {name:"Papan peringkat"});
    expect(podium.querySelectorAll(".podium-position.place-1")).toHaveLength(1);
    expect(podium.querySelectorAll(".podium-position.place-2")).toHaveLength(1);
    expect(podium.querySelectorAll(".podium-position.place-3")).toHaveLength(1);
    expect(podium.querySelector(".place-1 .winner-crown")).toBeInTheDocument();
    expect(podium.querySelector(".place-2 .winner-crown")).not.toBeInTheDocument();
    expect(podium.querySelector(".place-3 .winner-crown")).not.toBeInTheDocument();
  });
  it("displays a negative score from saved browser state", () => {
    const state = createDefaultState();
    state.teams[0]!.score = -25;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render(<App/>);
    expect(screen.getByRole("region", {name:"Papan peringkat"})).toHaveTextContent("-25");
  });
  it("keeps the existing operator UI on its separate route", () => {
    window.history.replaceState({}, "", "/?view=operator");
    render(<App/>);
    const panel = screen.getByRole("region", {name:"Panel operator"});
    expect(within(panel).getByText("Panel Operator")).toBeInTheDocument();
    expect(screen.getByRole("button", {name:/Pengaturan/i})).toBeInTheDocument();
    expect(document.querySelector(".operator-view .scene")).toBeInTheDocument();
    expect(document.querySelector(".operator-view .cosmic-scene")).not.toBeInTheDocument();
  });
});

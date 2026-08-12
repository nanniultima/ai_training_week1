import { describe, expect, it } from "vitest";

import { getChordNotes } from "./chordNotes.js";

describe("getChordNotes skeleton", () => {
  it("ilmoittaa, ettei toimintoa ole vielä toteutettu", () => {
    expect(() => getChordNotes({ chord: "C" })).toThrow("not implemented");
  });
});

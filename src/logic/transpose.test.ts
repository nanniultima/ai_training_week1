import { describe, expect, it } from "vitest";

import { transposeMusic } from "./transpose.js";

describe("transposeMusic skeleton", () => {
  it("ilmoittaa, ettei toimintoa ole vielä toteutettu", () => {
    expect(() => transposeMusic({ input: "| C | G |", step: 2 })).toThrow(
      "not implemented",
    );
  });
});

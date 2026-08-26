import { describe, expect, it } from "vitest";

import { renderLineNumbers, toVisibleLineNumber } from "./lineNumbers.js";

describe("line numbers", () => {
  it("AC19 numeroi LF-loogiset rivit", () => {
    expect(renderLineNumbers("Kertosäe\nC |G |\nonpa")).toEqual(["1", "2", "3"]);
  });

  it("AC20 laskee vain loogiset rivit", () => {
    expect(renderLineNumbers("yksi erittäin pitkä looginen rivi")).toEqual(["1"]);
  });

  it("AC21 muuntaa indeksin näkyväksi numeroksi", () => {
    expect(toVisibleLineNumber(2)).toBe(3);
  });
});

import { describe, expect, it } from "vitest";

import { classifyLines } from "./classifyLines.js";
import type { FormattedTextSegment, InputLine } from "../types.js";

const segment = (text: string): FormattedTextSegment => ({
  text,
  bold: false,
  italic: false,
});

const line = (text: string): InputLine => ({ segments: [segment(text)] });

describe("classifyLines", () => {
  it("AC1 säilyttää tyhjemerkkirivin musiikkisyötteessä", () => {
    const whitespaceLine = line("   ");

    const result = classifyLines([whitespaceLine, line("C |G |")]);

    expect(result.lines[0]).toEqual({
      index: 0,
      type: "empty",
      content: "   ",
      segments: whitespaceLine.segments,
    });
  });

  it("AC2 antaa putken ratkaista sointurivin", () => {
    const chordLine = line("intro | C | tuntematon x2");

    const result = classifyLines([chordLine]);

    expect(result).toEqual({
      lines: [
        {
          index: 0,
          type: "chord",
          content: "intro | C | tuntematon x2",
          segments: chordLine.segments,
        },
      ],
      warnings: [],
    });
  });

  it("AC3 tunnistaa tuetut sävelryhmät", () => {
    const noteLine = line("c Gb gb GB gB G#C abC h H BH");
    const result = classifyLines([noteLine]);

    expect(result.lines[0]).toEqual({
      index: 0,
      type: "note",
      content: "c Gb gb GB gB G#C abC h H BH",
      segments: noteLine.segments,
    });
    expect(result.warnings).toEqual([]);
  });

  it("AC4 hyväksyy täsmälliset toistomerkinnät", () => {
    const result = classifyLines([line("c c g g x2 x10")]);

    expect(result.lines[0]?.type).toBe("note");
    expect(result.warnings).toEqual([]);
  });

  it("AC5 hyväksyy tiukan yhdysmerkkierottimen", () => {
    const result = classifyLines([line("G#C - abC")]);

    expect(result.lines[0]?.type).toBe("note");
    expect(result.lines[0]?.content).toBe("G#C - abC");
  });

  it("AC6 hylkää virheelliset yhdysmerkkimuodot note-luokasta", () => {
    for (const content of ["c-d", "- c", "c -", "c -- d", "c - x2"]) {
      const result = classifyLines([line(content), line("C |G |")]);
      expect(result.lines[0]?.type, content).toBe("text");
    }
  });

  it("AC7 hylkää useat etumerkit note-luokasta", () => {
    for (const content of ["C##", "Cbb", "Cb#"]) {
      const result = classifyLines([line(content), line("C |G |")]);
      expect(result.lines[0]?.type, content).toBe("text");
    }
  });

  it("AC8 hylkää virheelliset toistomerkinnät note-luokasta", () => {
    for (const content of ["x2", "c x0", "c x01", "c X2", "c x+2"]) {
      const result = classifyLines([line(content), line("C |G |")]);
      expect(result.lines[0]?.type, content).toBe("text");
    }
  });

  it("AC9 tunnistaa laulunsanat ilman varoitusta", () => {
    const result = classifyLines([line("C |G |"), line("onpa i-hanaa laulella sateessa")]);

    expect(result.lines[1]?.type).toBe("text");
    expect(result.warnings).toEqual([]);
  });

  it("AC10 pitää cafe-sanan tekstinä", () => {
    const result = classifyLines([line("C |G |"), line("cafe")]);

    expect(result.lines[1]?.type).toBe("text");
    expect(result.warnings).toEqual([]);
  });

  it("AC11 palauttaa täsmällisen epäselvyysvaroituksen", () => {
    const content = "C D lauletaan hiljaa";
    const result = classifyLines([line("C |G |"), line(content)]);

    expect(result.lines[1]?.type).toBe("text");
    expect(result.warnings).toEqual([
      { code: "AMBIGUOUS_NOTE_LINE", lineIndex: 1, content },
    ]);
  });

  it("AC12 säilyttää järjestyksen indeksit ja tyhjät rivit", () => {
    const result = classifyLines([line("C |G |"), line("c d"), line("onpa"), line(""), line("Am |F |")]);

    expect(result.lines.map(({ index }) => index)).toEqual([0, 1, 2, 3, 4]);
    expect(result.lines.map(({ type }) => type)).toEqual(["chord", "note", "text", "empty", "chord"]);
  });

  it("AC13 hyväksyy musiikkia sisältävät tyyppiyhdistelmät", () => {
    const inputs = [
      [line("C |")],
      [line("c d")],
      [line("C |"), line("sanat")],
      [line("c d"), line("sanat")],
      [line("C |"), line("c d")],
    ];

    for (const input of inputs) expect(() => classifyLines(input)).not.toThrow();
  });

  it("AC14 hylkää tyhjän rivilistan", () => {
    expect(() => classifyLines([])).toThrow("Syöte ei saa olla tyhjä");
  });

  it("AC15 hylkää syötteen ilman musiikkia", () => {
    expect(() => classifyLines([
      line("onpa ihanaa"),
      { segments: [] },
      line("laulella sateessa"),
    ])).toThrow("Syötteestä ei löytynyt sointu- tai sävelrivejä");
  });

  it("AC16 säilyttää segmentit ja fonttikoon", () => {
    const segments: readonly FormattedTextSegment[] = [
      { text: "C", bold: true, italic: false, fontSizePx: 18 },
      { text: " |", bold: false, italic: false },
      { text: "G |", bold: false, italic: true },
    ];
    const result = classifyLines([{ segments }]);

    expect(result.lines[0]?.content).toBe("C |G |");
    expect(result.lines[0]?.segments).toEqual(segments);
  });

  it("AC17 ei validoi fonttikokoa", () => {
    const segments: readonly FormattedTextSegment[] = [
      { text: "C |", bold: false, italic: false, fontSizePx: -1 },
    ];
    const result = classifyLines([{ segments }]);

    expect(result.lines[0]?.type).toBe("chord");
    expect(result.lines[0]?.segments[0]?.fontSizePx).toBe(-1);
  });

  it("AC18 ei hyväksy sarkainta note-erottimeksi", () => {
    const result = classifyLines([line("C |G |"), line("c\td")]);
    expect(result.lines[1]?.type).toBe("text");
  });

  it("note-transposition parseriregressio hyväksyy enharmoniset lähtönimet", () => {
    expect(classifyLines([line("Cb B# Fb E# H# Hb")]).lines[0]?.type).toBe("note");
  });

  it("AC25 hyväksyy useat kohdistusvälit sävelrivillä", () => {
    const content = "c c  a a a   gB g  g  c d   c";
    const result = classifyLines([line(content)]);

    expect(result.lines[0]?.type).toBe("note");
    expect(result.lines[0]?.content).toBe(content);
    expect(result.warnings).toEqual([]);
  });

  it.each(["c# ", " c#"])(
    "AC26 hyväksyy sävelrivin ympäröivät ASCII-välit: %j",
    (content) => {
      const result = classifyLines([line(content)]);

      expect(result.lines[0]?.type).toBe("note");
      expect(result.lines[0]?.content).toBe(content);
      expect(result.warnings).toEqual([]);
    },
  );

  it("AC27 hyväksyy ylennyksen jälkeisen B-sävelen ryhmässä", () => {
    const content = "g# c#b a";
    const result = classifyLines([line(content)]);

    expect(result.lines[0]?.type).toBe("note");
    expect(result.lines[0]?.content).toBe(content);
    expect(result.warnings).toEqual([]);
  });
});

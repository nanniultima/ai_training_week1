import { describe, expect, it } from 'vitest';
import type { ClassifiedLine, MusicResultLine } from '../types.js';
import { groupAlignedLines } from './groupAlignedLines.js';
import { collectAlignmentAnchors } from './alignLineGroup.js';

const plain = (text: string) => ({ text, bold: false, italic: false });
const input = (index: number, type: ClassifiedLine['type'], content: string): ClassifiedLine => ({ index, type, content, segments: [plain(content)] });
const chordResult: MusicResultLine = { index: 0, type: 'chord', content: 'C    |Am     |G       |C      |', segments: [], warnings: [], tokens: [
  { type: 'chord', text: 'C', sourceRange: { start: 0, end: 1 } },
  { type: 'pipe', text: '|', sourceRange: { start: 5, end: 6 } },
  { type: 'chord', text: 'Am', sourceRange: { start: 6, end: 8 } },
] };
const noteResult: MusicResultLine = { index: 1, type: 'note', content: 'C C  A A A   GB G  G  C D   C', parts: [
  { type: 'noteGroup', notes: [{ name: 'C', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
] };

describe('groupAlignedLines', () => {
  it('AC50: sointu melodian jälkeen aloittaa uuden ryhmän', () => {
    const rows = [input(0, 'text', 'alku'), input(1, 'note', 'c'), input(2, 'chord', 'C |'),
      input(3, 'note', 'c'), input(4, 'text', 'loppu')];
    const n1 = { ...noteResult, index: 1 }, c2 = { ...chordResult, index: 2 }, n3 = { ...noteResult, index: 3 };
    expect(groupAlignedLines(rows, [n1, c2, n3])).toEqual([
      rows[0], { note: n1 }, { chord: c2, note: n3, text: rows[4] },
    ]);
  });
  it('AC49: uusi musiikki ei kohdistu edellisiin sanoihin', () => {
    const rows = [input(0, 'chord', 'C |'), input(1, 'note', 'c'), input(2, 'text', 'eka'),
      input(3, 'note', 'c'), input(4, 'text', 'toka'), input(5, 'chord', 'C |'), input(6, 'text', 'kolmas')];
    const c0 = { ...chordResult, index: 0 }, n1 = { ...noteResult, index: 1 };
    const n3 = { ...noteResult, index: 3 }, c5 = { ...chordResult, index: 5 };
    expect(groupAlignedLines(rows, [c0, n1, n3, c5])).toEqual([
      { chord: c0, note: n1, text: rows[2] }, { note: n3, text: rows[4] }, { chord: c5, text: rows[6] },
    ]);
  });
  it('AC1: ryhmittelee kokonaisen lähtöesimerkin', () => {
    const grouped = groupAlignedLines([
      input(0, 'chord', 'C    |Am     |G       |C      |'),
      input(1, 'note', 'c c  a a a   gB g  g  c d   c'),
      input(2, 'text', 'onpa i-hanaa laulella sateessa'),
    ], [chordResult, noteResult]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toMatchObject({ chord: { index: 0, type: 'chord' }, note: { index: 1, type: 'note' }, text: { index: 2, type: 'text' } });
  });
  it('AC24: säilyttää edeltävän tekstin suorana identiteettinä', () => {
    const chordAtOne = { ...chordResult, index: 1, content: 'C |' };
    const grouped = groupAlignedLines([
      input(0, 'text', 'Ohje'), input(1, 'chord', 'C |'), input(2, 'text', 'laula'),
    ], [chordAtOne]);
    expect(grouped[0]).toEqual({ index: 0, type: 'text', content: 'Ohje', segments: [plain('Ohje')] });
    expect(grouped[1]).toMatchObject({ chord: { index: 1 }, text: { index: 2 } });
  });
  it('AC25: ryhmittelee chord-note-text-rivit', () => {
    const grouped = groupAlignedLines([
      input(0, 'chord', 'C |'), input(1, 'note', 'c'), input(2, 'text', 'laula'),
    ], [chordResult, noteResult]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toMatchObject({ chord: { index: 0 }, note: { index: 1 }, text: { index: 2 } });
  });
  it('AC26: katkaisee ryhmät täsmällisesti', () => {
    const grouped = groupAlignedLines([
      input(0, 'chord', 'C |'), input(1, 'note', 'c'), input(2, 'note', 'd'), input(3, 'empty', ''), input(4, 'chord', 'G |'),
    ], [chordResult, noteResult, { ...noteResult, index: 2 }, { ...chordResult, index: 4 }]);
    expect(grouped).toHaveLength(4);
    expect(grouped[0]).toMatchObject({ chord: { index: 0 }, note: { index: 1 } });
    expect(grouped[1]).toMatchObject({ note: { index: 2 } });
    expect(grouped[2]).toEqual({ index: 3, type: 'empty', content: '' });
    expect(grouped[3]).toMatchObject({ chord: { index: 4 } });
  });
  it('AC27: säilyttää text- ja empty-identiteetit järjestyksessä', () => {
    const grouped = groupAlignedLines([
      input(0, 'chord', 'C |'), input(3, 'text', 'Ohje'), input(4, 'empty', '   '),
    ], [chordResult]);
    expect(grouped[1]).toEqual({ index: 3, type: 'text', content: 'Ohje', segments: [plain('Ohje')] });
    expect(grouped[2]).toEqual({ index: 4, type: 'empty', content: '' });
  });
  it('AC29: hyväksyy text-only- ja empty-only-syötteet', () => {
    expect(groupAlignedLines([input(0, 'text', 'onpa')], [])).toEqual([
      { index: 0, type: 'text', content: 'onpa', segments: [plain('onpa')] },
    ]);
    expect(groupAlignedLines([input(0, 'empty', '   ')], [])).toEqual([
      { index: 0, type: 'empty', content: '' },
    ]);
  });
  it('AC30: hylkää sarkaimen kaikkialta', () => {
    expect(() => groupAlignedLines([input(0, 'chord', 'C\t|G |')], [chordResult])).toThrow('Kohdistettava syöte ei saa sisältää sarkainmerkkejä');
    expect(() => groupAlignedLines([input(0, 'text', 'Ohje\tnyt')], [])).toThrow('Kohdistettava syöte ei saa sisältää sarkainmerkkejä');
  });
  it('AC31: hylkää puuttuvan tuloksen', () => {
    expect(() => groupAlignedLines([input(2, 'chord', 'C |')], [])).toThrow('Riviltä 2 puuttuu transponointitulos');
  });
  it('AC32: hylkää ylimääräisen tuloksen', () => {
    expect(() => groupAlignedLines([input(0, 'chord', 'C |')], [chordResult, { ...chordResult, index: 4 }])).toThrow('Rivillä 4 on ylimääräinen transponointitulos');
  });
  it('AC33: hylkää väärän tulostyypin', () => {
    expect(() => groupAlignedLines([input(2, 'chord', 'C |')], [{ ...noteResult, index: 2 }])).toThrow('Rivin 2 transponointituloksen tyyppi note ei vastaa alkuperäistä tyyppiä chord');
  });
  it('AC34: hylkää puuttuvat lähdealueet', () => {
    for (const type of ['chord', 'suspiciousChord', 'pipe'] as const) {
      const result = { ...chordResult, tokens: [{ type, text: type === 'pipe' ? '|' : 'C' }] };
      expect(() => groupAlignedLines([input(0, 'chord', 'C |')], [result])).toThrow('Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti');
    }
    const result = { ...noteResult, parts: [{ type: 'noteGroup' as const, notes: [{ name: 'C', register: 3 as const }] }] };
    expect(() => groupAlignedLines([input(1, 'note', 'c')], [result])).toThrow('Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti');
  });
  it('AC36: validoi sarkaimen tulosvastaavuutta ja lähdealueita ennen', () => {
    const chordAtOne = { ...chordResult, index: 1 };
    const noteWithoutRange = { ...noteResult, index: 2, parts: [{ type: 'noteGroup' as const, notes: [{ name: 'C', register: 3 as const }] }] };
    const withTab = [input(0, 'text', 'Ohje\tnyt'), input(1, 'chord', 'C |'), input(2, 'note', 'c')];
    expect(() => groupAlignedLines(withTab, [])).toThrow('Kohdistettava syöte ei saa sisältää sarkainmerkkejä');
    const withoutTab = [input(0, 'text', 'Ohje nyt'), input(1, 'chord', 'C |'), input(2, 'note', 'c')];
    expect(() => groupAlignedLines(withoutTab, [])).toThrow('Riviltä 1 puuttuu transponointitulos');
    expect(() => groupAlignedLines(withoutTab, [chordAtOne, noteWithoutRange])).toThrow('Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti');
  });
  it('AC38: säilyttää kaksi sointua samassa tahdissa', () => {
    const result: MusicResultLine = { index: 0, type: 'chord', content: 'C        Am |F      G      |', segments: [], warnings: [], tokens: [
      { type: 'chord', text: 'C', sourceRange: { start: 0, end: 1 } },
      { type: 'chord', text: 'Am', sourceRange: { start: 9, end: 11 } },
      { type: 'pipe', text: '|', sourceRange: { start: 12, end: 13 } },
      { type: 'chord', text: 'F', sourceRange: { start: 13, end: 14 } },
      { type: 'chord', text: 'G', sourceRange: { start: 20, end: 21 } },
      { type: 'pipe', text: '|', sourceRange: { start: 27, end: 28 } },
    ] };
    const grouped = groupAlignedLines([input(0, 'chord', result.content ?? ''), input(1, 'text', 'kaunista on kun oon onneton')], [result]);
    expect(grouped).toHaveLength(1);
    expect(collectAlignmentAnchors(grouped[0] as Parameters<typeof collectAlignmentAnchors>[0])).toEqual([0, 9, 12, 20, 27]);
    expect((grouped[0] as { text?: { content?: string } }).text?.content).toBe('kaunista on kun oon onneton');
  });
});

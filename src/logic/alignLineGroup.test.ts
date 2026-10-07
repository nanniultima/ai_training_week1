import { describe, expect, it } from 'vitest';
import type { AlignedLineGroup, ClassifiedLine, ReadyTranspositionSettings, TransposedChordLine, TransposedNoteLine } from '../types.js';
import { alignLineGroup, calculateAlignedColumns, collectAlignmentAnchors } from './alignLineGroup.js';
import { groupAlignedLines } from './groupAlignedLines.js';
import { transposeChordLine } from './transposeChordLine.js';
import { transposeNoteLine } from './transposeNoteLine.js';

const plusOne = { status: 'ready', mode: 'major', sourceTonic: 'C', targetTonic: 'C#', step: 1 } as const;
function transposedGroup(rows: readonly (readonly [ClassifiedLine['type'], string])[], settings: ReadyTranspositionSettings = plusOne): AlignedLineGroup {
  const originals: ClassifiedLine[] = rows.map(([type, content], index) => ({
    index, type, content, segments: [{ text: content, bold: false, italic: false }],
  }));
  const transposed = originals.flatMap<TransposedChordLine | TransposedNoteLine>(line => line.type === 'chord'
    ? [transposeChordLine(line, settings)]
    : line.type === 'note' ? [transposeNoteLine(line, settings)] : []);
  const result = groupAlignedLines(originals, transposed)[0]!;
  if ('type' in result) throw new Error('Test requires a music group');
  return result;
}

const exampleRows = [
  ['chord', 'C    |Am     |G       |C      |'],
  ['note', 'c c  a a a   gB g  g  c d   c'],
  ['text', 'onpa i-hanaa laulella sateessa'],
] as const;
const group = transposedGroup(exampleRows);
const plusTwoGroup = transposedGroup(exampleRows, { ...plusOne, targetTonic: 'D', step: 2 });
describe('alignLineGroup', () => {
  it.each([
    ['c x2 d', 'C# x2 D#', 5, 6, 'onpa  ihanaa'],
    ['c - d', 'C# - D#', 4, 5, 'onpa  ihanaa'],
    ['c x2 x3 d', 'C# x2 x3 D#', 8, 9, 'onpa iha-naa'],
  ] as const)('AC23: sävelrivin välisisältö ja erottimet säilyvät (%s)', (source, expectedNote, sourceStart, outputStart, expectedText) => {
    const candidate = transposedGroup([['note', source], ['text', 'onpa ihanaa']]);
    const result = alignLineGroup(candidate);
    expect(result.map(line => line.content)).toEqual([expectedNote, expectedText]);
    expect(calculateAlignedColumns(candidate)).toEqual([0, outputStart]);
    const noteLine = result[0];
    if (noteLine?.type !== 'note') throw new Error('Expected note');
    expect(noteLine.parts.filter(part => part.type === 'noteGroup')[1])
      .toMatchObject({ sourceRange: { start: sourceStart }, alignedRange: { start: outputStart } });
  });
  it('Amendments AC29: hylkää musiikittoman preserve-kutsun', () => {
    expect(() => alignLineGroup({}, 'preserve')).toThrowError(new Error('Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi'));
  });
  it('Amendments AC28: säilyttää monirivisen ryhmän luonnolliset tulosalueet', () => {
    const candidate = transposedGroup([['chord', 'C |G |'], ['note', 'c c'], ['text', 'onpa']]);
    const before = structuredClone(candidate);
    const chordSource = structuredClone(candidate.chord!.tokens!.map(token => token.sourceRange));
    const noteSource = structuredClone(candidate.note!.parts.filter(part => part.type === 'noteGroup').map(part => part.sourceRange));
    const result = alignLineGroup(candidate, 'preserve');
    expect(result.map(line => line.content)).toEqual(['C# |G# |', 'C# C#', 'onpa']);
    const chordLine = result[0], noteLine = result[1];
    if (chordLine?.type !== 'chord' || noteLine?.type !== 'note') throw new Error('Expected music');
    expect(chordLine.tokens.filter(token => token.type !== 'text').map(token => token.alignedRange))
      .toEqual([{ start: 0, end: 2 }, { start: 3, end: 4 }, { start: 4, end: 6 }, { start: 7, end: 8 }]);
    expect(noteLine.parts.filter(part => part.type === 'noteGroup').map(part => part.alignedRange))
      .toEqual([{ start: 0, end: 2 }, { start: 3, end: 5 }]);
    expect(chordLine.tokens.map(token => token.sourceRange)).toEqual(chordSource);
    expect(noteLine.parts.filter(part => part.type === 'noteGroup').map(part => part.sourceRange)).toEqual(noteSource);
    expect(chordLine.segments).toEqual(candidate.chord!.segments);
    expect(noteLine.parts.filter(part => part.type === 'noteGroup').map(part => part.notes))
      .toEqual(candidate.note!.parts.filter(part => part.type === 'noteGroup').map(part => part.notes));
    expect(candidate).toEqual(before);
  });
  it.each([
    ['gb c', 'on-pa', 1, 'C#', 'G C#', 'onpa', 2],
    ['gB c', 'on-pa', 1, 'C#', 'G#C C#', 'on--pa', 4],
    ['gb c', 'on-pa', 2, 'D', 'G# D', 'on-pa', 3],
    ['gB c', 'on-pa', 2, 'D', 'AC# D', 'on--pa', 4],
    ['gb c', 'on-pa', 0, 'C', 'gb c', 'on-pa', 3],
    ['gB c', 'on-pa', 0, 'C', 'gB c', 'on-pa', 3],
    ['gbc  d', 'onpa  ihanaa', 1, 'C#', 'GC#  D#', 'onpa  ihanaa', 5],
    ['gBc  d', 'onpa  ihanaa', 1, 'C#', 'G#CC# D#', 'onpa   ihanaa', 6],
  ] as const)('AC56: erottaa gb- ja gB-ryhmien kohdistuksen (%s, %s, %i)', (source, lyrics, step, targetTonic, expectedNote, expectedText, column) => {
    const candidate = transposedGroup([['note', source], ['text', lyrics]], { ...plusOne, step, targetTonic });
    const sourceRanges = candidate.note!.parts.filter(part => part.type === 'noteGroup').map(part => part.sourceRange);
    const result = alignLineGroup(candidate);
    expect(result.map(line => line.content)).toEqual([expectedNote, expectedText]);
    const line = result[0];
    if (line?.type !== 'note') throw new Error('Expected note');
    expect(collectAlignmentAnchors({ note: line }, 'aligned')).toEqual([0, column]);
    const groups = line.parts.filter(part => part.type === 'noteGroup');
    expect(groups.map(part => part.sourceRange)).toEqual(sourceRanges);
    expect(groups[0]?.sourceRange).toEqual({ start: 0, end: source.indexOf(' ') });
    expect(groups[1]?.sourceRange.start).toBe(source.endsWith('d') ? 5 : 3);
    if (source.includes('B') && step > 0) expect(groups[0]?.notes[1]?.register).toBe(4);
  });
  it('AC55: kohdistaa myös nolla-askeleella', () => {
    const result = alignLineGroup(transposedGroup([
      ['chord', 'C    |Am     |G       |C      |'],
      ['note', 'c c  a a a   gB g  g  c d   c'],
      ['text', 'onpa i-hanaa laulella sateessa'],
    ], { ...plusOne, targetTonic: 'C', step: 0 }));
    expect(result.map(line => line.content)).toEqual([
      'C    |Am     |G       |C      |', 'c c  a a a   gB g  g  c d   c', 'onpa i-hanaa laulella sateessa',
    ]);
    const chordLine = result[0], noteLine = result[1];
    if (chordLine?.type !== 'chord' || noteLine?.type !== 'note') throw new Error('Expected music');
    expect(collectAlignmentAnchors({ chord: chordLine, note: noteLine }, 'aligned')).toEqual([0, 2, 5, 7, 9, 13, 16, 19, 22, 24, 28, 30]);
    for (const token of chordLine.tokens) {
      if (token.type !== 'text') expect(token.alignedRange).toEqual(token.sourceRange);
    }
    for (const part of noteLine.parts) {
      if (part.type === 'noteGroup') expect(part.alignedRange).toEqual(part.sourceRange);
    }
  });
  it('AC54: hylkää musiikittoman suoran kutsun', () => {
    expect(() => alignLineGroup({})).toThrowError(new Error('Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi'));
  });
  it.each([
    { source: 'c  c', settings: plusOne, expected: 'C# C#', anchors: [0, 3] },
    { source: 'c#  d', settings: { ...plusOne, sourceTonic: 'D#', targetTonic: 'D', step: -1 } as const, expected: 'C   C#', anchors: [0, 4] },
  ])('AC53: joustaa melodian ylimääräistä väliä ($source)', ({ source, settings, expected, anchors }) => {
    const result = alignLineGroup(transposedGroup([['note', source], ['text', 'onpa']], settings));
    expect(result.map(line => line.content)).toEqual([expected, 'onpa']);
    const line = result[0];
    if (line?.type !== 'note') throw new Error('Expected note');
    expect(collectAlignmentAnchors({ note: line }, 'aligned')).toEqual(anchors);
  });
  it('AC52: siirtää ahdasta putkea vain vähimmäismäärän', () => {
    const candidate = transposedGroup([['chord', '|C|G'], ['text', 'onpa']]);
    const result = alignLineGroup(candidate);
    expect(result.map(line => line.content)).toEqual(['|C#|G#', 'on-pa']);
    expect(collectAlignmentAnchors(candidate)).toEqual([0, 2]);
    const line = result[0];
    if (line?.type !== 'chord') throw new Error('Expected chord');
    expect(collectAlignmentAnchors({ chord: line }, 'aligned')).toEqual([0, 3]);
    expect(line.tokens.filter(token => token.type === 'pipe')[1]?.alignedRange).toEqual({ start: 3, end: 4 });
    expect(line.tokens.filter(token => token.type === 'chord')[1]?.alignedRange).toEqual({ start: 4, end: 6 });
  });
  it.each(['C |G', 'C |'])('AC51: putki melodia ja sanat siirtyvät yhdessä (%s)', source => {
    const candidate = transposedGroup([['chord', source], ['note', 'c c'], ['text', 'onpa']]);
    const result = alignLineGroup(candidate);
    expect(result.map(line => line.content)).toEqual([source === 'C |G' ? 'C# |G#' : 'C# |', 'C# C#', 'on-pa']);
    const chordLine = result[0], noteLine = result[1];
    if (chordLine?.type !== 'chord' || noteLine?.type !== 'note') throw new Error('Expected music');
    expect(chordLine.tokens.find(token => token.type === 'pipe')).toMatchObject({ sourceRange: { start: 2 }, alignedRange: { start: 3 } });
    expect(noteLine.parts.filter(part => part.type === 'noteGroup')[1]).toMatchObject({ sourceRange: { start: 2 }, alignedRange: { start: 3 } });
    expect(collectAlignmentAnchors(candidate)).toEqual([0, 2]);
    expect(collectAlignmentAnchors({ chord: chordLine, note: noteLine }, 'aligned')).toEqual([0, 3]);
  });
  it('AC46: säilyttää putkien sarakkeet joustamalla välejä', () => {
    const candidate = transposedGroup([
      ['chord', '|C         |Bm        |Em'], ['text', 'kun laivat saapui satamaan'],
    ], { ...plusOne, targetTonic: 'D', step: 2 });
    const result = alignLineGroup(candidate);
    expect(result.map(line => line.content)).toEqual(['|D         |C#m       |F#m', 'kun laivat saapui satamaan']);
    const line = result[0];
    if (line?.type !== 'chord') throw new Error('Expected chord');
    expect(line.tokens.filter(token => token.type === 'pipe')
      .map(token => [token.sourceRange?.start, token.alignedRange?.start])).toEqual([[0, 0], [11, 11], [22, 22]]);
    expect(result[1]?.content?.[22]).toBe('m');
  });
  it('AC2: kohdistaa koko C#-duurin +1-esimerkin', () => {
    expect(calculateAlignedColumns(group)).toEqual([0, 3, 6, 9, 12, 16, 20, 23, 26, 29, 33, 35]);
    expect(alignLineGroup(group).map((line) => line.content)).toEqual([
      'C#    |A#m      |G#       |C#      |',
      'C# C# A# A# A#  G#C G# G# C# D#  C#',
      'on-pa i--ha-naa lau-lella sa-teessa',
    ]);
  });
  it('AC3: lukitsee +1-ankkurit', () => {
    const aligned = alignLineGroup(group);
    expect(collectAlignmentAnchors({
      chord: aligned[0] as TransposedChordLine,
      note: aligned[1] as TransposedNoteLine,
    }, 'aligned')).toEqual([0, 3, 6, 9, 12, 16, 20, 23, 26, 29, 33, 35]);
  });
  it('AC4: kohdistaa koko D-duurin +2-esimerkin', () => {
    expect(alignLineGroup(plusTwoGroup).map((line) => line.content)).toEqual([
      'D    |Bm     |A        |D      |',
      'D D  B B B   AC# A  A  D E   D',
      'onpa i-hanaa lau-lella sateessa',
    ]);
  });
  it('AC5: lukitsee +2-ankkurit', () => {
    const aligned = alignLineGroup(plusTwoGroup);
    expect(collectAlignmentAnchors({
      chord: aligned[0] as TransposedChordLine,
      note: aligned[1] as TransposedNoteLine,
    }, 'aligned')).toEqual([0, 2, 5, 7, 9, 13, 17, 20, 23, 25, 29, 31]);
  });
  it('AC6: jakaa onpa-sanan', () => {
    const aligned = alignLineGroup({
      note: {
        index: 0,
        type: 'note',
        content: 'C# C#',
        parts: [
          { type: 'noteGroup', notes: [{ name: 'C#', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
          { type: 'separator', text: ' ' },
          { type: 'noteGroup', notes: [{ name: 'C#', register: 3 }], sourceText: 'c', sourceRange: { start: 2, end: 3 } },
        ],
      },
      text: { index: 1, type: 'text', content: 'onpa', segments: [{ text: 'onpa', bold: false, italic: false }] },
    });
    expect(aligned.map((line) => line.content)).toEqual(['C# C#', 'on-pa']);
  });
  it('AC7: säilyttää ja lisää tavutusviivat', () => {
    const aligned = alignLineGroup({
      note: {
        index: 0, type: 'note', content: 'A# A# A#',
        parts: [0, 2, 4].flatMap((start, index) => [
          ...(index === 0 ? [] : [{ type: 'separator' as const, text: ' ' }]),
          { type: 'noteGroup' as const, notes: [{ name: 'A#', register: 3 as const }], sourceText: 'a', sourceRange: { start, end: start + 1 } },
        ]),
      },
      text: { index: 1, type: 'text', content: 'i-hanaa', segments: [{ text: 'i-hanaa', bold: false, italic: false }] },
    });
    expect(aligned.map((line) => line.content)).toEqual(['A# A# A#', 'i--ha-naa']);
  });
  it('AC8: pitää noteGroupin yhtenä ankkurina', () => {
    expect(collectAlignmentAnchors({ note: {
      index: 0, type: 'note', content: 'G#C',
      parts: [{ type: 'noteGroup', notes: [{ name: 'G#', register: 3 }, { name: 'C', register: 4 }], sourceText: 'gB', sourceRange: { start: 13, end: 15 } }],
    } })).toEqual([13]);
  });
  it('AC9: pidentää vain AC#-ryhmän sanaa', () => {
    const aligned = alignLineGroup(plusTwoGroup);
    expect(aligned[2]?.content).toBe('onpa i-hanaa lau-lella sateessa');
  });
  it('AC10: siirtää myöhemmät musiikkiankkurit', () => {
    const aligned = alignLineGroup(plusTwoGroup);
    const noteParts = (aligned[1] as TransposedNoteLine).parts.filter((part) => part.type === 'noteGroup');
    expect(noteParts[6]).toMatchObject({ sourceRange: { start: 16 }, alignedRange: { start: 17 } });
    const pipe = (aligned[0] as TransposedChordLine).tokens?.find((token) => token.type === 'pipe' && token.sourceRange?.start === 22);
    expect(pipe).toMatchObject({ sourceRange: { start: 22 }, alignedRange: { start: 23 } });
  });
  it('AC11: lisää välijaksoon välilyönnin', () => {
    const aligned = alignLineGroup({
      note: { index: 0, type: 'note', content: 'G#CC#  D#', parts: [
        { type: 'noteGroup', notes: [{ name: 'G#', register: 3 }, { name: 'C', register: 4 }, { name: 'C#', register: 3 }], sourceText: 'gBc', sourceRange: { start: 0, end: 3 } },
        { type: 'separator', text: '  ' },
        { type: 'noteGroup', notes: [{ name: 'D#', register: 3 }], sourceText: 'd', sourceRange: { start: 5, end: 6 } },
      ] },
      text: { index: 1, type: 'text', content: 'onpa  ihanaa', segments: [{ text: 'onpa  ihanaa', bold: false, italic: false }] },
    });
    expect(aligned.map(line => line.content)).toEqual(['G#CC# D#', 'onpa   ihanaa']);
    expect((aligned[0] as TransposedNoteLine).parts.filter(part => part.type === 'noteGroup')
      .map(part => part.alignedRange?.start)).toEqual([0, 6]);
  });
  it('AC12: lisää sanaan kaksi viivaa', () => {
    const aligned = alignLineGroup({
      note: { index: 0, type: 'note', content: 'C## C', parts: [
        { type: 'noteGroup', notes: [{ name: 'C##', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'C', register: 3 }], sourceText: 'c', sourceRange: { start: 2, end: 3 } },
      ] },
      text: { index: 1, type: 'text', content: 'onpa', segments: [{ text: 'onpa', bold: false, italic: false }] },
    });
    expect(aligned[1]?.content).toBe('on--pa');
  });
  it('AC13: täyttää lyhyen tekstin', () => {
    const aligned = alignLineGroup({
      note: { index: 0, type: 'note', content: 'C### C', parts: [
        { type: 'noteGroup', notes: [{ name: 'C###', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'C', register: 3 }], sourceText: 'c', sourceRange: { start: 2, end: 3 } },
      ] },
      text: { index: 1, type: 'text', content: 'on', segments: [{ text: 'on', bold: false, italic: false }] },
    });
    expect(aligned[1]?.content).toBe('on   ');
  });
  it('AC14: välttää loppuvälit', () => {
    const aligned = alignLineGroup({
      chord: { index: 0, type: 'chord', content: 'Cmaj7      |', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'Cmaj7', sourceRange: { start: 0, end: 5 } },
        { type: 'pipe', text: '|', sourceRange: { start: 11, end: 12 } },
      ] },
      text: { index: 1, type: 'text', content: 'nyt', segments: [{ text: 'nyt', bold: false, italic: false }] },
    });
    expect(aligned.map((line) => line.content)).toEqual(['Cmaj7      |', 'nyt']);
  });
  it('AC15: käyttää pisintä tulostokenia', () => {
    const candidate: AlignedLineGroup = {
      chord: { index: 0, type: 'chord', content: 'A#m B', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'A#m', sourceRange: { start: 0, end: 1 } },
        { type: 'chord', text: 'B', sourceRange: { start: 2, end: 3 } },
      ] },
      note: { index: 1, type: 'note', content: 'A# B', parts: [
        { type: 'noteGroup', notes: [{ name: 'A#', register: 3 }], sourceText: 'a', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'B', register: 3 }], sourceText: 'b', sourceRange: { start: 2, end: 3 } },
      ] },
    };
    const before = structuredClone(candidate);
    expect(calculateAlignedColumns(candidate, [0, 2])).toEqual([0, 4]);
    expect(candidate).toEqual(before);
  });
  it('AC16: ohittaa puuttuvan rivitokenin', () => {
    const candidate: AlignedLineGroup = {
      chord: { index: 0, type: 'chord', content: 'C#', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 } },
      ] },
      note: { index: 1, type: 'note', content: ' B', parts: [
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'B', register: 3 }], sourceText: 'b', sourceRange: { start: 2, end: 3 } },
      ] },
    };
    const before = structuredClone(candidate);
    expect(calculateAlignedColumns(candidate, [0, 2])).toEqual([0, 3]);
    expect(candidate).toEqual(before);
    const alignedNote = alignLineGroup(candidate)[1] as TransposedNoteLine;
    expect(alignedNote.parts.find((part) => part.type === 'noteGroup')).toMatchObject({ alignedRange: { start: 3 } });
  });
  it('AC17: siirtää lyhenevän jälkeistä ankkuria', () => {
    const aligned = alignLineGroup({ chord: {
      index: 0, type: 'chord', content: 'C C#', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'C', sourceRange: { start: 0, end: 2 } },
        { type: 'chord', text: 'C#', sourceRange: { start: 3, end: 4 } },
      ],
    }, text: { index: 1, type: 'text', content: 'on-pa', segments: [{ text: 'on-pa', bold: false, italic: false }] } });
    const line = aligned[0] as TransposedChordLine;
    expect(line.content).toBe('C C#');
    expect(line.tokens?.[1]).toMatchObject({ sourceRange: { start: 3 }, alignedRange: { start: 2 } });
  });
  it('AC18: estää tokenien törmäyksen', () => {
    const candidate: AlignedLineGroup = { chord: {
      index: 0, type: 'chord', content: 'Cmaj7 B', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'Cmaj7', sourceRange: { start: 0, end: 1 } },
        { type: 'chord', text: 'B', sourceRange: { start: 2, end: 3 } },
      ],
    }, text: { index: 1, type: 'text', content: 'onpa', segments: [{ text: 'onpa', bold: false, italic: false }] } };
    expect(calculateAlignedColumns(candidate, [0, 2])).toEqual([0, 6]);
    expect((alignLineGroup(candidate)[0] as TransposedChordLine).tokens?.[1]).toMatchObject({ alignedRange: { start: 6 } });
  });
  it('AC19: poistaa kohdistusrajan viivan', () => {
    const aligned = alignLineGroup({
      chord: { index: 0, type: 'chord', content: 'C C#', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'C', sourceRange: { start: 0, end: 2 } },
        { type: 'chord', text: 'C#', sourceRange: { start: 3, end: 4 } },
      ] },
      text: { index: 1, type: 'text', content: 'on-pa', segments: [{ text: 'on-pa', bold: false, italic: false }] },
    });
    expect(aligned.map((line) => line.content)).toEqual(['C C#', 'onpa']);
  });
  it('AC20: säilyttää käyttäjän muun viivan', () => {
    const aligned = alignLineGroup({
      chord: { index: 0, type: 'chord', content: 'C C#', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'C', sourceRange: { start: 0, end: 2 } },
        { type: 'chord', text: 'C#', sourceRange: { start: 3, end: 4 } },
      ] },
      text: { index: 1, type: 'text', content: 'on-pa nyt-kin', segments: [{ text: 'on-pa nyt-kin', bold: false, italic: false }] },
    });
    expect(aligned[1]?.content).toBe('onpa nyt-kin');
  });
  it('AC21: lisää muotoilemattoman musiikkivälin', () => {
    const aligned = alignLineGroup({ chord: {
      index: 0, type: 'chord', content: 'C#C', segments: [{ text: 'C#C', bold: true, italic: true, fontSizePx: 18 }], warnings: [], tokens: [
        { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 } },
        { type: 'chord', text: 'C', sourceRange: { start: 2, end: 3 } },
      ],
    }, text: { index: 1, type: 'text', content: 'onpa', segments: [{ text: 'onpa', bold: false, italic: false }] } });
    const line = aligned[0] as TransposedChordLine;
    expect(line.content).toBe('C# C');
    expect(line.segments).toContainEqual({ text: ' ', bold: false, italic: false });
    expect(line.tokens?.[1]).toMatchObject({ sourceRange: { start: 2 }, alignedRange: { start: 3 } });
  });
  it('AC22: perii viivan edeltävän muotoilun', () => {
    const aligned = alignLineGroup({
      note: { index: 0, type: 'note', content: 'C## C', parts: [
        { type: 'noteGroup', notes: [{ name: 'C##', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'C', register: 3 }], sourceText: 'c', sourceRange: { start: 2, end: 3 } },
      ] },
      text: { index: 1, type: 'text', content: 'onpa', segments: [
        { text: 'on', bold: true, italic: false, fontSizePx: 18 },
        { text: 'pa', bold: false, italic: false },
      ] },
    });
    const textLine = aligned[1] as { segments: readonly { text: string; bold: boolean; italic: boolean; fontSizePx?: number }[] };
    expect(textLine.segments.find((segment) => segment.text.includes('--'))).toMatchObject({ bold: true, italic: false, fontSizePx: 18 });
  });
  it('AC23: säilyttää xN-merkinnän', () => {
    const transposed: TransposedChordLine = {
      index: 0, type: 'chord', content: 'C# x2 |G# |', warnings: [],
      segments: [
        { text: 'C# ', bold: false, italic: false },
        { text: 'x2', bold: false, italic: true },
        { text: ' |G# |', bold: false, italic: false },
      ],
      tokens: [
        { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 } },
        { type: 'text', text: ' x2 ', sourceRange: { start: 1, end: 5 } },
        { type: 'pipe', text: '|', sourceRange: { start: 5, end: 6 } },
        { type: 'chord', text: 'G#', sourceRange: { start: 6, end: 7 } },
        { type: 'text', text: ' ', sourceRange: { start: 7, end: 8 } },
        { type: 'pipe', text: '|', sourceRange: { start: 8, end: 9 } },
      ],
    };
    const aligned = alignLineGroup({ chord: transposed, text: {
      index: 1, type: 'text', content: 'onpa nyt',
      segments: [{ text: 'onpa nyt', bold: false, italic: false }],
    } });
    const line = aligned[0] as TransposedChordLine;
    expect(line.content).toBe('C# x2|G#|');
    expect(line.segments.filter((segment) => segment.italic && segment.text === 'x2')).toHaveLength(1);
    expect(line.tokens?.[2]).toMatchObject({ alignedRange: { start: 5, end: 6 } });
    expect(line.tokens?.[3]).toMatchObject({ alignedRange: { start: 6, end: 8 } });
    expect(line.tokens?.[5]).toMatchObject({ alignedRange: { start: 8, end: 9 } });
    expect(aligned[1]?.content).toBe('onpa nyt');

    const single = alignLineGroup({ chord: transposed })[0] as TransposedChordLine;
    expect(single.content).toBe('C# x2 |G# |');
    expect(single.segments).toEqual(transposed.segments);
    expect(single.tokens?.[2]).toMatchObject({ alignedRange: { start: 6, end: 7 } });
    expect(single.tokens?.[5]).toMatchObject({ alignedRange: { start: 10, end: 11 } });
  });
  it('AC28: säilyttää yksittäisen musiikkirivin sisällön välit ja muotoilut', () => {
    const chordOnly = alignLineGroup({ chord: {
      index: 0, type: 'chord', content: 'C# |G# |',
      segments: [{ text: 'C# |G# |', bold: true, italic: true, fontSizePx: 18 }], warnings: [], tokens: [
        { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 } },
        { type: 'pipe', text: '|', sourceRange: { start: 2, end: 3 } },
        { type: 'chord', text: 'G#', sourceRange: { start: 3, end: 4 } },
        { type: 'pipe', text: '|', sourceRange: { start: 5, end: 6 } },
      ],
    } });
    const noteOnly = alignLineGroup({ note: {
      index: 0, type: 'note', content: 'C# C#', parts: [
        { type: 'noteGroup', notes: [{ name: 'C#', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'C#', register: 3 }], sourceText: 'c', sourceRange: { start: 2, end: 3 } },
      ],
    } });
    expect(chordOnly[0]?.content).toBe('C# |G# |');
    expect(noteOnly[0]?.content).toBe('C# C#');
    const chordLine = chordOnly[0] as TransposedChordLine;
    expect(chordLine.segments).toEqual([{ text: 'C# |G# |', bold: true, italic: true, fontSizePx: 18 }]);
    expect(chordLine.tokens?.filter(token => token.type === 'pipe')
      .map(token => [token.sourceRange?.start, token.alignedRange?.start])).toEqual([[2, 3], [5, 7]]);
    expect(calculateAlignedColumns({ chord: chordLine })).toEqual([0, 3, 7]);
    expect(collectAlignmentAnchors({ note: noteOnly[0] as TransposedNoteLine }, 'aligned')).toEqual([0, 3]);

    const wide: TransposedNoteLine = {
      index: 0, type: 'note', content: 'C#  C#', parts: [
        { type: 'noteGroup', notes: [{ name: 'C#', register: 4 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: '  ', formatting: [{ text: '  ', bold: true, italic: true, fontSizePx: 18 }] },
        { type: 'noteGroup', notes: [{ name: 'C#', register: 2 }], sourceText: 'c', sourceRange: { start: 3, end: 4 } },
      ],
    };
    const before = structuredClone(wide);
    const singleNote = alignLineGroup({ note: wide })[0] as TransposedNoteLine;
    expect(singleNote.content).toBe('C#  C#');
    expect(singleNote.parts[1]).toEqual(wide.parts[1]);
    expect(singleNote.parts.filter(part => part.type === 'noteGroup')
      .map(part => [part.sourceRange?.start, part.alignedRange?.start, part.notes[0]?.register]))
      .toEqual([[0, 0, 4], [3, 4, 2]]);
    expect(calculateAlignedColumns({ note: wide })).toEqual([0, 4]);
    expect(wide).toEqual(before);
  });
  it('AC39: yhdistää pipen chordiin ja suspiciousChordiin', () => {
    const candidate: AlignedLineGroup = { chord: { index: 0, type: 'chord', content: 'C |Am |Cfoo', segments: [], warnings: [], tokens: [
      { type: 'chord', text: 'C', sourceRange: { start: 0, end: 1 } },
      { type: 'pipe', text: '|', sourceRange: { start: 2, end: 3 } },
      { type: 'chord', text: 'Am', sourceRange: { start: 3, end: 5 } },
      { type: 'pipe', text: '|', sourceRange: { start: 6, end: 7 } },
      { type: 'suspiciousChord', text: 'Cfoo', sourceRange: { start: 7, end: 11 } },
    ] } };
    const line = alignLineGroup(candidate)[0] as TransposedChordLine;
    const aligned = { chord: line };
    expect(collectAlignmentAnchors(candidate, 'source')).toEqual([0, 2, 6]);
    expect(collectAlignmentAnchors(aligned, 'aligned')).toEqual([0, 2, 6]);
    expect(line.tokens?.map((token) => token.alignedRange)).toEqual([
      { start: 0, end: 1 }, { start: 2, end: 3 }, { start: 3, end: 5 }, { start: 6, end: 7 }, { start: 7, end: 11 },
    ]);
  });
  it('AC40: pitää paljaan soinnun omana ankkurina', () => {
    const candidate: AlignedLineGroup = { chord: { index: 0, type: 'chord', content: 'C        Am', segments: [], warnings: [], tokens: [
      { type: 'chord', text: 'C', sourceRange: { start: 0, end: 1 } },
      { type: 'chord', text: 'Am', sourceRange: { start: 9, end: 11 } },
    ] } };
    const line = alignLineGroup(candidate)[0] as TransposedChordLine;
    expect(collectAlignmentAnchors(candidate, 'source')).toEqual([0, 9]);
    expect(collectAlignmentAnchors({ chord: line }, 'aligned')).toEqual([0, 9]);
    expect(line.tokens?.map((token) => token.alignedRange)).toEqual([{ start: 0, end: 1 }, { start: 9, end: 11 }]);
  });
  it('AC41: pitää itsenäisen pipen omana ankkurina', () => {
    const candidate: AlignedLineGroup = { chord: { index: 0, type: 'chord', content: 'C      |', segments: [], warnings: [], tokens: [
      { type: 'chord', text: 'C', sourceRange: { start: 0, end: 1 } },
      { type: 'pipe', text: '|', sourceRange: { start: 7, end: 8 } },
    ] } };
    const line = alignLineGroup(candidate)[0] as TransposedChordLine;
    expect(collectAlignmentAnchors(candidate, 'source')).toEqual([0, 7]);
    expect(collectAlignmentAnchors({ chord: line }, 'aligned')).toEqual([0, 7]);
    expect(line.tokens?.[1]).toMatchObject({ alignedRange: { start: 7, end: 8 } });
  });
  it('AC42: erottaa peräkkäiset pipet', () => {
    const candidate: AlignedLineGroup = { chord: { index: 0, type: 'chord', content: 'C ||G', segments: [], warnings: [], tokens: [
      { type: 'chord', text: 'C', sourceRange: { start: 0, end: 1 } },
      { type: 'pipe', text: '|', sourceRange: { start: 2, end: 3 } },
      { type: 'pipe', text: '|', sourceRange: { start: 3, end: 4 } },
      { type: 'chord', text: 'G', sourceRange: { start: 4, end: 5 } },
    ] } };
    const line = alignLineGroup(candidate)[0] as TransposedChordLine;
    expect(collectAlignmentAnchors(candidate, 'source')).toEqual([0, 2, 3]);
    expect(collectAlignmentAnchors({ chord: line }, 'aligned')).toEqual([0, 2, 3]);
    expect(line.tokens?.map((token) => token.alignedRange)).toEqual([
      { start: 0, end: 1 }, { start: 2, end: 3 }, { start: 3, end: 4 }, { start: 4, end: 5 },
    ]);
  });
  it('AC43: säilyttää lähdealueet ja lisää kaikki tulosalueet', () => {
    const candidate: AlignedLineGroup = {
      chord: { index: 0, type: 'chord', content: 'C# |Am |Cfoo', segments: [], warnings: [], tokens: [
        { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 } },
        { type: 'pipe', text: '|', sourceRange: { start: 2, end: 3 } },
        { type: 'chord', text: 'Am', sourceRange: { start: 3, end: 5 } },
        { type: 'pipe', text: '|', sourceRange: { start: 6, end: 7 } },
        { type: 'suspiciousChord', text: 'Cfoo', sourceRange: { start: 7, end: 11 } },
      ] },
      note: { index: 1, type: 'note', content: 'C# D', parts: [
        { type: 'noteGroup', notes: [{ name: 'C#', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: ' ' },
        { type: 'noteGroup', notes: [{ name: 'D', register: 3 }], sourceText: 'd', sourceRange: { start: 2, end: 3 } },
      ] },
    };
    const sourceRanges = structuredClone({ chord: candidate.chord?.tokens?.map((token) => token.sourceRange), note: candidate.note?.parts.filter((part) => part.type === 'noteGroup').map((part) => part.sourceRange) });
    const sourceAnchors = collectAlignmentAnchors(candidate, 'source');
    calculateAlignedColumns(candidate, sourceAnchors);
    const result = alignLineGroup(candidate);
    const aligned = { chord: result[0] as TransposedChordLine, note: result[1] as TransposedNoteLine };
    expect({ chord: aligned.chord.tokens?.map((token) => token.sourceRange), note: aligned.note.parts.filter((part) => part.type === 'noteGroup').map((part) => part.sourceRange) }).toEqual(sourceRanges);
    expect(aligned.chord.tokens?.map(token => token.alignedRange)).toEqual([
      { start: 0, end: 2 }, { start: 3, end: 4 }, { start: 4, end: 6 },
      { start: 7, end: 8 }, { start: 8, end: 12 },
    ]);
    expect(aligned.note.parts.filter(part => part.type === 'noteGroup').map(part => part.alignedRange))
      .toEqual([{ start: 0, end: 2 }, { start: 3, end: 4 }]);
    expect(collectAlignmentAnchors(aligned, 'aligned')).toEqual([0, 3, 7]);
    expect(aligned.chord.content).toBe('C# |Am |Cfoo');
    expect(aligned.note.content).toBe('C# D');
    const missing = { chord: { ...aligned.chord, tokens: aligned.chord.tokens?.map((token, index) => index === 0 ? { ...token, alignedRange: undefined } : token) } };
    expect(() => collectAlignmentAnchors(missing, 'aligned')).toThrow('Kohdistettavalta tokenilta puuttuu kohdistettu sijainti');
  });

  it('AC44: estää eri rivien tokenien valetörmäyksen', () => {
    const candidate: AlignedLineGroup = {
      chord: {
        index: 0,
        type: 'chord',
        content: '|C              ,Dm/F# |  ',
        segments: [],
        warnings: [],
        tokens: [
          { type: 'pipe', text: '|', sourceRange: { start: 0, end: 1 } },
          { type: 'chord', text: 'C', sourceRange: { start: 1, end: 2 } },
          { type: 'text', text: ',', sourceRange: { start: 16, end: 17 } },
          { type: 'chord', text: 'Dm/F#', sourceRange: { start: 17, end: 22 } },
          { type: 'pipe', text: '|', sourceRange: { start: 23, end: 24 } },
        ],
      },
      note: {
        index: 1,
        type: 'note',
        content: 'E               G F# F',
        parts: [
          { type: 'noteGroup', notes: [{ name: 'E', register: 3 }], sourceText: 'c#', sourceRange: { start: 0, end: 2 } },
          { type: 'noteGroup', notes: [{ name: 'G', register: 3 }], sourceText: 'e', sourceRange: { start: 17, end: 18 } },
          { type: 'noteGroup', notes: [{ name: 'F#', register: 3 }], sourceText: 'd#', sourceRange: { start: 19, end: 21 } },
          { type: 'noteGroup', notes: [{ name: 'F', register: 3 }], sourceText: 'd', sourceRange: { start: 22, end: 23 } },
        ],
      },
      text: {
        index: 2,
        type: 'text',
        content: 'se iskee sieluun syvimpään',
        segments: [{ text: 'se iskee sieluun syvimpään', bold: false, italic: false }],
      },
    };

    const result = alignLineGroup(candidate);

    expect(result.map((line) => line.content)).toEqual([
      '|C              ,Dm/F# |  ',
      'E                G F# F',
      'se iskee sieluun syvimpään',
    ]);
    expect((result[1] as TransposedNoteLine).parts
      .filter((part) => part.type === 'noteGroup')
      .map((part) => part.alignedRange?.start)).toEqual([0, 17, 19, 22]);
  });

  it('AC45: jättää itsenäisten pipejen siirtymät pois tekstikohdistuksesta', () => {
    const terminalPipe: AlignedLineGroup = {
      chord: {
        index: 0,
        type: 'chord',
        content: '|C#m/G#       |',
        segments: [],
        warnings: [],
        tokens: [
          { type: 'pipe', text: '|', sourceRange: { start: 0, end: 1 } },
          { type: 'chord', text: 'C#m/G#', sourceRange: { start: 1, end: 6 } },
          { type: 'pipe', text: '|', sourceRange: { start: 13, end: 14 } },
        ],
      },
      text: {
        index: 1,
        type: 'text',
        content: 'niin kuin muut',
        segments: [{ text: 'niin kuin muut', bold: false, italic: false }],
      },
    };
    const multiplePipes: AlignedLineGroup = {
      chord: {
        index: 0,
        type: 'chord',
        content: 'C# |   |',
        segments: [],
        warnings: [],
        tokens: [
          { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 } },
          { type: 'pipe', text: '|', sourceRange: { start: 2, end: 3 } },
          { type: 'pipe', text: '|', sourceRange: { start: 6, end: 7 } },
        ],
      },
      text: {
        index: 1,
        type: 'text',
        content: 'nytkin taas',
        segments: [{ text: 'nytkin taas', bold: false, italic: false }],
      },
    };

    expect.soft(alignLineGroup(terminalPipe).map((line) => line.content)).toEqual([
      '|C#m/G#      |',
      'niin kuin muut',
    ]);
    expect.soft(alignLineGroup(multiplePipes).map((line) => line.content)).toEqual([
      'C#|   |',
      'nytkin taas',
    ]);
    const terminalChord = alignLineGroup(terminalPipe)[0] as TransposedChordLine;
    expect(terminalChord.tokens?.at(-1)).toMatchObject({
      sourceRange: { start: 13, end: 14 }, alignedRange: { start: 13, end: 14 },
    });
    const multipleChord = alignLineGroup(multiplePipes)[0] as TransposedChordLine;
    expect(multipleChord.tokens?.filter(token => token.type === 'pipe')
      .map(token => [token.sourceRange?.start, token.alignedRange?.start]))
      .toEqual([[2, 2], [6, 6]]);
  });
});

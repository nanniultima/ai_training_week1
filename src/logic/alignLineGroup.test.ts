import { describe, expect, it } from 'vitest';
import type { AlignedLineGroup, TransposedChordLine, TransposedNoteLine } from '../types.js';
import { alignLineGroup, calculateAlignedColumns, collectAlignmentAnchors } from './alignLineGroup.js';

const chord = (content: string): TransposedChordLine => ({
  index: 0, type: 'chord', content, segments: [], warnings: [],
  tokens: [
    ['chord', 'C', 0, 1], ['pipe', '|', 5, 6], ['chord', 'A#m', 6, 8],
    ['pipe', '|', 13, 14], ['chord', 'G#', 14, 15], ['pipe', '|', 22, 23],
    ['chord', 'C#', 23, 24], ['pipe', '|', 30, 31],
  ].map(([type, text, start, end]) => ({ type, text, sourceRange: { start, end } })) as TransposedChordLine['tokens'],
});
const note = (content: string): TransposedNoteLine => ({
  index: 1, type: 'note', content,
  parts: [
    ['C#', 0, 1], ['C#', 2, 3], ['A#', 5, 6], ['A#', 7, 8], ['A#', 9, 10],
    ['G#C', 13, 15], ['G#', 16, 17], ['G#', 19, 20], ['C#', 22, 23],
    ['D#', 24, 25], ['C#', 28, 29],
  ].map(([name, start, end]) => ({ type: 'noteGroup', notes: [{ name, register: 3 }], sourceText: name, sourceRange: { start, end } })) as TransposedNoteLine['parts'],
});
const group: AlignedLineGroup = {
  chord: chord('C#    |A#m     |G#       |C#      |'),
  note: note('C# C#  A# A# A#   G#C G#  G# C# D#   C#'),
  text: { index: 2, type: 'text', content: 'onpa i-hanaa laulella sateessa', segments: [{ text: 'onpa i-hanaa laulella sateessa', bold: false, italic: false }] },
};
const plusTwoGroup: AlignedLineGroup = {
  chord: { ...chord('D    |Bm     |A       |D      |'), tokens: chord('D    |Bm     |A       |D      |').tokens?.map((token) => ({ ...token, text: token.type === 'chord' ? ({ C: 'D', 'A#m': 'Bm', 'G#': 'A', 'C#': 'D' }[token.text] ?? token.text) : token.text })) },
  note: { ...note('D D  B B B   AC# A  A  D E   D'), parts: note('D D  B B B   AC# A  A  D E   D').parts.map((part, index) => part.type === 'noteGroup' ? { ...part, notes: [{ ...part.notes[0]!, name: ['D', 'D', 'B', 'B', 'B', 'AC#', 'A', 'A', 'D', 'E', 'D'][index]! }] } : part) },
  text: group.text,
};

describe('alignLineGroup', () => {
  it('AC2: kohdistaa koko C#-duurin +1-esimerkin', () => {
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
      parts: [{ type: 'noteGroup', notes: [{ name: 'G#', register: 3 }, { name: 'C', register: 3 }], sourceText: 'gb', sourceRange: { start: 13, end: 15 } }],
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
      note: { index: 0, type: 'note', content: 'C#   D', parts: [
        { type: 'noteGroup', notes: [{ name: 'C#', register: 3 }], sourceText: 'c', sourceRange: { start: 0, end: 1 } },
        { type: 'separator', text: '    ' },
        { type: 'noteGroup', notes: [{ name: 'D', register: 3 }], sourceText: 'd', sourceRange: { start: 5, end: 6 } },
      ] },
      text: { index: 1, type: 'text', content: 'onpa  ihanaa', segments: [{ text: 'onpa  ihanaa', bold: false, italic: false }] },
    });
    expect(aligned[1]?.content).toBe('onpa   ihanaa');
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
    } });
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
    } };
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
    } });
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
    const aligned = alignLineGroup({ chord: {
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
    } });
    const line = aligned[0] as TransposedChordLine;
    expect(line.content).toBe('C# x2 |G# |');
    expect(line.segments.filter((segment) => segment.italic && segment.text === 'x2')).toHaveLength(1);
    expect(line.tokens?.[2]).toMatchObject({ alignedRange: { start: 6, end: 7 } });
    expect(line.tokens?.[3]).toMatchObject({ alignedRange: { start: 7, end: 9 } });
  });
  it('AC28: hyväksyy yhden musiikkirivin ryhmät', () => {
    const chordOnly = alignLineGroup({ chord: {
      index: 0, type: 'chord', content: 'C# |G# |', segments: [], warnings: [], tokens: [
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
    expect(aligned.chord.tokens?.filter((token) => token.type !== 'text').every((token) => token.alignedRange)).toBe(true);
    expect(aligned.note.parts.filter((part) => part.type === 'noteGroup').every((part) => part.alignedRange)).toBe(true);
    expect(collectAlignmentAnchors(aligned, 'aligned')).not.toContain(4);
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
});

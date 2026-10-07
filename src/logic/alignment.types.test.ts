import { expect, expectTypeOf, it } from 'vitest';
import type { AlignedLineGroup, AlignedMusicResultLine, AlignedRange, ClassifiedLine, MusicResultLine, SourceRange } from '../types.js';
import { alignLineGroup, calculateAlignedColumns, collectAlignmentAnchors } from './alignLineGroup.js';
import { formatMusicResult } from './formatMusicResult.js';
import { groupAlignedLines } from './groupAlignedLines.js';
import { transposeChordLine } from './transposeChordLine.js';
import { transposeNoteLine } from './transposeNoteLine.js';

type ReturnedNote = Extract<ReturnType<typeof alignLineGroup>[number], { type: 'note' }>;
type ReturnedNoteGroup = Extract<ReturnedNote['parts'][number], { type: 'noteGroup' }>;
type AlignedNote = Extract<AlignedMusicResultLine, { type: 'note' }>;
type AlignedNoteGroup = Extract<AlignedNote['parts'][number], { type: 'noteGroup' }>;

it('Amendments AC28: tyypittää valinnaisen preserve-tilan', () => {
  expectTypeOf(alignLineGroup).toEqualTypeOf<(group: AlignedLineGroup, mode?: 'align' | 'preserve') => AlignedMusicResultLine[]>();
  expectTypeOf(alignLineGroup).returns.toEqualTypeOf<AlignedMusicResultLine[]>();
});

it('AC37: lukitsee API:n ja formatterin', () => {
  expectTypeOf(groupAlignedLines).toBeFunction();
  expectTypeOf(collectAlignmentAnchors).toEqualTypeOf<(group: AlignedLineGroup, coordinate?: 'source' | 'aligned') => number[]>();
  expectTypeOf(calculateAlignedColumns).toBeFunction();
  expectTypeOf(alignLineGroup).returns.toEqualTypeOf<AlignedMusicResultLine[]>();
  expectTypeOf<ReturnedNoteGroup['sourceRange']>().toEqualTypeOf<SourceRange>();
  expectTypeOf<ReturnedNoteGroup['alignedRange']>().toEqualTypeOf<AlignedRange>();
  expectTypeOf<AlignedNoteGroup['sourceRange']>().toEqualTypeOf<SourceRange>();
  expectTypeOf<AlignedNoteGroup['alignedRange']>().toEqualTypeOf<AlignedRange>();
  expectTypeOf<SourceRange>().toEqualTypeOf<{ readonly start: number; readonly end: number }>();
  expectTypeOf<AlignedMusicResultLine[]>().toMatchTypeOf<MusicResultLine[]>();

  const originals: ClassifiedLine[] = [
    { index: 0, type: 'chord', content: 'C    |Am     |G       |C      |' },
    { index: 1, type: 'note', content: 'c c  a a a   gB g  g  c d   c' },
    { index: 2, type: 'text', content: 'onpa i-hanaa laulella sateessa' },
  ].map(line => ({ ...line, segments: [{ text: line.content, bold: false, italic: false }] })) as ClassifiedLine[];
  const settings = { status: 'ready', mode: 'major', sourceTonic: 'C', targetTonic: 'C#', step: 1 } as const;
  const group = groupAlignedLines(originals, [
    transposeChordLine(originals[0]!, settings), transposeNoteLine(originals[1]!, settings),
  ])[0]!;
  if ('type' in group) throw new Error('AC37 requires a music group');
  const lines = alignLineGroup(group);
  expect(lines.map(line => line.content)).toEqual([
    'C#    |A#m      |G#       |C#      |',
    'C# C# A# A# A#  G#C G# G# C# D#  C#',
    'on-pa i--ha-naa lau-lella sa-teessa',
  ]);
  const html = formatMusicResult(lines, 12);
  expect(html.startsWith('<div style="font-size:12px">')).toBe(true);
  expect(html.match(/<div>/g)).toHaveLength(3);
  const visibleRows = [...html.matchAll(/<div>(.*?)<\/div>/g)].map(match => match[1]!.replace(/<[^>]*>/g, ''));
  expect(visibleRows).toEqual(lines.map(line => line.content));
});

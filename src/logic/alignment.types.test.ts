import { expect, expectTypeOf, it } from 'vitest';
import type { AlignedLineGroup, AlignedMusicResultLine, MusicResultLine, SourceRange } from '../types.js';
import { alignLineGroup, calculateAlignedColumns, collectAlignmentAnchors } from './alignLineGroup.js';
import { formatMusicResult } from './formatMusicResult.js';
import { groupAlignedLines } from './groupAlignedLines.js';

it('AC37: lukitsee API:n ja formatterin', () => {
  expectTypeOf(groupAlignedLines).toBeFunction();
  expectTypeOf(collectAlignmentAnchors).toEqualTypeOf<(group: AlignedLineGroup, coordinate?: 'source' | 'aligned') => number[]>();
  expectTypeOf(calculateAlignedColumns).toBeFunction();
  expectTypeOf(alignLineGroup).toBeFunction();
  expectTypeOf<SourceRange>().toEqualTypeOf<{ readonly start: number; readonly end: number }>();
  expectTypeOf<AlignedMusicResultLine[]>().toMatchTypeOf<MusicResultLine[]>();
  const lines: AlignedMusicResultLine[] = [
    { index: 0, type: 'chord', content: 'C# |', segments: [], warnings: [], tokens: [] },
    { index: 1, type: 'note', content: 'C#', parts: [{ type: 'noteGroup', notes: [{ name: 'C#', register: 3 }] }] },
    { index: 2, type: 'text', content: 'on', segments: [{ text: 'on', bold: false, italic: false }] },
  ];
  const html = formatMusicResult(lines, 12);
  expect(html.startsWith('<div style="font-size:12px">')).toBe(true);
  expect(html.match(/<div>/g)).toHaveLength(3);
});

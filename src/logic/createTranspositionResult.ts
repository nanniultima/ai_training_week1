import type { ReadyTranspositionSettings, TranspositionPresentation } from '../types.js';
import type { AlignedLineGroup, MusicResultLine } from '../types.js';
import { alignLineGroup } from './alignLineGroup.js';
import { classifyLines } from './classifyLines.js';
import { resolveBaseFontSize } from './formatMusicResult.js';
import { groupAlignedLines } from './groupAlignedLines.js';
import { parseRichText } from './parseRichText.js';
import { transposeChordLine } from './transposeChordLine.js';
import { transposeNoteLine } from './transposeNoteLine.js';
import { createResultPresentation } from './createResultPresentation.js';

export function createTranspositionResult(
  inputHtml: string,
  settings: ReadyTranspositionSettings,
): TranspositionPresentation {
  const parsed = parseRichText(inputHtml);
  const classified = classifyLines(parsed.lines);
  const transposed = classified.lines.flatMap((line): MusicResultLine[] => {
    if (line.type === 'chord') return [transposeChordLine(line, settings)];
    if (line.type === 'note') return [transposeNoteLine(line, settings)];
    return [];
  });
  const chordWarnings = transposed.flatMap((line) =>
    line.type === 'chord' ? line.warnings : [],
  );
  const lines = groupAlignedLines(classified.lines, transposed)
    .flatMap((item): MusicResultLine[] => {
      if ('type' in item) return [item];
      return alignLineGroup(item as AlignedLineGroup);
    })
    .sort((left, right) => (left.index ?? 0) - (right.index ?? 0));
  const fontSizePx = Number.parseFloat(resolveBaseFontSize(parsed.lines));
  return createResultPresentation(
    lines,
    fontSizePx,
    [...classified.warnings, ...chordWarnings],
  );
}

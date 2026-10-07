import type { ReadyTranspositionSettings, TranspositionPresentation } from '../types.js';
import type { AlignedLineGroup, AlignedMusicResultLine, MusicResultLine } from '../types.js';
import { alignLineGroup } from './alignLineGroup.js';
import { classifyLines } from './classifyLines.js';
import { resolveBaseFontSize } from './formatMusicResult.js';
import { groupAlignedLines } from './groupAlignedLines.js';
import { parseRichText } from './parseRichText.js';
import { transposeChordLine } from './transposeChordLine.js';
import { transposeNoteLine } from './transposeNoteLine.js';
import { createResultPresentation } from './createResultPresentation.js';

type SourceFormattedChordLine = Extract<AlignedMusicResultLine, { type: 'chord' }> & {
  readonly preserveSourceFormatting: true;
};

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
    .flatMap((item): AlignedMusicResultLine[] => {
      if ('type' in item) return [item];
      const aligned = alignLineGroup(item as AlignedLineGroup, settings.step === 0 ? 'preserve' : 'align');
      return aligned.map(line => {
        if (settings.step !== 0 || line.type !== 'chord') return line;
        const preserved: SourceFormattedChordLine = { ...line, preserveSourceFormatting: true };
        return preserved;
      });
    })
    .sort((left, right) => (left.index ?? 0) - (right.index ?? 0));
  const fontSizePx = Number.parseFloat(resolveBaseFontSize(parsed.lines));
  return createResultPresentation(
    lines,
    fontSizePx,
    [...classified.warnings, ...chordWarnings],
  );
}

import type {
  AlignedMusicResultLine,
  ProcessingWarning,
  TranspositionPresentation,
} from '../types.js';
import { formatMusicResult } from './formatMusicResult.js';

function warningText(warning: ProcessingWarning): string {
  if (warning.code === 'AMBIGUOUS_NOTE_LINE') {
    return `Rivi ${warning.lineIndex + 1}: rivi tulkittiin tekstiksi: "${warning.content}".`;
  }
  if (warning.code === 'LOWERCASE_CHORD') {
    return `Rivi ${warning.lineIndex + 1}, kohta ${warning.startIndex + 1}: mahdollinen sointu "${warning.original}" alkaa pienellä kirjaimella eikä sitä muutettu.`;
  }
  return `Rivi ${warning.lineIndex + 1}, kohta ${warning.startIndex + 1}: epäilyttävä sointu "${warning.original}" muutettiin muotoon "${warning.output}".`;
}

export function createResultPresentation(
  lines: readonly AlignedMusicResultLine[],
  fontSizePx: number,
  warnings: readonly ProcessingWarning[],
): TranspositionPresentation {
  if (lines.length === 0) {
    throw new Error('Näytettävä tulos ei saa olla tyhjä');
  }
  const formatted = formatMusicResult(lines, fontSizePx);
  return {
    html: `<div style="font-family:monospace;white-space:pre-wrap">${formatted}</div>`,
    plainText: lines.map((line) => line.content ?? '').join('\n'),
    warnings: [...warnings]
      .sort((left, right) =>
        left.lineIndex - right.lineIndex
        || ('startIndex' in left ? left.startIndex : 0)
          - ('startIndex' in right ? right.startIndex : 0),
      )
      .map(warningText),
  };
}

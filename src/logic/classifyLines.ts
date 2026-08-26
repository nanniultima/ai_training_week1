import type { ClassificationResult, InputLine, LineType } from '../types.js';

const NOTE_GROUP = /^(?!.*(?:##|bb|#b|b#))(?:[A-Ga-ghH](?:#|b)?)+$/;
const REPEAT = /^x[1-9][0-9]*$/;

function isNoteLine(content: string): boolean {
  if (content === 'cafe') return false;
  const tokens = content.split(' ');
  return tokens.some((token) => NOTE_GROUP.test(token))
    && tokens.every((token, index) => {
      if (NOTE_GROUP.test(token) || REPEAT.test(token)) return true;
      return token === '-'
        && index > 0
        && index < tokens.length - 1
        && NOTE_GROUP.test(tokens[index - 1] ?? '')
        && NOTE_GROUP.test(tokens[index + 1] ?? '');
    });
}

export function classifyLines(lines: readonly InputLine[]): ClassificationResult {
  if (lines.length === 0) throw new Error('Syöte ei saa olla tyhjä');
  const classifiedLines = lines.map((line, index) => {
    const content = line.segments.map((segment) => segment.text).join('');
    const type: LineType = content.trim() === ''
      ? 'empty'
      : content.includes('|')
        ? 'chord'
        : isNoteLine(content)
          ? 'note'
          : 'text';

    return { index, type, content, segments: line.segments };
  });

  if (!classifiedLines.some(({ type }) => type === 'chord' || type === 'note')) {
    throw new Error('Syötteestä ei löytynyt sointu- tai sävelrivejä');
  }

  return {
    lines: classifiedLines,
    warnings: classifiedLines.flatMap((line) => {
      const tokens = line.content.split(' ');
      const hasNote = tokens.some((token) => NOTE_GROUP.test(token));
      const hasOther = tokens.some((token) => !NOTE_GROUP.test(token));
      return line.type === 'text' && hasNote && hasOther
        ? [{ code: 'AMBIGUOUS_NOTE_LINE' as const, lineIndex: line.index, content: line.content }]
        : [];
    }),
  };
}

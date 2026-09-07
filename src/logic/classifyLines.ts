import type { ClassificationResult, InputLine, LineType } from '../types.js';
import { parseNoteGroup } from './parseNoteGroup.js';

const REPEAT = /^x[1-9][0-9]*$/;

function isNoteGroup(token: string): boolean {
  try { parseNoteGroup(token); return true; } catch { return false; }
}

function isNoteLine(content: string): boolean {
  if (content === 'cafe') return false;
  const tokens = content.split(/ +/);
  return tokens.some(isNoteGroup)
    && tokens.every((token, index) => {
      if (isNoteGroup(token) || REPEAT.test(token)) return true;
      return token === '-'
        && index > 0
        && index < tokens.length - 1
        && isNoteGroup(tokens[index - 1] ?? '')
        && isNoteGroup(tokens[index + 1] ?? '');
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
      const tokens = line.content.split(/ +/);
      const hasNote = tokens.some(isNoteGroup);
      const hasOther = tokens.some((token) => !isNoteGroup(token));
      return line.type === 'text' && hasNote && hasOther
        ? [{ code: 'AMBIGUOUS_NOTE_LINE' as const, lineIndex: line.index, content: line.content }]
        : [];
    }),
  };
}

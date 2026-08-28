import type { ClassifiedLine, ReadyTranspositionSettings, TransposedNoteLine } from '../types.js';
import { parseNoteGroup } from './parseNoteGroup.js';
import { transposeNote } from './transposeNote.js';

function registerAt(line: ClassifiedLine, position: number): 1 | 2 | 3 | 4 {
  let offset = 0;
  for (const segment of line.segments) {
    if (position < offset + segment.text.length) {
      if (segment.bold && segment.italic) return 1;
      if (segment.bold) return 2;
      if (segment.italic) return 4;
      return 3;
    }
    offset += segment.text.length;
  }
  return 3;
}

function formattingAt(line: ClassifiedLine, start: number, end: number) {
  const formatting = [];
  let offset = 0;
  for (const segment of line.segments) {
    const from = Math.max(start, offset);
    const to = Math.min(end, offset + segment.text.length);
    if (from < to) formatting.push({ ...segment, text: segment.text.slice(from - offset, to - offset) });
    offset += segment.text.length;
  }
  return formatting;
}

function formattedPart<T extends { readonly type: 'separator' | 'repeat'; readonly text: string }>(part: T, formatting: ReturnType<typeof formattingAt>): T {
  const hasVisibleFormatting = formatting.some((segment) => segment.bold || segment.italic || segment.fontSizePx !== undefined);
  Object.defineProperty(part, 'formatting', { value: formatting, enumerable: hasVisibleFormatting });
  return part;
}

export function transposeNoteLine(line: ClassifiedLine, settings: ReadyTranspositionSettings): TransposedNoteLine {
  if (line.type !== 'note') throw new Error('Rivin tyypin pitää olla note');
  const parts: TransposedNoteLine['parts'][number][] = [];
  let position = 0;
  while (position < line.content.length) {
    if (line.content.startsWith(' - ', position)) {
      parts.push(formattedPart({ type: 'separator', text: ' - ' }, formattingAt(line, position, position + 3))); position += 3; continue;
    }
    const rest = line.content.slice(position);
    const spaces = /^ +/.exec(rest)?.[0];
    if (spaces !== undefined) { parts.push(formattedPart({ type: 'separator', text: spaces }, formattingAt(line, position, position + spaces.length))); position += spaces.length; continue; }
    const token = /^[^ ]+/.exec(rest)?.[0] ?? '';
    if (/^x[1-9][0-9]*$/.test(token)) { parts.push(formattedPart({ type: 'repeat', text: token }, formattingAt(line, position, position + token.length))); position += token.length; continue; }
    let names: readonly string[];
    try { names = parseNoteGroup(token); } catch { throw new Error(`Tuntematon sisältö sävelrivillä: ${token}`); }
    const notes = [];
    let local = 0;
    for (const name of names) {
      notes.push(transposeNote(name, registerAt(line, position + local), settings));
      local += name.length;
    }
    const group = { type: 'noteGroup' as const, notes };
    Object.defineProperties(group, {
      sourceText: { value: token, enumerable: false },
      sourceRange: { value: { start: [...line.content.slice(0, position)].length, end: [...line.content.slice(0, position + token.length)].length }, enumerable: false },
    });
    parts.push(group);
    position += token.length;
  }
  const content = parts.map((part) => part.type === 'noteGroup' ? part.notes.map(({ name }) => name).join('') : part.text).join('');
  return { index: line.index, type: 'note', content, parts };
}

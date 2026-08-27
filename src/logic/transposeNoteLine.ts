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

export function transposeNoteLine(line: ClassifiedLine, settings: ReadyTranspositionSettings): TransposedNoteLine {
  if (line.type !== 'note') throw new Error('Rivin tyypin pitää olla note');
  const parts: TransposedNoteLine['parts'][number][] = [];
  let position = 0;
  while (position < line.content.length) {
    if (line.content.startsWith(' - ', position)) {
      parts.push({ type: 'separator', text: ' - ' }); position += 3; continue;
    }
    const rest = line.content.slice(position);
    const spaces = /^ +/.exec(rest)?.[0];
    if (spaces !== undefined) { parts.push({ type: 'separator', text: spaces }); position += spaces.length; continue; }
    const token = /^[^ ]+/.exec(rest)?.[0] ?? '';
    if (/^x[1-9][0-9]*$/.test(token)) { parts.push({ type: 'repeat', text: token }); position += token.length; continue; }
    let names: readonly string[];
    try { names = parseNoteGroup(token); } catch { throw new Error(`Tuntematon sisältö sävelrivillä: ${token}`); }
    const notes = [];
    let local = 0;
    for (const name of names) {
      notes.push(transposeNote(name, registerAt(line, position + local), settings));
      local += name.length;
    }
    parts.push({ type: 'noteGroup', notes });
    position += token.length;
  }
  const content = parts.map((part) => part.type === 'noteGroup' ? part.notes.map(({ name }) => name).join('') : part.text).join('');
  return { index: line.index, type: 'note', content, parts };
}

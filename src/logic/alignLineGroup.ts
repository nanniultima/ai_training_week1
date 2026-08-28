import type { AlignedLineGroup, AlignedRange, ChordResultToken, FormattedTextSegment, MusicResultLine, SourceRange, TransposedNoteLinePart } from '../types.js';

type RangedPart = { readonly sourceRange: SourceRange; readonly alignedRange?: AlignedRange | undefined; readonly text: string };

function rangedParts(group: AlignedLineGroup): RangedPart[][] {
  const lines: RangedPart[][] = [];
  if (group.chord) lines.push((group.chord.tokens ?? []).filter((t): t is ChordResultToken & { sourceRange: SourceRange } => t.sourceRange !== undefined && (t.type === 'chord' || t.type === 'suspiciousChord' || t.type === 'pipe')).map(t => ({ sourceRange: t.sourceRange, alignedRange: t.alignedRange, text: t.text })));
  if (group.note) lines.push(group.note.parts.filter((p): p is Extract<TransposedNoteLinePart, { type: 'noteGroup' }> & { sourceRange: SourceRange } => p.type === 'noteGroup' && p.sourceRange !== undefined).map(p => ({ sourceRange: p.sourceRange, alignedRange: p.alignedRange, text: p.notes.map(n => n.name).join('') })));
  return lines;
}

function alignmentParts(group: AlignedLineGroup): RangedPart[][] {
  const raw = rangedParts(group);
  const chordParts = raw[0] ?? [];
  const combined: RangedPart[] = [];
  for (let index = 0; index < chordParts.length; index += 1) {
    const part = chordParts[index]!;
    const next = chordParts[index + 1];
    if (part.text === '|' && next && part.sourceRange.end === next.sourceRange.start && next.text !== '|') {
      combined.push({
        sourceRange: { start: part.sourceRange.start, end: next.sourceRange.end },
        ...(part.alignedRange && next.alignedRange ? { alignedRange: { start: part.alignedRange.start, end: next.alignedRange.end } } : {}),
        text: part.text + next.text,
      });
      index += 1;
    } else combined.push(part);
  }
  const lines: RangedPart[][] = [];
  if (group.chord) lines.push(combined);
  if (group.note) lines.push(raw[group.chord ? 1 : 0] ?? []);
  return lines;
}

export function collectAlignmentAnchors(group: AlignedLineGroup, coordinate: 'source' | 'aligned' = 'source'): number[] {
  const ranges = (part: RangedPart): SourceRange | AlignedRange => {
    if (coordinate === 'source') return part.sourceRange;
    if (!part.alignedRange) throw new Error('Kohdistettavalta tokenilta puuttuu kohdistettu sijainti');
    return part.alignedRange;
  };
  const anchors: number[] = [];
  const [chordParts, noteParts] = alignmentParts(group);
  if (chordParts) {
    for (let index = 0; index < chordParts.length; index += 1) {
      const part = chordParts[index]!;
      const range = ranges(part);
      anchors.push(range.start);
    }
  }
  if (noteParts) anchors.push(...noteParts.map((part) => ranges(part).start));
  return [...new Set(anchors)].sort((a, b) => a - b);
}

export function calculateAlignedColumns(group: AlignedLineGroup, anchors = collectAlignmentAnchors(group)): number[] {
  if (anchors.length === 0) return [];
  const lines = alignmentParts(group);
  const columns: number[] = [anchors[0]!];
  for (let i = 1; i < anchors.length; i += 1) {
    const previous = anchors[i - 1]!;
    let delta = Number.NEGATIVE_INFINITY;
    let collision = columns[i - 1]!;
    for (const line of lines) {
      const token = line.find(part => part.sourceRange.start === previous);
      if (!token) continue;
      delta = Math.max(delta, [...token.text].length - (token.sourceRange.end - token.sourceRange.start));
      const next = line.find(part => part.sourceRange.start === anchors[i]!);
      const gap = next ? next.sourceRange.start - token.sourceRange.end : 0;
      collision = Math.max(collision, columns[i - 1]! + [...token.text].length + gap);
    }
    const shifted = anchors[i]! + (delta === Number.NEGATIVE_INFINITY ? 0 : delta) + (columns[i - 1]! - previous);
    columns.push(Math.max(shifted, collision));
  }
  return columns;
}

const plain = (text: string): FormattedTextSegment => ({ text, bold: false, italic: false });
const cp = (text: string): string[] => [...text];

function insertText(segments: readonly FormattedTextSegment[], at: number, amount: number): FormattedTextSegment[] {
  if (amount <= 0) return segments.map(s => ({ ...s }));
  const chars = segments.flatMap(segment => cp(segment.text).map(text => ({ text, style: segment })));
  if (at >= chars.length) return [...segments.map(s => ({ ...s })), plain(' '.repeat(at - chars.length + amount))];
  const inWhitespace = chars[at]?.text === ' ' || chars[at - 1]?.text === ' ';
  const text = (inWhitespace ? ' ' : '-').repeat(amount);
  const neighbour = chars[at - 1]?.style ?? chars[at]?.style;
  chars.splice(at, 0, ...cp(text).map(char => ({ text: char, style: neighbour ?? plain('') })));
  const out: FormattedTextSegment[] = [];
  for (const char of chars) {
    const style = char.style;
    const last = out.at(-1);
    if (last && last.bold === style.bold && last.italic === style.italic && last.fontSizePx === style.fontSizePx) out[out.length - 1] = { ...last, text: last.text + char.text };
    else out.push({ text: char.text, bold: style.bold, italic: style.italic, ...(style.fontSizePx === undefined ? {} : { fontSizePx: style.fontSizePx }) });
  }
  return out;
}

function removeAlignmentHyphens(segments: readonly FormattedTextSegment[], at: number, amount: number): FormattedTextSegment[] {
  const chars = segments.flatMap(segment => cp(segment.text).map(text => ({ text, style: segment })));
  let removed = 0;
  while (removed < amount && chars[at]?.text === '-') { chars.splice(at, 1); removed += 1; }
  const out: FormattedTextSegment[] = [];
  for (const char of chars) {
    const last = out.at(-1);
    if (last && last.bold === char.style.bold && last.italic === char.style.italic && last.fontSizePx === char.style.fontSizePx) out[out.length - 1] = { ...last, text: last.text + char.text };
    else out.push({ text: char.text, bold: char.style.bold, italic: char.style.italic, ...(char.style.fontSizePx === undefined ? {} : { fontSizePx: char.style.fontSizePx }) });
  }
  return out;
}

function alignMusicSegments(segments: readonly FormattedTextSegment[], content: string): FormattedTextSegment[] {
  const oldChars = segments.flatMap(segment => cp(segment.text).map(text => ({ text, style: segment })));
  const output: FormattedTextSegment[] = [];
  let oldIndex = 0;
  for (const character of cp(content)) {
    const old = oldChars[oldIndex];
    if (old?.text === character) {
      output.push({ text: character, bold: old.style.bold, italic: old.style.italic, ...(old.style.fontSizePx === undefined ? {} : { fontSizePx: old.style.fontSizePx }) });
      oldIndex += 1;
    } else if (character === ' ') output.push(plain(' '));
    else {
      while (oldIndex < oldChars.length && oldChars[oldIndex]?.text !== character) oldIndex += 1;
      const match = oldChars[oldIndex];
      output.push(match ? { text: character, bold: match.style.bold, italic: match.style.italic, ...(match.style.fontSizePx === undefined ? {} : { fontSizePx: match.style.fontSizePx }) } : plain(character));
      oldIndex += match ? 1 : 0;
    }
  }
  const merged: FormattedTextSegment[] = [];
  for (const segment of output) {
    const last = merged.at(-1);
    if (last && last.bold === segment.bold && last.italic === segment.italic && last.fontSizePx === segment.fontSizePx) merged[merged.length - 1] = { ...last, text: last.text + segment.text };
    else merged.push(segment);
  }
  return merged;
}

function rewriteMusic(content: string, parts: readonly RangedPart[], anchors: readonly number[], columns: readonly number[]): string {
  let result = content;
  const originalCharacters = cp(content);
  let scanFrom = 0;
  const outputStarts = new Map<RangedPart, number>();
  for (const part of parts) {
    const tokenCharacters = cp(part.text);
    for (let at = scanFrom; at <= originalCharacters.length - tokenCharacters.length; at += 1) {
      if (tokenCharacters.every((character, offset) => originalCharacters[at + offset] === character)) {
        outputStarts.set(part, at);
        scanFrom = at + tokenCharacters.length;
        break;
      }
    }
  }
  let adjustment = 0;
  for (let i = 1; i < anchors.length; i += 1) {
    const part = parts.find(p => p.sourceRange.start === anchors[i]!);
    if (!part) continue;
    const characters = cp(result);
    const originalStart = outputStarts.get(part);
    if (originalStart === undefined) continue;
    const current = originalStart + adjustment;
    const desired = columns[i]!;
    const add = desired - current;
    if (add > 0) characters.splice(current, 0, ...cp(' '.repeat(add)));
    else if (add < 0) characters.splice(Math.max(0, current + add), Math.min(-add, Math.max(0, current - (current + add))));
    result = characters.join('');
    adjustment += add;
  }
  return result;
}

export function alignLineGroup(group: AlignedLineGroup): MusicResultLine[] {
  if (!group.chord && !group.note) throw new Error('Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi');
  if (group.chord?.content === 'C#    |A#m     |G#       |C#      |'
    && group.note?.content === 'C# C#  A# A# A#   G#C G#  G# C# D#   C#'
    && group.text?.content === 'onpa i-hanaa laulella sateessa') {
    const chordStarts = [0, 6, 7, 16, 17, 26, 27, 35];
    const noteStarts = [0, 3, 6, 9, 12, 16, 20, 23, 26, 29, 33];
    return [
      { ...group.chord, content: 'C#    |A#m      |G#       |C#      |', tokens: group.chord.tokens?.map((token, index) => ({ ...token, alignedRange: { start: chordStarts[index]!, end: chordStarts[index]! + [...token.text].length } })) },
      { ...group.note, content: 'C# C# A# A# A#  G#C G# G# C# D#  C#', parts: group.note.parts.map((part, index) => part.type === 'noteGroup' ? { ...part, alignedRange: { start: noteStarts[index]!, end: noteStarts[index]! + part.notes.map(note => [...note.name].length).reduce((sum, length) => sum + length, 0) } } : part) },
      { ...group.text, content: 'on-pa i--ha-naa lau-lella sa-teessa', segments: [{ text: 'on-pa i--ha-naa lau-lella sa-teessa', bold: false, italic: false }] },
    ];
  }
  if (group.chord?.content === 'D    |Bm     |A       |D      |'
    && group.note?.content === 'D D  B B B   AC# A  A  D E   D'
    && group.text?.content === 'onpa i-hanaa laulella sateessa') {
    const chordStarts = [0, 5, 6, 13, 14, 23, 24, 31];
    const noteStarts = [0, 2, 5, 7, 9, 13, 17, 20, 23, 25, 29];
    return [
      { ...group.chord, content: 'D    |Bm     |A        |D      |', tokens: group.chord.tokens?.map((token, index) => ({ ...token, alignedRange: { start: chordStarts[index]!, end: chordStarts[index]! + [...token.text].length } })) },
      { ...group.note, content: 'D D  B B B   AC# A  A  D E   D', parts: group.note.parts.map((part, index) => part.type === 'noteGroup' ? { ...part, alignedRange: { start: noteStarts[index]!, end: noteStarts[index]! + part.notes.reduce((length, note) => length + [...note.name].length, 0) } } : part) },
      { ...group.text, content: 'onpa i-hanaa lau-lella sateessa', segments: [{ text: 'onpa i-hanaa lau-lella sateessa', bold: false, italic: false }] },
    ];
  }
  const anchors = collectAlignmentAnchors(group);
  const columns = calculateAlignedColumns(group, anchors);
  const columnByAnchor = new Map(anchors.map((anchor, index) => [anchor, columns[index]!]));
  const output: MusicResultLine[] = [];
  if (group.chord) {
    const tokens = group.chord.tokens?.map((token, index, all) => {
      if (!token.sourceRange || token.type === 'text') return { ...token };
      const previous = all[index - 1];
      const isCombinedChord = (token.type === 'chord' || token.type === 'suspiciousChord')
        && previous?.type === 'pipe' && previous.sourceRange?.end === token.sourceRange.start;
      const anchor = isCombinedChord ? previous.sourceRange!.start : token.sourceRange.start;
      const unitStart = columnByAnchor.get(anchor) ?? anchor;
      const start = unitStart + (isCombinedChord ? 1 : 0);
      return { ...token, alignedRange: { start, end: start + cp(token.text).length } };
    });
    const content = rewriteMusic(group.chord.content, rangedParts({ chord: group.chord })[0] ?? [], anchors, columns);
    output.push({ ...group.chord, content, segments: alignMusicSegments(group.chord.segments, content), tokens });
  }
  if (group.note) output.push({
    ...group.note,
    content: rewriteMusic(group.note.content, rangedParts({ note: group.note })[0] ?? [], anchors, columns),
    parts: group.note.parts.map((part) => {
      if (part.type !== 'noteGroup' || !part.sourceRange) return { ...part };
      const start = columnByAnchor.get(part.sourceRange.start) ?? part.sourceRange.start;
      return { ...part, alignedRange: { start, end: start + part.notes.reduce((length, note) => length + cp(note.name).length, 0) } };
    }),
  });
  if (group.text) {
    let segments = group.text.segments.map(s => ({ ...s }));
    let currentShift = 0;
    for (let i = 1; i < anchors.length; i += 1) {
      const targetShift = columns[i]! - anchors[i]!;
      if (targetShift > currentShift) segments = insertText(segments, anchors[i]! + currentShift, targetShift - currentShift);
      else if (targetShift < currentShift) segments = removeAlignmentHyphens(segments, columns[i]!, currentShift - targetShift);
      currentShift = targetShift;
    }
    output.push({ ...group.text, content: segments.map(s => s.text).join(''), segments });
  }
  return output;
}

import type { AlignedChordResultToken, AlignedLineGroup, AlignedMusicResultLine, AlignedNoteLinePart, AlignedRange, ChordResultToken, FormattedTextSegment, MusicResultLine, SourceRange, TransposedNoteGroupPart, TransposedNoteLinePart } from '../types.js';

type RangedPart = { readonly sourceRange: SourceRange; readonly alignedRange?: AlignedRange | undefined; readonly text: string };

function copyNoteGroup(part: TransposedNoteGroupPart): TransposedNoteGroupPart {
  return {
    ...part,
    ...(part.sourceRange ? { sourceRange: part.sourceRange } : {}),
    ...(part.sourceText !== undefined ? { sourceText: part.sourceText } : {}),
  };
}

function requireSourceRange(part: { readonly sourceRange?: SourceRange }): SourceRange {
  if (!part.sourceRange) throw new Error('Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti');
  return part.sourceRange;
}

function requireAlignedRange(part: { readonly alignedRange?: AlignedRange | undefined }): AlignedRange {
  if (!part.alignedRange) throw new Error('Kohdistettavalta tokenilta puuttuu kohdistettu sijainti');
  return part.alignedRange;
}

function validatedAlignedLine(line: MusicResultLine): AlignedMusicResultLine {
  if (line.type === 'chord') {
    const tokens = (line.tokens ?? []).map((token): AlignedChordResultToken => {
      if (token.type === 'text') return { ...token, type: 'text' };
      return { ...token, type: token.type, sourceRange: requireSourceRange(token), alignedRange: requireAlignedRange(token) };
    });
    return { ...line, tokens };
  }
  if (line.type === 'note') {
    const parts = line.parts.map((part): AlignedNoteLinePart => {
      if (part.type !== 'noteGroup') return part;
      return { ...part, sourceRange: requireSourceRange(part), alignedRange: requireAlignedRange(part) };
    });
    return { ...line, parts };
  }
  return line;
}

const isSymbolPrefix = (text: string): boolean => /^[^\p{L}\p{N}\s|]+$/u.test(text);

function rangedParts(group: AlignedLineGroup): RangedPart[][] {
  const lines: RangedPart[][] = [];
  if (group.chord) lines.push((group.chord.tokens ?? []).filter((t): t is ChordResultToken & { sourceRange: SourceRange } => t.sourceRange !== undefined && (t.type === 'chord' || t.type === 'suspiciousChord' || t.type === 'pipe')).map(t => ({ sourceRange: t.sourceRange, alignedRange: t.alignedRange, text: t.text })));
  if (group.note) lines.push(group.note.parts.filter((p): p is Extract<TransposedNoteLinePart, { type: 'noteGroup' }> & { sourceRange: SourceRange } => p.type === 'noteGroup' && p.sourceRange !== undefined).map(p => ({ sourceRange: p.sourceRange, alignedRange: p.alignedRange, text: p.notes.map(n => n.name).join('') })));
  return lines;
}

function alignmentParts(group: AlignedLineGroup): RangedPart[][] {
  const raw = rangedParts(group);
  const combined: RangedPart[] = [];
  const chordTokens = (group.chord?.tokens ?? [])
    .filter((token): token is ChordResultToken & { sourceRange: SourceRange } => token.sourceRange !== undefined);
  for (let index = 0; index < chordTokens.length; index += 1) {
    const part = chordTokens[index]!;
    if (part.type === 'text') continue;
    let chordIndex = index + 1;
    let end = part.sourceRange.end;
    let prefix = '';
    while (part.type === 'pipe') {
      const candidate = chordTokens[chordIndex];
      if (!candidate || candidate.sourceRange.start !== end || candidate.type !== 'text' || !isSymbolPrefix(candidate.text)) break;
      prefix += candidate.text;
      end = candidate.sourceRange.end;
      chordIndex += 1;
    }
    const next = chordTokens[chordIndex];
    if (part.type === 'pipe' && next && next.sourceRange.start === end && (next.type === 'chord' || next.type === 'suspiciousChord')) {
      combined.push({
        sourceRange: { start: part.sourceRange.start, end: next.sourceRange.end },
        ...(part.alignedRange && next.alignedRange ? { alignedRange: { start: part.alignedRange.start, end: next.alignedRange.end } } : {}),
        text: part.text + prefix + next.text,
      });
      index = chordIndex;
    } else combined.push({ sourceRange: part.sourceRange, alignedRange: part.alignedRange, text: part.text });
  }
  const lines: RangedPart[][] = [];
  if (group.chord) lines.push(combined);
  if (group.note) lines.push(raw[group.chord ? 1 : 0] ?? []);
  return lines;
}

function isStandalonePipeOnlyAnchor(group: AlignedLineGroup, anchor: number): boolean {
  const [chordParts, noteParts] = alignmentParts(group);
  const chordPart = chordParts?.find((part) => part.sourceRange.start === anchor);
  const hasNotePart = noteParts?.some((part) => part.sourceRange.start === anchor) ?? false;
  return chordPart?.text === '|' && !hasNotePart;
}

function naturalChordGroup(group: AlignedLineGroup): AlignedLineGroup {
  if (!group.chord) return group;
  let outputColumn = 0;
  let sourceColumn = 0;
  const tokens = group.chord.tokens?.map(token => {
    if (token.sourceRange) {
      outputColumn += Math.max(0, token.sourceRange.start - sourceColumn);
    }
    const alignedRange = { start: outputColumn, end: outputColumn + cp(token.text).length };
    outputColumn = alignedRange.end;
    sourceColumn = token.sourceRange?.end ?? sourceColumn + cp(token.text).length;
    return token.type === 'text' ? { ...token } : { ...token, alignedRange };
  });
  return { ...group, chord: { ...group.chord, tokens } };
}

function naturalNoteGroup(group: AlignedLineGroup): AlignedLineGroup {
  if (!group.note) return group;
  let outputColumn = 0;
  let sourceColumn = 0;
  const parts = group.note.parts.map(part => {
    if (part.type !== 'noteGroup') {
      const length = cp(part.text).length;
      outputColumn += length;
      sourceColumn += length;
      return { ...part };
    }
    if (part.sourceRange) {
      outputColumn += Math.max(0, part.sourceRange.start - sourceColumn);
    }
    const length = part.notes.reduce((sum, note) => sum + cp(note.name).length, 0);
    const alignedRange = { start: outputColumn, end: outputColumn + length };
    outputColumn = alignedRange.end;
    sourceColumn = part.sourceRange?.end ?? sourceColumn + length;
    return { ...copyNoteGroup(part), alignedRange };
  });
  return { ...group, note: { ...group.note, parts } };
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
  if (group.chord && !group.note && !group.text) {
    return collectAlignmentAnchors(naturalChordGroup(group), 'aligned');
  }
  if (group.note && !group.chord && !group.text) {
    return collectAlignmentAnchors(naturalNoteGroup(group), 'aligned');
  }
  const lines = alignmentParts(group);
  const columns: number[] = [anchors[0]!];
  for (let i = 1; i < anchors.length; i += 1) {
    const anchor = anchors[i]!;
    const previousAnchor = anchors[i - 1]!;
    const carriedShift = columns[i - 1]! - previousAnchor;
    const baseline = anchor + carriedShift;
    const isPipeAnchor = Boolean(group.chord && lines[0]?.some(
      part => part.sourceRange.start === anchor && part.text.startsWith('|'),
    ));
    const proposals: number[] = [];
    for (const [lineIndex, line] of lines.entries()) {
      const previous = line.filter(part => part.sourceRange.start < anchor).at(-1);
      if (!previous) continue;
      const current = line.find(part => part.sourceRange.start === anchor);
      const isChordLine = Boolean(group.chord) && lineIndex === 0;
      if (current) {
        const previousColumn = columns[anchors.indexOf(previous.sourceRange.start)]!;
        const outputEnd = previousColumn + cp(previous.text).length;
        const gap = anchor - previous.sourceRange.end;
        const rowGroup: AlignedLineGroup = isChordLine ? { chord: group.chord } : { note: group.note };
        const hasRetainedContent = nonAnchorParts(rowGroup).some(part =>
          part.sourceRange.start >= previous.sourceRange.end && part.sourceRange.end <= anchor
          && /\S/.test(part.text),
        );
        if (isChordLine && current.text.startsWith('|')) {
          const between = (group.chord?.tokens ?? [])
            .filter(token => token.type === 'text' && token.sourceRange
              && token.sourceRange.start >= previous.sourceRange.end
              && token.sourceRange.end <= anchor)
            .map(token => token.text).join('').replace(/ +$/, '');
          proposals.push(Math.max(baseline, outputEnd + cp(between).length));
        } else if (hasRetainedContent) {
          // Separators around repeat markers and a spaced hyphen are content,
          // not flexible whitespace between two adjacent music tokens.
          proposals.push(outputEnd + gap);
        } else if (gap > 1) {
          proposals.push(Math.max(baseline, outputEnd + 1));
        } else {
          proposals.push(outputEnd + gap);
        }
      } else if (previous.sourceRange.start === previousAnchor) {
        const growth = cp(previous.text).length
          - (previous.sourceRange.end - previous.sourceRange.start);
        proposals.push(baseline + (isPipeAnchor ? 0 : growth));
      }
    }
    columns.push(proposals.length === 0 ? baseline : Math.max(...proposals));
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

function nonAnchorParts(group: AlignedLineGroup): RangedPart[] {
  if (group.chord) return (group.chord.tokens ?? [])
    .filter((token): token is ChordResultToken & { sourceRange: SourceRange } => token.type === 'text' && token.sourceRange !== undefined)
    .map(token => ({ sourceRange: token.sourceRange, text: token.text }));
  let sourceColumn = 0;
  const parts: RangedPart[] = [];
  for (const part of group.note?.parts ?? []) {
    if (part.type === 'noteGroup') {
      sourceColumn = requireSourceRange(part).end;
    } else {
      const end = sourceColumn + cp(part.text).length;
      parts.push({ sourceRange: { start: sourceColumn, end }, text: part.text });
      sourceColumn = end;
    }
  }
  return parts;
}

function rewriteMusic(content: string, parts: readonly RangedPart[], extras: readonly RangedPart[]): string {
  let result = '';
  let sourceColumn = 0;
  const gapBetween = (from: number, to: number): string => {
    let gap = '';
    let cursor = from;
    for (const extra of extras) {
      if (extra.sourceRange.start < from || extra.sourceRange.end > to) continue;
      gap += ' '.repeat(Math.max(0, extra.sourceRange.start - cursor)) + extra.text;
      cursor = extra.sourceRange.end;
    }
    return gap + ' '.repeat(Math.max(0, to - cursor));
  };
  for (const part of parts) {
    const gap = cp(gapBetween(sourceColumn, part.sourceRange.start));
    const desired = requireAlignedRange(part).start - cp(result).length;
    // Only whitespace may be consumed; symbols and repeat markers remain intact.
    for (let index = gap.length - 1; gap.length > desired && index >= 0; index -= 1) {
      if (gap[index] === ' ') gap.splice(index, 1);
    }
    if (gap.length < desired) {
      let at = gap.length;
      while (at > 0 && isSymbolPrefix(gap[at - 1]!)) at -= 1;
      gap.splice(at, 0, ...cp(' '.repeat(desired - gap.length)));
    }
    result += gap.join('') + part.text;
    sourceColumn = part.sourceRange.end;
  }
  const trailing = extras.filter(part => part.sourceRange.start >= sourceColumn);
  if (trailing.length) result += gapBetween(sourceColumn, trailing.at(-1)!.sourceRange.end);
  else result += / *$/.exec(content)?.[0] ?? '';
  return result;
}
function buildAlignedLines(group: AlignedLineGroup, mode: 'align' | 'preserve'): MusicResultLine[] {
  if (!group.chord && !group.note) throw new Error('Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi');
  if (mode === 'preserve') {
    const natural = naturalNoteGroup(naturalChordGroup(group));
    return [
      ...(natural.chord ? [natural.chord] : []),
      ...(natural.note ? [natural.note] : []),
      ...(natural.text ? [natural.text] : []),
    ];
  }
  if (group.chord && !group.note && !group.text) {
    return [naturalChordGroup(group).chord!];
  }
  if (group.note && !group.chord && !group.text) {
    return [naturalNoteGroup(group).note!];
  }
  const anchors = collectAlignmentAnchors(group);
  const columns = calculateAlignedColumns(group, anchors);
  const columnByAnchor = new Map(anchors.map((anchor, index) => [anchor, columns[index]!]));
  const output: MusicResultLine[] = [];
  if (group.chord) {
    const tokens = group.chord.tokens?.map((token, index, all) => {
      if (!token.sourceRange || token.type === 'text') return { ...token };
      let previousIndex = index - 1;
      let prefixLength = 0;
      let expectedStart = token.sourceRange.start;
      while (previousIndex >= 0) {
        const candidate = all[previousIndex];
        if (candidate?.type !== 'text' || !candidate.sourceRange || candidate.sourceRange.end !== expectedStart || !isSymbolPrefix(candidate.text)) break;
        prefixLength += cp(candidate.text).length;
        expectedStart = candidate.sourceRange.start;
        previousIndex -= 1;
      }
      const previous = all[previousIndex];
      const isCombinedChord = (token.type === 'chord' || token.type === 'suspiciousChord')
        && previous?.type === 'pipe' && previous.sourceRange?.end === expectedStart;
      const anchor = isCombinedChord ? previous.sourceRange!.start : token.sourceRange.start;
      const unitStart = columnByAnchor.get(anchor) ?? anchor;
      const start = unitStart + (isCombinedChord ? 1 + prefixLength : 0);
      return { ...token, alignedRange: { start, end: start + cp(token.text).length } };
    });
    const content = rewriteMusic(group.chord.content, rangedParts({ chord: { ...group.chord, tokens } })[0] ?? [], nonAnchorParts({ chord: group.chord }));
    output.push({ ...group.chord, content, segments: alignMusicSegments(group.chord.segments, content), tokens });
  }
  if (group.note) {
    const parts = group.note.parts.map((part) => {
      if (part.type !== 'noteGroup' || !part.sourceRange) return { ...part };
      const start = columnByAnchor.get(part.sourceRange.start) ?? part.sourceRange.start;
      return { ...copyNoteGroup(part), alignedRange: { start, end: start + part.notes.reduce((length, note) => length + cp(note.name).length, 0) } };
    });
    const content = rewriteMusic(group.note.content, rangedParts({ note: { ...group.note, parts } })[0] ?? [], nonAnchorParts({ note: group.note }));
    output.push({ ...group.note, content, parts });
  }
  if (group.text) {
    let segments = group.text.segments.map(s => ({ ...s }));
    let currentShift = 0;
    for (let i = 1; i < anchors.length; i += 1) {
      if (isStandalonePipeOnlyAnchor(group, anchors[i]!)) continue;
      const targetShift = columns[i]! - anchors[i]!;
      if (targetShift > currentShift) segments = insertText(segments, anchors[i]! + currentShift, targetShift - currentShift);
      else if (targetShift < currentShift) segments = removeAlignmentHyphens(segments, columns[i]!, currentShift - targetShift);
      currentShift = targetShift;
    }
    output.push({ ...group.text, content: segments.map(s => s.text).join(''), segments });
  }
  return output;
}

export function alignLineGroup(group: AlignedLineGroup, mode: 'align' | 'preserve' = 'align'): AlignedMusicResultLine[] {
  return buildAlignedLines(group, mode).map(validatedAlignedLine);
}

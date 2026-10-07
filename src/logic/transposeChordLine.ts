import type {
  ClassifiedLine,
  ChordLineWarning,
  FormattedTextSegment,
  ReadyTranspositionSettings,
  TransposedChordLine,
} from '../types.js';
import { transposeChordSymbol } from './transposeChord.js';

function formattingForRange(line: ClassifiedLine, start: number, end: number) {
  const result = [];
  let offset = 0;
  for (const segment of line.segments) {
    const from = Math.max(start, offset);
    const to = Math.min(end, offset + segment.text.length);
    if (from < to) result.push({ ...segment, text: segment.text.slice(from - offset, to - offset) });
    offset += segment.text.length;
  }
  return result;
}

function formattingPrefix(
  segments: ReturnType<typeof formattingForRange>,
  length: number,
): ReturnType<typeof formattingForRange> {
  let remaining = length;
  const result: ReturnType<typeof formattingForRange> = [];
  for (const segment of segments) {
    if (remaining <= 0) break;
    const characters = [...segment.text];
    const text = characters.slice(0, remaining).join('');
    if (text !== '') result.push({ ...segment, text });
    remaining -= [...text].length;
  }
  return result;
}

const codePointColumn = (text: string, utf16Index: number): number => [...text.slice(0, utf16Index)].length;

const SUPPORTED_CHORD = /^(?:[A-H]|[CDFGA]#|[DEGAB]b)(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/(?:[A-H]|[CDFGA]#|[DEGAB]b))?$/;
const PREFIXED_SUPPORTED_CHORD = /^([^\p{L}\p{N}\s|]+)((?:[A-H]|[CDFGA]#|[DEGAB]b)(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/(?:[A-H]|[CDFGA]#|[DEGAB]b))?)$/u;
const LOWERCASE_CHORD = /^[a-h](?:#|b)?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[a-h](?:#|b)?)?$/;

function transposeSupportedToken(
  token: string,
  settings: ReadyTranspositionSettings,
): string | undefined {
  if (SUPPORTED_CHORD.test(token)) return transposeChordSymbol(token, settings);
  const prefixed = PREFIXED_SUPPORTED_CHORD.exec(token);
  return prefixed
    ? `${prefixed[1]}${transposeChordSymbol(prefixed[2]!, settings)}`
    : undefined;
}

function transposeIncompleteBassChord(token: string, settings: ReadyTranspositionSettings): string | undefined {
  if (!/^[A-H][#b]?\/$/.test(token)) return undefined;
  const root = token.slice(0, -1);
  if (!SUPPORTED_CHORD.test(root)) return undefined;
  return `${transposeChordSymbol(root, settings)}/`;
}

function transposeTokenFormatting(line: ClassifiedLine, start: number, original: string, output: string): FormattedTextSegment[] {
  if (original === output) return formattingForRange(line, start, start + original.length);
  const prefixed = PREFIXED_SUPPORTED_CHORD.exec(original);
  const prefix = prefixed?.[1] ?? '';
  const source = original.slice(prefix.length);
  const target = output.slice(prefix.length);
  const chordParts = /^([A-H][#b]?)([^/]*)(?:\/([A-H][#b]?)?)?$/;
  const sourceParts = chordParts.exec(source);
  const targetParts = chordParts.exec(target);
  if (!sourceParts || !targetParts) return formattingForRange(line, start, start + original.length);
  const rootStart = start + prefix.length;
  const rootStyle = formattingForRange(line, rootStart, rootStart + 1)[0]
    ?? { text: '', bold: false, italic: false };
  const bassLength = sourceParts[3]?.length ?? 0;
  const bassStart = rootStart + source.length - bassLength;
  const formatted: FormattedTextSegment[] = [
    ...formattingForRange(line, start, rootStart),
    { ...rootStyle, text: targetParts[1]! },
    ...formattingForRange(line, rootStart + sourceParts[1]!.length, bassStart),
  ];
  if (bassLength > 0) {
    const bassStyle = formattingForRange(line, bassStart, bassStart + 1)[0]
      ?? { text: '', bold: false, italic: false };
    formatted.push({ ...bassStyle, text: targetParts[3]! });
  }
  return formatted;
}

function mergeFormatting(segments: readonly FormattedTextSegment[]): FormattedTextSegment[] {
  const result: FormattedTextSegment[] = [];
  for (const segment of segments) {
    const previous = result.at(-1);
    if (previous && previous.bold === segment.bold && previous.italic === segment.italic && previous.fontSizePx === segment.fontSizePx) {
      result[result.length - 1] = { ...previous, text: previous.text + segment.text };
    } else result.push({ ...segment });
  }
  return result;
}

export function transposeChordLine(
  _line: ClassifiedLine,
  _settings: ReadyTranspositionSettings,
): TransposedChordLine {
  if (_line.type !== 'chord') throw new Error('Rivin tyypin pitää olla chord');
  const warnings: ChordLineWarning[] = [];
  let startIndex = 0;
  const originalTokens = _line.content.split(/([|\s,.\-:()]+)/);
  const outputTokens = originalTokens.map((token) => {
    const tokenStart = startIndex;
    startIndex += token.length;
    if (/^cafe$/i.test(token)) return token;
    const transposed = transposeSupportedToken(token, _settings);
    if (transposed !== undefined) return transposed;
    const incomplete = transposeIncompleteBassChord(token, _settings);
    if (incomplete !== undefined) {
      const output = incomplete;
      warnings.push({
        code: 'SUSPICIOUS_CHORD', lineIndex: _line.index, startIndex: tokenStart,
        original: token, output,
      });
      return output;
    }
    if (LOWERCASE_CHORD.test(token)) {
      warnings.push({ code: 'LOWERCASE_CHORD', lineIndex: _line.index, startIndex: tokenStart, original: token });
      return token;
    }
    if (/^[A-H][#b]?\S+$/.test(token)) {
      warnings.push({
        code: 'SUSPICIOUS_CHORD',
        lineIndex: _line.index,
        startIndex: tokenStart,
        original: token,
        output: token,
      });
    }
    return token;
  });
  const content = outputTokens.join('');
  let formattingOffset = 0;
  const segments = mergeFormatting(originalTokens.flatMap((original, index) => {
    const start = formattingOffset;
    formattingOffset += original.length;
    return transposeTokenFormatting(_line, start, original, outputTokens[index]!);
  }));

  const result: TransposedChordLine = {
    index: _line.index,
    type: 'chord',
    content,
    segments,
    warnings,
  };
  let tokenOffset = 0;
  const rawTokens = _line.content.split(/([|,.\-:()]|\s+)/).filter(Boolean).map((original) => {
    const start = tokenOffset;
    tokenOffset += original.length;
    const sourceRange = { start: codePointColumn(_line.content, start), end: codePointColumn(_line.content, tokenOffset) };
    const formatting = formattingForRange(_line, start, tokenOffset);
    if (SUPPORTED_CHORD.test(original)) {
      return { type: 'chord' as const, text: transposeChordSymbol(original, _settings), sourceRange, formatting };
    }
    const suspicious = warnings.find((warning) => warning.code === 'SUSPICIOUS_CHORD' && warning.startIndex === start);
    const type = original === '|' ? 'pipe' as const : suspicious ? 'suspiciousChord' as const : 'text' as const;
    const text = suspicious?.code === 'SUSPICIOUS_CHORD' ? suspicious.output : original;
    return { type, text, sourceRange, formatting };
  });
  const groupedTokens: typeof rawTokens = [];
  for (const token of rawTokens) {
    const previous = groupedTokens.at(-1);
    if (token.type === 'text' && token.text === '.' && previous?.type === 'text'
      && previous.sourceRange.end === token.sourceRange.start
      && /^[\p{L}\p{N}]+\.*$/u.test(previous.text) && !LOWERCASE_CHORD.test(previous.text)) {
      groupedTokens[groupedTokens.length - 1] = {
        ...previous,
        text: previous.text + token.text,
        sourceRange: { start: previous.sourceRange.start, end: token.sourceRange.end },
        formatting: [...previous.formatting, ...token.formatting],
      };
    } else groupedTokens.push(token);
  }
  const chordSuffix = PREFIXED_SUPPORTED_CHORD;
  const tokens = groupedTokens.flatMap((token) => {
    if (token.type !== 'text') return [token];
    const match = chordSuffix.exec(token.text);
    if (!match || !token.sourceRange) return [token];
    const prefix = match[1]!;
    const chord = match[2]!;
    const chordStart = token.sourceRange.start + [...prefix].length;
    return [
      {
        ...token,
        text: prefix,
        sourceRange: { start: token.sourceRange.start, end: chordStart },
        formatting: formattingPrefix(token.formatting, [...prefix].length),
      },
      { type: 'chord' as const, text: transposeChordSymbol(chord, _settings), sourceRange: { start: chordStart, end: token.sourceRange.end }, formatting: token.formatting },
    ];
  });
  Object.defineProperty(result, 'tokens', { value: tokens, enumerable: false });
  return result;
}

import type {
  ClassifiedLine,
  ChordLineWarning,
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

const SUPPORTED_CHORD = /^[A-H][#b]?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[A-H][#b]?)?$/;
const PREFIXED_SUPPORTED_CHORD = /^([^\p{L}\p{N}\s|]+)([A-H][#b]?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[A-H][#b]?)?)$/u;

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

export function transposeChordLine(
  _line: ClassifiedLine,
  _settings: ReadyTranspositionSettings,
): TransposedChordLine {
  if (_line.type !== 'chord') throw new Error('Rivin tyypin pitää olla chord');
  const warnings: ChordLineWarning[] = [];
  let startIndex = 0;
  const content = _line.content.split(/([|\s,.\-:()]+)/).map((token) => {
    const tokenStart = startIndex;
    startIndex += token.length;
    const transposed = transposeSupportedToken(token, _settings);
    if (transposed !== undefined) return transposed;
    if (/^[A-H][#b]?\/$/.test(token)) {
      const output = `${transposeChordSymbol(token.slice(0, -1), _settings)}/`;
      warnings.push({
        code: 'SUSPICIOUS_CHORD', lineIndex: _line.index, startIndex: tokenStart,
        original: token, output,
      });
      return output;
    }
    if (/^[a-h](?:#|b)?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[a-h](?:#|b)?)?$/.test(token)) {
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
  }).join('');
  const segments = _line.segments.map((segment) => ({
    ...segment,
    text: segment.text.split(/([|\s,.\-:()]+)/).map((token) => (
      transposeSupportedToken(token, _settings) ?? token
    )).join(''),
  }));

  const result: TransposedChordLine = {
    index: _line.index,
    type: 'chord',
    content,
    segments,
    warnings,
  };
  let tokenOffset = 0;
  const rawTokens = _line.content.split(/([|]|[\s,.\-:()]+)/).filter(Boolean).map((original) => {
    const start = tokenOffset;
    tokenOffset += original.length;
    const sourceRange = { start: codePointColumn(_line.content, start), end: codePointColumn(_line.content, tokenOffset) };
    const formatting = formattingForRange(_line, start, tokenOffset);
    if (SUPPORTED_CHORD.test(original)) {
      return { type: 'chord' as const, text: transposeChordSymbol(original, _settings), sourceRange, formatting };
    }
    const suspicious = warnings.some((warning) => warning.code === 'SUSPICIOUS_CHORD' && warning.startIndex === start);
    const type = original === '|' ? 'pipe' as const : suspicious ? 'suspiciousChord' as const : 'text' as const;
    return { type, text: original, sourceRange, formatting };
  });
  const chordSuffix = PREFIXED_SUPPORTED_CHORD;
  const tokens = rawTokens.flatMap((token) => {
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

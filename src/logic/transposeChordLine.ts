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
    if (/^[A-H][#b]?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[A-H][#b]?)?$/.test(token)) {
      return transposeChordSymbol(token, _settings);
    }
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
      /^[A-H][#b]?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[A-H][#b]?)?$/.test(token)
        ? transposeChordSymbol(token, _settings)
        : token
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
  const tokens = _line.content.split(/([|\s,.\-:()]+)/).filter(Boolean).map((original) => {
    const start = tokenOffset;
    tokenOffset += original.length;
    const sourceRange = { start, end: tokenOffset };
    const formatting = formattingForRange(_line, start, tokenOffset);
    if (/^[A-H][#b]?(?:m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/[A-H][#b]?)?$/.test(original)) {
      return { type: 'chord' as const, text: transposeChordSymbol(original, _settings), sourceRange, formatting };
    }
    const suspicious = warnings.some((warning) => warning.code === 'SUSPICIOUS_CHORD' && warning.startIndex === start);
    return { type: suspicious ? 'suspiciousChord' as const : 'text' as const, text: original, sourceRange, formatting };
  });
  Object.defineProperty(result, 'tokens', { value: tokens, enumerable: false });
  return result;
}

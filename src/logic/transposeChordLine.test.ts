import { describe, expect, it } from 'vitest';

import type { ClassifiedLine, ReadyTranspositionSettings } from '../types.js';
import { transposeChordLine } from './transposeChordLine.js';

const settings = (
  mode: 'major' | 'minor',
  sourceTonic: string,
  step: number,
  targetTonic: string,
): ReadyTranspositionSettings => ({ status: 'ready', mode, sourceTonic, step, targetTonic });

const chordLine = (index: number, content: string): ClassifiedLine => ({
  index,
  type: 'chord',
  content,
  segments: [{ text: content, bold: false, italic: false }],
});

describe('transposeChordLine', () => {
  it('AC16 transponoi moduloivan rivin kaikki soinnut', () => {
    const result = transposeChordLine(
      chordLine(0, 'C |E7 |Am |F#7 |B |'),
      settings('major', 'C', 2, 'D'),
    );

    expect(result.content).toBe('D |F#7 |Bm |G#7 |C# |');
  });

  it('AC17 transponoi koko sointurivin alaspäin', () => {
    const result = transposeChordLine(
      chordLine(0, 'D |Bm |A |D |'),
      settings('major', 'D', -2, 'C'),
    );
    expect(result.content).toBe('C |Am |G |C |');
  });

  it('AC18 säilyttää sointurivin muun tekstin', () => {
    const result = transposeChordLine(
      chordLine(0, 'intro C |Am x2 |G rit. |'),
      settings('major', 'C', 2, 'D'),
    );
    expect(result.content).toBe('intro D |Bm x2 |A rit. |');
    expect(result.warnings).toEqual([]);
  });

  it('AC19 säilyttää putket välimerkit ja välilyönnit', () => {
    const result = transposeChordLine(
      chordLine(0, 'C,  |Am... | G-C |'),
      settings('major', 'C', 2, 'D'),
    );
    expect(result.content).toBe('D,  |Bm... | A-D |');
  });

  it('AC20 säilyttää epäilyttävän soinnun ja varoittaa', () => {
    const result = transposeChordLine(
      chordLine(3, 'Cfoo |G |'),
      settings('major', 'C', 1, 'Db'),
    );
    expect(result.content).toBe('Cfoo |Ab |');
    expect(result.warnings).toEqual([
      { code: 'SUSPICIOUS_CHORD', lineIndex: 3, startIndex: 0, original: 'Cfoo', output: 'Cfoo' },
    ]);
  });

  it('AC21 säilyttää tokenin ilman perussäveltä', () => {
    const result = transposeChordLine(
      chordLine(0, 'Xfoo |C |'),
      settings('major', 'C', 1, 'Db'),
    );
    expect(result.content).toBe('Xfoo |Db |');
    expect(result.warnings).toEqual([]);
  });

  it('AC23 säilyttää keskeneräisen bassosoinnun ja varoittaa', () => {
    const result = transposeChordLine(
      chordLine(0, 'G/ |C |'),
      settings('major', 'G', 2, 'A'),
    );
    expect(result.content).toBe('A/ |D |');
    expect(result.warnings).toEqual([
      { code: 'SUSPICIOUS_CHORD', lineIndex: 0, startIndex: 0, original: 'G/', output: 'A/' },
    ]);
  });

  it('AC24 hylkää muun kuin chord-rivin', () => {
    const ready = settings('major', 'C', 2, 'D');
    for (const type of ['note', 'text', 'empty'] as const) {
      expect(() => transposeChordLine({ ...chordLine(0, 'C'), type }, ready))
        .toThrow('Rivin tyypin pitää olla chord');
    }
  });

  it('AC25 säilyttää pienet soinnut ja varoittaa', () => {
    const result = transposeChordLine(
      chordLine(2, 'c |am |g7 |cm7/bb |C |'),
      settings('major', 'C', 2, 'D'),
    );
    expect(result.content).toBe('c |am |g7 |cm7/bb |D |');
    expect(result.warnings).toEqual([
      { code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 0, original: 'c' },
      { code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 3, original: 'am' },
      { code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 7, original: 'g7' },
      { code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 11, original: 'cm7/bb' },
    ]);
  });

  it('AC26 jättää cafe-sanan ilman varoitusta', () => {
    const result = transposeChordLine(
      chordLine(0, 'cafe |C |'),
      settings('major', 'C', 2, 'D'),
    );
    expect(result.content).toBe('cafe |D |');
    expect(result.warnings).toEqual([]);
  });

  it('AC28 säilyttää muotoilualueet lisäämättä lihavointia', () => {
    const result = transposeChordLine({
      index: 4,
      type: 'chord',
      content: 'C |Am |',
      segments: [
        { text: 'C', bold: false, italic: true },
        { text: ' |', bold: false, italic: false },
        { text: 'Am |', bold: true, italic: false, fontSizePx: 18 },
      ],
    }, settings('major', 'C', 2, 'D'));

    expect(result).toEqual({
      index: 4,
      type: 'chord',
      content: 'D |Bm |',
      warnings: [],
      segments: [
        { text: 'D', bold: false, italic: true },
        { text: ' |', bold: false, italic: false },
        { text: 'Bm |', bold: true, italic: false, fontSizePx: 18 },
      ],
    });
  });

  it('AC29 säilyttää tukemattoman C9-soinnun ja varoittaa', () => {
    const result = transposeChordLine(
      chordLine(1, 'C9 |G |'),
      settings('major', 'C', 2, 'D'),
    );
    expect(result.content).toBe('C9 |A |');
    expect(result.warnings).toEqual([
      { code: 'SUSPICIOUS_CHORD', lineIndex: 1, startIndex: 0, original: 'C9', output: 'C9' },
    ]);
  });

  it('AC30 säilyttää kaikki erilliset musiikkimerkit', () => {
    const result = transposeChordLine(
      chordLine(0, '(C): C, C. C-C / C |'),
      settings('major', 'C', 2, 'D'),
    );
    expect(result.content).toBe('(D): D, D. D-D / D |');
    expect(result.warnings).toEqual([]);
  });
});

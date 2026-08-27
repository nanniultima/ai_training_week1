import { describe, expect, it } from 'vitest';
import type { ClassifiedLine, FormattedTextSegment, ReadyTranspositionSettings } from '../types.js';
import { transposeNoteLine } from './transposeNoteLine.js';

const segment = (text: string, bold = false, italic = false): FormattedTextSegment => ({ text, bold, italic });
const noteLine = (segments: readonly FormattedTextSegment[], index = 0): ClassifiedLine => ({ index, type: 'note', content: segments.map(({ text }) => text).join(''), segments });
const settings = (step: number, targetTonic: string, mode: 'major' | 'minor' = 'major'): ReadyTranspositionSettings => ({ status: 'ready', mode, sourceTonic: 'C', step, targetTonic });

describe('transposeNoteLine', () => {
  it('AC22 note-rivin xN säilyttää muotoilun', () => {
    const result = transposeNoteLine(noteLine([segment('C '), segment('x2', false, true)]), settings(0, 'C'));
    expect(result.parts[2]).toEqual({ type: 'repeat', text: 'x2', formatting: [segment('x2', false, true)] });
  });
  it('AC23 note-rivin erotin säilyttää muotoilun', () => {
    const result = transposeNoteLine(noteLine([segment('C'), segment(' - ', true), segment('D')]), settings(0, 'C'));
    expect(result.parts[1]).toEqual({ type: 'separator', text: ' - ', formatting: [segment(' - ', true)] });
  });
  it('AC7 saman tavun ryhmä', () => {
    const result = transposeNoteLine(noteLine([segment('gB')]), settings(1, 'Ab'));
    expect(result.content).toBe('AbC');
    expect(result.parts).toEqual([{ type: 'noteGroup', notes: [{ name: 'Ab', register: 3 }, { name: 'C', register: 4 }] }]);
  });
  it('AC19 koko rivi ylös', () => {
    const content = 'c c  a a a   gB g  g  c d   c';
    const result = transposeNoteLine(noteLine([segment(content)], 2), settings(1, 'Db'));
    expect(result).toMatchObject({ index: 2, type: 'note', content: 'Db Db  Bb Bb Bb   AbC Ab  Ab  Db Eb   Db' });
    expect('segments' in result).toBe(false);
    expect(result.parts.map((part) => part.type === 'noteGroup' ? part.notes.map((note) => `${note.name}/${note.register}`).join('') : part.text).join('')).toBe('Db/3 Db/3  Bb/3 Bb/3 Bb/3   Ab/3C/4 Ab/3  Ab/3  Db/3 Eb/3   Db/3');
  });
  it('AC20 koko rivi alas', () => {
    const result = transposeNoteLine(noteLine([segment('D D  B B B   A A  A  D E   D')]), settings(-2, 'C'));
    expect(result.content).toBe('C C  A A A   G G  G  C D   C');
    expect(result.parts.flatMap((part) => part.type === 'noteGroup' ? part.notes : []).every(({ register }) => register === 3)).toBe(true);
  });
  it('AC21 välit ja xN', () => {
    expect(transposeNoteLine(noteLine([segment('c  d   e x2')]), settings(2, 'D')).content).toBe('D  E   F# x2');
  });
  it('AC22 nolla', () => {
    const result = transposeNoteLine(noteLine([segment('c# db h')]), settings(0, 'C'));
    expect(result.content).toBe('C# Db B');
    expect(result.parts.flatMap((part) => part.type === 'noteGroup' ? part.notes : []).every(({ register }) => register === 3)).toBe(true);
  });
  it('AC25 tuntematon rivitoken', () => {
    expect(() => transposeNoteLine(noteLine([segment('C D hello')]), settings(1, 'Db'))).toThrow('Tuntematon sisältö sävelrivillä: hello');
  });
  it('AC26 väärä rivityyppi', () => {
    for (const type of ['chord', 'text', 'empty'] as const) {
      const line: ClassifiedLine = { index: 0, type, content: 'C', segments: [segment('C')] };
      expect(() => transposeNoteLine(line, settings(0, 'C'))).toThrow('Rivin tyypin pitää olla note');
    }
  });
  it('AC28 ryhmän eri rekisterit', () => {
    const result = transposeNoteLine(noteLine([segment('g'), segment('B', false, true)]), settings(0, 'C'));
    expect(result.content).toBe('GB');
    expect(result.parts).toEqual([{ type: 'noteGroup', notes: [{ name: 'G', register: 3 }, { name: 'B', register: 4 }] }]);
  });
  it('AC29 kirjain määrää rekisterin', () => {
    const result = transposeNoteLine(noteLine([segment('C'), segment('#', false, true)]), settings(0, 'C'));
    expect(result.parts).toEqual([{ type: 'noteGroup', notes: [{ name: 'C#', register: 3 }] }]);
  });
  it('AC30 tiukka yhdysmerkki', () => {
    const result = transposeNoteLine(noteLine([segment('G#C - abC')]), settings(0, 'C'));
    expect(result.content).toBe('G#C - AbC');
    expect(result.parts[1]).toEqual({ type: 'separator', text: ' - ' });
  });
});

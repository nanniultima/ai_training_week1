import { describe, expect, it } from 'vitest';
import { parseNoteGroup } from './parseNoteGroup.js';

describe('parseNoteGroup', () => {
  it('AC4 pieni b', () => {
    expect(parseNoteGroup('gb')).toEqual(['Gb']);
    expect(parseNoteGroup('Gb')).toEqual(['Gb']);
  });
  it('AC5 iso B', () => {
    expect(parseNoteGroup('GB')).toEqual(['G', 'B']);
    expect(parseNoteGroup('gB')).toEqual(['G', 'B']);
  });
  it('AC6 ylennys', () => {
    expect(parseNoteGroup('G#C')).toEqual(['G#', 'C']);
  });
  it('AC32 tyhjä ryhmä', () => {
    expect(() => parseNoteGroup('')).toThrow('Sävelryhmä ei saa olla tyhjä');
  });
  it('AC33 virheellinen ryhmä', () => {
    expect(() => parseNoteGroup('C##')).toThrow('Virheellinen sävelryhmä: C##');
    expect(() => parseNoteGroup('J')).toThrow('Virheellinen sävelryhmä: J');
  });
  it('AC35 ylennyksen jälkeinen pieni b', () => {
    expect(parseNoteGroup('c#b')).toEqual(['C#', 'B']);
  });
});

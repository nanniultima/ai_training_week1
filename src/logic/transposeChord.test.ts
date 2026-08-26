import { describe, expect, it } from 'vitest';

import { transposeChordSymbol } from './transposeChord.js';
import type { ReadyTranspositionSettings } from '../types.js';

const settings = (
  mode: 'major' | 'minor',
  sourceTonic: string,
  step: number,
  targetTonic: string,
): ReadyTranspositionSettings => ({ status: 'ready', mode, sourceTonic, step, targetTonic });

describe('transposeChordSymbol', () => {
  it('AC1 transponoi duurisoinnun ylöspäin', () => {
    expect(transposeChordSymbol('C', settings('major', 'C', 2, 'D'))).toBe('D');
  });

  it('AC2 transponoi mollisoinnun alaspäin', () => {
    expect(transposeChordSymbol('Am', settings('minor', 'A', -2, 'G'))).toBe('Gm');
  });

  it('AC3 säilyttää kaikki tuetut sointutyypit', () => {
    const ready = settings('major', 'C', 2, 'D');
    expect(['C', 'Cm', 'C7', 'Cmaj7', 'Cm7', 'Csus', 'Csus4', 'Cdim', 'Caug', 'Cadd9', 'Dsus/A']
      .map((symbol) => transposeChordSymbol(symbol, ready)))
      .toEqual(['D', 'Dm', 'D7', 'Dmaj7', 'Dm7', 'Dsus', 'Dsus4', 'Ddim', 'Daug', 'Dadd9', 'Esus/B']);
  });

  it('AC4 transponoi bassosoinnun molemmat sävelet', () => {
    expect(transposeChordSymbol('G/B', settings('major', 'G', 1, 'Ab'))).toBe('Ab/C');
  });

  it('AC5 säilyttää alennetun bassosoinnun rakenteen', () => {
    expect(transposeChordSymbol('Cm7/Bb', settings('major', 'C', 2, 'D'))).toBe('Dm7/C');
  });

  it('AC6 normalisoi H:n B:ksi', () => {
    const ready = settings('major', 'B', 0, 'B');
    expect(['H7', 'G/H'].map((symbol) => transposeChordSymbol(symbol, ready))).toEqual(['B7', 'G/B']);
  });

  it('AC7 erottaa B:n ja Bb:n', () => {
    const ready = settings('major', 'Bb', 0, 'Bb');
    expect(['B', 'Bb'].map((symbol) => transposeChordSymbol(symbol, ready))).toEqual(['B', 'Bb']);
  });

  it('AC8 käyttää sharp-kohteen kirjoitusasua', () => {
    expect(transposeChordSymbol('C', settings('major', 'C', 1, 'C#'))).toBe('C#');
  });

  it('AC9 käyttää flat-kohteen kirjoitusasua', () => {
    expect(transposeChordSymbol('C', settings('major', 'C', 1, 'Db'))).toBe('Db');
  });

  it('AC10 käyttää C-duurissa sharpeja ylöspäin', () => {
    expect(transposeChordSymbol('B', settings('major', 'B', 2, 'C'))).toBe('C#');
  });

  it('AC11 käyttää C-duurissa flatteja alaspäin', () => {
    expect(transposeChordSymbol('D', settings('major', 'D', -1, 'C'))).toBe('Db');
  });

  it('AC12 käyttää A-mollissa sharpeja ylöspäin', () => {
    expect(transposeChordSymbol('B', settings('minor', 'B', 2, 'A'))).toBe('C#');
  });

  it('AC13 käyttää A-mollissa flatteja alaspäin', () => {
    expect(transposeChordSymbol('D', settings('minor', 'D', -1, 'A'))).toBe('Db');
  });

  it('AC14 säilyttää nolla-askeleen kirjoitusasun', () => {
    const ready = settings('major', 'C', 0, 'C');
    expect(['C#', 'Db'].map((symbol) => transposeChordSymbol(symbol, ready))).toEqual(['C#', 'Db']);
  });
  it('AC15 transponoi lähtösävellajiin kuulumattoman soinnun', () => {
    expect(transposeChordSymbol('F#7', settings('major', 'C', 2, 'D'))).toBe('G#7');
  });

  it('AC22 hylkää tyhjän sointumerkin', () => {
    expect(() => transposeChordSymbol('', settings('major', 'C', 2, 'D')))
      .toThrow('Sointu ei saa olla tyhjä');
  });

  it('AC27 hylkää tuntemattoman päätteen symbolifunktiossa', () => {
    expect(() => transposeChordSymbol('Cfoo', settings('major', 'C', 1, 'Db')))
      .toThrow('Tuntematon sointumerkintä: Cfoo');
  });

  it('AC31 käyttää merkkiperhetaulukkoa kaikissa validoiduissa kohdesävellajeissa', () => {
    const groups = [
      { mode: 'major' as const, targets: ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'], expected: 'C#' },
      { mode: 'major' as const, targets: ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'], expected: 'Db' },
      { mode: 'minor' as const, targets: ['E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#'], expected: 'C#' },
      { mode: 'minor' as const, targets: ['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'], expected: 'Db' },
    ];
    for (const group of groups) {
      for (const target of group.targets) {
        expect(transposeChordSymbol('C', settings(group.mode, 'B', 1, target))).toBe(group.expected);
      }
    }
    expect(transposeChordSymbol('C', settings('major', 'B', 1, 'C'))).toBe('C#');
    expect(transposeChordSymbol('C', settings('major', 'B', -11, 'C'))).toBe('Db');
    expect(transposeChordSymbol('C', settings('minor', 'B', 1, 'A'))).toBe('C#');
    expect(transposeChordSymbol('C', settings('minor', 'B', -11, 'A'))).toBe('Db');
  });
});

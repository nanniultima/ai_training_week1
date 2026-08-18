import { describe, expect, it } from 'vitest';

import * as transpositionSettings from './transpositionSettings.js';
import { MAJOR_TRANSPOSITION_MATRIX } from './transpositionSettings.major.fixture.js';

interface ResolverInput {
  readonly mode: 'major' | 'minor';
  readonly sourceTonic: string;
  readonly step: number;
  readonly enharmonicChoice?: 'sharp' | 'flat';
}

type Resolver = (input: ResolverInput) => unknown;

const resolve = (
  transpositionSettings as unknown as {
    readonly resolveTranspositionSettings?: Resolver;
  }
).resolveTranspositionSettings;

const MINOR_SOURCE_FIXTURE = [
  { tonic: 'C', chroma: 0 },
  { tonic: 'C#', chroma: 1 },
  { tonic: 'D', chroma: 2 },
  { tonic: 'D#', chroma: 3 },
  { tonic: 'Eb', chroma: 3 },
  { tonic: 'E', chroma: 4 },
  { tonic: 'F', chroma: 5 },
  { tonic: 'F#', chroma: 6 },
  { tonic: 'G', chroma: 7 },
  { tonic: 'G#', chroma: 8 },
  { tonic: 'Ab', chroma: 8 },
  { tonic: 'A', chroma: 9 },
  { tonic: 'A#', chroma: 10 },
  { tonic: 'Bb', chroma: 10 },
  { tonic: 'B', chroma: 11 },
] as const;

const MINOR_TARGET_FIXTURE = [
  ['C'],
  ['C#'],
  ['D'],
  ['D#', 'Eb'],
  ['E'],
  ['F'],
  ['F#'],
  ['G'],
  ['G#', 'Ab'],
  ['A'],
  ['A#', 'Bb'],
  ['B'],
] as const;

const ALLOWED_STEPS = Array.from({ length: 23 }, (_, index) => index - 11);

describe('resolveTranspositionSettings', () => {
  it('AC4 ratkaisee kaikki 345 duuritoonikan ja sallitun askeleen yhdistelmää', () => {
    expect(resolve).toBeTypeOf('function');

    expect(MAJOR_TRANSPOSITION_MATRIX).toHaveLength(345);

    for (const row of MAJOR_TRANSPOSITION_MATRIX) {
      expect(
        resolve?.({
          mode: 'major',
          sourceTonic: row.sourceTonic,
          step: row.step,
        }),
        `${row.sourceTonic}-duuri, askel ${row.step}, kohdekorkeus ${row.targetChroma}`,
      ).toEqual(row.expected);
    }
  });

  it('AC5 ratkaisee kaikki 345 mollitoonikan ja sallitun askeleen yhdistelmää', () => {
    expect(resolve).toBeTypeOf('function');

    for (const source of MINOR_SOURCE_FIXTURE) {
      for (const step of ALLOWED_STEPS) {
        const targetChroma = (source.chroma + step + 12) % 12;
        const targetNames = MINOR_TARGET_FIXTURE[targetChroma];

        expect(targetNames).toBeDefined();

        const expected =
          step !== 0 && targetNames !== undefined && targetNames.length === 2
            ? {
                status: 'requiresEnharmonicChoice',
                mode: 'minor',
                sourceTonic: source.tonic,
                options: [...targetNames],
              }
            : {
                status: 'ready',
                mode: 'minor',
                sourceTonic: source.tonic,
                targetTonic:
                  step === 0 ? source.tonic : targetNames?.[0],
              };

        expect(
          resolve?.({ mode: 'minor', sourceTonic: source.tonic, step }),
          `${source.tonic}-molli, askel ${step}`,
        ).toEqual(expected);
      }
    }
  });

  it('AC6 ratkaisee C-duurin kaksi askelta ylöspäin D-duuriksi', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 2 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'C',
      targetTonic: 'D',
    });
  });

  it('AC7 ratkaisee A-mollin kaksi askelta alaspäin G-molliksi', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'minor', sourceTonic: 'A', step: -2 })).toEqual({
      status: 'ready',
      mode: 'minor',
      sourceTonic: 'A',
      targetTonic: 'G',
    });
  });

  it('AC8 säilyttää Gb-duurin nolla-askeleella', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'Gb', step: 0 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'Gb',
      targetTonic: 'Gb',
    });
  });

  it('AC9 palauttaa C-sharp- ja D-flat-duurin vaihtoehdot', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 1 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      options: ['C#', 'Db'],
    });
  });

  it('AC11 palauttaa D-sharp- ja E-flat-mollin vaihtoehdot', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'minor', sourceTonic: 'D', step: 1 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'minor',
      sourceTonic: 'D',
      options: ['D#', 'Eb'],
    });
  });

  it('AC12 valitsee A-duurista B-flat-duurin', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'A', step: 1 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'A',
      targetTonic: 'Bb',
    });
  });

  it('AC13 valitsee C-mollista C-sharp-mollin', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'minor', sourceTonic: 'C', step: 1 })).toEqual({
      status: 'ready',
      mode: 'minor',
      sourceTonic: 'C',
      targetTonic: 'C#',
    });
  });

  it('AC14 hyväksyy positiivisen enimmäisaskeleen', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 11 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      options: ['B', 'Cb'],
    });
  });

  it('AC15 hyväksyy negatiivisen enimmäisaskeleen', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: -11 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      options: ['C#', 'Db'],
    });
  });

  it('AC16 hylkää askelmäärän -12', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({ mode: 'major', sourceTonic: 'C', step: -12 }),
    ).toThrow('Askelmäärän pitää olla kokonaisluku väliltä -11–11');
  });

  it('AC17 hylkää askelmäärän 12', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({ mode: 'major', sourceTonic: 'C', step: 12 }),
    ).toThrow('Askelmäärän pitää olla kokonaisluku väliltä -11–11');
  });

  it('AC18 hylkää desimaalisen askelmäärän', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({ mode: 'major', sourceTonic: 'C', step: 1.5 }),
    ).toThrow('Askelmäärän pitää olla kokonaisluku väliltä -11–11');
  });

  it('AC21 normalisoi H-duurin B-duuriksi', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'H', step: 0 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'B',
      targetTonic: 'B',
    });
  });

  it('AC22 hylkää tuntemattoman J-toonikan', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({ mode: 'major', sourceTonic: 'J', step: 1 }),
    ).toThrow('Tuntematon lähtösävellaji: J');
  });

  it('AC23 hylkää tarpeettoman flat-valinnan', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({
        mode: 'major',
        sourceTonic: 'C',
        step: 2,
        enharmonicChoice: 'flat',
      }),
    ).toThrow('Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa');
  });
});

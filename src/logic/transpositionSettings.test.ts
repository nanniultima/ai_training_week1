import { describe, expect, it } from 'vitest';

import * as transpositionSettings from './transpositionSettings.js';
import { MAJOR_TRANSPOSITION_MATRIX } from './transpositionSettings.major.fixture.js';
import { MINOR_TRANSPOSITION_MATRIX } from './transpositionSettings.minor.fixture.js';

interface ResolverInput {
  readonly mode: string;
  readonly sourceTonic: string;
  readonly step: number;
  readonly targetTonicChoice?: string;
  readonly enharmonicChoice?: 'sharp' | 'flat';
}

type Resolver = (input: ResolverInput) => unknown;

const resolve = (
  transpositionSettings as unknown as {
    readonly resolveTranspositionSettings?: Resolver;
  }
).resolveTranspositionSettings;

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

    expect(MINOR_TRANSPOSITION_MATRIX).toHaveLength(345);

    for (const row of MINOR_TRANSPOSITION_MATRIX) {
      expect(
        resolve?.({
          mode: 'minor',
          sourceTonic: row.sourceTonic,
          step: row.step,
        }),
        `${row.sourceTonic}-molli, askel ${row.step}, kohdekorkeus ${row.targetChroma}`,
      ).toEqual(row.expected);
    }
  });

  it('AC6 ratkaisee C-duurin kaksi askelta ylöspäin D-duuriksi', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 2 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'C',
      step: 2,
      targetTonic: 'D',
    });
  });

  it('AC7 ratkaisee A-mollin kaksi askelta alaspäin G-molliksi', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'minor', sourceTonic: 'A', step: -2 })).toEqual({
      status: 'ready',
      mode: 'minor',
      sourceTonic: 'A',
      step: -2,
      targetTonic: 'G',
    });
  });

  it('AC8 säilyttää Gb-duurin nolla-askeleella', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'Gb', step: 0 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'Gb',
      step: 0,
      targetTonic: 'Gb',
    });
  });

  it('AC9 palauttaa C-sharp- ja D-flat-duurin vaihtoehdot', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 1 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      step: 1,
      options: ['C#', 'Db'],
    });
  });

  it('AC10 validoi D-flat-duurin ja sulkee valinnan', () => {
    expect(resolve?.({
      mode: 'major',
      sourceTonic: 'C',
      step: 1,
      targetTonicChoice: 'Db',
    })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'C',
      step: 1,
      targetTonic: 'Db',
    });
  });

  it('AC11 palauttaa D-sharp- ja E-flat-mollin vaihtoehdot', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'minor', sourceTonic: 'D', step: 1 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'minor',
      sourceTonic: 'D',
      step: 1,
      options: ['D#', 'Eb'],
    });
  });

  it('AC12 valitsee A-duurista B-flat-duurin', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'A', step: 1 })).toEqual({
      status: 'ready',
      mode: 'major',
      sourceTonic: 'A',
      step: 1,
      targetTonic: 'Bb',
    });
  });

  it('AC13 valitsee C-mollista C-sharp-mollin', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'minor', sourceTonic: 'C', step: 1 })).toEqual({
      status: 'ready',
      mode: 'minor',
      sourceTonic: 'C',
      step: 1,
      targetTonic: 'C#',
    });
  });

  it('AC14 hyväksyy positiivisen enimmäisaskeleen', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 11 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      step: 11,
      options: ['B', 'Cb'],
    });
  });

  it('AC15 hyväksyy negatiivisen enimmäisaskeleen', () => {
    expect(resolve).toBeTypeOf('function');
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: -11 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      step: -11,
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

  it('AC21 hylkää tuntemattoman J-toonikan', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({ mode: 'major', sourceTonic: 'J', step: 1 }),
    ).toThrow('Tuntematon lähtösävellaji: J');
  });

  it('AC22 hylkää tarpeettoman kohdetoonikan valinnan', () => {
    expect(resolve).toBeTypeOf('function');
    expect(() =>
      resolve?.({
        mode: 'major',
        sourceTonic: 'C',
        step: 2,
        targetTonicChoice: 'Db',
      }),
    ).toThrow('Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa');
  });

  it('AC26 palauttaa validoidun askeleen odotustuloksessa', () => {
    expect(resolve?.({ mode: 'major', sourceTonic: 'C', step: 1 })).toEqual({
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      step: 1,
      options: ['C#', 'Db'],
    });
  });

  it('AC27 hylkää vaihtoehtoihin kuulumattoman kohdetoonikan', () => {
    expect(() => resolve?.({
      mode: 'major',
      sourceTonic: 'C',
      step: 1,
      targetTonicChoice: 'F#',
    })).toThrow('Kohdetoonika F# ei kuulu vaihtoehtoihin C#, Db');
  });

  it('AC28 hylkää virheellisen moodin ajonaikana', () => {
    expect(() => resolve?.({ mode: 'dorian', sourceTonic: 'C', step: 1 }))
      .toThrow('Tuntematon sävellajin laatu: dorian');
  });
});

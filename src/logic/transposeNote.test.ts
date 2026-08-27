import { describe, expect, it } from 'vitest';

import type { ReadyTranspositionSettings } from '../types.js';
import { transposeNote } from './transposeNote.js';

const settings = (step: number, targetTonic: string, mode: 'major' | 'minor' = 'major'): ReadyTranspositionSettings => ({
  status: 'ready', mode, sourceTonic: 'C', step, targetTonic,
});

describe('transposeNote', () => {
  it('AC1 pieni kirjain', () => {
    expect(transposeNote('c', 3, settings(2, 'D'))).toEqual({ name: 'D', register: 3 });
  });
  it('AC2 alaspäin', () => {
    expect(transposeNote('d', 3, settings(-2, 'C'))).toEqual({ name: 'C', register: 3 });
  });
  it('AC3 H/h', () => {
    expect(['H', 'h'].map((name) => transposeNote(name, 3, settings(0, 'C')))).toEqual([
      { name: 'B', register: 3 }, { name: 'B', register: 3 },
    ]);
  });
  it('AC8 sharp', () => { expect(transposeNote('C', 3, settings(1, 'C#'))).toEqual({ name: 'C#', register: 3 }); });
  it('AC9 flat', () => { expect(transposeNote('C', 3, settings(1, 'Db'))).toEqual({ name: 'Db', register: 3 }); });
  it('AC10 C-duuri ylös', () => { expect(transposeNote('B', 3, settings(2, 'C'))).toEqual({ name: 'C#', register: 4 }); });
  it('AC11 C-duuri alas', () => { expect(transposeNote('D', 3, settings(-1, 'C'))).toEqual({ name: 'Db', register: 3 }); });
  it('AC12 A-molli ylös', () => { expect(transposeNote('B', 2, settings(2, 'A', 'minor'))).toEqual({ name: 'C#', register: 3 }); });
  it('AC13 A-molli alas', () => { expect(transposeNote('D', 3, settings(-1, 'A', 'minor'))).toEqual({ name: 'Db', register: 3 }); });
  it('AC14 B–C', () => { expect(transposeNote('B', 3, settings(1, 'C'))).toEqual({ name: 'C', register: 4 }); });
  it('AC15 C–B', () => { expect(transposeNote('C', 2, settings(-1, 'C'))).toEqual({ name: 'B', register: 1 }); });
  it('AC16 rekisteri säilyy', () => { expect(transposeNote('E', 3, settings(3, 'C'))).toEqual({ name: 'G', register: 3 }); });
  it('AC17 alaraja', () => { expect(() => transposeNote('C', 1, settings(-1, 'C'))).toThrow('Sävel C alittaa tuetun sävelalueen'); });
  it('AC18 yläraja', () => { expect(() => transposeNote('B', 4, settings(1, 'C'))).toThrow('Sävel B ylittää tuetun sävelalueen'); });
  it('AC23 tyhjä sävel', () => { expect(() => transposeNote('', 3, settings(0, 'C'))).toThrow('Sävel ei saa olla tyhjä'); });
  it('AC24 tuntematon sävel', () => { expect(() => transposeNote('J', 3, settings(0, 'C'))).toThrow('Tuntematon sävel: J'); });
  it('AC27 askelraja', () => { expect(() => transposeNote('C', 3, settings(12, 'C'))).toThrow('Askelmäärän pitää olla kokonaisluku väliltä -11–11'); });
  it('AC31 enharmoniset lähtönimet', () => {
    expect(['Cb', 'B#', 'Fb', 'E#', 'H#', 'Hb'].map((name) => transposeNote(name, 3, settings(1, 'C#')))).toEqual([
      { name: 'C', register: 3 }, { name: 'C#', register: 4 }, { name: 'F', register: 3 },
      { name: 'F#', register: 3 }, { name: 'C#', register: 4 }, { name: 'B', register: 3 },
    ]);
  });
  it('AC34 virheellinen rekisteri', () => {
    for (const register of [0, 5, 1.5]) expect(() => transposeNote('C', register, settings(0, 'C'))).toThrow('Rekisterin pitää olla kokonaisluku väliltä 1–4');
  });
});

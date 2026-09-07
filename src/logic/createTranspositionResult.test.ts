// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';

import type { ReadyTranspositionSettings } from '../types.js';
import { createTranspositionResult } from './createTranspositionResult.js';

const cMajorUpTwo: ReadyTranspositionSettings = {
  status: 'ready',
  mode: 'major',
  sourceTonic: 'C',
  step: 2,
  targetTonic: 'D',
};

const cMajorUnchanged: ReadyTranspositionSettings = {
  ...cMajorUpTwo,
  step: 0,
  targetTonic: 'C',
};

describe('createTranspositionResult', () => {
  it('AC1: transponoi koko yhdistelmäputken', () => {
    const result = createTranspositionResult(
      '<div>C |G |</div><div>C C</div><div>onpa</div>',
      cMajorUpTwo,
    );

    expect(result.plainText.split('\n')).toEqual(['D |A |', 'D D', 'onpa']);
  });

  it('AC2: lukee editorin rikastekstin', () => {
    const result = createTranspositionResult(
      '<div><strong>C |G |</strong></div>',
      cMajorUpTwo,
    );

    expect(result.plainText).toBe('D |A |');
    expect(result.html).toContain('<strong><span>D</span></strong>');
  });

  it('AC3: ratkaisee 18px fonttikoon syötteestä', () => {
    const result = createTranspositionResult(
      '<div style="font-size:18px">C |G |</div>',
      cMajorUpTwo,
    );

    expect(result.html.match(/style="font-size:18px"/g)).toHaveLength(1);
  });

  it('AC4: transponoi vain chord- ja note-rivit', () => {
    const result = createTranspositionResult(
      '<div>C |G |</div><div>C C</div><div>onpa</div><div><br></div>',
      cMajorUpTwo,
    );

    expect(result.plainText.split('\n')).toEqual(['D |A |', 'D D', 'onpa', '']);
  });

  it('AC5: litistää ryhmät alkuperäiseen plainText-rivijärjestykseen', () => {
    const result = createTranspositionResult(
      '<div>C |</div><div>C</div><div>laula</div><div><br></div>',
      cMajorUnchanged,
    );

    expect(result.plainText).toBe('C |\nC\nlaula\n');
  });

  it('AC6: säilyttää itsenäiset text- ja empty-rivit plainTextissä', () => {
    const result = createTranspositionResult(
      '<div>C |</div><div>Kertosäe</div><div><br></div><div>G |</div>',
      cMajorUnchanged,
    );

    expect(result.plainText).toBe('C |\nKertosäe\n\nG |');
  });

  it('AC7: yhdistää luokittelu- ja sointuvaroitukset', () => {
    const result = createTranspositionResult(
      '<div>Cfoo |G |</div><div>C D lauletaan hiljaa</div>',
      cMajorUpTwo,
    );

    expect(result.warnings).toHaveLength(2);
    expect(result.warnings.some((warning) => warning.includes('epäilyttävä sointu'))).toBe(true);
    expect(result.warnings.some((warning) => warning.includes('rivi tulkittiin tekstiksi'))).toBe(true);
  });

  it('AC8: suorittaa nolla-askeleen koko putken', () => {
    const result = createTranspositionResult('<div>C |G |</div>', cMajorUnchanged);

    expect(result.plainText).toBe('C |G |');
    expect(result.html).not.toBe('');
  });

  it('AC9: välittää parserin tyhjäsyötevirheen', () => {
    expect(() => createTranspositionResult('', cMajorUnchanged)).toThrow(
      'Rikastekstisyöte ei saa olla tyhjä',
    );
  });

  it('AC10: välittää musiikkirivin puuttumisvirheen', () => {
    expect(() =>
      createTranspositionResult('<div>Kertosäe</div>', cMajorUnchanged),
    ).toThrow('Syötteestä ei löytynyt sointu- tai sävelrivejä');
  });

  it('AC45: transponoi editorin sitovilla kohdistusväleillä kirjoitetun sävelrivin', () => {
    expect(createTranspositionResult(
      '<div>c&nbsp;c&nbsp;&nbsp;g</div>',
      cMajorUpTwo,
    ).plainText).toBe('D D  A');
  });
});

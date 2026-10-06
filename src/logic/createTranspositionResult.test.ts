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

  it('AC46: säilyttää sävelrivin ympäröivät välit ilman epäselvyysvaroitusta', () => {
    const result = createTranspositionResult(
      '<div>&nbsp;c#&nbsp;</div>',
      cMajorUpTwo,
    );

    expect(result.plainText).toBe(' D# ');
    expect(result.warnings).toEqual([]);
  });

  it('AC47: transponoi ylennyksen jälkeisen B-sävelen samassa ryhmässä', () => {
    const result = createTranspositionResult(
      '<div>g# c#b a</div>',
      cMajorUpTwo,
    );

    expect(result.plainText).toBe('A# D#C# B');
    expect(result.warnings).toEqual([]);
  });

  it('AC50: säilyttää luonnollisen sanavälin koko transponointiputkessa', () => {
    const result = createTranspositionResult(
      '<div>|A              ,Bm/D# |  </div>'
        + '<div>c#               e d# d</div>'
        + '<div>se iskee sieluun syvimpään</div>',
      {
        status: 'ready',
        mode: 'major',
        sourceTonic: 'A',
        targetTonic: 'C',
        step: 3,
      },
    );

    expect(result.plainText).toBe(
      '|C              ,Dm/F# |  \n'
        + 'E                G F# F\n'
        + 'se iskee sieluun syvimpään',
    );
    expect(result.warnings).toEqual([]);
  });

  it('AC45: jättää itsenäisen loppuputken pois tekstin tavutuksesta', () => {
    const result = createTranspositionResult(
      '<div>|Bm/F#       |</div><div>niin kuin muut</div>',
      cMajorUpTwo,
    );

    expect(result.plainText).toBe('|C#m/G#      |\nniin kuin muut');
    expect(result.warnings).toEqual([]);
  });

  it('AC47: säilyttää Unicode-symbolietuliitteet ilman sointujen kahdentumista', () => {
    const result = createTranspositionResult(
      '<div>|↓G |↑B7 |→Em |★Dm</div>',
      { status: 'ready', mode: 'major', sourceTonic: 'D', targetTonic: 'F', step: 3 },
    );

    expect(result.plainText).toBe('|↓Bb |↑D7 |→Gm |★Fm');
    expect([...result.plainText.matchAll(/\|/g)].map(match => match.index))
      .toEqual([0, 5, 10, 15]);
    expect(result.warnings).toEqual([]);
  });

  it('AC48: joustaa symbolietuliitteisten sointujen tahtivälejä tekstiryhmässä', () => {
    const result = createTranspositionResult(
      '<div>|D.       |↓G          |↓B7       |↓Em</div>'
        + '<div>Tää yö on aikaa, me ei mennä nukkumaan</div>',
      {
        status: 'ready', mode: 'major', sourceTonic: 'D', targetTonic: 'F', step: 3,
      },
    );

    expect(result.plainText).toBe(
      '|F.       |↓Bb         |↓D7       |↓Gm\n'
        + 'Tää yö on aikaa, me ei mennä nukkumaan',
    );
    expect(result.warnings).toEqual([]);
  });

  it('AC47: poistaa vanhat soinnut nuolten jälkeen koko käyttäjäesimerkissä', () => {
    const result = createTranspositionResult(
      '<div>|D.       |↓G          |↓B7       |↓Em</div>'
        + '<div><br></div>'
        + '<div>  Tää yö on aikaa, me ei mennä nukkumaan</div>'
        + '<div><br></div>'
        + '<div>    |↓Dm  G7     |C              |E7            |Am        |Am/G</div>'
        + '<div><br></div>'
        + '<div>Jos uskot siihen taikaan, on sun tähtimerkit kohdallaan</div>',
      {
        status: 'ready', mode: 'major', sourceTonic: 'D', targetTonic: 'F', step: 3,
      },
    );

    expect(result.plainText).not.toMatch(/↓(?:G|B7|Em|Dm)(?:Bb|D7|Gm|Fm)/);
    expect(result.plainText).toContain('|↓Bb');
    expect(result.plainText).toContain('|↓Fm  Bb7');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    const renderedLines = [...rendered.querySelectorAll('div[style^="font-size"] > div')]
      .map((line) => line.textContent ?? '');
    expect(renderedLines.join('\n')).toBe(result.plainText);
  });

  it('Pasted AC4: säilyttää liitetyn CSS-muotoilun koko tulosputkessa', () => {
    const result = createTranspositionResult(
      '<div>C |G |</div><div><span style="font-weight:700">lihavö</span> '
        + '<span style="font-style:italic">kursiivi</span></div>',
      cMajorUpTwo,
    );

    expect(result.plainText).toBe('D |A |\nlihavö kursiivi');
    expect(result.html.match(/<strong><span>lihavö<\/span><\/strong>/g)).toHaveLength(1);
    expect(result.html.match(/<em><span>kursiivi<\/span><\/em>/g)).toHaveLength(1);
    expect(result.html).not.toMatch(/font-weight|font-style/);
  });

  it('AC48: säilyttää laulutekstit tahtivälien joustaessa', () => {
    const input = [
      '|D.       |↓G          |↓B7       |↓Em',
      '',
      '  Tää yö on aikaa, me ei mennä nukkumaan',
      '',
      '    |↓Dm  G7     |C              |E7            |Am        |Am/G',
      '',
      'Jos uskot siihen taikaan, on sun tähtimerkit kohdallaan',
      '',
      '          |Bm            |E7          |Am        |D- ',
      '',
      'Ja pienen hetken koko maailman omistaa sä saat',
      '',
      '        |↓G          |↓B7       |↓Em',
      '',
      'En helminauhaa tahdo sadun kaukomaan',
      '',
      '   |↓Dm     G7     |C          |E7              |Am       |Am/G',
      '',
      'mä vain jos voisin rauhaan ikuiseen tän maailman tuudittaa',
      '',
      '            |Bm         |E7       |Am      |D-           |G   |',
      '',
      'Nyt muistoissa on nuoruuteni heinäkuut. Ei oltu niin kuin muut',
    ];
    const html = input.map((line) => `<div>${line || '<br>'}</div>`).join('');
    const result = createTranspositionResult(html, {
      status: 'ready', mode: 'major', sourceTonic: 'D', targetTonic: 'F', step: 3,
    });
    const output = result.plainText.split('\n');

    for (const index of [2, 6, 10, 14, 18, 22]) expect(output[index]).toBe(input[index]);
    expect(result.plainText).not.toContain('ikui-seen');
    expect(result.plainText).not.toContain('siihen  taikaan');
    expect(result.plainText).not.toContain('sun  tähtimerkit');
  });

  it('AC48: kohdistaa koko nelirivisen esimerkin ja erottaa tyhjän rivin', () => {
    const input = [
      '    |↓Dm  G7     |C              |E7            |Am        |Am/G',
      'Jos uskot siihen taikaan, on sun tähtimerkit kohdallaan',
      '   |↓Dm     G7     |C          |E7              |Am       |Am/G',
      'mä vain jos voisin rauhaan ikuiseen tän maailman tuudittaa',
    ];
    const result = createTranspositionResult(input.map(line => `<div>${line}</div>`).join(''),
      { status: 'ready', mode: 'major', sourceTonic: 'D', targetTonic: 'F', step: 3 });
    expect(result.plainText).toBe([
      '    |↓Fm  Bb7    |Eb             |G7            |Cm        |Cm/Bb',
      input[1],
      '   |↓Fm     Bb7    |Eb         |G7              |Cm       |Cm/Bb',
      input[3],
    ].join('\n'));
    const rows = result.plainText.split('\n');
    const pipes = (line: string) => [...line].flatMap((char, index) => char === '|' ? [index] : []);
    expect(pipes(rows[0]!)).toEqual([4, 17, 33, 48, 59]);
    expect(pipes(rows[2]!)).toEqual([3, 19, 31, 48, 58]);
    expect(rows[0]!.indexOf('Bb7')).toBe(10);
    expect(rows[2]!.indexOf('Bb7')).toBe(12);
    const separate = createTranspositionResult('<div>|C |Bm |Em</div><div><br></div><div>onpa</div>', cMajorUpTwo);
    expect(separate.plainText).toBe('|D |C#m |F#m\n\nonpa');
    expect(pipes(separate.plainText.split('\n')[0]!)).toEqual([0, 3, 8]);
  });

  it('AC48: ei tavuta ikuiseen-sanaa C-soinnun kasvaessa Eb-soinnuksi', () => {
    const result = createTranspositionResult(
      '<div>   |↓Dm     G7     |C          |E7              |Am       |Am/G</div>'
        + '<div>mä vain jos voisin rauhaan ikuiseen tän maailman tuudittaa</div>',
      { status: 'ready', mode: 'major', sourceTonic: 'D', targetTonic: 'F', step: 3 },
    );

    expect(result.plainText.split('\n')[1]).toBe(
      'mä vain jos voisin rauhaan ikuiseen tän maailman tuudittaa',
    );
  });
});

// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';

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
  it.each([
    ['<div>c <em>x2</em> d</div>', 'C# x2 D#', 'repeat'],
    ['<div>c<strong> - </strong>d</div>', 'C# - D#', 'hyphen'],
  ])('Alignment AC23: välisisällön lähdemuotoilu säilyy (%s)', (html, expected, kind) => {
    const result = createTranspositionResult(`${html}<div>onpa ihanaa</div>`,
      { ...cMajorUpTwo, targetTonic: 'C#', step: 1 });
    expect(result.plainText).toBe(`${expected}\nonpa  ihanaa`);
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    const note = rendered.querySelector('div[style="font-size:12px"] > div')!;
    expect(note.textContent).toBe(expected);
    if (kind === 'repeat') expect([...note.querySelectorAll('em')].map(node => node.textContent).join('')).toBe('x2');
    else {
      const hyphen = [...note.querySelectorAll('span')].find(node => node.textContent === '-');
      expect(hyphen).toBeDefined();
      expect(hyphen?.closest('strong')).not.toBeNull();
    }
  });
  it.each([['c x2 d', 'C# x2 D#'], ['c - d', 'C# - D#']])('Alignment AC23: sävelrivin erottimet säilyvät koko putkessa (%s)', (source, expected) => {
    const result = createTranspositionResult(`<div>${source}</div><div>onpa ihanaa</div>`,
      { ...cMajorUpTwo, targetTonic: 'C#', step: 1 });
    expect(result.plainText).toBe(`${expected}\nonpa  ihanaa`);
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect([...rendered.querySelectorAll('div[style="font-size:12px"] > div')].map(row => row.textContent))
      .toEqual([expected, 'onpa  ihanaa']);
  });
  it('Chord AC28: segmenttirajan transponointi säilyttää seuraavan tekstin muotoilun', () => {
    const result = createTranspositionResult('<div><span>C</span><em>#m</em> |<em>rit</em>. |</div>',
      { ...cMajorUpTwo, targetTonic: 'C#', step: 1 });
    expect(result.plainText).toBe('Dm |rit. |');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect(rendered.textContent).toBe(result.plainText);
    expect([...rendered.querySelectorAll('em')].map(node => node.textContent).join('')).toBe('rit');
  });
  it('Chord AC28: nolla-askel säilyttää soinnun sisäisen muotoilurajan', () => {
    const result = createTranspositionResult('<div><span>C</span><em>#m</em> |</div>', cMajorUnchanged);
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect(result.plainText).toBe('C#m |');
    expect(rendered.textContent).toBe(result.plainText);
    expect([...rendered.querySelectorAll('em')].map(node => node.textContent).join('')).toBe('#m');
    expect([...rendered.querySelectorAll('strong')].map(node => node.textContent).join('')).toBe('C#m|');
  });
  it.each([0, 2])('Rich text AC18: vierekkäiset musiikkimerkit lihavoidaan (%i)', step => {
    const result = createTranspositionResult('<div>(C): C, C. C-C / C |</div>', step === 0 ? cMajorUnchanged : cMajorUpTwo);
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect(rendered.textContent).toBe(step === 0 ? '(C): C, C. C-C / C |' : '(D): D, D. D-D / D |');
    const symbols = [...rendered.querySelectorAll('span')].filter(node => /^[|,.\-:/()]$/.test(node.textContent ?? ''));
    expect(symbols.map(node => node.textContent)).toEqual(['(', ')', ':', ',', '.', '-', '/', '|']);
    for (const symbol of symbols) expect(symbol.closest('strong'), symbol.textContent ?? '').not.toBeNull();
    for (const node of [...rendered.querySelectorAll('span')].filter(span => span.textContent === ' ')) {
      expect(node.closest('strong')).toBeNull();
    }
  });
  it.each([0, 2])('Rich text AC20: rit.-tekstin sisäinen piste säilyttää muotoilunsa putkessa (%i)', step => {
    const result = createTranspositionResult('<div>C |<em>rit</em>. |</div>', step === 0 ? cMajorUnchanged : cMajorUpTwo);
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect(result.plainText).toBe(step === 0 ? 'C |rit. |' : 'D |rit. |');
    expect([...rendered.querySelectorAll('em')].map(node => node.textContent).join('')).toBe('rit');
    const dot = [...rendered.querySelectorAll('span')].find(node => node.textContent === '.');
    expect(dot).toBeDefined();
    expect(dot?.closest('strong')).toBeNull();
    expect(dot?.closest('em')).toBeNull();
  });
  it('Chord AC23: pitenevä keskeneräinen bassosointu säilyy HTML:ssä ja kohdistuksessa', () => {
    for (const withLyrics of [false, true]) {
      const result = createTranspositionResult('<div>G/ |C |</div>' + (withLyrics ? '<div>onpa nyt</div>' : ''),
        { ...cMajorUpTwo, targetTonic: 'C#', step: 1 });
      const expected = withLyrics ? ['G#/|C#|', 'onpa nyt'] : ['G#/ |C# |'];
      expect(result.plainText).toBe(expected.join('\n'));
      const rendered = document.createElement('div');
      rendered.innerHTML = result.html;
      expect([...rendered.querySelectorAll('div[style="font-size:12px"] > div')].map(row => row.textContent)).toEqual(expected);
      expect(result.warnings).toEqual(['Rivi 1, kohta 1: epäilyttävä sointu "G/" muutettiin muotoon "G#/".']);
    }
  });
  it('Chord AC23: nolla-askel normalisoi keskeneräisen H-bassosoinnun yhtenäisesti', () => {
    const result = createTranspositionResult('<div>H/ |C |</div>', cMajorUnchanged);
    expect(result.plainText).toBe('B/ |C |');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect(rendered.querySelector('div[style="font-size:12px"] > div')?.textContent).toBe('B/ |C |');
    expect(result.warnings).toEqual(['Rivi 1, kohta 1: epäilyttävä sointu "H/" muutettiin muotoon "B/".']);
  });
  it.each([false, true])('Chord AC23: keskeneräisen bassosoinnun HTML ja plainText täsmäävät (sanat=%s)', withLyrics => {
    const result = createTranspositionResult('<div>G/ |C |</div>' + (withLyrics ? '<div>onpa nyt</div>' : ''),
      { status: 'ready', mode: 'major', sourceTonic: 'G', targetTonic: 'A', step: 2 });
    const expected = withLyrics ? ['A/ |D |', 'onpa nyt'] : ['A/ |D |'];
    expect(result.plainText).toBe(expected.join('\n'));
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect([...rendered.querySelectorAll('div[style="font-size:12px"] > div')].map(row => row.textContent)).toEqual(expected);
    expect([...rendered.querySelectorAll('strong')].map(node => node.textContent)).toContain('A/');
    expect(result.warnings).toEqual(['Rivi 1, kohta 1: epäilyttävä sointu "G/" muutettiin muotoon "A/".']);
  });
  it('Pasted AC4: säilyttää desimaalisen CSS-lihavoinnin sävelrekisterinä', () => {
    // The single input span needs a decimal CSS value that Happy DOM discards.
    const original = CSSStyleDeclaration.prototype.getPropertyValue;
    const css = vi.spyOn(CSSStyleDeclaration.prototype, 'getPropertyValue')
      .mockImplementation(function (this: CSSStyleDeclaration, property: string) {
        return property === 'font-weight' ? '600.5' : original.call(this, property);
      });
    try {
      const result = createTranspositionResult('<span style="font-weight:600.5">c</span>', cMajorUpTwo);
      expect(result.plainText).toBe('D');
      expect(result.html).toContain('<strong><span>D</span></strong>');
      expect(result.html).not.toContain('font-weight');
      expect(result.warnings).toEqual([]);
    } finally { css.mockRestore(); }
  });
  it('Amendments AC27: säilyttää tyhjät alkurivit fonttikoon valinnassa', () => {
    const result = createTranspositionResult('<div><br></div><div><span style="font-size:18.5px">C |</span></div>', cMajorUnchanged);
    expect(result.plainText).toBe('\nC |');
    expect(result.html.match(/style="font-size:18.5px"/g)).toHaveLength(1);
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect(rendered.querySelector('div[style="font-size:18.5px"] > div')?.outerHTML).toBe('<div><br></div>');
  });
  it('Amendments AC25: säilyttää soinnun kursivoinnin nollan lihavoinnissa', () => {
    const result = createTranspositionResult('<div><em>C#</em> |</div>', cMajorUnchanged);
    expect(result.plainText).toBe('C# |');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    const chord = [...rendered.querySelectorAll('span')].find(node => node.textContent === 'C#');
    const pipe = [...rendered.querySelectorAll('span')].find(node => node.textContent === '|');
    const space = [...rendered.querySelectorAll('span')].find(node => node.textContent === ' ');
    expect(chord?.closest('strong')).not.toBeNull();
    expect(chord?.closest('em')).not.toBeNull();
    expect(pipe?.closest('strong')).not.toBeNull();
    expect(pipe?.closest('em')).toBeNull();
    expect(space?.closest('strong')).toBeNull();
    expect(space?.closest('em')).toBeNull();
    expect(result.html.match(/style="font-size:12px"/g)).toHaveLength(1);
  });
  it.each([0, 2])('Amendments AC24: ohittaa alkuvälien koon säilyttäen välit (%i)', step => {
    const result = createTranspositionResult('<div><span style="font-size:18px">  </span><span style="font-size:24px">c  </span></div><div> onpa  </div>', step === 0 ? cMajorUnchanged : cMajorUpTwo);
    const expected = step === 0 ? '  c  \n onpa  ' : '  D  \n onpa  ';
    expect(result.plainText).toBe(expected);
    expect(result.html.match(/style="font-size:24px"/g)).toHaveLength(1);
    expect(result.html).not.toContain('font-size:18px');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect([...rendered.querySelectorAll('div[style="font-size:24px"] > div')].map(row => row.textContent)).toEqual(expected.split('\n'));
  });
  it('Amendments AC21: käyttää ensimmäisen merkin puuttuvan koon oletusta', () => {
    const result = createTranspositionResult('<div>C |</div><div><span style="font-size:24px">onpa</span></div>', cMajorUnchanged);
    expect(result.html.match(/style="font-size:12px"/g)).toHaveLength(1);
    expect(result.html).not.toContain('font-size:24px');
    expect(result.plainText).toBe('C |\nonpa');
  });
  it.each([0, 2])('Amendments AC20: käyttää ensimmäisen merkin kokoa myös nolla-askeleella (%i)', step => {
    const result = createTranspositionResult('<div><span style="font-size:18px">C |</span></div><div><span style="font-size:24px">onpa</span></div>', step === 0 ? cMajorUnchanged : cMajorUpTwo);
    expect(result.html.match(/style="font-size:18px"/g)).toHaveLength(1);
    expect(result.html).not.toMatch(/font-size:(12|24)px/);
    expect(result.plainText).toBe(step === 0 ? 'C |\nonpa' : 'D |\nonpa');
  });
  it('Amendments AC19: transponoi erilliset C A F E -sävelet', () => {
    const result = createTranspositionResult('<div>c a f e</div>', cMajorUpTwo);
    expect(result.plainText).toBe('D B G F#');
    expect(result.warnings).toEqual([]);
  });
  it('Amendments AC7: säilyttää sävelrivin lähdemuotoilun nolla-askeleella', () => {
    const result = createTranspositionResult('<div>c <strong>d </strong><strong><em>e </em></strong><em>f</em></div>', cMajorUnchanged);
    expect(result.plainText).toBe('c d e f');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    for (const [name, bold, italic] of [['c', false, false], ['d', true, false], ['e', true, true], ['f', false, true]] as const) {
      const node = [...rendered.querySelectorAll('span')].find(span => span.textContent === name);
      expect(node, name).toBeDefined();
      expect(Boolean(node?.closest('strong')), name).toBe(bold);
      expect(Boolean(node?.closest('em')), name).toBe(italic);
    }
  });
  it('Amendments AC6: lisää nolla-askeleella vain sointurivin lihavoinnin', () => {
    const result = createTranspositionResult('<div>H7 |G/H |</div><div>onpa nyt</div>', cMajorUnchanged);
    expect(result.plainText).toBe('B7 |G/B |\nonpa nyt');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    expect([...rendered.querySelectorAll('strong')].map(node => node.textContent)).toEqual(['B7', '|', 'G/B', '|']);
    expect(rendered.querySelector('div[style="font-size:12px"] > div:last-child')?.innerHTML).toBe('<span>onpa nyt</span>');
  });
  it('Amendments AC4: ohittaa monirivisen nollasyötteen kohdistuksen', () => {
    const result = createTranspositionResult('<div>C# |G |</div><div>c# d</div><div>on-pa</div>', cMajorUnchanged);
    expect(result.plainText).toBe('C# |G |\nc# d\non-pa');
    const rendered = document.createElement('div');
    rendered.innerHTML = result.html;
    const rows = [...rendered.querySelectorAll('div[style="font-size:12px"] > div')].map(row => row.textContent);
    expect(rows).toEqual(['C# |G |', 'c# d', 'on-pa']);
    expect([...rows[0]!].flatMap((char, index) => char === '|' ? [index] : [])).toEqual([3, 6]);
    expect(rows[1]!.indexOf('c#')).toBe(0);
    expect(rows[1]!.indexOf('d')).toBe(3);
  });
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

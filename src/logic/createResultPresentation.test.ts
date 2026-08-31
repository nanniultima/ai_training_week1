import { describe, expect, it } from 'vitest';

import type { AlignedMusicResultLine } from '../types.js';
import { createResultPresentation } from './createResultPresentation.js';

const chordLine = (content: string): AlignedMusicResultLine => ({
  index: 0,
  type: 'chord',
  content,
  segments: [{ text: content, bold: false, italic: false }],
  warnings: [],
  tokens: [{ type: 'text', text: content }],
});

const textLine = (content: string, index = 1): AlignedMusicResultLine => ({
  index,
  type: 'text',
  content,
  segments: [{ text: content, bold: false, italic: false }],
});

describe('createResultPresentation', () => {
  it('AC11: lisää täsmällisen monospace-kuoren', () => {
    expect(createResultPresentation([chordLine('C')], 12, []).html).toBe(
      '<div style="font-family:monospace;white-space:pre-wrap"><div style="font-size:12px"><div><span>C</span></div></div></div>',
    );
  });

  it('AC12: yhdistää rivit LF-merkillä', () => {
    expect(
      createResultPresentation([chordLine('C |G |'), textLine('onpa ihanaa')], 12, []).plainText,
    ).toBe('C |G |\nonpa ihanaa');
  });

  it('AC13: säilyttää tyhjän rivin plain textissä', () => {
    const empty: AlignedMusicResultLine = { index: 1, type: 'empty', content: '' };
    expect(
      createResultPresentation([chordLine('C |G |'), empty, { ...chordLine('Am |F |'), index: 2 }], 12, []).plainText,
    ).toBe('C |G |\n\nAm |F |');
  });

  it('AC14: jättää loppurivinvaihdon pois', () => {
    const plainText = createResultPresentation([chordLine('C |G |')], 12, []).plainText;
    expect(plainText).toBe('C |G |');
    expect(plainText).toHaveLength(6);
    expect(plainText.at(-1)).toBe('|');
  });

  it('AC15: säilyttää lihavoinnin ja kursivoinnin', () => {
    const line: AlignedMusicResultLine = {
      index: 0,
      type: 'text',
      content: 'CE',
      segments: [
        { text: 'C', bold: true, italic: false },
        { text: 'E', bold: false, italic: true },
      ],
    };
    expect(createResultPresentation([line], 12, []).html).toContain(
      '<strong><span>C</span></strong><em><span>E</span></em>',
    );
  });

  it('AC16: säilyttää 18px fonttikoon', () => {
    const html = createResultPresentation([chordLine('C')], 18, []).html;
    expect(html.match(/font-size:18px/g)).toHaveLength(1);
    expect(html).not.toContain('font-size:12px');
  });

  it('AC17: säilyttää 12px oletuskoon', () => {
    expect(
      createResultPresentation([chordLine('C')], 12, []).html.match(/font-size:12px/g),
    ).toHaveLength(1);
  });

  it('AC18: sisällyttää itsenäisen tekstirivin', () => {
    const result = createResultPresentation(
      [textLine('Kertosäe', 0), { ...chordLine('C |G |'), index: 1 }, textLine('onpa', 2)],
      12,
      [],
    );
    expect(result.plainText).toBe('Kertosäe\nC |G |\nonpa');
    expect(result.html.match(/<span>Kertosäe<\/span>/g)).toHaveLength(1);
  });

  it('AC19: tekstittää epäilyttävän soinnun', () => {
    const result = createResultPresentation([chordLine('Dbfoo')], 12, [{
      code: 'SUSPICIOUS_CHORD', lineIndex: 3, startIndex: 0, original: 'Cfoo', output: 'Dbfoo',
    }]);
    expect(result.warnings).toEqual([
      'Rivi 4, kohta 1: epäilyttävä sointu "Cfoo" muutettiin muotoon "Dbfoo".',
    ]);
  });

  it('AC20: tekstittää pienellä alkavan soinnun', () => {
    const result = createResultPresentation([chordLine('am')], 12, [{
      code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 3, original: 'am',
    }]);
    expect(result.warnings).toEqual([
      'Rivi 3, kohta 4: mahdollinen sointu "am" alkaa pienellä kirjaimella eikä sitä muutettu.',
    ]);
  });

  it('AC21: tekstittää epäselvän sävelrivin', () => {
    const result = createResultPresentation([textLine('C D lauletaan hiljaa')], 12, [{
      code: 'AMBIGUOUS_NOTE_LINE', lineIndex: 1, content: 'C D lauletaan hiljaa',
    }]);
    expect(result.warnings).toEqual([
      'Rivi 2: rivi tulkittiin tekstiksi: "C D lauletaan hiljaa".',
    ]);
  });

  it('AC22: järjestää varoitukset sijainnin mukaan', () => {
    const warnings = createResultPresentation([chordLine('C')], 12, [
      { code: 'LOWERCASE_CHORD', lineIndex: 3, startIndex: 0, original: 'a' },
      { code: 'AMBIGUOUS_NOTE_LINE', lineIndex: 1, content: 'C teksti' },
      { code: 'LOWERCASE_CHORD', lineIndex: 3, startIndex: 4, original: 'b' },
    ]).warnings;
    expect(warnings.map((warning) => warning.match(/^Rivi \d+(?:, kohta \d+)?:/)?.[0])).toEqual([
      'Rivi 2:', 'Rivi 4, kohta 1:', 'Rivi 4, kohta 5:',
    ]);
  });

  it('AC23: säilyttää tasatilanteen järjestyksen', () => {
    const warnings = createResultPresentation([chordLine('C')], 12, [
      { code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 3, original: 'A' },
      { code: 'LOWERCASE_CHORD', lineIndex: 2, startIndex: 3, original: 'B' },
    ]).warnings;
    expect(warnings[0]).toContain('"A"');
    expect(warnings[1]).toContain('"B"');
  });

  it('AC24: pitää varoitukset kopion ulkopuolella', () => {
    const result = createResultPresentation([chordLine('Dbfoo |Ab |')], 12, [{
      code: 'SUSPICIOUS_CHORD', lineIndex: 0, startIndex: 0, original: 'Cfoo', output: 'Dbfoo',
    }]);
    expect(result.html).not.toContain('epäilyttävä sointu');
    expect(result.plainText).not.toContain('epäilyttävä sointu');
  });

  it('AC25: hylkää tyhjän tulosrivistön', () => {
    expect(() => createResultPresentation([], 12, [])).toThrow(
      'Näytettävä tulos ei saa olla tyhjä',
    );
  });
});

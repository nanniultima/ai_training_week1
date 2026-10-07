// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { parseRichText } from './parseRichText.js';

describe('parseRichText', () => {
  it('Editor lines AC5: sallii tyhjien rivien lukemisen vain erillisellä valinnalla', () => {
    const html = '<div><br></div><div><br></div>';
    expect(parseRichText(html, { allowEmpty: true }).lines).toEqual([{ segments: [] }, { segments: [] }]);
    expect(() => parseRichText(html)).toThrowError(new Error('Rikastekstisyöte ei saa olla tyhjä'));
    expect(() => parseRichText(html, { allowEmpty: false })).toThrowError(new Error('Rikastekstisyöte ei saa olla tyhjä'));
  });
  it.each([
    ['599.5', false], ['600', true], ['600.5', true], ['700.25', true],
  ])('Pasted AC1/AC3: numeerinen font-weight noudattaa rajaa 600 (%s)', (weight, bold) => {
    // Happy DOM drops decimal weights; supply the CSS value at the DOM boundary.
    const original = CSSStyleDeclaration.prototype.getPropertyValue;
    const css = vi.spyOn(CSSStyleDeclaration.prototype, 'getPropertyValue')
      .mockImplementation(function (this: CSSStyleDeclaration, property: string) {
        return property === 'font-weight' ? weight : original.call(this, property);
      });
    try {
      expect(parseRichText(`<span style="font-weight:${weight}">A</span>`).lines[0]?.segments)
        .toEqual([{ text: 'A', bold, italic: false }]);
    } finally { css.mockRestore(); }
  });
  it.each(['<strong>C</strong>', '<b>C</b>'])('AC1 Lihavointi luetaan', (html) => {
    expect(parseRichText(html).lines[0]?.segments).toEqual([{ text: 'C', bold: true, italic: false }]);
  });
  it.each(['<em>C</em>', '<i>C</i>'])('AC2 Kursivointi luetaan', (html) => expect(parseRichText(html).lines[0]?.segments).toEqual([{ text: 'C', bold: false, italic: true }]));
  it('AC3 Sisäkkäiset muotoilut yhdistyvät', () => expect(parseRichText('<strong><em>C</em></strong>').lines[0]?.segments[0]).toMatchObject({ bold: true, italic: true }));
  it('AC4 Rivirakenteet normalisoidaan', () => expect(parseRichText('<div>A</div><p>B<br>C</p>').lines.map(line => line.segments.map(s => s.text).join(''))).toEqual(['A', 'B', 'C']));
  it('AC5 Tekstin newline muodostaa rivin', () => expect(parseRichText('A\nB').lines.map(line => line.segments.map(s => s.text).join(''))).toEqual(['A', 'B']));
  it('AC6 Sisäkkäinen lohko ei lisää tyhjää riviä', () => expect(parseRichText('<div><p>A</p></div><div>B</div>').lines.map(line => line.segments.map(s => s.text).join(''))).toEqual(['A', 'B']));
  it('AC7 Tyhjällä rivillä ei ole segmenttejä', () => expect(parseRichText('<div>A</div><div><br></div><div>B</div>').lines[1]).toEqual({ segments: [] }));
  it('AC8 Samanmuotoiset jaksot yhdistetään', () => expect(parseRichText('<strong>A</strong><b>B</b><em>C</em>').lines[0]?.segments).toEqual([{ text: 'AB', bold: true, italic: false }, { text: 'C', bold: false, italic: true }]));
  it('AC9 Inline-pikselikoko luetaan', () => expect(parseRichText('<span style="font-size:18.5px">C</span>').lines[0]?.segments[0]?.fontSizePx).toBe(18.5));
  it.each(['<span style="font-size:2em">C</span>', '<span>C</span>'])('AC10 Muut kokolähteet ohitetaan', (html) => expect(parseRichText(html).lines[0]?.segments[0]).not.toHaveProperty('fontSizePx'));
  it('AC11 Selaimen korjaama HTML hyväksytään', () => expect(parseRichText('<strong><em>C</strong>').lines[0]?.segments[0]).toMatchObject({ bold: true, italic: true }));
  it('AC32 Script ja style poistetaan sisältöineen', () => expect(parseRichText('<script>x</script><style>x</style><span>C</span>').lines[0]?.segments.map(s => s.text).join('')).toBe('C'));
  it('AC33 Ei-tekstuaalinen sisältö poistetaan', () => expect(parseRichText('<img src=x alt=C><span>D</span>').lines[0]?.segments.map(s => s.text).join('')).toBe('D'));
  it('AC34 Tukemattoman elementin teksti säilyy', () => expect(parseRichText('<a href=x>C</a><u>D</u>').lines[0]?.segments).toEqual([{ text: 'CD', bold: false, italic: false }]));
  it('AC35 Syötteen attribuutit poistetaan', () => expect(parseRichText('<span class=x style="color:red" onclick=x>C</span>').lines[0]?.segments).toEqual([{ text: 'C', bold: false, italic: false }]));
  it.each(['', '<div><br></div>', '<div> \t</div>'])('AC37 Tyhjä rikasteksti hylätään', (html) => expect(() => parseRichText(html)).toThrow('Rikastekstisyöte ei saa olla tyhjä'));
  it('AC38 Parseri ei luokittele sisältöä', () => { const line = parseRichText('<strong>C</strong>').lines[0]; expect(line).toEqual({ segments: [{ text: 'C', bold: true, italic: false }] }); expect(line).not.toHaveProperty('type'); });
  it('AC39 normalisoi editorin sitovat välilyönnit', () => expect(parseRichText('<div>c&nbsp;c&nbsp;&nbsp;g</div>').lines[0]?.segments).toEqual([{ text: 'c c  g', bold: false, italic: false }]));
  it.each(['bold', 'bolder', '700'])('Pasted AC1: lukee CSS-lihavoinnin %s', (weight) => {
    expect(parseRichText(`<span style="font-weight:${weight}">A</span>`).lines[0]?.segments)
      .toEqual([{ text: 'A', bold: true, italic: false }]);
  });
  it.each(['italic', 'oblique'])('Pasted AC2: lukee CSS-kursivoinnin %s', (style) => {
    expect(parseRichText(`<span style="font-style:${style}">A</span>`).lines[0]?.segments)
      .toEqual([{ text: 'A', bold: false, italic: true }]);
  });
  it('Pasted AC3: kevyt paino ja normal-tyyli eivät lisää muotoilua', () => {
    expect(parseRichText('<span style="font-weight:500;font-style:normal">A</span>').lines[0]?.segments)
      .toEqual([{ text: 'A', bold: false, italic: false }]);
  });
});

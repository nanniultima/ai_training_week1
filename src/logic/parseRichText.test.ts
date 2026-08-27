// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { parseRichText } from './parseRichText.js';

describe('parseRichText', () => {
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
});

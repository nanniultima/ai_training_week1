// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import type { FormattedTextSegment, MusicResultLine } from '../types.js';
import { formatMusicResult, resolveBaseFontSize } from './formatMusicResult.js';
import { parseRichText } from './parseRichText.js';
const seg = (text: string, bold=false, italic=false, fontSizePx?: number): FormattedTextSegment => ({text,bold,italic,...(fontSizePx === undefined ? {} : {fontSizePx})});
const inner = (line: MusicResultLine) => formatMusicResult([line],12).replace(/^<div style="font-size:12px"><div>|<\/div><\/div>$/g, '');
describe('formatMusicResult', () => {
 it('Amendments AC23: ohittaa myöhemmän fonttikoon', () => {
   expect(resolveBaseFontSize([{ segments: [seg('C', false, false, 18), seg('D', false, false, 0)] }])).toBe('18px');
 });
 it.each([0, -1, NaN, Infinity, -Infinity])('Amendments AC22: hylkää määräävän merkin virheellisen koon (%s)', size => {
   expect(() => resolveBaseFontSize([{ segments: [seg('C', false, false, size)] }]))
     .toThrowError(new Error('Fonttikoon pitää olla positiivinen luku'));
 });
 it.each('| , . - : / ( )'.split(' '))('AC37 / AC18: kohdistettu erillinen musiikkimerkki lihavoidaan (%s)', text => {
   const content = `C# ${text}|`;
   expect(inner({ index: 0, type: 'chord', content, segments: [seg(content)], warnings: [], tokens: [
     { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 }, alignedRange: { start: 0, end: 2 } },
     { type: 'text', text: ' ', sourceRange: { start: 1, end: 2 } },
     { type: 'text', text, sourceRange: { start: 2, end: 3 } },
     { type: 'text', text: ' ', sourceRange: { start: 3, end: 4 } },
     { type: 'pipe', text: '|', sourceRange: { start: 4, end: 5 }, alignedRange: { start: 4, end: 5 } },
   ] })).toBe(`<strong><span>C#</span></strong><span> </span><strong><span>${text}</span></strong><strong><span>|</span></strong>`);
 });
 it('AC37 / AC20: kohdistetun tekstitokenin sisäinen piste säilyy tavallisena', () => {
   const element = document.createElement('div');
   element.innerHTML = inner({ index: 0, type: 'chord', content: 'C# rit.|', segments: [seg('C# '), seg('rit', false, true), seg('.|')], warnings: [], tokens: [
     { type: 'chord', text: 'C#', sourceRange: { start: 0, end: 1 }, alignedRange: { start: 0, end: 2 } },
     { type: 'text', text: ' ', sourceRange: { start: 1, end: 2 } },
     { type: 'text', text: 'rit.', sourceRange: { start: 2, end: 6 }, formatting: [seg('rit', false, true), seg('.')] },
     { type: 'pipe', text: '|', sourceRange: { start: 7, end: 8 }, alignedRange: { start: 7, end: 8 } },
   ] });
   expect(element.textContent).toBe('C# rit.|');
   expect([...element.querySelectorAll('strong')].map(node => node.textContent)).toEqual(['C#', '|']);
   expect([...element.querySelectorAll('em')].map(node => node.textContent).join('')).toBe('rit');
 });
 const sanitizedInner = (html: string) => inner({type:'text',segments:parseRichText(html).lines[0]!.segments});
 it.each([[1,'<strong><em><span>C</span></em></strong>'],[2,'<strong><span>C</span></strong>'],[3,'<span>C</span>'],[4,'<em><span>C</span></em>']])('AC15 Sävelen neljä rekisteriä muotoillaan',(register,html)=>expect(inner({index:0,type:'note',content:'C',parts:[{type:'noteGroup',notes:[{name:'C',register:register as 1|2|3|4}]}]})).toBe(html));
 it('AC16 Ryhmän rekisterit voivat erota',()=>expect(inner({index:0,type:'note',content:'AbC',parts:[{type:'noteGroup',notes:[{name:'Ab',register:3},{name:'C',register:4}]}]})).toBe('<span>Ab</span><em><span>C</span></em>'));
 it.each([['chord','Cm7/Bb'],['suspiciousChord','Dbfoo']] as const)('AC17 Soinnut lihavoidaan',(type,text)=>expect(inner({index:0,type:'chord',content:text,segments:[],warnings:[],tokens:[{type,text}]})).toBe(`<strong><span>${text}</span></strong>`));
 it.each('| , . - : / ( )'.split(' '))('AC18 Musiikkimerkit lihavoidaan',text=>expect(inner({index:0,type:'chord',content:text,segments:[],warnings:[],tokens:[{type:'text',text}]})).toBe(`<strong><span>${text}</span></strong>`));
 it('AC19 Muu merkki jää tekstiksi',()=>expect(inner({index:0,type:'chord',content:'+',segments:[],warnings:[],tokens:[{type:'text',text:'+'}]})).toBe('<span>+</span>'));
 it('AC20 Tekstitoken säilyttää sisämuotoilut',()=>expect(inner({index:0,type:'chord',content:'rit.',segments:[],warnings:[],tokens:[{type:'text',text:'rit.',formatting:[seg('rit',false,true),seg('.')]}]})).toBe('<em><span>rit</span></em><span>.</span>'));
 it('AC21 Sointutoken säilyttää lähdevälin',()=>expect(inner({index:0,type:'chord',content:'Db',segments:[],warnings:[],tokens:[{type:'chord',text:'Db',sourceRange:{start:0,end:1}}]})).toBe('<strong><span>Db</span></strong>'));
 it('AC22 Note-rivin xN säilyttää muotoilun',()=>expect(inner({index:0,type:'note',content:'x2',parts:[{type:'repeat',text:'x2',formatting:[seg('x2',false,true)]}]})).toBe('<em><span>x2</span></em>'));
 it('AC23 Note-rivin erotin säilyttää muotoilun',()=>expect(inner({index:0,type:'note',content:' - ',parts:[{type:'separator',text:' - ',formatting:[seg(' - ',true)]}]})).toBe('<strong><span> - </span></strong>'));
 it('AC24 Tekstirivi säilyttää muotoilut',()=>expect(formatMusicResult([{type:'text',segments:[seg('onpa '),seg('ihanaa',true),seg(' laulaa',false,true)]}],12)).toBe('<div style="font-size:12px"><div><span>onpa </span><strong><span>ihanaa</span></strong><em><span> laulaa</span></em></div></div>'));
 it('AC25 Tyhjä rivi säilyy',()=>expect(formatMusicResult([{type:'empty'}],12)).toBe('<div style="font-size:12px"><div><br></div></div>'));
 it('AC26 Ensimmäisen sisältömerkin koko valitaan',()=>expect(resolveBaseFontSize([{segments:[]},{segments:[seg('  '),seg('C',false,false,18.5)]}])).toBe('18.5px'));
 it('AC27 Puuttuvan koon oletus on 12px',()=>expect(resolveBaseFontSize([{segments:[seg('C')]}])).toBe('12px'));
 it.each([0,-1,NaN,Infinity,-Infinity])('AC28 Virheellinen ensimmäinen koko hylätään',value=>expect(()=>resolveBaseFontSize([{segments:[seg('C',false,false,value)]}])).toThrow('Fonttikoon pitää olla positiivinen luku'));
 it('AC29 Myöhempää kokoa ei validoida',()=>expect(resolveBaseFontSize([{segments:[seg('C',false,false,18),seg('D',false,false,0)]}])).toBe('18px'));
 it('AC30 Koko tulos käyttää yhtä kokoa',()=>expect(formatMusicResult([{index:0,type:'chord',content:'C',segments:[],warnings:[],tokens:[{type:'chord',text:'C'}]},{index:1,type:'note',content:'E',parts:[{type:'noteGroup',notes:[{name:'E',register:3}]}]},{type:'text',segments:[seg('onpa')]}],18)).toBe('<div style="font-size:18px"><div><strong><span>C</span></strong></div><div><span>E</span></div><div><span>onpa</span></div></div>'));
 it('AC31 Erikoismerkit enkoodataan',()=>expect(inner({type:'text',segments:[seg(`A&B < C > "D" 'E'`)]})).toBe('<span>A&amp;B &lt; C &gt; &quot;D&quot; &#39;E&#39;</span>'));
 it('AC32 Script ja style poistetaan sisältöineen',()=>expect(sanitizedInner('<script>x</script><style>x</style><span>C</span>')).toBe('<span>C</span>'));
 it('AC33 Ei-tekstuaalinen sisältö poistetaan',()=>expect(sanitizedInner('<img src=x alt=C><span>D</span>')).toBe('<span>D</span>'));
 it('AC34 Tukemattoman elementin teksti säilyy',()=>expect(sanitizedInner('<a href=x>C</a><u>D</u>')).toBe('<span>CD</span>'));
 it('AC35 Syötteen attribuutit poistetaan',()=>expect(sanitizedInner('<span class=x style="color:red" onclick=x>C</span>')).toBe('<span>C</span>'));
 it('AC36 Generoitu fonttikoko on ainoa attribuutti',()=>expect(formatMusicResult([{type:'text',segments:[seg('C')]}],12)).toBe('<div style="font-size:12px"><div><span>C</span></div></div>'));
});

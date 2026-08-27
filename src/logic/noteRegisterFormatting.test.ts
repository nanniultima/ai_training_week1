import { describe, expect, it } from 'vitest';
import { formattingToRegister, registerToFormatting } from './noteRegisterFormatting.js';

describe('note register formatting', () => {
  it('AC12 Muotoilut muuttuvat rekistereiksi', () => expect([[true,true],[true,false],[false,false],[false,true]].map(([bold, italic]) => formattingToRegister({ bold: bold!, italic: italic! }))).toEqual([1,2,3,4]));
  it('AC13 Rekisterit muuttuvat muotoiluiksi', () => expect([1,2,3,4].map(value => registerToFormatting(value))).toEqual([{bold:true,italic:true},{bold:true,italic:false},{bold:false,italic:false},{bold:false,italic:true}]));
  it.each([0, 5, 1.5])('AC14 Virherekisteri hylätään', (value) => expect(() => registerToFormatting(value)).toThrow('Rekisterin pitää olla kokonaisluku väliltä 1–4'));
});

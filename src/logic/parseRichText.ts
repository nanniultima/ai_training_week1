import type { InputLine } from '../types.js';

export function parseRichText(_html: string): { readonly lines: readonly InputLine[] } {
  const template = document.createElement('template');
  template.innerHTML = _html;
  const lines: { segments: { text: string; bold: boolean; italic: boolean; fontSizePx?: number }[] }[] = [{ segments: [] }];
  type Style = { bold: boolean; italic: boolean; fontSizePx?: number };
  const append = (text: string, style: Style): void => {
    const pieces = text.replace(/\u00a0/g, ' ').split('\n');
    pieces.forEach((piece, index) => {
      if (index > 0) lines.push({ segments: [] });
      if (!piece) return;
      const target = lines.at(-1)!;
      const previous = target.segments.at(-1);
      if (previous && previous.bold === style.bold && previous.italic === style.italic && previous.fontSizePx === style.fontSizePx) previous.text += piece;
      else target.segments.push({ text: piece, ...style });
    });
  };
  const lineBreak = (force = false): void => { if (force || lines.at(-1)!.segments.length > 0) lines.push({ segments: [] }); };
  const discarded = new Set(['SCRIPT', 'STYLE', 'IMG', 'VIDEO', 'AUDIO', 'CANVAS', 'SVG', 'IFRAME', 'OBJECT']);
  const blocks = new Set(['DIV', 'P']);
  const visit = (node: Node, inherited: Style): void => {
    if (node.nodeType === Node.TEXT_NODE) { append(node.textContent ?? '', inherited); return; }
    if (!(node instanceof HTMLElement) || discarded.has(node.tagName)) return;
    if (node.tagName === 'BR') { lineBreak(true); return; }
    const isBlock = blocks.has(node.tagName);
    if (isBlock && lines.at(-1)!.segments.length > 0) lineBreak();
    const style: Style = {
      bold: inherited.bold || node.tagName === 'STRONG' || node.tagName === 'B',
      italic: inherited.italic || node.tagName === 'EM' || node.tagName === 'I',
    };
    const fontValue = node.style.getPropertyValue('font-size').trim();
    const match = /^([+]?(?:\d+(?:\.\d*)?|\.\d+))px$/i.exec(fontValue);
    if (match) style.fontSizePx = Number(match[1]);
    else if (inherited.fontSizePx !== undefined) style.fontSizePx = inherited.fontSizePx;
    node.childNodes.forEach((child) => visit(child, style));
    if (isBlock && lines.at(-1)!.segments.length > 0) lineBreak();
  };
  template.content.childNodes.forEach((node) => visit(node, { bold: false, italic: false }));
  if (lines.length > 1 && lines.at(-1)!.segments.length === 0) lines.pop();
  if (!lines.some((line) => line.segments.some((segment) => /\S/.test(segment.text)))) throw new Error('Rikastekstisyöte ei saa olla tyhjä');
  return { lines: lines.map((line) => {
    const result: InputLine = { segments: line.segments };
    Object.defineProperty(result, 'text', { value: line.segments.map((segment) => segment.text).join(''), enumerable: false });
    return result;
  }) };
}

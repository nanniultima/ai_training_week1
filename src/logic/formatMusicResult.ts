import type { FormattedTextSegment, InputLine, MusicResultLine } from '../types.js';
import { registerToFormatting } from './noteRegisterFormatting.js';

const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const span = (text: string, bold: boolean, italic: boolean): string => {
  let html = `<span>${escapeHtml(text)}</span>`;
  if (italic) html = `<em>${html}</em>`;
  if (bold) html = `<strong>${html}</strong>`;
  return html;
};
const segments = (items: readonly FormattedTextSegment[]): string => items.map(item => span(item.text, item.bold, item.italic)).join('');

export function resolveBaseFontSize(lines: readonly InputLine[]): string {
  for (const line of lines) for (const item of line.segments) {
    const first = /\S/.exec(item.text);
    if (!first) continue;
    const size = item.fontSizePx;
    if (size === undefined) return '12px';
    if (!Number.isFinite(size) || size <= 0) throw new Error('Fonttikoon pitää olla positiivinen luku');
    return `${size}px`;
  }
  return '12px';
}

function formatLine(line: MusicResultLine): string {
  if (line.type === 'empty') return '<div><br></div>';
  if (line.type === 'text') return `<div>${segments(line.segments)}</div>`;
  if (line.type === 'note') return `<div>${line.parts.map(part => {
    if (part.type === 'noteGroup') return part.notes.map(note => { const f = registerToFormatting(note.register); return span(note.name, f.bold, f.italic); }).join('');
    return part.formatting ? segments(part.formatting) : span(part.text, false, false);
  }).join('')}</div>`;
  const tokens = line.tokens ?? [{ type: 'text' as const, text: line.content }];
  return `<div>${tokens.map(token => {
    if (token.type === 'chord' || token.type === 'suspiciousChord') return span(token.text, true, false);
    if (/^[|,.\-:/()]$/.test(token.text)) return span(token.text, true, false);
    if (token.formatting) return segments(token.formatting);
    return span(token.text, false, false);
  }).join('')}</div>`;
}

export function formatMusicResult(lines: readonly MusicResultLine[], fontSizePx: number): string {
  if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) throw new Error('Fonttikoon pitää olla positiivinen luku');
  return `<div style="font-size:${fontSizePx}px">${lines.map(formatLine).join('')}</div>`;
}

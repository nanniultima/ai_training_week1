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
const isMusicSymbol = (text: string): boolean => /^[|,.\-:/()]$/.test(text);

function formatAlignedMusic(line: Extract<MusicResultLine, { type: 'chord' | 'note' }>): string | undefined {
  const characters = [...line.content];
  let cursor = 0;
  let html = '';
  const appendGap = (end: number, formatting: readonly FormattedTextSegment[] = []): void => {
    const styles = formatting.flatMap(segment => [...segment.text].map(text => ({ ...segment, text })));
    let styleIndex = 0;
    for (const character of characters.slice(cursor, end)) {
      if (styles[styleIndex]?.text !== character && character !== ' ') {
        while (styles[styleIndex]?.text === ' ') styleIndex += 1;
      }
      const style = styles[styleIndex]?.text === character ? styles[styleIndex++] : undefined;
      html += span(character, style?.bold ?? false, style?.italic ?? false);
    }
    cursor = end;
  };
  if (line.type === 'chord') {
    const tokens = line.tokens?.filter(token => token.type !== 'text');
    if (!tokens?.length || tokens.some(token => !token.alignedRange)) return undefined;
    const sourceStyles = line.segments.flatMap(segment => [...segment.text].map(text => ({ ...segment, text })));
    const styledCharacters = characters.map((text, index) => sourceStyles[index] ?? { text, bold: false, italic: false });
    // Alignment changes spaces only, so non-space token order locates symbols
    // even when their source columns no longer match the visible columns.
    const visibleColumns = characters.flatMap((character, index) => character === ' ' ? [] : [index]);
    let visibleIndex = 0;
    for (const token of line.tokens ?? []) {
      if (token.type === 'text' && isMusicSymbol(token.text)) {
        const column = visibleColumns[visibleIndex];
        if (column !== undefined) styledCharacters[column] = { text: token.text, bold: true, italic: false };
      }
      visibleIndex += [...token.text].filter(character => character !== ' ').length;
    }
    for (const token of tokens) {
      const range = token.alignedRange!;
      appendGap(range.start, styledCharacters.slice(cursor, range.start));
      html += span(token.text, true, false);
      cursor = range.end;
    }
    appendGap(characters.length, styledCharacters.slice(cursor));
  } else {
    const groups = line.parts.filter(part => part.type === 'noteGroup');
    if (!groups.length || groups.some(part => !part.alignedRange)) return undefined;
    let gapFormatting: FormattedTextSegment[] = [];
    for (const part of line.parts) {
      if (part.type !== 'noteGroup') {
        gapFormatting.push(...(part.formatting ?? [{ text: part.text, bold: false, italic: false }]));
        continue;
      }
      appendGap(part.alignedRange!.start, gapFormatting);
      gapFormatting = [];
      html += part.notes.map(note => { const style = registerToFormatting(note.register); return span(note.name, style.bold, style.italic); }).join('');
      cursor = part.alignedRange!.end;
    }
    appendGap(characters.length, gapFormatting);
  }
  return `<div>${html}</div>`;
}

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
  const aligned = formatAlignedMusic(line);
  if (aligned !== undefined) return aligned;
  if (line.type === 'note') return `<div>${line.parts.map(part => {
    if (part.type === 'noteGroup') return part.notes.map(note => { const f = registerToFormatting(note.register); return span(note.name, f.bold, f.italic); }).join('');
    return part.formatting ? segments(part.formatting) : span(part.text, false, false);
  }).join('')}</div>`;
  const tokens = line.tokens ?? [{ type: 'text' as const, text: line.content }];
  return `<div>${tokens.map(token => {
    if (token.type === 'chord' || token.type === 'suspiciousChord') return span(token.text, true, false);
    if (isMusicSymbol(token.text)) return span(token.text, true, false);
    if (token.formatting) return segments(token.formatting);
    return span(token.text, false, false);
  }).join('')}</div>`;
}

export function formatMusicResult(lines: readonly MusicResultLine[], fontSizePx: number): string {
  if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) throw new Error('Fonttikoon pitää olla positiivinen luku');
  return `<div style="font-size:${fontSizePx}px">${lines.map(formatLine).join('')}</div>`;
}

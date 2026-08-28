import type { AlignedLineGroup, AlignedResultItem, ClassifiedLine, EmptyResultLine, FormattedTextLine, MusicResultLine } from '../types.js';

function identity(line: ClassifiedLine): FormattedTextLine | EmptyResultLine {
  if (line.type === 'empty') return { index: line.index, type: 'empty', content: '' };
  return { index: line.index, type: 'text', content: line.content, segments: line.segments };
}

export function groupAlignedLines(original: readonly ClassifiedLine[], results: readonly MusicResultLine[]): AlignedResultItem[] {
  const built: MusicResultLine[] = [];
  const resultByIndex = new Map(results.filter(line => line.index !== undefined).map(line => [line.index!, line]));
  if (!original.some(line => line.type === 'chord' || line.type === 'note')) {
    if (original.some(line => line.content.includes('\t'))) throw new Error('Kohdistettava syöte ei saa sisältää sarkainmerkkejä');
    return original.map(identity);
  }
  // Structural validation precedes every other validation.
  if (!original.some(line => line.type === 'chord' || line.type === 'note')) throw new Error('Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi');
  if (original.some(line => line.content.includes('\t'))) throw new Error('Kohdistettava syöte ei saa sisältää sarkainmerkkejä');
  for (const line of original) {
    if (line.type === 'text' || line.type === 'empty') built.push(identity(line));
    else {
      const result = resultByIndex.get(line.index);
      if (result && result.type !== line.type) throw new Error(`Rivin ${line.index} transponointituloksen tyyppi ${result.type} ei vastaa alkuperäistä tyyppiä ${line.type}`);
      if (!result) throw new Error(`Riviltä ${line.index} puuttuu transponointitulos`);
      if (result.type !== line.type) throw new Error(`Riviltä ${line.index} puuttuu transponointitulos`);
      built.push(result);
    }
  }
  const originalIndices = new Set(original.map(line => line.index));
  const extra = results.find(line => line.index !== undefined && !originalIndices.has(line.index));
  if (extra) throw new Error(`Rivillä ${extra.index!} on ylimääräinen transponointitulos`);
  for (const line of built) {
    if (line.type === 'chord' && (line.tokens ?? []).some(token => (token.type === 'chord' || token.type === 'suspiciousChord' || token.type === 'pipe') && token.sourceRange === undefined)) throw new Error('Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti');
    if (line.type === 'note' && line.parts.some(part => part.type === 'noteGroup' && part.sourceRange === undefined)) throw new Error('Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti');
  }
  const output: AlignedResultItem[] = [];
  let open: { chord?: Extract<MusicResultLine, { type: 'chord' }>; note?: Extract<MusicResultLine, { type: 'note' }>; text?: FormattedTextLine } | undefined;
  const flush = (): void => { if (open) output.push(open); open = undefined; };
  for (const line of built) {
    if (line.type === 'empty') { flush(); output.push({ ...line, content: '' }); continue; }
    if (line.type === 'chord') { flush(); open = { chord: line }; continue; }
    if (line.type === 'note') { if (!open || open.note) { flush(); open = { note: line }; } else open.note = line; continue; }
    const lastMusicIndex = open?.note?.index ?? open?.chord?.index;
    if (open && !open.text && lastMusicIndex !== undefined && line.index === lastMusicIndex + 1) open.text = line;
    else { flush(); output.push(line); }
  }
  flush();
  return output;
}

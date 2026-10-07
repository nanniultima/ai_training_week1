import type { ReadyTranspositionSettings } from '../types.js';

const NOTE_CHROMA: Readonly<Record<string, number>> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
  'A#': 10, Bb: 10, B: 11, H: 11,
};

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const MAJOR_FLAT = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']);
const MINOR_FLAT = new Set(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']);

function transposeNote(note: string, settings: ReadyTranspositionSettings): string {
  if (settings.step === 0) return note.startsWith('H') ? `B${note.slice(1)}` : note;
  const chroma = NOTE_CHROMA[note];
  if (chroma === undefined) throw new Error(`Tuntematon sävel: ${note}`);
  const flat = settings.mode === 'major'
    ? MAJOR_FLAT.has(settings.targetTonic) || (settings.targetTonic === 'C' && settings.step < 0)
    : MINOR_FLAT.has(settings.targetTonic) || (settings.targetTonic === 'A' && settings.step < 0);
  const names = flat ? FLAT_NAMES : SHARP_NAMES;
  return names[((chroma + settings.step) % 12 + 12) % 12] ?? '';
}

export function transposeChordSymbol(
  symbol: string,
  settings: ReadyTranspositionSettings,
): string {
  if (symbol.length === 0) throw new Error('Sointu ei saa olla tyhjä');
  const match = /^([A-GH][#b]?)(m|7|maj7|m7|sus|sus4|dim|aug|add9)?(?:\/([A-GH][#b]?))?$/.exec(symbol);
  if (match === null) throw new Error(`Tuntematon sointumerkintä: ${symbol}`);
  if (NOTE_CHROMA[match[1]!] === undefined || (match[3] !== undefined && NOTE_CHROMA[match[3]] === undefined)) {
    throw new Error(`Tuntematon sointumerkintä: ${symbol}`);
  }
  const root = transposeNote(match[1] ?? '', settings);
  const suffix = match[2] ?? '';
  const bass = match[3] === undefined ? '' : `/${transposeNote(match[3], settings)}`;
  return `${root}${suffix}${bass}`;
}

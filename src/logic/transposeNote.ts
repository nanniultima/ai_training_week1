import type { NoteRegister, ReadyTranspositionSettings, TransposedNote } from '../types.js';

const NATURAL_CHROMA: Readonly<Record<string, number>> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11,
};
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const MAJOR_FLAT = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']);
const MINOR_FLAT = new Set(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']);

function parsePitch(name: string): { offset: number } {
  if (name.length === 0) throw new Error('Sävel ei saa olla tyhjä');
  const match = /^([A-GHa-gh])([#b]?)$/.exec(name);
  if (match === null) throw new Error(`Tuntematon sävel: ${name}`);
  const letter = (match[1] ?? '').toUpperCase();
  const accidental = match[2] ?? '';
  const natural = NATURAL_CHROMA[letter];
  if (natural === undefined) throw new Error(`Tuntematon sävel: ${name}`);
  return {
    offset: natural + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0),
  };
}

export function transposeNote(name: string, register: number, settings: ReadyTranspositionSettings): TransposedNote {
  if (!Number.isInteger(register) || register < 1 || register > 4) {
    throw new Error('Rekisterin pitää olla kokonaisluku väliltä 1–4');
  }
  if (!Number.isInteger(settings.step) || settings.step < -11 || settings.step > 11) {
    throw new Error('Askelmäärän pitää olla kokonaisluku väliltä -11–11');
  }
  const parsed = parsePitch(name);
  if (settings.step === 0) {
    return { name: /^[Hh]/.test(name) ? `B${name.slice(1)}` : name, register: register as NoteRegister };
  }
  const absolute = (register - 1) * 12 + parsed.offset + settings.step;
  const resultRegister = Math.floor(absolute / 12) + 1;
  if (resultRegister < 1) throw new Error(`Sävel ${name} alittaa tuetun sävelalueen`);
  if (resultRegister > 4) throw new Error(`Sävel ${name} ylittää tuetun sävelalueen`);
  const pitchClass = ((absolute % 12) + 12) % 12;
  const flat = settings.mode === 'major'
    ? MAJOR_FLAT.has(settings.targetTonic) || (settings.targetTonic === 'C' && settings.step < 0)
    : MINOR_FLAT.has(settings.targetTonic) || (settings.targetTonic === 'A' && settings.step < 0);
  const resultName = (flat ? FLAT_NAMES : SHARP_NAMES)[pitchClass] ?? '';
  return { name: resultName, register: resultRegister as NoteRegister };
}

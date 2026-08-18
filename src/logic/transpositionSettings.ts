import { chroma } from '@tonaljs/note';

import type {
  KeyMode,
  TranspositionSettingsInput,
  TranspositionSettingsResult,
} from '../types.js';

const MAJOR_TONICS = [
  'C',
  'C#',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
  'Cb',
] as const;

const MINOR_TONICS = [
  'C',
  'C#',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
] as const;

const MAJOR_TARGET_TONICS = [
  ['C'],
  ['C#', 'Db'],
  ['D'],
  ['Eb'],
  ['E'],
  ['F'],
  ['F#', 'Gb'],
  ['G'],
  ['Ab'],
  ['A'],
  ['Bb'],
  ['B', 'Cb'],
] as const;

const MINOR_TARGET_TONICS = [
  ['C'],
  ['C#'],
  ['D'],
  ['D#', 'Eb'],
  ['E'],
  ['F'],
  ['F#'],
  ['G'],
  ['G#', 'Ab'],
  ['A'],
  ['A#', 'Bb'],
  ['B'],
] as const;

/** Palauttaa AC1:ssä määritellyt duurin lähtötoonikat. */
export function getAvailableTonics(
  mode: KeyMode,
): readonly string[] {
  return mode === 'major' ? MAJOR_TONICS : MINOR_TONICS;
}

/** Ratkaisee AC4:n ja AC5:n mukaiset kohdetoonikat. */
export function resolveTranspositionSettings(
  input: TranspositionSettingsInput,
): TranspositionSettingsResult {
  const sourceChroma = chroma(input.sourceTonic);
  const targetChroma = ((sourceChroma + input.step) % 12 + 12) % 12;
  const targetTonics =
    input.mode === 'major'
      ? MAJOR_TARGET_TONICS[targetChroma]
      : MINOR_TARGET_TONICS[targetChroma];

  if (targetTonics === undefined) {
    throw new Error('Kohdesävellajia ei voitu ratkaista');
  }

  if (input.step === 0) {
    return {
      status: 'ready',
      mode: input.mode,
      sourceTonic: input.sourceTonic,
      targetTonic: input.sourceTonic,
    };
  }

  if (targetTonics.length === 2) {
    return {
      status: 'requiresEnharmonicChoice',
      mode: input.mode,
      sourceTonic: input.sourceTonic,
      options: targetTonics,
    };
  }

  return {
    status: 'ready',
    mode: input.mode,
    sourceTonic: input.sourceTonic,
    targetTonic: targetTonics[0],
  };
}

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
  if (input.mode !== 'major' && input.mode !== 'minor') {
    throw new Error(`Tuntematon sävellajin laatu: ${String(input.mode)}`);
  }
  if (
    !Number.isInteger(input.step) ||
    input.step < -11 ||
    input.step > 11
  ) {
    throw new Error(
      'Askelmäärän pitää olla kokonaisluku väliltä -11–11',
    );
  }

  const sourceTonic = input.sourceTonic;

  if (!getAvailableTonics(input.mode).includes(sourceTonic)) {
    throw new Error(
      `Tuntematon lähtösävellaji: ${input.sourceTonic}`,
    );
  }

  const sourceChroma = chroma(sourceTonic);
  const targetChroma = ((sourceChroma + input.step) % 12 + 12) % 12;
  const targetTonics =
    input.mode === 'major'
      ? MAJOR_TARGET_TONICS[targetChroma]
      : MINOR_TARGET_TONICS[targetChroma];

  if (targetTonics === undefined) {
    throw new Error('Kohdesävellajia ei voitu ratkaista');
  }

  if (
    input.targetTonicChoice !== undefined &&
    (input.step === 0 || targetTonics.length === 1)
  ) {
    const targetTonic =
      input.step === 0 ? sourceTonic : targetTonics[0];
    const modeName = input.mode === 'major' ? 'duuri' : 'molli';
    throw new Error(
      `Kohdesävellaji ${targetTonic}-${modeName} ei tarvitse enharmonista valintaa`,
    );
  }

  if (input.step === 0) {
    return {
      status: 'ready',
      mode: input.mode,
      sourceTonic,
      step: input.step,
      targetTonic: sourceTonic,
    };
  }

  if (targetTonics.length === 2) {
    if (
      input.targetTonicChoice !== undefined &&
      (targetTonics as readonly string[]).includes(input.targetTonicChoice)
    ) {
      return {
        status: 'ready',
        mode: input.mode,
        sourceTonic,
        step: input.step,
        targetTonic: input.targetTonicChoice,
      };
    }
    if (input.targetTonicChoice !== undefined) {
      throw new Error(
        `Kohdetoonika ${input.targetTonicChoice} ei kuulu vaihtoehtoihin ${targetTonics.join(', ')}`,
      );
    }
    return {
      status: 'requiresEnharmonicChoice',
      mode: input.mode,
      sourceTonic,
      step: input.step,
      options: targetTonics,
    };
  }

  return {
    status: 'ready',
    mode: input.mode,
    sourceTonic,
    step: input.step,
    targetTonic: targetTonics[0],
  };
}

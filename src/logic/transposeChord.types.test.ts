import { describe, expect, it } from 'vitest';

import type { ClassifiedLine, TranspositionSettingsResult } from '../types.js';
import { transposeChordSymbol } from './transposeChord.js';
import { transposeChordLine } from './transposeChordLine.js';

describe('sointutransponoinnin tyyppisopimus', () => {
  it('AC32 hyväksyy vain ready-asetustuloksen', () => {
    const waiting: TranspositionSettingsResult = {
      status: 'requiresEnharmonicChoice',
      mode: 'major',
      sourceTonic: 'C',
      step: 1,
      options: ['C#', 'Db'],
    };
    const line: ClassifiedLine = {
      index: 0,
      type: 'chord',
      content: 'C |',
      segments: [{ text: 'C |', bold: false, italic: false }],
    };

    if (false) {
      // @ts-expect-error waiting-variantti ei kelpaa symbolifunktiolle
      transposeChordSymbol('C', waiting);
      // @ts-expect-error waiting-variantti ei kelpaa rivifunktiolle
      transposeChordLine(line, waiting);
    }
    expect(waiting.status).toBe('requiresEnharmonicChoice');
  });
});

import { describe, expectTypeOf, it } from 'vitest';
import type { TransposedNoteLine, TransposedNoteLinePart } from '../types.js';

describe('TransposedNoteLine types', () => {
  it('tyypittää osat tyhjentävästi ilman segments-kenttää', () => {
    expectTypeOf<keyof TransposedNoteLine>().toEqualTypeOf<'index' | 'type' | 'content' | 'parts'>();
    expectTypeOf<TransposedNoteLine['parts'][number]>().toEqualTypeOf<TransposedNoteLinePart>();
  });
});

/** Transponointiaskeleiden sallittu kokonaislukuväli on -12...12. */
export type TranspositionStep = number;

export type MusicInput = string;
export type TransposedMusic = string;
export type ChordSymbol = string;
export type NoteName = string;

export interface TranspositionRequest {
  readonly input: MusicInput;
  readonly step: TranspositionStep;
}

export interface ChordNotesRequest {
  readonly chord: ChordSymbol;
}

export interface ChordNotesResult {
  readonly chord: ChordSymbol;
  readonly notes: readonly NoteName[];
}

export interface MusicRecord {
  readonly id: string;
  readonly input: MusicInput;
  readonly output: TransposedMusic;
  readonly step: TranspositionStep;
}

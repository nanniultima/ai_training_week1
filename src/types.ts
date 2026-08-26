/** Transponointiaskeleiden sallittu kokonaislukuväli on -11...11. */
export type TranspositionStep = number;

export type KeyMode = 'major' | 'minor';

export interface TranspositionSettingsInput {
  readonly mode: KeyMode;
  readonly sourceTonic: string;
  readonly step: number;
  readonly enharmonicChoice?: 'sharp' | 'flat';
}

export type TranspositionSettingsResult =
  | {
      readonly status: 'ready';
      readonly mode: KeyMode;
      readonly sourceTonic: string;
      readonly targetTonic: string;
    }
  | {
      readonly status: 'requiresEnharmonicChoice';
      readonly mode: KeyMode;
      readonly sourceTonic: string;
      readonly options: readonly string[];
    };

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

export interface FormattedTextSegment {
  readonly text: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly fontSizePx?: number;
}

export interface InputLine {
  readonly segments: readonly FormattedTextSegment[];
}

export type LineType = 'chord' | 'note' | 'text' | 'empty';

export interface ClassifiedLine {
  readonly index: number;
  readonly type: LineType;
  readonly content: string;
  readonly segments: readonly FormattedTextSegment[];
}

export interface AmbiguousNoteLineWarning {
  readonly code: 'AMBIGUOUS_NOTE_LINE';
  readonly lineIndex: number;
  readonly content: string;
}

export interface ClassificationResult {
  readonly lines: readonly ClassifiedLine[];
  readonly warnings: readonly AmbiguousNoteLineWarning[];
}

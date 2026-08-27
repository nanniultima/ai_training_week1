/** Transponointiaskeleiden sallittu kokonaislukuväli on -11...11. */
export type TranspositionStep = number;

export type KeyMode = 'major' | 'minor';

export interface TranspositionSettingsInput {
  readonly mode: KeyMode;
  readonly sourceTonic: string;
  readonly step: number;
  readonly targetTonicChoice?: string;
}

export type TranspositionSettingsResult =
  | {
      readonly status: 'ready';
      readonly mode: KeyMode;
      readonly sourceTonic: string;
      readonly step: TranspositionStep;
      readonly targetTonic: string;
    }
  | {
      readonly status: 'requiresEnharmonicChoice';
      readonly mode: KeyMode;
      readonly sourceTonic: string;
      readonly step: TranspositionStep;
      readonly options: readonly string[];
    };

export type ReadyTranspositionSettings = Extract<
  TranspositionSettingsResult,
  { readonly status: 'ready' }
>;

export type MusicInput = string;
export type TransposedMusic = string;
export type ChordSymbol = string;
export type NoteName = string;
export type NoteRegister = 1 | 2 | 3 | 4;

export interface TransposedNote {
  readonly name: string;
  readonly register: NoteRegister;
}
export interface TransposedNoteGroupPart { readonly type: 'noteGroup'; readonly notes: readonly TransposedNote[]; }
export interface SeparatorPart { readonly type: 'separator'; readonly text: string; }
export interface RepeatPart { readonly type: 'repeat'; readonly text: string; }
export type TransposedNoteLinePart = TransposedNoteGroupPart | SeparatorPart | RepeatPart;
export interface TransposedNoteLine {
  readonly index: number;
  readonly type: 'note';
  readonly content: string;
  readonly parts: readonly TransposedNoteLinePart[];
}

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

export interface SuspiciousChordWarning {
  readonly code: 'SUSPICIOUS_CHORD';
  readonly lineIndex: number;
  readonly startIndex: number;
  readonly original: string;
  readonly output: string;
}

export interface LowercaseChordWarning {
  readonly code: 'LOWERCASE_CHORD';
  readonly lineIndex: number;
  readonly startIndex: number;
  readonly original: string;
}

export type ChordLineWarning = SuspiciousChordWarning | LowercaseChordWarning;

export interface TransposedChordLine extends ClassifiedLine {
  readonly type: 'chord';
  readonly warnings: readonly ChordLineWarning[];
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

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
export interface TransposedNoteGroupPart { readonly type: 'noteGroup'; readonly notes: readonly TransposedNote[]; readonly sourceText?: string; readonly sourceRange?: SourceRange; readonly alignedRange?: AlignedRange | undefined; }
export interface SeparatorPart { readonly type: 'separator'; readonly text: string; readonly formatting?: readonly FormattedTextSegment[]; }
export interface RepeatPart { readonly type: 'repeat'; readonly text: string; readonly formatting?: readonly FormattedTextSegment[]; }
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
  readonly text?: string;
  readonly segments: readonly FormattedTextSegment[];
}

export interface SourceRange { readonly start: number; readonly end: number; }
export interface AlignedRange { readonly start: number; readonly end: number; }
export interface ChordResultToken { readonly type: 'chord' | 'suspiciousChord' | 'text' | 'pipe'; readonly text: string; readonly sourceRange?: SourceRange; readonly alignedRange?: AlignedRange | undefined; readonly formatting?: readonly FormattedTextSegment[]; }
export interface FormattedTextLine { readonly index?: number; readonly type: 'text'; readonly content?: string; readonly segments: readonly FormattedTextSegment[]; }
export interface EmptyResultLine { readonly index?: number; readonly type: 'empty'; readonly content?: ''; }

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
  readonly tokens?: readonly ChordResultToken[] | undefined;
}

export type MusicResultLine = TransposedChordLine | TransposedNoteLine | FormattedTextLine | EmptyResultLine;

export interface AlignedLineGroup {
  readonly chord?: TransposedChordLine | undefined;
  readonly note?: TransposedNoteLine | undefined;
  readonly text?: FormattedTextLine | undefined;
}
export type AlignedResultItem = AlignedLineGroup | FormattedTextLine | EmptyResultLine;
export type AlignedChordResultToken =
  | (ChordResultToken & {
      readonly type: 'chord' | 'suspiciousChord' | 'pipe';
      readonly sourceRange: SourceRange;
      readonly alignedRange: AlignedRange;
    })
  | (ChordResultToken & { readonly type: 'text' });
export type AlignedNoteGroupPart = TransposedNoteGroupPart & {
  readonly sourceRange: SourceRange;
  readonly alignedRange: AlignedRange;
};
export type AlignedNoteLinePart = AlignedNoteGroupPart | SeparatorPart | RepeatPart;
export type AlignedChordLine = Omit<TransposedChordLine, 'tokens'> & {
  readonly tokens: readonly AlignedChordResultToken[];
};
export type AlignedNoteLine = Omit<TransposedNoteLine, 'parts'> & {
  readonly parts: readonly AlignedNoteLinePart[];
};
export type AlignedMusicResultLine = AlignedChordLine | AlignedNoteLine | FormattedTextLine | EmptyResultLine;

export interface AmbiguousNoteLineWarning {
  readonly code: 'AMBIGUOUS_NOTE_LINE';
  readonly lineIndex: number;
  readonly content: string;
}

export interface ClassificationResult {
  readonly lines: readonly ClassifiedLine[];
  readonly warnings: readonly AmbiguousNoteLineWarning[];
}

export type ProcessingWarning = AmbiguousNoteLineWarning | ChordLineWarning;

export interface TranspositionPresentation {
  readonly html: string;
  readonly plainText: string;
  readonly warnings: readonly string[];
}

export interface ClipboardWriteAdapter {
  readonly write: (items: readonly ClipboardItem[]) => Promise<void>;
}

# Architecture: alignment-preservation

## Flow
`ClassifiedLine[]` and matching `MusicResultLine[]` → `groupAlignedLines` →
`collectAlignmentAnchors` → `calculateAlignedColumns` → `alignLineGroup` →
`formatMusicResult` (feature 5) → presentation (feature 7).

## Contracts
- `SourceRange` uses zero-based Unicode code-point columns and exclusive end.
- Chords, every pipe, and note groups carry mandatory ranges; note groups also
  carry source text. Text/empty result lines carry index and content.
- Groups contain at most chord, note, text in that order. Standalone text and
  empty rows remain ordered result items.
- Only four alignment functions are public. Text/music editing helpers remain
  private. Business logic has no DOM or UI dependency.

## Algorithm
Merge and validate rows by index/type. Build the sorted union of anchors. For
each interval, consider only tokens starting at its left anchor, choose the
largest length delta, and clamp against the longest result plus the original
separator. Rewrite semantic parts and formatting segments at calculated
columns. Validation order is structure, tabs, row matching, ranges, math.

## Rollback
Remove both alignment modules and their types, restore feature 3–5 result
contracts, and pass transposed rows directly to the formatter.

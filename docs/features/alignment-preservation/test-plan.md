# Test plan: alignment-preservation

## Traceability
The specification defines exactly 48 tests named `ACn: ...`:

- AC1–AC21 and AC40–AC44: `alignLineGroup.test.ts`
- AC22–AC24 and AC30–AC39: `groupAlignedLines.test.ts`
- AC25–AC29: alignment tests covering single-line and validation paths
- AC45: `transposeChordLine.test.ts` plus its type test
- AC46: `transposeNoteLine.test.ts` plus its type test
- AC47–AC48: `alignment.types.test.ts`

## Coverage
Happy paths cover shared anchors, growth, shrinkage, groups, formatting and
standalone rows. Error paths are AC27–AC29, AC32–AC33, AC38 and AC44. Edge
cases are line ends, whitespace-only empty rows, Unicode, missing interval
tokens, collisions, short lyric rows and inherited font size.

For every AC run RED for that named test, GREEN with the smallest change, then
the complete suite. Final verification: `npm run lint`, `npm test`, and
`git diff --check`. Report test-file/test/failure/skip counts with project
symbols.

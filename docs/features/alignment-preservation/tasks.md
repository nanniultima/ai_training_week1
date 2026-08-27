# Tasks: alignment-preservation

1. Mark the spec `In Progress`; add code-point range and aligned-line types.
2. AC45: update chord/pipe token production and type tests by TDD.
3. AC46: update note-group source metadata and type tests by TDD.
4. AC47–AC48: update text/empty identity and lock the public API.
5. AC22–AC24 and AC30–AC39: implement row matching, validation and grouping in
   AC order.
6. AC1–AC21 and AC40–AC44: implement anchors, columns and rewriting in AC
   order, including error and Unicode cases.
7. Adapt `formatMusicResult` only for the updated aligned semantic model.
8. Run lint, all tests and diff checks; review every change against its AC.
9. Mark the spec `Done` only after all 48 ACs and final checks pass.

Do not change UI, create HTML in alignment logic, or implement feature 7.

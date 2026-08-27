# Sävelten transponointi — tehtävät

## TDD-järjestys

- [ ] Merkitse speksi `In Progress` ennen tuotantokoodia.
- [ ] AC1–AC3: yhden sävelen perustransponointi.
- [ ] AC4–AC6: sävelryhmäparserin peruskielioppi.
- [ ] AC7–AC18: ryhmät, enharmoninen nimi ja oktaavirajat.
- [ ] AC19–AC22: semanttinen kokonainen sävelrivi.
- [ ] AC23–AC27: nykyiset virhe- ja rajatapaukset.
- [ ] AC28–AC31: segmenttirekisterit, yhdysmerkki ja enharmoniset lähtönimet.
- [ ] AC32–AC34: parserin ja rekisterin validointi.
- [ ] Lisää tulostyypin tyyppitesti.
- [ ] Aja lint, kaikki testit ja `git diff --check`.
- [ ] Vertaa diffiä AC1–AC34:ään review-työnkululla.
- [ ] Merkitse speksi `Done` vasta kaikkien tarkistusten jälkeen.

Jokaisessa kohdassa kirjoita vain kyseisen AC:n epäonnistuva testi, varmista
RED oikeasta syystä, tee pienin GREEN-toteutus ja refaktoroi testien pysyessä
vihreinä. Kahden peräkkäisen väärästä syystä punaisen kierroksen jälkeen
pysähdy AGENTS.md:n mukaisesti.

## Sallitut toteutustiedostot

`src/types.ts`, `src/logic/parseNoteGroup.ts`,
`src/logic/parseNoteGroup.test.ts`, `src/logic/classifyLines.ts`,
`src/logic/classifyLines.test.ts`, `src/logic/transposeNote.ts`,
`src/logic/transposeNote.test.ts`, `src/logic/transposeNoteLine.ts` ja
`src/logic/transposeNoteLine.test.ts`. Tyyppitesti sijoitetaan tiedostoon
`src/logic/transposeNote.types.test.ts`.

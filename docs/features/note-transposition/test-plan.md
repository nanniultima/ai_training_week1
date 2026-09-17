# Sävelten transponointi — testisuunnitelma

## Menetelmä

Vitest-testit sijoitetaan moduulien viereen. Jokainen testi nimetään muodossa
`ACN <kuvaus>`. TDD etenee AC1–AC34 järjestyksessä RED–GREEN–REFACTOR.
Jokaisen GREEN-vaiheen jälkeen ajetaan kaikki testit.

## Jäljitettävyys

| AC:t | Nimetyt testit | Tiedosto |
|---|---|---|
| AC1–AC3 | `AC1 pieni kirjain`, `AC2 alaspäin`, `AC3 H/h` | `transposeNote.test.ts` |
| AC4–AC6 | `AC4 pieni b`, `AC5 iso B`, `AC6 ylennys` | `parseNoteGroup.test.ts` |
| AC7 | `AC7 saman tavun ryhmä` | `transposeNoteLine.test.ts` |
| AC8–AC18 | `AC8 sharp`, `AC9 flat`, `AC10 C-duuri ylös`, `AC11 C-duuri alas`, `AC12 A-molli ylös`, `AC13 A-molli alas`, `AC14 B–C`, `AC15 C–B`, `AC16 rekisteri säilyy`, `AC17 alaraja`, `AC18 yläraja` | `transposeNote.test.ts` |
| AC19–AC22 | `AC19 koko rivi ylös`, `AC20 koko rivi alas`, `AC21 välit ja xN`, `AC22 nolla` | `transposeNoteLine.test.ts` |
| AC23–AC24 | `AC23 tyhjä sävel`, `AC24 tuntematon sävel` | `transposeNote.test.ts` |
| AC25–AC26 | `AC25 tuntematon rivitoken`, `AC26 väärä rivityyppi` | `transposeNoteLine.test.ts` |
| AC27 | `AC27 askelraja` | `transposeNote.test.ts` |
| AC28–AC30 | `AC28 ryhmän eri rekisterit`, `AC29 kirjain määrää rekisterin`, `AC30 tiukka yhdysmerkki` | `transposeNoteLine.test.ts` |
| AC31 | `AC31 enharmoniset lähtönimet` | `transposeNote.test.ts` |
| AC32–AC33 | `AC32 tyhjä ryhmä`, `AC33 virheellinen ryhmä` | `parseNoteGroup.test.ts` |
| AC34 | `AC34 virheellinen rekisteri` | `transposeNote.test.ts` |
| AC35 | `AC35 ylennyksen jälkeinen pieni b` | `parseNoteGroup.test.ts` |

## Raja- ja virhekattavuus

AC14–AC18 kattavat oktaavirajat, AC23–AC27 tyhjän/tuntemattoman syötteen,
atomisuuden, rivityypin ja askelrajan. AC31 kattaa lähtöetumerkin aiheuttamat
oktaavirajat. AC32–AC34 kattavat parserin ja rekisterin ajonaikaisen
validoinnin. Lisäksi TypeScript-tyyppitestissä varmistetaan, ettei
`TransposedNoteLine` sisällä `segments`-kenttää ja että osat ovat tyhjentävästi
tyypitettyjä.

## Valmistumistarkistus

Aja `npm run lint`, `npm test` ja `git diff --check`. Raportoi testitiedostojen,
testien, epäonnistuneiden ja ohitettujen testien määrät AGENTS.md:n symboleilla.

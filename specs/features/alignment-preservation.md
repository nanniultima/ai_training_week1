# Feature: Rivien välisen kohdistuksen säilyttäminen

**Status:** Ready for implementation

## Problem Statement
Transponointi muuttaa musiikkimerkintöjen pituuksia ja rikkoo sointu-, sävel-
ja tekstirivien yhteiset sarakkeet. Kohdistus on palautettava ennen HTML:ää.

## Proposed Change
Lisätään julkiset `groupAlignedLines`, `collectAlignmentAnchors`,
`calculateAlignedColumns` ja `alignLineGroup`. Alkuperäiset ja transponoidut
rivit yhdistetään `index`+`type`-avaimella. Sointujen, erillisten putkien ja
sävelryhmien pakolliset `SourceRange`-arvot ovat Unicode-koodipistesarakkeita
ja `end` on poissulkeva. Ryhmä on `[chord?,note?,text?]`; uusi chord ja toinen
note aloittavat uuden ryhmän. Tyhjä päättää ryhmän. Sarkain kielletään koko
syötteestä.

Ensimmäinen ankkuri säilyy. Välillä huomioidaan vain nykyisestä ankkurista
alkavat tokenit; suurin pituusmuutos ratkaisee, mutta pisimmän tulostokenin ja
alkuperäisen erottimen vaatima tila estää törmäyksen. Musiikkiin lisätään
muotoilemattomia välejä. Tekstiin lisätään välejä välijaksoon ja viivoja sanan
sisään; lyhyt rivi täytetään lisäyskohtaan. Viiva perii edeltävän, muuten
seuraavan merkin koko muotoilun. Viiva poistetaan vain siirtyvältä
ankkurirajalta lyhenemisen vuoksi. Validointijärjestys on rakenne, sarkain,
rivivastaavuus, sijainnit, laskenta. Ominaisuus ei muuta UI:ta eikä tee HTML:ää.

## Acceptance Criteria
Jokainen rivi on Given/When/Then ja sen odotettu arvo on täsmällinen.

1. **AC1:** Given chordit `0,3`, putket `2,5`, notet `0,2`; When kerätään; Then `[0,2,3,5]`.
2. **AC2:** Given `G#C D` ryhmät `0,4`; When kerätään; Then `[0,4]`, ei `2`.
3. **AC3:** Given `[0,2]`, `C→C#`; When lasketaan; Then `[0,3]`.
4. **AC4:** Given `[0,4]`, `C7→D7`; When lasketaan; Then `[0,4]`.
5. **AC5:** Given `[0,2]`, `A→A#m` ja `A→A#`; When lasketaan; Then `[0,4]`.
6. **AC6:** Given `c c`/`onpa`→`C#,C#`; When kohdistetaan; Then `C# C#`/`on-pa`.
7. **AC7:** Given `c c  a a a`/`onpa i-hanaa`, kaikki +1; When kohdistetaan; Then `C# C#  A# A# A#`/`on-pa i--ha-naa`.
8. **AC8:** Given `gB g`/`laule`→`AbC,Ab`; When kohdistetaan; Then `AbC Ab`/`lau-le`.
9. **AC9:** Given chord `C#,G#`, note `C,G`, `[0,2]`; When kohdistetaan; Then `C# G#`/`C  G`, toiset sarakkeessa 3.
10. **AC10:** Given `onpa  ihanaa`, kohta 5, +1; When kohdistetaan; Then `onpa   ihanaa`.
11. **AC11:** Given `onpa`, kohta 2, +2; When kohdistetaan; Then `on--pa`.
12. **AC12:** Given `C# D` `[0,3]`→`C,C#`; When kohdistetaan; Then `C C#`, C# sarakkeessa 2.
13. **AC13:** Given `Db G` `[0,3]`→`C,F#`; When kohdistetaan; Then `C F#`, F# sarakkeessa 2.
14. **AC14:** Given `C# |G|`→`C,F#`; When kohdistetaan; Then `C |F#|`, putki sarakkeessa 2.
15. **AC15:** Given `C# D`/`on-pa`→`C,C#`; When kohdistetaan; Then `C C#`/`onpa`.
16. **AC16:** Given `on-pa nyt-kin`, vain ensimmäinen viiva rajalla; When kohdistetaan; Then `onpa nyt-kin`.
17. **AC17:** Given chord lyhenee, note pitenee ja `on-pa`; When kohdistetaan; Then `[0,3]` ja `on-pa`.
18. **AC18:** Given loput `Cmaj7`,`nyt`; When kohdistetaan; Then ei loppuvälejä.
19. **AC19:** Given lisätty musiikkiväli; When muodostetaan; Then `{text:" ",bold:false,italic:false}` ilman fonttikokoa.
20. **AC20:** Given bold `on`, viiva kohtaan 2; When muodostetaan; Then `on-pa`, viiva bold eikä italic.
21. **AC21:** Given `C x2 |G |→C# x2 |G# |`, x2 italic; When kohdistetaan; Then sama tulos ja x2 kerran italic.
22. **AC22:** Given text,chord,text; When ryhmitellään; Then itsenäinen ensimmäinen text ja `[chord,text]`.
23. **AC23:** Given chord,text,text,chord; When ryhmitellään; Then `[chord,text]`, itsenäinen text, `[chord]`.
24. **AC24:** Given chord,empty,chord; When ryhmitellään; Then kaksi ryhmää ja välissä content `""`.
25. **AC25:** Given vain chord `C |G |→C# |G# |`; When kohdistetaan; Then `C# |G# |`.
26. **AC26:** Given vain note `c c→C# C#`; When kohdistetaan; Then `C# C#`.
27. **AC27:** Given vain text; When kohdistetaan; Then virhe `Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi`.
28. **AC28:** Given `C\t|G |`; When kohdistetaan; Then virhe `Kohdistettava syöte ei saa sisältää sarkainmerkkejä`.
29. **AC29:** Given noteGroup ilman rangea; When kohdistetaan; Then virhe `Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti`.
30. **AC30:** Given chord,chord,chord; When ryhmitellään; Then kolme yhden chordin ryhmää.
31. **AC31:** Given chord,note,chord,note; When ryhmitellään; Then kaksi `[chord,note]`-ryhmää.
32. **AC32:** Given alkuperäinen rivi 2 ilman tulosta; When ryhmitellään; Then `Riviltä 2 puuttuu transponointitulos`.
33. **AC33:** Given ylimääräinen tulos 4; When ryhmitellään; Then `Rivillä 4 on ylimääräinen transponointitulos`.
34. **AC34:** Given `😀C`, C:n UTF-16-indeksi 2; When alue tehdään; Then `{start:1,end:2}`.
35. **AC35:** Given note,note; When ryhmitellään; Then kaksi note-ryhmää.
36. **AC36:** Given note,chord; When ryhmitellään; Then `[note]`,`[chord]`.
37. **AC37:** Given chord,note,note; When ryhmitellään; Then `[chord,note]`,`[note]`.
38. **AC38:** Given itsenäinen `Ohje\tnyt`; When ryhmitellään; Then AC28:n virhe.
39. **AC39:** Given empty content `"   "`; When ryhmitellään; Then index säilyy ja content `""`.
40. **AC40:** Given chord lyhenee eikä note-tokenia ole ankkurissa; When lasketaan; Then seuraava siirtyy 1 vasemmalle.
41. **AC41:** Given `[0,2]`, tulostoken `Cmaj7`, erotin 1; When lasketaan; Then `[0,6]`.
42. **AC42:** Given text `on`, kohta 4, +1; When kohdistetaan; Then `on   `.
43. **AC43:** Given edeltävä `{bold:false,italic:true,fontSizePx:18}`; When viiva lisätään; Then viivalla täsmälleen sama muotoilu.
44. **AC44:** Given rakennevirhe+sarkain+puuttuva tulos; When validoidaan; Then AC27:n virhe.
45. **AC45:** Given `C |G |`; When chord-tulos tehdään; Then ranget C `{0,1}`, putki `{2,3}`, G `{3,4}`, putki `{5,6}` ja putket ovat omia tokeneita.
46. **AC46:** Given `G#C D`; When note-tulos tehdään; Then ryhmät `G#C` `{0,3}` ja `D` `{4,5}`.
47. **AC47:** Given text 3 `Ohje`, empty 4; When mallit tehdään; Then identiteetit `{3,text,"Ohje"}` ja `{4,empty,""}` säilyvät segmenttien lisäksi.
48. **AC48:** Given julkinen API; When tyypit tarkistetaan; Then vain neljä nimettyä funktiota exportoidaan.

## Files to Modify
| File | Change |
|---|---|
| `src/types.ts` | Kohdistus-, ryhmä-, identiteetti- ja pakolliset koodipistealuetyypit. |
| `src/logic/transposeChordLine.ts` ja `.test.ts` sekä `.types.test.ts` | Chord- ja pipe-tokenien alueet. |
| `src/logic/transposeNoteLine.ts` ja `.test.ts` sekä `.types.test.ts` | NoteGroup-lähdeteksti ja alueet. |
| `src/logic/formatMusicResult.ts` ja `.test.ts` | Kohdistettujen semanttisten osien muotoilu. |
| `src/logic/groupAlignedLines.ts` ja `.test.ts` | Yhdistäminen, validointi ja ryhmittely. |
| `src/logic/alignLineGroup.ts` ja `.test.ts` | Ankkurit, sarakkeet ja sisältökohdistus. |
| `src/logic/alignment.types.test.ts` | Julkisen API:n ja mallien tyypit. |

## Risk
- UTF-16-leikkaukset voivat rikkoutua; keskitetään koodipistemuunnos ja testataan AC34.
- Speksien 3–5 tulostyypit muuttuvat; koko regressiosarja ajetaan.
- Luonnollinen viiva voi osua rajalle; poisto rajataan kolmeen ehtoon.
- Rollback: poista kohdistusmoduulit ja palauta speksien 3–5 tyypit ja formatteri edelliseen committiin.

## Testing Strategy (MANDATORY)
Jokaiselle AC1–AC48 kirjoitetaan testi nimellä `ACn: <AC:n otsikko tai kuvaus>`.
AC1–AC21 ja AC40–AC44 ovat `alignLineGroup.test.ts`:ssä; AC22–AC24,
AC30–AC39 ovat `groupAlignedLines.test.ts`:ssä; AC45 chord-testissä, AC46
note-testissä ja AC47–AC48 tyyppitestissä. Näin jäljitettävyys on 48/48.
Virheet: AC27–29,32–33,38,44. Reunat: AC18,24,34,39–43. Kaikki nykyiset
testit, `npm run lint` ja `npm test` ajetaan.

## Spec Readiness checklist (run before calling the spec done)
- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table
- [x] Files, risks, rollback and one named test per AC are specified

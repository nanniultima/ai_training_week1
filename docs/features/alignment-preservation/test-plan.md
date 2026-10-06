# Test plan: alignment-preservation

## Traceability

Speksissä on 56 hyväksymiskriteeriä. Sen Testing Strategy -taulukko on
normatiivinen 56/56-matriisi: jokaisella AC:llä on nimetty testi.

| Vastuu | AC:t | Testitiedostot |
|---|---|---|
| Ryhmittely ja validointi | AC1, AC24–AC27, AC29–AC34, AC36, AC38, AC49–AC50 | `src/logic/groupAlignedLines.test.ts` |
| Kohdistus ja alueet | AC2–AC23, AC28, AC38–AC46, AC51–AC56 | `src/logic/alignLineGroup.test.ts` |
| Lähdealueet | AC35 | `src/logic/transposeChordLine.test.ts`, `src/logic/transposeNoteLine.test.ts` ja niiden `.types.test.ts`-tiedostot |
| API ja tulostyyppi | AC37, AC43 | `src/logic/alignment.types.test.ts`, `src/logic/formatMusicResult.test.ts` |
| Koko tulosputki | AC47–AC48 | `src/logic/createTranspositionResult.test.ts` |

## Pääpolut ja testioraakkelit

AC2–AC5:n lähde-, +1- ja +2-sarakkeet ovat speksin tarkistetussa taulukossa.
Niistä tarkistetaan koko sisältö ja `collectAlignmentAnchors(group,"aligned")`.
Yhdistelmäsoinnun oma start ei ole toinen ankkuri. Testifixture käyttää
alkuperäisiä lähdealueita ja oikeita transponoituja nimiä: erityisesti
ensimmäinen `C → C#`-token on `C#`, ei `C`. Tuotantokoodin sisältökohtainen
poikkeushaara ei korvaa yleisen laskennan todistamista.

AC6–AC13 lukitsevat lähdesarakkeisiin perustuvan tekstijaon, välit ja viivat.
AC11 käyttää täsmällistä musiikkisyötettä `gBc  d → G#CC# D#`:
ensimmäinen ryhmä pitenee kolmesta viiteen koodipisteeseen, toinen ankkuri
siirtyy 5 → 6 ja `onpa  ihanaa` muuttuu muotoon `onpa   ihanaa`.
AC15–AC18 ja AC53 erottavat yhden säilyvän erottimen, ylimääräisen joustavan
välin, lyhenemisen ja puuttuvan rivitokenin. AC44 estää eri rivien valetörmäyksen.
AC17:n ja AC18:n ryhmässä on text-kumppani: yksittäinen musiikkirivi
ei enää käynnistä näissä testeissä kohdistusta.

AC14, AC45 ja AC51 erottavat itsenäisen pipen tekstivaikutuksen:
pipe yksin ei muuta tekstiä, mutta pipe ja noteGroup samassa lähdesarakkeessa
siirtyvät tekstikohdan kanssa yhdessä. AC45:n tarkat musiikkitulokset ovat
`|C#m/G#      |` ja `C#|   |`; pipejen sarakkeet säilyvät.
AC46 testaa koko `|C         |Bm        |Em`-lähteen eikä lyhennettyä
esimerkkiä. AC52 testaa nollan joustovaran ja täsmälleen yhden sarakkeen siirron.

AC21–AC23 testaavat segmenttien muotoilun: lisätty musiikkiväli on plain,
viiva perii muotoilun ja kursivoitu x2 säilyy vaikka viereinen välilyönti kuluu.
AC23:n tulos on `C# x2|G#|`, pipejen start-arvot 5 ja 8.
AC21:n ja AC23:n syöte on chord/text-ryhmä. AC23:n yksittäinen chord-rivi
palauttaa sen sijaan `C# x2 |G# |`, pipejen sarakkeilla 6 ja 10.
AC35, AC39–AC43 ja AC47 kattavat Unicode-koodipisteet, muuttumattomat
sourceRange-alueet, pakolliset alignedRange-alueet ja symbolietuliitteet.
AC47:n yksittäisen chord-rivin pipe-sarakkeet ovat `[0,5,10,15]` ja sisältö
`|↓Bb |↑D7 |→Gm |★Fm`: välit säilyvät koska kohdistuskumppania ei ole.

AC48 käyttää speksin vierekkäisiä sointu- ja tekstirivejä sekä sen täyttä
plainText-odotusta. Tyhjän rivin katkaisu testataan erikseen syötteellä
`|C |Bm |Em\n\nonpa`, jonka tulos on `|D |C#m |F#m\n\nonpa`.
Tyhjiä rivejä sisältävä pitkä regressio ei yksin todista kohdistusta.
AC49–AC50 varmistavat järjestyksen sointu → melodia → sanat sekä sen,
etteivät uudet musiikkirivit kohdistu aikaisempiin sanoihin.
AC55 kattaa nolla-askeleen: sisältö ja sarakkeet säilyvät mutta alueet tuotetaan.

AC28 tarkistaa yksittäisten chord- ja note-rivien muuttumattoman contentin,
segmentit ja niiden muotoilut sekä luonnolliset tulosalueet. Mukana ovat
`C |G | → C# |G# |`, `c c → C# C#` ja `c  c → C#  C#`.
Viimeinen tapaus erottaa ohitetun kohdistuksen varsinaisesta joustosta.
Kohdistuskumppanin puuttuminen ei ohita sarkain- tai lähdealuevalidointia.
Moniriviset chord/note-, chord/text-, note/text- ja chord/note/text-ryhmät
säilyttävät nykyiset kohdistustestit (AC15–AC16, AC45, AC53 ja AC2).

## Virheet ja julkiset funktiot

- `groupAlignedLines`: onnistuminen AC1/AC25; virheet AC30–AC34 ja AC36.
  Validointijärjestys on sarkain → tulosvastaavuus → lähdealueet.
- `collectAlignmentAnchors`: source/aligned-onnistuminen AC3/AC5/AC39–AC42;
  puuttuvan alignedRange-alueen täsmällinen virhe AC43. Koordinaattityypit AC37.
- `calculateAlignedColumns`: onnistuminen ja muuttumaton syöte AC15–AC18;
  käyttää validoitua ryhmää ja sen source-ankkurilistaa. Aligned-koordinaattia
  ei anneta sarakelaskennan syötteeksi.
- `alignLineGroup`: onnistuminen AC2/AC4/AC51; suoran musiikittoman kutsun
  täsmällinen virhe AC54. Normaali musiikiton tulosputki ohittaa kutsun AC29:ssä.

## Execution

Käyttäjä hyväksyi uuden Draft-paluun gb/gB-virheen korjaamiseksi.
Korjattu speksi on tarkistettu tilaan `Ready for implementation`.
Nykyisen kierroksen eteneminen ja pysäytys on tasks.md:n loppukirjauksessa.
Tuotantokoodia ja testejä ei muuteta spec-vaiheessa; seuraavat muutokset
kuuluvat AC-kohtaiseen TDD:hen.
TDD alkaa tilasiirtymällä `In Progress` ja nykyisen työpuun
säilyttävällä vertailupisteellä. AC1–AC36:n aiempi valmistuminen tarkistetaan
korjattuja esimerkkejä vasten ennen keskeneräistä AC37:ää. Muuttuneen testin odotus
johdetaan tästä speksistä ja testi lukitaan ennen tuotantokoodin muutosta.
Valmiiksi vihreä testi kirjataan; siihen ei rakenneta keinotekoista vikaa.
Uudet yleiset AC51–AC55 täydentävät vanhojen esimerkkitestien todistusta.

AC37–AC56 käydään numerojärjestyksessä RED–GREEN–REFACTOR-kierroksina.
RED-vaiheessa kirjoitetaan vain kyseisen AC:n testi ja varmistetaan oikea
puuttuva käyttäytyminen. GREEN-vaiheessa tehdään pienin muutos ja ajetaan
kaikki testit. Vanha placeholder korvataan vasta vastaavan AC:n kohdalla;
vanhat AC47/AC48-tyyppiplaceholderit korvataan AC37:n yhteydessä.
Kahden peräkkäisen RED-kierroksen jälkeen pysähdytään ja raportoidaan.

Lopuksi `npm run lint`, `npm test`, `git diff --check` ja AC-kohtainen review.
Raportoi testitiedostot, onnistuneet, epäonnistuneet ja ohitetut testit
projektin värisymboleilla. Speksi muuttuu `Done` vasta 56/56 AC:n todistuksen
ja lopputarkistusten jälkeen.

## gb/gB-korjauksen testaus

AC2–AC5, AC8–AC11, AC37 ja AC55 käyttävät kasvuesimerkeissä gB/gBc.
AC56:n kahdeksan taulukkotapausta testataan nimellä
`AC56: erottaa gb- ja gB-ryhmien kohdistuksen` parametrisoituna testinä.
Syöte kulkee aidon transponoinnin ja ryhmittelyn läpi: tarkista sisältö,
lähdealueiden säilyminen, tulosankkurit ja B:n ylittäessä C-rajan rekisteri 4.
AC37 tarkistaa lisäksi formatteriin johtavan tulosputken tyyppikytkennän.
## Lopputulos 6.10.2026

AC1–AC56:n kattavuus tarkistettu. Kohdistetun formatterin lisäregressiot
formatMusicResult.test.ts:ssä kattavat kahdeksan erillistä musiikkimerkkiä
sekä rit.-tekstitokenin sisämuotoilun. alignment.types.test.ts vertaa myös
HTML:n näkyviä rivejä kohdistettujen rivien sisältöihin.
Lopullinen ajo: 21 testitiedostoa, 340 onnistunutta, 0 epäonnistunutta,
0 ohitettua testiä; lint ja diff-tarkistus läpäisevät. Review: APPROVED.
Speksi on Done; yllä oleva execution-osio kuvaa toteutuksen työjärjestystä.
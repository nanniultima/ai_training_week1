# Testisuunnitelma: syötteen rivien tunnistaminen

Tila `[ ]` tarkoittaa suunniteltua koneellista testiä. Tila `[?]` tarkoittaisi hyväksymiskriteeriä, jota ei voi todistaa koneellisesti; tässä speksissä sellaisia ei ole.

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [ ] | AC1 | `classifyLines.test.ts` — `AC1 säilyttää tyhjemerkkirivin` | Tyhjemerkkirivi `'   '` musiikkia sisältävässä syötteessä | Rivi `{ index: 0, type: 'empty', content: '   ' }` |
| [ ] | AC2 | `classifyLines.test.ts` — `AC2 luokittelee putkirivin sointuriviksi` | `'C    |Am     |G  x2   |C'` | Tyyppi `chord`; sisältö täsmälleen muuttumaton |
| [ ] | AC3 | `classifyLines.test.ts` — `AC3 antaa putken ratkaista luokan` | `'intro | C | tuntematon x2'` | Tyyppi `chord`; ei `AMBIGUOUS_NOTE_LINE`-varoitusta |
| [ ] | AC4 | `classifyLines.test.ts` — `AC4 tunnistaa pienaakkosin kirjoitetun sävelrivin` | `'c c  a a a   gb g  g  c d   c'` | Tyyppi `note`; varoitukset `[]` |
| [ ] | AC5 | `classifyLines.test.ts` — `AC5 tunnistaa isot ja yhteen kirjoitetut sävelet` | `'C C  A A A   GB G#C  G  C D   C'` | Tyyppi `note`; varoitukset `[]` |
| [ ] | AC6 | `classifyLines.test.ts` — `AC6 erottaa pienen b:n ja ison B:n` | Rivit `'gb'`, `'Gb'`, `'GB'`, `'gB'` | Kaikki `note`; sisällöt muuttumattomia |
| [ ] | AC7 | `classifyLines.test.ts` — `AC7 hyväksyy H-merkinnän` | `'h H BH'` | Tyyppi `note`; varoitukset `[]` |
| [ ] | AC8 | `classifyLines.test.ts` — `AC8 sallii positiivisen toistomerkinnän` | `'c c g g x2'` | Tyyppi `note`; `x2` säilyy; varoitukset `[]` |
| [ ] | AC9 | `classifyLines.test.ts` — `AC9 tunnistaa laulunsanat tekstiksi` | `'C |G |'`, `'onpa i-hanaa laulella sateessa'` | Jälkimmäinen `text`; varoitukset `[]` |
| [ ] | AC10 | `classifyLines.test.ts` — `AC10 varoittaa epäselvästä sävelrivistä` | `'C |G |'`, `'C D lauletaan hiljaa'` | Jälkimmäinen `text`; yksi `AMBIGUOUS_NOTE_LINE`, indeksi `1`, alkuperäinen sisältö |
| [ ] | AC11 | `classifyLines.test.ts` — `AC11 säilyttää kaikkien rivityyppien järjestyksen` | Sointu, sävelrivi ja `'onpa ihanaa'` | Tyypit `[chord, note, text]` |
| [ ] | AC12 | `classifyLines.test.ts` — `AC12 hyväksyy soinnut ja tekstin ilman sävelriviä` | `'C |Am |G |C |'`, `'onpa ihanaa'` | Tyypit `[chord, text]`; ei virhettä eikä varoitusta |
| [ ] | AC13 | `classifyLines.test.ts` — `AC13 hyväksyy pelkän melodian` | Ainoa rivi `'c c a a g g c'` | Tyyppi `note`; ei virhettä eikä varoitusta |
| [ ] | AC14 | `classifyLines.test.ts` — `AC14 säilyttää tyhjän rivin ja indeksit` | `'C |G |'`, `''`, `'Am |F |'` | Kolme riviä indekseillä `[0,1,2]` ja tyypeillä `[chord, empty, chord]` |
| [ ] | AC15 | `classifyLines.test.ts` — `AC15 hylkää tyhjän rivilistan` | `classifyLines([])` | Virhe täsmälleen `Syöte ei saa olla tyhjä` |
| [ ] | AC16 | `classifyLines.test.ts` — `AC16 hyväksyy soinnut ja melodian ilman tekstiä` | `'C |Am |G |C |'`, `'c c a a g g c'` | Tyypit `[chord, note]`; ei virhettä eikä varoitusta |
| [ ] | AC17 | `classifyLines.test.ts` — `AC17 hyväksyy melodian ja sanat ilman sointuja` | `'c c a a g g c'`, `'onpa ihanaa'` | Tyypit `[note, text]`; ei virhettä eikä varoitusta |
| [ ] | AC18 | `classifyLines.test.ts` — `AC18 hyväksyy pelkät soinnut` | Ainoa rivi `'C |Am |G |C |'` | Tyyppi `chord`; ei virhettä eikä varoitusta |
| [ ] | AC19 | `classifyLines.test.ts` — `AC19 hylkää syötteen ilman musiikkia` | `'onpa ihanaa'`, `''`, `'laulella sateessa'` | Virhe täsmälleen `Syötteestä ei löytynyt sointu- tai sävelrivejä` |
| [ ] | AC20 | `classifyLines.test.ts` — `AC20 hyväksyy musiikkia edeltävän otsikon` | `'Kertosäe'`, `'C |G |'`, `'onpa ihanaa'` | Tyypit `[text, chord, text]`; ensimmäinen sisältö `'Kertosäe'`; varoitukset `[]` |
| [ ] | AC21 | `classifyLines.test.ts` — `AC21 hyväksyy tekstin musiikkikokonaisuuksien välissä` | `'C |G |'`, `'onpa ihanaa'`, `'Välisoitto'`, `'Am |F |'` | Tyypit `[chord, text, text, chord]`; kolmas sisältö `'Välisoitto'`; varoitukset `[]` |
| [ ] | AC22 | `classifyLines.test.ts` — `AC22 hyväksyy peräkkäiset sointurivit` | `'C |G |'`, `'Am |F |'`, `'Dm |G |'` | Tyypit `[chord, chord, chord]`; sisällöt muuttumattomia; varoitukset `[]` |
| [ ] | AC23 | `classifyLines.test.ts` — `AC23 hyväksyy vuorottelevat sointu- ja sävelrivit` | `'C |G |'`, `'c d e f'`, `'Am |F |'`, `'a c e f'` | Tyypit `[chord, note, chord, note]`; sisällöt muuttumattomia; varoitukset `[]` |
| [ ] | AC24 | `lineNumbers.test.ts` — `AC24 numeroi loogiset rivit yhdestä alkaen` | `renderLineNumbers('Kertosäe\nC |G |\nonpa')` | Kolme numeroa tekstisisällöillä `['1','2','3']` |
| [ ] | AC25 | `lineNumbers.test.ts` — `AC25 ei numeroi automaattista visuaalista rivitystä` | Yksi pitkä merkkijono ilman `\n`-merkkiä kapeassa editorissa | Yksi numero tekstisisällöllä `'1'` |
| [ ] | AC26 | `lineNumbers.test.ts` — `AC26 muuntaa sisäisen indeksin näkyväksi numeroksi` | `toVisibleLineNumber(2)` | Täsmälleen `3` |

## Testiympäristö

- AC1–AC23 ajetaan Vitestin Node-ympäristössä ilman DOM:ia.
- AC24–AC25 ajetaan Happy DOM -ympäristössä palstan DOM-rakennetta vasten; AC25:n syöte sisältää yhden loogisen rivin, joten visuaalinen rivitys ei saa vaikuttaa numeroiden määrään.
- AC26 on puhdas yksikkötesti.
- Jokaisella AC:llä on täsmälleen yksi ensisijainen testirivi, eikä odotuksia lasketa testattavalla tuotantokoodilla.

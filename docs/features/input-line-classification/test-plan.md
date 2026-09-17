# Testisuunnitelma: syötteen rivien tunnistaminen

**Status:** Draft

| Tila | AC | Testitiedosto ja testin nimi |
|---|---|---|
| [ ] | AC1 | `classifyLines.test.ts` — `AC1 säilyttää tyhjemerkkirivin musiikkisyötteessä` |
| [ ] | AC2 | `classifyLines.test.ts` — `AC2 antaa putken ratkaista sointurivin` |
| [ ] | AC3 | `classifyLines.test.ts` — `AC3 tunnistaa tuetut sävelryhmät` |
| [ ] | AC4 | `classifyLines.test.ts` — `AC4 hyväksyy täsmälliset toistomerkinnät` |
| [ ] | AC5 | `classifyLines.test.ts` — `AC5 hyväksyy tiukan yhdysmerkkierottimen` |
| [ ] | AC6 | `classifyLines.test.ts` — `AC6 hylkää virheelliset yhdysmerkkimuodot note-luokasta` |
| [ ] | AC7 | `classifyLines.test.ts` — `AC7 hylkää useat etumerkit note-luokasta` |
| [ ] | AC8 | `classifyLines.test.ts` — `AC8 hylkää virheelliset toistomerkinnät note-luokasta` |
| [ ] | AC9 | `classifyLines.test.ts` — `AC9 tunnistaa laulunsanat ilman varoitusta` |
| [ ] | AC10 | `classifyLines.test.ts` — `AC10 pitää cafe-sanan tekstinä` |
| [ ] | AC11 | `classifyLines.test.ts` — `AC11 palauttaa täsmällisen epäselvyysvaroituksen` |
| [ ] | AC12 | `classifyLines.test.ts` — `AC12 säilyttää järjestyksen indeksit ja tyhjät rivit` |
| [ ] | AC13 | `classifyLines.test.ts` — `AC13 hyväksyy musiikkia sisältävät tyyppiyhdistelmät` |
| [ ] | AC14 | `classifyLines.test.ts` — `AC14 hylkää tyhjän rivilistan` |
| [ ] | AC15 | `classifyLines.test.ts` — `AC15 hylkää syötteen ilman musiikkia` |
| [ ] | AC16 | `classifyLines.test.ts` — `AC16 säilyttää segmentit ja fonttikoon` |
| [ ] | AC17 | `classifyLines.test.ts` — `AC17 ei validoi fonttikokoa` |
| [ ] | AC18 | `classifyLines.test.ts` — `AC18 ei hyväksy sarkainta note-erottimeksi` |
| [ ] | AC19 | `lineNumbers.test.ts` — `AC19 numeroi LF-loogiset rivit` |
| [ ] | AC20 | `lineNumbers.test.ts` — `AC20 laskee vain loogiset rivit` |
| [ ] | AC21 | `lineNumbers.test.ts` — `AC21 muuntaa indeksin näkyväksi numeroksi` |
| [ ] | AC22 | `ui.test.ts` — `AC22 liittää palstan editorin ulkopuolelle` |
| [ ] | AC23 | `ui.test.ts` — `AC23 synkronoi pystysuuntaisen vierityksen` |
| [ ] | AC24 | `ui.test.ts` — `AC24 pitää numerot poissa editorin sisällöstä` |
| [ ] | AC25 | `classifyLines.test.ts` — `AC25 hyväksyy useat kohdistusvälit sävelrivillä` |
| [ ] | AC26 | `classifyLines.test.ts` — `AC26 hyväksyy sävelrivin ympäröivät ASCII-välit` |
| [ ] | AC27 | `classifyLines.test.ts` — `AC27 hyväksyy ylennyksen jälkeisen B-sävelen ryhmässä` |

## Virhe- ja reunatapaukset

Testit kattavat tyhjän ja musiikittoman syötteen eri virheet, tyhjät ja muotoillut segmentit, putken etusijan, xN-rajat, viivan kaikki rajat, etumerkkirajat, useat kohdistusvälit, `cafe`-sanan, epäselvyysvaroituksen, sarkaimen, validoimattoman fonttikoon sekä UI:n DOM-omistajuuden ja vierityksen. Visuaalista layoutia ei väitetä Happy DOM -testillä todistetuksi.

AC1–AC18 ja AC25–AC27 ajetaan ilman DOM:ia, AC19–AC21 puhtaina yksikkötesteinä ja AC22–AC24 Happy DOM:ssa. Kaikki testit ja tyyppitarkistus ajetaan jokaisen GREEN-vaiheen jälkeen.

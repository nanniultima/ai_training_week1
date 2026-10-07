# Testisuunnitelma: sointujen transponointi

**Status:** Draft

| Tila | AC | Testitiedosto ja nimetty testi |
|---|---|---|
| [ ] | AC1 | `transposeChord.test.ts` — `AC1 transponoi duurisoinnun ylöspäin` |
| [ ] | AC2 | `transposeChord.test.ts` — `AC2 transponoi mollisoinnun alaspäin` |
| [ ] | AC3 | `transposeChord.test.ts` — `AC3 säilyttää kaikki tuetut sointutyypit` |
| [ ] | AC4 | `transposeChord.test.ts` — `AC4 transponoi bassosoinnun molemmat sävelet` |
| [ ] | AC5 | `transposeChord.test.ts` — `AC5 säilyttää alennetun bassosoinnun rakenteen` |
| [ ] | AC6 | `transposeChord.test.ts` — `AC6 normalisoi H:n B:ksi` |
| [ ] | AC7 | `transposeChord.test.ts` — `AC7 erottaa B:n ja Bb:n` |
| [ ] | AC8 | `transposeChord.test.ts` — `AC8 käyttää sharp-kohteen kirjoitusasua` |
| [ ] | AC9 | `transposeChord.test.ts` — `AC9 käyttää flat-kohteen kirjoitusasua` |
| [ ] | AC10 | `transposeChord.test.ts` — `AC10 käyttää C-duurissa sharpeja ylöspäin` |
| [ ] | AC11 | `transposeChord.test.ts` — `AC11 käyttää C-duurissa flatteja alaspäin` |
| [ ] | AC12 | `transposeChord.test.ts` — `AC12 käyttää A-mollissa sharpeja ylöspäin` |
| [ ] | AC13 | `transposeChord.test.ts` — `AC13 käyttää A-mollissa flatteja alaspäin` |
| [ ] | AC14 | `transposeChord.test.ts` — `AC14 säilyttää nolla-askeleen kirjoitusasun` |
| [ ] | AC15 | `transposeChord.test.ts` — `AC15 transponoi lähtösävellajiin kuulumattoman soinnun` |
| [ ] | AC16 | `transposeChordLine.test.ts` — `AC16 transponoi moduloivan rivin kaikki soinnut` |
| [ ] | AC17 | `transposeChordLine.test.ts` — `AC17 transponoi koko sointurivin alaspäin` |
| [ ] | AC18 | `transposeChordLine.test.ts` — `AC18 säilyttää sointurivin muun tekstin` |
| [ ] | AC19 | `transposeChordLine.test.ts` — `AC19 säilyttää putket välimerkit ja välilyönnit` |
| [ ] | AC20 | `transposeChordLine.test.ts` — `AC20 säilyttää epäilyttävän soinnun ja varoittaa` |
| [ ] | AC21 | `transposeChordLine.test.ts` — `AC21 säilyttää tokenin ilman perussäveltä` |
| [ ] | AC22 | `transposeChord.test.ts` — `AC22 hylkää tyhjän sointumerkin` |
| [ ] | AC23 | `transposeChordLine.test.ts` — `AC23 säilyttää keskeneräisen bassosoinnun ja varoittaa` |
| [ ] | AC24 | `transposeChordLine.test.ts` — `AC24 hylkää muun kuin chord-rivin` |
| [ ] | AC25 | `transposeChordLine.test.ts` — `AC25 säilyttää pienet soinnut ja varoittaa` |
| [ ] | AC26 | `transposeChordLine.test.ts` — `AC26 jättää cafe-sanan ilman varoitusta` |
| [ ] | AC27 | `transposeChord.test.ts` — `AC27 hylkää tuntemattoman päätteen symbolifunktiossa` |
| [ ] | AC28 | `transposeChordLine.test.ts` — `AC28 säilyttää muotoilualueet lisäämättä lihavointia` |
| [ ] | AC29 | `transposeChordLine.test.ts` — `AC29 säilyttää tukemattoman C9-soinnun ja varoittaa` |
| [ ] | AC30 | `transposeChordLine.test.ts` — `AC30 säilyttää kaikki erilliset musiikkimerkit` |
| [ ] | AC31 | `transposeChord.test.ts` — `AC31 käyttää merkkiperhetaulukkoa kaikissa validoiduissa kohdesävellajeissa` |
| [ ] | AC32 | `transposeChord.types.test.ts` — `AC32 hyväksyy vain ready-asetustuloksen` |

## Virhe- ja reunatapaukset

Testit kattavat tyhjän ja tuntemattoman symbolin, väärän rivityypin,
keskeneräisen basson, tukemattoman C9:n, epäilyttävän Cfoo-tokenin,
pienaakkossoinnut, tavallisen cafe-sanan, H/B/Bb-tapaukset, nolla- ja
raja-askeleet asetusspeksin ready-tulosten kautta, kaikki merkkiperheet,
kaikki erilliset musiikkimerkit sekä segmenttirajat ja fonttikoon.

Odotusarvoja ei lasketa testattavalla tuotantokoodilla. Merkkiperhematriisi
käyttää speksissä lueteltuja eksplisiittisiä kohdelistoja. Jokaisen AC:n
TDD-syklissä ajetaan ensin kohdetesti ja GREEN-vaiheessa koko testisarja.

## AC23:n lisäregressiot 7.10.2026

- `AC23 säilyttää keskeneräisen bassosoinnun ja varoittaa`: content,
  segmenttien liitos ja suspiciousChord-token sisältävät kaikki A/.
- `Chord AC23: keskeneräisen bassosoinnun HTML ja plainText täsmäävät`:
  koko putki ilman sanoja ja sanojen kanssa; molemmat esitysmuodot A/ |D |.
- `Chord AC23: pitenevä keskeneräinen bassosointu säilyy HTML:ssä ja kohdistuksessa`:
  G/ +1 → G#/; rivin oma väli säilyy yksin, tekstikumppanin tahtiväli joustaa.
- `Chord AC23: nolla-askel normalisoi keskeneräisen H-bassosoinnun yhtenäisesti`:
  H/ → B/ sekä HTML:ssä että plainTextissä.

Koko sarja: 21 testitiedostoa, 426 onnistunutta testiä,
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.

## AC28:n segmenttirajat 7.10.2026

- `AC28: soinnun muotoiluraja ei muuta transponoinnin sisältöä`: C + #m
  → D + m, eri fonttikoot ja kursivointi, content/segmentit täsmäävät.
- `AC28: bassosävel perii kirjaimensa muotoilun yli segmenttirajan`:
  C/G + # → C#/A, perussävelen ja basson omat lähdemuotoilut säilyvät.
- `Chord AC28: segmenttirajan transponointi säilyttää seuraavan tekstin muotoilun`:
  koko tulosputki ja seuraavan rit.-tekstin kursivointi.
- `Chord AC28: nolla-askel säilyttää soinnun sisäisen muotoilurajan`:
  alkuperäinen #m-kursivointi säilyy, sointu lihavoidaan.

Viimeisin koko sarja: 21 testitiedostoa, 438 onnistunutta testiä,
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.

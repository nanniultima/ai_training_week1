# Feature: Sointujen transponointi

**Status:** Done
> Voimassa oleva täsmennys: [transposition-spec-amendments](transposition-spec-amendments.md).
> Muutosspeksi on toteutettu. Sen nolla-askel-, cafe-, sointusanasto- ja
> fonttikokosäännöt korvaavat ristiriitaiset tämän tiedoston aiemman version
> säännöt ja esimerkit. Alkuperäiset AC-numerot säilyvät jäljitettävyyttä varten.

## Problem Statement

Käyttäjän sointuriveillä voi olla tavallisia sointuja, laajennettuja
sointuja, bassosointuja, tahtiputkia ja muuta tekstiä. Sovelluksen pitää
siirtää kaikki tunnistetut soinnut samalla puolisävelaskelmäärällä muuttamatta
sointutyyppiä tai rivin muuta sisältöä.

Transponnin pitää toimia myös silloin, kun kappaleessa on modulaatioita tai
lähtösävellajiin kuulumattomia sointuja. Kohdesävellajia käytetään
kirjoitusasun valintaan, ei sen rajaamiseen, mitkä soinnut transponoidaan.

## Proposed Change

Lisätään kaksi puhdasta liiketoimintalogiikan toimintoa:

- `transposeChordSymbol` transponoi yhden sointumerkin.
- `transposeChordLine` jäsentää luokitellun sointurivin, transponoi sen
  soinnut ja säilyttää muun sisällön.

Toiminnot hyväksyvät asetuksiksi vain `transposition-settings`-speksin
`ready`-tulosvariantin. `requiresEnharmonicChoice` ei kuulu funktioiden
TypeScript-parametrityyppiin. Ready-asetuksista käytetään:

- lähtösävellajin toonika ja moodi kontekstina
- askelmäärä `-11`–`11`
- ratkaistu kohdesävellajin toonika ja moodi
- kohdesävellajin määräämä enharmoninen kirjoitusasu

Tässä speksissä `moodi` tarkoittaa duuria tai mollia. Soinnun rakenne, kuten
molli, `maj7` tai `dim`, on `sointutyyppi`.

### Tuetut sointumerkinnät

Ensimmäisessä versiossa tuetaan:

- duurisointu ilman päätettä, esimerkiksi `C`
- mollisointu, esimerkiksi `Cm`
- dominanttiseptimisointu, esimerkiksi `C7`
- duurimaj7-sointu, esimerkiksi `Cmaj7`
- molliseptimisointu, esimerkiksi `Cm7`
- sus-sointu ja sus4-sointu, esimerkiksi `Csus` ja `Csus4`
- vähennetty sointu, esimerkiksi `Cdim`
- ylinouseva sointu, esimerkiksi `Caug`
- add9-sointu, esimerkiksi `Cadd9`
- edellisten bassosointumuodot, esimerkiksi `G/B`, `Cm7/Bb` ja `Dsus/A`

Perus- ja bassosävel kirjoitetaan isolla kirjaimella. Mollipääte on pieni
`m`, ja muut tuetut päätteet kirjoitetaan yllä esitetyissä muodoissa.

`H` hyväksytään perus- ja bassosävelenä B:n vaihtoehdoksi. Se normalisoidaan
B:ksi. Tuloksessa käytetään kansainvälistä B:tä, ja alennettu B kirjoitetaan
aina `Bb`.

### Soinnun muuttaminen

Transponointi muuttaa vain soinnun perussävelen ja mahdollisen bassosävelen.
Sointutyyppi säilyy täsmälleen samana:

```text
Cm7 + 2 → Dm7
G/B + 1 → Ab/C
```

Kaikki tunnistetut soinnut siirretään samalla askelmäärällä riippumatta
modulaatioista tai siitä, kuuluvatko ne ilmoitettuun lähtösävellajiin.

Askelmäärällä `0` sävelkorkeus ja alkuperäinen `#`/`b`-kirjoitusasu säilyvät,
mutta H normalisoidaan B:ksi. Sointujen lihavointi määritellään myöhemmässä
`rich-text-formatting`-speksissä.

### Enharmoninen kirjoitusasu

Kohdesävellajin kirjoitusasu määrää tuloksessa käytettävän merkkiperheen:

- ylennysmerkkinen kohdesävellaji käyttää kromaattisissa soinnuissa nimiä
  `C#`, `D#`, `F#`, `G#` ja `A#`
- alennusmerkkinen kohdesävellaji käyttää nimiä `Db`, `Eb`, `Gb`, `Ab` ja
  `Bb`

Merkkiperhe määräytyy täsmälleen näin:

- duurin sharp-ryhmä: `G`, `D`, `A`, `E`, `B`, `F#`, `C#`
- duurin flat-ryhmä: `F`, `Bb`, `Eb`, `Ab`, `Db`, `Gb`, `Cb`
- duurin neutraali ryhmä: `C`
- mollin sharp-ryhmä: `E`, `B`, `F#`, `C#`, `G#`, `D#`, `A#`
- mollin flat-ryhmä: `D`, `G`, `C`, `F`, `Bb`, `Eb`, `Ab`
- mollin neutraali ryhmä: `A`

C-duuri ja A-molli ovat neutraaleja, koska niiden etumerkinnässä ei ole
ylennyksiä tai alennuksia. Niissä positiivinen askelmäärä käyttää
ylennysmerkkejä ja negatiivinen askelmäärä alennusmerkkejä. Tämä vastaa
tutkimuksessa tarkasteltua ChordPro-oletusta. Mahdollinen käyttäjän oma
valinta neutraaleissa sävellajeissa on kirjattu jatkokehitykseen.

### Sointurivin muu sisältö

`transposeChordLine` vastaanottaa rivien tunnistamisen `chord`-riviksi
luokitteleman rivin. Se käsittelee soinnut tokeneina ja säilyttää muut
välilyönnit, putket, välimerkit ja tekstin muuttumattomina. `x2`, `intro` ja
`rit.` eivät ole sointuja eikä niitä transponoida.

Erillisinä, muuttumattomina musiikkimerkkeinä tunnistetaan `|`, `,`, `.`,
`-`, `:`, `/`, `(` ja `)`. `/` kuuluu sointutokeniin vain, kun sitä seuraa
kelvollinen bassosävel; muuten se on erillinen merkki tai keskeneräisen
bassosoinnun osa AC23:n mukaisesti.

Sointu tunnistetaan tokenin alusta. Jos tunnistettavan perussävelen jälkeen
on tuntematon pääte, koko token säilytetään muuttumattomana ja palautetaan
varoitus. Näin mahdollisesti oikeaa mutta vielä tukematonta sointua ei
transponoida osittain väärin.

Esimerkiksi `Cfoo` + 1 säilyy muodossa `Cfoo` ja tuottaa
`SUSPICIOUS_CHORD`-varoituksen. Token `Xfoo` ei sisällä tunnistettavaa
perussäveltä, joten se säilytetään tavallisena tekstinä ilman varoitusta.

Jos token alkaa pienellä kirjaimella mutta vastaa täsmälleen jotakin tuettua
sointumerkintää, token säilytetään muuttumattomana ja palautetaan
`LOWERCASE_CHORD`-varoitus. Esimerkiksi `c`, `am`, `g7` ja `cm7/bb` ovat
todennäköisiä pienellä kirjoitettuja sointuja. Niitä ei korjata tai
transponoida automaattisesti, jotta tavallista tekstiä ei muuteta käyttäjän
puolesta. Token `cafe` ei vastaa tuettua sointumerkintää eikä aiheuta tätä
varoitusta.

`SUSPICIOUS_CHORD`-varoitus sisältää täsmälleen:

- koodin `SUSPICIOUS_CHORD`
- nollasta alkavan rivi-indeksin
- tokenin nollasta alkavan aloitusindeksin rivillä
- alkuperäisen tokenin
- tuotetun tokenin

`LOWERCASE_CHORD`-varoitus sisältää täsmälleen:

- koodin `LOWERCASE_CHORD`
- nollasta alkavan rivi-indeksin
- tokenin nollasta alkavan aloitusindeksin rivillä
- alkuperäisen tokenin

Rivitulos sisältää alkuperäisen indeksin, tyypin `chord`, transponoidun
`content`-arvon, muotoilusegmentit ja varoitukset. Muuttumattomat merkit
säilyttävät segmenttinsä. Korvaava perus- tai bassosävel saa korvatun sävelen
ensimmäisen merkin `bold`, `italic` ja `fontSizePx`-arvot; muuttumaton pääte
säilyttää alkuperäisen muotoilunsa. Segmentit saa yhdistää vain, jos niiden
muotoiluarvot ovat täsmälleen samat. Tässä ominaisuudessa ei lisätä
lihavointia; se kuuluu `rich-text-formatting`-ominaisuudelle.

## Acceptance Criteria

### AC1: Duurisointu transponoidaan ylöspäin
**Given** sointu on `C`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `D`

### AC2: Mollisointu transponoidaan alaspäin
**Given** sointu on `Am`, askelmäärä on `-2` ja kohdesävellaji on G-molli
**When** sointu transponoidaan
**Then** tulos on täsmälleen `Gm`

### AC3: Tuetut sointutyypit säilyvät
**Given** soinnut ovat `C`, `Cm`, `C7`, `Cmaj7`, `Cm7`, `Csus`, `Csus4`, `Cdim`, `Caug`, `Cadd9` ja `Dsus/A`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** soinnut transponoidaan
**Then** tulokset ovat tässä järjestyksessä täsmälleen `D`, `Dm`, `D7`, `Dmaj7`, `Dm7`, `Dsus`, `Dsus4`, `Ddim`, `Daug`, `Dadd9` ja `Esus/B`

### AC4: Bassosoinnun molemmat sävelet transponoidaan
**Given** sointu on `G/B`, askelmäärä on `1` ja kohdesävellaji on Ab-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `Ab/C`

### AC5: Alennettu bassosävel säilyttää sointurakenteen
**Given** sointu on `Cm7/Bb`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `Dm7/C`

### AC6: H normalisoidaan B:ksi
**Given** soinnut ovat `H7` ja `G/H`, askelmäärä on `0` ja kohdesävellaji on B-duuri
**When** soinnut transponoidaan
**Then** tulokset ovat täsmälleen `B7` ja `G/B`

### AC7: Alennettu B ei sekoitu B-sointuun
**Given** soinnut ovat `B` ja `Bb`, askelmäärä on `0` ja kohdesävellaji on Bb-duuri
**When** soinnut transponoidaan
**Then** tulokset ovat tässä järjestyksessä täsmälleen `B` ja `Bb`

### AC8: Ylennysmerkkinen kohdesävellaji määrää kirjoitusasun
**Given** sointu on `C`, askelmäärä on `1` ja valittu kohdesävellaji on C#-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `C#`

### AC9: Alennusmerkkinen kohdesävellaji määrää kirjoitusasun
**Given** sointu on `C`, askelmäärä on `1` ja valittu kohdesävellaji on Db-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `Db`

### AC10: C-duuri käyttää ylennyksiä positiivisella siirrolla
**Given** sointu on `B`, askelmäärä on `2` ja kohdesävellaji on C-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `C#`

### AC11: C-duuri käyttää alennuksia negatiivisella siirrolla
**Given** sointu on `D`, askelmäärä on `-1` ja kohdesävellaji on C-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `Db`

### AC12: A-molli käyttää ylennyksiä positiivisella siirrolla
**Given** sointu on `B`, askelmäärä on `2` ja kohdesävellaji on A-molli
**When** sointu transponoidaan
**Then** tulos on täsmälleen `C#`

### AC13: A-molli käyttää alennuksia negatiivisella siirrolla
**Given** sointu on `D`, askelmäärä on `-1` ja kohdesävellaji on A-molli
**When** sointu transponoidaan
**Then** tulos on täsmälleen `Db`

### AC14: Nolla askelta säilyttää enharmonisen kirjoitusasun
**Given** soinnut ovat `C#` ja `Db`, askelmäärä on `0` ja kohdesävellaji on C-duuri
**When** soinnut transponoidaan
**Then** tulokset ovat tässä järjestyksessä täsmälleen `C#` ja `Db`

### AC15: Lähtösävellajiin kuulumaton sointu transponoidaan
**Given** lähtösävellaji on C-duuri, sointu on `F#7`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointu transponoidaan
**Then** tulos on täsmälleen `G#7`

### AC16: Moduloivan rivin kaikki soinnut transponoidaan ylöspäin
**Given** sointurivi on `C |E7 |Am |F#7 |B |`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `D |F#7 |Bm |G#7 |C# |`

### AC17: Koko sointurivi transponoidaan alaspäin
**Given** sointurivi on `D |Bm |A |D |`, askelmäärä on `-2` ja kohdesävellaji on C-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `C |Am |G |C |`

### AC18: Sointurivin muu teksti säilyy
**Given** sointurivi on `intro C |Am x2 |G rit. |`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `intro D |Bm x2 |A rit. |` eikä varoituksia palauteta

### AC19: Putket, välimerkit ja välilyönnit säilyvät
**Given** sointurivi on `C,  |Am... | G-C |`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `D,  |Bm... | A-D |`

### AC20: Epäilyttävä sointu säilytetään muuttumattomana
**Given** sointurivi-indeksi on `3`, rivi on `Cfoo |G |`, askelmäärä on `1` ja kohdesävellaji on Db-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `Cfoo |Ab |` ja palautetaan täsmälleen yksi varoitus `{ code: "SUSPICIOUS_CHORD", lineIndex: 3, startIndex: 0, original: "Cfoo", output: "Cfoo" }`

### AC21: Token ilman tunnistettavaa perussäveltä säilyy tekstinä
**Given** sointurivi on `Xfoo |C |`, askelmäärä on `1` ja kohdesävellaji on Db-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `Xfoo |Db |` eikä `Xfoo`-tokenista palauteta varoitusta

### AC22: Tyhjä sointumerkki hylätään
**Given** transponoitava sointumerkki on tyhjä merkkijono
**When** sointu yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Sointu ei saa olla tyhjä`

### AC23: Keskeneräinen bassosointu varoittaa
**Given** sointurivi-indeksi on `0`, rivi on `G/ |C |`, askelmäärä on `2` ja kohdesävellaji on A-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `A/ |D |` ja palautetaan täsmälleen yksi varoitus `{ code: "SUSPICIOUS_CHORD", lineIndex: 0, startIndex: 0, original: "G/", output: "A/" }`

### AC24: Muuksi kuin sointuriviksi luokiteltu rivi hylätään
**Given** luokitellun rivin tyyppi on vuorollaan `note`, `text` ja `empty`
**When** kukin rivi yritetään käsitellä `transposeChordLine`-toiminnolla
**Then** jokainen kutsu heittää virheen täsmällisellä viestillä `Rivin tyypin pitää olla chord`

### AC25: Pienellä kirjoitettu tuettu sointu varoittaa
**Given** sointurivi-indeksi on `2`, rivi on `c |am |g7 |cm7/bb |C |`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `c |am |g7 |cm7/bb |D |` ja varoitukset ovat tässä järjestyksessä täsmälleen `{ code: "LOWERCASE_CHORD", lineIndex: 2, startIndex: 0, original: "c" }`, `{ code: "LOWERCASE_CHORD", lineIndex: 2, startIndex: 3, original: "am" }`, `{ code: "LOWERCASE_CHORD", lineIndex: 2, startIndex: 7, original: "g7" }` ja `{ code: "LOWERCASE_CHORD", lineIndex: 2, startIndex: 11, original: "cm7/bb" }`

### AC26: Pienellä alkava tavallinen sana ei varoita
**Given** sointurivi on `cafe |C |`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `cafe |D |` eikä `cafe`-tokenista palauteta `LOWERCASE_CHORD`- tai `SUSPICIOUS_CHORD`-varoitusta

### AC27: Yksittäinen symbolifunktio hylkää tuntemattoman päätteen
**Given** sointumerkki on `Cfoo` ja asetukset ovat validoitu C-duuri +1 → Db-duuri -ready-tulos
**When** `transposeChordSymbol` yrittää transponoida merkin
**Then** toiminto heittää virheen `Tuntematon sointumerkintä: Cfoo`

### AC28: Rivitulos säilyttää muotoilualueet lisäämättä lihavointia
**Given** chord-rivin indeksi on `4`, segmentit ovat `{ text: "C", bold: false, italic: true }`, `{ text: " |", bold: false, italic: false }` ja `{ text: "Am |", bold: true, italic: false, fontSizePx: 18 }`, ja asetukset ovat C-duuri +2 → D-duuri
**When** `transposeChordLine` transponoi rivin
**Then** tuloksen index on `4`, type on `chord`, content on `D |Bm |`, warnings on `[]` ja segmentit ovat täsmälleen `{ text: "D", bold: false, italic: true }`, `{ text: " |", bold: false, italic: false }` ja `{ text: "Bm |", bold: true, italic: false, fontSizePx: 18 }`

### AC29: Tukematon oikea sointu säilyy ja varoittaa
**Given** chord-rivin indeksi on `1`, sisältö on `C9 |G |` ja asetukset ovat C-duuri +2 → D-duuri
**When** `transposeChordLine` transponoi rivin
**Then** content on `C9 |A |` ja varoituksia on täsmälleen yksi `{ code: "SUSPICIOUS_CHORD", lineIndex: 1, startIndex: 0, original: "C9", output: "C9" }`

### AC30: Kaikki erilliset musiikkimerkit säilyvät
**Given** chord-rivin sisältö on `(C): C, C. C-C / C |` ja asetukset ovat C-duuri +2 → D-duuri
**When** `transposeChordLine` transponoi rivin
**Then** content on täsmälleen `(D): D, D. D-D / D |` eikä varoituksia palauteta

### AC31: Kaikki validoidut kohdesävellajit valitsevat määrätyn merkkiperheen
**Given** kohdesävellaji käydään läpi validoiduilla `ready`-asetuksilla ryhmissä major sharp `[G,D,A,E,B,F#,C#]`, major flat `[F,Bb,Eb,Ab,Db,Gb,Cb]`, major neutral `[C]`, minor sharp `[E,B,F#,C#,G#,D#,A#]`, minor flat `[D,G,C,F,Bb,Eb,Ab]` ja minor neutral `[A]`; jokaisen sharp- tai flat-kohteen asetuksessa `sourceTonic` on kohteen alapuolinen puolisävel ja `step` on `1`, ja neutraalit kohteet testataan lisäksi vastaavalla `step`-arvolla `-11`
**When** sointumerkki `C` transponoidaan kullakin kyseisellä `ready`-asetuksella
**Then** jokainen sharp-ryhmän tulos on `C#`, jokainen flat-ryhmän tulos on `Db`, major-neutral C-duurin positiivinen tulos on `C#`, major-neutral C-duurin negatiivinen tulos on `Db`, minor-neutral A-mollin positiivinen tulos on `C#` ja minor-neutral A-mollin negatiivinen tulos on `Db`

### AC32: Vain valmis asetustulos hyväksytään API:ssa
**Given** käytettävissä on `transposition-settings`-tuloksen waiting-variantti `requiresEnharmonicChoice`
**When** waiting-tulos annetaan `transposeChordSymbol`- tai `transposeChordLine`-funktion asetussyötteeksi
**Then** TypeScript-tyyppitesti hylkää molemmat kutsut `@ts-expect-error`-merkinnän osoittamalla tavalla ja vain `status: "ready"` -variantti on sallittu

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää ready-asetuksiin sidotut sointusyötteet, segmentit säilyttävä rivitulos sekä `SUSPICIOUS_CHORD`- ja `LOWERCASE_CHORD`-varoitustyypit. |
| `src/logic/transposeChord.ts` | Lisää yhden sointumerkin validointi, H/B-normalisointi ja transponointi. |
| `src/logic/transposeChord.test.ts` | Lisää yhden soinnun onnistumis-, enharmoniset ja virhetestit. |
| `src/logic/transposeChord.types.test.ts` | Todista käännösaikaisesti, että vain `ready`-asetustulos kelpaa sointufunktioille. |
| `src/logic/transposeChordLine.ts` | Lisää sointurivin tokenisointi, tekstin säilyttäminen ja varoitusten muodostus. |
| `src/logic/transposeChordLine.test.ts` | Lisää kokonaisten sointurivien, modulaatioiden ja varoitusten testit. |
| `src/logic/transpose.ts` | Poista vanha toteuttamaton `transposeMusic`-skeleton, jotta päällekkäistä API:a ei jää. |
| `src/logic/transpose.test.ts` | Poista vain skeletonia todistava `not implemented` -testi. |

## Risk

- What could break: Tavallinen sana voi alkaa sävelkirjaimella ja näyttää
  epäilyttävältä soinnulta. Token `Cafe` säilyy muuttumattomana mutta voi
  saada `SUSPICIOUS_CHORD`-varoituksen.
- What could break: Tuettujen sointutyyppien ulkopuolinen oikea sointu, kuten
  `C9`, säilytetään muuttumattomana ja saa `SUSPICIOUS_CHORD`-varoituksen.
- What could break: C-duurin ja A-mollin kromaattisten sointujen kirjoitusasu
  ei määräydy etumerkinnästä. Ensimmäinen versio ratkaisee sen siirtosuunnan
  avulla.
- What could break: Tonal käyttää kansainvälistä B-merkintää eikä tunnista
  H:ta suoraan. H täytyy normalisoida ennen kirjastokutsua.
- What could break: Välilyöntien säilyttäminen tässä vaiheessa ei vielä
  ratkaise pidempien sointunimien kohdistusta muihin riveihin. Se kuuluu
  `alignment-preservation`-speksiin.
- Rollback: Poista uudet sointu- ja rivitoiminnot sekä niiden tyypit ja
  palauta vanha transpose-skeleton testineen. Älä poista asetustoiminnon jo
  käyttämää Tonal-riippuvuutta.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `transposeChordSymbol` | AC1 duuri | C, `+2`, D-duuri | Transponoidaan | `D` |
| `transposeChordSymbol` | AC2 molli | Am, `-2`, G-molli | Transponoidaan | `Gm` |
| `transposeChordSymbol` | AC3 tuetut tyypit | `C`, `Cm`, `C7`, `Cmaj7`, `Cm7`, `Csus`, `Csus4`, `Cdim`, `Caug`, `Cadd9`, `Dsus/A`; `+2`; D-duuri | Transponoidaan | `D`, `Dm`, `D7`, `Dmaj7`, `Dm7`, `Dsus`, `Dsus4`, `Ddim`, `Daug`, `Dadd9`, `Esus/B` samassa järjestyksessä |
| `transposeChordSymbol` | AC4 bassosointu | G/B, `+1`, Ab-duuri | Transponoidaan | `Ab/C` |
| `transposeChordSymbol` | AC5 alennettu basso | Cm7/Bb, `+2`, D-duuri | Transponoidaan | `Dm7/C` |
| `transposeChordSymbol` | AC6 H-normalisointi | H7 ja G/H, `0` | Transponoidaan | B7 ja G/B |
| `transposeChordSymbol` | AC7 B/Bb | B ja Bb, `0` | Transponoidaan | B ja Bb erillisinä |
| `transposeChordSymbol` | AC8 sharp | C, `+1`, C#-duuri | Transponoidaan | `C#` |
| `transposeChordSymbol` | AC9 flat | C, `+1`, Db-duuri | Transponoidaan | `Db` |
| `transposeChordSymbol` | AC10 C-duuri ylös | B, `+2`, C-duuri | Transponoidaan | `C#` |
| `transposeChordSymbol` | AC11 C-duuri alas | D, `-1`, C-duuri | Transponoidaan | `Db` |
| `transposeChordSymbol` | AC12 A-molli ylös | B, `+2`, A-molli | Transponoidaan | `C#` |
| `transposeChordSymbol` | AC13 A-molli alas | D, `-1`, A-molli | Transponoidaan | `Db` |
| `transposeChordSymbol` | AC14 nolla | C# ja Db, `0` | Transponoidaan | C# ja Db säilyvät |
| `transposeChordSymbol` | AC15 vieras sointu | C-duuri, F#7, `+2` | Transponoidaan | `G#7` |
| `transposeChordLine` | AC16 modulaatio ylös | `C \|E7 \|Am \|F#7 \|B \|`, `+2` | Transponoidaan | `D \|F#7 \|Bm \|G#7 \|C# \|` |
| `transposeChordLine` | AC17 koko rivi alas | `D \|Bm \|A \|D \|`, `-2` | Transponoidaan | `C \|Am \|G \|C \|` |
| `transposeChordLine` | AC18 muu teksti | `intro C \|Am x2 \|G rit. \|`, `+2` | Transponoidaan | `intro D \|Bm x2 \|A rit. \|`, ei varoituksia |
| `transposeChordLine` | AC19 merkit ja välit | `C,  \|Am... \| G-C \|`, `+2` | Transponoidaan | `D,  \|Bm... \| A-D \|` |
| `transposeChordLine` | AC20 epäilyttävä pääte | Rivi 3, `Cfoo \|G \|`, `+1` | Transponoidaan | `Cfoo \|Ab \|` ja täsmällinen varoitus |
| `transposeChordLine` | AC21 ei perussäveltä | `Xfoo \|C \|`, `+1` | Transponoidaan | Xfoo säilyy, C→Db, ei Xfoo-varoitusta |
| `transposeChordSymbol` | AC22 tyhjä | Tyhjä merkkijono | Transponoidaan | Virhe `Sointu ei saa olla tyhjä` |
| `transposeChordLine` | AC23 keskeneräinen basso | `G/ \|C \|`, `+2` | Transponoidaan | `A/ \|D \|` ja täsmällinen varoitus |
| `transposeChordLine` | AC24 väärä rivityyppi | Tyypit `note`, `text`, `empty` | Transponoidaan kukin | Jokaisesta virhe `Rivin tyypin pitää olla chord` |
| `transposeChordLine` | AC25 pienet soinnut | Rivi 2, `c \|am \|g7 \|cm7/bb \|C \|`, `+2` | Transponoidaan | Pienet tokenit ennallaan, C→D ja neljä täsmällistä `LOWERCASE_CHORD`-varoitusta |
| `transposeChordLine` | AC26 tavallinen sana | `cafe \|C \|`, `+2` | Transponoidaan | `cafe \|D \|`, ei cafe-varoitusta |
| `transposeChordSymbol` | AC27 tuntematon pääte | Cfoo ja ready-asetukset | Transponoidaan | Virhe `Tuntematon sointumerkintä: Cfoo` |
| `transposeChordLine` | AC28 muotoilusegmentit | Kolme täsmällisesti muotoiltua segmenttiä | Transponoidaan | D/Bm, segmenttien muotoilut säilyvät, ei lisättyä boldia |
| `transposeChordLine` | AC29 tukematon C9 | Rivi 1, `C9 \|G \|`, +2 | Transponoidaan | C9 säilyy, G→A, yksi täsmällinen varoitus |
| `transposeChordLine` | AC30 erilliset merkit | `(C): C, C. C-C / C \|` | Transponoidaan | `(D): D, D. D-D / D \|`, ei varoituksia |
| `transposeChordSymbol` | AC31 validoitu merkkiperhematriisi | Vain transposition-settingsin validoidut `ready`-tulokset, joiden lähde on kohteen alapuolinen puolisävel ja askel `1` sekä neutraalien lisätestit askelilla `-11` | Transponoidaan | Sharp C#, flat Db, neutraali suunnan mukaan |
| `transposeChordSymbol` + `transposeChordLine` | AC32 ready-only-tyyppisopimus | Waiting-tulos `requiresEnharmonicChoice` | TypeScript-tyyppitesti | Molemmat kutsut hylätään `@ts-expect-error`-merkinnän osoittamalla tavalla |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

## AC23:n toteutuskorjaus 7.10.2026
Keskeneräisen bassosoinnun muunnettu teksti säilyy nyt yhtenäisenä
contentissa, muotoilusegmenteissä, suspiciousChord-tokenissa ja varoituksessa.
Koko tulosputken HTML/plainText-yhtäsuuruus testattiin ilman sanoja ja sanojen
kanssa, mukaan lukien merkin piteneminen ja nolla-askeleen H-normalisointi.
Käyttäytymissääntö on nykyinen AC23; uusia bassosäveliä ei arvata eikä lisätä.
21 testitiedostoa, 426 onnistunutta testiä, 0 epäonnistunutta, 0 ohitettua.
Lint ja diff-tarkistus läpäisevät. Review: APPROVED.

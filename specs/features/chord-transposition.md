# Feature: Sointujen transponointi

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

Toiminnot käyttävät `transposition-settings`-speksin tuottamia validoituja
asetuksia:

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
- sus4-sointu, esimerkiksi `Csus4`
- vähennetty sointu, esimerkiksi `Cdim`
- ylinouseva sointu, esimerkiksi `Caug`
- add9-sointu, esimerkiksi `Cadd9`
- edellisten bassosointumuodot, esimerkiksi `G/B` ja `Cm7/Bb`

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

Sointu tunnistetaan tokenin alusta. Jos tunnistettavan perussävelen jälkeen
on tuntematon pääte, perussävel ja mahdollinen tunnistettava bassosävel
transponoidaan, tuntematon osa säilytetään ja palautetaan varoitus.

Esimerkiksi `Cfoo` + 1 alennusmerkkisellä kirjoitusasulla tuottaa `Dbfoo` ja
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

Muotoilua, fonttikokoa ja muiden rivien kohdistusta ei käsitellä tässä
ominaisuudessa.

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
**Given** soinnut ovat `C`, `Cm`, `C7`, `Cmaj7`, `Cm7`, `Csus4`, `Cdim`, `Caug` ja `Cadd9`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** soinnut transponoidaan
**Then** tulokset ovat tässä järjestyksessä täsmälleen `D`, `Dm`, `D7`, `Dmaj7`, `Dm7`, `Dsus4`, `Ddim`, `Daug` ja `Dadd9`

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

### AC20: Epäilyttävän soinnun tunnistettava osa transponoidaan
**Given** sointurivi-indeksi on `3`, rivi on `Cfoo |G |`, askelmäärä on `1` ja kohdesävellaji on Db-duuri
**When** sointurivi transponoidaan
**Then** tulosrivi on täsmälleen `Dbfoo |Ab |` ja palautetaan täsmälleen yksi varoitus `{ code: "SUSPICIOUS_CHORD", lineIndex: 3, startIndex: 0, original: "Cfoo", output: "Dbfoo" }`

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

## Files to Modify

| File | Change |
|---|---|
| `package.json` | Lisää Tonal-riippuvuus, jos kirjasto hyväksytään toteutuksessa sointujen jäsentämiseen ja transponointiin. |
| `src/types.ts` | Lisää sointutransponoinnin syöte-, tulos-, `SUSPICIOUS_CHORD`- ja `LOWERCASE_CHORD`-varoitustyypit. |
| `src/logic/transposeChord.ts` | Lisää yhden sointumerkin validointi, H/B-normalisointi ja transponointi. |
| `src/logic/transposeChord.test.ts` | Lisää yhden soinnun onnistumis-, enharmoniset ja virhetestit. |
| `src/logic/transposeChordLine.ts` | Lisää sointurivin tokenisointi, tekstin säilyttäminen ja varoitusten muodostus. |
| `src/logic/transposeChordLine.test.ts` | Lisää kokonaisten sointurivien, modulaatioiden ja varoitusten testit. |

## Risk

- What could break: Lyhyt tavallinen sana voi alkaa sävelkirjaimella ja
  näyttää epäilyttävältä soinnulta. Token `Cafe` ei saa muuttua ilman
  tarkoituksellista tokenisointisääntöä.
- What could break: Tuettujen sointutyyppien ulkopuolinen oikea sointu, kuten
  `C9`, transponoidaan tunnistettavan perussävelen perusteella mutta saa
  `SUSPICIOUS_CHORD`-varoituksen.
- What could break: C-duurin ja A-mollin kromaattisten sointujen kirjoitusasu
  ei määräydy etumerkinnästä. Ensimmäinen versio ratkaisee sen siirtosuunnan
  avulla.
- What could break: Tonal käyttää kansainvälistä B-merkintää eikä tunnista
  H:ta suoraan. H täytyy normalisoida ennen kirjastokutsua.
- What could break: Välilyöntien säilyttäminen tässä vaiheessa ei vielä
  ratkaise pidempien sointunimien kohdistusta muihin riveihin. Se kuuluu
  `alignment-preservation`-speksiin.
- Rollback: Palauta sointujen transponointitoiminto toteuttamattomaksi ja
  poista uudet sointu- ja rivitoiminnot sekä mahdollinen Tonal-riippuvuus.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `transposeChordSymbol` | AC1 duuri | C, `+2`, D-duuri | Transponoidaan | `D` |
| `transposeChordSymbol` | AC2 molli | Am, `-2`, G-molli | Transponoidaan | `Gm` |
| `transposeChordSymbol` | AC3 tuetut tyypit | `C`, `Cm`, `C7`, `Cmaj7`, `Cm7`, `Csus4`, `Cdim`, `Caug`, `Cadd9`; `+2`; D-duuri | Transponoidaan | `D`, `Dm`, `D7`, `Dmaj7`, `Dm7`, `Dsus4`, `Ddim`, `Daug`, `Dadd9` samassa järjestyksessä |
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
| `transposeChordLine` | AC20 epäilyttävä pääte | Rivi 3, `Cfoo \|G \|`, `+1` | Transponoidaan | `Dbfoo \|Ab \|` ja täsmällinen varoitus |
| `transposeChordLine` | AC21 ei perussäveltä | `Xfoo \|C \|`, `+1` | Transponoidaan | Xfoo säilyy, C→Db, ei Xfoo-varoitusta |
| `transposeChordSymbol` | AC22 tyhjä | Tyhjä merkkijono | Transponoidaan | Virhe `Sointu ei saa olla tyhjä` |
| `transposeChordLine` | AC23 keskeneräinen basso | `G/ \|C \|`, `+2` | Transponoidaan | `A/ \|D \|` ja täsmällinen varoitus |
| `transposeChordLine` | AC24 väärä rivityyppi | Tyypit `note`, `text`, `empty` | Transponoidaan kukin | Jokaisesta virhe `Rivin tyypin pitää olla chord` |
| `transposeChordLine` | AC25 pienet soinnut | Rivi 2, `c \|am \|g7 \|cm7/bb \|C \|`, `+2` | Transponoidaan | Pienet tokenit ennallaan, C→D ja neljä täsmällistä `LOWERCASE_CHORD`-varoitusta |
| `transposeChordLine` | AC26 tavallinen sana | `cafe \|C \|`, `+2` | Transponoidaan | `cafe \|D \|`, ei cafe-varoitusta |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

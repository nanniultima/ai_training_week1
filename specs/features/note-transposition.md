# Feature: Sävelten transponointi

## Problem Statement

Sävelrivit kuvaavat melodiaa ilman oktaavinumeroita. Sävelkorkeuden
oktaavialue ilmaistaan lihavoinnilla ja kursivoinnilla. Sovelluksen pitää
transponoida yksittäiset sävelet ja saman tavun sävelkulut, käyttää
kohdesävellajin mukaista enharmonista kirjoitusasua sekä vaihtaa
muotoilutasoa, kun sävel ylittää oktaavirajan.

Pelkkä sävelnimen muuttaminen ei riitä. Esimerkiksi B:n nostaminen yhdellä
puolisävelaskeleella tuottaa seuraavan oktaavin C:n. Jos rekisteriä ei
vaihdeta, tulos ilmaisee väärän sävelkorkeuden.

## Proposed Change

Lisätään kolme puhdasta liiketoimintalogiikan toimintoa:

- `parseNoteGroup` jäsentää yhden saman tavun sävelryhmän.
- `transposeNote` transponoi yhden sävelen ja sen rekisterin.
- `transposeNoteLine` jäsentää luokitellun sävelrivin, transponoi sen sävelet
  ja säilyttää ryhmät, erottimet ja sallitun muun sisällön.

Toiminnot käyttävät `transposition-settings`-speksin tuottamia validoituja
asetuksia:

- lähtösävellajin toonika ja moodi kontekstina
- askelmäärä `-11`–`11`
- ratkaistu kohdesävellajin toonika ja moodi
- kohdesävellajin määräämä enharmoninen kirjoitusasu

### Sävelnimet ja sävelryhmät

Syötteessä sävelkirjaimet voivat olla isoja tai pieniä. Tuloksessa ne ovat
aina isoja. Tuetut kirjaimet ovat A–G sekä H B:n vaihtoehtoisena nimenä.

- `H` ja `h` normalisoidaan tuloksessa B:ksi.
- Pieni `b` välittömästi sävelkirjaimen jälkeen on alennusmerkki.
- Iso `B` on itsenäinen B-sävel.
- `#` välittömästi sävelkirjaimen jälkeen on ylennysmerkki.
- Välilyönti erottaa sävelryhmät.
- Yhteen kirjoitetut sävelet kuuluvat samaan sävelryhmään ja saman tavun
  aikana laulettavaan sävelkulkuun.

| Syöte | Tulkinta |
|---|---|
| `gb`, `Gb` | yksi Gb-sävel |
| `GB`, `gB` | G ja B samassa ryhmässä |
| `G#C` | G# ja C samassa ryhmässä |
| `abC` | Ab ja C samassa ryhmässä |

Jokainen ryhmän sävel transponoidaan erikseen. Ryhmän sisälle ei lisätä
välilyöntejä. Esimerkiksi `gB` + 1 alennusmerkeillä tuottaa `AbC`.

### Rekisterit ja oktaavirajat

Oktaavi alkaa aina C:stä ja päättyy B:hen. Neljä tuettua rekisteriä ovat
matalimmasta korkeimpaan:

| Rekisteri | Semanttinen muotoilu |
|---:|---|
| 1 | lihavoitu ja kursivoitu |
| 2 | lihavoitu |
| 3 | tavallinen |
| 4 | kursivoitu |

`transposeNote` käsittelee muotoilun semanttisena `register`-arvona 1–4.
HTML-muotoilun lukeminen ja kirjoittaminen määritellään myöhemmässä
`rich-text-formatting`-speksissä.

Kun transponointi ylittää rajan B→C, rekisteri kasvaa yhdellä. Kun
transponointi alaspäin ylittää rajan C→B, rekisteri pienenee yhdellä.
Lopullinen rekisteri lasketaan sävelen absoluuttisesta korkeudesta.

Jos tulos menisi rekisterin 1 alapuolelle, virhe on
`Sävel <sävel> alittaa tuetun sävelalueen`. Jos tulos menisi rekisterin 4
yläpuolelle, virhe on `Sävel <sävel> ylittää tuetun sävelalueen`.

### Enharmoninen kirjoitusasu

Kirjoitusasu noudattaa sointujen transponointispeksin sääntöä:

- ylennysmerkkinen kohdesävellaji käyttää nimiä `C#`, `D#`, `F#`, `G#`, `A#`
- alennusmerkkinen kohdesävellaji käyttää nimiä `Db`, `Eb`, `Gb`, `Ab`, `Bb`
- neutraalissa C-duurissa ja A-mollissa positiivinen siirto käyttää
  ylennyksiä ja negatiivinen siirto alennuksia
- askelmäärällä `0` alkuperäinen `#`/`b`-kirjoitusasu säilyy, mutta kirjain
  muutetaan isoksi ja H normalisoidaan B:ksi

### Sävelrivin muu sisältö

`transposeNoteLine` vastaanottaa vain `note`-riviksi luokitellun rivin.
Välilyönnit ja `xN`-muotoiset toistomerkinnät säilytetään. Kohdistusvälejä tai
tavutusmerkkejä ei vielä lisätä.

Tuntematon token hylkää koko käsittelyn virheellä
`Tuntematon sisältö sävelrivillä: <token>`. Osittain transponoitua riviä ei
palauteta. Muu rivityyppi hylätään virheellä
`Rivin tyypin pitää olla note`.

## Acceptance Criteria

### AC1: Pienellä kirjoitettu sävel transponoidaan ja normalisoidaan isoksi
**Given** sävel on `c`, rekisteri on `3`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sävel transponoidaan
**Then** tuloksen nimi on `D` ja rekisteri on `3`

### AC2: Sävel transponoidaan alaspäin
**Given** sävel on `d`, rekisteri on `3`, askelmäärä on `-2` ja kohdesävellaji on C-duuri
**When** sävel transponoidaan
**Then** tuloksen nimi on `C` ja rekisteri on `3`

### AC3: H normalisoidaan B:ksi
**Given** sävelet ovat `H` ja `h`, rekisteri on `3` ja askelmäärä on `0`
**When** sävelet transponoidaan
**Then** molempien tulosten nimi on `B` ja rekisteri on `3`

### AC4: Pieni b tulkitaan alennusmerkiksi
**Given** sävelryhmät ovat `gb` ja `Gb`
**When** ryhmät jäsennetään
**Then** kumpikin tulos sisältää täsmälleen yhden sävelen nimeltä `Gb`

### AC5: Iso B tulkitaan itsenäiseksi säveleksi
**Given** sävelryhmät ovat `GB` ja `gB`
**When** ryhmät jäsennetään
**Then** kumpikin tulos sisältää täsmälleen kaksi säveltä nimeltä `G` ja `B` tässä järjestyksessä

### AC6: Ylennysmerkki kohdistuu edeltävään säveleen
**Given** sävelryhmä on `G#C`
**When** ryhmä jäsennetään
**Then** tulos sisältää täsmälleen kaksi säveltä nimeltä `G#` ja `C` tässä järjestyksessä

### AC7: Saman tavun sävelkulku transponoidaan yhtenä ryhmänä
**Given** rekisterin 3 sävelryhmä on `gB`, askelmäärä on `1` ja kohdesävellaji on Ab-duuri
**When** ryhmä transponoidaan
**Then** tulosteksti on `AbC`, ryhmässä on kaksi säveltä, Ab:n rekisteri on `3`, C:n rekisteri on `4` eikä niiden välissä ole välilyöntiä

### AC8: Ylennysmerkkinen kohdesävellaji määrää kirjoitusasun
**Given** sävel on `C`, rekisteri on `3`, askelmäärä on `1` ja kohdesävellaji on C#-duuri
**When** sävel transponoidaan
**Then** tuloksen nimi on `C#` ja rekisteri on `3`

### AC9: Alennusmerkkinen kohdesävellaji määrää kirjoitusasun
**Given** sävel on `C`, rekisteri on `3`, askelmäärä on `1` ja kohdesävellaji on Db-duuri
**When** sävel transponoidaan
**Then** tuloksen nimi on `Db` ja rekisteri on `3`

### AC10: C-duuri käyttää ylennyksiä positiivisella siirrolla
**Given** sävel on `B`, rekisteri on `3`, askelmäärä on `2` ja kohdesävellaji on C-duuri
**When** sävel transponoidaan
**Then** tuloksen nimi on `C#` ja rekisteri on `4`

### AC11: C-duuri käyttää alennuksia negatiivisella siirrolla
**Given** sävel on `D`, rekisteri on `3`, askelmäärä on `-1` ja kohdesävellaji on C-duuri
**When** sävel transponoidaan
**Then** tuloksen nimi on `Db` ja rekisteri on `3`

### AC12: A-molli käyttää ylennyksiä positiivisella siirrolla
**Given** sävel on `B`, rekisteri on `2`, askelmäärä on `2` ja kohdesävellaji on A-molli
**When** sävel transponoidaan
**Then** tuloksen nimi on `C#` ja rekisteri muuttuu arvosta `2` arvoon `3`

### AC13: A-molli käyttää alennuksia negatiivisella siirrolla
**Given** sävel on `D`, rekisteri on `3`, askelmäärä on `-1` ja kohdesävellaji on A-molli
**When** sävel transponoidaan
**Then** tuloksen nimi on `Db` ja rekisteri on `3`

### AC14: B:n ylitys nostaa rekisteriä
**Given** sävel on `B`, rekisteri on `3` ja askelmäärä on `1`
**When** sävel transponoidaan
**Then** tuloksen nimi on `C` ja rekisteri muuttuu arvosta `3` arvoon `4`

### AC15: C:n alitus laskee rekisteriä
**Given** sävel on `C`, rekisteri on `2` ja askelmäärä on `-1`
**When** sävel transponoidaan
**Then** tuloksen nimi on `B` ja rekisteri muuttuu arvosta `2` arvoon `1`

### AC16: Oktaavirajan sisäinen siirto säilyttää rekisterin
**Given** sävel on `E`, rekisteri on `3` ja askelmäärä on `3`
**When** sävel transponoidaan
**Then** tuloksen nimi on `G` ja rekisteri on `3`

### AC17: Alimman rekisterin alitus hylätään
**Given** sävel on `C`, rekisteri on `1` ja askelmäärä on `-1`
**When** sävel yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Sävel C alittaa tuetun sävelalueen`

### AC18: Ylimmän rekisterin ylitys hylätään
**Given** sävel on `B`, rekisteri on `4` ja askelmäärä on `1`
**When** sävel yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Sävel B ylittää tuetun sävelalueen`

### AC19: Kokonainen sävelrivi transponoidaan ylöspäin
**Given** rekisterin 3 sävelrivi on `c c  a a a   gB g  g  c d   c`, askelmäärä on `1` ja kohdesävellaji on Db-duuri
**When** sävelrivi transponoidaan
**Then** tulosteksti on `Db Db  Bb Bb Bb   AbC Ab  Ab  Db Eb   Db`, kaikki muut sävelet ovat rekisterissä `3` ja ryhmän `AbC` C on rekisterissä `4`

### AC20: Kokonainen sävelrivi transponoidaan alaspäin
**Given** rekisterin 3 sävelrivi on `D D  B B B   A A  A  D E   D`, askelmäärä on `-2` ja kohdesävellaji on C-duuri
**When** sävelrivi transponoidaan
**Then** tulosteksti on `C C  A A A   G G  G  C D   C` ja kaikki sävelet ovat rekisterissä `3`

### AC21: Välilyönnit ja toistomerkintä säilyvät
**Given** rekisterin 3 sävelrivi on `c  d   e x2`, askelmäärä on `2` ja kohdesävellaji on D-duuri
**When** sävelrivi transponoidaan
**Then** tulosteksti on täsmälleen `D  E   F# x2`

### AC22: Nolla askelta normalisoi kirjaimet mutta säilyttää etumerkit
**Given** rekisterin 3 sävelrivi on `c# db h` ja askelmäärä on `0`
**When** sävelrivi transponoidaan
**Then** tulosteksti on `C# Db B` ja kaikkien sävelten rekisteri on `3`

### AC23: Tyhjä sävelnimi hylätään
**Given** `transposeNote`-toiminnolle annettu sävelnimi on tyhjä merkkijono
**When** sävel yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Sävel ei saa olla tyhjä`

### AC24: Tuntematon sävel hylätään
**Given** transponoitava sävelnimi on `J`
**When** sävel yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Tuntematon sävel: J`

### AC25: Tuntematon sisältö sävelrivillä hylätään
**Given** sävelrivi on `C D hello`, vaikka sen luokiteltu tyyppi on `note`
**When** sävelrivi yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Tuntematon sisältö sävelrivillä: hello` eikä osittain transponoitua riviä palauteta

### AC26: Muuksi kuin sävelriviksi luokiteltu rivi hylätään
**Given** luokitellun rivin tyyppi on vuorollaan `chord`, `text` ja `empty`
**When** kukin rivi yritetään käsitellä `transposeNoteLine`-toiminnolla
**Then** jokainen kutsu heittää virheen täsmällisellä viestillä `Rivin tyypin pitää olla note`

### AC27: Alueen ulkopuolinen askelmäärä hylätään
**Given** sävel on `C`, rekisteri on `3` ja askelmäärä on `12`
**When** sävel yritetään transponoida
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää sävelen, rekisterin, sävelryhmän sekä sävelrivin syöte- ja tulostyypit. |
| `src/logic/parseNoteGroup.ts` | Lisää pienen b:n, ison B:n, H:n, ylennysten ja yhteen kirjoitettujen sävelten jäsentäminen. |
| `src/logic/parseNoteGroup.test.ts` | Lisää sävelryhmien onnistumis- ja virhetestit. |
| `src/logic/transposeNote.ts` | Lisää yhden sävelen validointi, H/B-normalisointi, enharmoninen transponointi ja rekisterirajojen käsittely. |
| `src/logic/transposeNote.test.ts` | Lisää yhden sävelen onnistumis-, rekisteriraja- ja virhetestit. |
| `src/logic/transposeNoteLine.ts` | Lisää koko rivin transponointi ja sallitun muun sisällön säilyttäminen. |
| `src/logic/transposeNoteLine.test.ts` | Lisää kokonaisten rivien, erottimien ja virhetilanteiden testit. |

## Risk

- What could break: Pieni `b` toimii sekä B-sävelen kirjaimena että
  alennusmerkkinä. Käyttäjän pitää kirjoittaa saman tavun G+B muodossa `GB`
  tai `gB`, ei `gb`.
- What could break: Semanttinen rekisteri pitää lukea HTML-muotoilusta
  menettämättä yksittäisten sävelten rajoja. Tämä kuuluu
  `rich-text-formatting`-speksiin.
- What could break: Neljän rekisterin ylitys keskeyttää koko rivin
  transponoinnin, jotta osittaista ja musiikillisesti epäselvää tulosta ei
  synny.
- What could break: Luokittelun ja transponoinnin pitää käyttää samaa
  sävelryhmäparseria, jotta ne eivät tulkitse syötettä eri tavoin.
- Rollback: Palauta sävelten transponointitoiminnot toteuttamattomiksi ja
  poista uudet sävel-, rekisteri- ja ryhmätyypit.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `transposeNote` | AC1 pieni kirjain | c, rekisteri 3, `+2` | Transponoidaan | D, rekisteri 3 |
| `transposeNote` | AC2 alaspäin | d, rekisteri 3, `-2` | Transponoidaan | C, rekisteri 3 |
| `transposeNote` | AC3 H/h | H ja h, rekisteri 3, `0` | Transponoidaan | Molemmat B, rekisteri 3 |
| `parseNoteGroup` | AC4 pieni b | gb ja Gb | Jäsennetään | Kumpikin yksi Gb-sävel |
| `parseNoteGroup` | AC5 iso B | GB ja gB | Jäsennetään | Kumpikin ryhmä G, B |
| `parseNoteGroup` | AC6 ylennys | G#C | Jäsennetään | Ryhmä G#, C |
| `transposeNoteLine` | AC7 ryhmä | gB, rekisteri 3, `+1` | Transponoidaan | `AbC`; Ab rekisteri 3, C rekisteri 4 |
| `transposeNote` | AC8 sharp | C, rekisteri 3, `+1`, C#-duuri | Transponoidaan | C#, rekisteri 3 |
| `transposeNote` | AC9 flat | C, rekisteri 3, `+1`, Db-duuri | Transponoidaan | Db, rekisteri 3 |
| `transposeNote` | AC10 C-duuri ylös | B, rekisteri 3, `+2` | Transponoidaan | C#, rekisteri 4 |
| `transposeNote` | AC11 C-duuri alas | D, rekisteri 3, `-1` | Transponoidaan | Db, rekisteri 3 |
| `transposeNote` | AC12 A-molli ylös | B, rekisteri 2, `+2` | Transponoidaan | C#, rekisteri 3 |
| `transposeNote` | AC13 A-molli alas | D, rekisteri 3, `-1` | Transponoidaan | Db, rekisteri 3 |
| `transposeNote` | AC14 B→C | B, rekisteri 3, `+1` | Transponoidaan | C, rekisteri 4 |
| `transposeNote` | AC15 C→B | C, rekisteri 2, `-1` | Transponoidaan | B, rekisteri 1 |
| `transposeNote` | AC16 rekisteri säilyy | E, rekisteri 3, `+3` | Transponoidaan | G, rekisteri 3 |
| `transposeNote` | AC17 alaraja | C, rekisteri 1, `-1` | Transponoidaan | Virhe alituksesta |
| `transposeNote` | AC18 yläraja | B, rekisteri 4, `+1` | Transponoidaan | Virhe ylityksestä |
| `transposeNoteLine` | AC19 rivi ylös | Määritelty rivi, rekisteri 3, `+1` | Transponoidaan | Täsmälleen määritelty Db-rivi ja rekisterit |
| `transposeNoteLine` | AC20 rivi alas | Määritelty rivi, rekisteri 3, `-2` | Transponoidaan | Täsmälleen määritelty C-rivi, rekisterit 3 |
| `transposeNoteLine` | AC21 välit ja x2 | `c  d   e x2`, `+2` | Transponoidaan | `D  E   F# x2` |
| `transposeNoteLine` | AC22 nolla | `c# db h`, `0` | Transponoidaan | `C# Db B`, rekisterit 3 |
| `transposeNote` | AC23 tyhjä nimi | Tyhjä sävelnimi | Transponoidaan | Virhe `Sävel ei saa olla tyhjä` |
| `transposeNote` | AC24 tuntematon | J | Transponoidaan | Virhe `Tuntematon sävel: J` |
| `transposeNoteLine` | AC25 tuntematon token | `C D hello`, tyyppi note | Transponoidaan | Virhe tokenista, ei osittaista tulosta |
| `transposeNoteLine` | AC26 väärä rivityyppi | chord, text, empty | Transponoidaan kukin | Jokaisesta virhe `Rivin tyypin pitää olla note` |
| `transposeNote` | AC27 askelraja | C, rekisteri 3, `12` | Transponoidaan | Virhe askelvälistä |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table


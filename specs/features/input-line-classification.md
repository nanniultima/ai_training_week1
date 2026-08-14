# Feature: Syötteen rivien tunnistaminen

## Problem Statement

Käyttäjän syöte voi sisältää sointurivejä, sävelrivejä, laulun sanoja ja
tyhjiä rivejä. Transponointi voidaan myöhemmin kohdistaa oikein vain, jos
jokainen rivi luokitellaan ensin sointu-, sävel-, teksti- tai tyhjäksi
riviksi.

Kaikkia rivityyppejä ei aina ole mukana. Sovelluksen pitää tunnistaa myös
pelkät soinnut, pelkkä melodia sekä sointujen, sävelten ja sanojen eri
sallitut yhdistelmät. Alkuperäinen sisältö, rivijärjestys ja tyhjät rivit
eivät saa muuttua luokittelun aikana.

Tekstirivi ei aina ole laulunsanoja. Se voi olla itsenäinen kappaleen osan
otsikko tai esitysohje, kuten `Kertosäe` tai `Välisoitto`. Tällainen rivi voi
esiintyä ennen musiikkirivejä, niiden välissä tai tyhjien rivien yhteydessä.
Luokittelu merkitsee sen tavalliseksi `text`-riviksi; yhteys laulunsanoihin
ratkaistaan myöhemmässä kohdistusvaiheessa.

## Proposed Change

Lisätään puhdas liiketoimintalogiikan toiminto, joka vastaanottaa
rikastekstistä irrotetut rivit tekstisisältöineen ja palauttaa jokaiselle
riville yhden tyypin:

- `chord`: sointurivi
- `note`: sävelrivi
- `text`: tekstirivi
- `empty`: tyhjä rivi

Luokittelu noudattaa seuraavia sääntöjä tässä järjestyksessä:

1. Rivi on `empty`, jos siinä ei ole muuta kuin tyhjemerkkejä.
2. Rivi on `chord`, jos siinä on vähintään yksi putkimerkki (`|`).
3. Putketon rivi on `note`, jos sen kaikki varsinaiset sisältötokenit ovat
   tuettuja sävelryhmiä tai lyhyitä toistomerkintöjä muodossa `xN`, jossa
   `N` on positiivinen kokonaisluku.
4. Muu putketon, ei-tyhjä rivi on `text`.

Kun kaikki rivit on luokiteltu, syötteessä pitää olla vähintään yksi `chord`-
tai `note`-rivi. Pelkkiä `text`- ja `empty`-rivejä sisältävä syöte hylätään
virheellä `Syötteestä ei löytynyt sointu- tai sävelrivejä`. Näin sovellus ei
hyväksy transponoitavaksi sisältöä, jossa ei ole tunnistettavaa musiikkia.

Sävelryhmässä:

- sävelkirjaimet ovat `A`–`G` tai `a`–`g`
- `H` ja `h` hyväksytään B-sävelen vaihtoehtoiseksi nimeksi
- `#` kohdistuu aina edeltävään sävelkirjaimeen
- pieni `b` kohdistuu aina edeltävään sävelkirjaimeen
- iso `B` on itsenäinen B-sävel
- useita säveliä saa kirjoittaa yhteen saman tavun sävelkuluksi

Esimerkiksi `c`, `Gb`, `gb`, `GB`, `gB`, `G#C`, `abC` ja `H7` eivät kaikki
ole samanlaisia tapauksia: `c`, `Gb`, `gb`, `GB`, `gB`, `G#C` ja `abC` ovat
sävelryhmiä, mutta `H7` ei ole sävelryhmä, koska sävelrivillä ei käytetä
sointujen lisänumeroita. Putkirivillä `H7` käsitellään myöhemmin sointuna.

Sävelrivillä sallitaan sisältötokenien välissä välilyöntejä sekä
ei-tekstuaalisia erotinmerkkejä. Toistomerkintä `x2`, `x3` ja vastaava
säilytetään rivin sisältönä, mutta sitä ei tulkita säveleksi.

Jos putketon rivi sisältää sekä vähintään yhden tuetun sävelryhmän että muuta
tekstiä, rivi luokitellaan turvallisesti `text`-riviksi ja tulokseen lisätään
varoitus `AMBIGUOUS_NOTE_LINE`. Varoituksessa ilmoitetaan rivin nollasta
alkava indeksi ja alkuperäinen sisältö. Ohjelma ei muuta epäselvää riviä
automaattisesti sävelriviksi.

Luokittelu ei muuta rivien sisältöä, välilyöntejä, järjestystä tai
rikastekstistä saatua muotoilutietoa. Muotoilua ei käytetä ensisijaisena
rivityypin tunnisteena, koska myös tekstissä voi olla lihavointia tai
kursivointia.

## Acceptance Criteria

### AC1: Tyhjä rivi säilytetään
**Given** syöte sisältää rivin `"   "`
**When** rivit luokitellaan
**Then** rivin tyyppi on `empty`, alkuperäinen sisältö on `"   "` ja rivin indeksi on `0`

### AC2: Putken sisältävä rivi on sointurivi
**Given** syöte sisältää rivin `"C    |Am     |G  x2   |C"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `chord` ja alkuperäinen sisältö säilyy täsmälleen muodossa `"C    |Am     |G  x2   |C"`

### AC3: Putki ratkaisee luokan riippumatta rivin muusta tekstistä
**Given** syöte sisältää rivin `"intro | C | tuntematon x2"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `chord` eikä rivistä muodosteta `AMBIGUOUS_NOTE_LINE`-varoitusta

### AC4: Pienillä kirjaimilla kirjoitettu sävelrivi tunnistetaan
**Given** syöte sisältää rivin `"c c  a a a   gb g  g  c d   c"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `note` eikä varoituksia palauteta

### AC5: Isoilla kirjaimilla ja yhteen kirjoitetuilla sävelillä annettu sävelrivi tunnistetaan
**Given** syöte sisältää rivin `"C C  A A A   GB G#C  G  C D   C"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `note` eikä varoituksia palauteta

### AC6: Pienen b:n ja ison B:n ero hyväksytään sävelrivillä
**Given** syöte sisältää rivit `"gb"`, `"Gb"`, `"GB"` ja `"gB"`
**When** rivit luokitellaan
**Then** kaikkien neljän rivin tyyppi on `note` ja rivien alkuperäiset sisällöt säilyvät muuttumattomina

### AC7: H hyväksytään sävelrivillä
**Given** syöte sisältää rivin `"h H BH"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `note` eikä varoituksia palauteta

### AC8: Lyhyt toistomerkintä sallitaan sävelrivillä
**Given** syöte sisältää rivin `"c c g g x2"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `note`, `x2` säilyy alkuperäisessä sisällössä eikä varoituksia palauteta

### AC9: Laulun sanat tunnistetaan tekstiriviksi
**Given** syöte sisältää rivit `"C |G |"` ja `"onpa i-hanaa laulella sateessa"`
**When** rivit luokitellaan
**Then** jälkimmäisen rivin tyyppi on `text` eikä varoituksia palauteta

### AC10: Säveliä ja tavallista tekstiä sisältävä putketon rivi varoittaa epäselvyydestä
**Given** syöte sisältää rivit `"C |G |"` ja `"C D lauletaan hiljaa"`
**When** rivit luokitellaan
**Then** jälkimmäisen rivin tyyppi on `text` ja palautetaan täsmälleen yksi `AMBIGUOUS_NOTE_LINE`-varoitus, jonka rivi-indeksi on `1` ja sisältö `"C D lauletaan hiljaa"`

### AC11: Sointu-, sävel- ja tekstirivit tunnistetaan samasta kokonaisuudesta
**Given** syöte sisältää rivit `"C |Am |G |C |"`, `"c c a a g g c"` ja `"onpa ihanaa"` tässä järjestyksessä
**When** rivit luokitellaan
**Then** palautettujen rivityyppien järjestys on täsmälleen `chord`, `note`, `text`

### AC12: Puuttuvat rivityypit hyväksytään
**Given** syöte sisältää rivit `"C |Am |G |C |"` ja `"onpa ihanaa"`
**When** rivit luokitellaan
**Then** palautettujen rivityyppien järjestys on täsmälleen `chord`, `text` eikä puuttuvasta sävelrivistä palauteta virhettä tai varoitusta

### AC13: Pelkkä melodia hyväksytään
**Given** syöte sisältää ainoan rivin `"c c a a g g c"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `note` eikä puuttuvista sointu- tai tekstiriveistä palauteta virhettä tai varoitusta

### AC14: Tyhjät rivit säilyttävät kappaleen osien rajat
**Given** syöte sisältää rivit `"C |G |"`, `""`, `"Am |F |"`
**When** rivit luokitellaan
**Then** tuloksessa on täsmälleen kolme riviä indekseillä `0`, `1`, `2` ja niiden tyypit ovat järjestyksessä `chord`, `empty`, `chord`

### AC15: Tyhjä syöte hylätään
**Given** syöte ei sisällä yhtään riviä
**When** rivit yritetään luokitella
**Then** toiminto heittää virheen täsmällisellä viestillä `Syöte ei saa olla tyhjä`

### AC16: Soinnut ja melodia hyväksytään ilman tekstiriviä
**Given** syöte sisältää rivit `"C |Am |G |C |"` ja `"c c a a g g c"`
**When** rivit luokitellaan
**Then** palautettujen rivityyppien järjestys on täsmälleen `chord`, `note` eikä puuttuvasta tekstirivistä palauteta virhettä tai varoitusta

### AC17: Melodia ja sanat hyväksytään ilman sointuriviä
**Given** syöte sisältää rivit `"c c a a g g c"` ja `"onpa ihanaa"`
**When** rivit luokitellaan
**Then** palautettujen rivityyppien järjestys on täsmälleen `note`, `text` eikä puuttuvasta sointurivistä palauteta virhettä tai varoitusta

### AC18: Pelkät soinnut hyväksytään
**Given** syöte sisältää ainoan rivin `"C |Am |G |C |"`
**When** rivit luokitellaan
**Then** rivin tyyppi on `chord` eikä puuttuvista sävel- tai tekstiriveistä palauteta virhettä tai varoitusta

### AC19: Syöte ilman tunnistettavaa musiikkia hylätään
**Given** syöte sisältää rivit `"onpa ihanaa"`, `""` ja `"laulella sateessa"`
**When** rivit yritetään luokitella
**Then** toiminto heittää virheen täsmällisellä viestillä `Syötteestä ei löytynyt sointu- tai sävelrivejä`

### AC20: Musiikkia edeltävä itsenäinen tekstirivi hyväksytään
**Given** syöte sisältää rivit `"Kertosäe"`, `"C |G |"` ja `"onpa ihanaa"`
**When** rivit luokitellaan
**Then** rivityypit ovat täsmälleen `[text, chord, text]`, ensimmäisen rivin sisältö on `"Kertosäe"` eikä varoituksia palauteta

### AC21: Musiikkikokonaisuuksien välissä oleva tekstirivi hyväksytään
**Given** syöte sisältää rivit `"C |G |"`, `"onpa ihanaa"`, `"Välisoitto"` ja `"Am |F |"`
**When** rivit luokitellaan
**Then** rivityypit ovat täsmälleen `[chord, text, text, chord]`, kolmannen rivin sisältö on `"Välisoitto"` eikä varoituksia palauteta

### AC22: Peräkkäiset sointurivit hyväksytään
**Given** syöte sisältää rivit `"C |G |"`, `"Am |F |"` ja `"Dm |G |"`
**When** rivit luokitellaan
**Then** rivityypit ovat täsmälleen `[chord, chord, chord]`, kaikki kolme sisältöä säilyvät muuttumattomina eikä varoituksia palauteta

### AC23: Sointu- ja sävelrivien vuorottelu hyväksytään
**Given** syöte sisältää rivit `"C |G |"`, `"c d e f"`, `"Am |F |"` ja `"a c e f"`
**When** rivit luokitellaan
**Then** rivityypit ovat täsmälleen `[chord, note, chord, note]`, kaikki neljä sisältöä säilyvät muuttumattomina eikä varoituksia palauteta

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää rivityyppi-, luokiteltu rivi-, varoitus- ja luokittelutulostyypit. |
| `src/logic/classifyLines.ts` | Lisää puhdas rivien luokittelulogiikka ja syötteen validointi. |
| `src/logic/classifyLines.test.ts` | Lisää hyväksymiskriteerit kattavat Vitest-testit lähdekoodin viereen. |

## Risk

- What could break: Lyhyet sanat, jotka koostuvat vain sävelkirjaimista,
  voivat näyttää sävelriviltä. Esimerkiksi yksittäinen sana `cafe` koostuu
  tuetuista sävelkirjaimista ja voisi ilman muuta kontekstia luokittua
  sävelryhmäksi.
- What could break: Putkimerkki tavallisessa tekstissä luokittelee rivin
  tarkoituksella sointuriviksi, vaikka putkea käytettäisiin muussa
  merkityksessä.
- What could break: Rikastekstieditorin tuottamat rivirakenteet täytyy
  muuntaa riveiksi ennen tämän toiminnon kutsumista menettämättä
  välilyöntejä tai muotoilua.
- Rollback: Poista uusi luokittelutoiminto ja siihen liittyvät tyypit. Nykyinen
  käyttöliittymärunko ja toteuttamattomat transponointitoiminnot eivät riipu
  ominaisuudesta ennen erillistä käyttöliittymäintegraatiota.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `classifyLines` | AC1 tyhjemerkit | `[{ content: "   " }]` | Luokitellaan | Tyyppi `empty`, sisältö ja indeksi säilyvät |
| `classifyLines` | AC2 sointurivi | `C    \|Am     \|G  x2   \|C` | Luokitellaan | Tyyppi `chord`, sisältö muuttumaton |
| `classifyLines` | AC3 putki ja teksti | `intro \| C \| tuntematon x2` | Luokitellaan | Tyyppi `chord`, ei epäselvyysvaroitusta |
| `classifyLines` | AC4 pienet sävelet | `c c  a a a   gb g  g  c d   c` | Luokitellaan | Tyyppi `note`, ei varoituksia |
| `classifyLines` | AC5 isot ja yhdistetyt sävelet | `C C  A A A   GB G#C  G  C D   C` | Luokitellaan | Tyyppi `note`, ei varoituksia |
| `classifyLines` | AC6 b/B-tapaukset | `gb`, `Gb`, `GB`, `gB` | Luokitellaan | Kaikki `note`, sisällöt muuttumattomia |
| `classifyLines` | AC7 H-merkintä | `h H BH` | Luokitellaan | Tyyppi `note`, ei varoituksia |
| `classifyLines` | AC8 toistomerkintä | `c c g g x2` | Luokitellaan | Tyyppi `note`, `x2` säilyy |
| `classifyLines` | AC9 tekstirivi | `C \|G \|` ja `onpa i-hanaa laulella sateessa` | Luokitellaan | Jälkimmäinen tyyppi `text`, ei varoituksia |
| `classifyLines` | AC10 epäselvä rivi | `C \|G \|` ja `C D lauletaan hiljaa` | Luokitellaan | Jälkimmäinen tyyppi `text`, yksi riville 1 yksilöity `AMBIGUOUS_NOTE_LINE` |
| `classifyLines` | AC11 kaikki rivityypit | Sointu-, sävel- ja tekstirivi | Luokitellaan | Tyypit `chord`, `note`, `text` samassa järjestyksessä |
| `classifyLines` | AC12 puuttuva sävelrivi | Sointu- ja tekstirivi | Luokitellaan | Tyypit `chord`, `text`, ei varoitusta puuttuvasta rivistä |
| `classifyLines` | AC13 pelkkä melodia | Yksi sävelrivi | Luokitellaan | Tyyppi `note`, ei puuttuvien rivien varoituksia |
| `classifyLines` | AC14 osien raja | Sointurivi, tyhjä rivi, sointurivi | Luokitellaan | Kolme riviä ja tyypit `chord`, `empty`, `chord` |
| `classifyLines` | AC15 virhe | Tyhjä rivilista | Luokitellaan | Virhe `Syöte ei saa olla tyhjä` |
| `classifyLines` | AC16 soinnut ja melodia | Sointurivi ja sävelrivi | Luokitellaan | Tyypit `chord`, `note`, ei puuttuvan tekstirivin varoitusta |
| `classifyLines` | AC17 melodia ja sanat | Sävelrivi ja tekstirivi | Luokitellaan | Tyypit `note`, `text`, ei puuttuvan sointurivin varoitusta |
| `classifyLines` | AC18 pelkät soinnut | Yksi sointurivi | Luokitellaan | Tyyppi `chord`, ei puuttuvien rivien varoituksia |
| `classifyLines` | AC19 vain tekstiä | Tekstirivi, tyhjä rivi ja tekstirivi | Luokitellaan | Virhe `Syötteestä ei löytynyt sointu- tai sävelrivejä` |
| `classifyLines` | AC20 otsikko ennen musiikkia | `Kertosäe`, sointurivi ja laulunsanat | Luokitellaan | `[text, chord, text]`; Kertosäe säilyy; ei varoituksia |
| `classifyLines` | AC21 ohje kokonaisuuksien välissä | Sointu, sanat, `Välisoitto`, sointu | Luokitellaan | `[chord, text, text, chord]`; Välisoitto säilyy; ei varoituksia |
| `classifyLines` | AC22 peräkkäiset soinnut | Kolme sointuriviä | Luokitellaan | `[chord, chord, chord]`; sisällöt säilyvät; ei varoituksia |
| `classifyLines` | AC23 sointu ja melodia vuorottelevat | Sointu, sävel, sointu, sävel | Luokitellaan | `[chord, note, chord, note]`; sisällöt säilyvät; ei varoituksia |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

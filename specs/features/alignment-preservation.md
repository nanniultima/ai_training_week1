# Feature: Rivien välisen kohdistuksen säilyttäminen

## Problem Statement

Soinnut ja sävelryhmät on syötteessä sijoitettu vaakasuunnassa siihen
kohtaan, jossa ne soitetaan tai lauletaan. Transponointi voi pidentää
merkintää (`C` → `C#`) tai lyhentää sitä (`C#` → `C`). Jos rivit käsitellään
toisistaan riippumatta, myöhemmät soinnut, sävelryhmät, tahtiputket ja sanat
eivät enää ala samoista musiikillisista kohdista.

Ohjelma ei tunne laulun kieltä eikä päättele sanojen oikeaa tavutusta.
Kohdistus ratkaistaan alkuperäisten sarakkeiden ja musiikkitapahtumien avulla.
Itsenäiset otsikko- ja ohjerivit säilytetään, mutta niitä ei kohdisteta.

## Proposed Change

Lisätään neljä puhdasta toimintoa:

1. `groupAlignedLines` jakaa luokitellut rivit kohdistettaviin
   musiikkikokonaisuuksiin, itsenäisiin tekstiriveihin ja tyhjiin riveihin.
2. `collectAlignmentAnchors` kerää kokonaisuuden musiikilliset
   aloitussarakkeet.
3. `calculateAlignedColumns` laskee ankkurien tulossarakkeet.
4. `alignLineGroup` muodostaa kohdistetut rivit ja lisää tai poistaa vain
   kohdistuksen vaatimia välilyöntejä ja yhdysmerkkejä.

Jokaisella transponoidulla tokenilla säilyy sen alkuperäinen, nollasta alkava
aloitus- ja loppusarake. Kohdistus tehdään ennen HTML:n muodostamista.

### Rivien ryhmittely

Kohdistettava musiikkikokonaisuus sisältää enintään yhden rivin kutakin
tyyppiä tässä järjestyksessä: valinnainen `chord`, valinnainen `note` ja
valinnainen laulunsanojen `text`. Siinä pitää olla `chord`- tai `note`-rivi.

Heti chord- tai note-rivin jälkeen esiintyvä ensimmäinen text-rivi kuuluu
samaan kokonaisuuteen laulunsanoina. Text-rivi, jota ei edellä saman avoimen
kokonaisuuden chord- tai note-rivi, on itsenäinen otsikko tai esitysohje.
Jos yhden kokonaisuuden laulunsanojen jälkeen tulee toinen text-rivi,
jälkimmäinen on itsenäinen. Uusi chord-rivi aloittaa uuden kokonaisuuden.

Tyhjä rivi päättää avoimen kokonaisuuden, säilyy tuloksessa ja erottaa
kappaleen osia. Itsenäinen text-rivi säilyttää sisältönsä ja muotoilunsa
täsmälleen eikä osallistu ankkurien laskentaan.

### Loogiset sarakkeet ja ankkurit

Yksi Unicode-koodipiste vastaa yhtä loogista saraketta. Sarkainmerkkiä ei
hyväksytä. Tulos esitetään tasalevyisellä fontilla; esitys ja kopiointi
täsmennetään `result-and-copy`-speksissä.

Ankkuri muodostetaan alkuperäiseen aloitussarakkeeseen jokaisen tunnistetun
soinnun, välilyönnillä erotetun sävelryhmän ja tahtiputken `|` kohdalle.
Yhteen kirjoitetun sävelryhmän sisäiset sävelet eivät muodosta omia
ankkureita: `GB` ja `G#C` ovat kumpikin yksi tapahtuma. Samassa sarakkeessa
olevat ankkurit yhdistetään.

Ensimmäinen ankkuri jää alkuperäiseen sarakkeeseensa. Jokaiselta riviltä
lasketaan ankkurivälin musiikkitokenien pituuden muutos `tulospituus -
alkuperäinen pituus`. Välin yhteinen muutos on rivien suurin muutos.
Positiivinen muutos siirtää seuraavaa ankkuria oikealle ja pelkästään
negatiiviset muutokset voivat siirtää sitä vasemmalle. Tulosväli ei saa olla
niin lyhyt, että musiikkitokenit osuvat toisiinsa. Kaikki saman kokonaisuuden
rivit käyttävät samoja tulossarakkeita.

### Pidentyminen, lyheneminen ja täytemerkit

Pidentyminen siirtää seuraavaa ankkuria oikealle vain tarvittavan määrän.
Musiikkiriveille lisätään ASCII-välilyöntejä. Laulunsanoihin lisätään
välilyöntejä alkuperäisessä välilyöntijaksossa ja yhdysmerkkejä `-`
alkuperäisen välilyönnittömän tekstitokenin sisällä.

Lyheneminen siirtää seuraavaa ankkuria vasemmalle lyhentymisen verran, jos
mikään saman välin toinen musiikkirivi ei tarvitse pidempää väliä:

```text
C# D    → C C#
Db G    → C F#
C# |G|  → C |F#|
```

Laulunsanojen alkuperäinen yhdysmerkki voidaan poistaa vain, jos kaikki
seuraavat ehdot täyttyvät:

- yhdysmerkki sijaitsee kahden peräkkäisen musiikkiankkurin välisellä
  rajalla
- vähintään yksi kyseistä rajaa edeltävä musiikkimerkintä lyheni
- yhdysmerkin poistamisen jälkeen seuraava sanaosa alkaa täsmälleen
  vasemmalle siirtyneestä seuraavan ankkurin tulossarakkeesta

Muussa kohdassa oleva yhdysmerkki säilytetään. Esimerkiksi `C# D` ja `on-pa`
voivat muuttua yhden puolisävelaskeleen laskulla muotoihin `C C#` ja `onpa`, mutta sanan muu yhdysmerkki ei
poistu. Jos yksi rivi lyhenee ja toinen pitenee samalla ankkurivälillä,
pisimmän tarvitsema leveys ratkaisee eikä yhdysmerkkiä poisteta, jos yhteinen
sarake ei siirry vasemmalle.

Viimeisen ankkurin jälkeisiä rivien loppuja ei täytetä samanpituisiksi.

Lisätty välilyönti saa arvot `bold: false` ja `italic: false`. Lisätty
yhdysmerkki perii edeltävän alkuperäisen merkin muotoilun; jos sitä ei ole,
se perii seuraavan merkin muotoilun, ja jos kumpaakaan ei ole, molemmat arvot
ovat `false`. Poistetun yhdysmerkin oma muotoilu poistuu sen mukana, mutta
muiden merkkien muotoilu säilyy.

Musiikkirivin muu teksti, kuten `x2`, liikkuu ankkurien mukana, mutta sen
sisältöä tai muotoilua ei muuteta. Tämä ominaisuus ei transponoi, luokittele
eikä muodosta HTML:ää.

## Acceptance Criteria

### AC1: Musiikilliset ankkurit kerätään ja yhdistetään
**Given** sointujen aloitussarakkeet ovat `0` ja `3`, putkien sarakkeet `2` ja `5` ja sävelryhmien aloitussarakkeet `0` ja `2`
**When** ankkurit kerätään
**Then** ankkurisarakkeet ovat täsmälleen `[0, 2, 3, 5]`

### AC2: Sävelryhmän sisälle ei tehdä ankkuria
**Given** sävelrivi on `G#C D`, jossa ryhmät alkavat sarakkeista `0` ja `4`
**When** ankkurit kerätään
**Then** ankkurisarakkeet ovat täsmälleen `[0, 4]` eikä sarakkeessa `2` ole ankkuria

### AC3: Pidentynyt sävel siirtää seuraavaa ankkuria
**Given** alkuperäiset ankkurit ovat `[0, 2]` ja ensimmäinen tapahtuma muuttuu muodosta `C` muotoon `C#`
**When** tulossarakkeet lasketaan
**Then** tulossarakkeet ovat täsmälleen `[0, 3]`

### AC4: Muuttumaton tokenpituus ei siirrä ankkuria
**Given** ankkurit ovat `[0, 4]` ja ensimmäisen välin sointu muuttuu muodosta `C7` muotoon `D7`
**When** tulossarakkeet lasketaan
**Then** tulossarakkeet ovat täsmälleen `[0, 4]`

### AC5: Rivien suurin levenemä määrää yhteisen sarakkeen
**Given** ankkurit ovat `[0, 2]`, sointurivin token muuttuu muodosta `A` muotoon `A#m` ja sävelrivin token muodosta `A` muotoon `A#`
**When** tulossarakkeet lasketaan
**Then** tulossarakkeet ovat täsmälleen `[0, 4]`

### AC6: Sävelrivi ja sanat kohdistetaan pidentyneisiin säveliin
**Given** sävelrivi on `c c`, tekstirivi on `onpa` ja tulossävelet ovat `C#` ja `C#`
**When** kokonaisuus kohdistetaan
**Then** tulosrivit ovat täsmälleen `C# C#` ja `on-pa`

### AC7: Useat levenemät lisäävät useita yhdysmerkkejä
**Given** sävelrivi on `c c  a a a`, tekstirivi on `onpa i-hanaa` ja kaikki viisi säveltä pitenevät yhdellä merkillä
**When** kokonaisuus kohdistetaan
**Then** tulosrivit ovat täsmälleen `C# C#  A# A# A#` ja `on-pa i--ha-naa`

### AC8: Saman tavun sävelkulku säilyy yhtenä ryhmänä
**Given** sävelrivi on `gB g`, tekstirivi on `laule` ja tulosryhmät ovat `AbC` ja `Ab`
**When** kokonaisuus kohdistetaan
**Then** tulosrivit ovat täsmälleen `AbC Ab` ja `lau-le` eikä `AbC`:n sisällä ole välilyöntiä

### AC9: Sointu- ja sävelrivit käyttävät samaa tulossaraketta
**Given** rivien tapahtumat alkavat sarakkeista `[0, 2]`, sointutulokset ovat `C#` ja `G#` ja säveltulokset `C` ja `G`
**When** kokonaisuus kohdistetaan
**Then** sointurivi on `C# G#`, sävelrivi on `C  G` ja molempien toinen tapahtuma alkaa sarakkeesta `3`

### AC10: Tekstin välilyöntijaksoa kasvatetaan välilyönnillä
**Given** tekstirivi on `onpa  ihanaa`, lisäyskohta on sarakkeessa `5` ja lisäysleveys `1`
**When** tekstirivi kohdistetaan
**Then** tulosrivi on täsmälleen `onpa   ihanaa`

### AC11: Tekstitokeniin lisätään täsmällinen määrä yhdysmerkkejä
**Given** tekstirivi on `onpa`, lisäyskohta on sarakkeessa `2` ja lisäysleveys `2`
**When** tekstirivi kohdistetaan
**Then** tulosrivi on täsmälleen `on--pa`

### AC12: Yhden merkin lyheneminen siirtää seuraavaa säveltä vasemmalle
**Given** sävelryhmät `C#` ja `D` alkavat sarakkeista `[0, 3]` ja yhden puolisävelaskeleen laskun tulokset ovat `C` ja `C#`
**When** sävelrivi kohdistetaan
**Then** tulosrivi on täsmälleen `C C#` ja C# alkaa sarakkeesta `2`

### AC13: Alennusmerkin poistuminen siirtää seuraavaa säveltä vasemmalle
**Given** sävelryhmät `Db` ja `G` alkavat sarakkeista `[0, 3]` ja tulokset ovat `C` ja `F#`
**When** sävelrivi kohdistetaan
**Then** tulosrivi on täsmälleen `C F#` ja F# alkaa sarakkeesta `2`

### AC14: Lyhentynyt sointu siirtää tahtiputkea vasemmalle
**Given** sointurivi on `C# |G|` ja tulossoinnut ovat `C` ja `F#`
**When** sointurivi kohdistetaan
**Then** tulosrivi on täsmälleen `C |F#|` ja ensimmäinen putki on sarakkeessa `2`

### AC15: Tarpeeton kohdistusyhdysmerkki poistetaan lyhennyksessä
**Given** sävelrivi on `C# D`, tekstirivi on `on-pa`, yhden puolisävelaskeleen laskun tulossävelet ovat `C` ja `C#` ja yhdysmerkki on ankkurien välisellä rajalla sarakkeessa `2`
**When** kokonaisuus kohdistetaan
**Then** tulosrivit ovat täsmälleen `C C#` ja `onpa`

### AC16: Muu alkuperäinen yhdysmerkki säilyy
**Given** sävelrivi on `C# D`, tekstirivi on `on-pa nyt-kin`, yhden puolisävelaskeleen laskun tulossävelet ovat `C` ja `C#` ja vain `on-pa`-sanan yhdysmerkki on ankkurirajalla
**When** kokonaisuus kohdistetaan
**Then** tekstirivi on täsmälleen `onpa nyt-kin`

### AC17: Toisen rivin pidentyminen estää yhdysmerkin poiston
**Given** samalla ankkurivälillä sointu lyhenee `C#`→`C`, sävel pitenee `C`→`C#` ja tekstirivi on `on-pa`
**When** kokonaisuus kohdistetaan
**Then** tulossarakkeet ovat `[0, 3]` ja tekstirivi säilyy täsmälleen `on-pa`

### AC18: Viimeisen ankkurin jälkeisiä rivejä ei tasata
**Given** sointurivin viimeinen token on `Cmaj7` ja tekstirivin viimeinen token `nyt`
**When** kokonaisuus kohdistetaan
**Then** rivit päättyvät `Cmaj7`- ja `nyt`-merkkijonoihin eikä niiden perään lisätä välilyöntejä

### AC19: Lisätty välilyönti on muotoilematon
**Given** kohdistus lisää yhden välilyönnin lihavoidulle musiikkiriville
**When** kohdistettu tekstijakso muodostetaan
**Then** lisätty jakso on täsmälleen `{ text: " ", bold: false, italic: false }`

### AC20: Lisätty yhdysmerkki perii edeltävän muotoilun
**Given** tekstin `onpa` merkit `on` ovat lihavoituja ja sarakkeeseen `2` lisätään yhdysmerkki
**When** kohdistettu tekstijakso muodostetaan
**Then** tulosteksti on `on-pa` ja yhdysmerkin muotoilu on `{ bold: true, italic: false }`

### AC21: Sointurivin muu teksti ja muotoilu säilyvät
**Given** `C x2 |G |` transponoituu muotoon `C# x2 |G# |` ja `x2`:n muotoilu on `{ bold: false, italic: true }`
**When** rivi kohdistetaan
**Then** tulosteksti on `C# x2 |G# |`, `x2` esiintyy kerran ja sen muotoilu on `{ bold: false, italic: true }`

### AC22: Musiikkia edeltävä tekstirivi on itsenäinen
**Given** rivityypit ja sisällöt ovat `[text:"Kertosäe", chord:"C |G |", text:"onpa"]`
**When** rivit ryhmitellään
**Then** tuloksena on ensin itsenäinen text-rivi `Kertosäe` ja sitten yksi kokonaisuus tyypeillä `[chord, text]`

### AC23: Toinen peräkkäinen tekstirivi on itsenäinen
**Given** rivityypit ja sisällöt ovat `[chord:"C |G |", text:"onpa", text:"Välisoitto", chord:"Am |F |"]`
**When** rivit ryhmitellään
**Then** ensimmäinen kokonaisuus on `[chord, text]`, `Välisoitto` on itsenäinen text-rivi ja toinen kokonaisuus on `[chord]`

### AC24: Tyhjä rivi erottaa kokonaisuudet
**Given** rivityypit ovat `[chord, empty, chord]`
**When** rivit ryhmitellään
**Then** tuloksessa on kaksi chord-kokonaisuutta ja niiden välissä yksi empty-rivi, jonka sisältö on tyhjä merkkijono

### AC25: Vain sointuja sisältävä kokonaisuus hyväksytään
**Given** kokonaisuudessa on vain sointurivi `C |G |` ja sen transponoitu sisältö `C# |G# |`
**When** kokonaisuus kohdistetaan
**Then** ainoa tulosrivi on täsmälleen `C# |G# |`

### AC26: Vain säveliä sisältävä kokonaisuus hyväksytään
**Given** kokonaisuudessa on vain sävelrivi `c c` ja tulosryhmät ovat `C#` ja `C#`
**When** kokonaisuus kohdistetaan
**Then** ainoa tulosrivi on täsmälleen `C# C#`

### AC27: Kokonaisuus ilman musiikkiriviä hylätään
**Given** kohdistettavassa kokonaisuudessa on vain text-rivi `onpa ihanaa`
**When** kokonaisuus yritetään kohdistaa
**Then** toiminto heittää virheen `Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi`

### AC28: Sarkainmerkki hylätään
**Given** kohdistettava sointurivi sisältää merkkijonon `C\t|G |`
**When** kokonaisuus yritetään kohdistaa
**Then** toiminto heittää virheen `Kohdistettava syöte ei saa sisältää sarkainmerkkejä`

### AC29: Puuttuva tokenin sijainti hylätään
**Given** transponoidulta sävelryhmältä puuttuu alkuperäinen aloitussarake
**When** kokonaisuus yritetään kohdistaa
**Then** toiminto heittää virheen `Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti`

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää ankkurin, tokenisijainnin, rivikokonaisuuden, itsenäisen tekstirivin ja kohdistetun tuloksen tyypit. |
| `src/logic/groupAlignedLines.ts` | Lisää luokiteltujen rivien jako musiikkikokonaisuuksiin sekä itsenäisiin teksti- ja tyhjiin riveihin. |
| `src/logic/groupAlignedLines.test.ts` | Lisää kaikki riviyhdistelmät, itsenäiset tekstirivit ja tyhjät rajat kattavat testit. |
| `src/logic/alignLineGroup.ts` | Lisää ankkurien kerääminen, sarakkeiden laskenta ja täytemerkkien lisääminen tai poistaminen. |
| `src/logic/alignLineGroup.test.ts` | Lisää pidentymisen, lyhenemisen, yhdysmerkkien, muotoilun ja virheiden testit. |
| `src/ui/ui.ts` | Näytä kohdistettu tulos tasalevyisellä fontilla; kopiointi täsmennetään myöhemmässä speksissä. |

## Risk

- What could break: Kohdistus näyttää erilaiselta suhteellista fonttia
  käyttävässä kohteessa, vaikka loogiset sarakkeet ovat oikein.
- What could break: Unicode-merkit eivät kaikki ole näytöllä yhden sarakkeen
  levyisiä. Ensimmäinen versio laskee yhden koodipisteen yhdeksi sarakkeeksi.
- What could break: Käyttäjän kielellinen yhdysmerkki voi olla samassa
  kohdassa kuin poistettavaksi tulkittu kohdistusyhdysmerkki. Poisto rajataan
  ankkurirajaan ja todettuun lyhenemiseen.
- What could break: Peräkkäisistä tekstiriveistä vain ensimmäinen voi olla
  avoimen musiikkikokonaisuuden laulunsanarivi; muut tulkitaan itsenäisiksi.
- What could break: Jos alkuperäiset rivit eivät ole keskenään kohdistettuja,
  toiminto säilyttää myös tämän epätarkkuuden.
- Rollback: Poista kohdistusvaihe ja palauta transponoidut rivit niiden
  alkuperäisillä väleillä ilman lisättyjä tai poistettuja yhdysmerkkejä.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `collectAlignmentAnchors` | AC1 kaikki ankkurit | Soinnut 0/3, putket 2/5, sävelryhmät 0/2 | Kerätään | `[0, 2, 3, 5]` |
| `collectAlignmentAnchors` | AC2 sävelryhmä | `G#C D`, ryhmät 0/4 | Kerätään | `[0, 4]`, ei ankkuria 2 |
| `calculateAlignedColumns` | AC3 pidentyminen | Ankkurit `[0, 2]`, C→C# | Lasketaan | `[0, 3]` |
| `calculateAlignedColumns` | AC4 sama pituus | Ankkurit `[0, 4]`, C7→D7 | Lasketaan | `[0, 4]` |
| `calculateAlignedColumns` | AC5 suurin levenemä | Ankkurit `[0, 2]`, A→A#m ja A→A# | Lasketaan | `[0, 4]` |
| `alignLineGroup` | AC6 sävelet ja sanat | `c c` / `onpa`; C#, C# | Kohdistetaan | `C# C#` / `on-pa` |
| `alignLineGroup` | AC7 useat levenemät | `c c  a a a` / `onpa i-hanaa`; kaikki +1 merkki | Kohdistetaan | `C# C#  A# A# A#` / `on-pa i--ha-naa` |
| `alignLineGroup` | AC8 yksi sävelryhmä | `gB g` / `laule`; AbC, Ab | Kohdistetaan | `AbC Ab` / `lau-le`; ei väliä AbC:n sisällä |
| `alignLineGroup` | AC9 yhteiset sarakkeet | Soinnut C#/G#, sävelet C/G, ankkurit 0/2 | Kohdistetaan | `C# G#` / `C  G`; toiset tapahtumat sarakkeessa 3 |
| `alignTextLine` | AC10 välijakso | `onpa  ihanaa`, sarake 5, leveys 1 | Kohdistetaan | `onpa   ihanaa` |
| `alignTextLine` | AC11 kaksi viivaa | `onpa`, sarake 2, leveys 2 | Kohdistetaan | `on--pa` |
| `alignLineGroup` | AC12 C# lyhenee | C#/D sarakkeissa 0/3, `-1` → C/C# | Kohdistetaan | `C C#`, C# sarakkeessa 2 |
| `alignLineGroup` | AC13 Db lyhenee | Db/G sarakkeissa 0/3 → C/F# | Kohdistetaan | `C F#`, F# sarakkeessa 2 |
| `alignLineGroup` | AC14 putki | `C# \|G\|` → C/F# | Kohdistetaan | `C \|F#\|`, putki sarakkeessa 2 |
| `alignLineGroup` | AC15 viiva poistuu | `C# D` / `on-pa`, `-1` → C/C# | Kohdistetaan | `C C#` / `onpa` |
| `alignLineGroup` | AC16 muu viiva | `on-pa nyt-kin`, vain ensimmäinen viiva ankkurilla | Kohdistetaan | `onpa nyt-kin` |
| `alignLineGroup` | AC17 toinen rivi pitenee | Chord C#→C, note C→C#, teksti on-pa | Kohdistetaan | Sarakkeet `[0, 3]`, teksti `on-pa` |
| `alignLineGroup` | AC18 rivien loput | Lopussa Cmaj7 ja nyt | Kohdistetaan | Päätteet `Cmaj7` ja `nyt`, ei loppuvälejä |
| `alignMusicLine` | AC19 lisätty väli | Yksi väli lihavoidulla rivillä | Muodostetaan | `{ text: " ", bold: false, italic: false }` |
| `alignTextLine` | AC20 viivan muotoilu | `on` bold, lisäys sarakkeeseen 2 | Muodostetaan | `on-pa`; viiva `{ bold: true, italic: false }` |
| `alignLineGroup` | AC21 muu musiikkiteksti | `C x2 \|G \|` → `C# x2 \|G# \|`; x2 italic | Kohdistetaan | Sama tulosteksti; x2 kerran ja italic |
| `groupAlignedLines` | AC22 otsikko ennen | Kertosäe, chord, onpa | Ryhmitellään | Itsenäinen Kertosäe ja `[chord, text]` |
| `groupAlignedLines` | AC23 toinen teksti | Chord, onpa, Välisoitto, chord | Ryhmitellään | `[chord, text]`, itsenäinen Välisoitto, `[chord]` |
| `groupAlignedLines` | AC24 tyhjä raja | Chord, empty, chord | Ryhmitellään | Kaksi kokonaisuutta ja yksi tyhjä rivi |
| `alignLineGroup` | AC25 vain soinnut | `C \|G \|` → `C# \|G# \|` | Kohdistetaan | `C# \|G# \|` |
| `alignLineGroup` | AC26 vain sävelet | `c c`; C#, C# | Kohdistetaan | `C# C#` |
| `alignLineGroup` | AC27 ei musiikkia | Vain text `onpa ihanaa` | Kohdistetaan | Virhe `Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi` |
| `alignLineGroup` | AC28 sarkain | `C\t\|G \|` | Kohdistetaan | Virhe `Kohdistettava syöte ei saa sisältää sarkainmerkkejä` |
| `alignLineGroup` | AC29 sijainti puuttuu | Sävelryhmältä puuttuu aloitussarake | Kohdistetaan | Virhe `Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti` |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

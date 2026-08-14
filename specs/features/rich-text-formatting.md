# Feature: Rikastekstin muotoilujen käsittely

## Problem Statement

Syötteen lihavointi ja kursivointi eivät ole vain ulkoasua: sävelrivillä
niiden yhdistelmä ilmaisee sävelen rekisterin. Sointurivillä tunnistetut
soinnut ja musiikkimerkit pitää esittää aina lihavoituina. Laulun sanojen ja
tunnistamattoman tekstin muotoilut pitää säilyttää turvallisessa
HTML-tuloksessa.

HTML:n lukeminen, sävelrekisterin päättely ja tuloksen muodostaminen pitää
erottaa toisistaan. Muuten yleinen rikastekstin jäsentäjä joutuisi
päättelemään virheellisesti, onko jokainen lihavoitu merkki sävel vai jotain
muuta sisältöä.

## Proposed Change

Lisätään neljä erillistä vastuuta:

1. `parseRichText` lukee editorin HTML:n tekstijaksoiksi ja tunnistaa vain
   lihavoinnin, kursivoinnin, fonttikoon ja rivinvaihdot.
2. `formattingToRegister` muuntaa sävelrivin tekstijakson muotoilun
   rekisteriksi 1–4.
3. `registerToFormatting` muuntaa transponoidun sävelen rekisterin takaisin
   lihavoinniksi ja kursivoinniksi.
4. `formatMusicResult` muodostaa käsitellyistä riveistä turvallisen HTML:n.

### Rikastekstin jäsentäminen

`parseRichText` tuottaa tekstijaksoja, joilla on ominaisuudet `text`, `bold`,
`italic` ja valinnainen `fontSizePx`.

- `<strong>` ja `<b>` asettavat `bold: true`.
- `<em>` ja `<i>` asettavat `italic: true`.
- Sisäkkäisten elementtien muotoilut yhdistetään.
- Jäsentäjä ei tuota register-arvoa eikä päättele, onko jakso sävel, sointu
  vai tavallista tekstiä.

### Muotoilun ja rekisterin vastaavuus

Kun rivi on tunnistettu sävelriviksi, `formattingToRegister` käyttää tätä
taulukkoa:

| Bold | Italic | Rekisteri |
|---|---|---:|
| kyllä | kyllä | 1 |
| kyllä | ei | 2 |
| ei | ei | 3 |
| ei | kyllä | 4 |

`registerToFormatting` tekee käänteisen muunnoksen. Lopullisen sävelen
muotoilu määräytyy transponoinnin tuottamasta rekisteristä. Saman
sävelryhmän peräkkäisillä sävelillä voi olla eri muotoilu ilman näkyvää
erotinta.

### Sointurivin muotoilu

Sointurivin tokenit saadaan `chord-transposition`-ominaisuudelta.

- Tunnistettu sointu lihavoidaan kokonaan.
- `SUSPICIOUS_CHORD`-varoituksen saanut transponoitu token lihavoidaan
  kokonaan.
- Tekstitokenien ulkopuoliset musiikkimerkit lihavoidaan.
- Tekstitoken säilyttää alkuperäisen lihavoinnin ja kursivoinnin.

Musiikkimerkkeihin kuuluvat esimerkiksi `|`, `,`, `.`, `-`, `:`, `/`, `(` ja
`)`, kun ne ovat erillään tekstitokenista. `x2`, `intro` ja `rit.` ovat
kokonaisia tekstitokeneita, joten niiden numeroa tai pistettä ei irroteta.

### Muut rivit ja fonttikoko

Tekstirivien sisältö, lihavointi ja kursivointi säilytetään. Tyhjä rivi
säilytetään. Tämä ominaisuus ei muuta sanoja tai kohdistusta.

Tuloksen perusfonttikooksi valitaan syötteen ensimmäisen ei-tyhjän merkin
`fontSizePx`. Edeltäviä tyhjiä rivejä ja välilyöntejä ei käytetä valintaan.
Kaikki tulosjaksot käyttävät yhtä peruskokoa.

Jos kokoa ei saada, oletus on `12px`. Nolla, negatiivinen, `NaN` tai ääretön
arvo hylätään virheellä `Fonttikoon pitää olla positiivinen luku`.

### Turvallinen HTML

Tuloksessa sallitaan vain `<div>`, `<br>`, `<strong>`, `<em>` ja `<span>`.
Merkit `&`, `<`, `>`, `"` ja `'` HTML-enkoodataan. Linkkielementti poistetaan
mutta sen näkyvä teksti säilytetään. Script-elementti sisältöineen poistetaan
kokonaan. Värit, kuvat, listat, alleviivaukset, luokat,
tapahtumankäsittelijät ja muut attribuutit poistetaan.

Kohdistuksen uudelleenlaskenta ja leikepöydälle kirjoittaminen eivät kuulu
tähän speksiin.

## Acceptance Criteria

### AC1: Strong-elementti luetaan lihavoinniksi
**Given** syöte-HTML on `<strong>C</strong>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoan jakson text on `C`, bold on `true`, italic on `false` eikä jaksolla ole register-arvoa

### AC2: B-elementti luetaan lihavoinniksi
**Given** syöte-HTML on `<b>C</b>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoan jakson text on `C`, bold on `true`, italic on `false` eikä jaksolla ole register-arvoa

### AC3: Em-elementti luetaan kursivoinniksi
**Given** syöte-HTML on `<em>C</em>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoan jakson text on `C`, bold on `false`, italic on `true` eikä jaksolla ole register-arvoa

### AC4: I-elementti luetaan kursivoinniksi
**Given** syöte-HTML on `<i>C</i>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoan jakson text on `C`, bold on `false`, italic on `true` eikä jaksolla ole register-arvoa

### AC5: Sisäkkäinen lihavointi ja kursivointi yhdistetään
**Given** syöte-HTML on `<strong><em>C</em></strong>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoan jakson text on `C`, bold on `true`, italic on `true` eikä jaksolla ole register-arvoa

### AC6: Lihavoitu ja kursivoitu muotoilu tarkoittaa rekisteriä 1
**Given** muotoilu on `{ bold: true, italic: true }`
**When** `formattingToRegister` käsittelee muotoilun
**Then** tulos on täsmälleen `1`

### AC7: Lihavoitu muotoilu tarkoittaa rekisteriä 2
**Given** muotoilu on `{ bold: true, italic: false }`
**When** `formattingToRegister` käsittelee muotoilun
**Then** tulos on täsmälleen `2`

### AC8: Tavallinen muotoilu tarkoittaa rekisteriä 3
**Given** muotoilu on `{ bold: false, italic: false }`
**When** `formattingToRegister` käsittelee muotoilun
**Then** tulos on täsmälleen `3`

### AC9: Kursivoitu muotoilu tarkoittaa rekisteriä 4
**Given** muotoilu on `{ bold: false, italic: true }`
**When** `formattingToRegister` käsittelee muotoilun
**Then** tulos on täsmälleen `4`

### AC10: Rekisteri 1 tarkoittaa lihavoitua ja kursivoitua muotoilua
**Given** rekisteri on `1`
**When** `registerToFormatting` käsittelee rekisterin
**Then** tulos on täsmälleen `{ bold: true, italic: true }`

### AC11: Rekisteri 2 tarkoittaa lihavoitua muotoilua
**Given** rekisteri on `2`
**When** `registerToFormatting` käsittelee rekisterin
**Then** tulos on täsmälleen `{ bold: true, italic: false }`

### AC12: Rekisteri 3 tarkoittaa tavallista muotoilua
**Given** rekisteri on `3`
**When** `registerToFormatting` käsittelee rekisterin
**Then** tulos on täsmälleen `{ bold: false, italic: false }`

### AC13: Rekisteri 4 tarkoittaa kursivoitua muotoilua
**Given** rekisteri on `4`
**When** `registerToFormatting` käsittelee rekisterin
**Then** tulos on täsmälleen `{ bold: false, italic: true }`

### AC14: Virheellinen rekisteri hylätään
**Given** rekisteri on vuorollaan `0` ja `5`
**When** `registerToFormatting` yrittää käsitellä rekisterin
**Then** kumpikin kutsu heittää virheen `Rekisterin pitää olla kokonaisluku väliltä 1–4`

### AC15: Rekisterin 1 sävel muodostetaan lihavoituna ja kursivoituna
**Given** tulossävel on `C` ja register on `1`
**When** sävelen HTML muodostetaan
**Then** HTML on `<strong><em><span>C</span></em></strong>`

### AC16: Rekisterin 2 sävel muodostetaan lihavoituna
**Given** tulossävel on `C` ja register on `2`
**When** sävelen HTML muodostetaan
**Then** HTML on `<strong><span>C</span></strong>`

### AC17: Rekisterin 3 sävel muodostetaan tavallisena
**Given** tulossävel on `C` ja register on `3`
**When** sävelen HTML muodostetaan
**Then** HTML on `<span>C</span>`

### AC18: Rekisterin 4 sävel muodostetaan kursivoituna
**Given** tulossävel on `C` ja register on `4`
**When** sävelen HTML muodostetaan
**Then** HTML on `<em><span>C</span></em>`

### AC19: Sävelryhmän sävelillä voi olla eri muotoilu
**Given** tulosryhmä sisältää rekisterin 3 sävelen `Ab` ja rekisterin 4 sävelen `C`
**When** ryhmän HTML muodostetaan
**Then** HTML on `<span>Ab</span><em><span>C</span></em>` eikä sävelten välissä ole välilyöntiä

### AC20: Tunnistettu sointu lihavoidaan kokonaan
**Given** sointutoken on `Cm7/Bb`
**When** tokenin HTML muodostetaan
**Then** HTML on `<strong><span>Cm7/Bb</span></strong>`

### AC21: Epäilyttävä sointutoken lihavoidaan kokonaan
**Given** sointutoken on `Dbfoo` ja sillä on `SUSPICIOUS_CHORD`-varoitus
**When** tokenin HTML muodostetaan
**Then** HTML on `<strong><span>Dbfoo</span></strong>`

### AC22: Sointurivin soinnut ja erilliset musiikkimerkit lihavoidaan
**Given** tokenit ovat sointu `C`, väli ` `, merkki `|`, väli ` `, sointu `G`, merkki `,`, väli ` `, merkki `-`, väli ` ` ja sointu `Am`
**When** tokenien HTML muodostetaan
**Then** HTML on `<strong><span>C</span></strong><span> </span><strong><span>|</span></strong><span> </span><strong><span>G</span></strong><strong><span>,</span></strong><span> </span><strong><span>-</span></strong><span> </span><strong><span>Am</span></strong>`

### AC23: Tavallinen x2-token säilyttää muotoilunsa
**Given** tekstitoken on `x2`, bold on `false` ja italic on `false`
**When** tokenin HTML muodostetaan
**Then** HTML on `<span>x2</span>`

### AC24: Kursivoitu rit.-token säilyttää muotoilunsa
**Given** tekstitoken on `rit.`, bold on `false` ja italic on `true`
**When** tokenin HTML muodostetaan
**Then** HTML on `<em><span>rit.</span></em>` eikä piste saa erillistä lihavointia

### AC25: Tekstirivin muotoilut säilyvät
**Given** tekstirivin jaksot ovat tavallinen `onpa `, lihavoitu `ihanaa` ja kursivoitu ` laulaa`
**When** rivin HTML muodostetaan
**Then** HTML on `<div><span>onpa </span><strong><span>ihanaa</span></strong><em><span> laulaa</span></em></div>`

### AC26: Tyhjä rivi säilyy
**Given** rivityyppi on `empty` ja sisältö on tyhjä
**When** rivin HTML muodostetaan
**Then** HTML on `<div><br></div>`

### AC27: Ensimmäisen sisältömerkin fonttikoko valitaan
**Given** ensimmäinen rivi on tyhjä, toinen alkaa kahdella välilyönnillä ja ensimmäisen sisältömerkin fontSizePx on `18`
**When** perusfonttikoko ratkaistaan
**Then** tulos on `18px`

### AC28: Puuttuva fonttikoko käyttää 12 pikselin oletusta
**Given** ensimmäisellä sisältömerkillä ei ole fontSizePx-arvoa
**When** perusfonttikoko ratkaistaan
**Then** tulos on `12px`

### AC29: Kaikki tulosjaksot käyttävät samaa perusfonttikokoa
**Given** perusfonttikoko on `18px` ja tulosjaksot ovat lihavoitu sointu `C`, rivinvaihto, tavallinen sävel `E`, rivinvaihto ja tavallinen teksti `onpa`
**When** koko tuloksen HTML muodostetaan
**Then** HTML on täsmälleen `<div style="font-size:18px"><div><strong><span>C</span></strong></div><div><span>E</span></div><div><span>onpa</span></div></div>`

### AC30: Virheellinen fonttikoko hylätään
**Given** fontSizePx on vuorollaan `0`, `-1`, `NaN`, `Infinity` ja `-Infinity`
**When** perusfonttikoko yritetään ratkaista
**Then** jokainen kutsu heittää virheen `Fonttikoon pitää olla positiivinen luku`

### AC31: HTML-erikoismerkit enkoodataan
**Given** tekstijakson sisältö on `A&B < C > "D" 'E'`
**When** jakson HTML muodostetaan
**Then** HTML-teksti on `A&amp;B &lt; C &gt; &quot;D&quot; &#39;E&#39;`

### AC32: Script-elementti sisältöineen poistetaan
**Given** syöte-HTML on `<script>alert(1)</script><span>C</span>`
**When** syöte jäsennetään ja turvallinen HTML muodostetaan
**Then** HTML on täsmälleen `<span>C</span>`

### AC33: Linkki poistetaan mutta linkkiteksti säilyy
**Given** syöte-HTML on `<a href="https://example.com">C</a>`
**When** syöte jäsennetään ja turvallinen HTML muodostetaan
**Then** HTML on täsmälleen `<span>C</span>`

### AC34: Väri ja tapahtumankäsittelijä poistetaan
**Given** syöte-HTML on `<span style="color:red" onclick="alert(1)">C</span>`
**When** syöte jäsennetään ja turvallinen HTML muodostetaan
**Then** HTML on täsmälleen `<span>C</span>`

### AC35: Tyhjä rikastekstisyöte hylätään
**Given** rikastekstisyöte ei sisällä rivejä tai tekstijaksoja
**When** `parseRichText` yrittää jäsentää syötteen
**Then** toiminto heittää virheen `Rikastekstisyöte ei saa olla tyhjä`

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää muotoiltu tekstijakso, rekisterimuotoilu, turvallinen rivi, fonttikoko ja muotoiltu tulos -tyypit. |
| `src/logic/parseRichText.ts` | Lisää HTML:n muuntaminen tekstijaksoiksi ja tukemattomien rakenteiden poisto. |
| `src/logic/parseRichText.test.ts` | Lisää HTML-muotoilujen, rivien ja turvallisuuden testit. |
| `src/logic/noteRegisterFormatting.ts` | Lisää muotoilu→rekisteri- ja rekisteri→muotoilu-muunnokset. |
| `src/logic/noteRegisterFormatting.test.ts` | Lisää kaikki rekisteriyhdistelmät ja virheelliset rekisterit kattavat testit. |
| `src/logic/formatMusicResult.ts` | Lisää sävelten, sointujen, tekstirivien ja tyhjien rivien turvallisen HTML:n muodostus. |
| `src/logic/formatMusicResult.test.ts` | Lisää HTML:n, fonttikoon, enkoodauksen ja puhdistuksen testit. |

## Risk

- What could break: Selaimet voivat tuottaa `contenteditable`-editorista
  erilaisia mutta visuaalisesti vastaavia HTML-rakenteita.
- What could break: Sävelryhmän sisällä rekisteri voi vaihtua ilman
  välilyöntiä. Muotoilujaksot eivät saa lisätä näkyviä erottimia.
- What could break: Piste voi olla osa `rit.`-tekstitokenia tai erillinen
  musiikkimerkki. Tokenisoinnin tulos ratkaisee muotoilun.
- What could break: Puutteellinen HTML-puhdistus voisi sallia skriptin tai
  tapahtumankäsittelijän suorittamisen.
- What could break: Yksi perusfonttikoko poistaa tarkoitukselliset
  kokovaihtelut. Tämä on ensimmäisen version tietoinen rajaus.
- Rollback: Palauta käyttöliittymä käyttämään pelkkää tekstisisältöä ja
  poista rikastekstin jäsentämis-, rekisteri- ja muodostustoiminnot.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `parseRichText` | AC1 strong | `<strong>C</strong>` | Jäsennetään | `{ text: "C", bold: true, italic: false }`, ei register-arvoa |
| `parseRichText` | AC2 b | `<b>C</b>` | Jäsennetään | `{ text: "C", bold: true, italic: false }`, ei register-arvoa |
| `parseRichText` | AC3 em | `<em>C</em>` | Jäsennetään | `{ text: "C", bold: false, italic: true }`, ei register-arvoa |
| `parseRichText` | AC4 i | `<i>C</i>` | Jäsennetään | `{ text: "C", bold: false, italic: true }`, ei register-arvoa |
| `parseRichText` | AC5 sisäkkäiset | `<strong><em>C</em></strong>` | Jäsennetään | `{ text: "C", bold: true, italic: true }`, ei register-arvoa |
| `formattingToRegister` | AC6 bold+italic | true, true | Muunnetaan | `1` |
| `formattingToRegister` | AC7 bold | true, false | Muunnetaan | `2` |
| `formattingToRegister` | AC8 tavallinen | false, false | Muunnetaan | `3` |
| `formattingToRegister` | AC9 italic | false, true | Muunnetaan | `4` |
| `registerToFormatting` | AC10 rekisteri 1 | `1` | Muunnetaan | `{ bold: true, italic: true }` |
| `registerToFormatting` | AC11 rekisteri 2 | `2` | Muunnetaan | `{ bold: true, italic: false }` |
| `registerToFormatting` | AC12 rekisteri 3 | `3` | Muunnetaan | `{ bold: false, italic: false }` |
| `registerToFormatting` | AC13 rekisteri 4 | `4` | Muunnetaan | `{ bold: false, italic: true }` |
| `registerToFormatting` | AC14 virhe | `0`, `5` | Muunnetaan | Kummastakin `Rekisterin pitää olla kokonaisluku väliltä 1–4` |
| `formatNote` | AC15 rekisteri 1 | C, 1 | Muodostetaan | `<strong><em><span>C</span></em></strong>` |
| `formatNote` | AC16 rekisteri 2 | C, 2 | Muodostetaan | `<strong><span>C</span></strong>` |
| `formatNote` | AC17 rekisteri 3 | C, 3 | Muodostetaan | `<span>C</span>` |
| `formatNote` | AC18 rekisteri 4 | C, 4 | Muodostetaan | `<em><span>C</span></em>` |
| `formatNoteGroup` | AC19 eri rekisterit | Ab/3 ja C/4 | Muodostetaan | `<span>Ab</span><em><span>C</span></em>` |
| `formatChordToken` | AC20 sointu | Cm7/Bb | Muodostetaan | `<strong><span>Cm7/Bb</span></strong>` |
| `formatChordToken` | AC21 epäilyttävä | Dbfoo + varoitus | Muodostetaan | `<strong><span>Dbfoo</span></strong>` |
| `formatChordLine` | AC22 koko rivi | C, välit, `|`, G, `,`, `-`, Am | Muodostetaan | `<strong><span>C</span></strong><span> </span><strong><span>|</span></strong><span> </span><strong><span>G</span></strong><strong><span>,</span></strong><span> </span><strong><span>-</span></strong><span> </span><strong><span>Am</span></strong>` |
| `formatTextToken` | AC23 x2 | x2, false, false | Muodostetaan | `<span>x2</span>` |
| `formatTextToken` | AC24 rit. | rit., false, true | Muodostetaan | `<em><span>rit.</span></em>` |
| `formatLine` | AC25 tekstirivi | onpa / ihanaa / laulaa määritellyin muotoiluin | Muodostetaan | `<div><span>onpa </span><strong><span>ihanaa</span></strong><em><span> laulaa</span></em></div>` |
| `formatLine` | AC26 tyhjä | Empty-rivi | Muodostetaan | `<div><br></div>` |
| `resolveBaseFontSize` | AC27 ensimmäinen merkki | Tyhjä rivi, välit, 18px | Ratkaistaan | `18px` |
| `resolveBaseFontSize` | AC28 oletus | Ei kokoa | Ratkaistaan | `12px` |
| `formatMusicResult` | AC29 yksi koko | 18px; sointu C, sävel E ja teksti onpa omilla riveillään | Muodostetaan | `<div style="font-size:18px"><div><strong><span>C</span></strong></div><div><span>E</span></div><div><span>onpa</span></div></div>` |
| `resolveBaseFontSize` | AC30 virhe | 0, -1, NaN, ±Infinity | Ratkaistaan | Jokaisesta `Fonttikoon pitää olla positiivinen luku` |
| `escapeHtml` | AC31 erikoismerkit | `A&B < C > "D" 'E'` | Enkoodataan | `A&amp;B &lt; C &gt; &quot;D&quot; &#39;E&#39;` |
| `parseRichText` + `formatMusicResult` | AC32 script | `<script>alert(1)</script><span>C</span>` | Käsitellään | `<span>C</span>` |
| `parseRichText` + `formatMusicResult` | AC33 linkki | `<a href="https://example.com">C</a>` | Käsitellään | `<span>C</span>` |
| `parseRichText` + `formatMusicResult` | AC34 attribuutit | `<span style="color:red" onclick="alert(1)">C</span>` | Käsitellään | `<span>C</span>` |
| `parseRichText` | AC35 tyhjä | Ei rivejä tai jaksoja | Jäsennetään | `Rikastekstisyöte ei saa olla tyhjä` |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

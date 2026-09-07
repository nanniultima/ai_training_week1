# Feature: Rikastekstin muotoilujen käsittely

**Status:** Done

## Problem Statement

Editorin muotoilu ilmaisee sävelrivillä rekisterin, mutta muilla riveillä se
on säilytettävää ulkoasua. HTML on jäsennettävä turvalliseksi tietomalliksi ja
transponoitu tulos muodostettava takaisin HTML:ksi ilman vaarallista sisältöä.

## Proposed Change

Lisätään julkiset `parseRichText`, `formattingToRegister`,
`registerToFormatting`, `resolveBaseFontSize` ja `formatMusicResult`.
`parseRichText` palauttaa `{ lines: InputLine[] }`; tyhjällä rivillä on
`segments: []`. Se käyttää selaimen `template`/DOM-rajapintaa. `<div>`, `<p>`,
`<br>` ja tekstin `\n` normalisoidaan riveiksi ilman sisäkkäisten lohkojen
ylimääräisiä tyhjiä rivejä. Selaimen korjaama DOM hyväksytään.

`strong`/`b` on bold ja `em`/`i` italic. Vierekkäiset täysin samanmuotoiset
jaksot yhdistetään. Vain positiivinen inline-`font-size:Npx` luetaan;
desimaalit sallitaan, muut yksiköt ja computed style ohitetaan.

Rekisterit ovat bold+italic=1, bold=2, tavallinen=3 ja italic=4. Saman
sävelryhmän sävelillä voi olla eri rekisterit. Sointu ja
`SUSPICIOUS_CHORD` lihavoidaan. Lihavoitavat erilliset musiikkimerkit ovat
täsmälleen `| , . - : / ( )`. Tekstitokenin sisäiset muotoilujaksot säilyvät.
`TransposedChordLine` saa lähdevälit ja muotoilujaksot; sävelrivin erottimet ja
`xN` saavat lähdemuotoilujaksot. Speksi 6 laskee kohdistuksen ennen formatteria.

Peruskoko tulee ensimmäisestä sisältömerkistä; edeltävät tyhjät rivit ja
tyhjemerkit ohitetaan. Sen virheellinen eksplisiittinen px-arvo hylätään,
myöhempiä kokoja ei validoida. Oletus on `12px`. Generoitu
`style="font-size:Npx"` on ainoa sallittu attribuutti. Sallitut tagit ovat
`div`, `br`, `strong`, `em`, `span`. Tukemattoman elementin näkyvä teksti
säilyy; `script`, `style`, kuvat ja muu ei-tekstuaalinen sisältö poistetaan.
Tyhjäksi katsotaan vain riveistä ja tyhjemerkeistä koostuva syöte.

## Acceptance Criteria

### AC1: Lihavointi luetaan
**Given** syöte on vuorollaan `<strong>C</strong>` ja `<b>C</b>`
**When** `parseRichText` jäsentää sen
**Then** ainoa segmentti on `{text:"C",bold:true,italic:false}` ilman register-arvoa

### AC2: Kursivointi luetaan
**Given** syöte on vuorollaan `<em>C</em>` ja `<i>C</i>`
**When** syöte jäsennetään
**Then** ainoa segmentti on `{text:"C",bold:false,italic:true}`

### AC3: Sisäkkäiset muotoilut yhdistyvät
**Given** syöte on `<strong><em>C</em></strong>`
**When** syöte jäsennetään
**Then** segmentin bold ja italic ovat `true`

### AC4: Rivirakenteet normalisoidaan
**Given** syöte on `<div>A</div><p>B<br>C</p>`
**When** syöte jäsennetään
**Then** rivitekstit ovat täsmälleen `["A","B","C"]`

### AC5: Tekstin newline muodostaa rivin
**Given** tekstisolmu on `A\nB`
**When** syöte jäsennetään
**Then** rivitekstit ovat `["A","B"]`

### AC6: Sisäkkäinen lohko ei lisää tyhjää riviä
**Given** syöte on `<div><p>A</p></div><div>B</div>`
**When** syöte jäsennetään
**Then** rivitekstit ovat `["A","B"]`

### AC7: Tyhjällä rivillä ei ole segmenttejä
**Given** syöte on `<div>A</div><div><br></div><div>B</div>`
**When** syöte jäsennetään
**Then** keskimmäinen rivi on `{text:"",segments:[]}`

### AC8: Samanmuotoiset jaksot yhdistetään
**Given** syöte on `<strong>A</strong><b>B</b><em>C</em>`
**When** syöte jäsennetään
**Then** segmentit ovat lihavoitu `AB` ja kursivoitu `C`

### AC9: Inline-pikselikoko luetaan
**Given** syöte on `<span style="font-size:18.5px">C</span>`
**When** syöte jäsennetään
**Then** `fontSizePx` on `18.5`

### AC10: Muut kokolähteet ohitetaan
**Given** koko on inline `2em` tai vain computed `20px`
**When** syöte jäsennetään
**Then** segmentillä ei ole `fontSizePx`-kenttää

### AC11: Selaimen korjaama HTML hyväksytään
**Given** DOM normalisoi syötteen `<strong><em>C</strong>`
**When** syöte jäsennetään
**Then** C:n bold ja italic ovat `true`

### AC12: Muotoilut muuttuvat rekistereiksi
**Given** bold/italic-yhdistelmät ovat TT, TF, FF ja FT
**When** `formattingToRegister` käsittelee ne
**Then** tulokset ovat `[1,2,3,4]`

### AC13: Rekisterit muuttuvat muotoiluiksi
**Given** rekisterit ovat `1,2,3,4`
**When** `registerToFormatting` käsittelee ne
**Then** bold/italic-tulokset ovat TT, TF, FF ja FT

### AC14: Virherekisteri hylätään
**Given** arvo on `0`, `5` tai `1.5`
**When** se muunnetaan
**Then** virhe on `Rekisterin pitää olla kokonaisluku väliltä 1–4`

### AC15: Sävelen neljä rekisteriä muotoillaan
**Given** sävel C on rekistereissä 1–4
**When** sisäinen segmenttiformatteri käsittelee sen
**Then** HTML:t ovat `<strong><em><span>C</span></em></strong>`, `<strong><span>C</span></strong>`, `<span>C</span>`, `<em><span>C</span></em>`

### AC16: Ryhmän rekisterit voivat erota
**Given** ryhmä on Ab/3 ja C/4
**When** ryhmä muotoillaan
**Then** HTML on `<span>Ab</span><em><span>C</span></em>` ilman erotinta

### AC17: Soinnut lihavoidaan
**Given** tokenit ovat tunnistettu `Cm7/Bb` ja epäilyttävä `Dbfoo`
**When** ne muotoillaan
**Then** HTML:t ovat `<strong><span>Cm7/Bb</span></strong>` ja `<strong><span>Dbfoo</span></strong>`

### AC18: Musiikkimerkit lihavoidaan
**Given** erilliset tokenit ovat `| , . - : / ( )`
**When** ne muotoillaan
**Then** jokainen on omassa `<strong><span>…</span></strong>`-rakenteessa

### AC19: Muu merkki jää tekstiksi
**Given** tekstitoken on `+`
**When** se muotoillaan
**Then** HTML on `<span>+</span>`

### AC20: Tekstitoken säilyttää sisämuotoilut
**Given** `rit` on italic ja sitä seuraava `.` tavallinen samassa tokenissa
**When** token muotoillaan
**Then** HTML on `<em><span>rit</span></em><span>.</span>`

### AC21: Sointutoken säilyttää lähdevälin
**Given** C lähdevälillä `[0,1)` transponoituu Db:ksi
**When** token muodostetaan
**Then** lähdeväli on `[0,1)` ja HTML `<strong><span>Db</span></strong>`

### AC22: Note-rivin xN säilyttää muotoilun
**Given** `x2` on italic
**When** rivi muotoillaan
**Then** HTML on `<em><span>x2</span></em>`

### AC23: Note-rivin erotin säilyttää muotoilun
**Given** ` - ` on bold
**When** rivi muotoillaan
**Then** HTML on `<strong><span> - </span></strong>`

### AC24: Tekstirivi säilyttää muotoilut
**Given** jaksot ovat tavallinen `onpa `, bold `ihanaa`, italic ` laulaa`
**When** rivi muotoillaan
**Then** HTML on `<div><span>onpa </span><strong><span>ihanaa</span></strong><em><span> laulaa</span></em></div>`

### AC25: Tyhjä rivi säilyy
**Given** rivityyppi on empty
**When** rivi muotoillaan
**Then** HTML on `<div><br></div>`

### AC26: Ensimmäisen sisältömerkin koko valitaan
**Given** tyhjän rivin ja kahden välilyönnin jälkeisen merkin koko on `18.5`
**When** koko ratkaistaan
**Then** tulos on `18.5px`

### AC27: Puuttuvan koon oletus on 12px
**Given** ensimmäisellä sisältömerkillä ei ole kokoa
**When** koko ratkaistaan
**Then** tulos on `12px`

### AC28: Virheellinen ensimmäinen koko hylätään
**Given** arvo on `0`, `-1`, `NaN`, `Infinity` tai `-Infinity`
**When** koko ratkaistaan
**Then** virhe on `Fonttikoon pitää olla positiivinen luku`

### AC29: Myöhempää kokoa ei validoida
**Given** ensimmäinen koko on `18` ja myöhempi `0`
**When** koko ratkaistaan
**Then** tulos on `18px`

### AC30: Koko tulos käyttää yhtä kokoa
**Given** koko on 18px ja riveillä ovat chord C, note E ja text onpa
**When** `formatMusicResult` muodostaa tuloksen
**Then** HTML on `<div style="font-size:18px"><div><strong><span>C</span></strong></div><div><span>E</span></div><div><span>onpa</span></div></div>`

### AC31: Erikoismerkit enkoodataan
**Given** teksti on `A&B < C > "D" 'E'`
**When** se muotoillaan
**Then** teksti on `A&amp;B &lt; C &gt; &quot;D&quot; &#39;E&#39;`

### AC32: Script ja style poistetaan sisältöineen
**Given** syöte on `<script>x</script><style>x</style><span>C</span>`
**When** se jäsennetään ja muotoillaan
**Then** HTML on `<span>C</span>`

### AC33: Ei-tekstuaalinen sisältö poistetaan
**Given** syöte on `<img src=x alt=C><span>D</span>`
**When** se jäsennetään ja muotoillaan
**Then** HTML on `<span>D</span>`

### AC34: Tukemattoman elementin teksti säilyy
**Given** syöte on `<a href=x>C</a><u>D</u>`
**When** se jäsennetään ja muotoillaan
**Then** HTML on `<span>CD</span>`

### AC35: Syötteen attribuutit poistetaan
**Given** syöte on `<span class=x style="color:red" onclick=x>C</span>`
**When** se jäsennetään ja muotoillaan
**Then** HTML on `<span>C</span>`

### AC36: Generoitu fonttikoko on ainoa attribuutti
**Given** koko on 12px ja tuloksessa on C
**When** tulos muotoillaan
**Then** HTML on `<div style="font-size:12px"><div><span>C</span></div></div>` ilman muita attribuutteja

### AC37: Tyhjä rikasteksti hylätään
**Given** syöte on `""`, `<div><br></div>` tai `<div> \t</div>`
**When** se jäsennetään
**Then** virhe on `Rikastekstisyöte ei saa olla tyhjä`

### AC38: Parseri ei luokittele sisältöä
**Given** syöte on `<strong>C</strong>`
**When** se jäsennetään
**Then** tuloksessa on vain riviteksti ja segmentit, ei `type`, `register` tai tokeneita

### AC39: Editorin sitovat välilyönnit normalisoidaan
**Given** HTML on `<div>c&nbsp;c&nbsp;&nbsp;g</div>`
**When** `parseRichText` jäsentää sen
**Then** ainoan rivin ainoan segmentin teksti on täsmälleen `c c  g`, jossa kaikki välit ovat ASCII-välilyöntejä

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Parseri-, formatteri- ja lähdemuotoilua kantavat chord/note-tyypit. |
| `src/logic/parseRichText.ts` | DOM-jäsennys ja normalisointi. |
| `src/logic/parseRichText.test.ts` | AC1–AC11, AC32–AC35, AC37–AC39. |
| `src/logic/noteRegisterFormatting.ts` | Rekisterimuunnokset. |
| `src/logic/noteRegisterFormatting.test.ts` | AC12–AC14. |
| `src/logic/formatMusicResult.ts` | Fonttikoko, turvallinen tulos ja sisäiset formatterit. |
| `src/logic/formatMusicResult.test.ts` | AC15–AC36. |
| `src/logic/transposeChordLine.ts` | Lähdevälit ja tokenien muotoilujaksot. |
| `src/logic/transposeChordLine.test.ts` | Chord-lähdekohdistuksen regressiot. |
| `src/logic/transposeNoteLine.ts` | Erotinten ja xN-osien muotoilujaksot. |
| `src/logic/transposeNoteLine.test.ts` | Note-osien muotoiluregressiot. |

## Risk

- What could break: DOM-normalisointi, lähde- ja tulostokenien eri pituudet,
  ryhmän sisäinen rekisterinvaihto, puhdistuksen aukot ja nykyiset
  chord/note-tulosmallien kuluttajat.
- Rollback: palauta lueteltujen yhteisten tyyppi- ja transponointimoduulien
  muutokset ja poista kolme uutta rikastekstimoduulia testeineen.

## Testing Strategy (MANDATORY)

Jokaiselle AC1–AC39 kirjoitetaan samanniminen Vitest-testi `ACN <kuvaus>`.
AC1–AC11, AC32–AC35 ja AC37–AC39 ovat `parseRichText.test.ts`:ssä;
AC12–AC14 `noteRegisterFormatting.test.ts`:ssä; AC15–AC36
`formatMusicResult.test.ts`:ssä. AC21:n malliregressio on lisäksi
`transposeChordLine.test.ts`:ssä ja AC22–AC23:n regressiot
`transposeNoteLine.test.ts`:ssä. Given/When/Then ja täsmällinen odote ovat
kunkin yllä olevan AC:n mukaiset. Virheet kattavat tyhjän syötteen,
virherekisterin ja fonttikoon; reunat kattavat DOM-rivit, sisäkkäisyyden,
desimaalikoon, turvallisuuden ja eri rekisterit samassa ryhmässä.

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `parseRichText` | AC1–AC3 muotoilut | AC:n HTML | Jäsennetään | AC:n täsmäsegmentti |
| `parseRichText` | AC4–AC8 rivit ja yhdistys | AC:n DOM | Jäsennetään | AC:n täsmärivit ja segmentit |
| `parseRichText` | AC9–AC11 fontti ja DOM | AC:n tyylit/HTML | Jäsennetään | AC:n täsmäarvot |
| rekisterimuunnokset | AC12–AC14 | AC:n yhdistelmät/arvot | Muunnetaan | AC:n tulos tai täsmävirhe |
| `formatMusicResult` | AC15–AC20 | AC:n semanttiset osat | Muotoillaan | AC:n täsmä-HTML |
| transponointimallit + formatteri | AC21–AC23 | AC:n lähdemuotoilu | Kohdistetaan ja muotoillaan | AC:n lähdeväli ja täsmä-HTML |
| `formatMusicResult` | AC24–AC25 | text/empty-rivi | Muotoillaan | AC:n täsmä-HTML |
| `resolveBaseFontSize` | AC26–AC29 | AC:n fonttikoot | Ratkaistaan | AC:n koko tai täsmävirhe |
| `formatMusicResult` | AC30–AC31 | rivit/erikoismerkit | Muotoillaan | AC:n täsmä-HTML |
| parseri + formatteri | AC32–AC36 | AC:n HTML | Käsitellään | AC:n puhdas täsmä-HTML |
| `parseRichText` | AC37–AC38 | tyhjä tai strong C | Jäsennetään | Täsmävirhe tai rajattu malli |
| `parseRichText` | AC39 sitovat välilyönnit | `c&nbsp;c&nbsp;&nbsp;g` | Jäsennetään | `c c  g` ASCII-väleillä |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

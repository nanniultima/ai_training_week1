# Feature: Tuloksen näyttäminen ja kopiointi

## Problem Statement

Transponointi ei auta käyttäjää, ellei kohdistettua ja muotoiltua tulosta voi
tarkistaa sekä siirtää esimerkiksi Google Docsiin. Pelkkä tavallinen teksti
menettäisi lihavoinnin, kursivoinnin ja fonttikoon. Pelkkä HTML puolestaan ei
toimi kaikissa kohdeohjelmissa.

Tuloksen välilyönnit ovat musiikillisesti merkityksellisiä, joten sekä
näytön että kopioitavan HTML:n pitää käyttää tasalevyistä fonttia ja säilyttää
tyhjemerkit. Kopioinnin onnistumisesta tai epäonnistumisesta pitää antaa
yksiselitteinen palaute.

## Proposed Change

Lisätään kolme vastuuta:

1. `createResultPresentation` muodostaa kohdistetusta ja muotoillusta
   tuloksesta näytettävän HTML:n, tavallisen tekstin ja varoitustekstit.
2. `copyResultToClipboard` kirjoittaa samalla käyttäjän toiminnolla
   leikepöydälle MIME-muodot `text/html` ja `text/plain`.
3. Käyttöliittymä näyttää tulosalueen, varoitukset, kopiointipainikkeen ja
   kopioinnin tilaviestin.

Tämä speksi ei lisää tiedostolatausta. Käyttäjä kopioi tuloksen
leikepöydälle ja liittää sen haluamaansa ohjelmaan.

### Tulosmalli

`createResultPresentation` vastaanottaa:

- `rich-text-formatting`-speksin turvallisen tulos-HTML:n
- samojen tulosrivien tekstisisällöt järjestyksessä
- tuloksen fonttikoon
- käsittelyssä syntyneet rakenteiset varoitukset

Se palauttaa täsmälleen nämä tiedot:

- `html`: selaimessa näytettävä ja `text/html`-muodossa kopioitava HTML
- `plainText`: `text/plain`-muodossa kopioitava teksti
- `warnings`: käyttäjälle näytettävät varoitustekstit

HTML kääritään elementtiin
`<div style="font-family:monospace;white-space:pre-wrap">…</div>`.
Sisällä säilytetään `formatMusicResult`-toiminnon tuottama turvallinen HTML
muuttamattomana. Näin sen `font-size`, `<strong>`, `<em>`, `<span>`, `<div>`
ja `<br>` säilyvät.

Tavallinen teksti muodostetaan tulosrivien näkyvästä tekstistä. Rivit
yhdistetään LF-rivinvaihdolla `\n`. Tyhjä rivi tuottaa kahden ympäröivän
rivin väliin kaksi `\n`-merkkiä. Tekstin loppuun ei lisätä rivinvaihtoa.
HTML-tageja, varoituksia tai tilaviestejä ei lisätä tavalliseen tekstiin.

### Tulosalue

Ennen ensimmäistä onnistunutta käsittelyä tulosalue on piilotettu ja
kopiointipainike on poistettu käytöstä. Onnistunut käsittely:

- näyttää otsikon `Transponoitu tulos`
- näyttää HTML-tuloksen vain luku -muodossa
- näyttää mahdolliset varoitukset tuloksen ulkopuolella
- ottaa käyttöön painikkeen `Kopioi tulos`

Uusi onnistunut käsittely korvaa aiemman tuloksen ja varoitukset. Uuden
käsittelyn validointi- tai käsittelyvirhe tyhjentää aiemman tuloksen,
piilottaa tulosalueen ja poistaa kopiointipainikkeen käytöstä, jotta vanhaa
tulosta ei erehdytä pitämään uuden syötteen tuloksena.

Askelmäärä `0` näyttää tuloksen normaalisti, koska muotoilu- ja
kohdistuskäsittelyt tehdään silloinkin.

### Varoitusten esitys

Varoitukset näytetään syöterivien järjestyksessä. Nollasta alkava sisäinen
rivi- ja merkkisijainti näytetään käyttäjälle yhdestä alkavana.

- `SUSPICIOUS_CHORD` näytetään muodossa
  `Rivi {lineIndex + 1}, kohta {startIndex + 1}: epäilyttävä sointu
  "{original}" muutettiin muotoon "{output}".`
- `LOWERCASE_CHORD` näytetään muodossa
  `Rivi {lineIndex + 1}, kohta {startIndex + 1}: mahdollinen sointu
  "{original}" alkaa pienellä kirjaimella eikä sitä muutettu.`
- `AMBIGUOUS_NOTE_LINE` näytetään muodossa
  `Rivi {lineIndex + 1}: rivi tulkittiin tekstiksi: "{content}".`

Varoitukset eivät estä tuloksen näyttämistä tai kopiointia eivätkä ne kuulu
leikepöydän HTML- tai tekstisisältöön.

### Leikepöydälle kopiointi

`copyResultToClipboard` käyttää rajapintaa, jolle annetaan yhdellä
kirjoituskerralla sekä `text/html` että `text/plain`. Tuotantototeutus käyttää
selaimen Clipboard API:a; testeissä rajapinta korvataan muistissa toimivalla
testiversiolla.

Kopiointi käynnistyy vain käyttäjän painalluksesta. Onnistumisen jälkeen
näytetään tilaviestinä `Tulos kopioitu`. Jos leikepöytärajapintaa ei ole tai
kirjoitus hylätään, näytetään `Tuloksen kopiointi epäonnistui` eikä
onnistumisviestiä näytetä. Epäonnistuminen ei poista näkyvää tulosta.

## Acceptance Criteria

### AC1: Tulosalue on aluksi piilotettu
**Given** sovellus on avattu eikä transponointia ole tehty
**When** käyttöliittymä alustetaan
**Then** `transposition-result`-elementin `hidden`-arvo on `true` ja `copy-result`-painikkeen `disabled`-arvo on `true`

### AC2: Onnistunut käsittely näyttää tuloksen
**Given** esitys sisältää HTML:n `<div style="font-family:monospace;white-space:pre-wrap"><div style="font-size:12px"><div><strong><span>C</span></strong></div><div><span>onpa</span></div></div></div>`
**When** käyttöliittymä näyttää onnistuneen tuloksen
**Then** tulosalueen `hidden`-arvo on `false`, otsikko on `Transponoitu tulos`, tuloselementin HTML on täsmälleen annettu HTML ja kopiointipainikkeen `disabled`-arvo on `false`

### AC3: Esityksen HTML saa tasalevyisen ulkokuoren
**Given** turvallinen tulos-HTML on `<div style="font-size:12px"><div><strong><span>C</span></strong></div></div>`
**When** tulosesitys muodostetaan
**Then** esityksen HTML on täsmälleen `<div style="font-family:monospace;white-space:pre-wrap"><div style="font-size:12px"><div><strong><span>C</span></strong></div></div></div>`

### AC4: Tavallisen tekstin rivinvaihdot muodostetaan LF-merkeillä
**Given** tulosrivien tekstit ovat järjestyksessä `C |G |` ja `onpa ihanaa`
**When** tulosesitys muodostetaan
**Then** `plainText` on täsmälleen `C |G |\nonpa ihanaa`

### AC5: Tyhjä rivi säilyy tavallisessa tekstissä
**Given** tulosrivien tekstit ovat järjestyksessä `C |G |`, tyhjä merkkijono ja `Am |F |`
**When** tulosesitys muodostetaan
**Then** `plainText` on täsmälleen `C |G |\n\nAm |F |`

### AC6: Tavallisen tekstin loppuun ei lisätä rivinvaihtoa
**Given** ainoa tulosrivi on `C |G |`
**When** tulosesitys muodostetaan
**Then** `plainText` on täsmälleen `C |G |`, sen pituus on `6` ja viimeinen merkki on `|`

### AC7: Lihavointi ja kursivointi säilyvät esityksen HTML:ssä
**Given** turvallinen tulos-HTML on `<div style="font-size:12px"><div><strong><span>C</span></strong><em><span>E</span></em></div></div>`
**When** tulosesitys muodostetaan
**Then** esityksen HTML on täsmälleen `<div style="font-family:monospace;white-space:pre-wrap"><div style="font-size:12px"><div><strong><span>C</span></strong><em><span>E</span></em></div></div></div>`

### AC8: Syötteestä saatu fonttikoko säilyy
**Given** turvallisen tuloksen ulomman sisältöelementin fonttikoko on `18px`
**When** tulosesitys muodostetaan
**Then** esityksen HTML sisältää täsmälleen yhden merkkijonon `style="font-size:18px"` eikä sisällä merkkijonoa `font-size:12px`

### AC9: Oletusfonttikoko säilyy
**Given** turvallisen tuloksen ulomman sisältöelementin fonttikoko on `12px`
**When** tulosesitys muodostetaan
**Then** esityksen HTML sisältää täsmälleen yhden merkkijonon `style="font-size:12px"`

### AC10: Itsenäinen tekstirivi näkyy tuloksessa
**Given** tulosrivien tekstit ovat `Kertosäe`, `C |G |` ja `onpa` ja turvallisessa HTML:ssä jokainen on omassa div-elementissään
**When** tulosesitys muodostetaan
**Then** `plainText` on täsmälleen `Kertosäe\nC |G |\nonpa` ja HTML:ssä merkkijono `<span>Kertosäe</span>` esiintyy täsmälleen kerran

### AC11: Epäilyttävä sointu näytetään täsmällisenä varoituksena
**Given** varoitus on `{ code: "SUSPICIOUS_CHORD", lineIndex: 3, startIndex: 0, original: "Cfoo", output: "Dbfoo" }`
**When** tulosesitys muodostetaan
**Then** ainoa varoitusteksti on `Rivi 4, kohta 1: epäilyttävä sointu "Cfoo" muutettiin muotoon "Dbfoo".`

### AC12: Epäselvä sävelrivi näytetään täsmällisenä varoituksena
**Given** varoitus on `{ code: "AMBIGUOUS_NOTE_LINE", lineIndex: 1, content: "C D lauletaan hiljaa" }`
**When** tulosesitys muodostetaan
**Then** ainoa varoitusteksti on `Rivi 2: rivi tulkittiin tekstiksi: "C D lauletaan hiljaa".`

### AC13: Varoitukset säilyvät rivijärjestyksessä
**Given** varoitukset ovat `SUSPICIOUS_CHORD` rivillä `3` ja `AMBIGUOUS_NOTE_LINE` rivillä `1` tässä syötejärjestyksestä poikkeavassa järjestyksessä
**When** tulosesitys muodostetaan
**Then** varoitustekstejä on `2`, ensimmäinen alkaa `Rivi 2:` ja toinen alkaa `Rivi 4, kohta 1:`

### AC14: Varoituksia ei lisätä kopioitavaan sisältöön
**Given** tulosteksti on `Dbfoo |Ab |` ja tuloksella on yksi `SUSPICIOUS_CHORD`-varoitus
**When** tulosesitys muodostetaan
**Then** `plainText` on täsmälleen `Dbfoo |Ab |` eikä esityksen HTML tai plainText sisällä merkkijonoa `epäilyttävä sointu`

### AC15: Kopiointi kirjoittaa molemmat MIME-muodot
**Given** esityksen HTML on `<div><strong>C</strong></div>` ja plainText on `C`
**When** käyttäjä painaa `Kopioi tulos`
**Then** leikepöydälle tehdään täsmälleen yksi kirjoitus, jossa avaimen `text/html` arvo on `<div><strong>C</strong></div>` ja avaimen `text/plain` arvo on `C`

### AC16: Onnistunut kopiointi näyttää onnistumisviestin
**Given** leikepöydälle kirjoittaminen valmistuu onnistuneesti
**When** käyttäjä painaa `Kopioi tulos`
**Then** status-elementin tekstisisältö on täsmälleen `Tulos kopioitu` ja sen `role` on `status`

### AC17: Hylätty leikepöytäkirjoitus näyttää virheen
**Given** leikepöydälle kirjoittaminen hylätään virheellä
**When** käyttäjä painaa `Kopioi tulos`
**Then** status-elementin tekstisisältö on täsmälleen `Tuloksen kopiointi epäonnistui`, sen `role` on `alert` eikä käyttöliittymä sisällä tekstiä `Tulos kopioitu`

### AC18: Puuttuva leikepöytärajapinta näyttää virheen
**Given** selaimessa ei ole käytettävissä Clipboard API:a
**When** käyttäjä painaa `Kopioi tulos`
**Then** status-elementin tekstisisältö on täsmälleen `Tuloksen kopiointi epäonnistui`, sen `role` on `alert` eikä leikepöytäkirjoitusta yritetä

### AC19: Kopiointivirhe ei poista tulosta
**Given** näkyvän tuloksen plainText on `C |G |` ja leikepöytäkirjoitus epäonnistuu
**When** käyttäjä painaa `Kopioi tulos`
**Then** tulosalueen `hidden`-arvo on `false`, näkyvä plainText on edelleen `C |G |` ja kopiointipainikkeen `disabled`-arvo on `false`

### AC20: Tyhjä tulos hylätään
**Given** turvallinen HTML on tyhjä merkkijono ja tulosrivejä ei ole
**When** tulosesitys yritetään muodostaa
**Then** toiminto heittää virheen `Näytettävä tulos ei saa olla tyhjä`

### AC21: Uusi tulos korvaa aiemman tuloksen
**Given** näkyvän tuloksen plainText on `C |G |` ja uusi onnistunut tulos on `D |A |`
**When** uusi tulos näytetään
**Then** näkyvä plainText on täsmälleen `D |A |`, HTML ei sisällä merkkijonoa `C |G |` ja aiemmat varoitukset on korvattu uuden tuloksen varoituksilla

### AC22: Käsittelyvirhe poistaa vanhan tuloksen käytöstä
**Given** tulosalueella näkyy tulos `C |G |`
**When** seuraava käsittely päättyy virheeseen `Valitse lähtösävellaji`
**Then** tulosalueen `hidden`-arvo on `true`, kopiointipainikkeen `disabled`-arvo on `true` ja virhealueen tekstisisältö on `Valitse lähtösävellaji`

### AC23: Nolla askelta tuottaa näkyvän ja kopioitavan tuloksen
**Given** askelmäärä on `0` ja käsitellyn tuloksen plainText on `C |G |`
**When** käsittely valmistuu onnistuneesti
**Then** tulosalueen `hidden`-arvo on `false`, näkyvä plainText on `C |G |` ja kopiointipainikkeen `disabled`-arvo on `false`

### AC24: Tiedostolatausta ei tarjota ensimmäisessä versiossa
**Given** onnistunut tulos on näkyvissä
**When** tulosalue muodostetaan
**Then** alueella on täsmälleen yksi tulostoimintopainike tekstillä `Kopioi tulos` eikä alueella ole `download`-attribuutilla varustettua elementtiä

### AC25: Pienellä kirjoitettu sointu näytetään täsmällisenä varoituksena
**Given** varoitus on `{ code: "LOWERCASE_CHORD", lineIndex: 2, startIndex: 3, original: "am" }`
**When** tulosesitys muodostetaan
**Then** ainoa varoitusteksti on `Rivi 3, kohta 4: mahdollinen sointu "am" alkaa pienellä kirjaimella eikä sitä muutettu.`

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää tulosesityksen, leikepöytäsisällön ja käyttöliittymän tulostilan tyypit. |
| `src/logic/createResultPresentation.ts` | Lisää HTML-kuori, plainText-muodostus ja varoitusten järjestäminen sekä tekstittäminen. |
| `src/logic/createResultPresentation.test.ts` | Lisää HTML:n, rivinvaihtojen, fonttikoon, varoitusten ja tyhjän tuloksen testit. |
| `src/ui/copyResultToClipboard.ts` | Lisää kahden MIME-muodon leikepöytäkirjoitus rajapinnan kautta. |
| `src/ui/copyResultToClipboard.test.ts` | Lisää onnistuneen, hylätyn ja puuttuvan leikepöytärajapinnan testit. |
| `src/ui/ui.ts` | Lisää tulosalue, varoituslista, kopiointipainike, tilaviestit ja tulostilan päivitys. |
| `src/ui/ui.test.ts` | Lisää tuloksen näyttämisen, korvaamisen, piilottamisen, nolla-askeleen ja saavutettavuustilojen testit. |
| `style.css` | Lisää tulosalueen, varoitusten ja tilaviestien tyylit sekä tasalevyinen pre-wrap-esitys. |

## Risk

- What could break: Clipboard API vaatii selaimelta suojatun ympäristön ja
  käyttäjän käynnistämän toiminnon. Puuttuva oikeus käsitellään näkyvänä
  kopiointivirheenä.
- What could break: Kohdeohjelma voi jättää `text/html`-muodon huomioimatta
  ja käyttää `text/plain`-muotoa. Tällöin sisältö ja rivit säilyvät mutta
  lihavointi ja kursivointi eivät.
- What could break: Kohdeohjelma voi korvata kopioidun tasalevyisen fontin,
  jolloin välilyönteihin perustuva kohdistus voi näyttää erilaiselta.
- What could break: Varoitusten lisääminen kopioitavaan DOM-solmuun voisi
  vahingossa kopioida ne musiikkitekstin mukana. Leikepöytäsisältö tuotetaan
  tulosmallista, ei koko tulosalueen `textContent`-arvosta.
- What could break: Vanhan tuloksen jättäminen näkyviin uuden käsittelyvirheen
  jälkeen voisi johtaa väärän version kopioimiseen.
- Rollback: Piilota tulos- ja kopiointialue ja jätä käsitelty tulos vain
  sovelluksen sisäiseen malliin.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| käyttöliittymä | AC1 alkutila | Ei käsittelyä | Alustetaan | Tulos hidden, kopiointi disabled |
| käyttöliittymä | AC2 tulos näkyviin | Täsmällinen 12px HTML | Näytetään | Alue näkyy, otsikko ja HTML täsmäävät, painike käytössä |
| `createResultPresentation` | AC3 HTML-kuori | Turvallinen C-rivin HTML | Muodostetaan | Täsmällinen monospace/pre-wrap-kuori ja sisäinen HTML |
| `createResultPresentation` | AC4 rivinvaihto | `C \|G \|`, `onpa ihanaa` | Muodostetaan | `C \|G \|\nonpa ihanaa` |
| `createResultPresentation` | AC5 tyhjä rivi | C-rivi, tyhjä, Am-rivi | Muodostetaan | `C \|G \|\n\nAm \|F \|` |
| `createResultPresentation` | AC6 ei loppurivinvaihtoa | Yksi `C \|G \|` | Muodostetaan | Pituus 6, viimeinen `\|` |
| `createResultPresentation` | AC7 muotoilut | Strong C ja em E | Muodostetaan | Täsmällinen strong/em HTML kuoressa |
| `createResultPresentation` | AC8 18px | Fonttikoko 18px | Muodostetaan | Yksi `font-size:18px`, ei 12px |
| `createResultPresentation` | AC9 12px | Fonttikoko 12px | Muodostetaan | Yksi `font-size:12px` |
| `createResultPresentation` | AC10 itsenäinen teksti | Kertosäe, C-rivi, onpa | Muodostetaan | `Kertosäe\nC \|G \|\nonpa`; Kertosäe kerran HTML:ssä |
| `createResultPresentation` | AC11 sointuvaroitus | SUSPICIOUS_CHORD rivillä 3, kohdassa 0 | Muodostetaan | Täsmällinen käyttäjävaroitus riville 4, kohtaan 1 |
| `createResultPresentation` | AC12 rivivaroitus | AMBIGUOUS_NOTE_LINE rivillä 1 | Muodostetaan | Täsmällinen käyttäjävaroitus riville 2 |
| `createResultPresentation` | AC13 varoitusjärjestys | Varoitukset riveillä 3 ja 1 | Muodostetaan | Kaksi varoitusta järjestyksessä rivi 2, rivi 4 |
| `createResultPresentation` | AC14 varoituksia ei kopioida | Dbfoo-rivi ja varoitus | Muodostetaan | PlainText `Dbfoo \|Ab \|`; ei varoitustekstiä HTML:ssä tai tekstissä |
| `copyResultToClipboard` | AC15 MIME-muodot | HTML C ja plain C | Kopioidaan | Yksi kirjoitus täsmällisillä text/html- ja text/plain-arvoilla |
| käyttöliittymä | AC16 kopiointi onnistuu | Kirjoitus ratkaistaan | Painetaan | `Tulos kopioitu`, role status |
| käyttöliittymä | AC17 kirjoitus hylätään | Kirjoitus reject | Painetaan | `Tuloksen kopiointi epäonnistui`, role alert, ei onnistumisviestiä |
| käyttöliittymä | AC18 API puuttuu | Ei Clipboard API:a | Painetaan | Sama virhe, ei kirjoitusyritystä |
| käyttöliittymä | AC19 tulos säilyy virheessä | Näkyvä C-rivi, kirjoitus epäonnistuu | Painetaan | Alue näkyy, C-rivi säilyy, painike käytössä |
| `createResultPresentation` | AC20 tyhjä tulos | Tyhjä HTML ja ei rivejä | Muodostetaan | Virhe `Näytettävä tulos ei saa olla tyhjä` |
| käyttöliittymä | AC21 tulos korvataan | Vanha C-rivi, uusi D-rivi | Näytetään uusi | Vain D-rivi ja uudet varoitukset |
| käyttöliittymä | AC22 käsittelyvirhe | Vanha C-rivi, uusi valintavirhe | Näytetään virhe | Tulos hidden, kopiointi disabled, täsmällinen virheteksti |
| käyttöliittymä | AC23 nolla askelta | 0 ja käsitelty C-rivi | Valmistuu | Tulos näkyy ja kopiointi käytössä |
| käyttöliittymä | AC24 ei latausta | Onnistunut tulos | Muodostetaan | Yksi `Kopioi tulos` -painike, ei download-elementtiä |
| `createResultPresentation` | AC25 pieni sointu | LOWERCASE_CHORD rivillä 2, kohdassa 3, token am | Muodostetaan | `Rivi 3, kohta 4: mahdollinen sointu "am" alkaa pienellä kirjaimella eikä sitä muutettu.` |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

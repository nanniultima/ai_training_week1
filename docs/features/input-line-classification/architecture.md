# Arkkitehtuuri: syötteen rivien tunnistaminen

Tämä suunnitelma koskee vain speksiä `specs/features/input-line-classification.md`. Liiketoimintalogiikka pidetään riippumattomana DOM:sta, ja käyttöliittymä vastaa vain editorin näkyvistä rivinumeroista.

## Tiedostot ja vastuut

| Tiedosto | Omistaa | Miksi tiedosto tarvitaan |
|---|---|---|
| `src/types.ts` | Rivityypin, luokitellun rivin, varoituksen ja luokittelutuloksen yhteiset tyypit. | Luokittelu ja sen käyttäjät tarvitsevat yhden tiukan, ennen toteutusta määritellyn rajapinnan. |
| `src/logic/classifyLines.ts` | Puhdas rivien luokittelu, säveltokenien tunnistus, varoitusten muodostus ja koko syötteen validointi. | Musiikkirivien tunnistus on liiketoimintalogiikkaa, joka pitää voida suorittaa ja testata ilman selainta. |
| `src/logic/classifyLines.test.ts` | AC1–AC23:n luokittelu-, säilytys-, yhdistelmä-, varoitus- ja virhetapaukset. | Luokittelun kaikki käyttäytymissäännöt tarvitsevat lähdekoodin viereiset Vitest-regressiotestit. |
| `src/ui/lineNumbers.ts` | Loogisten editoririvien numerointi ja sisäisen indeksin muunto käyttäjälle näkyväksi numeroksi. | Rivinumerointi on DOM-läheinen esitysvastuu eikä kuulu luokittelulogiikkaan. |
| `src/ui/lineNumbers.test.ts` | AC24–AC26:n loogisten rivien, visuaalisen rivityksen ja indeksimuunnoksen testit. | Rivinumeroinnin säännöt pitää todistaa erillään muun käyttöliittymän rakenteesta. |
| `src/ui/ui.ts` | Rivinumeropalstan liittäminen editorin viereen ja sen vierityksen synkronointi. | Käyttäjälle näkyvän palstan elinkaari ja DOM-kytkentä kuuluvat nykyisen käyttöliittymän omistajalle. |
| `style.css` | Editorin ja rivinumeropalstan rinnakkainen asettelu sekä palstan ei-muokattava ulkoasu. | Numeropalstan pitää näkyä editorin yhteydessä mutta pysyä muokattavan ja kopioitavan sisällön ulkopuolella. |

Muita tiedostoja ei tarvita: syöterivien irrottaminen rikastekstistä on tämän speksin edellytys, ei tässä rakennettava vastuu, eikä ominaisuus tarvitse uutta riippuvuutta, tallennusta tai verkkoyhteyttä.

## Riippuvuussuunta

```text
src/ui/ui.ts -> src/ui/lineNumbers.ts
src/logic/classifyLines.ts -> src/types.ts
```

`classifyLines.ts` ei tunne DOM:ia eikä tuo mitään `src/ui/`-kansiosta. `lineNumbers.ts` ei luokittele sisältöä. Luokiteltujen rivien alkuperäinen sisältö ja mahdollinen rikastekstistä saatu muotoilutieto kulkevat läpi muuttumattomina.

## Mitä ei rakenneta

| Ei rakenneta | Perustelu |
|---|---|
| Rikastekstin muuntamista luokittelun syöteriveiksi | Speksi vastaanottaa jo rikastekstistä irrotetut rivit. |
| Sointujen tai sävelten transponointia | Tämä ominaisuus ainoastaan luokittelee rivit; transponointi kuuluu myöhempiin spekseihin. |
| Laulunsanojen kohdistamista musiikkiriveihin | `text`-rivin suhde muihin riveihin ratkaistaan myöhemmässä kohdistusvaiheessa. |
| Muotoilun käyttämistä rivityypin tunnisteena | Speksi määrää luokittelun perustuvan tekstisisältöön, ei lihavointiin tai kursivointiin. |
| Epäselvän rivin automaattista korjaamista sävelriviksi | Epäselvä rivi säilytetään `text`-rivinä ja siitä annetaan varoitus. |
| Putkimerkkiä sisältävän tekstin heuristista uudelleenluokittelua | Putki ratkaisee speksin mukaan rivin aina `chord`-tyypiksi. |
| Sointusyntaksin validointia | Putkirivin tarkempi tulkinta kuuluu sointujen transponointispeksille. |
| Sävelten, toistomerkkien tai varoitusten näyttölogiikkaa | Speksi määrittelee luokittelutuloksen mutta ei tulosnäkymää. |
| Rivinumeroiden lisäämistä editorin sisältöön tai kopioitavaan tekstiin | Numeropalsta on erillinen, ei-muokattava käyttöliittymäelementti. |
| Automaattisen visuaalisen rivityksen numerointia | Vain käyttäjän loogiset rivinvaihdot muodostavat uusia numeroita. |
| Tallennusta, verkkopyyntöjä tai uusia kirjastoja | Luokittelu ja numerointi ovat paikallista, determinististä logiikkaa nykyisellä työkaluketjulla. |

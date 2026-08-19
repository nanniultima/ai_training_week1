# Arkkitehtuuri: transponointiasetusten valinta

Tämä suunnitelma koskee vain speksiä
`specs/features/transposition-settings.md`. Musiikillinen laskenta ja validointi
pidetään puhtaana liiketoimintalogiikkana, ja käyttöliittymä muuntaa käyttäjän
tapahtumat tämän logiikan syötteiksi sekä näyttää tuloksen.

## Tiedostot ja vastuut

| Tiedosto | Omistaa | Miksi tiedosto tarvitaan |
|---|---|---|
| `src/types.ts` | Sävellajin laadun, toonikan, enharmonisen valinnan, asetussyötteen ja diskriminoidun asetustuloksen tyypit. | Logiikka ja käyttöliittymä tarvitsevat yhden tiukan yhteisen rajapinnan ennen toteutusta. |
| `src/logic/transpositionSettings.ts` | Duuri- ja mollitoonikalistat, Tonal-pohjainen validointi ja chroma, kohdesävelkorkeuden laskenta sekä enharmonisten vaihtoehtojen ratkaisu. | Musiikilliset päätökset pitää voida testata ilman DOM:ia ja näkyvät nimet pitää pitää speksin hallinnassa. |
| `src/logic/transpositionSettings.test.ts` | AC1–AC2:n listatestit, AC4–AC5:n matriisit sekä AC6–AC9, AC11–AC18 ja AC21–AC22:n logiikkatestit. | Julkisen liiketoimintalogiikan onnistumis-, matriisi-, raja- ja virhetapaukset tarvitsevat lähdekoodin viereiset Vitest-testit. |
| `src/ui/ui.ts` | Moodin, lähtötoonikan ja askeleen muutosten yhteinen päivitys, automaattinen kohde-esikatselu, enharmonisen valinnan näyttäminen ja käyttöliittymävirheet. | DOM-tapahtumat ja käyttäjälle näkyvä tila kuuluvat käyttöliittymärajalle. |
| `src/ui/ui.test.ts` | AC1–AC3, AC6, AC10, AC19–AC20 ja AC23–AC25 oikeilla DOM-elementeillä ja tapahtumilla. | Käyttäjän valintojen, näkyvien listojen, esikatselun ja virheiden käyttäytyminen pitää todistaa Happy DOMissa. |
| `package.json` | `@tonaljs/note`-tuotantoriippuvuus, Happy DOMin kehitysriippuvuus sekä testi- ja lint-komennot. | Laskenta tarvitsee ylläpidetyn sävelparserin ja UI-testit DOM-ympäristön. |
| `package-lock.json` | Tonalin, Happy DOMin ja niiden riippuvuuksien lukitut versiot. | Paikallisen ja CI-asennuksen pitää käyttää samoja kirjastoja. |

Uutta tuotantotiedostoa ei tarvita. Kaikki speksin vastuut kuuluvat joko
asetusten liiketoimintalogiikkaan, yhteisiin tyyppeihin tai nykyiseen
käyttöliittymään.

## Riippuvuussuunta

```text
src/ui/ui.ts -> src/logic/transpositionSettings.ts -> src/types.ts
```

`transpositionSettings.ts` ei tuo mitään `src/ui/`-kansiosta. Käyttöliittymä
antaa logiikalle raakavalinnat, ja logiikka palauttaa joko `ready`-tuloksen,
`requiresEnharmonicChoice`-tuloksen tai täsmällisen validointivirheen.

## Mitä ei rakenneta

| Ei rakenneta | Perustelu |
|---|---|
| Sointujen tai sävelten transponointia | Tämä speksi tuottaa vain validoidut transponointiasetukset. |
| Rivien luokittelua | Se kuuluu `input-line-classification`-ominaisuudelle. |
| Rikastekstin jäsentämistä, kohdistamista tai kopiointia | Nämä on rajattu myöhempiin ominaisuuksiin. |
| Automaattista lähtösävellajin tunnistusta | Käyttäjä valitsee lähtösävellajin speksin listasta. |
| Kaksoisylennyksiä tai kaksoisalennuksia | Speksin toonikalistat rajaavat ne ensimmäisen version ulkopuolelle. |
| Jatkuvasti näkyvää yleistä sharp/flat-valintaa | Lisävalinta näytetään vain kahden käytännöllisen kohdenimen tapauksessa. |
| Asetusten tallennusta | Speksi ei vaadi asetusten säilymistä sivun latausten välillä. |
| Verkkopyyntöjä tai koko `tonal`-koontipakettia | Käytetään paikallisesti vain pienempää `@tonaljs/note`-moduulia. |
| Tuntemattoman `getAvailableTonics`-moodin virhekäyttäytymistä | Nykyinen speksi määrittelee funktiolle vain tyypitetyt arvot `major` ja `minor`; uutta virhettä ei keksitä ilman omaa AC:tä. |

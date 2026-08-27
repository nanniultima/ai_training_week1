# Arkkitehtuuri: transponointiasetusten valinta

**Status:** Draft

Tämä suunnitelma koskee vain speksiä
`specs/features/transposition-settings.md`. Musiikillinen laskenta ja validointi
pidetään puhtaana liiketoimintalogiikkana, ja käyttöliittymä muuntaa käyttäjän
tapahtumat tämän logiikan syötteiksi sekä näyttää tuloksen.

## Tiedostot ja vastuut

| Tiedosto | Omistaa | Miksi tiedosto tarvitaan |
|---|---|---|
| `src/types.ts` | Täsmällisen kohdetoonikan valinnan sekä validoidun step-arvon sisältävät asetussyöte- ja tulostyypit. | Logiikka ja käyttöliittymä tarvitsevat yhden tiukan yhteisen rajapinnan. |
| `src/logic/transpositionSettings.ts` | Duuri- ja mollitoonikalistat, Tonal-pohjainen validointi ja chroma, kohdesävelkorkeuden laskenta sekä enharmonisten vaihtoehtojen ratkaisu. | Musiikilliset päätökset pitää voida testata ilman DOM:ia ja näkyvät nimet pitää pitää speksin hallinnassa. |
| `src/logic/transpositionSettings.test.ts` | Lista- ja matriisitestit sekä laskennan, täsmällisen kohdevalinnan, step-arvon, moodin ja virheiden testit. | Julkisen liiketoimintalogiikan onnistumis-, raja- ja virhetapaukset tarvitsevat Vitest-testit. |
| `src/ui/ui.ts` | Moodin, lähtötoonikan ja askeleen muutosten yhteinen päivitys, automaattinen kohde-esikatselu, enharmonisen valinnan näyttäminen sekä `Transponoi`-painikkeen puuttuvien valintojen virheet. | DOM-tapahtumat ja käyttäjälle näkyvä tila kuuluvat käyttöliittymärajalle. |
| `src/ui/ui.test.ts` | Listojen, automaattisen esikatselun, täsmällisen kohdevalinnan, keskeneräisten tilojen ja painikkeen validointivirheiden DOM-testit. | Käyttäjälle näkyvä käyttäytyminen pitää todistaa Happy DOMissa. |

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
Käyttöliittymä ei viimeistele enharmonista valintaa itse, vaan antaa valitun
kohdetoonikan takaisin resolverille. Molemmat onnistuneet tulosvariantit
sisältävät validoidun step-arvon.

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
| Onnistuneen `Transponoi`-painalluksen musiikkisyötteen käsittelyä tai Enter-vahvistusta | Tämä speksi kattaa painikkeen puuttuvien valintojen virheet; onnistunut transponointi ja Enter kuuluvat myöhempään integraatioon. |

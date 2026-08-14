# Arkkitehtuuri: transponointiasetusten valinta

Tämä suunnitelma koskee vain speksiä
`specs/features/transposition-settings.md`. Tavoitteena on pitää asetusten
liiketoimintalogiikka riippumattomana selaimesta ja käyttöliittymä ohuena.

## Tiedostot ja vastuut

| Tiedosto | Omistaa | Miksi tiedosto tarvitaan |
|---|---|---|
| `package.json` | `happy-dom`-kehitysriippuvuus. | UI:n muutoksia ja tapahtumia ei voi todistaa nykyisillä pelkillä HTML-merkkijonotesteillä. |
| `package-lock.json` | Happy DOMin lukittu versio ja transitiiviset riippuvuudet. | Testiympäristön asennuksen pitää olla toistettava paikallisesti ja CI:ssä. |
| `src/types.ts` | Sävellajin laadun, toonikan, enharmonisen valinnan, asetussyötteen ja diskriminoidun asetustuloksen tyypit. | Yhteiset tyypit määritellään ennen toteutusta ja niitä käyttävät sekä logiikka että käyttöliittymä. |
| `src/logic/transpositionSettings.ts` | Duuri- ja mollilistat, `getAvailableTonics`, syötteen validointi, H→B-normalisointi, kohdesävelkorkeuden laskenta ja `resolveTranspositionSettings`. | Kaikki musiikillinen päätöksenteko pitää voida testata ilman DOM:ia. |
| `src/logic/transpositionSettings.test.ts` | AC1–AC2, AC4–AC7, AC9–AC16 ja AC19–AC21. | Logiikan onnistumis-, raja- ja virhetapaukset tarvitsevat oman lähdekoodin viereisen Vitest-tiedoston. |
| `src/ui/ui.ts` | Asetuskenttien renderöinti, moodin vaihdon vaikutus toonikalistaan, yhteinen Enter/painike-vahvistus, enharmonisen valinnan näyttäminen ja käyttöliittymävirheet. | Käyttäjän tapahtumat ja näkyvä tila kuuluvat käyttöliittymärajalle, eivät musiikkilogiikkaan. |
| `src/ui/ui.test.ts` | AC3, AC8, AC17 ja AC18 Happy DOM -ympäristössä sekä olemassa olevan käyttöliittymärungon regressiotestit. | Oikeat DOM-elementit ja tapahtumat todistavat kenttien tyhjentymisen, valinnan sulkeutumisen ja näkyvät virheet. |

Uutta tuotantotiedostoa ei lisätä, koska jokainen tarvittava vastuu kuuluu
yksiselitteisesti johonkin yllä olevista lähdetiedostoista. `happy-dom` on
vain testien kehitysriippuvuus eikä päädy selaimeen toimitettavaan sovellukseen.

## Riippuvuussuunta

```text
src/ui/ui.ts
  -> src/logic/transpositionSettings.ts
  -> src/types.ts
```

`transpositionSettings.ts` ei tuo mitään `src/ui/`-kansiosta. Käyttöliittymä
antaa logiikalle raakavalinnat, ja logiikka palauttaa joko `ready`-tuloksen,
`requiresEnharmonicChoice`-tuloksen tai täsmällisen validointivirheen.

Duuri- ja mollitoonikalistat sekä enharmoniset vaihtoehdot ovat muuttumattomia
sovelluksen sisäisiä vakioita. Tähän ominaisuuteen ei tarvita tietokantaa,
verkkopyyntöä tai ulkoista musiikkikirjastoa.

## Mitä ei rakenneta

| Ei rakenneta | Perustelu |
|---|---|
| Sointujen tai sävelten transponointia | Tämä speksi tuottaa vain validoidut asetukset; musiikin muuttaminen kuuluu muihin spekseihin. |
| Rivien tunnistamista | Se on speksi 1:n vastuulla eikä vaikuta asetusten ratkaisemiseen. |
| Rikastekstin jäsentämistä, kohdistamista tai kopiointia | Nämä on rajattu myöhempiin toteutusvaiheisiin `indox.md`:ssä. |
| Automaattista lähtösävellajin tunnistusta | Käyttäjä valitsee lähtösävellajin listasta. |
| Jatkuvasti näkyvää sharp/flat-valintaa | Lisävalinta näytetään vain `requiresEnharmonicChoice`-tuloksesta. |
| Kaksoisylennyksiä tai kaksoisalennuksia sisältäviä sävellajeja | Speksin listat rajaavat ne ensimmäisen version ulkopuolelle. |
| Asetusten tallennusta | Speksi ei vaadi asetusten säilymistä sivun latausten välillä. |
| Musiikkilogiikan npm-riippuvuutta | Toonikalistat ja 12 sävelkorkeuden kierto ovat pieniä, staattisia ja suoraan testattavia; `happy-dom` tarvitaan vain UI-testien ympäristöksi. |

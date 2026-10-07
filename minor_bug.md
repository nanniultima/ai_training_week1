# Minor bugs ja refaktorointiehdotukset

Kirjattu 7.10.2026 speksikohtaisen koodikatsauksen perusteella.
Alla olevia muutoksia ei ole toteutettu. Käyttäytymismuutokset ja tyyppirajapintojen
muutokset speksataan ja hyväksytään ennen toteutusta. Refaktoroinnit säilyttävät
nykyiset hyväksytyt toimintaperiaatteet ja tehdään nykyisten testien turvaamina.

## Ensisijaiset toiminnalliset havainnot

- [ ] **Sama laatuvalinta tyhjentää lähtösävellajin.** Valitse Duuri ja C,
  paina Duuri-valintaa uudelleen: source-key tyhjenee, vaikka laatu ei vaihdu.
  Vahvistettu erillisessä DOM-kokeessa. Sido nollaus todelliseen laadun vaihtoon,
  esimerkiksi change-tapahtumaan, ja lisää säilymisen hyväksymiskriteeri.
  Speksi: transposition-settings. Tiedostot: src/ui/ui.ts, src/ui/ui.test.ts.
- [ ] **Vanhan kopioinnin valmistuminen päivittää uuden tuloksen tilan.**
  Aloita D |A | -tuloksen kopiointi, transponoi uusi D |G | ennen kirjoituksen
  valmistumista. Vanhan kirjoituksen onnistuminen näyttää Tulos kopioitu uuden
  tuloksen yhteydessä, vaikka kopioitu sisältö oli D |A |. Vahvistettu
  erillisessä DOM-kokeessa simuloidulla leikepöydällä. Sido pyyntö tuloksen
  versioon ja määrittele myöhäisen onnistumisen/virheen käsittely sekä testit.
  Speksi: result-and-copy. Tiedostot: src/ui/ui.ts, src/ui/ui.test.ts.

## 1. Syötteen rivien tunnistaminen

- [ ] Analysoi rivin tokenit kerran ja käytä samoja tuloksia luokitteluun
  sekä varoituksiin. Nykyinen classifyLines jäsentää samoja sävelryhmiä
  toistuvasti. Säilytä cafe-poikkeus, putken etusija ja tiukka kielioppi.
- [ ] Erota luokittelujärjestys nimettyihin vaiheisiin sisäkkäisen ehdon sijaan.
  Tiedosto: src/logic/classifyLines.ts.

## 2. Transponointiasetusten valinta

- [ ] Kokoa major/minor-kohtaiset listat ja kohdevaihtoehdot selkeäksi
  asetusrakenteeksi; vältä laskentasäännön tarpeetonta uudelleenkirjoitusta.
  Tiedosto: src/logic/transpositionSettings.ts.
- [ ] Käsittele yllä oleva saman laatuvalinnan uudelleenpainamisen bugi.

## 3. Sointujen transponointi

- [ ] Muodosta yksi alkuperäinen tokenimalli ja johda siitä muunnettu content,
  segmentit, source/aligned-alueet ja varoitukset. Nyt contentin ja semanttisten
  tokenien tokenisointi ovat erilliset, ja sointukielioppi toistuu regexeissä.
- [ ] Keskitä sointusanaston jäsennys ja nimeä soinnun sävelkorkeuden muunnos
  niin, että se erottuu rekisteriä käsittelevästä transposeNote-funktiosta.
  Tiedostot: src/logic/transposeChordLine.ts, src/logic/transposeChord.ts.

## 4. Sävelten transponointi

- [ ] Käytä registerAt-toiminnossa yhteistä formattingToRegister-sääntöä.
- [ ] Keskitä yhteiset sharp/flat-nimitaulukot ja kirjoitusasun valinta.
  Säilytä sointujen ja sävelten erilaiset hyväksytyt lähtönimet sekä
  nolla-askeleen poikkeukset; älä yhdistä niiden kielioppeja.
- [ ] Jaa pitkä note-rivin tokenisointisilmukka nimettyihin apufunktioihin.
  Tiedostot: src/logic/transposeNoteLine.ts, src/logic/transposeNote.ts,
  src/logic/transposeChord.ts, src/logic/noteRegisterFormatting.ts.

## 5. Rikastekstin muotoilut

- [ ] Tee yhteiset testatut apufunktiot muotoilujaksojen leikkaamiseen,
  yhdistämiseen ja merkkikohtaisen muotoilun muodostamiseen.
- [ ] Erota yhteiset chord/note/text-renderöintisäännöt kohdistetun ja
  kohdistamattoman sisällön nykyisistä käsittelyreiteistä.
  Tiedostot: src/logic/formatMusicResult.ts ja muotoilua käsittelevät
  transponointi- sekä kohdistusmoduulit.

## 6. Kohdistuksen säilyttäminen

- [ ] Jaa toteutus selkeisiin vaiheisiin: yksiköt, sarakkeet, tulosalueet,
  musiikkisisältö ja laulutekstin muutokset.
- [ ] Esilaske yksiköt ja ankkurien hakutaulut. Silmukoiden sisällä tehdään
  toistuvia alignmentParts/nonAnchorParts/filter/find/indexOf-hakuja.
  Mahdollinen nopeushyöty mitataan pitkällä syötteellä ennen optimointiväitettä.
- [ ] Poista groupAlignedLines-funktion saavuttamaton musiikittoman syötteen
  tarkistus ja toistettu tulostyyppitarkistus. Säilytä validointijärjestys
  sarkain → tulosvastaavuus → lähdealueet.
  Tiedostot: src/logic/alignLineGroup.ts, src/logic/groupAlignedLines.ts.

## 7. Tuloksen näyttäminen ja kopiointi

- [ ] Erota initializeUi:n HTML-runko, elementtien sitominen, asetusten luku,
  esikatselu, tuloksen näyttäminen ja virhe-/kopiointitilat pienemmiksi vastuiksi.
- [ ] Käsittele yllä oleva keskeneräisen kopioinnin ja uuden tuloksen kilpailutilanne.
  Tiedosto: src/ui/ui.ts.

## 8. Liitetyn rikastekstin muotoilut

- [ ] Erota CSS-arvojen tulkinta DOM-puun läpikäynnistä puhtaiksi apufunktioiksi.
  Testaa numeeriset rajat suoraan ilman Happy DOMin CSS-arvojen simulointia;
  säilytä DOM- ja integraatiotestit. Tiedosto: src/logic/parseRichText.ts.

## 9. Google Docs -kopion kohdistus

- [ ] Keskitä testien toistuva FakeClipboardItem- ja adapterivalmistelu
  testiapuun. Tuotantomoduuli on pieni ja vastuu selkeä; laajaa
  uudelleenjärjestelyä ei tarvita. Tiedosto: src/ui/copyResultToClipboard.test.ts.

## 10. Transponoinnin muutosspeksi ja yhteiset tyypit

- [ ] Kuvaa preserveSourceFormatting yhdessä yhteisessä mallityypissä
  koordinaattorin ja formatterin erillisten paikallisten määrittelyjen sijaan.
- [ ] Arvioi tokens/sourceRange/sourceText/formatting-kenttien muuttamista
  tavallisiksi, selvästi tyypitetyiksi kentiksi. Ei-enumeratiiviset kentät
  katoavat levityksessä ja JSON-käsittelyssä, joten muutos tarvitsee
  tyyppisopimusten ja testien hallitun päivityksen.
  Tiedostot: src/types.ts sekä mallia tuottavat ja kuluttavat moduulit.

## 11. Editorin rivinumerointi

- [ ] Erota numeropalstan päivitys omaksi updateLineNumbers-toiminnoksi.
- [ ] Mittaa pitkän syötteen HTML-jäsennyksen kustannus kirjoitustapahtumassa.
  Harkitse rivimäärän suoraa käyttöä tai optimointia vasta mittauksen jälkeen;
  säilytä sama rivimalli kuin transponoinnissa. Tiedosto: src/ui/ui.ts.

## Suositeltu etenemisjärjestys

1. Kaksi käyttöliittymän toiminnallista havaintoa hyväksymiskriteereineen.
2. Yhteiset muotoilu- ja kirjoitusasuapufunktiot.
3. Sointurivin yhtenäinen tokenimalli.
4. Kohdistuksen vaiheistus ja mahdollinen mitattu optimointi.

Katsauksen verdict: CHANGES_REQUIRED käyttöliittymän kahden vahvistetun
reunatilanteen osalta. Muut kohdat ovat refaktorointiehdotuksia.

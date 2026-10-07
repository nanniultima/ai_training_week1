# Architecture: transposition-spec-amendments

**Status:** Done

Muutosspeksi täydentää neljää valmistuneen ominaisuuden sääntöä. Sen oma
tila seuraa toteutusvaihetta, eikä aiempien Done-speksien tilaa palauteta.
Nolla-askel, tyhjän askelkentän virhe ja sointujen tuen rajaus on päätetty.
Cafe-sanapoikkeus on päätetty: kokonainen cafe-sana on aina tekstiä.
Yksi yhteinen tulosfonttikoko määräytyy ensimmäisestä sisältömerkistä myös
nolla-askeleella. Alkuvälit ja tyhjät rivit ohitetaan vain koon valinnassa;
niiden sisältö säilyy. Avoimia käyttäytymiskysymyksiä ei ole.

- `transposeNote`: nolla-askel säilyttää nimen ja lähtörekisterin;
  H/h → B -normalisointi säilyy. Uutta rekisteriä lasketaan vain ei-nolla-askeleella.
  Lähtörekisterin kelvollisuus validoidaan myös nolla-askeleella.
- `ui.ts`: tyhjän askelkentän tulkinta ennen asetusten ratkaisua.
- `classifyLines`: cafe-poikkeuksen rajaus; `parseNoteGroup` säilyttää
  sävelryhmien kieliopin eikä sanapoikkeus kuulu sävelparseriin.
  Luokittelu ei käytä cafe-tokenia sävelryhmänä tai varoituksen perusteena;
  muut säveltokenit voivat varoittaa sekasisällöstä normaalisti.
  Sointurivin tokenisointi säilyttää cafe/Cafe/CAFE-tokenin tavallisena
  tekstinä ilman sointuvaroitusta; putken chord-etusija säilyy.
- `transposeChordSymbol`: Cb/B#/Fb/E#/H#/Hb rajataan sointujen tuen
  ulkopuolelle myös bassosävelinä; tiukka funktio hylkää merkin.
  Rivifunktio säilyttää koko tukemattoman soinnun varoituksella.
  H7 → B7 ja G/H → G/B säilyvät tuettuina myös nolla-askeleella.
- `createTranspositionResult`: nolla-askeleen reitti lisää näkyvään
  musiikkisisältöön vain sovitun sointurivin lihavoinnin ja H/B-normalisoinnin.
  Rivien välinen kohdistus ohitetaan, näkyvät tulosalueet johdetaan
  muuttumattomista nimistä ja väleistä. Muiden askelten reitti säilyy.
  `alignLineGroup(group, "preserve")` tuottaa vain rivikohtaiset luonnolliset
  tulosalueet myös monirivisille ryhmille. Valinnainen tila on tyypitetty
  `"align" | "preserve"`; oletus `"align"` säilyttää nykyisen API-käytön.

Kopioinnin ja loppuputken esimerkkikorjaukset eivät muuta runtime-sääntöjä.
`resolveBaseFontSize` ratkaisee yhden yhteisen koon ennen formatteria;
`formatMusicResult` tuottaa sen vain kerran yhteiseen ulkokuoreen.
Myöhemmät lähdekoot eivät tuota omia tulosattribuutteja.
Koodia tai testejä ei muuteta spec-vaiheessa.

## Versionhallinta ja rollback

Alkuperäiset Done-speksit kuvaavat aiemmin toteutettua versiota ja viittaavat
tähän muutosspeksiin. Muutosspeksi on uuden käyttäytymisen normatiivinen lähde.
TDD:ssä säilytetään nykyinen työpuu vertailupisteenä; vain tämän muutoksen
commitit perutaan tarvittaessa. Muiden keskeneräisiä töitä ei peruta.


## Toteutuksen tila 6.10.2026

AC1–AC29 käsitelty TDD:llä. 21 testitiedostoa ja 403 testiä läpäisevät;
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.
Loppuarvio APPROVED; muutosspeksi on Done. Yllä olevat spec-vaiheen
rajaukset ja työjärjestys ovat toteutushistoriaa.

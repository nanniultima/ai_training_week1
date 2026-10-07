# Test plan: transposition-spec-amendments

**Status:** Done

AC1 ja AC2 jäljittyvät muutosspeksin taulukossa nykyisiin regressiotesteihin.
AC3–AC29:n tarkat GWT-odotukset ja nimetyt testit ovat muutosspeksissä.
Niitä ei ole vielä kirjoitettu tai ajettu; spec-vaihe ei muuta testejä.

Hyväksytyistä päätöksistä lisätään TDD-vaiheessa nimetyt testit:

- AC3/AC11/AC12: Cb/B# nolla-askeleella ja tuloksen toinen nollakäsittely,
  lähtörekisterit 1–4, Cb/1 ja B#/4 muuttumattomina sekä virheelliset
  rekisterit 0, 5 ja 1.5. H/h/Hb/H# → B/B/Bb/B# samalla lähtörekisterillä.
  Ei-nolla-askeleiden rekisterirajojen nykyiset testit säilytetään.
- AC4–AC7: monirivisen kohdistuksen ohitus, alkuperäiset sävelnimien
  kirjainkoot ja neljä lähdemuotoilua; sointujen H/B-normalisointi ja
  sovitun lihavoinnin lisääminen. Sisältöä ei muuteta muilta osin.
- AC8–AC10: tyhjän askelkentän esikatselu, tarkka virheviesti
  `Anna puolisävelaskelten määrä`, vanhan tuloksen poistaminen ja
  eksplisiittisen nollan onnistuminen. Moodin ja toonikan virheet
  testataan nykyisessä validointijärjestyksessä.
- AC13/AC14: kuusi tukematonta enharmonista nimeä perus- ja bassosävelenä,
  tuetun päätteellisen soinnun hylkäys, nolla-/plus-/miinusaskel,
  rivin täsmällinen SUSPICIOUS_CHORD-varoitus ja muiden sointujen transponointi.
- AC15–AC19: cafe/Cafe/CAFE yksin, muiden säveltokenien joukossa ja
  putkirivillä; musiikittoman syötteen virhe, sekasisällön täsmällinen varoitus
  ja erillisten c a f e -sävelten normaali transponointi.
- AC20–AC23: yksi yhteinen 18 px koko myös nolla-askeleella, myöhemmän
  24 px koon ohitus, ensimmäisen koon puuttuessa 12 px oletus sekä
  määräävän merkin virheellisen koon hylkäys. Myöhempää virhekokoa ei validoida.
- AC24/AC27: ensimmäinen sisältömerkki ratkaisee 24 px / 18.5 px koon,
  alkuvälilyöntien 18 px ohitetaan, kaikki alku-/loppuvälit sekä alun tyhjä
  rivi säilyvät sekä plainTextissä että näkyvässä HTML:ssä.
- AC25: nollan sointulihavointi ei poista lähdekursivointia.
- AC26: tyhjä ja tuntematon sävelnimi hylätään myös nolla-askeleella.
- AC28/AC29: preserve-tilan täsmälliset rivisisällöt ja alueet, syötteen
  muuttumattomuus, sama palautustyyppi sekä musiikittoman ryhmän virhe.

## TDD ja regressiot

29/29 AC:llä on GWT-odotus ja nimetty testi speksin testimatriisissa.
AC1 ja AC2 ovat aiempien regressioiden dokumenttikorjauksia; AC3–AC29
toteutetaan järjestyksessä yksi AC kerrallaan. Nykyisen speksin vastaiset
nollatestien odotukset päivitetään muutosspeksistä ennen tuotantokoodia.
RED vahvistetaan käyttäytymispuutteesta, ei väärästä importista.
GREEN ajaa koko sarjan; valmiiksi vihreään testiin ei rakenneta keinotekoista vikaa.

Julkisten funktioiden virheet: transposeNote AC11/AC26, transposeChordSymbol
AC13, classifyLines AC17 ja preserve-tilan alignLineGroup AC29.
Fonttivirhe on AC22 ja UI:n puuttuvan askeleen virhe AC9.
Nykyiset ei-nolla-askeleiden parseri-, rekisteriraja-, sointupääte-,
transponointi-, ryhmittely- ja kohdistustestit ajetaan regressioina.
Kahden peräkkäisen punaisen kierroksen jälkeen pysähdytään AGENTS.md:n mukaan.
Lopputarkistukset ovat lint, kaikki testit, diff-tarkistus ja AC-kohtainen review.


## Toteutuksen tila 6.10.2026

AC1–AC29 käsitelty TDD:llä. 21 testitiedostoa ja 403 testiä läpäisevät;
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.
Loppuarvio APPROVED; muutosspeksi on Done. Yllä olevat spec-vaiheen
rajaukset ja työjärjestys ovat toteutushistoriaa.

# Tasks: transposition-spec-amendments

**Status:** Done

- [x] Research: katsauksen havainnot, nykyiset speksit ja tilasiirtymäsäännöt.
- [x] Korjaa result-and-copy AC51:n loppuputken välilyöntiodotus.
- [x] Korjaa google-docs-copy-alignment AC1:n olematon päättävä välilyönti.
- [x] Kirjaa nykyisen loppuputkiregression jäljitettävyys.
- [x] Nolla-askel: vain sovittu sointurivin lihavointi ja H/B-normalisointi;
  sävelnimet, rekisterit ja kohdistusvälit säilyvät.
- [x] Tyhjä askelkenttä on virhe; eksplisiittinen 0 hyväksytään.
- [x] Cb/B#/Fb/E#/H#/Hb eivät kuulu sointujen tuettuun sanastoon.
- [x] Cafe on kokonaisena sanana aina tekstiä kirjainkoosta riippumatta,
  myös muiden tokenien joukossa ja sointurivillä. AC15–AC19 lisätty.
- [x] Yksi yhteinen tulosfonttikoko ensimmäisen merkin koosta myös nolla-askeleella.
- [x] Alkuvälit eivät määritä kokoa, mutta säilyvät sisällössä.
- [x] Kirjoita päätösten täsmälliset GWT-kriteerit ja nimetyt testit: 29/29.
- [x] Täydennä tuotanto- ja testitiedostojen muutoslista.
- [x] Täsmennä alkuperäisten speksien tulevat säännöt muutosspeksiviitteellä.
- [x] Tarkista ristiriidattomuus, readiness ja spec review: APPROVED.
- [x] Siirrä muutosspeksi Ready for implementation -tilaan vasta täydellisenä.

## Toteutus

- [x] Käyttäjän erillinen hyväksyntä koodi- ja testimuutoksille.
- [x] Säilytä nykyisen työpuun vertailupiste ennen TDD:tä ja merkitse In Progress.
- [x] Tarkista AC1/AC2:n nykyiset regressiot; jatka AC3–AC29 järjestyksessä.
- [x] Päivitä vanhojen nollatestien odotukset hyväksytystä muutosspeksistä
  ennen tuotantokoodin muuttamista. Älä muuta lukittua testiä koodin mukaiseksi.
- [x] Tee jokainen puuttuva käyttäytyminen RED–GREEN–REFACTOR-kierroksena.
- [x] Aja lint, kaikki testit ja diff-tarkistus; tee AC-kohtainen loppuarvio.
- [x] Merkitse Done vasta toteutuksen ja kaikkien tarkistusten valmistuttua.

Käyttäjä hyväksyi spec-vaiheen jälkeen TDD:n. Yleisohjeiden muutokset,
muiden katsauksessa löytyneiden virheiden korjaukset ja commit tehdään erikseen.

## TDD-kierros 6.10.2026

Vertailupiste: C:\Users\nanni\AppData\Local\Temp\amendments-tdd-20261006-151255.
Käyttäjä pyysi käymään muutosspeksin TDD:llä läpi; 29 AC:tä käsiteltiin järjestyksessä.

| AC | Todistus ja lopputulos |
|---|---|
| AC1–AC2 | Nykyiset loppuputki- ja NBSP-regressiot läpäisivät. |
| AC3 | RED: c isontui, Cb/B# muuttivat rekisteriä. GREEN: validoitu nolla-askel säilyttää nimen ja rekisterin, H-normalisointi säilyy. |
| AC4 | RED: sävelrivin kirjainkoko muuttui. GREEN: lähdenimet säilyvät ja nollaputki käyttää preserve-tilaa. Vanhat nollaodotukset päivitettiin hyväksytystä speksistä. |
| AC5–AC7 | Uudet sointunimien, sointulihavoinnin ja neljän sävelmuotoilun testit läpäisivät. |
| AC8 | RED: tyhjä askel näytti C-duurin esikatselun. GREEN: tyhjä arvo piilottaa kohdenäytöt. |
| AC9 | RED: tyhjä kenttä ei näyttänyt virhettä. GREEN: sovittu virhe, vanha tulos tyhjennetään ja syötenäkymä näytetään. |
| AC10–AC12 | Eksplisiittinen nolla, virheelliset lähtörekisterit ja H/Hb/H#-normalisointi läpäisivät. |
| AC13 | RED: tuen ulkopuoliset sointusävelet hyväksyttiin nolla-askeleella. GREEN: tiukka funktio hylkää koko sointumerkin. |
| AC14 | RED: rivifunktio keskeytti Cb-sointuun. GREEN: sanasto rajattu; Cb säilyy suspiciousChord-tokenina ja muu rivi transponoituu. |
| AC15 | RED: Cafe/CAFE olivat sävelrivejä. GREEN: kokonainen cafe-token ohitetaan sävelryhmien ja varoitusten tunnistuksessa. |
| AC16–AC17 | Cafe-sekasisällön tekstitulkinta, täsmällinen varoitus ja musiikittoman syötteen virhe läpäisivät. |
| AC18 | RED: Cafe/CAFE saivat sointuvaroituksen. GREEN: sointurivin cafe-token säilyy tavallisena tekstinä. |
| AC19–AC24 | Sävelregressio, yhteinen fonttikoko, fonttivirheet, myöhemmän koon ohitus ja alkuvälien säilyminen läpäisivät. |
| AC25 | RED: nollan sointulihavointi poisti kursivoinnin. GREEN: vain nollan chord-esitykselle sisäinen preserveSourceFormatting-signaali, formatteri säilyttää lähdekursivoinnin merkkikohtaisesti. |
| AC26–AC27 | Virheellisen sävelnimen validointi ja alun tyhjän rivin sekä 18.5 px koon säilyminen läpäisivät. |
| AC28–AC29 | Preserve-tilan täsmälliset alueet, sisältö, lähdemetadata, muuttumattomuus, API-tyyppi ja musiikittoman suoran kutsun virhe läpäisivät. |

AC4:n ensimmäinen koko sarjan ajo löysi kaksi vielä vanhan version mukaista
AC56:n nollaodotusta. Ne päivitettiin jo hyväksytyn muuttumattomuussäännön
mukaan; ei-nolla-askeleiden odotukset säilytettiin. Seuraava koko ajo oli vihreä.
AC28:n parametrityyppitarkistus korjattiin oletusarvoista parametria vastaavaksi
funktiotyyppitarkistukseksi; julkisen API:n hyväksytyt arvot eivät muuttuneet.

REFACTOR: purettu transposeNote-helperin tarpeeton normalisoidun nimen palautus.
Uusia testejä tai toteutusta ei tehty speksin ulkopuolisille katsauksen havainnoille.

## Loppuarvio: APPROVED

Kaikki tämän kierroksen toteutus- ja testitiedostot ovat muutosspeksin Files to Modify
-listalla. Toteutusmuutokset palvelevat AC3/AC4/AC8/AC9/AC13/AC14/AC15/AC18/AC25/AC28:aa.
Muut AC:t todistettiin nykyisen toteutuksen onnistumis-, virhe- ja regressiotesteillä.
29/29 hyväksymiskriteeriä on käsitelty; 21/21 testitiedostoa ja 403/403 testiä
läpäisevät, 0 epäonnistunutta ja 0 ohitettua. Lint ja diff-tarkistus läpäisevät.
Muutosspeksi on Done. Muiden ominaisuuksien aiemmat työpuumuutokset säilyvät.
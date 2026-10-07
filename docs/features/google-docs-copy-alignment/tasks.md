# Tasks: google-docs-copy-alignment

**Status:** Done

- [x] Tarkista korjattu AC1:n esimerkki ja nykyinen toteutus.
- [x] AC1: vahvista johtavat/sisäiset NBSP-välit ja luonnollinen ASCII-sanaväli.
- [x] AC1 reunat: lisää viisi nimettyä tekstisolmun välirajatapausta.
- [x] AC2: vahvista täsmällinen plain text, MIME ja koko esityksen muuttumattomuus.
- [x] AC3: vahvista elementtien järjestys ja hierarkia sekä tekstien ja attribuuttien säilyminen.
- [x] Aja lint, kaikki testit ja diff-tarkistus.
- [x] Loppuarvio: APPROVED.

## AC-kierros 6.10.2026

Käyttäjä pyysi käymään jo Done-tilassa olevan korjatun speksin TDD:llä läpi.
AC1–AC3 tarkistettiin järjestyksessä. Puutteellinen testitodistus vahvistettiin
ennen tuotantokoodin mahdollista muutosta; kaikki lisätyt tarkistukset
läpäisivät nykyisellä toteutuksella. Keinotekoista RED-vaihetta ei tehty.

Tällä kierroksella muutettiin vain kopioinnin testejä ja tämän speksin
katsaus-/suunnitelmadokumentteja. copyResultToClipboard.ts säilyi ennallaan.
Julkisen funktion aiemmat virhetestit läpäisevät.

Lopputarkistus: 21 testitiedostoa ja 408 onnistunutta testiä,
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.
Spec review: APPROVED. Speksin Done-tila säilyy; paluusiirtymää ei tehty.

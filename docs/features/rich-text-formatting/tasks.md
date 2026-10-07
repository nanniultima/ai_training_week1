# Rikastekstin muotoilu — tehtävät

## TDD-järjestys

- [ ] Muuta tila `Ready for implementation` → `In Progress`.
- [ ] AC1–AC11: DOM-parseri, rivit, segmentit ja fonttikoon luku.
- [ ] AC12–AC14: rekisterimuunnokset ja validointi.
- [ ] AC15–AC20: sisäiset note-, chord- ja tekstiformatterit.
- [ ] AC21–AC23: chord/note-tulosmallien lähdemuotoilut.
- [ ] AC24–AC31: rivit, perusfonttikoko ja enkoodaus.
- [ ] AC32–AC38: sanitointi, attribuutit, tyhjä syöte ja parserin rajaus.
- [ ] Aja lint, kaikki testit ja `git diff --check`.
- [ ] Review: vertaa diffiä AC1–AC38:ään; merkitse `Done` vasta APPROVED-tuloksella.

Jokaisessa AC:ssä kirjoita ensin vain epäonnistuva testi, varmista oikea RED,
tee pienin GREEN ja refaktoroi. Kahden väärästä syystä punaisen kierroksen
jälkeen pysähdy.

## Sallitut toteutustiedostot

Vain speksin Files to Modify -taulukon yksitoista tiedostoa.

- AC39: normalisoi editorin sitovat välilyönnit ASCII-välilyönneiksi.

## AC18/AC20:n välimerkkiregressio 7.10.2026

RED vahvistettiin koko putkessa syötteellä (C): C, C. C-C / C |,
askelilla 0 ja 2: esimerkiksi ) ja : jäivät lihavoimatta, koska ne
kuuluivat yhdistettyyn tekstierotintokeniin.
GREEN: sointurivin tokenisointi erottaa itsenäiset musiikkimerkit,
mutta säilyttää tekstisanan sisäisen pisteen (rit.) tekstiyksikössä.
Formatterin olemassa oleva merkkikohtainen lihavointi toimii nyt kaikille
erillisille merkeille. Välilyöntejä ei lihavoida ja rit.-tekstin sisäiset
italic/plain-jaksot säilyvät. Testit tehtiin ennen tuotantomuutosta.
21 testitiedostoa, 438 onnistunutta testiä, 0 epäonnistunutta, 0 ohitettua.
Lint ja diff-tarkistus läpäisevät. Review: APPROVED.

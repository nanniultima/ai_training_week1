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

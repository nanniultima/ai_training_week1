# Tasks: pasted-rich-text-formatting

**Status:** Done

1. Muuta speksi tilaan `Ready for implementation` ja toteutuksen alussa `In Progress`.
2. AC1 RED–GREEN–REFACTOR: CSS-lihavointi.
3. AC2 RED–GREEN–REFACTOR: CSS-kursivointi.
4. AC3 RED–GREEN–REFACTOR: rajatut muut arvot.
5. AC4 RED–GREEN–REFACTOR: koko putki ja turvallinen HTML.
6. Aja lint, kaikki testit ja diff-tarkistus.
7. Muuta speksi tilaan `Done`, kun 4/4 AC:tä ja lopputarkistukset ovat valmiit.

## Korjauskierros 7.10.2026

- [x] Kirjoita numeerisen rajan ja desimaalisten arvojen regressiotestit.
- [x] Kirjoita koko putken testi: 600.5-lihavointi säilyy sävelen rekisterinä.
- [x] Vahvista RED: desimaaliset painot jäivät tavallisiksi.
- [x] Korjaa parserin kokonaislukurajoitus numeeriseksi vertailuksi:
  Number.isFinite(weight) ja weight >= 600.
- [x] Selvitä Happy DOMin tyhjä CSS-arvo desimaalipainoilla; korjaa testien
  DOM-rajapinnan simulaatio säilyttäen lukitut odotukset.
- [x] Aja lint, kaikki testit ja diff-tarkistus.
- [x] Review: APPROVED. Käyttäytymissääntö on aiempi AC1/AC3:n >=600-raja;
  uusia sointu-, kohdistus- tai rekisterisääntöjä ei lisätty.

21 testitiedostoa, 413 onnistunutta testiä, 0 epäonnistunutta ja 0 ohitettua.
Speksin Done-tila säilyy; kyseessä on sen nykyisen säännön toteutuskorjaus.

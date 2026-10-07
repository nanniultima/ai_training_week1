# Tasks: editor-line-numbering

- [x] Research ja speksi: yhteinen parseri välttää DOM-rivisääntöjen kopioinnin.
- [x] Readiness: 6/6 AC:tä, nimetyt testit, muutoslista, riskit ja rollback.
- [x] AC1 RED–GREEN: HTML-lohkojen numerointi.
- [x] AC2–AC4: br, tyhjä rivi, sisäkkäisyys ja tyhjä editori.
- [x] AC5: allowEmpty-valinta ja oletusvalidoinnin regressio.
- [x] AC6: varoituksen ja numeropalstan rivin yhtäsuuruus.
- [x] Lint, kaikki testit, diff-tarkistus ja loppuarvio.

## Loppuarvio 7.10.2026
AC1 epäonnistui oikeasta syystä ennen toteutusta: numeropalsta oli 1 eikä 1/2.
Yhteiseen parseriin perustuva GREEN korjasi puuttuvan HTML-rivinormalisoinnin.
AC2–AC6 tarkistettiin järjestyksessä; ne olivat jo vihreitä eikä keinotekoista
RED-vaihetta tehty. UI:n ja parserin korjaukset sekä testit ovat speksin muutoslistalla.
21/21 testitiedostoa ja 422/422 testiä onnistuu; 0 epäonnistunutta, 0 ohitettua.
Lint ja diff-tarkistus läpäisevät. APPROVED; speksi Done.

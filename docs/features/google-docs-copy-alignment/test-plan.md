# Test plan: google-docs-copy-alignment

**Status:** Done

| AC | Nimetty testi | Todistus |
|---|---|---|
| AC1 | `Google Docs AC1: vakauttaa vain kohdistusvälit HTML-kopioon` | Korjatun speksiesimerkin 8 johtavaa ja 2 sisäistä NBSP-väliä; päättävää väliä ei lisätä. Muistan kaikki -sanaväli pysyy ASCII-välinä. |
| AC1 reunat | `Google Docs AC1: kattaa tekstisolmun välirajan` | Yksi johtava/päättävä väli, pelkät välit, yksittäinen sanaväli, 2/3 välin jaksot ja jo olemassa oleva NBSP. |
| AC2 | `Google Docs AC2: säilyttää plain textin ja presentationin` | Plain text -Blobin täsmällinen teksti ja MIME, muokattu kopio-HTML sekä muuttumaton html/plainText/warnings-esitys. |
| AC3 | `Google Docs AC3: säilyttää HTML-kopion muotoiluelementit` | Täsmällinen elementtijärjestys, strong/em-hierarkia, tekstit ja attribuuttien muuttumattomuus. |

Kaikki nimetyt testit ovat `src/ui/copyResultToClipboard.test.ts`:ssä.
Nykyiset clipboard.write-/ClipboardItem-/reject-virhetestit ajetaan regressioina.

AC1–AC3 tarkistettiin järjestyksessä 6.10.2026. Vahvistetut ja uudet testit
olivat jo vihreitä, joten keinotekoista RED-vaihetta tai tuotantokoodin
muutosta ei tehty. Testaus koskee HTML-leikepöytäaineiston muodostamista;
Google Docsiin liittämistä ei testattu ulkoisessa palvelussa tässä kierroksessa.

Lopuksi ajetaan `npm run lint`, `npm test` ja `git diff --check`.
Viimeisin koko ajo: 21/21 testitiedostoa, 408/408 onnistunutta testiä,
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.

# Test plan: pasted-rich-text-formatting

- AC1 testaa `bold`, `bolder`, `700` sekä numeeriset `600`, `600.5` ja `700.25`.
- AC2 testaa `italic`- ja `oblique`-arvot.
- AC3 lukitsee numeerisen rajan alapuolen (`500`, `599.5`) sekä `normal`-arvon.
- AC4 ajaa liitetyn lihavoinnin ja kursivoinnin parserista transponoinnin ja
  kohdistuksen kautta turvalliseen HTML-tulokseen.

Lopuksi ajetaan `npm run lint`, `npm test` ja `git diff --check`.

## Desimaalisen font-weight-arvon regressio 7.10.2026

- `Pasted AC1/AC3: numeerinen font-weight noudattaa rajaa 600`: 599.5 ei
  lihavoi; 600, 600.5 ja 700.25 lihavoivat. Nimetty parseritesti kattaa
  täsmällisen rajan ja desimaaliset arvot.
- `Pasted AC4: säilyttää desimaalisen CSS-lihavoinnin sävelrekisterinä`:
  600.5-painoinen c transponoituu +2:lla lihavoiduksi D:ksi; painon
  style-attribuuttia ei siirretä tulokseen.

Happy DOM palauttaa desimaalisille painoille tyhjän CSS-arvon. Näissä
regressioissa CSSStyleDeclaration.getPropertyValue simuloidaan palauttamaan
syötteen numeerinen arvo; muut ominaisuudet käyttävät oikeaa DOM-rajapintaa.
Mock palautetaan jokaisen testin lopuksi. Parserin ja tulosputken odotuksia
ei muuteta toteutuksen mukaan. Testaus ei ole erillinen selainvertailu.

Lopputulos: 21/21 testitiedostoa, 413/413 onnistunutta testiä,
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.

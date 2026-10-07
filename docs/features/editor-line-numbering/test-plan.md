# Test plan: editor-line-numbering

Kuusi AC:tä ja nimettyä testiä speksin testimatriisissa. UI-testit Happy DOMissa.
AC1/AC2: div/p/br ja tyhjän rivin säilyminen. AC3: sisäkkäisyys.
AC4/AC5: tyhjät editorit, allowEmpty ja oletuskutsun tarkka virhe.
AC6: käytä oikeaa transponointia ja vertaa varoituksen numeroa palstaan.
Regressiot: lineNumbers.test.ts, nykyinen UI:n AC23/AC24, parseRichText.test.ts
ja koko transponointiputki. GREEN-vaiheen jälkeen koko sarja, lopuksi lint ja diff.

## Todistus 7.10.2026
Kaikki kuusi AC:tä ja yhdeksän parametrisoitua/erillistä korjaustestiä läpäisevät.
Koko sarja: 21 testitiedostoa, 422 onnistunutta testiä,
0 epäonnistunutta, 0 ohitettua. Lint ja diff-tarkistus läpäisevät.

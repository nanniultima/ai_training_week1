# Feature: Google Docs -kopion kohdistuksen säilyttäminen

**Status:** Done

## Problem Statement
Tulos näkyy sovelluksessa oikein, mutta Google Docs normalisoi HTML-leikepöydän
tavallisia välilyöntejä. Sointurivien johtavia ja tokenien välisiä
kohdistusvälejä katoaa, joten soinnut eivät enää osu laulutekstin sarakkeisiin.

## Proposed Change
Kopiointiadapteri muodostaa `text/html`-Blobia varten erillisen HTML-version.
Jokaisen tekstisolmun johtavat ja päättävät ASCII-välilyönnit sekä vähintään
kahden ASCII-välilyönnin jaksot muunnetaan samanpituisiksi NBSP-jaksoiksi.
Tekstisolmun sisäinen yksittäinen luonnollinen sanaväli säilyy ASCII-välinä.
`presentation.html`, näyttötulos ja `text/plain` eivät muutu.

## Acceptance Criteria

### AC1: Kohdistusvälit vakautetaan HTML-kopioon
**Given** HTML sisältää tekstisolmut `"        |G  |"` ja `"Muistan kaikki"`
**When** tulos kopioidaan
**Then** `text/html`-Blobissa ensimmäisen tekstin kahdeksan johtavaa, kaksi
sisäistä välilyöntiä ovat NBSP-merkkejä; tekstisolmu päättyy putkeen eikä
siinä ole päättävää välilyöntiä. Ensimmäisen solmun tulos on täsmälleen
`NBSP×8 + "|G" + NBSP×2 + "|"`, missä NBSP on U+00A0. Teksti
`Muistan kaikki` sisältää edelleen yhden ASCII-sanavälin

### AC2: Plain text ja alkuperäinen esitys eivät muutu
**Given** presentation sisältää plain textin `"  |G  |\nMuistan kaikki"`
**When** tulos kopioidaan
**Then** `text/plain`-Blob on täsmälleen sama merkkijono ja presentationin
`html` sekä `plainText` ovat kutsun jälkeen muuttumattomat

### AC3: Muotoilu säilyy HTML-kopiossa
**Given** HTML:ssa ovat `<strong>`- ja `<em>`-elementit
**When** kohdistusvälit vakautetaan
**Then** `text/html`-Blob sisältää edelleen samat `strong`- ja `em`-elementit

## Files to Modify
| File | Change |
|---|---|
| `src/ui/copyResultToClipboard.ts` | Leikepöydän HTML:n kohdistusvälien NBSP-muunnos. |
| `src/ui/copyResultToClipboard.test.ts` | Google Docs -yhteensopivan HTML:n, plain textin ja muotoilun testit. |

## Risk
- Kaikkien sanavälien muuntaminen estäisi normaalin rivityksen; vain reunavälit ja vähintään kahden välin jaksot muunnetaan.
- HTML-rakenne tai muotoilu voisi muuttua; AC3 lukitsee semanttiset muotoiluelementit.
- Rollback: poista kopio-HTML:n tekstisolmumuunnos ja palauta Blobin sisällöksi `presentation.html`.

## Testing Strategy (MANDATORY)
| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `copyResultToClipboard` | AC1 kohdistus | johtavat, moninkertaiset, päättävät ja luonnolliset välit | kopioidaan | täsmälliset NBSP/ASCII-merkit |
| `copyResultToClipboard` | AC2 muuttumattomuus | presentation ja plain text | kopioidaan | Blob ja syöte täsmäävät |
| `copyResultToClipboard` | AC3 muotoilu | strong ja em | kopioidaan | elementit säilyvät |

## Spec Readiness checklist
- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

## AC-katsaus 6.10.2026

Korjattu AC1 sekä AC2–AC3 käytiin läpi järjestyksessä. AC1:n viisi
tekstisolmun välirajatestiä lisättiin, AC2:n MIME-/muuttumattomuustodistus
ja AC3:n täsmällinen muotoilurakenne vahvistettiin. Kaikki tarkistukset
läpäisivät nykyisellä toteutuksella, joten tuotantokoodiin ei tehty muutoksia
eikä vihreitä testejä tehty keinotekoisesti punaisiksi.

Koko sarja: 21 testitiedostoa, 408 onnistunutta testiä,
0 epäonnistunutta ja 0 ohitettua. Lint ja diff-tarkistus läpäisevät.
Review: APPROVED. Done-tila säilyy.
Tämä todistaa paikallisen leikepöytä-HTML:n muodostuksen; ulkoista
Google Docs -liittämistä ei suoritettu tässä testikierroksessa.

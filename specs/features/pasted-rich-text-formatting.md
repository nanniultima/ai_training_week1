# Feature: Liitetyn rikastekstin muotoilujen säilyttäminen

**Status:** Done

## Problem Statement
Valmiiksi muotoiltu teksti käyttää usein `strong`/`em`-tagien sijasta
inline-CSS:n `font-weight`- ja `font-style`-ominaisuuksia. Parseri ohittaa ne,
joten lihavointi ja kursivointi katoavat transponoidusta tuloksesta.

## Proposed Change
`parseRichText` lukee tagien lisäksi inline-tyylin. Lihaviksi tulkitaan
`font-weight: bold`, `bolder` ja numeeriset arvot vähintään `600`.
Kursiiviksi tulkitaan `font-style: italic` ja `oblique`. Arvot luetaan
kirjainkoosta riippumatta ja periytetään sisäkkäisille tekstisolmuille.
Muut arvot eivät lisää muotoilua. Syötteen style-attribuutteja ei kopioida
tulos-HTML:ään; formatteri tuottaa edelleen vain sallitut tagit.

## Acceptance Criteria

### AC1: CSS-lihavointi luetaan
**Given** syöte on vuorollaan `<span style="font-weight:bold">A</span>`,
`<span style="font-weight:bolder">A</span>` ja
`<span style="font-weight:700">A</span>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoa segmentti on täsmälleen `{text:"A",bold:true,italic:false}`

### AC2: CSS-kursivointi luetaan
**Given** syöte on vuorollaan `<span style="font-style:italic">A</span>` ja
`<span style="font-style:oblique">A</span>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoa segmentti on täsmälleen `{text:"A",bold:false,italic:true}`

### AC3: Kevyt paino ja normal-tyyli eivät lisää muotoilua
**Given** syöte on `<span style="font-weight:500;font-style:normal">A</span>`
**When** `parseRichText` jäsentää syötteen
**Then** ainoa segmentti on täsmälleen `{text:"A",bold:false,italic:false}`

### AC4: Liitetty muotoilu säilyy koko tulosputkessa
**Given** C-duuri `+2` ja HTML-syöte
`<div>C |G |</div><div><span style="font-weight:700">lihavö</span> <span style="font-style:italic">kursiivi</span></div>`
**When** `createTranspositionResult` muodostaa tuloksen
**Then** plain text on täsmälleen `D |A |\nlihavö kursiivi`, HTML sisältää
täsmälleen `<strong><span>lihavö</span></strong>` ja
`<em><span>kursiivi</span></em>`, eikä HTML sisällä `font-weight`- tai
`font-style`-tekstiä

## Files to Modify
| File | Change |
|---|---|
| `src/logic/parseRichText.ts` | Inline-CSS:n lihavointi- ja kursivointiarvojen tulkinta. |
| `src/logic/parseRichText.test.ts` | AC1–AC3:n parseritestit. |
| `src/logic/createTranspositionResult.test.ts` | AC4:n koko putken regressiotesti. |

## Risk
- Liian väljä CSS-tulkinta voisi muotoilla tavallista tekstiä; hyväksytyt arvot rajataan täsmällisesti ja raja-arvo `500/600` testataan.
- Syötteen attribuutit voisivat vuotaa tulokseen; AC4 tarkistaa, ettei CSS-ominaisuuksia tulosteta.
- Rollback: poista inline-tyylien tulkinta ja AC1–AC4:n testit; tagipohjainen muotoilu säilyy ennallaan.

## Testing Strategy (MANDATORY)
| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `parseRichText` | AC1 CSS-lihavointi | bold, bolder, 700 | jäsennetään | bold true, italic false |
| `parseRichText` | AC2 CSS-kursivointi | italic, oblique | jäsennetään | bold false, italic true |
| `parseRichText` | AC3 raja ja normal | 500, normal | jäsennetään | molemmat false |
| `createTranspositionResult` | AC4 integraatio ja puhdistus | CSS-muotoiltu tekstirivi | putki suoritetaan | täsmällinen plain text ja turvalliset strong/em-tagit |

## Spec Readiness checklist
- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

## Toteutuskorjaus 7.10.2026

Numeerisen font-weight-arvon >=600-sääntö koskee myös desimaalisia arvoja.
Parserin kokonaislukurajoitus poistettiin. Regressiot kattoivat 599.5:n,
600:n, 600.5:n ja 700.25:n sekä desimaalisen CSS-lihavoinnin välittymisen
transponoidun sävelen rekisteriin. Happy DOMin desimaalipainojen rajoitus
huomioitiin testien CSS-rajapinnan simulaatiossa.
21 testitiedostoa ja 413 testiä läpäisevät; 0 epäonnistunutta, 0 ohitettua.
Lint ja diff-tarkistus läpäisevät. Review: APPROVED. Done-tila säilyy.

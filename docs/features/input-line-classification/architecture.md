# Arkkitehtuuri: syötteen rivien tunnistaminen

**Status:** Draft

## Vastuut

| Tiedosto | Vastuu |
|---|---|
| `src/types.ts` | Luokittelun readonly-tyypit. |
| `src/logic/classifyLines.ts` | Content, luokittelu, varoitukset ja validointi ilman DOM:ia. |
| `src/logic/classifyLines.test.ts` | AC1–AC18. |
| `src/ui/lineNumbers.ts` | LF-numerot ja indeksimuunnos. |
| `src/ui/lineNumbers.test.ts` | AC19–AC21. |
| `src/ui/ui.ts` | DOM-liitäntä ja vierityssynkronointi. |
| `src/ui/ui.test.ts` | AC22–AC24 ja UI-regressiot. |
| `style.css` | Editorin ja palstan asettelu. |

## Riippuvuussuunta

```text
src/logic/classifyLines.ts -> src/types.ts
src/ui/ui.ts -> src/ui/lineNumbers.ts
```

Luokittelu liittää segmenttien tekstit mutta säilyttää segmenttirakenteen. Muotoilu ei vaikuta luokkaan eikä fonttikokoa validoida. Rivinumerointi ei tunne luokitusta. UI sijoittaa palstan editorin sisareksi ja synkronoi `scrollTop`-arvon.

## Ei rakenneta

- HTML:n jäsentämistä segmenteiksi
- fonttikoon validointia
- transponointia tai kohdistamista
- tuloksen tai varoitusten näyttämistä
- visuaalisen layoutin mittausta
- tallennusta, verkkopyyntöjä tai uusia riippuvuuksia

## Riskit ja palautus

Riskit ovat sanojen väärä luokittelu, liian väljä viivasääntö, muotoilurajojen häviäminen ja nykyisen UI:n regressiot. Rollback poistaa Files to Modify -taulukon ominaisuusmuutokset yhtenä kokonaisuutena; nykyinen asetusten logiikka ei saa riippua niistä.

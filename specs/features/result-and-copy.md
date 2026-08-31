# Feature: Tuloksen näyttäminen ja kopiointi

**Status:** Done

## Problem Statement
Vaiheiden 1–6 logiikka ei vielä muodosta käyttöliittymästä käynnistettävää kokonaisuutta. Käyttäjän pitää nähdä kohdistettu rikastekstitulos vain luku -kentässä ja kopioida se sekä HTML:nä että tavallisena tekstinä.

## Proposed Change
Lisätään `createTranspositionResult(inputHtml, settings)`, missä settings on `ReadyTranspositionSettings`. Se suorittaa järjestyksessä `parseRichText`, `resolveBaseFontSize`, `classifyLines`, chord/note-transponoinnin, `groupAlignedLines`, jokaisen ryhmän `alignLineGroup`-käsittelyn ja `createResultPresentation`-kutsun. Text/empty-alkiot säilyvät ja ryhmät litistetään indeksijärjestykseen `AlignedMusicResultLine[]`:ksi. Luokittelu- ja sointuvaroitukset yhdistetään.

`createResultPresentation(lines, fontSizePx, warnings)` kutsuu `formatMusicResult`-funktiota ja palauttaa `{ html, plainText, warnings }`. HTML:n ulkokuori on `<div style="font-family:monospace;white-space:pre-wrap">…</div>`. Plain text käyttää rivien content-arvoja ja LF:ää ilman loppurivinvaihtoa. Varoitukset järjestetään `lineIndex`, sitten `startIndex` (puuttuva `0`), tasatilanteessa vakaasti. Indeksit näytetään yhdestä alkavina; varoituksia ei kopioida.

`copyResultToClipboard(presentation, adapter)` käyttää adapterin `write(items)`-metodia. Tuotantoadapteri tekee yhden `navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob(...), "text/plain": new Blob(...) })])` -kutsun. MIME-tyypit vastaavat avaimia. `write`- tai `ClipboardItem`-tuen puuttuessa tai rejectissä toiminto epäonnistuu; `writeText`-fallbackia ei käytetä.

UI lukee `music-input.innerHTML`:n. Tulos on `contenteditable="false"`, `role="textbox"`, `aria-readonly="true"`, nimeltään `Transponoitu tulos`. Se sisältää varoitukset, kopiointipainikkeen ja live-tilan, ei rivinumeroita tai latausta. Yli 40rem näkymässä kentät ovat rinnakkain, enintään 40rem allekkain. Ennen tulosta alue on piilossa ja painike disabled. Uusi yritys tyhjentää kopiointitilan; onnistuminen korvaa tuloksen; käsittelyvirhe tyhjentää ja piilottaa tuloksen sekä näyttää poikkeusviestin. Kopiointivirhe säilyttää tuloksen. `Luonnos` ja `Toiminto tulossa` poistetaan.

## Acceptance Criteria

### AC1: Koko putki transponoi yhdistelmäsyötteen
**Given** C-duuri +2 ja HTML-rivit `C |G |`, `C C`, `onpa` **When** `createTranspositionResult` suoritetaan **Then** rivisisällöt ovat `D |A |`, `D D`, `onpa` tässä järjestyksessä.
### AC2: Orkestrointi lukee rikastekstin
**Given** `<div><strong>C |G |</strong></div>` ja C-duuri +2 **When** tulos luodaan **Then** plainText on `D |A |` ja HTML sisältää `<strong><span>D</span></strong>`.
### AC3: Fonttikoko ratkaistaan syötteestä
**Given** ensimmäisen sisältömerkin inline-koko `18px` **When** tulos luodaan **Then** HTML sisältää täsmälleen yhden `style="font-size:18px"`.
### AC4: Vain musiikkirivit transponoidaan
**Given** tyypit `[chord,note,text,empty]` **When** putki suoritetaan **Then** musiikkitulostyypit ovat `[chord,note]` ja text/empty-sisällöt säilyvät täsmälleen.
### AC5: Ryhmät litistetään indeksijärjestykseen
**Given** chord-rivi `C |`, note-rivi `C`, text-rivi `laula` ja empty-rivi tässä järjestyksessä **When** rivit kohdistetaan ja ryhmät litistetään **Then** `plainText`-tuloksen rivit ovat täsmälleen `C |\nC\nlaula\n` samassa alkuperäisessä järjestyksessä.
### AC6: Itsenäiset rivit säilyvät
**Given** C-duuri 0 ja rivit `C |`, `Kertosäe`, empty sekä `G |` tässä järjestyksessä **When** putki suoritetaan **Then** `plainText` on täsmälleen `C |\nKertosäe\n\nG |`.
### AC7: Varoitukset yhdistetään
**Given** yksi `AMBIGUOUS_NOTE_LINE` ja yksi `SUSPICIOUS_CHORD` **When** putki suoritetaan **Then** esityksessä on täsmälleen kaksi vastaavaa varoitusta.
### AC8: Nolla askelta suorittaa putken
**Given** C-duuri 0 ja `C |G |` **When** tulos luodaan **Then** plainText on `C |G |` ja HTML ei ole tyhjä.
### AC9: Parserivirhe välitetään
**Given** tyhjä inputHtml **When** tulos luodaan **Then** virhe on `Rikastekstisyöte ei saa olla tyhjä`.
### AC10: Musiikkirivin puute välitetään
**Given** vain `Kertosäe` **When** tulos luodaan **Then** virhe on `Syötteestä ei löytynyt sointu- tai sävelrivejä`.

### AC11: HTML saa ulkokuoren
**Given** formatteri palauttaa `<div style="font-size:12px"><div><span>C</span></div></div>` **When** esitys luodaan **Then** HTML on `<div style="font-family:monospace;white-space:pre-wrap"><div style="font-size:12px"><div><span>C</span></div></div></div>`.
### AC12: Plain text käyttää LF:ää
**Given** `C |G |`, `onpa ihanaa` **When** esitys luodaan **Then** plainText on `C |G |\nonpa ihanaa`.
### AC13: Tyhjä rivi säilyy
**Given** `C |G |`, `""`, `Am |F |` **When** esitys luodaan **Then** plainText on `C |G |\n\nAm |F |`.
### AC14: Loppurivinvaihtoa ei lisätä
**Given** ainoa rivi `C |G |` **When** esitys luodaan **Then** plainText on `C |G |`, pituus `6`, viimeinen merkki `|`.
### AC15: Muotoilut säilyvät
**Given** lihavoitu C ja kursivoitu E **When** esitys luodaan **Then** HTML sisältää `<strong><span>C</span></strong><em><span>E</span></em>`.
### AC16: 18px säilyy
**Given** fontSizePx `18` **When** esitys luodaan **Then** HTML:ssa on yksi `font-size:18px` eikä `font-size:12px`.
### AC17: 12px säilyy
**Given** fontSizePx `12` **When** esitys luodaan **Then** HTML:ssa on täsmälleen yksi `font-size:12px`.
### AC18: Tekstirivi kuuluu molempiin muotoihin
**Given** `Kertosäe`, `C |G |`, `onpa` **When** esitys luodaan **Then** plainText on `Kertosäe\nC |G |\nonpa` ja `<span>Kertosäe</span>` esiintyy kerran.
### AC19: Epäilyttävä sointu tekstinnetään
**Given** SUSPICIOUS_CHORD rivillä 3 kohdassa 0, `Cfoo`→`Dbfoo` **When** esitys luodaan **Then** ainoa varoitus on `Rivi 4, kohta 1: epäilyttävä sointu "Cfoo" muutettiin muotoon "Dbfoo".`
### AC20: Pieni sointu tekstinnetään
**Given** LOWERCASE_CHORD rivillä 2 kohdassa 3, `am` **When** esitys luodaan **Then** ainoa varoitus on `Rivi 3, kohta 4: mahdollinen sointu "am" alkaa pienellä kirjaimella eikä sitä muutettu.`
### AC21: Epäselvä sävelrivi tekstinnetään
**Given** AMBIGUOUS_NOTE_LINE rivillä 1 sisällöllä `C D lauletaan hiljaa` **When** esitys luodaan **Then** ainoa varoitus on `Rivi 2: rivi tulkittiin tekstiksi: "C D lauletaan hiljaa".`
### AC22: Varoitukset järjestetään
**Given** sijainnit `(3,0)`, `(1,puuttuu)`, `(3,4)` **When** esitys luodaan **Then** alkujen järjestys on `Rivi 2:`, `Rivi 4, kohta 1:`, `Rivi 4, kohta 5:`.
### AC23: Tasatila on vakaa
**Given** kaksi varoitusta samassa `(2,3)`-sijainnissa järjestyksessä A,B **When** esitys luodaan **Then** järjestys on A,B.
### AC24: Varoituksia ei kopioida
**Given** plainText `Dbfoo |Ab |` ja varoitus **When** esitys luodaan **Then** HTML tai plainText ei sisällä `epäilyttävä sointu`.
### AC25: Tyhjä tulos hylätään
**Given** lines `[]` **When** esitys luodaan **Then** virhe on `Näytettävä tulos ei saa olla tyhjä`.

### AC26: MIME-muodot kirjoitetaan kerran
**Given** HTML `<div><strong>C</strong></div>` ja plainText `C` **When** kopioidaan **Then** write kutsutaan kerran yhdellä itemillä, jonka text/html-Blob sisältää HTML:n ja text/plain-Blob `C`:n.
### AC27: Blobien tyypit ovat täsmälliset
**Given** AC26 **When** ClipboardItem luodaan **Then** Blob-tyypit ovat `text/html` ja `text/plain`.
### AC28: Write-tuen puute hylätään
**Given** clipboard.write puuttuu **When** kopioidaan **Then** virhe on `Tuloksen kopiointi epäonnistui` eikä writeTextiä kutsuta.
### AC29: ClipboardItemin puute hylätään
**Given** ClipboardItem puuttuu **When** kopioidaan **Then** sama virhe eikä writeä kutsuta.
### AC30: Reject muunnetaan
**Given** write hylkää `NotAllowedError` **When** kopioidaan **Then** virhe on `Tuloksen kopiointi epäonnistui`.

### AC31: Tulos on aluksi piilossa
**Given** sovellus alustetaan **When** tulosta ei ole **Then** transposition-result.hidden on true, copy-result.disabled true ja tulos-HTML tyhjä.
### AC32: Tuloskenttä on vain luku
**Given** onnistunut tulos **When** se näytetään **Then** contenteditable on `false`, role `textbox`, aria-readonly `true`, aria-label `Transponoitu tulos`.
### AC33: Leveä näkymä on rinnakkainen
**Given** viewport `41rem` **When** renderöidään **Then** grid-template-columns on `repeat(2,minmax(0,1fr))`.
### AC34: Mobiili on allekkainen
**Given** viewport `40rem` **When** renderöidään **Then** grid-template-columns on `minmax(0,1fr)`.
### AC35: Onnistuminen näyttää tuloksen
**Given** C-duuri +2 ja `C |G |` **When** painetaan Transponoi **Then** tulos näkyy arvolla `D |A |` ja copy-result.disabled on false.
### AC36: Uusi korvaa vanhan
**Given** vanha `C |G |`, uusi `D |A |` **When** uusi näytetään **Then** näkyy vain `D |A |` ja vain uudet varoitukset.
### AC37: Käsittelyvirhe tyhjentää tuloksen
**Given** vanha tulos ja virhe `Valitse lähtösävellaji` **When** virhe käsitellään **Then** tulos piilotetaan ja tyhjennetään, varoitukset ja kopiointitila tyhjennetään, painike disabled ja alert täsmää virheeseen.
### AC38: Enharmoninen valinta estää ajon
**Given** C-duuri +1 ilman C#/Db-valintaa **When** painetaan Transponoi **Then** putkea ei kutsuta ja alert on `Valitse kohdesävellajin kirjoitusasu`.
### AC39: Kopiointionnistuminen näyttää tilan
**Given** tulos ja onnistuva write **When** painetaan Kopioi tulos **Then** teksti on `Tulos kopioitu`, role `status`.
### AC40: Kopiointivirhe säilyttää tuloksen
**Given** `C |G |` ja epäonnistuva write **When** kopioidaan **Then** tulos säilyy, painike on käytössä, teksti `Tuloksen kopiointi epäonnistui`, role `alert`.
### AC41: Uusi yritys tyhjentää kopiointitilan
**Given** tila `Tulos kopioitu` **When** Transponoi painetaan uudelleen **Then** tila on tyhjä ennen ajon valmistumista.
### AC42: Latausta tai rivinumeroita ei tarjota
**Given** tulos näkyy **When** alue tarkistetaan **Then** siinä on yksi painike `Kopioi tulos`, ei download-attribuuttia eikä rivinumeropalstaa.
### AC43: Keskeneräisyystekstit poistetaan
**Given** sovellus alustetaan **When** UI-teksti luetaan **Then** se ei sisällä `Luonnos` tai `Toiminto tulossa`.

## Files to Modify
| File | Change |
|---|---|
| `src/types.ts` | Esitys-, varoitus-, Clipboard-adapteri- ja tulostilatyypit. |
| `src/logic/createTranspositionResult.ts`, `.test.ts` | Putki, litistys, fonttikoko, varoitukset; AC1–AC10. |
| `src/logic/createResultPresentation.ts`, `.test.ts` | HTML/plainText/varoitukset; AC11–AC25. |
| `src/ui/copyResultToClipboard.ts`, `.test.ts` | ClipboardItem/Blob ja virheet; AC26–AC30. |
| `src/ui/ui.ts`, `.test.ts` | InnerHTML, tulos- ja kopiointitilat; AC31–AC32, AC35–AC43. |
| `style.css` | Responsiivinen grid; AC33–AC34. |

## Risk
- Putken järjestys voi rikkoa rekisterit/kohdistuksen; integraatiotesti lukitsee järjestyksen.
- innerHTML on ulkoinen syöte; vain parseRichText jäsentää ja formatMusicResult tuottaa turvallisen HTML:n.
- Clipboard API voi puuttua tai evätä oikeuden; virhe näytetään.
- Vanha tulos voisi johtaa väärään kopioon; käsittelyvirhe tyhjentää sen atomisesti.
- Kohdeohjelma voi suosia plain textiä tai vaihtaa fontin.
- Rollback: poista uudet moduulit ja palauta ui.ts/style.css; vaiheiden 1–6 API:t säilyvät.

## Testing Strategy (MANDATORY)
Täsmällinen 43/43-jäljitettävyys on `docs/features/result-and-copy/test-plan.md`:ssä. Virheet: AC9–AC10, AC25, AC28–AC30, AC37–AC38, AC40. Reunat: AC6, AC8, AC13–AC14, AC22–AC24, AC27, AC31, AC33–AC34, AC41–AC43. Aja `npm run lint`, `npm test`, `git diff --check`.

## Spec Readiness checklist
- [x] Every AC is Given/When/Then with a precise expected value
- [x] Files to modify are listed with what changes in each
- [x] Risk and rollback are documented
- [x] Testing covers every AC plus error and edge cases
- [x] Every AC has at least one named test case (43/43)

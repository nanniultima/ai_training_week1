# Feature: Tuloksen näyttäminen ja kopiointi

**Status:** Done

## Problem Statement
Vaiheiden 1–6 logiikka ei vielä muodosta käyttöliittymästä käynnistettävää kokonaisuutta. Käyttäjän pitää nähdä kohdistettu rikastekstitulos vain luku -kentässä ja kopioida se sekä HTML:nä että tavallisena tekstinä.

## Proposed Change
Lisätään `createTranspositionResult(inputHtml, settings)`, missä settings on `ReadyTranspositionSettings`. Se suorittaa järjestyksessä `parseRichText`, `resolveBaseFontSize`, `classifyLines`, chord/note-transponoinnin, `groupAlignedLines`, jokaisen ryhmän `alignLineGroup`-käsittelyn ja `createResultPresentation`-kutsun. Text/empty-alkiot säilyvät ja ryhmät litistetään indeksijärjestykseen `AlignedMusicResultLine[]`:ksi. Luokittelu- ja sointuvaroitukset yhdistetään.

`createResultPresentation(lines, fontSizePx, warnings)` kutsuu `formatMusicResult`-funktiota ja palauttaa `{ html, plainText, warnings }`. HTML:n ulkokuori on `<div style="font-family:monospace;white-space:pre-wrap">…</div>`. Plain text käyttää rivien content-arvoja ja LF:ää ilman loppurivinvaihtoa. Varoitukset järjestetään `lineIndex`, sitten `startIndex` (puuttuva `0`), tasatilanteessa vakaasti. Indeksit näytetään yhdestä alkavina; varoituksia ei kopioida.

`copyResultToClipboard(presentation, adapter)` käyttää adapterin `write(items)`-metodia. Tuotantoadapteri tekee yhden `navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob(...), "text/plain": new Blob(...) })])` -kutsun. MIME-tyypit vastaavat avaimia. `write`- tai `ClipboardItem`-tuen puuttuessa tai rejectissä toiminto epäonnistuu; `writeText`-fallbackia ei käytetä.

UI lukee `music-input.innerHTML`:n. Syöte- ja tulosnäkymää vaihdetaan `Syöte`- ja `Tulos`-painikkeilla, joista vain aktiivisen näkymän sisältö näytetään koko käytettävissä olevalla leveydellä. Aluksi syöte on aktiivinen ja tulospainike pois käytöstä. Onnistunut transponointi ottaa tulospainikkeen käyttöön ja vaihtaa automaattisesti tulosnäkymään; käyttäjä voi sen jälkeen vaihtaa vapaasti näkymien välillä. Enharmonisen kirjoitusasun radiovalinta välitetään `targetTonicChoice`-arvona asetusten ratkaisuun myös varsinaisessa Transponoi-käsittelijässä. Tulos on `contenteditable="false"`, `role="textbox"`, `aria-readonly="true"`, nimeltään `Transponoitu tulos`. Se sisältää varoitukset, kopiointipainikkeen ja live-tilan, ei rivinumeroita tai latausta. Uusi yritys tyhjentää kopiointitilan; onnistuminen korvaa tuloksen; käsittelyvirhe tyhjentää tuloksen, poistaa tulosvalinnan käytöstä, palauttaa syötenäkymän ja näyttää poikkeusviestin. Kopioinnin onnistumistila näytetään vasta Clipboard-kirjoituksen ratkettua onnistuneesti; odotuksen aikana vanhaa onnistumisviestiä ei näytetä. Kopiointivirhe säilyttää tuloksen. `Luonnos` ja `Toiminto tulossa` poistetaan.

Työtilan sisältö jaetaan leveällä näytöllä kahteen palstaan: transponointiasetukset ovat vasemmalla ja Syöte/Tulos-valitsin sekä aktiivinen sisältöpaneeli oikealla. Asetuspalsta pysyy näkyvissä näkymän vaihtuessa. Enintään `64rem` leveällä näytöllä palstat pinotaan yhdeksi sarakkeeksi niin, että asetukset ovat ennen näkymänvalitsinta ja aktiivista sisältöpaneelia.

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

### AC31: Syötenäkymä on aluksi aktiivinen
**Given** sovellus alustetaan ilman tulosta **When** näkymä esitetään **Then** syötepaneeli ei ole piilossa, tulospaneeli on piilossa, `Syöte`-painikkeen `aria-pressed` on `true`, `Tulos`-painikkeen `aria-pressed` on `false`, tulospainike ja copy-result ovat pois käytöstä ja tulos-HTML on tyhjä.
### AC32: Tuloskenttä on vain luku
**Given** onnistunut tulos **When** se näytetään **Then** contenteditable on `false`, role `textbox`, aria-readonly `true`, aria-label `Transponoitu tulos`.
### AC33: Näkymävalitsin näyttää vain valitun paneelin
**Given** valmis tulos ja aktiivinen tulosnäkymä **When** käyttäjä painaa `Syöte` **Then** syötepaneeli ei ole piilossa, tulospaneeli on piilossa ja painikkeiden `aria-pressed`-arvot ovat `true` ja `false`; **When** käyttäjä painaa `Tulos` **Then** näkyvyydet ja arvot vaihtuvat päinvastaisiksi.
### AC34: Aktiivinen paneeli käyttää koko leveyden
**Given** syöte- tai tulosnäkymä on aktiivinen **When** työtila renderöidään **Then** `.editor-result-grid` käyttää yhtä saraketta `minmax(0,1fr)` ilman kahden sarakkeen breakpointia ja sivun enimmäisleveys on `80rem`.
### AC35: Onnistuminen vaihtaa tulosnäkymään
**Given** C-duuri +2, `C |G |` ja aktiivinen syötenäkymä **When** painetaan Transponoi **Then** tulos näkyy arvolla `D |A |`, syötepaneeli on piilossa, tulospaneeli näkyy, `Tulos` on aktiivinen ja käytössä sekä copy-result.disabled on false.
### AC36: Uusi korvaa vanhan
**Given** vanha `C |G |`, uusi `D |A |` **When** uusi näytetään **Then** näkyy vain `D |A |` ja vain uudet varoitukset.
### AC37: Käsittelyvirhe palauttaa syötenäkymän
**Given** vanha aktiivinen tulos ja virhe `Valitse lähtösävellaji` **When** virhe käsitellään **Then** tulos piilotetaan ja tyhjennetään, syötepaneeli näytetään, varoitukset ja kopiointitila tyhjennetään, tulos- ja kopiointipainikkeet ovat pois käytöstä ja alert täsmää virheeseen.
### AC38: Enharmoninen valinta estää ajon
**Given** C-duuri +1 ilman C#/Db-valintaa **When** painetaan Transponoi **Then** putkea ei kutsuta ja alert on `Valitse kohdesävellajin kirjoitusasu`.
### AC39: Kopiointionnistuminen näyttää tilan
**Given** tulos ja odottava write-promise **When** painetaan Kopioi tulos **Then** kopiointitila on tyhjä ennen promisen ratkeamista; **When** write ratkeaa onnistuneesti **Then** teksti on `Tulos kopioitu` ja role `status`.
### AC40: Kopiointivirhe säilyttää tuloksen
**Given** `C |G |` ja epäonnistuva write **When** kopioidaan **Then** tulos säilyy, painike on käytössä, teksti `Tuloksen kopiointi epäonnistui`, role `alert`.
### AC41: Uusi yritys tyhjentää kopiointitilan
**Given** tila `Tulos kopioitu` **When** Transponoi painetaan uudelleen **Then** tila on tyhjä ennen ajon valmistumista.
### AC42: Latausta tai rivinumeroita ei tarjota
**Given** tulos näkyy **When** alue tarkistetaan **Then** siinä on yksi painike `Kopioi tulos`, ei download-attribuuttia eikä rivinumeropalstaa.
### AC43: Keskeneräisyystekstit poistetaan
**Given** sovellus alustetaan **When** UI-teksti luetaan **Then** se ei sisällä `Luonnos` tai `Toiminto tulossa`.
### AC44: Valittu enharmoninen kirjoitusasu käytetään
**Given** C-duuri +1, syöte `C |G |` ja käyttäjän valitsema `Db` **When** painetaan Transponoi **Then** asetusten ratkaisu saa `targetTonicChoice: "Db"`, virhettä ei näytetä ja tulosnäkymässä plain text on `Db |Ab |`.
### AC45: Editorin kohdistusvälit säilyvät säveltransponoinnissa
**Given** C-duuri +2 ja HTML-syöte `<div>c&nbsp;c&nbsp;&nbsp;g</div>` **When** `createTranspositionResult` suoritetaan **Then** plain text on täsmälleen `D D  A`.
### AC46: Sävelrivin ympäröivät välit säilyvät tuloksessa
**Given** C-duuri +2 ja HTML-syöte `<div>&nbsp;c#&nbsp;</div>` **When** `createTranspositionResult` suoritetaan **Then** plain text on täsmälleen ` D# ` eikä epäselvän sävelrivin varoitusta muodostu.
### AC47: Ylennetyn sävelen jälkeinen B transponoidaan samassa ryhmässä
**Given** C-duuri +2 ja HTML-syöte `<div>g# c#b a</div>` **When** `createTranspositionResult` suoritetaan **Then** plain text on täsmälleen `A# D#C# B` eikä epäselvän sävelrivin varoitusta muodostu.
### AC48: Asetukset ovat aktiivisen paneelin vasemmalla puolella
**Given** työtila renderöidään yli `64rem` leveällä näytöllä **When** syöte- tai tulosnäkymä on aktiivinen **Then** `.workspace-layout` käyttää sarakkeita `minmax(18rem, 0.75fr) minmax(0, 2fr)`, `.transposition-panel` on DOM-järjestyksessä ennen `.workspace-content`-aluetta ja Syöte/Tulos-valitsin sekä aktiivinen paneeli ovat `.workspace-content`-alueen sisällä.
### AC49: Asetukset pinoutuvat mobiilissa sisällön edelle
**Given** näkymän leveys on enintään `64rem` **When** työtila renderöidään **Then** `.workspace-layout` käyttää yhtä saraketta `minmax(0, 1fr)`, jolloin DOM-järjestyksen vuoksi asetukset näkyvät ennen Syöte/Tulos-valitsinta ja aktiivista sisältöpaneelia.
### AC50: Luonnollinen sanaväli säilyy koko transponointiputkessa
**Given** A-duuri `+3` ja HTML-rivit `<div>|A              ,Bm/D# |  </div><div>c#               e d# d</div><div>se iskee sieluun syvimpään</div>` **When** `createTranspositionResult` suoritetaan **Then** plain text on täsmälleen `|C              ,Dm/F# |  \nE                G F# F\nse iskee sieluun syvimpään` eikä varoituksia muodostu

## Files to Modify
| File | Change |
|---|---|
| `src/types.ts` | Esitys-, varoitus-, Clipboard-adapteri- ja tulostilatyypit. |
| `src/logic/createTranspositionResult.ts`, `.test.ts` | Putki, litistys, fonttikoko, varoitukset sekä editorivälien ja kohdistuksen integraatio; AC1–AC10, AC45–AC47, AC50. |
| `src/logic/createResultPresentation.ts`, `.test.ts` | HTML/plainText/varoitukset; AC11–AC25. |
| `src/ui/copyResultToClipboard.ts`, `.test.ts` | ClipboardItem/Blob ja virheet; AC26–AC30. |
| `src/ui/ui.ts`, `.test.ts` | InnerHTML, näkymänvalinta, enharmoninen valinta, tulos- ja kopiointitilat sekä työtilan palstarakenne; AC31–AC44, AC48–AC49. |
| `style.css` | Aktiivisen paneelin sisäinen yhden sarakkeen asettelu, 80rem enimmäisleveys sekä työtilan kaksi palstaa ja `64rem` pinoamisraja; AC34, AC48–AC49. |

## Risk
- Putken järjestys voi rikkoa rekisterit/kohdistuksen; integraatiotesti lukitsee järjestyksen.
- innerHTML on ulkoinen syöte; vain parseRichText jäsentää ja formatMusicResult tuottaa turvallisen HTML:n.
- Clipboard API voi puuttua tai evätä oikeuden; virhe näytetään.
- Enharmoninen esikatselu ja varsinainen ajo voivat eriytyä; päästä päähän -testi lukitsee valinnan välittymisen putkeen.
- Keskeneräinen Clipboard-kirjoitus voi näyttää ennenaikaisen onnistumisen; promise-tilat testataan erikseen.
- Vanha tai piilotettu tulos voisi johtaa väärään kopioon; käsittelyvirhe tyhjentää sen atomisesti ja poistaa tulosvalinnan käytöstä.
- Asetuspalsta voi kaventaa editoria liikaa; oikea palsta käyttää `minmax(0, 2fr)`-saraketta ja asettelu pinoutuu viimeistään `64rem` leveydellä.
- Kohdeohjelma voi suosia plain textiä tai vaihtaa fontin.
- Rollback: poista uudet moduulit ja palauta ui.ts/style.css; vaiheiden 1–6 API:t säilyvät.

## Testing Strategy (MANDATORY)
Täsmällinen 50/50-jäljitettävyys on `docs/features/result-and-copy/test-plan.md`:ssä. Virheet: AC9–AC10, AC25, AC28–AC30, AC37–AC38, AC40. Reunat: AC6, AC8, AC13–AC14, AC22–AC24, AC27, AC31, AC33–AC34, AC39, AC41–AC50. Aja `npm run lint`, `npm test`, `git diff --check`.

## Spec Readiness checklist
- [x] Every AC is Given/When/Then with a precise expected value
- [x] Files to modify are listed with what changes in each
- [x] Risk and rollback are documented
- [x] Testing covers every AC plus error and edge cases
- [x] Every AC has at least one named test case (50/50)

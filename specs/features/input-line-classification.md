# Feature: Syötteen rivien tunnistaminen

**Status:** Done

## Problem Statement

Editorista irrotetut rivit voivat olla sointu-, sävel-, teksti- tai tyhjiä rivejä. Transponointi tarvitsee yksiselitteisen luokituksen menettämättä tekstisisältöä, rivijärjestystä tai rikastekstin muotoiluja. Käyttäjä tarvitsee myös loogiset rivinumerot varoitusten paikantamiseen.

## Proposed Change

Lisätään puhdas `classifyLines`-toiminto ja tyypit:

```ts
export interface FormattedTextSegment {
  readonly text: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly fontSizePx?: number;
}
export interface InputLine { readonly segments: readonly FormattedTextSegment[]; }
export type LineType = 'chord' | 'note' | 'text' | 'empty';
export interface ClassifiedLine {
  readonly index: number;
  readonly type: LineType;
  readonly content: string;
  readonly segments: readonly FormattedTextSegment[];
}
export interface AmbiguousNoteLineWarning {
  readonly code: 'AMBIGUOUS_NOTE_LINE';
  readonly lineIndex: number;
  readonly content: string;
}
export interface ClassificationResult {
  readonly lines: readonly ClassifiedLine[];
  readonly warnings: readonly AmbiguousNoteLineWarning[];
}
```

`content` on segmenttien `text`-arvojen täsmällinen liitos. `segments: []` tarkoittaa sisältöä `""`. Luokittelu ei pilko tai normalisoi segmenttejä eikä validoi `fontSizePx`-arvoa.

Luokittelujärjestys: vain tyhjemerkkejä sisältävä rivi on `empty`; vähintään yhden `|`-merkin sisältävä rivi on `chord`; sävelrivikieliopin täyttävä putketon rivi on `note`; muu rivi on `text`.

Sävelryhmässä on yksi tai useampi sävel. Sävelkirjaimet ovat `A`–`G`, `a`–`g`, `H` ja `h`. Kirjainta saa seurata enintään yksi `#` tai yksi pieni `b`; niitä ei saa yhdistää tai toistaa. Iso `B` on itsenäinen sävel, pieni `b` alennusmerkki ja `H`/`h` B-sävelen vaihtoehto. Sävelet voivat olla ryhmässä ilman erotinta, kuten `G#C`, `abC`, `GB` ja `gB`.

Sävelrivi vaatii vähintään yhden sävelryhmän. Ryhmien ja valinnaisten toistomerkintöjen välissä on yksi tai useampi ASCII-välilyönti. Toistomerkintä vastaa täsmälleen regexiä `x[1-9][0-9]*`; pelkkä toistomerkintä ei muodosta sävelriviä. ASCII `-` sallitaan vain omana tokeninaan kahden sävelryhmän välissä, vähintään yksi ASCII-välilyönti molemmin puolin, ei alkuun, loppuun, peräkkäin tai toistomerkinnän viereen. Sarkain ja muut erottimet eivät kuulu sävelrivikielioppiin. `|` ratkaisee aina `chord`-luokan.

Putkettomasta `text`-rivistä muodostetaan `AMBIGUOUS_NOTE_LINE`, jos siinä on vähintään yksi välilyönnein rajattu kokonainen tuettu sävelryhmä ja lisäksi muuta sisältöä. Sanansisäiset sävelkirjaimet eivät varoita: `cafe` on `text` ilman varoitusta.

Tyhjä rivilista heittää `Syöte ei saa olla tyhjä`. Syöte ilman `chord`- tai `note`-riviä heittää `Syötteestä ei löytynyt sointu- tai sävelrivejä`.

Editorin ulkopuolinen, ei-muokattava rivinumeropalsta numeroi vain LF-rivinvaihdot yhdestä alkaen ja kopioi editorin pystysuuntaisen `scrollTop`-arvon. Palsta ei ole editorin jälkeläinen eikä osa luettavaa tai kopioitavaa sisältöä. Sisäinen indeksi `0` näkyy numerona `1`.

## Acceptance Criteria

### AC1: Tyhjemerkkirivi säilytetään musiikkisyötteessä
**Given** syöterivit sisältävät `"   "` ja `"C |G |"`
**When** `classifyLines` luokittelee rivit
**Then** ensimmäinen rivi on indeksillä `0`, tyypillä `empty`, sisällöllä `"   "` ja alkuperäisillä segmenteillä

### AC2: Putki ratkaisee sointurivin
**Given** ainoan rivin sisältö on `"intro | C | tuntematon x2"`
**When** rivit luokitellaan
**Then** tyyppi on `chord`, sisältö ja segmentit säilyvät ja `warnings` on `[]`

### AC3: Tuetut sävelryhmät tunnistetaan
**Given** sisältö on `"c Gb gb GB gB G#C abC h H BH"`
**When** rivit luokitellaan
**Then** tyyppi on `note`, sisältö säilyy ja `warnings` on `[]`

### AC4: Toistomerkintä sallitaan sävelrivillä
**Given** sisältö on `"c c g g x2 x10"`
**When** rivit luokitellaan
**Then** tyyppi on `note` ja `warnings` on `[]`

### AC5: Tiukka yhdysmerkkierotin sallitaan
**Given** sisältö on `"G#C - abC"`
**When** rivit luokitellaan
**Then** tyyppi on `note` ja sisältö säilyy

### AC6: Virheelliset yhdysmerkit eivät ole sävelrivejä
**Given** tutkittava sisältö on vuorollaan `"c-d"`, `"- c"`, `"c -"`, `"c -- d"` ja `"c - x2"`, lisäksi syötteessä on `"C |G |"`
**When** rivit luokitellaan
**Then** tutkittava rivi on joka tapauksessa `text`

### AC7: Sävelessä sallitaan yksi etumerkki
**Given** tutkittava sisältö on vuorollaan `"C##"`, `"Cbb"` ja `"Cb#"`, lisäksi syötteessä on `"C |G |"`
**When** rivit luokitellaan
**Then** tutkittava rivi on joka tapauksessa `text`

### AC8: Virheelliset toistomerkinnät eivät ole sävelrivejä
**Given** tutkittava sisältö on vuorollaan `"x2"`, `"c x0"`, `"c x01"`, `"c X2"` ja `"c x+2"`, lisäksi syötteessä on `"C |G |"`
**When** rivit luokitellaan
**Then** tutkittava rivi on joka tapauksessa `text`

### AC9: Laulunsanat ovat tekstiä
**Given** syöte sisältää `"C |G |"` ja `"onpa i-hanaa laulella sateessa"`
**When** rivit luokitellaan
**Then** jälkimmäinen on `text` ja `warnings` on `[]`

### AC10: Cafe ei aiheuta varoitusta
**Given** syöte sisältää `"C |G |"` ja `"cafe"`
**When** rivit luokitellaan
**Then** jälkimmäinen on `text` ja `warnings` on `[]`

### AC11: Sekasisältö varoittaa
**Given** syöte sisältää `"C |G |"` ja `"C D lauletaan hiljaa"`
**When** rivit luokitellaan
**Then** jälkimmäinen on `text` ja `warnings` on täsmälleen `[{ code: "AMBIGUOUS_NOTE_LINE", lineIndex: 1, content: "C D lauletaan hiljaa" }]`

### AC12: Järjestys ja indeksit säilyvät
**Given** syöte sisältää `"C |G |"`, `"c d"`, `"onpa"`, `""` ja `"Am |F |"`
**When** rivit luokitellaan
**Then** indeksit ovat `[0,1,2,3,4]` ja tyypit `[chord,note,text,empty,chord]`

### AC13: Musiikkia sisältävät tyyppiyhdistelmät hyväksytään
**Given** syöte on vuorollaan pelkkä chord, pelkkä note, chord ja text, note ja text, tai chord ja note
**When** rivit luokitellaan
**Then** jokainen palautuu ilman virhettä tai puuttuvan tyypin varoitusta

### AC14: Tyhjä rivilista hylätään
**Given** syöte on `[]`
**When** luokittelua yritetään
**Then** virhe on `Syöte ei saa olla tyhjä`

### AC15: Syöte ilman musiikkia hylätään
**Given** syöte sisältää `"onpa ihanaa"`, tyhjän segmenttilistan ja `"laulella sateessa"`
**When** luokittelua yritetään
**Then** virhe on `Syötteestä ei löytynyt sointu- tai sävelrivejä`

### AC16: Segmentit ja fonttikoko säilyvät
**Given** segmentit ovat lihavoitu `"C"` fonttikoolla `18`, tavallinen `" |"` ja kursivoitu `"G |"`
**When** rivit luokitellaan
**Then** `content` on `"C |G |"` ja segmentit ovat rakenteellisesti täsmälleen alkuperäiset

### AC17: Fonttikokoa ei validoida
**Given** sointurivin segmentin `fontSizePx` on `-1`
**When** rivit luokitellaan
**Then** rivi on `chord` ja `fontSizePx` on `-1`

### AC18: Sarkain ei ole sävelerotin
**Given** syöte sisältää `"C |G |"` ja `"c\td"`
**When** rivit luokitellaan
**Then** jälkimmäinen on `text`

### AC19: Loogiset rivit numeroidaan
**Given** sisältö on `Kertosäe\nC |G |\nonpa`
**When** `renderLineNumbers` muodostaa numerot
**Then** numerot ovat `["1","2","3"]`

### AC20: Visuaalista rivitystä ei lasketa
**Given** sisältö on yksi pitkä looginen rivi ilman `\n`-merkkiä
**When** numerot muodostetaan
**Then** palstalla on yksi numero `"1"`

### AC21: Indeksi muunnetaan näkyväksi numeroksi
**Given** indeksi on `2`
**When** `toVisibleLineNumber` muuntaa sen
**Then** tulos on `3`

### AC22: Palsta liitetään editorin ulkopuolelle
**Given** käyttöliittymä alustetaan
**When** editori ja palsta haetaan DOM:sta
**Then** palsta on editorin sisarelementti, ei `contenteditable`, eikä editori sisällä sitä

### AC23: Palsta vierii editorin mukana
**Given** editorin `scrollTop` on `120`
**When** editori lähettää `scroll`-tapahtuman
**Then** palstan `scrollTop` on `120`

### AC24: Numerot eivät kuulu editorin sisältöön
**Given** editorin sisältö on `C |G |\nonpa` ja palstalla näkyvät `1` ja `2`
**When** editorin syötesisältö luetaan
**Then** sisältö on täsmälleen `C |G |\nonpa`

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää luokittelun julkiset tyypit. |
| `src/logic/classifyLines.ts` | Lisää luokittelu, kielioppi, varoitus ja validointi. |
| `src/logic/classifyLines.test.ts` | Lisää AC1–AC18:n testit. |
| `src/ui/lineNumbers.ts` | Lisää LF-numerointi ja indeksimuunnos. |
| `src/ui/lineNumbers.test.ts` | Lisää AC19–AC21:n testit. |
| `src/ui/ui.ts` | Liitä palsta ja synkronoi vieritys. |
| `src/ui/ui.test.ts` | Lisää AC22–AC24:n integraatiotestit. |
| `style.css` | Asettele palsta editorin rinnalle. |

## Risk

- What could break: sanat voivat muistuttaa sävelryhmiä; kokonaisen tokenin sääntö ja `cafe`-testi rajaavat väärät varoitukset.
- What could break: väljä viivasääntö voisi tulkita tavutettuja sanoja säveliksi; vain `sävelryhmä ␠-␠ sävelryhmä` hyväksytään.
- What could break: segmenttien normalisointi voisi hävittää myöhemmän rekisteritiedon; rakenne testataan.
- What could break: UI-muutos voi rikkoa nykyiset asetukset; nykyiset UI-testit ajetaan regressiotesteinä.
- Rollback: poista uudet moduulit, tyypit, testit, UI-liitäntä ja tyylit yhtenä ominaisuusmuutoksena.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `classifyLines` | `AC1 säilyttää tyhjemerkkirivin musiikkisyötteessä` | Empty + chord | Luokitellaan | Empty index 0 säilyy |
| `classifyLines` | `AC2 antaa putken ratkaista sointurivin` | Putkirivi | Luokitellaan | Chord, ei varoituksia |
| `classifyLines` | `AC3 tunnistaa tuetut sävelryhmät` | Tuetut ryhmät | Luokitellaan | Note |
| `classifyLines` | `AC4 hyväksyy täsmälliset toistomerkinnät` | x2, x10 | Luokitellaan | Note |
| `classifyLines` | `AC5 hyväksyy tiukan yhdysmerkkierottimen` | G#C - abC | Luokitellaan | Note |
| `classifyLines` | `AC6 hylkää virheelliset yhdysmerkkimuodot note-luokasta` | Viisi rajaa | Luokitellaan | Text |
| `classifyLines` | `AC7 hylkää useat etumerkit note-luokasta` | Kolme rajaa | Luokitellaan | Text |
| `classifyLines` | `AC8 hylkää virheelliset toistomerkinnät note-luokasta` | Viisi rajaa | Luokitellaan | Text |
| `classifyLines` | `AC9 tunnistaa laulunsanat ilman varoitusta` | Sanat | Luokitellaan | Text, [] |
| `classifyLines` | `AC10 pitää cafe-sanan tekstinä` | cafe | Luokitellaan | Text, [] |
| `classifyLines` | `AC11 palauttaa täsmällisen epäselvyysvaroituksen` | Sekasisältö | Luokitellaan | Täsmällinen warning |
| `classifyLines` | `AC12 säilyttää järjestyksen indeksit ja tyhjät rivit` | Viisi riviä | Luokitellaan | Indeksit ja tyypit |
| `classifyLines` | `AC13 hyväksyy musiikkia sisältävät tyyppiyhdistelmät` | Viisi yhdistelmää | Luokitellaan | Ei virhettä |
| `classifyLines` | `AC14 hylkää tyhjän rivilistan` | [] | Luokitellaan | Täsmällinen virhe |
| `classifyLines` | `AC15 hylkää syötteen ilman musiikkia` | Text/empty/text | Luokitellaan | Täsmällinen virhe |
| `classifyLines` | `AC16 säilyttää segmentit ja fonttikoon` | Kolme segmenttiä | Luokitellaan | Sama rakenne |
| `classifyLines` | `AC17 ei validoi fonttikokoa` | -1 | Luokitellaan | Arvo säilyy |
| `classifyLines` | `AC18 ei hyväksy sarkainta note-erottimeksi` | c-tab-d | Luokitellaan | Text |
| `renderLineNumbers` | `AC19 numeroi LF-loogiset rivit` | Kolme riviä | Muodostetaan | 1,2,3 |
| `renderLineNumbers` | `AC20 laskee vain loogiset rivit` | Ei LF:ää | Muodostetaan | 1 |
| `toVisibleLineNumber` | `AC21 muuntaa indeksin näkyväksi numeroksi` | 2 | Muunnetaan | 3 |
| `initializeUi` | `AC22 liittää palstan editorin ulkopuolelle` | DOM | Haetaan | Sisar, ei muokattava |
| `initializeUi` | `AC23 synkronoi pystysuuntaisen vierityksen` | scrollTop 120 | Scroll | 120 |
| `initializeUi` | `AC24 pitää numerot poissa editorin sisällöstä` | Kaksi riviä | Luetaan | Alkuperäinen sisältö |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

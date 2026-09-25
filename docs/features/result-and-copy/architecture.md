# Tuloksen näyttäminen ja kopiointi — arkkitehtuuri

## Tavoite ja rajaus

Speksi 7 liittää valmiit vaiheet 1–6 yhdeksi UI:sta kutsuttavaksi putkeksi.
Uudet vastuut ovat orkestrointi, esitysmalli, Clipboard-adapteri ja tulos-UI.
Vaiheiden 1–6 julkisia rajapintoja ei muuteta eikä tiedostolatausta lisätä.

## Tietovirta

`music-input.innerHTML`
→ `parseRichText`
→ `resolveBaseFontSize`
→ `classifyLines`
→ `transposeChordLine` / `transposeNoteLine`
→ `groupAlignedLines`
→ `alignLineGroup` ryhmille, text/empty identiteettinä
→ indeksijärjestetty `AlignedMusicResultLine[]`
→ `createResultPresentation`
→ `formatMusicResult` + plain text + varoitustekstit
→ vain luku -tuloskenttä / Clipboard-adapteri.

## Rajapinnat

- `createTranspositionResult(inputHtml: string, settings: ReadyTranspositionSettings): TranspositionPresentation` kokoaa putken. Toteutus saa olla synkroninen.
- `createResultPresentation(lines: readonly AlignedMusicResultLine[], fontSizePx: number, warnings: readonly ProcessingWarning[]): TranspositionPresentation` validoi ei-tyhjän rivistön.
- `copyResultToClipboard(presentation: TranspositionPresentation, adapter: ClipboardWriteAdapter): Promise<void>` normalisoi kaikki tukija kirjoitusvirheet viestiksi `Tuloksen kopiointi epäonnistui`.
- `TranspositionPresentation` sisältää vain `html`, `plainText`, `warnings`.

UI ratkaisee asetukset ennen putkea. `requiresEnharmonicChoice` ei ole valmis asetus. Valittu `input[name=enharmonic-choice]:checked` välitetään `targetTonicChoice`-arvona varsinaisen Transponoi-käsittelijän asetuskutsuun. UI omistaa näkyvät tilat, mutta ei musiikkilogiikkaa. Syöte- ja tulospaneeleista vain aktiivinen näytetään. Aluksi syöte on aktiivinen ja tulosvalinta pois käytöstä; onnistunut ajo aktivoi tuloksen ja vaihtaa siihen. Uuden yrityksen alussa kopiointitila tyhjennetään; käsittelyvirhe poistaa vanhan tuloksen atomisesti, poistaa tulosvalinnan käytöstä ja palauttaa syötepaneelin; kopiointivirhe ei muuta esitystä. Kopioinnin `role=status` ja `Tulos kopioitu` asetetaan vasta `copyResultToClipboard`-promisen onnistuneen ratkeamisen jälkeen.

## Turvallisuus ja saavutettavuus

Vain `parseRichText` jäsentää käyttäjän HTML:n. Tulos syntyy vain
`formatMusicResult`-funktiosta, jonka HTML kääritään vakioon ulkokuoreen.
Varoitus- tai virhetekstiä ei yhdistetä HTML:ään. Näkymänvalitsimet ovat
nimettyjä painikkeita, joiden aktiivisuus välitetään `aria-pressed`-attribuutilla.
Tulos on nimetty, `aria-readonly`-merkitty textbox. Kopiointitila käyttää onnistumisessa
`role=status` ja virheessä `role=alert`.

## Responsiivisuus

Työtilan ulompi `.workspace-layout`-grid käyttää yli `64rem` leveällä näytöllä
sarakkeita `minmax(18rem, 0.75fr) minmax(0, 2fr)`. Transponointiasetukset ovat
ensimmäisessä sarakkeessa ja `.workspace-content` toisessa; sisältöalue omistaa
Syöte/Tulos-valitsimen ja nykyisen yhden sarakkeen `.editor-result-grid`-alueen.
Asetukset eivät katoa näkymää vaihdettaessa. Enintään `64rem` leveydellä ulompi
grid muuttuu sarakkeeksi `minmax(0, 1fr)`, jolloin DOM-järjestys sijoittaa asetukset
ennen valitsinta ja aktiivista paneelia. Sivun enimmäisleveys on `80rem`.
Piilotettu paneeli ei varaa käyttäjälle näkyvää tilaa. Tulos käyttää monospace-fonttia
ja `white-space: pre-wrap` -asetusta myös selaimessa.

## Rollback

Poista uudet kolme moduulia, niiden testit ja uudet tyypit sekä palauta
`ui.ts`, `ui.test.ts` ja `style.css`. Vaiheiden 1–6 API:t jäävät ennalleen.

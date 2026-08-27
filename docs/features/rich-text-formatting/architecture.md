# Rikastekstin muotoilu — arkkitehtuuri

## Tietovirta

`parseRichText` käyttää `template`-elementtiä ja tuottaa vain rivit ja
muotoilusegmentit. Luokittelu ja transponointi käyttävät mallia, minkä jälkeen
`formatMusicResult` muuntaa kohdistetut semanttiset chord-, note-, text- ja
empty-rivit HTML:ksi. Speksi 6 vastaa kohdistuksen laskennasta.

Parseri perii DOM-puusta bold/italic/fontSizePx-tilan, normalisoi lohkot ja
rivinvaihdot sekä yhdistää identtiset vierekkäiset segmentit. Formatteri
enkoodaa kaiken tekstin itse; se ei siirrä lähde-HTML:ää tulokseen.

## Tietomalli ja rajapinnat

Julkiset rajapinnat ovat `parseRichText`, `formattingToRegister`,
`registerToFormatting`, `resolveBaseFontSize` ja `formatMusicResult`.
Chord-token kantaa lähdevälin ja sisäiset muotoilujaksot. Note-erotin ja
toistomerkintä kantavat lähdemuotoilujaksot. Segmenttiformatterit ovat
moduulin sisäisiä ja testataan julkisen tulosfunktion kautta.

## Turvallisuus, riippuvuudet ja palautus

DOM tulee happy-domista testeissä ja selaimesta tuotannossa. Script/style ja
ei-tekstuaaliset solmut ohitetaan; näkyvä teksti enkoodataan. Vain generaattorin
font-size-attribuutti sallitaan. Palautus poistaa uudet moduulit ja palauttaa
`types.ts`- sekä chord/note-tulosmallien laajennukset.

# Arkkitehtuuri: sointujen transponointi

**Status:** Draft

## Tiedostot ja vastuut

| Tiedosto | Vastuu |
|---|---|
| `src/types.ts` | Ready-asetuksiin sidotut syöte-, rivitulos- ja varoitustyypit. |
| `src/logic/transposeChord.ts` | Tiukka tuetun sointusymbolin jäsennys, H-normalisointi, perus- ja bassosävelen transponointi sekä merkkiperheen ratkaisu. |
| `src/logic/transposeChord.test.ts` | AC1–AC15, AC22, AC27 ja AC31. |
| `src/logic/transposeChordLine.ts` | Chord-rivin tolerantti tokenisointi, segmenttien säilytys, tuettujen sointujen transponointi ja varoitukset. |
| `src/logic/transposeChordLine.test.ts` | AC16–AC21, AC23–AC26 ja AC28–AC30. |
| `src/logic/transpose.ts` | Poistetaan vanha toteuttamaton skeleton. |
| `src/logic/transpose.test.ts` | Poistetaan skeletonin `not implemented` -testi. |

## Julkinen rajapinta

Molempien funktioiden asetustyyppi on `Extract<TranspositionSettingsResult,
{ readonly status: 'ready' }>`. Waiting-tulosta ei voi antaa funktioille
TypeScriptissä. `transposeChordSymbol` on tiukka ja palauttaa merkkijonon.
`transposeChordLine` vastaanottaa `ClassifiedLine`-rakenteen ja palauttaa
indeksin, `chord`-tyypin, transponoidun content-arvon, muotoilusegmentit ja
rakenteiset varoitukset.

```text
transposeChordLine -> transposeChordSymbol -> @tonaljs/note
        |                    |
        +-------> src/types.ts <----- transposition-settings ready
```

Merkkiperhe ratkaistaan sovelluksen eksplisiittisistä major/minor
sharp/flat/neutral-taulukoista, ei Tonalin nimeämisvalinnasta. Tonalia saa
käyttää sävelen validointiin ja chroma-laskentaan.

## Segmenttien käsittely

Muuttumaton teksti säilyttää segmenttinsä. Korvaava perus- tai bassosävel
perii korvatun sävelen ensimmäisen merkin muotoilun. Muuttumaton sointupääte
säilyttää oman muotoilunsa. Viereiset jaksot yhdistetään vain identtisillä
bold-, italic- ja fontSizePx-arvoilla. Lihavointia ei lisätä.

## Ei rakenneta

- waiting-asetusten viimeistelyä
- uusien sointutyyppien arvaamista
- epäilyttävän tokenin osittaista transponointia
- note- tai text-rivien transponointia
- kohdistuksen korjaamista
- HTML:n muodostamista tai lihavoinnin lisäämistä
- uusia riippuvuuksia tai käyttöliittymäintegraatiota

## Riskit ja rollback

Tavallinen A–H-alkuinen sana voi saada epäilyttävän soinnun varoituksen,
mutta se säilyy muuttumattomana. Tukematon oikea sointu, kuten C9, ei
transponoidu ensimmäisessä versiossa. Segmenttirajojen virheellinen käsittely
voi hävittää myöhemmän rekisteri- tai tekstimuotoilun. Merkkiperhetaulukon
virhe vaikuttaisi kaikkiin kromaattisiin sointuihin.

Rollback poistaa uudet chord-moduulit ja tyypit sekä palauttaa vanhan
transpose-skeletonin ja sen testin samassa muutoksessa. Riippuvuuksia tai
käyttäjän muita ominaisuuksia ei rollbackissa muuteta.

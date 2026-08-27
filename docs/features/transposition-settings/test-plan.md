# Testisuunnitelma: transponointiasetusten valinta

**Status:** Draft

Tila `[ ]` tarkoittaa suunniteltua testiä ja `[x]` läpäisevää testiä. Tila
`[?]` tarkoittaa hyväksymiskriteeriä, jota ei voi todistaa koneellisesti.

## AC1

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [x] | AC1 | `src/ui/ui.test.ts` — `AC1 näyttää duurivalinnan jälkeen täsmälleen 15 duurisävellajia sävelkorkeusjärjestyksessä` | Alusta UI ja klikkaa `major`-valintaa | Toonikat täsmälleen `[C, C#, Db, D, Eb, E, F, F#, Gb, G, Ab, A, Bb, B, Cb]` tässä järjestyksessä |

AC1 on koneellisesti tarkistettava, joten `[?]`-merkintää ei tarvita.

## AC2

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [x] | AC2 | `src/ui/ui.test.ts` — `AC2 näyttää mollivalinnan jälkeen täsmälleen 15 mollisävellajia sävelkorkeusjärjestyksessä` | Alusta UI ja klikkaa `minor`-valintaa | Toonikat täsmälleen `[C, C#, D, D#, Eb, E, F, F#, G, G#, Ab, A, A#, Bb, B]` tässä järjestyksessä |

AC2 on koneellisesti tarkistettava, joten `[?]`-merkintää ei tarvita.

## AC3

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [x] | AC3 | `src/ui/ui.test.ts` — `AC3 tyhjentää lähtösävellajin ja näyttää mollilistan vaihdettaessa duurista molliin` | Alusta UI, valitse `major`, aseta lähtötoonikaksi `C` ja klikkaa `minor` | `source-key.value` on tyhjä ja vaihtoehdot ovat täsmälleen AC2:n 15 mollitoonikaa |

AC3 on koneellisesti tarkistettava, joten `[?]`-merkintää ei tarvita.

## AC4–AC25

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [ ] | AC4 | `transpositionSettings.test.ts` — `AC4 ratkaisee kaikki duuriyhdistelmät` | 15 duuritoonikaa × kaikki askeleet `-11…11` | Kaikki 345 tulosta vastaavat riippumatonta chroma- ja nimifixturea |
| [ ] | AC5 | `transpositionSettings.test.ts` — `AC5 ratkaisee kaikki molliyhdistelmät` | 15 mollitoonikaa × kaikki askeleet `-11…11` | Kaikki 345 tulosta vastaavat riippumatonta chroma- ja nimifixturea |
| [ ] | AC6 | `ui.test.ts` — `AC6 laskee ja näyttää C-duuri +2 -kohteen automaattisesti` | Valitse `major`, `C` ja `2` | D-duuri ja `Kohdesävellaji: D-duuri`; ei lisävalintaa |
| [ ] | AC7 | `transpositionSettings.test.ts` — `AC7 ratkaisee A-molli -2 muodoksi G-molli` | A-molli, `-2` | `ready`, kohde `G`, mode `minor` |
| [ ] | AC8 | `transpositionSettings.test.ts` — `AC8 säilyttää Gb-duurin nolla-askeleella` | Gb-duuri, `0` | `ready`, lähde ja kohde `Gb` |
| [ ] | AC9 | `transpositionSettings.test.ts` — `AC9 palauttaa C-sharp- ja D-flat-duurin vaihtoehdot` | C-duuri, `1` | `requiresEnharmonicChoice`; vaihtoehdot C#/Db |
| [ ] | AC10 | `transpositionSettings.test.ts` ja `ui.test.ts` — `AC10 validoi D-flat-duurin ja sulkee valinnan` | C-duuri, `1`, targetTonicChoice `Db` | Ready sisältää major/C/Db/1; esikatselu näkyy ja valinta sulkeutuu |
| [ ] | AC11 | `transpositionSettings.test.ts` — `AC11 palauttaa D-sharp- ja E-flat-mollin vaihtoehdot` | D-molli, `1` | `requiresEnharmonicChoice`; vaihtoehdot D#/Eb |
| [ ] | AC12 | `transpositionSettings.test.ts` — `AC12 valitsee A-duurista B-flat-duurin` | A-duuri, `1` | `ready`, kohde `Bb`; ei A#:a |
| [ ] | AC13 | `transpositionSettings.test.ts` — `AC13 valitsee C-mollista C-sharp-mollin` | C-molli, `1` | `ready`, kohde `C#`; ei Db:tä |
| [ ] | AC14 | `transpositionSettings.test.ts` — `AC14 hyväksyy positiivisen rajan` | C-duuri, `11` | B-/Cb-vaihtoehdot |
| [ ] | AC15 | `transpositionSettings.test.ts` — `AC15 hyväksyy negatiivisen rajan` | C-duuri, `-11` | C#-/Db-vaihtoehdot |
| [ ] | AC16 | `transpositionSettings.test.ts` — `AC16 hylkää askeleen -12` | C-duuri, `-12` | Speksin täsmällinen askelvirhe |
| [ ] | AC17 | `transpositionSettings.test.ts` — `AC17 hylkää askeleen 12` | C-duuri, `12` | Speksin täsmällinen askelvirhe |
| [ ] | AC18 | `transpositionSettings.test.ts` — `AC18 hylkää desimaalisen askeleen` | C-duuri, `1.5` | Speksin täsmällinen askelvirhe |
| [x] | AC19 | `ui.test.ts` — `AC19 näyttää virheen kun lähtötoonika puuttuu` | Valitse duuri ja askel `1`, jätä toonika valitsematta, paina `Transponoi` | Käsittely ei ala; `Valitse lähtösävellaji` |
| [x] | AC20 | `ui.test.ts` — `AC20 näyttää virheen kun laatu puuttuu` | Älä valitse duuria tai mollia, paina `Transponoi` | Käsittely ei ala; `Valitse duuri tai molli` |
| [ ] | AC21 | `transpositionSettings.test.ts` — `AC21 hylkää J-toonikan` | J-duuri, `1` | `Tuntematon lähtösävellaji: J` |
| [ ] | AC22 | `transpositionSettings.test.ts` — `AC22 hylkää tarpeettoman kohdetoonikan valinnan` | C-duuri, `2`, valinta `Db` | `Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa` |
| [ ] | AC23 | `ui.test.ts` — `AC23 näyttää yksiselitteisen kohteen automaattisesti` | Valitse C-duuri, C ja `2` | `Kohdesävellaji: D-duuri` ilman Enteriä tai painiketta |
| [ ] | AC24 | `ui.test.ts` — `AC24 näyttää enharmoniset vaihtoehdot automaattisesti` | Valitse C-duuri, C ja `1` | C#-/Db-vaihtoehdot näkyvät; kohde-esikatselu piilossa |
| [ ] | AC25 | `ui.test.ts` — `AC25 piilottaa kohteen keskeneräisessä ja virheellisessä tilassa` | Tarkista alkutila ilman moodia; muodosta erikseen C-duuri, C ja `2`, vaihda molliin tai syötä `-12`, `12`, `1.5` | Alkutilassa kohdenäytöt piilossa; molliin vaihdettaessa toonika tyhjä ja kohdenäytöt piilossa; virheellisillä askelilla kohdenäytöt piilossa; musiikkisyöte muuttumaton |
| [ ] | AC26 | `transpositionSettings.test.ts` — `AC26 palauttaa validoidun askeleen odotustuloksessa` | C-duuri, `1`, ei valintaa | Waiting-tulos sisältää step 1 ja C#/Db |
| [ ] | AC27 | `transpositionSettings.test.ts` — `AC27 hylkää vaihtoehtoihin kuulumattoman kohdetoonikan` | C-duuri, `1`, F# | Täsmällinen vaihtoehtovirhe |
| [ ] | AC28 | `transpositionSettings.test.ts` — `AC28 hylkää virheellisen moodin ajonaikana` | Dorian, C, `1` | `Tuntematon sävellajin laatu: dorian` |

Kaikki speksissä olevat 28 AC:tä ovat koneellisesti tarkistettavia; `[?]`-rivejä ei ole.

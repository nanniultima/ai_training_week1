# Testisuunnitelma: transponointiasetusten valinta

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

## AC4–AC26

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [ ] | AC4 | `transpositionSettings.test.ts` — `AC4 ratkaisee kaikki duuriyhdistelmät` | 15 duuritoonikaa × kaikki askeleet `-11…11` | Kaikki 345 tulosta vastaavat riippumatonta chroma- ja nimifixturea |
| [ ] | AC5 | `transpositionSettings.test.ts` — `AC5 ratkaisee kaikki molliyhdistelmät` | 15 mollitoonikaa × kaikki askeleet `-11…11` | Kaikki 345 tulosta vastaavat riippumatonta chroma- ja nimifixturea |
| [ ] | AC6 | `ui.test.ts` — `AC6 laskee ja näyttää C-duuri +2 -kohteen automaattisesti` | Valitse `major`, `C` ja `2` | D-duuri ja `Kohdesävellaji: D-duuri`; ei lisävalintaa |
| [ ] | AC7 | `transpositionSettings.test.ts` — `AC7 ratkaisee A-molli -2 muodoksi G-molli` | A-molli, `-2` | `ready`, kohde `G`, mode `minor` |
| [ ] | AC8 | `transpositionSettings.test.ts` — `AC8 säilyttää Gb-duurin nolla-askeleella` | Gb-duuri, `0` | `ready`, lähde ja kohde `Gb` |
| [ ] | AC9 | `transpositionSettings.test.ts` — `AC9 palauttaa C-sharp- ja D-flat-duurin vaihtoehdot` | C-duuri, `1` | `requiresEnharmonicChoice`; vaihtoehdot C#/Db |
| [ ] | AC10 | `ui.test.ts` — `AC10 vahvistaa D-flat-duurin ja sulkee valinnan` | Valitse näkyvistä vaihtoehdoista Db-duuri | Esikatselu `Kohdesävellaji: Db-duuri`; valinta piilossa |
| [ ] | AC11 | `transpositionSettings.test.ts` — `AC11 palauttaa D-sharp- ja E-flat-mollin vaihtoehdot` | D-molli, `1` | `requiresEnharmonicChoice`; vaihtoehdot D#/Eb |
| [ ] | AC12 | `transpositionSettings.test.ts` — `AC12 valitsee A-duurista B-flat-duurin` | A-duuri, `1` | `ready`, kohde `Bb`; ei A#:a |
| [ ] | AC13 | `transpositionSettings.test.ts` — `AC13 valitsee C-mollista C-sharp-mollin` | C-molli, `1` | `ready`, kohde `C#`; ei Db:tä |
| [ ] | AC14 | `transpositionSettings.test.ts` — `AC14 hyväksyy positiivisen rajan` | C-duuri, `11` | B-/Cb-vaihtoehdot |
| [ ] | AC15 | `transpositionSettings.test.ts` — `AC15 hyväksyy negatiivisen rajan` | C-duuri, `-11` | C#-/Db-vaihtoehdot |
| [ ] | AC16 | `transpositionSettings.test.ts` — `AC16 hylkää askeleen -12` | C-duuri, `-12` | Speksin täsmällinen askelvirhe |
| [ ] | AC17 | `transpositionSettings.test.ts` — `AC17 hylkää askeleen 12` | C-duuri, `12` | Speksin täsmällinen askelvirhe |
| [ ] | AC18 | `transpositionSettings.test.ts` — `AC18 hylkää desimaalisen askeleen` | C-duuri, `1.5` | Speksin täsmällinen askelvirhe |
| [ ] | AC19 | `ui.test.ts` — `AC19 näyttää virheen ilman lähtötoonikaa` | Duuri ja `1`, ei toonikaa; yritä varsinaista transponointia | `Valitse lähtösävellaji`; käsittely ei ala |
| [ ] | AC20 | `ui.test.ts` — `AC20 näyttää virheen ilman moodia` | Ei moodia; yritä varsinaista transponointia | `Valitse duuri tai molli`; käsittely ei ala |
| [ ] | AC21 | `transpositionSettings.test.ts` — `AC21 normalisoi H:n B:ksi` | H-duuri, `0` | Lähde ja kohde `B` |
| [ ] | AC22 | `transpositionSettings.test.ts` — `AC22 hylkää J-toonikan` | J-duuri, `1` | `Tuntematon lähtösävellaji: J` |
| [ ] | AC23 | `transpositionSettings.test.ts` — `AC23 hylkää tarpeettoman flat-valinnan` | C-duuri, `2`, valinta `flat` | `Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa` |
| [ ] | AC24 | `ui.test.ts` — `AC24 näyttää yksiselitteisen kohteen automaattisesti` | Valitse C-duuri, C ja `2` | `Kohdesävellaji: D-duuri` ilman Enteriä tai painiketta |
| [ ] | AC25 | `ui.test.ts` — `AC25 näyttää enharmoniset vaihtoehdot automaattisesti` | Valitse C-duuri, C ja `1` | C#-/Db-vaihtoehdot näkyvät; kohde-esikatselu piilossa |
| [ ] | AC26 | `ui.test.ts` — `AC26 piilottaa kohteen keskeneräisessä ja virheellisessä tilassa` | Puuttuva mode, puuttuva toonika, `-12`, `12`, `1.5` | Esikatselu ja vaihtoehdot piilossa; musiikkisyöte muuttumaton |

Kaikki AC1–AC26 ovat koneellisesti tarkistettavia; `[?]`-rivejä ei ole.

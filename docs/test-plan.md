# Testisuunnitelma: transponointiasetusten valinta

Tila `[ ]` tarkoittaa suunniteltua koneellista testiä. Tila `[?]` olisi AC,
jota ei voi todistaa koneellisesti; tässä speksissä sellaisia ei ole.

| Tila | AC | Testitiedosto ja testin nimi | Syöte ja toiminto | Täsmällinen odotus |
|---|---|---|---|---|
| [ ] | AC1 | `transpositionSettings.test.ts` — `AC1 palauttaa duuritoonikat määrätyssä järjestyksessä` | `getAvailableTonics("major")` | `["C","G","D","A","E","B","F#","C#","F","Bb","Eb","Ab","Db","Gb","Cb"]` |
| [ ] | AC2 | `transpositionSettings.test.ts` — `AC2 palauttaa mollitoonikat määrätyssä järjestyksessä` | `getAvailableTonics("minor")` | `["A","E","B","F#","C#","G#","D#","A#","D","G","C","F","Bb","Eb","Ab"]` |
| [ ] | AC3 | `ui.test.ts` — `AC3 moodin vaihto tyhjentää toonikan ja näyttää mollilistan` | Alusta UI, valitse major/C, vaihda minor | `source-key.value === ""`; näkyvät vaihtoehdot ovat AC2:n 15 arvoa |
| [ ] | AC4 | `transpositionSettings.test.ts` — `AC4 ratkaisee C-duurin kaksi askelta D-duuriksi` | `{ mode:"major", sourceTonic:"C", step:2 }` | `{ status:"ready", sourceTonic:"C", targetTonic:"D", mode:"major" }`; ei vaihtoehtoja |
| [ ] | AC5 | `transpositionSettings.test.ts` — `AC5 ratkaisee A-mollin kaksi askelta alas G-molliksi` | `{ mode:"minor", sourceTonic:"A", step:-2 }` | `{ status:"ready", sourceTonic:"A", targetTonic:"G", mode:"minor" }`; ei vaihtoehtoja |
| [ ] | AC6 | `transpositionSettings.test.ts` — `AC6 säilyttää Gb-duurin nolla-askeleella` | `{ mode:"major", sourceTonic:"Gb", step:0 }` | `{ status:"ready", sourceTonic:"Gb", targetTonic:"Gb", mode:"major" }`; ei vaihtoehtoja |
| [ ] | AC7 | `transpositionSettings.test.ts` — `AC7 vaatii C-sharp- tai D-flat-duurin valinnan` | `{ mode:"major", sourceTonic:"C", step:1 }` | `status === "requiresEnharmonicChoice"`; vaihtoehdot `C#-duuri`, `Db-duuri`; ei ready-tulosta |
| [ ] | AC8 | `ui.test.ts` — `AC8 D-flat-duurin valinta vahvistaa ja sulkee lisävalinnan` | Avaa C#/Db-valinta ja valitse `Db-duuri` | Kohde `Db-duuri`; tila `ready`; `enharmonic-choice.hidden === true` |
| [ ] | AC9 | `transpositionSettings.test.ts` — `AC9 vaatii D-sharp- tai E-flat-mollin valinnan` | `{ mode:"minor", sourceTonic:"D", step:1 }` | `status === "requiresEnharmonicChoice"`; vaihtoehdot `D#-molli`, `Eb-molli`; ei ready-tulosta |
| [ ] | AC10 | `transpositionSettings.test.ts` — `AC10 valitsee A-duurista B-flat-duurin` | `{ mode:"major", sourceTonic:"A", step:1 }` | Kohde `Bb`, mode `major`, status `ready`; ei `A#`-vaihtoehtoa |
| [ ] | AC11 | `transpositionSettings.test.ts` — `AC11 valitsee C-mollista C-sharp-mollin` | `{ mode:"minor", sourceTonic:"C", step:1 }` | Kohde `C#`, mode `minor`, status `ready`; ei `Db`-vaihtoehtoa |
| [ ] | AC12 | `transpositionSettings.test.ts` — `AC12 hyväksyy positiivisen rajan 11` | `{ mode:"major", sourceTonic:"C", step:11 }` | `requiresEnharmonicChoice`; vaihtoehdot `B-duuri`, `Cb-duuri` |
| [ ] | AC13 | `transpositionSettings.test.ts` — `AC13 hyväksyy negatiivisen rajan -11` | `{ mode:"major", sourceTonic:"C", step:-11 }` | `requiresEnharmonicChoice`; vaihtoehdot `C#-duuri`, `Db-duuri` |
| [ ] | AC14 | `transpositionSettings.test.ts` — `AC14 hylkää askelmäärän -12` | C-duuri, `step:-12` | Heittää `Askelmäärän pitää olla kokonaisluku väliltä -11–11` |
| [ ] | AC15 | `transpositionSettings.test.ts` — `AC15 hylkää askelmäärän 12` | C-duuri, `step:12` | Heittää `Askelmäärän pitää olla kokonaisluku väliltä -11–11` |
| [ ] | AC16 | `transpositionSettings.test.ts` — `AC16 hylkää desimaalisen askelmäärän` | C-duuri, `step:1.5` | Heittää `Askelmäärän pitää olla kokonaisluku väliltä -11–11` |
| [ ] | AC17 | `ui.test.ts` — `AC17 puuttuva toonika estää vahvistamisen` | Valitse major ja step 1, jätä toonika tyhjäksi, vahvista | Logiikkaa ei kutsuta; näkyvä virhe `Valitse lähtösävellaji` |
| [ ] | AC18 | `ui.test.ts` — `AC18 puuttuva moodi estää vahvistamisen` | Jätä mode valitsematta ja vahvista | Logiikkaa ei kutsuta; näkyvä virhe `Valitse duuri tai molli` |
| [ ] | AC19 | `transpositionSettings.test.ts` — `AC19 normalisoi H-duurin B-duuriksi` | `{ mode:"major", sourceTonic:"H", step:0 }` | Lähdön ja kohteen toonika `B`; status `ready` |
| [ ] | AC20 | `transpositionSettings.test.ts` — `AC20 hylkää tuntemattoman J-toonikan` | `{ mode:"major", sourceTonic:"J", step:1 }` | Heittää `Tuntematon lähtösävellaji: J` |
| [ ] | AC21 | `transpositionSettings.test.ts` — `AC21 hylkää tarpeettoman flat-valinnan` | `{ mode:"major", sourceTonic:"C", step:2, enharmonicChoice:"flat" }` | Heittää `Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa` |

## Testiympäristö

- Logiikkatestit ajetaan Vitestin Node-ympäristössä ilman DOM:ia.
- Käyttöliittymätestit ajetaan Happy DOM -ympäristössä ja ne käyttävät oikeita
  DOM-elementtejä sekä `change`, `click` ja näppäimistötapahtumia;
  verkkoselainta tai verkkoyhteyttä ei tarvita.
- Jokainen AC näkyy täsmälleen yhdellä ensisijaisella testirivillä. Yhteisiä
  apufunktioita saa käyttää testidatan rakentamiseen, mutta odotusarvoja ei
  lasketa testattavalla tuotantokoodilla.

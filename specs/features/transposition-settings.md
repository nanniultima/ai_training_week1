# Feature: Transponointiasetusten valinta

## Problem Statement

Transponointi tarvitsee lähtösävellajin, sävellajin laadun ja
puolisävelaskelten määrän. Vapaana tekstinä annettu sävellaji voisi olla
virheellinen tai epäkäytännöllinen. Lisäksi samalla kohdesävelkorkeudella voi
olla kaksi käyttökelpoista nimeä, kuten C#-duuri ja Db-duuri.

Käyttöliittymän pitää ohjata käyttäjä antamaan yksiselitteiset asetukset ja
pyytää enharmoninen lisävalinta vain silloin, kun sitä todella tarvitaan.

## Proposed Change

Transponointiasetukset valitaan seuraavassa järjestyksessä:

1. Käyttäjä valitsee `duuri` tai `molli`.
2. Käyttöliittymä näyttää valitulle laadulle sopivan lähtösävellajilistan.
3. Käyttäjä valitsee lähtösävellajin listasta.
4. Käyttäjä antaa kokonaislukuna puolisävelaskelten määrän väliltä
   `-11`–`11`.
5. Käyttäjä vahvistaa asetukset Enterillä tai Transponoi-painikkeella.
6. Sovellus laskee kohdesävellajin.
7. Jos kohteella on kaksi käytännöllistä kirjoitusasua, sovellus näyttää
   niiden nimet ja vaatii käyttäjää valitsemaan toisen ennen jatkamista.

Enharmoninen valinta ei ole näkyvissä ennen asetusten vahvistamista eikä
silloin, kun kohdesävellajilla on vain yksi käytännöllinen nimi.

### Lähtösävellajilistat

Listoissa näytetään vain sävellajit, jotka voidaan kirjoittaa ilman
kaksoisylennyksiä tai kaksoisalennuksia ja enintään seitsemällä tavallisella
etumerkillä.

Duuri:

```text
C, G, D, A, E, B, F#, C#, F, Bb, Eb, Ab, Db, Gb, Cb
```

Molli:

```text
A, E, B, F#, C#, G#, D#, A#, D, G, C, F, Bb, Eb, Ab
```

Kun käyttäjä vaihtaa duurista molliin tai päinvastoin, lähtösävellajin
aiempi valinta tyhjennetään. Näin vanhaa valintaa ei käytetä vahingossa, vaikka
sama toonikan nimi kuuluisi molempiin listoihin.

### Kohdesävellajin laskenta

Yksi askel tarkoittaa yhtä puolisävelaskelta. Positiivinen arvo siirtää
ylöspäin ja negatiivinen alaspäin. Sävellajin laatu säilyy: duuri pysyy
duurina ja molli mollina.

Arvo `0` säilyttää lähtösävellajin nimen ja laadun. Se ei estä myöhempiä
muotoilu- ja kohdistuskäsittelyjä, mutta tämä speksi ei vielä toteuta niitä.

### Enharmoninen lisävalinta

Kahden vaihtoehdon tilanteessa käyttöliittymä näyttää täsmälliset
kohdesävellajien nimet, ei yleisiä `#`- ja `b`-painikkeita. Ensimmäisessä
versiossa kahden käytännöllisen vaihtoehdon tapaukset ovat:

| Laatu | Vaihtoehdot |
|---|---|
| duuri | C#-duuri / Db-duuri |
| duuri | F#-duuri / Gb-duuri |
| duuri | B-duuri / Cb-duuri |
| molli | D#-molli / Eb-molli |
| molli | G#-molli / Ab-molli |
| molli | A#-molli / Bb-molli |

Muissa tapauksissa sovellus valitsee ainoan käytännöllisen nimen. Esimerkiksi
A#-duuria ei tarjota, vaan tuloksena käytetään Bb-duuria. Db-mollia ei
tarjota, vaan samalla sävelkorkeudella käytetään C#-mollia.

### Liiketoimintalogiikan validointi

Vaikka käyttöliittymä rajaa valinnat listoilla, asetukset validoidaan myös
liiketoimintalogiikassa. H hyväksytään ohjelmallisessa syötteessä B:n
vaihtoehdoksi ja normalisoidaan B:ksi. Alennettu B on aina `Bb`.

Tarpeeton enharmoninen valinta hylätään ohjelmointivirheenä. Esimerkiksi
C-duuri + 2 tuottaa yksiselitteisesti D-duurin, joten sille ei voi antaa
erillistä sharp/flat-valintaa.

Tämä ominaisuus tuottaa validoidut transponointiasetukset. Se ei vielä muuta
sointuja, säveliä tai rikastekstiä.

## Acceptance Criteria

### AC1: Duurivalinta näyttää duurisävellajit
**Given** sävellajin laatua ei ole vielä valittu
**When** käyttäjä valitsee `duuri`
**Then** lähtösävellajilista sisältää täsmälleen 15 arvoa `C, G, D, A, E, B, F#, C#, F, Bb, Eb, Ab, Db, Gb, Cb`

### AC2: Mollivalinta näyttää mollisävellajit
**Given** sävellajin laatua ei ole vielä valittu
**When** käyttäjä valitsee `molli`
**Then** lähtösävellajilista sisältää täsmälleen 15 arvoa `A, E, B, F#, C#, G#, D#, A#, D, G, C, F, Bb, Eb, Ab`

### AC3: Laadun vaihtaminen tyhjentää lähtösävellajin
**Given** käyttäjä on valinnut C-duurin
**When** käyttäjä vaihtaa laaduksi `molli`
**Then** lähtösävellajin valinta on tyhjä ja mollisävellajilista on näkyvissä

### AC4: Duurisävellaji transponoidaan ylöspäin
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `2`
**When** asetukset vahvistetaan
**Then** kohdesävellaji on D-duuri, tila on `ready` eikä enharmonista valintaa näytetä

### AC5: Mollisävellaji transponoidaan alaspäin
**Given** käyttäjä on valinnut A-mollin ja askelmäärän `-2`
**When** asetukset vahvistetaan
**Then** kohdesävellaji on G-molli, tila on `ready` eikä enharmonista valintaa näytetä

### AC6: Nolla askelta säilyttää lähtösävellajin
**Given** käyttäjä on valinnut Gb-duurin ja askelmäärän `0`
**When** asetukset vahvistetaan
**Then** kohdesävellaji on Gb-duuri, tila on `ready` eikä enharmonista valintaa näytetä

### AC7: Kaksi järkevää duurivaihtoehtoa avaa valinnan
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `1`
**When** asetukset vahvistetaan
**Then** tila on `requiresEnharmonicChoice`, näkyviin tulevat täsmälleen vaihtoehdot `C#-duuri` ja `Db-duuri`, eikä transponointia jatketa

### AC8: Duurin enharmoninen valinta vahvistaa asetukset
**Given** näkyvissä ovat vaihtoehdot C#-duuri ja Db-duuri
**When** käyttäjä valitsee `Db-duuri`
**Then** kohdesävellaji on Db-duuri, tila on `ready` ja lisävalinta suljetaan

### AC9: Kaksi järkevää mollivaihtoehtoa avaa valinnan
**Given** käyttäjä on valinnut D-mollin ja askelmäärän `1`
**When** asetukset vahvistetaan
**Then** tila on `requiresEnharmonicChoice`, näkyviin tulevat täsmälleen vaihtoehdot `D#-molli` ja `Eb-molli`, eikä transponointia jatketa

### AC10: Epäkäytännöllistä duurinimeä ei tarjota
**Given** käyttäjä on valinnut A-duurin ja askelmäärän `1`
**When** asetukset vahvistetaan
**Then** kohdesävellaji on Bb-duuri, tila on `ready` eikä A#-duuria tai enharmonista valintaa näytetä

### AC11: Epäkäytännöllistä mollinimeä ei tarjota
**Given** käyttäjä on valinnut C-mollin ja askelmäärän `1`
**When** asetukset vahvistetaan
**Then** kohdesävellaji on C#-molli, tila on `ready` eikä Db-mollia tai enharmonista valintaa näytetä

### AC12: Positiivinen enimmäisaskel hyväksytään
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `11`
**When** asetukset vahvistetaan
**Then** tila on `requiresEnharmonicChoice` ja vaihtoehdot ovat täsmälleen `B-duuri` ja `Cb-duuri`

### AC13: Negatiivinen enimmäisaskel hyväksytään
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `-11`
**When** asetukset vahvistetaan
**Then** tila on `requiresEnharmonicChoice` ja vaihtoehdot ovat täsmälleen `C#-duuri` ja `Db-duuri`

### AC14: Liian pieni askelmäärä hylätään
**Given** lähtösävellaji on C-duuri ja askelmäärä on `-12`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

### AC15: Liian suuri askelmäärä hylätään
**Given** lähtösävellaji on C-duuri ja askelmäärä on `12`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

### AC16: Desimaalinen askelmäärä hylätään
**Given** lähtösävellaji on C-duuri ja askelmäärä on `1.5`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

### AC17: Puuttuva lähtösävellaji estää vahvistamisen
**Given** käyttäjä on valinnut duurin ja askelmäärän `1`, mutta ei lähtösävellajia
**When** käyttäjä yrittää vahvistaa asetukset
**Then** käsittelyä ei aloiteta ja näytetään virhe `Valitse lähtösävellaji`

### AC18: Puuttuva duuri- tai mollivalinta estää vahvistamisen
**Given** käyttäjä ei ole valinnut sävellajin laatua
**When** käyttäjä yrittää vahvistaa asetukset
**Then** käsittelyä ei aloiteta ja näytetään virhe `Valitse duuri tai molli`

### AC19: H normalisoidaan ohjelmallisessa syötteessä B:ksi
**Given** asetustoiminnolle annetaan H-duuri ja askelmäärä `0`
**When** asetukset ratkaistaan
**Then** normalisoitu lähtötoonika ja kohdetoonika ovat `B`

### AC20: Tuntematon ohjelmallinen toonika hylätään
**Given** asetustoiminnolle annetaan J-duuri ja askelmäärä `1`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Tuntematon lähtösävellaji: J`

### AC21: Tarpeeton enharmoninen valinta hylätään
**Given** asetustoiminnolle annetaan C-duuri, askelmäärä `2` ja enharmoninen valinta `flat`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa`

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Lisää sävellajin laatu-, toonika-, enharmoninen valinta-, asetussyöte- ja asetustulostyypit. |
| `src/logic/transpositionSettings.ts` | Lisää listojen muodostus, validointi, H/B-normalisointi, kohdesävellajin laskenta ja vaihtoehtojen ratkaisu. |
| `src/logic/transpositionSettings.test.ts` | Lisää liiketoimintalogiikan onnistumis-, raja- ja virhetestit. |
| `src/ui/ui.ts` | Lisää ehdolliset laatu-, lähtösävellaji- ja enharmoniset valinnat sekä vahvistamisen käyttöliittymätoiminta. |
| `src/ui/ui.test.ts` | Testaa valintojen näkyvyys, listojen sisältö, laadun vaihtaminen ja käyttöliittymävirheet. |

## Risk

- What could break: Duuri- ja mollilistat poikkeavat toisistaan. Yhteinen
  toonikalista voisi tarjota kaksoismerkkejä vaativia sävellajeja.
- What could break: Enharmonisen valinnan näyttäminen jatkuvasti antaisi
  käyttäjälle mahdollisuuden tehdä ristiriitainen valinta.
- What could break: H/B-normalisointi voi yllättää vanhaa merkintätapaa
  käyttävän käyttäjän. Tässä sovelluksessa B tarkoittaa aina kansainvälistä
  B-säveltä ja alennettu B kirjoitetaan Bb.
- What could break: Enterin ja Transponoi-painikkeen pitää käyttää samaa
  validointi- ja vahvistustoimintoa, jotta tulokset eivät eroa.
- Rollback: Poista asetusten ratkaisutoiminto ja uudet käyttöliittymävalinnat.
  Nykyinen askelkenttä voidaan jättää takaisin näkyviin ilman integraatiota.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `getAvailableTonics` | AC1 duurilista | Laatu `major` | Haetaan lista | Täsmälleen määritellyt 15 duuritoonikaa |
| `getAvailableTonics` | AC2 mollilista | Laatu `minor` | Haetaan lista | Täsmälleen määritellyt 15 mollitoonikaa |
| käyttöliittymä | AC3 laadun vaihto | C-duuri valittuna | Valitaan molli | Toonika tyhjenee ja mollilista näkyy |
| `resolveTranspositionSettings` | AC4 duuri ylöspäin | C-duuri, `2` | Ratkaistaan | D-duuri, `ready`, ei lisävalintaa |
| `resolveTranspositionSettings` | AC5 molli alaspäin | A-molli, `-2` | Ratkaistaan | G-molli, `ready`, ei lisävalintaa |
| `resolveTranspositionSettings` | AC6 nolla | Gb-duuri, `0` | Ratkaistaan | Gb-duuri, `ready`, ei lisävalintaa |
| `resolveTranspositionSettings` | AC7 duurivaihtoehdot | C-duuri, `1` | Ratkaistaan | C#/Db-vaihtoehdot, käsittely odottaa |
| käyttöliittymä | AC8 vaihtoehdon valinta | C#/Db näkyvissä | Valitaan Db | Db-duuri, `ready`, valinta sulkeutuu |
| `resolveTranspositionSettings` | AC9 mollivaihtoehdot | D-molli, `1` | Ratkaistaan | D#/Eb-vaihtoehdot, käsittely odottaa |
| `resolveTranspositionSettings` | AC10 käytännöllinen duuri | A-duuri, `1` | Ratkaistaan | Bb-duuri, ei A#:a eikä valintaa |
| `resolveTranspositionSettings` | AC11 käytännöllinen molli | C-molli, `1` | Ratkaistaan | C#-molli, ei Db:tä eikä valintaa |
| `resolveTranspositionSettings` | AC12 positiivinen raja | C-duuri, `11` | Ratkaistaan | B/Cb-vaihtoehdot |
| `resolveTranspositionSettings` | AC13 negatiivinen raja | C-duuri, `-11` | Ratkaistaan | C#/Db-vaihtoehdot |
| `resolveTranspositionSettings` | AC14 liian pieni | C-duuri, `-12` | Ratkaistaan | Täsmällinen askelmäärävirhe |
| `resolveTranspositionSettings` | AC15 liian suuri | C-duuri, `12` | Ratkaistaan | Täsmällinen askelmäärävirhe |
| `resolveTranspositionSettings` | AC16 desimaali | C-duuri, `1.5` | Ratkaistaan | Täsmällinen askelmäärävirhe |
| käyttöliittymä | AC17 toonika puuttuu | Duuri ja `1`, ei toonikaa | Vahvistetaan | Virhe `Valitse lähtösävellaji` |
| käyttöliittymä | AC18 laatu puuttuu | Ei laatua | Vahvistetaan | Virhe `Valitse duuri tai molli` |
| `resolveTranspositionSettings` | AC19 H-normalisointi | H-duuri, `0` | Ratkaistaan | Lähtö ja kohde B |
| `resolveTranspositionSettings` | AC20 tuntematon toonika | J-duuri, `1` | Ratkaistaan | Virhe `Tuntematon lähtösävellaji: J` |
| `resolveTranspositionSettings` | AC21 tarpeeton valinta | C-duuri, `2`, `flat` | Ratkaistaan | Virhe tarpeettomasta valinnasta |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

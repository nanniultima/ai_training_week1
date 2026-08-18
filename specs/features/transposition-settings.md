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
5. Kun laatu ja lähtösävellaji on valittu ja askelkentässä on kelvollinen
   arvo, sovellus laskee kohdesävellajin automaattisesti.
6. Jos kohteella on yksi käytännöllinen kirjoitusasu, sovellus näyttää
   esikatselun muodossa `Kohdesävellaji: D-duuri`.
7. Jos kohteella on kaksi käytännöllistä kirjoitusasua, sovellus näyttää
   niiden nimet ja vaatii käyttäjää valitsemaan toisen ennen jatkamista.

Kohdesävellajin esikatselua tai enharmonista valintaa ei näytetä, jos laatu
tai lähtösävellaji puuttuu tai askelkentän arvo ei ole kelvollinen.
Enharmonista valintaa ei näytetä silloin, kun kohdesävellajilla on vain yksi
käytännöllinen nimi.

`Transponoi`-painike on varattu musiikkisyötteen varsinaiselle
transponoinnille. Kohdesävellajin esikatselu ei vaadi painikkeen painamista
eikä itsessään muuta musiikkisyötettä.

### Laskentakirjasto

Sävelnimien validointiin ja kromaattisen sävelkorkeuden (`0`–`11`)
ratkaisemiseen käytetään `@tonaljs/note`-kirjastoa. Sovellus omistaa edelleen
sallitut duuri- ja mollitoonikalistat sekä kohteen käytännöllisten nimien
valinnan, jotta kirjasto ei päätä enharmonista kirjoitusasua speksin puolesta.

### Lähtösävellajilistat

Listoissa näytetään vain sävellajit, jotka voidaan kirjoittaa ilman
kaksoisylennyksiä tai kaksoisalennuksia ja enintään seitsemällä tavallisella
etumerkillä.

Duuri:

```text
C, C#, Db, D, Eb, E, F, F#, Gb, G, Ab, A, Bb, B, Cb
```

Molli:

```text
C, C#, D, D#, Eb, E, F, F#, G, G#, Ab, A, A#, Bb, B
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
**Then** lähtösävellajilista sisältää sävelkorkeusjärjestyksessä täsmälleen 15 arvoa `C, C#, Db, D, Eb, E, F, F#, Gb, G, Ab, A, Bb, B, Cb`

### AC2: Mollivalinta näyttää mollisävellajit
**Given** sävellajin laatua ei ole vielä valittu
**When** käyttäjä valitsee `molli`
**Then** lähtösävellajilista sisältää sävelkorkeusjärjestyksessä täsmälleen 15 arvoa `C, C#, D, D#, Eb, E, F, F#, G, G#, Ab, A, A#, Bb, B`

### AC3: Laadun vaihtaminen tyhjentää lähtösävellajin
**Given** käyttäjä on valinnut C-duurin
**When** käyttäjä vaihtaa laaduksi `molli`
**Then** lähtösävellajin valinta on tyhjä ja mollisävellajilista on näkyvissä

### AC4: Kaikki duuritoonikat ja sallitut askeleet lasketaan
**Given** lähtösävellaji on mikä tahansa AC1:n 15 duuritoonikasta ja askel on mikä tahansa kokonaisluku väliltä `-11`–`11`
**When** asetukset ratkaistaan jokaisella 345 yhdistelmällä
**Then** kohteen kromaattinen sävelkorkeus on täsmälleen `(lähtö + askel) modulo 12`, laatu on `major`, askel `0` säilyttää lähtötoonikan nimen, epäselvä ei-nolla-kohde palauttaa speksin kaksi käytännöllistä vaihtoehtoa ja muu kohde speksin ainoan käytännöllisen nimen

### AC5: Kaikki mollitoonikat ja sallitut askeleet lasketaan
**Given** lähtösävellaji on mikä tahansa AC2:n 15 mollitoonikasta ja askel on mikä tahansa kokonaisluku väliltä `-11`–`11`
**When** asetukset ratkaistaan jokaisella 345 yhdistelmällä
**Then** kohteen kromaattinen sävelkorkeus on täsmälleen `(lähtö + askel) modulo 12`, laatu on `minor`, askel `0` säilyttää lähtötoonikan nimen, epäselvä ei-nolla-kohde palauttaa speksin kaksi käytännöllistä vaihtoehtoa ja muu kohde speksin ainoan käytännöllisen nimen

### AC6: Duurisävellaji transponoidaan ylöspäin
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `2`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** kohdesävellaji lasketaan automaattisesti D-duuriksi, tila on `ready`, esikatselu on `Kohdesävellaji: D-duuri` eikä enharmonista valintaa näytetä

### AC7: Mollisävellaji transponoidaan alaspäin
**Given** käyttäjä on valinnut A-mollin ja askelmäärän `-2`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** kohdesävellaji lasketaan automaattisesti G-molliksi, tila on `ready`, esikatselu on `Kohdesävellaji: G-molli` eikä enharmonista valintaa näytetä

### AC8: Nolla askelta säilyttää lähtösävellajin
**Given** käyttäjä on valinnut Gb-duurin ja askelmäärän `0`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** kohdesävellaji on Gb-duuri, tila on `ready` eikä enharmonista valintaa näytetä

### AC9: Kaksi järkevää duurivaihtoehtoa avaa valinnan
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `1`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** tila on `requiresEnharmonicChoice`, näkyviin tulevat automaattisesti täsmälleen vaihtoehdot `C#-duuri` ja `Db-duuri`, kohdesävellajin esikatselua ei vielä näytetä eikä musiikkisyötettä transponoida

### AC10: Duurin enharmoninen valinta vahvistaa asetukset
**Given** näkyvissä ovat vaihtoehdot C#-duuri ja Db-duuri
**When** käyttäjä valitsee `Db-duuri`
**Then** kohdesävellaji on Db-duuri, tila on `ready` ja lisävalinta suljetaan

### AC11: Kaksi järkevää mollivaihtoehtoa avaa valinnan
**Given** käyttäjä on valinnut D-mollin ja askelmäärän `1`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** tila on `requiresEnharmonicChoice`, näkyviin tulevat automaattisesti täsmälleen vaihtoehdot `D#-molli` ja `Eb-molli`, kohdesävellajin esikatselua ei vielä näytetä eikä musiikkisyötettä transponoida

### AC12: Epäkäytännöllistä duurinimeä ei tarjota
**Given** käyttäjä on valinnut A-duurin ja askelmäärän `1`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** kohdesävellaji on Bb-duuri, tila on `ready` eikä A#-duuria tai enharmonista valintaa näytetä

### AC13: Epäkäytännöllistä mollinimeä ei tarjota
**Given** käyttäjä on valinnut C-mollin ja askelmäärän `1`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** kohdesävellaji on C#-molli, tila on `ready` eikä Db-mollia tai enharmonista valintaa näytetä

### AC14: Positiivinen enimmäisaskel hyväksytään
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `11`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** tila on `requiresEnharmonicChoice` ja vaihtoehdot ovat täsmälleen `B-duuri` ja `Cb-duuri`

### AC15: Negatiivinen enimmäisaskel hyväksytään
**Given** käyttäjä on valinnut C-duurin ja askelmäärän `-11`
**When** kaikki kolme valintaa ovat kelvollisia
**Then** tila on `requiresEnharmonicChoice` ja vaihtoehdot ovat täsmälleen `C#-duuri` ja `Db-duuri`

### AC16: Liian pieni askelmäärä hylätään
**Given** lähtösävellaji on C-duuri ja askelmäärä on `-12`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

### AC17: Liian suuri askelmäärä hylätään
**Given** lähtösävellaji on C-duuri ja askelmäärä on `12`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

### AC18: Desimaalinen askelmäärä hylätään
**Given** lähtösävellaji on C-duuri ja askelmäärä on `1.5`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Askelmäärän pitää olla kokonaisluku väliltä -11–11`

### AC19: Puuttuva lähtösävellaji estää vahvistamisen
**Given** käyttäjä on valinnut duurin ja askelmäärän `1`, mutta ei lähtösävellajia
**When** käyttäjä yrittää vahvistaa asetukset
**Then** käsittelyä ei aloiteta ja näytetään virhe `Valitse lähtösävellaji`

### AC20: Puuttuva duuri- tai mollivalinta estää vahvistamisen
**Given** käyttäjä ei ole valinnut sävellajin laatua
**When** käyttäjä yrittää vahvistaa asetukset
**Then** käsittelyä ei aloiteta ja näytetään virhe `Valitse duuri tai molli`

### AC21: H normalisoidaan ohjelmallisessa syötteessä B:ksi
**Given** asetustoiminnolle annetaan H-duuri ja askelmäärä `0`
**When** asetukset ratkaistaan
**Then** normalisoitu lähtötoonika ja kohdetoonika ovat `B`

### AC22: Tuntematon ohjelmallinen toonika hylätään
**Given** asetustoiminnolle annetaan J-duuri ja askelmäärä `1`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Tuntematon lähtösävellaji: J`

### AC23: Tarpeeton enharmoninen valinta hylätään
**Given** asetustoiminnolle annetaan C-duuri, askelmäärä `2` ja enharmoninen valinta `flat`
**When** asetukset ratkaistaan
**Then** toiminto heittää virheen täsmällisellä viestillä `Kohdesävellaji D-duuri ei tarvitse enharmonista valintaa`

### AC24: Yksiselitteinen kohdesävellaji näytetään automaattisesti
**Given** käyttäjä on valinnut C-duurin ja askelkentän arvo on `2`
**When** käyttäjä valitsee lähtötoonikaksi `C`
**Then** näkyviin tulee ilman Enteriä tai painikkeen painamista täsmälleen `Kohdesävellaji: D-duuri` eikä enharmonista valintaa näytetä

### AC25: Enharmoniset vaihtoehdot näytetään automaattisesti
**Given** käyttäjä on valinnut C-duurin ja askelkentän arvo on `1`
**When** käyttäjä valitsee lähtötoonikaksi `C`
**Then** ilman Enteriä tai painikkeen painamista näkyviin tulevat täsmälleen vaihtoehdot `C#-duuri` ja `Db-duuri`, eikä kohdesävellajin esikatselua vielä näytetä

### AC26: Keskeneräiset tai virheelliset valinnat eivät näytä kohdetta
**Given** vähintään yksi seuraavista toteutuu: laatua ei ole valittu, lähtötoonikaa ei ole valittu tai askelkentän arvo ei ole kokonaisluku väliltä `-11`–`11`
**When** käyttöliittymän kohdesävellajitila päivitetään
**Then** kohdesävellajin esikatselu ja enharmoninen valinta ovat molemmat piilossa eikä musiikkisyötettä muuteta

## Files to Modify

| File | Change |
|---|---|
| `package.json` | Lisää `happy-dom` kehitysriippuvuudeksi käyttöliittymätestien DOM-ympäristöä varten. |
| `package-lock.json` | Lukitse asennettu `happy-dom`-versio ja sen riippuvuudet toistettavia asennuksia varten. |
| `src/types.ts` | Lisää sävellajin laatu-, toonika-, enharmoninen valinta-, asetussyöte- ja asetustulostyypit. |
| `src/logic/transpositionSettings.ts` | Lisää listojen muodostus, validointi, H/B-normalisointi, kohdesävellajin laskenta ja vaihtoehtojen ratkaisu. |
| `src/logic/transpositionSettings.major.fixture.ts` | Tallenna AC4:n kaikki 345 duuriyhdistelmää eksplisiittisinä, ilman testiajon aikana muodostettavia odotuksia. |
| `src/logic/transpositionSettings.minor.fixture.ts` | Tallenna AC5:n kaikki 345 molliyhdistelmää eksplisiittisinä, ilman testiajon aikana muodostettavia odotuksia. |
| `src/logic/transpositionSettings.test.ts` | Lisää liiketoimintalogiikan onnistumis-, raja- ja virhetestit. |
| `src/ui/ui.ts` | Lisää ehdolliset laatu-, lähtösävellaji- ja enharmoniset valinnat sekä vahvistamisen käyttöliittymätoiminta. |
| `src/ui/ui.test.ts` | Testaa Happy DOM -ympäristössä valintojen näkyvyys, listojen sisältö, laadun vaihtaminen ja käyttöliittymävirheet. |

Lisäksi `package.json` ja `package-lock.json` lisäävät ja lukitsevat
`@tonaljs/note`-tuotantoriippuvuuden kromaattisen sävelkorkeuden ratkaisemista
varten.

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
- What could break: Automaattinen esikatselu voi näyttää vanhan tuloksen, jos
  jokainen laatu-, toonika- ja askelmuutos ei kulje saman päivitystoiminnon
  kautta.
- What could break: Tonal voi valita enharmonisen nimen eri tavalla kuin
  speksi. Kirjastolta käytetään vain validointia ja kromaattista sävelkorkeutta;
  näkyvä nimi valitaan aina sovelluksen omasta taulukosta.
- Rollback: Poista asetusten ratkaisutoiminto ja uudet käyttöliittymävalinnat.
  Nykyinen askelkenttä voidaan jättää takaisin näkyviin ilman integraatiota.

## Testing Strategy (MANDATORY)

| Function | Case | Given | When | Then |
|---|---|---|---|---|
| `getAvailableTonics` | AC1 duurilista sävelkorkeusjärjestyksessä | Laatu `major` | Haetaan lista | Täsmälleen `C, C#, Db, D, Eb, E, F, F#, Gb, G, Ab, A, Bb, B, Cb` tässä järjestyksessä |
| `getAvailableTonics` | AC2 mollilista sävelkorkeusjärjestyksessä | Laatu `minor` | Haetaan lista | Täsmälleen `C, C#, D, D#, Eb, E, F, F#, G, G#, Ab, A, A#, Bb, B` tässä järjestyksessä |
| käyttöliittymä | AC3 laadun vaihto | C-duuri valittuna | Valitaan molli | Toonika tyhjenee ja mollilista näkyy |
| `resolveTranspositionSettings` | AC4 kaikki duuriyhdistelmät | AC1:n 15 toonikaa × 23 askelta | Ratkaistaan taulukkotestinä | Kaikki 345 kohdesävelkorkeutta, tilaa ja nimeä vastaavat eksplisiittistä fixture-taulukkoa |
| `resolveTranspositionSettings` | AC5 kaikki molliyhdistelmät | AC2:n 15 toonikaa × 23 askelta | Ratkaistaan taulukkotestinä | Kaikki 345 kohdesävelkorkeutta, tilaa ja nimeä vastaavat eksplisiittistä fixture-taulukkoa |
| `resolveTranspositionSettings` | AC6 duuri ylöspäin | C-duuri, `2` | Ratkaistaan | D-duuri, `ready`, ei lisävalintaa |
| `resolveTranspositionSettings` | AC7 molli alaspäin | A-molli, `-2` | Ratkaistaan | G-molli, `ready`, ei lisävalintaa |
| `resolveTranspositionSettings` | AC8 nolla | Gb-duuri, `0` | Ratkaistaan | Gb-duuri, `ready`, ei lisävalintaa |
| `resolveTranspositionSettings` | AC9 duurivaihtoehdot | C-duuri, `1` | Ratkaistaan | C#/Db-vaihtoehdot, käsittely odottaa |
| käyttöliittymä | AC10 vaihtoehdon valinta | C#/Db näkyvissä | Valitaan Db | Db-duuri, `ready`, valinta sulkeutuu |
| `resolveTranspositionSettings` | AC11 mollivaihtoehdot | D-molli, `1` | Ratkaistaan | D#/Eb-vaihtoehdot, käsittely odottaa |
| `resolveTranspositionSettings` | AC12 käytännöllinen duuri | A-duuri, `1` | Ratkaistaan | Bb-duuri, ei A#:a eikä valintaa |
| `resolveTranspositionSettings` | AC13 käytännöllinen molli | C-molli, `1` | Ratkaistaan | C#-molli, ei Db:tä eikä valintaa |
| `resolveTranspositionSettings` | AC14 positiivinen raja | C-duuri, `11` | Ratkaistaan | B/Cb-vaihtoehdot |
| `resolveTranspositionSettings` | AC15 negatiivinen raja | C-duuri, `-11` | Ratkaistaan | C#/Db-vaihtoehdot |
| `resolveTranspositionSettings` | AC16 liian pieni | C-duuri, `-12` | Ratkaistaan | Täsmällinen askelmäärävirhe |
| `resolveTranspositionSettings` | AC17 liian suuri | C-duuri, `12` | Ratkaistaan | Täsmällinen askelmäärävirhe |
| `resolveTranspositionSettings` | AC18 desimaali | C-duuri, `1.5` | Ratkaistaan | Täsmällinen askelmäärävirhe |
| käyttöliittymä | AC19 toonika puuttuu | Duuri ja `1`, ei toonikaa | Vahvistetaan | Virhe `Valitse lähtösävellaji` |
| käyttöliittymä | AC20 laatu puuttuu | Ei laatua | Vahvistetaan | Virhe `Valitse duuri tai molli` |
| `resolveTranspositionSettings` | AC21 H-normalisointi | H-duuri, `0` | Ratkaistaan | Lähtö ja kohde B |
| `resolveTranspositionSettings` | AC22 tuntematon toonika | J-duuri, `1` | Ratkaistaan | Virhe `Tuntematon lähtösävellaji: J` |
| `resolveTranspositionSettings` | AC23 tarpeeton valinta | C-duuri, `2`, `flat` | Ratkaistaan | Virhe tarpeettomasta valinnasta |
| käyttöliittymä | AC24 automaattinen yksiselitteinen esikatselu | C-duuri, C, `2` | Viimeinen puuttuva valinta tehdään | `Kohdesävellaji: D-duuri` näkyy ilman vahvistusta |
| käyttöliittymä | AC25 automaattiset enharmoniset vaihtoehdot | C-duuri, C, `1` | Viimeinen puuttuva valinta tehdään | C#-/Db-vaihtoehdot näkyvät ilman vahvistusta; esikatselu piilossa |
| käyttöliittymä | AC26 keskeneräinen tai virheellinen tila | Puuttuva laatu, puuttuva toonika sekä askeleet `-12`, `12` ja `1.5` | Tila päivitetään | Esikatselu ja lisävalinta piilossa; musiikkisyöte muuttumaton |

## Spec Readiness checklist (run before calling the spec done)

- [x] Every AC has a precise expected value — no "works correctly"
- [x] Another person could write a test from each AC without asking
- [x] Every AC can fail — one that cannot fail proves nothing
- [x] Error and edge cases have ACs of their own
- [x] Every AC appears in the testing strategy table

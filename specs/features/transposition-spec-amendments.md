# Feature: Transponoinnin katsauksessa löytyneiden speksirajojen täsmennys

**Status:** Done

## Problem Statement

Loppukatsaus löysi neljä avoimeksi jäänyttä käyttäytymissääntöä ja kaksi
ristiriitaista hyväksymiskriteeriesimerkkiä. Säännöt pitää päättää ennen
tuotantokoodin tai testien muuttamista. Tämä muutosspeksi täydentää aiempia
Done-speksiä muuttamatta niiden tilaa takautuvasti. Muutoksen oma tila etenee
Draft → Ready for implementation → In Progress → Done.

## Proposed Change

Esimerkkikorjaukset on tehty alkuperäisiin spekseihin:

- result-and-copy AC51 käyttää kohdistusspeksin AC45:n mukaista kuutta
  välilyöntiä loppuputken edellä ja pipen saraketta 13.
- google-docs-copy-alignment AC1:n lähtösolmussa ei ole päättävää
  välilyöntiä, joten odotukseen ei lisätä sellaista.

### Hyväksytyt päätökset

Askelmäärällä `0` tehdään vain sointurivin sointujen ja aiemmin määriteltyjen
erillisten musiikkimerkkien `| , . - : / ( )` lihavointi. Tekstisisältö,
kirjainkoko, alkuperäinen sävelnimi, rekisteri, olemassa oleva kursivointi,
välilyönnit, toistomerkinnät ja sanojen yhdysmerkit säilyvät.
H/h normalisoidaan edelleen B:ksi sekä sävelissä että tuettujen sointujen
perus- ja bassosävelissä. Tämä on käyttäjän erikseen vahvistama poikkeus
nolla-askeleen muuttumattomuuteen. Sävelrivien Cb/B#-nimiä tai niiden
lähtörekistereitä ei muuteta.
Rivien välistä kohdistusta ei suoriteta myöskään monirivisissä ryhmissä.
Tarvittava sourceRange/alignedRange-metadata johdetaan muuttumattomasta
sisällöstä; metadatan lisääminen ei muuta näkyvää sisältöä.

Nolla-askeleen poikkeus koskee koko tulosputkea ja julkisia
transponointifunktioita. Se korvaa aiempien speksien nolla-askeleen
sävelnimien yleisen isontamisen ja kohdistuksen suorittamisen.
H/B-normalisoinnin aiempi sääntö säilyy.
Ei-nolla-askeleiden sääntöihin ei tehdä tällä päätöksellä muutoksia.
HTML:n turvallinen jäsentäminen ja syötteen rakenteen validointi säilyvät.
Nolla-askeleella ei lasketa sävelen uutta rekisteriä eikä aiheuteta
transponoinnin rekisterin alitus- tai ylitysvirhettä; virheellinen
lähtörekisteri, kuten 0 tai 5, hylätään edelleen.

Tyhjä puolisävelaskelkenttä on puuttuva pakollinen arvo, ei numero 0.
Esikatselu ja enharmoninen valinta piilotetaan. Painalluksessa näytetään
`Anna puolisävelaskelten määrä`, tulos tyhjennetään ja syötenäkymä näytetään
result-and-copy-speksin virhetilan mukaisesti. Eksplisiittinen `0` hyväksytään.
Puuttuvat laatu- ja toonikavalinnat tarkistetaan edelleen ennen askelkenttää.

Sointujen perus- ja bassosävelinä Cb, B#, Fb, E#, H# ja Hb eivät kuulu
tuettuun sointusanastoon. Niiden transponointia ei laajenneta.
Tiukka `transposeChordSymbol` hylkää näitä säveliä käyttävän sointumerkin
viestillä `Tuntematon sointumerkintä: <merkki>` myös nolla-askeleella.
Tolerantti `transposeChordLine` käyttää tukemattoman soinnun nykyistä
sääntöä: koko sointumerkki säilyy ja saa SUSPICIOUS_CHORD-varoituksen;
rivin muut tuetut soinnut transponoidaan normaalisti. Sama rajaus koskee
tuettujen päätteiden ja bassosointujen yhdistelmiä.
Sävelrivien enharmonisten nimien tuki säilyy ennallaan.

Kokonainen `cafe`-sana on aina tavallista tekstiä, kirjainkoosta riippumatta.
`cafe`, `Cafe` ja `CAFE` eivät ole sävelryhmiä rivin luokittelussa eivätkä
sointuja tai epäilyttäviä sointuja sointurivillä. Jos putketon rivi sisältää
kokonaisen cafe-tokenin, koko rivi on text, vaikka mukana olisi muita
sävelryhmiä. Cafe-token ei itsessään aiheuta AMBIGUOUS_NOTE_LINE-varoitusta;
samalla rivillä olevat muut aidot sävelryhmät voivat aiheuttaa varoituksen
nykyisen sekasisältösäännön mukaisesti. Putki ratkaisee edelleen chord-rivin,
mutta sen cafe-token pysyy muuttumattomana text-tokenina ilman sointuvaroitusta.
Poikkeus on sanakohtainen, ei muiden sanojen tai osamerkkijonojen sääntö.
Sävelkulun C–A–F–E voi kirjoittaa erillisinä ryhminä `c a f e`.

Koko tulos käyttää yhtä yhteistä fonttikokoa. Koko määräytyy syötteen
ensimmäisen sisältömerkin koosta, ei alkuvälilyönnin tai myöhempien merkkien
koosta. Tyhjät rivit ja alkuvälilyönnit ohitetaan vain koon valinnassa:
niitä ei poisteta sisällöstä. Sisältömerkki tarkoittaa ensimmäistä ei-tyhjemerkkiä
(nykyisen `resolveBaseFontSize`-funktion `\S`-säännön mukaisesti).
Sääntö koskee sekä nolla-askelta että ei-nolla-askeleita ja kaikkia
sointu-, sävel- ja tekstirivejä. Tämä on käyttäjän vahvistama ulkoasupoikkeus
nolla-askeleen muuttumattomuussääntöön. Jos määräävältä merkiltä puuttuu
eksplisiittinen koko, aiempi oletus 12 px säilyy. Myöhemmät koot eivät
muuta valittua yhteistä kokoa. Fontin kelvollisuuden nykyinen validointi säilyy.

### Suhde aiempiin spekseihin

Kaikki käyttäytymispäätökset on ratkaistu. Tämä muutosspeksi määrää uuden
toteutuksen hyväksymiskriteerit ja ohittaa siihen ristiriitaiset vanhat
nolla-askel- ja sanapoikkeusesimerkit. Alkuperäisten Done-speksien tilat
kuvaavat aiemmin toteutettua versiota. Niissä olevat muutosspeksiviitteet
osoittavat tulevan muutoksen; uusi käyttäytyminen on toteutettu muutosspeksin TDD-kierroksessa.

Vanhat nolla-askeleen normalisointi- ja kohdistustestit päivitetään uuden
säännön mukaan vasta TDD-vaiheessa, ennen tuotantokoodin muuttamista.
Ei-nolla-askeleiden transponointia ja kohdistusta todistavat testit säilyvät.

Katsauksen muut havainnot ovat erillisiä nykyisen speksin mukaisia
korjaustöitä. Tämä vaihe ei muuta koodia, testejä tai yleisiä käyttöohjeita.

## Acceptance Criteria

### AC1: Loppuputkiesimerkki on yhtenäinen
**Given** C-duuri +2, sointurivi `|Bm/F#       |` ja tekstirivi `niin kuin muut`
**When** koko transponointitulos muodostetaan
**Then** plainText on täsmälleen `|C#m/G#      |\nniin kuin muut`, loppuputki
alkaa sarakkeesta 13 ja varoitukset ovat `[]`.

### AC2: NBSP-esimerkki ei lisää puuttuvaa päättävää väliä
**Given** kopioitavan HTML:n tekstisolmut ovat `"        |G  |"` ja
`"Muistan kaikki"`
**When** HTML-kopio muodostetaan
**Then** ensimmäisen solmun tulos on täsmälleen
`NBSP×8 + "|G" + NBSP×2 + "|"`, missä NBSP on U+00A0, ja toinen solmu on
täsmälleen `"Muistan kaikki"` yhdellä ASCII-välillä.

### AC3: Nolla-askel säilyttää sävelnimet ja kaikki lähtörekisterit
**Given** sävelnimi on vuorollaan `c`, `Cb` tai `B#`, lähtörekisteri
on vuorollaan 1, 2, 3 tai 4 ja askelmäärä on 0
**When** `transposeNote` käsittelee sävelen ja sen tuloksen uudelleen
samoilla asetuksilla
**Then** molemmat tulokset ovat täsmälleen `{name: alkuperäinen nimi,
register: alkuperäinen rekisteri}`; esimerkiksi Cb/3 → Cb/3 → Cb/3 ja
B#/3 → B#/3 → B#/3. Myös Cb/1 ja B#/4 säilyvät ilman uutta rekisterivirhettä.

### AC4: Nolla-askel ohittaa kohdistuksen myös monirivisessä ryhmässä
**Given** syötteen rivit ovat `C# |G |`, `c# d` ja `on-pa` sekä askelmäärä 0
**When** koko transponointitulos muodostetaan
**Then** plainText on täsmälleen `C# |G |\nc# d\non-pa`; sointurivin pipejen
alignedRange.start-arvot ovat `[3,6]` ja sävelryhmien `[0,3]`, samat kuin
lähteessä. Sanojen viivaa ei poisteta eikä musiikkivälejä kuluteta.

### AC5: Nolla-askel säilyttää tuetut sointumerkit ja normalisoi H:n
**Given** sointumerkit ovat `H7`, `G/H`, `C#` ja `Db` sekä askelmäärä 0
**When** `transposeChordSymbol` käsittelee kunkin merkin
**Then** tulokset ovat järjestyksessä täsmälleen `B7`, `G/B`, `C#` ja `Db`.

### AC6: Nolla-askel lisää vain sovitun sointurivin lihavoinnin
**Given** tavallisesti muotoiltu sointurivi `H7 |G/H |`, sitä seuraava
teksti `onpa nyt` ja askelmäärä 0
**When** tulos muodostetaan
**Then** plainText on täsmälleen `B7 |G/B |\nonpa nyt`; B7, G/B ja molemmat
putket ovat lihavoituja. Tekstirivi säilyy tavallisena, eikä sen sisältö muutu.

### AC7: Sävelrivin lähdemuotoilu säilyy nolla-askeleella
**Given** note-rivin segmentit ovat tavallinen `c `, lihavoitu `d `,
lihavoitu ja kursivoitu `e ` sekä kursivoitu `f`
**When** tulos muodostetaan askelmäärällä 0
**Then** note-rivin näkyvä teksti on `c d e f`; merkkien c, d, e ja f
bold/italic-arvot ovat vastaavasti FF, TF, TT ja FT alkuperäisessä järjestyksessä.

### AC8: Tyhjä askelkenttä ei näytä kohde-esikatselua
**Given** UI:ssa on valittu C-duuri ja askel 2, jolloin D-duurin esikatselu
on näkyvissä
**When** käyttäjä tyhjentää askelkentän
**Then** sekä kohde-esikatselu että enharmoninen valinta ovat piilossa,
eikä musiikkisyötteen sisältö muutu.

### AC9: Tyhjä askelkenttä estää transponoinnin ja tyhjentää vanhan tuloksen
**Given** UI:ssa on valittu C-duuri, valmis vanha tulos `D |A |` ja tyhjä
puolisävelaskelkenttä
**When** käyttäjä painaa Transponoi
**Then** putkea ei kutsuta; näkyvä role=alert-viesti on täsmälleen
`Anna puolisävelaskelten määrä`, tulos ja varoitukset ovat tyhjät,
Syöte-painikkeen aria-pressed on true, tulospaneeli on piilossa ja
Tulos- sekä Kopioi tulos -painikkeet ovat pois käytöstä.

### AC10: Eksplisiittinen nolla on kelvollinen askel
**Given** UI:ssa on valittu C-duuri, askelkentässä on `0` ja syöte on `H |G |`
**When** käyttäjä painaa Transponoi
**Then** tulosnäkymässä näkyy täsmälleen `B |G |`, alert on piilossa,
Tulos- ja Kopioi tulos -painikkeet ovat käytössä ja kohde on C-duuri.

### AC11: Nolla-askel ei ohita lähtörekisterin validointia
**Given** nimi on `C`, askelmäärä on 0 ja lähtörekisteri on vuorollaan
0, 5 tai 1.5
**When** `transposeNote` käsittelee syötteen
**Then** jokainen kutsu heittää täsmälleen virheen
`Rekisterin pitää olla kokonaisluku väliltä 1–4`.

### AC12: H-normalisointi säilyttää sävelen lähtörekisterin nolla-askeleella
**Given** sävelnimi on vuorollaan `h`, `H`, `Hb` tai `H#`, rekisteri on
vuorollaan 1, 2, 3 tai 4 ja askelmäärä on 0
**When** `transposeNote` käsittelee sävelen ja sen tuloksen uudelleen
**Then** nimet ovat järjestyksessä `B`, `B`, `Bb` ja `B#` molemmissa
käsittelyissä ja rekisteri on aina täsmälleen alkuperäinen rekisteri.

### AC13: Tiukka sointufunktio hylkää tuen ulkopuoliset lähtösävelet
**Given** sointumerkki on vuorollaan `Cb`, `B#`, `Fb`, `E#`, `H#`, `Hb`,
`Cbm7`, `G/Cb`, `G/B#`, `G/Fb`, `G/E#`, `G/H#`, `G/Hb` tai `Cb/G`,
ja askelmäärä on vuorollaan 0, 1 tai -1
**When** `transposeChordSymbol` yrittää käsitellä merkin
**Then** jokainen kutsu heittää täsmälleen
`Tuntematon sointumerkintä: <alkuperäinen merkki>`; H7 ja G/H kuuluvat
edelleen tuettuun sanastoon AC5:n mukaisesti.

### AC14: Tukematon sointu säilytetään rivillä ja muu rivi transponoidaan
**Given** sointurivi on `Cb |C |`, indeksi 0 ja asetukset ovat C-duuri +2 → D-duuri
**When** `transposeChordLine` käsittelee rivin
**Then** content on täsmälleen `Cb |D |` ja varoituslista on täsmälleen
`[{code:"SUSPICIOUS_CHORD",lineIndex:0,startIndex:0,original:"Cb",output:"Cb"}]`.
Cb-tokenin tyyppi on suspiciousChord, teksti `Cb` ja sourceRange `{start:0,end:2}`.

### AC15: Cafe on tekstirivi kirjainkoosta riippumatta
**Given** luokiteltavat rivit ovat `C |` ja vuorollaan `cafe`, `Cafe` tai `CAFE`
**When** `classifyLines` luokittelee rivit
**Then** tyypit ovat `[chord,text]`, cafe-rivin content ja segmentit säilyvät
täsmälleen alkuperäisinä ja warnings on `[]` jokaisessa tapauksessa.

### AC16: Cafe pysyy tekstinä myös säveltokenien joukossa
**Given** luokiteltavat rivit ovat `C |` ja vuorollaan `cafe c`, `Cafe c`
tai `c CAFE`
**When** `classifyLines` luokittelee rivit
**Then** tyypit ovat `[chord,text]` ja warnings on täsmälleen
`[{code:"AMBIGUOUS_NOTE_LINE",lineIndex:1,content:alkuperäinen toinen rivi}]`.
Rivi säilyy tekstinä eikä cafe-tokenin kirjaimia transponoida.

### AC17: Cafe ei muodosta musiikitonta syötettä hyväksyttäväksi
**Given** ainoa syöterivi on vuorollaan `cafe`, `Cafe` tai `CAFE`
**When** `classifyLines` käsittelee syötteen
**Then** virhe on täsmälleen `Syötteestä ei löytynyt sointu- tai sävelrivejä`.

### AC18: Sointurivin Cafe on tavallinen tekstitoken
**Given** sointurivi on vuorollaan `cafe |C |`, `Cafe |C |` tai `CAFE |C |`,
indeksi 0 ja asetukset ovat C-duuri +2 → D-duuri
**When** `transposeChordLine` käsittelee rivin
**Then** sisältö on vastaavasti `cafe |D |`, `Cafe |D |` tai `CAFE |D |`,
warnings on `[]`, ensimmäisen tokenin tyyppi on text ja teksti alkuperäinen
cafe-sanamuoto. Cafe-tokenin muotoilu säilyy eikä siihen lisätä sointulihavointia.

### AC19: Erilliset C A F E -sävelet toimivat edelleen
**Given** ainoa syöterivi on `c a f e` tavallisella muotoilulla ja asetukset
ovat C-duuri +2 → D-duuri
**When** koko transponointitulos muodostetaan
**Then** plainText on täsmälleen `D B G F#` ja warnings on `[]`.

### AC20: Ensimmäisen merkin koko on koko tuloksen yhteinen koko
**Given** HTML-syöte on
`<div><span style="font-size:18px">C |</span></div><div><span style="font-size:24px">onpa</span></div>`
ja C-duurin askelmäärä on vuorollaan 0 tai 2
**When** koko transponointitulos muodostetaan
**Then** HTML sisältää täsmälleen yhden `style="font-size:18px"`-attribuutin,
ei `font-size:12px`- eikä `font-size:24px`-attribuuttia ja kaikkien tulosrivien
yhteinen koko on 18 px. PlainText on askeleella 0 `C |\nonpa` ja askeleella
2 `D |\nonpa`.

### AC21: Ensimmäisen merkin puuttuvan koon oletus on 12 px
**Given** HTML-syöte on
`<div>C |</div><div><span style="font-size:24px">onpa</span></div>`
ja askelmäärä on 0
**When** koko transponointitulos muodostetaan
**Then** HTML sisältää täsmälleen yhden `style="font-size:12px"`-attribuutin,
ei `font-size:24px`-attribuuttia ja plainText on `C |\nonpa`.

### AC22: Määräävän merkin virheellinen fonttikoko hylätään
**Given** `resolveBaseFontSize` saa ensimmäisen sisältömerkin C:n segmentin,
jonka fontSizePx on vuorollaan 0, -1, NaN, Infinity tai -Infinity
**When** yhteinen tulosfonttikoko ratkaistaan
**Then** jokainen kutsu heittää täsmälleen
`Fonttikoon pitää olla positiivinen luku`.

### AC23: Myöhempi fonttikoko ei muuta ensimmäisen merkin kokoa
**Given** `resolveBaseFontSize` saa segmentit
`{text:"C",bold:false,italic:false,fontSizePx:18}` ja
`{text:"D",bold:false,italic:false,fontSizePx:0}` tässä järjestyksessä
**When** yhteinen tulosfonttikoko ratkaistaan
**Then** tulos on täsmälleen `18px` eikä myöhempää kokoa validoida.

### AC24: Alkuvälilyönnit eivät määritä fonttikokoa eivätkä katoa
**Given** HTML-syöte on
`<div><span style="font-size:18px">  </span><span style="font-size:24px">c  </span></div><div> onpa  </div>`
ja C-duurin askelmäärä on vuorollaan 0 tai 2
**When** koko transponointitulos muodostetaan
**Then** koko tuloksen yhteinen fonttikoko on 24 px, HTML sisältää
täsmälleen yhden `style="font-size:24px"`-attribuutin eikä `font-size:18px`-
attribuuttia. PlainText on askeleella 0 täsmälleen `  c  \n onpa  ` ja
askeleella 2 `  D  \n onpa  `. HTML:n näkyvät rivit ovat samat kuin
plainText-rivit; molempien rivien alku- ja loppuvälilyönnit säilyvät.

### AC25: Nolla-askel lisää lihavoinnin poistamatta soinnun lähdekursivointia
**Given** HTML-syöte on `<div><em>C#</em> |</div>` ja askelmäärä on 0
**When** koko transponointitulos muodostetaan
**Then** plainText on `C# |`, C# on sekä bold että italic, pipe on bold
ja ei-italic ja välilyönti on tavallinen. Fonttikoko on yhteinen 12 px.

### AC26: Nollan muuttumattomuus ei ohita virheellisen sävelnimen validointia
**Given** nimi on vuorollaan tyhjä merkkijono tai `J`, lähtörekisteri on 3
ja askelmäärä on 0
**When** `transposeNote` käsittelee sävelen
**Then** virheet ovat vastaavasti täsmälleen `Sävel ei saa olla tyhjä` ja
`Tuntematon sävel: J`.

### AC27: Alun tyhjät rivit säilyvät fonttikoon ratkaisussa
**Given** HTML-syöte on `<div><br></div><div><span style="font-size:18.5px">C |</span></div>`
ja askelmäärä on 0
**When** koko transponointitulos muodostetaan
**Then** plainText on täsmälleen `\nC |`, ensimmäinen HTML-tulosrivi on
`<div><br></div>` ja yhteinen fonttikoko on 18.5 px.

### AC28: Luonnollisten tulosalueiden tila säilyttää monirivisen sisällön
**Given** validoidun ryhmän chord-content on `C# |G# |`, note-content
`C# C#` ja text-content `onpa`; chord-tokenien lähdealkusarakkeet ovat
`[0,2,3,5]` (C, pipe, G, pipe) ja noteGroupien `[0,2]`
**When** `alignLineGroup(group,"preserve")` kutsutaan
**Then** sisältörivit ovat täsmälleen `C# |G# |`, `C# C#`, `onpa`;
chord-tokenien alignedRange-arvot ovat järjestyksessä `[0,2)`, `[3,4)`,
`[4,6)`, `[7,8)` ja noteGroupien `[0,2)`, `[3,5)`. Lähdealueet, muotoilut
ja kutsun syöte säilyvät muuttumattomina. Alueet seuraavat rivin omaa
näkyvää sisältöä, vaikka eri rivien ankkurit eivät ole yhteisissä sarakkeissa.

### AC29: Luonnollisten tulosalueiden tila hylkää musiikittoman ryhmän
**Given** ryhmä on `{}` ilman chord- tai note-riviä
**When** `alignLineGroup(group,"preserve")` kutsutaan
**Then** virhe on täsmälleen
`Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi`.

## Files to Modify

| File | Change |
|---|---|
| `specs/features/note-transposition.md` | Hyväksytyn nolla-askelsäännön täsmennys ja uudet rajatapausesimerkit. |
| `specs/features/transposition-settings.md` | Tyhjän askelkentän hyväksytty merkitys ja tarkka käyttöliittymäodotus. |
| `specs/features/input-line-classification.md` | cafe-poikkeuksen hyväksytty rajaus ja varoitukset. |
| `specs/features/chord-transposition.md` | Enharmonisten perus- ja bassosävelten tuen rajaus, tiukka hylkäys ja rivin varoitus. |
| `specs/features/alignment-preservation.md` | Nolla-askeleen kohdistuksen ohitus korvaa aiemman AC55:n säännön tulevassa muutoksessa. |
| `specs/features/rich-text-formatting.md` | Nolla-askeleen alkuperäisten sävelnimien ja muotoilujen säilyminen. |
| `specs/features/result-and-copy.md` | AC51:n esimerkkikorjaus. |
| `specs/features/google-docs-copy-alignment.md` | AC1:n esimerkkikorjaus. |
| `docs/features/result-and-copy/test-plan.md` | AC51:n nykyisen regressiotestin jäljitettävyys. |
| `docs/features/transposition-spec-amendments/architecture.md` | Muutoksen rajapinnat ja riippuvuudet. |
| `docs/features/transposition-spec-amendments/test-plan.md` | Hyväksyttyjen päätösten nimetyt onnistumis-, raja- ja virhetestit. |
| `docs/features/transposition-spec-amendments/tasks.md` | Päätökset, readiness ja myöhemmän TDD:n järjestys. |
| `src/logic/transposeNote.ts`, `.test.ts` | AC3/AC11/AC12/AC26: nolla-askeleen muuttumattomuus, H/B-normalisointi sekä nimen ja lähtörekisterin validointi. |
| `src/logic/transposeNoteLine.ts`, `.test.ts` | AC3/AC7/AC12: alkuperäiset sävelnimet ja rekisterit sekä H/h → B nolla-askeleella. |
| `src/logic/transposeChord.ts`, `.test.ts` | AC5/AC13: nolla-askeleen H/B-normalisointi ja tukemattomien sointusävelten hylkäys. |
| `src/logic/transposeChordLine.ts`, `.test.ts` | AC14/AC18: tukematon sointu jää epäilyttäväksi tokeniksi; cafe-sanamuodot pysyvät tavallisina tekstitokeneina. |
| `src/logic/createTranspositionResult.ts`, `.test.ts` | AC4/AC6/AC7/AC19–AC21/AC24/AC25/AC27: nolla-askeleen koko putki, kohdistuksen ohitus, sävelregressio, yhteinen fonttikoko ja whitespace-säilyminen. |
| `src/logic/formatMusicResult.ts`, `.test.ts` | AC6/AC7/AC20–AC25/AC27: sointulihavointi kursivoinnin säilyttäen, note-lähdemuotoilu ja ensimmäisen sisältömerkin määräämä fonttikoko. |
| `src/ui/ui.ts`, `.test.ts` | AC8–AC10: tyhjän arvon validointi, esikatselu, virhetila ja eksplisiittinen 0. |
| `src/logic/classifyLines.ts`, `.test.ts` | AC15–AC17: kokonainen cafe-token on aina tekstiä ja varoitukset perustuvat vain muihin sävelryhmiin. |
| `src/logic/alignLineGroup.ts`, `.test.ts` | AC28/AC29: valinnainen preserve-tila lisää vain luonnolliset tulosalueet, myös moniriviseen ryhmään; oletustilan nykyinen kohdistus säilyy. |
| `src/logic/alignment.types.test.ts` | AC28: todista uuden valinnaisen tilan tyypitys ja sama `AlignedMusicResultLine[]`-palautustyyppi. |

Tuotanto- ja testitiedostojen muutoslista on yllä; niihin ei tehdä muutoksia
tässä spec-vaiheessa. Nolla-askeleen putki ohittaa rivien välisen kohdistuksen
ja tuottaa näkyviä sijainteja vastaavat alueet ilman välien uudelleenkirjoitusta.
Rajapinta on `alignLineGroup(group: AlignedLineGroup,
mode: "align" | "preserve" = "align"): AlignedMusicResultLine[]`.
Putki käyttää nolla-askeleella preserve-tilaa, jolloin myös moniriviset
ryhmät saavat omien näkyvien sisältöjensä luonnolliset tulosalueet.
Puuttuvaa lähdealuetta ei hyväksytä nykyisen validointisäännön vastaisesti.
Oletustila ja ei-nolla-askeleiden laskentasääntö pysyvät ennallaan.

## Risk

- Nolla-askeleen uusi muuttumattomuussääntö korvaa aiemman yleisen
  isontamisen ja kohdistuksen; H/B-normalisointi säilyy. Vanhojen nollatestien
  odotukset päivitetään vasta hyväksytyn muutosspeksin perusteella TDD:ssä.
  Ei-nolla-askeleiden rekisterirajojen regressiot säilyvät.
- cafe-poikkeus voi muuttaa aiemmin note-riviksi tunnistettuja rivejä;
  sisältö, varoitukset ja putken etusija testataan erikseen.
- Tyhjän kentän tulkinta voi transponoida eri askelmäärällä kuin käyttäjä
  tarkoittaa; esikatselu ja painallus testataan samalla syötteellä.
- Alkuvälilyöntien ohitus koon valinnassa ei saa poistaa niitä tekstistä;
  AC24 ja AC27 erottavat metadatan valinnan näkyvästä sisällöstä.
- Tuen ulkopuolisen perus- tai bassosävelen osittainen transponointi voi
  tuottaa väärän soinnun; koko tukematon sointu säilytetään varoituksella.
- Rollback: revertillä perutaan vain tämän muutosspeksin dokumentti- tai
  myöhemmin toteutuscommitin muutokset. Muiden keskeneräisiä muutoksia ei
  peruta eikä tiedostoja poisteta tässä vaiheessa.

## Testing Strategy (MANDATORY)

| AC | Nimetty testi | Tiedosto / nykyinen todistus |
|---|---|---|
| AC1 | `AC45: jättää itsenäisen loppuputken pois tekstin tavutuksesta` | `src/logic/createTranspositionResult.test.ts`; testi vastaa myös result-and-copy AC51:tä. |
| AC2 | `Google Docs AC1: vakauttaa vain kohdistusvälit HTML-kopioon` | `src/ui/copyResultToClipboard.test.ts`. |
| AC3 | `Amendments AC3: säilyttää nimet ja rekisterit toistuvalla nolla-askeleella` | `src/logic/transposeNote.test.ts` |
| AC4 | `Amendments AC4: ohittaa monirivisen nollasyötteen kohdistuksen` | `src/logic/createTranspositionResult.test.ts` |
| AC5 | `Amendments AC5: säilyttää sointumerkit nolla-askeleella` | `src/logic/transposeChord.test.ts` |
| AC6 | `Amendments AC6: lisää nolla-askeleella vain sointurivin lihavoinnin` | `src/logic/createTranspositionResult.test.ts` |
| AC7 | `Amendments AC7: säilyttää sävelrivin lähdemuotoilun nolla-askeleella` | `src/logic/createTranspositionResult.test.ts` |
| AC8 | `Amendments AC8: piilottaa esikatselun tyhjällä askelkentällä` | `src/ui/ui.test.ts` |
| AC9 | `Amendments AC9: näyttää tyhjän askelkentän virheen` | `src/ui/ui.test.ts` |
| AC10 | `Amendments AC10: hyväksyy eksplisiittisen nollan` | `src/ui/ui.test.ts` |
| AC11 | `Amendments AC11: validoi lähtörekisterin myös nolla-askeleella` | `src/logic/transposeNote.test.ts` |
| AC12 | `Amendments AC12: normalisoi H:n säilyttäen rekisterin nolla-askeleella` | `src/logic/transposeNote.test.ts` |
| AC13 | `Amendments AC13: hylkää tuen ulkopuoliset sointusävelet` | `src/logic/transposeChord.test.ts` |
| AC14 | `Amendments AC14: säilyttää tukemattoman soinnun rivillä varoituksella` | `src/logic/transposeChordLine.test.ts` |
| AC15 | `Amendments AC15: pitää cafe-sanamuodot tekstinä` | `src/logic/classifyLines.test.ts` |
| AC16 | `Amendments AC16: pitää cafe-sekasisällön tekstinä` | `src/logic/classifyLines.test.ts` |
| AC17 | `Amendments AC17: hylkää pelkän cafe-syötteen musiikittomana` | `src/logic/classifyLines.test.ts` |
| AC18 | `Amendments AC18: säilyttää cafe-sanamuodot sointurivin tekstinä` | `src/logic/transposeChordLine.test.ts` |
| AC19 | `Amendments AC19: transponoi erilliset C A F E -sävelet` | `src/logic/createTranspositionResult.test.ts` |
| AC20 | `Amendments AC20: käyttää ensimmäisen merkin kokoa myös nolla-askeleella` | `src/logic/createTranspositionResult.test.ts` |
| AC21 | `Amendments AC21: käyttää ensimmäisen merkin puuttuvan koon oletusta` | `src/logic/createTranspositionResult.test.ts` |
| AC22 | `Amendments AC22: hylkää määräävän merkin virheellisen koon` | `src/logic/formatMusicResult.test.ts` |
| AC23 | `Amendments AC23: ohittaa myöhemmän fonttikoon` | `src/logic/formatMusicResult.test.ts` |
| AC24 | `Amendments AC24: ohittaa alkuvälien koon säilyttäen välit` | `src/logic/createTranspositionResult.test.ts` |
| AC25 | `Amendments AC25: säilyttää soinnun kursivoinnin nollan lihavoinnissa` | `src/logic/createTranspositionResult.test.ts` |
| AC26 | `Amendments AC26: validoi sävelnimen myös nolla-askeleella` | `src/logic/transposeNote.test.ts` |
| AC27 | `Amendments AC27: säilyttää tyhjät alkurivit fonttikoon valinnassa` | `src/logic/createTranspositionResult.test.ts` |
| AC28 | `Amendments AC28: säilyttää monirivisen ryhmän luonnolliset tulosalueet` | `src/logic/alignLineGroup.test.ts`, `src/logic/alignment.types.test.ts` |
| AC29 | `Amendments AC29: hylkää musiikittoman preserve-kutsun` | `src/logic/alignLineGroup.test.ts` |

AC1 ja AC2 ovat nykyisten regressioiden esimerkkikorjauksia. AC3–AC29
käydään TDD:ssä numerojärjestyksessä, yksi AC kerrallaan. Jokaisen testin
odotus johdetaan yllä olevasta kriteeristä ja lukitaan ennen toteutusmuutosta.
Vanha nollatestien käyttäytyminen ei ole uuden version odotus.

## Spec Readiness checklist

- [x] Every AC is Given/When/Then with a precise expected value
- [x] Files to modify are listed with what changes in each
- [x] Risk and rollback are documented
- [x] Testing strategy covers every AC, plus error and edge cases
- [x] Every AC has at least one named test case

## Spec review 6.10.2026

Käyttäjän päätökset: nolla-askel säilyttää musiikin ja kohdistusvälit,
sointurivi lihavoidaan, H/B-normalisointi säilyy, tyhjä askel on virhe,
cafe on aina tekstiä, kuusi enharmonista sointusäveltä eivät kuulu tukeen,
tuloksella on yksi ensimmäisen sisältömerkin määräämä koko ja alkuvälit
ohitetaan vain koon valinnassa. Avoimia kysymyksiä ei ole.

29/29 AC:tä sisältävät Given/When/Then-odotukset ja nimetyt testit.
Muutoslista, API:n preserve-tila, riskit, rollback, virheet, rajatapaukset
ja vanhojen nollatestien käsittely on kuvattu. Alkuperäiset speksit
viittaavat tähän uuden version normatiivisena muutosspeksinä.
Review: APPROVED. Speksi on Ready for implementation.
Koodia tai testejä ei ole muutettu tämän spec-vaiheen aikana;
toteutusta ei merkitä valmiiksi eikä aloiteta tässä vaiheessa.

## Toteutuksen loppuarvio 6.10.2026

Käyttäjä hyväksyi TDD:n. AC1–AC29 käsitelty järjestyksessä; puuttuville
käyttäytymisille vahvistettiin RED ennen tuotantokoodia. Vanhojen nollatestien
odotukset johdettiin hyväksytystä muutosspeksistä. Nollan lähdekursivointi
säilytetään formatterille välitetyllä sisäisellä preserveSourceFormatting-
signaalilla; muiden askelten muotoilusääntö ei muutu.
Toteutushistoria ja AC-kohtainen todistus: docs/features/transposition-spec-amendments/tasks.md.
Lopputarkistukset: lint ja diff-tarkistus läpäisevät; 21 testitiedostoa,
403 onnistunutta testiä, 0 epäonnistunutta ja 0 ohitettua.
Review: APPROVED. Tila: Done.
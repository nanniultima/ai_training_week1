# Tasks: alignment-preservation

Speksi on Done. AC1–AC56 ja loppuarvion formatteriregressio on käsitelty.
Lint, 21/21 testitiedostoa ja 340/340 testiä läpäisevät.
0 epäonnistunutta, 0 ohitettua. Lopullinen verdict: APPROVED.
Alla oleva toteutussuunnitelma ja pysäytyskirjaukset ovat ajohistoriaa;
viimeisin loppuhyväksyntä on tiedoston lopussa.
1. Säilytä nykyinen työpuu vertailupisteessä ennen TDD:tä. Älä peruuta olemassa
   olevia muiden ominaisuuksien muutoksia. Siirrä speksi `In Progress`-tilaan.
2. Tarkista aiemmin valmiiksi raportoidut AC1–AC22 nykyistä speksiä vasten
   numerojärjestyksessä. Korjaa fixturet speksin mukaan ennen tuotantokoodia,
   erityisesti AC2:n `C → C#`-token ja AC11:n `gBc  d → G#CC# D#`-esimerkki.
   Vihreää testiä ei tehdä keinotekoisesti punaiseksi. Muuttunut käyttäytyminen
   käsitellään omana RED–GREEN–REFACTOR-kierroksenaan.
3. Tarkista aiemmat AC:t ja jatka AC37:stä AC56:een numerojärjestyksessä yksi AC kerrallaan.
   RED: kirjoita vain sen AC:n testi, lukitse odotus ja varmista oikea
   epäonnistumissyy. GREEN: pienin toteutus, kaikki testit. REFACTOR: nimet ja
   toisto, testit pysyvät vihreinä. Kahden peräkkäisen RED-kierroksen jälkeen
   pysähdy ja raportoi AGENTS.md:n mukaan.
4. AC23: testaa chord/text-ryhmän x2 ja muotoilu tuloksessa `C# x2|G#|`.
   Yksittäisen chord-rivin tulos on sen sijaan `C# x2 |G# |`.
5. AC24–AC34 ja AC36: järjestys, suorat identiteetit, yhden musiikkirivin
   ryhmät, musiikiton putki ja täsmälliset virheet/validointijärjestys.
   AC28: ohita yhden musiikkirivin kohdistus, säilytä välit ja muotoilu,
   mutta johda näkyvää transponoitua sisältöä vastaavat tulosalueet.
6. AC35: Unicode-lähdealueet. AC37: neljän funktion API, koordinaattiargumentti,
   kohdistettu tulostyyppi ja formatteriyhteensopivuus.
7. AC38–AC43: saman tahdin useat soinnut, pipe/chord-yksiköt, näkyvien tokenien
   erilliset alueet ja aligned-tilan puuttuvan alueen virhe.
8. AC44–AC46: rivikohtaiset törmäysrajat, itsenäisen pipen tekstivaikutus ja
   kaikkien pipejen välilyöntijousto. Älä vertaa eri rivien tokenien pituuksia
   törmäyksenä keskenään.
9. AC47–AC48: yleinen Unicode-etuliitesääntö sekä koko tulosputken tarkat
   sisältö- ja sarakeodotukset. AC47:n yksittäinen chord-rivi säilyttää välit.
   Tyhjän rivin katkaisu testataan erikseen: musiikkirivi jää yksittäiseksi
   ja myös sen transponoinnin tuottamat välit säilyvät.
10. AC49–AC50: eteenpäin etenevä ryhmittely. AC51: yhteinen pipe/note/text-siirto
    sekä yhdistetylle että itsenäiselle pipelle.
11. AC52–AC55: ahtaan putken vähimmäissiirto, melodian joustavan välin kasvu ja
    lyheneminen, musiikittoman suoran kutsun virhe ja nolla-askel.
12. Korvaa vanha testi vain sen speksissä tarkistetun AC:n kohdalla. Vanhojen
    AC47/AC48-tyyppiplaceholderien oikea korvauskohta on uusi AC37.
    Älä muuta lukittua RED-testiä tuotantokoodin mukaiseksi.
13. Käytä speksin yleistä sarakelaskentaa ja poista esimerkkimerkkijonoihin
    sidotut kohdistushaarat yleisen käyttäytymisen testien todistamana.
14. Aja lint, kaikki testit ja diff-tarkistus. Review yhdistää jokaisen
    toteutusmuutoksen AC:hen ja testiin; verdict `APPROVED` tai `CHANGES_REQUIRED`.
15. Muuta `In Progress → Done` vasta 56/56 AC:n ja lopputarkistusten jälkeen.

Muuta vain speksin Files to Modify -taulukon toteutustiedostoja. Älä muuta
UI:ta tai tuota HTML:ää kohdistusmoduuleissa. Nykyisen tulosputken regressioita
saa testata, mutta muiden ominaisuuksien käyttäytymistä ei laajenneta.

## Aiemman speksiversion TDD-tilanne 6.10.2026

Tämä on ajohistoriaa, ei nykyisen Draft-version odotuslista. Erityisesti
AC28:n nykyinen odotus on `C# |G# |`; AC23:n ja AC47:n käyttäytyminen riippuu
kohdistuskumppanista. Alla olevien epäonnistumisten merkitys tarkistetaan
uuden speksin mukaan ennen testien tai koodin muuttamista.

- Lähtötilanteen snapshot: `C:\Users\nanni\AppData\Local\Temp\alignment-tdd-20261006-112710`.
  Sisältää src-, specs- ja docs-tiedostot ennen tämän toteutuskierroksen muutoksia.
- AC1: aiempi testi säilyy. AC2:n fixture korjattu speksin mukaan (`C#`),
  yleisen `calculateAlignedColumns`-laskennan ankkuritaulukko lisätty testiin
  ja RED vahvistettu vääristä sarakkeista. Rivikohtaisen jouston jälkeen
  kohdennettu AC2-testi läpäisee. Esimerkkikohtaiset alignLineGroup-haarat
  ovat vielä poistamatta, joten AC2:ta ei merkitä lopullisesti valmiiksi.
- AC3–AC10 läpäisivät koko testiajossa. AC11:n vanha fixture oli ristiriidassa
  jo viimeistellyn speksin kanssa: korvattu speksin `gbc  d`-syötteellä ja
  lisätty koko note/text-tulos sekä sarakkeet `[0,6]`. Kohdennettu testi läpäisee
  ilman lisämuutosta tuotantokoodiin. AC12–AC22 läpäisivät koko ajossa.
- Koko testisarjan ajot: ensin 304/311 läpäisi, 7 epäonnistui; AC11:n
  fixturepäivityksen jälkeen 305/311 läpäisi, 6 epäonnistui. Molemmissa
  21 testitiedostoa, joista 19 läpäisi ja 2 epäonnistui; 0 ohitettua testiä.
- TDD pysäytetty AGENTS.md:n kahden peräkkäisen punaisen kierroksen säännön
  vuoksi. Speksi jää `In Progress`-tilaan. Verdict: `CHANGES_REQUIRED`.

Jatkon kuusi epäonnistuvaa testiä:

1. AC23: vanha x2-sisältö/alueodotus; speksi odottaa `C# x2|G#|`.
2. AC28: vanha chord-only-odotus; speksi odottaa `C#|G#|`.
3. AC45: vanhat itsenäisten pipejen välilyöntiodotukset.
4. Tulosputken vanhalla nimellä AC51 oleva loppuputkitesti vastaa nyt AC45:tä;
   sen odotus käyttää vielä kulumatonta välilyöntiä.
5. Tulosputken AC47-etuliitetesti käyttää vielä vanhaa pipe-saraketta.
6. Tulosputken AC47-kokoesimerkkitesti: HTML ja plainText eroavat toisistaan.
   Tämä on toteutuspuute, ei pelkkä vanha odotus; lukittua sisältöyhtäläisyyden
   testiä ei muuteta koodin mukaiseksi.

Jatka AC23:sta numerojärjestyksessä. Odotusmuutokset tehdään vain jo
hyväksytyn nykyisen speksin perusteella kyseisen AC:n kohdalla. Yleinen
tekstikohdistus, segmenttien vastaavuus ja esimerkkihaarojen poisto ovat vielä
kesken; uusia AC51–AC55-testejä ei ole kirjoitettu tässä kierroksessa.

## Uuden speksiversion TDD-kierros 6.10.2026

- Lähtötilanteen snapshot: `C:\Users\nanni\AppData\Local\Temp\alignment-tdd-20261006-114358`.
- AC17, AC18 ja AC21: lisätty viimeistellyn speksin vaatima text-kumppani
  fixtureihin ennen yhden rivin poikkeuksen toteutusta. Kohdennetut testit
  olivat jo vihreitä; keinotekoista RED-vaihetta ei tehty.
- AC23: testi erottaa chord/text-ryhmän `C# x2|G#|` ja yksittäisen rivin
  `C# x2 |G# |`. RED vahvistettu yksittäisen rivin välien katoamisesta.
  GREEN: yksittäinen chord-rivi säilyttää contentin ja segmentit sekä saa
  luonnolliset tulosalueet. Kohdennettu AC23-testi läpäisee.
- AC24–AC27: aiemmat ryhmittelytestit tarkistettu erikseen, kaikki läpäisevät.
- AC28: vahvistettu chord-muotoilun, pipejen source/aligned-sarakkeiden,
  note-rekisterien, kaksinkertaisen välin ja syötteen immutabiliteetin tarkistus.
  RED vahvistettu tapauksella `C#  C#`, josta toteutus poisti yhden välin.
  GREEN: yksittäisen note-rivin ohitus säilyttää contentin ja partien
  muotoilut sekä tuottaa luonnolliset tulosalueet. Kohdennettu testi läpäisee.
- Koko sarja molempien GREEN-muutosten jälkeen: 21 testitiedostoa,
  19 läpäisee / 2 epäonnistuu; 308 onnistunutta / 3 epäonnistunutta / 0 ohitettua
  testiä. Lint läpäisee. Aiempaa HTML/plainText-regressiota todistava
  AC47-kokoesimerkkitesti läpäisee nyt yksittäisen rivin ohituksen ansiosta.
- AGENTS.md:n kahden punaisen kierroksen pysäytys: ei uusia AC:itä tämän
  kirjauksen jälkeen. Speksi jää `In Progress`-tilaan, verdict `CHANGES_REQUIRED`.

Seuraava numerojärjestyksen tarkistus on AC29. Kolme yhä epäonnistuvaa testiä
ovat AC45:n vanhat monirivisen ryhmän putkivälit, samaan AC45:een kuuluva
tulosputken vanhalla AC51-nimellä oleva testi sekä monirivisen etuliitteen
AC47-testi, joka odottaa vielä putken siirtymistä tilan jouston sijaan.
Niitä käsitellään vasta kyseisen nykyisen speksin AC:n kohdalla.
Esimerkkikohtaiset kohdistushaarat ja myöhemmät AC:t ovat yhä keskeneräisiä;
kohdennettujen testien vihreys ei vielä ole koko ominaisuuden hyväksyntä.

## Testiodotusten päivitys speksin mukaan 6.10.2026

Käyttäjä pyysi korjaamaan kolme jäljellä olevaa epäonnistuvaa testiä
vastaamaan jo hyväksytyn speksin odotuksia. Tuotantokoodia ja speksin
käyttäytymissääntöjä ei muutettu tällä kierroksella.

- AC45: odotukset `|C#m/G#      |` ja `C#|   |`; lisätty source/aligned-
  pipe-sarakkeiden tarkistukset `[13]` ja `[2,6]` suoraan speksin Thenistä.
- Tulosputken vanhalla AC51-nimellä oleva loppuputkitesti nimetty AC45:ksi
  ja odotus muutettu AC45:n täsmälliseen sisältöön.
- AC47: lisätty speksin täsmällinen yksirivinen esimerkki
  `|↓G |↑B7 |→Em |★Dm → |↓Bb |↑D7 |→Gm |★Fm` ja pipe-sarakkeet
  `[0,5,10,15]`. Vanha monirivinen etuliitetapaus säilytetty AC48-regressiona:
  chord/text-ryhmän välit joustavat, eikä lauluteksti muutu.
- Kohdennetut tarkistukset läpäisivät. Koko sarja: 21 onnistunutta
  testitiedostoa, 312 onnistunutta testiä, 0 epäonnistunutta, 0 ohitettua.
  Lint ja diff-tarkistus läpäisivät. Testiodotusten päivityksen review: APPROVED.

Aiemmat kolmen epäonnistuvan testin kirjaukset ovat ajohistoriaa. Nykyinen
sarja on vihreä, mutta AC29:stä jatkuvaa auditointia, uusia AC51–AC55-testejä
ja yleisen kohdistuksen viimeistelyä ei ole tehty tällä kierroksella.
Speksi pysyy `In Progress`-tilassa.

## AC29–AC37-kierros: speksiristiriita 6.10.2026

AC29–AC34 tarkistettiin erikseen: aiemmat testit läpäisevät eikä
keinotekoista RED-vaihetta tehty. AC35:n chord/note-Unicode-testit ja AC36:n
validointijärjestystesti läpäisevät.

AC37:n placeholder korvattiin oikealla lähde → transponointi → ryhmittely →
kohdistus → formatter -testillä ja palautettujen alueiden tyyppitarkistuksilla.
RED vahvistui TypeScriptissä: sourceRange/alignedRange olivat vielä
valinnaisia myös kohdistetussa tulostyypissä. AlignedMusicResultLine ja
alignLineGroup-palautustyyppi tiukennettiin, ja noteGroupin ei-enumeratiivinen
lähdemetadata säilytetään kopioinnissa.

GREEN-tarkistukset eivät valmistuneet:

1. Uusi runtime-testi paljastaa speksiristiriidan. Kohdistusspeksin `gb`
   odottaa kahta säveltä G ja B, mutta valmis note-transposition-speksi
   tulkitsee `gb`/`Gb` yhdeksi Gb-säveleksi. Oikea parseri tuottaa +1:llä G:n,
   ei G#C-ryhmää. Sama ristiriita koskee AC11:n `gbc`-lähdettä.
2. Tiukempi tulostyyppi aiheuttaa lint-virheen createTranspositionResult.ts:n
   flatMap-annotaatiossa: MusicResultLine[] ei enää todista kohdistettuja
   alueita. Tämä välttämätön tyyppikytkentä puuttuu Files to Modify -listasta.
   Tiedostoa ei muutettu muutoslistan vastaisesti.

Viimeisin ajo: 21 testitiedostoa, 20 läpäisee / 1 epäonnistuu;
311 onnistunutta testiä / 1 epäonnistunut / 0 ohitettua. Lint ei läpäise
createTranspositionResult.ts:n tyyppikytkennän vuoksi. AC37:n testiä ei
muutettu toteutuksen väärän tuloksen mukaiseksi.

TDD on pysäytetty. Speksi jää In Progress -tilaan, kunnes käyttäjä antaa
erillisen luvan Draft-paluulle ja speksiristiriidan korjaukselle.
Ehdotettu lähteen korjaus on `gh` ja `ghc`: h on alemman rekisterin B:n
sallittu vaihtoehtoinen nimi, joten lähdesarakkeet ja tarkoitetut tulosnimet
säilyvät muuttamatta valmiin sävelparserin sääntöjä. Tarkista myös kaikki
suunnitelmat ja fixturet vasta uuden speksiversion hyväksymisen jälkeen.
AC37 on kesken; tämän kierroksen verdict: CHANGES_REQUIRED.

## gb/gB-speksikorjaus 6.10.2026

Käyttäjä antoi erillisen luvan Draft-paluulle ja pyysi sekä gb- että gB-esimerkit.
Research: note-transposition-speksi ja parseNoteGroup erottavat alennusmerkin
ja erillisen B-sävelen. transposeNoteLine johtaa rekisterin muotoilusta.
Kasvuesimerkkien lähteet korjattiin gB/gBc-muotoon, joten niiden tarkoitetut
tulosnimet ja saraketaulukot säilyvät. AC56 lisää kahdeksan aitoa
transponointi- ja kohdistusvertailua gb/gB- ja gbc/gBc-syötteille.
Files to Modify kattaa nyt AC37:n createTranspositionResult-tyyppikytkennän.

Seuraava TDD-kierros päivittää ensin aiempien AC:iden fixturet korjatusta
speksistä, lukitsee odotukset ja jatkaa AC37:ää. AC56 tehdään numerojärjestyksessä.
Tällä spec-kierroksella ei muuteta src-tiedostoja.
Readiness-tarkistus: 56/56 AC:tä ovat GWT-muodossa ja nimetyssä testimatriisissa.
Spec review: APPROVED; speksi siirretty tilaan Ready for implementation.
Tarkistusajossa edelleen 21 testitiedostosta 20 onnistuu ja 1 epäonnistuu;
311 onnistunutta testiä, 1 epäonnistunut, 0 ohitettua. AC37 käyttää vielä
vanhaa gb-fixturea. Lint epäonnistuu aiempaan tulosputken tyyppivirheeseen.
Diff-tarkistus läpäisee. Näiden korjaus kuuluu seuraavaan TDD-kierrokseen.
## AC37:n korjaus 6.10.2026

Käyttäjä pyysi korjaukset. Speksi siirrettiin Ready for implementation → In Progress.
Ensin testin lähde korjattiin hyväksytyn speksin mukaan gb → gB; odotettu
tulos säilyi lukittuna. Kohdennettu AC37-testi läpäisi. Lint vahvisti ennen
tuotantomuutosta puuttuvan tyyppikytkennän createTranspositionResult.ts:ssä.
GREEN: tuotiin AlignedMusicResultLine ja käytettiin sitä kohdistuksen
jälkeisen flatMap-vaiheen palautustyyppinä. Transponoinnin välityyppi säilyi.
Erillistä refaktorointia ei tarvittu.

Tarkistukset: lint läpäisee; 21/21 testitiedostoa ja 312/312 testiä onnistuu,
0 epäonnistunutta, 0 ohitettua. Diff-tarkistus läpäisee.
Tämän rajatun AC37-korjauksen review: APPROVED. Koko ominaisuus ei ole Done.
## AC38–AC56 ja loppuarvio 6.10.2026

- AC38–AC42: olemassa olevat testit tarkistettu ja läpäisevät.
- AC43: täsmälliset chord/pipe/suspiciousChord/noteGroup-tulosalueet ja
  sisältörivit lisätty; testi oli jo vihreä.
- AC44–AC47: tarkistettu; AC46:lle lisätty koko speksiesimerkki sarakkeineen.
- AC48: lisätty täysi nelirivinen tulos, pipe-sarakkeet, paljaiden sointujen
  sarakkeet ja tyhjän rivin katkaisu. Testi läpäisi.
- AC49–AC50: tarkat ryhmärajat testattu, olemassa oleva toteutus läpäisi.
- AC51: RED osoitti tekstin jäävän paikalleen melodian ja pipen siirtyessä.
  GREEN poisti vanhat tekstisiirtymän ohittavat poikkeusehdot; koko sarja vihreä.
- AC52–AC56: lisätty täsmälliset testit, mukaan lukien kahdeksan gb/gB-tapausta.
  AC53:n ensimmäinen testiasetus käytti neutraalin C-duurin alennuskirjoitusasua;
  testin asetukset korjattiin D-duuriin säilyttäen speksin odotus C#.
- Kasvuesimerkkien fixturet käyttävät nyt oikeaa transponointia gB-lähteestä.
  AC8/AC11/AC1:n vanhat gb/gbc-fixturet korjattu hyväksytyn speksin mukaan.
- REFACTOR: poistettu kaksi kovakoodattua esimerkkihaaraa ja korvattu
  tulostokenien merkkijonohaku lähde- ja tulosalueisiin perustuvalla muodostuksella.
- AC37:n formatteriyhteensopivuus: lisätesti osoitti HTML:n käyttävän vanhoja
  musiikkivälejä. Formatteri käyttää nyt alignedRange-alueita ja contentin välejä;
  sisällön yhtäsuuruustesti sekä koko sarja läpäisevät.

### Review: CHANGES_REQUIRED

P2: formatMusicResult.ts:n formatAlignedMusic ohittaa text-tokenien
erillisten musiikkimerkkien lihavoinnin. Rich-text-formatting AC18 vaatii
merkit | , . - : / ( ) lihavoiduiksi. Kohdistetulla C . | -rivillä piste
tuottaa <span>.</span>, vaikka sen pitäisi olla <strong><span>.</span></strong>.
Vahvistettu suoralla formatterikutsulla lähdealueet ja alignedRange-alueet
sisältävälle mallille. Vanhat AC18-testit käyttävät kohdistamattomia tokeneita,
joten ne eivät kata uutta formatterihaaraa. Lisää kohdistetun tuloksen
regressiotesti ennen korjausta; muuta vain erillisten merkkitokenien
muotoilua, älä esimerkiksi rit.-tekstitokenin sisäistä pistettä.

Kohdistuksen tämän kierroksen koodi- ja testimuutokset kuuluvat Files to Modify
-listaan ja AC37/AC43/AC46/AC48–AC56:een; muiden ominaisuuksien vanhoja
työpuumuutoksia ei hyväksytä tällä arviolla.
Viimeisin varmennus: lint ja git diff --check läpäisevät.
21/21 testitiedostoa, 331/331 testiä onnistuu; 0 epäonnistunutta, 0 ohitettua.
Testien vihreys ei poista yllä olevaa suoraan toistettua muotoiluvirhettä.
## Formatteriregression korjaus ja loppuhyväksyntä 6.10.2026

RED: kahdeksan kohdistetun erillisen musiikkimerkin testiä epäonnistui
puuttuvan lihavoinnin vuoksi. rit.-tekstitokenin sisämuotoilutesti läpäisi.
Testien tulosodotukset lukittiin ennen tuotantomuutosta.

GREEN: formatMusicResult tunnistaa erillisen musiikkimerkin tokenista ja
johtaa sen näkyvän sarakkeen ei-välilyöntimerkkien säilyvästä järjestyksestä.
Lähdesaraketta ei käytetä virheellisesti tulossarakkeena. Tavallisen tekstin
sisäiset välimerkit säilyttävät lähdemuotoilunsa. Musiikkimerkin tunnistuksen
apufunktio on yhteinen kohdistetulle ja kohdistamattomalle tulokselle.

Varmennus: npm run lint ja npm test läpäisevät: 21 testitiedostoa,
340 onnistunutta testiä, 0 epäonnistunutta, 0 ohitettua. git diff --check läpäisee.
Muutos palvelee kohdistuksen AC37:n formatteriyhteensopivuutta ja säilyttää
rich-text-formatting AC18/AC20:n säännöt. Toteutus- ja testitiedostot ovat
speksin sallimalla listalla. Aiempi P2-havainto on korjattu.
Loppuarvio: APPROVED. Kohdistusspeksi siirretty In Progress → Done.
## Sävelrivin välisisällön korjaus 7.10.2026

RED vahvistettiin lähteille c x2 d, c - d ja c x2 x3 d tekstikumppanin
kanssa: kohdistus poisti erottimen ennen seuraavaa säveltä eikä siirtänyt
vastaavaa tekstikohtaa. Odotukset johdettiin sarakelaskentasäännöstä,
joka säilyttää ei-tyhjän välisisällön muun kuin pipeankkurin edellä.
GREEN: sarakelaskenta tunnistaa ei-ankkuriosista toistomerkinnät ja
viivaerottimen; koko lähdevälijakso lisätään edeltävän sävelryhmän tulosloppuun.
Pelkkien ylimääräisten välilyöntien ja tahtiputkien joustosäännöt säilyvät.

Koko putken regressiot vertaavat HTML:n näkyvää sisältöä plainTextiin.
Lisätestit kattavat x2:n kursivoinnin ja viivaerottimen lihavoinnin.
21/21 testitiedostoa ja 445/445 testiä onnistuu; 0 epäonnistunutta,
0 ohitettua. Lint ja diff-tarkistus läpäisevät. Review: APPROVED.
Käyttäjän pyynnöstä korjattu merkintä poistettiin minor bugs.md -listasta.
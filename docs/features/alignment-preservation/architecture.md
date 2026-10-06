# Architecture: alignment-preservation

## Flow

`ClassifiedLine[]` ja transponointitulokset → `groupAlignedLines` →
`collectAlignmentAnchors` → `calculateAlignedColumns` → `alignLineGroup` →
`formatMusicResult` ja nykyinen tulosputki. Kohdistusmoduulit pysyvät
riippumattomina DOM:sta ja UI:sta.

Ryhmittelyn jälkeen haarauta rivimäärän perusteella: yhden chord- tai
note-rivin ryhmä säilyttää transponoidun contentin ja muotoilun sellaisinaan.
Sille johdetaan vain näkyvät tulosalueet; rivien välinen sarakelaskenta ja
välien uudelleenkirjoitus tehdään vain vähintään kahden rivin ryhmille.

## Contracts

- Kohdistus etenee vain sointu → melodia → sanat, valinnaiset rivit ohittaen.
  Text päättää ryhmän; uusi musiikki ei kohdistu edellisiin sanoihin.
  Melodian jälkeinen sointu aloittaa uuden ryhmän. Tyhjä rivi katkaisee ryhmän.
- Välilyönnit joustavat ennen kaikkia tahtiputkia, myös itsenäisiä loppuputkia.
  Välit saa kuluttaa loppuun. Vain todellinen päällekkäisyys pakottaa siirron.
  Samassa lähdesarakkeessa oleva noteGroup, pipe ja tekstikohta siirtyvät
  yhdessä. Melodian vaatimaa siirtymää ei saa kumota putken välilyöntijoustolla.
  Myös itsenäisen pipen kanssa yhteinen noteGroup kohdistaa kyseisen
  tekstikohdan normaalisti (AC51).

- Ryhmä sisältää enintään chord-, note- ja text-rivin tässä järjestyksessä.
- Ryhmät `[chord]` ja `[note]` eivät kohdistu. Sisältö, kaikki välit sekä
  segmenttimuotoilut säilyvät täsmälleen transponoinnin jälkeisessä muodossa.
  `sourceRange` pysyy alkuperäisenä ja `alignedRange` kertoo todellisen
  näkyvän sijainnin. `calculateAlignedColumns` palauttaa näille ryhmille
  luonnolliset tulossarakkeet, esimerkiksi `C# |G# | → [0,3,7]`.
- Itsenäiset text- ja empty-rivit ohitetaan ankkurilaskennassa mutta säilytetään
  suorina `MusicResultLine`-identiteetteinä alkuperäisessä järjestyksessä. Text
  säilyy segmentteineen muuttumattomana; whitespace-empty normalisoituu.
- Chord, suspiciousChord, jokainen pipe ja noteGroup kantavat pakollisen
  `SourceRange`-alueen.
- Alueet ovat Unicode-koodipistesarakkeita ja `end` on poissulkeva.
- `sourceRange` säilyy alkuperäisenä. `collectAlignmentAnchors` lukee sitä,
  `calculateAlignedColumns` ei muuta tokeneita ja `alignLineGroup` lisää
  palautettujen ankkuritokenien pakollisen `alignedRange`-alueen.
- `collectAlignmentAnchors(group, coordinate = "source")` hyväksyy vain
  `"source"|"aligned"`. Molemmissa tiloissa se johtaa kohdistusyksiköt; se ei
  palauta kaikkien näkyvien tokenien start-arvojen unionia. `"aligned"`-tilan
  puuttuva alue heittää virheen
  `Kohdistettavalta tokenilta puuttuu kohdistettu sijainti`.
- Paljas chord, itsenäinen pipe ja noteGroup alkavat lasketusta sarakkeesta.
  Yhdistetyn `|Chord`-yksikön pipe kattaa `A..A+1` ja chord alkaa kohdasta
  `A+1+etuliitteen pituus`; ilman etuliitettä pituus on nolla.
  `||G` säilyttää itsenäisen pipen erillään yhdistetystä `|G`:stä.
- Välittömästi vierekkäinen pipe ja chord tai suspiciousChord johdetaan yhdeksi
  `|Chord`-kohdistusyksiköksi pipen sarakkeeseen. Muut chordit ja pipet ovat
  itsenäisiä yksiköitä; `||G` on itsenäinen `|` ja yhdistetty `|G`.
- Jokainen noteGroup on yksi ankkuri myös monisävelisenä.
- Tekstiosat rajataan alkuperäisillä musiikkiankkurien sarakkeilla ilman
  kieliopillista tavutusta. Sisällötön loppuputki ei täytä tekstiä loppuväleillä.
- Tulos on `AlignedMusicResultLine[]`, joka on rakenteellisesti speksi 5:n
  `MusicResultLine[]`-syötteen kanssa yhteensopiva, ilman DOM/UI-riippuvuutta.

Sointutokenin edessä oleva ei-aakkosnumeerinen Unicode-etuliite säilytetään
yleisellä merkkiluokkasäännöllä. Tokenin lopusta tunnistetaan tuettu
sointusymboli; etuliitettä ei toteuteta sallittujen merkkien luettelona.

## Algorithm

1. Validoi sarkain koko syötteestä, myös itsenäisiltä text-riveiltä.
2. Validoi vain chord/note-rivien index/type-tulosvastaavuus ja vasta sitten
   niiden tokenien lähdealueet. Musiikkirivin puuttuminen ei ole virhe.
3. Ryhmittele ja säilytä itsenäiset text/empty-rivit suorina identiteetteinä
   järjestyksessä; ohita ne ankkurilaskennassa. Yhden musiikkirivin ryhmälle
   johda vain muuttumattoman transponoidun sisällön tulosalueet ja ohita
   vaiheet 4–8. Monirivisissä ryhmissä jatka yhteiseen sarakelaskentaan.
4. Johda `collectAlignmentAnchors(group,"source")`-kutsulla chord-rivin
   kohdistusyksiköt, yhdistä niiden ja noteGroup-aloitusten järjestetty unioni
   ja rajaa tekstiosat samoilla lähdesarakkeilla. Välittömästi vierekkäisen
   pipe+chord-parin yksikkö alkaa pipestä; chord-tokenin start ei ole ankkuri.
5. Käytä speksin normatiivista Sarakelaskennan täsmällinen sääntö -kohtaa.
   Laske rivikohtaiset ehdotukset lähimmän saman rivin edeltäjän perusteella
   ja valitse niiden maksimi yhteiseksi sarakkeeksi. Yksi musiikkierotin
   säilyy noteGroupien ja paljaiden sointujen välissä; ylimääräinen tyhjä tila
   joustaa. Pipeä edeltävät välit voivat kulua kokonaan. Ei-välilyöntisisältö
   säilyy. Yhteisen noteGroupin ehdotus voi siirtää pipeä, ja kertynyt siirtymä
   kulkee myöhempiin ankkureihin. Yhden sarakkeen erotin sallii lyhenemisen;
   pidempi väli täyttyy lyhenevän tokenin jälkeen.
6. Kirjoita chord-, suspiciousChord-, pipe- ja noteGroup-tulostokeneille
   `alignedRange` muuttamatta niiden `sourceRange`-arvoja.
7. Johda tarvittaessa tulosankkurit kutsulla
   `collectAlignmentAnchors(alignedGroup,"aligned")`; näkyvien tokenien omat
   alueet säilyvät, mutta yhdistelmäsoinnun alku ei muodosta toista ankkuria.
8. Lisää musiikkiin muotoilemattomia välejä ja tekstiin välejä tai
   muotoilun periviä viivoja. Poista lyhentyessä vain kohdistusrajan viiva.
   Sovella törmäysrajaa saman musiikkirivin peräkkäisiin yksiköihin, vaikka
   välissä olisi toiselle riville kuuluva yhteinen ankkuri. Eri rivit eivät
   törmää keskenään. Ohita tekstissä vain itsenäinen pipe, jonka sarakkeessa
   ei ole noteGroupia. Yhteinen pipe/noteGroup siirtää tekstiä normaalisti.
   Pipe saa kaikissa tapauksissa näkyvää sijaintia vastaavan `alignedRange`-alueen.

AC2–AC5:n saraketaulukko ja sisältörivit on laskettu yleisellä säännöllä.
AC11, AC23, AC28, AC45–AC48 ja AC51–AC55 lukitsevat jouston, sisältösuojan,
melodian etusijan, todellisen törmäyksen, virheen ja nolla-askeleen.
Samaa sääntöä käytetään kaikilla syötteillä ilman merkkijonokohtaisia haaroja.

## Spec correction and TDD restart

Käyttäjä hyväksyi uuden Draft-paluun gb/gB-virheen korjaamiseksi.
Kasvuesimerkkien lähteet ovat gB ja gBc; gb ja gbc säilyvät vertailutapauksina
AC56:ssa. Pieni b on alennusmerkki, iso B erillinen sävel samassa ryhmässä.
Rekisteri määräytyy segmenttimuotoilusta ja transponoinnin oktaavirajasta.
Kohdistus ei muuta sävelparserin sääntöjä.

AC37:n tyyppisopimus ulottuu createTranspositionResult-funktion kohdistuksen
jälkeiseen flatMap-tulokseen: AlignedMusicResultLine[] säilyy formatterille.
Transponoinnin välitulos on edelleen MusicResultLine[].

Spec-vaihe jättää testit ja tuotantokoodin koskematta. Readiness-tarkistuksen
jälkeen TDD tarkistaa ensin korjattujen aiempien AC:iden fixturet, jatkaa
AC37:stä ja etenee AC56:een. Vihreään testiin ei tehdä keinotekoista vikaa.
## Rollback

Säilytä TDD:n aloitustilanne snapshotissa tai commitissa. Palauta tarvittaessa
vain tämän kierroksen muutokset siitä vertailupisteestä. Älä poista tiedostoja
tai peruuta muiden keskeneräisiä töitä.

## Toteutettu lopputila 6.10.2026

Kohdistus muodostaa sisällön lähdealueista, tulosalueista ja säilytettävistä
ei-ankkuriosista. Esimerkkikohtaisia haaroja tai tokenien tekstihakua ei ole.
Formatteri käyttää kohdistetun sisällön välejä ja alignedRange-alueita.
Erillisten musiikkimerkkien lihavointi määräytyy tokenista; näkyvä sijainti
johdetaan ei-välilyöntimerkkien muuttumattomasta järjestyksestä.
Speksi on Done; aiempi restart-osio kuvaa toteutushistoriaa.
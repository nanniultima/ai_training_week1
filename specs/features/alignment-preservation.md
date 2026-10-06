# Feature: Rivien välisen kohdistuksen säilyttäminen

**Status:** Done

## Problem Statement

Transponointi muuttaa musiikkitokenien pituuksia ja voi rikkoa sointu-, sävel-
ja laulutekstirivien yhteiset sarakkeet. Kohdistus palautetaan ennen HTML-
muotoilua muuttamatta käyttäjän sävelryhmiä, tavutusta tai muuta sisältöä.

## Proposed Change

Lisätään julkiset `groupAlignedLines`, `collectAlignmentAnchors`,
`calculateAlignedColumns` ja `alignLineGroup`. `collectAlignmentAnchors(group,
coordinate = "source")` hyväksyy koordinaatiksi täsmälleen `"source"` tai
`"aligned"`. Chord- ja note-rivit yhdistetään
transponointituloksiin `index`+`type`-avaimella. Ryhmä on järjestyksessä
`[chord?,note?,text?]`; uusi chord, toinen note ja empty päättävät ryhmän.
Kohdistus etenee vain eteenpäin järjestyksessä sointu → melodia → sanat,
valinnaiset rivit ohittaen. Text-rivi päättää musiikkiryhmän. Sen jälkeen
tuleva chord tai note aloittaa uuden ryhmän eikä koskaan kohdistu edellisen
text-rivin kanssa. Myös note-rivin jälkeen tuleva chord aloittaa uuden
ryhmän; rivejä ei järjestetä uudelleen kohdistusta varten.
Itsenäiset text- ja empty-rivit ohitetaan ankkurilaskennassa, mutta säilytetään
suorina `MusicResultLine`-identiteetteinä alkuperäisessä järjestyksessä. Text
säilyy segmentteineen muuttumattomana ja whitespace-empty normalisoituu tyhjäksi.

### Milloin kohdistus tehdään

Rivien välinen kohdistus tehdään vain ryhmille `[chord,note]`, `[chord,text]`,
`[note,text]` ja `[chord,note,text]`. Yhden chord- tai note-rivin ryhmässä
ei ole toista kohdistettavaa riviä: transponoinnin jo tuottamat `content`,
segmentit, tokenien/partien tekstit ja kaikki välilyönnit säilyvät täsmälleen.
Tällöin ei jousteta välejä, siirretä ankkureita, lisätä musiikkierottimia
eikä täytetä lyhentyneiden tokenien jälkeisiä välejä. Tyhjä rivi ei ole
kohdistuskumppani. Esimerkiksi `C |G | → C# |G# |` säilyttää molemmat
välilyönnit, vaikka putkien näkyvät sarakkeet muuttuvat transponoinnissa.

Myös yhden rivin tulos tarvitsee näkyvää sisältöä vastaavat `alignedRange`-
alueet formatteriyhteensopivuuden vuoksi. Niiden lisääminen on metadataa,
ei välilyöntien tai sisällön kohdistamista. `sourceRange` säilyy alkuperäisenä.
`calculateAlignedColumns` palauttaa yhden rivin ryhmälle lähdeankkureita
vastaavat luonnolliset tulossarakkeet sellaisinaan: `C |G | → C# |G# |`
antaa `[0,3,7]`, ja `c c → C# C#` antaa `[0,3]`. Sarakkeet kuvaavat
transponoinnin jo tuottamaa näkyvää sisältöä; lähdesarakkeita ei palauteta
virheellisesti tulossijainteina.

Chord-, jokaisen pipe- ja noteGroup-tokenin pakollinen `SourceRange` käyttää
nollasta alkavia Unicode-koodipistesarakkeita ja poissulkevaa `end`-arvoa.
`sourceRange` kuvaa aina alkuperäistä syötettä eikä kohdistus saa muuttaa sitä.
`alignLineGroup` lisää palauttamiinsa chord-, suspiciousChord- ja pipe-tokeneihin
sekä noteGroup-osiin pakollisen `alignedRange`-alueen. Sen sarakkeet ovat myös
Unicode-koodipisteitä ja `end` on poissulkeva. Kohdistusta edeltävä tulos ei
tarvitse `alignedRange`-kenttää. Muut osat ja text/empty-rivit eivät ole
ankkuritokeneita eivätkä tarvitse kenttää.
Välittömästi vierekkäiset pipe ja chord tai suspiciousChord muodostavat yhden
`|Chord`-kohdistusyksikön, jonka ankkuri on pipen sarakkeessa ja johdettu alue
ulottuu pipen alusta soinnun loppuun. Muut chordit ja pipet ovat omia
kohdistusyksiköitään. Jokainen noteGroup on yksi ankkuri; yhteen kirjoitetun
ryhmän sisäiset sävelet eivät muodosta omia ankkureita. Ensimmäinen ankkuri
säilyy. `"source"` johtaa yksiköt `sourceRange`-alueista ja `"aligned"`
`alignedRange`-alueista. Yhdistelmän chord-tokenin oma `start` ei ole toinen
ankkuri, vaikka jokaisen näkyvän tokenin oma alue säilyy. Jos `"aligned"`-
tilassa yhdeltäkin ankkuritokenilta puuttuu `alignedRange`, virhe on täsmälleen
`Kohdistettavalta tokenilta puuttuu kohdistettu sijainti`.
`calculateAlignedColumns` käyttää aina lähdeyksiköitä. Tavallisten sointu- ja
sävelankkurien siirtymä perustuu tokenien pituusmuutokseen. Kaikkien
tahtiputkien edellä välilyönnit joustavat ensin: sääntö koskee sekä
`|Chord`-yksikköä että itsenäistä pipeä, myös loppuputkea. Putki säilyttää
lähdesarakkeensa lisättynä jo kertyneellä yhteisellä siirtymällä, jos
transponoitu sisältö mahtuu sen edelle; välilyöntejä
saa kuluttaa loppuun. Todellinen päällekkäisyys siirtää putkea vain sen
poistavaan vähimmäissarakkeeseen. Samassa sarakkeessa olevan noteGroupin
vaatima siirtymä on huomioitava yhteisessä ankkurissa. Samassa lähdesarakkeessa
olevat putki, noteGroup ja tekstin kyseinen kohta saavat aina saman
kohdistetun sarakkeen. Putken välilyöntijousto ei saa erottaa niitä toisistaan
eikä kumota melodian vaatimaa siirtymää. Tämä koskee myös itsenäistä pipeä.
Sävelet kohdistuvat laulutekstiin, ja soinnut sekä putket säilyttävät omien
lähdeankkuriensa yhteyden samaan tekstiin; kohdistus ei rajoitu musiikkiriveihin.

Tyhjä rivi katkaisee ryhmän myös koko tulosputkessa. Sointuriviä ja sen
jälkeisen tyhjän rivin takana olevaa lauluriviä ei kohdisteta keskenään.

Musiikkiin lisätään muotoilemattomia välilyöntejä. Tekstiin lisätään väli
välijaksoon ja yhdysmerkki sanan sisään; lyhyt teksti täytetään lisäyskohtaan.
Viiva lisätään vain ankkurirajalle, jota edeltää tekstimerkki, ja se perii
edeltävän merkin koko muotoilun. Ensimmäinen ankkuri säilyy, joten kohdistus ei
lisää viivaa tekstirivin alkuun.
Lyheneminen saa poistaa vain siirtyvän ankkurirajan kohdistusviivan. Tokenien
törmäysraja lasketaan vain saman musiikkirivin peräkkäisille ankkuritokeneille;
eri riviltä puuttuva seuraava token ei saa siirtää yhteistä ankkuria.
Itsenäinen pipe, jonka perässä ei ole välittömästi chord- tai suspiciousChord-
tokenia, säilyy musiikin ankkurina mutta pelkästä itsenäisestä pipestä johtuvaa
sarakesiirtymää ei sovelleta tekstiriviin. Jos samassa lähdesarakkeessa on
noteGroup, kyseessä on myös melodian ankkuri: sen yhteinen siirtymä sovelletaan
tekstiin normaalisti. Sääntö koskee kaikkia itsenäisiä pipejä, ei vain loppuputkea.
Sarkain
kielletään koko syötteestä, myös itsenäisiltä text-riveiltä.
Validointijärjestys on sarkain, chord/note-tulosvastaavuus,
chord/note-lähdealueet ja vasta sitten ryhmittely sekä kohdistus. Text-only- ja
empty-only-syötteet hyväksytään. Ominaisuus ei muuta UI:ta eikä tuota HTML:ää.

### Sarakelaskennan täsmällinen sääntö

Laskenta käyttää alkuperäisiä alueita ja transponoituja tokenpituuksia, ei
tulosmerkkijonon hakemista eikä esimerkkikohtaisia poikkeuksia. Syöte on
`groupAlignedLines`-funktion validoima ryhmä. Valinnaisen
`calculateAlignedColumns`-ankkurilistan tulee olla täsmälleen ryhmästä
`"source"`-tilassa kerätty järjestetty lista; se on sisäinen kutsusopimus.
Symbolietuliite kuuluu yksikön näkyvään pituuteen: `|↓G` on yksi yksikkö
pipen sarakkeessa, mutta chord-tokenin oma alue alkaa pipen ja etuliitteen
jälkeen. Paljaan soinnun etuliite säilyy myös.

0. Tarkista ensin ryhmän rivimäärä. Yhden chord- tai note-rivin sisältö ja
   muotoilu palautetaan muuttumattomina, ja näkyvät tulosalueet johdetaan
   transponoidun rivin tokenjärjestyksestä ja säilytetyistä väleistä.
   Seuraavia kohdistusvaiheita sovelletaan vain usean rivin ryhmään.
1. Merkitse lähdeankkurit `a[0..n]` ja tulossarakkeet `t[0..n]`.
   Tyhjän ankkurilistan tulos on `[]`. Muulloin `t[0] = a[0]`.
2. Käsittele seuraava ankkuri `b = a[i]`. Edellisen yhteisen ankkurin
   kertynyt siirtymä on `s = t[i-1] - a[i-1]`; lähtöehdotus on `b+s`.
3. Muodosta ehdotus erikseen jokaiselle musiikkiriville, jolla on ennen `b`:tä
   yksikkö. Jos rivillä on yksikkö kohdassa `b`, käytä sen lähintä edeltävää
   saman rivin yksikköä `p`. Olkoon `g = b - p.sourceRange.end`, `L` edellisen
   yksikön tulospituus ja `T` sen jo laskettu tulossarake.
   - NoteGroupien ja paljaiden sointujen yhden välilyönnin tapauksessa ehdotus
     on `T+L+1`; tämä sallii myös lyhenemisen vasemmalle.
   - Kun niiden alkuperäinen väli on yli yksi välilyönti, ehdotus on
     `max(b+s, T+L+1)`: ylimääräiset välit joustavat ensin ja vähintään yksi
     erotin säilyy. Lyheneminen täyttää väliä eikä tällöin siirrä ankkuria.
   - Chord-rivillä seuraavan pipen edellä ehdotus on `max(b+s, T+L)`;
     välilyönnit saa kuluttaa loppuun. Tämä koskee kaikkia pipejä.
   - Jos väli sisältää muutakin kuin välilyöntejä, sisältö ja sen järjestys
     säilyvät. Laske edellisen yksikön jälkeisen säilytettävän sisällön
     tulospituus `R` poistamalla vain viimeinen, pipeä välittömästi edeltävä
     välilyöntijakso. Pipe-ehdotus on tällöin `max(b+s, T+L+R)`.
     Esimerkiksi `C x2 |G | → C# x2|G#|` kuluttaa vain joustavat välit.
     Muun ankkurin edellä koko ei-tyhjä välisisältö säilyy ja sen pituus
     lisätään edeltävän yksikön tulosloppuun.
   - Nollan välilyönnin tapauksessa ehdotus on `T+L`: alkuperäinen
     vierekkäisyys säilyy. Yhteen kirjoitetun noteGroupin sisäiset sävelet
     eivät ole erillisiä ankkureita.
4. Jos rivillä ei ole yksikköä kohdassa `b`, mutta sillä on yksikkö edellisessä
   yhteisessä ankkurissa `a[i-1]`, tavallisen ankkurin ehdotus on
   `b+s+(tulospituus-lähdepituus)`. Puuttuva token ei luo törmäysrajaa.
   Jos `b` on pipeankkuri, puuttuvan rivitokenin pituusmuutos ei yksin siirrä
   pipeä: ehdotus on `b+s`. Jo kertynyt siirtymä säilyy.
   Muut rivit eivät anna ehdotusta tähän siirtymään.
5. `t[i]` on suurin rivikohtainen ehdotus; ilman ehdotuksia se on `b+s`.
   Yhteinen noteGroup ja pipe saavat saman `t[i]`:n. Melodiarivin tilantarve
   voi siirtää pipeä, vaikka chord-rivillä olisi joustavaa tilaa.
   Törmäysrajaa ei lasketa eri rivien tokenien kesken.
6. Tokenalueet johdetaan näistä sarakkeista. Yhdistetyn yksikön pipe alkaa
   kohdasta `t[i]`, chord kohdasta `t[i]+1+etuliitteen koodipistepituus`.
   Jokaisen näkyvän tokenin `end` on `start` plus sen tulospituus.
7. Tekstirivin leikkauskohdat ovat lähdeankkurit. Vertaa kunkin tekstiin
   vaikuttavan ankkurin siirtymää edellisen tekstiin vaikuttavan ankkurin
   siirtymään; lisää vain siirtymien erotus, ei koko kertynyttä siirtymää.
   Itsenäinen pipe ilman noteGroupia ohitetaan tekstissä. NoteGroupin kanssa
   yhteinen pipe käsitellään normaalisti. Vasemmalle siirrettäessä poistetaan
   vain ankkurirajan viivoja, enintään siirtymän verran; muuta sisältöä ei
   poisteta eikä kieliopillista tavutusta päätellä.

### Esimerkkien saraketarkistus

AC2–AC5 käyttävät seuraavaa riippumattomasti laskettua yhteistä taulukkoa.
Loppuputki kantaa kertyneen melodiasiirtymän, mutta viimeisen sävelen kasvu
ei yksin lisää sille uutta siirtymää, koska putken kohdalla ei ole noteGroupia.

| Lähdesarake | +1-tulossarake | +2-tulossarake |
|---|---|---|
| 0 | 0 | 0 |
| 2 | 3 | 2 |
| 5 | 6 | 5 |
| 7 | 9 | 7 |
| 9 | 12 | 9 |
| 13 | 16 | 13 |
| 16 | 20 | 17 |
| 19 | 23 | 20 |
| 22 | 26 | 23 |
| 24 | 29 | 25 |
| 28 | 33 | 29 |
| 30 | 35 | 31 |

### Kokonaiset kohdistusesimerkit

Näissä kasvuesimerkeissä `gB` tarkoittaa kahta säveltä G ja B.
Pieni `b` on edellisen sävelen alennusmerkki: `gb` on yksi Gb-sävel.
C#-duuriin +1 antaa `gb → G`, `gB → G#C`, `gbc → GC#` ja
`gBc → G#CC#`. D-duuriin +2 antaa `gb → G#` ja `gB → AC#`.
AC56 vertaa molempien kirjoitusasujen kohdistusta. Rekisteri määräytyy
lähdesegmentin muotoilusta; iso B tarkoittaa erillistä säveltä, ei itsessään
rekisterivalintaa. Tavallisen lähtömuotoilun B nousee +1:llä rekisterin 4 C:ksi.

Lähtö:

```text
C    |Am     |G       |C      |
c c  a a a   gB g  g  c d   c
onpa i-hanaa laulella sateessa
```

Johdettujen `|Chord`-, itsenäisten pipe- ja noteGroup-yksiköiden yhteinen
ankkurilista on `[0,2,5,7,9,13,16,19,22,24,28,30]`.

Eksplisiittisesti C#-duuriin `+1`:

```text
C#    |A#m      |G#       |C#      |
C# C# A# A# A#  G#C G# G# C# D#  C#
on-pa i--ha-naa lau-lella sa-teessa
```

Yhteinen ankkurilista on `[0,3,6,9,12,16,20,23,26,29,33,35]`.

D-duuriin `+2`:

```text
D    |Bm     |A        |D      |
D D  B B B   AC# A  A  D E   D
onpa i-hanaa lau-lella sateessa
```

Yhteinen ankkurilista on `[0,2,5,7,9,13,17,20,23,25,29,31]`. `gB`
muuttuu yhdeksi `AC#`-ryhmäksi.
Sen jälkeiset sävelet ja viimeinen `|D` siirtyvät yhden sarakkeen oikealle.
Sovellus ei päättele kieliopillista tavutusta.

### Kaksi sointua samassa tahdissa

Tahtiputki ei rajaa tahtia vain yhteen sointuun. Samassa tahdissa voi olla
useita eri sarakkeista alkavia sointuja, jotka säilyvät omina ankkureinaan:

```text
C        Am |F      G      |
kaunista on kun oon onneton
```

Ensimmäisessä tahdissa ovat soinnut `C` ja `Am`; seuraavassa tahdissa ovat
soinnut `F` ja `G`. Johdetut ankkurit ovat täsmälleen `[0,9,12,20,27]`:
`C=0`, `Am=9`, `|F=12`, `G=20` ja itsenäinen loppuputki `27`. Kohdistus ei
yhdistä saman tahdin sointuja yhdeksi
tokeniksi eikä oleta yhtä sointua tahtia kohti.

## Acceptance Criteria

### AC1: Kokonaisuus ryhmitellään
**Given** lähtöesimerkin kolme luokiteltua riviä ja vastaavat musiikkitulokset
**When** `groupAlignedLines` ryhmittelee rivit
**Then** tulos on yksi ryhmä tyypeillä `[chord,note,text]` ja indekseillä `[0,1,2]`

### AC2: Koko +1-esimerkki kohdistetaan
**Given** lähtöesimerkki sekä C#-duuriin `+1` transponoidut musiikkirivit
**When** ryhmä kohdistetaan
**Then** sisällöt ovat täsmälleen `C#    |A#m      |G#       |C#      |`, `C# C# A# A# A#  G#C G# G# C# D#  C#` ja `on-pa i--ha-naa lau-lella sa-teessa`

### AC3: +1-tulosalueet ovat täsmälliset
**Given** AC2:n kohdistettu ryhmä
**When** kohdistetuista riveistä muodostetulle ryhmänäkymälle kutsutaan
`collectAlignmentAnchors(group,"aligned")`
**Then** johdettujen kohdistusyksiköiden yhteinen ankkurilista on täsmälleen
`[0,3,6,9,12,16,20,23,26,29,33,35]`, eikä yhdistettyjen `|Chord`-yksiköiden
chord-tokenien omia aloitussarakkeita lisätä listaan

### AC4: Koko +2-esimerkki kohdistetaan
**Given** lähtöesimerkki sekä D-duuriin `+2` transponoidut musiikkirivit
**When** ryhmä kohdistetaan
**Then** sisällöt ovat täsmälleen `D    |Bm     |A        |D      |`, `D D  B B B   AC# A  A  D E   D` ja `onpa i-hanaa lau-lella sateessa`

### AC5: +2-tulosalueet ovat täsmälliset
**Given** AC4:n kohdistettu ryhmä
**When** kohdistetuista riveistä muodostetulle ryhmänäkymälle kutsutaan
`collectAlignmentAnchors(group,"aligned")`
**Then** johdettujen kohdistusyksiköiden yhteinen ankkurilista on täsmälleen
`[0,2,5,7,9,13,17,20,23,25,29,31]`, eikä yhdistettyjen `|Chord`-yksiköiden
chord-tokenien omia aloitussarakkeita lisätä listaan

### AC6: Onpa jaetaan musiikin kasvaessa
**Given** note-lähde `c c`, jossa noteGroup-ankkurit ovat `[0,2]`, teksti `onpa` ja note-tulos `C# C#`
**When** ryhmä kohdistetaan
**Then** lähdesarakkeet jakavat tekstin osiin `on` ja `pa`, note on `C# C#` ja teksti on täsmälleen `on-pa`

### AC7: Valmis tavutus ja uudet viivat yhdistyvät
**Given** note-lähde `a a a`, teksti `i-hanaa`, ankkurit `[0,2,4]` ja note-tulos `A# A# A#`
**When** ryhmä kohdistetaan
**Then** note on `A# A# A#` ja teksti `i--ha-naa`

### AC8: Yhteen kirjoitettu ryhmä on yksi ankkuri
**Given** noteGroup `gB` alueella `{start:13,end:15}` ja tulos `G#C`
**When** ankkurit kerätään
**Then** ryhmä tuottaa vain ankkurin `13`, ei ankkureita `14` tai `15`

### AC9: AC# pidentää vain vastaavaa sanaa
**Given** +2-esimerkin `gB → AC#` ja tekstiosa `laulella`
**When** ryhmä kohdistetaan
**Then** tekstiosa on `lau-lella` ja edeltävä `i-hanaa` säilyy ennallaan

### AC10: Myöhemmät musiikkiankkurit siirtyvät yhdessä
**Given** +2-esimerkin `gB → AC#`
**When** sarakkeet lasketaan ja kohdistettu tulos muodostetaan
**Then** seuraavan noteGroupin `sourceRange.start` säilyy arvossa `16` ja
`alignedRange.start` on `17`, yhdistetyn `|C`-yksikön pipen
`sourceRange.start` säilyy arvossa `22` ja `alignedRange.start` on `23`, sen
chord-tokenin `alignedRange.start` on `24`, ja `"aligned"`-ankkurilistassa on
`23` mutta ei `24`

### AC11: Välijaksoon lisätään välilyönti
**Given** note-lähde `gBc  d`, note-tulos `G#CC#  D#` ja teksti
`onpa  ihanaa`; ensimmäinen noteGroup pitenee kolmesta viiteen koodipisteeseen
**When** teksti kohdistetaan
**Then** note on `G#CC# D#`, ankkurisarakkeet ovat `[0,6]` lähteen `[0,5]`
sijaan ja teksti on `onpa   ihanaa`; ylimääräinen erotinväli kuluu ensin
mutta yksi musiikkierotin säilyy

### AC12: Sanan sisään lisätään yhdysmerkki
**Given** teksti `onpa` ja ankkurisiirtymä `2 → 4`
**When** teksti kohdistetaan
**Then** teksti on `on--pa`

### AC13: Lyhyt teksti täytetään
**Given** teksti `on` ja ankkurisiirtymä `2 → 5`
**When** teksti kohdistetaan
**Then** teksti on täsmälleen `on   `

### AC14: Itsenäinen loppuputki ei täytä tekstiriviä
**Given** chord `Cmaj7      |`, jonka itsenäinen loppuputki on sarakkeessa `11`, ja teksti `nyt`
**When** ryhmä kohdistetaan eikä loppuputken ankkurissa ole tekstisisältöä
**Then** chord on täsmälleen `Cmaj7      |` ja teksti on täsmälleen `nyt` ilman loppuvälilyöntejä

### AC15: Pisin yhteinen token määrää siirtymän
**Given** lähdeyksiköiden ankkurit `[0,2]`, paljas chord `A → A#m` ja noteGroup `a → A#` ankkurissa `0` sekä noteGroup `c → C#` ankkurissa `2`
**When** `calculateAlignedColumns` laskee sarakkeet lähdeyksiköistä
**Then** kohdistusyksiköiden sarakkeet ovat `[0,4]` eivätkä tokenien `sourceRange`-arvot muutu

### AC16: Puuttuva rivitoken ei siirrä väärin
**Given** lähdeyksiköiden ankkurit `[0,2]`, paljas chord `C → C#` ankkurissa `0` ja noteGroup `b → B` vain ankkurissa `2`
**When** `calculateAlignedColumns` laskee sarakkeet lähdeyksiköistä
**Then** kohdistusyksiköiden sarakkeet ovat `[0,3]`, laskenta ei muuta tokeneita ja kohdistetun note-tokenin `alignedRange.start` on `3`

### AC17: Lyheneminen siirtää vasemmalle
**Given** lähteen paljaat chord-kohdistusyksiköt `C# D` ankkureilla `[0,3]`,
chord-tulos `C C#` ja samassa ryhmässä text-rivi `on-pa`
**When** ryhmä kohdistetaan
**Then** tulos on `C C#`, toisen tokenin `sourceRange.start` säilyy arvossa `3` ja `alignedRange.start` on `2`

### AC18: Tokenit eivät törmää
**Given** paljaat chord-kohdistusyksiköt `C → Cmaj7` ja `B → B` ankkureilla
`[0,2]`, lähteen erotinväli `1` ja samassa ryhmässä text-rivi `onpa`
**When** `calculateAlignedColumns` laskee sarakkeet lähdeyksiköistä
**Then** kohdistusyksiköiden sarakkeet ovat `[0,6]`, laskenta ei muuta tokeneita ja kohdistetun toisen tokenin `alignedRange.start` on `6`

### AC19: Kohdistusviiva poistetaan lyhennettäessä
**Given** lähde `C# D`, teksti `on-pa`, ankkurit `[0,3]` ja chord-tulos `C C#`
**When** ryhmä kohdistetaan
**Then** chord on `C C#` ja teksti `onpa`

### AC20: Käyttäjän muu yhdysmerkki säilyy
**Given** teksti `on-pa nyt-kin` ja vain ensimmäinen viiva on siirtyvällä ankkurirajalla
**When** ryhmä kohdistetaan vasemmalle
**Then** teksti on `onpa nyt-kin`

### AC21: Musiikkiväli on muotoilematon
**Given** chord/text-ryhmän chord-rivi, jonka transponoidut tokenit ovat
`C#` ja `C` lähdealueilla `[0,1)` ja `[2,3)`, näkyvä content ennen
kohdistusta on `C#C`, sekä samassa ryhmässä text-rivi `onpa`
**When** segmentit muodostetaan
**Then** lisätty segmentti on `{text:" ",bold:false,italic:false}` ilman `fontSizePx`-kenttää ja yhden sarakkeen siirtymä kasvattaa seuraavan ankkuritokenin `alignedRange.start`-arvoa täsmälleen yhdellä sen `sourceRange.start`-arvosta

### AC22: Viiva perii edeltävän muotoilun
**Given** tekstin `onpa` osa `on` on `{bold:true,italic:false,fontSizePx:18}` ja viiva lisätään kohtaan `2`
**When** segmentit muodostetaan
**Then** viivan muotoilu on `{bold:true,italic:false,fontSizePx:18}`

### AC23: Toistomerkintä säilyy
**Given** chord `C x2 |G |` transponoituu `C# x2 |G# |`, `|G#` on yksi
ankkuri, `x2` on kursivoitu ja samaan ryhmään kuuluu text-rivi `onpa nyt`
**When** ryhmä kohdistetaan
**Then** sisältö on `C# x2|G#|`, siinä on täsmälleen yksi kursivoitu `x2`,
`|G#`-yksikön pipe saa `alignedRange`-arvon `{start:5,end:6}` ja chord
`{start:6,end:8}`; loppuputken `alignedRange` on `{start:8,end:9}`.
Text on edelleen `onpa nyt`. Välilyöntijousto ei poista eikä muuta
toistomerkintää. Ilman text- tai note-kumppania yksittäinen chord-tulos on
sen sijaan täsmälleen `C# x2 |G# |`, ja pipejen tulossarakkeet ovat `[6,10]`.

### AC24: Ennen sointua oleva teksti on itsenäinen
**Given** rivit `text(0,"Ohje")`, `chord(1,"C |")`, `text(2,"laula")`
**When** rivit ryhmitellään
**Then** tulos sisältää alkuperäisessä järjestyksessä suoran
`{index:0,type:"text",content:"Ohje",segments:[plain("Ohje")]}`-identiteetin ja
ryhmän indekseillä `[1,2]`, eikä itsenäinen text osallistu ankkurilaskentaan

### AC25: Chord note ja text muodostavat ryhmän
**Given** rivit `chord(0)`, `note(1)`, `text(2)`
**When** rivit ryhmitellään
**Then** tuloksessa on yksi ryhmä indekseillä `[0,1,2]`

### AC26: Katkaisijat ovat täsmälliset
**Given** rivit `chord(0),note(1),note(2),empty(3),chord(4)`
**When** rivit ryhmitellään
**Then** tulos on `[chord(0),note(1)]`, `[note(2)]`, `empty(3)`, `[chord(4)]`

### AC27: Text- ja empty-identiteetit säilyvät
**Given** itsenäinen text `{index:3,content:"Ohje",segments:[plain("Ohje")]}` ja empty `{index:4,content:"   "}` musiikkiryhmän yhteydessä
**When** rivit ryhmitellään
**Then** ne säilyvät alkuperäisessä järjestyksessä suorina
`MusicResultLine`-identiteetteinä, text täsmälleen segmentteineen muuttumattomana
ja empty arvona `{index:4,type:"empty",content:""}`, eikä kumpikaan osallistu
ankkurilaskentaan

### AC28: Yhtä musiikkiriviä ei kohdisteta
**Given** vuorollaan vain chord `C |G |` tai vain note `c c`, ilman toista
musiikki- tai text-riviä, ja transponoidut tulokset `C# |G# |` sekä `C# C#`
**When** `alignLineGroup` käsittelee yhden rivin ryhmän
**Then** content on vastaavasti täsmälleen `C# |G# |` tai `C# C#`;
segmentit ja niiden muotoilu säilyvät muuttumattomina. Chord-rivin pipejen
`sourceRange.start`-arvot säilyvät `[2,5]`, ja niiden näkyvät
`alignedRange.start`-arvot ovat `[3,7]`. Note-rivin lähdeankkurit ovat `[0,2]`
ja tulosankkurit `[0,3]`. Myös ylimääräisten välien tapaus
`c  c → C#  C#` palauttaa täsmälleen `C#  C#`, tulosankkureilla `[0,4]`.
Yksittäisten tokenien tekstejä tai välejä ei muuteta tulosalueita lisättäessä.

### AC29: Musiikittomat syötteet hyväksytään
**Given** vuorollaan syöte `[text(0,"onpa",[plain("onpa")])]` tai
`[empty(0,"   ")]` ilman chord- tai note-riviä
**When** rivit ryhmitellään ja kohdistus käsitellään
**Then** tulos on vastaavasti täsmälleen
`[{index:0,type:"text",content:"onpa",segments:[plain("onpa")]}]` tai
`[{index:0,type:"empty",content:""}]`, eikä ankkureita lasketa

### AC30: Sarkain hylätään kaikkialla
**Given** syöte sisältää vuorollaan chord-rivin `C\t|G |` tai text-rivin `Ohje\tnyt`
**When** rivit ryhmitellään
**Then** kummassakin tapauksessa virhe on `Kohdistettava syöte ei saa sisältää sarkainmerkkejä`

### AC31: Puuttuva tulos hylätään
**Given** alkuperäinen chord-rivi on indeksillä `2` eikä sille ole tulosta
**When** rivit ryhmitellään
**Then** virhe on `Riviltä 2 puuttuu transponointitulos`

### AC32: Ylimääräinen tulos hylätään
**Given** alkuperäinen chord on indeksillä `0` ja tuloksissa ovat chordit `0` ja `4`
**When** rivit ryhmitellään
**Then** virhe on `Rivillä 4 on ylimääräinen transponointitulos`

### AC33: Väärä tulostyyppi hylätään
**Given** alkuperäinen rivi `2` on chord ja tulos `2` on note
**When** rivit ryhmitellään
**Then** virhe on `Rivin 2 transponointituloksen tyyppi note ei vastaa alkuperäistä tyyppiä chord`

### AC34: Puuttuva lähdealue hylätään
**Given** vuorollaan chord-, suspiciousChord-, pipe- tai noteGroup-raakatokenilta puuttuu `sourceRange`
**When** rivit ryhmitellään
**Then** jokaisessa tapauksessa virhe on `Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti`; kohdistusta edeltävän `alignedRange`-kentän puuttuminen ei ole virhe

### AC35: Lähdealueet ovat Unicode-koodipisteitä
**Given** chord `😀C |G |`, jossa C:n UTF-16-indeksi on `2`, sekä note `G#C D`
**When** lähdealueet muodostetaan
**Then** chord `C` saa `sourceRange`-arvon `{start:1,end:2}`, putket saavat arvot `{start:3,end:4}` ja `{start:6,end:7}`, johdettu `|G`-yksikkö saa lähdealueen `{start:3,end:5}` ja noteGroup `G#C` saa `sourceRange`-arvon `{start:0,end:3}`

### AC36: Validointijärjestys on vakaa
**Given** syötteessä on yhtä aikaa itsenäisen text-rivin sarkain, chord-rivin
puuttuva transponointitulos ja note-tokenin puuttuva lähdealue
**When** rivit ryhmitellään
**Then** ensimmäinen virhe on
`Kohdistettava syöte ei saa sisältää sarkainmerkkejä`; ilman sarkainta
ensimmäinen virhe on puuttuva chord/note-tulos, ja sen korjaamisen jälkeen
ensimmäinen virhe on `Kohdistettavalta tokenilta puuttuu alkuperäinen sijainti`

### AC37: API ja formatteriyhteensopivuus lukitaan
**Given** kohdistusmoduulien julkinen rajapinta ja AC2:n tulos
**When** tyypit tarkistetaan ja tulos annetaan `formatMusicResult`-funktiolle
**Then** julkiset kohdistusfunktiot ovat täsmälleen `groupAlignedLines`,
`collectAlignmentAnchors`, `calculateAlignedColumns`, `alignLineGroup`,
`collectAlignmentAnchors` hyväksyy vain valinnaisen `"source"|"aligned"`-
koordinaatin oletuksella `"source"`, tulos on formatterin `MusicResultLine[]`-
syötteen kanssa rakenteellisesti yhteensopiva `AlignedMusicResultLine[]`,
formatterin tulos alkaa täsmälleen `<div style="font-size:12px">` ja siinä on
täsmälleen kolme sisempää `<div>`-alkutunnistetta

### AC38: Samassa tahdissa voi olla kaksi sointua
**Given** chord-rivi on `C        Am |F      G      |` ja sitä seuraava text-rivi on `kaunista on kun oon onneton`
**When** rivit ryhmitellään ja johdetut ankkurit kerätään
**Then** tuloksena on täsmälleen yksi `[chord,text]`-ryhmä, ankkurisarakkeet ovat täsmälleen `[0,9,12,20,27]` ja tekstirivin content säilyy täsmälleen arvona `kaunista on kun oon onneton`

### AC39: Pipe ja sointu muodostavat yhdistelmäankkurin
**Given** chord-rivi `C |Am |Cfoo`, jossa `Am` on chord ja `Cfoo` suspiciousChord
**When** `collectAlignmentAnchors` kutsutaan erikseen `"source"`- ja `"aligned"`-koordinaateilla
**Then** yksiköt ovat täsmälleen `C`, `|Am`, `|Cfoo`, molemmat ankkurilistat
ovat `[0,2,6]`, ja näkyvien tokenien `alignedRange`-arvot ovat järjestyksessä
chord `{start:0,end:1}`, pipe `{start:2,end:3}`, chord `{start:3,end:5}`,
pipe `{start:6,end:7}` ja suspiciousChord `{start:7,end:11}`; arvot `3` ja `7`
eivät ole erillisiä ankkureita

### AC40: Paljas sointu on oma ankkuri
**Given** chord-rivi `C        Am`, jossa kummankaan soinnun edellä ei ole välittömästi pipeä
**When** `collectAlignmentAnchors` kutsutaan `"source"`- ja `"aligned"`-koordinaateilla
**Then** molemmat ankkurilistat ovat täsmälleen `[0,9]` ja kohdistettujen sointujen `alignedRange`-arvot ovat täsmälleen `{start:0,end:1}` ja `{start:9,end:11}`

### AC41: Itsenäinen pipe on oma ankkuri
**Given** chord-rivi `C      |`, jossa pipen jälkeen ei ole sointua
**When** `collectAlignmentAnchors` kutsutaan `"source"`- ja `"aligned"`-koordinaateilla
**Then** molemmat ankkurilistat ovat täsmälleen `[0,7]` ja kohdistetun itsenäisen pipen `alignedRange` on `{start:7,end:8}`

### AC42: Peräkkäiset pipet erotellaan
**Given** chord-rivi `C ||G`
**When** `collectAlignmentAnchors` kutsutaan erikseen `"source"`- ja `"aligned"`-koordinaateilla
**Then** yksiköt ovat täsmälleen `C`, `|`, `|G`, molemmat ankkurilistat ovat
`[0,2,3]`, ja kohdistetut `alignedRange`-arvot ovat chord `{start:0,end:1}`,
itsenäinen pipe `{start:2,end:3}`, yhdistelmän pipe `{start:3,end:4}` ja chord
`{start:4,end:5}`; arvo `4` ei ole erillinen ankkuri

### AC43: Lähdealueet säilyvät muuttumattomina
**Given** ryhmä, jossa chord-, suspiciousChord-, pipe- ja noteGroup-tokenien `sourceRange`-arvot tunnetaan ja kohdistus siirtää vähintään yhtä tokenia
**When** `collectAlignmentAnchors(group,"source")`, `calculateAlignedColumns`
ja `alignLineGroup` suoritetaan järjestyksessä ja kohdistetulle ryhmänäkymälle
kutsutaan `collectAlignmentAnchors(group,"aligned")`
**Then** jokaisen palautetun tokenin `sourceRange` on täsmälleen sama kuin ennen
kohdistusta, jokaisella palautetulla chord-, suspiciousChord-, pipe- ja
noteGroup-tokenilla on kohdistettua sisältösijaintia vastaava pakollinen
`alignedRange`, johdetut aligned-ankkurit eivät sisällä yhdistelmäsoinnun omaa
aloitusta, ja aligned-tilan kutsu ilman yhdenkin ankkuritokenin `alignedRange`-
kenttää heittää virheen `Kohdistettavalta tokenilta puuttuu kohdistettu sijainti`

### AC44: Eri rivien tokenit eivät aiheuta valetörmäystä
**Given** sointurivi `|A              ,Bm/D# |  `, sävelrivi `c#               e d# d`, tekstirivi `se iskee sieluun syvimpään` ja niiden `+3`-tulokset
**When** riviryhmä kohdistetaan
**Then** sisältörivit ovat täsmälleen `|C              ,Dm/F# |  `, `E                G F# F` ja `se iskee sieluun syvimpään`, pilkku säilyy, `G` alkaa sarakkeesta `17`, `F#` sarakkeesta `19` eikä tekstiin lisätä yhdysmerkkejä

### AC45: Itsenäiset pipet eivät tavuta tekstiriviä
**Given** vuorollaan ryhmät chord `|Bm/F#       |` ja text `niin kuin muut`, joiden `+2`-chord-tulos on `|C#m/G#       |`, sekä chord `C |   |` ja text `nytkin taas`, joiden chord-tulos on `C# |   |`
**When** kumpikin ryhmä kohdistetaan
**Then** ensimmäisen ryhmän sisällöt ovat täsmälleen `|C#m/G#      |` ja `niin kuin muut`, toisen ryhmän sisällöt ovat täsmälleen `C#|   |` ja `nytkin taas`, itsenäisten pipejen ankkurisarakkeet ovat vastaavasti `[13]` ja `[2,6]`, kaikki itsenäiset pipet säilyvät musiikin ankkureina eikä kumpaankaan tekstiriviin lisätä välilyöntiä tai yhdysmerkkiä pipen siirtymän vuoksi

### AC46: Putkiankkurin sarake säilyy välilyöntejä joustamalla
**Given** chord-rivi `|C         |Bm        |Em`, text-rivi `kun laivat saapui satamaan` ja `+2`-chord-tulos, jonka soinnut ovat `D`, `C#m` ja `F#m`
**When** riviryhmä kohdistetaan
**Then** sisältörivit ovat täsmälleen `|D         |C#m       |F#m` ja `kun laivat saapui satamaan`, jokainen pipe alkaa samasta Unicode-koodipistesarakkeesta kuin lähteessä, viimeisen pipen sarake vastaa `satamaan`-sanan `m`-kirjaimen saraketta, `Bm → C#m` kuluttaa yhden sitä seuraavista välilyönneistä eikä tekstiin lisätä välilyöntiä tai yhdysmerkkiä

Jos transponoitu `|Chord` mahtuu ennen saman musiikkirivin seuraavaa ankkuria,
seuraava pipe säilyttää lähdesarakkeensa ja soinnun pituusmuutos kompensoidaan
niiden välisillä välilyönneillä. Jos sisältö ei mahdu, seuraavaa ankkuria
siirretään oikealle vain päällekkäisyyden poistamiseen tarvittava vähimmäismäärä;
vasta tämä pakollinen ankkurisiirtymä kohdistetaan tekstiriviin. Viimeisen
`|Chord`-yksikön pituus ei yksin siirrä eikä tavuta tekstiriviä, koska sen
jälkeen ei ole suojattavaa ankkuria.

### AC47: Unicode-symbolietuliite säilyy ilman soinnun kahdentumista
**Given** chord-rivi `|↓G |↑B7 |→Em |★Dm`, jossa jokaista tuettua
sointusymbolia edeltää yksi tai useampi ei-aakkosnumeerinen Unicode-symboli,
ja transponointi D-duurista kolme puolisävelaskelta ylöspäin F-duuriin
**When** koko transponointitulos muodostetaan
**Then** chord-rivi on täsmälleen `|↓Bb |↑D7 |→Gm |★Fm`, pipejen
`alignedRange.start`-arvot ovat `[0,5,10,15]`, jokainen
etuliite säilyy muuttumattomana suoraan sointunsa edessä, kukin sointu
transponoidaan täsmälleen kerran eikä toteutus sisällä sallittujen
etuliitemerkkien luetteloa. Tämä on yksi chord-rivi ilman kohdistuskumppania:
transponoinnin tuottamat välilyönnit säilyvät yhden rivin poikkeuksen mukaan.

### AC48: Tahtien välinen tyhjä tila joustaa ennen laulutekstiä
**Given** seuraava neljän rivin syöte ilman tyhjiä rivejä sekä D-duurin
`+3`-transponointi F-duuriin:

```text
    |↓Dm  G7     |C              |E7            |Am        |Am/G
Jos uskot siihen taikaan, on sun tähtimerkit kohdallaan
   |↓Dm     G7     |C          |E7              |Am       |Am/G
mä vain jos voisin rauhaan ikuiseen tän maailman tuudittaa
```
**When** koko transponointitulos muodostetaan
**Then** sointujen piteneminen kuluttaa ensin seuraavaan tahtiputkeen johtavaa
tyhjää tilaa, kumpikin mainittu laulurivi säilyy täsmälleen ennallaan,
`ikuiseen` ei muutu muotoon `ikui-seen` eikä sanojen väliin lisätä toista
välilyöntiä

Koko plainText-tulos on täsmälleen:

```text
    |↓Fm  Bb7    |Eb             |G7            |Cm        |Cm/Bb
Jos uskot siihen taikaan, on sun tähtimerkit kohdallaan
   |↓Fm     Bb7    |Eb         |G7              |Cm       |Cm/Bb
mä vain jos voisin rauhaan ikuiseen tän maailman tuudittaa
```

Ensimmäisen chord-rivin pipejen tulossarakkeet ovat `[4,17,33,48,59]` ja
toisen `[3,19,31,48,58]`, samat kuin lähteessä. Paljaat `G7 → Bb7` -soinnut
alkavat edelleen sarakkeista `10` ja `12`. Etuliitteet eivät siirrä laulurivejä
erityissäännöllä; rivit säilyvät, koska niiden ankkurisiirtymät ovat nollia.

Lisäksi tyhjän rivin sisältävä syöte `|C |Bm |Em\n\nonpa` tuottaa D-duurin
`+2`-transponoinnilla täsmälleen `|D |C#m |F#m\n\nonpa`. Tyhjä rivi säilyy,
`onpa` on itsenäinen text-rivi eikä osallistu musiikkirivin kohdistukseen.
Chord-rivi jää yksittäiseksi musiikkiryhmäksi, joten sen välit säilyvät;
pipejen näkyvät sarakkeet ovat `[0,3,8]`.

### AC49: Uusi musiikki ei kohdistu edellisiin sanoihin
**Given** luokitellut rivit `chord(0),note(1),text(2),note(3),text(4),chord(5),text(6)` ja vastaavat transponointitulokset
**When** `groupAlignedLines` ryhmittelee rivit alkuperäisessä järjestyksessä
**Then** tulos on täsmälleen `[chord(0),note(1),text(2)]`,
`[note(3),text(4)]`, `[chord(5),text(6)]`; text(2) ei kuulu note(3):n
ryhmään eikä text(4) chord(5):n ryhmään

### AC50: Sointu melodian jälkeen aloittaa uuden ryhmän
**Given** luokitellut rivit `text(0),note(1),chord(2),note(3),text(4)` ja vastaavat transponointitulokset
**When** `groupAlignedLines` ryhmittelee rivit alkuperäisessä järjestyksessä
**Then** tulos on täsmälleen itsenäinen `text(0)`, `[note(1)]`,
`[chord(2),note(3),text(4)]`; text(0) ei kohdistu myöhempään musiikkiin
eikä note(1) myöhempään chord(2):een

### AC51: Putki, melodia ja sanat siirtyvät yhdessä
**Given** vuorollaan chord-rivi `C |G` tai `C |`, kummankin alla note-rivi
`c c` ja text-rivi `onpa`, sekä C#-duuriin `+1` transponoidut tulokset
**When** riviryhmä kohdistetaan
**Then** chord on vastaavasti `C# |G#` tai `C# |`, note on kummassakin
`C# C#` ja text `on-pa`; lähdesarakkeen `2` pipe ja noteGroup saavat
molemmat `alignedRange.start:3`, ja tekstin `pa` alkaa sarakkeesta `3`.
Lähdeankkurit ovat `[0,2]` ja kohdistetut ankkurit `[0,3]`.
Itsenäinen pipe ei estä saman sarakkeen melodian tekstivaikutusta.

### AC52: Riittämätön tahtiväli siirtää yhteistä ankkuria vähimmäismäärän
**Given** chord-lähde `|C|G`, chord-tulos ennen kohdistusta `|C#|G#` ja
text-rivi `onpa`, ilman note-riviä
**When** riviryhmä kohdistetaan
**Then** chord on `|C#|G#`, text on `on-pa`, lähdeankkurit ovat `[0,2]` ja
tulosankkurit `[0,3]`; toisen pipen alue on `{start:3,end:4}` ja sen soinnun
alue `{start:4,end:6}`. Tyhjää tilaa ei ole, joten yhden sarakkeen siirto on
välttämätön eikä ankkuria siirretä kahta saraketta.

### AC53: Melodian ylimääräinen erotinväli joustaa
**Given** vuorollaan note-lähde `c  c` ja tulos `C#  C#` sekä note-lähde
`c#  d` ja tulos `C  C#`, kummankin alla text-rivi `onpa`
**When** riviryhmä kohdistetaan
**Then** ensimmäisen ryhmän sisällöt ovat `C# C#` ja `onpa`, ankkurit
`[0,3]`; toisen sisällöt ovat `C   C#` ja `onpa`, ankkurit `[0,4]`.
Kasvu kuluttaa ylimääräisen välilyönnin, lyheneminen lisää välilyönnin,
ja yhteinen tekstikohta säilyy lähdesarakkeessaan molemmissa tapauksissa.

### AC54: Musiikiton ryhmä hylätään kohdistusfunktion suorassa kutsussa
**Given** suora `alignLineGroup`-kutsu ryhmällä `{}` ilman chord- tai note-riviä
**When** ryhmää yritetään kohdistaa
**Then** virhe on täsmälleen
`Kohdistettavassa kokonaisuudessa pitää olla sointu- tai sävelrivi`.
Normaali text-only/empty-only-putki ohittaa funktion AC29:n mukaisesti.

### AC55: Nolla-askeleen kohdistus säilyttää valmiin ryhmän
**Given** kokonaisen lähtöesimerkin chord-, note- ja text-rivit sekä
C-duurin `0`-transponointi, joka tuottaa nuottinimet `C C  A A A   GB G  G  C D   C`
**When** riviryhmä kohdistetaan
**Then** chord on `C    |Am     |G       |C      |`, note on
`C C  A A A   GB G  G  C D   C`, text on
`onpa i-hanaa laulella sateessa`, ja yhteiset tulosankkurit ovat
`[0,2,5,7,9,13,16,19,22,24,28,30]`; kaikilla ankkuritokeneilla on
näkyvää tulossijaintia vastaava `alignedRange` myös arvolla `0`.

### AC56: Alennusmerkki ja erillinen B tuottavat eri kohdistuksen
**Given** alla olevan taulukon note-lähde ja text-rivi samassa ryhmässä,
lähtösävellaji C-duuri ja kaikkien lähdesävelten tavallinen muotoilu
(rekisteri 3)
**When** lähde transponoidaan taulukon kohdesävellajiin ja ryhmä kohdistetaan
**Then** note- ja text-sisällöt sekä yhteiset tulosankkurit ovat täsmälleen
taulukon mukaiset; ensimmäinen noteGroup alkaa aina lähde- ja tulossarakkeesta
`0`, eikä sen sisäisistä sävelistä synny uusia ankkureita:

| Note-lähde | Text-lähde | Askel / kohde | Note-tulos | Text-tulos | Tulosankkurit |
|---|---|---|---|---|---|
| `gb c` | `on-pa` | +1 / C#-duuri | `G C#` | `onpa` | `[0,2]` |
| `gB c` | `on-pa` | +1 / C#-duuri | `G#C C#` | `on--pa` | `[0,4]` |
| `gb c` | `on-pa` | +2 / D-duuri | `G# D` | `on-pa` | `[0,3]` |
| `gB c` | `on-pa` | +2 / D-duuri | `AC# D` | `on--pa` | `[0,4]` |
| `gb c` | `on-pa` | 0 / C-duuri | `Gb C` | `on-pa` | `[0,3]` |
| `gB c` | `on-pa` | 0 / C-duuri | `GB C` | `on-pa` | `[0,3]` |
| `gbc  d` | `onpa  ihanaa` | +1 / C#-duuri | `GC#  D#` | `onpa  ihanaa` | `[0,5]` |
| `gBc  d` | `onpa  ihanaa` | +1 / C#-duuri | `G#CC# D#` | `onpa   ihanaa` | `[0,6]` |

Ensimmäisen ryhmän lähdealue on lyhyissä esimerkeissä `[0,2)` ja pitkissä
`[0,3)`; seuraavan ryhmän lähdealku pysyy vastaavasti `3` tai `5`.
Lyhyen `gb c`-esimerkin +1-tapauksessa sävelryhmä lyhenee ja seuraava
ankkuri siirtyy `3 → 2`; vain ankkurirajan viiva poistetaan AC19:n mukaisesti.
Vastaavassa `gB c`-tapauksessa ryhmä kasvaa ja ankkuri siirtyy `3 → 4`.
Testi muodostaa transponointituloksen oikeasta lähteestä `transposeNoteLine`-
funktiolla ennen ryhmittelyä ja kohdistusta. Valmiiksi nimetty fixture ei riitä.

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Muuttumaton `SourceRange`, `AlignedRange`, kohdistettujen tokenien/partien tyypit ja formatteriyhteensopiva `AlignedMusicResultLine`. |
| `src/logic/transposeChordLine.ts`, `.test.ts`, `.types.test.ts` | Chord- ja pipe-tokenien alueet sekä AC47:n Unicode-etuliitteen säilytys. |
| `src/logic/createTranspositionResult.test.ts` | AC47:n ja AC48:n koko tulosputken regressiot, vierekkäisten rivien kohdistus ja tyhjän rivin katkaisu. |
| `src/logic/createTranspositionResult.ts` | AC37: säilytä kohdistuksen jälkeisessä flatMap-tuloksessa `AlignedMusicResultLine[]`-tyyppi formatterille asti; transponoinnin välituloksen tyyppi pysyy `MusicResultLine[]`. |
| `src/logic/transposeNoteLine.ts`, `.test.ts`, `.types.test.ts` | NoteGroup-lähdeteksti ja -alueet. |
| `src/logic/formatMusicResult.ts`, `.test.ts` | Kohdistetun semanttisen mallin muotoilu. |
| `src/logic/groupAlignedLines.ts`, `.test.ts` | Yhdistäminen, validointi ja ryhmittely. |
| `src/logic/alignLineGroup.ts`, `.test.ts` | Source/aligned-koordinaateista johdetut kohdistusyksiköt, putkiankkurien ensisijaiset lähdesarakkeet, välilyöntien jousto, vähimmäissiirtoon rajattu rivikohtainen törmäyslaskenta, itsenäisten pipejen tekstivaikutuksen rajaus, tokeneita muuttamaton lähdeyksiköiden sarakelaskenta, sisältökohdistus ja pakolliset näkyvien tokenien `alignedRange`-alueet. |
| `src/logic/alignment.types.test.ts` | Julkinen API, kaksialueinen malli ja formatteriyhteensopiva tulostyyppi. |

## Risk

- Yksi välilyönti muuttaa sarakkeita; kokonaiset merkkijonot ja ankkurilistat testataan.
- UTF-16 voi rikkoa Unicode-sarakkeet; keskitetty muunnos testataan AC35:ssa.
- Lähdealue voi ylikirjoittua tulossarakkeella; erillinen `alignedRange` ja AC43 estävät tietohävikin.
- Näkyvän chord-tokenin alku voi sekoittua `|Chord`-yksikön ankkuriin;
  koordinaattitilallinen yksikköjohdanto ja AC3, AC5 sekä AC39–AC43 estävät sen.
- Speksien 3–5 tulostyypit muuttuvat; koko regressiosarja ajetaan.
- Luonnollinen viiva voi poistua väärin; poisto rajataan AC19–AC20:een.
- Eri rivien tokenit voivat aiheuttaa valetörmäyksen; AC44 vaatii seuraavan tokenin samalta riviltä ennen törmäysrajan soveltamista.
- Itsenäinen pipe voi tavuttaa laulutekstiä ilman musiikillista tavua; AC45 testaa sekä loppuputken että useita itsenäisiä pipejä.
- Yhdistetyn `|Chord`-yksikön pidentyminen voi siirtää myöhempää pipeä ja tavuttaa tekstin, vaikka välissä on riittävästi tyhjää; AC46 lukitsee pipejen lähdesarakkeet, joustavan välin ja vain todellisen törmäyksen vähimmäissiirron.
- Esimerkkikohtaiset koodihaarat voivat piilottaa yleisen laskennan virheen;
  AC2–AC5:n lisäksi AC51–AC53 ja AC55 todistavat samaa sääntöä eri syötteillä.
- Rollback: säilytä nykyisen työpuun muutokset ennen TDD:tä omassa snapshotissa
  tai commitissa. Tarvittaessa palauta vain tämän toteutuskierroksen muutokset
  siitä vertailupisteestä; älä poista tiedostoja tai palauta muiden töitä.

## Testing Strategy (MANDATORY)

Jokaiselle AC:lle kirjoitetaan vähintään yksi testi nimellä `ACn: <nimi>`.

| AC | Nimetty testi | Tiedosto |
|---|---|---|
| AC1 | `AC1: ryhmittelee kokonaisen lähtöesimerkin` | `groupAlignedLines.test.ts` |
| AC2 | `AC2: kohdistaa koko C#-duurin +1-esimerkin` | `alignLineGroup.test.ts` |
| AC3 | `AC3: lukitsee +1-ankkurit` | `alignLineGroup.test.ts` |
| AC4 | `AC4: kohdistaa koko D-duurin +2-esimerkin` | `alignLineGroup.test.ts` |
| AC5 | `AC5: lukitsee +2-ankkurit` | `alignLineGroup.test.ts` |
| AC6 | `AC6: jakaa onpa-sanan` | `alignLineGroup.test.ts` |
| AC7 | `AC7: säilyttää ja lisää tavutusviivat` | `alignLineGroup.test.ts` |
| AC8 | `AC8: pitää noteGroupin yhtenä ankkurina` | `alignLineGroup.test.ts` |
| AC9 | `AC9: pidentää vain AC#-ryhmän sanaa` | `alignLineGroup.test.ts` |
| AC10 | `AC10: siirtää myöhemmät musiikkiankkurit` | `alignLineGroup.test.ts` |
| AC11 | `AC11: lisää välijaksoon välilyönnin` | `alignLineGroup.test.ts` |
| AC12 | `AC12: lisää sanaan kaksi viivaa` | `alignLineGroup.test.ts` |
| AC13 | `AC13: täyttää lyhyen tekstin` | `alignLineGroup.test.ts` |
| AC14 | `AC14: välttää loppuvälit` | `alignLineGroup.test.ts` |
| AC15 | `AC15: käyttää pisintä tulostokenia` | `alignLineGroup.test.ts` |
| AC16 | `AC16: ohittaa puuttuvan rivitokenin` | `alignLineGroup.test.ts` |
| AC17 | `AC17: siirtää lyhenevän jälkeistä ankkuria` | `alignLineGroup.test.ts` |
| AC18 | `AC18: estää tokenien törmäyksen` | `alignLineGroup.test.ts` |
| AC19 | `AC19: poistaa kohdistusrajan viivan` | `alignLineGroup.test.ts` |
| AC20 | `AC20: säilyttää käyttäjän muun viivan` | `alignLineGroup.test.ts` |
| AC21 | `AC21: lisää muotoilemattoman musiikkivälin` | `alignLineGroup.test.ts` |
| AC22 | `AC22: perii viivan edeltävän muotoilun` | `alignLineGroup.test.ts` |
| AC23 | `AC23: säilyttää xN-merkinnän` | `alignLineGroup.test.ts` |
| AC24 | `AC24: säilyttää edeltävän tekstin suorana identiteettinä` | `groupAlignedLines.test.ts` |
| AC25 | `AC25: ryhmittelee chord-note-text-rivit` | `groupAlignedLines.test.ts` |
| AC26 | `AC26: katkaisee ryhmät täsmällisesti` | `groupAlignedLines.test.ts` |
| AC27 | `AC27: säilyttää text- ja empty-identiteetit järjestyksessä` | `groupAlignedLines.test.ts` |
| AC28 | `AC28: säilyttää yksittäisen musiikkirivin sisällön välit ja muotoilut` | `alignLineGroup.test.ts` |
| AC29 | `AC29: hyväksyy text-only- ja empty-only-syötteet` | `groupAlignedLines.test.ts` |
| AC30 | `AC30: hylkää sarkaimen kaikkialta` | `groupAlignedLines.test.ts` |
| AC31 | `AC31: hylkää puuttuvan tuloksen` | `groupAlignedLines.test.ts` |
| AC32 | `AC32: hylkää ylimääräisen tuloksen` | `groupAlignedLines.test.ts` |
| AC33 | `AC33: hylkää väärän tulostyypin` | `groupAlignedLines.test.ts` |
| AC34 | `AC34: hylkää puuttuvat lähdealueet` | `groupAlignedLines.test.ts` |
| AC35 | `AC35: tuottaa Unicode-koodipistealueet` | chord- ja note-lähdetestit |
| AC36 | `AC36: validoi sarkaimen tulosvastaavuutta ja lähdealueita ennen` | `groupAlignedLines.test.ts` |
| AC37 | `AC37: lukitsee API:n ja formatterin` | tyyppi- ja formatteritestit |
| AC38 | `AC38: säilyttää kaksi sointua samassa tahdissa` | `groupAlignedLines.test.ts`, `alignLineGroup.test.ts` |
| AC39 | `AC39: yhdistää pipen chordiin ja suspiciousChordiin` | `alignLineGroup.test.ts` |
| AC40 | `AC40: pitää paljaan soinnun omana ankkurina` | `alignLineGroup.test.ts` |
| AC41 | `AC41: pitää itsenäisen pipen omana ankkurina` | `alignLineGroup.test.ts` |
| AC42 | `AC42: erottaa peräkkäiset pipet` | `alignLineGroup.test.ts` |
| AC43 | `AC43: säilyttää lähdealueet ja lisää kaikki tulosalueet` | `alignLineGroup.test.ts`, `alignment.types.test.ts` |
| AC44 | `AC44: estää eri rivien tokenien valetörmäyksen` | `alignLineGroup.test.ts` |
| AC45 | `AC45: jättää itsenäisten pipejen siirtymät pois tekstikohdistuksesta` | `alignLineGroup.test.ts` |
| AC46 | `AC46: säilyttää putkiankkurit välilyöntejä joustamalla` | `alignLineGroup.test.ts` |
| AC47 | `AC47: säilyttää Unicode-symbolietuliitteet ilman sointujen kahdentumista` | `createTranspositionResult.test.ts` |
| AC48 | `AC48: säilyttää laulutekstit tahtivälien joustaessa` | `createTranspositionResult.test.ts` |
| AC49 | `AC49: aloittaa uuden ryhmän sanojen jälkeisestä musiikista` | `groupAlignedLines.test.ts` |
| AC50 | `AC50: katkaisee ryhmän melodian jälkeiseen sointuun` | `groupAlignedLines.test.ts` |
| AC51 | `AC51: siirtää putken melodian ja sanat yhteiseen sarakkeeseen` | `alignLineGroup.test.ts` |
| AC52 | `AC52: siirtää ahtaan tahtiputken vain yhden sarakkeen` | `alignLineGroup.test.ts` |
| AC53 | `AC53: joustaa melodian ylimääräistä väliä kasvaessa ja lyhetessä` | `alignLineGroup.test.ts` |
| AC54 | `AC54: hylkää musiikittoman suoran kohdistuskutsun` | `alignLineGroup.test.ts` |
| AC55 | `AC55: säilyttää nolla-askeleen sisällön ja tuottaa tulosalueet` | `alignLineGroup.test.ts` |
| AC56 | `AC56: erottaa gb- ja gB-ryhmien kohdistuksen` | `alignLineGroup.test.ts` |

Virheet: AC30–AC34, AC36, AC43 ja AC54. Reunat: AC8, AC13–AC24,
AC26–AC29, AC35, AC38–AC55.
Lopuksi ajetaan `npm run lint`, `npm test` ja `git diff --check`.
Osittaisen TDD-ajon AC1–AC22 on aiemmin raportoitu valmiiksi. Tarkista ne
nykyistä yleistä sääntöä vasten ennen AC23:sta jatkamista: samat merkkijonot
eivät yksin todista yleistä laskentaa. Muuttuneen kriteerin testi johdetaan
ensin tästä speksistä ja lukitaan ennen tuotantokoodin muutosta. Jos testi on
jo vihreä, kirjaa havainto; älä luo keinotekoista RED-vaihetta tai muuta testiä
vääräksi. Sen todistus täydennetään myöhemmän AC:n yleisellä reunatapauksella.
Vanhat placeholder-testit korvataan vasta niitä vastaavan uuden AC:n RED-
vaiheessa; erityisesti vanhat AC47/AC48-tyyppiplaceholderit korvataan uuden
AC37:n RED-vaiheessa. Nykyinen koodi säilyy vain uuden testin todistamana.

## Spec Readiness checklist

- [x] Every AC is Given/When/Then with a precise expected value
- [x] Files to modify are listed with what changes in each
- [x] Risk and rollback are documented
- [x] Testing covers every AC plus errors and edge cases
- [x] Every AC has at least one named test case

## Speksin uudelleenkäsittely 6.10.2026

Käyttäjän päätökset ovat kirjattuina ryhmittelysääntöön ja AC49–AC51:een.
Yhteinen laskentasääntö tuottaa AC2–AC5:n taulukon ja sisältörivit ilman
esimerkkipoikkeuksia. Monirivinen AC23 ja AC45 käyttävät kaikkien pipejen
välilyöntijoustoa. AC28 ja yksirivinen AC47 ohittavat kohdistuksen.
AC48 sisältää täyden lähteen ja täyden tuloksen sekä yksittäisen rivin poikkeuksen.
AC52–AC55 kattavat ahtaan putken, melodian joustavan välin, suoran kutsun
virheen ja nolla-askeleen. Kaikki 55 AC:tä ovat testimatriisissa.
Yllä olevat monirivisten ryhmien säännöt säilyvät. Käyttäjä täsmensi,
että yksittäistä musiikkiriviä ei kohdisteta, ja antoi erillisen luvan
`In Progress → Draft`-paluulle. AC17, AC18, AC21 ja AC23 edellyttävät nyt
nimenomaisesti kohdistuskumppania; AC28, AC47 ja AC48:n tyhjän rivin tapaus
säilyttävät yksittäisen rivin välit. Aiempaa APPROVED-verdictiä ei sovelleta
tähän muutettuun versioon. Testit ja tuotantokoodi jäävät tässä spec-vaiheessa
koskematta, ja uudet odotukset todistetaan vasta uudessa TDD-kierroksessa.
Yhden rivin poikkeuksen ja monirivisen kohdistuksen testikattavuus tarkistettu:
AC17/AC18/AC21/AC23 käyttävät kohdistuskumppania; AC28 kattaa muuttumattoman
contentin, ylimääräiset välit, muotoilut ja luonnolliset tulosalueet.
AC47 ja AC48 erottavat yksittäisen rivin ja monirivisen ryhmän.
Kaikki 55 AC:tä ovat edelleen GWT-muodossa ja nimetyssä testimatriisissa.
Uuden speksiversion readiness-verdict: APPROVED. TDD saa jatkua.

## gb/gB-korjauksen readiness 6.10.2026

Käyttäjä hyväksyi erikseen In Progress → Draft -paluun. Research tarkisti
note-transposition-speksin, parseNoteGroup-parserin, transposeNoteLine-rekisterit
ja AC37:n tulosputken tyypit. Kasvuesimerkkien lähteet korjattiin gB/gBc-muotoon;
AC2–AC5:n tarkoitetut tulosnimet ja sarakkeet säilyvät. AC56 lukitsee myös
aidot gb/gbc-tapaukset, joten alennusmerkkiä ei tulkita erilliseksi säveleksi.

Readiness: 56 GWT-kriteeriä, 56 nimettyä testitapausta, täsmälliset odotukset,
muutoslista, riski/rollback sekä virhe- ja reunatapausten testisuunnitelma
tarkistettu. AC56:n lyheneminen käyttää AC19:n poistettavaa kohdistusviivaa,
kasvu AC11:n välijouston sääntöä. Avoimia kysymyksiä ei jää.
Spec review: APPROVED. Tila: Ready for implementation.
Tämä hyväksyy korjatun speksin; toteutuksen AC37 ja myöhemmät AC:t ovat kesken.

## Toteutuksen loppuhyväksyntä 6.10.2026

AC1–AC56:n testit ja kohdistetun HTML:n regressiot läpäisevät.
AC37:n formatterikorjaus säilyttää erillisten musiikkimerkkien lihavoinnin
myös sarakkeiden siirtyessä; rit.-tekstitokenin sisäinen piste säilyy
lähdemuotoilussaan. Kahdeksan merkkitapausta vahvistettiin ensin RED-ajolla,
jonka jälkeen pienin formatterikorjaus läpäisi koko sarjan.
Kovakoodatut esimerkkihaarat ja tokenien haku tulosmerkkijonosta on poistettu.
Lint, 21 testitiedostoa / 340 testiä ja diff-tarkistus läpäisevät;
0 epäonnistunutta ja 0 ohitettua testiä.
Tämän ominaisuuden loppuarvio: APPROVED. Tila: Done.
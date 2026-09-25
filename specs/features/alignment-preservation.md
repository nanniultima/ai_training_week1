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
Itsenäiset text- ja empty-rivit ohitetaan ankkurilaskennassa, mutta säilytetään
suorina `MusicResultLine`-identiteetteinä alkuperäisessä järjestyksessä. Text
säilyy segmentteineen muuttumattomana ja whitespace-empty normalisoituu tyhjäksi.

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
`calculateAlignedColumns` käyttää aina lähdeyksiköitä. Seuraava
sarake määräytyy ankkurissa alkavien tokenien suurimmasta pituusmuutoksesta,
mutta pisin tulostoken ja alkuperäinen erotinväli estävät törmäyksen.

Musiikkiin lisätään muotoilemattomia välilyöntejä. Tekstiin lisätään väli
välijaksoon ja yhdysmerkki sanan sisään; lyhyt teksti täytetään lisäyskohtaan.
Viiva lisätään vain ankkurirajalle, jota edeltää tekstimerkki, ja se perii
edeltävän merkin koko muotoilun. Ensimmäinen ankkuri säilyy, joten kohdistus ei
lisää viivaa tekstirivin alkuun.
Lyheneminen saa poistaa vain siirtyvän ankkurirajan kohdistusviivan. Tokenien
törmäysraja lasketaan vain saman musiikkirivin peräkkäisille ankkuritokeneille;
eri riviltä puuttuva seuraava token ei saa siirtää yhteistä ankkuria. Sarkain
kielletään koko syötteestä, myös itsenäisiltä text-riveiltä.
Validointijärjestys on sarkain, chord/note-tulosvastaavuus,
chord/note-lähdealueet ja vasta sitten ryhmittely sekä kohdistus. Text-only- ja
empty-only-syötteet hyväksytään. Ominaisuus ei muuta UI:ta eikä tuota HTML:ää.

### Kokonaiset kohdistusesimerkit

Lähtö:

```text
C    |Am     |G       |C      |
c c  a a a   gb g  g  c d   c
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

Yhteinen ankkurilista on `[0,2,5,7,9,13,17,20,23,25,29,31]`. `gb`
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
**Given** noteGroup `gb` alueella `{start:13,end:15}` ja tulos `G#C`
**When** ankkurit kerätään
**Then** ryhmä tuottaa vain ankkurin `13`, ei ankkureita `14` tai `15`

### AC9: AC# pidentää vain vastaavaa sanaa
**Given** +2-esimerkin `gb → AC#` ja tekstiosa `laulella`
**When** ryhmä kohdistetaan
**Then** tekstiosa on `lau-lella` ja edeltävä `i-hanaa` säilyy ennallaan

### AC10: Myöhemmät musiikkiankkurit siirtyvät yhdessä
**Given** +2-esimerkin `gb → AC#`
**When** sarakkeet lasketaan ja kohdistettu tulos muodostetaan
**Then** seuraavan noteGroupin `sourceRange.start` säilyy arvossa `16` ja
`alignedRange.start` on `17`, yhdistetyn `|C`-yksikön pipen
`sourceRange.start` säilyy arvossa `22` ja `alignedRange.start` on `23`, sen
chord-tokenin `alignedRange.start` on `24`, ja `"aligned"`-ankkurilistassa on
`23` mutta ei `24`

### AC11: Välijaksoon lisätään välilyönti
**Given** teksti `onpa  ihanaa` ja ankkurisiirtymä `5 → 6`
**When** teksti kohdistetaan
**Then** teksti on `onpa   ihanaa`

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
**Given** lähdeyksiköiden ankkurit `[0,2]`, paljas chord `A → A#m` ja noteGroup `a → A#` ankkurissa `0`
**When** `calculateAlignedColumns` laskee sarakkeet lähdeyksiköistä
**Then** kohdistusyksiköiden sarakkeet ovat `[0,4]` eivätkä tokenien `sourceRange`-arvot muutu

### AC16: Puuttuva rivitoken ei siirrä väärin
**Given** lähdeyksiköiden ankkurit `[0,2]`, paljas chord `C → C#` ankkurissa `0` ja noteGroup vain ankkurissa `2`
**When** `calculateAlignedColumns` laskee sarakkeet lähdeyksiköistä
**Then** kohdistusyksiköiden sarakkeet ovat `[0,3]`, laskenta ei muuta tokeneita ja kohdistetun note-tokenin `alignedRange.start` on `3`

### AC17: Lyheneminen siirtää vasemmalle
**Given** lähteen paljaat chord-kohdistusyksiköt `C# D` ankkureilla `[0,3]` ja chord-tulos `C C#`
**When** ryhmä kohdistetaan
**Then** tulos on `C C#`, toisen tokenin `sourceRange.start` säilyy arvossa `3` ja `alignedRange.start` on `2`

### AC18: Tokenit eivät törmää
**Given** paljaat chord-kohdistusyksiköt ankkureilla `[0,2]`, ensimmäinen tulostoken `Cmaj7` ja lähteen erotinväli `1`
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
**Given** kohdistus lisää musiikkiriville yhden välilyönnin
**When** segmentit muodostetaan
**Then** lisätty segmentti on `{text:" ",bold:false,italic:false}` ilman `fontSizePx`-kenttää ja yhden sarakkeen siirtymä kasvattaa seuraavan ankkuritokenin `alignedRange.start`-arvoa täsmälleen yhdellä sen `sourceRange.start`-arvosta

### AC22: Viiva perii edeltävän muotoilun
**Given** tekstin `onpa` osa `on` on `{bold:true,italic:false,fontSizePx:18}` ja viiva lisätään kohtaan `2`
**When** segmentit muodostetaan
**Then** viivan muotoilu on `{bold:true,italic:false,fontSizePx:18}`

### AC23: Toistomerkintä säilyy
**Given** chord `C x2 |G |` transponoituu `C# x2 |G# |`, `|G#` on yksi ankkuri ja `x2` on kursivoitu
**When** ryhmä kohdistetaan
**Then** sisältö on `C# x2 |G# |`, siinä on täsmälleen yksi kursivoitu `x2`, `|G#`-yksikön pipe saa `alignedRange`-arvon `{start:6,end:7}` ja chord `{start:7,end:9}`

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

### AC28: Yhden musiikkirivin ryhmät hyväksytään
**Given** vuorollaan vain chord `C |G |` tai vain note `c c`
**When** ryhmä kohdistetaan tulokseen `C# |G# |` tai `C# C#`
**Then** sisältö on vastaavasti `C# |G# |` tai `C# C#`

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

## Files to Modify

| File | Change |
|---|---|
| `src/types.ts` | Muuttumaton `SourceRange`, `AlignedRange`, kohdistettujen tokenien/partien tyypit ja formatteriyhteensopiva `AlignedMusicResultLine`. |
| `src/logic/transposeChordLine.ts`, `.test.ts`, `.types.test.ts` | Chord- ja pipe-tokenien alueet. |
| `src/logic/transposeNoteLine.ts`, `.test.ts`, `.types.test.ts` | NoteGroup-lähdeteksti ja -alueet. |
| `src/logic/formatMusicResult.ts`, `.test.ts` | Kohdistetun semanttisen mallin muotoilu. |
| `src/logic/groupAlignedLines.ts`, `.test.ts` | Yhdistäminen, validointi ja ryhmittely. |
| `src/logic/alignLineGroup.ts`, `.test.ts` | Source/aligned-koordinaateista johdetut kohdistusyksiköt, rivikohtainen törmäyslaskenta, tokeneita muuttamaton lähdeyksiköiden sarakelaskenta, sisältökohdistus ja pakolliset näkyvien tokenien `alignedRange`-alueet. |
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
- Vanha osittainen koodi voi näyttää vihreältä väärällä testillä; AC1–AC22:n
  jälkeen TDD jatkuu uudesta AC23:sta.
- Rollback: poista kohdistusmoduulit ja palauta speksien 3–5 tyyppi-, alue- ja formatterimuutokset speksi 5:n valmistuneeseen committiin.

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
| AC28 | `AC28: hyväksyy yhden musiikkirivin ryhmät` | `alignLineGroup.test.ts` |
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

Virheet: AC30–AC34, AC36. Reunat: AC8, AC13–AC24, AC26–AC29, AC35, AC38–AC44.
Lopuksi ajetaan `npm run lint`, `npm test` ja `git diff --check`.
Osittaisen TDD-ajon AC1–AC22 ovat valmiit. TDD jatkuu uudesta AC23:sta.
Vanhat placeholder-testit korvataan vasta niitä vastaavan uuden AC:n RED-
vaiheessa; erityisesti vanhat AC47/AC48-tyyppiplaceholderit korvataan uuden
AC37:n RED-vaiheessa. Nykyinen koodi säilyy vain uuden testin todistamana.

## Spec Readiness checklist

- [x] Every AC is Given/When/Then with a precise expected value
- [x] Files to modify are listed with what changes in each
- [x] Risk and rollback are documented
- [x] Testing covers every AC plus errors and edge cases
- [x] Every AC has at least one named test case

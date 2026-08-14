# Käyttöohje

## Mitä ohjelmalla voi tehdä?

Ohjelmalla voi transponoida sointuja ja laulettavia säveliä valitun määrän
puolisävelaskelia ylös- tai alaspäin. Samassa syötteessä voi olla myös laulun
sanoja. Sanat säilytetään, ja ohjelma pyrkii pitämään soinnut, sävelet ja
sanat samoissa kohdissa.

Ohjelmalta voi lisäksi kysyä, mitkä sävelet kuuluvat annettuun sointuun.

## Transponoinnin tiedot

Anna ennen käsittelyä:

1. lähtösävellaji
2. valinta duuri tai molli
3. puolisävelaskelten määrä väliltä `-11`–`11`

Esimerkkejä:

- `1` nostaa yhden puolisävelaskeleen
- `-2` laskee kaksi puolisävelaskelta
- `0` säilyttää alkuperäiset sävelkorkeudet

Arvolla `0` ohjelma tekee edelleen tulosteen muotoilut ja mahdolliset
kohdistuksen korjaukset.

Jos kohdesävellajilla on kaksi käyttökelpoista kirjoitusasua, ohjelma kysyy
Enterin painamisen jälkeen, haluatko käyttää ylennysmerkkejä (`#`) vai
alennusmerkkejä (`b`). Valinta on tehtävä ennen jatkamista.

## Syötteen rivit

Syötteessä voi olla sointurivejä, sävelrivejä ja laulun sanoja. Kun kaikki
kolme esiintyvät, kirjoita ne tässä järjestyksessä:

```text
sointurivi
sävelrivi
tekstirivi
```

Kaikkia rivejä ei tarvitse käyttää.

### Soinnut, sävelet ja sanat

```text
C    |Am     |G       |C      |
c c  a a a   gB g  g  c d   c
onpa i-hanaa laulella sateessa
```

### Soinnut ja sanat

```text
C    |Am     |G       |C      |
onpa i-hanaa laulella sateessa
```

### Sävelet ja sanat

```text
c c  a a a   gB g  g  c d   c
onpa i-hanaa laulella sateessa
```

### Soinnut ja sävelet

```text
C    |Am     |G       |C      |
c c  a a a   gB g  g  c d   c
```

### Vain soinnut

```text
C    |Am     |G       |C      |
```

### Vain sävelet

```text
c c  a a a   gB g  g  c d   c
```

Voit erottaa säkeistöt, kertosäkeet ja välisoitot tyhjillä riveillä.

Voit käyttää myös itsenäisiä tekstirivejä kappaleen osien otsikkoina tai
esitysohjeina. Niiden ei tarvitse olla laulunsanoja:

```text
Kertosäe
C    |Am   |G    |C    |
onpa ihanaa laulella
```

Otsikko voi olla ennen musiikkia tai musiikkikokonaisuuksien välissä. Se
säilytetään tuloksessa, mutta sitä ei kohdisteta sointuihin tai säveliin.

Esimerkiksi välisoitossa voi olla monta peräkkäistä sointuriviä:

```text
Välisoitto
C    |G    |
Am   |F    |
Dm   |G    |
```

Sointu- ja sävelrivit voivat myös vuorotella. Kukin sointurivi kohdistetaan
heti sitä seuraavaan sävelriviin:

```text
Välisoitto
C    |G    |
c d   e f
Am   |F    |
a c   e f
```

Laulunsanoja ei vaadita näihin kokonaisuuksiin.

## Sointurivin kirjoittaminen

Sointurivillä pitää olla vähintään yksi putkimerkki (`|`). Putket osoittavat
tahtien vaihtumiskohdat. Rivi voi alkaa tai päättyä myös ilman putkea.

```text
C    |Am     |G       |C
```

Sointurivillä voi olla myös lyhyitä esitysohjeita:

```text
C    |Am     |G  x2   |C      |
```

Ohjelma transponoi tunnistetut soinnut. Esimerkiksi `x2` säilytetään
alkuperäisessä muodossaan.

Tuloksessa soinnut sekä putket ja muut ei-tekstuaaliset merkit ovat aina
lihavoituja. Muu teksti säilyttää alkuperäisen muotoilunsa.

Tuettaviksi suunniteltuja sointuja ovat muun muassa:

```text
C  Cm  C7  Cmaj7  Cm7  Csus4  Cdim  Caug  Cadd9  G/B
```

## Sävelrivin kirjoittaminen

Sävelrivillä ei käytetä putkimerkkejä. Sävelet voi kirjoittaa pienillä tai
isoilla kirjaimilla. Tuloksessa ne esitetään isoilla kirjaimilla.

```text
c c  a a a  g g g  c d c
```

Välilyönnillä erotetut sävelet ovat erillisiä sävelkohtia. Yhteen
kirjoitetut sävelet lauletaan saman tavun aikana.

```text
GB
```

tarkoittaa G- ja B-säveliä saman tavun aikana.

### B ja alennusmerkki

Pieni `b` kuuluu aina sitä edeltävään säveleen ja tarkoittaa alennusta. Iso
`B` on itsenäinen B-sävel.

| Syöte | Tulkinta |
|---|---|
| `gb` | yksi Gb-sävel |
| `Gb` | yksi Gb-sävel |
| `GB` | G ja B samalla tavulla |
| `gB` | G ja B samalla tavulla |
| `G#C` | G# ja C samalla tavulla |
| `AbC` | Ab ja C samalla tavulla |

Jos tarkoitat peräkkäisiä G- ja B-säveliä samalla tavulla, käytä siis `GB`
tai `gB`, älä `gb`.

### H ja B

Ohjelma tulkitsee H:n ja B:n samaksi säveleksi:

```text
H = B
H7 = B7
```

Alennettu B kirjoitetaan aina `Bb`.

## Sävelkorkeuden merkitseminen muotoilulla

Sävelen lihavointi ja kursivointi kertovat sen korkeusalueen. Järjestys
matalimmasta korkeimpaan on:

1. **_lihavoitu ja kursivoitu_**
2. **lihavoitu**
3. tavallinen
4. _kursivoitu_

Ohjelma säilyttää tämän muotoilun transponoinnissa.

## Kohdistus sanoihin

Kirjoita soinnut ja sävelet vaakasuunnassa siihen kohtaan, jossa ne soitetaan
tai lauletaan. Ohjelma käyttää syötteen välilyöntejä ja sijainteja
kohdistuksen perustana.

Transponointi voi pidentää merkintää. Esimerkiksi `C` voi muuttua muotoon
`C#`. Ohjelma voi tällöin lisätä välilyöntejä tai yhdysmerkkejä, jotta
erilliset sävelkohdat eivät näytä liittyvän yhteen:

```text
C C
onpa
```

voi muuttua muotoon:

```text
C# C#
on-pa
```

Ohjelma ei tarkista sanojen oikeaa tavutusta, vaan säilyttää syötteen
osoittaman kohdistuksen.

Transponointi voi myös lyhentää merkintöjä. Tällöin myöhempi tapahtuma voi
siirtyä vasemmalle saman verran, jos rinnakkainen musiikkirivi ei tarvitse
pidempää väliä:

```text
C# D    -> C C#
Db G    -> C F#
C# |G|  -> C |F#|
```

Jos sanoissa oleva yhdysmerkki oli tarpeen vain pidemmän musiikkimerkinnän
kohdistamiseen, ohjelma voi poistaa sen lyhenemisen yhteydessä. Esimerkiksi
`C# D` ja `on-pa` voivat yhden puolisävelaskeleen laskulla muuttua muotoihin
`C C#` ja `onpa`.

## Varoitukset

Sävelrivillä voi olla lyhyt merkintä, kuten `x2`. Jos sävelriviltä näyttää
löytyvän paljon tavallista tekstiä, ohjelma varoittaa epäselvästä syötteestä.

Jos sointurivillä on epäilyttävä sointumerkintä, ohjelma näyttää varoituksen
ja ongelmallisen kohdan. Muu käsittely pyritään silti tekemään, eikä koko
syötettä hylätä tarpeettomasti.

## Tuloksen kopioiminen

Tulos kopioidaan leikepöydälle muotoiltuna tekstinä, jotta lihavointi,
kursivointi, rivinvaihdot ja fonttikoko voidaan säilyttää esimerkiksi Google
Docsiin liitettäessä. Leikepöydälle voidaan tarjota samalla myös tavallinen
tekstiversio muita ohjelmia varten.

## Soinnun sävelten kysyminen

Kirjoita sointu sointuhakuun, esimerkiksi:

```text
Cmaj7
```

Ensimmäisen version tavoitteena on näyttää sointuun kuuluvat sävelet:

```text
C, E, G, B
```

Pianon, kitaran ja ukulelen otteet on suunniteltu myöhemmäksi
jatkokehitykseksi.

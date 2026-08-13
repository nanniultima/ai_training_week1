# Sointujen ja sävelten transponointiohjelma

## Mikä ohjelma on?

Ohjelman tavoitteena on nopeuttaa laulujen, sointujen ja melodioiden
transponointia eli siirtämistä toiseen sävellajiin. Käyttäjä voi antaa
samassa syötteessä sointurivejä, sävelrivejä ja laulun sanoja. Ohjelma
transponoi musiikilliset merkinnät ja pyrkii säilyttämään niiden kohdistuksen
laulun sanoihin.

Ohjelmaa voi käyttää myös pelkkien sointujen tai pelkän melodian
transponointiin. Lisäksi käyttäjä voi kysyä, mitkä sävelet kuuluvat annettuun
sointuun.

Ensimmäinen tavoiteltu käyttötapa on selainkäyttöliittymä. Tulos kopioidaan
rikastekstinä esimerkiksi Google Docsiin. Erillistä tiedostovientiä ei vielä
tarvita.

## Syötteen rakenne

Syötteessä voi olla kolmenlaisia rivejä:

1. sointurivejä
2. sävelrivejä
3. tekstirivejä

Kun kaikki rivityypit esiintyvät, niiden järjestys on aina sointurivi,
sävelrivi ja tekstirivi. Kaikkia kolmea ei kuitenkaan vaadita.

Mahdollisia kokonaisuuksia ovat esimerkiksi:

- soinnut, sävelet ja sanat
- soinnut ja sanat
- sävelet ja sanat
- soinnut ja sävelet
- vain soinnut
- vain sävelet

Tyhjillä riveillä voidaan erottaa säkeistöjä, kertosäkeitä, välisoittoja ja
muita kappaleen osia. Tyhjät rivit säilytetään tuloksessa.

## Rivien tunnistaminen

### Sointurivi

Sointurivi sisältää putkimerkkejä (`|`). Putket osoittavat tahtien
muutoskohtia. Rivi ei välttämättä ala putkella tai pääty putkeen.

Sointurivillä voi olla myös muuta sisältöä, kuten `x2`. Tuntematon sisältö ei
ole virhe, eikä sitä muuteta tai lihavoida. Tuloksessa tunnistetut soinnut ja
kaikki sointurivin ei-tekstuaaliset merkit lihavoidaan. Sointuun kuuluvat
merkit, kuten bassosoinnun vinoviiva, ovat osa lihavoitavaa sointua.

### Sävelrivi

Sävelrivi ei sisällä putkimerkkejä. Se koostuu pääasiassa sävelistä,
välilyönneistä ja musiikillisista merkeistä. Sävelrivillä voi esiintyä lyhyt
merkintä, kuten `x2`, mutta runsas tavallinen teksti aiheuttaa käyttäjälle
varoituksen.

Sävelet voivat olla syötteessä pienillä tai isoilla kirjaimilla. Tuloksessa
sävelnimet esitetään isoilla kirjaimilla.

Yhteen kirjoitetut sävelet tarkoittavat saman tavun aikana laulettavaa
sävelkulkua. Pieni `b` tulkitaan aina edeltävän sävelen alennusmerkiksi. Iso
`B` tulkitaan itsenäiseksi B-säveleksi. Esimerkiksi:

- `gb` tai `Gb` tarkoittaa yhtä Gb-säveltä
- `GB` tai `gB` tarkoittaa G- ja B-säveliä samassa tavussa
- `G#C` tarkoittaa G#- ja C-säveliä samassa tavussa

Ohjelma ei analysoi sanojen kieliopillista tavutusta, vaan toimii käyttäjän
antaman rakenteen mukaan.

### Tekstirivi

Tekstirivi sisältää laulun sanat tai muuta tavallista tekstiä. Sen sisältöä
ei transponoida. Ohjelma voi lisätä sanoihin kohdistusta selventäviä
yhdysmerkkejä tai välilyöntejä, jos transponoinnin pidentämät sointu- tai
sävelnimet muuten siirtäisivät musiikin ja tekstin eri kohtiin.

## Transponointi

Käyttäjä antaa:

- lähtösävellajin
- tiedon siitä, onko sävellaji duuri vai molli
- kokonaislukuna puolisävelaskelten määrän väliltä `-11`–`11`

Yksi askel vastaa yhtä puolisävelaskelta. Negatiivinen arvo siirtää alaspäin
ja positiivinen ylöspäin.

Arvo `0` ei muuta sävelkorkeuksia. Ohjelma tekee silti muut sovitut
käsittelyt, kuten sointujen ja sointurivin ei-tekstuaalisten merkkien
lihavoinnin sekä kohdistuksen korjaukset.

Kaikki tunnistetut soinnut ja sävelet siirretään saman askelmäärän verran.
Tämä koskee myös modulaatioita, vaihtuvia sävellajeja ja lähtösävellajiin
kuulumattomia sointuja.

## Enharmoninen kirjoitusasu

Sama sävelkorkeus voidaan joissakin tilanteissa kirjoittaa kahdella tavalla,
esimerkiksi C# tai Db. Kun kohdesävellajilla on kaksi järkevää
kirjoitusvaihtoehtoa, ohjelma kysyy käyttäjältä Enterillä vahvistamisen
jälkeen, käytetäänkö ylennysmerkkejä (`#`) vai alennusmerkkejä (`b`).

Vastaus vaaditaan ennen käsittelyn jatkamista. Valittua kirjoitusasua
käytetään johdonmukaisesti sekä soinnuissa että sävelissä. Teoreettisia
kirjoitusasuja, jotka vaatisivat kaksoisylennyksiä tai kaksoisalennuksia, ei
tarjota käyttäjälle.

Jatkokehityksessä huomioitavia enharmonisia sävellajipareja ovat esimerkiksi:

- C#-duuri ja Db-duuri
- D#-duuri ja Eb-duuri
- F#-duuri ja Gb-duuri
- G#-duuri ja Ab-duuri
- A#-duuri ja Bb-duuri
- B-duuri ja Cb-duuri

## B- ja H-merkintä

Ohjelma hyväksyy H:n ja B:n saman sävelkorkeuden niminä:

```text
H = B
H7 = B7
Hm = Bm
```

Alennettu B kirjoitetaan aina `Bb`. Ennen mahdollista musiikkikirjaston
käsittelyä H normalisoidaan sisäisesti B:ksi. Tuloksessa käytetään
kansainvälistä B-merkintää.

## Sävelten muotoilu ja korkeusalueet

Sävelrivin muotoilu sisältää musiikillista tietoa. Korkeusalueet ovat
matalimmasta korkeimpaan:

1. lihavoitu ja kursivoitu
2. lihavoitu
3. tavallinen
4. kursivoitu

Sävelen muotoilu säilytetään transponoinnin aikana. Syötteen ensimmäisten
merkkien fonttikokoa voidaan käyttää koko tuloksen oletusfonttikokona.

## Kohdistuksen säilyttäminen

Soinnut ja sävelet on syötteessä asetettu vaakasuunnassa siihen kohtaan,
jossa ne soitetaan tai lauletaan. Ylennys- ja alennusmerkit voivat pidentää
merkintöjä, joten pelkkä alkuperäisten välilyöntien kopioiminen ei aina riitä.

Ohjelma lisää tarvittaessa välilyöntejä sointu-, sävel- ja tekstiriveille,
jotta tahdit ja musiikin aloituskohdat säilyvät samoissa kohdissa. Se voi
lisätä myös yhdysmerkin sanojen väliin, jos kaksi aiemmin erillistä
sävelkohtaa näyttäisi transponoinnin jälkeen liittyvän yhteen.

Ohjelma ei päättele, miten sana pitäisi tavuttaa. Kohdistus perustuu
syötteessä oleviin sävelryhmiin, välilyönteihin ja merkkien sijainteihin.

## Validointi ja varoitukset

Virheellinen askelmäärä tai puuttuva pakollinen valinta estää käsittelyn.
Epävarma sisältö ei normaalisti estä koko transponointia.

Jos ohjelma kohtaa epäilyttävän soinnun tai sävelrivin, se näyttää
varoituksen ja esimerkin kohdasta, joka herätti epäilyksen. Tunnistettavissa
olevat musiikilliset osat transponoidaan ja muu sisältö säilytetään.

## Sointuun kuuluvat sävelet ja jatkotavoitteet

Ensimmäisessä versiossa käyttäjä voi antaa soinnun ja nähdä siihen kuuluvat
sävelet. Tavoitteena on tukea tavallisten duuri- ja mollisointujen lisäksi
ainakin seuraavia merkintöjä:

- `C7`
- `Cmaj7`
- `Cm7`
- `Csus4`
- `Cdim`
- `Caug`
- `Cadd9`
- bassosoinnut, kuten `G/B`

Myöhemmin soinnulle voidaan näyttää käyttäjän valinnan mukaan:

- pianon koskettimet tai ote
- kitaran ote
- ukulelen ote


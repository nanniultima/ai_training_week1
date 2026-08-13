# TODO

Tarkemmat toimintaperiaatteet ja tehdyt päätökset on kuvattu tiedostossa
[`docs/projektikuvaus.md`](docs/projektikuvaus.md). Tämä tiedosto sisältää
vain vielä toteuttamatta olevat työt suositellussa toteutusjärjestyksessä.

## 1. Syötteen käsittely ja rivityypit

- [ ] Lue rikastekstisyöte riveineen ja muotoiluineen.
- [ ] Tunnista putkimerkin sisältävät sointurivit.
- [ ] Tunnista sävelrivit niiden sävelpainotteisen sisällön ja rivien
  sovitun järjestyksen perusteella.
- [ ] Tunnista tavalliset tekstirivit.
- [ ] Tue myös syötteet, joista puuttuu yksi tai kaksi rivityyppiä.
- [ ] Säilytä tyhjät rivit ja kappaleen osien väliset rajat.
- [ ] Varoita, jos oletetulla sävelrivillä on runsaasti tavallista tekstiä.

## 2. Sointujen transponointi

- [ ] Lisää lähtösävellajin syöttö.
- [ ] Lisää duuri- ja mollivalinta.
- [ ] Lisää puolisävelaskelten syöttö väliltä `-11`–`11`.
- [ ] Validoi kaikki transponointisyötteet ennen käsittelyä.
- [ ] Transponoi kaikki tunnistetut soinnut samalla askelmäärällä riippumatta
  modulaatioista tai lähtösävellajiin kuulumattomista soinnuista.
- [ ] Tue tavallisten duuri- ja mollisointujen lisäksi ainakin `C7`, `Cmaj7`,
  `Cm7`, `Csus4`, `Cdim`, `Caug`, `Cadd9` ja bassosoinnut kuten `G/B`.
- [ ] Hyväksy H ja B saman sävelkorkeuden niminä, normalisoi H sisäisesti
  B:ksi ja käytä tuloksessa B-merkintää.
- [ ] Käytä alennetusta B:stä aina merkintää `Bb`.
- [ ] Kun askelmäärä on `0`, jätä sävelkorkeudet ennalleen mutta tee muut
  sovitut käsittelyt ja muotoilut.

## 3. Enharmoninen kirjoitusasu

- [ ] Laske lähtösävellajista ja askelmäärästä kohdesävellaji.
- [ ] Tunnista tilanteet, joissa kohdesävellajilla on kaksi järkevää
  enharmonista kirjoitusasua.
- [ ] Kysy Enterillä vahvistamisen jälkeen, käytetäänkö `#`- vai
  `b`-kirjoitusasua silloin, kun molemmat ovat järkeviä.
- [ ] Vaadi käyttäjältä vastaus ennen käsittelyn jatkamista.
- [ ] Käytä valintaa johdonmukaisesti sekä soinnuissa että sävelissä.
- [ ] Älä tarjoa kaksoisylennyksiä tai kaksoisalennuksia vaativia
  teoreettisia sävellajeja.
- [ ] Tue ainakin rinnakkaisparit C#/Db, D#/Eb, F#/Gb, G#/Ab, A#/Bb ja B/Cb.

## 4. Sointurivin tulosmuotoilu

- [ ] Lihavoi tuloksessa kaikki tunnistetut soinnut kokonaisuudessaan.
- [ ] Lihavoi kaikki sointurivin ei-tekstuaaliset merkit, kuten putket ja
  sointuihin kuuluvat vinoviivat.
- [ ] Säilytä tunnistamattoman tekstin, kuten `x2`, alkuperäinen muotoilu.
- [ ] Varoita epäilyttävästä sointumerkinnästä ja näytä ongelmallinen kohta
  pysäyttämättä tarpeettomasti koko käsittelyä.

## 5. Sävelten transponointi ja muotoilut

- [ ] Tunnista pienillä ja isoilla kirjaimilla annetut sävelet.
- [ ] Muuta tuloksen sävelnimet isoiksi kirjaimiksi.
- [ ] Tulkkaa pieni `b` edeltävän sävelen alennusmerkiksi ja iso `B`
  itsenäiseksi B-säveleksi.
- [ ] Tunnista yhteen kirjoitetut sävelet saman tavun sävelkuluksi.
- [ ] Transponoi jokainen tunnistettu sävel annetulla askelmäärällä.
- [ ] Säilytä sävelten korkeusalueita ilmaisevat muotoilut:
  - lihavoitu ja kursivoitu
  - lihavoitu
  - tavallinen
  - kursivoitu
- [ ] Käytä syötteen ensimmäisten merkkien fonttikokoa tuloksen
  oletusfonttikokona.

## 6. Kohdistuksen säilyttäminen

- [ ] Säilytä tahtien, sointujen, sävelryhmien ja tekstin vaakasuuntainen
  kohdistus mahdollisimman tarkasti.
- [ ] Laske tarvittavat välilyönnit uudelleen, kun muunnetut sävel- tai
  sointinimet pitenevät tai lyhenevät.
- [ ] Lisää tarvittaessa yhdysmerkkejä, jotta aiemmin erilliset laulettavat
  kohdat eivät näytä liittyvän yhteen.
- [ ] Älä yritä päätellä sanojen kieliopillista tavutusta.

## 7. Tulos ja kopiointi

- [ ] Näytä käsitelty tulos erillisessä rikastekstinäkymässä.
- [ ] Lisää kopiointipainike.
- [ ] Kirjoita leikepöydälle sekä muotoiltu HTML-versio että tavallinen
  tekstiversio.
- [ ] Varmista, että lihavointi, kursivointi, rivinvaihdot ja fonttikoko
  säilyvät Google Docsiin liitettäessä.

## 8. Sointuun kuuluvat sävelet

- [ ] Lisää soinnun hakukenttä ja syötteen validointi.
- [ ] Näytä tunnistettuun sointuun kuuluvat sävelet.
- [ ] Tue sama sointusanasto kuin transponoinnissa.
- [ ] Näytä ymmärrettävä virheilmoitus tuntemattomasta soinnusta.

## 9. Myöhempi jatkokehitys

- [ ] Lisää käyttäjän valittavaksi soitin: piano, kitara tai ukulele.
- [ ] Näytä pianon koskettimet tai sointuote.
- [ ] Näytä kitaran sointuote.
- [ ] Näytä ukulelen sointuote.
- [ ] Arvioi automaattinen lähtösävellajin tunnistus avustavaksi toiminnoksi.
- [ ] Arvioi tiedostovienti erillisenä ominaisuutena.


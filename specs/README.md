# Ominaisuusspeksit

Tämä hakemisto sisältää sovelluksen ominaisuuksien speksit ja niiden
kirjoittamisessa käytettävän pohjan.

- [`TEMPLATE.md`](TEMPLATE.md) on uusien speksien pohja.
- Varsinaiset ominaisuusspeksit sijaitsevat [`features/`](features/)-kansiossa.
- Speksit kirjoitetaan ja toteutetaan alla olevassa järjestyksessä.

## Ensimmäisen vaiheen speksit

| # | Speksi | Tila | Tarkoitus | Riippuvuudet |
|---:|---|---|---|---|
| 1 | [Syötteen rivien tunnistaminen](features/input-line-classification.md) | Kirjoitettu | Tunnistaa sointu-, sävel-, teksti- ja tyhjät rivit sekä epäselvät syötteet. | Ei riippuvuuksia |
| 2 | [Transponointiasetusten valinta](features/transposition-settings.md) | Kirjoitettu | Valitsee duurin tai mollin, lähtösävellajin ja askelmäärän sekä ratkaisee mahdollisen enharmonisen lisävalinnan. | Ei toteutusriippuvuutta speksistä 1 |
| 3 | `features/chord-transposition.md` | Suunniteltu | Transponoi soinnut, bassosoinnut ja H/B-merkinnät sekä käsittelee epäilyttävät soinnut. | 1 ja 2 |
| 4 | `features/note-transposition.md` | Suunniteltu | Jäsentää ja transponoi sävelryhmät sekä käsittelee `b`, `B`, `H` ja `#` -merkinnät. | 1 ja 2 |
| 5 | `features/rich-text-formatting.md` | Suunniteltu | Säilyttää sävelten korkeusalueita ilmaisevat muotoilut ja muodostaa sointurivien lihavoinnin. | 1, 3 ja 4 |
| 6 | `features/alignment-preservation.md` | Suunniteltu | Säilyttää tahtien, sointujen, sävelryhmien ja sanojen kohdistuksen lisäämällä tarvittavat välit ja yhdysmerkit. | 1, 3, 4 ja 5 |
| 7 | `features/result-and-copy.md` | Suunniteltu | Näyttää rikastekstituloksen ja kopioi sen HTML- ja tekstimuodossa. | 3–6 |
| 8 | `features/chord-notes.md` | Suunniteltu | Näyttää käyttäjän antamaan sointuun kuuluvat sävelet. | Sointusanasto speksistä 3 |

## Suositeltu toteutusjärjestys

Speksit 1 ja 2 muodostavat perustan muille ominaisuuksille. Ne voidaan
toteuttaa erillisinä, koska rivien tunnistus ei tarvitse
transponointiasetuksia ja asetusten laskenta ei tarvitse musiikkirivejä.

Sen jälkeen edetään näin:

1. sointujen transponointi
2. sävelten transponointi
3. rikastekstin muotoilujen käsittely
4. rivien välisen kohdistuksen säilyttäminen
5. tuloksen näyttäminen ja kopiointi
6. sointuun kuuluvien sävelten haku

Sointujen ja sävelten transponointi kannattaa pitää eri spekseinä, vaikka
molemmat käyttävät samoja puolisävelaskelia. Sointumerkinnöillä on omat
rakenteensa, kun taas sävelrivien yhteen kirjoitetut sävelet ja muotoilut
sisältävät melodiaan liittyvää tietoa.

## Varoitusten sijoittuminen

Varoituksista ei tehdä erillistä speksiä. Ne määritellään siinä
ominaisuudessa, jossa epäselvyys syntyy:

- runsas teksti sävelrivillä: rivien tunnistaminen
- epäilyttävä sointumerkintä: sointujen transponointi
- virheellinen askel tai puuttuva valinta: transponointiasetukset
- tuntematon haettu sointu: sointuun kuuluvat sävelet

## Myöhemmät speksit

Seuraavat ominaisuudet eivät kuulu ensimmäiseen toteutusvaiheeseen. Niille
tehdään omat speksit, kun sointuun kuuluvien sävelten toiminto on valmis:

| Speksi | Tarkoitus |
|---|---|
| `features/piano-chord-view.md` | Näyttää soinnun pianon koskettimistolla tai piano-otteena. |
| `features/guitar-chord-diagrams.md` | Näyttää kitaran sointuotteet. |
| `features/ukulele-chord-diagrams.md` | Näyttää ukulelen sointuotteet. |

Automaattinen lähtösävellajin tunnistus ja tiedostovienti arvioidaan omina
myöhempinä ominaisuuksinaan.

## Speksin valmistuminen

Speksi on valmis toteutettavaksi vasta, kun:

- kaikki hyväksymiskriteerit ovat yksiselitteisesti testattavia
- onnistumis-, virhe- ja reunatapaukset on kuvattu
- jokainen hyväksymiskriteeri löytyy testausstrategiasta
- speksin readiness-tarkistuslista on käyty läpi
- speksi ei jätä toteutuksen kannalta ratkaisevia käyttäytymissääntöjä
  avoimeksi


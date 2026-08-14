# Version rajaus

## Ensimmäinen toteutusvaihe

Ensimmäisessä toteutusvaiheessa toteutetaan vain kolme ensimmäistä speksiä:

1. syötteen rivien tunnistaminen
2. transponointiasetusten valinta
3. sointujen transponointi

Tavoitteena on saada ensin toimiva ja testattu perusta, joka tunnistaa
syötteen rivit, ratkaisee transponointiasetukset ja transponoi sointurivit.
Ensimmäinen toteutusvaihe ei vielä muodosta koko suunniteltua
käyttäjäkokemusta.

## Jatkokehitys

Seuraavien jo kirjoitettujen speksien toteutus siirretään jatkokehitykseen:

4. sävelten transponointi (`specs/features/note-transposition.md`)
5. rikastekstin muotoilujen käsittely
   (`specs/features/rich-text-formatting.md`)
6. rivien välisen kohdistuksen säilyttäminen
   (`specs/features/alignment-preservation.md`)
7. tuloksen näyttäminen ja kopiointi
   (`specs/features/result-and-copy.md`)

Speksit säilytetään, koska niissä tehdyt päätökset kuvaavat tavoitellun
kokonaisuuden ja ohjaavat ensimmäisen vaiheen rajapintoja niin, ettei
myöhempää toteutusta tarpeettomasti vaikeuteta.

Kirjoittamatta on vielä `specs/features/chord-notes.md`, joka määrittelee
sointuun kuuluvien sävelten näyttämisen. Tämä toiminto siirretään seuraavaan
versioon eikä se estä ensimmäisen toteutusvaiheen aloittamista.

Myös pianon, kitaran ja ukulelen otteet pysyvät myöhempinä
jatkokehityskohteina.

\# AGENTS.md — <Muuta sävellajia soinnuille ja sävelille>



\## Mikä tämä on



Ohjelmalla tehdään nopeasti transponointi, eli sävellajin muutos soinnuille ja sävelille, syötteelle, joka sisältää niitä sekä mahdollisesti sanat kodistettuna musiikkiin. Tuloksen voi kopioida tiedostoksi.



Syötteennä annetaan tahdistetut soinnut ja/tai sävelet sekä laulun sanat kohdistettuna musiikkiin. 

Lisäsyötteenä annetaan myös luku väliltä -12 - 12, joka kertoo, monta askelta sävellajia muutetaan. -12, 0 ja 12 palauttaa alkuperäisen syötteen. Ohjelma tunnistaa soinnut ja sävelet siitä, että niillä riveillä tahdit erotetaan putkimerkillä |. Sanariveillä putkea ei käytetä, joten teksti säilyy ennallaan. 



Putkitetut sointurivit palautetaan lihavoituina. Mielellään tarvittaisiin syöteboksi, joka ottaa myös vastaan muotoilut (lihavointi ,kursiivi).



Toisena toimintoja ohjelmalta voi kysyä sointuihin kuuluvat sävelet.



\## Komennot

\- `npm run start` — aja sovellus

\- `npm test` — aja testit

\- `npm run lint` — tyyppitarkistus



\## Koodauskäytännöt

\- TypeScript strict, ei `any`

\- ES-moduulit

\- tehdään sellaisia tallennnuksia, mitkä toimivat ja antavat suoritustehoa 



\## Testivaatimukset

\- Vitest, testitiedostot lähdekoodin vierellä `\*.test.ts`

\- Jokaiselle julkiselle funktiolle vähintään onnistuva ja virhetapaus



\## Älä

\- Käytä `any`-tyyppiä ilman perustelua

\- Ohita syötteen validointia


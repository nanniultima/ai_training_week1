# Tehtävät: transponointiasetusten valinta

Jokainen tehtävä tehdään TDD-syklinä: kirjoita nimetty testi, varmista oikea
RED-syy, tee pienin GREEN-toteutus, aja kaikki testit ja refaktoroi vasta
vihreänä. Tehtävät suoritetaan tässä järjestyksessä.

- [ ] **AC1:** Määrittele asetustyypit ja toteuta `getAvailableTonics("major")` palauttamaan täsmällinen duurilista.
- [ ] **AC2:** Laajenna `getAvailableTonics` palauttamaan täsmällinen mollilista.
- [ ] **AC3:** Kytke moodivalinta käyttöliittymään niin, että vaihto tyhjentää toonikan ja korvaa vaihtoehdot mollilistalla.
- [ ] **AC4:** Lisää `ready`-tulostyyppi ja ratkaise C-duuri +2 muodoksi D-duuri.
- [ ] **AC5:** Lisää negatiivisen siirron laskenta ja ratkaise A-molli -2 muodoksi G-molli.
- [ ] **AC6:** Säilytä alkuperäinen toonikan kirjoitusasu ja mode askelmäärällä 0.
- [ ] **AC7:** Lisää `requiresEnharmonicChoice`-tulos C#-/Db-duurin vaihtoehdoille ilman ready-tulosta.
- [ ] **AC8:** Renderöi duurin kaksi vaihtoehtoa ja tee Db-valinnasta ready-tulos sekä sulje lisävalinta.
- [ ] **AC9:** Lisää D#-/Eb-mollin `requiresEnharmonicChoice`-tulos.
- [ ] **AC10:** Lisää käytännöllisten duurinimien sääntö A-duuri +1 → Bb-duuri ilman lisävalintaa.
- [ ] **AC11:** Lisää käytännöllisten mollinimien sääntö C-molli +1 → C#-molli ilman lisävalintaa.
- [ ] **AC12:** Kata positiivinen sallittu raja C-duuri +11 vaihtoehdoilla B/Cb.
- [ ] **AC13:** Kata negatiivinen sallittu raja C-duuri -11 vaihtoehdoilla C#/Db.
- [ ] **AC14:** Validoi ja hylkää askelmäärä -12 täsmällisellä virheellä.
- [ ] **AC15:** Validoi ja hylkää askelmäärä 12 samalla täsmällisellä virheellä.
- [ ] **AC16:** Validoi ja hylkää desimaalinen askelmäärä 1.5 samalla täsmällisellä virheellä.
- [ ] **AC17:** Estä käyttöliittymän vahvistus ilman toonikaa ja näytä `Valitse lähtösävellaji`.
- [ ] **AC18:** Estä käyttöliittymän vahvistus ilman moodia ja näytä `Valitse duuri tai molli`.
- [ ] **AC19:** Normalisoi ohjelmallisen syötteen H B:ksi sekä lähdössä että kohteessa.
- [ ] **AC20:** Hylkää tuntematon toonika J täsmällisellä toonikavirheellä.
- [ ] **AC21:** Hylkää yksiselitteiselle D-duurille annettu tarpeeton flat-valinta täsmällisellä virheellä.

## Valmistumisen tarkistus

- [ ] `npm run lint` läpäisee.
- [ ] `npm test` läpäisee eikä olemassa olevia testejä ole poistettu.
- [ ] Jokainen AC1–AC21 on suljettu yllä ja sitä vastaava testi läpäisee.
- [ ] Speksin tila voidaan päivittää `Done`-tilaan vasta review-workflown hyväksynnän jälkeen.

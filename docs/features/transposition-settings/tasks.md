# Tehtävät: transponointiasetusten valinta

Jokainen keskeneräinen tehtävä tehdään omana TDD-syklinään: kirjoita vain
nimetyn AC:n testi, varmista oikea RED-syy, tee pienin GREEN-toteutus, aja
kaikki testit ja refaktoroi vasta vihreänä. Lopeta kahden peräkkäisen
red-kierroksen jälkeen.

- [x] **AC1:** Näytä duurivalinnalla 15 duuritoonikaa speksin sävelkorkeusjärjestyksessä.
- [x] **AC2:** Näytä mollivalinnalla 15 mollitoonikaa speksin sävelkorkeusjärjestyksessä.
- [x] **AC3:** Tyhjennä aiempi lähtötoonika moodia vaihdettaessa ja näytä uuden moodin lista.
- [ ] **AC4:** Asenna `@tonaljs/note` ja kata kaikki 345 duuri–askel-yhdistelmää taulukkotestillä.
- [ ] **AC5:** Kata kaikki 345 molli–askel-yhdistelmää samalla yleisellä laskentapolulla.
- [ ] **AC6:** Laajenna nykyinen C-duuri +2 -laskenta ja näytä automaattisesti `Kohdesävellaji: D-duuri`.
- [ ] **AC7:** Ratkaise A-molli ja askel `-2` valmiiksi G-molliksi ilman lisävalintaa.
- [ ] **AC8:** Säilytä Gb-duurin nimi ja laatu askeleella `0`.
- [ ] **AC9:** Palauta C-duuri +1 -tapauksessa C#-/Db-vaihtoehdot ja odottava tila.
- [ ] **AC10:** Vahvista Db-duurin valinta, tuota valmis tulos ja sulje lisävalinta.
- [ ] **AC11:** Palauta D-molli +1 -tapauksessa D#-/Eb-vaihtoehdot ja odottava tila.
- [ ] **AC12:** Valitse A-duuri +1 -tapauksessa yksiselitteisesti Bb-duuri.
- [ ] **AC13:** Valitse C-molli +1 -tapauksessa yksiselitteisesti C#-molli.
- [ ] **AC14:** Hyväksy askel `11` ja palauta B-/Cb-duurin vaihtoehdot.
- [ ] **AC15:** Hyväksy askel `-11` ja palauta C#-/Db-duurin vaihtoehdot.
- [ ] **AC16:** Hylkää askel `-12` speksin täsmällisellä virheviestillä.
- [ ] **AC17:** Hylkää askel `12` speksin täsmällisellä virheviestillä.
- [ ] **AC18:** Hylkää desimaalinen askel `1.5` speksin täsmällisellä virheviestillä.
- [ ] **AC19:** Estä UI-vahvistus ilman lähtötoonikaa ja näytä speksin virhe.
- [ ] **AC20:** Estä UI-vahvistus ilman moodia ja näytä speksin virhe.
- [ ] **AC21:** Normalisoi ohjelmallinen H-duuri B-duuriksi lähdössä ja kohteessa.
- [ ] **AC22:** Hylkää tuntematon J-toonika speksin täsmällisellä virheviestillä.
- [ ] **AC23:** Hylkää yksiselitteiselle D-duurille annettu tarpeeton flat-valinta.
- [ ] **AC24:** Näytä yksiselitteinen kohdesävellaji automaattisesti viimeisen valinnan valmistuttua.
- [ ] **AC25:** Näytä enharmoniset vaihtoehdot automaattisesti ja pidä kohde-esikatselu piilossa valintaan asti.
- [ ] **AC26:** Piilota esikatselu ja vaihtoehdot kaikissa keskeneräisissä ja virheellisissä UI-tiloissa.

## Valmistumisen tarkistus

- [ ] `docs/features/transposition-settings/test-plan.md` sisältää testirivin jokaiselle AC1–AC26:lle.
- [ ] `npm run lint` läpäisee.
- [ ] `npm test` läpäisee eikä olemassa olevia testejä ole poistettu.
- [ ] Jokainen AC1–AC26 on suljettu yllä ja sitä vastaava testi läpäisee.
- [ ] Diffissä ei ole speksin ulkopuolista toteutusta.
- [ ] Speksin tila voidaan päivittää `Done`-tilaan vasta review-workflown hyväksynnän jälkeen.

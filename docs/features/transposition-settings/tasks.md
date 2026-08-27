# Tehtävät: transponointiasetusten valinta

**Status:** Draft

Jokainen keskeneräinen tehtävä tehdään omana TDD-syklinään: kirjoita vain
nimetyn AC:n testi, varmista oikea RED-syy, tee pienin GREEN-toteutus, aja
kaikki testit ja refaktoroi vasta vihreänä. Lopeta kahden peräkkäisen
red-kierroksen jälkeen.

- [x] **AC1:** Näytä duurivalinnalla 15 duuritoonikaa speksin sävelkorkeusjärjestyksessä.
- [x] **AC2:** Näytä mollivalinnalla 15 mollitoonikaa speksin sävelkorkeusjärjestyksessä.
- [x] **AC3:** Tyhjennä aiempi lähtötoonika moodia vaihdettaessa ja näytä uuden moodin lista.
- [x] **AC4:** Asenna `@tonaljs/note` ja kata kaikki 345 duuri–askel-yhdistelmää taulukkotestillä.
- [x] **AC5:** Kata kaikki 345 molli–askel-yhdistelmää samalla yleisellä laskentapolulla.
- [x] **AC6:** Laajenna nykyinen C-duuri +2 -laskenta ja näytä automaattisesti `Kohdesävellaji: D-duuri`.
- [x] **AC7:** Ratkaise A-molli ja askel `-2` valmiiksi G-molliksi ilman lisävalintaa.
- [x] **AC8:** Säilytä Gb-duurin nimi ja laatu askeleella `0`.
- [x] **AC9:** Palauta C-duuri +1 -tapauksessa C#-/Db-vaihtoehdot ja odottava tila.
- [ ] **AC10:** Anna Db täsmällisenä kohdetoonikkana resolverille, validoi ready-tulos step-arvoineen ja sulje lisävalinta.
- [x] **AC11:** Palauta D-molli +1 -tapauksessa D#-/Eb-vaihtoehdot ja odottava tila.
- [x] **AC12:** Valitse A-duuri +1 -tapauksessa yksiselitteisesti Bb-duuri.
- [x] **AC13:** Valitse C-molli +1 -tapauksessa yksiselitteisesti C#-molli.
- [x] **AC14:** Hyväksy askel `11` ja palauta B-/Cb-duurin vaihtoehdot.
- [x] **AC15:** Hyväksy askel `-11` ja palauta C#-/Db-duurin vaihtoehdot.
- [x] **AC16:** Hylkää askel `-12` speksin täsmällisellä virheviestillä.
- [x] **AC17:** Hylkää askel `12` speksin täsmällisellä virheviestillä.
- [x] **AC18:** Hylkää desimaalinen askel `1.5` speksin täsmällisellä virheviestillä.
- [x] **AC19:** Estä vahvistaminen ja näytä `Valitse lähtösävellaji`, kun toonika puuttuu.
- [x] **AC20:** Estä vahvistaminen ja näytä `Valitse duuri tai molli`, kun laatu puuttuu.
- [x] **AC21:** Hylkää tuntematon J-toonika speksin täsmällisellä virheviestillä.
- [ ] **AC22:** Hylkää yksiselitteiselle D-duurille annettu tarpeeton kohdetoonikan valinta.
- [x] **AC23:** Näytä yksiselitteinen kohdesävellaji automaattisesti viimeisen valinnan valmistuttua.
- [x] **AC24:** Näytä enharmoniset vaihtoehdot automaattisesti ja pidä kohde-esikatselu piilossa valintaan asti.
- [x] **AC25:** Piilota esikatselu ja vaihtoehdot kaikissa keskeneräisissä ja virheellisissä UI-tiloissa.
- [ ] **AC26:** Lisää validoitu step odottavaan tulosvarianttiin.
- [ ] **AC27:** Hylkää vaihtoehtoihin kuulumaton kohdetoonika täsmällisellä virheellä.
- [ ] **AC28:** Validoi runtime-moodi ja hylkää `dorian` täsmällisellä virheellä.

## Valmistumisen tarkistus

- [ ] `docs/features/transposition-settings/test-plan.md` sisältää nimetyn testin jokaiselle speksissä olevalle AC:lle.
- [ ] `npm run lint` läpäisee.
- [ ] `npm test` läpäisee eikä olemassa olevia testejä poisteta.
- [ ] Kaikki speksissä olevat AC:t on suljettu ja niitä vastaavat testit läpäisevät.
- [ ] Diffissä ei ole speksin ulkopuolista toteutusta.
- [ ] Speksin tila voidaan päivittää `Done`-tilaan vasta review-workflown hyväksynnän jälkeen.

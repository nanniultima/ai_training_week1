# Tehtävät: transponointiasetusten valinta

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
- [x] **AC10:** Vahvista Db-duurin valinta, tuota valmis tulos ja sulje lisävalinta.
- [x] **AC11:** Palauta D-molli +1 -tapauksessa D#-/Eb-vaihtoehdot ja odottava tila.
- [x] **AC12:** Valitse A-duuri +1 -tapauksessa yksiselitteisesti Bb-duuri.
- [x] **AC13:** Valitse C-molli +1 -tapauksessa yksiselitteisesti C#-molli.
- [x] **AC14:** Hyväksy askel `11` ja palauta B-/Cb-duurin vaihtoehdot.
- [x] **AC15:** Hyväksy askel `-11` ja palauta C#-/Db-duurin vaihtoehdot.
- [x] **AC16:** Hylkää askel `-12` speksin täsmällisellä virheviestillä.
- [x] **AC17:** Hylkää askel `12` speksin täsmällisellä virheviestillä.
- [x] **AC18:** Hylkää desimaalinen askel `1.5` speksin täsmällisellä virheviestillä.
- [x] **AC19:** Estä UI-vahvistus ilman lähtötoonikaa ja näytä speksin virhe.
- [x] **AC20:** Estä UI-vahvistus ilman moodia ja näytä speksin virhe.
- [x] **AC21:** Hylkää tuntematon J-toonika speksin täsmällisellä virheviestillä.
- [x] **AC22:** Hylkää yksiselitteiselle D-duurille annettu tarpeeton flat-valinta.
- [x] **AC23:** Näytä yksiselitteinen kohdesävellaji automaattisesti viimeisen valinnan valmistuttua.
- [x] **AC24:** Näytä enharmoniset vaihtoehdot automaattisesti ja pidä kohde-esikatselu piilossa valintaan asti.
- [x] **AC25:** Piilota esikatselu ja vaihtoehdot kaikissa keskeneräisissä ja virheellisissä UI-tiloissa.

## Valmistumisen tarkistus

- [x] `docs/features/transposition-settings/test-plan.md` sisältää testirivin jokaiselle AC1–AC25:lle.
- [x] `npm run lint` läpäisee.
- [x] `npm test` läpäisee; speksistä poistettiin vain samalla poistettuun H-sävellajivaatimukseen kuulunut testi.
- [x] Jokainen AC1–AC25 on suljettu yllä ja sitä vastaava testi läpäisee.
- [ ] Diffissä ei ole speksin ulkopuolista toteutusta.
- [ ] Speksin tila voidaan päivittää `Done`-tilaan vasta review-workflown hyväksynnän jälkeen.

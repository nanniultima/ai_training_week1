# Tehtävät: syötteen rivien tunnistaminen

Jokainen tehtävä tehdään omana TDD-syklinään: kirjoita vain nimetyn AC:n testi, varmista oikea RED-syy, tee pienin GREEN-toteutus, aja kaikki testit ja refaktoroi vasta vihreänä. Lopeta kahden peräkkäisen red-kierroksen jälkeen.

- [ ] **AC1:** Määrittele luokittelun perustyypit ja säilytä tyhjemerkkirivi `empty`-rivinä sisältöineen ja indeksineen.
- [ ] **AC2:** Lisää putkimerkin perusteella tehtävä `chord`-luokittelu sisältöä muuttamatta.
- [ ] **AC3:** Varmista putkisäännön etusija ja estä epäselvyysvaroitus putkiriviltä.
- [ ] **AC4:** Tunnista pienaakkosin kirjoitetut sallitut säveltokenit `note`-riviksi.
- [ ] **AC5:** Laajenna säveltunnistus isoihin, ylennettyihin ja yhteen kirjoitettuihin säveliin.
- [ ] **AC6:** Kata pienen `b`:n alennusmerkki ja itsenäinen iso `B` kaikissa neljässä annetussa muodossa.
- [ ] **AC7:** Hyväksy `H` ja `h` B-sävelen vaihtoehtoisiksi nimiksi sävelrivillä.
- [ ] **AC8:** Hyväksy positiivinen `xN`-toistomerkintä sävelrivin sisältötokenina sitä muuttamatta.
- [ ] **AC9:** Luokittele muu putketon ei-tyhjä sisältö `text`-riviksi ilman aiheetonta varoitusta.
- [ ] **AC10:** Lisää sekasisältöisen putkettoman rivin `AMBIGUOUS_NOTE_LINE`-varoitus täsmällisine tietoineen.
- [ ] **AC11:** Säilytä sointu-, sävel- ja tekstirivien alkuperäinen järjestys samassa tuloksessa.
- [ ] **AC12:** Hyväksy sointu- ja tekstirivien yhdistelmä ilman sävelriviä.
- [ ] **AC13:** Hyväksy yksi sävelrivi ilman sointu- tai tekstirivejä.
- [ ] **AC14:** Säilytä tyhjät rivit, rivimäärä ja nollasta alkavat indeksit musiikkirivien välissä.
- [ ] **AC15:** Validoi tyhjä rivilista ja heitä speksin täsmällinen virhe.
- [ ] **AC16:** Hyväksy sointu- ja sävelrivit ilman tekstiriviä.
- [ ] **AC17:** Hyväksy sävel- ja tekstirivit ilman sointuriviä.
- [ ] **AC18:** Hyväksy yksi sointurivi ilman sävel- tai tekstirivejä.
- [ ] **AC19:** Hylkää pelkkiä teksti- ja tyhjiä rivejä sisältävä syöte täsmällisellä virheellä.
- [ ] **AC20:** Hyväksy itsenäinen tekstirivi ennen musiikkia ja säilytä sen sisältö.
- [ ] **AC21:** Hyväksy itsenäinen tekstirivi musiikkikokonaisuuksien välissä ja säilytä sen sisältö.
- [ ] **AC22:** Hyväksy peräkkäiset sointurivit sisältöjä ja järjestystä muuttamatta.
- [ ] **AC23:** Hyväksy vuorottelevat sointu- ja sävelrivit sisältöjä ja järjestystä muuttamatta.
- [ ] **AC24:** Toteuta loogisten editoririvien numerointi yhdestä alkaen ja liitä palsta käyttöliittymään.
- [ ] **AC25:** Perusta numeroiden määrä vain loogisiin rivinvaihtoihin, jotta visuaalinen rivitys ei lisää numeroita.
- [ ] **AC26:** Toteuta nollasta alkavan sisäisen indeksin muunto käyttäjälle näkyväksi rivinumeroksi.

## Valmistumisen tarkistus

- [ ] `npm run lint` läpäisee.
- [ ] `npm test` läpäisee eikä olemassa olevia testejä ole poistettu.
- [ ] Jokainen AC1–AC26 on suljettu yllä ja sitä vastaava testi läpäisee.
- [ ] Diffissä ei ole speksin ulkopuolista toteutusta.
- [ ] Speksin tila voidaan päivittää `Done`-tilaan vasta review-workflown hyväksynnän jälkeen.

# Tehtävät: syötteen rivien tunnistaminen

**Status:** Draft

Jokainen kohta tehdään omana RED–GREEN–REFACTOR-syklinään. Varmista oikea RED-syy, tee pienin GREEN-toteutus, aja kaikki testit ja refaktoroi vasta vihreänä. Lopeta kahden peräkkäisen red-kierroksen jälkeen.

- [ ] AC1: tyypit ja tyhjemerkkirivi.
- [ ] AC2: putken chord-etusija.
- [ ] AC3: tuetut sävelryhmät.
- [ ] AC4: täsmällinen xN.
- [ ] AC5: tiukka yhdysmerkkierotin.
- [ ] AC6: virheelliset yhdysmerkkirajat.
- [ ] AC7: yksi etumerkki.
- [ ] AC8: virheelliset ja yksinäinen xN.
- [ ] AC9: laulunsanat ilman varoitusta.
- [ ] AC10: sanansisäiset sävelkirjaimet.
- [ ] AC11: täsmällinen varoitus.
- [ ] AC12: järjestys, indeksit ja tyhjät rivit.
- [ ] AC13: musiikkia sisältävät yhdistelmät.
- [ ] AC14: tyhjä rivilista.
- [ ] AC15: musiikiton syöte.
- [ ] AC16: segmentit ja content.
- [ ] AC17: fonttikoon säilytys ilman validointia.
- [ ] AC18: sarkainraja.
- [ ] AC19: LF-numerointi.
- [ ] AC20: vain loogiset rivit.
- [ ] AC21: indeksimuunnos.
- [ ] AC22: palstan DOM-liitäntä.
- [ ] AC23: vierityssynkronointi.
- [ ] AC24: numerot editorin sisällön ulkopuolella.
- [ ] AC25: useat kohdistusvälit sävelrivillä.

## Valmistumisen tarkistus

- [ ] AC1–AC25 ja nimetyt testit läpäisevät.
- [ ] `npm run lint`, `npm test` ja `git diff --check` läpäisevät.
- [ ] Diffi pysyy Files to Modify -rajauksessa.
- [ ] Review yhdistää muutokset AC:ihin ja päättyy verdictiin.
- [ ] Tila vaihtuu `Draft` → `In Progress` develop-vaiheessa ja `Done` vasta hyväksytyn review-vaiheen jälkeen.

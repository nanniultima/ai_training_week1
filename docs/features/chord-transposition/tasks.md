# Tehtävät: sointujen transponointi

**Status:** Draft

Jokainen AC tehdään omana RED–GREEN–REFACTOR-syklinään. Kirjoita vain
nimetyn AC:n testi, varmista oikea RED-syy, tee pienin GREEN-toteutus ja aja
kaikki testit. Lopeta kahden peräkkäisen red-kierroksen jälkeen.

- [ ] AC1: duurisointu ylöspäin.
- [ ] AC2: mollisointu alaspäin.
- [ ] AC3: tuetut päätteet `sus` ja bassomuodot mukaan lukien.
- [ ] AC4: bassosoinnun molemmat sävelet.
- [ ] AC5: alennettu basso.
- [ ] AC6: H-normalisointi.
- [ ] AC7: B ja Bb.
- [ ] AC8: sharp-kohde.
- [ ] AC9: flat-kohde.
- [ ] AC10: neutraali C-duuri ylöspäin.
- [ ] AC11: neutraali C-duuri alaspäin.
- [ ] AC12: neutraali A-molli ylöspäin.
- [ ] AC13: neutraali A-molli alaspäin.
- [ ] AC14: nolla-askeleen kirjoitusasu.
- [ ] AC15: sävellajin ulkopuolinen sointu.
- [ ] AC16: moduloiva chord-rivi.
- [ ] AC17: koko rivi alaspäin.
- [ ] AC18: muu teksti.
- [ ] AC19: putket, välimerkit ja välit.
- [ ] AC20: Cfoo säilyy ja varoittaa.
- [ ] AC21: Xfoo säilyy ilman varoitusta.
- [ ] AC22: tyhjä symboli.
- [ ] AC23: keskeneräinen basso.
- [ ] AC24: väärä rivityyppi.
- [ ] AC25: pienaakkossoinnut.
- [ ] AC26: cafe ilman varoitusta.
- [ ] AC27: tiukka symbolifunktio hylkää Cfoo-tokenin.
- [ ] AC28: segmenttien muotoilu säilyy ilman uutta boldia.
- [ ] AC29: C9 säilyy ja varoittaa.
- [ ] AC30: kaikki erilliset musiikkimerkit.
- [ ] AC31: kaikki major/minor sharp/flat/neutral-kohteet.
- [ ] AC32: vain `ready`-asetustulos hyväksytään tyyppitasolla.
- [ ] Poista vanha `transposeMusic`-skeleton ja sen testi, kun uusi API on vihreä.

## Valmistumisen tarkistus

- [ ] Jokainen AC1–AC32 ja sitä vastaava nimetty testi läpäisee.
- [ ] `npm run lint` läpäisee.
- [ ] `npm test` läpäisee eikä asiaankuulumattomia testejä poisteta.
- [ ] `git diff --check` läpäisee.
- [ ] Diffi pysyy speksin Files to Modify -rajauksessa.
- [ ] Review yhdistää jokaisen muutoksen AC:hen ja päättyy verdictiin.
- [ ] Tila vaihtuu `Draft` → `In Progress` develop-vaiheessa ja `Done` vasta hyväksytyn review-vaiheen jälkeen.

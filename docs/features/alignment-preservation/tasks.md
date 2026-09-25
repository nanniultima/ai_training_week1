# Tasks: alignment-preservation

1. Aloita tilasta `Ready for implementation`, muuta `In Progress` ja jatka
   TDD:tä uudesta AC23:sta; AC1–AC22 ovat valmiit.
2. AC1 ja AC24–AC27: ryhmittely, suorat text/empty-identiteetit, alkuperäinen
   järjestys ja whitespace-empty-normalisointi ilman ankkurilaskentaa.
3. AC2–AC10: kokonaiset +1/+2-esimerkit, lähdeankkurit, kohdistetut
   `alignedRange`-alueet, `collectAlignmentAnchors(group,"aligned")`-kutsulla
   johdetut tulosyksiköt ja lähdesarakkeisiin perustuva tekstijako.
4. AC11–AC20: välit, viivat, lyhyet rivit, lyheneminen ja törmäykset.
5. AC21–AC23: segmenttimuotoilut ja xN; jatko alkaa AC23:n RED-vaiheesta.
6. AC28–AC34 ja AC36: yhden musiikkirivin sekä text-only/empty-only-syötteet;
   validoinnit järjestyksessä sarkain → chord/note-tulosvastaavuus →
   chord/note-lähdealueet → ryhmittely/kohdistus.
7. AC35: chord-, suspiciousChord-, pipe- ja noteGroup-tokenien Unicode-
   lähdealueet sekä johdettu `|Chord`-alue.
8. AC37: neljän funktion API, `collectAlignmentAnchors`-funktion valinnainen
   `"source"|"aligned"`-koordinaatti, `AlignedMusicResultLine[]` ja
   formatteriyhteensopivuus.
9. AC38–AC42: saman tahdin eri soinnut, `|Chord`, `|suspiciousChord`, paljas
   sointu, itsenäinen pipe ja `||G` lähde- ja tulosalueineen.
10. AC43: todista lähdealueiden immutabiliteetti, kaikkien näkyvien
   ankkuritokenien `alignedRange`-kentän pakollisuus, johdettujen yksiköiden
   erillisyys tokenialueista ja aligned-tilan täsmällinen puuttuvan alueen virhe.
11. AC44: laske törmäys vain saman rivin peräkkäisille ankkuritokeneille ja estä eri rivien valetörmäys.
12. Korvaa vanhat testit vain uuden vastaavan AC:n RED-vaiheessa; korvaa vanhat
   AC47/AC48-tyyppiplaceholderit uuden AC37:n RED-vaiheessa ja säilytä koodi
   vain uuden testin todistamana.
13. Aja lint, kaikki testit ja diff-tarkistus; tee AC-kohtainen review.
14. Muuta `In Progress → Done` vasta 44/44 AC:n ja lopputarkistusten jälkeen.

Älä muuta UI:ta, tuota HTML:ää kohdistuslogiikassa tai toteuta speksiä 7.

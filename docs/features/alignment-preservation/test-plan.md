# Test plan: alignment-preservation

## Traceability

Speksissä on täsmälleen 43 AC:tä. Speksin Testing Strategy -taulukko nimeää
vähintään yhden testin jokaiselle ja on normatiivinen 43/43-matriisi.

- AC1, AC24–AC27, AC30–AC34, AC36 ja AC38: `groupAlignedLines.test.ts`
- AC2–AC23, AC28 ja AC38–AC43: `alignLineGroup.test.ts`
- AC29: `groupAlignedLines.test.ts` kattaa text-only- ja empty-only-syötteet
- AC35: chord- ja note-transponoinnin lähdealue- ja tyyppitestit
- AC37 ja AC43: `alignment.types.test.ts`, `alignLineGroup.test.ts` ja `formatMusicResult.test.ts`

## Coverage

Pääpolut ovat kokonaiset C#-duurin `+1`- ja D-duurin `+2`-esimerkit sekä
niiden `collectAlignmentAnchors(alignedGroup,"aligned")`-kutsulla johdetut
täsmälliset ankkurilistat. Testit eivät muodosta listaa kaikkien tokenien
`alignedRange.start`-arvoista, koska yhdistetyn `|Chord`-yksikön chord-tokenin
alku ei ole erillinen ankkuri. AC38 kattaa kaksi erillistä sointua
saman tahdin sisällä. AC39–AC42 kattavat `|Chord`- ja `|suspiciousChord`-
yhdistelmät, paljaan soinnun, itsenäisen pipen sekä `||G`-tapauksen. AC6
lukitsee lähdesarakkeisiin perustuvan tekstijaon. Osatapaukset kattavat
kasvun, lyhenemisen, törmäykset, välit, viivat, muotoilun, xN:n, ryhmittelyn
ja yhden musiikkirivin ryhmät. AC14 varmistaa, ettei sisällötön loppuputki
lisää tekstin loppuvälilyöntejä.

AC24, AC27 ja AC29 kattavat suorien text/empty-identiteettien järjestyksen,
muuttumattomat text-segmentit, whitespace-empty-normalisoinnin sekä sen, etteivät
musiikittomat rivit osallistu ankkurilaskentaan. Virhepolut AC30–AC34 ja AC36
kattavat globaalin sarkainkiellon, vain chord/note-riveihin kohdistuvan
puuttuvan/ylimääräisen/vääräntyyppisen tuloksen, puuttuvat alueet ja täsmällisen
validointijärjestyksen. AC35 kattaa Unicode-koodipisteet.

AC3, AC5, AC10, AC15–AC18, AC21, AC23 ja AC39–AC43 kattavat sen, että
`sourceRange` säilyy muuttumattomana ja `alignedRange` kuvaa näkyvän
tulossijainnin Unicode-koodipisteinä. AC15–AC18 laskevat sarakkeet aina
lähdeyksiköistä. AC37 lukitsee `"source"|"aligned"`-koordinaattiargumentin ja
neljän julkisen funktion rajauksen. AC39–AC42 lukitsevat paljaiden ja
yhdistettyjen pipe/chord-yksiköiden täsmälliset alueet. AC43 tarkistaa kaikki
ankkuritokenilajit yhdellä immutabiliteetti- ja pakollisuustestillä sekä
aligned-tilan täsmällisen puuttuvan alueen virheen.

## Execution

AC1–AC22 ovat valmiit. TDD jatkuu uudesta AC23:sta. Vanhat placeholderit
korvataan vasta uuden vastaavan AC:n RED-vaiheessa; vanhat AC47/AC48-
tyyppiplaceholderit korvataan uuden AC37:n RED-vaiheessa. Lopuksi ajetaan
`npm run lint`, `npm test` ja `git diff --check`, ja määrät raportoidaan
projektin värisymboleilla.

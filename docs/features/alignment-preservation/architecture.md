# Architecture: alignment-preservation

## Flow

`ClassifiedLine[]` ja transponointitulokset → `groupAlignedLines` →
`collectAlignmentAnchors` → `calculateAlignedColumns` → `alignLineGroup` →
speksi 5:n `formatMusicResult` → myöhempi UI.

## Contracts

- Ryhmä sisältää enintään chord-, note- ja text-rivin tässä järjestyksessä.
- Itsenäiset text- ja empty-rivit ohitetaan ankkurilaskennassa mutta säilytetään
  suorina `MusicResultLine`-identiteetteinä alkuperäisessä järjestyksessä. Text
  säilyy segmentteineen muuttumattomana; whitespace-empty normalisoituu.
- Chord, suspiciousChord, jokainen pipe ja noteGroup kantavat pakollisen
  `SourceRange`-alueen.
- Alueet ovat Unicode-koodipistesarakkeita ja `end` on poissulkeva.
- `sourceRange` säilyy alkuperäisenä. `collectAlignmentAnchors` lukee sitä,
  `calculateAlignedColumns` ei muuta tokeneita ja `alignLineGroup` lisää
  palautettujen ankkuritokenien pakollisen `alignedRange`-alueen.
- `collectAlignmentAnchors(group, coordinate = "source")` hyväksyy vain
  `"source"|"aligned"`. Molemmissa tiloissa se johtaa kohdistusyksiköt; se ei
  palauta kaikkien näkyvien tokenien start-arvojen unionia. `"aligned"`-tilan
  puuttuva alue heittää virheen
  `Kohdistettavalta tokenilta puuttuu kohdistettu sijainti`.
- Paljas chord, itsenäinen pipe ja noteGroup alkavat lasketusta sarakkeesta.
  Yhdistetyn `|Chord`-yksikön pipe kattaa `A..A+1` ja chord alkaa kohdasta
  `A+1`; `||G` säilyttää itsenäisen pipen erillään yhdistetystä `|G`:stä.
- Välittömästi vierekkäinen pipe ja chord tai suspiciousChord johdetaan yhdeksi
  `|Chord`-kohdistusyksiköksi pipen sarakkeeseen. Muut chordit ja pipet ovat
  itsenäisiä yksiköitä; `||G` on itsenäinen `|` ja yhdistetty `|G`.
- Jokainen noteGroup on yksi ankkuri myös monisävelisenä.
- Tekstiosat rajataan alkuperäisillä musiikkiankkurien sarakkeilla ilman
  kieliopillista tavutusta. Sisällötön loppuputki ei täytä tekstiä loppuväleillä.
- Tulos on `AlignedMusicResultLine[]`, joka on rakenteellisesti speksi 5:n
  `MusicResultLine[]`-syötteen kanssa yhteensopiva, ilman DOM/UI-riippuvuutta.

## Algorithm

1. Validoi sarkain koko syötteestä, myös itsenäisiltä text-riveiltä.
2. Validoi vain chord/note-rivien index/type-tulosvastaavuus ja vasta sitten
   niiden tokenien lähdealueet. Musiikkirivin puuttuminen ei ole virhe.
3. Ryhmittele ja säilytä itsenäiset text/empty-rivit suorina identiteetteinä
   järjestyksessä; ohita ne ankkurilaskennassa.
4. Johda `collectAlignmentAnchors(group,"source")`-kutsulla chord-rivin
   kohdistusyksiköt, yhdistä niiden ja noteGroup-aloitusten järjestetty unioni
   ja rajaa tekstiosat samoilla lähdesarakkeilla. Välittömästi vierekkäisen
   pipe+chord-parin yksikkö alkaa pipestä; chord-tokenin start ei ole ankkuri.
5. Säilytä ensimmäinen lähdeyksikön sarake; laske seuraavat suurimmasta pituusmuutoksesta
   ja estä törmäykset pisimmällä tokenilla sekä lähteen erotinvälillä.
6. Kirjoita chord-, suspiciousChord-, pipe- ja noteGroup-tulostokeneille
   `alignedRange` muuttamatta niiden `sourceRange`-arvoja.
7. Johda tarvittaessa tulosankkurit kutsulla
   `collectAlignmentAnchors(alignedGroup,"aligned")`; näkyvien tokenien omat
   alueet säilyvät, mutta yhdistelmäsoinnun alku ei muodosta toista ankkuria.
8. Lisää musiikkiin muotoilemattomia välejä ja tekstiin välejä tai
   muotoilun periviä viivoja. Poista lyhentyessä vain kohdistusrajan viiva.

AC2–AC6:n kokonaiset esimerkit ja tekstijako sekä AC38–AC43:n chord/pipe-
rakenteet ovat ensisijainen hyväksyntäoraakkeli.

## Partial TDD restart

Vanhaan speksiversioon perustuva koodi ja testit jätetään spec-vaiheessa
koskematta. AC1–AC22 ovat valmiit ja TDD jatkuu uudesta AC23:sta. Vanha
placeholder korvataan vasta sitä vastaavan uuden AC:n RED-vaiheessa;
tuotantokoodi säilyy vain uuden testin todistamana.

## Rollback

Poista kohdistusmoduulit ja kohdistetut aluetyypit sekä palauta speksien 3–5 tulostyypit, lähdealueet ja
formatter viimeiseen speksi 5:n valmistuneeseen committiin.

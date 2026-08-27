# Sävelten transponointi — arkkitehtuuri

## Rajaus

Ominaisuus toteuttaa vain puhtaan liiketoimintalogiikan. Se käyttää
`ClassifiedLine`-rivin tekstiä ja muotoilusegmenttejä sekä
`ReadyTranspositionSettings`-asetuksia. HTML:n jäsentäminen ja tuloksen HTML:n
muodostaminen kuuluvat `rich-text-formatting`-ominaisuuteen.

## Tietomalli

- `NoteRegister` on `1 | 2 | 3 | 4`.
- `TransposedNote` on `{ name, register }`.
- `TransposedNoteGroupPart` sisältää järjestetyt sävelet.
- `SeparatorPart` säilyttää välilyönnin tai tiukan ` - `-erottimen.
- `RepeatPart` säilyttää täsmällisen `xN`-tekstin.
- `TransposedNoteLine` sisältää `index`, `type: "note"`, `content` ja
  järjestetyt semanttiset osat. Se ei peri `segments`-kenttää.

## Vastuut ja tietovirta

1. `parseNoteGroup` validoi yhden välilyönnein rajatun ryhmän ja palauttaa
   sävelrajat. Sama parseri toimii luokittelukieliopin lähteenä.
2. Rivin tokenisointi kohdistaa jokaisen sävelkirjaimen lähdesegmenttiin.
   Kirjaimen bold/italic-yhdistelmä ratkaisee rekisterin; etumerkin tyyli
   ohitetaan.
3. `transposeNote` validoi sävelen, rekisterin ja asetukset, laskee absoluuttisen
   korkeuden sekä kohdesävellajin mukaisen nimen.
4. `transposeNoteLine` validoi koko rivin ennen tuloksen palauttamista,
   transponoi ryhmät ja säilyttää erottimet sekä `xN`-osat atomisesti.

Etumerkilliset C/B-rajan ylitykset lasketaan absoluuttisesta korkeudesta:
`Cb` kuuluu edeltävän B:n korkeuteen ja `B#` sekä `H#` seuraavan C:n
korkeuteen. Kohdesävellaji määrää ei-nollatuloksen enharmonisen nimen.

## Riippuvuudet

- `src/types.ts`: yhteiset rajapinnat.
- `src/logic/transpositionSettings.ts`: vain `ready`-asetukset.
- `@tonaljs/note`: sävelkorkeuden ratkaisu; näkyvä nimi valitaan sovelluksen
  omilla sharp/flat-säännöillä.
- `src/logic/classifyLines.ts`: note-rivityyppi ja lähdesegmentit.

## Riskit ja palautus

Suurimmat riskit ovat segmenttirajan osuminen etumerkkiin, parserien
eriytyminen, lähtöetumerkin aiheuttama oktaavinvaihto ja osittainen rivi.
Palautus tehdään poistamalla kolme uutta logiikkamoduulia ja niiden testit
sekä palauttamalla vain tämän ominaisuuden uudet tyypit. Luokittelun nykyinen
käyttäytyminen jää ennalleen.

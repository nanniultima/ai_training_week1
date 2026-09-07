# Tuloksen näyttäminen ja kopiointi — testisuunnitelma

## Menetelmä

Vitest; logiikkatestit happy-domissa tarvittaessa, UI-testit nykyisessä
happy-dom-ympäristössä ja CSS-raja staattisella tyylisäännön tarkistuksella.
Jokainen AC saa ensin yhden nimetyn RED-testin. Koko sarja ajetaan jokaisen
GREEN-vaiheen jälkeen.

| AC | Nimetty testi | Tiedosto |
|---|---|---|
| AC1 | `AC1: transponoi koko yhdistelmäputken` | `createTranspositionResult.test.ts` |
| AC2 | `AC2: lukee editorin rikastekstin` | `createTranspositionResult.test.ts` |
| AC3 | `AC3: ratkaisee 18px fonttikoon syötteestä` | `createTranspositionResult.test.ts` |
| AC4 | `AC4: transponoi vain chord- ja note-rivit` | `createTranspositionResult.test.ts` |
| AC5 | `AC5: litistää ryhmät alkuperäiseen plainText-rivijärjestykseen` | `createTranspositionResult.test.ts` |
| AC6 | `AC6: säilyttää itsenäiset text- ja empty-rivit plainTextissä` | `createTranspositionResult.test.ts` |
| AC7 | `AC7: yhdistää luokittelu- ja sointuvaroitukset` | `createTranspositionResult.test.ts` |
| AC8 | `AC8: suorittaa nolla-askeleen koko putken` | `createTranspositionResult.test.ts` |
| AC9 | `AC9: välittää parserin tyhjäsyötevirheen` | `createTranspositionResult.test.ts` |
| AC10 | `AC10: välittää musiikkirivin puuttumisvirheen` | `createTranspositionResult.test.ts` |
| AC11 | `AC11: lisää täsmällisen monospace-kuoren` | `createResultPresentation.test.ts` |
| AC12 | `AC12: yhdistää rivit LF-merkillä` | `createResultPresentation.test.ts` |
| AC13 | `AC13: säilyttää tyhjän rivin plain textissä` | `createResultPresentation.test.ts` |
| AC14 | `AC14: jättää loppurivinvaihdon pois` | `createResultPresentation.test.ts` |
| AC15 | `AC15: säilyttää lihavoinnin ja kursivoinnin` | `createResultPresentation.test.ts` |
| AC16 | `AC16: säilyttää 18px fonttikoon` | `createResultPresentation.test.ts` |
| AC17 | `AC17: säilyttää 12px oletuskoon` | `createResultPresentation.test.ts` |
| AC18 | `AC18: sisällyttää itsenäisen tekstirivin` | `createResultPresentation.test.ts` |
| AC19 | `AC19: tekstittää epäilyttävän soinnun` | `createResultPresentation.test.ts` |
| AC20 | `AC20: tekstittää pienellä alkavan soinnun` | `createResultPresentation.test.ts` |
| AC21 | `AC21: tekstittää epäselvän sävelrivin` | `createResultPresentation.test.ts` |
| AC22 | `AC22: järjestää varoitukset sijainnin mukaan` | `createResultPresentation.test.ts` |
| AC23 | `AC23: säilyttää tasatilanteen järjestyksen` | `createResultPresentation.test.ts` |
| AC24 | `AC24: pitää varoitukset kopion ulkopuolella` | `createResultPresentation.test.ts` |
| AC25 | `AC25: hylkää tyhjän tulosrivistön` | `createResultPresentation.test.ts` |
| AC26 | `AC26: kirjoittaa molemmat MIME-muodot kerran` | `copyResultToClipboard.test.ts` |
| AC27 | `AC27: asettaa Blobien täsmälliset MIME-tyypit` | `copyResultToClipboard.test.ts` |
| AC28 | `AC28: hylkää puuttuvan clipboard.write-tuen` | `copyResultToClipboard.test.ts` |
| AC29 | `AC29: hylkää puuttuvan ClipboardItem-tuen` | `copyResultToClipboard.test.ts` |
| AC30 | `AC30: normalisoi write-rejectin` | `copyResultToClipboard.test.ts` |
| AC31 | `AC31: alustaa aktiivisen syötenäkymän ja käytöstä poistetun tulosvalinnan` | `ui.test.ts` |
| AC32 | `AC32: luo vain luku -rikastekstikentän` | `ui.test.ts` |
| AC33 | `AC33: vaihtaa syöte- ja tulospaneelin välillä` | `ui.test.ts` |
| AC34 | `AC34: käyttää yhtä täysleveää paneelisaraketta ja 80rem sivua` | `ui.test.ts` |
| AC35 | `AC35: vaihtaa onnistumisessa automaattisesti tulosnäkymään` | `ui.test.ts` |
| AC36 | `AC36: korvaa vanhan tuloksen ja varoitukset` | `ui.test.ts` |
| AC37 | `AC37: tyhjentää tuloksen ja palauttaa syötenäkymän käsittelyvirheessä` | `ui.test.ts` |
| AC38 | `AC38: estää ajon avoimessa enharmonisessa valinnassa` | `ui.test.ts` |
| AC39 | `AC39: näyttää onnistumistilan vasta write-promisen ratkettua` | `ui.test.ts` |
| AC40 | `AC40: säilyttää tuloksen kopiointivirheessä` | `ui.test.ts` |
| AC41 | `AC41: tyhjentää kopiointitilan uudessa yrityksessä` | `ui.test.ts` |
| AC42 | `AC42: tarjoaa vain kopioinnin ilman latausta tai palstaa` | `ui.test.ts` |
| AC43 | `AC43: poistaa keskeneräisyystekstit` | `ui.test.ts` |
| AC44 | `AC44: välittää valitun enharmonisen kirjoitusasun transponointiin` | `ui.test.ts` |
| AC45 | `AC45: transponoi editorin sitovilla kohdistusväleillä kirjoitetun sävelrivin` | `createTranspositionResult.test.ts` |

## Kattavuus

Jäljitettävyys 45/45. Virheet: AC9–AC10, AC25, AC28–AC30, AC37–AC38,
AC40. Reunat: AC6, AC8, AC13–AC14, AC22–AC24, AC27, AC31, AC33–AC34,
AC39, AC41–AC45. Lopputarkistus: `npm run lint`, `npm test`, `git diff --check`.

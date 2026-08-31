# Tuloksen näyttäminen ja kopiointi — tehtävät

Toteuta TDD:llä AC-järjestyksessä. Speksin tila siirtyy ennen ensimmäistä RED-
testiä `Ready for implementation` → `In Progress` ja vasta kaikkien tarkistusten
jälkeen `Done`.

1. Määrittele `src/types.ts`:ään esitys-, varoitus-, adapteri- ja UI-tilatyypit.
2. AC1–AC10: lisää `createTranspositionResult` ja sen testit; kokoa putki ja litistys muuttamatta vaiheiden 1–6 API:a.
3. AC11–AC25: lisää `createResultPresentation` ja sen testit; pidä HTML, plain text ja varoitukset erillään.
4. AC26–AC30: lisää `copyResultToClipboard`, tuotantoadapteri ja testiadapterit; tee yksi kaksimuotoinen write.
5. AC31–AC32 ja AC35–AC43: päivitä UI sekä UI-testit; lue innerHTML ja käsittele tulos-, virhe- ja kopiointitilat.
6. AC33–AC34: lisää `style.css`:ään täsmälliset breakpoint- ja grid-säännöt sekä tuloksen monospace/pre-wrap-ulkoasu.
7. Refaktoroi vain vihreänä; pidä liiketoimintalogiikka UI:n ulkopuolella.
8. Aja `npm run lint`, `npm test`, `git diff --check`; tee spec-diff-review ja merkitse `Done` vain verdictillä `APPROVED`.

## Valmistumisehdot

- AC1–AC43 ovat vihreitä ja jäljitettävyys on 43/43.
- Jokaisella julkisella funktiolla on onnistuva testi ja epäonnistuvalla API:lla virhetesti.
- Tulos ei sisällä käyttäjän vaarallista HTML:ää eikä varoituksia.
- Kopiointi kirjoittaa molemmat MIME-muodot yhdellä kutsulla.
- UI täyttää vain luku-, responsiivisuus- ja tilavaatimukset.
- Lint, koko testisarja ja diff-check onnistuvat.

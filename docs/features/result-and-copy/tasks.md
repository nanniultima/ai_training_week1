# Tuloksen näyttäminen ja kopiointi — tehtävät

Toteuta TDD:llä AC-järjestyksessä. Speksin tila siirtyy ennen ensimmäistä RED-
testiä `Ready for implementation` → `In Progress` ja vasta kaikkien tarkistusten
jälkeen `Done`.

1. Määrittele `src/types.ts`:ään esitys-, varoitus-, adapteri- ja UI-tilatyypit.
2. AC1–AC10: lisää `createTranspositionResult` ja sen testit; kokoa putki ja litistys muuttamatta vaiheiden 1–6 API:a.
3. AC11–AC25: lisää `createResultPresentation` ja sen testit; pidä HTML, plain text ja varoitukset erillään.
4. AC26–AC30: lisää `copyResultToClipboard`, tuotantoadapteri ja testiadapterit; tee yksi kaksimuotoinen write.
5. AC31–AC33 ja AC35–AC44: päivitä UI sekä UI-testit; lisää Syöte/Tulos-valitsin, välitä valittu enharmoninen kirjoitusasu ja käsittele näkymä-, tulos-, virhe- sekä asynkroniset kopiointitilat.
6. AC34: muuta `style.css` käyttämään yhtä täysleveää paneelisaraketta ja säilytä sivun 80rem enimmäisleveys sekä tuloksen monospace/pre-wrap-ulkoasu.
7. AC45: lisää koko putken regressiotesti editorin sitoville kohdistusvälilyönneille.
8. AC46: lisää koko putken regressiotesti sävelrivin ympäröivien välien säilymiselle.
9. AC47: lisää koko putken regressiotesti ryhmälle `c#b`.
10. AC48: siirrä asetuspaneeli työtilan vasempaan palstaan ja kääri näkymänvalitsin sekä aktiivinen paneeli oikeaan sisältöalueeseen.
11. AC49: lisää `64rem` pinoamisraja, jossa asetukset ovat aktiivisen paneelin edellä.
12. AC50: lisää koko putken regressiotesti pilkun ja luonnollisen sanavälin säilymiselle sävelen lyhentyessä.
13. AC51: lisää koko putken regressiotesti itsenäiselle loppuputkelle ilman tekstin tavutusta.
14. Refaktoroi vain vihreänä; pidä liiketoimintalogiikka UI:n ulkopuolella.
15. Aja `npm run lint`, `npm test`, `git diff --check`; tee spec-diff-review ja merkitse `Done` vain verdictillä `APPROVED`.

## Valmistumisehdot

- AC1–AC51 ovat vihreitä ja jäljitettävyys on 51/51.
- Jokaisella julkisella funktiolla on onnistuva testi ja epäonnistuvalla API:lla virhetesti.
- Tulos ei sisällä käyttäjän vaarallista HTML:ää eikä varoituksia.
- Kopiointi kirjoittaa molemmat MIME-muodot yhdellä kutsulla.
- UI täyttää vain luku-, responsiivisuus- ja tilavaatimukset.
- Lint, koko testisarja ja diff-check onnistuvat.

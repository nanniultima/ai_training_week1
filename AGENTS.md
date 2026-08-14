# AGENTS.md — Muuta sävellajia soinnuille ja sävelille

## Mikä tämä on

Ohjelmalla transponoidaan eli muutetaan nopeasti sointujen ja sävelten
sävellajia. Syöte voi sisältää sointuja, säveliä ja niiden kanssa
kohdistettuja laulunsanoja. Tulos on tarkoitus voida kopioida muotoiltuna
tekstinä.

Käyttäjä valitsee lähtösävellajin, duurin tai mollin sekä kokonaislukuna
puolisävelaskelten määrän väliltä `-11`–`11`. Arvo `0` säilyttää
sävelkorkeudet, mutta myöhemmät muotoilu- ja kohdistuskäsittelyt tehdään
silti.

Sointurivi tunnistetaan vähintään yhdestä putkimerkistä (`|`). Sävelrivi ei
sisällä putkia, ja laulunsanat sekä muu tavallinen teksti käsitellään
tekstiriveinä. Tarkemmat ja ajantasaiset käyttäytymissäännöt ovat
`specs/features/`-kansion spekseissä.

Ensimmäisessä toteutusvaiheessa toteutetaan:

1. syötteen rivien tunnistaminen
2. transponointiasetusten valinta
3. sointujen transponointi

Muut jo kirjoitetut speksit on rajattu jatkokehitykseen `indox.md`-tiedoston
mukaisesti.

## Komennot

- `npm install` — asenna riippuvuudet
- `npm run start` — käynnistä Vite-kehityspalvelin
- `npm test` — aja kaikki testit kerran
- `npm run test:color` — aja kaikki testit kerran värillisellä tulosteella
- `npm test -- <testitiedosto>` — aja yksittäinen testitiedosto
- `npm test -- --reporter=verbose` — aja testit yksityiskohtaisella tulosteella
- `npm run lint` — aja TypeScript-tyyppitarkistus ilman käännöstuloksia
- `npm start` — run the app

Aja muutosten tarkistamiseksi vähintään:

```text
npm run lint
npm test
```

Kun testitulokset raportoidaan keskustelussa, käytä värejä vastaavia
symboleja, koska terminaalin ANSI-värit eivät välity keskusteluikkunaan:

- 🟢 onnistuneet testit ja `0` epäonnistunutta testiä
- 🔴 vähintään yksi epäonnistunut testi
- 🟡 ohitetut testit

Raportoi testitiedostojen ja testien lukumäärät sekä epäonnistuneiden ja
ohitettujen testien määrät. Älä merkitse nollaa epäonnistunutta testiä
punaisella symbolilla.

## Workflows: research and spec

Named passes. Saying "run spec" gets the same discipline every time —
no re-explaining, no drift between sessions.

### research
Goal: understand the task before planning. Read-only.
1. Gather context: existing code when there is any, libraries and
   worked examples worth reusing, external API docs if needed
2. Identify scope: which files, what rules apply, what depends on what
3. Analyze: outline what needs doing, list what is still unknown
4. Present findings and ASK about every open question —
   never resolve a guess silently
No code, no spec, in this pass.

### spec
Goal: a specification before implementation.
Required for: new features, API changes, anything multi-file.
Optional for: typo-class fixes, config tweaks, docs.
Write specs/features/<name>.md — structure in specs/TEMPLATE.md.

Spec Readiness checklist — the spec is NOT ready until every box holds:
- [ ] Every AC is Given/When/Then with a precise expected value
- [ ] Files to modify are listed with what changes in each
- [ ] Risk: what could break, and how to roll back
- [ ] Testing strategy covers every AC, plus error and edge cases
- [ ] Every AC has at least one named test case
An incomplete testing strategy means the spec is not approved.

## Workflows: tdd, develop, review

### tdd
Prerequisite: a spec with a testing strategy (run spec first).
For EACH acceptance criterion, in order:
  RED      write the failing test for THIS AC only; the test name
           states the AC; run it and confirm it fails FOR THE RIGHT
           REASON (missing behaviour, not a broken import)
  GREEN    smallest implementation that passes this test; run ALL
           tests, confirm no regressions
  REFACTOR remove duplication, improve names; tests stay green
Then repeat the cycle for edge cases: invalid input, boundaries,
error paths.

Two traps, both near-certain:
- The model writes test and implementation in one pass. The test is
  then derived from the code and always passes. Ask separately.
- The model "fixes" a failing test to match the code. The spec
  decides which one is wrong — correct the spec first, then the test.

### develop
For work that has a spec: read it, follow the patterns already in
the codebase, change only the files the spec lists, run tdd for the
ACs, and update the spec status Draft -> In Progress -> Done.

### review
Compare the diff against the spec: which AC each change serves, what
changed that no AC asked for, which tests prove what. End with a
verdict: APPROVED or CHANGES_REQUIRED — never prose that cannot be
branched on.

## Guardrails

- Never touch `.env`; never run a command that deletes data
- Never "fix" a failing test by editing the test — the spec decides
  which one is wrong, and the spec is corrected first
- Stop after two consecutive red rounds and report — do not thrash
- <your line — what must never happen in THIS project>

## When you notice something

One line in INBOX.md. Do not implement it, do not detour.
The inbox is next week’s raw material, not this week’s scope.

## Koodauskäytännöt

- TypeScript strict, ei `any`-tyyppiä ilman perustelua
- ES-moduulit
- määrittele tyypit ennen toteutusta
- pidä liiketoimintalogiikka erillään käyttöliittymästä
- validoi ulkoiset ja käyttäjältä tulevat syötteet
- tee vain tarpeellisia tallennuksia, joilla on selvä käyttötarkoitus

## Testivaatimukset

- Käytä Vitestiä.
- Sijoita testitiedostot lähdekoodin viereen nimellä `*.test.ts`.
- Kirjoita jokaiselle julkiselle funktiolle vähintään onnistuva tapaus.
- Kirjoita virhetapaus jokaiselle julkiselle funktiolle, joka voi vastaanottaa
  virheellisen syötteen tai epäonnistua.
- Johda testit ominaisuusspeksien hyväksymiskriteereistä ja
  testausstrategioista.

## Älä

- Käytä `any`-tyyppiä ilman perustelua.
- Ohita syötteen validointia.
- Toteuta jatkokehitykseen rajattuja ominaisuuksia ilman erillistä pyyntöä.
- Muuta spekseissä päätettyä käyttäytymistä kirjaamatta muutosta ensin
  vastaavaan speksiin.

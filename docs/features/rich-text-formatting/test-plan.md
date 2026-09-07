# Rikastekstin muotoilu — testisuunnitelma

## Menetelmä

Vitest ajetaan happy-dom-ympäristössä. Jokainen testi nimetään `ACN <kuvaus>`
ja TDD etenee AC1–AC38 järjestyksessä RED–GREEN–REFACTOR.

## Jäljitettävyys

| AC:t | Nimetyt testit | Tiedosto |
|---|---|---|
| AC1–AC11 | `AC1`–`AC11` ja AC:n otsikko | `parseRichText.test.ts` |
| AC12–AC14 | `AC12`–`AC14` ja AC:n otsikko | `noteRegisterFormatting.test.ts` |
| AC15–AC20, AC24–AC31, AC36 | vastaava `ACN <otsikko>` | `formatMusicResult.test.ts` |
| AC21 | `AC21 sointutoken säilyttää lähdevälin` | `transposeChordLine.test.ts`, `formatMusicResult.test.ts` |
| AC22–AC23 | vastaavat nimetyt AC-testit | `transposeNoteLine.test.ts`, `formatMusicResult.test.ts` |
| AC32–AC35, AC37–AC39 | vastaava `ACN <otsikko>` | `parseRichText.test.ts`, tarvittaessa formatterin integraatio |

Virhetestit kattavat rekisterin, fonttikoon ja tyhjän syötteen. Reunatestit
kattavat rivit, sisäkkäisen DOM:n, desimaalipikselit, tokenien pituusmuutoksen,
ryhmän eri rekisterit sekä vaaralliset ja ei-tekstuaaliset solmut.

## Valmistumistarkistus

Aja `npm run lint`, `npm test` ja `git diff --check`. Raportoi tiedostojen,
testien, epäonnistuneiden ja ohitettujen testien määrät AGENTS.md:n mukaan.

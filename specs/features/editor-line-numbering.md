# Feature: Editorin HTML-rivien numeroinnin korjaus

**Status:** Done

## Problem Statement
Editorin numeropalsta käyttää textContent-arvoa, joka ei sisällä HTML-lohkojen
tai br-elementtien rivinvaihtoja. Varoitukset käyttävät parseRichText-rivejä,
joten numeropalsta ja varoitukset voivat osoittaa eri rivejä.

## Proposed Change
Numerointi käyttää samoja parseRichText-rivejä kuin transponointi. Parserille
lisätään valinnainen `options: {readonly allowEmpty?: boolean} = {}`.
`allowEmpty:true` sallii tyhjemerkkisyötteen rivien lukemisen numerointia varten;
oletuskutsu hylkää tyhjän rikastekstin edelleen nykyisellä virheviestillä.
HTML:n rivinormalisointi ja sanitointi eivät muutu. UI lukee editorin innerHTML:n,
liittää jäsennetyt rivitekstit LF:llä ja käyttää nykyistä renderLineNumbers-funktiota.
Tyhjä editori näyttää numeron 1. Numerointi ei muuta editorin HTML:ää tai muotoilua.
Visuaalista rivitystä ei lasketa. Vierityssynkronointi säilyy.

## Acceptance Criteria

### AC1: HTML-lohkorivit numeroidaan
**Given** editorin HTML on `<div>C |G |</div><div>onpa</div>`
**When** input-tapahtuma päivittää numeropalstan
**Then** palstan textContent on `1\n2` ja editorin innerHTML on ennallaan.

### AC2: Br ja tyhjä lohkorivi numeroidaan
**Given** HTML on vuorollaan `<div>C |G |<br>onpa</div>` ja
`<div>C |G |</div><div><br></div><div>onpa</div>`
**When** input-tapahtuma päivittää numeropalstan
**Then** numerot ovat vastaavasti `1\n2` ja `1\n2\n3`.

### AC3: Sisäkkäiset lohkot eivät lisää vääriä numeroita
**Given** HTML on `<div><p>C |G |</p></div><div>onpa</div>`
**When** numerointi päivitetään
**Then** numerot ovat `1\n2`.

### AC4: Tyhjän editorin ja tyhjien rivien numerointi toimii
**Given** HTML on vuorollaan tyhjä merkkijono, `<div><br></div>` tai
`<div><br></div><div><br></div>`
**When** numerointi päivitetään
**Then** numerot ovat vastaavasti `1`, `1` ja `1\n2`; käyttäjälle ei näytetä virhettä.

### AC5: Parserin tyhjäsyötteen validointi säilyy oletuskutsussa
**Given** HTML on `<div><br></div><div><br></div>`
**When** parseRichText kutsutaan ensin allowEmpty:true-valinnalla ja sitten oletuksella
**Then** ensimmäinen tulos sisältää kaksi `{segments:[]}`-riviä ja toinen kutsu
heittää `Rikastekstisyöte ei saa olla tyhjä`.

### AC6: Numeropalsta ja varoitus viittaavat samaan riviin
**Given** C-duuri +2 ja editorin HTML `<div>C |</div><div>Cfoo |</div>`
**When** numerointi päivitetään ja Transponoi painetaan
**Then** palstassa on `1\n2` ja ainoa varoitus alkaa
`Rivi 2, kohta 1: epäilyttävä sointu "Cfoo"`; editorin HTML säilyy ennallaan.

## Files to Modify
| File | Change |
|---|---|
| `src/logic/parseRichText.ts` | Valinnainen allowEmpty-asetus; oletusvalidointi säilyy. |
| `src/logic/parseRichText.test.ts` | AC5: tyhjien rivien lukeminen ja oletusvirhe. |
| `src/ui/ui.ts` | Numerointi samasta HTML-rivimallista kuin transponointi. |
| `src/ui/ui.test.ts` | AC1–AC4/AC6: HTML-rivit, muuttumattomuus ja varoitusintegraatio. |

## Risk
- Tyhjän editorin numerointi ei saa poistaa transponoinnin tyhjäsyötevirhettä: AC5.
- Br/lohkorivien kaksoislaskenta estetään käyttämällä samaa parseria: AC1–AC4.
- Editorin sisältö ei saa muuttua numeroinnissa: AC1/AC6 ja nykyinen AC24-regressio.
- Rollback: peru vain tämän korjauskierroksen commitin muutokset, säilyttäen
  työpuun muut keskeneräiset muutokset. Tiedostoja ei poisteta tässä työssä.

## Testing Strategy (MANDATORY)
| AC | Nimetty testi | Tiedosto |
|---|---|---|
| AC1 | `Editor lines AC1: numeroi HTML-lohkorivit muuttamatta editoria` | `ui.test.ts` |
| AC2 | `Editor lines AC2: numeroi br-erottimen ja tyhjän rivin` | `ui.test.ts` |
| AC3 | `Editor lines AC3: normalisoi sisäkkäiset lohkot` | `ui.test.ts` |
| AC4 | `Editor lines AC4: numeroi tyhjän editorin` | `ui.test.ts` |
| AC5 | `Editor lines AC5: sallii tyhjien rivien lukemisen vain erillisellä valinnalla` | `parseRichText.test.ts` |
| AC6 | `Editor lines AC6: näyttää varoituksessa numeropalstan rivin` | `ui.test.ts` |

AC1:n testi lukitaan RED-vaiheessa. Parserin allowEmpty-valinta toteutetaan
AC1:n riippuvuutena ja sen oletusvirhe tarkistetaan nykyisillä parseritesteillä;
AC5:n täsmällinen suorakutsutesti tarkistetaan AC-järjestyksessä.
Nykyiset LF-numerointi-, vieritys-, parseri- ja transponointitestit ajetaan regressioina.
Lopuksi lint, kaikki testit, diff-tarkistus ja review.

## Spec Readiness checklist
- [x] Every AC is Given/When/Then with a precise expected value
- [x] Files to modify are listed with what changes in each
- [x] Risk and rollback are documented
- [x] Testing strategy covers every AC, plus error and edge cases
- [x] Every AC has at least one named test case

## Spec review 7.10.2026
Draft-vaiheessa tarkistettu nykyinen parseri, UI ja numerointispeksin AC19–AC24.
Kuusi täsmällistä AC:tä ja nimettyä testiä. Käyttäjä hyväksyi rivinumeroinnin korjauksen.
Review: APPROVED. Valmis toteutettavaksi; varsinaiset muutokset tehdään TDD:llä.

## Toteutuksen loppuarvio 7.10.2026
AC1 RED: kahden HTML-lohkorivin palstassa näkyi vain 1. GREEN: UI käyttää
parseRichText-rivejä ja allowEmpty-valintaa. AC2–AC6 läpäisivät toteutuksen
jälkeen; oletusparserin tyhjäsyötevirhe, editorin muuttumattomuus, nykyinen
vieritys ja varoituksen rivi 2 vahvistettiin. Tuotantomuutos on rajattu
parserin valinnaiseen tyhjäsyötevalintaan ja UI:n rivitekstin muodostukseen.
21 testitiedostoa, 422 onnistunutta testiä, 0 epäonnistunutta, 0 ohitettua.
Lint ja diff-tarkistus läpäisevät. Review: APPROVED. Tila: Done.

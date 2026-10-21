# AI Tuber → GitHub Actions

Denne automatiseringen er laget for **What If in 40 Seconds**. Den produserer kun **nye** vertikale Shorts med AI-genererte videoklipp (`mediaType: "video"`), fortellerstemme og undertekster. Den sletter, flytter eller endrer aldri videoer som allerede er planlagt i AI Tuber.

## Status og påkobling

- Eksisterende GitHub-repo: [Creator-HQ](https://github.com/halvorforberg-dev/Creator-HQ).
- Den eksisterende `sync-aituber.yml`-jobben bruker hemmeligheten `AITUBER_API_KEY` for lesetilgang; den hadde en vellykket kjøring 20. oktober 2026.
- Verifiser at riktig YouTube-konto er koblet på i AI Tuber. Koden godtar bare en unik, tilkoblet kanal med navnet **What If in 40 Seconds**, **What If in 35 Seconds** eller handle `@WhatIfin35seconds`/`@WhatIfin40seconds`.
- GitHub → **Actions** → **AI Tuber — What If full-motion Shorts** → **Run workflow** → velg `check`. Dette tester API og kanal uten å bruke credits.

## Slå på automatiseringen

Åpne GitHub → Creator-HQ → **Settings → Secrets and variables → Actions → Variables**:

1. Legg til `AITUBER_PRODUCTION_ENABLED` med verdien `true` når alle gamle planlagte sendinger er kontrollert. Ingen produksjon vil kjøre før denne variabelen er satt.
2. La `AITUBER_AUTOPUBLISH_ENABLED` være avslått til en ny generert video har bestått en manuell kvalitetskontroll.
3. Når filmkvaliteten og riktig YouTube-kanal er verifisert, kan `AITUBER_AUTOPUBLISH_ENABLED` også settes til `true`. Da planlegges nye videoer automatisk til **kl. 16:00 norsk tid**.

Automatisk innhold kan først starte **9. november 2026**. Nye Shorts produseres bare **mandager og onsdager**. GitHub sjekker hver dag kl. 12:05 UTC, og skriptet vurderer norsk lokal dato/ukedag.

## Kostnad, kvalitet og sikkerhet

- Setter `mediaType: "video"`, ikke stillbilder, `videoQuality: "good"`, 9:16, `captionStyleId: "hormozi"`, engelsk stemme og scenebeskrivelser i manuset.
- Manuset er ca. 55–83 talte ord for et **mål** om 30 sekunder. API-et bestemmer faktisk lengde fra manuset, så dette er ikke en garanti om nøyaktig 30 sekunder.
- Krever minst **300 credits tilgjengelig** før produksjon. Dette er en reservegrense, ikke en presis pris eller et månedlig kostnadstak.
- Filmen opprettes med nytt ID og tilstand lagres i `data/whatif-production-state.json`. Dersom en betalt API-forespørsel får ukjent utfall, stopper jobben i stedet for å gjenta den og risikere doble credits.
- Dersom en video ikke er klar i tide, blir den **ikke publisert for sent**.
- Automatisk kvalitetssjekk kan ikke garantere at alle AI-scenene matcher fortellerstemmen. Vurder første video før automatisk publisering.
- **Little Wild Adventures**, fredagsvideoer på 1–3 minutter og søndagsvideoer på 8–12 minutter er ikke aktivert her. De trenger separate produksjonskøer og credit-budsjetter.

## Nøkler

API-nøkkelen må bare lagres som GitHub Actions-secret med navnet `AITUBER_API_KEY`, aldri som ren tekst i repository, issue, chat eller URL. Du kan opprette/tilbakekalle den på https://app.aituber.app/dashboard/api-keys.

Offisiell API-dokumentasjon: https://aituber.app/api/

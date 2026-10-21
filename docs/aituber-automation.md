# AI Tuber → GitHub Actions

Denne automatiseringen er laget for **What If in 40 Seconds**. Den produserer kun **nye** vertikale Shorts med AI-genererte videoklipp (`mediaType: "video"`), fortellerstemme og undertekster. Den sletter, flytter eller endrer aldri videoer som allerede er planlagt i AI Tuber.

## Status og påkobling

- Eksisterende GitHub-repo: [Creator-HQ](https://github.com/halvorforberg-dev/Creator-HQ).
- Den eksisterende `sync-aituber.yml`-jobben bruker hemmeligheten `AITUBER_API_KEY` for lesetilgang; den hadde en vellykket kjøring 20. oktober 2026.
- Verifiser at riktig YouTube-konto er koblet på i AI Tuber. Koden godtar bare en unik, tilkoblet kanal med navnet **What If in 40 Seconds**, **What If in 35 Seconds** eller handle `@WhatIfin35seconds`/`@WhatIfin40seconds`.
- GitHub → **Actions** → **AI Tuber — What If full-motion Shorts** → **Run workflow** → velg `check`. Dette tester API og kanal uten å bruke credits.

## Aktivering – én pilotvideo

1. Opprett to repository variables: `AITUBER_PRODUCTION_ENABLED=false` og `AITUBER_AUTOPUBLISH_ENABLED=false`. Dette er trygt utgangspunkt.
2. Første test kan aktiveres ved å endre **kun** `AITUBER_PRODUCTION_ENABLED=true`. Den kjører tidligst **9. november 2026** og bare på mandag eller onsdag. Koden er begrenset til **én** kostnadsbærende videoproduksjon totalt inntil den blir revidert etter manuell kvalitetskontroll.
3. La `AITUBER_AUTOPUBLISH_ENABLED=false` under piloten. Publiseringskoden krever i tillegg `AITUBER_REVIEW_APPROVED=true` før automatisk publisering tillates. Denne ekstra godkjenningen er ikke satt opp som variabel nå, og piloten publiserer derfor ikke.
4. Etter at testvideoen er kontrollert for levende bevegelse, riktig fortellerstemme, undertekster og lengde, kan arbeidsflyten utvides med godkjent produksjonsplan og separate credit-budsjetter. Den hardkodede grensen på én video må da endres eksplisitt.

GitHub sjekker hver dag kl. 12:05 UTC, men aktiv produksjon er låst til aktuelle publiseringsdager i norsk lokal tid. Når autopublisering en gang godkjennes, planlegges nye videoer til kl. 16:00 norsk tid.

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

# Fast åpningshook – What If og Bizarre Past

**Gjeldende for alle NYE videoer etter 25. oktober 2026.** Ikke endre, kanseller eller dupliser allerede planlagte/publiserte videoer.

## What If in 40 Seconds (AI Tuber)

1. **Første ord som publikum hører skal være "What if ..."**, etterfulgt av selve hovedspørsmålet. Ikke start med "Welcome", "Imagine", "Today", kanalnavn eller lang intro. Eksempel: **"What if dogs could talk?"**
2. Første bilde (t = 0,0) skal vise tydelig tekst med samme **"WHAT IF ...?"**, samtidig som levende handling starter. Hold spørsmålet lesbart i **2–3 sekunder**, mål 2,5 sekunder.
3. Kamera og figurer beveger seg under teksten, ingen statisk tittelskjerm.
4. Spørsmålet skal sies høyt og tydelig. På film med snakkende figurer skal en av figurene si åpningsspørsmålet selv, med munnsynkronisering; alternativt en tydelig fortellerstemme når det passer historien.
5. God stemning, nysgjerrighet, naturlig fortelling og avslutning med et poeng. Hvis 35–40 sekunder er målet, tilpass resten av manus.
6. **Før publisering:** Kontroller at både skrevet tekst og muntlig hook finnes fra første sekund. Hvis ikke: stopp publisering og korriger.

## Bizarre Past (Higgsfield -> Metricool)

1. **Første ord som høres skal være "Did you know ..."** – helst **"Did you know that ..."** etterfulgt av en tydelig, overraskende historisk påstand eller en kort fengende problemstilling. Eksempel: **"Did you know that a single pig nearly started a war?"**
2. Samtidig skal **"DID YOU KNOW ..."** vises tydelig fra første bilde, gjerne etterfulgt av hooken, i **2–3 sekunder** (mål 2,5).
3. Begynn med handling og bevegelse umiddelbart, ikke stillbilder, logoanimasjon eller lange sceneskifter.
4. Fortell hva som faktisk skjedde; bygg spenning, og avslutt med et tilfredsstillende poeng. Kildesjekk historiske påstander og ikke framstill spekulasjoner som sikre fakta.
5. Hooken gjelder både **Shorts og langfilmer**. Formuleringen kan utvides, men *"Did you know"* må stå først både skriftlig og muntlig.
6. **Før publisering:** Sjekk lydens første replikk og de første 2,5 sekundene av bildet. Hvis en av hookene mangler: ikke publiser før den er fikset.

## Produksjonsinstruks til copy/paste

**What If:** "OPEN AT 0:00 with the spoken words 'What if ...?' asking the episode's exact main question. Show the same clear 'WHAT IF ...?' question as on-screen text from the very first frame for 2.5 seconds over fully moving video. If speaking animated characters, animate the mouth of the speaking character in sync. No pre-intro, no logo, no delay. Check opening text AND first spoken words before publishing."

**Bizarre Past:** "OPEN AT 0:00 with the narrator clearly saying 'Did you know that ...?' followed by the episode's surprising, accurate historical hook. Simultaneously display a legible 'DID YOU KNOW ...?' text hook for 2.5 seconds over immediately moving cinematic footage. No greetings, no logo or still title card. Check both audio and text before scheduling/publishing."

## Teknisk håndheving

- `scripts/opening-hook-guard.cjs`: validerer ny tekst/manus og planlagt starttittel for de to kanalene.
- `scripts/aituber-whatif.cjs` bruker validering for alle nye episoder som denne GitHub-pipelinen oppretter.
- **Begrensning:** AI Tubers eksisterende native Autopilot og Higgsfield sine prosjekter blir **ikke automatisk endret** av en GitHub-fil. Bruk samme produksjonsinstruks i deres oppsett. Tekstlig validering garanterer ikke faktisk eksportert skrift eller tale; sluttvideoen må gjennomgås.

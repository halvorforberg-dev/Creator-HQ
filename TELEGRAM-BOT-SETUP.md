# Creator HQ Bot – Telegram-oppsett

Bot: [@CreatorHQHalvorBot](https://t.me/CreatorHQHalvorBot).

Dette er en første versjon basert på GitHub Actions, ikke en sanntids-chat. Status kommer fra eksisterende lagrede HQ JSON-snapshots, ikke direkte tilgang til YouTube Studio/AI Tuber. Telegram-meldinger sjekkes planlagt omtrent hvert 30. minutt (GitHub kan forsinke kjøringen). Ingen ekstra hosting trengs.

## Koble til kontoen – sikre innstillinger
1. Åpne https://github.com/halvorforberg-dev/Creator-HQ/settings/secrets/actions → **New repository secret**.
2. Legg inn **TELEGRAM_BOT_TOKEN** med token fra BotFather. Aldri send token til ChatGPT eller legg den i kode.
3. Du kan først teste tokenet: GitHub → Actions → Creator HQ Telegram → **Run workflow → check**. Grønn hake og 'Valid token' betyr at bot-tokenet virker. Send så **/start** til Telegram-boten. Under GitHub → Actions → Creator HQ Telegram → **Run workflow → poll** kan du få første kjøring uten å vente på tidsplanen.
4. Kjør deretter **Run workflow → poll**. Boten gir deg din private chat-ID. Legg tallet inn som **TELEGRAM_CHAT_ID** i GitHub Actions Secrets.
5. Skriv **/status** til boten, og kjør *poll* en gang til for å teste.
6. For vanlige AI-spørsmål: Opprett en egen prosjektbasert OpenAI API-nøkkel på https://platform.openai.com/api-keys. Bruk gjerne et eget prosjekt 'Creator HQ Bot' og sett et passende budsjett i prosjektinnstillingene.
7. Legg nøkkelen direkte inn i GitHub → Settings → Secrets and variables → Actions → New repository secret med eksakt navn **OPENAI_API_KEY**. Nøkkelen skal IKKE deles i Telegram eller ChatGPT.
8. Kjør **Actions → Creator HQ Telegram → Run workflow → check**. Når nøkkelen er tilgjengelig, testes et kort OpenAI-svar. En grønn kjøring betyr at API-testen lyktes.
9. Still et vanlig spørsmål i Telegram (for eksempel 'Gi meg fem forslag til Bizarre Past') og kjør **poll** eller vent på neste kjøring.
10. API-forbruk håndteres separat fra ChatGPT-abonnementet. Noen kvalifiserte abonnementer har en API-kredittfordel som må aktiveres separat og kan kreve minst syv dagers abonnement: https://help.openai.com/en/articles/20001626-api-credits-benefit-for-eligible-chatgpt-subscriptions. Ikke aktiver automatisk påfyll uten å vurdere kostnadene.

## Kommandoer
- **/status** – status fra sist lagrede data
- **/today** – registrerte poster for dagen
- **/week** – siste ukes poster, ikke påståtte live-analyser
- **/channels** – de tre kanalene
- **/plan** – redaksjonell plan, ikke bekreftet booking
- **/ideas** – fem kanaltilpassede ideer (AI med nøkkel)
- **/improve** – forslag til forbedringer (AI med nøkkel)
- **/help** – kommandohjelp
- Vanlige norske spørsmål krever egen OpenAI API-nøkkel og regnes som API-bruk.

## Sikkerhet og begrensninger
- Bare Telegram-chatten registrert i **TELEGRAM_CHAT_ID** får tilgang til rapportdata.
- Før chat-ID er registrert, kan en bruker bare få vite sin **egen** chat-ID ved **/start**.
- Boten sender daglig rapport ved 07:33 UTC og ukentlig rapport mandager 17:43 UTC. Norsk lokal tid skifter med sommertid.
- GitHub Actions kan utsette eller hoppe over planlagte kjøringer og kan deaktiveres etter lang inaktivitet i et offentlig repo.
- Hvis en webhook tidligere er aktivert for boten, må den deaktiveres før Telegram **getUpdates** kan brukes.
- Statusdataene fra HQ kan være utdaterte. Kildedato oppgis, og PENDING er aldri lik PUBLISHED.
- Ingen handlinger utføres i YouTube, AI Tuber eller Metricool. Ingen kommentarer, likes, kjøp eller publisering.
- Ikke legg passord, bot-token eller OpenAI API-nøkkel i offentlige filer, issues eller meldinger.

## Feilsøking hvis Telegram står og laster
- Telegram-boten er ikke en kontinuerlig nettjeneste. /start gir svar først når GitHub Actions har kjørt `poll`.
- Hvis GitHub Actions **check** blir rød, åpne jobben og les feilen. Bot-tokenet kan mangle eller være feil. Ikke del tokenet.
- Hvis `poll` er grønn uten svar, send /start på nytt, og kjør `poll` på nytt. Kontroller at du bruker privat chat med riktig bot: @CreatorHQHalvorBot.
- Hvis en eksisterende Telegram webhook er aktiv, viser `check` dette som feil. Ikke slett andres webhooks uten å vite hvilken integrasjon som eier den.
- Sjekk at GitHub Actions er aktivert for repositoriet og at du kjører på standardgrenen.

## AI-assistent – hva den kan og ikke kan

- Botens kanalforståelse ligger i `data/telegram-agent-brief.json`, sammen med tidsstemplede HQ-datapakker. Kanalbriefen inneholder format, kvalitetskrav og produksjonsvalg for Bizarre Past, Little Wild Adventures og What If.
- Boten har ikke tilgang til denne ChatGPT-samtalen, private minner eller live YouTube Studio. Den kan gi forslag, manusutkast, analyser og redegjøre for registrert status, men ikke handle på vegne av deg i YouTube eller publisere filmer.
- Eksempler: 'Hva er planlagt i dag?', 'Hva bør neste Little Wild-episode lære barna?', 'Gi fem nye positive What If-ideer', 'Hva skal vi forbedre i neste Bizarre Past-langfilm?'.
- Alle status- og publikasjonspåstander må skilles fra ønskede planer. AI-analyse uten ferske Analytics-tall er hypoteser, ikke dokumentert ytelse.
- Feilsøking: Dersom `check` blir rød etter at nøkkelen er lagt inn, les GitHub Action-loggen. Vanlige årsaker er feil nøkkel, manglende API-tilgang, tom kredittsaldo eller modellbegrensning. Du trenger ikke sende nøkkelen til oss.

## Rapportoppsett fra 2. november 2026
- **Hovedbruken av Telegram er rapporter.** Daily og weekly er automatiske GitHub Actions-sendinger. Chat-kommandosett beholdes, men det sjekkes nå normalt omtrent hver halve time.
- Det nye datagrunnlaget ligger i `data/telegram-metrics.json`, med Metricool YouTube for Bizarre Past og What If og TikTok for Bizarre. Dette kan inkludere abonnenter, målte visninger i de siste sju kalenderdagene og nylig publiserte videoer med flest kumulative visninger. **Little Wild mangler tilkoblet Metricool-analytics; aldri fyll inn anslag som fakta.**
- Daglig datainnhenting er lagt opp som en separat ChatGPT-automatisering **Creator HQ – daglige kanaltall**, som leser tilkoblet Metricool og oppdaterer GitHub-snapshot. Denne er avhengig av at den koblede appen og automatiseringen faktisk fullfører hver kjøring; GitHub-jobben kan ikke hente Metricool privat uten denne oppdateringen.
- Rapportkoden merker målinger eldre enn 48 timer, skiller status fra ytelse og oppgir kildedato. Ukesrapport viser også toppliste og frivillige AI-anbefalinger. Brukerhandlinger og Telegram-fritekstspørsmål er ikke påkrevd for å få de faste rapportene.
- For automatiske tall fra Little Wild kreves en ny autorisert YouTube Analytics-/Metricool-kobling. Ikke oppgrader abonnement eller kjøp credits automatisk.
- Dette er en rapportkanal: Botens Telegram-meldinger kan IKKE starte AI Tuber, publisere, like eller kommentere. Rapporter er ikke bevis på publisering uten bekreftelse fra plattform.

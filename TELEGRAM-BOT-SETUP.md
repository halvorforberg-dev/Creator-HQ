# Creator HQ Bot – Telegram-oppsett

Bot: [@CreatorHQHalvorBot](https://t.me/CreatorHQHalvorBot).

Dette er en første versjon basert på GitHub Actions, ikke en sanntids-chat. Status kommer fra eksisterende lagrede HQ JSON-snapshots, ikke direkte tilgang til YouTube Studio/AI Tuber. Telegram-meldinger sjekkes planlagt omtrent hvert 10. minutt (GitHub kan forsinke kjøringen). Ingen ekstra hosting trengs.

## Koble til kontoen – sikre innstillinger
1. Åpne https://github.com/halvorforberg-dev/Creator-HQ/settings/secrets/actions → **New repository secret**.
2. Legg inn **TELEGRAM_BOT_TOKEN** med token fra BotFather. Aldri send token til ChatGPT eller legg den i kode.
3. Send **/start** til Telegram-boten. Under GitHub → Actions → Creator HQ Telegram → **Run workflow → poll** kan du få første kjøring uten å vente på tidsplanen.
4. Boten gir deg din private chat-ID. Legg tallet inn som **TELEGRAM_CHAT_ID** i GitHub Actions Secrets.
5. Skriv **/status** til boten, og kjør *poll* en gang til for å teste.
6. Valgfritt: Legg inn **OPENAI_API_KEY** som GitHub Action Secret for fritekstspørsmål. ChatGPT-abonnementet dekker **ikke** OpenAI API-kostnader. Bruk av botens standardkommandoer krever ikke API-nøkkel.

## Kommandoer
- **/status** – status fra sist lagrede data
- **/today** – registrerte poster for dagen
- **/week** – siste ukes poster, ikke påståtte live-analyser
- **/channels** – de tre kanalene
- **/help** – kommandohjelp
- Frie spørsmål – krever egen OpenAI API-nøkkel.

## Sikkerhet og begrensninger
- Bare Telegram-chatten registrert i **TELEGRAM_CHAT_ID** får tilgang til rapportdata.
- Før chat-ID er registrert, kan en bruker bare få vite sin **egen** chat-ID ved **/start**.
- Boten sender daglig rapport ved 07:33 UTC og ukentlig rapport mandager 17:43 UTC. Norsk lokal tid skifter med sommertid.
- GitHub Actions kan utsette eller hoppe over planlagte kjøringer og kan deaktiveres etter lang inaktivitet i et offentlig repo.
- Hvis en webhook tidligere er aktivert for boten, må den deaktiveres før Telegram **getUpdates** kan brukes.
- Statusdataene fra HQ kan være utdaterte. Kildedato oppgis, og PENDING er aldri lik PUBLISHED.
- Ingen handlinger utføres i YouTube, AI Tuber eller Metricool. Ingen kommentarer, likes, kjøp eller publisering.
- Ikke legg passord, bot-token eller OpenAI API-nøkkel i offentlige filer, issues eller meldinger.

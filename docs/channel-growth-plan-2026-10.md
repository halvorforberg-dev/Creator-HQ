# Vekststrategi for tre kanaler – 21. oktober 2026

## Datagrunnlag og viktige begrensninger

- Bizarre Past er koblet til vidIQ og Metricool. vidIQ viste **18 abonnenter**, **2 110 totale YouTube-visninger** og **10 offentlige videoer** da vi kontrollerte den 21. oktober.
- Metricool, TikTok-konto @bizzare.past, viser følgende videodata for 8.–19. oktober: *Emu War* 1 591 views, 96 likes, 2 shares (ca. 6,0 % likes/views); *Dancing Plague* 968 views, 19 likes; *Boston molasses flood* 987 views, 4 likes; *Romans used urine* 999 views, 9 likes; *Shortest war* 287 views, 2 likes; ny *Dancing Plague* 270 views, 20 likes; *Corpse Synod* 261 views, 4 likes. Visningene kan påvirkes av alder/publiseringstid. Disse TikTok-dataene er ikke YouTube-retensjon.
- Metricool YouTube-evolution viste daglige toppverdier på 631 visninger 8. oktober og 532 12. oktober. Datagrunnlaget kobler ikke sikkert disse til konkrete videoposter; ikke påstå kausalitet.
- vidIQ sine analyse-credits er oppbrukt inntil 7. november. Enda ikke tilgjengelig: detaljert YouTube-retensjon og klikkdata for Bizarre Past.
- **What If in 40 Seconds** og **Little Wild Adventures** er ikke koblet til vidIQ eller Metricool som autoriserte kanaler for privat YouTube-analyse. Vi kan ikke fastslå deres retention, abonnentvekst eller best performers ennå.

## Hva YouTube faktisk vektlegger

- Shorts: seerne som valgte å se vs sveipet videre, gjennomsnittlig visningsvarighet, gjennomsnittlig prosent sett, likes/tilfredshet.
- Vanlige videoer: valg om å klikke på innpakningen og hvor lenge seerne blir, samt tilfredshet.
- Bruk `engagedViews` for sammenligninger gjennom YouTubes endrede view-telling i 2026.
- Thumbnails er viktig for kanal- og browseflater, og særlig for lengre videoer. **For Shorts-feed er innholdet de første 1–2 sekundene viktigere** enn bare thumbnail.
- 2–3 presise hashtags per video er ryddig, men verken hashtags, publiseringstid eller tags gir automatisk algoritmeboost.

Kilder:
- https://support.google.com/youtube/answer/11914225
- https://support.google.com/youtube/answer/12942217
- https://support.google.com/youtube/answer/16559650
- https://support.google.com/youtube/answer/72431
- https://support.google.com/youtube/answer/6390658
- https://support.google.com/youtube/answer/12220281

## Bizarre Past (Higgsfield → Metricool, YouTube/TikTok)

**Læringshypotese:** *Emu War* overpresterte på TikTok. Se spesielt etter temaer med en umiddelbart forståelig konflikt, en merkelig hendelse eller en utrolig konsekvens. En enkelt vellykket video beviser ikke at alle historier av denne typen vil virke.

- Short-hook muntlig og tekstlig: **“Did you know...”** etterfulgt av det mest utrolige poenget. Vis selve konflikten i de første 1–2 sekundene, ikke en intro/logo.
- Neste *ikke-planlagte* Shorts kan teste “The war a pig almost started”, “The emperor who taxed urine” og skattehistorier med en tydelig twist, dersom temaet ikke allerede finnes i den planlagte køen.
- Lengre videoer på 6–8 minutter: **skattejakter og mysterier**. Første 20 sekunder: hva er skatten, hvem leter og hvorfor er det farlig? Vis kart, steder og ekte scenebevegelse som matcher fortellerstemmen. Kort mellom scenene. Ingen brå avslutning.
- Langformat-titler: spørsmål + konflikt + en konkret gjenstand/sted, ikke generiske “Amazing history facts”. Eksempel: **“They Searched for This Treasure for 200 Years. What Did They Find?”**
- Thumbnail for langformat: 16:9, ett hovedmotiv (gullkiste, person, kart), høy kontrast, 0–3 ord (“LOST GOLD?”), ingen visuell overbelastning. Før publisering, kontroller at tittel og film faktisk leverer på løftet.
- Hashtag-eksempler: `#BizarreHistory #History #TreasureHunt` eller `#Vikings #History #BizarrePast` når temaet passer. Ikke bruk alle samtidig.

## What If in 40 Seconds (AI Tuber)

- Nye Shorts: mål rundt **30 sekunder**, 9:16, `mediaType: video`; ingen stillbilder som bare panoreres.
- Fang oppmerksomheten med fysisk hendelse og spørsmålet allerede i første 2 sekunder. Bytt vinkel eller dramatisk handling hver ca. 3–5 sekunder; hold bilder og narrasjon synkronisert.
- Fortell én tankeeksperimenthistorie med tydelig konsekvens, vending og naturlig slutt – ingen lang “subscribe” outro.
- Stopp-bilde/thumbnail: vertikalt 9:16, én dramatisk scene, tydelig skala, ingen uleselig AI-tekst. Brukbare thumbnail-briefer ligger i `data/whatif-production-queue.json`. AI Tuber API har `thumbnail.instructions`, men vi har **ikke bekreftet at automatisk publisering legger en egen thumbnail på YouTube Shorts**; kontroller dette i pilot.
- Metadata: konkret tittel, beskrivelse som oppsummerer hva seeren faktisk får, 2–3 hashtags som matcher emnet. F.eks. `#WhatIf #Gravity #Science`.
- Grense på **én** video før manuell kvalitetskontroll. GitHub Actions-produksjon og autopublisering forblir deaktivert inntil eksplisitt aktivering.

## Little Wild Adventures (AI Tuber)

- Styrk seriens faste karakterer (surikat + fugl) slik at barn/familier kjenner dem igjen fra video til video.
- Første sekund: karakteren gjør noe fysisk søtt, overraskende eller morsomt. En enkel mini-konflikt (mister en blomst, redder en venn), tydelig løsning, varm humor, positiv slutt.
- Levende, kontinuerlige miljøer – ikke stillbildevideo. Musikk tilpasset handling og rytme; minst mulig prat dersom kanalen skal være “good vibes”.
- Vertikal Shorts-thumbnail: uttrykksfull karakter og ett klart objekt. For langformat: bred 16:9 thumbnail med to karakterer og en tydelig lekende situasjon. Gjennomgående fargepalett, lett gjenkjennelig også på mobil.
- Hashtag-eksempel `#LittleWildAdventures #CuteAnimals #AnimatedStories` (kun når det beskriver innholdet). Gjennomgå YouTubes made-for-kids-klassifisering korrekt før publisering.

## Kontrollpunkter og handling når resultatene svikter

| Indikator | Hva du ser etter | Respons |
| --- | --- | --- |
| **Shorts: chose-to-view / swiped-away** | Mange sveiper videre | Bytt ut første bilde, forkort første setning, vis konsekvensen tidligere |
| **Shorts: average percentage viewed / engaged views** | Faller etter 3–8 sek | Klipp tomrom og øk scenerelevans, ikke bare flere klipp |
| **Subscriber gain per video** | Høye views, få nye abonnenter | Lag flere episoder i samme serie, en tydelig grunn til å følge kanalen |
| **Long-form: impressions CTR** | Mange visninger av thumbnail, få klikk | Test tydeligere tittel/thumbnail – hold videoens løfte |
| **Long-form: 30s audience retention** | Kraftig første fall | Åpne med resultat/mysterium, ikke lang intro |
| **Returning viewers** | Få kommer tilbake | Kontinuitet, serier og forutsigbar temaidentitet |

Ingen faste terskelverdier for små kanaler skal beskrives som YouTube-regler. Etter minst 10 nye sammenlignbare videoer per kanal: ranger etter *engaged views*, valgte å se, andel sett, og abonnenter per 1 000 engaged views; vurder publiseringstid etter faktisk historikk.

## Publiseringsvern og neste steg

- Alle **allerede planlagte** videoer på alle tre kanalene beholdes på samme dato og tidspunkt; verken endres, slettes eller dupliseres.
- Nye videoer følger avtalte rytmer, og What If-piloten er kun en test.
- Bruk **Higgsfield + Metricool** til Bizarre Past; **AI Tuber** til What If og Little Wild Adventures.
- Neste integrasjonssteg: autoriser What If og Little Wild Adventures i analyseverktøy/YouTube Studio og samle fakta om shorts-feed-eksponering, retention og subscribers per video.
- Utvid dashboard etter at datakilder er bekreftet: vis *total subscribers*, 7d engasjerte visninger, siste 3 videoer, topp-3 titler, neste 3 planlagte og ett anbefalt forbedringstiltak per kanal.

# Little Wild Adventures — fast karakterbibel

**Status: LÅST for alle nye produksjoner.** Opprettet 25. oktober 2026.

## Originalen er fasiten

Den opprinnelige duoen kan sees i videoen [The Flying Hat](https://www.youtube.com/shorts/MA4ahM3ZGu0). Hver ny film skal bruke de samme faste figurene, ikke nye varianter.

I AI Tuber finnes allerede en **lagret karakterreferanse**:

- Elementnavn: `Little-Wild-Adventures---Meerkat-and-Bird`
- Nøyaktig handle: `@Little-Wild-Adventures-Meerkat-and-Bird`
- Element-ID: `423a911c-12be-4d3f-8937-643faf452950`
- Type: `character`
- Beskrivelse i AI Tuber: Original golden-brown meerkat with backpack, rolled mat, dark paws, amber eyes; small **bright-blue bird** with blue crest, orange beak and feet, brown shoulder satchel; original warm, colorful 3D animation.

**Bruk eksisterende AI Tuber-element som visuell referanse for duoen i nye scener.** Ikke generer karakterenes utseende på nytt fra tekst alene.

## Fast figur 1 — surikaten

- Gylden/sandbrun pels med mørke poter, mørkere felt rundt øynene og lys mage.
- Store uttrykksfulle øyne, slank kropp, lang hale og gjenkjennelig silhuett.
- Opprinnelig ryggsekk / sammenrullet liggeunderlag kan brukes når historien passer.
- Personlighet: vennlig, litt klønete og forsiktig, varm og humoristisk.
- Samme 3D-figur i hver film. Ikke endre ansikt, pels, proporsjoner eller kroppsfasong.

## Fast figur 2 — fuglen

- Hovedfarge: **klar turkis-/cyanblå**, blå fjærtopp og blå vinger med litt mørkere spisser.
- Lys kremaktig mage/bryst, stort uttrykksfullt blikk.
- Kort guloransje nebb, oransje føtter, opprinnelig liten brun skulderveske ved behov.
- Personlighet: modig, leken, kvikk og positiv.
- **ALDRI bytt til gul fugl eller endre art, form eller fargepalett.**

## Ufravikelige regler

1. Bruk alltid den eksisterende lagrede duoen ved nye produksjoner. Legg karakterhandle `@Little-Wild-Adventures-Meerkat-and-Bird` i sceneinstruksjonene som referanse når AI Tuber API støtter dette.
2. Gjenbruk identitet og basisutseende gjennom **alle scener og alle episoder**. Bare historier, omgivelser og midlertidige rekvisitter endrer seg.
3. Ingen nye hovedfigurer eller redesign uten uttrykkelig beskjed. Nye bipersoner er greit når de ikke erstatter duoen.
4. Full motion: levende animasjon, tydelige ansiktsuttrykk og kroppsbevegelser; ikke stillbilder med panorering.
5. Hyggelige historier: vennskap, samarbeid, humor, variert bakgrunnsmusikk og positiv slutt. Stemmer/replikker kan brukes naturlig.
6. Åpningstittel på bevegelig scene synlig i 2–3 sekunder (mål 2,5). Kontroller faktisk varighet i eksport.
7. Sjekk ferdig video mot originalreferansen. Hvis fuglen blir gul eller karakterene endres, **blokker publisering** og korriger — ikke la feilversjonen bli ny standard.
8. Ikke flytt, slett, endre eller dupliser videoer som allerede er planlagt.

## Produksjonsinstruks (engelsk, kan kopieres rett inn i AI Tuber)

> Use the EXACT ORIGINAL Little Wild Adventures two-character duo from the existing saved AI Tuber element @Little-Wild-Adventures-Meerkat-and-Bird in EVERY animated scene, with consistent reference-image identity. The bird must be vivid CYAN / TURQUOISE BLUE with a blue crest, paler chest, orange beak and feet, and its original expressive shape — NEVER a yellow bird. The meerkat must retain the same original golden sandy-brown fur, dark paws and eye patches, warm amber eyes, body proportions and face. Do not reinterpret, recolor, regenerate, replace or redesign either character. Only the adventures, settings and temporary props can change. Fully animated lively colorful 3D family-adventure scenes, happy tone, music, natural expressions and movement. A visibly readable title over moving action at the start for about 2.5 seconds; verify in final video.

## Avvik 25. oktober

«The Meerkat and the Runaway Kite» brukte ved en feil en ny **gul** fugl. Denne filmen/versjonen er **ikke** karakterreferanse, og skal ikke brukes som visuell treningsmodell for senere historier.

## Teknisk status

- Karakterelementet er bekreftet eksisterende i AI Tuber (lesetilgang via API).
- GitHub/Creator HQ inneholder nå denne karakterbibelen og maskinlesbar lås i `data/littlewild-character-lock.json`.
- AI Tuber sin eksisterende **Autopilot** har ikke et tilgjengelig API for å endre prompten i denne integrasjonen. Denne filen alene endrer derfor ikke den allerede kjørende Autopilot-konfigurasjonen. Før videre Autopilot-produksjon bør den oppdateres i AI Tuber-grensesnittet til å bruke elementet og instruksen over.
- Ikke lov at en prompt alene garanterer visuell identitet: ferdig eksport må kontrolleres.

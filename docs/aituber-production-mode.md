# AI Tuber — production mode checklist

Updated 2026-10-25 after AI Tuber Pro upgrade.

## What If — talking dogs and other talking characters

**Use the 3D Talking Characters model with a short dialogue-style idea prompt**, rather than the faceless narration script input. AI Tuber documentation confirms that 3D Talking Characters speaks dialogue directly as part of the generated video, with character-specific voices and mouth movements.

- `templateId: "character"`, `inputType: "idea"`, `expectedDurationSeconds: 40` for a 40-second episode.
- Dialogue lines written `Biscuit saying: ... Pixel saying: ...`; clearly describe each character, and alternate lines.
- Around 2 spoken words per second in this mode, so target roughly 80 words of dialogue for 40 seconds.
- Idea prompt should stay under 800 characters, which is the API limit.
- `videoQuality: "good"` unless credits need to be saved.
- Opening question immediately, upbeat ending, 9:16 portrait, dynamic expressions and lively full-motion 3D shots.
- **Never confuse this with the faceless script mode**: previous script-mode attempts generated only two video clips totaling ~25 seconds, even with longer text.
- Do NOT autopublish until exact total scene duration, animated speaking characters, voice distinction and visible lip movement have been checked. Rejections and incomplete generations must be logged, not blindly retried.
- YouTube distribution: What If channel `UCUZ1h_XukdY1IQvwwuEnW0Q`. Do not change previously scheduled uploads.

Reference: https://help.aituber.app/en/article/3d-talking-character-videos-kjkm0r/

## Little Wild Adventures — recurring duo

- Original golden-brown meerkat and **turquoise blue** bird are fixed; see `docs/littlewild-character-bible.md`.
- The reference is saved in AI Tuber under `@Little-Wild-Adventures-Meerkat-and-Bird`.
- A valid short with the exact original duo and full-motion scenes was verified on 2026-10-25: https://www.youtube.com/shorts/7rXoigCUVpE.
- The earlier wrong yellow-bird kite version is already public and must not be duplicated. Neither a saved GitHub character rule nor a textual prompt alone edits existing AI Tuber Autopilot settings.

## Credits

AI Tuber Pro activation and 5,109 available credits were confirmed at 17:45 UTC (18:45 Norway) on 2026-10-25, **before** production spending later in the day. This is a snapshot, not a live account balance.

Use `GET /subscription` to confirm live balance before each new charge. Avoid duplicate POST `/videos/generate` on timeouts; store the returned video ID in the repository.

## Release integrity

A successful production is NOT the same as a published YouTube video. Verify the upload from AITuber `GET /publications/{publicationId}` or publicly from YouTube. Do not assume an accepted submission is public. Check for duplicates first.

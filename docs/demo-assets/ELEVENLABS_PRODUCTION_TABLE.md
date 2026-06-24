# PPN — ElevenLabs production pack (demo)

> Generated from `src/demo/elevenLabsProduction.ts` (`buildProductionPack()`) — the single source of truth.
> **Metadata only.** The app does **not** generate audio, call any TTS/ElevenLabs API, or store an API key.
> One row = one MP3. Record these in ElevenLabs, rename to the exact filename, and drop them into PPN.

## Active recording context

| Field | Value |
| --- | --- |
| venue | O'Learys |
| market | UK |
| sponsor | Fuller's |
| product | London Pride |
| quizSeries | O'Learys Sunday Quiz League |
| eventStyle | Pub quiz night |
| eventDate | Sunday 18th September |
| eventNumber | 3rd this month |
| tournamentStage | Qualifier |
| winnerAdvancesTo | Semi-final |
| nextEventDate | Sunday 25th September |
| language | en-GB |
| accent | British (England) |
| voicePersona | Warm, confident British pub-quiz host — friendly, a little playful, never shouty. |
| sponsorTone | Present but not too salesy. |
| responsibleWording | Required for alcohol-sponsor references (e.g. 'please drink responsibly, 18+'). |

**Markets** — **UK is active**; the others are reference/future (no MP3s for them yet):

| Market | Active | Venue | Sponsor | Product | Language | Accent |
| --- | --- | --- | --- | --- | --- | --- |
| UK | ✅ active | O'Learys | Fuller's | London Pride | en-GB | British (England) |
| Germany | reference/future | O'Learys | Krombacher | Krombacher Pils | de-DE | German |
| Sweden | reference/future | O'Learys | Spendrups | Norrlands Guld | sv-SE | Swedish |

## How-to-play variants by setup mode

One how-to-play script per product setup mode (`src/demo/setup.ts`). The QR is shown where the setup supports it; no-TV modes use a host-read join code.

| Setup mode | Variant file | QR / join |
| --- | --- | --- |
| TV + audio | how-to-play.mp3 | QR on TV / main screen / table |
| Audio-only | how-to-play-audio.mp3 | No screen — host reads the join code |
| Local host · mic/speaker · phones-only | how-to-play-local.mp3 | QR on table card, or host-read join code |

## Sponsor & product wording rules

- Use the sponsor/product naturally — don't sound like an advert every time.
- Always keep responsible wording for alcohol references (drink responsibly, 18+).
- Never invent product facts (ABV, origin, ingredients, awards, brewing history).
- Sponsor-question scripts may say 'tonight's featured sponsor/product' generically.
- Market-specific sponsor terms must match the active context (UK → Fuller's / London Pride).

Safe example wordings (no factual claims):

- “Tonight's quiz is brought to you with Fuller's and London Pride.”
- “A quick nod to tonight's featured pour before we continue.”
- “Enjoy responsibly, and keep your answers sharper than your arguments.”

**How-to-play / rules note:** Multiple-choice is the live question format (seeded questions carry options). Typed-answer is product direction — phrase it as 'where enabled'. Don't overpromise features not built.

## Global / event cues

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| intro-welcome | intro-welcome.mp3 | global | intro | P1 core demo | market-specific | ready-to-record | standalone | Good evening and welcome to O'Learys for tonight's quiz, brought to you by Fuller's. Scan the QR code on your table, give your team a name, and answer on your phone — one shared answer per team. Please drink responsibly. Phones ready — let's play! |
| how-to-play | how-to-play.mp3 | global | how-to-play | P1 core demo | reusable | ready-to-record | standalone | Scan the QR code on the main screen, any TV showing the quiz join code, or the QR on your table — or a nearby table. One person from each team joins on their phone, enters your team name, and submits the team's answers. Just follow the prompts on your phone — some questions are multiple choice, others ask for a typed answer where enabled. I'll take you through all the questions first, we'll review the answers later, and announce the winner by team number. No shouting out! |
| how-to-play-audio | how-to-play-audio.mp3 | global | how-to-play | P2 useful variant | reusable | ready-to-record | standalone | We're playing without a screen tonight, so listen up. On your phone, head to the join page, and I'll read out tonight's join code — it's one, one, five, six, seven, eight. One person from each team enters the code, picks your team name, and answers on the phone. I'll read every question aloud first, we'll go through the answers later, and the winner's announced by team number. |
| how-to-play-local | how-to-play-local.mp3 | global | how-to-play | P2 useful variant | reusable | ready-to-record | standalone | Nice and simple tonight — phones only. Scan the QR code on your table card, or I'll read out a join code for you to type in. One person from each team joins, enters your team name, and answers on the phone. I'll read the questions over the mic, we'll review the answers afterwards, and announce the winner by team number. |
| sponsor-message | sponsor-message.mp3 | global | how-to-play | P1 core demo | market-specific | ready-to-record | standalone | A quick word from tonight's featured sponsor, Fuller's — enjoy a London Pride responsibly. Right, back to the quiz. |
| pause-handin | pause-handin.mp3 | global | answer-review-phase | P2 useful variant | reusable | ready-to-record | standalone | Pens down for a moment — pass your answers in, grab a drink, and we'll go through the answers shortly. |
| answer-review-intro | answer-review-intro.mp3 | global | answer-review-phase | P1 core demo | reusable | ready-to-record | standalone | Right, pens down everyone — let's go through tonight's answers in order. |
| winner-team-number | winner-team-number.mp3 | winner | winner | P1 core demo | market-specific | ready-to-record | standalone | And tonight's winners are… Team {number}! Brilliantly played — thanks to Fuller's, and goodnight. |
| outro-closing | outro-closing.mp3 | outro | outro | P1 core demo | market-specific | ready-to-record | standalone | Thanks for playing, everyone — and thanks to tonight's sponsor, Fuller's. Drink responsibly, get home safe, and we'll see you next time at O'Learys for the O'Learys Sunday Quiz League. |

## Question lead-ins

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q-leadin-01 | q-leadin-01.mp3 | question-leadin | question-phase | P1 core demo | reusable | ready-to-record | lead-in | Here's your next question. |
| q-leadin-02 | q-leadin-02.mp3 | question-leadin | question-phase | P1 core demo | reusable | ready-to-record | lead-in | Eyes down — next one. |
| q-leadin-sport | q-leadin-sport.mp3 | question-leadin | question-phase | P2 useful variant | reusable | ready-to-record | lead-in | For all you sport fans, here's the next one. |
| q-leadin-music | q-leadin-music.mp3 | question-leadin | question-phase | P2 useful variant | reusable | ready-to-record | lead-in | Music lovers, this one's for you. |

## Selected 5-question readouts

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q01-readout | playlist-demo-q01-readout.mp3 | question-readout | question-phase | P1 core demo | reusable | ready-to-record | question-content | How many continents are there? |
| q02-readout | playlist-demo-q02-readout.mp3 | question-readout | question-phase | P1 core demo | reusable | ready-to-record | question-content | How many players from one team are on a football (soccer) pitch? |
| q03-readout | playlist-demo-q03-readout.mp3 | question-readout | question-phase | P1 core demo | reusable | ready-to-record | question-content | “Bohemian Rhapsody” was recorded by which band? |
| q04-readout | playlist-demo-q04-readout.mp3 | question-readout | question-phase | P1 core demo | reusable | ready-to-record | question-content | Look at the image: name the tall iron tower in Paris. |
| q05-readout | playlist-demo-q05-readout.mp3 | question-readout | question-phase | P1 core demo | market-specific | ready-to-record | question-content | Tonight's sponsored round is brought to you by Fuller's. Which ingredient gives most beers their bitterness? |

## Answer lead-ins

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a-leadin-01 | a-leadin-01.mp3 | answer-leadin | answer-review-phase | P1 core demo | reusable | ready-to-record | lead-in | Question number one. |
| a-leadin-02 | a-leadin-02.mp3 | answer-leadin | answer-review-phase | P1 core demo | reusable | ready-to-record | lead-in | For question two. |
| a-leadin-03 | a-leadin-03.mp3 | answer-leadin | answer-review-phase | P1 core demo | reusable | ready-to-record | lead-in | This one caught a few people out. |
| a-leadin-sport | a-leadin-sport.mp3 | answer-leadin | answer-review-phase | P2 useful variant | reusable | ready-to-record | lead-in | For the football question. |
| a-leadin-sponsor | a-leadin-sponsor.mp3 | answer-leadin | answer-review-phase | P2 useful variant | reusable | ready-to-record | lead-in | And for tonight's sponsor question. |
| a-leadin-05 | a-leadin-05.mp3 | answer-leadin | answer-review-phase | P2 useful variant | reusable | ready-to-record | lead-in | And here comes number five. |
| a-leadin-none | _(no file)_ | answer-leadin | answer-review-phase | P1 core demo | reusable | placeholder | lead-in | (no lead-in — play the answer file only) |

## Selected 5 answer files

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01-answer | playlist-demo-a01-answer.mp3 | answer-content | answer-review-phase | P1 core demo | reusable | ready-to-record | answer-content | Seven. |
| a02-answer | playlist-demo-a02-answer.mp3 | answer-content | answer-review-phase | P1 core demo | reusable | ready-to-record | answer-content | Eleven. |
| a03-answer | playlist-demo-a03-answer.mp3 | answer-content | answer-review-phase | P1 core demo | reusable | ready-to-record | answer-content | Queen. |
| a04-answer | playlist-demo-a04-answer.mp3 | answer-content | answer-review-phase | P1 core demo | reusable | ready-to-record | answer-content | The Eiffel Tower. |
| a05-answer | playlist-demo-a05-answer.mp3 | answer-content | answer-review-phase | P1 core demo | reusable | ready-to-record | answer-content | Hops. |

## Answer-review assembly (metadata only)

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a01-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | reusable | placeholder | assembly-only | [a-leadin-01.mp3] then [playlist-demo-a01-answer.mp3]  →  "Seven." |
| a02-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | reusable | placeholder | assembly-only | [a-leadin-02.mp3] then [playlist-demo-a02-answer.mp3]  →  "Eleven." |
| a03-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | reusable | placeholder | assembly-only | [a-leadin-03.mp3] then [playlist-demo-a03-answer.mp3]  →  "Queen." |
| a04-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | reusable | placeholder | assembly-only | [a-leadin-04.mp3] then [playlist-demo-a04-answer.mp3]  →  "The Eiffel Tower." |
| a05-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | reusable | placeholder | assembly-only | [a-leadin-sponsor.mp3] then [playlist-demo-a05-answer.mp3]  →  "Hops." |

## Optional variant takes (record later)

| cueId | filename | family | phase | priority | scope | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| generic-intro-warm | generic-intro-warm.mp3 | global | intro | P3 record later | reusable | ready-to-record | standalone | Good evening everyone, and a very warm welcome to tonight's quiz! |
| generic-intro-sport | generic-intro-sport.mp3 | global | intro | P3 record later | reusable | ready-to-record | standalone | Right, line 'em up — welcome to quiz night, let's get a result on the board! |
| generic-intro-dry | generic-intro-dry.mp3 | global | intro | P3 record later | reusable | ready-to-record | standalone | Evening. You came out for this. Brave. Welcome to the quiz. |
| generic-intro-family | generic-intro-family.mp3 | global | intro | P3 record later | reusable | ready-to-record | standalone | Hello everyone, big and small — welcome along to tonight's family quiz night! |
| generic-intro-sponsor | generic-intro-sponsor.mp3 | global | intro | P3 record later | market-specific | ready-to-record | standalone | Good evening! Tonight's quiz is brought to you by Fuller's — let's get started. |
| generic-intro-fast | generic-intro-fast.mp3 | global | intro | P3 record later | reusable | ready-to-record | standalone | Evening all — phones out, teams named, here we go, welcome to the quiz! |
| generic-repeat-01 | generic-repeat-01.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | I'll read that one more time… |
| generic-repeat-02 | generic-repeat-02.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | Here's the question again… |
| generic-repeat-03 | generic-repeat-03.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | One more time for the room… |
| generic-repeat-04 | generic-repeat-04.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | No rush — I'll say it again, nice and slow… |
| generic-repeat-05 | generic-repeat-05.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | The table by the bar might want this one again… |
| generic-repeat-06 | generic-repeat-06.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | I can see a few puzzled faces — let me repeat it… |
| generic-repeat-07 | generic-repeat-07.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | For all you football fans out there, here it is again… |
| generic-repeat-08 | generic-repeat-08.mp3 | question-leadin | question-phase | P3 record later | reusable | ready-to-record | lead-in | Music lovers, listen in — once more… |
| generic-transition-01 | generic-transition-01.mp3 | transition | question-phase | P3 record later | reusable | ready-to-record | lead-in | Onto the next one… |
| generic-transition-02 | generic-transition-02.mp3 | transition | question-phase | P3 record later | reusable | ready-to-record | lead-in | Keep those answer sheets handy — moving on… |
| generic-transition-03 | generic-transition-03.mp3 | transition | question-phase | P3 record later | reusable | ready-to-record | lead-in | Good stuff — let's keep it rolling… |
| generic-transition-04 | generic-transition-04.mp3 | transition | question-phase | P3 record later | reusable | ready-to-record | lead-in | Next up, and this is a nice one… |
| generic-transition-05 | generic-transition-05.mp3 | transition | question-phase | P3 record later | reusable | ready-to-record | lead-in | Right, eyes back to me — here we go… |
| generic-transition-06 | generic-transition-06.mp3 | transition | question-phase | P3 record later | reusable | ready-to-record | lead-in | Plenty more to play for — next question… |

## Recording model

Two-part assembly (never split smaller than this):

- **Question phase:** `[question lead-in]` + `[question readout]` — e.g. `q-leadin-02.mp3` then `playlist-demo-q03-readout.mp3`.
- **Answer-review phase:** `[answer lead-in]` + `[answer content]` — e.g. `a-leadin-sponsor.mp3` then `playlist-demo-a05-answer.mp3`.
- **No lead-in:** `a-leadin-none` is metadata only — play just the answer file, e.g. `playlist-demo-a03-answer.mp3`.
- Answers are revealed in the **answer-review phase**, never straight after each question.

## How Ian records this in ElevenLabs

1. Use the chosen ElevenLabs voice (British pub host).
2. Record the **P1 (record first)** rows first.
3. One row = one MP3.
4. Paste only the `scriptText` for that row.
5. Download as MP3.
6. Rename it **exactly** to the filename in the table.
7. Do **not** record all 100 questions yet.
8. Do **not** paste one huge script.
9. Keep one voice + settings across the whole first pack.
10. Upload into PPN and smoke after recording.

**Totals:** 55 rows · 49 recordable MP3s · **21 P1 files to record first.**

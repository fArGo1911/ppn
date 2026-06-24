# PPN — ElevenLabs production pack (demo)

> Generated from `src/demo/elevenLabsProduction.ts` (`buildProductionPack()`) — the single source of truth.
> **Metadata only.** The app does **not** generate audio, call any TTS/ElevenLabs API, or store an API key.
> One row = one MP3. Record these in ElevenLabs, rename to the exact filename, and drop them into PPN.

## Recording context

| Field | Value |
| --- | --- |
| venue | O'Learys |
| market | UK |
| sponsor | Fuller's |
| product | London Pride |
| quizSeries | O'Learys Sunday Quiz League |
| eventDate | Sunday 18th September |
| eventNumber | 3rd this month |
| tournamentStage | Qualifier |
| winnerAdvancesTo | Semi-final |
| nextEventDate | Sunday 25th September |
| language | en-GB |
| accent | British (England) |
| voicePersona | Warm, confident British pub-quiz host — friendly, a little playful, never shouty. |

**Markets** (UK active; others reference/future):

| Market | Active | Venue | Sponsor | Product | Language | Accent |
| --- | --- | --- | --- | --- | --- | --- |
| UK | ✅ | O'Learys | Fuller's | London Pride | en-GB | British (England) |
| Germany | reference | O'Learys | Krombacher | Krombacher Pils | de-DE | German |
| Sweden | reference | O'Learys | Spendrups | Norrlands Guld | sv-SE | Swedish |

## Core event cues

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| intro-welcome | intro-welcome.mp3 | global | intro | P1 core demo | ready-to-record | standalone | Good evening and welcome to O'Learys for tonight's quiz, brought to you by Fuller's. Scan the QR code on your table, give your team a name, and answer on your phone — one shared answer per team. Please drink responsibly. Phones ready — let's play! |
| how-to-play | how-to-play.mp3 | global | how-to-play | P1 core demo | ready-to-record | standalone | Here's how it works: one shared answer per team. I'll read all the questions in the round first — lock in your answers as we go — and then we'll go back through the answers together. No shouting out! |
| answer-review-intro | answer-review-intro.mp3 | global | answer-review-phase | P1 core demo | ready-to-record | standalone | Right, pens down everyone — let's go through tonight's answers in order. |
| winner-team-number | winner-team-number.mp3 | winner | winner | P1 core demo | ready-to-record | standalone | And tonight's winners are… Team {number}! Brilliantly played — thanks to Fuller's, and goodnight. |
| outro-closing | outro-closing.mp3 | outro | outro | P1 core demo | ready-to-record | standalone | Thanks for playing, everyone — get home safe, and we'll see you next time at O'Learys. |

## Question lead-ins

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| q-leadin-01 | q-leadin-01.mp3 | question-leadin | question-phase | P1 core demo | ready-to-record | lead-in | Here's your next question. |
| q-leadin-02 | q-leadin-02.mp3 | question-leadin | question-phase | P1 core demo | ready-to-record | lead-in | Eyes down — next one. |
| q-leadin-sport | q-leadin-sport.mp3 | question-leadin | question-phase | P2 useful variant | ready-to-record | lead-in | For all you sport fans, here's the next one. |
| q-leadin-music | q-leadin-music.mp3 | question-leadin | question-phase | P2 useful variant | ready-to-record | lead-in | Music lovers, this one's for you. |

## Selected 5-question readouts

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| q01-readout | playlist-demo-q01-readout.mp3 | question-readout | question-phase | P1 core demo | ready-to-record | question-content | How many continents are there? |
| q02-readout | playlist-demo-q02-readout.mp3 | question-readout | question-phase | P1 core demo | ready-to-record | question-content | How many players from one team are on a football (soccer) pitch? |
| q03-readout | playlist-demo-q03-readout.mp3 | question-readout | question-phase | P1 core demo | ready-to-record | question-content | “Bohemian Rhapsody” was recorded by which band? |
| q04-readout | playlist-demo-q04-readout.mp3 | question-readout | question-phase | P1 core demo | ready-to-record | question-content | Look at the image: name the tall iron tower in Paris. |
| q05-readout | playlist-demo-q05-readout.mp3 | question-readout | question-phase | P1 core demo | ready-to-record | question-content | Tonight's sponsored round is brought to you by Fuller's. Which ingredient gives most beers their bitterness? |

## Answer lead-ins

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| a-leadin-01 | a-leadin-01.mp3 | answer-leadin | answer-review-phase | P1 core demo | ready-to-record | lead-in | Question number one. |
| a-leadin-02 | a-leadin-02.mp3 | answer-leadin | answer-review-phase | P1 core demo | ready-to-record | lead-in | For question two. |
| a-leadin-03 | a-leadin-03.mp3 | answer-leadin | answer-review-phase | P1 core demo | ready-to-record | lead-in | This one caught a few people out. |
| a-leadin-sport | a-leadin-sport.mp3 | answer-leadin | answer-review-phase | P2 useful variant | ready-to-record | lead-in | For the football question. |
| a-leadin-05 | a-leadin-05.mp3 | answer-leadin | answer-review-phase | P2 useful variant | ready-to-record | lead-in | And here comes number five. |
| a-leadin-none | _(no file)_ | answer-leadin | answer-review-phase | P1 core demo | placeholder | lead-in | (no lead-in — play the answer file only) |

## Selected 5 answer files

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| a01-answer | playlist-demo-a01-answer.mp3 | answer-content | answer-review-phase | P1 core demo | ready-to-record | answer-content | Seven. |
| a02-answer | playlist-demo-a02-answer.mp3 | answer-content | answer-review-phase | P1 core demo | ready-to-record | answer-content | Eleven. |
| a03-answer | playlist-demo-a03-answer.mp3 | answer-content | answer-review-phase | P1 core demo | ready-to-record | answer-content | Queen. |
| a04-answer | playlist-demo-a04-answer.mp3 | answer-content | answer-review-phase | P1 core demo | ready-to-record | answer-content | The Eiffel Tower. |
| a05-answer | playlist-demo-a05-answer.mp3 | answer-content | answer-review-phase | P1 core demo | ready-to-record | answer-content | Hops. |

## Answer-review assembly (metadata only)

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| a01-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | placeholder | assembly-only | [a-leadin-01.mp3] then [playlist-demo-a01-answer.mp3]  →  "Seven." |
| a02-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | placeholder | assembly-only | [a-leadin-02.mp3] then [playlist-demo-a02-answer.mp3]  →  "Eleven." |
| a03-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | placeholder | assembly-only | [a-leadin-03.mp3] then [playlist-demo-a03-answer.mp3]  →  "Queen." |
| a04-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | placeholder | assembly-only | [a-leadin-04.mp3] then [playlist-demo-a04-answer.mp3]  →  "The Eiffel Tower." |
| a05-assembly | _(no file)_ | answer-review-assembly | answer-review-phase | P1 core demo | placeholder | assembly-only | [a-leadin-sport.mp3] then [playlist-demo-a05-answer.mp3]  →  "Hops." |

## Optional variant takes (record later)

| cueId | filename | family | phase | priority | status | playback | scriptText |
| --- | --- | --- | --- | --- | --- | --- | --- |
| generic-intro-warm | generic-intro-warm.mp3 | global | intro | P3 record later | ready-to-record | standalone | Good evening everyone, and a very warm welcome to tonight's quiz! |
| generic-intro-sport | generic-intro-sport.mp3 | global | intro | P3 record later | ready-to-record | standalone | Right, line 'em up — welcome to quiz night, let's get a result on the board! |
| generic-intro-dry | generic-intro-dry.mp3 | global | intro | P3 record later | ready-to-record | standalone | Evening. You came out for this. Brave. Welcome to the quiz. |
| generic-intro-family | generic-intro-family.mp3 | global | intro | P3 record later | ready-to-record | standalone | Hello everyone, big and small — welcome along to tonight's family quiz night! |
| generic-intro-sponsor | generic-intro-sponsor.mp3 | global | intro | P3 record later | ready-to-record | standalone | Good evening! Tonight's quiz is brought to you by Fuller's — let's get started. |
| generic-intro-fast | generic-intro-fast.mp3 | global | intro | P3 record later | ready-to-record | standalone | Evening all — phones out, teams named, here we go, welcome to the quiz! |
| generic-repeat-01 | generic-repeat-01.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | I'll read that one more time… |
| generic-repeat-02 | generic-repeat-02.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | Here's the question again… |
| generic-repeat-03 | generic-repeat-03.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | One more time for the room… |
| generic-repeat-04 | generic-repeat-04.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | No rush — I'll say it again, nice and slow… |
| generic-repeat-05 | generic-repeat-05.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | The table by the bar might want this one again… |
| generic-repeat-06 | generic-repeat-06.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | I can see a few puzzled faces — let me repeat it… |
| generic-repeat-07 | generic-repeat-07.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | For all you football fans out there, here it is again… |
| generic-repeat-08 | generic-repeat-08.mp3 | question-leadin | question-phase | P3 record later | ready-to-record | lead-in | Music lovers, listen in — once more… |
| generic-transition-01 | generic-transition-01.mp3 | transition | question-phase | P3 record later | ready-to-record | lead-in | Onto the next one… |
| generic-transition-02 | generic-transition-02.mp3 | transition | question-phase | P3 record later | ready-to-record | lead-in | Keep those answer sheets handy — moving on… |
| generic-transition-03 | generic-transition-03.mp3 | transition | question-phase | P3 record later | ready-to-record | lead-in | Good stuff — let's keep it rolling… |
| generic-transition-04 | generic-transition-04.mp3 | transition | question-phase | P3 record later | ready-to-record | lead-in | Next up, and this is a nice one… |
| generic-transition-05 | generic-transition-05.mp3 | transition | question-phase | P3 record later | ready-to-record | lead-in | Right, eyes back to me — here we go… |
| generic-transition-06 | generic-transition-06.mp3 | transition | question-phase | P3 record later | ready-to-record | lead-in | Plenty more to play for — next question… |

## Recording model

Two-part assembly (never split smaller than this):

- **Question phase:** `[question lead-in]` + `[question readout]` — e.g. `q-leadin-02.mp3` then `playlist-demo-q03-readout.mp3`.
- **Answer-review phase:** `[answer lead-in]` + `[answer content]` — e.g. `a-leadin-sport.mp3` then `playlist-demo-a02-answer.mp3`.
- **No lead-in:** `a-leadin-none` is metadata only — play just the answer file, e.g. `playlist-demo-a03-answer.mp3`.

## How to use this in ElevenLabs

1. Pick **one** voice (British pub host) and keep the same voice + settings across the whole P1 pack.
2. Generate one row at a time (or batch later via API — not in this slice).
3. Download the MP3.
4. Rename it to the **exact** filename in the table.
5. Upload it into the matching PPN cue/slot.
6. Regenerate only bad takes.

- Do **not** paste one huge quiz script — one row = one MP3.
- Do **not** record all 100 questions yet — record **P1 (core demo)** first.
- The 100-question bank (`QUESTION_BANK_SCRIPT_MATRIX.md`) is scalable source coverage for later mixes.

**Totals:** 50 rows · 44 recordable MP3s · 20 P1 files to record first.

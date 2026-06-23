# Northgate — AI voice / audio MP3 script pack (fictional demo)

These are the **scripts to record** for the default Northgate demo. The app plays **local MP3 files** only
(file-based playback) — it does **not** generate audio. Generate the MP3s manually OUTSIDE the app (e.g. an
ElevenLabs session in your browser/CLI — no API keys in the repo), export as MP3, and drop them in the folder
below. Missing files fall back to **script-only** (honest). This is **not** an AI-voice generation system.

> Fictional demo brewery (Northgate Brewing Co. / The Anchor). No real brewery, no real customer, no production
> campaign. No MP3 files are committed in this slice — only these scripts + the visual asset pack.

## Folder
```
public/demo/audio/northgate/
```
Filenames are matched exactly by the app (`brand.ts` `audio.*` + `questionAudio()` in `src/demo/brand.ts`).

## Voice direction (global)
- **Persona:** a warm, confident British pub-quiz host. Friendly, a little playful, never shouty.
- **Tone:** premium-but-approachable; smiling. Think a good local quiz night, not a game-show announcer.
- **Pace:** unhurried, clear. Leave a breath before answers.
- **Pronunciation:** "Northgate" = *NORTH-gate*; "The Anchor"; "Oasis"; "Etihad" = *ETT-i-had*; "Ibrahimović" not needed here.
- **Loudness:** consistent; the room may be noisy. No long silences (TV/PA).

## Core files (essential)

| File | Script | Pacing / direction | Usage surface |
|---|---|---|---|
| `event-intro.mp3` | "Good evening and welcome to The Anchor for tonight's Quiz Night, brought to you by Northgate Brewing Co. Scan the QR code on your table, give your team a name, and answer right there on your phone — one shared answer per team. Tonight we'll mix general knowledge, a local Manchester round, sport, football, a music round and a Northgate sponsored round, with a tie-breaker to finish. Your hosts are in control all night, so give us a shout if you need a hand. Phones ready — let's play!" | ~25–30s, warm welcome, build energy to "let's play!" | Host AI-intro · TV intro state · player lobby (essential) |
| `round-intro.mp3` | "Right then — next round coming up. Phones ready, teams." | ~4s, brisk | Host round intro (optional) |
| `sponsored-round-intro.mp3` | "This round is brought to you by Northgate Brewing Co. — answer well for bonus bragging rights." | ~6s, give the sponsor name a confident lift | Sponsored round (essential) |
| `question-readout.mp3` | "Here's your question…" | ~2s, slight upward lilt (leads into the question) | Generic readout fallback |
| `answer-reveal.mp3` | "And the correct answer is…" | ~3s, build a tiny pause at the end | Generic reveal fallback |
| `winner.mp3` | "Tonight's champions are… well, you'll see it on the screen! Brilliantly played, everyone. Thanks to Northgate Brewing Co. — and we'll see you next Thursday." | ~9s, celebratory | Winner / closing (essential) |
| `question-chime.mp3` | *(no speech — a short, warm 2-note chime/sting, ~1s)* | ~1s, soft attack, not jarring | Pre-question chime (essential) |
| `sponsor-message.mp3` | "Tonight's reward, from Northgate Brewing Co.: twenty per cent off the kitchen for every team. Please drink responsibly — eighteen plus." | ~8s, friendly; land the responsible line clearly | Sponsor message (optional) |

## Per-question readouts + reveals

`question-NN.mp3` / `reveal-NN.mp3` are matched by the question's running number. **01–03 are the live seeded
session** (`supabase/seed.sql`); **04–10 align to the UK 10-question capability pack** (`src/demo/questionPacks.ts`)
and are only used if the live session is expanded — record them as optional.

| File | Script | Answer file | Reveal script |
|---|---|---|---|
| `question-01.mp3` *(live)* | "Question one, general knowledge: which planet is known as the Red Planet?" | `reveal-01.mp3` | "The Red Planet is Mars — its colour comes from iron oxide, basically rust." |
| `question-02.mp3` *(live)* | "Football: which country won the FIFA World Cup in 2018?" | `reveal-02.mp3` | "It's France — they beat Croatia in the final." |
| `question-03.mp3` *(live, sponsored)* | "Tonight's sponsored round, from Northgate Brewing Co. — in which city was the brewery founded?" | `reveal-03.mp3` | "Northgate Brewing Co. was founded in Manchester." |
| `question-04.mp3` | "Geography: what is the capital city of Scotland?" | `reveal-04.mp3` | "The capital of Scotland is Edinburgh." |
| `question-05.mp3` | "Local Manchester round: City play at the Etihad — at which ground do Manchester United play?" | `reveal-05.mp3` | "Manchester United play at Old Trafford." |
| `question-06.mp3` | "Music round — have a listen. Which Manchester band released 'Wonderwall'?" | `reveal-06.mp3` | "That's Oasis." |
| `question-07.mp3` | "Picture round — look at the screen. Which UK city's skyline is this?" | `reveal-07.mp3` | "That skyline is Manchester." |
| `question-08.mp3` | "Video round — watch the big screen. Which sport is being played?" | `reveal-08.mp3` | "It's rugby league." |
| `question-09.mp3` | "Sponsored round, brought to you by Northgate Brewing Co. — in which city was the brewery founded?" | `reveal-09.mp3` | "Northgate Brewing Co. was founded in Manchester." |
| `question-10.mp3` | "Tie-breaker, closest answer wins: in which year were the first modern Olympic Games held?" | `reveal-10.mp3` | "The first modern Olympics were held in 1896, in Athens." |

**Alignment note:** 01–03 are taken directly from `seed.sql` (Mars / France 2018 / sponsor-founded-Manchester). If
the seeded questions change, re-align 01–03 before recording. 04–10 mirror `questionPacks.ts` (UK) and the per-
question `aiReadout` / `aiReveal` strings there — keep them in sync.

## After you add MP3s
1. Place the files in `public/demo/audio/northgate/` with the exact names above.
2. Open `/host` and run a question — the audio cue chips switch from **"no file · script only"** to **"audio ready"**.
3. The host **Play** / **Replay** buttons (and the qintro chime) will play through the host device / room PA.
4. Nothing else changes — if a file is absent, that specific cue silently falls back to the on-screen script.

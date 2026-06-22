# PPN demo audio assets (pre-generated MP3s — playback only)

PPN's audio layer is **playback only**. The app never generates speech, never calls a TTS API, and
never stores TTS credentials. To make the demo *sound* like a hosted pub event, drop pre-generated
MP3 files here and the host panel / TV will play them. If a file is absent, the surface falls back to
the on-screen script — the demo never breaks on missing audio.

## Where files go

```
public/demo/audio/<breweryPreset>/<file>.mp3
```

One folder per brewery preset (the preset's `audio.audioBaseDir`):

- `public/demo/audio/northgate/`  (UK — Northgate Brewing Co.)
- `public/demo/audio/adlerbrau/`  (DE — Adlerbräu München)
- `public/demo/audio/nordstrom/`  (SE — Nordström Bryggeri)

## Suggested filenames (stable + descriptive)

| File | Used for |
| --- | --- |
| `event-intro.mp3` | AI evening introduction (optional first-class step) |
| `round-intro.mp3` | round / standings voiceover |
| `sponsored-round-intro.mp3` | sponsored round opener |
| `question-chime.mp3` | short chime before each question |
| `question-readout.mp3` | generic "read the question" clip |
| `answer-reveal.mp3` | generic reveal clip |
| `winner.mp3` | winner / closing announcement |
| `sponsor-message.mp3` | spoken sponsor message |
| `question-01.mp3` … `question-10.mp3` | per-question readout (optional) |
| `reveal-01.mp3` … `reveal-10.mp3` | per-question reveal (optional) |

Per-question files are matched by the question's running number (`question-01.mp3`, `reveal-01.mp3`, …);
if absent, the generic `question-readout.mp3` / `answer-reveal.mp3` (or the on-screen script) is used.

## How to generate (manual, outside the app)

Generate the MP3s manually — e.g. with ElevenLabs in your browser/CLI — using the scripts shown in the
host panel and in `src/demo/brand.ts` (`ai.*`) and `src/demo/questionPacks.ts` (`aiReadout` / `aiReveal`).
Export as MP3, name them per the table above, and place them in the preset folder.

## Rules (must hold)

- **No API keys / credentials in the repo.** No ElevenLabs (or any TTS) keys, anywhere.
- **No copyrighted audio** committed unless explicitly approved.
- **No downloader / scraper / live-generation** logic in the app — playback of local files only.
- Keep filenames **stable** so the preset config keeps resolving them.

These demo audio files are intentionally **not committed** (this folder ships with `.gitkeep` only).

# PPN demo — local video/media assets

Drop **manually supplied** local demo videos here and reference them from a brewery preset as a `local` source,
e.g. `sponsorBumperVideoUrl: "/demo/sponsor-bumper.mp4"` with `sponsorBumperVideoSourceType: "local"`.

- Supported: `.mp4` / `.webm` (rendered in an HTML `<video>`, **no autoplay sound**).
- A `fallbackImage` (and the premium gradient slot) is shown if the file is missing or fails to load.
- POC rule: this is a **manual** drop‑in only — the app contains **no downloader, scraper, or ripping logic**.
  Use your own / licensed / public‑domain clips. External `embed` (YouTube/Vimeo) and `external` (hosted MP4)
  sources are configured directly on the preset and need no file here.

Files placed here are served at `/demo/<filename>`. They are intentionally **not committed** unless small and
license‑clear; keep large or copyrighted media out of git.

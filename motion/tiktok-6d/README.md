# ZAYA — 45 s "6D" vertical motion graphic (TikTok / Reels / Shorts)

Offline render pipeline. **Not part of the Astro site build** — nothing here ships to the website.

```
motion/tiktok-6d/
  scene/         the film (Three.js + GSAP), loaded by headless Chromium
    film.js        master timeline, camera rig, all seven beats      <- copy, timings, layout live here
    pipeline.js    post chain: glass grab-pass, DOF, motion blur, bloom, CA, ACES, grain, vignette
    world.js       Addis block, ground/shockwave, pins, particles, shafts, minibuses, Amharic signs
    logo.js        brand mark from the official SVGs (extruded), shards, tile, wordmark
    icons.js       four segment icons as 3D tubes
    ui.js          glass panels + the four live-drawn app UIs (customer, merchant, order, basket)
    humans.js      persona photo cards + the stylised customer figure
    captions.js    burned-in kinetic captions (EN + Amharic), pills, chips
    util.js        colours, seeded RNG, noise, SVG-path→tubes, canvas/text helpers, fonts
  assets/        prepared persona cards (see CREDITS.md)
  render.mjs     frame stepper (Playwright/SwiftShader) → PNG per frame
  encode.mjs     ffmpeg → 45 s master, 15 s cutdown, poster, contact sheet
  verify.mjs     acceptance checks + 1 s review frames
  DECISIONS.md · AUDIO-BRIEF.md · CREDITS.md
```

## Re-render
```bash
cd motion/tiktok-6d && npm install            # three + gsap (playwright is preinstalled globally)
pip3 install imageio-ffmpeg pillow numpy       # static ffmpeg with libx264 + contact sheets
node render.mjs --out out/frames --fps 60      # ~2.5–3.2 s/frame on 4 vCPU SwiftShader (≈2.4 h); --fps 30 halves it (the delivered master is 30 fps)
node encode.mjs --frames out/frames --fps 60 --out deliverables
node verify.mjs deliverables/ZAYA_6D_45s_1080x1920.mp4
```
Preview quickly: `node render.mjs --out out/prev --fps 10 --scale 0.5` then `python3 sheet.py out/prev 10 sheet.png`.
Single frames: `node frames.mjs out/k 2.4,12.9,44.2` (times in seconds). Add `?guides=1` to the page
URL in `render.mjs` (or pass `--guides` by editing the URL) to overlay the 8 % safe area + TikTok band.

## Change copy or colours
- **Captions** (EN/Amharic, timing): `film.js` → the `this.caps = {…}` block and the `capIn(...)` calls
  (`capIn(caption, startTime, inDuration, holdSeconds)`). Max 5 words per card; keep ≥ 1.4 s on screen.
- **UI text / numbers**: `ui.js` (`customerUI`, `merchantUI`, `orderUI`, `diasporaUI`).
- **Brand colours**: `util.js` `C` / `CSS` (mirror of `src/styles/tokens.css`).
- **Beat timings**: the master timeline in `film.js` `timeline()` — every number is a second on the
  120 BPM grid; the camera keys are `tl.to(cam, {...}, time)`.
- **People**: swap `assets/person-*.png` (any RGBA card) and, if licensing changes, the chips in `film.js`.
- **Frame rate / size**: flags on `render.mjs` / `encode.mjs`; the timeline is time-based, not frame-based.

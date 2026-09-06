# AUDIO BRIEF — ZAYA 45 s "6D" (120 BPM grid; original synthesised track included)

> **Update (founder request, 2026-09-06):** the film now ships **with music**. Because no licensed
> track may be used, `music.py` composes and synthesises an **original** Ethio-electronic score from
> scratch (numpy only): Tizita-flavoured major pentatonic on D, krar-style Karplus-Strong plucks,
> kebero-style hand-drum hits, sub bass, detuned pads, bells, whooshes, dotted-eighth ping-pong delay,
> soft limiter — every hit on the timecodes in the table below. Re-generate with
> `python3 music.py out/music.wav`; `encode.mjs --audio out/music.wav` muxes it (AAC 192 kbps) into the
> master and the cutdown (audio is trimmed and cross-faded with the picture). The brief below stays
> the reference for a produced replacement track.

**Track type.** Modern Ethio-electronic: a warm, mid-tempo (120 BPM, 4/4) hybrid — krar or masinko
plucks and a soft tizita-flavoured pentatonic motif over deep sub-bass and crisp trap-lite hats,
building to a bright, hopeful chorus. No licensed music was used; the picture is cut so that every
visual hit lands on a beat (0.5 s grid) and every segment change on a bar (2.0 s). Keep vocals out
until the resolve (a single wordless hook at 41.2 s is welcome). Mix for phone speakers: bass
audible above 120 Hz, transients crisp, −14 LUFS integrated for TikTok.

| Time (s) | Beat / bar | Picture | Sound design |
|---|---|---|---|
| 0.00 | bar 1 | Black; teal streak enters bottom-left | Sub swell + rising whoosh (0–0.66) |
| 0.66 | 1.2 | Streak impacts, flash, city wireframe explodes and assembles in Z | **HIT** (deep boom + glass shatter, reversed), start of the beat: kick on 1 |
| 0.75–2.20 | | Shards converge into the pin | Rising shimmer / granular sparkle, tick-tock of assembling geometry |
| 1.15 | 1.3 | Caption "Everything near you." | Soft UI tick per word (4 ticks, 16th notes) |
| 1.75 | 1.4 | Logo scales in with overshoot | Bright "pop" + short chime (brand ident) |
| 2.85–3.95 | bar 2 | Camera dives to street level | Woosh-down, city bed fades in (Addis street ambience: minibus horns far, chatter, evening) |
| 3.75 / 5.35 | | Captions "The shop is right there." / "You still can't find it." | Word ticks; second caption gets a low, slightly dissonant pad (tension) |
| 4.0–7.0 | bars 3–4 | Fly-through, pins flicker dim | Flickering electric buzz on the pins (quiet), minibus pass-bys L→R at 4.6 and 6.1 |
| 7.00 | bar 5 | **THE SWITCH** — mark ignites, shockwave | **HIT 2** (biggest): impact + sub drop + shockwave sweep (7.0–9.2) that fades with distance; every pin that snaps on adds a tiny ascending blip (spray of 30+ blips following the wave) |
| 8.10 | 5.3 | Customer icon lands | Weighted thud + short metallic ring |
| 9.30 | 6.2 | Phone lights up | UI wake tone |
| 9.70 | 6.3 | Glass panel grows out of the phone | Glassy rise (2 beats), soft chime on lock |
| 10.4–11.3 | | Search typing "sugar" | 5 key ticks |
| 11.2–12.7 | | Results drop in, price pill pops | 4 soft card thuds, 1 pop (12.7) |
| 12.45 | bar 8 | Caption "Find it. Near you." | Word ticks; chorus pre-lift |
| 15.55–16.9 | bar 9 | Panel folds into merchant dashboard, camera tracks | Whoosh + paper-fold flip at 16.1 |
| 16.30 | | Merchant icon lands | Thud |
| 17.0–19.6 | | Inventory blocks stack; sales count up | Rhythmic wood/ceramic block taps (16ths), number-ticker rattle rising to 872 |
| 18.70 | bar 11 | Caption "Your shop. Online." | Word ticks |
| 20.3 / 20.6 / 20.9 | bar 12 | Chips fly in and lock | Three ascending locks (snap + click) |
| 23.4–24.4 | bar 13 | Blocks fold into the road, camera whips up | Reverse whoosh, blocks "clack" onto the street |
| 24.15 | | Route icon spins in | Spinner whir + thud |
| 24.5–28.1 | | Route draws | Continuous drawn line tone (rising, synth-pluck sequence following the path) |
| 25.1–29.5 | | Package travels | Moving drone/pulse panned with the marker |
| 26.0 / 27.5 / 29.55 | | Status: Confirmed / On its way / Delivered | Three notification tones (rising by a third each) |
| 26.20 | bar 14 | Caption "Ordered. Moving. Delivered." | Word ticks |
| 29.50 | bar 16 | Handoff at the door | Warm door-bell + soft laugh (optional, no words) |
| 31.4–33.8 | bar 17 | Pull back hard to the globe | Big riser + wind; city bed fades to space hum |
| 32.60 | | Diaspora icon lands | Thud |
| 33.6–35.6 | bar 18 | Arc launches and travels | Launch whoosh, long descending tail |
| 35.55 | bar 19 | Arc lands on Addis; pulse ring; family card rises | **HIT 3** (soft, warm boom) + bell; family swell in the pad |
| 36.45 | | Caption "Send it home. From anywhere." | Word ticks |
| 39.9–40.9 | bar 21 | Globe collapses into the mark, icons converge | Suck-in reverse cymbal → |
| 40.75 | | Logo lock-up with overshoot | Ident chime (same as 1.75, fuller) |
| 41.20 | bar 22 | Rim-lit reveal + anamorphic flare | **HIT 4** (bright, tonal, held) — wordless vocal hook may enter here |
| 41.6 / 42.9 | | Taglines | Word ticks |
| 42.30 | | Wordmark pops | Soft pop |
| 43.40 | bar 23 | App row (Coming soon) | Two tiny pills "blip-blip" |
| 43.8–45.0 | | Hold | Pad tail, no new elements; end on a clean decay by 45.0 |

Notes for the composer/sound designer: keep the 0.5 s grid audible (hat or pluck) through 8–40 s
so the segment cuts feel edited to the music even when the user has sound off; the four HITs
should be the four loudest moments, in that order (2 > 4 > 1 > 3).

# Original, licence-clear soundtrack for the ZAYA 45 s film, synthesised from scratch (numpy only).
# 120 BPM, Tizita-flavoured major pentatonic on D (D E F# A B), krar-style Karplus-Strong plucks,
# kebero-style percussion, sub bass, pads, and the four HITs on the AUDIO-BRIEF.md timecodes.
#   python3 music.py out/music.wav
import sys, math, wave, numpy as np
SR = 48000; DUR = 45.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
BEAT = 0.5

def put(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0: return
    l = math.sqrt(0.5 * (1 - pan)); r = math.sqrt(0.5 * (1 + pan))
    L[i:i + n] += sig[:n] * gain * l * 1.414; R[i:i + n] += sig[:n] * gain * r * 1.414

def env(n, a, d, s=0.0, r=0.05, hold=0.0):
    t = np.arange(n) / SR; e = np.ones(n)
    e = np.where(t < a, t / max(a, 1e-4), e)
    dec = np.exp(-(t - a) / max(d, 1e-4)); e = np.where((t >= a), s + (1 - s) * dec, e)
    tail = n - int(r * SR); 
    if tail > 0: e[tail:] *= np.linspace(1, 0, n - tail)
    return e

def lowpass(x, cutoff):  # one-pole
    a = math.exp(-2 * math.pi * cutoff / SR); y = np.empty_like(x); acc = 0.0
    # chunked IIR via lfilter-free approach: use recursion in python is slow -> use scipy-free vectorised trick
    # simple: apply exponential smoothing via cumulative formula in blocks
    b = 1 - a
    # y[n] = b*x[n] + a*y[n-1]  -> use np.frompyfunc accumulate on floats
    f = np.frompyfunc(lambda acc_, xv: b * xv + a * acc_, 2, 1)
    return f.accumulate(x.astype(object), dtype=object).astype(float)

def karplus(freq, dur, bright=0.5, decay=0.996):
    n = int(dur * SR); p = int(SR / freq); buf = rng.uniform(-1, 1, p); buf = buf - buf.mean()
    out = np.empty(n)
    # vectorised KS: process period by period
    prev = buf.copy()
    for k in range(0, n, p):
        cur = prev.copy()
        cur[1:] = decay * 0.5 * (prev[1:] + prev[:-1]); cur[0] = decay * 0.5 * (prev[0] + prev[-1])
        cur = bright * cur + (1 - bright) * prev * decay
        m = min(p, n - k); out[k:k + m] = cur[:m]; prev = cur
    return out * 0.8

def sine(freq, dur, ph=0.0):
    t = np.arange(int(dur * SR)) / SR; return np.sin(2 * math.pi * freq * t + ph)

def kick(dur=0.45, f0=150, f1=48):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * math.pi * np.cumsum(f) / SR; x = np.sin(ph) * np.exp(-t * 7) ; x += np.sin(ph * 2) * np.exp(-t * 40) * 0.3
    return np.tanh(x * 2.2) * 0.9

def kebero(dur=0.32, f0=210, f1=95, noise=0.25):  # hand drum: tuned thump + skin noise
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 40)
    x = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t * 14)
    nz = rng.uniform(-1, 1, n) * np.exp(-t * 60) * noise
    return (x + nz) * 0.8

def hat(dur=0.08, open_=False):
    n = int((0.35 if open_ else dur) * SR); t = np.arange(n) / SR; x = rng.uniform(-1, 1, n)
    x = x - np.concatenate([[0], x[:-1]]) ; x = x - np.concatenate([[0], x[:-1]])  # crude highpass
    return x * np.exp(-t * (9 if open_ else 55)) * 0.25

def bell(freq, dur=1.6, amp=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * math.pi * freq * t) * np.exp(-t * 2.2) + 0.5 * np.sin(2 * math.pi * freq * 2.01 * t) * np.exp(-t * 4) + 0.25 * np.sin(2 * math.pi * freq * 3.6 * t) * np.exp(-t * 7)
    return x * amp * env(n, 0.002, 1.0, 0.0, 0.1)

def pad(freqs, dur, amp=0.25, attack=0.8):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f in freqs:
        for det in (-0.4, 0.0, 0.4):
            x += np.sin(2 * math.pi * (f * (1 + det / 100)) * t + rng.uniform(0, 6.28)) / (3 * len(freqs))
            x += 0.3 * np.sin(2 * math.pi * (f * 2 * (1 + det / 100)) * t) / (3 * len(freqs))
    e = env(n, attack, 8.0, 0.8, 0.6); return x * e * amp

def whoosh(dur, rise=True, amp=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.uniform(-1, 1, n)
    # band-limit by moving average of variable size
    e = (t / dur) ** 2 if rise else (1 - t / dur) ** 2
    y = np.convolve(x, np.ones(64) / 64, mode='same') * 3
    return y * e * amp

def hit(t, size=1.0):
    put(kick(0.9, 120, 38), t, 1.1 * size); put(whoosh(0.5, False, 0.5), t, 0.8 * size)
    sub = sine(41.2, 1.6) * env(int(1.6 * SR), 0.005, 1.0, 0.0, 0.3); put(sub, t, 0.6 * size)

# ---------------- score ----------------
D = 146.83; scale = [0, 2, 4, 7, 9]  # Tizita (major pentatonic) on D
def note(deg, octv=0): return D * (2 ** octv) * (2 ** (scale[deg % 5] / 12)) * (2 ** (deg // 5))
def krar(t, deg, octv=0, dur=0.9, amp=0.35, pan=0.0):
    put(karplus(note(deg, octv), dur, 0.55, 0.9965), t, amp, pan)

# 0–0.66 riser, 0.66 HIT 1
put(whoosh(0.66, True, 0.7), 0.0); put(sine(36.7, 0.66) * np.linspace(0, 1, int(0.66 * SR)), 0.0, 0.35)
hit(0.66, 1.0); put(bell(note(4, 2), 2.0, 0.35), 0.66)
# shimmer while the mark assembles (0.75–2.2): rising pentatonic run in 16ths
for i, deg in enumerate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]): krar(0.75 + i * 0.125, deg, 1, 0.6, 0.18, (i % 2) * 0.6 - 0.3)
put(bell(note(0, 2), 2.5, 0.5), 1.75); put(bell(note(2, 2), 2.5, 0.35), 1.80)  # ident chime
# intro groove 2.0–7.0: soft hats on 8ths, sub on downbeats, krar arpeggio, tension pad from 5.35
for b in np.arange(2.0, 7.0, 0.25): put(hat(), b, 0.35 if (b * 4) % 2 == 0 else 0.2)
for b in np.arange(2.0, 7.0, 2.0): put(sine(note(0, -1), 1.8) * env(int(1.8 * SR), 0.01, 1.2, 0.2, 0.2), b, 0.4)
arp = [0, 2, 4, 2, 3, 2, 1, 2]
for k, b in enumerate(np.arange(2.0, 7.0, 0.25)): krar(b, arp[k % 8], 1, 0.5, 0.22, 0.4 * math.sin(k))
put(pad([note(0, 0), note(1, 0) * 2 ** (1 / 12), note(4, -1)], 2.0, 0.22, 0.5), 5.35)  # dissonant lift
put(whoosh(0.9, True, 0.6), 6.1)
# 7.0 HIT 2 — the switch; shockwave sweep; blips as pins snap on
hit(7.0, 1.5); put(whoosh(2.2, False, 0.45), 7.0)
for i in range(34): put(bell(note(2 + (i % 5), 2 + (i % 3)), 0.5, 0.12), 7.15 + i * 0.062 * (1 + i * 0.03), 1.0, math.sin(i * 1.7))
# main groove 8.0–40.0 (bars 5–20): kick, kebero pattern, hats, bass, krar riff, lead phrases
for bar in np.arange(8.0, 40.0, 2.0):
    for off, g in [(0, 1.0), (1.0, 0.9), (1.5, 0.5)]: put(kick(), bar + off, 0.85 * g)
    for off, g in [(0.5, 0.8), (0.75, 0.35), (1.5, 0.8), (1.875, 0.5)]: put(kebero(), bar + off, 0.6 * g, 0.25)
    for off in np.arange(0, 2.0, 0.25): put(hat(open_=(off == 1.75)), bar + off, 0.3 if (off * 4) % 2 == 0 else 0.18, -0.2)
    bass = [0, 0, 3, 4] if int(bar / 2) % 2 == 0 else [0, 0, 2, 1]
    for k, off in enumerate([0, 0.5, 1.0, 1.5]): put(sine(note(bass[k], -1), 0.45) * env(int(0.45 * SR), 0.005, 0.35, 0.3, 0.05), bar + off, 0.5)
    riff = [4, 3, 2, 3, 4, 6, 4, 3]
    for k, off in enumerate(np.arange(0, 2.0, 0.25)): krar(bar + off, riff[k], 1, 0.45, 0.2, 0.35)
# lead phrases (krar lead, octave 2) — one per segment, on the beat grid
phr = {9.0: [(0, 4, 0.5), (0.5, 6, 0.5), (1.0, 7, 1.0), (2.0, 6, 0.5), (2.5, 4, 1.5)],
       17.0: [(0, 7, 0.5), (0.5, 6, 0.5), (1.0, 4, 0.5), (1.5, 3, 1.0), (2.5, 4, 1.5)],
       25.0: [(0, 2, 0.5), (0.5, 4, 0.5), (1.0, 6, 0.5), (1.5, 7, 1.0), (2.5, 9, 1.5)],
       33.0: [(0, 9, 0.5), (0.5, 7, 0.5), (1.0, 6, 1.0), (2.0, 4, 0.5), (2.5, 2, 1.5)],
       37.0: [(0, 4, 0.5), (0.5, 6, 0.5), (1.0, 7, 0.5), (1.5, 9, 1.0), (2.5, 7, 1.5)]}
for t0, ph_ in phr.items():
    for off, deg, d in ph_: krar(t0 + off, deg, 2, d + 0.3, 0.42, -0.15)
# pads per segment (warm chords), swelling under each caption
for t0, chord in [(8.0, [0, 2, 4]), (16.0, [3, 0, 2]), (24.0, [4, 1, 3]), (32.0, [0, 3, 4]), (40.0, [0, 2, 4])]:
    put(pad([note(d, 0) for d in chord] + [note(chord[0], -1)], 8.5, 0.16, 1.2), t0)
# SFX on the beat sheet
for t in (8.8, 17.0, 24.85, 33.3): put(kebero(0.5, 160, 60, 0.4), t, 0.9)           # icon lands
put(bell(note(4, 3), 0.6, 0.3), 9.3)                                                 # phone wakes
for i in range(5): put(bell(note(0 + i, 3), 0.3, 0.15), 10.4 + i * 0.18)             # typing
for i in range(4): put(kebero(0.25, 300, 140, 0.1), 11.3 + i * 0.35, 0.35, 0.3)       # result cards
for i, t in enumerate((20.3, 20.6, 20.9)): put(bell(note(2 + i, 3), 0.4, 0.3), t + 0.75)  # chip locks
for i, t in enumerate((26.0, 27.5, 29.55)): put(bell(note(4 + 2 * i, 2), 1.2, 0.4), t)     # order status
put(whoosh(2.4, True, 0.5), 31.4); put(whoosh(2.0, True, 0.4), 33.6)                 # pull-back, arc launch
hit(35.55, 0.6); put(bell(note(0, 2), 2.5, 0.5), 35.55)                              # arc lands
put(whoosh(1.0, True, 0.7), 39.9)                                                     # suck-in riser
# 40.75 lock-up chime, 41.2 HIT 4 held chord
put(bell(note(0, 2), 2.5, 0.5), 40.75); put(bell(note(2, 2), 2.5, 0.35), 40.8)
hit(41.2, 1.2)
put(pad([note(0, 0), note(2, 0), note(4, 0), note(7, 0), note(0, -1)], 3.8, 0.34, 0.15), 41.2)
for i, deg in enumerate([0, 2, 4, 7, 9]): krar(41.2 + i * 0.09, deg, 2, 2.0, 0.3, (i - 2) * 0.3)
put(bell(note(4, 3), 0.5, 0.25), 42.3); put(bell(note(0, 3), 0.4, 0.2), 43.4); put(bell(note(2, 3), 0.4, 0.2), 43.55)
# tail: everything decays by 45.0
mix = np.stack([L, R], 1)
fade = np.ones(N); tail = int(1.2 * SR); fade[-tail:] = np.linspace(1, 0, tail); mix *= fade[:, None]
# stereo ping-pong delay for space (dotted 8th), vectorised in blocks
Dd = int(0.375 * SR); g = 0.28; wet = np.zeros_like(mix)
for k in range(Dd, N, Dd):
    m = min(Dd, N - k); src = mix[k - Dd:k - Dd + m] + wet[k - Dd:k - Dd + m] * g
    wet[k:k + m, 0] += src[:, 1] * g; wet[k:k + m, 1] += src[:, 0] * g
mix = mix + wet * 0.9
# loudness: RMS to ~-17 dBFS, then soft limiter
rms = np.sqrt(np.mean(mix ** 2)); mix *= (10 ** (-17 / 20)) / max(rms, 1e-6)
mix = np.tanh(mix * 1.4) / 1.4; mix = np.clip(mix / max(1e-6, np.abs(mix).max()) * 0.95, -1, 1)
out = sys.argv[1] if len(sys.argv) > 1 else 'out/music.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print(out, 'rms', round(20 * math.log10(np.sqrt(np.mean(mix ** 2))), 1), 'dBFS peak', round(20 * math.log10(np.abs(mix).max()), 1))

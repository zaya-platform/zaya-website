// Encode PNG frames -> H.264 (High, yuv420p, CRF 18, +faststart) with the original soundtrack
// (--audio out/music.wav, made by music.py). Also builds the 15 s cutdown, the poster frame and the
// review contact sheet.  node encode.mjs --frames out/frames --fps 60 --audio out/music.wav --out deliverables
import { execFileSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : true] : []).filter(Boolean));
const FF = process.env.FFMPEG || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const FPS = Number(args.fps || 60), FR = path.resolve(args.frames || 'out/frames'), OUT = path.resolve(args.out || 'deliverables');
fs.mkdirSync(OUT, { recursive: true });
const run = (a) => { console.log('ffmpeg', a.join(' ')); execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' }); };
const x264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-colorspace', 'bt709', '-color_range', 'tv'];
const ext = fs.existsSync(path.join(FR, 'f00000.jpg')) ? 'jpg' : 'png';
const AUDIO = args.audio ? path.resolve(args.audio) : null; const aac = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'];
const main = path.join(OUT, 'ZAYA_6D_45s_1080x1920.mp4');
run(['-framerate', String(FPS), '-i', path.join(FR, `f%05d.${ext}`), ...(AUDIO ? ['-i', AUDIO] : []), '-vf', 'format=yuv420p', '-r', String(FPS), ...x264, ...(AUDIO ? ['-map', '0:v', '-map', '1:a', ...aac, '-shortest'] : ['-an']), main]);
// 15 s cutdown: hook (0–3.25) → customers (8.0–16.0 → trimmed) → resolve (40.0–45) with 0.35 s dissolves
const seg = (a, b, i) => `[0:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS,fps=${FPS}[s${i}]`;
const cut = path.join(OUT, 'ZAYA_6D_15s_cutdown_1080x1920.mp4');
const hook = [0.0, 3.3], cust = [8.0, 15.6], res = [40.3, 45.0]; const X = 0.35;
const d1 = hook[1] - hook[0], d2 = cust[1] - cust[0];
const aseg = (a, b, i) => `[0:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS[a${i}]`;
const vgraph = `${seg(hook[0], hook[1], 0)};${seg(cust[0], cust[1], 1)};${seg(res[0], res[1], 2)};[s0][s1]xfade=transition=fadeblack:duration=${X}:offset=${(d1 - X).toFixed(3)}[x1];[x1][s2]xfade=transition=fadeblack:duration=${X}:offset=${(d1 + d2 - 2 * X).toFixed(3)}[v]`;
const agraph = AUDIO ? `;${aseg(hook[0], hook[1], 0)};${aseg(cust[0], cust[1], 1)};${aseg(res[0], res[1], 2)};[a0][a1]acrossfade=d=${X}[ax];[ax][a2]acrossfade=d=${X}[a]` : '';
run(['-i', main, '-filter_complex', vgraph + agraph, '-map', '[v]', ...(AUDIO ? ['-map', '[a]', ...aac] : ['-an']), '-r', String(FPS), ...x264, cut]);
// poster frame (end card lock-up) + 3-frame contact sheet
const posterT = Number(args.poster || 44.0);
run(['-ss', String(posterT), '-i', main, '-frames:v', '1', path.join(OUT, 'ZAYA_6D_poster.png')]);
const sheetTs = (args.sheet || '2.4,12.9,44.0').split(',').map(Number);
const inputs = sheetTs.flatMap((t) => ['-ss', String(t), '-i', main]);
run([...inputs, '-filter_complex', `[0:v][1:v][2:v]hstack=inputs=3,scale=1620:-1[v]`, '-map', '[v]', '-frames:v', '1', path.join(OUT, 'ZAYA_6D_contact_sheet.png')]);
console.log('done ->', OUT);

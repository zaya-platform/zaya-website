// Acceptance checks (§11): duration, resolution, fps, size, no black frames, frame extraction at 1 s
// intervals into a contact sheet for eyes-on review.   node verify.mjs deliverables/ZAYA_6D_45s_1080x1920.mp4
import { execFileSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const FF = process.env.FFMPEG || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const file = process.argv[2]; const expectDur = Number(process.argv[3] || 45);
const run = (a, opts = {}) => execFileSync(FF, ['-hide_banner', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
let info = ''; try { run(['-i', file]); } catch (e) { info = e.stderr; }
const dur = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(info); const seconds = dur ? (+dur[1]) * 3600 + (+dur[2]) * 60 + (+dur[3]) : NaN;
const vid = /Video: (\S+) .*?(\d{3,4})x(\d{3,4}).*?(\d+(?:\.\d+)?) fps/.exec(info);
const size = fs.statSync(file).size;
const res = { file, seconds, codec: vid && vid[1], width: vid && +vid[2], height: vid && +vid[3], fps: vid && +vid[4], MB: +(size / 1048576).toFixed(1), pix_fmt: /yuv420p/.test(info), profile: /High/.test(info), faststart: null };
// moov before mdat => faststart
const head = fs.readFileSync(file, { encoding: 'latin1', flag: 'r' }).slice(0, 4 * 1024 * 1024); res.faststart = head.indexOf('moov') > -1 && head.indexOf('moov') < (head.indexOf('mdat') > -1 ? head.indexOf('mdat') : Infinity);
// black frames + frozen frames
let bd = ''; try { bd = run(['-i', file, '-vf', 'blackdetect=d=0.05:pix_th=0.10,freezedetect=n=0.001:d=0.5', '-an', '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { bd = e.stderr || ''; }
res.blackdetect = (bd.match(/black_start:[^\n]*/g) || []); res.freeze = (bd.match(/freeze_start[^\n]*/g) || []);
const checks = { duration: Math.abs(seconds - expectDur) <= 0.3, resolution: res.width === 1080 && res.height === 1920, codec: res.codec === 'h264', fps: res.fps === 60 || res.fps === 30, size: res.MB <= 100, yuv420p: res.pix_fmt, high: res.profile, faststart: res.faststart, noBlack: res.blackdetect.length === 0, noFreeze: res.freeze.length === 0 };
res.checks = checks; res.pass = Object.values(checks).every(Boolean);
console.log(JSON.stringify(res, null, 2));
// 1 s interval frames -> contact sheet
const dir = path.join(path.dirname(file), 'review-frames-' + path.basename(file, '.mp4')); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
run(['-loglevel', 'error', '-i', file, '-vf', 'fps=1', path.join(dir, 'f%05d.png')]);
execFileSync('python3', [path.join(path.dirname(new URL(import.meta.url).pathname), 'sheet.py'), dir, '1', path.join(path.dirname(file), 'review-sheet-' + path.basename(file, '.mp4') + '.png'), '6'], { stdio: 'inherit' });
process.exitCode = res.pass ? 0 : 1;

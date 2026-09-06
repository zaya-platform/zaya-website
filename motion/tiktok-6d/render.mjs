// Deterministic frame renderer: steps the film's master timeline frame by frame in headless
// Chromium (SwiftShader WebGL2) and writes one PNG per frame. Never wall-clock driven.
//   node render.mjs --out out/frames --fps 60 --start 0 --end 2700 [--scale 0.5] [--jpeg]
import path from 'node:path';
import fs from 'node:fs';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { startServer } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : true] : []).filter(Boolean));
const FPS = Number(args.fps || 60);
const SCALE = Number(args.scale || 1);
const W = Math.round(1080 * SCALE), H = Math.round(1920 * SCALE);
const OUT = path.resolve(args.out || 'out/frames');
const START = Number(args.start || 0);
const FILM = args.film || 'main';
fs.mkdirSync(OUT, { recursive: true });

const ROOT = path.resolve(process.cwd(), '..', '..'); // repo root: fonts/photos live in src/assets
const { server, port } = await startServer(ROOT);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-web-security', '--no-sandbox', `--window-size=${W},${H}`] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text()); });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exitCode = 1; });
await page.goto(`http://127.0.0.1:${port}/motion/tiktok-6d/scene/index.html?w=${W}&h=${H}&film=${FILM}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__zaya && window.__zaya.ready === true, null, { timeout: 180000 });
const duration = await page.evaluate(() => window.__zaya.duration);
const END = Number(args.end || Math.round(duration * FPS));
console.log(`film=${FILM} duration=${duration}s fps=${FPS} frames ${START}..${END - 1} at ${W}x${H} -> ${OUT}`);

const t0 = Date.now();
for (let f = START; f < END; f++) {
  const t = f / FPS;
  const file = path.join(OUT, `f${String(f).padStart(5, '0')}.${args.jpeg ? 'jpg' : 'png'}`);
  if (fs.existsSync(file) && !args.force) continue;
  await page.evaluate(([t, fps]) => window.__zaya.renderFrame(t, 1 / fps), [t, FPS]);
  const buf = await page.evaluate(([type]) => {
    const c = document.querySelector('canvas');
    return c.toDataURL(type, 0.97).split(',')[1];
  }, [args.jpeg ? 'image/jpeg' : 'image/png']);
  fs.writeFileSync(file, Buffer.from(buf, 'base64'));
  if ((f - START) % 20 === 0 || f === END - 1) {
    const done = f - START + 1, el = (Date.now() - t0) / 1000;
    console.log(`frame ${f} t=${t.toFixed(3)}s  ${(el / done).toFixed(2)} s/frame  eta ${((END - f - 1) * el / done / 60).toFixed(1)} min`);
  }
}
await browser.close();
server.close();

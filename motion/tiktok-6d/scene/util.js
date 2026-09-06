import * as THREE from 'three';

export const C = {
  teal: 0x0EA5A4, tealBright: 0x13B7B4, tealDeep: 0x0B8B8A, coral: 0xFF7A45, navy: 0x1E2A4A, amber: 0xF4A261,
  plum: 0x6D5DD3, mint: 0x5DCAA5, cloud: 0xF4F7F8, ink: 0x1E2A4A, ground: 0x0A0F12, white: 0xffffff,
};
export const CSS = { teal: '#0EA5A4', tealBright: '#13B7B4', tealDeep: '#0B8B8A', coral: '#FF7A45', navy: '#1E2A4A', amber: '#F4A261', plum: '#6D5DD3', mint: '#5DCAA5', cloud: '#F4F7F8', line: '#E4E8EC', inkMuted: '#5B6470', inkFaint: '#8A929C', white: '#FFFFFF', ground: '#0A0F12' };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const easeOutExpo = (x) => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
export const easeOutBack = (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const easeInOutPow2 = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

// Deterministic seeded RNG (mulberry32) — the whole film must be reproducible frame by frame.
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Smooth 1-D value noise (for handheld camera), deterministic in x.
function hash1(i, seed) { let x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); }
export function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i, seed), hash1(i + 1, seed), u) * 2 - 1; }
export function fbm1(x, seed = 0, oct = 3) { let s = 0, a = 0.5, n = 0; for (let o = 0; o < oct; o++) { s += noise1(x, seed + o * 17) * a; n += a; a *= 0.5; x *= 2.03; } return s / n; }

// ---------- SVG stroke paths -> polylines -> 3D tubes (true geometry, not textured planes) ----------
export function parseSvgPath(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const polys = []; let cur = null, cmd = '', x = 0, y = 0, sx = 0, sy = 0; let i = 0;
  const num = () => parseFloat(tokens[i++]);
  const start = (nx, ny) => { cur = [{ x: nx, y: ny }]; polys.push(cur); x = sx = nx; y = sy = ny; };
  const line = (nx, ny) => { cur.push({ x: nx, y: ny }); x = nx; y = ny; };
  while (i < tokens.length) {
    const t = tokens[i]; if (/[a-zA-Z]/.test(t)) { cmd = t; i++; if (cmd === 'Z' || cmd === 'z') { line(sx, sy); cur = null; continue; } }
    const rel = cmd === cmd.toLowerCase(); const u = cmd.toUpperCase();
    if (u === 'M') { const nx = num(), ny = num(); if (cur === null || tokens[i - 3] === 'M' || tokens[i - 3] === 'm') start(rel ? x + nx : nx, rel ? y + ny : ny); else line(rel ? x + nx : nx, rel ? y + ny : ny); cmd = rel ? 'l' : 'L'; }
    else if (u === 'L') { const nx = num(), ny = num(); line(rel ? x + nx : nx, rel ? y + ny : ny); }
    else if (u === 'H') { const nx = num(); line(rel ? x + nx : nx, y); }
    else if (u === 'V') { const ny = num(); line(x, rel ? y + ny : ny); }
    else if (u === 'A') {
      const rx = num(), ry = num(), phi = num() * Math.PI / 180, large = num(), sweep = num(); let ex = num(), ey = num(); if (rel) { ex += x; ey += y; }
      arcTo(x, y, rx, ry, phi, large, sweep, ex, ey).forEach((p) => cur.push(p)); x = ex; y = ey;
    } else { i++; }
  }
  return polys;
}
function arcTo(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
  let l = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry); if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
  const sign = fa === fs ? -1 : 1;
  const num = Math.max(0, rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p), den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const co = sign * Math.sqrt(num / den);
  const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
  const th1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dth > 0) dth -= 2 * Math.PI; else if (fs && dth < 0) dth += 2 * Math.PI;
  const n = Math.max(8, Math.ceil(Math.abs(dth) / (Math.PI / 24))); const pts = [];
  for (let k = 1; k <= n; k++) { const th = th1 + dth * k / n; const px = rx * Math.cos(th), py = ry * Math.sin(th); pts.push({ x: cp * px - sp * py + cx, y: sp * px + cp * py + cy }); }
  return pts;
}
export function circlePoly(cx, cy, r, n = 48) { const p = []; for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2; p.push({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }); } return p; }

// polylines in a WxH box (SVG coords, y down) -> group of tubes centred at origin, y up, scaled to `size`.
export function strokeTubes(polys, { box = 24, size = 1, radius = 0.045, material, caps = true, segmentsPerUnit = 6 } = {}) {
  const g = new THREE.Group(); const s = size / box; const sph = new THREE.SphereGeometry(radius, 12, 10);
  for (const poly of polys) {
    const pts = poly.map((p) => new THREE.Vector3((p.x - box / 2) * s, -(p.y - box / 2) * s, 0));
    const path = new THREE.CurvePath(); for (let k = 0; k < pts.length - 1; k++) { if (pts[k].distanceTo(pts[k + 1]) > 1e-6) path.add(new THREE.LineCurve3(pts[k], pts[k + 1])); }
    if (!path.curves.length) continue;
    const len = path.getLength(); const tubular = Math.max(4, Math.ceil(len / s * segmentsPerUnit));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(path, tubular, radius, 10, false), material); g.add(tube);
    if (caps) for (const p of [pts[0], pts[pts.length - 1]]) { const m = new THREE.Mesh(sph, material); m.position.copy(p); g.add(m); }
    for (let k = 1; k < pts.length - 1; k++) { const m = new THREE.Mesh(sph, material); m.position.copy(pts[k]); g.add(m); } // round joins
  }
  return g;
}

// ---------- Canvas textures ----------
export function canvasTex(w, h) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 4;
  return { canvas, ctx, tex, w, h };
}
export function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

export const FONT_LATIN = 'Poppins', FONT_ETH = 'NotoEthiopic';
export async function loadFonts() {
  const base = '/src/assets/fonts/';
  const faces = [['Poppins', 'poppins-400.woff2', 400], ['Poppins', 'poppins-500.woff2', 500], ['Poppins', 'poppins-600.woff2', 600], ['Poppins', 'poppins-700.woff2', 700], ['Poppins', 'poppins-800.woff2', 800],
    ['NotoEthiopic', 'noto-ethiopic-400.woff2', 400], ['NotoEthiopic', 'noto-ethiopic-600.woff2', 600], ['NotoEthiopic', 'noto-ethiopic-700.woff2', 700]];
  for (const [fam, file, weight] of faces) { const f = new FontFace(fam, `url(${base + file})`, { weight: String(weight) }); await f.load(); document.fonts.add(f); }
  await document.fonts.ready;
}
export const font = (weight, px, eth = false) => `${weight} ${px}px ${eth ? FONT_ETH + ', ' + FONT_LATIN : FONT_LATIN + ', ' + FONT_ETH}, sans-serif`;
export function loadTexture(url) { return new Promise((res, rej) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t); }, undefined, rej)); }

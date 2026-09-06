// People. Sourcing path (see DECISIONS.md §5): the two founder-cleared illustration photos in
// src/assets/photos (merchant, diaspora family) become graded, feathered parallax cards with a rim
// light and the mandatory "Illustration · ምሳሌያዊ ምስል" chip; the customer, for whom no cleared image
// exists, is an honest stylised rim-lit figure (layered, hair + cloth follow-through), never an
// uncanny synthetic face.
import * as THREE from 'three';
import { canvasTex, loadTexture, CSS, clamp, lerp, fbm1, noise1 } from './util.js';

function rimPlane(w, h, colA = CSS.teal, colB = CSS.coral) {
  const { ctx, tex } = canvasTex(256, 256);
  const g = ctx.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, colA); g.addColorStop(1, colB); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const m = ctx.createRadialGradient(128, 128, 60, 128, 128, 132); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = m; ctx.fillRect(0, 0, 256, 256); tex.needsUpdate = true;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.25, h * 1.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  mesh.position.z = -0.08; return mesh;
}

export async function makePhotoCard(url, { height = 3.2, tint = 0.85 } = {}) {
  const tex = await loadTexture(url); const asp = tex.image.width / tex.image.height; const w = height * asp;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 });
  // cinematic grade in-shader: lift shadows toward navy, cool highlights, slight desaturation, grain-friendly
  mat.onBeforeCompile = (sh) => { sh.uniforms.uTint = { value: tint }; mat.userData.sh = sh; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTint;').replace('#include <dithering_fragment>', `#include <dithering_fragment>
    vec3 c = gl_FragColor.rgb; float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, 0.88);
    c = mix(c, c * vec3(0.92, 1.0, 1.05), 0.35); c = c * 0.94 + vec3(0.06, 0.08, 0.11) * (1.0 - l) * 0.5; gl_FragColor.rgb = mix(gl_FragColor.rgb, c, uTint);`); };
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, height), mat);
  const g = new THREE.Group(); g.add(mesh); const rim = rimPlane(w, height); g.add(rim);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(w * 0.45, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -height / 2 - 0.01; shadow.scale.y = 0.45; g.add(shadow);
  const state = { opacity: 0, rim: 0.55 };
  function update(t) { mat.opacity = state.opacity; rim.material.opacity = state.rim * state.opacity; shadow.material.opacity = 0.55 * state.opacity; mesh.position.y = Math.sin(t * 0.9) * 0.015; mesh.rotation.y = noise1(t * 0.4, 4) * 0.01; }
  g.userData = { mesh, rim, shadow, w, h: height };
  return { group: g, state, update, w, h: height };
}

// Stylised rim-lit customer: young woman, braids/locs, hoodie, holding an Android phone; drawn on
// layered canvases so hair and cloth move with parallax and follow-through.
export function makeSilhouette({ height = 3.4 } = {}) {
  const W = 640, H = 900; const w = height * W / H;
  const layers = ['hair-back', 'body', 'arm', 'hair-front'].map((name) => { const { canvas, ctx, tex } = canvasTex(W, H); const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, height), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })); return { name, canvas, ctx, tex, mesh }; });
  const g = new THREE.Group(); layers.forEach((l, i) => { l.mesh.position.z = i * 0.06 - 0.09; g.add(l.mesh); });
  const rim = rimPlane(w * 0.8, height * 0.9, CSS.teal, CSS.coral); rim.position.z = -0.2; g.add(rim);
  const phoneLight = new THREE.PointLight(0x9ff5f0, 0, 3); phoneLight.position.set(w * 0.16, height * 0.05, 0.5); g.add(phoneLight);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(w * 0.5, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -height / 2 - 0.01; shadow.scale.y = 0.4; g.add(shadow);
  const state = { opacity: 0, phone: 0, look: 0, breathe: 1 };
  const NAVY = '#141c2e', SKIN = '#4a2a18', SKIN2 = '#33190e';
  function fig(ctx, part, t) {
    ctx.clearRect(0, 0, W, H); ctx.save();
    const br = Math.sin(t * 1.4) * 0.006 * state.breathe; const sway = fbm1(t * 0.35, 9) * 0.012; const headTurn = fbm1(t * 0.25, 3) * 8 + state.look * 10; // px
    ctx.translate(W / 2 + sway * W, 0); ctx.scale(1 + br, 1 - br * 0.6); ctx.translate(-W / 2, 0);
    const rimGrad = (x0, x1) => { const gr = ctx.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, CSS.coral); gr.addColorStop(0.5, NAVY); gr.addColorStop(1, CSS.teal); return gr; };
    const strand = (x0, y0, len, phase, wid, col) => { ctx.strokeStyle = col; ctx.lineWidth = wid; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); const a = Math.sin(t * 1.3 + phase) * 9 + fbm1(t * 0.7 + phase, 2) * 6; ctx.bezierCurveTo(x0 + a * 0.4, y0 + len * 0.4, x0 + a, y0 + len * 0.75, x0 + a * 1.4 + Math.sin(t * 2.1 + phase) * 4, y0 + len); ctx.stroke(); };
    if (part === 'hair-back') { // braids falling behind the shoulders, swaying
      for (let i = 0; i < 14; i++) { const x0 = 250 + i * 10 + headTurn * 0.6, y0 = 200 + Math.abs(i - 7) * 6; strand(x0, y0, 300 + (i % 3) * 40, i * 0.9, 12, i % 3 === 0 ? '#1a2238' : NAVY); strand(x0 + 3, y0, 300 + (i % 3) * 40, i * 0.9, 3, 'rgba(14,165,164,0.35)'); }
    }
    if (part === 'body') {
      // torso: hoodie with soft shoulders; rim gradient on the edges
      ctx.fillStyle = rimGrad(150, 490); ctx.beginPath(); ctx.moveTo(190, 900); ctx.lineTo(160, 560); ctx.quadraticCurveTo(170, 430, 250, 400); ctx.quadraticCurveTo(320, 380, 400, 400); ctx.quadraticCurveTo(480, 430, 490, 560); ctx.lineTo(470, 900); ctx.closePath(); ctx.fill();
      ctx.fillStyle = NAVY; ctx.beginPath(); ctx.moveTo(206, 900); ctx.lineTo(178, 566); ctx.quadraticCurveTo(190, 445, 258, 416); ctx.quadraticCurveTo(320, 398, 392, 416); ctx.quadraticCurveTo(462, 445, 472, 566); ctx.lineTo(454, 900); ctx.closePath(); ctx.fill();
      // hoodie seam / zipper detail with teal highlight
      ctx.strokeStyle = 'rgba(14,165,164,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(325, 470); ctx.lineTo(322, 900); ctx.stroke();
      // neck + head (turned slightly), warm skin with rim light
      const hx = 320 + headTurn;
      ctx.fillStyle = SKIN2; ctx.beginPath(); ctx.ellipse(hx, 385, 46, 40, 0, 0, 7); ctx.fill();
      const skinGrad = ctx.createLinearGradient(hx - 90, 0, hx + 90, 0); skinGrad.addColorStop(0, '#b85a33'); skinGrad.addColorStop(0.18, SKIN); skinGrad.addColorStop(0.82, SKIN2); skinGrad.addColorStop(1, '#2fa8a2');
      ctx.fillStyle = skinGrad; ctx.beginPath(); ctx.ellipse(hx, 250, 92, 118, headTurn * 0.004, 0, 7); ctx.fill();
      // three-quarter profile: brow, nose and chin on the lit side
      ctx.fillStyle = skinGrad; ctx.beginPath(); ctx.moveTo(hx + 60, 190); ctx.quadraticCurveTo(hx + 96, 205, hx + 92, 240); ctx.quadraticCurveTo(hx + 100, 262, hx + 118, 275); ctx.quadraticCurveTo(hx + 108, 292, hx + 90, 292); ctx.quadraticCurveTo(hx + 100, 320, hx + 80, 350); ctx.lineTo(hx + 40, 360); ctx.closePath(); ctx.fill();
      const lipGlow = ctx.createRadialGradient(hx + 70, 330, 10, hx + 70, 330, 140); lipGlow.addColorStop(0, `rgba(14,165,164,${0.42 * clamp(state.phone)})`); lipGlow.addColorStop(1, 'rgba(14,165,164,0)'); ctx.fillStyle = lipGlow; ctx.beginPath(); ctx.ellipse(hx + 10, 265, 110, 130, 0, 0, 7); ctx.fill();
      // cheek / jaw shading + ear
      ctx.fillStyle = 'rgba(20,28,46,0.22)'; ctx.beginPath(); ctx.ellipse(hx - 30, 300, 62, 62, 0, 0, 7); ctx.fill();
      ctx.fillStyle = SKIN2; ctx.beginPath(); ctx.ellipse(hx - 88, 258, 12, 22, 0, 0, 7); ctx.fill();
      // small hoop earring catching the rim light
      ctx.strokeStyle = CSS.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx - 90, 288, 9, 0, 7); ctx.stroke();
      // eye line kept in shadow (rim-lit figure): a single soft lash-line glint on the lit side that blinks
      const blink = (Math.sin(t * 0.9 + 2) > 0.985) ? 0 : 1; ctx.strokeStyle = 'rgba(255,214,190,0.35)'; ctx.lineWidth = 2.5 * blink + 0.01; ctx.beginPath(); ctx.moveTo(hx + 34, 238); ctx.quadraticCurveTo(hx + 50, 230, hx + 66, 236); ctx.stroke();
    }
    if (part === 'arm') { // raised forearm + hand holding an Android phone (fingers partly occluded by the phone: hand reads natural)
      const px = 430 + Math.sin(t * 1.1) * 3, py = 520 + Math.sin(t * 1.4) * 4;
      ctx.strokeStyle = NAVY; ctx.lineWidth = 78; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(470, 640); ctx.quadraticCurveTo(455, 590, px, py + 60); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,122,69,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(505, 640); ctx.quadraticCurveTo(492, 590, px + 34, py + 66); ctx.stroke();
      // hand
      ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(px, py + 52, 40, 34, -0.4, 0, 7); ctx.fill();
      for (let f = 0; f < 4; f++) { ctx.strokeStyle = SKIN; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(px - 26 + f * 15, py + 40); ctx.lineTo(px - 30 + f * 15, py + 5 - f * 2); ctx.stroke(); }
      // phone: dark slab with teal screen glow when lit
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.12); ctx.fillStyle = '#0b0f14'; ctx.beginPath(); ctx.roundRect(-46, -110, 92, 190, 14); ctx.fill();
      const lit = clamp(state.phone); const sg = ctx.createLinearGradient(0, -100, 0, 70); sg.addColorStop(0, `rgba(30,42,74,${0.9})`); sg.addColorStop(1, `rgba(14,165,164,${0.9})`); ctx.fillStyle = lit > 0 ? sg : '#141a22'; ctx.beginPath(); ctx.roundRect(-40, -102, 80, 174, 10); ctx.fill();
      if (lit > 0) { ctx.fillStyle = `rgba(255,255,255,${0.9 * lit})`; ctx.font = '700 22px Poppins'; ctx.textAlign = 'left'; ctx.fillText('ZAYA', -30, -70); ctx.fillStyle = `rgba(255,122,69,${lit})`; ctx.beginPath(); ctx.arc(34, -76, 3, 0, 7); ctx.fill(); ctx.fillStyle = `rgba(255,255,255,${0.75 * lit})`; for (let r = 0; r < 4; r++) { ctx.beginPath(); ctx.roundRect(-30, -40 + r * 26, 60 - (r % 2) * 18, 8, 4); ctx.fill(); } }
      ctx.restore();
      // thumb over the phone edge (occludes screen edge naturally)
      ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(px - 38, py - 10, 14, 30, 0.35, 0, 7); ctx.fill();
    }
    if (part === 'hair-front') { // crown of braids + edge flyaways over the face
      const hx = 320 + headTurn;
      ctx.fillStyle = '#10182a'; ctx.beginPath(); ctx.ellipse(hx - 4, 168, 104, 66, 0, Math.PI, 2 * Math.PI); ctx.fill();
      for (let i = 0; i < 9; i++) { const a = -Math.PI + i * (Math.PI / 8); const x0 = hx - 4 + Math.cos(a) * 96, y0 = 168 + Math.sin(a) * 62; strand(x0, y0, 46 + (i % 2) * 18, i * 1.7, 9, i % 2 ? '#1a2238' : '#0f1626'); }
      for (let i = 0; i < 18; i++) { const a = -Math.PI + i * (Math.PI / 17); strand(hx - 4 + Math.cos(a) * 100, 168 + Math.sin(a) * 64, 12 + (i % 3) * 8, i * 2.3, 1.5, 'rgba(255,200,160,0.35)'); } // flyaways catching light
      // teal rim along the far edge of the hair
      ctx.strokeStyle = 'rgba(19,183,180,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(hx - 4, 168, 104, 66, 0, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
    }
    ctx.restore();
  }
  function update(t) { layers.forEach((l) => { fig(l.ctx, l.name, t); l.tex.needsUpdate = true; l.mesh.material.opacity = state.opacity; l.mesh.position.x = fbm1(t * 0.3, l.name.length) * 0.01; }); rim.material.opacity = 0.6 * state.opacity; phoneLight.intensity = 6 * state.phone * state.opacity; shadow.material.opacity = 0.5 * state.opacity; }
  g.userData = { w, h: height, layers };
  return { group: g, state, update, w, h: height, phoneAnchor: new THREE.Vector3(w * 0.17, height * 0.08, 0.1) };
}

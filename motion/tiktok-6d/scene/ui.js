// Glass-morphic UI panels: real screen-space refraction (grab pass), fresnel, 1px emissive edge,
// rounded corners, and live-drawn canvas UIs modelled on the real ZAYA app captures
// (src/assets/demo/*.png: navy header, "ZAYA." teal wordmark with coral dot, cloud surface,
// Amharic shop names from the seeded demo, ETB values from the captured flows).
import * as THREE from 'three';
import { canvasTex, roundRect, font, CSS, C, clamp, lerp, easeOutExpo, easeOutBack } from './util.js';

export function makeGlass({ w = 2.7, h = 4.5, ui, edge = C.teal, radius = 0.09 }) {
  const uniforms = { tGrab: { value: null }, tUI: { value: ui ? ui.tex : null }, uReveal: { value: 1 }, uEdge: { value: new THREE.Color(edge) }, uEdgeI: { value: 1.6 }, uUi: { value: 0.88 }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uRadius: { value: radius / Math.min(w, h) }, uAspect: { value: w / h }, uRefract: { value: 0.035 }, uTint: { value: new THREE.Color(0.55, 0.75, 0.78) }, uOpacity: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ uniforms, transparent: true, side: THREE.DoubleSide, vertexShader: /* glsl */`varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec4 vClip;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); vClip = projectionMatrix * viewMatrix * wp; gl_Position = vClip; }`,
    fragmentShader: /* glsl */`uniform sampler2D tGrab, tUI; uniform float uReveal, uEdgeI, uUi, uTime, uRadius, uAspect, uRefract, uOpacity; uniform vec3 uEdge, uTint; varying vec2 vUv; varying vec3 vN, vV; varying vec4 vClip;
      float rrect(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){
        // rounded-rect mask in panel space (aspect-correct), with a reveal that grows from the centre line
        vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0); vec2 b = vec2(uAspect, 1.0) * 0.5 * vec2(1.0, mix(0.02, 1.0, uReveal));
        float d = rrect(p, b, uRadius * min(1.0, uReveal * 4.0)); if (d > 0.0) discard;
        vec2 suv = vClip.xy / vClip.w * 0.5 + 0.5;
        vec3 n = normalize(vN); float fres = pow(1.0 - clamp(dot(n, normalize(vV)), 0.0, 1.0), 2.5);
        vec2 off = n.xy * uRefract + vec2(0.0, 0.004);
        vec3 grab = texture2D(tGrab, clamp(suv + off, 0.001, 0.999)).rgb; // refracted world behind the glass
        vec4 ui = texture2D(tUI, vUv);
        vec3 glass = grab * uTint * 1.15 + fres * uEdge * 0.35 + vec3(0.02, 0.05, 0.06);
        vec3 c = mix(glass, ui.rgb * 0.8, ui.a * uUi);
        // 1px emissive edge (teal/orange), pulsing on the beat
        float edge = 1.0 - smoothstep(0.0, 0.006, -d); float pulse = 0.8 + 0.4 * (0.5 + 0.5 * sin(uTime * 6.28318 * 2.0));
        c += uEdge * edge * uEdgeI * pulse;
        // moving specular sheen across the glass
        float sheen = pow(clamp(1.0 - abs(fract(vUv.x * 0.7 - vUv.y * 0.3 + uTime * 0.12) - 0.5) * 6.0, 0.0, 1.0), 3.0);
        c += vec3(1.0) * sheen * 0.08 * (1.0 - ui.a * 0.6);
        gl_FragColor = vec4(c, uOpacity); }` });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), mat);
  mesh.userData.uniforms = uniforms; mesh.userData.ui = ui;
  return mesh;
}

// ---------------- UI canvases (drawn per frame from state) ----------------
const PW = 720, PH = 1200;
function header(ctx, title, sub) {
  ctx.fillStyle = CSS.navy; ctx.fillRect(0, 0, PW, 150);
  ctx.font = font(800, 54); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = CSS.teal; ctx.fillText('ZAYA', 44, 76); const w = ctx.measureText('ZAYA').width; ctx.fillStyle = CSS.coral; ctx.beginPath(); ctx.arc(44 + w + 14, 92, 8, 0, 7); ctx.fill();
  if (title) { ctx.fillStyle = '#fff'; ctx.font = font(700, 40); ctx.textAlign = 'right'; ctx.fillText(title, PW - 44, 76); }
}
function base(ctx) { ctx.clearRect(0, 0, PW, PH); ctx.fillStyle = 'rgba(244,247,248,0.97)'; roundRect(ctx, 0, 0, PW, PH, 44); ctx.fill(); ctx.save(); roundRect(ctx, 0, 0, PW, PH, 44); ctx.clip(); }
function pill(ctx, x, y, text, bg, fg, eth = false) { ctx.font = font(600, 24, eth); const w = ctx.measureText(text).width + 36; ctx.fillStyle = bg; roundRect(ctx, x, y, w, 44, 12); ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 18, y + 23); return w; }
const tick = (v, k) => Math.round(v * k);

export function customerUI() {
  const { canvas, ctx, tex } = canvasTex(PW, PH);
  const shops = [['መደብር ጨላ', 'Jemo'], ['ሚኒ ማርኬት መስከረም', 'Nifas Silk'], ['ኪዮስክ ሮቤል', 'Haile Garment'], ['ሱቅ ሒሩት', 'Jemo']];
  const draw = (s) => { // s: { typed, results, price, ring }
    base(ctx); header(ctx, '', '');
    ctx.fillStyle = CSS.navy; ctx.font = font(700, 58); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Welcome', 44, 240);
    ctx.fillStyle = CSS.teal; ctx.font = font(600, 30); ctx.fillText('Everything near you.', 44, 288);
    // search box with typing cursor
    ctx.strokeStyle = CSS.navy; ctx.lineWidth = 3; ctx.fillStyle = '#fff'; roundRect(ctx, 40, 330, PW - 80, 96, 24); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = CSS.inkMuted; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(88, 375, 14, 0, 7); ctx.moveTo(98, 385); ctx.lineTo(110, 397); ctx.stroke();
    const q = 'sugar'; const n = Math.round(clamp(s.typed) * q.length); ctx.fillStyle = n ? CSS.navy : CSS.inkFaint; ctx.font = font(500, 34); ctx.textBaseline = 'middle'; ctx.fillText(n ? q.slice(0, n) : 'Search an item', 130, 380);
    if (s.typed > 0 && s.typed < 1.05) { const w = ctx.measureText(q.slice(0, n)).width; ctx.fillStyle = CSS.teal; ctx.fillRect(134 + w, 360, 3, 40); }
    // quick actions (Scan / Browse near / My orders) as in the capture
    [['Scan', '#dfe3e8', CSS.navy], ['Browse near', '#ffe9dd', CSS.coral], ['My orders', '#d6f0ee', CSS.teal]].forEach(([t, bg, fg], i) => { const x = 60 + i * 190; ctx.fillStyle = bg; roundRect(ctx, x, 460, 120, 120, 28); ctx.fill(); ctx.fillStyle = fg; ctx.font = font(600, 24); ctx.textAlign = 'center'; ctx.fillText(t, x + 60, 615); ctx.strokeStyle = fg; ctx.lineWidth = 5; ctx.beginPath(); if (i === 1) { ctx.arc(x + 60, 512, 16, 0, 7); ctx.moveTo(x + 60, 528); ctx.lineTo(x + 60, 548); } else if (i === 0) { ctx.rect(x + 40, 500, 40, 40); } else { ctx.rect(x + 42, 496, 36, 46); ctx.moveTo(x + 50, 512); ctx.lineTo(x + 70, 512); ctx.moveTo(x + 50, 526); ctx.lineTo(x + 70, 526); } ctx.stroke(); });
    ctx.textAlign = 'left'; ctx.fillStyle = CSS.navy; ctx.font = font(700, 40); ctx.textBaseline = 'alphabetic'; ctx.fillText('Shops near you', 44, 700);
    shops.forEach((sh, i) => { const k = clamp(s.results * 4.2 - i); if (k <= 0) return; const e = easeOutExpo(k); const y = 740 + i * 118 + (1 - e) * 40; ctx.globalAlpha = e;
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; roundRect(ctx, 32, y - 30, PW - 64, 100, 18); ctx.fill();
      ctx.fillStyle = CSS.navy; ctx.font = font(600, 34, true); ctx.fillText(sh[0], 52, y + 12);
      ctx.fillStyle = CSS.inkMuted; ctx.font = font(500, 24); ctx.fillText('◦ ' + sh[1], 52, y + 50);
      if (i === 0 || i === 3) pill(ctx, PW - 220, y - 12, 'Sponsored', '#d6f0ee', CSS.navy);
      if (i === 1 && s.price > 0) { const kp = easeOutBack(clamp(s.price)); ctx.save(); ctx.translate(PW - 150, y + 20); ctx.scale(kp, kp); ctx.translate(-(PW - 150), -(y + 20)); pill(ctx, PW - 250, y - 2, 'ETB 92.00 · 1 kg', CSS.coral, '#fff'); ctx.restore(); }
      ctx.globalAlpha = 1; });
    ctx.fillStyle = CSS.line; ctx.fillRect(0, PH - 120, PW, 2); ctx.fillStyle = CSS.inkFaint; ctx.font = font(500, 22); ctx.fillText('Cash on delivery · you pay the shop when your order arrives', 44, PH - 70);
    ctx.restore(); tex.needsUpdate = true;
  };
  draw({ typed: 0, results: 0, price: 0 });
  return { canvas, ctx, tex, draw };
}

export function merchantUI() {
  const { canvas, ctx, tex } = canvasTex(PW, PH);
  const draw = (s) => { // s: { sales (0..1), products (0..1), chips (0..1), orders(0..1) }
    base(ctx); header(ctx, 'Dashboard');
    ctx.fillStyle = CSS.navy; ctx.font = font(700, 54); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Welcome', 44, 230);
    ctx.fillStyle = CSS.teal; ctx.font = font(600, 28); ctx.fillText('Everything near you.', 44, 274);
    [['Sale', '#ffe4d6', CSS.coral], ['Products', '#d6f0ee', CSS.teal], ['Orders', '#dfe3e8', CSS.navy], ['Credit', '#ffedd9', CSS.amber]].forEach(([t, bg, fg], i) => { const k = easeOutBack(clamp(s.chips * 2.5 - i * 0.5)); if (k <= 0) return; const x = 60 + i * 158; ctx.save(); ctx.translate(x + 55, 370); ctx.scale(k, k); ctx.translate(-x - 55, -370); ctx.fillStyle = bg; roundRect(ctx, x, 315, 110, 110, 26); ctx.fill(); ctx.strokeStyle = fg; ctx.lineWidth = 5; ctx.beginPath(); ctx.rect(x + 36, 350, 38, 38); ctx.stroke(); ctx.fillStyle = CSS.navy; ctx.font = font(600, 24); ctx.textAlign = 'center'; ctx.fillText(t, x + 55, 465); ctx.restore(); });
    ctx.textAlign = 'left'; ctx.fillStyle = CSS.navy; ctx.font = font(700, 40); ctx.fillText('Today', 44, 560);
    const card = (y, label, value, k, accent) => { const e = easeOutExpo(clamp(k)); if (e <= 0) return; ctx.globalAlpha = e; ctx.fillStyle = 'rgba(255,255,255,0.92)'; roundRect(ctx, 32, y + (1 - e) * 30, PW - 64, 150, 24); ctx.fill(); ctx.fillStyle = accent; roundRect(ctx, 56, y + 36 + (1 - e) * 30, 70, 70, 18); ctx.fill(); ctx.fillStyle = CSS.inkMuted; ctx.font = font(500, 26); ctx.fillText(label, 150, y + 52 + (1 - e) * 30); ctx.fillStyle = CSS.navy; ctx.font = font(800, 52); ctx.fillText(value, 150, y + 118 + (1 - e) * 30); ctx.globalAlpha = 1; };
    card(590, "Today's sales", 'ETB ' + (tick(872, easeOutExpo(clamp(s.sales)))).toFixed(0) + '.00', s.sales * 3, '#d6f0ee');
    card(760, 'Products', String(tick(8, easeOutExpo(clamp(s.products)))), s.products * 3, '#dfe3e8');
    card(930, 'Orders waiting', String(tick(1, clamp(s.orders))), s.orders * 3, '#ffe4d6');
    ctx.fillStyle = CSS.inkFaint; ctx.font = font(500, 22); ctx.fillText('Real screens · pilot build · in device testing', 44, PH - 70);
    ctx.restore(); tex.needsUpdate = true;
  };
  draw({ sales: 0, products: 0, chips: 0, orders: 0 });
  return { canvas, ctx, tex, draw };
}

export function orderUI() {
  const { canvas, ctx, tex } = canvasTex(PW, PH);
  const steps = [['Waiting for the shop', '⧗'], ['Shop confirmed', '✓'], ['On its way', '→'], ['Delivered', '✓']];
  const draw = (s) => { // s: { step (0..3 float), planned }
    base(ctx); header(ctx, 'My orders');
    ctx.fillStyle = CSS.navy; ctx.font = font(600, 34, true); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('ዛያ ማሳያ ሱቅ', 44, 230);
    ctx.fillStyle = CSS.inkMuted; ctx.font = font(500, 24); ctx.fillText('Jemo 1, behind Selam Pharmacy', 44, 270);
    steps.forEach((st, i) => { const y = 340 + i * 120; const k = clamp(s.step - i + 1); const on = k > 0.5; const e = easeOutBack(clamp(k * 1.5));
      ctx.strokeStyle = on ? CSS.teal : CSS.line; ctx.lineWidth = 6; if (i < 3) { ctx.beginPath(); ctx.moveTo(84, y + 30); ctx.lineTo(84, y + 120 * clamp(s.step - i)); ctx.stroke(); }
      ctx.fillStyle = on ? CSS.teal : '#fff'; ctx.strokeStyle = on ? CSS.teal : CSS.inkFaint; ctx.beginPath(); ctx.arc(84, y, 24 * Math.max(0.6, e), 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? CSS.navy : CSS.inkFaint; ctx.font = font(on ? 700 : 500, 34); ctx.fillText(st[0], 140, y + 12); if (on) { ctx.fillStyle = '#fff'; ctx.font = font(700, 26); ctx.textAlign = 'center'; ctx.fillText(st[1], 84, y + 9); ctx.textAlign = 'left'; } });
    ctx.fillStyle = CSS.line; ctx.fillRect(44, 840, PW - 88, 2);
    ctx.fillStyle = CSS.navy; ctx.font = font(500, 30); ctx.fillText('2×  ዳቦ', 44, 900); ctx.textAlign = 'right'; ctx.fillText('ETB 15.00', PW - 44, 900); ctx.textAlign = 'left'; ctx.fillText('1×  ስኳር 1ኪግ', 44, 950); ctx.textAlign = 'right'; ctx.fillText('ETB 92.00', PW - 44, 950);
    ctx.fillStyle = CSS.navy; ctx.font = font(800, 40); ctx.textAlign = 'left'; ctx.fillText('Total', 44, 1030); ctx.textAlign = 'right'; ctx.fillText('ETB 122.00', PW - 44, 1030); ctx.textAlign = 'left';
    ctx.fillStyle = CSS.inkFaint; ctx.font = font(500, 22); ctx.fillText('Cash on delivery — you pay the shop when it arrives', 44, PH - 70);
    ctx.restore(); tex.needsUpdate = true;
  };
  draw({ step: 0 });
  return { canvas, ctx, tex, draw };
}

export function diasporaUI() {
  const { canvas, ctx, tex } = canvasTex(PW, PH);
  const items = [['ዘይት 3L', 'Cooking oil'], ['ስኳር 5ኪግ', 'Sugar'], ['ጤፍ 25ኪግ', 'Teff'], ['ዳቦ', 'Bread']];
  const draw = (s) => { // s: { reveal, sent }
    base(ctx); header(ctx, 'Basket');
    pill(ctx, 44, 190, 'Planned', '#f1f3f5', CSS.inkMuted); pill(ctx, 190, 190, 'የታቀደ', '#f1f3f5', CSS.inkMuted, true);
    ctx.fillStyle = CSS.navy; ctx.font = font(700, 46); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Basket for home', 44, 320);
    ctx.fillStyle = CSS.inkMuted; ctx.font = font(500, 26); ctx.fillText('Real goods · a trusted local shop · proof it arrived', 44, 364);
    items.forEach((it, i) => { const k = clamp(s.reveal * 4.5 - i); if (k <= 0) return; const e = easeOutExpo(k); const y = 430 + i * 120 + (1 - e) * 40; ctx.globalAlpha = e; ctx.fillStyle = 'rgba(255,255,255,0.92)'; roundRect(ctx, 32, y - 30, PW - 64, 100, 18); ctx.fill(); ctx.fillStyle = CSS.navy; ctx.font = font(600, 34, true); ctx.fillText(it[0], 60, y + 14); ctx.fillStyle = CSS.inkMuted; ctx.font = font(500, 24); ctx.fillText(it[1], 60, y + 50); ctx.fillStyle = CSS.teal; ctx.beginPath(); ctx.arc(PW - 90, y + 20, 18, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(PW - 100, y + 20); ctx.lineTo(PW - 92, y + 29); ctx.lineTo(PW - 78, y + 11); ctx.stroke(); ctx.globalAlpha = 1; });
    const k = easeOutBack(clamp(s.sent)); if (k > 0) { ctx.save(); ctx.translate(PW / 2, 1010); ctx.scale(k, k); ctx.translate(-PW / 2, -1010); ctx.fillStyle = CSS.teal; roundRect(ctx, 44, 960, PW - 88, 100, 50); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = font(700, 36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Send to family in Addis', PW / 2, 1010); ctx.restore(); }
    ctx.fillStyle = CSS.inkFaint; ctx.font = font(500, 22); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Planned — not a money-transfer service', 44, PH - 70);
    ctx.restore(); tex.needsUpdate = true;
  };
  draw({ reveal: 0, sent: 0 });
  return { canvas, ctx, tex, draw };
}

// 3D "inventory blocks" that extrude out of the merchant's shelf and count up
export function buildInventory({ env, count = 18, seed = 4 }) {
  const g = new THREE.Group(); const cols = [C.teal, C.coral, C.amber, C.mint, 0xc9d3d6];
  const blocks = [];
  for (let i = 0; i < count; i++) { const col = i % 6, row = Math.floor(i / 6); const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), new THREE.MeshPhysicalMaterial({ color: cols[i % cols.length], roughness: 0.35, metalness: 0.05, clearcoat: 0.5, envMap: env, envMapIntensity: 0.4, emissive: cols[i % cols.length], emissiveIntensity: 0.03 })); m.position.set((col - 2.5) * 0.5, row * 0.5 + 0.21, 0); m.scale.setScalar(0.001); g.add(m); blocks.push(m); }
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.7), new THREE.MeshPhysicalMaterial({ color: 0x2b3a4a, roughness: 0.5, envMap: env, envMapIntensity: 0.5 })); shelf.position.y = -0.02; g.add(shelf);
  const state = { progress: 0 };
  function update(t) { blocks.forEach((b, i) => { const k = clamp((state.progress * (count + 3) - i) / 3); const e = easeOutBack(k); b.scale.setScalar(Math.max(0.001, e)); b.rotation.y = (1 - e) * 1.2 + Math.sin(t * 0.8 + i) * 0.03; b.position.z = (1 - e) * -1.0; }); }
  return { group: g, blocks, shelf, state, update };
}

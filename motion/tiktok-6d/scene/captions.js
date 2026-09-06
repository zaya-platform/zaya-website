// Burned-in kinetic captions on 3D planes in a camera-space scene (Z-push entrance, no DOF/motion
// blur, but they take bloom + CA + grain with the film). Always inside the 8% safe area and above the
// bottom 320 px TikTok band. Max 5 words. EN primary + Amharic secondary where it adds authenticity.
import * as THREE from 'three';
import { canvasTex, font, CSS, roundRect } from './util.js';

export class Captions {
  constructor(W, H) {
    this.scene = new THREE.Scene(); this.W = W; this.H = H;
    this.camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50); this.camera.position.set(0, 0, 0);
    this.items = [];
    // world height visible at distance D: 2*D*tan(fov/2). We place captions at D=10 → height 7.28 units
    this.D = 10; this.viewH = 2 * this.D * Math.tan(THREE.MathUtils.degToRad(20)); this.viewW = this.viewH * W / H;
  }
  // y in [0..1] of screen from bottom, x centre in [0..1]; textures at 2x for crispness
  make({ en, am, size = 1, align = 'center', x = 0.5, y = 0.5, width = 0.84, style = 'caption', color = CSS.white, accent = CSS.teal }) {
    const pxW = Math.round(this.W * width), pxH = style === 'pill' ? Math.round(this.W * 0.075) : style === 'chip' ? Math.round(this.W * 0.06) : Math.round(this.W * (am ? 0.30 : 0.22) * size);
    const { canvas, ctx, tex } = canvasTex(pxW * 2, pxH * 2);
    const draw = (reveal = 1) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.scale(2, 2);
      if (style === 'pill') {
        ctx.font = font(700, 30); const tw = ctx.measureText(en).width + 56; const px = align === 'left' ? 0 : (pxW - tw) / 2;
        ctx.fillStyle = 'rgba(10,15,18,0.78)'; roundRect(ctx, px, 8, tw, pxH - 16, (pxH - 16) / 2); ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = accent; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(en, px + 28, pxH / 2 + 1);
        if (am) { ctx.font = font(600, 24, true); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(am, px + tw + 18, pxH / 2 + 1); }
      } else if (style === 'chip') {
        ctx.font = font(600, 24); const label = en + (am ? '  ·  ' : ''); const w1 = ctx.measureText(label).width; ctx.font = font(600, 24, true); const w2 = am ? ctx.measureText(am).width : 0; const tw = w1 + w2 + 40;
        ctx.fillStyle = 'rgba(10,15,18,0.72)'; roundRect(ctx, 0, 6, tw, pxH - 12, 12); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = font(600, 24); ctx.fillText(label, 20, pxH / 2 + 1); if (am) { ctx.font = font(600, 24, true); ctx.fillText(am, 20 + w1, pxH / 2 + 1); }
      } else {
        const big = Math.round(this.W * 0.07 * size), small = Math.round(this.W * 0.034 * size);
        ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; const cx = align === 'left' ? 0 : pxW / 2;
        // word-by-word reveal: each word slides up with a mask
        const words = en.replace(/\n/g, '\n ').split(' '); ctx.font = font(800, big); const ws = words.map((w) => ctx.measureText(w.replace('\n', '') + ' ').width); const total = ws.reduce((a, b) => a + b, 0) - ctx.measureText(' ').width;
        let lines = [[]], lw = 0; words.forEach((w, i) => { const brk = i > 0 && words[i - 1].endsWith('\n'); if ((brk || lw + ws[i] > pxW) && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += ws[i]; });
        let yy = big * 1.05; const lineH = big * 1.08;
        lines.forEach((line) => { const lineW = line.reduce((a, i) => a + ws[i], 0) - ctx.measureText(' ').width; let xx = align === 'left' ? 0 : (pxW - lineW) / 2;
          line.forEach((i) => { const k = Math.min(1, Math.max(0, (reveal * (words.length + 1.2) - i) / 1.2)); const ee = 1 - Math.pow(1 - k, 3);
            ctx.save(); ctx.beginPath(); ctx.rect(xx - 4, yy - big * 1.0, ws[i] + 8, big * 1.35); ctx.clip(); ctx.globalAlpha = ee; ctx.fillStyle = color; ctx.textAlign = 'left';
            ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4; ctx.fillText(words[i].replace('\n', ''), xx, yy + (1 - ee) * big * 0.55); ctx.restore(); xx += ws[i]; }); yy += lineH; });
        if (am) { const k = Math.min(1, Math.max(0, reveal * 2.2 - 1.2)); ctx.globalAlpha = k; ctx.fillStyle = accent; ctx.font = font(600, small, true); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 12; ctx.fillText(am, cx, yy - lineH + small * 1.35 + (1 - k) * 10); ctx.globalAlpha = 1; }
      }
      ctx.restore(); tex.needsUpdate = true;
    };
    draw(1);
    const wUnits = this.viewW * width, hUnits = wUnits * pxH / pxW;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wUnits, hUnits), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const item = { mesh, draw, state: { reveal: 0, z: 0, opacity: 0, x, y, rot: 0, scale: 1 }, lastReveal: -1, follow: null, align };
    mesh.visible = false; this.scene.add(mesh); this.items.push(item);
    return item;
  }
  update(worldCamera) {
    for (const it of this.items) {
      const s = it.state; it.mesh.visible = s.opacity > 0.001;
      if (!it.mesh.visible) continue;
      if (Math.abs(s.reveal - it.lastReveal) > 0.002) { it.draw(s.reveal); it.lastReveal = s.reveal; }
      let x = s.x, y = s.y;
      if (it.follow && worldCamera) { const p = it.follow.getWorldPosition(new THREE.Vector3()).add(it.followOffset || new THREE.Vector3()); p.project(worldCamera); x = p.x * 0.5 + 0.5; y = p.y * 0.5 + 0.5; }
      const D = this.D + s.z; const vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(20)), vw = vh * this.W / this.H;
      const ax = it.align === 'left' ? (it.mesh.geometry.parameters.width / 2) * (D / this.D) : 0;
      it.mesh.position.set((x - 0.5) * vw + ax, (y - 0.5) * vh, -D);
      it.mesh.rotation.set(0, 0, s.rot); it.mesh.scale.setScalar(s.scale * (D / this.D)); it.mesh.material.opacity = s.opacity;
    }
  }
}

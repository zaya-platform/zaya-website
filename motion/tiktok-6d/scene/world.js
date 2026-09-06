// The Addis block: merged extruded buildings with baked AO + assemble-in-Z shader, teal wire edges,
// procedural ground (streets + subtle habesha weave + shockwave), shop pins, bokeh particles,
// light shafts, minibuses, Amharic shop signs. One draw call per layer.
import * as THREE from 'three';
import { C, CSS, rng, canvasTex, roundRect, font, clamp } from './util.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';

export function buildCity(scene, seed = 7) {
  const R = rng(seed);
  const geos = [], edgeGeos = []; const buildings = [];
  const N = 9; // blocks per side
  const BLOCK = 4.4, STREET = 1.6, PITCH = BLOCK + STREET;
  for (let bx = -N; bx <= N; bx++) for (let bz = -N; bz <= N; bz++) {
    const cx = bx * PITCH, cz = bz * PITCH; const dist = Math.hypot(bx, bz);
    const n = 1 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const w = 1.0 + R() * 1.6, d = 1.0 + R() * 1.6;
      const h = 0.7 + R() * R() * (dist < 4 ? 5.5 : 3.2) + (R() < 0.08 ? 4 : 0);
      const x = cx + (R() - 0.5) * (BLOCK - w), z = cz + (R() - 0.5) * (BLOCK - d);
      const g = new THREE.BoxGeometry(w, h, d); g.translate(x, h / 2, z);
      // baked AO in vertex colour: darker at the base; plus per-building tint variance
      const pos = g.attributes.position, col = new Float32Array(pos.count * 3), del = new Float32Array(pos.count), rnd = new Float32Array(pos.count);
      const tint = 0.85 + R() * 0.3; const delay = clamp(dist / (N * 1.2) * 0.75 + R() * 0.2, 0, 0.95);
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); const ao = 0.35 + 0.65 * clamp(y / (h * 0.9 + 0.3)); col[i * 3] = ao * tint; col[i * 3 + 1] = ao * tint; col[i * 3 + 2] = ao * tint; del[i] = delay; rnd[i] = R(); }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('aDelay', new THREE.BufferAttribute(del, 1)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
      geos.push(g);
      const e = new THREE.EdgesGeometry(g); const ed = new Float32Array(e.attributes.position.count).fill(delay); e.setAttribute('aDelay', new THREE.BufferAttribute(ed, 1)); edgeGeos.push(e);
      buildings.push({ x, z, w, d, h });
    }
  }
  const merged = BGU.mergeGeometries(geos, false);
  const uniforms = { uAssembly: { value: 1 }, uWire: { value: 0 }, uTime: { value: 0 } };
  const inject = (shader) => {
    shader.uniforms.uAssembly = uniforms.uAssembly; shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\nattribute float aDelay; uniform float uAssembly;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n float k0 = clamp((uAssembly - aDelay) / 0.32, 0.0, 1.0); float k = 1.0 - pow(1.0 - k0, 3.0);\n transformed.y *= k; transformed.z += (1.0 - k) * -60.0; transformed.y += (1.0 - k) * 8.0;`);
  };
  const mat = new THREE.MeshLambertMaterial({ color: 0x2a3a4a, vertexColors: true, emissive: 0x06090c });
  mat.onBeforeCompile = inject;
  const mesh = new THREE.Mesh(merged, mat); mesh.frustumCulled = false; scene.add(mesh);
  // window lights: emissive dots on facades (instanced small quads) — the neon-city glow
  const winGeo = new THREE.PlaneGeometry(0.16, 0.22); const winPos = [], winCol = [];
  for (const b of buildings) {
    const rows = Math.floor(b.h / 0.5), colsX = Math.floor(b.w / 0.45), colsZ = Math.floor(b.d / 0.45);
    for (let r = 0; r < rows; r++) for (let cxi = 0; cxi < colsX; cxi++) { if (R() < 0.45) continue; const on = R(); winPos.push({ x: b.x - b.w / 2 + 0.3 + cxi * 0.45, y: 0.4 + r * 0.5, z: b.z + b.d / 2 + 0.002, ry: 0, on }); winPos.push({ x: b.x - b.w / 2 + 0.3 + cxi * 0.45, y: 0.4 + r * 0.5, z: b.z - b.d / 2 - 0.002, ry: Math.PI, on: R() }); }
    for (let r = 0; r < rows; r++) for (let czi = 0; czi < colsZ; czi++) { if (R() < 0.45) continue; winPos.push({ x: b.x + b.w / 2 + 0.002, y: 0.4 + r * 0.5, z: b.z - b.d / 2 + 0.3 + czi * 0.45, ry: Math.PI / 2, on: R() }); winPos.push({ x: b.x - b.w / 2 - 0.002, y: 0.4 + r * 0.5, z: b.z - b.d / 2 + 0.3 + czi * 0.45, ry: -Math.PI / 2, on: R() }); }
  }
  const wins = new THREE.InstancedMesh(winGeo, new THREE.MeshBasicMaterial({ vertexColors: false, transparent: true, opacity: 0.9 }), winPos.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
  const palette = [C.amber, C.teal, 0xffe9c4, C.coral, 0xfff6e0, C.mint];
  winPos.forEach((w, i) => { e.set(0, w.ry, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(w.x, w.y, w.z), q, s); wins.setMatrixAt(i, m4); col.set(palette[Math.floor(w.on * palette.length)]).multiplyScalar(0.5 + w.on * 0.9); wins.setColorAt(i, col); });
  wins.material.onBeforeCompile = (sh) => { sh.uniforms.uAssembly = uniforms.uAssembly; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uAssembly;').replace('#include <begin_vertex>', '#include <begin_vertex>\n float kk = smoothstep(0.75, 1.0, uAssembly); transformed *= kk;'); };
  wins.frustumCulled = false; scene.add(wins);
  // wire edges (the hook's wireframe assembly): teal, fade out as the solid city lands
  const mergedEdges = BGU.mergeGeometries(edgeGeos, false);
  const wireMat = new THREE.LineBasicMaterial({ color: C.tealBright, transparent: true, opacity: 0.9 });
  wireMat.onBeforeCompile = (sh) => { sh.uniforms.uAssembly = uniforms.uAssembly; sh.uniforms.uWire = uniforms.uWire;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aDelay; uniform float uAssembly; varying float vK;').replace('#include <begin_vertex>', '#include <begin_vertex>\n float k0 = clamp((uAssembly - aDelay) / 0.32, 0.0, 1.0); float k = 1.0 - pow(1.0 - k0, 3.0); vK = k0; transformed.y *= k; transformed.z += (1.0 - k) * -60.0; transformed.y += (1.0 - k) * 8.0;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uWire; varying float vK;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( diffuse, opacity * uWire * smoothstep(0.0, 0.15, vK) );'); };
  const wire = new THREE.LineSegments(mergedEdges, wireMat); wire.frustumCulled = false; scene.add(wire);
  return { mesh, wire, wins, uniforms, buildings, PITCH, N };
}

export function buildGround(scene) {
  const uniforms = { uShock: { value: -10 }, uShockW: { value: 1.5 }, uShockI: { value: 0 }, uAssembly: { value: 1 }, uTime: { value: 0 }, fogColor: { value: new THREE.Color(C.ground) }, fogDensity: { value: 0.03 } };
  const mat = new THREE.ShaderMaterial({ uniforms, fog: false, vertexShader: /* glsl */`varying vec3 vW; varying float vFogDepth; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; vec4 mv = viewMatrix * wp; vFogDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`uniform float uShock, uShockW, uShockI, uAssembly, uTime, fogDensity; uniform vec3 fogColor; varying vec3 vW; varying float vFogDepth;
      void main(){
        float pitch = 6.0; vec2 g = mod(vW.xz, pitch) - pitch * 0.5; // streets sit between blocks (block centres at multiples of pitch)
        float street = 1.0 - smoothstep(0.55, 0.85, min(abs(g.x), abs(g.y)));
        vec3 base = vec3(0.045, 0.062, 0.075);
        // habesha weave motif: cross-hatched diamond lattice, whisper-quiet
        vec2 h = vW.xz * 2.2; float w1 = abs(fract(h.x + h.y) - 0.5) + abs(fract(h.x - h.y) - 0.5); float weave = smoothstep(0.42, 0.5, w1) * 0.35 + step(0.96, fract(h.x * 2.0)) * 0.3 + step(0.96, fract(h.y * 2.0)) * 0.3;
        base += vec3(0.02, 0.06, 0.06) * weave * (1.0 - street) * 0.5;
        base = mix(base, vec3(0.06, 0.09, 0.10), street * 0.9);
        float lane = street * (1.0 - smoothstep(0.02, 0.05, min(abs(g.x), abs(g.y)))); base += vec3(0.05, 0.16, 0.16) * lane;
        // teal shockwave travelling outward from the origin
        float r = length(vW.xz); float ring = exp(-pow((r - uShock) / uShockW, 2.0) * 3.0); float inside = smoothstep(uShock - uShockW * 2.5, uShock, r);
        base += vec3(0.08, 0.64, 0.64) * ring * uShockI * 1.6 + vec3(0.03, 0.2, 0.2) * (1.0 - inside) * step(0.0, uShock) * uShockI * 0.25;
        float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
        gl_FragColor = vec4(mix(base, fogColor, fogF), 1.0); }` });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), mat); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; scene.add(ground);
  return { ground, uniforms };
}

export function buildPins(scene, buildings, seed = 11) {
  const R = rng(seed); const pins = [];
  for (const b of buildings) if (R() < 0.42) pins.push({ x: b.x + (R() - 0.5) * b.w * 0.5, y: b.h + 0.55, z: b.z + (R() - 0.5) * b.d * 0.5, r: Math.hypot(b.x, b.z), ph: R() * 10, online: 0 });
  const n = pins.length;
  const geo = BGU.mergeGeometries([new THREE.ConeGeometry(0.16, 0.42, 14).translate(0, 0.21, 0).rotateX(Math.PI), new THREE.SphereGeometry(0.19, 16, 12).translate(0, 0.32, 0)]);
  const mat = new THREE.MeshLambertMaterial({ color: 0x8a929c, emissive: 0x111111 });
  const aOn = new THREE.InstancedBufferAttribute(new Float32Array(n), 1); geo.setAttribute('aOn', aOn);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = { value: 0 }; mat.userData.sh = sh;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aOn; varying float vOn;').replace('#include <begin_vertex>', '#include <begin_vertex>\n vOn = aOn; float pop = 1.0 + 0.35 * sin(clamp(aOn, 0.0, 1.0) * 3.14159); transformed *= pop;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vOn;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( mix(diffuse, vec3(0.6, 1.0, 1.0), clamp(vOn, 0.0, 1.0)), opacity );').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance = mix(vec3(0.02), vec3(0.09, 0.8, 0.8) * 0.9, clamp(vOn, 0.0, 1.0));');
  };
  const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.frustumCulled = false;
  const m4 = new THREE.Matrix4();
  pins.forEach((p, i) => { m4.makeTranslation(p.x, p.y, p.z); mesh.setMatrixAt(i, m4); });
  scene.add(mesh);
  const state = { shock: -1, flicker: 1, allOn: 0 };
  function update(t) {
    for (let i = 0; i < n; i++) { const p = pins[i]; let on = 0; if (state.shock > p.r) on = clamp((state.shock - p.r) / 2.5); on = Math.max(on, state.allOn);
      const fl = 0.5 + 0.5 * Math.sin(t * 9 + p.ph * 3.1) * Math.sin(t * 2.3 + p.ph); aOn.array[i] = on > 0 ? on : -0.6 + 0.6 * fl * state.flicker; }
    aOn.needsUpdate = true;
    // bob
    pins.forEach((p, i) => { m4.makeTranslation(p.x, p.y + Math.sin(t * 1.7 + p.ph) * 0.05, p.z); mesh.setMatrixAt(i, m4); }); mesh.instanceMatrix.needsUpdate = true;
  }
  return { mesh, pins, state, update };
}

export function buildParticles(scene, seed = 3, count = 1500) {
  const R = rng(seed); const pos = new Float32Array(count * 3), a = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) { pos[i * 3] = (R() - 0.5) * 90; pos[i * 3 + 1] = R() * 22 - 1; pos[i * 3 + 2] = (R() - 0.5) * 90; a[i * 4] = R(); a[i * 4 + 1] = 0.5 + R() * 1.5; a[i * 4 + 2] = R() * 6.28; a[i * 4 + 3] = R(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(a, 4));
  const uniforms = { uTime: { value: 0 }, uSize: { value: 15 }, uOpacity: { value: 1 }, uColA: { value: new THREE.Color(C.tealBright) }, uColB: { value: new THREE.Color(C.coral) } };
  const mat = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: /* glsl */`attribute vec4 aRnd; uniform float uTime, uSize; varying float vA; varying float vC;
      void main(){ vec3 p = position; p.y += sin(uTime * 0.35 * aRnd.y + aRnd.z) * 0.8; p.x += cos(uTime * 0.25 * aRnd.y + aRnd.z) * 0.6; p.z += sin(uTime * 0.2 + aRnd.z * 2.0) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); float d = -mv.z; gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * aRnd.y * (1.0 + 9.0 / max(d, 0.5)) * 0.9; vA = (0.35 + 0.65 * aRnd.x) * smoothstep(0.3, 3.0, d) * (0.4 + 0.6 * abs(sin(uTime * 0.6 * aRnd.y + aRnd.w * 6.0))); vC = aRnd.w; }`,
    fragmentShader: /* glsl */`uniform float uOpacity; uniform vec3 uColA, uColB; varying float vA; varying float vC; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); float a = smoothstep(0.5, 0.42, r) * (0.55 + 0.45 * smoothstep(0.5, 0.0, r)); gl_FragColor = vec4(mix(uColA, uColB, step(0.85, vC)) * 0.8, a * vA * uOpacity * 0.22); }` });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; scene.add(pts);
  return { pts, uniforms };
}

// Volumetric-look light shafts: additive fan planes with animated noise
export function buildShafts(scene, seed = 5) {
  const uniforms = { uTime: { value: 0 }, uI: { value: 1 }, uCol: { value: new THREE.Color(C.teal) } };
  const mat = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: /* glsl */`varying vec2 vUv; varying float vD; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`uniform float uTime, uI; uniform vec3 uCol; varying vec2 vUv; varying float vD;
      float n(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); } float sn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(n(i), n(i+vec2(1,0)), f.x), mix(n(i+vec2(0,1)), n(i+vec2(1,1)), f.x), f.y); }
      void main(){ float beam = sn(vec2(vUv.x * 9.0 + uTime * 0.15, vUv.y * 1.5)) * sn(vec2(vUv.x * 3.0 - uTime * 0.07, 0.5)); float shape = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x) * pow(1.0 - vUv.y, 1.6) * smoothstep(0.0, 0.12, vUv.y);
        gl_FragColor = vec4(uCol * beam * shape * uI * 0.5 * smoothstep(0.5, 4.0, vD), 1.0); }` });
  const g = new THREE.Group(); const R = rng(seed);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(6 + R() * 8, 18), mat); m.position.set((R() - 0.5) * 30, 9, (R() - 0.5) * 30); m.rotation.y = R() * Math.PI; g.add(m); }
  scene.add(g); return { group: g, uniforms };
}

export function buildMinibuses(scene, PITCH, seed = 9) {
  const R = rng(seed); const g = new THREE.Group();
  const blue = new THREE.MeshLambertMaterial({ color: 0x1d5fd6 }), white = new THREE.MeshLambertMaterial({ color: 0xe9eef2 }), glass = new THREE.MeshLambertMaterial({ color: 0x0c1a2a, emissive: 0x152a3d });
  const buses = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Group();
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.95), blue); lower.position.y = 0.2; b.add(lower);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.2, 0.95), white); upper.position.y = 0.41; b.add(upper);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.7), glass); win.position.y = 0.42; b.add(win);
    const head = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.06), new THREE.MeshBasicMaterial({ color: 0xfff1c0 })); head.position.set(0, 0.22, 0.48); b.add(head);
    const lane = (Math.floor(R() * 5) - 2) * PITCH + PITCH / 2 + (R() < 0.5 ? 0.35 : -0.35); const axis = R() < 0.5 ? 'x' : 'z';
    buses.push({ g: b, lane, axis, off: R() * 60, speed: 2.2 + R() * 1.6, dir: R() < 0.5 ? 1 : -1 }); g.add(b);
  }
  scene.add(g);
  function update(t) { for (const b of buses) { const s = ((b.off + t * b.speed * b.dir) % 60 + 60) % 60 - 30; if (b.axis === 'x') { b.g.position.set(s, 0, b.lane); b.g.rotation.y = b.dir > 0 ? Math.PI / 2 : -Math.PI / 2; } else { b.g.position.set(b.lane, 0, s); b.g.rotation.y = b.dir > 0 ? 0 : Math.PI; } } }
  return { group: g, update };
}

// Amharic shop signs on the fly-through street (correct spellings; loanwords as used in Addis)
export function buildSigns(scene, buildings, seed = 21) {
  const R = rng(seed); const g = new THREE.Group();
  const signs = [['ሱቅ', CSS.amber], ['እንጀራ ቤት', CSS.coral], ['ካፌ', CSS.teal], ['ፋርማሲ', CSS.mint], ['ሚኒ ማርኬት', CSS.amber], ['ሱቅ', CSS.teal], ['ካፌ', CSS.coral]];
  const near = buildings.filter((b) => Math.abs(b.z) < 14 && Math.abs(b.x) > 2 && Math.abs(b.x) < 16).sort(() => R() - 0.5).slice(0, signs.length);
  near.forEach((b, i) => {
    const [text, colr] = signs[i]; const { canvas, ctx, tex } = canvasTex(512, 160);
    ctx.fillStyle = 'rgba(8,12,16,0.9)'; roundRect(ctx, 6, 6, 500, 148, 18); ctx.fill(); ctx.strokeStyle = colr; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = colr; ctx.font = font(700, 76, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 84); tex.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.47), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); 
    const side = b.x > 0 ? -1 : 1; m.position.set(b.x + side * (b.w / 2 + 0.02), Math.min(b.h - 0.3, 1.1), b.z); m.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(m);
    const glow = new THREE.PointLight(new THREE.Color(colr), 0.9, 4); glow.position.copy(m.position); glow.position.x += side * 0.4; g.add(glow);
  });
  scene.add(g); return { group: g };
}

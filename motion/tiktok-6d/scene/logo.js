// ZAYA brand mark in true 3D: the pin (extruded from the official SVG path), coral disc, Z monogram
// tubes, zone rings, tile; shard system for the hook assembly; wordmark strokes (on-dark variant).
import * as THREE from 'three';
import { C, parseSvgPath, strokeTubes, rng, canvasTex, font, CSS, easeOutExpo, easeOutBack, clamp } from './util.js';

export function buildLogo({ env, size = 1 }) {
  const g = new THREE.Group(); const S = size / 512;
  // Pin path from brand/2026-07-07_ZAYA_Logo_AppIcon.svg (centre 256,256 -> origin, y flipped)
  const poly = parseSvgPath('M333.7 249.2 L256 372 L178.3 249.2 A92 92 0 1 1 333.7 249.2 Z')[0];
  const shape = new THREE.Shape(poly.map((p) => new THREE.Vector2((p.x - 256) * S, -(p.y - 256) * S)));
  const pinGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.16 * size, bevelEnabled: true, bevelThickness: 0.02 * size, bevelSize: 0.02 * size, bevelSegments: 3, curveSegments: 24 });
  pinGeo.center(); pinGeo.translate(0, (256 - 279) * S, 0); // keep the pin's true centroid offset (pin centre y=~279 in SVG)
  const white = new THREE.MeshPhysicalMaterial({ color: 0xe6ecee, roughness: 0.28, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.2, envMap: env, envMapIntensity: 0.5 });
  const pin = new THREE.Mesh(pinGeo, white); g.add(pin);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(56 * S, 56 * S, 0.06 * size, 48), new THREE.MeshPhysicalMaterial({ color: C.coral, emissive: C.coral, emissiveIntensity: 0.35, roughness: 0.35, envMap: env, envMapIntensity: 0.8 }));
  disc.rotation.x = Math.PI / 2; disc.position.set(0, (256 - 200) * S, 0.09 * size + 0.02 * size); g.add(disc);
  const zPoly = [[224, 180], [286, 180], [226, 220], [289, 220]].map(([x, y]) => ({ x, y }));
  const z = strokeTubes([zPoly], { box: 512, size, radius: 8.5 * S, material: white }); z.position.set(0, 0, 0.13 * size + 0.02 * size); g.add(z);
  // faint zone rings
  const rings = new THREE.Group(); const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
  [150, 216, 290].forEach((r, i) => { const m = new THREE.Mesh(new THREE.RingGeometry(r * S - 0.006 * size, r * S, 96), ringMat.clone()); m.material.opacity = [0.16, 0.11, 0.07][i]; m.position.set(0, (256 - 200) * S, -0.05 * size); rings.add(m); });
  g.add(rings);
  g.userData = { pin, disc, z, rings, white };
  return g;
}

export function buildTile({ size = 1 }) {
  // rounded-square app tile, teal gradient (13B7B4 -> 0B8B8A) baked into vertex colour via shader
  const r = 115 / 512 * size; const s = new THREE.Shape();
  const w = size / 2; s.moveTo(-w + r, -w); s.lineTo(w - r, -w); s.quadraticCurveTo(w, -w, w, -w + r); s.lineTo(w, w - r); s.quadraticCurveTo(w, w, w - r, w); s.lineTo(-w + r, w); s.quadraticCurveTo(-w, w, -w, w - r); s.lineTo(-w, -w + r); s.quadraticCurveTo(-w, -w, -w + r, -w);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08 * size, bevelEnabled: true, bevelThickness: 0.01 * size, bevelSize: 0.01 * size, bevelSegments: 2, curveSegments: 12 }); geo.center();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
  mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLp = position;'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLp;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', `float gt = clamp((vLp.x - vLp.y) / ${size.toFixed(3)} + 0.5, 0.0, 1.0); vec4 diffuseColor = vec4( mix(vec3(0.0056, 0.476, 0.457), vec3(0.0033, 0.258, 0.254), gt) * 1.0, opacity );`); };
  return new THREE.Mesh(geo, mat);
}

// Shards: small tetrahedra that fly in from a teal streak and converge on the pin's surface.
export function buildShards(pinGroup, { count = 220, seed = 13, env } = {}) {
  const R = rng(seed);
  const geo = new THREE.TetrahedronGeometry(0.06, 0);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: C.tealBright, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.1, envMap: env });
  const mesh = new THREE.InstancedMesh(geo, mat, count); mesh.frustumCulled = false;
  // targets: sample pin geometry surface
  const pin = pinGroup.userData.pin; const pos = pin.geometry.attributes.position; const targets = [], starts = [], spins = [];
  for (let i = 0; i < count; i++) { const vi = Math.floor(R() * pos.count); targets.push(new THREE.Vector3(pos.getX(vi), pos.getY(vi), pos.getZ(vi)));
    const a = R() * Math.PI * 2, rad = 2 + R() * 6; starts.push(new THREE.Vector3(Math.cos(a) * rad - 6 - R() * 10, (R() - 0.5) * 4, Math.sin(a) * rad - 4)); spins.push(R() * 10); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  const state = { progress: 0, scatter: 0 };
  function update(t) {
    for (let i = 0; i < count; i++) {
      const k = clamp((state.progress - (i / count) * 0.35) / 0.65); const ke = easeOutExpo(k);
      p.copy(starts[i]).lerp(targets[i], ke); p.y += Math.sin(k * Math.PI) * 0.8 * (0.5 + (i % 5) / 5);
      p.addScaledVector(targets[i].clone().normalize(), state.scatter * (1 + (i % 7) * 0.4));
      e.set(spins[i] + t * 2 * (1 - ke), spins[i] * 0.7 + t * 1.5, 0); q.setFromEuler(e); const s = 0.6 + 0.8 * (1 - ke) + 0.3 * (i % 3) * 0.3; sc.set(s, s, s).multiplyScalar(1 - Math.max(0, state.progress - 0.9) * 10 * 1);
      m4.compose(p, q, sc); mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true; mesh.visible = state.progress > 0 && state.progress < 1;
  }
  pinGroup.add(mesh);
  return { mesh, state, update };
}

// Wordmark: ZAYA strokes from brand/2026-07-07_ZAYA_Logo_Wordmark.svg, on-dark (white) variant; APP in coral.
export function buildWordmark({ env, width = 3 }) {
  const paths = ['M13 20 L109 20 L13 140 L109 140', 'M137 140 L182 20 L227 140', 'M255 20 L300 80 L345 20', 'M300 80 L300 140', 'M373 140 L418 20 L463 140'];
  const polys = paths.flatMap((d) => parseSvgPath(d));
  const white = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.0, clearcoat: 0.6, envMap: env, envMapIntensity: 0.5, emissive: 0x223344, emissiveIntensity: 0.1 });
  const box = 476; const size = width; const tubes = strokeTubes(polys.map((p) => p.map((q) => ({ x: q.x, y: q.y + 14 - 80 + 238 }))), { box, size, radius: 13 / box * size, material: white });
  // strokeTubes centres on box/2; wordmark strokes sit at y 20..140 (+14) -> centred by the translate above
  const g = new THREE.Group(); g.add(tubes);
  const { ctx, tex } = canvasTex(512, 128); ctx.fillStyle = CSS.coral; ctx.font = font(700, 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '30px'; ctx.fillText('APP', 270, 66); tex.needsUpdate = true;
  const app = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.55, size * 0.1375), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); app.position.set(0, -size * 0.285, 0.02); g.add(app);
  g.userData = { tubes, app };
  return g;
}

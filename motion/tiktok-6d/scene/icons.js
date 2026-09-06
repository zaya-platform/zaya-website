// Segment icons as real 3D tube geometry, in the site's Tabler-style 24-grid stroke grammar.
//   customers  = "Shops in your area" magnifier (src/pages/index.astro, latest)
//   merchants  = storefront (designed here in the same grammar; the site has no merchant glyph — DECISIONS.md)
//   ride       = route (designed here; no Ride product exists — labelled Planned in the film)
//   diaspora   = "Provide for family" basket (src/pages/index.astro, latest)
import * as THREE from 'three';
import { C, parseSvgPath, circlePoly, strokeTubes } from './util.js';

export const ICON_PATHS = {
  customers: { paths: ['M21 21l-4-4'], circles: [[11, 11, 7]] },
  merchants: { paths: ['M3 9l1.5-5h15L21 9', 'M3 9v11h18V9', 'M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0', 'M10 20v-6h4v6'] },
  ride: { paths: ['M8 17h6a3 3 0 000-6H10a3 3 0 010-6h6'], circles: [[6, 17, 2], [18, 5, 2]] },
  diaspora: { paths: ['M4 8h16l-1.2 11H5.2L4 8z', 'M8.5 8V6a3.5 3.5 0 017 0v2', 'M9 12h6'] },
};

export function makeIconMaterial(env, accent = C.teal) {
  return new THREE.MeshPhysicalMaterial({ color: 0xdde6e8, roughness: 0.22, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.15, envMap: env, envMapIntensity: 0.55, emissive: accent, emissiveIntensity: 0.05 });
}

export function buildIcon(name, { env, size = 1.6, accent = C.teal } = {}) {
  const def = ICON_PATHS[name];
  const polys = [...(def.paths || []).flatMap((d) => parseSvgPath(d)), ...(def.circles || []).map(([cx, cy, r]) => circlePoly(cx, cy, r))];
  const mat = makeIconMaterial(env, accent);
  const tubes = strokeTubes(polys, { box: 24, size, radius: size / 24 * 1.05, material: mat });
  const g = new THREE.Group(); g.add(tubes);
  // emissive halo disc behind the icon (the teal/coral "edge glow" of the brand)
  const halo = new THREE.Mesh(new THREE.CircleGeometry(size * 0.72, 48), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.z = -size * 0.12; g.add(halo);
  // contact shadow blob (grounded)
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(size * 0.6, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; g.add(shadow);
  g.userData = { tubes, halo, shadow, mat, size };
  return g;
}

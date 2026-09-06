// Bootstrap: deterministic renderer entry. window.__zaya.renderFrame(t, dt) draws the film at time t.
import * as THREE from 'three';
import { loadFonts } from './util.js';
import { Pipeline } from './pipeline.js';
import { Film } from './film.js';

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 1080, H = +q.get('h') || 1920;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', alpha: false });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild(renderer.domElement);

window.__zaya = { ready: false, duration: 45, error: null };
try {
  await loadFonts();
  const pipeline = new Pipeline(renderer, W, H);
  if (q.get('guides')) pipeline.finalM.uniforms.guides.value = 1;
  const film = await Film.create({ renderer, pipeline, W, H, preview: !!q.get('preview') });
  window.__zaya.duration = film.duration;
  window.__zaya.renderFrame = (t, dt = 1 / 60) => film.renderFrame(t, dt);
  window.__zaya.film = film;
  film.renderFrame(0, 1 / 60);
  window.__zaya.ready = true;
} catch (e) { window.__zaya.error = String(e && e.stack || e); console.error(e); }

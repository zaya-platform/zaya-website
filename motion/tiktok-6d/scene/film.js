// The film: one continuous 3D camera journey through an Addis block, driven by a single GSAP master
// timeline. Every beat animates X/Y/Z, time, ≥5 depth layers, light & material, camera physics and
// live data at once (the "6D" spec). Timecodes sit on a 120 BPM grid (0.5 s).
import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { C, CSS, clamp, lerp, fbm1, noise1, canvasTex, roundRect, font } from './util.js';
import { buildCity, buildGround, buildPins, buildParticles, buildShafts, buildMinibuses, buildSigns } from './world.js';
import { buildLogo, buildTile, buildShards, buildWordmark } from './logo.js';
import { buildIcon } from './icons.js';
import { Captions } from './captions.js';
import { makeGlass, customerUI, merchantUI, orderUI, diasporaUI, buildInventory } from './ui.js';
import { makePhotoCard, makeSilhouette } from './humans.js';

gsap.defaults({ ease: 'power2.inOut', overwrite: 'auto' });
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

export class Film {
  static async create(opts) { const f = new Film(opts); await f.build(); f.timeline(); return f; }
  constructor({ renderer, pipeline, W, H, preview }) { Object.assign(this, { renderer, pipeline, W, H, preview }); this.duration = 45; }

  async build() {
    const { renderer } = this;
    const world = this.world = new THREE.Scene(); world.background = new THREE.Color(C.ground); world.fog = new THREE.FogExp2(C.ground, 0.028);
    const glass = this.glass = new THREE.Scene();
    const cap = this.cap = new Captions(this.W, this.H);
    this.camera = new THREE.PerspectiveCamera(40, this.W / this.H, 0.1, 260);
    const pm = new THREE.PMREMGenerator(renderer); const env = this.env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    // ---- lights (animated in update) ----
    this.key = new THREE.DirectionalLight(0xbff6f3, 2.2); this.key.position.set(6, 14, 8); world.add(this.key); world.add(this.key.target);
    this.rim = new THREE.PointLight(C.coral, 40, 30, 1.6); world.add(this.rim);
    this.fill = new THREE.PointLight(C.teal, 30, 30, 1.6); world.add(this.fill);
    this.hemi = new THREE.HemisphereLight(0x1a3a44, 0x05080a, 0.35); world.add(this.hemi);
    this.jac = new THREE.PointLight(C.plum, 12, 14, 1.8); this.jac.position.set(-4, 3, 6); world.add(this.jac); // jacaranda-hour violet
    // ---- world layers ----
    this.city = buildCity(world); this.ground = buildGround(world); this.pins = buildPins(world, this.city.buildings); this.pins.state.uAssembly.value = 0; this.pins.state.uAssembly = this.city.uniforms.uAssembly; this.ground.uniforms.uAssembly = this.city.uniforms.uAssembly;
    this.particles = buildParticles(world); this.shafts = buildShafts(world); this.buses = buildMinibuses(world, this.city.PITCH); this.signs = buildSigns(world, this.city.buildings);
    // sky volume (gradient + slow nebula) — the far depth layer
    const skyU = this.skyU = { uTime: { value: 0 }, uLift: { value: 0 }, uAssembly: this.city.uniforms.uAssembly };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(240, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uTime, uLift, uAssembly; varying vec3 vP; float n(vec3 p){ return fract(sin(dot(p, vec3(12.99, 78.23, 37.71))) * 43758.5); } float sn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(mix(n(i), n(i+vec3(1,0,0)), f.x), mix(n(i+vec3(0,1,0)), n(i+vec3(1,1,0)), f.x), f.y), mix(mix(n(i+vec3(0,0,1)), n(i+vec3(1,0,1)), f.x), mix(n(i+vec3(0,1,1)), n(i+vec3(1,1,1)), f.x), f.y), f.z); }
      void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 fogc = vec3(0.039, 0.059, 0.07); vec3 c = mix(fogc, vec3(0.012, 0.04, 0.055), smoothstep(0.0, 0.5, h)); float neb = sn(vP * 3.0 + uTime * 0.02) * 0.6 + sn(vP * 7.0 - uTime * 0.03) * 0.4; c += vec3(0.02, 0.07, 0.08) * pow(neb, 2.4) * (0.5 + uLift) * smoothstep(0.05, 0.6, h); c += vec3(0.08, 0.035, 0.015) * pow(sn(vP * 2.0 + 5.0), 3.0) * smoothstep(0.1, 0.7, h) * 0.5; c *= smoothstep(0.0, 0.7, uAssembly); gl_FragColor = vec4(c, 1.0); }` }));
    world.add(sky);
    // ---- hero: logo, shards, streak ----
    this.logo = buildLogo({ env, size: 2.2 }); this.logo.position.set(0, 6, 0); world.add(this.logo);
    this.shards = buildShards(this.logo, { env });
    const streakMat = new THREE.MeshBasicMaterial({ color: 0xbfffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    this.streak = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 1, 4, 12), streakMat); this.streak.rotation.z = -0.91; world.add(this.streak);
    this.streakLight = new THREE.PointLight(C.tealBright, 0, 40, 1.5); world.add(this.streakLight);
    const flareTex = (() => { const { ctx, tex } = canvasTex(256, 256); const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.15, 'rgba(190,255,250,0.8)'); g.addColorStop(0.5, 'rgba(14,165,164,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256); tex.needsUpdate = true; return tex; })();
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false })); world.add(this.flash);
    this.streakGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false })); world.add(this.streakGlow);
    const streakTex = (() => { const { ctx, tex } = canvasTex(512, 64); const g = ctx.createLinearGradient(0, 0, 512, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,220,190,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 24, 512, 16); tex.needsUpdate = true; return tex; })();
    this.anamorphic = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false })); world.add(this.anamorphic);
    // ---- segment icons ----
    this.icons = { customers: buildIcon('customers', { env, accent: C.teal }), merchants: buildIcon('merchants', { env, accent: C.coral }), ride: buildIcon('ride', { env, accent: C.teal }), diaspora: buildIcon('diaspora', { env, accent: C.coral }) };
    Object.values(this.icons).forEach((i) => { i.visible = false; world.add(i); });
    // ---- customers stage (A): silhouette + orbiting pins + glass panel ----
    this.woman = makeSilhouette({ height: 3.4 }); this.woman.group.position.set(8.7, 1.72, 3.0); world.add(this.woman.group);
    this.orbit = new THREE.Group(); this.orbit.position.copy(this.woman.group.position); world.add(this.orbit);
    const pinGeo = new THREE.ConeGeometry(0.12, 0.34, 14).translate(0, 0.17, 0).rotateX(Math.PI); const pinMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: C.teal, emissiveIntensity: 0.9, roughness: 0.3, envMap: env });
    this.orbitPins = []; for (let i = 0; i < 5; i++) { const p = new THREE.Group(); const c = new THREE.Mesh(pinGeo, pinMat); const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshPhysicalMaterial({ color: i % 2 ? C.coral : C.teal, emissive: i % 2 ? C.coral : C.teal, emissiveIntensity: 0.6, roughness: 0.3, envMap: env })); s.position.y = 0.3; p.add(c, s); p.scale.setScalar(0.001); this.orbit.add(p); this.orbitPins.push(p); }
    this.uiC = customerUI(); this.panel = makeGlass({ w: 2.4, h: 4.0, ui: this.uiC, edge: C.teal }); this.panel.visible = false; glass.add(this.panel);
    this.uiM = merchantUI(); this.uiO = orderUI(); this.uiD = diasporaUI();
    // ---- merchants stage (B): photo card + shelf blocks + chips ----
    this.merchant = await makePhotoCard('/motion/tiktok-6d/assets/person-merchant.png', { height: 2.25 }); this.merchant.group.position.set(9.45, 1.4, -9.2); world.add(this.merchant.group);
    this.inv = buildInventory({ env }); this.inv.group.position.set(8.55, 0.0, -8.0); this.inv.group.rotation.y = 0.4; this.inv.group.scale.setScalar(0.5); world.add(this.inv.group);
    this.chips = ['Cash on delivery', 'Credit book', 'Quick sale'].map((label, i) => { const { ctx, tex } = canvasTex(512, 128); ctx.fillStyle = i === 0 ? CSS.teal : i === 1 ? CSS.amber : CSS.coral; roundRect(ctx, 0, 0, 512, 128, 64); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = font(700, 44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 256, 66); tex.needsUpdate = true;
      const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.375, 0.12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 1, envMap: env })); const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); face.position.z = 0.061; g.add(body, face); g.visible = false; world.add(g); return g; });
    // ---- delivery stage (C): route tube, package marker, door figure ----
    const routePts = [V3(9, 0.18, -7.4), V3(9, 0.18, 3), V3(-3, 0.18, 3), V3(-3, 0.18, 8.6)];
    this.routeCurve = new THREE.CatmullRomCurve3(routePts, false, 'catmullrom', 0.02);
    this.route = new THREE.Mesh(new THREE.TubeGeometry(this.routeCurve, 220, 0.07, 10, false), new THREE.MeshPhysicalMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.55, roughness: 0.4 })); this.route.geometry.setDrawRange(0, 0); world.add(this.route);
    this.routeGlow = new THREE.Mesh(new THREE.TubeGeometry(this.routeCurve, 220, 0.22, 8, false), new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })); this.routeGlow.geometry.setDrawRange(0, 0); world.add(this.routeGlow);
    this.pkg = new THREE.Group(); const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), new THREE.MeshPhysicalMaterial({ color: C.amber, roughness: 0.4, envMap: env, emissive: C.coral, emissiveIntensity: 0.25 })); box.position.y = 0.15; const band = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), new THREE.MeshPhysicalMaterial({ color: C.teal, roughness: 0.3, envMap: env })); band.position.y = 0.15; this.pkg.add(box, band);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.55, 40), new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.02; this.pkg.add(halo); this.pkgHalo = halo; this.pkg.visible = false; world.add(this.pkg);
    this.pkgLight = new THREE.PointLight(C.coral, 0, 6, 1.8); world.add(this.pkgLight);
    this.orderPanel = makeGlass({ w: 2.0, h: 3.33, ui: this.uiO, edge: C.coral }); this.orderPanel.visible = false; glass.add(this.orderPanel);
    this.doorWoman = makeSilhouette({ height: 2.2 }); this.doorWoman.group.position.set(-3.55, 1.12, 9.35); this.doorWoman.group.rotation.y = -0.4; world.add(this.doorWoman.group);
    // door: a lit doorway on the building at the route's end
    const doorTex = (() => { const { ctx, tex } = canvasTex(128, 256); ctx.fillStyle = '#2b1d12'; ctx.fillRect(0, 0, 128, 256); ctx.fillStyle = '#ffd9a0'; ctx.fillRect(16, 16, 96, 224); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(16, 16, 96, 60); tex.needsUpdate = true; return tex; })();
    this.door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), new THREE.MeshBasicMaterial({ map: doorTex })); this.door.position.set(-2.6, 0.9, 9.9); this.door.rotation.y = -Math.PI / 2 + 0.2; this.door.visible = false; world.add(this.door);
    this.doorLight = new THREE.PointLight(0xffd9a0, 0, 5, 1.8); this.doorLight.position.set(-3.1, 1.2, 9.6); world.add(this.doorLight);
    // ---- diaspora stage (D): data globe + arc + family card ----
    this.globe = this.buildGlobe(env); this.globe.group.position.set(0, 16, 0); this.globe.group.visible = false; world.add(this.globe.group);
    this.family = await makePhotoCard('/motion/tiktok-6d/assets/person-family.png', { height: 2.8 }); this.family.group.position.set(3.0, 14.4, 5.4); this.family.group.rotation.y = -0.35; world.add(this.family.group);
    this.basketPanel = makeGlass({ w: 1.9, h: 3.17, ui: this.uiD, edge: C.teal }); this.basketPanel.visible = false; glass.add(this.basketPanel);
    // ---- resolve (E): tile, wordmark, end card ----
    this.tile = buildTile({ size: 2.2 }); this.tile.visible = false; this.tile.position.set(0, 0, -0.16); this.logo.add(this.tile);
    this.wordmark = buildWordmark({ env, width: 3.2 }); this.wordmark.visible = false; world.add(this.wordmark);
    this.endCard = this.buildEndCard(); this.endCard.visible = false; world.add(this.endCard);
    // ---- captions ----
    const mk = (o) => cap.make(o);
    this.caps = {
      hook: mk({ en: 'Everything near you.', am: 'ሁሉም ነገር በአቅራቢያዎ', y: 0.30 }),
      prob1: mk({ en: 'The shop is right there.', y: 0.30 }),
      prob2: mk({ en: "You still can't find it.", y: 0.30, color: CSS.coral }),
      cust: mk({ en: 'Find it. Near you.', am: 'በአቅራቢያዎ ያግኙት', y: 0.29 }),
      merch: mk({ en: 'Your shop. Online.', am: 'ሱቅዎ በመስመር ላይ', y: 0.29 }),
      ride: mk({ en: 'Ordered. Moving. Delivered.', am: 'ታዘዘ። እየመጣ ነው። ደረሰ።', y: 0.29 }),
      dias: mk({ en: 'Send it home. From anywhere.', am: 'ወደ ቤት ይላኩ', y: 0.29 }),
      tag1: mk({ en: 'Everything near you.', am: 'ሁሉም ነገር በአቅራቢያዎ', y: 0.255, size: 0.78 }),
      tag2: mk({ en: 'Built for Ethiopia.\nBuilt for you.', am: 'ለኢትዮጵያ የተሰራ። ለእርስዎ የተሰራ።', y: 0.255, size: 0.78 }),
      soon: mk({ en: 'Coming soon', am: 'በቅርቡ ይመጣል', style: 'pill', y: 0.20, accent: CSS.coral, width: 0.6 }),
      plannedRide: mk({ en: 'Planned', am: 'የታቀደ', style: 'pill', width: 0.5 }),
      plannedDias: mk({ en: 'Planned', am: 'የታቀደ', style: 'pill', width: 0.5 }),
      illM: mk({ en: 'Illustration', am: 'ምሳሌያዊ ምስል', style: 'chip', width: 0.5 }),
      illF: mk({ en: 'Illustration', am: 'ምሳሌያዊ ምስል', style: 'chip', width: 0.5 }),
      segC: mk({ en: 'Customers', style: 'pill', width: 0.5, accent: CSS.teal }),
      segM: mk({ en: 'Merchants', style: 'pill', width: 0.5, accent: CSS.coral }),
      segR: mk({ en: 'Delivery', style: 'pill', width: 0.5, accent: CSS.teal }),
      segD: mk({ en: 'Diaspora', style: 'pill', width: 0.5, accent: CSS.coral }),
    };
    this.caps.plannedRide.follow = this.icons.ride; this.caps.plannedRide.followOffset = V3(0, -1.25, 0);
    this.caps.plannedDias.follow = this.icons.diaspora; this.caps.plannedDias.followOffset = V3(0, -1.25, 0);
    this.caps.illM.follow = this.merchant.group; this.caps.illM.followOffset = V3(0, -this.merchant.h / 2 - 0.25, 0);
    this.caps.illF.follow = this.family.group; this.caps.illF.followOffset = V3(0, -this.family.h / 2 - 0.25, 0);
    this.caps.segC.follow = this.icons.customers; this.caps.segC.followOffset = V3(0, -1.25, 0);
    this.caps.segM.follow = this.icons.merchants; this.caps.segM.followOffset = V3(0, -1.25, 0);
    this.caps.segR.follow = this.icons.ride; this.caps.segR.followOffset = V3(0, 1.2, 0);
    this.caps.segD.follow = this.icons.diaspora; this.caps.segD.followOffset = V3(0, 1.2, 0);
    // ---- camera rig state (tweened) ----
    this.cam = { x: 0, y: 4, z: 30, tx: 0, ty: 3, tz: 0, fov: 40, roll: 0, shake: 0, hand: 1, follow: 0, ox: 3, oy: 6, oz: 5, focus: 24, range: 10, maxBlur: 0.25, mblur: 0.3, bloom: 0.2, exposure: 0.86, fog: 0.028, lift: 0 };
    this.fx = { keyI: 2.2, rimI: 40, fillI: 30, rimAngle: 0, partI: 1, shaftI: 1, lightPulse: 1 };
  }

  buildGlobe(env) {
    const g = new THREE.Group(); const R = 5.2;
    // dark ocean sphere + graticule + dotted land bands (data-globe motif; no third-party map)
    const ocean = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), new THREE.MeshPhysicalMaterial({ color: 0x0b1a22, roughness: 0.55, metalness: 0.1, envMap: env, envMapIntensity: 0.6, emissive: 0x06141a, transparent: true, opacity: 0.96 })); g.add(ocean);
    const grat = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(R + 0.01, 24, 12)), new THREE.LineBasicMaterial({ color: C.teal, transparent: true, opacity: 0.12 })); g.add(grat);
    const dots = []; const rr = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < 2600; i++) { const lat = Math.asin(rr(i) * 2 - 1), lon = rr(i + 7000) * Math.PI * 2; const landish = Math.abs(Math.sin(lat * 2.1 + lon * 0.9) * Math.cos(lon * 1.7 - lat)) > 0.55 && Math.abs(lat) < 1.2; if (!landish) continue; dots.push(Math.cos(lat) * Math.cos(lon) * (R + 0.03), Math.sin(lat) * (R + 0.03), Math.cos(lat) * Math.sin(lon) * (R + 0.03)); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
    g.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: C.mint, size: 0.06, transparent: true, opacity: 0.7, sizeAttenuation: true })));
    // atmosphere rim
    const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 48, 32), new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide, uniforms: { uCol: { value: new THREE.Color(C.teal) } }, vertexShader: `varying vec3 vN, vV; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`, fragmentShader: `uniform vec3 uCol; varying vec3 vN, vV; void main(){ float f = pow(1.0 - clamp(dot(-vN, vV), 0.0, 1.0), 3.5); gl_FragColor = vec4(uCol * f * 1.6, f); }` })); g.add(atm);
    // city anchors: Addis Ababa (9.0N, 38.7E) and a diaspora city (Washington DC 38.9N, 77.0W)
    const toV = (latD, lonD, r = R) => { const lat = latD * Math.PI / 180, lon = -lonD * Math.PI / 180; return V3(Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.sin(lon) * r); };
    const addis = toV(9.0, 38.7), dc = toV(38.9, -77.0);
    const mk = (p, col) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: col })); m.position.copy(p); g.add(m); const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.32, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); ring.position.copy(p).multiplyScalar(1.005); ring.lookAt(p.clone().multiplyScalar(2)); g.add(ring); return { m, ring }; };
    const aM = mk(addis, C.coral), dM = mk(dc, C.teal);
    // great-circle-ish arc lifted above the surface
    const mid = addis.clone().add(dc).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.55);
    const curve = new THREE.QuadraticBezierCurve3(dc, mid, addis);
    const arc = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.05, 8, false), new THREE.MeshBasicMaterial({ color: 0xffffff })); arc.geometry.setDrawRange(0, 0); g.add(arc);
    const arcGlow = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.16, 8, false), new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); arcGlow.geometry.setDrawRange(0, 0); g.add(arcGlow);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); head.visible = false; g.add(head);
    const headLight = new THREE.PointLight(C.tealBright, 0, 8, 1.8); g.add(headLight);
    const state = { arc: 0, addisPulse: 0 };
    const total = arc.geometry.index.count;
    function update(t) { const k = clamp(state.arc); arc.geometry.setDrawRange(0, Math.floor(total * k)); arcGlow.geometry.setDrawRange(0, Math.floor(arcGlow.geometry.index.count * k)); head.visible = k > 0 && k < 1; if (head.visible) { head.position.copy(curve.getPoint(k)); headLight.position.copy(head.position); headLight.intensity = 6; } else headLight.intensity = 0; aM.ring.scale.setScalar(1 + state.addisPulse * 2.5); aM.ring.material.opacity = 0.7 * (1 - state.addisPulse); grat.rotation.y = t * 0.02; }
    return { group: g, ocean, state, update, addis, dc, curve, aM, dM };
  }

  buildEndCard() {
    const g = new THREE.Group();
    const { ctx, tex } = canvasTex(1024, 160);
    const draw = () => { ctx.clearRect(0, 0, 1024, 160); const pills = [['Android', 'Coming soon'], ['iOS', 'Coming soon']]; let x = 120; pills.forEach(([a, b]) => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(ctx, x, 30, 380, 100, 50); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = font(700, 36); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(a, x + 36, 80); ctx.fillStyle = CSS.mint; ctx.font = font(500, 24); ctx.fillText(b, x + 212, 80); x += 420; }); tex.needsUpdate = true; };
    draw();
    const row = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.5625), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); g.add(row);
    const { ctx: c2, tex: t2 } = canvasTex(1024, 96); c2.fillStyle = 'rgba(255,255,255,0.7)'; c2.font = font(500, 34); c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('ZAYA App PLC · Addis Ababa, Ethiopia', 512, 48); t2.needsUpdate = true;
    const foot = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.3375), new THREE.MeshBasicMaterial({ map: t2, transparent: true })); foot.position.y = -0.6; g.add(foot);
    g.userData = { row, foot };
    return g;
  }

  // ------------------------------------------------------------------ MASTER TIMELINE
  timeline() {
    const tl = this.tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    const cam = this.cam, fx = this.fx, caps = this.caps, W = this.world;
    const cu = this.city.uniforms, gu = this.ground.uniforms;
    const capIn = (c, at, dur = 0.7, hold = 2.6, opts = {}) => { c.state.z = -3.2; tl.to(c.state, { z: 0, opacity: 1, reveal: 1, duration: dur, ease: 'expo.out' }, at); tl.to(c.state, { z: 1.4, opacity: 0, duration: 0.45, ease: 'power3.in' }, at + hold); tl.set(c.state, { reveal: 0, z: -3.2 }, at + hold + 0.5); };
    const pillIn = (c, at, hold) => { c.state.scale = 0.001; tl.to(c.state, { scale: 1, opacity: 1, reveal: 1, duration: 0.55, ease: 'back.out(2.2)' }, at); if (hold) tl.to(c.state, { scale: 0.6, opacity: 0, duration: 0.35, ease: 'power2.in' }, at + hold); };
    const iconLand = (icon, at, from, to, spin = 0, s = 1) => { icon.position.copy(from); icon.scale.setScalar(0.001);
      tl.set(icon, { visible: true }, at); tl.to(icon.position, { x: to.x, y: to.y, z: to.z, duration: 0.7, ease: 'power4.in' }, at);
      tl.fromTo(icon.scale, { x: 0.35 * s, y: 0.35 * s, z: 0.35 * s }, { x: s, y: s, z: s, duration: 0.9, ease: 'elastic.out(1, 0.45)' }, at + 0.55);
      tl.fromTo(icon.rotation, { y: spin, x: -0.6 }, { y: 0, x: 0, duration: 1.1, ease: 'back.out(1.6)' }, at + 0.3);
      tl.fromTo(icon.userData.halo.material, { opacity: 0 }, { opacity: 0.22, duration: 0.25, ease: 'expo.out' }, at + 0.7); tl.to(icon.userData.halo.material, { opacity: 0.08, duration: 1.2 }, at + 0.95);
      tl.fromTo(icon.userData.shadow.material, { opacity: 0 }, { opacity: 0.55, duration: 0.3 }, at + 0.65);
      tl.to(cam, { shake: 0.35, duration: 0.05, ease: 'none' }, at + 0.7); tl.to(cam, { shake: 0, duration: 0.7, ease: 'power2.out' }, at + 0.75); };
    const glassIn = (panel, at, dur = 0.8) => { const u = panel.userData.uniforms; tl.set(panel, { visible: true }, at); tl.fromTo(u.uReveal, { value: 0 }, { value: 1, duration: dur, ease: 'expo.out' }, at); tl.fromTo(u.uEdgeI, { value: 4 }, { value: 1.6, duration: 1.2, ease: 'power2.out' }, at); };
    const glassOut = (panel, at, dur = 0.5) => { const u = panel.userData.uniforms; tl.to(u.uReveal, { value: 0, duration: dur, ease: 'power3.in' }, at); tl.set(panel, { visible: false }, at + dur + 0.01); };

    // ===== 0.0–3.0 HOOK =====
    cu.uAssembly.value = 0; cu.uWire.value = 0; this.logo.visible = false; this.logo.scale.setScalar(0.001);
    tl.set(cam, { x: 0, y: 4.2, z: 32, tx: 0, ty: 3.5, tz: 0, fov: 40, focus: 26, range: 12, hand: 0.6, exposure: 0.82 }, 0);
    tl.set(fx, { keyI: 0.3, rimI: 4, fillI: 4, partI: 0.0, shaftI: 0 }, 0);
    // streak rips through frame (bottom-left -> logo point)
    this.streak.position.set(-9, -1, 10); this.streak.scale.set(1, 1, 1);
    tl.set(this.streak.material, { opacity: 1 }, 0.0); tl.set(this.streakLight, { intensity: 60 }, 0.0); this.streakLight.position.set(-11, 0.5, 12); tl.to(this.streakLight.position, { x: 0, y: 6, z: 0, duration: 0.68, ease: 'power2.in' }, 0.0);
    tl.to(this.streak.position, { x: 0, y: 6, z: 0, duration: 0.68, ease: 'power2.in' }, 0.0);
    tl.to(this.streak.scale, { y: 10, x: 1.4, z: 1.4, duration: 0.5, ease: 'power2.in' }, 0.05); tl.to(this.streak.scale, { y: 0.2, duration: 0.15, ease: 'power4.out' }, 0.65);
    this.streakGlow.position.copy(this.streak.position); tl.set(this.streakGlow.material, { opacity: 0.9 }, 0); tl.to(this.streakGlow.position, { x: 0, y: 6, z: 0, duration: 0.68, ease: 'power2.in' }, 0.0); tl.fromTo(this.streakGlow.scale, { x: 1.5, y: 1.5 }, { x: 5, y: 5, duration: 0.68, ease: 'power2.in' }, 0); tl.to(this.streakGlow.material, { opacity: 0, duration: 0.2 }, 0.7);
    tl.to(this.streak.material, { opacity: 0, duration: 0.2 }, 0.72); tl.set(this.streakLight, { intensity: 0 }, 0.9);
    tl.to(fx, { partI: 1, duration: 0.6 }, 0.6);
    // impact flash + explosion into the wireframe city assembling in Z
    this.flash.position.set(0, 6, 0); tl.set(this.flash.material, { opacity: 1 }, 0.66); tl.set(this.flash.scale, { x: 0.5, y: 0.5 }, 0.66); tl.to(this.flash.scale, { x: 26, y: 26, duration: 0.55, ease: 'expo.out' }, 0.66); tl.to(this.flash.material, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.72);
    tl.to(cam, { shake: 0.9, duration: 0.04, ease: 'none' }, 0.66); tl.to(cam, { shake: 0, duration: 0.9, ease: 'power2.out' }, 0.7);
    tl.to(cu.uWire, { value: 1, duration: 0.2 }, 0.66); tl.to(cu.uAssembly, { value: 1, duration: 1.9, ease: 'power2.out' }, 0.7); tl.to(cu.uWire, { value: 0, duration: 0.9 }, 2.1);
    tl.to(fx, { keyI: 2.2, rimI: 40, fillI: 30, shaftI: 1, duration: 1.4 }, 0.9);
    tl.to(cam, { z: 19, y: 5.2, ty: 4.6, focus: 14, range: 8, duration: 2.6, ease: 'power2.inOut' }, 0.3);
    // logo forms from the shards
    tl.fromTo(this.shards.state, { progress: 0 }, { progress: 1, duration: 1.5, ease: 'power2.inOut' }, 0.75);
    tl.set(this.logo, { visible: true }, 1.7); tl.to(this.logo.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.8)' }, 1.75);
    tl.fromTo(this.logo.rotation, { y: -1.2 }, { y: 0, duration: 1.2, ease: 'power3.out' }, 1.75);
    capIn(caps.hook, 1.15, 0.7, 1.75);
    // ===== 3.0–7.0 THE PROBLEM: low fly-through, pins flicker dim =====
    this.pins.state.flicker = 1; this.pins.state.shock = -1;
    tl.to(cam, { x: -15, y: 1.25, z: 3.4, tx: -4, ty: 1.4, tz: 3.0, fov: 44, focus: 8, range: 5, hand: 1.2, duration: 1.1, ease: 'power3.inOut' }, 2.85);
    tl.to(cam, { x: 5.4, tx: 12, ty: 1.9, tz: 2.4, duration: 3.4, ease: 'power1.inOut' }, 3.95);
    tl.to(cam, { y: 1.6, duration: 3.4, ease: 'sine.inOut' }, 3.95);
    tl.to(fx, { keyI: 1.1, rimI: 22, fillI: 18, duration: 1.0 }, 3.0);
    capIn(caps.prob1, 3.75, 0.6, 1.15); capIn(caps.prob2, 5.45, 0.6, 1.2);
    tl.to(this.logo.position, { x: 0, y: 6, z: 0, duration: 0.1 }, 3.0);
    // ===== 7.0–8.0 THE SWITCH: the mark ignites; teal shockwave snaps every pin online =====
    tl.to(cam, { x: 9.0, y: 2.6, z: 3.2, tx: 0, ty: 5.8, tz: 0, fov: 42, focus: 10, range: 6, duration: 1.0, ease: 'power3.inOut' }, 6.45);
    const disc = this.logo.userData.disc.material, whiteM = this.logo.userData.white;
    tl.to(disc, { emissiveIntensity: 4.5, duration: 0.18, ease: 'expo.out' }, 7.0); tl.to(disc, { emissiveIntensity: 0.6, duration: 1.0 }, 7.2);
    tl.fromTo(whiteM, { emissiveIntensity: 0 }, { emissiveIntensity: 1.2, duration: 0.15 }, 7.0); tl.to(whiteM, { emissiveIntensity: 0.1, duration: 0.9 }, 7.15);
    this.flash.position.set(0, 6, 0); tl.set(this.flash.material, { opacity: 0.9 }, 7.0); tl.set(this.flash.scale, { x: 2, y: 2 }, 7.0); tl.to(this.flash.scale, { x: 22, y: 22, duration: 0.6, ease: 'expo.out' }, 7.0); tl.to(this.flash.material, { opacity: 0, duration: 0.55 }, 7.05);
    tl.set(gu.uShockI, { value: 1 }, 7.0); tl.fromTo(gu.uShock, { value: 0 }, { value: 60, duration: 2.2, ease: 'power1.out' }, 7.0); tl.to(gu.uShockI, { value: 0, duration: 0.8 }, 8.6);
    tl.fromTo(this.pins.state, { shock: -1 }, { shock: 60, duration: 2.2, ease: 'power1.out' }, 7.0); tl.set(this.pins.state, { allOn: 1 }, 9.2);
    tl.to(cam, { shake: 0.7, duration: 0.05, ease: 'none' }, 7.0); tl.to(cam, { shake: 0, duration: 0.8, ease: 'power2.out' }, 7.05);
    tl.to(fx, { keyI: 2.4, rimI: 46, fillI: 40, partI: 1.4, duration: 0.6 }, 7.0);
    tl.to(this.logo.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.25, ease: 'back.out(3)' }, 7.0); tl.to(this.logo.scale, { x: 1, y: 1, z: 1, duration: 0.6 }, 7.3);
    tl.to(this.logo.rotation, { y: Math.PI * 2, duration: 1.2, ease: 'power2.inOut' }, 7.0);
    // ===== 8.0–16.0 CUSTOMERS =====
    const A = this.woman.group.position;
    tl.to(cam, { x: 8.9, y: 1.9, z: 10.4, tx: 8.9, ty: 2.1, tz: 3.0, fov: 46, focus: 7.4, range: 3.4, hand: 0.9, duration: 1.4, ease: 'power3.inOut' }, 7.9);
    tl.to(this.logo.position, { x: 9, y: 11, z: -34, duration: 1.4 }, 8.0); // the mark drifts to the sky behind the stage
    iconLand(this.icons.customers, 8.1, V3(7.7, 9, 3.2), V3(7.7, 3.75, 3.2), -1.4, 0.62);
    pillIn(caps.segC, 9.0, 2.0);
    tl.to(this.woman.state, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 8.6);
    tl.to(this.woman.state, { phone: 1, duration: 0.5 }, 9.3);
    // the phone's UI leaves the device: the glass panel grows out of the phone and floats beside her
    const phoneW = A.clone().add(this.woman.phoneAnchor);
    this.panel.position.copy(phoneW); this.panel.scale.setScalar(0.12); this.panel.rotation.set(0, -0.3, -0.12);
    glassIn(this.panel, 9.7, 0.9);
    tl.to(this.panel.position, { x: 9.72, y: 2.55, z: 4.4, duration: 1.1, ease: 'expo.out' }, 9.75);
    tl.to(this.panel.scale, { x: 0.46, y: 0.46, z: 0.46, duration: 1.1, ease: 'expo.out' }, 9.75);
    tl.to(this.panel.rotation, { y: -0.35, z: 0, duration: 1.1, ease: 'expo.out' }, 9.75);
    tl.fromTo(this.uiC.state = { typed: 0, results: 0, price: 0 }, { typed: 0 }, { typed: 1, duration: 0.9, ease: 'none' }, 10.4);
    tl.to(this.uiC.state, { results: 1, duration: 1.5, ease: 'power2.out' }, 11.2);
    tl.to(this.uiC.state, { price: 1, duration: 0.6, ease: 'back.out(2)' }, 12.7);
    tl.to(cam, { focus: 6.0, range: 2.0, duration: 0.9 }, 10.6); // rack focus to the panel
    tl.to(cam, { x: 9.4, z: 9.6, tx: 9.2, ty: 2.15, duration: 4.6, ease: 'sine.inOut' }, 10.4);
    tl.to(cam, { focus: 6.8, range: 3.2, duration: 0.8 }, 13.6);
    this.orbitPins.forEach((p, i) => { tl.to(p.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(2.5)' }, 10.9 + i * 0.25); });
    tl.to(this.woman.state, { look: 1, duration: 0.8 }, 11.0); tl.to(this.woman.state, { look: 0, duration: 1.2 }, 13.4);
    capIn(caps.cust, 12.45, 0.7, 2.9);
    tl.to(fx, { rimAngle: 1.2, duration: 6 }, 9.0);
    // ===== 16.0–24.0 MERCHANTS (match-cut: her panel folds into the merchant dashboard) =====
    const B = this.merchant.group.position;
    tl.to(this.panel.rotation, { y: -Math.PI / 2 - 0.42, duration: 0.55, ease: 'power3.in' }, 15.55);
    tl.call(() => { this.panel.userData.uniforms.tUI.value = this.uiM.tex; this.panel.userData.uniforms.uEdge.value.set(C.coral); }, null, 16.1);
    tl.fromTo(this.panel.rotation, { y: Math.PI / 2 + 0.3 }, { y: 0.22, duration: 0.8, ease: 'power3.out' }, 16.12);
    tl.to(this.panel.position, { x: 8.42, y: 1.55, z: -8.6, duration: 1.3, ease: 'power3.inOut' }, 15.55);
    tl.to(this.panel.scale, { x: 0.36, y: 0.36, z: 0.36, duration: 1.3 }, 15.55);
    tl.to(cam, { x: 8.9, y: 2.2, z: -3.0, tx: 8.95, ty: 1.95, tz: -9.2, fov: 48, focus: 6.2, range: 3.0, duration: 1.6, ease: 'power3.inOut' }, 15.4);
    tl.to(this.woman.state, { opacity: 0, duration: 0.6 }, 15.6); this.orbitPins.forEach((p) => tl.to(p.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, ease: 'power3.in' }, 15.5));
    tl.to(this.icons.customers.position, { x: 6.0, y: 7.5, z: -6, duration: 1.2, ease: 'power3.inOut' }, 15.5); tl.to(this.icons.customers.scale, { x: 0.35, y: 0.35, z: 0.35, duration: 1.0 }, 15.6);
    tl.to(this.merchant.state, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 16.4);
    pillIn(caps.illM, 16.9, 6.3);
    iconLand(this.icons.merchants, 16.3, V3(9.7, 9, -8.8), V3(9.7, 3.85, -8.8), 1.2, 0.55);
    pillIn(caps.segM, 17.2, 2.0);
    tl.fromTo(this.inv.state, { progress: 0 }, { progress: 1, duration: 2.6, ease: 'power1.inOut' }, 17.0);
    this.uiM.state = { sales: 0, products: 0, chips: 0, orders: 0 };
    tl.to(this.uiM.state, { chips: 1, duration: 1.2, ease: 'power2.out' }, 16.9);
    tl.to(this.uiM.state, { sales: 1, duration: 2.2, ease: 'power2.out' }, 17.4);
    tl.to(this.uiM.state, { products: 1, duration: 2.0, ease: 'power2.out' }, 18.2);
    tl.to(this.uiM.state, { orders: 1, duration: 0.8, ease: 'power2.out' }, 19.6);
    this.chips.forEach((c, i) => { const to = V3(8.55, 3.55 - i * 0.3, -8.4); c.scale.setScalar(0.42); c.position.set(3 - i * 2, 6 + i, -4); c.rotation.set(0, -0.5, 0.3);
      tl.set(c, { visible: true }, 20.3 + i * 0.3); tl.to(c.position, { x: to.x, y: to.y, z: to.z, duration: 0.8, ease: 'back.out(1.4)' }, 20.3 + i * 0.3); tl.to(c.rotation, { x: 0, y: 0.22, z: 0, duration: 0.8, ease: 'back.out(1.4)' }, 20.3 + i * 0.3);
      tl.to(cam, { shake: 0.12, duration: 0.05, ease: 'none' }, 21.05 + i * 0.3); tl.to(cam, { shake: 0, duration: 0.4 }, 21.1 + i * 0.3); });
    tl.to(cam, { x: 9.1, z: -3.4, tx: 8.9, focus: 5.8, range: 2.8, duration: 5.5, ease: 'sine.inOut' }, 17.0);
    tl.to(cam, { focus: 4.2, range: 1.8, duration: 0.8 }, 20.4); tl.to(cam, { focus: 6.0, range: 2.8, duration: 0.8 }, 22.3);
    capIn(caps.merch, 18.7, 0.7, 3.4);
    tl.to(fx, { rimAngle: 2.6, duration: 7 }, 16.0);
    // ===== 24.0–32.0 DELIVERY (Planned): shelves fold into the road; route draws; package travels =====
    tl.to(this.merchant.state, { opacity: 0, duration: 0.5 }, 23.3); tl.to(this.panel.userData.uniforms.uReveal, { value: 0, duration: 0.45, ease: 'power3.in' }, 23.3); tl.set(this.panel, { visible: false }, 23.8);
    this.chips.forEach((c, i) => { tl.to(c.position, { y: 0.2, x: 9, z: -7.4 + i * 0.3, duration: 0.6, ease: 'power3.in' }, 23.3 + i * 0.08); tl.set(c, { visible: false }, 23.95 + i * 0.08); });
    tl.set(cam, { ox: 3.0, oy: 13.5, oz: 4.5 }, 23.4); tl.to(cam, { follow: 1, duration: 1.4, ease: 'power3.inOut' }, 23.6); tl.to(cam, { ox: 2.2, oy: 12.0, oz: 3.6, duration: 5.0, ease: 'sine.inOut' }, 25.4); tl.to(cam, { follow: 0, duration: 1.4, ease: 'power3.inOut' }, 31.3);
    this.inv.blocks.forEach((b, i) => { const p = this.routeCurve.getPoint(clamp(i / this.inv.blocks.length)); tl.to(b.position, { x: p.x - this.inv.group.position.x, y: 0.2, z: p.z - this.inv.group.position.z, duration: 0.7, ease: 'power3.in' }, 23.4 + i * 0.03); tl.to(b.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.25, ease: 'power3.in' }, 24.1 + i * 0.03); });
    tl.to(this.inv.shelf.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, ease: 'power3.in' }, 23.8);
    tl.to(this.icons.merchants.position, { x: 4, y: 7.5, z: -10, duration: 1.2, ease: 'power3.inOut' }, 23.4); tl.to(this.icons.merchants.scale, { x: 0.35, y: 0.35, z: 0.35, duration: 1.0 }, 23.5);
    tl.to(cam, { x: 12.4, y: 6.4, z: -1.8, tx: 9, ty: 0.3, tz: -7.4, fov: 44, focus: 9.0, range: 4, hand: 1.0, duration: 1.4, ease: 'power3.inOut' }, 23.4);
    iconLand(this.icons.ride, 24.15, V3(7.8, 9, -7.0), V3(7.8, 2.6, -7.0), 3.5, 0.6);
    pillIn(caps.plannedRide, 25.0, 6.4); pillIn(caps.segR, 25.0, 2.0);
    const routeState = this.routeState = { k: 0 };
    tl.to(routeState, { k: 1, duration: 3.6, ease: 'power1.inOut' }, 24.5);
    tl.set(this.pkg, { visible: true }, 25.0); const pkgState = this.pkgState = { k: 0 }; tl.to(pkgState, { k: 1, duration: 4.4, ease: 'power1.inOut' }, 25.1);
    tl.set(this.door, { visible: true }, 24.0); tl.to(this.doorLight, { intensity: 4, duration: 1.0 }, 27.5);
    tl.to(this.doorWoman.state, { opacity: 1, duration: 0.8 }, 27.6);
    this.orderPanel.position.set(7.6, 2.6, -5.6); this.orderPanel.rotation.set(-0.35, 0.35, 0); this.orderPanel.scale.setScalar(0.85);
    glassIn(this.orderPanel, 25.3, 0.8); this.uiO.state = { step: 0 };
    tl.to(this.uiO.state, { step: 1, duration: 0.5, ease: 'back.out(2)' }, 26.0); tl.to(this.uiO.state, { step: 2, duration: 0.5, ease: 'back.out(2)' }, 27.5); tl.to(this.uiO.state, { step: 3, duration: 0.6, ease: 'back.out(2)' }, 29.55);
    // the camera is a crane locked to the package (see applyCamera); then it lets go for the pull-back
    tl.set(cam, { x: -0.5, y: 5.2, z: 12.8, tx: -3, ty: 1.0, tz: 8.6, fov: 42 }, 31.2);
    capIn(caps.ride, 26.2, 0.7, 3.4);
    tl.to(this.pkgHalo.material, { opacity: 0, duration: 0.3 }, 29.5);
    tl.to(fx, { rimAngle: 4.2, duration: 8 }, 24.0);
    // ===== 32.0–40.0 DIASPORA (Planned): pull back hard to the orbiting globe =====
    glassOut(this.orderPanel, 30.6, 0.5);
    tl.to(this.doorWoman.state, { opacity: 0, duration: 0.5 }, 31.2); tl.to(this.doorLight, { intensity: 0, duration: 0.6 }, 31.2);
    tl.to(this.icons.ride.position, { x: -6, y: 9, z: -4, duration: 1.4, ease: 'power3.inOut' }, 31.4); tl.to(this.icons.ride.scale, { x: 0.35, y: 0.35, z: 0.35, duration: 1.0 }, 31.5);
    tl.to(cam, { x: 0, y: 24, z: 36, tx: 0, ty: 15.6, tz: 0, fov: 40, focus: 34, range: 14, hand: 0.5, fog: 0.014, lift: 1, duration: 2.4, ease: 'power3.inOut' }, 31.4);
    tl.set(this.globe.group, { visible: true }, 31.9); tl.fromTo(this.globe.group.scale, { x: 0.05, y: 0.05, z: 0.05 }, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'expo.out' }, 31.9);
    tl.fromTo(this.globe.group.rotation, { y: -0.9 }, { y: 0.35, duration: 8.5, ease: 'sine.inOut' }, 31.9);
    // the route's last waypoint keeps travelling: the arc launches from the diaspora city and lands on Addis
    tl.to(this.globe.state, { arc: 1, duration: 2.0, ease: 'power2.inOut' }, 33.6);
    tl.fromTo(this.globe.state, { addisPulse: 0 }, { addisPulse: 1, duration: 1.1, ease: 'power2.out' }, 35.5);
    tl.to(cam, { shake: 0.25, duration: 0.05, ease: 'none' }, 35.55); tl.to(cam, { shake: 0, duration: 0.6 }, 35.6);
    iconLand(this.icons.diaspora, 32.6, V3(-3.9, 26, 4.4), V3(-3.9, 19.9, 4.4), -2.5, 0.9);
    pillIn(caps.plannedDias, 33.5, 6.0); pillIn(caps.segD, 33.5, 2.0);
    tl.to(this.family.state, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 35.7); pillIn(caps.illF, 36.3, 3.6);
    tl.fromTo(this.family.group.position, { y: 13.0 }, { y: 14.2, duration: 1.2, ease: 'expo.out' }, 35.7);
    this.basketPanel.position.set(-2.55, 15.0, 5.2); this.basketPanel.rotation.set(0, 0.35, 0); this.basketPanel.scale.setScalar(0.55);
    glassIn(this.basketPanel, 34.2, 0.8); this.uiD.state = { reveal: 0, sent: 0 }; tl.to(this.uiD.state, { reveal: 1, duration: 1.4, ease: 'power2.out' }, 34.5); tl.to(this.uiD.state, { sent: 1, duration: 0.6, ease: 'back.out(2)' }, 36.0);
    tl.to(cam, { x: 2, y: 21, z: 30, tx: 0.4, ty: 16.0, focus: 28, range: 10, duration: 6.0, ease: 'sine.inOut' }, 33.8);
    capIn(caps.dias, 36.45, 0.7, 3.1);
    tl.to(fx, { rimAngle: 5.8, keyI: 2.0, duration: 8 }, 32.0);
    // ===== 40.0–45.0 RESOLVE: the four icons converge into a diamond around the mark =====
    tl.to(this.family.state, { opacity: 0, duration: 0.5 }, 39.5); glassOut(this.basketPanel, 39.4, 0.5);
    tl.to(this.globe.group.scale, { x: 0.02, y: 0.02, z: 0.02, duration: 0.9, ease: 'power3.in' }, 39.9); tl.to(this.globe.group.position, { x: 0, y: 26, z: 0, duration: 0.9, ease: 'power3.in' }, 39.9); tl.set(this.globe.group, { visible: false }, 40.85);
    tl.to(cam, { x: 0, y: 26, z: 16.6, tx: 0, ty: 26, tz: 0, fov: 40, focus: 16.6, range: 7, hand: 0.35, fog: 0.008, duration: 1.6, ease: 'power3.inOut' }, 39.7);
    this.logo.rotation.y = 0; tl.to(this.logo.position, { x: 0, y: 27.9, z: 0, duration: 1.0, ease: 'power3.inOut' }, 39.9); tl.set(this.logo.scale, { x: 0.001, y: 0.001, z: 0.001 }, 39.9);
    tl.to(this.logo.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1.1, ease: 'back.out(1.6)' }, 40.75); tl.fromTo(this.logo.rotation, { y: -Math.PI * 0.75 }, { y: 0, duration: 1.4, ease: 'power3.out' }, 40.75);
    tl.set(this.tile, { visible: true }, 40.7); tl.fromTo(this.tile.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'back.out(1.2)' }, 40.9);
    tl.to(disc, { emissiveIntensity: 2.2, duration: 0.3 }, 41.2); tl.to(disc, { emissiveIntensity: 0.5, duration: 1.2 }, 41.5);
    // rim-lit reveal: the key light sweeps around the mark; anamorphic flare crosses
    tl.to(fx, { rimAngle: 9.2, keyI: 1.7, rimI: 30, fillI: 22, duration: 1.4 }, 40.7);
    this.anamorphic.position.set(0, 28.2, 0.6); tl.set(this.anamorphic.scale, { x: 0.5, y: 0.5 }, 41.2); tl.to(this.anamorphic.material, { opacity: 0.9, duration: 0.25 }, 41.2); tl.to(this.anamorphic.scale, { x: 16, y: 1.2, duration: 0.9, ease: 'expo.out' }, 41.2); tl.to(this.anamorphic.material, { opacity: 0, duration: 0.9 }, 41.6);
    this.flash.position.set(0, 28.2, 0.6); tl.set(this.flash.material, { opacity: 0.6 }, 41.2); tl.set(this.flash.scale, { x: 1, y: 1 }, 41.2); tl.to(this.flash.scale, { x: 10, y: 10, duration: 0.7, ease: 'expo.out' }, 41.2); tl.to(this.flash.material, { opacity: 0, duration: 0.7 }, 41.3);
    const diamond = { customers: V3(0, 30.4, 0.3), merchants: V3(2.55, 27.9, 0.3), ride: V3(0, 25.7, 0.3), diaspora: V3(-2.55, 27.9, 0.3) };
    Object.entries(diamond).forEach(([k, p], i) => { const ic = this.icons[k]; tl.to(ic.position, { x: p.x, y: p.y, z: p.z, duration: 1.4, ease: 'power3.inOut' }, 40.0 + i * 0.1); tl.to(ic.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 1.2, ease: 'back.out(1.5)' }, 40.4 + i * 0.1); tl.to(ic.rotation, { y: Math.PI * 2, duration: 1.4, ease: 'power2.inOut' }, 40.0 + i * 0.1); tl.to(ic.userData.halo.material, { opacity: 0.2, duration: 0.5 }, 41.0); });
    capIn(caps.tag1, 41.5, 0.7, 1.1); capIn(caps.tag2, 43.1, 0.7, 2.6);
    // end card: wordmark under the mark, app row, coming soon — hold from 43.8
    this.wordmark.position.set(0, 24.6, 0.6); tl.set(this.wordmark, { visible: true }, 42.3); tl.fromTo(this.wordmark.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 0.6, y: 0.6, z: 0.6, duration: 0.9, ease: 'back.out(1.5)' }, 42.3);
    this.endCard.position.set(0, 22.4, 0.6); this.endCard.userData.foot.visible = false; tl.set(this.endCard, { visible: true }, 43.4); tl.fromTo(this.endCard.scale, { x: 0.8, y: 0.8, z: 0.8 }, { x: 0.9, y: 0.9, z: 0.9, duration: 0.8, ease: 'expo.out' }, 43.4); tl.fromTo(this.endCard.userData.row.material, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 43.4);
    tl.to(cam, { z: 15.5, duration: 3.0, ease: 'sine.inOut' }, 42.0);
    tl.to({}, { duration: 0.01 }, 44.99); // pin the timeline end at 45.0
  }

  // ------------------------------------------------------------------ PER-FRAME STATE
  applyCamera(t) {
    const c = this.cam, cam = this.camera;
    const h = c.hand; const n = (s) => fbm1(t * 0.9, s) * 0.035 * h + fbm1(t * 3.1, s + 50) * 0.008 * h;
    const shake = c.shake * Math.sin(t * 61) * 0.25;
    const pos = V3(c.x, c.y, c.z), target = V3(c.tx, c.ty, c.tz);
    if (c.follow > 0 && this.pkgState) { const p = this.routeCurve.getPoint(clamp(this.pkgState.k)); const fp = p.clone().add(V3(c.ox, c.oy, c.oz)); pos.lerp(fp, c.follow); target.lerp(V3(p.x, p.y + 0.3, p.z), c.follow); this.followFocus = fp.distanceTo(p); }
    pos.add(V3(n(1) + shake, n(2) + shake * 0.6, n(3))); cam.position.copy(pos);
    cam.lookAt(target); cam.rotateZ(c.roll + fbm1(t * 0.5, 9) * 0.01 * h + shake * 0.5); cam.rotateY(fbm1(t * 0.7, 11) * 0.012 * h); cam.rotateX(fbm1(t * 0.65, 12) * 0.01 * h);
    cam.fov = c.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  }
  applyState(t) {
    const c = this.cam, fx = this.fx, p = this.pipeline.params;
    p.focus = c.follow > 0.5 && this.followFocus ? this.followFocus : c.focus; p.range = c.follow > 0.5 ? 5.0 : c.range; p.maxBlur = c.maxBlur; p.mblur = c.mblur; p.bloom = c.bloom; p.exposure = c.exposure;
    this.world.fog.density = c.fog; this.ground.uniforms.fogDensity.value = c.fog; p.grain = 0.018; p.caAmount = 0.0018; p.distort = 0.02; p.vignette = 0.42; this.skyU.uTime.value = t; this.skyU.uLift.value = c.lift;
    // beat-synced light pulse (120 BPM) on the rim/fill lights and the glass edges
    const beat = 0.5 + 0.5 * Math.pow(Math.max(0, Math.cos((t % 0.5) / 0.5 * Math.PI * 2)), 3) ; const pulse = 1 + 0.18 * beat;
    this.key.intensity = fx.keyI * 0.6; const ka = 0.9 + fx.rimAngle * 0.5; this.key.position.set(Math.cos(ka) * 12, 14, Math.sin(ka) * 12).add(this.camera.position.clone().multiplyScalar(0.3)); this.key.target.position.copy(V3(c.tx, c.ty, c.tz)); this.key.target.updateMatrixWorld();
    const ra = fx.rimAngle; const tgt = V3(c.tx, c.ty, c.tz);
    this.rim.position.set(tgt.x + Math.cos(ra) * 5, tgt.y + 3.2, tgt.z + Math.sin(ra) * 5); this.rim.intensity = fx.rimI * 0.33 * pulse;
    this.fill.position.set(tgt.x - Math.cos(ra + 1.8) * 5, tgt.y + 1.5, tgt.z - Math.sin(ra + 1.8) * 5); this.fill.intensity = fx.fillI * 0.33 * (2 - pulse);
    this.rim.color.setHex(C.coral).lerp(new THREE.Color(C.teal), 0.5 - 0.5 * Math.cos(t * 0.8)); this.fill.color.setHex(C.teal).lerp(new THREE.Color(C.mint), 0.5 + 0.5 * Math.sin(t * 0.6));
    this.city.uniforms.uTime.value = t; this.ground.uniforms.uTime.value = t; this.particles.uniforms.uTime.value = t; this.particles.uniforms.uOpacity.value = fx.partI; this.shafts.uniforms.uTime.value = t; this.shafts.uniforms.uI.value = fx.shaftI;
    this.pins.update(t); this.shards.update(t); this.buses.update(t); this.buses.group.visible = this.city.uniforms.uAssembly.value > 0.9; this.signs.group.visible = this.city.uniforms.uAssembly.value > 0.6; this.woman.update(t); this.doorWoman.update(t); this.merchant.update(t); this.family.update(t); this.inv.update(t); this.globe.update(t);
    if (this.uiC.state) this.uiC.draw(this.uiC.state); if (this.uiM.state) this.uiM.draw(this.uiM.state); if (this.uiO.state) this.uiO.draw(this.uiO.state); if (this.uiD.state) this.uiD.draw(this.uiD.state);
    [this.panel, this.orderPanel, this.basketPanel].forEach((g) => { g.userData.uniforms.uTime.value = t; });
    // orbiting pins around the customer (3D orbit, tilted)
    this.orbit.rotation.y = t * 0.9; this.orbit.rotation.x = 0.35; this.orbitPins.forEach((pn, i) => { const a = i / this.orbitPins.length * Math.PI * 2; pn.position.set(Math.cos(a) * 1.55, 0.3 + Math.sin(a * 2 + t) * 0.25, Math.sin(a) * 1.55); pn.rotation.y = -t * 0.9; pn.children[1].scale.setScalar(1 + 0.25 * Math.max(0, Math.sin(t * 4 + i * 1.3))); });
    this.chips.forEach((c, i) => { if (c.visible) c.position.y += Math.sin(t * 2.2 + i) * 0.004; });
    // icons: idle float + slow turn
    Object.values(this.icons).forEach((ic, i) => { if (!ic.visible) return; ic.userData.tubes.rotation.y = Math.sin(t * 0.9 + i) * 0.5; ic.userData.tubes.rotation.x = Math.sin(t * 0.6 + i * 2.1) * 0.12; ic.userData.tubes.position.y = Math.sin(t * 1.6 + i * 1.7) * 0.08; ic.userData.halo.scale.setScalar(1 + 0.08 * Math.sin(t * 6.283 * 2 + i)); ic.userData.shadow.position.y = -ic.position.y + 0.02 - (ic.userData.tubes.position.y * 0.2); ic.userData.shadow.scale.setScalar(1 - ic.userData.tubes.position.y * 0.6); });
    this.logo.userData.rings.children.forEach((r, i) => { const k = ((t * 0.33 + i / 3) % 1); r.scale.setScalar(0.12 + 0.88 * k); r.material.opacity = 0.55 * Math.sin(k * Math.PI) * (this.logo.visible ? 1 : 0) * 0.5; });
    this.logo.userData.disc.scale.setScalar(1 + 0.04 * Math.sin(t * 2.1));
    // route draw + package travel
    if (this.routeState) { const n = Math.floor(this.route.geometry.index.count * this.routeState.k); this.route.geometry.setDrawRange(0, n); this.routeGlow.geometry.setDrawRange(0, Math.floor(this.routeGlow.geometry.index.count * this.routeState.k)); }
    if (this.pkgState && this.pkg.visible) { const k = clamp(this.pkgState.k); const pt = this.routeCurve.getPoint(k), tn = this.routeCurve.getTangent(Math.min(0.999, k)); this.pkg.position.copy(pt); this.pkg.position.y += 0.04 + Math.abs(Math.sin(t * 6)) * 0.05; this.pkg.rotation.y = Math.atan2(tn.x, tn.z); this.pkg.rotation.z = Math.sin(t * 6) * 0.06; this.pkgLight.position.copy(this.pkg.position).add(V3(0, 0.8, 0)); this.pkgLight.intensity = 5; this.pkgHalo.scale.setScalar(1 + 0.3 * Math.sin(t * 4)); if (k >= 1) { const w = clamp((this.tl.time() - 29.5) / 0.6); this.pkg.position.lerp(V3(-3.25, 1.05, 9.0), w); } }
    if (this.cam.follow > 0.5 && this.pkg.visible) { const p = this.pkg.position; this.orderPanel.position.set(p.x - 2.5, p.y + 1.8, p.z - 1.2); this.orderPanel.lookAt(this.camera.position); this.icons.ride.position.lerp(V3(p.x + 1.2, p.y + 3.4, p.z - 1.0), 0.9); }
    if (this.wordmark.visible) this.wordmark.rotation.y = Math.sin(t * 0.5) * 0.06;
    this.cap.update(this.camera);
  }
  seek(t) { this.tl.time(Math.min(t, this.duration - 1e-4), false); this.applyCamera(t); }
  renderFrame(t, dt) {
    this.seek(Math.max(0, t - dt)); const prevVP = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.seek(t); this.applyState(t);
    this.pipeline.render({ world: this.world, glass: this.glass, captions: this.cap.scene, camera: this.camera, capCamera: this.cap.camera, time: t, prevVP });
  }
}

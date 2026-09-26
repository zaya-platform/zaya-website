import {
  Scene, Group, WebGLRenderer, OrthographicCamera, HemisphereLight, DirectionalLight,
  Mesh, MeshStandardMaterial, MeshBasicMaterial, BoxGeometry, CylinderGeometry,
  TorusGeometry, SphereGeometry, TubeGeometry, QuadraticBezierCurve3, Vector3,
  Sprite, SpriteMaterial, TextureLoader, SRGBColorSpace,
  type BufferGeometry, type Material, type Texture,
} from 'three';

export type NetworkScene = {
  select: (index: number) => void;
  setRunning: (enabled: boolean) => void;
  projectNode: (index: number, out: { x: number; y: number }) => boolean;
  dispose: () => void;
};

/** Optional, local-only illustration. All product information and controls live in HTML. */
export function createNetworkScene(host: HTMLElement, stage: HTMLElement): NetworkScene {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) throw new Error('Use the static neighbourhood illustration.');
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  host.append(canvas);

  const scene = new Scene();
  const world = new Group();
  scene.add(world);
  const camera = new OrthographicCamera(-5, 5, 3.5, -3.5, .1, 60);
  camera.position.set(7, 7, 10);
  camera.lookAt(0, .2, 0);
  scene.add(new HemisphereLight(0xffffff, 0xb9cece, 2.6));
  const sun = new DirectionalLight(0xffffff, 3);
  sun.position.set(-4, 9, 6);
  scene.add(sun);
  const rim = new DirectionalLight(0x95dddd, 1.2);
  rim.position.set(5, 4, -5);
  scene.add(rim);

  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  const teal = token('--teal'), coral = token('--coral'), navy = token('--navy'), plum = token('--plum');
  const materials = new Set<Material>();
  const geometries = new Set<BufferGeometry>();
  const textures = new Set<Texture>();
  const material = (color: string | number, metalness = .02) => {
    const m = new MeshStandardMaterial({ color, roughness: .65, metalness });
    materials.add(m);
    return m;
  };
  const white = material(0xfafdfc), sea = material(teal), ink = material(navy), orange = material(coral), violet = material(plum);
  const pale = material(0xcfe8e3), ground = material(0xeef5f3);
  function mesh(geometry: BufferGeometry, m: Material, parent: Group, x: number, y: number, z: number) {
    geometries.add(geometry);
    const object = new Mesh(geometry, m);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  }
  function box(w: number, h: number, d: number, m: Material, parent: Group, x = 0, y = 0, z = 0) {
    return mesh(new BoxGeometry(w, h, d), m, parent, x, y, z);
  }
  function cylinder(r: number, h: number, m: Material, parent: Group, x = 0, y = 0, z = 0) {
    return mesh(new CylinderGeometry(r, r, h, 48), m, parent, x, y, z);
  }

  // A compact model of connections, deliberately not a live street map.
  cylinder(3.5, .12, pale, world, 0, -.28, 0);
  cylinder(3.44, .045, ground, world, 0, -.195, 0);
  const road = box(5.2, .018, .28, white, world, 0, -.16, 0);
  road.rotation.y = -.25;
  const road2 = box(.28, .019, 5.2, white, world, 0, -.15, 0);
  road2.rotation.y = -.25;
  // Quiet architectural blocks add scale without claiming actual locations.
  [[-1.5,-1.5,.6],[1.55,-1.5,.8],[-1.5,1.55,.4],[1.6,1.55,.5]].forEach(([x,z,h]) => {
    const district = new Group(); district.position.set(x, -.13, z); world.add(district);
    box(.37, h, .36, white, district, 0, h / 2, 0);
    box(.3, h * .65, .34, pale, district, .4, h * .325, .05);
    for (let i = 0; i < 2; i++) box(.08,.09,.012,sea,district,-.08+i*.16,h*.65,.185);
  });

  const hub = new Group(); world.add(hub);
  cylinder(.76,.18,sea,hub,0,.03,0);
  cylinder(.64,.06,white,hub,0,.15,0);
  const logoMaterial = new SpriteMaterial({ transparent: true, depthTest: true });
  materials.add(logoMaterial);
  const logo = new Sprite(logoMaterial);
  logo.position.set(0,1.1,0); logo.scale.set(1.35,1.35,1); hub.add(logo);

  let disposed = false;
  let running = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let selected = 0;
  let px = 0, py = 0, scrollDepth = 0;
  const loader = new TextureLoader();
  loader.load('/brand-icon.svg', texture => {
    if (disposed) { texture.dispose(); return; }
    textures.add(texture); texture.colorSpace = SRGBColorSpace;
    logoMaterial.map = texture; logoMaterial.needsUpdate = true;
    render();
  }, undefined, () => stage.dispatchEvent(new Event('zaya:scene-lost')));

  const positions = [new Vector3(-2.2,0,0),new Vector3(0,0,-2.2),new Vector3(0,0,2.2),new Vector3(2.2,0,0)];
  const colors = [teal,teal,coral,plum];
  const nodes: Group[] = [];
  const rings: Mesh[] = [];
  const selectionHalos: Mesh[] = [];
  const paths: QuadraticBezierCurve3[] = [];
  const pathMaterials: MeshBasicMaterial[] = [];
  const pulses: Mesh[] = [];
  const pulseMaterials: MeshBasicMaterial[] = [];
  positions.forEach((position,i) => {
    const node = new Group(); node.position.copy(position); world.add(node); nodes.push(node);
    cylinder(.59,.14,white,node,0,.01,0);
    const ring = mesh(new TorusGeometry(.6,.035,8,48),material(colors[i]),node,0,.1,0);
    ring.rotation.x = -Math.PI/2; rings.push(ring);
    // A grounded halo keeps the selected connection obvious while its model rises.
    const haloMaterial = new MeshBasicMaterial({ color: coral, transparent: true, opacity: .75 });
    materials.add(haloMaterial);
    const halo = mesh(new TorusGeometry(.78,.038,8,48),haloMaterial,world,position.x,-.115,position.z);
    halo.rotation.x = -Math.PI/2; selectionHalos.push(halo);
    const path = new QuadraticBezierCurve3(new Vector3(0,.21,0), new Vector3(position.x*.5,.45,position.z*.5), new Vector3(position.x,.12,position.z));
    paths.push(path);
    const pm = new MeshBasicMaterial({color: colors[i], transparent: true, opacity: .3});
    materials.add(pm); pathMaterials.push(pm);
    mesh(new TubeGeometry(path,24,.026,5,false),pm,world,0,0,0);
    // Every connection carries a calm travelling pulse; the selected path stays brighter and quicker.
    const pulseMaterial = new MeshBasicMaterial({color: colors[i], transparent: true, opacity: .38});
    materials.add(pulseMaterial); pulseMaterials.push(pulseMaterial);
    const pulse = mesh(new SphereGeometry(.085,10,8),pulseMaterial,world,0,0,0);
    pulses.push(pulse);
  });
  // Shopping bag, storefront, delivery parcel and globe: four distinct silhouettes.
  box(.62,.7,.38,sea,nodes[0],0,.49,0);
  const handle = mesh(new TorusGeometry(.17,.025,8,20,Math.PI),ink,nodes[0],0,.84,0);
  handle.rotation.z = 0;
  box(.86,.64,.57,white,nodes[1],0,.42,0);
  box(.96,.13,.71,sea,nodes[1],0,.8,.02);
  for(let i=0;i<5;i++) box(.105,.1,.72,i%2===0?white:sea,nodes[1],-.39+i*.195,.86,.02);
  box(.26,.36,.02,ink,nodes[1],-.16,.33,.3);
  box(.25,.25,.02,sea,nodes[1],.2,.45,.3);
  const parcel = box(.65,.58,.6,orange,nodes[2],0,.44,0);
  parcel.rotation.y = -.15;
  box(.13,.595,.61,white,nodes[2],0,.44,0).rotation.y = -.15;
  const globe = mesh(new SphereGeometry(.37,24,16),violet,nodes[3],0,.59,0);
  globe.rotation.z = -.3;
  const longitude = mesh(new TorusGeometry(.378,.018,8,40),white,nodes[3],0,.59,0);
  longitude.rotation.y = .8;
  const latitude = mesh(new TorusGeometry(.378,.018,8,40),white,nodes[3],0,.59,0);
  latitude.rotation.x = Math.PI/2;
  cylinder(.14,.28,ink,nodes[3],0,.25,0);

  function render() { if (!disposed) renderer.render(scene,camera); }
  function pose(time: number, animated: boolean) {
    // Pointer tilt stays within 5 degrees (px/py are clamped to [-1,1] by the stage size).
    world.rotation.y += ((animated ? px*.085 : 0)-world.rotation.y)*.07;
    world.rotation.x += ((animated ? py*.035 : 0)-world.rotation.x)*.07;
    // Scroll-linked camera drift: a subtle pan of the view, independent of the pointer tilt.
    const drift = animated ? scrollDepth : 0;
    camera.position.y += ((7 + drift*.28) - camera.position.y)*.06;
    camera.position.x += ((7 + drift*.16) - camera.position.x)*.06;
    nodes.forEach((node,i) => {
      const active = i===selected;
      const target = active ? .24 : 0;
      node.position.y = animated ? target + (active ? Math.sin(time*1.6)*.04 : 0) : target;
      const scale = active ? 1.22 : .94;
      node.scale.setScalar(scale);
      (rings[i].material as MeshStandardMaterial).color.set(active?coral:colors[i]);
      selectionHalos[i].visible = active;
      selectionHalos[i].scale.setScalar(animated && active ? 1 + Math.sin(time*1.6)*.035 : 1);
      pathMaterials[i].color.set(active ? coral : colors[i]);
      pathMaterials[i].opacity = active ? 1 : .14;
      pulseMaterials[i].color.set(active ? coral : colors[i]);
      pulseMaterials[i].opacity = animated ? (active ? 1 : .38) : .22;
      pulses[i].visible = true;
      pulses[i].position.copy(paths[i].getPoint(animated ? (active ? time*.22 : time*.12 + i*.27)%1 : .5));
    });
    logo.position.y = 1.1 + (animated ? Math.sin(time*1.5)*.045 : 0);
    logoMaterial.rotation = animated ? Math.sin(time*1.4)*.018 : 0;
  }
  function tick(now: number) {
    if (!running || disposed) return;
    const delta = Math.min((now-lastTime)/1000,.05); lastTime = now;
    elapsed += delta;
    pose(elapsed,true); render();
    frame = requestAnimationFrame(tick);
  }
  function setRunning(enabled: boolean) {
    if (disposed || running===enabled) return;
    running=enabled; cancelAnimationFrame(frame);
    if (enabled) { lastTime=performance.now(); frame=requestAnimationFrame(tick); }
    else { world.rotation.set(0,0,0); pose(elapsed,false); render(); }
  }
  function resize() {
    if(disposed) return;
    const {width,height}=host.getBoundingClientRect();
    if(!width||!height) return;
    const ratio=width/height;
    const halfHeight=Math.max(2.7,4.2/ratio);
    camera.left=-halfHeight*ratio; camera.right=halfHeight*ratio;
    camera.top=halfHeight; camera.bottom=-halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width,height,false); render();
  }
  function pointer(event: PointerEvent) {
    if (!running || event.pointerType==='touch') return;
    const b=stage.getBoundingClientRect();
    px=((event.clientX-b.left)/b.width-.5)*2;
    py=((event.clientY-b.top)/b.height-.5)*2;
    sun.position.x=-4+px*1.2;
  }
  function resetPointer() { px=0; py=0; }
  function scroll() {
    if(running) scrollDepth=Math.max(-1,Math.min(1,stage.getBoundingClientRect().top/window.innerHeight));
  }
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(host);
  stage.addEventListener('pointermove',pointer,{passive:true});
  stage.addEventListener('pointerleave',resetPointer);
  window.addEventListener('scroll',scroll,{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.dispatchEvent(new Event('zaya:scene-lost'));});
  pose(0,false); resize();
  const projected = new Vector3();
  return {
    select(index) { selected=index; pose(elapsed,running); render(); },
    setRunning,
    projectNode(index, out) {
      if (disposed) return false;
      projected.copy(nodes[index].position);
      projected.y += .85;
      projected.project(camera);
      out.x = (projected.x*.5+.5)*host.clientWidth;
      out.y = (-projected.y*.5+.5)*host.clientHeight;
      return projected.z < 1;
    },
    dispose() {
      if(disposed) return;
      disposed=true; running=false; cancelAnimationFrame(frame); resizeObserver.disconnect();
      stage.removeEventListener('pointermove',pointer); stage.removeEventListener('pointerleave',resetPointer);
      window.removeEventListener('scroll',scroll);
      geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose());
      renderer.dispose(); canvas.remove();
    },
  };
}

import type { NetworkScene } from './network-scene';

const root = document.querySelector<HTMLElement>('[data-neighbourhood]');
if (root) {
  const stage = root.querySelector<HTMLElement>('[data-network-stage]')!;
  const pause = root.querySelector<HTMLButtonElement>('[data-scene-motion]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const constrained = !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')
    || (deviceMemory !== undefined && deviceMemory <= 2)
    || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2);
  let scene: NetworkScene | undefined;
  let loading = false;
  let failed = false;
  let visible = false;
  let localPaused = false;
  let active = 0;

  // Scene tooltips: short benefits shown on hover/touch of a node and briefly when an
  // audience is selected (the keyboard path runs through the accessible header control).
  const tips = Array.from(root.querySelectorAll<HTMLElement>('[data-scene-tip]'));
  let tipTimer = 0;
  function positionTip(index: number) {
    if (!scene || !tips[index]) return;
    const point = { x: 0, y: 0 };
    if (!scene.projectNode(index, point)) return;
    tips[index].style.left = `${Math.round(point.x)}px`;
    tips[index].style.top = `${Math.round(point.y)}px`;
  }
  function showTip(index: number, temporary = false) {
    if (!scene) return;
    tips.forEach((tip, ti) => { tip.hidden = ti !== index; });
    positionTip(index);
    window.clearTimeout(tipTimer);
    if (temporary) tipTimer = window.setTimeout(hideTips, 4000);
  }
  function hideTips() {
    window.clearTimeout(tipTimer);
    tips.forEach(tip => { tip.hidden = true; });
  }
  function nearestNode(clientX: number, clientY: number): number {
    if (!scene) return -1;
    const rect = stage.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let nearest = -1;
    let nearestDist = 64;
    for (let index = 0; index < 4; index += 1) {
      const point = { x: 0, y: 0 };
      if (!scene.projectNode(index, point)) continue;
      const dist = Math.hypot(point.x - x, point.y - y);
      if (dist < nearestDist) { nearestDist = dist; nearest = index; }
    }
    return nearest;
  }
  function pointerTip(event: PointerEvent) {
    const index = nearestNode(event.clientX, event.clientY);
    if (index >= 0) showTip(index);
    else hideTips();
  }
  stage.addEventListener('pointermove', pointerTip, { passive: true });
  stage.addEventListener('pointerdown', pointerTip, { passive: true });
  stage.addEventListener('pointerleave', hideTips);

  const motionAllowed = () => !localPaused && !reduced.matches && !document.documentElement.classList.contains('reduce-motion');
  function select(index: number) {
    active = index;
    root!.dataset.selected = String(index);
    scene?.select(index);
    showTip(index, true);
  }
  // The header can highlight a connection without replacing or hiding this scene.
  window.addEventListener('zaya:audiencechange', event => {
    const index = (event as CustomEvent<{ index: number }>).detail?.index;
    if (Number.isInteger(index) && index >= 0 && index < 4) select(index);
  });
  select(0);

  async function loadScene() {
    if (scene || loading || failed || constrained || !visible || !motionAllowed()) return;
    loading = true;
    try {
      const { createNetworkScene } = await import('./network-scene');
      // A preference may change while the optional chunk downloads.
      if (!motionAllowed()) return;
      scene = createNetworkScene(root!.querySelector<HTMLElement>('[data-network-canvas]')!, stage);
      scene.select(active);
      root!.dataset.renderer = '3d';
      root!.dataset.sceneState = 'ready';
    } catch {
      // The fully usable HTML and geometric diagram remain on screen.
      failed = true;
      root!.dataset.sceneState = 'fallback';
    } finally {
      loading = false;
      syncMotion();
    }
  }
  function syncMotion() {
    const permitted = motionAllowed();
    const systemOff = reduced.matches || document.documentElement.classList.contains('reduce-motion');
    pause.hidden = constrained || failed;
    pause.disabled = systemOff;
    pause.textContent = systemOff ? 'Motion is off' : localPaused ? 'Resume scene' : 'Pause scene';
    pause.title = systemOff ? 'Motion is disabled by your device or the website motion control.' : '';
    root!.dataset.motion = permitted ? 'on' : 'off';
    if (!scene || !permitted) hideTips();
    scene?.setRunning(permitted && visible && !document.hidden);
    if (!scene && permitted) void loadScene();
  }
  pause.addEventListener('click', () => { localPaused = !localPaused; syncMotion(); });
  window.addEventListener('zaya:motionchange', syncMotion);
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotion();
  }, { threshold: .05 });
  observer.observe(stage);
  stage.addEventListener('zaya:scene-lost', () => {
    root.dataset.renderer = 'static';
    failed = true;
    scene?.dispose();
    scene = undefined;
    syncMotion();
  });
  window.addEventListener('pagehide', event => {
    if (event.persisted) scene?.setRunning(false);
    else { observer.disconnect(); scene?.dispose(); }
  });
  window.addEventListener('pageshow', syncMotion);
  syncMotion();
}


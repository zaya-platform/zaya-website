import type { NetworkScene } from './network-scene';

const root = document.querySelector<HTMLElement>('[data-neighbourhood]');
if (root) {
  const stage = root.querySelector<HTMLElement>('[data-network-stage]')!;
  const pause = root.querySelector<HTMLButtonElement>('[data-scene-motion]')!;
  const explorer = root.querySelector<HTMLElement>('[data-scene-explorer]');
  const picks = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-scene-pick]'));
  const details = Array.from(root.querySelectorAll<HTMLElement>('[data-scene-detail]'));
  const announce = root.querySelector<HTMLElement>('[data-scene-announce]');
  const hint = root.querySelector<HTMLElement>('[data-scene-hint]');
  const fallbackNodes = Array.from(root.querySelectorAll<HTMLElement>('.network-node'));
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
  let shownTip = -1;
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
    shownTip = index;
    positionTip(index);
    window.clearTimeout(tipTimer);
    if (temporary) tipTimer = window.setTimeout(hideTips, 4000);
  }
  function hideTips() {
    window.clearTimeout(tipTimer);
    shownTip = -1;
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
    if (stage.hasAttribute('data-dragging')) { if (shownTip >= 0) positionTip(shownTip); return; }
    const index = nearestNode(event.clientX, event.clientY);
    stage.toggleAttribute('data-hover-node', index >= 0);
    if (index >= 0) showTip(index);
    else hideTips();
  }
  stage.addEventListener('pointermove', pointerTip, { passive: true });
  stage.addEventListener('pointerdown', pointerTip, { passive: true });
  stage.addEventListener('pointerleave', () => { stage.removeAttribute('data-hover-node'); hideTips(); });

  const motionAllowed = () => !localPaused && !reduced.matches && !document.documentElement.classList.contains('reduce-motion');
  // One selection drives the 3D model, the static diagram, the explorer buttons and the detail card.
  function select(index: number, announceChange = false, tip = true) {
    active = index;
    root!.dataset.selected = String(index);
    scene?.select(index);
    // The explorer's own card already describes its choice, so it keeps the model uncovered.
    if (tip) showTip(index, true);
    else hideTips();
    picks.forEach((pick, pi) => pick.setAttribute('aria-pressed', String(pi === index)));
    details.forEach((detail, di) => detail.toggleAttribute('data-active', di === index));
    if (announceChange && announce) {
      const card = details[index];
      const name = card?.querySelector('strong')?.textContent ?? '';
      const status = card?.querySelector('.scene-status')?.textContent ?? '';
      const text = card?.querySelector('.scene-detail-text')?.textContent ?? '';
      announce.textContent = `${name} highlighted. ${status}. ${text}`;
    }
  }
  // The header can highlight a connection without replacing or hiding this scene.
  window.addEventListener('zaya:audiencechange', event => {
    const index = (event as CustomEvent<{ index: number }>).detail?.index;
    if (Number.isInteger(index) && index >= 0 && index < 4) select(index);
  });
  if (explorer) explorer.hidden = false;
  picks.forEach((pick, index) => pick.addEventListener('click', () => select(index, true, false)));
  // Tapping a shape selects it, in the 3D model (nearest projected node) or the static diagram.
  stage.addEventListener('click', event => {
    if (scene?.consumeDrag()) return;
    const index = scene
      ? nearestNode(event.clientX, event.clientY)
      : fallbackNodes.findIndex(node => event.target instanceof Node && node.contains(event.target));
    if (index >= 0) select(index, true);
  });
  select(0);

  async function loadScene() {
    if (scene || loading || failed || constrained || !visible || !motionAllowed()) return;
    loading = true;
    try {
      const { createNetworkScene } = await import('./network-scene');
      // A preference may change while the optional chunk downloads.
      if (!motionAllowed()) return;
      // Keep a visible tooltip attached to its node while the model turns or drifts.
      scene = createNetworkScene(root!.querySelector<HTMLElement>('[data-network-canvas]')!, stage, () => {
        if (shownTip >= 0) positionTip(shownTip);
      });
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
    if (hint) hint.hidden = !(scene && permitted);
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


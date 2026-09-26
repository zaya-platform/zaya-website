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

  const motionAllowed = () => !localPaused && !reduced.matches && !document.documentElement.classList.contains('reduce-motion');
  function select(index: number) {
    active = index;
    root!.dataset.selected = String(index);
    scene?.select(index);
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


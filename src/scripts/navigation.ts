import './experiences.ts';
import { closeExplore } from './explore-menu';

const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
const navigation = document.querySelector<HTMLElement>('#navigation');
const header = document.querySelector<HTMLElement>('.site-header');
const features = document.querySelector<HTMLDetailsElement>('#features-dropdown');
const explore = document.querySelector<HTMLDetailsElement>('#explore-dropdown');
const exploreToggle = explore?.querySelector<HTMLElement>('.explore-toggle');
const featuresToggle = features?.querySelector<HTMLElement>('.features-toggle');
const featureOptions = features?.querySelector<HTMLElement>('#feature-options');
const featureLinks = [...(featureOptions?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])];
const tabs = [...document.querySelectorAll<HTMLButtonElement>('.role-tabs [role="tab"]')];
const audienceHashes: Record<string, string> = {
  'tab-customer': '#shoppers',
  'tab-merchant': '#merchants',
};
const links = [...document.querySelectorAll<HTMLAnchorElement>('#navigation a[href^="#"], #explore-dropdown a[href^="#"]')];
const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];

function closeFeatures(returnFocus = false) {
  if (!features) return;
  features.open = false;
  if (returnFocus) featuresToggle?.focus({ preventScroll: true });
}

function closeMenu(returnFocus = false, includeExplore = true) {
  closeFeatures();
  if (includeExplore) closeExplore();
  if (!menu || !navigation) return;
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  if (returnFocus) menu.focus({ preventScroll: true });
}

menu?.addEventListener('click', () => {
  closeExplore();
  const open = menu.getAttribute('aria-expanded') !== 'true';
  if (!open) {
    closeMenu();
    return;
  }
  menu.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('open', open);
});

document.addEventListener('keydown', event => {
  if (event.defaultPrevented) return;
  if (event.key === 'Escape' && explore?.open) {
    event.preventDefault();
    closeExplore(true);
    return;
  }
  if (event.key === 'Escape' && features?.open) {
    event.preventDefault();
    closeFeatures(true);
    return;
  }
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    event.preventDefault();
    closeMenu(true);
  }
});

document.addEventListener('pointerdown', event => {
  if (!(event.target instanceof Node)) return;
  if (features?.open && !features.contains(event.target)) {
    closeFeatures(featureOptions?.contains(document.activeElement));
  }
  if (menu?.getAttribute('aria-expanded') !== 'true') return;
  if (!navigation?.contains(event.target) && !menu.contains(event.target)) {
    closeMenu(navigation?.contains(document.activeElement), !explore?.contains(event.target));
  }
});

document.addEventListener('focusin', event => {
  if (!(event.target instanceof Node)) return;
  if (!features?.contains(event.target)) closeFeatures();
  if (!navigation?.contains(event.target) && !menu?.contains(event.target)) closeMenu(false, !explore?.contains(event.target));
});

featuresToggle?.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || !featureLinks.length) return;
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  if (features) features.open = true;
  featureLinks[event.key === 'ArrowDown' ? 0 : featureLinks.length - 1].focus();
});

featureLinks.forEach((link, index) => {
  link.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next = index;
    if (event.key === 'ArrowDown') next = (index + 1) % featureLinks.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + featureLinks.length) % featureLinks.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = featureLinks.length - 1;
    else return;
    event.preventDefault();
    featureLinks[next].focus();
  });
});

const selectedAudience = () => {
  const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
  return selected ? audienceHashes[selected.id] : '#shoppers';
};

// Read all section positions together, so a departing observer entry cannot
// accidentally clear the state of the section the visitor is still reading.
function updateCurrentLink() {
  const readingLine = Math.min(window.innerHeight * .4, (header?.getBoundingClientRect().bottom ?? 0) + 140);
  let current: HTMLElement | undefined;
  for (const section of sections) {
    const box = section.getBoundingClientRect();
    if (box.top <= readingLine && box.bottom > readingLine) current = section;
  }
  let hash = current ? `#${current.id}` : '';
  if (hash === '#top') hash = '#connections';
  if (hash === '#experience') hash = selectedAudience();
  // Planned subsections share the navigation entry of their containing section.
  if (current && !links.some(link => link.hash === hash)) {
    const parent = current.parentElement?.closest<HTMLElement>('section[id]');
    if (parent) hash = `#${parent.id}`;
  }
  const currentScreens = new Map([...document.querySelectorAll<HTMLElement>('[data-tour]')].map(tour => [
    tour.dataset.tour,
    tour.querySelector<HTMLButtonElement>('[data-screen][aria-pressed="true"]')?.dataset.screen,
  ]));
  links.forEach(link => {
    const screenMatches = !link.dataset.featureScreen || currentScreens.get(link.dataset.featureRole) === link.dataset.featureScreen;
    if (link.hash === hash && screenMatches) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  featuresToggle?.toggleAttribute('data-current', featureLinks.some(link => link.hasAttribute('aria-current')));
  exploreToggle?.toggleAttribute('data-current', links.some(link => explore?.contains(link) && link.hasAttribute('aria-current')));
}

function activateTab(index: number, updateHash = false) {
  const chosen = tabs[index];
  if (!chosen) return;
  tabs.forEach((tab, position) => {
    const selected = position === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
    if (panel) panel.hidden = !selected;
  });
  const hash = audienceHashes[chosen.id];
  if (updateHash && hash && window.location.hash !== hash) {
    // Changing tabs keeps the reader in place and does not fill their Back history.
    window.history.replaceState(window.history.state, '', hash);
  }
  updateCurrentLink();
}

function revealHashAudience() {
  const index = tabs.findIndex(tab => audienceHashes[tab.id] === window.location.hash);
  if (index < 0) return;
  const focusWasInPanel = document.activeElement?.closest('.role-panel');
  activateTab(index);
  if (focusWasInPanel?.hasAttribute('hidden')) tabs[index].focus({ preventScroll: true });
}

function keepTabVisible(tab: HTMLButtonElement) {
  const box = tab.getBoundingClientRect();
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
  if (box.top < headerBottom + 12 || box.bottom > window.innerHeight - 12) {
    tab.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    activateTab(index, true);
    keepTabVisible(tab);
  });
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(next, true);
    tabs[next].focus({ preventScroll: true });
    keepTabVisible(tabs[next]);
  });
});

document.addEventListener('click', event => {
  if (!(event.target instanceof Element) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.target.closest('[data-tour] [data-screen]')) queueCurrentLink();
  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (!link || link.origin !== window.location.origin || link.pathname !== window.location.pathname || !link.hash || link.target === '_blank') return;
  const index = tabs.findIndex(tab => audienceHashes[tab.id] === link.hash);
  if (index >= 0) {
    event.preventDefault();
    closeMenu();
    activateTab(index);
    const role = link.dataset.featureRole;
    const screen = link.dataset.featureScreen;
    if (role === tabs[index].id.slice(4) && (screen === '0' || screen === '1')) {
      // Reuse the walkthrough's single source of truth for its image, copy,
      // alt text and pressed state. The selected screen remains enlargable.
      const tour = [...document.querySelectorAll<HTMLElement>('[data-tour]')].find(item => item.dataset.tour === role);
      const step = [...(tour?.querySelectorAll<HTMLButtonElement>('[data-screen]') ?? [])].find(button => button.dataset.screen === screen);
      step?.click();
    }
    if (window.location.hash !== link.hash) window.history.pushState(window.history.state, '', link.hash);
    tabs[index].focus({ preventScroll: true });
    // The tab list shares the audience anchors' position. CSS scroll margins
    // and root scroll padding reserve room for the sticky header.
    tabs[index].closest('.role-tabs')?.scrollIntoView({ block: 'start' });
    return;
  }
  if (navigation?.contains(link) || explore?.contains(link)) {
    closeMenu();
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }
});

window.addEventListener('hashchange', revealHashAudience);
window.addEventListener('popstate', revealHashAudience);
revealHashAudience();

let scrollFrame = 0;
function queueCurrentLink() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateCurrentLink();
  });
}
window.addEventListener('scroll', queueCurrentLink, { passive: true });
let mobileNavigation = !!menu && getComputedStyle(menu).display !== 'none';
window.addEventListener('resize', () => {
  const mobile = !!menu && getComputedStyle(menu).display !== 'none';
  if (mobile !== mobileNavigation) {
    const focused = document.activeElement;
    const focusInOptions = featureOptions?.contains(focused);
    const focusInNavigation = navigation?.contains(focused);
    const focusInExploreOptions = explore?.contains(focused) && focused !== exploreToggle;
    closeMenu();
    if (focusInExploreOptions) exploreToggle?.focus({ preventScroll: true });
    else if (mobile && (focusInNavigation || focused === menu)) menu?.focus({ preventScroll: true });
    else if (!mobile && (focusInOptions || focused === menu)) featuresToggle?.focus({ preventScroll: true });
    mobileNavigation = mobile;
  }
  queueCurrentLink();
});
window.addEventListener('pageshow', () => {
  revealHashAudience();
  queueCurrentLink();
});
queueCurrentLink();

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector<HTMLButtonElement>('#motion-toggle');
const scene = document.querySelector<HTMLElement>('[data-tilt]');
let manualOff = false;
let tiltFrame = 0;
try { manualOff = localStorage.getItem('zaya-motion') === 'off'; } catch { /* Storage may be unavailable. */ }
const applyMotion = () => {
  const off = manualOff || preference.matches;
  document.documentElement.classList.toggle('reduce-motion', off);
  document.body.classList.toggle('motion-off', off);
  if (motionButton) {
    motionButton.textContent = off ? 'Motion: off' : 'Motion: on';
    motionButton.setAttribute('aria-pressed', String(!off));
    motionButton.disabled = preference.matches;
    motionButton.title = preference.matches
      ? 'Motion is off to match your device’s reduced-motion setting.'
      : off ? 'Turn on website motion.' : 'Pause website motion.';
  }
  cancelAnimationFrame(tiltFrame);
  scene?.style.removeProperty('transform');
  // Optional visual components also read the root class when loading after this event.
  window.dispatchEvent(new CustomEvent('zaya:motionchange', { detail: { enabled: !off } }));
};
motionButton?.addEventListener('click', () => {
  manualOff = !manualOff;
  try { localStorage.setItem('zaya-motion', manualOff ? 'off' : 'on'); } catch { /* The control still works for this visit. */ }
  applyMotion();
});
preference.addEventListener('change', applyMotion);
window.addEventListener('storage', event => {
  if (event.key !== 'zaya-motion' && event.key !== null) return;
  manualOff = event.key === 'zaya-motion' && event.newValue === 'off';
  applyMotion();
});
applyMotion();

scene?.addEventListener('pointermove', event => {
  if (manualOff || preference.matches || event.pointerType !== 'mouse') return;
  cancelAnimationFrame(tiltFrame);
  tiltFrame = requestAnimationFrame(() => {
    const box = scene.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    scene.style.transform = `perspective(1400px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
  });
});
scene?.addEventListener('pointerleave', () => {
  cancelAnimationFrame(tiltFrame);
  scene.style.removeProperty('transform');
});

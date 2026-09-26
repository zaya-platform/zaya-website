export {};

const disclosure = document.querySelector<HTMLDetailsElement>('#explore-dropdown');
const opener = disclosure?.querySelector<HTMLElement>('.explore-toggle');
const options = disclosure?.querySelector<HTMLElement>('#explore-options');
const header = disclosure?.closest<HTMLElement>('.site-header');
const audienceLinks = [...(options?.querySelectorAll<HTMLAnchorElement>('[data-explore-audience]') ?? [])];

// The header reserves the panel's measured height, keeping the homepage scene
// below it. The model itself stays mounted throughout navigation changes.
function syncExploreHeight() {
  if (!disclosure || !options || !header) return;
  header.toggleAttribute('data-explore-open', disclosure.open);
  if (disclosure.open) {
    header.style.setProperty('--explore-height', `${Math.ceil(options.getBoundingClientRect().height)}px`);
  } else {
    header.style.removeProperty('--explore-height');
  }
}

export function closeExplore(returnFocus = false) {
  if (!disclosure?.open) return;
  disclosure.open = false;
  syncExploreHeight();
  if (returnFocus) opener?.focus({ preventScroll: true });
}

disclosure?.addEventListener('toggle', syncExploreHeight);
if (options) new ResizeObserver(syncExploreHeight).observe(options);
window.addEventListener('resize', syncExploreHeight);
window.addEventListener('pageshow', syncExploreHeight);

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !disclosure?.open) return;
  event.preventDefault();
  closeExplore(true);
});

document.addEventListener('pointerdown', event => {
  if (!(event.target instanceof Node) || !disclosure?.open || disclosure.contains(event.target)) return;
  closeExplore(options?.contains(document.activeElement));
});

document.addEventListener('focusin', event => {
  if (event.target instanceof Node && !disclosure?.contains(event.target)) closeExplore();
});

opener?.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || !audienceLinks.length) return;
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  if (disclosure) disclosure.open = true;
  syncExploreHeight();
  audienceLinks[event.key === 'ArrowDown' ? 0 : audienceLinks.length - 1].focus();
});

audienceLinks.forEach((link, index) => {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    closeExplore();
    window.dispatchEvent(new CustomEvent('zaya:audiencechange', { detail: { index } }));
  });
  link.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % audienceLinks.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + audienceLinks.length) % audienceLinks.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = audienceLinks.length - 1;
    else return;
    event.preventDefault();
    audienceLinks[next].focus();
  });
});

syncExploreHeight();

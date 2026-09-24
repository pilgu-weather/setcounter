// Follow Safari's visible viewport when its keyboard or browser bars move.
const viewport = window.visualViewport;
function syncViewport() {
  document.documentElement.style.setProperty('--visual-height', `${viewport?.height ?? window.innerHeight}px`);
  document.documentElement.style.setProperty('--visual-top', `${viewport?.offsetTop ?? 0}px`);
}
viewport?.addEventListener('resize', syncViewport, { passive: true });
viewport?.addEventListener('scroll', syncViewport, { passive: true });
window.addEventListener('resize', syncViewport, { passive: true });
syncViewport();

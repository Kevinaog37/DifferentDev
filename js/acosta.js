document.documentElement.classList.add('js');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
menu.hidden = false;
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menú'; }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? 'Cerrar' : 'Menú'; });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });
window.matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const dialog = document.querySelector('dialog');
const expandedImage = dialog.querySelector('img');
const imageRequests = new WeakMap();
let activeGallery;
let closing = false;

// Decode before fading, and ignore stale requests when navigating quickly.
async function transitionImage(image, src, alt) {
  const request = {};
  imageRequests.set(image, request);
  const preload = new Image();
  preload.src = src;
  try { await preload.decode(); } catch { return false; }
  if (imageRequests.get(image) !== request) return false;
  image.getAnimations().forEach(animation => animation.cancel());
  const duration = reducedMotion.matches ? 0 : 160;
  const fadeOut = image.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: 'forwards', easing: 'ease-out' });
  try { await fadeOut.finished; } catch { return false; }
  if (imageRequests.get(image) !== request) { fadeOut.cancel(); return false; }
  image.src = src;
  image.alt = alt;
  fadeOut.cancel();
  image.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: reducedMotion.matches ? 0 : 260, easing: 'ease-out' });
  return true;
}

function updateViewer() {
  const { gallery, buttons, index } = activeGallery;
  const alt = `${gallery.dataset.title} · ${index + 1} / ${buttons.length}`;
  dialog.querySelector('p').textContent = alt;
  return transitionImage(expandedImage, buttons[index].dataset.src, alt);
}

document.querySelectorAll('.gallery').forEach(gallery => {
  const image = gallery.querySelector('.image-link img');
  const link = gallery.querySelector('.image-link');
  const buttons = [...gallery.querySelectorAll('.gallery-controls button')];
  const state = { gallery, buttons, index: 0 };
  buttons.forEach((button, index) => {
    const thumbnail = document.createElement('img');
    thumbnail.src = button.dataset.src;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    button.replaceChildren(thumbnail);
    button.addEventListener('click', async () => {
      state.index = index;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const changed = await transitionImage(image, button.dataset.src, `${gallery.dataset.title}: captura ${index + 1}`);
      if (changed) link.href = button.dataset.src;
    });
  });
  link.addEventListener('click', event => {
    if (!dialog.showModal) return;
    event.preventDefault();
    activeGallery = state;
    closing = false;
    dialog.classList.remove('is-closing');
    expandedImage.src = buttons[state.index].dataset.src;
    expandedImage.alt = `${gallery.dataset.title}: captura ${state.index + 1}`;
    dialog.querySelector('p').textContent = `${gallery.dataset.title} · ${state.index + 1} / ${buttons.length}`;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});

async function closeViewer() {
  if (closing || !dialog.open) return;
  closing = true;
  dialog.classList.add('is-closing');
  const animation = dialog.animate([{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(16px) scale(.96)' }], { duration: reducedMotion.matches ? 0 : 200, easing: 'ease-in', fill: 'forwards' });
  await animation.finished;
  dialog.close();
  animation.cancel();
  dialog.classList.remove('is-closing');
  closing = false;
}
function navigateViewer(direction) {
  if (!activeGallery || closing) return;
  activeGallery.index = (activeGallery.index + direction + activeGallery.buttons.length) % activeGallery.buttons.length;
  activeGallery.buttons[activeGallery.index].click();
  updateViewer();
}
dialog.querySelector('.close-dialog').addEventListener('click', closeViewer);
dialog.querySelector('.viewer-prev').addEventListener('click', () => navigateViewer(-1));
dialog.querySelector('.viewer-next').addEventListener('click', () => navigateViewer(1));
dialog.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    navigateViewer(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeViewer();
});
dialog.addEventListener('close', () => {
  imageRequests.delete(expandedImage);
  expandedImage.getAnimations().forEach(animation => animation.cancel());
  document.body.classList.remove('modal-open');
});

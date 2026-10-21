document.documentElement.classList.add('js');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
menu.hidden = false;
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menú'; }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? 'Cerrar' : 'Menú'; });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });

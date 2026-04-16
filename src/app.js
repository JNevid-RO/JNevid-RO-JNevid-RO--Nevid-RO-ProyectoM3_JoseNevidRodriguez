import { getRouteName, navigateTo } from './utils.js';
import { renderHome, renderChat, renderAbout } from './chat.js';

const appRoot = document.getElementById('app');
const navLinks = Array.from(document.querySelectorAll('a[data-link]'));

function setActiveLink(path) {
  navLinks.forEach((link) => {
    const href = new URL(link.href).pathname;
    link.classList.toggle('active', getRouteName(href) === getRouteName(path));
  });
}

function renderRoute(path) {
  const route = getRouteName(path);
  setActiveLink(route);

  if (route === '/chat') {
    renderChat(appRoot);
    return;
  }

  if (route === '/about') {
    renderAbout(appRoot);
    return;
  }

  renderHome(appRoot);
}

function handleNavigation(event) {
  const link = event.target.closest('a[data-link]');
  if (!link) return;
  event.preventDefault();
  const target = new URL(link.href).pathname;
  navigateTo(target);
  renderRoute(target);
}

window.addEventListener('popstate', () => {
  renderRoute(window.location.pathname);
});

document.addEventListener('click', handleNavigation);

renderRoute(window.location.pathname);

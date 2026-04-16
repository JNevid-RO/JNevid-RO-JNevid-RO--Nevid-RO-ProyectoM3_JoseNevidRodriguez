export const routes = {
  '/': '/home',
  '/home': '/home',
  '/chat': '/chat',
  '/about': '/about',
};

export function normalizeRoute(path) {
  return routes[path] || '/home';
}

export function getRouteName(path) {
  return normalizeRoute(path);
}

export function navigateTo(path) {
  const target = normalizeRoute(path);
  window.history.pushState({}, '', target);
  return target;
}

export function createMessage(role, content) {
  return { role, content };
}

export function scrollToBottom(element) {
  if (!element) return;
  element.scrollTop = element.scrollHeight;
}

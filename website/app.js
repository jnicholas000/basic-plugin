const root = document.documentElement;
const themeButton = document.querySelector('[data-theme-toggle]');

function updateThemeButton() {
  if (!themeButton) return;
  const next = root.dataset.theme === 'dark' ? 'Light' : 'Dark';
  themeButton.textContent = next + ' mode';
  themeButton.setAttribute('aria-label', 'Switch to ' + next.toLowerCase() + ' mode');
}

themeButton?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('basic-plugin-theme', next);
  } catch (_) {
    // Storage can be unavailable in hardened browser contexts.
  }
  updateThemeButton();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  });
});

updateThemeButton();

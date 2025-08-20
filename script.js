// Mostra o ano atual no rodapé
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Adicione este código para o menu responsivo
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.querySelector('.nav__toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggleButton && navMenu) {
    toggleButton.addEventListener('click', () => {
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      toggleButton.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open', !isExpanded);
    });
  }
});
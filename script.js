// Mostra o ano atual no rodapé
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = '2025';

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

// Newsletter segura via função serverless
async function subscribe(e){
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById('formStatus') || createStatusBelow(form);
  status.textContent = 'Enviando…';

  const email = form.email.value.trim();
  const listId = Number(form.dataset.listId || document.getElementById('subscribeForm')?.dataset.listId);

  if (!email || !listId) {
    status.textContent = 'Erro: e-mail ou lista inválidos.';
    return false;
  }

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, listId })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.ok) {
      status.textContent = data.duplicate
        ? 'Você já está na nossa lista. 😉'
        : 'Inscrição confirmada! Confira seu e-mail.';
      showPopup();
      form.reset();
    } else {
      status.textContent = 'Erro: ' + (data?.message || 'não foi possível cadastrar.');
      console.warn('subscribe error:', data);
    }
  } catch (err){
    console.error(err);
    status.textContent = 'Erro de conexão. Tente novamente.';
  }

  return false;
}

// Popup de sucesso
function showPopup(){
  const el = document.getElementById("popup");
  if (el) el.classList.remove("hidden");
}
function closePopup(){
  const el = document.getElementById("popup");
  if (el) el.classList.add("hidden");
}

// Utilitário para criar mensagem de status se não existir
function createStatusBelow(form){
  const p = document.createElement('p');
  p.id = 'formStatus';
  p.className = 'status';
  form.parentNode.insertBefore(p, form.nextSibling);
  return p;
}

// (Opcional) Stub do formulário de contato
async function sendMessage(e){
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById('formStatusContact');
  if (status) status.textContent = 'Enviando…';
  await new Promise(r => setTimeout(r, 600));
  if (status) status.textContent = 'Mensagem enviada!';
  form.reset();
  return false;
}
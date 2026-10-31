'use strict';

const CONTACT_EMAIL = 'oasisfuentedeamor@gmail.com';
const EMAILJS_SERVICE_ID = 'oasis_service';
const EMAILJS_TEMPLATE_ID = 'template_mldwmkr';
const EMAILJS_PUBLIC_KEY = 'nAMwUhvZ_ZaSDhOgP';

if (window.emailjs?.init) {
  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const header = document.getElementById('header');
const fabTop = document.getElementById('fabTop');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formEmailFallback = document.getElementById('formEmailFallback');
const submitButton = document.getElementById('btnEnviar');
const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
function syncThemeControl() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(dark));
  themeToggle?.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
  themeToggle?.setAttribute('title', dark ? 'Activar modo claro' : 'Activar modo oscuro');
  themeColorMeta?.setAttribute('content', dark ? '#0f1722' : '#f5f7fa');
}
syncThemeControl();
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem('oasis-theme', nextTheme); } catch { /* El tema sigue activo durante esta visita. */ }
  syncThemeControl();
});

function setMenuOpen(open) {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.toggle('active', open);
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

hamburger?.addEventListener('click', () => {
  setMenuOpen(hamburger.getAttribute('aria-expanded') !== 'true');
});

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenuOpen(false);
});

let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(() => {
    header?.classList.toggle('scrolled', window.scrollY > 60);
    fabTop?.classList.toggle('visible', window.scrollY > 400);
    scrollQueued = false;
  });
}, { passive: true });

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('visible'));
}

function showStatus(message, type, detail = '') {
  if (!formStatus) return;
  formStatus.replaceChildren();
  formStatus.className = 'form-status';
  if (!message || !type) return;

  const icon = document.createElement('span');
  icon.className = 'form-status-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = type === 'success' ? '✓' : '!';

  const content = document.createElement('span');
  content.className = 'form-status-content';
  const title = document.createElement('strong');
  title.className = 'form-status-title';
  title.textContent = type === 'success' ? message : 'No se pudo enviar';
  const description = document.createElement('span');
  description.className = 'form-status-message';
  description.textContent = type === 'success'
    ? (detail || 'Gracias por escribirnos. Nos pondremos en contacto contigo pronto❤️ .')
    : message;
  content.append(title, description);
  formStatus.append(icon, content);
  formStatus.className = `form-status visible ${type}`;
}

let successToastTimer;
function showSuccessToast(titleText, detailText) {
  document.querySelector('.success-toast')?.remove();
  window.clearTimeout(successToastTimer);

  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');

  const icon = document.createElement('span');
  icon.className = 'success-toast-icon';
  icon.textContent = '✓';
  const copy = document.createElement('span');
  copy.className = 'success-toast-copy';
  const title = document.createElement('strong');
  title.textContent = titleText;
  const detail = document.createElement('span');
  detail.textContent = detailText;
  copy.append(title, detail);
  toast.append(icon, copy);
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  successToastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 220);
  }, 6500);
}
function setSubmitting(isSubmitting) {
  if (!submitButton) return;
  submitButton.disabled = isSubmitting;
  submitButton.classList.toggle('loading', isSubmitting);
  submitButton.setAttribute('aria-busy', String(isSubmitting));
}

function createEmailDraftUrl(fields) {
  const subject = encodeURIComponent(`Mensaje desde la web - ${fields.motivo}`);
  const body = encodeURIComponent(
    `Nombre: ${fields.nombre} ${fields.apellido}\n` +
    `Correo: ${fields.email}\n` +
    `Motivo: ${fields.motivo}\n\n${fields.mensaje}`
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

let lastSubmission = 0;
let isSubmitting = false;
contactForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (isSubmitting) return;

  const honeypot = document.getElementById('website');
  if (honeypot?.value) return;

  const now = Date.now();
  if (now - lastSubmission < 15000) {
    showStatus('Espera unos segundos antes de enviar otro mensaje.', 'error');
    return;
  }

  if (!contactForm.reportValidity()) return;
  const fields = {
    nombre: document.getElementById('nombre').value.trim(),
    apellido: document.getElementById('apellido').value.trim(),
    email: document.getElementById('email').value.trim(),
    motivo: document.getElementById('motivo').value,
    mensaje: document.getElementById('mensaje').value.trim()
  };
  const namePattern = /^[\p{L}\p{M} .'-]{2,50}$/u;
  if (!namePattern.test(fields.nombre) || !namePattern.test(fields.apellido)) {
    showStatus('Revisa que tu nombre y apellido tengan entre 2 y 50 caracteres.', 'error');
    return;
  }
  if (fields.mensaje.length < 10 || fields.mensaje.length > 1000) {
    showStatus('El mensaje debe tener entre 10 y 1000 caracteres.', 'error');
    return;
  }

  isSubmitting = true;
  setSubmitting(true);
  showStatus('', '');
  if (formEmailFallback) formEmailFallback.hidden = true;
  try {
    if (!window.emailjs?.send) throw new Error('El servicio de correo no está disponible.');
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...fields,
      reply_to: fields.email
    });
    lastSubmission = Date.now();
    contactForm.reset();
    showStatus('', '');
    showSuccessToast('¡Mensaje enviado!', 'Nos pondremos en contacto contigo pronto.');
  } catch (error) {
    const errorText = error?.text || error?.message || '';
    console.error('EmailJS send failed', { status: error?.status, message: errorText });
    const statusMessage = /public key is invalid/i.test(errorText)
      ? 'La clave pública de EmailJS no es válida. Actualízala para reactivar el envío automático.'
      : 'No se pudo enviar automáticamente. Puedes escribirnos directamente por correo.';
    showStatus(statusMessage, 'error');
    if (formEmailFallback) {
      formEmailFallback.href = createEmailDraftUrl(fields);
      formEmailFallback.hidden = false;
    }
  } finally {
    isSubmitting = false;
    setSubmitting(false);
  }
});
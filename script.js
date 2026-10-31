'use strict';

const CONTACT_EMAIL = 'oasisfuentedeamor@gmail.com';
const EMAILJS_SERVICE_ID = 'oasis_service';
const EMAILJS_TEMPLATE_ID = 'template_mldwmkr';
const EMAILJS_PUBLIC_KEY = 'nAMwUhvZ_ZaSDhOg';

const header = document.getElementById('header');
const fabTop = document.getElementById('fabTop');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitButton = document.getElementById('btnEnviar');

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

function showStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status visible ${type}`;
}

function setSubmitting(isSubmitting) {
  if (!submitButton) return;
  submitButton.disabled = isSubmitting;
  submitButton.classList.toggle('loading', isSubmitting);
  submitButton.setAttribute('aria-busy', String(isSubmitting));
}

function openEmailDraft(fields) {
  const subject = encodeURIComponent(`Mensaje desde la web - ${fields.motivo}`);
  const body = encodeURIComponent(
    `Nombre: ${fields.nombre} ${fields.apellido}\n` +
    `Correo: ${fields.email}\n` +
    `Motivo: ${fields.motivo}\n\n${fields.mensaje}`
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
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
  try {
    if (!window.emailjs?.send) throw new Error('El servicio de correo no está disponible.');
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...fields,
      reply_to: fields.email
    }, { publicKey: EMAILJS_PUBLIC_KEY });
    lastSubmission = Date.now();
    contactForm.reset();
    showStatus('¡Mensaje enviado! Nos contactaremos pronto. 🙏', 'success');
  } catch {
    showStatus('No se pudo enviar automáticamente. Se abrirá un correo para que puedas enviarnos tu mensaje.', 'error');
    openEmailDraft(fields);
  } finally {
    isSubmitting = false;
    setSubmitting(false);
  }
});
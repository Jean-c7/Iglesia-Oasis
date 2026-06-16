emailjs.init('nAMwUhvZ_ZaSDhOg');

const header = document.getElementById('header');
const fabTop = document.getElementById('fabTop');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

// Optimizar scroll events con throttle para mejor performance en móvil
let scrollTimeout;
let lastScrollTime = 0;

window.addEventListener('scroll', () => {
  const now = Date.now();
  
  if (now - lastScrollTime > 16) { // ~60fps
    header.classList.toggle('scrolled', window.scrollY > 60);
    if (fabTop) {
      fabTop.classList.toggle('visible', window.scrollY > 400);
    }
    
    // Parallax effect solo en dispositivos con buen rendimiento
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg && window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
      }
    }
    
    lastScrollTime = now;
  }
}, { passive: true });

// Menú hamburguesa
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
}

if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

// Intersection Observer para reveal animations
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  }).observe(el);
});

let lastSubmission = 0;
let isSubmitting = false;

function sanitizeInput(value) {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

function validateName(name) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/.test(name);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleFormSubmit() {
  if (isSubmitting) return;

  const now = Date.now();

  if (now - lastSubmission < 15000) {
    showToast('Espera unos segundos antes de enviar otro mensaje.', 'error');
    return;
  }

  let nombre = sanitizeInput(document.getElementById('nombre').value);
  let apellido = sanitizeInput(document.getElementById('apellido').value);
  let email = sanitizeInput(document.getElementById('email').value);
  let motivo = sanitizeInput(document.getElementById('motivo').value);
  let mensaje = sanitizeInput(document.getElementById('mensaje').value);

  if (!nombre || !email || !mensaje) {
    showToast('Completa todos los campos obligatorios.', 'error');
    return;
  }

  if (!validateName(nombre)) {
    showToast('Ingresa un nombre válido.', 'error');
    return;
  }

  if (apellido && !validateName(apellido)) {
    showToast('Ingresa un apellido válido.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showToast('Correo electrónico inválido.', 'error');
    return;
  }

  if (mensaje.length < 10) {
    showToast('El mensaje es demasiado corto.', 'error');
    return;
  }

  if (mensaje.length > 1000) {
    showToast('El mensaje es demasiado largo.', 'error');
    return;
  }

  if (nombre.length > 50 || apellido.length > 50) {
    showToast('Nombre o apellido demasiado largo.', 'error');
    return;
  }

  const btn = document.getElementById('btnEnviar');

  btn.classList.add('loading');
  btn.disabled = true;
  isSubmitting = true;

  const templateParams = {
    nombre,
    apellido,
    email,
    motivo: motivo || 'No especificado',
    mensaje,
    reply_to: email
  };

  try {
    await emailjs.send(
      'oasis_service',
      'template_mldwmkr',
      templateParams
    );

    lastSubmission = Date.now();

    showToast(
      '¡Mensaje enviado! Nos contactaremos pronto. 🙏',
      'success'
    );

    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('email').value = '';
    document.getElementById('motivo').value = '';
    document.getElementById('mensaje').value = '';

  } catch (error) {
    console.error('EmailJS Error:', error);

    showToast(
      'Ocurrió un error al enviar el mensaje.',
      'error'
    );
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
    isSubmitting = false;
  }
}

function showToast(message, type) {
  document.querySelector('.toast')?.remove();

  const toast = document.createElement('div');

  toast.className = 'toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '96px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: type === 'success' ? '#0B1F3A' : '#b44',
    color: '#fff',
    padding: '13px 28px',
    borderRadius: '50px',
    fontSize: '.85rem',
    fontFamily: 'var(--font-body)',
    zIndex: '9999',
    boxShadow: '0 8px 28px rgba(0,0,0,.2)',
    animation: 'fadeInUp .4s ease',
    whiteSpace: 'nowrap'
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
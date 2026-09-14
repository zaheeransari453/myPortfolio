// ============ CONFIG ============
// EmailJS keys are public by design. Lock the service down in the EmailJS
// dashboard (Account > Security): enable "Allowed origins" for this domain and
// turn on reCAPTCHA, otherwise anyone can spend your monthly quota.
const EMAILJS_PUBLIC_KEY = 'gmF26SU56zk2D3ZCJ';
const EMAILJS_SERVICE_ID = 'service_3njkp47';
const EMAILJS_TEMPLATE_ID = 'template_c473rlf';

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

// ============ MOBILE NAV TOGGLE ============
const menuToggle = document.querySelector('#menu-icon');
const menuIconEl = menuToggle.querySelector('i');
const navbar = document.querySelector('.navbar');

function setNav(open) {
  navbar.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute(
    'aria-label',
    open ? 'Close navigation menu' : 'Open navigation menu',
  );
  menuIconEl.classList.toggle('bx-menu', !open);
  menuIconEl.classList.toggle('bx-x', open);
}

menuToggle.addEventListener('click', () => {
  setNav(!navbar.classList.contains('active'));
});

// Close the menu on Escape, and return focus to the toggle.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navbar.classList.contains('active')) {
    setNav(false);
    menuToggle.focus();
  }
});

// ============ NAV: ACTIVE LINK + STICKY HEADER ============
const navLinks = Array.from(document.querySelectorAll('header nav a'));
const header = document.querySelector('header');

function markActive(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// Close the menu when a link is chosen (the anchor jump handles the rest).
navLinks.forEach((link) => {
  link.addEventListener('click', () => setNav(false));
});

// Scroll-spy via IntersectionObserver instead of measuring every section on
// every scroll event.
const sections = document.querySelectorAll('main section[id]');
if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) markActive(visible.target.id);
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] },
  );
  sections.forEach((section) => spy.observe(section));
}

// Sticky header, throttled to one read per animation frame.
let scrollQueued = false;
window.addEventListener(
  'scroll',
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      header.classList.toggle('sticky', window.scrollY > 100);
      scrollQueued = false;
    });
  },
  { passive: true },
);

// ============ SCROLL REVEAL (optional enhancement) ============
if (typeof ScrollReveal !== 'undefined' && !prefersReducedMotion) {
  ScrollReveal({ distance: '80px', duration: 1200, delay: 150, reset: false });

  ScrollReveal().reveal('.home-content, .heading, .subheading', {
    origin: 'top',
  });
  ScrollReveal().reveal(
    '.home-img, .services-container, .work-box, .portfolio-box, .skills-group, .contact form',
    { origin: 'bottom', interval: 80 },
  );
  // Vertical origins only. A horizontal origin stages the element at
  // translateX(±distance) before it animates in, which pushes it outside the
  // viewport and creates a horizontal scrollbar on narrow screens.
  ScrollReveal().reveal('.about-img, .about-content', { origin: 'bottom' });
}

// ============ TYPED HEADLINE (optional enhancement) ============
const typedTarget = document.querySelector('.multiple-text');
if (typeof Typed !== 'undefined' && typedTarget && !prefersReducedMotion) {
  typedTarget.textContent = '';
  new Typed('.multiple-text', {
    strings: [
      'AI Native Full Stack Developer',
      'Frontend Engineer',
      'React &amp; Next.js Developer',
      'RAG &amp; LLM App Builder',
    ],
    typeSpeed: 80,
    backSpeed: 40,
    backDelay: 1600,
    loop: true,
  });
}
// If Typed.js is unavailable or motion is reduced, the server-rendered
// fallback text inside .multiple-text stays visible.

// ============ CONTACT FORM ============
if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');

function setStatus(message, state) {
  status.textContent = message;
  status.className = `form-status${state ? ` ${state}` : ''}`;
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Honeypot: a real visitor never sees this field.
    if (form.website.value.trim() !== '') return;

    if (!form.checkValidity()) {
      setStatus(
        'Please fill in your name, a valid email, a subject and a message.',
        'error',
      );
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (typeof emailjs === 'undefined') {
      setStatus(
        'The mail service could not load. Please email zaheerulhassan453@gmail.com directly.',
        'error',
      );
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus('Sending…');

    const subject = form.email_sub.value.trim();
    const phone = form.mobile_no.value.trim();
    const message = form.message.value.trim();

    // Subject and phone are also folded into the body so they arrive even if the
    // EmailJS template does not reference those variables.
    const params = {
      from_name: form.fullName.value.trim(),
      email_id: form.email_id.value.trim(),
      email_sub: subject,
      mobile_no: phone,
      message: [
        `Subject: ${subject}`,
        phone ? `Phone: ${phone}` : null,
        '',
        message,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      form.reset();
      setStatus(
        "Thanks — your message is on its way. I'll reply soon.",
        'success',
      );
    } catch (error) {
      console.error('EmailJS send failed:', error);
      setStatus(
        'Something went wrong sending that. Please email zaheerulhassan453@gmail.com directly.',
        'error',
      );
    } finally {
      button.disabled = false;
    }
  });
}

// ============ FOOTER YEAR ============
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

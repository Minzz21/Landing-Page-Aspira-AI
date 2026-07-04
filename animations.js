/**
 * ASPIRA AI - Design Motion System
 * Scroll-triggered animations, parallax, micro-interactions
 * Supports prefers-reduced-motion for accessibility
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // 1. Preloader
  // ─────────────────────────────────────────────
  const preloader = document.getElementById('preloader');
  
  window.addEventListener('load', () => {
    if (preloader) {
      preloader.classList.add('preloader--hidden');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }
  });

  // ─────────────────────────────────────────────
  // 2. Check reduced motion preference
  // ─────────────────────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show all elements immediately, skip animations
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // ─────────────────────────────────────────────
  // 3. Smooth Scroll for anchor links
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger-menu');
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
        }
      }
    });
  });

  // ─────────────────────────────────────────────
  // 4. Navbar scroll effect
  // ─────────────────────────────────────────────
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }

    // Active link indicator
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);

      if (link) {
        if (scrollY >= top && scrollY < bottom) {
          link.classList.add('nav-link--active');
        } else {
          link.classList.remove('nav-link--active');
        }
      }
    });

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });

  // ─────────────────────────────────────────────
  // 5. Intersection Observer - Scroll Animations
  // ─────────────────────────────────────────────
  const animateElements = document.querySelectorAll('[data-animate]');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15,
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;

        setTimeout(() => {
          el.classList.add('animate--visible');
        }, parseInt(delay));

        // Unobserve after animation (one-time trigger)
        animationObserver.unobserve(el);
      }
    });
  }, observerOptions);

  animateElements.forEach((el) => {
    animationObserver.observe(el);
  });

  // ─────────────────────────────────────────────
  // 6. Parallax effect on hero background
  // ─────────────────────────────────────────────
  const heroImage = document.querySelector('.hero-image');

  if (heroImage) {
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = document.querySelector('.hero').offsetHeight;

        if (scrollY <= heroHeight) {
          const parallaxOffset = scrollY * 0.35;
          heroImage.style.transform = `scale(1.05) translateY(${parallaxOffset}px)`;
        }
      });
    });
  }

  // ─────────────────────────────────────────────
  // 7. Button ripple effect
  // ─────────────────────────────────────────────
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      // Remove existing ripple
      const existingRipple = this.querySelector('.ripple');
      if (existingRipple) existingRipple.remove();

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 700);
    });
  });

  // ─────────────────────────────────────────────
  // 8. Counter animation for step numbers
  // ─────────────────────────────────────────────
  const counterElements = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          let current = 0;
          const duration = 800;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(eased * target);
            el.textContent = current + '.';

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterElements.forEach((el) => counterObserver.observe(el));

  // ─────────────────────────────────────────────
  // 9. Magnetic hover effect on feature icons
  // ─────────────────────────────────────────────
  document.querySelectorAll('.icon-circle').forEach((icon) => {
    icon.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) rotate(${x * 0.1}deg)`;
    });

    icon.addEventListener('mouseleave', function () {
      this.style.transform = 'translate(0, 0) rotate(0deg)';
    });
  });

  // ─────────────────────────────────────────────
  // 10. Tilt effect on feature cards
  // ─────────────────────────────────────────────
  document.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (y - 0.5) * 8;
      const tiltY = (x - 0.5) * -8;

      this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // ─────────────────────────────────────────────
  // 11. Typed text effect on hero heading
  // ─────────────────────────────────────────────
  const typedElement = document.querySelector('[data-typed]');

  if (typedElement) {
    const text = typedElement.dataset.typed;
    typedElement.textContent = '';
    typedElement.style.opacity = '1';

    let charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        typedElement.textContent += text[charIndex];
        charIndex++;
        setTimeout(typeChar, 60);
      } else {
        typedElement.classList.add('typed--done');
      }
    }

    // Start typing after hero card appears
    setTimeout(typeChar, 800);
  }
})();

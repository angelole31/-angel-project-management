/* ============================================================
   ANGEL V. OLE — PM PORTFOLIO
   script.js
   Features:
   - Sticky nav scroll state
   - Active nav link on scroll (IntersectionObserver)
   - Mobile menu open/close + body scroll lock
   - Scroll reveal animations (IntersectionObserver)
   - Screenshot lightbox (open/close/keyboard/outside click)
   - Smooth scroll for all anchor links
   - Reduced-motion awareness
   ============================================================ */

(function () {
  'use strict';

  /* ── REDUCED MOTION CHECK ─────────────────────────────── */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ── DOM REFERENCES ───────────────────────────────────── */
  const navHeader   = document.getElementById('nav-header');
  const navToggle   = document.getElementById('nav-toggle');
  const navMenu     = document.getElementById('nav-menu');
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');
  const revealEls   = document.querySelectorAll('.reveal');
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbCaption   = document.getElementById('lightbox-caption');
  const lbClose     = document.getElementById('lightbox-close');
  const lbBackdrop  = document.getElementById('lightbox-backdrop');
  const lbTriggers  = document.querySelectorAll('.lightbox-trigger');

  /* ── UTILITY: DEBOUNCE ────────────────────────────────── */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ── UTILITY: TRAP FOCUS ─────────────────────────────── */
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener('keydown', handleTab);
    return function removeTrap() {
      container.removeEventListener('keydown', handleTab);
    };
  }

  /* ──────────────────────────────────────────────────────
     1. STICKY NAV — add/remove shadow on scroll
  ─────────────────────────────────────────────────────── */
  function handleNavScroll() {
    if (window.scrollY > 20) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', debounce(handleNavScroll, 8), { passive: true });
  handleNavScroll(); // run once on load

  /* ──────────────────────────────────────────────────────
     2. ACTIVE NAV LINK — highlight current section
  ─────────────────────────────────────────────────────── */
  // Map section ids to nav href values
  // Nav covers: overview, structure, execution, timeline, monitoring, quality, approach
  // Extra sections (logistics, adaptability, background, contact) don't have nav links
  // but we handle them gracefully.

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href'); // e.g. "#overview"
      if (href === '#' + id) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'location');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // Use IntersectionObserver for section tracking
  const sectionObserverOptions = {
    root: null,
    // Trigger when section is ~25% into the viewport
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, sectionObserverOptions);

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ──────────────────────────────────────────────────────
     3. MOBILE MENU — toggle open/close
  ─────────────────────────────────────────────────────── */
  let removeFocusTrap = null;
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Move focus into menu
    const firstLink = navMenu.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
    // Trap focus within header while menu is open
    removeFocusTrap = trapFocus(navHeader);
  }

  function closeMenu() {
    menuOpen = false;
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    navToggle.focus();
    if (removeFocusTrap) {
      removeFocusTrap();
      removeFocusTrap = null;
    }
  }

  navToggle.addEventListener('click', function () {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when a nav link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (menuOpen) closeMenu();
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
    }
  });

  // Close menu when clicking outside the header
  document.addEventListener('click', function (e) {
    if (menuOpen && !navHeader.contains(e.target)) {
      closeMenu();
    }
  });

  /* ──────────────────────────────────────────────────────
     4. SCROLL REVEAL — fade/slide in elements on scroll
  ─────────────────────────────────────────────────────── */
  if (prefersReducedMotion) {
    // Skip animation, just make everything visible
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  } else {
    const revealObserverOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // animate once only
        }
      });
    }, revealObserverOptions);

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ──────────────────────────────────────────────────────
     5. SMOOTH SCROLLING — all anchor links
  ─────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = navHeader ? navHeader.offsetHeight : 68;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      if (prefersReducedMotion) {
        window.scrollTo({ top: targetTop });
      } else {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }

      // Update URL without jump
      history.pushState(null, '', targetId);
    });
  });

  /* ──────────────────────────────────────────────────────
     6. LIGHTBOX — open/close screenshots
  ─────────────────────────────────────────────────────── */
  let lightboxOpen = false;
  let lastFocusedEl = null;
  let removeLightboxTrap = null;

  function openLightbox(src, alt, caption) {
    lastFocusedEl = document.activeElement;

    lbImg.src = src;
    lbImg.alt = alt || caption || 'Screenshot';
    lbCaption.textContent = caption || '';

    lightbox.setAttribute('aria-hidden', 'false');
    lightboxOpen = true;
    document.body.style.overflow = 'hidden';

    // Focus close button after transition
    setTimeout(function () {
      lbClose.focus();
      removeLightboxTrap = trapFocus(lightbox);
    }, 50);
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxOpen = false;
    document.body.style.overflow = '';

    // Clear src after transition to avoid flash
    setTimeout(function () {
      lbImg.src = '';
      lbImg.alt = '';
      lbCaption.textContent = '';
    }, 300);

    if (removeLightboxTrap) {
      removeLightboxTrap();
      removeLightboxTrap = null;
    }

    if (lastFocusedEl) {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
  }

  // Open lightbox on trigger click
  lbTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const src     = this.dataset.src     || this.src;
      const caption = this.dataset.caption || '';
      const alt     = this.alt             || caption;
      openLightbox(src, alt, caption);
    });

    // Allow keyboard activation via Enter/Space
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src     = this.dataset.src     || this.src;
        const caption = this.dataset.caption || '';
        const alt     = this.alt             || caption;
        openLightbox(src, alt, caption);
      }
    });

    // Make images keyboard focusable
    if (!trigger.hasAttribute('tabindex')) {
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('role', 'button');
    }
  });

  // Close on close button
  lbClose.addEventListener('click', closeLightbox);

  // Close on backdrop click
  lbBackdrop.addEventListener('click', closeLightbox);

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightboxOpen) {
      closeLightbox();
    }
  });

  // Prevent clicks inside the image container from closing
  lightbox.querySelector('.lightbox-container').addEventListener('click', function (e) {
    e.stopPropagation();
  });

  /* ──────────────────────────────────────────────────────
     7. HERO PARALLAX (subtle, desktop only)
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const heroVisual = document.querySelector('.hero-visual');

    if (heroVisual && window.innerWidth > 768) {
      window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight * 1.2) {
          heroVisual.style.transform = 'translateY(' + (scrollY * 0.06) + 'px)';
        }
      }, { passive: true });
    }
  }

  /* ──────────────────────────────────────────────────────
     8. PHASE CARD STAGGER (on reveal)
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const phaseCards = document.querySelectorAll('.phase-card');
    phaseCards.forEach(function (card, i) {
      card.style.transitionDelay = (i * 0.07) + 's';
    });

    const approachSteps = document.querySelectorAll('.approach-step');
    approachSteps.forEach(function (step, i) {
      step.style.transitionDelay = (i * 0.06) + 's';
    });

    const fqItems = document.querySelectorAll('.fq-item');
    fqItems.forEach(function (item, i) {
      item.style.transitionDelay = (i * 0.07) + 's';
    });

    const strengthItems = document.querySelectorAll('.strength-item');
    strengthItems.forEach(function (item, i) {
      item.style.transitionDelay = (i * 0.05) + 's';
    });

    const adaptItems = document.querySelectorAll('.adapt-item');
    adaptItems.forEach(function (item, i) {
      item.style.transitionDelay = (i * 0.04) + 's';
    });

    const cards = document.querySelectorAll('.card-grid .card');
    cards.forEach(function (card, i) {
      card.style.transitionDelay = (i * 0.06) + 's';
    });
  }

  /* ──────────────────────────────────────────────────────
     9. DEPENDENCY CHAIN HOVER HIGHLIGHT
  ─────────────────────────────────────────────────────── */
  const depNodes = document.querySelectorAll('.dep-node');
  depNodes.forEach(function (node) {
    node.addEventListener('mouseenter', function () {
      node.style.cursor = 'default';
    });
  });

  /* ──────────────────────────────────────────────────────
     10. STATUS CHIP ENTRANCE ANIMATION
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const statusChips = document.querySelectorAll('.status-chip');
    statusChips.forEach(function (chip, i) {
      chip.style.opacity = '0';
      chip.style.transform = 'translateX(-12px)';
      chip.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      chip.style.transitionDelay = (i * 0.08) + 's';
    });

    const statusObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const chips = entry.target.querySelectorAll('.status-chip');
          chips.forEach(function (chip) {
            chip.style.opacity = '1';
            chip.style.transform = 'translateX(0)';
          });
          statusObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const statusList = document.querySelector('.status-list');
    if (statusList) statusObserver.observe(statusList);
  }

  /* ──────────────────────────────────────────────────────
     11. LOGISTICS STEP ENTRANCE
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const logisticsSteps = document.querySelectorAll('.logistics-step');
    logisticsSteps.forEach(function (step, i) {
      step.style.opacity = '0';
      step.style.transform = 'translateX(-16px)';
      step.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      step.style.transitionDelay = (i * 0.1) + 's';
    });

    const logisticsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const steps = entry.target.querySelectorAll('.logistics-step');
          steps.forEach(function (step) {
            step.style.opacity = '1';
            step.style.transform = 'translateX(0)';
          });
          logisticsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const logisticsFlow = document.querySelector('.logistics-flow');
    if (logisticsFlow) logisticsObserver.observe(logisticsFlow);
  }

  /* ──────────────────────────────────────────────────────
     12. QFLOW STEP ENTRANCE
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.quality-card').forEach(function (card) {
      const steps = card.querySelectorAll('.qflow-step');
      steps.forEach(function (step, i) {
        step.style.opacity = '0';
        step.style.transform = 'translateY(8px)';
        step.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        step.style.transitionDelay = (i * 0.06) + 's';
      });

      const qObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const s = entry.target.querySelectorAll('.qflow-step');
            s.forEach(function (step) {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            });
            qObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      qObserver.observe(card);
    });
  }

  /* ──────────────────────────────────────────────────────
     13. APPROACH CLOSING LINE — counter-up feel (CSS class)
  ─────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const approachClosing = document.querySelector('.approach-closing');
    if (approachClosing) {
      approachClosing.style.opacity = '0';
      approachClosing.style.transform = 'translateY(24px)';
      approachClosing.style.transition = 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s';

      const closingObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            approachClosing.style.opacity = '1';
            approachClosing.style.transform = 'translateY(0)';
            closingObserver.unobserve(approachClosing);
          }
        });
      }, { threshold: 0.5 });

      closingObserver.observe(approachClosing);
    }
  }

  /* ──────────────────────────────────────────────────────
     14. WINDOW RESIZE — close mobile menu if resizing
         to desktop width
  ─────────────────────────────────────────────────────── */
  window.addEventListener('resize', debounce(function () {
    if (window.innerWidth > 900 && menuOpen) {
      closeMenu();
    }
  }, 100));

})();

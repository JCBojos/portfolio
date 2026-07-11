/* particles.js — Hero canvas: code-syntax constellation mesh */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -9999, y: -9999 };
  const NODE_COUNT = 60;
  const MAX_DIST = 140;
  const SNIPPETS = ['<div>', '</>', 'fn()', '{}', '=>', 'CSS', 'HTML', 'JS', '[]', 'const', 'let', '@', '#', 'php', 'WP'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createNode() {
    return {
      x:    rand(0, W),
      y:    rand(0, H),
      vx:   rand(-0.3, 0.3),
      vy:   rand(-0.3, 0.3),
      size: rand(1.5, 3),
      label: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
      opacity: rand(0.15, 0.5),
    };
  }

  function init() {
    resize();
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) nodes.push(createNode());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Update positions */
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20)  n.x = W + 20;
      if (n.x > W+20) n.x = -20;
      if (n.y < -20)  n.y = H + 20;
      if (n.y > H+20) n.y = -20;

      /* Mouse repel */
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        n.x += dx / dist * 1.2;
        n.y += dy / dist * 1.2;
      }
    });

    /* Draw connections */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    /* Draw nodes & labels */
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${n.opacity})`;
      ctx.fill();

      ctx.font = '10px "Space Mono", monospace';
      ctx.fillStyle = `rgba(100, 116, 139, ${n.opacity * 0.7})`;
      ctx.fillText(n.label, n.x + 6, n.y - 4);
    });

    requestAnimationFrame(draw);
  }

  /* Events */
  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  init();
  draw();
})();


/* animations.js — Scroll reveal, animated counters, skill bars */
(function () {
  'use strict';

  /* ==================== SCROLL REVEAL ==================== */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ==================== ANIMATED COUNTERS ==================== */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }

    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('.stats__number[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* ==================== SKILL BARS ==================== */
  const skillFills = document.querySelectorAll('.skill-item__fill');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillFills.forEach(el => skillObserver.observe(el));

  /* ==================== TYPING EFFECT ==================== */
  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const words = ['Experiences', 'Interfaces', 'Solutions', 'Websites', 'Stories'];
    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let pausing = false;

    function type() {
      if (pausing) return;

      const current = words[wordIdx];

      if (deleting) {
        charIdx--;
        typedEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          wordIdx = (wordIdx + 1) % words.length;
          pausing = true;
          setTimeout(() => { pausing = false; type(); }, 400);
          return;
        }
        setTimeout(type, 50);
      } else {
        charIdx++;
        typedEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          pausing = true;
          setTimeout(() => {
            pausing = false;
            deleting = true;
            type();
          }, 2200);
          return;
        }
        setTimeout(type, 90);
      }
    }

    // Start after hero animation
    setTimeout(type, 1200);
  }

  /* ==================== TIMELINE LINE DRAW ==================== */
  const timelineLine = document.querySelector('.timeline__line');
  if (timelineLine) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timelineLine.style.animation = 'growLine 1.2s var(--ease-out) forwards';
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    lineObserver.observe(timelineLine);
  }

})();


/* script.js — Nav, loader, cursor, form, back-to-top, misc */
(function () {
  'use strict';

  /* ==================== LOADER ==================== */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 1800);
    });
  }

  /* ==================== CUSTOM CURSOR ==================== */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
    let fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      fx += (e.clientX - fx) * 0.12;
      fy += (e.clientY - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
    });

    /* Smooth follower via rAF */
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    (function animFollower() {
      fx += (mouseX - fx) * 0.1;
      fy += (mouseY - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(animFollower);
    })();

    /* Hover state on interactive elements */
    const hoverEls = document.querySelectorAll('a, button, .glass-card, .tool-badge, .project-card');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover');
        follower.classList.add('cursor-follower--hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        follower.classList.remove('cursor-follower--hover');
      });
    });
  }

  /* ==================== THEME TOGGLE ==================== */
  (function () {
    const root = document.documentElement;
    const toggles = document.querySelectorAll('.theme-toggle');
    const mobileLabels = document.querySelectorAll('.theme-toggle--mobile .theme-toggle__label');
    const themeMeta = document.getElementById('theme-color-meta');

    function readStoredTheme() {
      try { return localStorage.getItem('theme'); } catch (e) { return null; }
    }
    function writeStoredTheme(value) {
      try { localStorage.setItem('theme', value); } catch (e) { /* ignore, theme just won't persist */ }
    }

    function applyTheme(theme) {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#F7F8FB' : '#080B14');
      toggles.forEach(btn => btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false'));
      mobileLabels.forEach(label => { label.textContent = theme === 'light' ? 'Dark mode' : 'Light mode'; });
    }

    let current = readStoredTheme() || (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    applyTheme(current);

    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        current = current === 'light' ? 'dark' : 'light';
        applyTheme(current);
        writeStoredTheme(current);
      });
    });
  })();

  /* ==================== NAVIGATION ==================== */
  const header    = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');
  const navLinks  = document.querySelectorAll('.nav__link');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link');

  /* Scroll-based header */
  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile toggle */
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const open = navMobile.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }); 

    // Remove mobile menu state on desktop
    const closeMobileMenu = () => {
      if (window.innerWidth >= 1000) {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    };

    window.addEventListener('resize', closeMobileMenu);
    closeMobileMenu();
  }

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('section[id]');

  const activateNav = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', activateNav, { passive: true });

  /* Smooth scroll for all anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ==================== BACK TO TOP ==================== */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      backToTop.classList.toggle('visible', window.scrollY > scrollableHeight / 2);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==================== CONTACT FORM ==================== */
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');

  if (form) {
    const fields = {
      name:    { el: form.querySelector('#name'),    error: 'Please enter your name.' },
      email:   { el: form.querySelector('#email'),   error: 'Please enter a valid email.' },
      subject: { el: form.querySelector('#subject'), error: 'Please enter a subject.' },
      message: { el: form.querySelector('#message'), error: 'Please enter a message.' },
    };

    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function validateField(key) {
      const { el, error } = fields[key];
      const errEl = el.parentElement.querySelector('.form__error');
      const value = el.value.trim();
      let valid = value.length > 0;
      if (key === 'email') valid = validateEmail(value);

      el.classList.toggle('error', !valid);
      errEl.textContent = valid ? '' : error;
      return valid;
    }

    /* Live validation */
    Object.keys(fields).forEach(key => {
      fields[key].el.addEventListener('blur', () => validateField(key));
      fields[key].el.addEventListener('input', () => {
        if (fields[key].el.classList.contains('error')) validateField(key);
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const valid = Object.keys(fields).map(validateField).every(Boolean);
      if (!valid) return;

      submitBtn.classList.add('btn--loading');
      submitBtn.disabled = true;

      /* Simulate send (replace with real endpoint) */
      await new Promise(r => setTimeout(r, 1500));

      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
      form.reset();

      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
    });
  }

  /* ==================== FOOTER YEAR ==================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Visitor counter (footer) — counts unique visitors (one increment per browser)
  const visitCountEl = document.getElementById('visit-count');
  if (visitCountEl) {
    const NAMESPACE = 'jcbojos-portfolio';
    const KEY = 'site-visits';
    const STORAGE_FLAG = 'jc_visited';

    let alreadyVisited = false;
    try {
      alreadyVisited = localStorage.getItem(STORAGE_FLAG) === 'true';
    } catch (e) {
      alreadyVisited = false;
    }

    const endpoint = alreadyVisited
      ? `https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`
      : `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error('Bad response');
        return res.json();
      })
      .then((data) => {
        visitCountEl.textContent = Number(data.value).toLocaleString();
        if (!alreadyVisited) {
          try {
            localStorage.setItem(STORAGE_FLAG, 'true');
          } catch (e) {
            /* ignore */
          }
        }
      })
      .catch(() => {
        visitCountEl.textContent = '0';
      });
  }

  /* ==================== MARQUEE PAUSE ON HOVER ==================== */
  const marquee = document.querySelector('.techstack__track');
  if (marquee) {
    marquee.parentElement.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.parentElement.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  }

  

  const heartBtn = document.querySelector('.heart-btn');

  const COLORS = [
      '#00E5FF', // Cyan
      '#ff00ff', // Pink
      '#FF3B3B', // Red
      '#A855F7'  // Purple
  ];

  const TECH_WORDS = [
    "<html>",
    "{css}",
    "JS",
    "PHP",
    "SQL",
    "Git",
    "npm",
    "API",
    "DOM",
    "JSON",
    "Flex",
    "Grid",
    "@media",
    "fetch()",
    "async",
    "await",
    "const",
    "let",
    "class",
    "import",
    "export",
    "commit",
    "push",
    "merge",
    "build",
    "deploy",
    "debug",
    "render",
    "optimize",
    "animate"
];

  let hoverCooldown = false;

  heartBtn.addEventListener("click", explode);

  heartBtn.addEventListener("mouseenter", () => {
      if (hoverCooldown) return;

      hoverCooldown = true;
      explode();

      setTimeout(() => {
          hoverCooldown = false;
      }, 800);
  });

  function explode() {

      const rect = heartBtn.getBoundingClientRect();

      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      burstWords(originX, originY, 180, 750);

  }

  function burstWords(x, y, amount, distance) {

      for (let i = 0; i < amount; i++) {

          const particle = document.createElement("span");
          particle.className = "particle";

          particle.textContent =
              TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)];

          particle.style.left = `${x}px`;
          particle.style.top = `${y}px`;

          particle.style.color =
              COLORS[Math.floor(Math.random() * COLORS.length)];

          particle.style.fontSize =
              `${12 + Math.random() * 12}px`;

          particle.style.fontWeight = "700";
          particle.style.fontFamily =
              "Inter, Poppins, Segoe UI, sans-serif";

          particle.style.whiteSpace = "nowrap";

          // Random direction (360°)
          const angle = Math.random() * Math.PI * 2;

          // Random distance
          const power = distance * (0.3 + Math.random() * 0.9);

          const dx = Math.cos(angle) * power;
          const dy = Math.sin(angle) * power;

          particle.style.setProperty("--x", `${dx}px`);
          particle.style.setProperty("--y", `${dy}px`);
          particle.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);

          particle.style.animationDuration =
              `${2200 + Math.random() * 1000}ms`;

          document.body.appendChild(particle);

          particle.addEventListener("animationend", () => {
              particle.remove();
          });

      }

  }

})();


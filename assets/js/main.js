/* ==========================================================================
   Dr. Neema Bhat — Homepage interactions
   ========================================================================== */

/* Contact details — update here and every phone link / label on the page follows. */
const CONFIG = {
  phoneDisplay: '+91 78997 56677',
  phoneE164: '+917899756677',
  whatsapp: '917899756677', // digits only, with country code
  location: 'Bhagawan Mahaveer Jain Hospital, Bangalore',
};

(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Contact config ---------- */
  $$('[data-phone-link]').forEach((a) => { a.href = `tel:${CONFIG.phoneE164}`; });
  $$('[data-whatsapp-link]').forEach((a) => { a.href = `https://wa.me/${CONFIG.whatsapp}`; });
  $$('[data-phone-text]').forEach((el) => { el.textContent = CONFIG.phoneDisplay; });
  $$('[data-location]').forEach((el) => { el.textContent = CONFIG.location; });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Split headings into words ---------- */
  $$('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.innerHTML = words
      .map((w, i) => `<span class="w" aria-hidden="true"><span class="w__i" style="--wi:${i}">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`)
      .join(' ');
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], [data-split]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in', 'is-settled'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-in');
        const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
        setTimeout(() => el.classList.add('is-settled'), 1400 + delay * 1000);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Navigation ---------- */
  const header = $('.site-header');
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const links = $('#nav-links');
  const mobileCta = $('.mobile-cta');
  const hero = $('.hero');

  $$('li', links).forEach((li, i) => li.style.setProperty('--li', i));

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) $('a', links)?.focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 12);
    if (y < hero.offsetHeight * 0.5) navMap.forEach((l) => l.classList.remove('is-active'));
    header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    if (mobileCta) mobileCta.classList.toggle('is-visible', y > hero.offsetHeight * 0.55);
    updateJourney();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  // Active nav link
  const navMap = new Map($$('a[href^="#"]', links).map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const a = navMap.get(entry.target.id);
        if (a && entry.isIntersecting) {
          navMap.forEach((l) => l.classList.remove('is-active'));
          a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Pointer effects: spotlight, tilt, magnetic, parallax ---------- */
  if (finePointer && !reduceMotion) {
    $$('.spotlight').forEach((card) => {
      const isTilt = card.classList.contains('tilt');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        if (isTilt) {
          card.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`);
          card.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`);
        }
      });
      if (isTilt) {
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      }
    });

    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.setProperty('--bx', `${clamp(dx * 0.18, -7, 7)}px`);
        btn.style.setProperty('--by', `${clamp(dy * 0.28, -5, 5)}px`);
        btn.style.setProperty('--hx', `${e.clientX - r.left}px`);
        btn.style.setProperty('--hy', `${e.clientY - r.top}px`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--bx', '0px');
        btn.style.setProperty('--by', '0px');
      });
    });

    const portrait = $('[data-parallax]');
    if (portrait && hero) {
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        portrait.style.setProperty('--px', `${(nx * -14).toFixed(1)}px`);
        portrait.style.setProperty('--py', `${(ny * -10).toFixed(1)}px`);
      });
      hero.addEventListener('pointerleave', () => {
        portrait.style.setProperty('--px', '0px');
        portrait.style.setProperty('--py', '0px');
      });
    }
  }

  /* ---------- Microscopic cell field (canvas) ---------- */
  class CellField {
    constructor(canvas, { dark = false } = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dark = dark;
      this.cells = [];
      this.mouse = { x: -9999, y: -9999, tx: 0, ty: 0, px: 0, py: 0 };
      this.running = false;
      this.sprites = this.makeSprites();
      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
      const host = canvas.parentElement;
      host.addEventListener('pointermove', (e) => {
        const r = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - r.left;
        this.mouse.y = e.clientY - r.top;
        this.mouse.tx = (this.mouse.x / r.width - 0.5);
        this.mouse.ty = (this.mouse.y / r.height - 0.5);
      });
      host.addEventListener('pointerleave', () => { this.mouse.x = this.mouse.y = -9999; this.mouse.tx = this.mouse.ty = 0; });
      if (reduceMotion) { this.draw(0); return; }
      this.inView = false;
      new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting;
        if (this.inView) this.start(); else this.stop();
      }).observe(canvas);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop(); else if (this.inView) this.start();
      });
    }

    makeSprite(size, paint) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      paint(c.getContext('2d'), size);
      return c;
    }

    makeSprites() {
      const d = this.dark;
      const rbcEdge = d ? 'rgba(238,149,128,0.55)' : 'rgba(224,72,70,0.42)';
      const rbcMid = d ? 'rgba(238,149,128,0.28)' : 'rgba(238,149,128,0.30)';
      const rbcCore = d ? 'rgba(238,149,128,0.10)' : 'rgba(252,236,230,0.35)';
      const rbc = (blur) => this.makeSprite(128, (g, s) => {
        if (blur) g.filter = 'blur(5px)';
        const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.42);
        grd.addColorStop(0, rbcCore);
        grd.addColorStop(0.45, rbcMid);
        grd.addColorStop(0.82, rbcEdge);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.beginPath(); g.arc(s / 2, s / 2, s * 0.42, 0, Math.PI * 2); g.fill();
      });
      const wbc = (blur) => this.makeSprite(128, (g, s) => {
        if (blur) g.filter = 'blur(5px)';
        g.fillStyle = d ? 'rgba(191,222,219,0.16)' : 'rgba(43,139,142,0.12)';
        g.strokeStyle = d ? 'rgba(191,222,219,0.35)' : 'rgba(43,139,142,0.28)';
        g.lineWidth = 2;
        g.beginPath(); g.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = d ? 'rgba(191,222,219,0.35)' : 'rgba(100,28,69,0.22)';
        [[-0.12, -0.08, 0.14], [0.1, -0.1, 0.12], [0.02, 0.12, 0.13]].forEach(([x, y, r]) => {
          g.beginPath(); g.arc(s / 2 + x * s, s / 2 + y * s, r * s, 0, Math.PI * 2); g.fill();
        });
      });
      const plt = this.makeSprite(32, (g, s) => {
        g.fillStyle = d ? 'rgba(233,220,198,0.55)' : 'rgba(176,141,87,0.45)';
        g.beginPath(); g.ellipse(s / 2, s / 2, s * 0.36, s * 0.24, 0.4, 0, Math.PI * 2); g.fill();
      });
      return { rbc: rbc(false), rbcBlur: rbc(true), wbc: wbc(false), wbcBlur: wbc(true), plt };
    }

    resize() {
      const { clientWidth: w, clientHeight: h } = this.canvas;
      if (!w || !h) return;
      // Phones and tablets: fewer cells, lower pixel density, 30fps
      this.lite = w < 768 || !finePointer;
      const dpr = Math.min(window.devicePixelRatio || 1, this.lite ? 1.5 : 2);
      const widthChanged = w !== this.w;
      this.w = w; this.h = h;
      this.canvas.width = w * dpr; this.canvas.height = h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // mobile browser bars change the height while scrolling — keep existing cells then
      if (widthChanged || !this.cells.length) {
        const max = this.lite ? 18 : 42;
        let count = clamp(Math.round((w * h) / (this.dark ? 42000 : 34000)), 10, max);
        if (this.degraded) count = Math.ceil(count / 2);
        this.cells = Array.from({ length: count }, () => this.spawn());
      }
      if (reduceMotion) this.draw(0);
    }

    spawn() {
      const z = 0.35 + Math.random() * 0.65; // depth
      const r = Math.random();
      const type = r < 0.68 ? 'rbc' : r < 0.84 ? 'wbc' : 'plt';
      const base = type === 'plt' ? 7 : type === 'wbc' ? 34 : 30;
      return {
        type, z,
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: base * (0.55 + z * 0.9),
        vx: (Math.random() - 0.5) * 0.12 * z,
        vy: (-0.04 - Math.random() * 0.12) * z,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.004,
        tumble: Math.random() * Math.PI * 2,
        vt: 0.002 + Math.random() * 0.006,
        ox: 0, oy: 0,
      };
    }

    start() {
      if (this.running || document.hidden) return;
      this.running = true;
      this.last = performance.now();
      this.frames = 0; this.slow = 0;
      requestAnimationFrame((t) => this.loop(t));
    }
    stop() { this.running = false; }

    loop(t) {
      if (!this.running) return;
      requestAnimationFrame((n) => this.loop(n));
      const elapsed = t - this.last;
      if (this.lite && elapsed < 30) return; // ~30fps on phones
      this.last = t;
      // If the device struggles, halve the number of cells once
      if (!this.degraded && ++this.frames > 20) {
        if (elapsed > (this.lite ? 50 : 34)) this.slow++;
        if (this.slow > 20) { this.degraded = true; this.cells.length = Math.ceil(this.cells.length / 2); }
      }
      const dt = Math.min(48, elapsed) / 16.67;
      this.update(dt);
      this.draw(t);
    }

    update(dt) {
      const m = this.mouse;
      m.px += (m.tx - m.px) * 0.05;
      m.py += (m.ty - m.py) * 0.05;
      const pad = 60;
      for (const c of this.cells) {
        c.x += c.vx * dt; c.y += c.vy * dt;
        c.rot += c.vr * dt; c.tumble += c.vt * dt;
        // gentle repulsion around the pointer
        const dx = c.x - m.x, dy = c.y - m.y;
        const dist2 = dx * dx + dy * dy;
        const R = 150;
        if (dist2 < R * R) {
          const f = (1 - Math.sqrt(dist2) / R) * 2.2 * c.z;
          const d = Math.sqrt(dist2) || 1;
          c.ox += (dx / d) * f; c.oy += (dy / d) * f;
        }
        c.ox *= 0.94; c.oy *= 0.94;
        if (c.y < -pad) { c.y = this.h + pad; c.x = Math.random() * this.w; }
        if (c.x < -pad) c.x = this.w + pad;
        if (c.x > this.w + pad) c.x = -pad;
      }
    }

    draw() {
      const { ctx, w, h } = this;
      if (!w) return;
      ctx.clearRect(0, 0, w, h);
      const m = this.mouse;
      for (const c of this.cells) {
        const x = c.x + c.ox - m.px * 40 * c.z;
        const y = c.y + c.oy - m.py * 30 * c.z;
        // keep the text side of the hero calm
        let fade = 1;
        if (!this.dark && w > 960) fade = clamp((x / w - 0.42) / 0.25, 0, 1) * 0.75 + 0.03;
        else if (!this.dark) fade = 0.3;
        if (fade <= 0.01) continue;
        ctx.globalAlpha = (0.3 + c.z * 0.5) * fade;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(c.rot);
        if (c.type === 'rbc') {
          // tumbling disc: squash along one axis for a 3D feel
          ctx.scale(1, 0.38 + 0.62 * Math.abs(Math.cos(c.tumble)));
          const img = c.z < 0.55 && !this.lite ? this.sprites.rbcBlur : this.sprites.rbc;
          ctx.drawImage(img, -c.size, -c.size, c.size * 2, c.size * 2);
        } else if (c.type === 'wbc') {
          const img = c.z < 0.55 && !this.lite ? this.sprites.wbcBlur : this.sprites.wbc;
          ctx.drawImage(img, -c.size, -c.size, c.size * 2, c.size * 2);
        } else {
          ctx.drawImage(this.sprites.plt, -c.size, -c.size, c.size * 2, c.size * 2);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  $$('.cells-canvas').forEach((cv) => new CellField(cv, { dark: cv.classList.contains('cells-canvas--dark') }));

  /* ---------- Services explorer (panel on desktop, accordion on mobile) ---------- */
  const svc = $('[data-svc]');
  if (svc) {
    const items = $$('.svc-item', svc);
    const desktop = window.matchMedia('(min-width: 961px)');
    const setActive = (item, toggle = false) => {
      const closing = toggle && !desktop.matches && item.classList.contains('is-active');
      items.forEach((it) => {
        const on = it === item && !closing;
        it.classList.toggle('is-active', on);
        $('.svc-item__btn', it).setAttribute('aria-expanded', String(on));
      });
    };
    let hoverTimer = null;
    items.forEach((it) => {
      const btn = $('.svc-item__btn', it);
      btn.addEventListener('click', () => setActive(it, true));
      btn.addEventListener('focus', () => { if (desktop.matches) setActive(it); });
      btn.addEventListener('pointerenter', () => {
        if (!desktop.matches || !finePointer) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => setActive(it), 120);
      });
      btn.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    });
    // Desktop always shows one panel
    desktop.addEventListener('change', (e) => {
      if (e.matches && !items.some((it) => it.classList.contains('is-active'))) setActive(items[0]);
    });
  }

  /* ---------- Conditions tabs ---------- */
  $$('[data-tabs]').forEach((wrap) => {
    const list = $('[role="tablist"]', wrap);
    const tabs = $$('[role="tab"]', list);
    const indicator = $('.tabs__indicator', list);

    const moveIndicator = (tab) => {
      indicator.style.setProperty('--ix', `${tab.offsetLeft}px`);
      indicator.style.setProperty('--iw', `${tab.offsetWidth}px`);
    };

    const select = (tab, focus = true) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on && !reduceMotion) {
          $$('.cond', panel).forEach((c, i) => c.style.setProperty('--i', i));
          panel.classList.remove('is-entering');
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });
      moveIndicator(tab);
      if (focus) tab.focus();
      const l = list.getBoundingClientRect(), r = tab.getBoundingClientRect();
      if (r.left < l.left || r.right > l.right) list.scrollBy({ left: r.left - l.left - 24, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n); }
      });
    });

    const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    moveIndicator(current());
    new ResizeObserver(() => moveIndicator(current())).observe(list);
    document.fonts?.ready.then(() => moveIndicator(current()));
  });

  /* ---------- BMT: autologous / allogeneic switch ---------- */
  const bmtSwitch = $('.bmt-switch');
  if (bmtSwitch) {
    const radios = $$('[role="radio"]', bmtSwitch);
    const setMode = (btn, focus) => {
      const mode = btn.dataset.bmt;
      bmtSwitch.dataset.mode = mode;
      radios.forEach((r) => {
        const on = r === btn;
        r.setAttribute('aria-checked', String(on));
        r.tabIndex = on ? 0 : -1;
      });
      $$('[data-bmt-text]', bmtSwitch).forEach((p) => { p.hidden = p.dataset.bmtText !== mode; });
      if (focus) btn.focus();
    };
    radios.forEach((r, i) => {
      r.addEventListener('click', () => setMode(r));
      r.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          setMode(radios[(i + 1) % radios.length], true);
        }
      });
    });
    setMode(radios[0]);
  }

  /* ---------- BMT: stage dial ---------- */
  const STAGES = [
    { title: 'Evaluation', text: 'Detailed tests, donor matching and counselling so the family understands every step.' },
    { title: 'Conditioning', text: 'Chemotherapy, sometimes with radiation, prepares the marrow to receive new cells.' },
    { title: 'Stem Cell Infusion', text: 'Healthy stem cells are given through a drip — much like a blood transfusion.' },
    { title: 'Engraftment', text: 'New cells settle in the marrow and begin making blood, with close monitoring and protection from infection.' },
    { title: 'Recovery & Follow-up', text: 'A gradual return to daily life, with long-term follow-up for immunity, growth and wellbeing.' },
  ];
  const dial = $('[data-dial]');
  if (dial) {
    const btns = $$('[data-step]', dial);
    const center = $('.dial__center', dial);
    const num = $('[data-dial-num]', dial);
    const title = $('[data-dial-title]', dial);
    const text = $('[data-dial-text]', dial);
    let idx = 0, timer = null, paused = false, inView = false;

    btns.forEach((b, i) => b.setAttribute('aria-label', `Stage ${i + 1}: ${STAGES[i].title}`));

    const show = (i) => {
      idx = i;
      btns.forEach((b, j) => {
        b.setAttribute('aria-pressed', String(j === i));
        b.classList.toggle('is-done', j < i);
      });
      dial.style.setProperty('--dash', 100 - (i + 1) * 20);
      num.textContent = String(i + 1).padStart(2, '0');
      title.textContent = STAGES[i].title;
      text.textContent = STAGES[i].text;
      if (!reduceMotion) {
        center.classList.remove('is-swapping');
        void center.offsetWidth;
        center.classList.add('is-swapping');
      }
    };
    const tick = () => { if (!paused && inView) show((idx + 1) % STAGES.length); };
    const run = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(tick, 4200); };

    btns.forEach((b, i) => b.addEventListener('click', () => { show(i); run(); }));
    dial.addEventListener('pointerenter', () => { paused = true; });
    dial.addEventListener('pointerleave', () => { paused = false; });
    dial.addEventListener('focusin', () => { paused = true; });
    dial.addEventListener('focusout', () => { paused = false; });
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.4 }).observe(dial);
    show(0);
    run();
  }

  /* ---------- Care journey progress ---------- */
  const journey = $('[data-journey]');
  const jsteps = journey ? $$('.jstep', journey) : [];
  function updateJourney() {
    if (!journey) return;
    const vh = window.innerHeight;
    const r = journey.getBoundingClientRect();
    const vertical = window.matchMedia('(max-width: 960px)').matches;
    let p;
    if (vertical) {
      p = clamp((vh * 0.7 - r.top) / r.height, 0, 1);
      jsteps.forEach((s) => {
        const node = $('.jstep__node', s).getBoundingClientRect();
        s.classList.toggle('is-active', node.top + node.height / 2 < vh * 0.7);
      });
    } else {
      p = clamp((vh * 0.88 - r.top) / (vh * 0.5), 0, 1);
      jsteps.forEach((s, i) => s.classList.toggle('is-active', p >= i / (jsteps.length - 1) - 0.001));
    }
    journey.style.setProperty('--p', p.toFixed(4));
  }
  if (reduceMotion && journey) {
    journey.style.setProperty('--p', 1);
    jsteps.forEach((s) => s.classList.add('is-active'));
  }

  /* ---------- Career timeline progress ---------- */
  const career = $('[data-career]');
  if (career && !reduceMotion) {
    const list = $('.career__list', career);
    const updateCareer = () => {
      const r = list.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.75 - r.top) / r.height, 0, 1);
      list.style.setProperty('--cp', p.toFixed(4));
    };
    window.addEventListener('scroll', () => requestAnimationFrame(updateCareer), { passive: true });
    updateCareer();
  }

  /* ---------- Appointment form → WhatsApp ---------- */
  const form = $('#appt-form');
  if (form) {
    const topic = $('#f-topic', form);
    $$('[data-topic]').forEach((a) => a.addEventListener('click', () => { topic.value = a.dataset.topic; }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;
      ['#f-name', '#f-phone'].forEach((sel) => {
        const input = $(sel, form);
        const ok = input.checkValidity() && input.value.trim() !== '';
        input.closest('.field').classList.toggle('is-invalid', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      const note = $('.appt-form__note', form);
      if (firstInvalid) {
        note.textContent = 'Please add the patient’s name and a valid phone number.';
        firstInvalid.focus();
        return;
      }
      const data = new FormData(form);
      const msg = [
        'Hello, I would like to request an appointment with Dr. Neema Bhat.',
        `Patient: ${data.get('name')} (${data.get('who')})`,
        `Phone: ${data.get('phone')}`,
        `Reason: ${data.get('topic')}`,
        data.get('message') ? `Notes: ${data.get('message')}` : '',
      ].filter(Boolean).join('\n');
      note.textContent = 'Opening WhatsApp with your request…';
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  onScroll();
})();

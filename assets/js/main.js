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
    const host = portrait?.closest('section');
    if (portrait && host) {
      host.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        portrait.style.setProperty('--px', `${(nx * -12).toFixed(1)}px`);
        portrait.style.setProperty('--py', `${(ny * -8).toFixed(1)}px`);
      });
      host.addEventListener('pointerleave', () => {
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
      // red blood cells: deep red rim, paler centre (biconcave disc)
      const rbcEdge = d ? 'rgba(232,64,70,0.75)' : 'rgba(200,24,36,0.62)';
      const rbcMid = d ? 'rgba(224,40,46,0.40)' : 'rgba(224,40,46,0.36)';
      const rbcCore = d ? 'rgba(240,120,120,0.14)' : 'rgba(250,190,190,0.30)';
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
        g.fillStyle = d ? 'rgba(185,226,228,0.12)' : 'rgba(15,38,93,0.06)';
        g.strokeStyle = d ? 'rgba(185,226,228,0.32)' : 'rgba(15,38,93,0.2)';
        g.lineWidth = 2;
        g.beginPath(); g.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = d ? 'rgba(185,226,228,0.3)' : 'rgba(15,38,93,0.18)';
        [[-0.12, -0.08, 0.14], [0.1, -0.1, 0.12], [0.02, 0.12, 0.13]].forEach(([x, y, r]) => {
          g.beginPath(); g.arc(s / 2 + x * s, s / 2 + y * s, r * s, 0, Math.PI * 2); g.fill();
        });
      });
      const plt = this.makeSprite(32, (g, s) => {
        g.fillStyle = d ? 'rgba(185,226,228,0.5)' : 'rgba(15,38,93,0.3)';
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
        if (!this.dark && w > 960) fade = clamp((x / w - 0.4) / 0.2, 0, 1) * 0.85 + 0.04;
        else if (!this.dark) fade = 0.35;
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

  /* ---------- Treatments filter ---------- */
  const filter = $('.treat-filter');
  const groups = $('[data-treatments]');
  if (filter && groups) {
    const btns = $$('button', filter);
    const thumb = $('.treat-filter__thumb', filter);
    const moveThumb = (b) => {
      thumb.style.setProperty('--tx', `${b.offsetLeft}px`);
      thumb.style.setProperty('--tw', `${b.offsetWidth}px`);
    };
    const apply = (b) => {
      const f = b.dataset.filter;
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      moveThumb(b);
      if (f === 'all') delete groups.dataset.filter; else groups.dataset.filter = f;
      if (reduceMotion) return;
      $$('.treat-group', groups).forEach((g) => {
        $$('.treat, .treat-group__head', g).forEach((el, i) => el.style.setProperty('--i', i));
        g.classList.remove('is-entering');
        void g.offsetWidth;
        g.classList.add('is-entering');
      });
    };
    btns.forEach((b) => b.addEventListener('click', () => apply(b)));
    const current = () => btns.find((b) => b.getAttribute('aria-pressed') === 'true');
    moveThumb(current());
    new ResizeObserver(() => moveThumb(current())).observe(filter);
    document.fonts?.ready.then(() => moveThumb(current()));
  }

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    const run = (el) => {
      const end = +el.dataset.count;
      const t0 = performance.now();
      const dur = 1600;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Gallery lightbox ---------- */
  const lb = $('#lightbox');
  const shots = $$('[data-gallery] .shot__btn');
  if (lb && shots.length && typeof lb.showModal === 'function') {
    const img = $('img', lb);
    const cap = $('figcaption', lb);
    let idx = 0, opener = null;
    const show = (i) => {
      idx = (i + shots.length) % shots.length;
      const b = shots[idx];
      const thumb = $('img', b);
      img.src = b.dataset.full;
      img.alt = thumb.alt;
      cap.textContent = $('.shot__cap', b).textContent;
      if (!reduceMotion) img.animate([{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 450, easing: 'ease-out' });
    };
    shots.forEach((b, i) => b.addEventListener('click', () => { opener = b; show(i); lb.showModal(); }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    $('.lightbox__nav--prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lightbox__nav--next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => opener?.focus());
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

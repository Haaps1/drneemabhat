/* ==========================================================================
   Dr. Neema Bhat — site interactions
   ========================================================================== */

/* Contact details — update here and every phone link / label on the page follows. */
const CONFIG = {
  phoneDisplay: '+91 78997 56677',
  phoneE164: '+917899756677',
  whatsapp: '917899756677', // digits only, with country code
  location: 'Apollo Hospitals, Bannerghatta Road',
};

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const openWhatsApp = (lines) => window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`, '_blank', 'noopener');

  /* ---------- Contact config ---------- */
  $$('[data-phone-link]').forEach((a) => { a.href = `tel:${CONFIG.phoneE164}`; });
  $$('[data-whatsapp-link]').forEach((a) => { a.href = `https://wa.me/${CONFIG.whatsapp}`; });
  $$('[data-phone-text]').forEach((el) => { el.textContent = CONFIG.phoneDisplay; });
  $$('[data-location]').forEach((el) => { el.textContent = CONFIG.location; });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in', 'settled'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('in');
        const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
        setTimeout(() => el.classList.add('settled'), 1000 + delay * 1000);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Header, progress bar, back-to-top, active links ---------- */
  const header = $('.header');
  const progress = $('.scroll-progress');
  const toTop = $('.to-top');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    progress.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    toTop.classList.toggle('show', y > 700);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const navLinks = $$('.nav-links a, .tabbar a[href^="#"], .tabbar a[data-home]');
  const setActive = (id) => navLinks.forEach((a) => a.classList.toggle('active', id === 'top' ? a.hasAttribute('data-home') : a.getAttribute('href') === `#${id}`));

  // Logo and "Home" links: back to the top of the home page
  $$('[data-home]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    setActive('top');
  }));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id || 'top'); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    [$('.hero'), ...['about', 'treatments', 'gallery', 'timings', 'appointment'].map((id) => document.getElementById(id))]
      .forEach((el) => el && spy.observe(el));
  }

  /* ---------- Pointer effects: magnetic buttons, hero parallax ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', `${clamp((e.clientX - (r.left + r.width / 2)) * 0.18, -7, 7)}px`);
        btn.style.setProperty('--by', `${clamp((e.clientY - (r.top + r.height / 2)) * 0.28, -5, 5)}px`);
      });
      btn.addEventListener('pointerleave', () => { btn.style.setProperty('--bx', '0px'); btn.style.setProperty('--by', '0px'); });
    });
    const img = $('[data-parallax]');
    const hero = $('.hero');
    if (img && hero) {
      hero.addEventListener('pointermove', (e) => {
        img.style.setProperty('--px', `${((e.clientX / window.innerWidth - 0.5) * -14).toFixed(1)}px`);
        img.style.setProperty('--py', `${((e.clientY / window.innerHeight - 0.5) * -10).toFixed(1)}px`);
      });
      hero.addEventListener('pointerleave', () => { img.style.setProperty('--px', '0px'); img.style.setProperty('--py', '0px'); });
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
      this.lite = (canvas.clientWidth || window.innerWidth) < 768 || !finePointer;
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

    renderRbcFrames(size, count, alpha) {
      // half-thickness of the cell at normalised radius r (units of the cell radius)
      const h = (r2) => 0.5 * Math.sqrt(Math.max(0, 1 - r2)) * (0.207 + 2.003 * r2 - 1.123 * r2 * r2);
      const L = [-0.48, -0.62, 0.62]; { const m = Math.hypot(...L); L[0] /= m; L[1] /= m; L[2] /= m; }
      const H = [L[0], L[1], L[2] + 1]; { const m = Math.hypot(...H); H[0] /= m; H[1] /= m; H[2] /= m; }
      const frames = [];
      for (let k = 0; k < count; k++) {
        const tilt = (k / (count - 1)) * Math.PI / 2 * 0.97; // 0 = face-on, ~90° = edge-on
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        // signed distance-like field in world space (view along -z, disc tilted about x)
        const f = (x, y, z) => {
          const yo = y * ct + z * st, zo = -y * st + z * ct;
          const r2 = x * x + yo * yo;
          return r2 >= 1 ? Math.sqrt(r2) - 1 + Math.abs(zo) : Math.abs(zo) - h(r2); // continuous at the rim
        };
        const cv = document.createElement('canvas'); cv.width = cv.height = size;
        const g = cv.getContext('2d'); const img = g.createImageData(size, size); const d = img.data;
        const scale = 2.2 / size, STEPS = 64, e = 0.003;
        for (let py = 0; py < size; py++) {
          for (let px = 0; px < size; px++) {
            // 2×2 supersampling for smooth edges
            let R = 0, G = 0, B = 0, A = 0;
            for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
              const x = (px + 0.25 + sx * 0.5) * scale - 1.1, y = (py + 0.25 + sy * 0.5) * scale - 1.1;
              if (x * x + y * y > 1.02) continue;
              // march only through the cell's bounding slab ∩ cylinder, front to back
              let zMax = 1.2, zMin = -1.2;
              if (ct > 1e-3) { zMax = Math.min(zMax, (0.37 + y * st) / ct); zMin = Math.max(zMin, (-0.37 + y * st) / ct); }
              if (st > 1e-3) { zMax = Math.min(zMax, (1 - y * ct) / st); zMin = Math.max(zMin, (-1 - y * ct) / st); }
              if (zMax <= zMin) continue;
              let prev = zMax, hit = null;
              for (let i = 0; i <= STEPS; i++) {
                const z = zMax - ((zMax - zMin) * i) / STEPS;
                if (f(x, y, z) < 0) {
                  let lo = z, hi = prev; // refine surface crossing
                  for (let j = 0; j < 6; j++) { const m = (lo + hi) / 2; if (f(x, y, m) < 0) lo = m; else hi = m; }
                  hit = hi; break;
                }
                prev = z;
              }
              if (hit === null) continue;
              const z = hit;
              let nx = f(x + e, y, z) - f(x - e, y, z), ny = f(x, y + e, z) - f(x, y - e, z), nz = f(x, y, z + e) - f(x, y, z - e);
              const nm = Math.hypot(nx, ny, nz) || 1; nx /= nm; ny /= nm; nz /= nm;
              if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
              const diff = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
              const spec = Math.pow(Math.max(0, nx * H[0] + ny * H[1] + nz * H[2]), 36);
              const rim = Math.pow(1 - nz, 2.5);
              // deeper red where the cell is thick, lighter in the thin centre (like a real RBC)
              const yo = y * ct + z * st, r2 = x * x + yo * yo, thick = Math.min(1, h(r2) / 0.32);
              const baseR = 170 + 40 * (1 - thick), baseG = 18 + 26 * (1 - thick), baseB = 30 + 24 * (1 - thick);
              const lit = 0.3 + 0.78 * diff;
              R += Math.min(255, baseR * lit + 255 * spec * 0.55 + 90 * rim * 0.35);
              G += Math.min(255, baseG * lit + 235 * spec * 0.5 + 40 * rim * 0.35);
              B += Math.min(255, baseB * lit + 235 * spec * 0.5 + 45 * rim * 0.35);
              A += 1;
            }
            if (!A) continue;
            const o = (py * size + px) * 4;
            d[o] = R / A; d[o + 1] = G / A; d[o + 2] = B / A; d[o + 3] = 255 * alpha * (A / 4);
          }
        }
        g.putImageData(img, 0, 0);
        frames.push(cv);
      }
      return frames;
    }

    makeSprites() {
      const d = this.dark;
      const S = 192; // sprite resolution
      const alpha = d ? 0.9 : 1;

      // Red blood cell: a real 3D biconcave disc (Evans–Fung profile), ray-marched and lit
      // once per tilt angle at start-up, so every frame is just a cheap image draw.
      const rbcFrames = this.renderRbcFrames(this.lite ? 88 : 128, this.lite ? 12 : 18, alpha);
      const blurFrames = this.lite ? rbcFrames : rbcFrames.map((f) => this.makeSprite(f.width, (g) => { g.filter = 'blur(5px)'; g.drawImage(f, 0, 0); }));
      // soft contact shadow
      const shadow = this.makeSprite(96, (g, s) => {
        const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        gr.addColorStop(0, d ? 'rgba(0,0,0,.35)' : 'rgba(15,38,93,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(0, 0, s, s);
      });
      // White blood cell: translucent sphere with a textured surface and lobed nucleus
      const wbc = (blur) => this.makeSprite(S, (g, s) => {
        const c = s / 2, R = s * 0.42;
        if (blur) g.filter = 'blur(6px)';
        let gr = g.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R);
        gr.addColorStop(0, d ? 'rgba(235,245,255,.55)' : 'rgba(255,255,255,.95)');
        gr.addColorStop(0.6, d ? 'rgba(170,200,235,.35)' : 'rgba(214,226,246,.85)');
        gr.addColorStop(1, d ? 'rgba(110,140,200,.3)' : 'rgba(150,172,214,.8)');
        g.fillStyle = gr; g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.fill();
        // bumpy membrane
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2, rr = R * (0.55 + (i % 3) * 0.12);
          g.fillStyle = 'rgba(255,255,255,.18)';
          g.beginPath(); g.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, R * 0.09, 0, Math.PI * 2); g.fill();
        }
        // nucleus lobes, shaded
        [[-0.2, -0.05, 0.24], [0.16, -0.14, 0.2], [0.08, 0.2, 0.22]].forEach(([x, y, r]) => {
          const nx = c + x * R * 2, ny = c + y * R * 2, nr = r * R * 1.25;
          const ng = g.createRadialGradient(nx - nr * 0.35, ny - nr * 0.35, nr * 0.1, nx, ny, nr);
          ng.addColorStop(0, d ? 'rgba(170,150,230,.8)' : 'rgba(140,110,200,.85)');
          ng.addColorStop(1, d ? 'rgba(90,70,170,.8)' : 'rgba(78,52,150,.85)');
          g.fillStyle = ng; g.beginPath(); g.arc(nx, ny, nr, 0, Math.PI * 2); g.fill();
        });
        // specular
        gr = g.createRadialGradient(c - R * 0.45, c - R * 0.5, 0, c - R * 0.45, c - R * 0.5, R * 0.3);
        gr.addColorStop(0, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(c - R * 0.45, c - R * 0.5, R * 0.3, 0, Math.PI * 2); g.fill();
      });
      // Platelet: small shaded lens
      const plt = this.makeSprite(48, (g, s) => {
        const gr = g.createRadialGradient(s * 0.42, s * 0.4, 1, s / 2, s / 2, s * 0.36);
        gr.addColorStop(0, '#f3c2c4'); gr.addColorStop(1, d ? '#b05a70' : '#c0697a');
        g.fillStyle = gr; g.beginPath(); g.ellipse(s / 2, s / 2, s * 0.36, s * 0.24, 0.4, 0, Math.PI * 2); g.fill();
      });
      return { rbcFrames, blurFrames, shadow, wbc: wbc(false), wbcBlur: wbc(true), plt };
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
        rot: (Math.random() - 0.5) * 0.9,
        vr: (Math.random() - 0.5) * 0.0012,
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
        ctx.globalAlpha = Math.min(1, (0.55 + c.z * 0.45) * fade * (this.dark ? 0.85 : 1));
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(c.rot);
        if (c.type === 'rbc') {
          // pick the pre-rendered 3D view that matches the cell's current tilt
          const frames = c.z < 0.55 && !this.lite ? this.sprites.blurFrames : this.sprites.rbcFrames;
          const t = Math.abs(Math.sin(c.tumble));
          const img = frames[Math.min(frames.length - 1, Math.round(t * (frames.length - 1)))];
          if (c.z >= 0.55) {
            ctx.save(); ctx.globalAlpha *= 0.45; ctx.translate(c.size * 0.2, c.size * 0.36);
            ctx.scale(1, 0.55 + 0.45 * (1 - t)); ctx.drawImage(this.sprites.shadow, -c.size, -c.size, c.size * 2, c.size * 2); ctx.restore();
          }
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

  /* ---------- Hero headline: typewriter ---------- */
  const typed = $('[data-typed]');
  if (typed && !reduceMotion) {
    const words = typed.dataset.words.split('|');
    const title = typed.closest('h1');
    let w = 0, paused = false;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    title.addEventListener('pointerenter', () => { paused = true; });
    title.addEventListener('pointerleave', () => { paused = false; });
    (async function loop() {
      await wait(2200);
      for (;;) {
        while (paused || document.hidden) await wait(300);
        const cur = words[w];
        for (let i = cur.length; i >= 0; i--) { typed.textContent = cur.slice(0, i); await wait(32); }
        await wait(220);
        w = (w + 1) % words.length;
        const next = words[w];
        for (let i = 1; i <= next.length; i++) { typed.textContent = next.slice(0, i); await wait(70); }
        await wait(2200);
      }
    })();
  } else if (typed) {
    typed.closest('h1').classList.add('is-static');
  }

  /* ---------- Condition search ---------- */
  const search = $('#cond-search');
  const results = $('#search-results');
  const cards = $$('.svc-card:not(.svc-card--extra)');
  const EXTRA = {
    'Anaemia Treatment': 'iron deficiency low hemoglobin haemoglobin tired pale',
    'Thalassemia Treatment': 'thalassaemia transfusion chelation',
    'Hemophilia & Bleeding Disorders': 'haemophilia bleeding bruising platelets itp von willebrand clotting',
    'Leukaemia (Blood Cancer)': 'leukemia blood cancer aml all cml cll',
    'Lymphoma & Myeloma': 'hodgkin non-hodgkin lymph node multiple myeloma',
    'Childhood Leukaemia & Lymphoma': 'child children kids leukemia pediatric cancer',
    'Pediatric Solid Tumours': 'tumor tumour neuroblastoma wilms sarcoma retinoblastoma child',
    'Pediatric Blood Disorders': 'sickle cell aplastic anemia itp immune child',
    'Bone Marrow Transplant': 'bmt stem cell transplant donor autologous allogeneic',
  };
  if (search && results) {
    let hl = -1;
    const items = cards.map((c) => {
      const title = $('h3', c).textContent;
      return { title, card: c, text: `${title} ${$('p', c).textContent} ${EXTRA[title] || ''}`.toLowerCase() };
    });
    const close = () => { results.classList.remove('show'); search.setAttribute('aria-expanded', 'false'); hl = -1; };
    const go = (item) => {
      close();
      search.value = item.title;
      applyFilter(item.card.dataset.cat);
      item.card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      item.card.animate([{ boxShadow: '0 0 0 0 rgba(79,182,187,.7)' }, { boxShadow: '0 0 0 14px rgba(79,182,187,0)' }], { duration: 1200, iterations: 2 });
    };
    const render = () => {
      const q = search.value.trim().toLowerCase();
      if (!q) { close(); return; }
      const found = items.filter((it) => q.split(/\s+/).every((t) => it.text.includes(t)));
      results.innerHTML = found.length
        ? found.map((it, i) => `<a href="#treatments" role="option" data-i="${items.indexOf(it)}" id="sr-${i}"><svg class="ic"><use href="#i-drop"/></svg>${it.title}</a>`).join('')
        : '<div class="empty">No match — call or WhatsApp and we’ll help.</div>';
      results.classList.add('show');
      search.setAttribute('aria-expanded', 'true');
      hl = -1;
    };
    search.addEventListener('input', render);
    search.addEventListener('keydown', (e) => {
      const links = $$('a', results);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!links.length) return;
        hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach((l, i) => l.classList.toggle('hl', i === hl));
        search.setAttribute('aria-activedescendant', links[hl].id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const pick = links[hl >= 0 ? hl : 0];
        if (pick) go(items[+pick.dataset.i]);
      } else if (e.key === 'Escape') close();
    });
    results.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) { e.preventDefault(); go(items[+a.dataset.i]); }
    });
    $('.search-box button').addEventListener('click', () => { render(); const first = $('a', results); if (first) go(items[+first.dataset.i]); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search-box')) close(); });
  }

  /* ---------- Treatment filter ---------- */
  const chips = $$('.filter-bar .chip');
  function applyFilter(f) {
    chips.forEach((c) => { const on = c.dataset.filter === f; c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on)); });
    $$('.svc-card').forEach((c, i) => {
      const show = f === 'all' || c.dataset.cat === f || c.dataset.cat === 'all';
      c.classList.toggle('hide', !show);
      if (show) c.classList.add('in', 'settled');
      if (show && !reduceMotion) c.animate([{ opacity: 0, transform: 'translateY(24px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: (i % 4) * 50, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    });
  }
  chips.forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.filter)));
  // start on Hematology without animating
  $$('.svc-card').forEach((c) => c.classList.toggle('hide', !(c.dataset.cat === 'hematology' || c.dataset.cat === 'all')));

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    const run = (el) => {
      const end = +el.dataset.count, t0 = performance.now(), dur = 1600;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      el.textContent = '0'; requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } }), { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- OPD timings: highlight today (India time) ---------- */
  const week = $('[data-week]');
  if (week) {
    const istDay = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000).getDay();
    const today = $(`.day[data-day="${istDay}"]`, week);
    if (today) { today.classList.add('is-today'); today.setAttribute('aria-current', 'date'); }
  }

  /* ---------- Gallery lightbox ---------- */
  const lb = $('#lightbox');
  const shots = $$('[data-gallery] .shot__btn');
  if (lb && shots.length && typeof lb.showModal === 'function') {
    const img = $('img', lb), cap = $('figcaption', lb);
    let idx = 0, opener = null;
    const show = (i) => {
      idx = (i + shots.length) % shots.length;
      const b = shots[idx];
      img.src = b.dataset.full; img.alt = $('img', b).alt; cap.textContent = $('.shot__cap', b).textContent;
      if (!reduceMotion) img.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
    };
    shots.forEach((b, i) => b.addEventListener('click', () => { opener = b; show(i); lb.showModal(); }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    $('.lightbox__nav--prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lightbox__nav--next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => opener?.focus());
  }

  /* ---------- Forms → WhatsApp ---------- */
  const validate = (form, sels) => {
    let first = null;
    sels.forEach((sel) => {
      const input = $(sel, form);
      const ok = input.checkValidity() && input.value.trim() !== '';
      input.closest('.form-group').classList.toggle('invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      if (!ok && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  };
  $$('[data-topic]').forEach((a) => a.addEventListener('click', () => { const t = $('#f-topic'); if (t) t.value = a.dataset.topic; }));

  const lead = $('#lead-form');
  if (lead) {
    lead.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = $('.lead-card__note', lead);
      if (!validate(lead, ['#l-name', '#l-phone'])) { note.textContent = 'Please add your name and a valid mobile number.'; return; }
      const d = new FormData(lead);
      note.textContent = 'Opening WhatsApp with your request…';
      openWhatsApp(['Hello, please call me back to book a consultation with Dr. Neema Bhat.', `Name: ${d.get('name')}`, `Mobile: ${d.get('phone')}`, `Concern: ${d.get('topic')}`]);
    });
  }

  const form = $('#appt-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = $('.form-note span', form);
      if (!validate(form, ['#f-name', '#f-phone'])) { note.textContent = 'Please add the patient’s name and a valid phone number.'; return; }
      const d = new FormData(form);
      note.textContent = 'Opening WhatsApp with your request…';
      openWhatsApp([
        'Hello, I would like to request an appointment with Dr. Neema Bhat.',
        `Patient: ${d.get('name')} (${d.get('who')})`, `Phone: ${d.get('phone')}`, `Reason: ${d.get('topic')}`,
        d.get('message') ? `Notes: ${d.get('message')}` : '',
      ]);
    });
    $$('.form-control', form).forEach((i) => i.addEventListener('input', () => i.closest('.form-group')?.classList.remove('invalid')));
  }

  onScroll();
})();

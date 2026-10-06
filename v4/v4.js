(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- mascots ---------- */
  const COLORS = {
    mint: ['#a6ecd6', '#6fd3b4'], lavender: ['#c8b8ff', '#9d85f5'], peach: ['#ffc39e', '#f99a66'],
    lemon: ['#ffe58a', '#f5c53d'], sky: ['#b0d4ff', '#78aef5'], pink: ['#ffb3d3', '#f47fb0'],
  };
  const polar = (n, base, amp) => {
    let d = '';
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2;
      const r = base + amp * Math.cos(n * t);
      d += (i ? 'L' : 'M') + (50 + r * Math.cos(t - Math.PI / 2)).toFixed(1) + ' ' + (54 + r * Math.sin(t - Math.PI / 2)).toFixed(1);
    }
    return d + 'Z';
  };
  const SHAPES = {
    squircle: 'M50 10C84 10 92 18 92 52C92 86 84 94 50 94C16 94 8 86 8 52C8 18 16 10 50 10Z',
    flower: polar(6, 37, 6),
    star: polar(5, 35, 8),
    drop: 'M50 8C50 8 88 44 88 64A38 32 0 0 1 12 64C12 44 50 8 50 8Z',
    ghost: 'M12 52A38 38 0 0 1 88 52V92Q80.5 84 75 92Q68.5 84 62.5 92Q56 84 50 92Q44 84 37.5 92Q31.5 84 25 92Q19.5 84 12 92Z',
    shield: 'M50 8L88 20V50C88 72 72 88 50 96C28 88 12 72 12 50V20Z',
  };
  $$('.m[data-shape]').forEach((el) => {
    const [fill, shade] = COLORS[el.dataset.c] || COLORS.mint;
    const id = 'g' + Math.random().toString(36).slice(2, 8);
    el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><radialGradient id="${id}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="${fill}"/><stop offset="1" stop-color="${shade}"/></radialGradient></defs>
      <g class="bob">
        <ellipse cx="50" cy="99" rx="26" ry="3.5" fill="#000" opacity=".06"/>
        <path d="${SHAPES[el.dataset.shape] || SHAPES.squircle}" fill="url(#${id})" stroke="${fill}" stroke-width="5" stroke-linejoin="round"/>
        <g class="eyes">
          <ellipse class="eye" cx="40" cy="54" rx="4.4" ry="6.6" fill="#1b1b22"/>
          <ellipse class="eye" cx="60" cy="54" rx="4.4" ry="6.6" fill="#1b1b22"/>
          <circle cx="41.4" cy="51.4" r="1.5" fill="#fff"/><circle cx="61.4" cy="51.4" r="1.5" fill="#fff"/>
        </g>
      </g></svg>`;
  });
  if (!reduce) {
    let raf = 0, px = innerWidth / 2, py = innerHeight / 3;
    const look = () => {
      raf = 0;
      $$('.m .eyes').forEach((g) => {
        const r = g.closest('.m').getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        const k = Math.min(1, Math.hypot(dx, dy) / 400);
        const a = Math.atan2(dy, dx);
        g.style.transform = `translate(${(Math.cos(a) * 5 * k).toFixed(2)}px, ${(Math.sin(a) * 4 * k).toFixed(2)}px)`;
      });
    };
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
    look();
  }

  /* ---------- hero typer ---------- */
  const word = $('.typer-word');
  if (word) {
    const words = ['ton restaurant', 'ta boutique', 'ton cabinet', 'ton entreprise', 'ton équipe', 'ton agence', 'ton commerce'];
    const paint = (s, fresh) => {
      word.textContent = '';
      if (!s) return;
      word.append(s.slice(0, fresh ? -1 : undefined));
      if (fresh) { const n = document.createElement('span'); n.className = 'new'; n.textContent = s.slice(-1); word.append(n); }
    };
    (async () => {
      if (reduce) return;
      let i = 0;
      await wait(2600);
      for (;;) {
        const cur = words[i % words.length];
        for (let k = cur.length; k >= 0; k--) { paint(cur.slice(0, k)); await wait(38); }
        i++;
        const nx = words[i % words.length];
        await wait(260);
        for (let k = 1; k <= nx.length; k++) { paint(nx.slice(0, k), true); await wait(70 + Math.random() * 50); }
        paint(nx); await wait(2400);
      }
    })();
  }

  /* ---------- rail: duplicate for an endless loop ---------- */
  const track = $('.rail-track');
  if (track) track.append(...[...track.children].map((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));

  const countUp = (el) => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$('[data-count]').forEach(countUp);

  /* ---------- composer typer ---------- */
  const typed = $('.c-typed');
  const prompts = ['Réponds aux avis Google de mon restaurant', 'Prépare mes posts de la semaine', 'Relance les devis restés sans réponse', 'Résume la réunion de ce matin', 'Trie mes mails clients par urgence'];

  /* ---------- reveal + per-card loops ---------- */
  const loops = new Map();
  const startLoop = (el, fn) => { if (loops.has(el)) return; loops.set(el, true); fn(el); };
  const visible = new Set();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); visible.add(e.target); kick(e.target); }
    else visible.delete(e.target);
  }), { threshold: 0.18 });
  $$('.reveal').forEach((el) => io.observe(el));

  const alive = (el) => visible.has(el.closest('.reveal'));

  async function think(el) {
    const rows = $$('p', el);
    for (;;) {
      rows.forEach((r) => r.className = '');
      for (const r of rows) { r.className = 'on'; await wait(1300); r.className = 'done'; }
      await wait(1800);
      while (!alive(el)) await wait(500);
    }
  }
  async function flow(el) {
    const parts = $$('.node, .edge', el);
    for (;;) {
      parts.forEach((p) => p.classList.remove('lit'));
      await wait(500);
      for (const p of parts) { p.classList.add('lit'); await wait(p.classList.contains('edge') ? 520 : 420); }
      await wait(2000);
      while (!alive(el)) await wait(500);
    }
  }
  async function gen(el) {
    const n = $('.gen-n', el), c = $('circle', el);
    for (;;) {
      el.classList.remove('done');
      for (let k = 3; k >= 1; k--) {
        n.textContent = k;
        c.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(120deg)' }], { duration: 900, easing: 'ease-in-out', transformOrigin: 'center' });
        await wait(900);
      }
      el.classList.add('done');
      await wait(3200);
      while (!alive(el)) await wait(500);
    }
  }
  async function typeLoop() {
    let i = 0;
    for (;;) {
      const s = prompts[i++ % prompts.length];
      for (let k = 1; k <= s.length; k++) { typed.textContent = s.slice(0, k); await wait(42 + Math.random() * 40); }
      await wait(1900);
      for (let k = s.length; k >= 0; k--) { typed.textContent = s.slice(0, k); await wait(16); }
      await wait(300);
    }
  }
  function kick(el) {
    if (reduce) {
      $$('.p-gen', el).forEach((g) => g.classList.add('done'));
      $$('.p-think p', el).forEach((p) => (p.className = 'done'));
      if (typed && el.contains(typed)) typed.textContent = prompts[0];
      return;
    }
    $$('.p-think', el).forEach((x) => startLoop(x, think));
    $$('.p-flow', el).forEach((x) => startLoop(x, flow));
    $$('.p-gen', el).forEach((x) => startLoop(x, gen));
    if (typed && el.contains(typed)) startLoop(typed, typeLoop);
    if (el.classList.contains('progress-card')) startLoop(el, progress);
    if (el.classList.contains('app')) startLoop(el, autoTabs);
  }

  /* ---------- segmented controls ---------- */
  const placeInd = (seg) => {
    const on = $('[aria-selected="true"]', seg) || $('input:checked', seg)?.parentElement;
    const ind = $('.seg-ind', seg);
    if (!on || !ind) return;
    ind.style.width = on.offsetWidth + 'px';
    ind.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  };
  const segs = $$('.seg');
  segs.forEach((s) => placeInd(s));
  addEventListener('resize', () => segs.forEach(placeInd));
  document.fonts?.ready.then(() => segs.forEach(placeInd));

  const who = $('.who');
  if (who) {
    const tabs = $$('[data-who]', who), panes = $$('.who-p', who);
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-selected', x === t));
      panes.forEach((p, i) => p.classList.toggle('is-on', i === +t.dataset.who));
      placeInd($('.seg', who));
    }));
  }

  /* ---------- app window ---------- */
  const app = $('.app');
  let userTouched = false;
  const show = (i) => {
    $$('.app-tab', app).forEach((t, k) => t.classList.toggle('is-on', k === i));
    $$('.pane', app).forEach((p, k) => p.classList.toggle('is-on', k === i));
  };
  if (app) $$('.app-tab', app).forEach((t) => t.addEventListener('click', () => { userTouched = true; show(+t.dataset.pane); }));
  async function autoTabs() {
    let i = 0;
    for (;;) {
      await wait(4200);
      if (userTouched) return;
      if (!alive(app)) continue;
      i = (i + 1) % 5; show(i);
    }
  }

  /* ---------- steps progress ---------- */
  async function progress(el) {
    const items = $$('.pc-list li', el), left = $('.pc-left', el), head = $('.pc-spin', el);
    await wait(400);
    for (let k = 0; k < items.length; k++) {
      items[k].classList.add('run');
      await wait(1300);
      items[k].classList.replace('run', 'ok');
      const r = items.length - k - 1;
      left.textContent = r ? `${r} étape${r > 1 ? 's' : ''} restante${r > 1 ? 's' : ''}` : 'Bienvenue dans le Cercle';
    }
    head.classList.add('pc-done');
  }

  /* ---------- form ---------- */
  const NUMBERS = { boris: '33782988589', kevin: '33781270587' };
  const NAMES = { boris: 'Boris', kevin: 'Kévin' };
  const form = $('#form');
  if (form) {
    const err = $('.form-error', form), seg = $('.seg-form', form);
    const sync = () => {
      const cercle = form.intent.value === 'cercle';
      $$('.cercle-only', form).forEach((el) => (el.style.display = cercle ? '' : 'none'));
      placeInd(seg);
    };
    $$('input[name="intent"]', form).forEach((r) => r.addEventListener('change', sync));
    $$('[data-intent]').forEach((a) => a.addEventListener('click', () => {
      const r = $(`input[name="intent"][value="${a.dataset.intent}"]`, form);
      if (r) { r.checked = true; sync(); }
    }));
    $$('[data-to]').forEach((a) => a.addEventListener('click', () => {
      const r = $(`input[name="to"][value="${a.dataset.to}"]`, form);
      if (r) r.checked = true;
    }));
    $$('select', form).forEach((s) => {
      const paint = () => (s.style.color = s.value ? '' : 'var(--ink3)');
      s.addEventListener('change', paint); paint();
    });
    sync();
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const v = (n) => (form[n] && form[n].value ? form[n].value.trim() : '');
      const cercle = form.intent.value === 'cercle';
      if (['nom', 'profil', 'activite', 'tache'].some((n) => !v(n))) {
        err.textContent = 'Merci de remplir ton nom, ton profil, ton activité et ce que tu veux confier à l’IA.';
        return;
      }
      if (cercle && !form.engage.checked) {
        err.textContent = 'Pour rejoindre le Cercle, coche l’engagement à partager où tu en es.';
        return;
      }
      err.textContent = '';
      const to = form.to.value;
      const lines = [
        `Bonjour ${NAMES[to]}, ${cercle ? 'je souhaite rejoindre le Cercle IA Business.' : 'je souhaite réserver un échange découverte.'}`,
        '',
        `Nom : ${v('nom')}`,
        `Profil : ${v('profil')}`,
        `Activité / rôle : ${v('activite')}`,
        cercle && v('equipe') ? `Équipe : ${v('equipe')}` : null,
        `Ce que j’aimerais confier à l’IA : ${v('tache')}`,
        cercle && v('invest') ? `Déjà investi dans un outil, une formation ou un prestataire : ${v('invest')}` : null,
        cercle ? 'Je m’engage à partager où j’en suis dans le Cercle.' : null,
      ].filter((l) => l !== null);
      window.open(`https://wa.me/${NUMBERS[to]}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  }

  /* ---------- color picker ---------- */
  const tint = $('.tint');
  if (tint) {
    const set = (b) => {
      document.documentElement.style.setProperty('--accent', b.style.getPropertyValue('--c'));
      $$('button', tint).forEach((x) => x.classList.toggle('is-on', x === b));
    };
    const btns = $$('button', tint);
    btns.forEach((b, i) => b.addEventListener('click', () => { set(b); try { localStorage.setItem('cercle-v4-tint', i); } catch (e) {} }));
    try { const i = localStorage.getItem('cercle-v4-tint'); if (i && btns[i]) set(btns[i]); } catch (e) {}
  }
})();

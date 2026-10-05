// Le Cercle IA Business, version isométrique.
// Figures en SVG pur, projection reprise du skill iso-figure (MIT, MrBongoC).
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- noyau isométrique ----------
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  function Fig() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const P = (x, y, z) => { const p = [(x - y) * C, (x + y) * S - z]; minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); return p; };
    const D = (x, y, z) => [(x - y) * C, (x + y) * S - z];
    const plane = (O, U, V) => { const o = P(...O), u = D(...U), v = D(...V); return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`; };
    const TOP = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
    const FRONT = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
    const SIDE = (x, y, z) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);
    const rect = (t, w, h, r = 0, cls = 'face') => `<g transform="${t}"><rect class="${cls}" width="${w}" height="${h}" rx="${r}"/></g>`;
    const box = (x, y, z, w, d, h, r = 0, cls = '') => {
      [[x, y, z], [x + w, y, z], [x, y + d, z], [x + w, y + d, z]].forEach(([a, b, c]) => { P(a, b, c); P(a, b, c + h); });
      return rect(SIDE(x + w, y + d, z + h), d, h, Math.min(r, h / 4), 'face ' + cls) +
        rect(FRONT(x, y + d, z + h), w, h, Math.min(r, h / 4), 'face ' + cls) +
        rect(TOP(x, y, z + h), w, d, r, 'face top ' + cls);
    };
    // cylindre posé sur le plan z
    const cyl = (cx, cy, z, r, h, cls = '') => {
      const k = r / Math.SQRT2, a = P(cx + k, cy - k, z), b = P(cx + k, cy - k, z + h), c = P(cx - k, cy + k, z + h), d = P(cx - k, cy + k, z);
      P(cx + r, cy + r, z); P(cx - r, cy - r, z + h);
      return `<g transform="${TOP(cx - r, cy - r, z)}"><circle class="face ${cls}" cx="${r}" cy="${r}" r="${r}"/></g>` +
        `<path class="face ${cls}" style="stroke:none" d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}L${d[0]} ${d[1]}Z"/>` +
        `<path class="face" style="fill:none" d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}M${c[0]} ${c[1]}L${d[0]} ${d[1]}"/>` +
        `<g transform="${TOP(cx - r, cy - r, z + h)}"><circle class="face top ${cls}" cx="${r}" cy="${r}" r="${r}"/></g>`;
    };
    const view = (m = 0.08) => { const w = maxX - minX, h = maxY - minY, mx = w * m, my = h * m; return `${(minX - mx).toFixed(1)} ${(minY - my).toFixed(1)} ${(w + 2 * mx).toFixed(1)} ${(h + 2 * my).toFixed(1)}`; };
    return { P, TOP, FRONT, SIDE, rect, box, cyl, view };
  }
  const mount = (id, build, m) => { const el = document.getElementById(id); if (!el) return null; const f = Fig(); const html = build(f); el.setAttribute('viewBox', f.view(m)); el.innerHTML = html; return el; };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // ---------- Fig. 1 : le bureau augmenté ----------
  const AGENTS = [
    { key: '1', name: 'Prospecter', out: ['> agent prospection', '  14 leads qualifiés'], min: 45 },
    { key: '2', name: 'Relancer', out: ['> relances clients', '  6 messages envoyés'], min: 20, phone: true },
    { key: '3', name: 'Contenu', out: ['> contenus de la semaine', '  3 posts · 1 newsletter'], min: 70 },
    { key: '4', name: 'Automatiser', out: ['> process facturation', '  automatisé de bout en bout'], min: 120 },
  ];
  const desk = mount('fig-desk', (f) => {
    let s = '';
    s += f.box(0, 0, 0, 460, 290, 16, 6);
    s += f.box(178, 34, 16, 90, 46, 5, 3);
    s += f.box(213, 50, 21, 20, 12, 82, 2);
    s += f.box(64, 40, 103, 318, 14, 186, 6);
    s += `<g transform="${f.FRONT(64, 54, 289)}">
      <rect class="face glass" x="12" y="12" width="294" height="160" rx="6"/>
      <text class="scr" x="24" y="30" font-size="9" opacity=".55">LE CERCLE · AGENTS</text>
      <line class="detail" x1="24" y1="37" x2="294" y2="37"/>
      <g id="screen-lines"></g>
      <rect class="dot-live" id="caret" x="24" y="150" width="6" height="11"/>
    </g>`;
    s += f.box(10, 196, 16, 46, 74, 3, 2);
    s += `<g transform="${f.TOP(10, 196, 19)}"><path class="detail" d="M8 14h30M8 24h30M8 34h22M8 44h30M8 54h18"/></g>`;
    s += f.box(64, 124, 16, 312, 122, 10, 5);
    AGENTS.forEach((a, i) => {
      const x = 80 + i * 74, y = 142, z = 26, w = 64, d = 84, h = 12;
      s += `<g class="press key" data-key="${a.key}">${f.box(x, y, z, w, d, h, 5)}
        <g transform="${f.TOP(x, y, z + h)}"><text class="lbl" x="${w / 2}" y="${d / 2 + 3}" font-size="9.6">${a.name.toUpperCase()}</text>
        <text class="lbl" x="9" y="14" font-size="8" style="text-anchor:start">${a.key}</text></g></g>`;
    });
    s += `<g id="phone">${f.box(398, 176, 16, 36, 66, 5, 5)}
      <g transform="${f.TOP(398, 176, 21)}"><rect class="face glass" x="4" y="5" width="28" height="56" rx="3"/>
      <rect class="detail ink" x="9" y="14" width="18" height="5" rx="2"/><rect class="detail" x="9" y="23" width="13" height="5" rx="2"/>
      <circle id="notif" class="dot-live" cx="26" cy="9" r="0"/></g></g>`;
    return s;
  }, 0.07);

  if (desk) {
    const lines = desk.querySelector('#screen-lines'), caret = desk.querySelector('#caret');
    const readout = document.getElementById('desk-readout'), notif = desk.querySelector('#notif');
    const keys = new Map([...desk.querySelectorAll('.key')].map((k) => [k.dataset.key, k]));
    const state = { buf: [], tasks: 0, minutes: 0, last: null, typing: null };
    const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
    const draw = () => {
      const shown = state.buf.slice(-7);
      lines.innerHTML = shown.map((t, i) => `<text class="scr${t.startsWith('>') ? '' : ' live'}" x="24" y="${56 + i * 15}" font-size="10.5">${esc(t)}</text>`).join('');
      caret.setAttribute('y', 46 + Math.min(7, shown.length) * 15);
      readout.textContent = state.tasks ? `${state.tasks} tâche${state.tasks > 1 ? 's' : ''} · ${fmt(state.minutes)} gagnées · ${state.last}` : 'prêt · 0 tâche';
      keys.forEach((k) => k.classList.toggle('on', k.dataset.key === state.lastKey));
    };
    const type = (text, done) => {
      let i = 0; state.buf.push('');
      const step = () => {
        state.buf[state.buf.length - 1] = text.slice(0, ++i); draw();
        if (i < text.length) state.typing = setTimeout(step, reduce ? 0 : 16); else done && done();
      };
      step();
    };
    let busy = false, lastUser = 0;
    const press = (k, auto) => {
      const el = keys.get(k), a = AGENTS.find((x) => x.key === k);
      if (!el || !a || busy) return false;
      if (!auto) lastUser = performance.now();
      busy = true;
      el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 110);
      state.lastKey = k; state.last = 'agent ' + a.name.toLowerCase();
      type(a.out[0], () => type(a.out[1], () => {
        state.tasks++; state.minutes += a.min; busy = false; draw();
        if (a.phone && !reduce) { notif.setAttribute('r', 4); setTimeout(() => notif.setAttribute('r', 0), 1600); }
      }));
      return true;
    };
    desk.addEventListener('click', (e) => { const k = e.target.closest('.key'); if (k) press(k.dataset.key); });
    addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
      if (press(e.key)) e.preventDefault();
    });
    draw();
    let visible = false, demo = 0;
    new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.3 }).observe(desk);
    if (!reduce) setInterval(() => { if (visible && !busy && performance.now() - lastUser > 7000) press(AGENTS[demo++ % 4].key, true); }, 2600);
    if (!reduce) setInterval(() => caret.style.opacity = caret.style.opacity === '0' ? '1' : '0', 520);
  }

  // ---------- Fig. 2 : boutique ----------
  mount('fig-shop', (f) => {
    let s = f.box(-30, -30, -6, 210, 170, 6, 4);
    s += f.box(0, 0, 0, 150, 100, 92, 3);
    s += f.box(-6, -6, 92, 162, 112, 8, 3);
    s += `<g transform="${f.FRONT(0, 100, 92)}">
      ${Array.from({ length: 10 }, (_, i) => `<rect class="face ${i % 2 ? 'top' : 'gold'}" x="${i * 15}" y="0" width="15" height="16"/>`).join('')}
      <rect class="win" data-blink x="12" y="30" width="44" height="34" rx="2"/><path class="detail" d="M34 30v34M12 47h44"/>
      <rect class="face" x="72" y="30" width="30" height="62" rx="2"/><circle class="fill-detail" cx="96" cy="62" r="1.6"/>
      <rect class="win" data-blink x="114" y="30" width="28" height="34" rx="2"/>
    </g>`;
    s += `<g transform="${f.SIDE(150, 100, 92)}"><rect class="win" data-blink x="24" y="30" width="52" height="34" rx="2"/><path class="detail" d="M50 30v34"/></g>`;
    return s;
  });

  // ---------- Fig. 3 : immeuble ----------
  mount('fig-tower', (f) => {
    let s = f.box(-30, -30, -6, 230, 160, 6, 4);
    s += f.box(0, 0, 0, 86, 86, 196, 3);
    s += `<g transform="${f.FRONT(0, 86, 196)}">${Array.from({ length: 21 }, (_, i) => `<rect class="win" data-blink x="${12 + (i % 3) * 22}" y="${14 + Math.floor(i / 3) * 25}" width="16" height="16" rx="1.5"/>`).join('')}</g>`;
    s += `<g transform="${f.SIDE(86, 86, 196)}">${Array.from({ length: 21 }, (_, i) => `<rect class="win" data-blink x="${12 + (i % 3) * 22}" y="${14 + Math.floor(i / 3) * 25}" width="16" height="16" rx="1.5"/>`).join('')}</g>`;
    s += f.box(104, 14, 0, 74, 62, 84, 3);
    s += `<g transform="${f.FRONT(104, 76, 84)}">${Array.from({ length: 6 }, (_, i) => `<rect class="win" data-blink x="${10 + (i % 3) * 21}" y="${14 + Math.floor(i / 3) * 26}" width="14" height="16" rx="1.5"/>`).join('')}</g>`;
    s += f.box(30, 30, 196, 26, 26, 14, 2, 'gold');
    return s;
  });

  // ---------- Fig. 4 : équipe reliée ----------
  mount('fig-team', (f) => {
    const deskAt = (x, y) => f.box(x, y, 0, 64, 44, 26, 3) + f.box(x + 14, y + 6, 26, 36, 6, 26, 2) +
      `<g transform="${f.FRONT(x + 14, y + 12, 52)}"><rect class="face glass" x="3" y="3" width="30" height="18" rx="2"/><rect class="dot-live" x="7" y="8" width="10" height="2.5"/><rect class="fill-detail" x="7" y="13" width="16" height="2.5"/></g>`;
    let s = f.box(-40, -40, -6, 260, 230, 6, 4);
    s += `<g transform="${f.TOP(-40, -40, 0)}">
      <path class="flow" d="M72 62 L130 130 L192 62"/><path class="flow" d="M130 130 L130 196"/></g>`;
    s += deskAt(0, 0) + deskAt(120, 0);
    s += f.box(80, 80, 0, 20, 20, 20, 3, 'gold');
    s += deskAt(58, 150);
    return s;
  });

  // ---------- Fig. 5 : la table du Cercle ----------
  const CASES = ['restaurant · réservations automatisées', 'cabinet comptable · relances clients', 'boutique · fiches produits en 10 min', 'agence immobilière · leads qualifiés', 'coach · contenus de la semaine', 'pme industrielle · devis assistés', 'consultante · veille quotidienne', 'agent ia · au service de tous'];
  const table = mount('fig-table', (f) => {
    const R = 150, seats = CASES.map((c, i) => { const a = (i / CASES.length) * Math.PI * 2 + 0.3; return { i, x: Math.cos(a) * R, y: Math.sin(a) * R }; });
    seats.sort((a, b) => a.x + a.y - (b.x + b.y));
    const seat = (p) => `<g class="press seat${p.i === 7 ? ' agent' : ''}" data-i="${p.i}">${f.box(p.x - 16, p.y - 16, 0, 32, 32, 30, 5, p.i === 7 ? 'gold' : '')}</g>`;
    let s = `<g transform="${f.TOP(-220, -220, 0)}"><circle class="detail" cx="220" cy="220" r="205" stroke-dasharray="2 6"/></g>`;
    s += seats.filter((p) => p.x + p.y < 0).map(seat).join('');
    s += f.cyl(0, 0, 0, 22, 44);
    s += f.cyl(0, 0, 44, 104, 9);
    s += `<g transform="${f.TOP(-104, -104, 53)}"><circle class="detail" cx="104" cy="104" r="78"/><circle class="dot-live" cx="104" cy="104" r="7"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + 0.3; return `<path class="flow" d="M104 104L${104 + Math.cos(a) * 74} ${104 + Math.sin(a) * 74}"/>`; }).join('')}</g>`;
    s += seats.filter((p) => p.x + p.y >= 0).map(seat).join('');
    return s;
  }, 0.06);
  if (table) {
    const ro = document.getElementById('table-readout');
    const seats = [...table.querySelectorAll('.seat')];
    let cur = -1, lastUser = 0;
    const pick = (i, auto) => {
      if (!auto) lastUser = performance.now();
      cur = i; seats.forEach((s) => s.classList.toggle('on', Number(s.dataset.i) === i));
      const el = seats.find((s) => Number(s.dataset.i) === i);
      if (el && !auto) { el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 110); }
      ro.textContent = CASES[i];
    };
    table.addEventListener('click', (e) => { const s = e.target.closest('.seat'); if (s) pick(Number(s.dataset.i)); });
    table.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { pick((cur + (e.key === 'ArrowRight' ? 1 : 7)) % 8); e.preventDefault(); } });
    if (!reduce) setInterval(() => { if (performance.now() - lastUser > 8000) pick((cur + 1) % 8, true); }, 2400);
  }

  // ---------- étapes ----------
  mount('fig-step1', (f) => {
    let s = f.box(0, 0, 0, 120, 150, 5, 4);
    s += `<g transform="${f.TOP(0, 0, 5)}"><path class="detail ink" d="M14 18h60"/><path class="detail" d="M14 34h92M14 46h80M14 62h92M14 74h66M14 90h92M14 102h72"/>
      <rect class="face gold" x="14" y="118" width="14" height="14" rx="2"/><path class="detail ink" d="M34 125h50"/></g>`;
    s += f.box(128, 40, 0, 10, 90, 8, 4);
    return s;
  });
  mount('fig-step2', (f) => {
    let s = f.box(0, 0, 0, 80, 150, 9, 10);
    s += `<g transform="${f.TOP(0, 0, 9)}"><rect class="face glass" x="6" y="10" width="68" height="128" rx="6"/>
      <rect class="face" x="12" y="22" width="40" height="14" rx="5"/><rect class="face gold" x="28" y="44" width="40" height="14" rx="5"/>
      <rect class="face" x="12" y="66" width="46" height="20" rx="5"/><rect class="face gold" x="34" y="94" width="34" height="14" rx="5"/></g>`;
    return s;
  });
  mount('fig-step3', (f) => {
    let s = f.box(-30, -40, -5, 150, 120, 5, 4);
    s += f.box(0, 0, 0, 12, 14, 128, 2);
    s += f.box(78, 0, 0, 12, 14, 128, 2);
    s += f.box(0, 0, 128, 90, 14, 12, 2);
    s += f.box(12, 18, 0, 66, 34, 2, 2, 'gold');
    s += `<g transform="${f.FRONT(12, 14, 128)}"><rect class="win on" x="0" y="0" width="66" height="128"/></g>`;
    return s;
  });

  // fenêtres qui s'allument
  const blinks = [...document.querySelectorAll('[data-blink]')];
  if (!reduce && blinks.length) setInterval(() => { const w = blinks[Math.floor(Math.random() * blinks.length)]; w.classList.toggle('on'); }, 420);

  // ---------- apparitions, en-tête ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.14 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- accordéon ----------
  document.querySelectorAll('.acc details').forEach((d) => {
    const s = d.querySelector('summary'), body = d.querySelector('div');
    s.addEventListener('click', (e) => {
      if (reduce) return; e.preventDefault();
      if (d.open) body.animate([{ height: body.scrollHeight + 'px' }, { height: '0px' }], { duration: 300, easing: 'ease-in-out' }).onfinish = () => (d.open = false);
      else { d.open = true; body.animate([{ height: '0px' }, { height: body.scrollHeight + 'px' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' }); }
    });
  });

  // ---------- formulaire → WhatsApp ----------
  const NUMBERS = { boris: '33782988589', kevin: '33781270587' };
  const NAMES = { boris: 'Boris', kevin: 'Kévin' };
  const form = document.getElementById('form');
  const err = form.querySelector('.form-error');
  const sync = () => { const c = form.intent.value === 'cercle'; form.querySelectorAll('.cercle-only').forEach((el) => (el.style.display = c ? '' : 'none')); };
  form.querySelectorAll('input[name="intent"]').forEach((r) => r.addEventListener('change', sync));
  document.querySelectorAll('[data-intent]').forEach((a) => a.addEventListener('click', () => { const r = form.querySelector(`input[name="intent"][value="${a.dataset.intent}"]`); if (r) { r.checked = true; sync(); } }));
  sync();
  form.querySelectorAll('select').forEach((s) => { const paint = () => (s.style.color = s.value ? '' : 'var(--ink-3)'); s.addEventListener('change', paint); paint(); });
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const v = (n) => (form[n] && form[n].value ? form[n].value.trim() : '');
    const cercle = form.intent.value === 'cercle';
    if (['nom', 'profil', 'activite', 'tache'].some((n) => !v(n))) { err.textContent = 'Merci de remplir ton nom, ton profil, ton activité et ce que tu veux confier à l’IA.'; return; }
    if (cercle && !form.engage.checked) { err.textContent = 'Pour rejoindre le Cercle, coche l’engagement à partager où tu en es.'; return; }
    err.textContent = '';
    const to = form.to.value;
    const lines = [
      `Bonjour ${NAMES[to]}, ${cercle ? 'je souhaite rejoindre le Cercle IA Business.' : 'je souhaite réserver un échange découverte.'}`, '',
      `Nom : ${v('nom')}`, `Profil : ${v('profil')}`, `Activité / rôle : ${v('activite')}`,
      v('equipe') ? `Équipe : ${v('equipe')}` : null,
      `Ce que j’aimerais confier à l’IA : ${v('tache')}`,
      v('invest') ? `Déjà investi dans un outil, une formation ou un prestataire : ${v('invest')}` : null,
      cercle ? 'Je m’engage à partager où j’en suis dans le Cercle.' : null,
    ].filter((l) => l !== null);
    window.open(`https://wa.me/${NUMBERS[to]}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();

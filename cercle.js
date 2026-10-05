// Le Cercle IA Business : anneau du héros, apparitions, phrase encrée, chemin des étapes, bandeau, formulaire WhatsApp.
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  // Titre découpé mot à mot
  document.querySelectorAll('[data-split]').forEach((el) => {
    const parts = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((t) => t && parts.push({ t, tag: null }));
      else parts.push({ t: n.textContent, tag: n.tagName.toLowerCase() });
    });
    el.innerHTML = '';
    let i = 0;
    parts.forEach(({ t, tag }) => {
      if (/^\s+$/.test(t)) { el.append(' '); return; }
      const w = document.createElement('span');
      w.className = 'word';
      const inner = document.createElement(tag || 'span');
      inner.textContent = t;
      inner.style.setProperty('--i', i++);
      w.append(inner);
      el.append(w);
    });
    requestAnimationFrame(() => setTimeout(() => el.classList.add('in'), 60));
  });

  // Anneau du héros : membres autour du cercle, liens vers le centre, lumière qui fait le tour
  const ring = document.querySelector('.ring');
  const nodes = [];
  if (ring) {
    const gN = ring.querySelector('.ring-nodes'), gC = ring.querySelector('.ring-chords');
    const N = 9, R = 276, C = 300;
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2 - Math.PI / 2 + 0.2;
      const x = C + R * Math.cos(a), y = C + R * Math.sin(a);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', x); line.setAttribute('y1', y);
      line.setAttribute('x2', C + 222 * Math.cos(a)); line.setAttribute('y2', C + 222 * Math.sin(a));
      gC.append(line);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', k % 3 === 0 ? 7 : 5);
      c.style.transitionDelay = `${0.6 + k * 0.08}s`;
      gN.append(c);
      nodes.push({ a, c, line });
    }
  }
  const runner = ring && ring.querySelector('.ring-runner');
  let t0 = performance.now();
  const spinRing = (t) => {
    const a = ((t - t0) / 14000) * Math.PI * 2 - Math.PI / 2;
    runner.setAttribute('transform', `translate(${300 + 276 * Math.cos(a)} ${300 + 276 * Math.sin(a)})`);
    const norm = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    nodes.forEach((n) => {
      const na = ((n.a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const d = Math.abs(Math.atan2(Math.sin(norm - na), Math.cos(norm - na)));
      const on = d < 0.5;
      n.c.classList.toggle('lit', on);
      n.line.classList.toggle('on', d < 1.2);
    });
    requestAnimationFrame(spinRing);
  };
  if (runner && !reduce) requestAnimationFrame(spinRing);
  else if (runner) runner.style.display = 'none';

  // Phrase qui s'encre au fil du scroll
  const scrub = document.querySelector('[data-scrub]');
  let words = [];
  if (scrub) {
    scrub.innerHTML = scrub.textContent.split(/(\s+)/).map((t) => (/^\s+$/.test(t) ? t : `<span class="w">${t}</span>`)).join('');
    words = [...scrub.querySelectorAll('.w')];
  }

  // Apparitions et compteurs
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      const c = e.target.querySelector('[data-count]');
      if (c) count(c);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  function count(el) {
    const to = Number(el.dataset.count);
    if (reduce || to === 0) { el.textContent = String(to); return; }
    const s = performance.now(), dur = 1500;
    const tick = (t) => {
      const p = Math.min(1, (t - s) / dur);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Chemin qui relie les étapes
  const steps = document.querySelector('[data-steps]');
  const stepEls = steps ? [...steps.querySelectorAll('.step')] : [];
  const pathSvg = steps && steps.querySelector('.path');
  const pBg = pathSvg && pathSvg.querySelector('.path-bg'), pFg = pathSvg && pathSvg.querySelector('.path-fg');
  let pathLen = 0, nodeYs = [];
  const buildPath = () => {
    if (!steps) return;
    const box = steps.getBoundingClientRect();
    const w = pathSvg.getBoundingClientRect().width, cx = w / 2;
    nodeYs = stepEls.map((s) => { const n = s.querySelector('.node').getBoundingClientRect(); return n.top - box.top + n.height / 2; });
    let d = `M${cx} ${nodeYs[0]}`;
    for (let i = 1; i < nodeYs.length; i++) {
      const y1 = nodeYs[i - 1], y2 = nodeYs[i], dy = y2 - y1, s = i % 2 ? 1 : -1;
      d += ` C${cx + s * w * 0.9} ${y1 + dy * 0.3} ${cx - s * w * 0.9} ${y1 + dy * 0.7} ${cx} ${y2}`;
    }
    pathSvg.setAttribute('viewBox', `0 0 ${w} ${box.height}`);
    pBg.setAttribute('d', d); pFg.setAttribute('d', d);
    pathLen = pFg.getTotalLength();
    pFg.style.strokeDasharray = pathLen;
  };

  // Bandeau qui accélère avec le scroll
  const track = document.querySelector('.band-track');
  let bandX = 0, lastY = scrollY, vel = 0, lastT = performance.now();
  const band = (t) => {
    const dt = Math.min(64, t - lastT); lastT = t;
    vel *= 0.92;
    const speed = (0.035 + Math.min(1.2, Math.abs(vel) * 0.02)) * (vel < -0.5 ? -1 : 1);
    bandX -= speed * dt;
    const half = track.scrollWidth / 2;
    if (bandX <= -half) bandX += half;
    if (bandX > 0) bandX -= half;
    track.style.transform = `translate3d(${bandX}px,0,0)`;
    requestAnimationFrame(band);
  };
  if (track && !reduce) requestAnimationFrame(band);

  // Scroll
  const top = document.querySelector('.top');
  const bar = document.querySelector('.progress span');
  const par = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    vel += y - lastY; lastY = y;
    top.classList.toggle('scrolled', y > 30);
    const max = doc.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduce) par.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax)}px)`;
    });
    if (steps && pathLen) {
      const box = steps.getBoundingClientRect();
      const line = vh * 0.6 - box.top;
      const first = nodeYs[0], last = nodeYs[nodeYs.length - 1];
      const p = Math.min(1, Math.max(0, (line - first) / (last - first)));
      pFg.style.strokeDashoffset = reduce ? 0 : pathLen * (1 - p);
      stepEls.forEach((s, i) => s.classList.toggle('lit', line >= nodeYs[i] - 2));
    }
    if (words.length) {
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', reduce || i < n));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { buildPath(); onScroll(); });
  document.fonts.ready.then(() => { buildPath(); onScroll(); });
  addEventListener('load', () => { buildPath(); onScroll(); });
  buildPath(); onScroll();

  // Boutons aimantés et bordures qui suivent le curseur
  if (fine && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
  document.querySelectorAll('[data-spot]').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  // Accordéon fluide
  document.querySelectorAll('.acc details').forEach((d) => {
    const s = d.querySelector('summary'), body = d.querySelector('div');
    s.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        body.animate([{ height: body.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 360, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = () => (d.open = false);
      } else {
        d.open = true;
        body.animate([{ height: '0px', opacity: 0 }, { height: body.scrollHeight + 'px', opacity: 1 }], { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  // Formulaire → message WhatsApp prêt à envoyer
  const NUMBERS = { boris: '33782988589', kevin: '33781270587' };
  const NAMES = { boris: 'Boris', kevin: 'Kévin' };
  const form = document.getElementById('form');
  const err = form.querySelector('.form-error');
  const sync = () => {
    const cercle = form.intent.value === 'cercle';
    form.querySelectorAll('.cercle-only').forEach((el) => (el.style.display = cercle ? '' : 'none'));
  };
  form.querySelectorAll('input[name="intent"]').forEach((r) => r.addEventListener('change', sync));
  document.querySelectorAll('[data-intent]').forEach((a) => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="intent"][value="${a.dataset.intent}"]`);
    if (r) { r.checked = true; sync(); }
  }));
  sync();
  form.querySelectorAll('select').forEach((s) => {
    const paint = () => (s.style.color = s.value ? '' : 'var(--ink-3)');
    s.addEventListener('change', paint); paint();
  });

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
      v('equipe') ? `Équipe : ${v('equipe')}` : null,
      `Ce que j’aimerais confier à l’IA : ${v('tache')}`,
      v('invest') ? `Déjà investi dans un outil, une formation ou un prestataire : ${v('invest')}` : null,
      cercle ? 'Je m’engage à partager où j’en suis dans le Cercle.' : null,
    ].filter((l) => l !== null);
    window.open(`https://wa.me/${NUMBERS[to]}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();

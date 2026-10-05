// Le Cercle IA Business : globe du héros, fond réseau, apparitions, phrase encrée, chemin des étapes, bandeau, formulaire WhatsApp.
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

  // Globe en points : continents, membres reliés, rotation douce (glisser pour tourner)
  const globe = document.querySelector('.globe');
  if (globe && window.GLOBE_LAND) {
    const ctx = globe.getContext('2d');
    const RAD = Math.PI / 180;
    const L = window.GLOBE_LAND, land = [];
    for (let i = 0; i < L.length; i += 2) land.push([L[i] * RAD, L[i + 1] * RAD]);
    const HUBS = {
      paris: [48.85, 2.35], bruxelles: [50.85, 4.35], geneve: [46.2, 6.14], montreal: [45.5, -73.57],
      casablanca: [33.57, -7.59], dakar: [14.7, -17.45], abidjan: [5.36, -4.0], lome: [6.13, 1.22],
      douala: [4.05, 9.7], kinshasa: [-4.32, 15.3], libreville: [0.42, 9.47],
    };
    const hubs = Object.values(HUBS).map(([a, b]) => [a * RAD, b * RAD]);
    const LINKS = [['paris', 'lome'], ['paris', 'abidjan'], ['paris', 'montreal'], ['bruxelles', 'kinshasa'], ['paris', 'dakar'],
      ['lome', 'abidjan'], ['douala', 'libreville'], ['geneve', 'casablanca'], ['casablanca', 'dakar'], ['lome', 'douala'], ['montreal', 'abidjan']];
    const vec = ([la, lo]) => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    const arcs = LINKS.map(([a, b], i) => {
      const A = vec([HUBS[a][0] * RAD, HUBS[a][1] * RAD]), B = vec([HUBS[b][0] * RAD, HUBS[b][1] * RAD]);
      const om = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
      const pts = [];
      for (let k = 0; k <= 48; k++) {
        const t = k / 48, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
        const h = 1 + Math.min(0.32, om * 0.22) * Math.sin(Math.PI * t);
        pts.push([(A[0] * s1 + B[0] * s2) * h, (A[1] * s1 + B[1] * s2) * h, (A[2] * s1 + B[2] * s2) * h]);
      }
      return { pts, off: i * 0.37 };
    });
    let W = 0, H = 0, dpr = 1, lon0 = 0, lat0 = 22 * RAD, drag = null, spinV = 0, visible = true;
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = globe.clientWidth; H = globe.clientHeight;
      globe.width = W * dpr; globe.height = H * dpr;
    };
    size(); addEventListener('resize', size);
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(globe);
    globe.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, lon: lon0 }; globe.setPointerCapture(e.pointerId); });
    globe.addEventListener('pointermove', (e) => { if (drag) lon0 = drag.lon - (e.clientX - drag.x) * 0.006; });
    globe.addEventListener('pointerup', () => (drag = null));
    // rotation de 3D vers 2D (repère : x vers l'écran droit, y vers le haut, z vers l'écran)
    const proj = (v) => {
      const cl = Math.cos(lon0), sl = Math.sin(lon0), ct = Math.cos(lat0), st = Math.sin(lat0);
      const x1 = v[0] * cl + v[1] * sl, y1 = -v[0] * sl + v[1] * cl, z1 = v[2];
      return [y1, z1 * ct - x1 * st, x1 * ct + z1 * st];
    };
    const ll = ([la, lo]) => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    const landV = land.map(ll), hubV = hubs.map(ll);
    let base = -8 * RAD, t0 = performance.now();
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      const t = Math.max(0, now - t0) / 1000;
      if (!drag) { base += 0.0009; lon0 += (base + Math.sin(t * 0.18) * 0.5 - lon0) * 0.02; } else base = lon0;
      const R = Math.min(W, H) * 0.44 * dpr, cx = (W * dpr) / 2, cy = (H * dpr) / 2;
      ctx.clearRect(0, 0, globe.width, globe.height);
      // sphère : léger volume
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
      g.addColorStop(0, 'rgba(255,253,249,0.95)'); g.addColorStop(0.7, 'rgba(244,238,226,0.6)'); g.addColorStop(1, 'rgba(233,211,161,0.18)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(169,124,51,0.35)'; ctx.lineWidth = 1 * dpr; ctx.stroke();
      ctx.setLineDash([1 * dpr, 7 * dpr]); ctx.strokeStyle = 'rgba(20,28,44,0.25)';
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      // continents
      for (const v of landV) {
        const [x, y, z] = proj(v);
        if (z <= 0.02) continue;
        ctx.fillStyle = `rgba(20,28,44,${(0.12 + 0.6 * z).toFixed(3)})`;
        const r = (0.7 + 0.75 * z) * dpr;
        ctx.beginPath(); ctx.arc(cx + x * R, cy - y * R, r, 0, 6.2832); ctx.fill();
      }
      // liaisons
      ctx.lineCap = 'round';
      for (const a of arcs) {
        const P = a.pts.map(proj);
        ctx.beginPath();
        let started = false;
        P.forEach(([x, y, z]) => {
          const ok = z > 0 || x * x + y * y > 1;
          if (!ok) { started = false; return; }
          const X = cx + x * R, Y = cy - y * R;
          started ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); started = true;
        });
        ctx.strokeStyle = 'rgba(169,124,51,0.45)'; ctx.lineWidth = 1.1 * dpr; ctx.stroke();
        const head = ((t * 0.32 + a.off) % 1.4);
        if (head <= 1) {
          const k = Math.floor(head * 48), [x, y, z] = P[k];
          if (z > 0 || x * x + y * y > 1) {
            const X = cx + x * R, Y = cy - y * R;
            const sg = ctx.createRadialGradient(X, Y, 0, X, Y, 9 * dpr);
            sg.addColorStop(0, 'rgba(255,246,223,1)'); sg.addColorStop(0.4, 'rgba(226,194,127,0.8)'); sg.addColorStop(1, 'rgba(226,194,127,0)');
            ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(X, Y, 9 * dpr, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      // membres
      hubV.forEach((v, i) => {
        const [x, y, z] = proj(v);
        if (z <= 0.05) return;
        const X = cx + x * R, Y = cy - y * R, p = (t * 0.6 + i * 0.13) % 1;
        ctx.strokeStyle = `rgba(169,124,51,${(0.6 * (1 - p) * z).toFixed(3)})`; ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath(); ctx.arc(X, Y, (4 + p * 14) * dpr, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#FFFDF9'; ctx.beginPath(); ctx.arc(X, Y, 4.2 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#A97C33'; ctx.beginPath(); ctx.arc(X, Y, 2.8 * dpr, 0, Math.PI * 2); ctx.fill();
      });
    };
    if (reduce) { requestAnimationFrame((n) => { draw(n); }); } else requestAnimationFrame(draw);
  }

  // Fond réseau : points qui dérivent et se relient
  const net = document.querySelector('.net');
  if (net && !reduce) {
    const c = net.getContext('2d');
    let w = 0, h = 0, r = 1, pts = [], mouse = null;
    const init = () => {
      r = Math.min(2, devicePixelRatio || 1);
      w = innerWidth; h = innerHeight; net.width = w * r; net.height = h * r;
      const n = Math.min(90, Math.round((w * h) / 17000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, s: Math.random() < 0.12 }));
    };
    init(); addEventListener('resize', init);
    addEventListener('pointermove', (e) => (mouse = { x: e.clientX, y: e.clientY }), { passive: true });
    const D = 150;
    const loop = () => {
      requestAnimationFrame(loop);
      if (document.hidden) return;
      c.setTransform(r, 0, 0, r, 0, 0); c.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
      }
      c.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < D) { c.strokeStyle = `rgba(20,28,44,${(0.09 * (1 - d / D)).toFixed(3)})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
        }
        if (mouse) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < 200) { c.strokeStyle = `rgba(169,124,51,${(0.35 * (1 - d / 200)).toFixed(3)})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(mouse.x, mouse.y); c.stroke(); }
        }
      }
      for (const p of pts) {
        c.fillStyle = p.s ? 'rgba(169,124,51,0.55)' : 'rgba(20,28,44,0.22)';
        c.beginPath(); c.arc(p.x, p.y, p.s ? 2.2 : 1.4, 0, Math.PI * 2); c.fill();
      }
    };
    requestAnimationFrame(loop);
  }

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

// Le Cercle IA Business : apparitions, texte révélé au scroll, frise, compteurs, formulaire WhatsApp.
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Titre découpé mot à mot
  document.querySelectorAll('[data-split]').forEach((el) => {
    const walk = (node, out) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((t) => t && out.push({ t, tag: null }));
        else out.push({ t: n.textContent, tag: n.tagName.toLowerCase() });
      });
      return out;
    };
    const parts = walk(el, []);
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
    requestAnimationFrame(() => setTimeout(() => el.classList.add('in'), 80));
  });

  // Phrase qui s'encre au fil du scroll
  const scrub = document.querySelector('[data-scrub]');
  let words = [];
  if (scrub) {
    scrub.innerHTML = scrub.textContent.split(/(\s+)/).map((t) => (/^\s+$/.test(t) ? t : `<span class="w">${t}</span>`)).join('');
    words = [...scrub.querySelectorAll('.w')];
  }

  // Apparitions
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      const c = e.target.querySelector('[data-count]');
      if (c) count(c);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  // Compteurs
  function count(el) {
    const to = Number(el.dataset.count);
    if (reduce || to === 0) { el.textContent = String(to); return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Scroll : en-tête, barre de progression, parallaxe, frise, phrase
  const top = document.querySelector('.top');
  const bar = document.querySelector('.progress span');
  const par = [...document.querySelectorAll('[data-parallax]')];
  const tl = document.querySelector('[data-timeline]');
  const tlFill = tl && tl.querySelector('.tl-line span');
  const tlItems = tl ? [...tl.querySelectorAll('li')] : [];
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    top.classList.toggle('scrolled', y > 30);
    const max = doc.scrollHeight - vh;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduce) par.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax)}px)`;
    });
    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height));
      tlFill.style.transform = `scaleY(${p})`;
      tlItems.forEach((li) => li.classList.toggle('lit', li.getBoundingClientRect().top < vh * 0.62));
    }
    if (words.length) {
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', reduce || i < n));
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Accordéon fluide
  document.querySelectorAll('.acc details').forEach((d) => {
    const s = d.querySelector('summary'), body = d.querySelector('div');
    s.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const h = body.scrollHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = () => (d.open = false);
      } else {
        d.open = true;
        const h = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
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
  form.querySelectorAll('.fl select').forEach((s) => s.addEventListener('change', () => s.parentElement.classList.toggle('filled', !!s.value)));

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
    ].filter((l) => l !== false && l !== null);
    window.open(`https://wa.me/${NUMBERS[to]}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();

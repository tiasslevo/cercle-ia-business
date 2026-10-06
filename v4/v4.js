(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- reveal ---------- */
  const visible = new Set();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); visible.add(e.target); onShow(e.target); }
    else visible.delete(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => io.observe(el));
  const alive = (el) => visible.has(el.closest('.rv'));

  /* ---------- hero : mot qui bascule lettre à lettre ---------- */
  const fw = $('.flip-word');
  if (fw && !reduce) {
    const words = ['ton restaurant', 'ta boutique', 'ton cabinet', 'ton entreprise', 'ton équipe', 'ton agence'];
    const set = (w, cls) => {
      fw.textContent = '';
      [...w].forEach((c, i) => {
        const s = document.createElement('span');
        s.className = 'ch ' + cls; s.textContent = c === ' ' ? ' ' : c;
        s.style.animationDelay = (i * (cls === 'in' ? 28 : 14)) + 'ms';
        fw.append(s);
      });
    };
    (async () => {
      let i = 0;
      for (;;) {
        await wait(2800);
        set(words[i % words.length], 'out');
        await wait(260 + words[i % words.length].length * 14);
        i++;
        set(words[i % words.length], 'in');
      }
    })();
  }

  /* ---------- exemples : boucle infinie ---------- */
  const track = $('.rail-track');
  if (track) track.append(...[...track.children].map((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));

  /* ---------- segmented controls ---------- */
  const placeInd = (seg) => {
    const on = $('[aria-selected="true"]', seg) || $('input:checked', seg)?.parentElement;
    const ind = $('.seg-ind', seg);
    if (!on || !ind) return;
    ind.style.width = on.offsetWidth + 'px';
    ind.style.transform = `translateX(${on.offsetLeft}px)`;
  };
  const segs = $$('.seg');
  const placeAll = () => segs.forEach(placeInd);
  placeAll(); addEventListener('resize', placeAll); document.fonts?.ready.then(placeAll);

  /* ---------- pour qui ---------- */
  const who = $('.who');
  const week = $('.week');
  const sets = week ? JSON.parse(week.dataset.sets) : [];
  let weekRun = 0;
  async function playWeek(k) {
    const run = ++weekRun, items = $$('li', week);
    items.forEach((li, j) => {
      li.classList.remove('done', 'enter'); void li.offsetWidth;
      $('span', li).textContent = sets[k][j]; li.classList.add('enter');
      li.style.animationDelay = j * 70 + 'ms';
    });
    if (reduce) { items.forEach((li) => li.classList.add('done')); return; }
    await wait(900);
    for (const li of items) { if (run !== weekRun) return; li.classList.add('done'); await wait(650); }
  }
  let whoTouched = false;
  const showWho = (k) => {
    $$('[data-who]', who).forEach((x) => x.setAttribute('aria-selected', +x.dataset.who === k));
    $$('.who-t', who).forEach((p, i) => p.classList.toggle('is-on', i === k));
    $$('.who-art img', who).forEach((p, i) => p.classList.toggle('is-on', i === k));
    placeInd($('.seg', who)); playWeek(k);
  };
  if (who) $$('[data-who]', who).forEach((t) => t.addEventListener('click', () => { whoTouched = true; showWho(+t.dataset.who); }));
  async function whoLoop() {
    playWeek(0);
    if (reduce) return;
    let k = 0;
    for (;;) {
      await wait(6500);
      if (whoTouched) return;
      if (!visible.has(who)) continue;
      k = (k + 1) % 3; showWho(k);
    }
  }

  /* ---------- composer ---------- */
  const typed = $('.c-typed');
  const prompts = ['Réponds aux avis Google de mon restaurant', 'Relance les devis restés sans réponse', 'Prépare mes posts de la semaine', 'Résume la réunion de ce matin', 'Trie mes mails clients par urgence'];
  async function typeLoop() {
    let i = 0;
    for (;;) {
      const s = prompts[i++ % prompts.length];
      for (let k = 1; k <= s.length; k++) { typed.textContent = s.slice(0, k); await wait(40 + Math.random() * 40); }
      await wait(2000);
      for (let k = s.length; k >= 0; k--) { typed.textContent = s.slice(0, k); await wait(15); }
      await wait(300);
    }
  }

  /* ---------- cartes animées ---------- */
  async function think(el) {
    const rows = $$('p', el);
    for (;;) {
      rows.forEach((r) => (r.className = ''));
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
    const n = $('.gen-n', el);
    for (;;) {
      el.classList.remove('done');
      for (let k = 3; k >= 1; k--) { n.textContent = k; await wait(900); }
      el.classList.add('done');
      await wait(3200);
      while (!alive(el)) await wait(500);
    }
  }

  const started = new Set();
  const once = (el, fn) => { if (started.has(el)) return; started.add(el); fn(el); };
  function onShow(el) {
    if (el === who) once(el, whoLoop);
    if (typed && el.contains(typed)) once(typed, reduce ? () => (typed.textContent = prompts[0]) : typeLoop);
    if (reduce) {
      $$('.p-gen', el).forEach((g) => g.classList.add('done'));
      $$('.p-think p', el).forEach((p) => (p.className = 'done'));
      return;
    }
    $$('.p-think', el).forEach((x) => once(x, think));
    $$('.p-flow', el).forEach((x) => once(x, flow));
    $$('.p-gen', el).forEach((x) => once(x, gen));
  }

  /* ---------- formulaire ---------- */
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
})();

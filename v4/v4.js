(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let uid = 0;

  /* ---------- doodles IA ---------- */
  const eyes = (y, dx = 10, fill = '#0f1b33', glow = false) => `
    <g class="eyes">
      <ellipse class="eye" cx="${50 - dx}" cy="${y}" rx="4" ry="6" fill="${fill}"${glow ? ' filter="url(#glow)"' : ''}/>
      <ellipse class="eye" cx="${50 + dx}" cy="${y}" rx="4" ry="6" fill="${fill}"${glow ? ' filter="url(#glow)"' : ''}/>
      ${glow ? '' : `<circle cx="${51.3 - dx}" cy="${y - 2.4}" r="1.4" fill="#fff"/><circle cx="${51.3 + dx}" cy="${y - 2.4}" r="1.4" fill="#fff"/>`}
    </g>`;
  const SPARK = (cx, cy, r) => `M${cx} ${cy - r}Q${cx + r * .1} ${cy - r * .1} ${cx + r} ${cy}Q${cx + r * .1} ${cy + r * .1} ${cx} ${cy + r}Q${cx - r * .1} ${cy + r * .1} ${cx - r} ${cy}Q${cx - r * .1} ${cy - r * .1} ${cx} ${cy - r}Z`;
  const DD = {
    spark: (g) => `
      <defs><radialGradient id="${g}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff6dc"/><stop offset=".45" stop-color="#e3c27c"/><stop offset="1" stop-color="#a8833c"/></radialGradient></defs>
      <g class="bob"><ellipse cx="50" cy="98" rx="20" ry="3" fill="#0f1b33" opacity=".07"/>
      <path d="M50 4C55 34 66 45 96 50C66 55 55 66 50 96C45 66 34 55 4 50C34 45 45 34 50 4Z" fill="url(#${g})" stroke="#e3c27c" stroke-width="3" stroke-linejoin="round"/>
      ${eyes(52, 7)}</g>`,
    bubble: (g) => `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3c66"/><stop offset="1" stop-color="#0f1b33"/></linearGradient></defs>
      <g class="bob"><ellipse cx="50" cy="98" rx="24" ry="3" fill="#0f1b33" opacity=".07"/>
      <path d="M34 14H66A24 24 0 0 1 90 38V54A24 24 0 0 1 66 78H40L22 92L26 76A24 24 0 0 1 10 54V38A24 24 0 0 1 34 14Z" fill="url(#${g})"/>
      <path d="${SPARK(78, 22, 9)}" fill="#e3c27c" class="tw"/>
      ${eyes(46, 11, '#fff')}</g>`,
    bot: (g) => `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece5d6"/></linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g class="bob"><ellipse cx="50" cy="98" rx="24" ry="3" fill="#0f1b33" opacity=".07"/>
      <path d="M50 30V16" stroke="#0f1b33" stroke-width="3" stroke-linecap="round"/>
      <path d="${SPARK(50, 11, 8)}" fill="#c9a35a" class="tw"/>
      <rect x="14" y="30" width="72" height="62" rx="24" fill="url(#${g})" stroke="#e1d8c6" stroke-width="2"/>
      <rect x="8" y="52" width="8" height="18" rx="4" fill="#c9a35a"/><rect x="84" y="52" width="8" height="18" rx="4" fill="#c9a35a"/>
      <rect x="24" y="44" width="52" height="30" rx="15" fill="#0f1b33"/>
      ${eyes(59, 11, '#ead7a6', true)}</g>`,
    orbit: (g) => `
      <defs><radialGradient id="${g}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#3b5185"/><stop offset=".6" stop-color="#16244a"/><stop offset="1" stop-color="#0b1428"/></radialGradient></defs>
      <g class="bob"><ellipse cx="50" cy="98" rx="20" ry="3" fill="#0f1b33" opacity=".07"/>
      <circle cx="50" cy="54" r="30" fill="url(#${g})"/>
      <g class="orb"><ellipse cx="50" cy="54" rx="44" ry="14" fill="none" stroke="#c9a35a" stroke-width="1.6" opacity=".7" transform="rotate(-18 50 54)"/>
      <circle cx="92" cy="40" r="5" fill="#e3c27c"/><circle cx="9" cy="68" r="3.4" fill="#e3c27c"/></g>
      ${eyes(52, 9, '#fff')}</g>`,
    prompt: (g) => `
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f1ead9"/></linearGradient></defs>
      <g class="bob"><ellipse cx="50" cy="98" rx="24" ry="3" fill="#0f1b33" opacity=".07"/>
      <rect x="8" y="18" width="84" height="70" rx="18" fill="url(#${g})" stroke="#e1d8c6" stroke-width="2"/>
      <circle cx="21" cy="30" r="3" fill="#c9a35a"/><circle cx="31" cy="30" r="3" fill="#e1d8c6"/><circle cx="41" cy="30" r="3" fill="#e1d8c6"/>
      ${eyes(56, 11)}
      <rect class="caret" x="44" y="72" width="12" height="3.4" rx="1.7" fill="#c9a35a"/></g>`,
  };
  $$('.dd[data-dd]').forEach((el) => {
    const f = DD[el.dataset.dd];
    if (f) el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${f('dg' + uid++)}</svg>`;
  });
  if (!reduce) {
    let raf = 0, px = innerWidth / 2, py = innerHeight / 3;
    const look = () => {
      raf = 0;
      $$('.dd .eyes').forEach((g) => {
        const r = g.closest('.dd').getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || !r.width) return;
        const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        const k = Math.min(1, Math.hypot(dx, dy) / 400), a = Math.atan2(dy, dx);
        g.style.transform = `translate(${(Math.cos(a) * 4.5 * k).toFixed(2)}px, ${(Math.sin(a) * 3.5 * k).toFixed(2)}px)`;
      });
    };
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
    look();
  }

  /* ---------- reveal ---------- */
  const visible = new Set();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); visible.add(e.target); onShow(e.target); }
    else visible.delete(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => io.observe(el));

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

  /* ---------- rail : boucle infinie ---------- */
  const track = $('.rail-track');
  if (track) track.append(...[...track.children].map((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));

  /* ---------- pour qui : ta semaine ---------- */
  const who = $('.who');
  let weekRun = 0;
  const week = $('.week-l');
  const sets = week ? JSON.parse(week.dataset.sets) : [];
  async function playWeek(k) {
    const run = ++weekRun;
    const items = $$('li', week);
    items.forEach((li, j) => {
      li.classList.remove('done', 'enter'); void li.offsetWidth;
      $('span', li).textContent = sets[k][j]; li.classList.add('enter');
      li.style.animationDelay = j * 70 + 'ms';
    });
    await wait(900);
    for (const li of items) {
      if (run !== weekRun) return;
      li.classList.add('done'); await wait(650);
    }
  }
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
  let whoTouched = false;
  const showWho = (k) => {
    $$('[data-who]', who).forEach((x) => x.setAttribute('aria-selected', +x.dataset.who === k));
    $$('.who-t', who).forEach((p, i) => p.classList.toggle('is-on', i === k));
    placeInd($('.seg', who)); playWeek(k);
  };
  if (who) $$('[data-who]', who).forEach((t) => t.addEventListener('click', () => { whoTouched = true; showWho(+t.dataset.who); }));
  async function whoLoop() {
    playWeek(0);
    let k = 0;
    for (;;) {
      await wait(6000);
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

  const started = new Set();
  const once = (key, fn) => { if (started.has(key)) return; started.add(key); fn(); };
  function onShow(el) {
    if (el === who) once('who', reduce ? () => { playWeek(0); } : whoLoop);
    if (typed && el.contains(typed)) once('type', reduce ? () => (typed.textContent = prompts[0]) : typeLoop);
  }

  /* ---------- étapes : scène pilotée au scroll ---------- */
  const journey = $('.journey');
  if (journey) {
    const steps = $$('.j-steps li', journey), scenes = $$('.scene', journey), bar = $('.j-bar', journey);
    let cur = -1;
    const plays = [playForm, playChat, () => {}];
    const tokens = [0, 0, 0];
    const go = (k) => {
      if (k === cur) return;
      cur = k;
      steps.forEach((s, i) => s.classList.toggle('is-on', i === k));
      scenes.forEach((s, i) => s.classList.toggle('is-on', i === k));
      tokens[k]++; plays[k](tokens[k], k);
    };
    const onScroll = () => {
      const r = journey.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      bar.style.setProperty('--p', p.toFixed(3));
      go(Math.min(2, Math.floor(p * 3 * 0.999)));
    };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
    $$('.j-steps li', journey).forEach((li, i) => { li.style.cursor = 'pointer'; li.addEventListener('click', () => {
      const top = journey.offsetTop + (journey.offsetHeight - innerHeight) * (i + .5) / 3;
      scrollTo({ top, behavior: 'smooth' });
    }); });

    async function playForm(t, k) {
      const ins = $$('.mf-in', scenes[0]), btn = $('.mf-btn', scenes[0]);
      ins.forEach((x) => { x.textContent = ''; x.classList.remove('typing'); });
      btn.classList.remove('sent', 'press');
      if (reduce) { ins.forEach((x) => (x.textContent = x.dataset.type)); btn.classList.add('sent'); return; }
      await wait(450);
      for (const x of ins) {
        x.classList.add('typing');
        const s = x.dataset.type;
        for (let n = 1; n <= s.length; n++) { if (tokens[k] !== t) return; x.textContent = s.slice(0, n); await wait(34 + Math.random() * 30); }
        x.classList.remove('typing'); await wait(200);
      }
      if (tokens[k] !== t) return;
      btn.classList.add('press'); await wait(160); btn.classList.remove('press'); btn.classList.add('sent');
    }
    async function playChat(t, k) {
      const bbs = $$('.bb', scenes[1]), typing = $('.typing', scenes[1]);
      bbs.forEach((b) => b.classList.remove('show')); typing.classList.remove('show');
      if (reduce) { bbs.forEach((b) => b.classList.add('show')); return; }
      await wait(400);
      for (const b of bbs) {
        if (tokens[k] !== t) return;
        const mine = b.classList.contains('out');
        if (!mine) { typing.classList.add('show'); b.parentNode.insertBefore(typing, b); await wait(800); typing.classList.remove('show'); }
        else await wait(700);
        if (tokens[k] !== t) return;
        b.classList.add('show'); await wait(500);
      }
    }
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

// Intro du Cercle au chargement (version blanc et bleu de la page principale) : un membre gravit les marches du logo et devient l'étincelle de l'IA.
// Jouée une fois par session (forcer avec ?intro). Ignorée si l'utilisateur réduit les animations.
(() => {
  const html = document.documentElement;
  if (!html.classList.contains('intro-on')) return;
  const base = document.currentScript.dataset.base || './';
  const NS = 'http://www.w3.org/2000/svg', INK = '#0b0b0f', GOLD = '#1d6bff';
  const E = { out: 'cubic-bezier(.16,1,.3,1)', io: 'cubic-bezier(.65,0,.35,1)', back: 'cubic-bezier(.34,1.56,.64,1)', lin: 'linear' };
  const A = (el, kf, o) => el.animate(kf, Object.assign({ fill: 'both', easing: E.io }, o));
  const AF = (el, kf, o) => A(el, kf, Object.assign({ fill: 'forwards' }, o));
  const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };

  const ov = document.createElement('div');
  ov.className = 'cercle-intro';
  ov.innerHTML = '<div class="ci-logo"></div>';
  const st = document.createElement('style');
  st.textContent = `.cercle-intro{position:fixed;inset:0;z-index:300;background:#ffffff;overflow:hidden}
.cercle-intro::before{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(11,11,15,.07) 1px,transparent 1.3px) 0 0/24px 24px;-webkit-mask:radial-gradient(70% 60% at 50% 50%,#000,transparent);mask:radial-gradient(70% 60% at 50% 50%,#000,transparent)}
.ci-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,72vw)}
.ci-logo svg{width:100%;height:auto;display:block;overflow:visible}`;
  document.head.append(st); document.body.append(ov);

  const finish = () => { ov.remove(); html.classList.remove('intro-on'); };
  ov.addEventListener('click', () => ov.getAnimations({ subtree: true }).forEach((a) => a.finish()));

  fetch(base + 'brand/logos/seuil-grotesque.svg').then((r) => r.text()).then((txt) => {
    txt = txt.replace(/#B98B3E/gi, GOLD).replace(/#141C2C/gi, INK);
    const holder = ov.querySelector('.ci-logo'); holder.innerHTML = txt;
    const svg = holder.querySelector('svg');
    svg.querySelectorAll('[data-part], path, g').forEach((e) => { e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; });
    html.classList.remove('intro-on'); // le rideau de secours laisse la place à l'intro
    html.classList.add('intro-run');

    const W = innerWidth, H = innerHeight, sym = svg.querySelector('[data-part="symbol"]');
    const arch = svg.querySelector('[data-part="arch"]'), spark = svg.querySelector('[data-part="spark"]');
    const word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    const steps = [...svg.querySelectorAll('[data-part="step"]')].sort((a, b) => b.getBBox().y - a.getBBox().y); // du bas vers le haut
    const f = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    const sb = box(sym), S = (H * (W < 700 ? 0.42 : 0.56)) / sb.h, ux = (W / 2 + (W < 700 ? 52 : 30) - sb.cx) / f, uy = (H * 0.47 - sb.cy) / f, u = 1 / (S * f);
    const bb = (el) => { const r = el.getBBox(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; };
    const L = steps.map(bb), SP = bb(spark);

    // le symbole est montré en grand, puis rejoint sa place dans le logo
    A(sym, [{ transform: `translate(${ux}px,${uy}px) scale(${S})` }, { transform: `translate(${ux}px,${uy}px) scale(${S})`, offset: 2800 / 3650 }, { transform: 'none' }], { duration: 3650 });
    steps.forEach((s) => A(s, [{ fill: 'rgba(29,107,255,.16)' }, { fill: 'rgba(29,107,255,.16)' }], { duration: 1 }));

    // le membre (point doré) gravit les marches
    const r = 7.5 * u, P = [[L[0].x - 130 * u, L[0].y + L[0].h - r], ...L.map((b) => [b.cx, b.y - r]), [SP.cx, SP.cy]];
    const dot = mk('circle', { cx: 0, cy: 0, r, fill: GOLD }, sym); dot.style.transformBox = 'view-box'; dot.style.transformOrigin = '0 0';
    const kf = [];
    P.forEach((p, i) => {
      if (i) { const q = P[i - 1]; kf.push({ transform: `translate(${(q[0] + p[0]) / 2}px,${Math.min(q[1], p[1]) - 26 * u}px)`, offset: (i - 0.5) / (P.length - 1) }); }
      kf.push({ transform: `translate(${p[0]}px,${p[1]}px)`, offset: i / (P.length - 1) });
    });
    A(dot, kf, { delay: 300, duration: 2000, easing: 'cubic-bezier(.45,0,.55,1)' });
    A(dot, [{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1 }], { delay: 150, duration: 2150, easing: E.lin });
    // arrivé en haut, il s'ouvre et devient l'étincelle
    const halo = mk('circle', { cx: SP.cx, cy: SP.cy, r: r * 1.2, fill: 'none', stroke: GOLD, 'stroke-width': 1.4 * u }, sym);
    AF(dot, [{ r, opacity: 1 }, { r: r * 1.5, opacity: 0 }], { delay: 2300, duration: 260, easing: E.out });
    A(halo, [{ r: r, opacity: 0 }, { r: r * 1.2, opacity: .9, offset: .1 }, { r: r * 7, opacity: 0 }], { delay: 2300, duration: 800, easing: E.out });
    A(spark, [{ opacity: 0, transform: 'scale(.3) rotate(-45deg)' }, { opacity: 1, transform: 'scale(1.3) rotate(10deg)', offset: .55 }, { opacity: 1, transform: 'none' }], { delay: 2260, duration: 700, easing: E.out });

    const big = W >= 700, words = ['Entrepreneurs', 'Dirigeants', 'Managers'];
    steps.forEach((s, i) => {
      const t = 300 + ((i + 1) / (P.length - 1)) * 2000, b = L[i];
      AF(s, [{ fill: 'rgba(29,107,255,.16)' }, { fill: GOLD }], { delay: t - 60, duration: 260 });
      const px = big ? 15 : 12.5, lab = mk('text', { x: b.x - 16 * u, y: b.cy, 'font-size': px * u, fill: INK, 'text-anchor': 'end', 'dominant-baseline': 'central', 'font-family': 'General Sans, sans-serif', 'font-weight': 700, 'letter-spacing': px * u * 0.12 }, sym);
      lab.textContent = words[i].toUpperCase();
      A(lab, [{ opacity: 0, transform: 'translateX(8px)' }, { opacity: 1, transform: 'none' }], { delay: t, duration: 380, easing: E.out });
      AF(lab, [{ opacity: 1 }, { opacity: 0 }], { delay: 2100, duration: 220 });
    });

    // l'arche se dessine autour de l'étincelle
    arch.setAttribute('pathLength', 100);
    A(arch, [{ opacity: 0 }, { opacity: 1 }], { delay: 2300, duration: 60, easing: E.lin });
    A(arch, [{ strokeDasharray: '0 50 0 50' }, { strokeDasharray: '0 0 100 0' }], { delay: 2300, duration: 900 }); // part du sommet, descend des deux côtés
    const inner = svg.querySelector('[data-part="inner"]'); if (inner) A(inner, [{ opacity: 0 }, { opacity: 1 }], { delay: 2800, duration: 400 });

    A(word, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { delay: 3450, duration: 650 });
    A(tag, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { delay: 3750, duration: 650, easing: E.out });

    const out = A(ov, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { delay: 4700, duration: 850, easing: 'cubic-bezier(.76,0,.24,1)' });
    out.finished.then(() => { html.classList.remove('intro-run'); ov.remove(); });
  }).catch(finish);
})();

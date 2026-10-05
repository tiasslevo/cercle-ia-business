// Intros du Cercle : une transformation différente pour chaque logo, construite avec les pièces du logo.
// Tout passe par l'API Web Animations : on peut donc rejouer, ou figer n'importe quel instant pour l'export vidéo.
(() => {
  const qs = new URLSearchParams(location.search);
  const intro = document.getElementById('intro'), holder = document.getElementById('logo'), bar = document.getElementById('bar');
  if (qs.has('clean')) bar.classList.add('hide');
  const NS = 'http://www.w3.org/2000/svg', INK = '#141C2C', GOLD = '#B98B3E', GOLD_HI = '#E9D3A1';
  const E = { out: 'cubic-bezier(.16,1,.3,1)', io: 'cubic-bezier(.65,0,.35,1)', back: 'cubic-bezier(.34,1.56,.64,1)', lin: 'linear' };
  const A = (el, kf, o) => el.animate(kf, Object.assign({ fill: 'both', easing: E.io }, o));
  const AF = (el, kf, o) => A(el, kf, Object.assign({ fill: 'forwards' }, o));
  const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };
  let rnd = 1; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const hex = (cx, cy, r) => 'M' + [0, 1, 2, 3, 4, 5].map((i) => `${(cx + r * Math.cos((60 * i - 90) * Math.PI / 180)).toFixed(1)} ${(cy + r * Math.sin((60 * i - 90) * Math.PI / 180)).toFixed(1)}`).join(' L') + 'Z';
  const sparkD = (cx, cy, s, k = 0.16) => { const p = [[cx, cy - s], [cx + s, cy], [cx, cy + s], [cx - s, cy]]; let d = `M${p[0][0]} ${p[0][1]}`; for (let i = 0; i < 4; i++) { const a = p[i], b = p[(i + 1) % 4]; d += `Q${cx + (a[0] + b[0] - 2 * cx) * k} ${cy + (a[1] + b[1] - 2 * cy) * k} ${b[0]} ${b[1]}`; } return d + 'Z'; };

  // ---------- outils communs ----------
  function stage() {
    const layer = document.createElement('div'); layer.className = 'layer'; intro.append(layer);
    const ov = mk('svg', { class: 'ov', viewBox: `0 0 ${innerWidth} ${innerHeight}` }); layer.append(ov);
    return { layer, ov, W: innerWidth, H: innerHeight };
  }
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
  function caption(layer, html, x, y, t0, t1, light) {
    const c = document.createElement('div'); c.className = 'cap' + (light ? ' light' : ''); c.innerHTML = html; c.style.left = x + 'px'; c.style.top = y + 'px'; layer.append(c);
    A(c, [{ opacity: 0, transform: 'translate(-50%,-30%)' }, { opacity: 1, transform: 'translate(-50%,-50%)' }], { delay: t0, duration: 350, easing: E.out });
    AF(c, [{ opacity: 1 }, { opacity: 0 }], { delay: t1, duration: 300 });
    return c;
  }
  const hideUntil = (el, t, dur = 400, extra = {}) => A(el, [{ opacity: 0, ...(extra.from || {}) }, { opacity: 1, ...(extra.to || {}) }], { delay: t, duration: dur, easing: extra.easing || E.out });
  const drawStroke = (el, t, dur, easing = E.io) => { el.setAttribute('pathLength', 100); return A(el, [{ strokeDasharray: '100 100', strokeDashoffset: 100 }, { strokeDasharray: '100 100', strokeDashoffset: 0 }], { delay: t, duration: dur, easing }); };
  const wipe = (el, t, dur, from) => {
    const start = { left: 'inset(0 100% 0 0)', type: 'inset(0 100% 0 0)', center: 'inset(0 50% 0 50%)', top: 'inset(0 0 100% 0)', bottom: 'inset(100% 0 0 0)' }[from];
    return A(el, [{ clipPath: start }, { clipPath: 'inset(0 0 0 0)' }], { delay: t, duration: dur, easing: from === 'type' ? 'steps(9, end)' : E.io });
  };
  const tagIn = (el, t) => A(el, [{ opacity: 0, transform: 'translateY(8px)', letterSpacing: '0' }, { opacity: 1, transform: 'none' }], { delay: t, duration: 650, easing: E.out });
  const prep = (svg) => svg.querySelectorAll('[data-part], path, rect, g').forEach((e) => { e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; });

  // ---------- 1. ruche grotesque : l'essaim ----------
  function rucheEssaim(svg) {
    const { layer, ov, W, H } = stage();
    const cells = [...svg.querySelectorAll('[data-part="cell"]')], core = svg.querySelector('[data-part="core"]');
    const word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    // rayon de miel plein écran
    const r = 30, g = mk('g', {}, ov), lit = [];
    for (let y = -r, row = 0; y < H + r; y += r * 1.5, row++) for (let x = (row % 2) * r * 0.866 - r; x < W + r; x += r * 1.732) {
      const p = mk('path', { d: hex(x, y, r - 2), fill: 'none', stroke: 'rgba(20,28,44,.13)', 'stroke-width': 1 }, g);
      if (rand() < 0.06) lit.push(p);
    }
    A(g, [{ opacity: 0 }, { opacity: 1 }], { delay: 0, duration: 500 });
    AF(g, [{ opacity: 1 }, { opacity: 0 }], { delay: 1900, duration: 600 });
    lit.forEach((p, i) => A(p, [{ fill: 'rgba(233,211,161,0)' }, { fill: 'rgba(233,211,161,.75)', offset: .4 }, { fill: 'rgba(233,211,161,0)' }], { delay: 250 + (i * 37) % 1500, duration: 700 }));
    caption(layer, 'Des <b>entrepreneurs</b>', W / 2, H * 0.82, 200, 800);
    caption(layer, 'Des <b>agents IA</b>', W / 2, H * 0.82, 900, 1450);
    caption(layer, 'Du <b>business</b>', W / 2, H * 0.82, 1550, 2100);
    // l'IA apparaît au centre, encore en encre
    A(core, [{ opacity: 0, transform: 'scale(0)', fill: INK }, { opacity: 1, transform: 'scale(1)', fill: INK }], { delay: 1500, duration: 500, easing: E.back });
    // les membres arrivent de tout le réseau
    const c0 = box(core);
    cells.forEach((c, i) => {
      const b = box(c), a = (i / cells.length) * Math.PI * 2 + 0.4, dist = Math.max(W, H) * 0.42;
      const dx = Math.cos(a) * dist - (b.cx - c0.cx) * 0.5, dy = Math.sin(a) * dist * 0.7;
      A(c, [{ opacity: 0, transform: `translate(${dx}px,${dy}px) rotate(120deg) scale(.6)` }, { opacity: 1, transform: 'none' }], { delay: 1750 + i * 90, duration: 850, easing: E.out });
    });
    // le centre bascule en doré
    AF(core, [{ fill: INK, transform: 'scaleX(1)' }, { fill: INK, transform: 'scaleX(0)', offset: .5 }, { fill: GOLD, transform: 'scaleX(1)' }], { delay: 2650, duration: 520 });
    const ring = mk('circle', { cx: c0.cx, cy: c0.cy, r: 10, fill: 'none', stroke: GOLD, 'stroke-width': 2 }, ov);
    A(ring, [{ r: 10, opacity: 0 }, { r: 12, opacity: .9, offset: .1 }, { r: 120, opacity: 0 }], { delay: 2900, duration: 900, easing: E.out });
    hideUntil(svg.querySelector('[data-part="symbol"]'), 0, 1);
    wipe(word, 3150, 750, 'center'); tagIn(tag, 3550);
  }

  // ---------- 2. ruche géométrique : la chaîne ----------
  function rucheChaine(svg) {
    const { layer, ov, W, H } = stage();
    const cells = [...svg.querySelectorAll('[data-part="cell"]')], core = svg.querySelector('[data-part="core"]');
    const word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    const c0 = box(core), y = c0.cy, x0 = W * 0.08, x1 = W * 0.92, gx = c0.cx;
    const line = mk('path', { d: `M${x0} ${y}H${x1}`, stroke: 'rgba(20,28,44,.35)', 'stroke-width': 1.2, fill: 'none' }, ov);
    drawStroke(line, 0, 600);
    const gate = mk('rect', { x: gx - 2, y: y - 30, width: 4, height: 60, fill: GOLD, rx: 2 }, ov); gate.style.transformBox = 'fill-box'; gate.style.transformOrigin = 'center';
    A(gate, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { delay: 350, duration: 400, easing: E.back });
    caption(layer, '<b>IA</b>', gx, y - 52, 450, 2000);
    caption(layer, 'Process', x0 + 60, y + 34, 500, 1950);
    caption(layer, '<b>Automatisé</b>', x1 - 80, y + 34, 1100, 1950);
    for (let i = 0; i < 6; i++) {
      const h = mk('path', { d: hex(0, 0, 13), fill: INK }, ov);
      A(h, [{ transform: `translate(${x0}px,${y}px)`, fill: INK, opacity: 0 }, { opacity: 1, offset: .08 }, { transform: `translate(${gx - 18}px,${y}px)`, fill: INK, offset: .47 }, { transform: `translate(${gx + 18}px,${y}px)`, fill: GOLD, offset: .53 }, { transform: `translate(${x1}px,${y}px)`, fill: GOLD, opacity: 1, offset: .94 }, { transform: `translate(${x1}px,${y}px)`, fill: GOLD, opacity: 0 }], { delay: 500 + i * 170, duration: 1300, easing: E.lin, fill: 'both' });
    }
    A(mk('g', {}, ov), [{ opacity: 1 }], { duration: 1 });
    AF(ov, [{ opacity: 1 }, { opacity: 0 }], { delay: 2000, duration: 350 });
    // les alvéoles quittent la chaîne et se rangent en ruche
    const all = [core, ...cells];
    all.forEach((c, i) => {
      const b = box(c), sx = x0 + (x1 - x0) * (i / (all.length - 1)) - b.cx, sy = y - b.cy;
      A(c, [{ opacity: 0, transform: `translate(${sx}px,${sy}px) scale(.45)` }, { opacity: 1, transform: `translate(${sx * 0.5}px,${sy - 90}px) scale(.8)`, offset: .5 }, { opacity: 1, transform: 'none' }], { delay: 2050 + i * 70, duration: 750, easing: E.io });
    });
    // le nom s'écrit comme dans un terminal
    wipe(word, 2950, 650, 'type');
    const wb = box(word), cur = mk('rect', { x: 0, y: wb.y + 4, width: 8, height: wb.h - 8, fill: GOLD }, mk('svg', { class: 'ov', viewBox: `0 0 ${W} ${H}` }, layer));
    A(cur, [{ transform: `translateX(${wb.x}px)`, opacity: 0 }, { transform: `translateX(${wb.x}px)`, opacity: 1, offset: .01 }, { transform: `translateX(${wb.x + wb.w + 6}px)`, opacity: 1 }], { delay: 2950, duration: 650, easing: 'steps(9, end)' });
    AF(cur, [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { delay: 3650, duration: 700, easing: 'steps(4, end)' });
    tagIn(tag, 3500);
  }

  // ---------- 3. seuil grotesque : la porte ----------
  function seuilPorte(svg) {
    const { layer, W, H } = stage();
    const sym = svg.querySelector('[data-part="symbol"]'), steps = [...svg.querySelectorAll('[data-part="step"]')];
    const spark = svg.querySelector('[data-part="spark"]'), inner = svg.querySelector('[data-part="inner"]');
    const word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    const sb = box(sym), dx = W / 2 - sb.cx, dy = H / 2 - sb.cy + 20;
    // l'arche géante derrière la porte, qui se réduit au logo
    A(sym, [{ transform: `translate(${dx}px,${dy}px) scale(3.4)` }, { transform: `translate(${dx}px,${dy}px) scale(3.4)`, offset: .45 }, { transform: 'none' }], { delay: 0, duration: 2700, easing: E.io });
    caption(layer, 'Des <b>entrepreneurs</b>', W / 2, H * 0.66, 1000, 1750);
    caption(layer, 'Des <b>agents IA</b>', W / 2, H * 0.66 + 30, 1150, 1750);
    caption(layer, 'Du <b>business</b>', W / 2, H * 0.66 + 60, 1300, 1750);
    steps.slice().reverse().forEach((s, i) => A(s, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { delay: 2450 + i * 130, duration: 450, easing: E.out }));
    A(spark, [{ opacity: 0, transform: 'translateY(-220px) rotate(-180deg) scale(.5)' }, { opacity: 1, transform: 'none' }], { delay: 2300, duration: 800, easing: E.back });
    drawStroke(inner, 2250, 700);
    // la porte
    const l = document.createElement('div'), r = document.createElement('div'), slit = document.createElement('div');
    l.className = 'door l'; r.className = 'door r'; slit.className = 'slit'; layer.append(l, r, slit);
    A(slit, [{ transform: 'scaleY(0)', opacity: 1 }, { transform: 'scaleY(1)', opacity: 1 }], { delay: 100, duration: 600, easing: E.out });
    AF(slit, [{ opacity: 1 }, { opacity: 0 }], { delay: 900, duration: 300 });
    A(l, [{ transform: 'none' }, { transform: 'translateX(-100%)' }], { delay: 800, duration: 1000, easing: E.io });
    A(r, [{ transform: 'none' }, { transform: 'translateX(100%)' }], { delay: 800, duration: 1000, easing: E.io });
    A(word, [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(18px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { delay: 3000, duration: 700, easing: E.out });
    tagIn(tag, 3400);
  }

  // ---------- 4. seuil géométrique : la courbe ----------
  function seuilCourbe(svg) {
    const { layer, ov, W, H } = stage();
    const arch = svg.querySelector('[data-part="arch"]'), inner = svg.querySelector('[data-part="inner"]'), spark = svg.querySelector('[data-part="spark"]');
    const steps = [...svg.querySelectorAll('[data-part="step"]')], word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    const sp = box(spark), base = H * 0.72, xs = [W * 0.08, W * 0.2, W * 0.3, sp.cx], ys = [base, base - (base - sp.cy) * 0.33, base - (base - sp.cy) * 0.66, sp.cy];
    let d = `M${xs[0]} ${ys[0]}`; for (let i = 1; i < 4; i++) d += `H${xs[i] - 30}V${ys[i]}`; d += `H${sp.cx}`;
    const axis = mk('path', { d: `M${W * 0.06} ${base + 1}H${W * 0.94}`, stroke: 'rgba(20,28,44,.18)', 'stroke-width': 1, fill: 'none' }, ov);
    drawStroke(axis, 0, 500);
    const curve = mk('path', { d, stroke: INK, 'stroke-width': 2, fill: 'none', 'stroke-linejoin': 'round' }, ov);
    drawStroke(curve, 200, 1300, 'cubic-bezier(.45,0,.55,1)');
    caption(layer, 'Des <b>entrepreneurs</b>', W * 0.14, base + 26, 300, 1950);
    caption(layer, 'Des <b>agents IA</b>', W * 0.25, ys[1] - 22, 700, 1950);
    caption(layer, 'Du <b>business</b>', W * 0.36, ys[2] - 22, 1100, 1950);
    const st = mk('path', { d: sparkD(sp.cx, sp.cy, 18), fill: GOLD }, ov); st.style.transformBox = 'fill-box'; st.style.transformOrigin = 'center';
    A(st, [{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'scale(1.5) rotate(0)', offset: .6 }, { transform: 'scale(1)' }], { delay: 1450, duration: 600, easing: E.out });
    AF(ov, [{ opacity: 1 }, { opacity: 0 }], { delay: 2050, duration: 500 });
    hideUntil(spark, 2050, 300);
    // la courbe devient l'arche
    drawStroke(arch, 1950, 900); drawStroke(inner, 2250, 700);
    steps.forEach((s, i) => A(s, [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }], { delay: 2450 + (2 - i) * 110, duration: 500, easing: E.out }));
    wipe(word, 2950, 700, 'left'); tagIn(tag, 3350);
  }

  // ---------- 5. arche et marches : le travelling arrière ----------
  function archeTravelling(svg) {
    const { layer, W, H } = stage();
    const arches = [...svg.querySelectorAll('[data-part="arch"]')], spark = svg.querySelector('[data-part="spark"]');
    const steps = [...svg.querySelectorAll('[data-part="step"]')], word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    const sb = box(svg), sp = box(spark);
    svg.style.transformOrigin = `${sp.cx - sb.x}px ${sp.cy - sb.y}px`;
    A(svg, [{ transform: `translate(${W / 2 - sp.cx}px,${H / 2 - sp.cy}px) scale(7)` }, { transform: 'none' }], { delay: 0, duration: 2300, easing: 'cubic-bezier(.22,1,.36,1)' });
    A(spark, [{ transform: 'rotate(-270deg)' }, { transform: 'none' }], { delay: 0, duration: 2300, easing: 'cubic-bezier(.22,1,.36,1)' });
    arches.forEach((a, i) => drawStroke(a, 300 + i * 150, 1800));
    const labels = ['Des <b>entrepreneurs</b>', 'Des <b>agents IA</b>', 'Du <b>business</b>'];
    steps.forEach((s, i) => {
      const b = box(s);
      caption(layer, labels[i], W / 2, H / 2 + (b.cy - sp.cy) * 0 + 140 + i * 30, 1900 + i * 260, 2900);
      A(s, [{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }], { delay: 2900 + i * 120, duration: 500, easing: E.out });
    });
    A(word, [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(22px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { delay: 2600, duration: 800, easing: E.out });
    tagIn(tag, 3100);
  }

  // ---------- 6. arche et colonnes : l'édifice ----------
  function archeEdifice(svg) {
    const { layer, ov, W, H } = stage();
    const cols = [...svg.querySelectorAll('[data-part="column"]')], arch = svg.querySelector('[data-part="arch"]'), spark = svg.querySelector('[data-part="spark"]');
    const ground = svg.querySelector('[data-part="step"]'), word = svg.querySelector('[data-part="word"]'), tag = svg.querySelector('[data-part="tag"]');
    A(ground, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: 0, duration: 750, easing: E.io });
    cols.forEach((c, i) => {
      c.style.transformOrigin = 'center bottom';
      A(c, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { delay: 450 + i * 160, duration: 800, easing: E.out });
      const b = box(c); caption(layer, i ? 'Du <b>business</b>' : 'Des <b>entrepreneurs</b>', b.cx, b.y + b.h + 34, 650 + i * 160, 2700);
    });
    arch.setAttribute('pathLength', 100);
    A(arch, [{ strokeDasharray: '0 100 0' }, { strokeDasharray: '50 0 50' }], { delay: 1250, duration: 1050, easing: E.io });
    const sp = box(spark);
    A(spark, [{ transform: 'scale(0) rotate(-90deg)', opacity: 0 }, { transform: 'scale(1.7) rotate(0)', opacity: 1, offset: .55 }, { transform: 'none', opacity: 1 }], { delay: 2250, duration: 650, easing: E.out });
    const ring = mk('circle', { cx: sp.cx, cy: sp.cy, r: 8, fill: 'none', stroke: GOLD, 'stroke-width': 1.6 }, ov);
    A(ring, [{ r: 8, opacity: 0 }, { r: 10, opacity: 1, offset: .1 }, { r: 150, opacity: 0 }], { delay: 2300, duration: 1000, easing: E.out });
    caption(layer, 'Des <b>agents IA</b>', sp.cx, sp.cy - 40, 2350, 3000);
    wipe(word, 2850, 800, 'top'); tagIn(tag, 3250);
  }

  const SCENES = { 'ruche-grotesque': rucheEssaim, 'ruche-geometrique': rucheChaine, 'seuil-grotesque': seuilPorte, 'seuil-geometrique': seuilCourbe, 'sous-arche-marches': archeTravelling, 'sous-arche-colonnes': archeEdifice };

  async function play(name) {
    document.getAnimations().forEach((a) => a.cancel());
    intro.querySelectorAll('.layer').forEach((l) => l.remove());
    window.__ready = false; rnd = 7;
    bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.logo === name));
    holder.innerHTML = await (await fetch(`../brand/logos/${name}.svg`)).text();
    const svg = holder.querySelector('svg'); prep(svg);
    SCENES[name](svg);
    if (!qs.has('stay')) A(intro, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { delay: 4500, duration: 850, easing: 'cubic-bezier(.76,0,.24,1)' });
    window.__render = (t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t * 1000; });
    window.__ready = true;
    if (qs.has('frames')) document.getAnimations().forEach((a) => a.pause());
  }
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { history.replaceState(null, '', `?logo=${b.dataset.logo}`); play(b.dataset.logo); } });
  play(qs.get('logo') || 'seuil-grotesque');
})();

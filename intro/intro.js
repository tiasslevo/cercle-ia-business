// Intro du Cercle : un réseau de points, l'étincelle de l'IA, puis le logo qui prend forme.
(() => {
  const qs = new URLSearchParams(location.search);
  const intro = document.getElementById('intro'), cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const holder = document.getElementById('logo'), words = [...document.querySelectorAll('.words span')];
  const bar = document.getElementById('bar');
  if (qs.has('clean')) bar.classList.add('hide');
  // enregistrement vidéo : force un rafraîchissement complet de l'écran à chaque image
  if (qs.has('rec')) { const st = document.createElement('style'); st.textContent = '@keyframes rep{0%{background-color:#F7F3EC}100%{background-color:#F7F3ED}}.intro{animation:rep .08s infinite alternate}'; document.head.append(st); }
  const INK = [20, 28, 44], GOLD = [185, 139, 62];
  let W, H, dpr, raf, timers = [];

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };

  // points cibles : on rend le symbole seul dans un canevas et on échantillonne ses pixels
  async function sample(svg, rect, n) {
    const clone = svg.cloneNode(true);
    clone.querySelectorAll('[data-part="word"],[data-part="tag"],[data-part="mask"]').forEach((e) => e.remove());
    clone.querySelectorAll('[data-part]').forEach((e) => e.style.opacity = 1);
    clone.setAttribute('width', rect.width); clone.setAttribute('height', rect.height);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    const img = new Image(); img.src = url; await img.decode();
    const oc = document.createElement('canvas'); oc.width = Math.round(rect.width); oc.height = Math.round(rect.height);
    const o = oc.getContext('2d'); o.drawImage(img, 0, 0, oc.width, oc.height);
    const data = o.getImageData(0, 0, oc.width, oc.height).data, pts = [];
    for (let y = 0; y < oc.height; y += 2) for (let x = 0; x < oc.width; x += 2) {
      const i = (y * oc.width + x) * 4; if (data[i + 3] < 140) continue;
      const gold = data[i] > 140 && data[i] - data[i + 2] > 60;
      pts.push({ x: rect.left + x, y: rect.top + y, gold });
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const gold = pts.filter((p) => p.gold), ink = pts.filter((p) => !p.gold);
    const ng = Math.min(gold.length, Math.round(n * Math.max(0.18, gold.length / Math.max(1, pts.length))));
    return [...gold.slice(0, ng), ...ink.slice(0, n - ng)];
  }

  async function play(name) {
    cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = [];
    window.__ready = false; intro.style.transform = ''; holder.className = 'logo';
    bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.logo === name));
    const svgText = await (await fetch(`../brand/logos/${name}.svg`)).text();
    holder.innerHTML = svgText; const svg = holder.querySelector('svg');
    size();
    const rect = svg.getBoundingClientRect();
    const targets = await sample(svg, rect, Math.min(1500, Math.round(W * H / 800)));
    const cx = W / 2, cy = H / 2;
    // chaque point part d'une position du « monde » : un large ovale autour du centre
    const P = targets.map((t, i) => {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      return { sx: cx + Math.cos(a) * r * W * 0.46, sy: cy + Math.sin(a) * r * H * 0.4, tx: t.x, ty: t.y, gold: t.gold, hub: i % 14 === 0, d: Math.random() * 0.35, ph: Math.random() * 6.28 };
    });
    const hubs = P.filter((p) => p.hub);
    const parts = (sel) => [...svg.querySelectorAll(sel)];
    const symParts = parts('[data-part]:not([data-part="word"]):not([data-part="tag"])');
    const wordEl = svg.querySelector('[data-part="word"]'), tagEl = svg.querySelector('[data-part="tag"]');
    const render = (t) => {
      ctx.clearRect(0, 0, W, H);
      const appear = clamp(t / 0.6), conv = (p) => ease(clamp((t - 1.8 - p.d) / 1.0));
      const sparkOn = clamp((t - 1.2) / 0.4), links = clamp((t - 0.3) / 0.6) * (1 - clamp((t - 1.9) / 0.5));
      const pos = (p) => {
        const k = conv(p), wob = (1 - k) * 6;
        return [p.sx + (p.tx - p.sx) * k + Math.cos(t * 1.3 + p.ph) * wob, p.sy + (p.ty - p.sy) * k + Math.sin(t * 1.1 + p.ph) * wob];
      };
      if (links > 0) {
        ctx.lineWidth = 1;
        for (let i = 0; i < hubs.length; i++) {
          const [ax, ay] = pos(hubs[i]);
          for (let j = i + 1; j < hubs.length; j++) {
            const [bx, by] = pos(hubs[j]), dd = Math.hypot(ax - bx, ay - by);
            if (dd < 150) { ctx.strokeStyle = `rgba(20,28,44,${(0.22 * (1 - dd / 150) * links).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
          }
          if (sparkOn > 0) { const dd = Math.hypot(ax - cx, ay - cy); if (dd < W * 0.3) { ctx.strokeStyle = `rgba(185,139,62,${(0.45 * sparkOn * links * (1 - dd / (W * 0.3))).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx, cy); ctx.stroke(); } }
        }
      }
      const sp = sparkOn * (1 - clamp((t - 2.4) / 0.4));
      if (sp > 0) {
        const s = 10 + 4 * Math.sin(t * 6), g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        g.addColorStop(0, `rgba(233,211,161,${0.55 * sp})`); g.addColorStop(1, 'rgba(233,211,161,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 60, 0, 6.283); ctx.fill();
        ctx.fillStyle = `rgba(185,139,62,${sp})`; ctx.beginPath();
        ctx.moveTo(cx, cy - s * 1.8); ctx.quadraticCurveTo(cx, cy, cx + s * 1.8, cy); ctx.quadraticCurveTo(cx, cy, cx, cy + s * 1.8); ctx.quadraticCurveTo(cx, cy, cx - s * 1.8, cy); ctx.quadraticCurveTo(cx, cy, cx, cy - s * 1.8); ctx.fill();
      }
      const fade = 1 - clamp((t - 3.0) / 0.5);
      if (fade > 0) for (const p of P) {
        const [x, y] = pos(p), k = conv(p);
        const c = p.gold && t > 1.2 ? GOLD : INK;
        const r = (p.hub && k < 0.5 ? 2.4 : 1.25) * (0.6 + 0.4 * appear);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(appear * (0.35 + 0.65 * k) * fade).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      }
      // mots
      words.forEach((w, i) => {
        const a = 0.15 + i * 0.52, on = clamp((t - a) / 0.3) * (1 - clamp((t - a - (i === 2 ? 1.25 : 0.52)) / 0.3));
        w.style.opacity = on; w.style.transform = `translateY(${(1 - Math.min(1, on * 2)) * 8}px)`;
      });
      // logo net, nom, sortie
      const so = clamp((t - 2.95) / 0.5); symParts.forEach((e) => (e.style.opacity = so));
      const wk = ease(clamp((t - 3.25) / 0.75)); if (wordEl) wordEl.style.clipPath = `inset(0 ${(1 - wk) * 100}% 0 0)`;
      const tk = clamp((t - 3.45) / 0.6); if (tagEl) { tagEl.style.opacity = tk; tagEl.style.transform = `translateY(${(1 - tk) * 6}px)`; }
      const out = qs.has('stay') ? 0 : ease(clamp((t - 4.5) / 0.9));
      intro.style.transform = `translateY(${-out * 100}%)`;
    };
    window.__render = render; window.__ready = true;
    if (qs.has('frames')) return;
    const T0 = performance.now();
    const loop = (now) => { const t = (now - T0) / 1000; render(Math.max(0, t)); if (t < 5.6) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }

  const first = qs.get('logo') || 'seuil-grotesque';
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { history.replaceState(null, '', `?logo=${b.dataset.logo}`); play(b.dataset.logo); } });
  addEventListener('resize', () => { size(); });
  play(first);
})();

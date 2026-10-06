// Le Cercle IA Business, v3 : une forme faite d'étincelles qui raconte la page au fil du scroll.
// 0 cerveau (l'IA) · 1 boutique, tour et équipe (pour qui) · 2 globe (le Cercle) · 3 nuée (fond) · 4 marches (entrer) · 5 logo.
import * as THREE from 'three';

const doc = document.documentElement;
doc.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 760;
const N = mobile ? 6500 : 11000;
const INK = [0.078, 0.11, 0.172], INK2 = [0.31, 0.337, 0.392], GOLD = [0.725, 0.545, 0.243], GOLD2 = [0.86, 0.71, 0.45];

let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// ---------- formes ----------
function brain() {
  const B = window.BRAIN || [], n = B.length / 3, out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const k = Math.floor(rnd() * n) * 3; out.set([B[k] + gauss() * 0.006, B[k + 1] + gauss() * 0.006, B[k + 2] + gauss() * 0.006], i * 3); }
  return out;
}
// points sur les faces d'une boîte (centre, tailles), répartis selon l'aire
function boxPts(out, from, count, cx, cy, cz, w, h, d) {
  const A = [w * h, w * h, d * h, d * h, w * d, w * d], tot = A.reduce((a, b) => a + b, 0);
  for (let i = 0; i < count; i++) {
    let r = rnd() * tot, f = 0; while (r > A[f]) { r -= A[f]; f++; }
    let x = (rnd() - 0.5) * w, y = (rnd() - 0.5) * h, z = (rnd() - 0.5) * d;
    if (f === 0) z = d / 2; else if (f === 1) z = -d / 2; else if (f === 2) x = w / 2; else if (f === 3) x = -w / 2; else if (f === 4) y = h / 2; else y = -h / 2;
    out.set([cx + x, cy + y, cz + z], (from + i) * 3);
  }
}
function trio() {
  const out = new Float32Array(N * 3), gap = mobile ? 1.55 : 2.25, parts = [];
  // la boutique : murs, toit, store, vitrine
  const s = -gap;
  parts.push([0.22, s, -0.15, 0, 1.3, 0.9, 0.9], [0.06, s, 0.36, 0, 1.45, 0.08, 1.05], [0.05, s, 0.18, 0.47, 1.36, 0.06, 0.25], [0.04, s - 0.3, -0.25, 0.46, 0.38, 0.4, 0.02], [0.04, s + 0.3, -0.35, 0.46, 0.28, 0.6, 0.02]);
  // la tour : immeuble et annexe
  parts.push([0.24, 0.0 - 0.2, 0.1, 0, 0.62, 1.95, 0.62], [0.1, 0.42, -0.42, 0.05, 0.6, 0.85, 0.5]);
  // l'équipe : trois postes autour d'un agent
  const t = gap;
  [[-0.45, 0.2], [0.45, 0.2], [0, -0.45]].forEach(([dx, dz]) => parts.push([0.07, t + dx, -0.5, dz, 0.5, 0.22, 0.34], [0.03, t + dx, -0.22, dz - 0.08, 0.32, 0.22, 0.03]));
  parts.push([0.04, t, -0.45, -0.05, 0.16, 0.16, 0.16]);
  const tot = parts.reduce((a, p) => a + p[0], 0); let from = 0;
  parts.forEach((p, i) => { const c = i === parts.length - 1 ? N - from : Math.round(N * p[0] / tot); boxPts(out, from, c, p[1], p[2], p[3], p[4], p[5], p[6]); from += c; });
  return out;
}
function globe() {
  const out = new Float32Array(N * 3), L = window.GLOBE_LAND || [], R = 1.5, lon0 = -12 * Math.PI / 180, tilt = 0.3;
  const land = []; for (let i = 0; i < L.length; i += 2) land.push([L[i] * Math.PI / 180, L[i + 1] * Math.PI / 180]);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (rnd() < 0.95 && land.length) {
      const [la, lo] = land[Math.floor(rnd() * land.length)], a = la + gauss() * 0.012, b = lo + gauss() * 0.012 - lon0;
      x = Math.cos(a) * Math.sin(b) * R; y = Math.sin(a) * R; z = Math.cos(a) * Math.cos(b) * R;
    } else {
      const a = rnd() * Math.PI * 2, rr = R * 1.24; x = Math.cos(a) * rr; y = 0; z = Math.sin(a) * rr;
      const yy = -z * Math.sin(0.5); z = z * Math.cos(0.5); y = yy;
    }
    out.set([x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], i * 3);
  }
  return out;
}
function nuee() {
  const out = new Float32Array(N * 3), hubs = Array.from({ length: 12 }, () => [gauss() * 2.6, gauss() * 1.3, gauss() * 1.3]);
  for (let i = 0; i < N; i++) {
    if (rnd() < 0.5) { const h = hubs[Math.floor(rnd() * hubs.length)]; out.set([h[0] + gauss() * 0.25, h[1] + gauss() * 0.25, h[2] + gauss() * 0.25], i * 3); }
    else out.set([(rnd() - 0.5) * 9, (rnd() - 0.5) * 5, (rnd() - 0.5) * 3.5], i * 3);
  }
  return out;
}
function stairs(group) {
  // les trois marches du logo (de plus en plus étroites), chaque point connaît sa marche
  const out = new Float32Array(N * 3), W = [2.5, 1.9, 1.3], h = 0.34, d = 1.15;
  for (let i = 0; i < N; i++) {
    const k = i < N * 0.42 ? 0 : i < N * 0.74 ? 1 : 2, w = W[k], y0 = -0.8 + k * (h + 0.07);
    let x = (rnd() - 0.5) * w, y = y0 + rnd() * h, z = (rnd() - 0.5) * d; const f = rnd();
    if (f < 0.4) y = y0 + h; else if (f < 0.72) z = d / 2; else if (f < 0.86) x = (rnd() < 0.5 ? -1 : 1) * w / 2; else z = -d / 2;
    out.set([x, y, z], i * 3); group[i] = k;
  }
  return out;
}
async function logo() {
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const txt = await (await fetch('../brand/logos/seuil-grotesque.svg')).text();
  const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
  svg.querySelectorAll('[data-part="word"],[data-part="tag"]').forEach((e) => e.remove());
  const sym = svg.querySelector('[data-part="symbol"]');
  document.body.append(svg); svg.style.position = 'absolute'; svg.style.left = '-9999px';
  const b0 = sym.getBBox(); svg.remove(); svg.removeAttribute('style');
  const pad = 16, bb = { x: b0.x - pad, y: b0.y - pad, w: b0.width + 2 * pad, h: b0.height + 2 * pad };
  svg.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.w} ${bb.h}`);
  const S = 360, w = Math.round(S * bb.w / bb.h); svg.setAttribute('width', w); svg.setAttribute('height', S);
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg)); await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = S; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, w, S).data, px = [];
  for (let y = 0; y < S; y += 2) for (let x = 0; x < w; x += 2) { const i = (y * w + x) * 4; if (data[i + 3] > 140) px.push([x, y, data[i] - data[i + 2] > 60]); }
  const sc = 2.7 / S;
  for (let i = 0; i < N; i++) {
    const p = px[Math.floor(rnd() * px.length)];
    pos.set([(p[0] - w / 2) * sc + gauss() * 0.006, -(p[1] - S / 2) * sc + gauss() * 0.006, (rnd() - 0.5) * 0.36], i * 3);
    col.set(p[2] ? (rnd() < 0.5 ? GOLD : GOLD2) : INK, i * 3);
  }
  return { pos, col };
}

// ---------- scène ----------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
camera.position.set(0, 0, 8);
const group = new THREE.Group(); scene.add(group);
const size = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
size(); addEventListener('resize', size);

if (!reduce) { doc.classList.add('intro-play'); setTimeout(() => doc.classList.remove('intro-play'), 3300); }

(async () => {
  const L = await logo(), grp = new Float32Array(N);
  const shapes = [brain(), trio(), globe(), nuee(), stairs(grp), L.pos];
  const geo = new THREE.BufferGeometry();
  shapes.forEach((s, i) => geo.setAttribute('p' + i, new THREE.BufferAttribute(s, 3)));
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3));
  const base = new Float32Array(N * 3), rand = new Float32Array(N), sz = new Float32Array(N), rot = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = rnd(); base.set(r < 0.62 ? INK : r < 0.74 ? INK2 : r < 0.93 ? GOLD : GOLD2, i * 3);
    rand[i] = rnd(); sz[i] = 0.75 + rnd() * 0.85 + (rnd() < 0.03 ? 0.9 : 0); rot[i] = rnd() * 6.283;
  }
  geo.setAttribute('cBase', new THREE.BufferAttribute(base, 3));
  geo.setAttribute('cLogo', new THREE.BufferAttribute(L.col, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  geo.setAttribute('aRot', new THREE.BufferAttribute(rot, 1));
  geo.setAttribute('aGroup', new THREE.BufferAttribute(grp, 1));

  const uni = { uA: { value: 5 }, uB: { value: 0 }, uT: { value: 0 }, uTime: { value: 0 }, uPix: { value: renderer.getPixelRatio() * (mobile ? 3.6 : 4.6) }, uAlpha: { value: 1 }, uStep: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4; attribute vec3 p5;
      attribute vec3 cBase; attribute vec3 cLogo; attribute float aRand; attribute float aSize; attribute float aRot; attribute float aGroup;
      uniform float uA; uniform float uB; uniform float uT; uniform float uTime; uniform float uPix; uniform float uAlpha; uniform float uStep;
      varying vec3 vColor; varying float vAlpha; varying float vRot;
      vec3 shp(float i) {
        if (i < .5) return p0; if (i < 1.5) return p1; if (i < 2.5) return p2; if (i < 3.5) return p3;
        if (i < 4.5) { float on = smoothstep(0., 1., clamp(uStep - aGroup - aRand * .3, 0., 1.)); return mix(p3 * .22 + vec3(.0, .9, 0.), p4, on); }
        return p5;
      }
      void main() {
        float f = smoothstep(0., 1., clamp((uT - aRand * .35) / .65, 0., 1.));
        vec3 pos = mix(shp(uA), shp(uB), f);
        vec3 dir = normalize(vec3(sin(aRand * 91.7), cos(aRand * 57.3), sin(aRand * 33.1 + 1.)) + 1e-3);
        pos += dir * sin(3.14159 * f) * (.55 + aRand * 1.1);
        pos += .01 * vec3(sin(uTime * .7 + aRand * 40.), cos(uTime * .6 + aRand * 30.), sin(uTime * .5 + aRand * 20.));
        float lg = (uB > 4.5 ? f : 0.) + (uA > 4.5 ? 1. - f : 0.);
        vColor = mix(cBase, cLogo, lg);
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * (6.5 / -mv.z);
        vAlpha = uAlpha * (.18 + .82 * smoothstep(-9.8, -6.9, mv.z));
        vRot = aRot + uTime * (.2 + aRand * .4);
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha; varying float vRot;
      void main() {
        // étincelle à quatre branches (astroïde), comme celle du logo
        vec2 p = (gl_PointCoord - .5) * 2.;
        float c = cos(vRot), s = sin(vRot); p = mat2(c, -s, s, c) * p;
        float d = pow(abs(p.x), .68) + pow(abs(p.y), .68);
        if (d > 1.) discard;
        gl_FragColor = vec4(vColor, vAlpha * (1. - smoothstep(.75, 1., d)));
      }`,
  });
  group.add(new THREE.Points(geo, mat));

  // ---------- pilotage ----------
  const secs = [...document.querySelectorAll('[data-shape]')].map((el) => {
    const g = (k, m) => +el.dataset[mobile ? m : k];
    return { el, shape: +el.dataset.shape, x: g('x', 'mx'), y: g('y', 'my'), s: g('s', 'ms'), alpha: +el.dataset.alpha, spin: +el.dataset.spin };
  });
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const stepsSec = document.getElementById('comment'), stepItems = [...stepsSec.querySelectorAll('.s-list li')];
  let mx = 0, my = 0; addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const t0 = performance.now(), INTRO = reduce ? 0 : 2800;
  const cur = { x: secs[0].x, y: secs[0].y, s: secs[0].s, spin: 1 }; let rotY = 0;
  const state = () => {
    const vh = innerHeight, c = scrollY + vh * 0.5, z = vh * 0.32;
    const box = secs.map((s) => ({ top: s.el.offsetTop, bot: s.el.offsetTop + s.el.offsetHeight }));
    let i = box.findIndex((b) => c >= b.top && c < b.bot); if (i < 0) i = c < box[0].top ? 0 : secs.length - 1;
    if (i < secs.length - 1 && c > box[i].bot - z) return { a: secs[i], b: secs[i + 1], t: (c - (box[i].bot - z)) / (2 * z) };
    if (i > 0 && c < box[i].top + z) return { a: secs[i - 1], b: secs[i], t: (c - (box[i].top - z)) / (2 * z) };
    return { a: secs[i], b: secs[i], t: 0 };
  };
  const frame = (now) => {
    const time = (now - t0) / 1000; uni.uTime.value = time;
    const st = state(), k = ease(Math.max(0, Math.min(1, st.t)));
    const ik = INTRO ? Math.min(1, Math.max(0, (now - t0 - 500) / INTRO)) : 1, intro = ik < 1 && scrollY < 40;
    if (intro) { uni.uA.value = 5; uni.uB.value = st.a.shape; uni.uT.value = ease(ik); }
    else if (st.a.shape === st.b.shape) { uni.uA.value = st.a.shape; uni.uB.value = st.a.shape; uni.uT.value = 0; }
    else { uni.uA.value = st.a.shape; uni.uB.value = st.b.shape; uni.uT.value = Math.max(0, Math.min(1, st.t)); }
    // marches : progression dans la section épinglée
    const sr = stepsSec.getBoundingClientRect(), sp = Math.max(0, Math.min(1, -sr.top / (sr.height - innerHeight)));
    uni.uStep.value = Math.min(3, sp * 3.6);
    stepItems.forEach((li, n) => li.classList.toggle('on', uni.uStep.value > n + 0.35));
    const tg = intro ? { x: st.a.x * ease(ik), y: st.a.y * ease(ik), s: 0.85 + (st.a.s - 0.85) * ease(ik) } : { x: st.a.x + (st.b.x - st.a.x) * k, y: st.a.y + (st.b.y - st.a.y) * k, s: st.a.s + (st.b.s - st.a.s) * k };
    const spin = intro ? 0 : st.a.spin + (st.b.spin - st.a.spin) * k;
    cur.x += (tg.x - cur.x) * 0.08; cur.y += (tg.y - cur.y) * 0.08; cur.s += (tg.s - cur.s) * 0.08; cur.spin += (spin - cur.spin) * 0.05;
    group.position.set(cur.x, cur.y, 0); group.scale.setScalar(cur.s);
    uni.uAlpha.value = (intro ? 1 : st.a.alpha + (st.b.alpha - st.a.alpha) * k) * (mobile ? 0.75 : 1);
    rotY += 0.0024;
    const free = rotY + mx * 0.6, front = Math.sin(time * 0.55) * 0.3 + mx * 0.45;
    group.rotation.y = free * cur.spin + front * (1 - cur.spin);
    group.rotation.x = (-my * 0.25 + 0.04) * (1 - cur.spin) + (-my * 0.3) * cur.spin;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

// ---------- galerie épinglée : défilement horizontal en profondeur ----------
const gal = document.getElementById('galerie'), track = gal.querySelector('.g-track'), figs = [...track.querySelectorAll('figure')];
const galTick = () => {
  const r = gal.getBoundingClientRect(), p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
  const span = track.scrollWidth - innerWidth;
  track.style.transform = `translateX(${-p * span}px)`;
  figs.forEach((f) => { const b = f.getBoundingClientRect(), d = (b.left + b.width / 2 - innerWidth / 2) / innerWidth; f.style.transform = `rotateY(${-d * 22}deg) translateZ(${-Math.abs(d) * 160}px)`; });
};
addEventListener('scroll', () => requestAnimationFrame(galTick), { passive: true }); galTick();

// ---------- interface ----------
const top = document.querySelector('.top');
addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 30), { passive: true });
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('[data-reveal]').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
document.querySelectorAll('.acc details').forEach((d) => {
  const s = d.querySelector('summary'), body = d.querySelector('div');
  s.addEventListener('click', (e) => {
    if (reduce) return; e.preventDefault();
    if (d.open) body.animate([{ height: body.scrollHeight + 'px' }, { height: '0px' }], { duration: 300, easing: 'ease-in-out' }).onfinish = () => (d.open = false);
    else { d.open = true; body.animate([{ height: '0px' }, { height: body.scrollHeight + 'px' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' }); }
  });
});
const NUMBERS = { boris: '33782988589', kevin: '33781270587' }, NAMES = { boris: 'Boris', kevin: 'Kévin' };
const form = document.getElementById('form'), err = form.querySelector('.form-error');
const sync = () => { const c = form.intent.value === 'cercle'; form.querySelectorAll('.cercle-only').forEach((el) => (el.style.display = c ? '' : 'none')); };
form.querySelectorAll('input[name="intent"]').forEach((r) => r.addEventListener('change', sync));
document.querySelectorAll('[data-intent]').forEach((a) => a.addEventListener('click', () => { const r = form.querySelector(`input[name="intent"][value="${a.dataset.intent}"]`); if (r) { r.checked = true; sync(); } }));
sync();
form.querySelectorAll('select').forEach((s) => { const paint = () => (s.style.color = s.value ? '' : '#8A8E97'); s.addEventListener('change', paint); paint(); });
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const v = (n) => (form[n] && form[n].value ? form[n].value.trim() : ''), cercle = form.intent.value === 'cercle';
  if (['nom', 'profil', 'activite', 'tache'].some((n) => !v(n))) { err.textContent = 'Merci de remplir ton nom, ton profil, ton activité et ce que tu veux confier à l’IA.'; return; }
  if (cercle && !form.engage.checked) { err.textContent = 'Pour rejoindre le Cercle, coche l’engagement à partager où tu en es.'; return; }
  err.textContent = '';
  const to = form.to.value, lines = [
    `Bonjour ${NAMES[to]}, ${cercle ? 'je souhaite rejoindre le Cercle IA Business.' : 'je souhaite réserver un échange découverte.'}`, '',
    `Nom : ${v('nom')}`, `Profil : ${v('profil')}`, `Activité / rôle : ${v('activite')}`,
    v('equipe') ? `Équipe : ${v('equipe')}` : null, `Ce que j’aimerais confier à l’IA : ${v('tache')}`,
    v('invest') ? `Déjà investi dans un outil, une formation ou un prestataire : ${v('invest')}` : null,
    cercle ? 'Je m’engage à partager où j’en suis dans le Cercle.' : null,
  ].filter((l) => l !== null);
  window.open(`https://wa.me/${NUMBERS[to]}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});

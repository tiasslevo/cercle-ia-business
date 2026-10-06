// Le Cercle IA Business, v3. Trois moments en particules, le reste de la page respire.
// 0 : un réseau de neurones qui dessine un cerveau · 1 : le globe en creux (océans en points) · 2 : le logo en 3D.
import * as THREE from 'three';

const doc = document.documentElement;
doc.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 760;
const N = mobile ? 9000 : 16000;
const INK = [0.063, 0.09, 0.149], INK2 = [0.27, 0.3, 0.36], GOLD = [0.70, 0.52, 0.22], GOLD2 = [0.86, 0.71, 0.45];
let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const SHAPE = { 0: 0, 2: 1, 5: 2 }; // data-shape du HTML → forme

// ---------- 0. cerveau en réseau ----------
// silhouette : deux hémisphères plissés, un cervelet, un tronc ; vue de trois quarts
function brainSurface() {
  let x, y, z; const part = rnd();
  if (part < 0.86) {
    const side = rnd() < 0.5 ? -1 : 1, th = Math.acos(2 * rnd() - 1), ph = rnd() * Math.PI * 2;
    const r = 1 + 0.06 * Math.sin(9 * th + 2 * Math.sin(3 * ph)) * Math.sin(7 * ph);
    x = Math.sin(th) * Math.cos(ph) * 0.66 * r; y = Math.cos(th) * 0.82 * r; z = Math.sin(th) * Math.sin(ph) * 1.18 * r;
    if (x * side < 0) x *= 0.6;
    x += side * 0.42;
    if (y < -0.3) y = -0.3 + (y + 0.3) * 0.65;
    if (z > 0.2 && y < 0) y -= 0.18 * (z - 0.2); // lobe temporal
  } else if (part < 0.97) {
    const th = Math.acos(2 * rnd() - 1), ph = rnd() * Math.PI * 2;
    x = Math.sin(th) * Math.cos(ph) * 0.62; y = -0.62 + Math.cos(th) * 0.26; z = -0.62 + Math.sin(th) * Math.sin(ph) * 0.38;
  } else {
    const a = rnd() * Math.PI * 2, h = rnd(); x = Math.cos(a) * 0.12; y = -0.6 - h * 0.45; z = -0.3 + Math.sin(a) * 0.12;
  }
  const ca = Math.cos(0.42), sa = Math.sin(0.42), cb = Math.cos(-0.65), sb = Math.sin(-0.65);
  const y1 = y * ca - z * sa, z1 = y * sa + z * ca;
  return [(x * cb + z1 * sb) * 1.35, y1 * 1.35, (-x * sb + z1 * cb) * 1.35];
}
const NODES = Array.from({ length: mobile ? 170 : 240 }, brainSurface);
const LINKS = [];
NODES.forEach((a, i) => {
  NODES.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 3)
    .forEach(([j]) => { if (!LINKS.some(([p, q]) => (p === j && q === i))) LINKS.push([i, j]); });
});
function brain(col) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = rnd(); let p;
    if (r < 0.3) { const n = NODES[Math.floor(rnd() * NODES.length)]; p = [n[0] + gauss() * 0.03, n[1] + gauss() * 0.03, n[2] + gauss() * 0.03]; col.set(rnd() < 0.3 ? GOLD : INK, i * 3); }
    else if (r < 0.75) { const [a, b] = LINKS[Math.floor(rnd() * LINKS.length)], t = rnd(), A = NODES[a], B = NODES[b]; p = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; col.set(INK2, i * 3); }
    else { p = brainSurface(); col.set(rnd() < 0.2 ? GOLD2 : INK2, i * 3); }
    out.set(p, i * 3);
  }
  return out;
}
// ---------- 1. globe en creux : les océans en points, les continents vides ----------
function globe(col) {
  const out = new Float32Array(N * 3), L = window.GLOBE_LAND || [], R = 1.5, lon0 = -8, tilt = 0.32, step = 1.7, land = new Set();
  for (let i = 0; i < L.length; i += 2) { const row = Math.round((L[i] + 58) / step), latR = -58 + row * step, n = Math.max(1, Math.round(360 * Math.cos(latR * Math.PI / 180) / step)); land.add(row + ':' + Math.floor((L[i + 1] + 180) / (360 / n))); }
  const isLand = (la, lo) => { const row = Math.round((la + 58) / step); if (row < 0 || la > 80) return false; const latR = -58 + row * step, n = Math.max(1, Math.round(360 * Math.cos(latR * Math.PI / 180) / step)); return land.has(row + ':' + Math.floor(((lo + 540) % 360) / (360 / n))); };
  const CITIES = [[48.85, 2.35], [50.85, 4.35], [45.5, -73.57], [33.57, -7.59], [14.7, -17.45], [5.36, -4.0], [6.13, 1.22], [4.05, 9.7], [-4.32, 15.3], [-1.29, 36.82]];
  const put = (i, la, lo, r) => { const a = la * Math.PI / 180, b = (lo - lon0) * Math.PI / 180; const x = Math.cos(a) * Math.sin(b) * r, y = Math.sin(a) * r, z = Math.cos(a) * Math.cos(b) * r; out.set([x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], i * 3); };
  for (let i = 0; i < N; i++) {
    if (rnd() < 0.06) { const c = CITIES[Math.floor(rnd() * CITIES.length)]; put(i, c[0] + gauss() * 0.6, c[1] + gauss() * 0.6, R * 1.01); col.set(rnd() < 0.5 ? GOLD : GOLD2, i * 3); continue; }
    let la, lo, k = 0;
    do { la = Math.asin(2 * rnd() - 1) * 180 / Math.PI; lo = rnd() * 360 - 180; k++; } while (isLand(la, lo) && k < 40);
    put(i, la, lo, R); col.set(rnd() < 0.85 ? INK2 : INK, i * 3);
  }
  return out;
}
// ---------- 2. le logo ----------
async function logo(col) {
  const pos = new Float32Array(N * 3);
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
  return pos;
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
  const c0 = new Float32Array(N * 3), c1 = new Float32Array(N * 3), c2 = new Float32Array(N * 3);
  const shapes = [brain(c0), globe(c1), await logo(c2)];
  const geo = new THREE.BufferGeometry();
  shapes.forEach((s, i) => geo.setAttribute('p' + i, new THREE.BufferAttribute(s, 3)));
  [c0, c1, c2].forEach((c, i) => geo.setAttribute('c' + i, new THREE.BufferAttribute(c, 3)));
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3));
  const rand = new Float32Array(N), sz = new Float32Array(N), rot = new Float32Array(N);
  for (let i = 0; i < N; i++) { rand[i] = rnd(); sz[i] = 0.7 + rnd() * 0.7; rot[i] = rnd() * 6.283; }
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  geo.setAttribute('aRot', new THREE.BufferAttribute(rot, 1));
  const uni = { uA: { value: 2 }, uB: { value: 0 }, uT: { value: 0 }, uTime: { value: 0 }, uPix: { value: renderer.getPixelRatio() * (mobile ? 2.4 : 2.8) }, uAlpha: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 c0; attribute vec3 c1; attribute vec3 c2;
      attribute float aRand; attribute float aSize; attribute float aRot;
      uniform float uA; uniform float uB; uniform float uT; uniform float uTime; uniform float uPix; uniform float uAlpha;
      varying vec3 vColor; varying float vAlpha; varying float vRot;
      vec3 P(float i) { return i < .5 ? p0 : (i < 1.5 ? p1 : p2); }
      vec3 C(float i) { return i < .5 ? c0 : (i < 1.5 ? c1 : c2); }
      void main() {
        float f = smoothstep(0., 1., clamp((uT - aRand * .35) / .65, 0., 1.));
        vec3 pos = mix(P(uA), P(uB), f);
        vec3 dir = normalize(vec3(sin(aRand * 91.7), cos(aRand * 57.3), sin(aRand * 33.1 + 1.)) + 1e-3);
        pos += dir * sin(3.14159 * f) * (.5 + aRand);
        pos += .008 * vec3(sin(uTime * .7 + aRand * 40.), cos(uTime * .6 + aRand * 30.), sin(uTime * .5 + aRand * 20.));
        vColor = mix(C(uA), C(uB), f);
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * (6.5 / -mv.z);
        // face arrière : discrète pour le cerveau et le logo, invisible pour le globe (les continents se lisent en creux)
        float gw = (uA > .5 && uA < 1.5 ? 1. - f : 0.) + (uB > .5 && uB < 1.5 ? f : 0.);
        float back = mix(.12, 0., gw), z0 = mix(-9.6, -8.05, gw), z1 = mix(-6.8, -7.7, gw);
        vAlpha = uAlpha * (back + (1. - back) * smoothstep(z0, z1, mv.z));
        vRot = aRot + uTime * (.15 + aRand * .3);
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha; varying float vRot;
      void main() {
        vec2 p = (gl_PointCoord - .5) * 2.; float c = cos(vRot), s = sin(vRot); p = mat2(c, -s, s, c) * p;
        float d = pow(abs(p.x), .7) + pow(abs(p.y), .7);
        if (d > 1.) discard;
        gl_FragColor = vec4(vColor, vAlpha * (1. - smoothstep(.7, 1., d)));
      }`,
  });
  group.add(new THREE.Points(geo, mat));

  // les liaisons du réseau (lignes fines) et les impulsions qui les parcourent
  const lp = new Float32Array(LINKS.length * 6); LINKS.forEach(([a, b], i) => { lp.set(NODES[a], i * 6); lp.set(NODES[b], i * 6 + 3); });
  const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  const lmat = new THREE.LineBasicMaterial({ color: 0x353C4A, transparent: true, opacity: 0.22, depthWrite: false });
  const lines = new THREE.LineSegments(lgeo, lmat); group.add(lines);
  const PN = mobile ? 70 : 120, pulse = Array.from({ length: PN }, () => ({ l: Math.floor(rnd() * LINKS.length), t: rnd(), v: 0.25 + rnd() * 0.5 }));
  const pgeo = new THREE.BufferGeometry(), pp = new Float32Array(PN * 3); pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const pmat = new THREE.PointsMaterial({ color: 0xB98B3E, size: mobile ? 0.05 : 0.055, transparent: true, opacity: 0.9, depthWrite: false });
  const pulses = new THREE.Points(pgeo, pmat); group.add(pulses);

  // ---------- pilotage ----------
  const secs = [...document.querySelectorAll('[data-shape]')].map((el) => {
    const g = (k, m) => +el.dataset[mobile ? m : k];
    return { el, shape: SHAPE[+el.dataset.shape], x: g('x', 'mx'), y: g('y', 'my'), s: g('s', 'ms'), alpha: +el.dataset.alpha, spin: +el.dataset.spin };
  });
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let mx = 0, my = 0; addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const t0 = performance.now(), INTRO = reduce ? 0 : 2800, cur = { x: 0, y: 0, s: 0.8, spin: 0, a: 1 }; let rotY = 0, last = t0;
  const state = () => {
    const vh = innerHeight, c = scrollY + vh * 0.5, z = vh * 0.3;
    const box = secs.map((s) => ({ top: s.el.offsetTop, bot: s.el.offsetTop + s.el.offsetHeight }));
    let i = box.findIndex((b) => c >= b.top && c < b.bot); if (i < 0) i = c < box[0].top ? 0 : secs.length - 1;
    if (i < secs.length - 1 && c > box[i].bot - z) return { a: secs[i], b: secs[i + 1], t: (c - (box[i].bot - z)) / (2 * z) };
    if (i > 0 && c < box[i].top + z) return { a: secs[i - 1], b: secs[i], t: (c - (box[i].top - z)) / (2 * z) };
    return { a: secs[i], b: secs[i], t: 0 };
  };
  const frame = (now) => {
    const time = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now; uni.uTime.value = time;
    const st = state(), tt = Math.max(0, Math.min(1, st.t)), k = ease(tt);
    const ik = INTRO ? Math.min(1, Math.max(0, (now - t0 - 500) / INTRO)) : 1, intro = ik < 1 && scrollY < 40;
    let A, B, T;
    if (intro) { A = 2; B = st.a.shape; T = ease(ik); }
    else if (st.a.shape === st.b.shape) { A = B = st.a.shape; T = 0; }
    else { A = st.a.shape; B = st.b.shape; T = tt; }
    uni.uA.value = A; uni.uB.value = B; uni.uT.value = T;
    const tg = intro ? { x: secs[0].x * ease(ik), y: secs[0].y * ease(ik), s: 0.8 + (secs[0].s - 0.8) * ease(ik), spin: 0, a: 1 }
      : { x: st.a.x + (st.b.x - st.a.x) * k, y: st.a.y + (st.b.y - st.a.y) * k, s: st.a.s + (st.b.s - st.a.s) * k, spin: st.a.spin + (st.b.spin - st.a.spin) * k, a: st.a.alpha + (st.b.alpha - st.a.alpha) * k };
    cur.x += (tg.x - cur.x) * 0.08; cur.y += (tg.y - cur.y) * 0.08; cur.s += (tg.s - cur.s) * 0.08; cur.spin += (tg.spin - cur.spin) * 0.05; cur.a += (tg.a - cur.a) * 0.1;
    group.position.set(cur.x, cur.y, 0); group.scale.setScalar(cur.s);
    uni.uAlpha.value = cur.a * (mobile ? 0.8 : 1);
    // poids du cerveau dans la forme actuelle : les lignes et les impulsions n'existent que pour lui
    const wb = (A === 0 ? 1 - T : 0) + (B === 0 ? T : 0) - (A === 0 && B === 0 ? 1 : 0) * 0 ;
    const brainW = A === 0 && B === 0 ? 1 : wb;
    lmat.opacity = 0.22 * brainW * cur.a; pmat.opacity = 0.9 * brainW * cur.a;
    pulse.forEach((q, i) => { q.t += q.v * dt; if (q.t > 1) { q.t = 0; q.l = Math.floor(rnd() * LINKS.length); } const [a, b] = LINKS[q.l], P0 = NODES[a], P1 = NODES[b]; pp.set([P0[0] + (P1[0] - P0[0]) * q.t, P0[1] + (P1[1] - P0[1]) * q.t, P0[2] + (P1[2] - P0[2]) * q.t], i * 3); });
    pgeo.attributes.position.needsUpdate = true;
    rotY += 0.0022;
    const free = rotY + mx * 0.5, front = Math.sin(time * 0.55) * 0.3 + mx * 0.4;
    group.rotation.y = free * cur.spin + front * (1 - cur.spin);
    group.rotation.x = (-my * 0.22 + 0.04) * (1 - cur.spin) + (-my * 0.25) * cur.spin;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

// ---------- les trois étapes : la ligne se remplit au scroll ----------
const path = document.querySelector('[data-path]'), fill = path.querySelector('.path-line span'), stepEls = [...path.querySelectorAll('li:not(.path-line)')];
const pathTick = () => {
  const r = path.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.2)));
  fill.style.transform = mobile ? `scaleY(${p})` : `scaleX(${p})`;
  stepEls.forEach((li, i) => li.classList.toggle('lit', p > i / 3 + 0.05));
};
addEventListener('scroll', () => requestAnimationFrame(pathTick), { passive: true }); pathTick();

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
form.querySelectorAll('select').forEach((s) => { const paint = () => (s.style.color = s.value ? '' : '#6B707C'); s.addEventListener('change', paint); paint(); });
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

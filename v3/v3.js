// Le Cercle IA Business, v3 : une seule forme en particules qui se transforme au fil du scroll.
// Cerveau (l'IA) → globe (les membres) → nuage (la communauté) → marches (l'entrée) → logo en 3D.
import * as THREE from 'three';

const doc = document.documentElement;
doc.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 760;
const N = mobile ? 5200 : 9000;
const INK = [0.078, 0.11, 0.172], INK2 = [0.31, 0.337, 0.392], GOLD = [0.725, 0.545, 0.243], GOLD2 = [0.788, 0.631, 0.353];

let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// ---------- les formes ----------
function brain() {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    const part = rnd();
    if (part < 0.9) {
      // deux hémisphères plissés
      // échantillonnage par rejet : les points se concentrent sur les crêtes, ce qui dessine les circonvolutions
      let side, th, ph, fold;
      do {
        side = rnd() < 0.5 ? -1 : 1; th = Math.acos(2 * rnd() - 1); ph = rnd() * Math.PI * 2;
        fold = Math.sin(14.3 * th + 2.1 * Math.sin(3.7 * ph)) * Math.sin(10.7 * ph + 1.7 * Math.sin(4.3 * th)) + 0.45 * Math.sin(27.1 * ph + 5.3 * th + side);
      } while (rnd() > 0.12 + 0.88 * Math.max(0, Math.min(1, (Math.abs(fold) - 0.15) / 0.55)));
      let r = 1 + 0.09 * Math.sin(15 * th) * Math.sin(11 * ph) + 0.06 * Math.sin(23 * ph + 4 * th) + 0.03 * Math.sin(37 * th);
      r *= 0.94 + 0.06 * rnd();
      x = Math.sin(th) * Math.cos(ph) * 0.62 * r; y = Math.cos(th) * 0.86 * r; z = Math.sin(th) * Math.sin(ph) * 1.12 * r;
      if (x * side < 0) x *= 0.66; // face interne, presque collée à l'autre hémisphère
      x += side * 0.43;
      if (y < -0.45) y = -0.45 + (y + 0.45) * 0.7;
    } else if (part < 0.985) {
      // cervelet
      const th = Math.acos(2 * rnd() - 1), ph = rnd() * Math.PI * 2;
      x = Math.sin(th) * Math.cos(ph) * 0.55; y = -0.55 + Math.cos(th) * 0.25; z = -0.55 + Math.sin(th) * Math.sin(ph) * 0.35;
    } else {
      // tronc
      const a = rnd() * Math.PI * 2, h = rnd();
      x = Math.cos(a) * 0.11; y = -0.5 - h * 0.35; z = -0.25 + Math.sin(a) * 0.11;
    }
    // incliné vers l'avant et tourné de trois quarts : on voit les deux hémisphères et leurs plis
    const ca = Math.cos(0.55), sa = Math.sin(0.55), cb = Math.cos(-0.5), sb = Math.sin(-0.5);
    const y1 = y * ca - z * sa, z1 = y * sa + z * ca, x2 = x * cb + z1 * sb, z2 = -x * sb + z1 * cb;
    out.set([x2 * 1.2, y1 * 1.2 + 0.1, z2 * 1.2], i * 3);
  }
  return out;
}
function globe() {
  const out = new Float32Array(N * 3), L = window.GLOBE_LAND || [], R = 1.45, lon0 = -15 * Math.PI / 180, tilt = 0.32;
  const land = []; for (let i = 0; i < L.length; i += 2) land.push([L[i] * Math.PI / 180, L[i + 1] * Math.PI / 180]);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (rnd() < 0.93 && land.length) {
      const [la, lo] = land[Math.floor(rnd() * land.length)], j = 0.012;
      const a = la + gauss() * j, b = lo + gauss() * j - lon0;
      x = Math.cos(a) * Math.sin(b) * R; y = Math.sin(a) * R; z = Math.cos(a) * Math.cos(b) * R;
    } else {
      // anneau doré qui relie le monde
      const a = rnd() * Math.PI * 2, rr = R * (1.22 + gauss() * 0.01);
      x = Math.cos(a) * rr; y = gauss() * 0.01; z = Math.sin(a) * rr;
      const yy = y * Math.cos(0.5) - z * Math.sin(0.5); z = y * Math.sin(0.5) + z * Math.cos(0.5); y = yy;
    }
    const yy = y * Math.cos(tilt) - z * Math.sin(tilt), zz = y * Math.sin(tilt) + z * Math.cos(tilt);
    out.set([x, yy, zz], i * 3);
  }
  return out;
}
function cloud() {
  const out = new Float32Array(N * 3), hubs = Array.from({ length: 11 }, () => [gauss() * 2.2, gauss() * 1.1, gauss() * 1.2]);
  for (let i = 0; i < N; i++) {
    if (rnd() < 0.55) { const h = hubs[Math.floor(rnd() * hubs.length)]; out.set([h[0] + gauss() * 0.22, h[1] + gauss() * 0.22, h[2] + gauss() * 0.22], i * 3); }
    else out.set([(rnd() - 0.5) * 7.5, (rnd() - 0.5) * 4.2, (rnd() - 0.5) * 3], i * 3);
  }
  return out;
}
function stairs() {
  // les trois marches du logo, en volume (largeur décroissante vers le haut)
  const out = new Float32Array(N * 3), W = [2.4, 1.85, 1.3], h = 0.32, d = 1.1;
  for (let i = 0; i < N; i++) {
    const k = rnd() < 0.42 ? 0 : rnd() < 0.6 ? 1 : 2, w = W[k], y0 = -0.75 + k * (h + 0.06);
    const face = rnd();
    let x = (rnd() - 0.5) * w, y = y0 + rnd() * h, z = (rnd() - 0.5) * d;
    if (face < 0.38) y = y0 + h; else if (face < 0.7) z = d / 2; else if (face < 0.85) x = (rnd() < 0.5 ? -1 : 1) * w / 2; else z = -d / 2;
    out.set([x, y, z], i * 3);
  }
  return out;
}
async function logo() {
  // le symbole du logo, rendu dans un canevas puis échantillonné, avec une épaisseur
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const txt = await (await fetch('../brand/logos/seuil-grotesque.svg')).text();
  const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
  svg.querySelectorAll('[data-part="word"],[data-part="tag"]').forEach((e) => e.remove());
  const sym = svg.querySelector('[data-part="symbol"]');
  document.body.append(svg); svg.style.position = 'absolute'; svg.style.left = '-9999px'; svg.setAttribute('width', 400);
  const b0 = sym.getBBox(); svg.remove(); svg.removeAttribute('style');
  const pad = 16, bb = { x: b0.x - pad, y: b0.y - pad, width: b0.width + 2 * pad, height: b0.height + 2 * pad }; // marge pour l'épaisseur du trait
  svg.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
  const S = 360, w = Math.round(S * bb.width / bb.height); svg.setAttribute('width', w); svg.setAttribute('height', S);
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg)); await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = S; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, w, S).data, px = [];
  for (let y = 0; y < S; y += 2) for (let x = 0; x < w; x += 2) { const i = (y * w + x) * 4; if (data[i + 3] > 140) px.push([x, y, data[i] - data[i + 2] > 60]); }
  const scale = 2.6 / S;
  for (let i = 0; i < N; i++) {
    const p = px[Math.floor(rnd() * px.length)], depth = (rnd() - 0.5) * 0.34;
    pos.set([(p[0] - w / 2) * scale + gauss() * 0.006, -(p[1] - S / 2) * scale + gauss() * 0.006, depth], i * 3);
    col.set(p[2] ? (rnd() < 0.5 ? GOLD : GOLD2) : INK, i * 3);
  }
  return { pos, col };
}

// ---------- scène ----------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
camera.position.set(0, 0, 7.2);
const group = new THREE.Group(); scene.add(group);

const size = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
size(); addEventListener('resize', size);

(async () => {
  const L = await logo();
  const geo = new THREE.BufferGeometry();
  const shapes = [brain(), globe(), cloud(), stairs(), L.pos];
  shapes.forEach((s, i) => geo.setAttribute('p' + i, new THREE.BufferAttribute(s, 3)));
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3));
  const base = new Float32Array(N * 3), rand = new Float32Array(N), sz = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = rnd(); base.set(r < 0.55 ? INK : r < 0.75 ? INK2 : r < 0.93 ? GOLD : GOLD2, i * 3);
    rand[i] = rnd(); sz[i] = 0.7 + rnd() * 0.9 + (rnd() < 0.03 ? 0.7 : 0);
  }
  geo.setAttribute('cBase', new THREE.BufferAttribute(base, 3));
  geo.setAttribute('cLogo', new THREE.BufferAttribute(L.col, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));

  const uni = { uA: { value: 4 }, uB: { value: 0 }, uT: { value: 0 }, uTime: { value: 0 }, uPix: { value: renderer.getPixelRatio() * (mobile ? 2.2 : 2.6) }, uAlpha: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
      attribute vec3 cBase; attribute vec3 cLogo; attribute float aRand; attribute float aSize;
      uniform float uA; uniform float uB; uniform float uT; uniform float uTime; uniform float uPix; uniform float uAlpha;
      varying vec3 vColor; varying float vAlpha;
      vec3 shp(float i) { if (i < .5) return p0; if (i < 1.5) return p1; if (i < 2.5) return p2; if (i < 3.5) return p3; return p4; }
      void main() {
        float f = smoothstep(0., 1., clamp((uT - aRand * .35) / .65, 0., 1.));
        vec3 pos = mix(shp(uA), shp(uB), f);
        vec3 dir = normalize(vec3(sin(aRand * 91.7), cos(aRand * 57.3), sin(aRand * 33.1 + 1.)) + 1e-3);
        pos += dir * sin(3.14159 * f) * (.5 + aRand * .9);
        pos += .012 * vec3(sin(uTime * .7 + aRand * 40.), cos(uTime * .6 + aRand * 30.), sin(uTime * .5 + aRand * 20.));
        float lg = (uB > 3.5 ? f : 0.) + (uA > 3.5 ? 1. - f : 0.);
        vColor = mix(cBase, cLogo, lg);
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * (6. / -mv.z);
        vAlpha = uAlpha * (.12 + .88 * smoothstep(-8.4, -6.1, mv.z)) * mix(.85, 1., lg);
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vColor, vAlpha * (1. - smoothstep(.32, .5, d))); }`,
  });
  const pts = new THREE.Points(geo, mat); group.add(pts);

  // ---------- pilotage par le scroll ----------
  const secs = [...document.querySelectorAll('[data-shape]')].map((el) => ({ el, shape: +el.dataset.shape, x: +(mobile ? el.dataset.mx : el.dataset.x), alpha: +el.dataset.alpha * (mobile ? 0.8 : 1) }));
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let mx = 0, my = 0; addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const t0 = performance.now(), INTRO = reduce ? 0 : 2800;
  let gx = secs[0].x, rotY = 0;
  const state = () => {
    const c = scrollY + innerHeight * 0.5;
    const centers = secs.map((s) => s.el.offsetTop + s.el.offsetHeight / 2);
    let i = 0; while (i < secs.length - 1 && centers[i + 1] <= c) i++;
    const j = Math.min(i + 1, secs.length - 1);
    const raw = j === i ? 0 : (c - centers[i]) / (centers[j] - centers[i]);
    const t = Math.max(0, Math.min(1, (raw - 0.3) / 0.4));
    return { a: secs[i], b: secs[j], t: Math.max(0, Math.min(1, t)) };
  };
  const frame = (now) => {
    const time = (now - t0) / 1000; uni.uTime.value = time;
    const s = state(), k = ease(s.t);
    // intro : les particules forment d'abord le logo, puis deviennent la forme du haut de page
    const ik = INTRO ? Math.min(1, Math.max(0, (now - t0 - 500) / INTRO)) : 1;
    if (ik < 1 && scrollY < 40) { uni.uA.value = 4; uni.uB.value = s.a.shape; uni.uT.value = ease(ik); }
    else if (s.a.shape === s.b.shape) { uni.uA.value = s.a.shape; uni.uB.value = s.a.shape; uni.uT.value = 0; }
    else { uni.uA.value = s.a.shape; uni.uB.value = s.b.shape; uni.uT.value = s.t; }
    const tx = ik < 1 && scrollY < 40 ? s.a.x * ease(ik) : s.a.x + (s.b.x - s.a.x) * k;
    gx += (tx - gx) * 0.08; group.position.x = gx;
    uni.uAlpha.value = s.a.alpha + (s.b.alpha - s.a.alpha) * k;
    // la forme tourne doucement ; le logo reste de face avec un léger balancement en 3D
    const lg = (uni.uB.value === 4 ? ease(uni.uT.value) : 0) + (uni.uA.value === 4 && uni.uB.value !== 4 ? 1 - ease(uni.uT.value) : 0) + (uni.uA.value === 4 && uni.uB.value === 4 ? 1 : 0);
    rotY += 0.0022;
    const free = rotY + mx * 0.6, front = Math.sin(time * 0.6) * 0.32 + mx * 0.5;
    group.rotation.y = free * (1 - lg) + front * lg;
    group.rotation.x = (-my * 0.3) * (1 - lg) + (-my * 0.2 + 0.05) * lg;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

// ---------- interface ----------
const top = document.querySelector('.top');
addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 30), { passive: true });
if (!reduce) { doc.classList.add('intro-play'); setTimeout(() => doc.classList.remove('intro-play'), 3100); }
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

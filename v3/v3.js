// Le Cercle IA Business, v3 : la page principale, plus trois moments en particules.
// 0 : un vrai cerveau (IRM, domaine public) · 1 : le globe, continents en points, reliés entre eux · 2 : le logo en 3D.
// Les particules se décomposent et se recomposent d'un moment à l'autre, et disparaissent entre les deux.
import * as THREE from 'three';

const doc = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 760;
const N = mobile ? 9000 : 16000;
const INK = [0.078, 0.11, 0.172], INK2 = [0.33, 0.36, 0.42], GOLD = [0.725, 0.545, 0.243], GOLD2 = [0.87, 0.73, 0.47];
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const palette = (c, i, goldShare) => { const r = rnd(); c.set(r < goldShare * 0.6 ? GOLD : r < goldShare ? GOLD2 : r < goldShare + 0.25 ? INK2 : INK, i * 3); };

// ---------- 0. le cerveau ----------
function brain(col) {
  const B = window.BRAIN || [], n = B.length / 3, out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const k = Math.floor(rnd() * n) * 3; out.set([B[k], B[k + 1], B[k + 2]], i * 3); palette(col, i, 0.2); }
  return out;
}
// ---------- 1. le globe : continents en points, villes reliées ----------
const R = 1.5, LON0 = -10, TILT = 0.34;
const CITIES = [[48.85, 2.35], [50.85, 4.35], [45.5, -73.57], [40.71, -74.0], [33.57, -7.59], [14.7, -17.45], [5.36, -4.0], [6.13, 1.22], [4.05, 9.7], [-4.32, 15.3], [-1.29, 36.82], [25.2, 55.27], [-26.2, 28.05]];
const ARCS = [[0, 7], [0, 6], [0, 2], [1, 9], [0, 5], [4, 5], [7, 8], [2, 3], [3, 6], [10, 11], [0, 11], [12, 10], [8, 12]];
const toXYZ = (la, lo, r) => { const a = la * Math.PI / 180, b = (lo - LON0) * Math.PI / 180, x = Math.cos(a) * Math.sin(b) * r, y = Math.sin(a) * r, z = Math.cos(a) * Math.cos(b) * r; return [x, y * Math.cos(TILT) - z * Math.sin(TILT), y * Math.sin(TILT) + z * Math.cos(TILT)]; };
function globe(col) {
  const out = new Float32Array(N * 3), L = window.GLOBE_LAND || [], n = L.length / 2;
  for (let i = 0; i < N; i++) {
    if (rnd() < 0.05) { const c = CITIES[Math.floor(rnd() * CITIES.length)]; out.set(toXYZ(c[0] + gauss() * 0.5, c[1] + gauss() * 0.5, R * 1.01), i * 3); col.set(rnd() < 0.5 ? GOLD : GOLD2, i * 3); continue; }
    const k = Math.floor(rnd() * n) * 2; out.set(toXYZ(L[k] + gauss() * 0.45, L[k + 1] + gauss() * 0.45, R), i * 3); palette(col, i, 0.08);
  }
  return out;
}
const arcPts = ARCS.map(([a, b]) => {
  const A = toXYZ(...CITIES[a], 1), B = toXYZ(...CITIES[b], 1), om = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])), pts = [];
  for (let k = 0; k <= 40; k++) { const t = k / 40, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om), h = R * (1 + 0.28 * Math.min(1, om) * Math.sin(Math.PI * t)); pts.push([(A[0] * s1 + B[0] * s2) * h, (A[1] * s1 + B[1] * s2) * h, (A[2] * s1 + B[2] * s2) * h]); }
  return pts;
});
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

// où placer chaque forme (unités de la scène) selon l'écran
const PLACE = mobile
  ? [{ x: 0, y: -1.85, s: 0.58, spin: 1 }, { x: 0, y: 1.25, s: 0.62, spin: 1 }, { x: 0, y: 0.95, s: 0.62, spin: 0 }]
  : [{ x: 1.75, y: 0.05, s: 1.12, spin: 1 }, { x: -2.05, y: 0, s: 0.95, spin: 1 }, { x: 0, y: 0.65, s: 0.85, spin: 0 }];

(async () => {
  const c0 = new Float32Array(N * 3), c1 = new Float32Array(N * 3), c2 = new Float32Array(N * 3);
  const shapes = [brain(c0), globe(c1), await logo(c2)];
  const geo = new THREE.BufferGeometry();
  shapes.forEach((s, i) => geo.setAttribute('p' + i, new THREE.BufferAttribute(s, 3)));
  [c0, c1, c2].forEach((c, i) => geo.setAttribute('c' + i, new THREE.BufferAttribute(c, 3)));
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3));
  const rand = new Float32Array(N), sz = new Float32Array(N);
  for (let i = 0; i < N; i++) { rand[i] = rnd(); sz[i] = 0.6 + rnd() * 0.8 + (rnd() < 0.04 ? 0.8 : 0); }
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  const uni = { uA: { value: 2 }, uB: { value: 0 }, uT: { value: 0 }, uTime: { value: 0 }, uPix: { value: renderer.getPixelRatio() * (mobile ? 2.6 : 3) }, uAlpha: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 c0; attribute vec3 c1; attribute vec3 c2; attribute float aRand; attribute float aSize;
      uniform float uA; uniform float uB; uniform float uT; uniform float uTime; uniform float uPix; uniform float uAlpha;
      varying vec3 vColor; varying float vAlpha;
      vec3 P(float i) { return i < .5 ? p0 : (i < 1.5 ? p1 : p2); }
      vec3 C(float i) { return i < .5 ? c0 : (i < 1.5 ? c1 : c2); }
      void main() {
        float f = smoothstep(0., 1., clamp((uT - aRand * .4) / .6, 0., 1.));
        vec3 pos = mix(P(uA), P(uB), f);
        vec3 dir = normalize(vec3(sin(aRand * 91.7), cos(aRand * 57.3), sin(aRand * 33.1 + 1.)) + 1e-3);
        pos += dir * sin(3.14159 * f) * (.7 + aRand * 1.4);
        pos += .008 * vec3(sin(uTime * .7 + aRand * 40.), cos(uTime * .6 + aRand * 30.), sin(uTime * .5 + aRand * 20.));
        vColor = mix(C(uA), C(uB), f);
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * (6.5 / -mv.z);
        vAlpha = uAlpha * (.16 + .84 * smoothstep(-9.8, -6.8, mv.z));
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vColor, vAlpha * (1. - smoothstep(.3, .5, d))); }`,
  });
  group.add(new THREE.Points(geo, mat));

  // les liaisons dorées entre les villes, et les impulsions qui les parcourent
  const arcGroup = new THREE.Group(); group.add(arcGroup);
  const arcMat = new THREE.LineBasicMaterial({ color: 0xB98B3E, transparent: true, opacity: 0, depthWrite: false });
  arcPts.forEach((pts) => { const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))); arcGroup.add(new THREE.Line(g, arcMat)); });
  const PN = ARCS.length * 2, pp = new Float32Array(PN * 3), pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const pmat = new THREE.PointsMaterial({ color: 0x8C6524, size: 0.07, transparent: true, opacity: 0, depthWrite: false });
  arcGroup.add(new THREE.Points(pgeo, pmat));
  const pulse = Array.from({ length: PN }, (_, i) => ({ a: i % ARCS.length, t: rnd(), v: 0.3 + rnd() * 0.3 }));

  // ---------- quel moment est à l'écran ----------
  const secs = [...document.querySelectorAll('[data-shape]')].map((el) => ({ el, shape: +el.dataset.shape }));
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let mx = 0, my = 0; addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const t0 = performance.now(); let last = t0, rotY = 0;
  let from = 2, to = 0, morph = reduce ? 1 : 0, morphStart = t0 + 400; // l'intro : le logo devient le cerveau
  const cur = { x: 0, y: 0, s: 0.8, spin: 0, a: 1 };
  const frame = (now) => {
    const time = (now - t0) / 1000, dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; uni.uTime.value = time;
    const vh = innerHeight, c = vh / 2;
    let best = null, bw = 0;
    secs.forEach((s) => { const r = s.el.getBoundingClientRect(), mid = r.top + r.height / 2, w = 1 - Math.abs(mid - c) / (r.height / 2 + vh * 0.25); if (w > bw) { bw = w; best = s; } });
    const vis = Math.max(0, Math.min(1, bw * 1.6));
    if (best && best.shape !== to && morph >= 1) { from = to; to = best.shape; morph = 0; morphStart = now; }
    morph = reduce ? 1 : Math.min(1, (now - morphStart) / 1800);
    uni.uA.value = from; uni.uB.value = to; uni.uT.value = ease(Math.max(0, morph));
    const P = PLACE[to], intro = now - t0 < 3200;
    cur.x += (P.x - cur.x) * 0.06; cur.y += (P.y - cur.y) * 0.06; cur.s += (P.s - cur.s) * 0.06; cur.spin += (P.spin - cur.spin) * 0.05;
    cur.a += ((intro ? 1 : vis) - cur.a) * 0.12;
    group.position.set(cur.x, cur.y, 0); group.scale.setScalar(cur.s);
    uni.uAlpha.value = cur.a;
    const gw = to === 1 ? ease(morph) : (from === 1 ? 1 - ease(morph) : 0);
    arcMat.opacity = 0.55 * gw * cur.a; pmat.opacity = gw * cur.a;
    pulse.forEach((q, i) => { q.t += q.v * dt; if (q.t > 1) q.t = 0; const pts = arcPts[q.a], k = Math.min(39, Math.floor(q.t * 40)), f = q.t * 40 - k, A = pts[k], B = pts[k + 1]; pp.set([A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f], i * 3); });
    pgeo.attributes.position.needsUpdate = true;
    rotY += 0.0024;
    group.rotation.y = (rotY + mx * 0.5) * cur.spin + (Math.sin(time * 0.55) * 0.3 + mx * 0.4) * (1 - cur.spin);
    group.rotation.x = (-my * 0.25 + 0.05) * (1 - cur.spin) + (0.28 - my * 0.2) * cur.spin * (to === 0 ? 1 : 0.4);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

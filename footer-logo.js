// Pied de page : les particules se rassemblent et dessinent le logo du Cercle en 3D.
import * as THREE from 'three';

const box = document.querySelector('.foot-logo3d');
if (box) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = innerWidth < 760, N = mobile ? 6000 : 11000;
  const base = new URL('.', import.meta.url).href;
  let seed = 9; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  // couleurs : par défaut ivoire et or ; la page peut les fixer (data-c1, data-c2, data-a1, data-a2)
  const hex = (h, d) => (h ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) : d);
  const ds = box.dataset;
  const IVORY = hex(ds.c1, [0.953, 0.925, 0.867]), IVORY2 = hex(ds.c2, [0.78, 0.76, 0.72]), GOLD = hex(ds.a1, [0.79, 0.63, 0.35]), GOLD2 = hex(ds.a2, [0.91, 0.83, 0.63]);

  (async () => {
    // échantillonne le symbole du logo
    const txt = await (await fetch(base + 'brand/logos/seuil-grotesque.svg')).text();
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

    const logo = new Float32Array(N * 3), cloud = new Float32Array(N * 3), col = new Float32Array(N * 3), rand = new Float32Array(N), sz = new Float32Array(N);
    const sc = 2.7 / S;
    for (let i = 0; i < N; i++) {
      const p = px[Math.floor(rnd() * px.length)];
      logo.set([(p[0] - w / 2) * sc + gauss() * 0.006, -(p[1] - S / 2) * sc + gauss() * 0.006, (rnd() - 0.5) * 0.36], i * 3);
      cloud.set([gauss() * 2.6, gauss() * 1.2, gauss() * 1.4], i * 3);
      col.set(p[2] ? (rnd() < 0.5 ? GOLD : GOLD2) : (rnd() < 0.8 ? IVORY : IVORY2), i * 3);
      rand[i] = rnd(); sz[i] = 0.6 + rnd() * 0.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(logo.slice(), 3));
    geo.setAttribute('pLogo', new THREE.BufferAttribute(logo, 3));
    geo.setAttribute('pCloud', new THREE.BufferAttribute(cloud, 3));
    geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));

    const canvas = box.querySelector('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50); camera.position.z = 7;
    const uni = { uT: { value: reduce ? 1 : 0 }, uTime: { value: 0 }, uPix: { value: renderer.getPixelRatio() * (mobile ? 2.4 : 2.8) } };
    const mat = new THREE.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false,
      vertexShader: `
        attribute vec3 pLogo; attribute vec3 pCloud; attribute vec3 aCol; attribute float aRand; attribute float aSize;
        uniform float uT; uniform float uTime; uniform float uPix; varying vec3 vColor; varying float vAlpha;
        void main() {
          float f = smoothstep(0., 1., clamp((uT - aRand * .4) / .6, 0., 1.));
          vec3 pos = mix(pCloud, pLogo, f) + .01 * vec3(sin(uTime * .7 + aRand * 40.), cos(uTime * .6 + aRand * 30.), sin(uTime * .5 + aRand * 20.));
          vColor = aCol;
          vec4 mv = modelViewMatrix * vec4(pos, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPix * (6. / -mv.z);
          vAlpha = (.35 + .65 * f) * (.3 + .7 * smoothstep(-8.6, -6.2, mv.z));
        }`,
      fragmentShader: `varying vec3 vColor; varying float vAlpha;
        void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vColor, vAlpha * (1. - smoothstep(.3, .5, d))); }`,
    });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    const size = () => { const r = box.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);

    // le rassemblement démarre quand le pied de page arrive à l'écran
    let visible = false, start = 0;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !start) start = performance.now(); }, { threshold: 0.2 }).observe(box);
    let mx = 0; addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; }, { passive: true });
    const t0 = performance.now();
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (!visible) return;
      const time = (now - t0) / 1000; uni.uTime.value = time;
      if (!reduce && start) uni.uT.value = Math.min(1, (now - start) / 2600);
      pts.rotation.y = Math.sin(time * 0.55) * 0.32 + mx * 0.4;
      pts.rotation.x = 0.05;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(frame);
  })();
}

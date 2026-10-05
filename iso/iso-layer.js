// Couche isométrique : remplace les petites illustrations par des dessins isométriques.
// Projection reprise du skill iso-figure (MIT, MrBongoC).
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  function Fig() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const P = (x, y, z) => { const p = [(x - y) * C, (x + y) * S - z]; minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); return p; };
    const D = (x, y, z) => [(x - y) * C, (x + y) * S - z];
    const plane = (O, U, V) => { const o = P(...O), u = D(...U), v = D(...V); return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`; };
    const TOP = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
    const FRONT = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
    const SIDE = (x, y, z) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);
    const rect = (t, w, h, r, cls) => `<g transform="${t}"><rect class="${cls}" width="${w}" height="${h}" rx="${r}"/></g>`;
    const box = (x, y, z, w, d, h, r = 0, cls = '') => {
      [[x, y, z], [x + w, y, z], [x, y + d, z], [x + w, y + d, z]].forEach(([a, b, c]) => { P(a, b, c); P(a, b, c + h); });
      return rect(SIDE(x + w, y + d, z + h), d, h, Math.min(r, h / 4), 'face side ' + cls) +
        rect(FRONT(x, y + d, z + h), w, h, Math.min(r, h / 4), 'face front ' + cls) +
        rect(TOP(x, y, z + h), w, d, r, 'face top ' + cls);
    };
    const view = (m = 0.06) => { const w = maxX - minX, h = maxY - minY, mx = w * m, my = h * m; return `${(minX - mx).toFixed(1)} ${(minY - my).toFixed(1)} ${(w + 2 * mx).toFixed(1)} ${(h + 2 * my).toFixed(1)}`; };
    return { TOP, FRONT, SIDE, box, view };
  }
  const grid = (n, cols, x0, y0, dx, dy, w, h) => Array.from({ length: n }, (_, i) => `<rect class="win" data-blink x="${x0 + (i % cols) * dx}" y="${y0 + Math.floor(i / cols) * dy}" width="${w}" height="${h}" rx="1.5"/>`).join('');

  const DRAW = {
    // boutique avec store rayé et vitrines
    shop: (f) => f.box(-26, -26, -5, 200, 160, 5, 4, 'ground') + f.box(0, 0, 0, 148, 100, 90, 3) + f.box(-6, -6, 90, 160, 112, 7, 3) +
      `<g transform="${f.FRONT(0, 100, 90)}">${Array.from({ length: 10 }, (_, i) => `<rect class="face ${i % 2 ? 'top' : 'gold'}" x="${i * 14.8}" width="14.8" height="15"/>`).join('')}
       <rect class="win" data-blink x="12" y="28" width="44" height="34" rx="2"/><path class="det" d="M34 28v34M12 45h44"/>
       <rect class="face" x="70" y="28" width="30" height="62" rx="2"/><rect class="win" data-blink x="112" y="28" width="26" height="34" rx="2"/></g>
       <g transform="${f.SIDE(148, 100, 90)}"><rect class="win" data-blink x="22" y="28" width="54" height="34" rx="2"/><path class="det" d="M49 28v34"/></g>`,
    // immeuble et annexe, fenêtres qui s'allument
    tower: (f) => f.box(-26, -26, -5, 220, 150, 5, 4, 'ground') + f.box(0, 0, 0, 80, 80, 180, 3) +
      `<g transform="${f.FRONT(0, 80, 180)}">${grid(21, 3, 11, 13, 21, 23, 15, 15)}</g><g transform="${f.SIDE(80, 80, 180)}">${grid(21, 3, 11, 13, 21, 23, 15, 15)}</g>` +
      f.box(98, 12, 0, 70, 58, 78, 3) + `<g transform="${f.FRONT(98, 70, 78)}">${grid(6, 3, 10, 13, 20, 25, 13, 15)}</g>` +
      f.box(28, 28, 180, 24, 24, 12, 2, 'gold'),
    // trois postes reliés à un agent
    team: (f) => {
      const desk = (x, y) => f.box(x, y, 0, 62, 42, 24, 3) + f.box(x + 13, y + 6, 24, 36, 6, 24, 2) +
        `<g transform="${f.FRONT(x + 13, y + 12, 48)}"><rect class="face glass" x="3" y="3" width="30" height="17" rx="2"/><rect class="live" x="7" y="8" width="11" height="2.4"/><rect class="dim" x="7" y="12.5" width="16" height="2.4"/></g>`;
      return f.box(-36, -36, -5, 250, 222, 5, 4, 'ground') + `<g transform="${f.TOP(-36, -36, 0)}"><path class="flow" d="M68 58 128 128 188 58"/><path class="flow" d="M128 128V192"/></g>` +
        desk(0, 0) + desk(118, 0) + f.box(82, 82, 0, 20, 20, 20, 3, 'gold') + desk(58, 146);
    },
    // formulaire de candidature
    form: (f) => f.box(0, 0, 0, 96, 120, 5, 4) + `<g transform="${f.TOP(0, 0, 5)}"><path class="det ink" d="M12 16h48"/><path class="det" d="M12 30h72M12 42h64M12 56h72M12 68h50M12 82h72"/><rect class="face gold" x="12" y="96" width="14" height="14" rx="2"/><path class="det ink" d="M32 103h40"/></g>`,
    // téléphone et conversation
    phone: (f) => f.box(0, 0, 0, 70, 128, 9, 9) + `<g transform="${f.TOP(0, 0, 9)}"><rect class="face glass" x="6" y="9" width="58" height="110" rx="6"/><rect class="face" x="11" y="20" width="34" height="13" rx="5"/><rect class="face gold" x="25" y="40" width="34" height="13" rx="5"/><rect class="face" x="11" y="60" width="40" height="18" rx="5"/><rect class="face gold" x="29" y="85" width="30" height="13" rx="5"/></g>`,
    // porte ouverte du Cercle
    door: (f) => f.box(-26, -34, -5, 140, 110, 5, 4, 'ground') + `<g transform="${f.FRONT(10, 12, 118)}"><rect class="win on" width="68" height="118"/></g>` +
      f.box(0, 0, 0, 10, 12, 118, 2) + f.box(78, 0, 0, 10, 12, 118, 2) + f.box(0, 0, 118, 88, 12, 11, 2) + f.box(10, 16, 0, 68, 30, 2, 2, 'gold') + f.box(14, 50, 0, 60, 20, 1, 2, 'gold'),
    // offres
    bubble: (f) => f.box(0, 0, 0, 110, 80, 18, 8) + f.box(14, 80, 0, 22, 18, 18, 3) + `<g transform="${f.TOP(0, 0, 18)}"><path class="det live-s" d="M18 26h66M18 44h46"/></g>`,
    screen: (f) => f.box(40, 30, 0, 50, 34, 6, 3) + f.box(58, 40, 6, 14, 10, 30, 2) + f.box(0, 34, 36, 130, 10, 82, 4) + `<g transform="${f.FRONT(0, 44, 118)}"><rect class="face glass" x="7" y="7" width="116" height="68" rx="3"/><path class="det live-s" d="M20 26l9 8-9 8M36 46h22"/></g>`,
    stairs: (f) => [0, 1, 2, 3].map((i) => f.box(i * 30, 0, 0, 30, 70, 22 + i * 22, 2, i === 3 ? 'gold' : '')).join(''),
    building: (f) => f.box(-8, -8, 0, 136, 86, 8, 2) + [0, 1, 2, 3].map((i) => f.box(6 + i * 32, 30, 8, 12, 12, 70, 2)).join('') + f.box(-8, -8, 78, 136, 86, 10, 2) + f.box(10, 10, 88, 100, 50, 10, 2, 'gold'),
  };

  document.querySelectorAll('[data-iso]').forEach((svg) => {
    const fn = DRAW[svg.dataset.iso]; if (!fn) return;
    const f = Fig(); const html = fn(f);
    svg.setAttribute('viewBox', f.view()); svg.innerHTML = html;
  });

  const blinks = [...document.querySelectorAll('[data-blink]')];
  if (!reduce && blinks.length) setInterval(() => blinks[Math.floor(Math.random() * blinks.length)].classList.toggle('on'), 450);
})();

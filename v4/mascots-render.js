(() => {
  const M = window.MASCOTS || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let n = 0;
  const grain = (id) => `<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="t"/>
    <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.25" result="d"/>
    <feComposite in="d" in2="SourceGraphic" operator="in" result="s"/>
    <feComponentTransfer in="s" result="s2"><feFuncA type="linear" slope=".16"/></feComponentTransfer>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s2"/></feMerge></filter>`;
  document.querySelectorAll('.mz[data-m]').forEach((el) => {
    const d = M[el.dataset.m]; if (!d) return;
    const id = 'gr' + n++;
    const [x, y, w, h] = d.vb;
    el.innerHTML = `<svg viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><defs>${grain(id)}</defs>
      <g class="mz-b" style="transform-origin:${x + w / 2}px ${y + h}px">
        <g filter="url(#${id})">
          ${d.silhouette.map((p) => `<path d="${p}" fill="${d.side}"/>`).join('')}
          ${d.body.map((p) => `<path d="${p}" fill="${d.face}"/>`).join('')}
        </g>
        <g class="mz-face">
          <g class="mz-brows">${d.brows.map((p) => `<path d="${p}" fill="#2a2a30"/>`).join('')}</g>
          <g class="mz-eyes">${d.eyes.map((p) => `<path class="mz-eye" d="${p}" fill="#141418"/>`).join('')}</g>
        </g>
      </g></svg>`;
    el.style.setProperty('--ar', w / h);
  });
  if (reduce) return;
  let raf = 0, px = innerWidth / 2, py = innerHeight / 3;
  const look = () => {
    raf = 0;
    document.querySelectorAll('.mz .mz-face').forEach((g) => {
      const r = g.closest('.mz').getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const k = Math.min(1, Math.hypot(dx, dy) / 420), a = Math.atan2(dy, dx);
      const s = r.width / 100;
      g.style.transform = `translate(${(Math.cos(a) * 26 * k).toFixed(1)}px, ${(Math.sin(a) * 18 * k).toFixed(1)}px)`;
    });
  };
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
  look();
})();

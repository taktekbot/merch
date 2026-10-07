// B09 the patch — "It's hiding on this page. Find it four times."
// Four small bot faces peek out of real page elements: the header logo, the locked/Buy
// panel, the footer, and the stage itself. Click each one to find it. All injected DOM is
// removed through kit.cleanup when the game resets.
function faceSvg(size, { closed = false } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  const body = document.createElementNS(ns, 'circle');
  body.setAttribute('cx', 512); body.setAttribute('cy', 512); body.setAttribute('r', 232);
  body.setAttribute('fill', '#00A862');
  const mkEye = (x, h) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', x); r.setAttribute('width', 56); r.setAttribute('rx', 28);
    r.setAttribute('height', h); r.setAttribute('y', 442 + (120 - h) / 2);
    r.setAttribute('fill', '#F7F5F1');
    return r;
  };
  const h = closed ? 10 : 120;
  svg.append(body, mkEye(420, h), mkEye(548, h));
  return svg;
}

export default function mount(kit) {
  const needed = 4;
  const found = new Set();
  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '6%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: `find it four times · 0/${needed}` });
  kit.stage.append(label);

  // In-stage hiding spot, drawn directly in the game's own square.
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { position: 'absolute', inset: '0' } });
  kit.stage.prepend(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: 'var(--card)' }));
  const stageSpot = kit.svg('g', { transform: 'translate(880 110)', style: { cursor: 'pointer' }, 'data-hide-spot': 'stage' });
  const stageBody = kit.svg('circle', { cx: 0, cy: 0, r: 70, fill: kit.colors.accent || '#00A862' });
  const stageEyeL = kit.svg('rect', { x: -48, y: -20, width: 18, height: 40, rx: 9, fill: 'var(--card)' });
  const stageEyeR = kit.svg('rect', { x: 8, y: -20, width: 18, height: 40, rx: 9, fill: 'var(--card)' });
  stageSpot.append(stageBody, stageEyeL, stageEyeR);
  svg.append(stageSpot);

  const markFound = (id, onFound) => {
    if (found.has(id)) return;
    found.add(id);
    onFound?.();
    label.textContent = `${found.size}/${needed}`;
    kit.status(`${found.size}/${needed} found`);
    if (found.size >= needed) {
      label.textContent = 'found you. all four.';
      kit.win('found you. all four.');
    }
  };

  kit.on(stageSpot, 'pointerdown', (e) => {
    e.stopPropagation();
    stageEyeL.setAttribute('height', 6); stageEyeL.setAttribute('y', -3);
    stageEyeR.setAttribute('height', 6); stageEyeR.setAttribute('y', -3);
    markFound('stage');
  });

  // Live, moving bot faces peeking out of real page chrome: logo, the lock/buy panel, footer.
  const targets = [
    { id: 'logo', el: document.querySelector('.top .brand'), corner: 'right', size: 30 },
    { id: 'panel', el: document.getElementById('lock') || document.getElementById('buy'), corner: 'left', size: 32 },
    { id: 'footer', el: document.querySelector('.foot'), corner: 'top', size: 30 },
  ].filter((t) => t.el);

  const injected = [];
  for (const t of targets) {
    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', 'find the bot');
    wrap.dataset.hideSpot = t.id;
    wrap.tabIndex = 0;
    Object.assign(wrap.style, {
      position: 'fixed', zIndex: 9999, width: `${t.size}px`, height: `${t.size * 0.6}px`,
      overflow: 'hidden', cursor: 'pointer', pointerEvents: 'auto', transition: 'transform .15s ease',
    });
    const inner = faceSvg(t.size);
    Object.assign(inner.style, { display: 'block' });
    wrap.append(inner);
    document.body.append(wrap);
    injected.push(wrap);

    const place = () => {
      const r = t.el.getBoundingClientRect();
      const peek = t.size * 0.4;
      const h = t.size * 0.6;
      if (t.corner === 'top') {
        wrap.style.top = `${Math.max(2, r.top - (h - peek))}px`;
        wrap.style.left = `${Math.max(2, r.left + 24)}px`;
        return;
      }
      const top = r.top + r.height / 2 - h / 2;
      const left = t.corner === 'right' ? r.right - peek : Math.max(2, r.left - (t.size - peek));
      wrap.style.top = `${Math.max(2, top)}px`;
      wrap.style.left = `${left}px`;
    };
    place();
    kit.on(window, 'scroll', place, { passive: true });
    kit.on(window, 'resize', place);

    const react = () => {
      inner.replaceChildren(...faceSvg(t.size, { closed: true }).childNodes);
      wrap.style.transform = 'scale(1.15)';
      markFound(t.id);
    };
    kit.on(wrap, 'pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); react(); });
    kit.on(wrap, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); react(); } });

    kit.every(2200, () => {
      if (found.has(t.id)) return;
      wrap.style.transform = wrap.style.transform === 'translateY(-3px)' ? 'translateY(0)' : 'translateY(-3px)';
    });
  }

  kit.cleanup(() => { for (const n of injected) n.remove(); });
  kit.status(`${found.size}/${needed} found`);
}

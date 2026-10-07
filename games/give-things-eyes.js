// B07 stick-on eyes — "Give things eyes."
// A flat kitchen scene. Click three things to stick eyes on them; each blinks awake.
export default function mount(kit) {
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const ink = 'currentColor';
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: 'var(--card)' }));
  // floor line
  svg.append(kit.svg('line', { x1: 40, y1: 760, x2: 960, y2: 760, stroke: ink, 'stroke-opacity': 0.15, 'stroke-width': 6 }));

  const objects = [
    { id: 'fridge', x: 150, y: 420, w: 190, h: 340, draw: (g) => g.append(kit.svg('rect', { x: 0, y: 0, width: 190, height: 340, rx: 16, fill: '#F2D98A', stroke: ink, 'stroke-width': 7 }), kit.svg('line', { x1: 0, y1: 110, x2: 190, y2: 110, stroke: ink, 'stroke-width': 5, 'stroke-opacity': 0.5 })) },
    { id: 'toaster', x: 430, y: 620, w: 170, h: 110, draw: (g) => g.append(kit.svg('rect', { x: 0, y: 0, width: 170, height: 110, rx: 20, fill: '#C9764F', stroke: ink, 'stroke-width': 7 })) },
    { id: 'mug', x: 650, y: 650, w: 110, h: 100, draw: (g) => g.append(kit.svg('rect', { x: 0, y: 0, width: 90, height: 90, rx: 14, fill: '#F7F5F1', stroke: ink, 'stroke-width': 6 }), kit.svg('path', { d: 'M90 20 h20 a24 24 0 0 1 0 50 h-20', fill: 'none', stroke: ink, 'stroke-width': 6 })) },
    { id: 'plant', x: 800, y: 560, w: 140, h: 190, draw: (g) => g.append(kit.svg('path', { d: 'M20 190 L40 90 H100 L120 190 Z', fill: '#C9764F', stroke: ink, 'stroke-width': 6 }), kit.svg('path', { d: 'M70 90 C 20 60, 20 10, 70 0 C 120 10, 120 60, 70 90 Z', fill: '#2F4F46' })) },
    { id: 'window', x: 300, y: 120, w: 220, h: 220, draw: (g) => g.append(kit.svg('rect', { x: 0, y: 0, width: 220, height: 220, rx: 10, fill: '#8FA6B8', stroke: ink, 'stroke-width': 7 }), kit.svg('line', { x1: 110, y1: 0, x2: 110, y2: 220, stroke: ink, 'stroke-width': 6 }), kit.svg('line', { x1: 0, y1: 110, x2: 220, y2: 110, stroke: ink, 'stroke-width': 6 })) },
  ];

  const found = new Set();
  const needed = 3;
  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '4%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: `give 3 things eyes · 0/${needed}` });
  kit.stage.append(label);

  for (const o of objects) {
    const g = kit.svg('g', { transform: `translate(${o.x} ${o.y})`, style: { cursor: 'pointer' } });
    o.draw(g);
    svg.append(g);
    kit.on(g, 'click', () => {
      if (found.has(o.id) || kit.won) return;
      found.add(o.id);
      const ex = o.w * 0.3, ex2 = o.w * 0.62, ey = o.h * 0.32;
      const eyeW = Math.max(14, o.w * 0.1), eyeH = eyeW * 2, rx = eyeW / 2;
      const eyeL = kit.svg('rect', { x: ex - eyeW / 2, y: ey - 2, width: eyeW, height: 2, rx, fill: kit.colors.ink || '#0D0D0E' });
      const eyeR = kit.svg('rect', { x: ex2 - eyeW / 2, y: ey - 2, width: eyeW, height: 2, rx, fill: kit.colors.ink || '#0D0D0E' });
      g.append(eyeL, eyeR);
      // pop the eyes open
      let t = 0;
      const stop = kit.loop((dt) => {
        t += dt;
        const p = Math.min(1, t / 260);
        const h = 2 + (eyeH - 2) * p;
        eyeL.setAttribute('height', h); eyeL.setAttribute('y', ey - h / 2);
        eyeR.setAttribute('height', h); eyeR.setAttribute('y', ey - h / 2);
        if (p >= 1) stop();
      });
      // then blink occasionally
      const blink = () => {
        if (!g.isConnected) return;
        eyeL.setAttribute('height', 2); eyeL.setAttribute('y', ey - 1);
        eyeR.setAttribute('height', 2); eyeR.setAttribute('y', ey - 1);
        kit.after(110, () => { eyeL.setAttribute('height', eyeH); eyeL.setAttribute('y', ey - eyeH / 2); eyeR.setAttribute('height', eyeH); eyeR.setAttribute('y', ey - eyeH / 2); });
        kit.after(900 + Math.random() * 1800, blink);
      };
      kit.after(500, blink);
      label.textContent = `${found.size}/${needed}`;
      if (found.size >= needed) { label.textContent = 'everything is looking at you now.'; kit.win('everything is looking at you now.'); }
    });
  }
}

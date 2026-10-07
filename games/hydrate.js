// B06 bot bottle — "Hydrate the bot."
// It wanders around the stage. Tap/click it to flick a drop in. 8 drops and it's hydrated.
export default function mount(kit) {
  const needed = kit.options?.drops || 8;
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const k = 1000 / 1024;
  let cx = 500, cy = 500;
  const body = kit.svg('circle', { cx, cy, r: 190 * k, fill: kit.colors.accent || '#00A862' });
  const eyeW = 50 * k, baseH = 108 * k, rx = 25 * k;
  const eyeL = kit.svg('rect', { width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeR = kit.svg('rect', { width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  svg.append(body, eyeL, eyeR);
  const place = (dx = 0, dy = 0, h = baseH) => {
    const ex1 = cx - 75 * k + dx, ex2 = cx + 30 * k + dx, ey = cy - 58 * k + dy;
    eyeL.setAttribute('x', ex1 - eyeW / 2); eyeL.setAttribute('y', ey - h / 2); eyeL.setAttribute('height', h);
    eyeR.setAttribute('x', ex2 - eyeW / 2); eyeR.setAttribute('y', ey - h / 2); eyeR.setAttribute('height', h);
  };
  body.setAttribute('cx', cx); body.setAttribute('cy', cy); place();

  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '6%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: `flick it some water. 0/${needed}` });
  kit.stage.append(label);

  let target = { x: cx, y: cy };
  const pickTarget = () => { target = { x: 220 + Math.random() * 560, y: 220 + Math.random() * 480 }; };
  pickTarget();
  kit.every(2600, pickTarget);

  let drops = 0;
  const RADIUS = 210;
  const splash = (x, y, hit) => {
    const dot = kit.svg('circle', { cx: x, cy: y, r: 10, fill: hit ? (kit.colors.accent || '#00A862') : '#8FA6B8', opacity: 0.9 });
    svg.append(dot);
    let t = 0;
    const stop = kit.loop((dt) => {
      t += dt;
      const p = Math.min(1, t / 420);
      dot.setAttribute('r', 10 + p * 26);
      dot.setAttribute('opacity', 0.9 * (1 - p));
      if (p >= 1) { dot.remove(); stop(); }
    });
  };

  kit.on(kit.stage, 'pointerdown', (e) => {
    if (kit.won) return;
    const p = kit.point(e);
    const x = p.x * 1000, y = p.y * 1000;
    const hit = Math.hypot(x - cx, y - cy) <= RADIUS;
    splash(x, y, hit);
    if (hit) {
      drops++;
      place((Math.random() - 0.5) * 20, -0.4, 10 * k);
      kit.after(130, () => place());
      label.textContent = `${drops}/${needed}`;
      kit.status(`${drops}/${needed}`);
      if (drops >= needed) {
        kit.win('hydrated. for now.');
        return;
      }
    } else {
      label.textContent = 'missed it. keep flicking.';
    }
  });

  let blinkAt = 1400;
  kit.loop((dt) => {
    if (kit.won) return false;
    cx += (target.x - cx) * Math.min(1, dt / 900);
    cy += (target.y - cy) * Math.min(1, dt / 900);
    body.setAttribute('cx', cx); body.setAttribute('cy', cy);
    blinkAt -= dt;
    if (blinkAt <= 0) { place(0, 0, 8 * k); kit.after(100, () => place()); blinkAt = 1800 + Math.random() * 2000; }
    else place(Math.sin(performance.now() / 1200) * 6, 0);
    kit.status(`${drops}/${needed}`);
  });
}

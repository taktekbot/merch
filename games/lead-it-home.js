// B10 bot pillow — "Lead it home without losing it."
// It follows your cursor, slowly. Move too fast and it loses track, stops, and looks lost.
// Walk it from the yard to the door.
export default function mount(kit) {
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const start = { x: 140, y: 560 };
  const door = { x: 860, y: 500 };

  svg.append(kit.svg('rect', { x: 780, y: 300, width: 170, height: 400, rx: 10, fill: '#2F4F46' }));
  svg.append(kit.svg('rect', { x: 800, y: 340, width: 130, height: 320, rx: 60, fill: 'var(--card)' }));
  svg.append(kit.svg('text', { x: 865, y: 250, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 26, fill: 'var(--muted)', text: 'home' }));

  const k = 1000 / 1024;
  let bx = start.x, by = start.y;
  const body = kit.svg('circle', { cx: bx, cy: by, r: 150 * k, fill: kit.colors.accent || '#00A862' });
  const eyeW = 50 * k, baseH = 100 * k, rx = 25 * k;
  const eyeL = kit.svg('rect', { width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeR = kit.svg('rect', { width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  svg.append(body, eyeL, eyeR);
  const place = (h = baseH, dy = 0) => {
    const ex1 = bx - 70 * k, ex2 = bx + 30 * k, ey = by - 55 * k + dy;
    eyeL.setAttribute('x', ex1 - eyeW / 2); eyeL.setAttribute('y', ey - h / 2); eyeL.setAttribute('height', h);
    eyeR.setAttribute('x', ex2 - eyeW / 2); eyeR.setAttribute('y', ey - h / 2); eyeR.setAttribute('height', h);
  };
  place();

  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '4%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: 'move slowly. lead it to the door.' });
  kit.stage.append(label);

  let cursor = { x: start.x, y: start.y };
  let lastCursor = null, lastAt = performance.now();
  let lostUntil = 0;
  const MAX_SPEED = 0.85; // fraction of stage width per second, before it's "too fast"
  const FOLLOW = 0.0032; // follow smoothing per ms

  kit.on(kit.stage, 'pointermove', (e) => {
    const p = kit.point(e);
    cursor = { x: p.x * 1000, y: p.y * 1000 };
    const now = performance.now();
    if (lastCursor) {
      const dt = Math.max(1, now - lastAt);
      const dist = Math.hypot(cursor.x - lastCursor.x, cursor.y - lastCursor.y) / 1000;
      const speed = dist / (dt / 1000);
      if (speed > MAX_SPEED && now > lostUntil) {
        lostUntil = now + 900;
        label.textContent = "too fast — it's lost. slow down.";
      }
    }
    lastCursor = cursor; lastAt = now;
  }, { passive: true });

  let dwell = 0, blinkAt = 1600;
  kit.loop((dt) => {
    const now = performance.now();
    const lost = now < lostUntil;
    if (!lost) {
      bx += (cursor.x - bx) * Math.min(0.08, FOLLOW * dt);
      by += (cursor.y - by) * Math.min(0.08, FOLLOW * dt);
      body.setAttribute('cx', bx); body.setAttribute('cy', by);
      if (lastCursor && label.textContent.startsWith('too fast')) label.textContent = 'move slowly. lead it to the door.';
    }
    blinkAt -= dt;
    if (lost) { place(baseH * 1.3, -6); }
    else if (blinkAt <= 0) { place(8 * k); kit.after(100, () => place()); blinkAt = 1800 + Math.random() * 1600; }
    else place();

    const toDoor = Math.hypot(bx - door.x, by - door.y);
    const nearDoor = toDoor < 150;
    dwell = nearDoor && !lost ? dwell + dt : 0;
    const totalDist = Math.hypot(start.x - door.x, start.y - door.y);
    kit.status(nearDoor ? 'at the door…' : `${Math.round((1 - toDoor / totalDist) * 100)}% home`);
    if (dwell > 500) {
      label.textContent = 'home.';
      kit.win('home. led it there yourself.');
      return false;
    }
  });
}

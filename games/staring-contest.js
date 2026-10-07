// B03 the eyes tee — "Win a staring contest."
// The bot's eyes track your cursor. Hold still for 10 seconds and it blinks first.
export default function mount(kit) {
  const o = kit.options || {};
  const seconds = o.seconds || 10;
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const cx = 500, cy = 500, k = 1000 / 1024;
  const body = kit.svg('circle', { cx, cy, r: 232 * k, fill: kit.colors.accent || '#00A862' });
  const eyeW = 56 * k, baseH = 120 * k, rx = 28 * k;
  const mkEye = () => kit.svg('rect', { width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeL = mkEye(), eyeR = mkEye();
  const C = 2 * Math.PI * 300;
  const ring = kit.svg('circle', { cx, cy, r: 300, fill: 'none', stroke: kit.colors.accent || '#00a862', 'stroke-width': 10, 'stroke-dasharray': C, 'stroke-dashoffset': C, transform: `rotate(-90 ${cx} ${cy})`, 'stroke-linecap': 'round', opacity: 0.55 });
  svg.append(ring, body, eyeL, eyeR);
  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '6%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: 'look at it. hold still.' });
  kit.stage.append(label);

  const placeEyes = (dx, dy, h = baseH) => {
    const ex1 = cx - 92 * k + dx, ex2 = cx + 36 * k + dx, ey = cy - 70 * k + dy;
    eyeL.setAttribute('x', ex1 - eyeW / 2); eyeL.setAttribute('y', ey - h / 2); eyeL.setAttribute('height', h);
    eyeR.setAttribute('x', ex2 - eyeW / 2); eyeR.setAttribute('y', ey - h / 2); eyeR.setAttribute('height', h);
  };
  placeEyes(0, 0);

  let last = null, stillMs = 0, started = false;
  const EPS = 0.006; // natural tremor tolerance, as a fraction of stage size

  kit.on(window, 'pointermove', (e) => {
    if (kit.won) return;
    const p = kit.point(e);
    const look = { x: Math.max(-1, Math.min(1, (p.x - 0.5) * 2)), y: Math.max(-1, Math.min(1, (p.y - 0.5) * 2)) };
    placeEyes(look.x * 16 * k, look.y * 12 * k);
    if (!last) { last = p; started = true; return; }
    const d = Math.hypot(p.x - last.x, p.y - last.y);
    if (d > EPS) { stillMs = 0; label.textContent = 'it saw that. hold still.'; }
    last = p;
  }, { passive: true });
  kit.on(kit.stage, 'pointerleave', () => { if (started) { stillMs = 0; last = null; label.textContent = 'come back. hold still.'; } });
  kit.on(window, 'keydown', () => { if (started) { stillMs = 0; label.textContent = 'hold still.'; } });

  kit.loop((dt) => {
    if (!started) return;
    stillMs += dt;
    const left = Math.max(0, seconds - stillMs / 1000);
    kit.status(`${left.toFixed(1)}s`);
    const p = Math.min(1, stillMs / (seconds * 1000));
    ring.setAttribute('stroke-dashoffset', C * (1 - p));
    if (p > 0.7) label.textContent = "it's wavering…";
    if (stillMs >= seconds * 1000) {
      placeEyes(0, 0, 6 * k);
      label.textContent = 'it blinked first.';
      kit.win('it blinked first.');
      return false;
    }
  });
}

// B04 warm beanie — "It's cold. Warm it up."
// The bot shivers blue. Rub it (scrub back and forth over the stage) until it warms up green.
export default function mount(kit) {
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const cx = 500, cy = 500, k = 1000 / 1024;
  const cold = '#8FA6B8', warm = kit.colors.accent || '#00A862';
  const body = kit.svg('circle', { cx, cy, r: 232 * k, fill: cold });
  const eyeW = 56 * k, baseH = 120 * k, rx = 28 * k;
  const eyeL = kit.svg('rect', { x: cx - 92 * k - eyeW / 2, y: cy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeR = kit.svg('rect', { x: cx + 36 * k - eyeW / 2, y: cy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  svg.append(body, eyeL, eyeR);
  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '6%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: 'rub it. scrub back and forth.' });
  kit.stage.append(label);

  const lerpColor = (a, b, t) => {
    const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
    const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
  };

  let warmth = 0; // 0 cold .. 1 warm
  let lastX = null, lastDir = 0, lastMoveAt = performance.now();
  const onMove = (e) => {
    if (kit.won) return;
    const p = kit.point(e);
    lastMoveAt = performance.now();
    if (lastX == null) { lastX = p.x; return; }
    const dx = p.x - lastX;
    if (Math.abs(dx) < 0.012) return;
    const dir = dx > 0 ? 1 : -1;
    if (lastDir !== 0 && dir !== lastDir) { warmth = Math.min(1, warmth + 0.13); shiverKick(); }
    lastDir = dir;
    lastX = p.x;
  };
  kit.on(kit.stage, 'pointermove', onMove, { passive: true });
  kit.on(kit.stage, 'pointerdown', onMove, { passive: true });

  let kick = 0;
  function shiverKick() { kick = 1; }

  let blinkAt = 1500;
  kit.loop((dt) => {
    const idleFor = performance.now() - lastMoveAt;
    if (idleFor > 500) warmth = Math.max(0, warmth - dt * 0.00006);
    kick = Math.max(0, kick - dt / 220);
    const shiver = (1 - warmth) * (kit.reducedMotion ? 0 : Math.sin(performance.now() / 55) * 7 * (1 - kick * 0.5));
    body.setAttribute('cx', cx + shiver);
    body.setAttribute('fill', lerpColor(cold, warm, warmth));
    const eh = baseH * (1 - (1 - warmth) * 0.55); // squints when cold
    const ey = cy - 70 * k - eh / 2;
    eyeL.setAttribute('x', cx - 92 * k - eyeW / 2 + shiver); eyeL.setAttribute('y', ey); eyeL.setAttribute('height', eh);
    eyeR.setAttribute('x', cx + 36 * k - eyeW / 2 + shiver); eyeR.setAttribute('y', ey); eyeR.setAttribute('height', eh);
    blinkAt -= dt;
    if (blinkAt <= 0 && warmth < 1) blinkAt = 1800 + Math.random() * 1800;
    label.textContent = warmth >= 1 ? 'warm.' : warmth > 0.6 ? 'almost. keep going.' : "it's freezing. rub it.";
    kit.status(`${Math.round(warmth * 100)}% warm`);
    if (warmth >= 1) { kit.win('warm now. thanks.'); return false; }
  });
}

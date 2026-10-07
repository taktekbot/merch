// B21 — the face case: a clear MagSafe iPhone case with the bot's face printed right over
// the MagSafe ring (and the Apple logo under it). A phone lies on a desk beside a MagSafe
// charging puck. Drag the phone so the face lines up exactly over the puck — the magnets
// help once it's close. Aligned: the eyes blink awake, a charge ring fills, it says
// something tiny. Misaligned: it stays asleep.
import { createBot, shadow, heading, zParticles, shade } from './_bot.js';
import { winBeat } from './_bot2.js';

export default function mount(kit) {
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  // the desk: warm wood, quiet grain
  const wood = '#C9A36A';
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: wood }));
  const grain = kit.svg('g');
  for (let i = 0; i < 9; i++) {
    grain.append(kit.svg('line', { x1: 0, y1: 70 + i * 100, x2: 1000, y2: 55 + i * 100, stroke: shade(wood, 0.16), 'stroke-width': 2, opacity: 0.3 }));
  }
  svg.append(grain);

  const PUCK = { x: 580, y: 560 };
  const SNAP = 85;

  // the charging cable, trailing off the desk's edge
  svg.append(kit.svg('path', { d: `M ${PUCK.x + 26} ${PUCK.y + 48} Q ${PUCK.x + 150} ${PUCK.y + 120} 980 900`, stroke: '#F7F5F1', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }));

  // the puck itself
  const puckGlow = kit.svg('circle', { cx: PUCK.x, cy: PUCK.y, r: 130, fill: '#00A862', opacity: 0 });
  svg.append(puckGlow);
  shadow(kit, { cx: PUCK.x, cy: PUCK.y + 8, rx: 96, ry: 18, opacity: 0.14, parent: svg });
  svg.append(kit.svg('circle', { cx: PUCK.x, cy: PUCK.y, r: 92, fill: '#E7E4DC', stroke: shade('#E7E4DC', 0.18), 'stroke-width': 4 }));
  svg.append(kit.svg('circle', { cx: PUCK.x, cy: PUCK.y, r: 92, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.5 }));
  svg.append(kit.svg('circle', { cx: PUCK.x, cy: PUCK.y, r: 60, fill: 'none', stroke: '#B9B5A8', 'stroke-width': 10 }));
  svg.append(kit.svg('circle', { cx: PUCK.x, cy: PUCK.y, r: 9, fill: '#B9B5A8' }));

  // the phone — a draggable group. Its own local origin (0,0) IS the printed face/ring
  // centre, so alignment is just "phone position == PUCK".
  let phoneX = 300, phoneY = 790;
  const PW = 260, PH = 540;
  const phoneG = kit.svg('g', { transform: `translate(${phoneX} ${phoneY})`, style: { cursor: 'grab', touchAction: 'none' } });

  shadow(kit, { cx: 0, cy: PH * 0.42, rx: PW * 0.66, ry: 20, opacity: 0.16, parent: phoneG });

  // the case body: pale, slightly translucent, a camera bump in the corner
  const body = kit.svg('rect', { x: -PW / 2, y: -PH * 0.52, width: PW, height: PH, rx: 46, fill: '#F2EFE7', stroke: '#CFC9BC', 'stroke-width': 4, opacity: 0.94 });
  const bodyHi = kit.svg('rect', { x: -PW / 2 + 10, y: -PH * 0.52 + 10, width: PW * 0.3, height: PH * 0.4, rx: 30, fill: '#FFFFFF', opacity: 0.18 });
  phoneG.append(body, bodyHi);
  const bumpX = -PW * 0.24, bumpY = -PH * 0.36;
  phoneG.append(kit.svg('rect', { x: bumpX - 54, y: bumpY - 54, width: 108, height: 108, rx: 26, fill: '#2A2A2C', opacity: 0.92 }));
  [[-18, -18], [18, -18], [0, 18]].forEach(([dx, dy]) => {
    phoneG.append(kit.svg('circle', { cx: bumpX + dx, cy: bumpY + dy, r: 15, fill: '#0D0D0E' }));
    phoneG.append(kit.svg('circle', { cx: bumpX + dx - 4, cy: bumpY + dy - 4, r: 4, fill: '#5A6372', opacity: 0.7 }));
  });
  phoneG.append(kit.svg('rect', { x: PW / 2 - 8, y: -70, width: 6, height: 90, rx: 3, fill: '#CFC9BC' })); // side button

  // the printed face, right over the ring — eyes read against the case's own pale colour.
  const bot = createBot(kit, { cx: 0, cy: 0, r: 108, bg: '#F2EFE7' });
  phoneG.append(bot.group);
  bot.height(0.06); // asleep until it's charging

  // the charge ring, hidden until aligned
  const RING_R = 128;
  const CIRC = 2 * Math.PI * RING_R;
  const chargeRing = kit.svg('circle', {
    cx: 0, cy: 0, r: RING_R, fill: 'none', stroke: '#00A862', 'stroke-width': 10,
    'stroke-linecap': 'round', 'stroke-dasharray': CIRC, 'stroke-dashoffset': CIRC, opacity: 0,
    transform: 'rotate(-90)',
  });
  phoneG.append(chargeRing);

  const sleepZ = zParticles(kit, { parent: phoneG, x: 70, y: -PH * 0.1 });

  svg.append(phoneG);

  const head = heading(kit, { parent: kit.stage, line: 'wake it up.', hint: 'drag the phone onto the charger.' });
  let hintHidden = false;
  const hideHint = () => { if (!hintHidden) { hintHidden = true; head.hide(); } };

  let dragging = false, offX = 0, offY = 0, aligned = false, won = false, zT = 0, nextZ = 1200;

  function setPhone(x, y) {
    phoneX = x; phoneY = y;
    phoneG.setAttribute('transform', `translate(${phoneX} ${phoneY})`);
  }

  kit.on(phoneG, 'pointerdown', (e) => {
    if (won) return;
    hideHint();
    dragging = true;
    phoneG.style.cursor = 'grabbing';
    const p = kit.point(e);
    offX = phoneX - p.x * 1000;
    offY = phoneY - p.y * 1000;
    bot.height(0.3);
  });
  kit.on(window, 'pointermove', (e) => {
    if (!dragging || won) return;
    const p = kit.point(e);
    let nx = p.x * 1000 + offX, ny = p.y * 1000 + offY;
    const dx = PUCK.x - nx, dy = PUCK.y - ny;
    const dist = Math.hypot(dx, dy);
    if (dist < SNAP) { nx += dx * 0.35; ny += dy * 0.35; puckGlow.setAttribute('opacity', 0.3); }
    else puckGlow.setAttribute('opacity', 0);
    setPhone(nx, ny);
  });
  kit.on(window, 'pointerup', () => {
    if (!dragging || won) return;
    dragging = false;
    phoneG.style.cursor = 'grab';
    const dist = Math.hypot(PUCK.x - phoneX, PUCK.y - phoneY);
    puckGlow.setAttribute('opacity', 0);
    if (dist < SNAP && !aligned) {
      setPhone(PUCK.x, PUCK.y);
      lockIn();
    } else {
      bot.height(0.06);
      kit.status('still asleep.');
    }
  });

  function lockIn() {
    aligned = true;
    hideHint();
    kit.status('charging…');
    bot.blink(kit, { duration: 180, dramatic: true });
    kit.after(180, () => {
      bot.height(1);
      bot.look(0, -4);
      chargeRing.setAttribute('opacity', 1);
      const t0 = performance.now();
      kit.loop((dt, t) => {
        const p = Math.min(1, (t - t0) / 1100);
        chargeRing.setAttribute('stroke-dashoffset', CIRC * (1 - p));
        if (p >= 1) { finish(); return false; }
      });
    });
  }

  function finish() {
    won = true;
    kit.status('awake.');
    bot.squash(kit, { amount: 0.2, duration: 220 });
    const bubble = kit.svg('g', { opacity: 0, transform: `translate(${PW * 0.34} ${-PH * 0.3})` });
    bubble.append(kit.svg('rect', { x: 0, y: 0, width: 150, height: 56, rx: 16, fill: '#F7F5F1', stroke: '#0D0D0E', 'stroke-width': 3 }));
    bubble.append(kit.svg('path', { d: 'M 10 56 L 34 56 L 16 78 Z', fill: '#F7F5F1', stroke: '#0D0D0E', 'stroke-width': 3 }));
    bubble.append(kit.svg('text', { x: 75, y: 35, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 20, fill: '#0D0D0E', text: 'oh. hi.' }));
    phoneG.append(bubble);
    requestAnimationFrame(() => bubble.setAttribute('opacity', 1));
    kit.after(650, () => winBeat(kit, svg, 'oh. hi.', { message: 'oh. hi.', delay: 1100 }));
  }

  bot.autoBlink(kit, { min: 3200, max: 5200 });

  kit.loop((dt) => {
    if (won || aligned || dragging) return;
    zT += dt;
    if (zT >= nextZ) { zT = 0; nextZ = 1800 + Math.random() * 900; if (!kit.reducedMotion) sleepZ.spawn(0.8); }
  });

  // Testing hook so check.mjs can drive a deterministic win. Harmless: the game is the fun,
  // not a lock (see earned/README.md).
  window.__face = { align: () => { setPhone(PUCK.x, PUCK.y); if (!aligned) lockIn(); } };
}

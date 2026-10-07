// B01 shy dad hat — "It's shy. Earn its trust."
// The bot hides at the edge. Hold still and it creeps toward the middle. Move and it ducks
// back out. Reach the middle and it trusts you.
function drawBot(kit, svg, { cx = 500, cy = 500, scale = 1, eyeFill } = {}) {
  const k = scale * (1000 / 1024);
  const r = 232 * k, eyeW = 56 * k, baseH = 120 * k, rx = 28 * k;
  const ex1 = -92 * k, ex2 = 36 * k, ey = -70 * k;
  const body = kit.svg('circle', { cx, cy, r, fill: kit.colors.accent || '#00A862' });
  const mk = () => kit.svg('rect', { width: eyeW, height: baseH, rx, fill: eyeFill || 'var(--card)' });
  const eyeL = mk(), eyeR = mk();
  svg.append(body, eyeL, eyeR);
  const api = {
    cx, cy, k,
    pos(x, y) { api.cx = x; api.cy = y; body.setAttribute('cx', x); body.setAttribute('cy', y); api.look(api.lx || 0, api.ly || 0); },
    look(dx = 0, dy = 0) {
      api.lx = dx; api.ly = dy;
      const ox = dx * 16 * k, oy = dy * 12 * k;
      eyeL.setAttribute('x', api.cx + ex1 - eyeW / 2 + ox); eyeL.setAttribute('y', api.cy + ey - (api.h ?? baseH) / 2 + oy);
      eyeR.setAttribute('x', api.cx + ex2 - eyeW / 2 + ox); eyeR.setAttribute('y', api.cy + ey - (api.h ?? baseH) / 2 + oy);
    },
    openness(p) {
      const h = Math.max(4 * k, baseH * p);
      api.h = h;
      eyeL.setAttribute('height', h); eyeR.setAttribute('height', h);
      api.look(api.lx || 0, api.ly || 0);
    },
    scale(s) { api.k = s * (1000 / 1024); body.setAttribute('r', 232 * api.k); },
  };
  api.openness(1);
  return api;
}

export default function mount(kit) {
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', top: '5%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: 'move and it ducks. hold still and it comes closer.' });
  kit.stage.append(label);

  const corner = { x: 160, y: 820 }; // tucked low-left, like behind a hat brim
  const center = { x: 500, y: 500 };
  const bot = drawBot(kit, svg, { cx: corner.x, cy: corner.y, scale: 0.7 });

  let progress = 0; // 0 at corner, 1 at center (trust)
  let idleMs = 0;
  let duckUntil = 0;
  let blinkAt = 2000 + Math.random() * 2000;
  const GRACE = 450, APPROACH_MS = 9000, MOVE_WOBBLE = 0.65;

  const place = () => {
    const x = corner.x + (center.x - corner.x) * progress;
    const y = corner.y + (center.y - corner.y) * progress;
    const s = 0.7 + 0.3 * progress;
    bot.scale(s);
    bot.pos(x, y);
  };
  place();

  kit.onActivity(() => {
    if (kit.won) return;
    idleMs = 0;
    duckUntil = performance.now() + 260;
    progress = Math.max(0, progress - MOVE_WOBBLE * 0.2);
    place();
    label.textContent = 'it ducked. hold still again.';
  });

  kit.loop((dt) => {
    const now = performance.now();
    if (now < duckUntil) { bot.look((Math.random() - 0.5) * 2, -0.6); return; }
    idleMs += dt;
    if (idleMs > GRACE && progress < 1) {
      progress = Math.min(1, progress + dt / APPROACH_MS);
      place();
      if (progress > 0.15) label.textContent = "it's creeping closer. keep still.";
    }
    blinkAt -= dt;
    if (blinkAt <= 0) {
      bot.openness(0.08);
      kit.after(120, () => bot.openness(1));
      blinkAt = 2200 + Math.random() * 2600;
    } else {
      bot.look(Math.sin(now / 1400) * 0.3, Math.cos(now / 1900) * 0.2);
    }
    kit.status(`${Math.round(progress * 100)}% trust`);
    if (progress >= 1) {
      label.textContent = 'it trusts you.';
      bot.openness(1.1);
      kit.win("ok. you can see it now.");
      return false;
    }
  });
}

// B04 warm beanie — "It's cold. Warm it up."
// A snowy window, frost creeping on the glass, the bot shivering with a dusting of frost
// on top. Rub it (scrub side to side) and friction sparks fly as the frost melts back;
// warm all the way and it gets a scarf.
import { createBot, room, sceneWindow, frost, sparks, shadow, heading, mix, winBeat } from './_bot.js';

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const cold = '#8FA6B8', warm = (kit.colors && kit.colors.accent) || '#00A862';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#E8DFCF', floor: mix('#E8DFCF', '#8FA6B8', 0.35), floorY: 640 });
  const win = sceneWindow(kit, { parent: svg, x: 660, y: 160, w: 250, h: 250, sky: 'day', curtains: false });
  // falling snow behind the frost
  const snow = [];
  for (let i = 0; i < 14; i++) {
    const flake = kit.svg('circle', { cx: Math.random() * win.w, cy: Math.random() * win.h, r: 3 + Math.random() * 3, fill: '#F7F5F1', opacity: 0.85 });
    win.group.insertBefore(flake, win.group.lastChild);
    snow.push({ el: flake, x: Math.random() * win.w, y: Math.random() * win.h, s: 20 + Math.random() * 30 });
  }
  const glass = frost(kit, { parent: win.group, w: win.w, h: win.h });

  const floorShadow = shadow(kit, { cx: 420, cy: 812, rx: 150, ry: 26, parent: svg });
  const bot = createBot(kit, { cx: 420, cy: 650, r: 170, bg: card, color: cold });
  svg.append(bot.group);
  // a light dusting of frost on top of its head
  const cap = kit.svg('path', {
    d: 'M -120 -30 Q -90 -118 0 -126 Q 90 -118 120 -30 Q 60 -54 0 -50 Q -60 -54 -120 -30 Z',
    fill: '#F7F5F1', opacity: 0.85, transform: 'translate(420 540)',
  });
  svg.append(cap);

  const head = heading(kit, { parent: kit.stage, line: "it's cold.", hint: 'rub it. scrub side to side.' });
  let hintHidden = false;

  let warmth = 0;
  let lastX = null, lastDir = 0, lastMoveAt = performance.now();
  let shiver = bot.startShiver(kit, { intensity: 10 });
  let wonAlready = false;

  const onMove = (e) => {
    if (wonAlready) return;
    const p = kit.point(e);
    lastMoveAt = performance.now();
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (lastX == null) { lastX = p.x; return; }
    const dx = p.x - lastX;
    if (Math.abs(dx) < 0.012) return;
    const dir = dx > 0 ? 1 : -1;
    if (lastDir !== 0 && dir !== lastDir) {
      warmth = Math.min(1, warmth + 0.1);
      sparks(kit, { parent: svg, x: 420 + (Math.random() - 0.5) * 200, y: 620 + (Math.random() - 0.5) * 160, color: '#F2D98A', count: 5 });
      bot.squash(kit, { amount: 0.1, duration: 140 });
    }
    lastDir = dir;
    lastX = p.x;
  };
  kit.on(kit.stage, 'pointermove', onMove, { passive: true });
  kit.on(kit.stage, 'pointerdown', onMove, { passive: true });

  bot.autoBlink(kit, { min: 2200, max: 3800 });

  kit.loop((dt, t) => {
    if (wonAlready) return;
    for (const f of snow) {
      f.y += dt / f.s;
      if (f.y > win.h) f.y = 0;
      f.el.setAttribute('cx', f.x);
      f.el.setAttribute('cy', f.y);
    }
    const idleFor = performance.now() - lastMoveAt;
    if (idleFor > 500) warmth = Math.max(0, warmth - dt * 0.00006);
    glass.set(1 - warmth);
    cap.setAttribute('opacity', Math.max(0, 0.85 - warmth * 0.9));
    shiver.setIntensity((1 - warmth) * 10);
    const tone = mix(cold, warm, warmth);
    bot.body.setAttribute('fill', tone);
    bot.height(1 - (1 - warmth) * 0.5);
    kit.status(`${Math.round(warmth * 100)}% warm`);
    if (warmth >= 1) { finish(); return false; }
  });

  function finish() {
    wonAlready = true;
    shiver.stop();
    cap.setAttribute('opacity', 0);
    bot.look(0, 0);
    bot.height(1);
    bot.squash(kit, { amount: 0.2, duration: 240 });
    kit.after(200, () => bot.wearScarf({ color: '#C9764F' }));
    kit.after(700, () => winBeat(kit, svg, 'warm now. thanks.'));
  }
}

// B10 bot pillow — "Lead it home without losing it."
// A pavement at dusk: houses along the skyline, a lamp post or two, home waiting with its
// light on. The bot waddles after your cursor, slowly; move too fast and it loses track,
// stops, and looks around nervously until you slow down. Walk it home and it hops inside.
import { createBot, shadow, heading, winBeat, mix, shade, tint, animate, EASE } from './_bot.js';

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const sky = mix('#1B2230', '#2F4F46', 0.45);
  const pavement = tint('#6B6A66', 0.3);
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const glowGrad = kit.svg('radialGradient', { id: 'lead-glow' }, [
    kit.svg('stop', { offset: '0%', 'stop-color': '#F2D98A', 'stop-opacity': 0.65 }),
    kit.svg('stop', { offset: '55%', 'stop-color': '#F2D98A', 'stop-opacity': 0.22 }),
    kit.svg('stop', { offset: '100%', 'stop-color': '#F2D98A', 'stop-opacity': 0 }),
  ]);
  svg.append(kit.svg('defs', {}, [glowGrad]));
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 640, fill: sky }));
  svg.append(kit.svg('rect', { x: 0, y: 640, width: 1000, height: 360, fill: pavement }));
  svg.append(kit.svg('rect', { x: 0, y: 632, width: 1000, height: 10, fill: shade(pavement, 0.18) }));
  for (let x = 40; x < 1000; x += 120) svg.append(kit.svg('line', { x1: x, y1: 650, x2: x - 26, y2: 1000, stroke: shade(pavement, 0.1), 'stroke-width': 3, opacity: 0.5 }));

  // a dusky skyline of houses
  const houseColor = shade(sky, 0.1);
  function house(x, w, h, roof) {
    const g = kit.svg('g', {});
    g.append(kit.svg('rect', { x, y: 640 - h, width: w, height: h, fill: houseColor }));
    g.append(kit.svg('path', { d: `M ${x - 8} ${640 - h} L ${x + w / 2} ${640 - h - roof} L ${x + w + 8} ${640 - h} Z`, fill: shade(houseColor, 0.15) }));
    if (Math.random() > 0.3) g.append(kit.svg('rect', { x: x + w * 0.3, y: 640 - h * 0.6, width: w * 0.22, height: h * 0.2, fill: '#F2D98A', opacity: 0.8 }));
    svg.append(g);
  }
  house(20, 150, 150, 50); house(190, 110, 110, 40); house(690, 130, 170, 55);

  function lamp(x) {
    const g = kit.svg('g', { transform: `translate(${x} 640)` });
    g.append(kit.svg('circle', { cx: 0, cy: -214, r: 70, fill: 'url(#lead-glow)' }));
    g.append(kit.svg('rect', { x: -5, y: -210, width: 10, height: 210, fill: shade(houseColor, 0.2) }));
    g.append(kit.svg('path', { d: 'M -18 -210 L 18 -210 L 10 -230 L -10 -230 Z', fill: shade(houseColor, 0.2) }));
    g.append(kit.svg('circle', { cx: 0, cy: -212, r: 10, fill: '#F2D98A' }));
    svg.append(g);
  }
  lamp(430); lamp(590);

  const start = { x: 130, y: 760 };
  const door = { x: 860, y: 660 };
  const doorG = kit.svg('g', { transform: `translate(${door.x} ${door.y})` });
  doorG.append(kit.svg('rect', { x: -70, y: -210, width: 140, height: 210, rx: 8, fill: shade(houseColor, 0.12) }));
  const doorGap = kit.svg('rect', { x: -44, y: -192, width: 88, height: 192, fill: '#F2D98A', opacity: 0.85 });
  doorG.append(doorGap);
  doorG.append(kit.svg('circle', { cx: 0, cy: -300, r: 130, fill: 'url(#lead-glow)' }));
  svg.append(doorG);
  shadow(kit, { cx: door.x, cy: door.y + 6, rx: 70, ry: 14, parent: svg });

  const k = 1.0;
  const bot = createBot(kit, { cx: start.x, cy: start.y, r: 118, bg: card, shadow: true });
  const limbs = bot.addLimbs({ arms: false, feet: true });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2200, max: 3800 });

  const head = heading(kit, { parent: kit.stage, line: 'lead it home.', hint: 'move slowly. it will follow.', color: '#F7F5F1', hintColor: '#B9C6D2' });
  let hintHidden = false;

  let cursor = { x: start.x, y: start.y };
  let lastCursor = null, lastAt = performance.now(), lostUntil = 0;
  const MAX_SPEED = 0.85, FOLLOW = 0.0032;

  kit.on(kit.stage, 'pointermove', (e) => {
    const p = kit.point(e);
    if (!hintHidden) { hintHidden = true; head.hide(); }
    cursor = { x: p.x * 1000, y: p.y * 1000 };
    const now = performance.now();
    if (lastCursor) {
      const dt = Math.max(1, now - lastAt);
      const dist = Math.hypot(cursor.x - lastCursor.x, cursor.y - lastCursor.y) / 1000;
      const speed = dist / (dt / 1000);
      if (speed > MAX_SPEED && now > lostUntil) {
        lostUntil = now + 900;
        kit.status('too fast — lost. slow down.');
        bot.squash(kit, { amount: 0.16, duration: 160 });
      }
    }
    lastCursor = cursor; lastAt = now;
  }, { passive: true });

  let dwell = 0, walkPhase = 0, wonAlready = false;
  const totalDist = Math.hypot(start.x - door.x, start.y - door.y);

  kit.loop((dt) => {
    if (wonAlready) return false;
    const now = performance.now();
    const lost = now < lostUntil;
    if (!lost) {
      bot.moveTo(bot.cx + (cursor.x - bot.cx) * Math.min(0.08, FOLLOW * dt), bot.cy + (cursor.y - bot.cy) * Math.min(0.08, FOLLOW * dt));
      walkPhase += dt / 240;
      limbs.step(walkPhase % 1);
      bot.tilt(Math.sin(walkPhase) * 3);
      bot.look(Math.sin(performance.now() / 1200) * 3, -2);
      bot.height(1);
    } else {
      bot.tilt(0);
      bot.look(Math.sin(now / 160) * 16, -4);
      bot.height(1.15, 0.08);
    }
    const toDoor = Math.hypot(bot.cx - door.x, bot.cy - door.y);
    const nearDoor = toDoor < 150;
    dwell = nearDoor && !lost ? dwell + dt : 0;
    kit.status(nearDoor ? 'at the door…' : `${Math.round(Math.max(0, (1 - toDoor / totalDist)) * 100)}% home`);
    if (dwell > 450) { finish(); return false; }
  });

  function finish() {
    wonAlready = true;
    kit.status('home.');
    bot.walkTo(kit, door.x, door.y - 10, 260, () => {
      bot.look(0, -4);
      animate(kit, 360, EASE.outCubic, (p) => {
        bot.group.setAttribute('opacity', 1 - p);
        bot.moveTo(door.x, door.y - 10 - p * 30);
      }, () => {
        bot.group.setAttribute('opacity', 0);
        doorGap.setAttribute('opacity', 1);
        kit.after(250, () => winBeat(kit, svg, 'home. led it there yourself.'));
      });
    });
  }
}

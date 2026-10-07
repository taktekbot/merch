// B06 bot bottle — "Hydrate the bot."
// A sunny garden: a drooping potted plant waits in the corner, a full glass sits by the
// path. The bot wanders the lawn; flick water at it (tap near it) and a drop arcs over from
// the glass — it gulps, a shade greener each time. Hydrated, it toddles over to the plant
// and waters it itself, and the plant perks up.
import { createBot, room, shadow, heading, winBeat, mix, shade, tint, animate, EASE } from './_bot.js';

export default function mount(kit) {
  const needed = (kit.options && kit.options.drops) || 8;
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const green = (kit.colors && kit.colors.accent) || '#00A862';
  const dry = mix(green, '#8FA6B8', 0.55);
  const grass = tint('#2F4F46', 0.52);

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#CFE3EE', floor: grass, floorY: 660 });
  for (let i = 0; i < 18; i++) {
    const x = 10 + i * 56 + (i % 3) * 8;
    svg.append(kit.svg('path', { d: `M ${x} 662 Q ${x + 6} 640 ${x + 2} 618`, fill: 'none', stroke: shade(grass, 0.18), 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.55 }));
  }
  const sun = kit.svg('g', { transform: 'translate(840 140)' });
  sun.append(kit.svg('circle', { cx: 0, cy: 0, r: 58, fill: '#F2D98A' }));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    sun.append(kit.svg('line', { x1: Math.cos(a) * 72, y1: Math.sin(a) * 72, x2: Math.cos(a) * 94, y2: Math.sin(a) * 94, stroke: '#F2D98A', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.7 }));
  }
  svg.append(sun);

  // a drooping potted plant, bottom-left — perks up when the bot waters it itself
  const potX = 130, potY = 760;
  const potG = kit.svg('g', { transform: `translate(${potX} ${potY})` });
  shadow(kit, { cx: 0, cy: 34, rx: 44, ry: 9, parent: potG });
  potG.append(kit.svg('path', { d: 'M -34 0 L 34 0 L 26 50 L -26 50 Z', fill: '#C9764F' }));
  potG.append(kit.svg('rect', { x: -38, y: -10, width: 76, height: 14, rx: 4, fill: shade('#C9764F', 0.12) }));
  const leafColor = '#2F4F46';
  const mkLeaf = (d) => kit.svg('path', { d, fill: 'none', stroke: leafColor, 'stroke-width': 11, 'stroke-linecap': 'round' });
  const leafA = mkLeaf('M 0 0 Q -30 10 -46 36');
  const leafB = mkLeaf('M 0 0 Q -4 16 -8 46');
  const leafC = mkLeaf('M 0 0 Q 26 14 34 40');
  potG.append(leafA, leafB, leafC);
  svg.append(potG);
  function perk(p) {
    const rot = -46 * p;
    leafA.setAttribute('transform', `translate(0 -8) rotate(${rot + 6})`);
    leafB.setAttribute('transform', `translate(0 -8) rotate(${rot})`);
    leafC.setAttribute('transform', `translate(0 -8) rotate(${rot - 10})`);
    [leafA, leafB, leafC].forEach((l) => l.setAttribute('stroke', mix(leafColor, green, p * 0.3)));
  }
  perk(0);

  // the glass, bottom right, full — its level drops a little with each flick
  const glassX = 860, glassY = 800;
  const glassG = kit.svg('g', { transform: `translate(${glassX} ${glassY})` });
  shadow(kit, { cx: 0, cy: 46, rx: 40, ry: 9, parent: glassG });
  const glassClip = `hy-clip-${Math.random().toString(36).slice(2, 7)}`;
  glassG.append(kit.svg('clipPath', { id: glassClip }, [kit.svg('path', { d: 'M -34 -56 L 34 -56 L 26 46 L -26 46 Z' })]));
  const water = kit.svg('rect', { x: -40, y: -56, width: 80, height: 110, fill: '#8FA6B8', opacity: 0.85, 'clip-path': `url(#${glassClip})` });
  glassG.append(water);
  glassG.append(kit.svg('path', { d: 'M -34 -56 L 34 -56 L 26 46 L -26 46 Z', fill: 'none', stroke: shade('#F7F5F1', 0.1), 'stroke-width': 6, opacity: 0.85 }));
  svg.append(glassG);

  const head = heading(kit, { parent: kit.stage, line: 'hydrate the bot.', hint: 'tap near it to flick a drop.' });
  let hintHidden = false;

  let target = { x: 500, y: 460 };
  const pickTarget = () => { target = { x: 240 + Math.random() * 520, y: 300 + Math.random() * 300 }; };
  pickTarget();
  kit.every(2600, pickTarget);

  const bot = createBot(kit, { cx: 500, cy: 460, r: 120, bg: card, color: dry, shadow: true });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2400, max: 4200 });

  let drops = 0, wonAlready = false;
  const RADIUS = 190;

  function arcDrop(fromX, fromY, toX, toY, onDone) {
    const dot = kit.svg('circle', { cx: fromX, cy: fromY, r: 11, fill: '#8FA6B8' });
    svg.append(dot);
    animate(kit, 260, EASE.outCubic, (p) => {
      const x = fromX + (toX - fromX) * p;
      const y = fromY + (toY - fromY) * p - Math.sin(p * Math.PI) * 70;
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      dot.setAttribute('opacity', 1 - p * 0.15);
    }, () => { dot.remove(); if (onDone) onDone(); });
  }
  function splash(x, y, color) {
    const ring = kit.svg('circle', { cx: x, cy: y, r: 8, fill: color, opacity: 0.8 });
    svg.append(ring);
    animate(kit, 360, EASE.outCubic, (p) => {
      ring.setAttribute('r', 8 + p * 32);
      ring.setAttribute('opacity', 0.8 * (1 - p));
    }, () => ring.remove());
  }

  kit.on(kit.stage, 'pointerdown', (e) => {
    if (wonAlready) return;
    if (!hintHidden) { hintHidden = true; head.hide(); }
    const p = kit.point(e);
    const x = p.x * 1000, y = p.y * 1000;
    const hit = Math.hypot(x - bot.cx, y - bot.cy) <= RADIUS;
    if (!hit) { splash(x, y, '#8FA6B8'); return; }
    drops = Math.min(needed, drops + 1);
    water.setAttribute('y', -56 + 77 * Math.min(1, drops / needed));
    arcDrop(glassX, glassY - 40, bot.cx, bot.cy - bot.r * 0.5, () => {
      splash(bot.cx, bot.cy - bot.r * 0.5, green);
      bot.squash(kit, { amount: 0.22, duration: 200 });
      bot.body.setAttribute('fill', mix(dry, green, drops / needed));
    });
    kit.status(`${drops}/${needed}`);
    if (drops >= needed) finish();
  });

  let walkPhase = 0;
  kit.loop((dt) => {
    if (wonAlready) return false;
    bot.moveTo(bot.cx + (target.x - bot.cx) * Math.min(1, dt / 900), bot.cy + (target.y - bot.cy) * Math.min(1, dt / 900));
    walkPhase += dt / 1200;
    bot.tilt(Math.sin(walkPhase) * 2.4);
    bot.look(Math.sin(performance.now() / 1300) * 4, Math.cos(performance.now() / 1700) * 3);
  });
  kit.status(`0/${needed}`);

  function finish() {
    wonAlready = true;
    kit.status(`${needed}/${needed}`);
    bot.look(0, 0);
    bot.walkTo(kit, potX + 70, potY - 10, 700, () => {
      bot.tilt(10);
      bot.squash(kit, { amount: 0.18, duration: 220 });
      arcDrop(bot.cx, bot.cy - 30, potX, potY - 30, () => {
        animate(kit, 700, EASE.outBack, (p) => perk(p));
      });
      kit.after(900, () => winBeat(kit, svg, 'hydrated. for now.'));
    });
  }
}

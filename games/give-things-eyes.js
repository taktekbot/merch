// B07 stick-on eyes — "Give things eyes."
// A proper kitchen: a tiled wall, a window with a view, a tall fridge with a handle and
// magnets, a toaster with slots and a lever, a kettle on the counter, a mug and a plant.
// Click three things (fridge, toaster, kettle) to stick real googly eyes on them — each
// pair pops open and wobbles awake.
import { room, sceneWindow, shadow, heading, winBeat, shade, tint } from './_bot.js';

export default function mount(kit) {
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const needed = 3;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const wall = '#E8DFCF', counter = '#C9764F';
  room(kit, { parent: svg, wall, floor: counter, floorY: 660 });
  // quiet tile grid on the wall
  const tileG = kit.svg('g', { opacity: 0.35 });
  for (let x = 40; x < 1000; x += 92) tileG.append(kit.svg('line', { x1: x, y1: 0, x2: x, y2: 660, stroke: shade(wall, 0.1), 'stroke-width': 2 }));
  for (let y = 60; y < 660; y += 92) tileG.append(kit.svg('line', { x1: 0, y1: y, x2: 1000, y2: y, stroke: shade(wall, 0.1), 'stroke-width': 2 }));
  svg.append(tileG);
  sceneWindow(kit, { parent: svg, x: 60, y: 70, w: 200, h: 190, sky: 'day', curtains: false });
  // cabinet front under the counter lip
  svg.append(kit.svg('rect', { x: 0, y: 670, width: 1000, height: 10, fill: shade(counter, 0.2) }));
  svg.append(kit.svg('rect', { x: 0, y: 680, width: 1000, height: 320, fill: shade('#E8DFCF', 0.3) }));
  for (let x = 60; x < 1000; x += 170) svg.append(kit.svg('line', { x1: x, y1: 690, x2: x, y2: 990, stroke: shade('#E8DFCF', 0.4), 'stroke-width': 3, opacity: 0.5 }));

  const found = new Set();
  const head = heading(kit, { parent: kit.stage, line: 'give things eyes.', hint: 'click three things on the counter.' });

  // ---- fridge (floor-standing, tall) ----
  const fridgeG = kit.svg('g', { transform: 'translate(96 206)', style: { cursor: 'pointer' } });
  shadow(kit, { cx: 95, cy: 466, rx: 100, ry: 16, parent: fridgeG });
  fridgeG.append(kit.svg('rect', { x: 0, y: 0, width: 190, height: 456, rx: 16, fill: '#F2D98A' }));
  fridgeG.append(kit.svg('rect', { x: 0, y: 0, width: 46, height: 456, rx: 16, fill: shade('#F2D98A', 0.14), opacity: 0.6 }));
  fridgeG.append(kit.svg('line', { x1: 0, y1: 150, x2: 190, y2: 150, stroke: shade('#F2D98A', 0.2), 'stroke-width': 5 }));
  fridgeG.append(kit.svg('rect', { x: 166, y: 24, width: 14, height: 90, rx: 7, fill: shade('#F2D98A', 0.3) }));
  fridgeG.append(kit.svg('rect', { x: 166, y: 182, width: 14, height: 140, rx: 7, fill: shade('#F2D98A', 0.3) }));
  fridgeG.append(kit.svg('circle', { cx: 60, cy: 250, r: 13, fill: '#8FA6B8', opacity: 0.85 }));
  fridgeG.append(kit.svg('circle', { cx: 100, cy: 300, r: 10, fill: '#C9764F', opacity: 0.85 }));
  svg.append(fridgeG);

  // ---- toaster (on the counter) ----
  const toasterG = kit.svg('g', { transform: 'translate(410 560)', style: { cursor: 'pointer' } });
  shadow(kit, { cx: 85, cy: 118, rx: 95, ry: 14, parent: toasterG });
  toasterG.append(kit.svg('rect', { x: 0, y: 20, width: 170, height: 100, rx: 22, fill: '#8FA6B8' }));
  toasterG.append(kit.svg('rect', { x: 0, y: 20, width: 170, height: 28, rx: 14, fill: shade('#8FA6B8', 0.16) }));
  toasterG.append(kit.svg('rect', { x: 26, y: 0, width: 36, height: 24, rx: 8, fill: shade('#8FA6B8', 0.24) }));
  toasterG.append(kit.svg('rect', { x: 108, y: 0, width: 36, height: 24, rx: 8, fill: shade('#8FA6B8', 0.24) }));
  toasterG.append(kit.svg('rect', { x: 166, y: 46, width: 14, height: 36, rx: 6, fill: shade('#8FA6B8', 0.3) }));
  svg.append(toasterG);

  // ---- kettle (on the counter) ----
  const kettleG = kit.svg('g', { transform: 'translate(660 540)', style: { cursor: 'pointer' } });
  shadow(kit, { cx: 70, cy: 150, rx: 90, ry: 14, parent: kettleG });
  kettleG.append(kit.svg('path', { d: 'M 0 60 Q 0 140 70 140 Q 140 140 140 60 Q 140 10 70 10 Q 0 10 0 60 Z', fill: '#2F4F46' }));
  kettleG.append(kit.svg('path', { d: 'M 0 60 Q 0 120 50 136 Q 10 110 10 60 Z', fill: tint('#2F4F46', 0.18), opacity: 0.6 }));
  kettleG.append(kit.svg('path', { d: 'M 24 -2 Q 70 -30 116 -2', fill: 'none', stroke: shade('#2F4F46', 0.1), 'stroke-width': 13, 'stroke-linecap': 'round' }));
  kettleG.append(kit.svg('circle', { cx: 70, cy: 2, r: 9, fill: shade('#2F4F46', 0.14) }));
  kettleG.append(kit.svg('path', { d: 'M 126 50 Q 180 30 184 -6', fill: 'none', stroke: '#C9764F', 'stroke-width': 15, 'stroke-linecap': 'round' }));
  svg.append(kettleG);

  // ---- mug + plant (decorative, not clickable) ----
  const mugG = kit.svg('g', { transform: 'translate(850 598)' });
  shadow(kit, { cx: 36, cy: 98, rx: 50, ry: 10, parent: mugG });
  mugG.append(kit.svg('rect', { x: 0, y: 20, width: 72, height: 76, rx: 10, fill: '#F7F5F1', stroke: shade('#F7F5F1', 0.12), 'stroke-width': 5 }));
  mugG.append(kit.svg('path', { d: 'M 72 36 h16 a20 20 0 0 1 0 44 h-16', fill: 'none', stroke: shade('#F7F5F1', 0.12), 'stroke-width': 6 }));
  svg.append(mugG);

  const plantG = kit.svg('g', { transform: 'translate(260 560)' });
  shadow(kit, { cx: 0, cy: 100, rx: 46, ry: 10, parent: plantG });
  plantG.append(kit.svg('path', { d: 'M -34 100 L 34 100 L 26 48 L -26 48 Z', fill: '#C9764F' }));
  plantG.append(kit.svg('path', { d: 'M 0 48 Q -46 10 -16 -40', fill: 'none', stroke: '#2F4F46', 'stroke-width': 11, 'stroke-linecap': 'round' }));
  plantG.append(kit.svg('path', { d: 'M 0 48 Q 10 -4 0 -52', fill: 'none', stroke: '#2F4F46', 'stroke-width': 11, 'stroke-linecap': 'round' }));
  plantG.append(kit.svg('path', { d: 'M 0 48 Q 44 20 26 -30', fill: 'none', stroke: '#2F4F46', 'stroke-width': 11, 'stroke-linecap': 'round' }));
  svg.append(plantG);

  const objects = [
    { id: 'fridge', group: fridgeG, ex1: 55, ex2: 115, ey: 90 },
    { id: 'toaster', group: toasterG, ex1: 50, ex2: 118, ey: 46 },
    { id: 'kettle', group: kettleG, ex1: 44, ex2: 96, ey: 54 },
  ];

  const wobblers = [];
  function stickEyes(o) {
    const g = kit.svg('g', {});
    o.group.append(g);
    const mk = (ex) => {
      const holder = kit.svg('g', { transform: `translate(${ex} ${o.ey}) scale(0.1)` });
      holder.append(kit.svg('circle', { cx: 0, cy: 0, r: 17, fill: '#F7F5F1', stroke: ink, 'stroke-width': 3 }));
      const pupil = kit.svg('circle', { cx: 0, cy: 0, r: 8, fill: ink });
      holder.append(pupil);
      g.append(holder);
      return { holder, pupil };
    };
    const eyes = [mk(o.ex1), mk(o.ex2)];
    let t = 0;
    const stop = kit.loop((dt) => {
      t += dt;
      const p = Math.min(1, t / 260);
      const s = p < 1 ? 1.25 - Math.cos(p * Math.PI) * 0.25 : 1;
      eyes.forEach((e) => e.holder.setAttribute('transform', `translate(${e === eyes[0] ? o.ex1 : o.ex2} ${o.ey}) scale(${Math.min(1.08, 0.1 + 1.1 * p)})`));
      if (p >= 1) stop();
    });
    wobblers.push(eyes);
  }

  // continuous googly wobble, independent per pair
  kit.loop((dt, t) => {
    wobblers.forEach((eyes, i) => {
      eyes.forEach((e, j) => {
        const a = t / (500 + i * 70 + j * 40);
        e.pupil.setAttribute('cx', Math.sin(a) * 4.5);
        e.pupil.setAttribute('cy', Math.cos(a * 1.3) * 3);
      });
    });
  });

  function markFound(o) {
    if (found.has(o.id) || kit.won) return;
    found.add(o.id);
    head.hide();
    stickEyes(o);
    kit.status(`${found.size}/${needed}`);
    if (found.size >= needed) {
      kit.after(300, () => winBeat(kit, svg, 'everything is looking at you now.'));
    }
  }

  for (const o of objects) kit.on(o.group, 'pointerdown', () => markFound(o));
  kit.status(`0/${needed}`);
}

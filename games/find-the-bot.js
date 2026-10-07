// B12 — desk mat, "2,000 dots, one has eyes." Unlock: find the one that blinks, in a 20x20
// patch of the actual mat on a desk (wood grain, a keyboard edge, a mug). Click it and it
// pops up off the mat as the bot itself.
import { createBot, shadow, heading, winBeat, shade, tint } from './_bot.js';

const COLS = 20, ROWS = 20;

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';
  const wood = '#C9764F', matColor = tint('#6B6A66', 0.42), dot = shade(matColor, 0.22);

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  // the desk: wood, with grain lines
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: wood }));
  for (let y = 40; y < 1000; y += 64) svg.append(kit.svg('line', { x1: 0, y1: y, x2: 1000, y2: y + 8, stroke: shade(wood, 0.1), 'stroke-width': 2, opacity: 0.4 }));

  // a keyboard, just at the edge of frame
  const kbX = 760;
  svg.append(kit.svg('rect', { x: kbX, y: -20, width: 280, height: 190, rx: 16, fill: '#2F4F46' }));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    svg.append(kit.svg('rect', { x: kbX + 20 + c * 42, y: 10 + r * 40, width: 32, height: 28, rx: 5, fill: tint('#2F4F46', 0.18) }));
  }

  // a mug, in the wood margin left of the mat
  const mugX = 36, mugY = 460;
  shadow(kit, { cx: mugX + 40, cy: mugY + 92, rx: 56, ry: 12, parent: svg });
  svg.append(kit.svg('rect', { x: mugX, y: mugY, width: 84, height: 86, rx: 12, fill: '#F7F5F1' }));
  svg.append(kit.svg('rect', { x: mugX, y: mugY, width: 26, height: 86, rx: 12, fill: shade('#F7F5F1', 0.08), opacity: 0.6 }));
  svg.append(kit.svg('path', { d: `M ${mugX + 84} ${mugY + 16} h18 a22 22 0 0 1 0 50 h-18`, fill: 'none', stroke: shade('#F7F5F1', 0.1), 'stroke-width': 7 }));

  // the mat itself
  const PAD = 56;
  const matX = 150, matY = 170, matW = 760, matH = 800;
  shadow(kit, { cx: matX + matW / 2, cy: matY + matH + 4, rx: matW * 0.48, ry: 16, parent: svg, opacity: 0.16 });
  svg.append(kit.svg('rect', { x: matX, y: matY, width: matW, height: matH, rx: 22, fill: matColor }));
  svg.append(kit.svg('rect', { x: matX, y: matY, width: matW, height: matH, rx: 22, fill: 'none', stroke: shade(matColor, 0.12), 'stroke-width': 4, opacity: 0.6 }));

  const gridX = matX + PAD, gridY = matY + PAD, gridW = matW - PAD * 2, gridH = matH - PAD * 2;
  const cell = gridW / COLS;
  const specialCol = 2 + Math.floor(Math.random() * (COLS - 4));
  const specialRow = 2 + Math.floor(Math.random() * (ROWS - 4));
  let dots = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = gridX + cell * c + cell / 2;
      const cy = gridY + cell * r + cell / 2;
      const isSpecial = c === specialCol && r === specialRow;
      const hit = kit.svg('rect', { x: gridX + cell * c, y: gridY + cell * r, width: cell, height: cell, fill: 'transparent' });
      const dotEl = kit.svg('ellipse', { cx, cy, rx: cell * 0.17, ry: cell * 0.17, fill: dot });
      if (isSpecial) hit.setAttribute('data-hit', '1');
      hit.style.cursor = 'pointer';
      hit.onclick = () => click(isSpecial, dotEl, cx, cy);
      svg.append(hit, dotEl);
      dots.push({ dot: dotEl, isSpecial, cell, cx, cy });
    }
  }

  const special = dots.find((d) => d.isSpecial);
  const head = heading(kit, { parent: kit.stage, line: 'find the bot.', hint: 'one dot blinks. watch closely.' });
  let won = false;

  function blink() {
    if (won || kit.reducedMotion) return scheduleNext();
    special.dot.setAttribute('ry', 2);
    kit.after(220, () => { if (!won) special.dot.setAttribute('ry', special.cell * 0.17); scheduleNext(); });
  }
  function scheduleNext() { kit.after(2200 + Math.random() * 2600, blink); }
  kit.after(1800, blink);

  function click(isSpecial, dotEl, cx, cy) {
    if (won) return;
    if (isSpecial) {
      won = true;
      head.hide();
      dotEl.remove();
      const baseR = 6, targetR = 70;
      const bot = createBot(kit, { cx, cy, r: baseR, bg: matColor, shadow: false });
      svg.append(bot.group);
      kit.status('found.');
      let t = 0;
      const stop = kit.loop((dt) => {
        t += dt;
        const p = Math.min(1, t / 420);
        const ease = 1 - (1 - p) ** 3;
        const scale = 1 + (targetR / baseR - 1) * ease;
        bot.group.setAttribute('transform', `translate(${cx} ${cy - ease * 46}) scale(${scale})`);
        if (p >= 1) { stop(); bot.bounce(kit, { height: 20 }); }
      });
      kit.after(650, () => winBeat(kit, svg, 'found you.'));
    } else {
      const prev = dotEl.getAttribute('fill');
      dotEl.setAttribute('fill', '#C9764F');
      kit.after(160, () => dotEl.setAttribute('fill', prev));
    }
  }
  kit.status('0 found');
}

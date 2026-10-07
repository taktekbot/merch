// B12 — desk mat, "2,000 dots, one has eyes." Unlock: find the one that blinks, in a
// 20x20 patch, and click it.
const COLS = 20, ROWS = 20, PAD = 40;

export default function mount(kit) {
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const cell = (1000 - PAD * 2) / COLS;
  const specialCol = 2 + Math.floor(Math.random() * (COLS - 4));
  const specialRow = 2 + Math.floor(Math.random() * (ROWS - 4));
  let dots = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = PAD + cell * c + cell / 2;
      const cy = PAD + cell * r + cell / 2;
      const isSpecial = c === specialCol && r === specialRow;
      const hit = kit.svg('rect', { x: PAD + cell * c, y: PAD + cell * r, width: cell, height: cell, fill: 'transparent' });
      const dot = kit.svg('ellipse', { cx, cy, rx: cell * 0.17, ry: cell * 0.17, fill: muted });
      if (isSpecial) hit.setAttribute('data-hit', '1');
      hit.style.cursor = 'pointer';
      hit.onclick = () => click(isSpecial, dot);
      svg.append(hit, dot);
      dots.push({ dot, isSpecial, cell });
    }
  }

  const special = dots.find((d) => d.isSpecial);
  let blinking = false, misses = 0, won = false;

  function blink() {
    if (won || kit.reducedMotion) return scheduleNext();
    blinking = true;
    special.dot.setAttribute('ry', 2);
    kit.after(220, () => { if (!won) special.dot.setAttribute('ry', special.cell * 0.17); blinking = false; scheduleNext(); });
  }
  function scheduleNext() { kit.after(2200 + Math.random() * 2600, blink); }
  kit.after(1800, blink);

  kit.after(14000, () => { if (!won) kit.status('it blinks every few seconds — watch closely.'); });

  function click(isSpecial, dot) {
    if (won) return;
    if (isSpecial) {
      won = true;
      dot.setAttribute('fill', accent);
      dot.setAttribute('rx', special.cell * 0.22);
      dot.setAttribute('ry', special.cell * 0.22);
      kit.status('found.');
      kit.win('found you.');
    } else {
      misses++;
      const prev = dot.getAttribute('fill');
      dot.setAttribute('fill', '#C9764F');
      kit.after(160, () => dot.setAttribute('fill', prev));
      if (misses === 1) kit.status('not that one.');
    }
  }
}

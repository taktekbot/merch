// B11 — luggage tag, "curious, not very independent. if found, please call."
// An airport concourse: a split-flap departure board, a hanging gate sign, travellers
// drifting past, a moving walkway underfoot. Follow the sign's arrow before the gate
// closes; arrive in time and the bot is waiting on a bench at gate 12, swinging its feet.
import { createBot, shadow, heading, winBeat, shade, tint, mix } from './_bot.js';

const DIRS = ['up', 'down', 'left', 'right'];
const ARROW = { up: '↑', down: '↓', left: '←', right: '→' };
const TOTAL_SIGNS = 5;
const TOTAL_MS = 26000;

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';
  const floor = tint('#6B6A66', 0.42), wall = tint('#6B6A66', 0.7);

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 640, fill: wall }));
  svg.append(kit.svg('rect', { x: 0, y: 640, width: 1000, height: 360, fill: floor }));
  // perspective floor lines toward a vanishing point, suggesting the concourse
  for (const fx of [40, 230, 500, 770, 960]) {
    svg.append(kit.svg('line', { x1: fx, y1: 1000, x2: 500 + (fx - 500) * 0.12, y2: 640, stroke: shade(floor, 0.14), 'stroke-width': 3, opacity: 0.4 }));
  }
  // the moving walkway along the bottom
  const walk = kit.svg('g', {});
  svg.append(walk);
  function drawWalkway(offset) {
    walk.replaceChildren();
    for (let x = -60; x < 1060; x += 70) {
      walk.append(kit.svg('path', { d: `M ${x + offset} 980 L ${x + 30 + offset} 980 L ${x + 10 + offset} 1000 L ${x - 20 + offset} 1000 Z`, fill: shade(floor, 0.1), opacity: 0.5 }));
    }
  }
  drawWalkway(0);
  kit.loop((dt) => { drawWalkway.offset = ((drawWalkway.offset || 0) + dt * 0.03) % 70; drawWalkway(drawWalkway.offset); });

  // departure board, top-left — a few rows of split-flap cells, one flips now and then
  const boardX = 60, boardY = 210, cols = 6, rows = 3, cellW = 30, cellH = 34, gap = 6;
  svg.append(kit.svg('rect', { x: boardX - 14, y: boardY - 14, width: cols * (cellW + gap) + 14, height: rows * (cellH + gap) + 14, rx: 8, fill: ink }));
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cell = kit.svg('rect', { x: boardX + c * (cellW + gap), y: boardY + r * (cellH + gap), width: cellW, height: cellH, rx: 3, fill: '#F2D98A', opacity: 0.5 + Math.random() * 0.4 });
    cells.push(cell); svg.append(cell);
  }
  kit.every(900, () => { const c = cells[Math.floor(Math.random() * cells.length)]; c.setAttribute('opacity', 0.3); kit.after(140, () => c.setAttribute('opacity', 0.5 + Math.random() * 0.4)); });

  // two travellers drifting through, background silhouettes
  function traveller(x, s, dur) {
    const g = kit.svg('g', { transform: `translate(${x} 600) scale(${s})` });
    g.append(kit.svg('circle', { cx: 0, cy: -58, r: 16, fill: ink, opacity: 0.22 }));
    g.append(kit.svg('path', { d: 'M -22 -40 Q 0 -54 22 -40 L 16 10 L -16 10 Z', fill: ink, opacity: 0.22 }));
    svg.append(g);
    let t = Math.random() * dur;
    kit.loop((dt) => {
      t = (t + dt) % dur;
      const p = t / dur;
      g.setAttribute('transform', `translate(${x + p * 420} 600) scale(${s})`);
    });
  }
  traveller(40, 0.9, 9000); traveller(140, 0.65, 13000);

  // the hanging gate sign — cables from the ceiling, the arrow the player follows
  const signX = 640, signY = 230, signW = 300, signH = 150;
  svg.append(kit.svg('line', { x1: signX + 40, y1: 0, x2: signX + 40, y2: signY, stroke: ink, 'stroke-width': 4, opacity: 0.5 }));
  svg.append(kit.svg('line', { x1: signX + signW - 40, y1: 0, x2: signX + signW - 40, y2: signY, stroke: ink, 'stroke-width': 4, opacity: 0.5 }));
  shadow(kit, { cx: signX + signW / 2, cy: signY + signH + 10, rx: signW * 0.4, ry: 10, parent: svg, opacity: 0.08 });
  const signFrame = kit.svg('rect', { x: signX, y: signY, width: signW, height: signH, rx: 14, fill: ink });
  svg.append(signFrame);
  const signTitle = kit.svg('text', { x: signX + signW / 2, y: signY + 42, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 22, fill: '#F2D98A', text: 'GATE 12' });
  const arrow = kit.svg('text', { x: signX + signW / 2, y: signY + 118, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 700, 'font-size': 76, fill: '#F2D98A', text: '↑' });
  svg.append(signTitle, arrow);

  // the gate 12 bench, waiting for the win beat
  const benchX = 110, benchY = 760;
  shadow(kit, { cx: benchX + 70, cy: benchY + 44, rx: 90, ry: 12, parent: svg });
  const benchG = kit.svg('g', {});
  benchG.append(kit.svg('rect', { x: benchX, y: benchY, width: 190, height: 16, rx: 6, fill: shade(floor, 0.3) }));
  benchG.append(kit.svg('rect', { x: benchX + 10, y: benchY + 30, width: 10, height: 30, fill: shade(floor, 0.3) }));
  benchG.append(kit.svg('rect', { x: benchX + 170, y: benchY + 30, width: 10, height: 30, fill: shade(floor, 0.3) }));
  svg.append(benchG);

  const head = heading(kit, { parent: kit.stage, line: 'collect it at gate 12.', hint: 'follow the sign before the gate closes.' });

  const pad = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '6%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } });
  const btn = (dir, glyph) => {
    const b = kit.el('button', { class: 'g-btn', text: glyph, 'data-dir': dir, style: { width: '58px', height: '58px', padding: '0', fontSize: '22px' } });
    b.onclick = () => tryDir(dir);
    return b;
  };
  pad.append(
    kit.el('div', {}, [btn('up', '↑')]),
    kit.el('div', { style: { display: 'flex', gap: '10px' } }, [btn('left', '←'), btn('down', '↓'), btn('right', '→')]),
  );
  kit.stage.append(pad);

  let signsDone = 0, need = pick(), startedAt = kit.now().getTime(), finished = false;
  kit.stage.dataset.need = need;
  showSign();

  function pick() { return DIRS[Math.floor(Math.random() * DIRS.length)]; }
  function showSign() { arrow.textContent = ARROW[need]; kit.status(`sign ${signsDone + 1}/${TOTAL_SIGNS}`); }

  function tryDir(dir) {
    if (finished) return;
    if (dir !== need) {
      kit.status(`sign ${signsDone + 1}/${TOTAL_SIGNS} · wrong way`);
      signFrame.setAttribute('fill', '#C9764F');
      kit.after(150, () => signFrame.setAttribute('fill', ink));
      return;
    }
    signsDone++;
    arrow.setAttribute('transform', 'scale(0.6)');
    kit.after(90, () => arrow.removeAttribute('transform'));
    if (signsDone >= TOTAL_SIGNS) { arrived(); return; }
    need = pick();
    kit.stage.dataset.need = need;
    showSign();
  }

  kit.on(window, 'keydown', (e) => {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) { e.preventDefault(); tryDir(map[e.key]); }
  });

  kit.loop(() => {
    if (finished) return false;
    const left = Math.max(0, TOTAL_MS - (kit.now().getTime() - startedAt));
    signFrame.setAttribute('stroke', left < 5000 ? accent : 'none');
    signFrame.setAttribute('stroke-width', left < 5000 ? 6 : 0);
    if (left <= 0) { closed(); return false; }
  });

  function closed() {
    if (finished) return;
    finished = true;
    arrow.textContent = '·';
    signTitle.textContent = 'CLOSED';
    kit.status('closed');
    head.hide();
    const msg = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', top: '58%', textAlign: 'center', margin: '0', color: muted }, text: "gate's closed. try again." });
    kit.stage.append(msg);
    const again = kit.el('button', { class: 'g-btn solid', text: 'run for it again', style: { position: 'absolute', left: '50%', top: '65%', transform: 'translateX(-50%)' } });
    again.onclick = () => location.reload();
    kit.stage.append(again);
    pad.remove();
  }

  function arrived() {
    finished = true;
    pad.remove();
    head.hide();
    kit.status(`${TOTAL_SIGNS}/${TOTAL_SIGNS}`);
    const bot = createBot(kit, { cx: benchX + 70, cy: benchY - 60, r: 90, bg: card, shadow: true });
    svg.append(bot.group);
    bot.autoBlink(kit, { min: 2000, max: 3600 });
    let phase = 0;
    kit.loop((dt) => { phase += dt / 260; bot.tilt(Math.sin(phase) * 3); bot.look(Math.sin(phase * 0.6) * 4, 0); });
    bot.bounce(kit, { height: 16 });
    kit.after(500, () => winBeat(kit, svg, 'right on time.'));
  }
}

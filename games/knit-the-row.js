// B15 — knitted cardigan, "rows of tiny faces, knitted." Unlock: tap in time to knit 36
// stitches on real needles with real yarn; a tiny bot face emerges every sixth stitch.
import { createBot, shadow, heading, shade, tint } from './_bot.js';
import { winBeat } from './_bot2.js';

const TOTAL = 36;
const FACE_EVERY = 6;
const PERIOD = 700; // ms per needle swing

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';
  const cream = '#F2E9D8';
  const forest = '#2F4F46';
  const needleColor = '#D9C9A3';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: cream }));

  // the growing swatch: a cream rounded panel the stitches sit on
  const cols = 6, rows = Math.ceil(TOTAL / cols);
  const cellW = 118, cellH = 92, startX = 500 - (cols * cellW) / 2 + cellW / 2, startY = 420;
  const panelH = rows * cellH + 70;
  shadow(kit, { cx: 500, cy: startY - cellH / 2 + panelH - 10, rx: 320, ry: 16, opacity: 0.08, parent: svg });
  svg.append(kit.svg('rect', { x: 500 - cols * cellW / 2 - 20, y: startY - cellH / 2 - 30, width: cols * cellW + 40, height: panelH, rx: 20, fill: '#F7F5F1' }));

  const pips = [];
  for (let i = 0; i < TOTAL; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const cx = startX + c * cellW, cy = startY + r * cellH;
    pips.push({ cx, cy });
  }

  const stitchLayer = kit.svg('g', {});
  svg.append(stitchLayer);

  // yarn ball + strand leading up to the working stitch
  const ballX = 150, ballY = 880;
  const ball = kit.svg('circle', { cx: ballX, cy: ballY, r: 54, fill: forest });
  const swirl1 = kit.svg('path', { d: `M ${ballX - 40} ${ballY} Q ${ballX} ${ballY - 54} ${ballX + 40} ${ballY}`, fill: 'none', stroke: tint(forest, 0.22), 'stroke-width': 4, opacity: 0.6 });
  const swirl2 = kit.svg('path', { d: `M ${ballX - 36} ${ballY + 18} Q ${ballX} ${ballY + 60} ${ballX + 36} ${ballY + 18}`, fill: 'none', stroke: tint(forest, 0.22), 'stroke-width': 4, opacity: 0.6 });
  const strand = kit.svg('path', { d: `M ${ballX + 30} ${ballY - 20} Q 300 700 ${startX} ${startY}`, fill: 'none', stroke: forest, 'stroke-width': 5, opacity: 0.7 });
  svg.append(ball, swirl1, swirl2, strand);

  // two crossed needles above the swatch; the working needle's tip is the timing lane
  const laneY = 210, laneX0 = 190, laneX1 = 810, zoneW = 90;
  const needleBack = kit.svg('line', { x1: laneX1 + 20, y1: laneY - 60, x2: laneX0 - 60, y2: laneY + 54, stroke: needleColor, 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.55 });
  const needleFront = kit.svg('line', { x1: laneX0 - 20, y1: laneY, x2: laneX1 + 40, y2: laneY, stroke: needleColor, 'stroke-width': 16, 'stroke-linecap': 'round' });
  const needleTip = kit.svg('circle', { cx: laneX1 + 40, cy: laneY, r: 6, fill: shade(needleColor, 0.2) });
  svg.append(needleBack, needleFront, needleTip);
  const zone = kit.svg('rect', { x: (laneX0 + laneX1) / 2 - zoneW / 2, y: laneY - 20, width: zoneW, height: 40, rx: 14, fill: accent, 'fill-opacity': 0.22 });
  const loop = kit.svg('circle', { cx: laneX0, cy: laneY, r: 14, fill: forest });
  const loopHi = kit.svg('circle', { cx: laneX0 - 4, cy: laneY - 4, r: 5, fill: tint(forest, 0.4), opacity: 0.8 });
  svg.append(zone, loop, loopHi);

  const head = heading(kit, { parent: kit.stage, line: 'knit the row.', hint: 'tap in time with the needle.' });
  let hintHidden = false;

  const label = kit.svg('text', { x: 500, y: 980, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 20, fill: muted, text: '' });
  svg.append(label);

  let count = 0, won = false, t0 = performance.now();
  kit.status(`0/${TOTAL}`);

  kit.loop(() => {
    if (won) return false;
    const t = (performance.now() - t0) % PERIOD;
    const p = t / PERIOD < 0.5 ? (t / PERIOD) * 2 : 2 - (t / PERIOD) * 2; // 0..1..0
    const x = laneX0 + (laneX1 - laneX0) * p;
    loop.setAttribute('cx', x); loopHi.setAttribute('cx', x - 4);
  });

  function inZone() {
    const cx = Number(loop.getAttribute('cx'));
    return Math.abs(cx - (laneX0 + laneX1) / 2) < zoneW / 2;
  }

  function stitchV(cx, cy) {
    return kit.svg('path', {
      d: `M ${cx - 22} ${cy + 16} L ${cx} ${cy - 18} L ${cx + 22} ${cy + 16}`,
      fill: 'none', stroke: forest, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    });
  }

  function tap() {
    if (won) return;
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (!inZone()) { label.textContent = 'close — wait for the band.'; return; }
    const i = count;
    const { cx, cy } = pips[i];
    if ((i + 1) % FACE_EVERY === 0) {
      const bot = createBot(kit, { cx, cy, r: 40, bg: '#F7F5F1' });
      bot.height(0.9);
      stitchLayer.append(bot.group);
    } else {
      stitchLayer.append(stitchV(cx, cy));
    }
    count++;
    label.textContent = 'knitting.';
    kit.status(`${count}/${TOTAL}`);
    if (count >= TOTAL) { won = true; kit.status(`${TOTAL}/${TOTAL}`); finish(); }
  }

  function finish() {
    label.textContent = '';
    winBeat(kit, svg, 'knit.', { message: 'knit.', delay: 1000 });
  }

  kit.on(svg, 'pointerdown', tap);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
}

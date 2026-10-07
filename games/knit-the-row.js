// B15 — knitted cardigan, "rows of tiny faces, knitted." Unlock: tap in time to knit 36
// stitches; a tiny face appears every sixth one.
import { createBot } from './_bot.js';

const TOTAL = 36;
const FACE_EVERY = 6;
const PERIOD = 700; // ms per needle swing

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';
  const forest = '#2F4F46';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const cols = 6, rows = Math.ceil(TOTAL / cols);
  const cellW = 130, cellH = 108, startX = 500 - (cols * cellW) / 2 + cellW / 2, startY = 190;
  const pips = [];
  for (let i = 0; i < TOTAL; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const cx = startX + c * cellW, cy = startY + r * cellH;
    const slot = kit.svg('rect', { x: cx - cellW / 2 + 8, y: cy - cellH / 2 + 8, width: cellW - 16, height: cellH - 16, rx: 14, fill: 'none', stroke: muted, 'stroke-opacity': 0.4, 'stroke-width': 3 });
    svg.append(slot);
    pips.push({ cx, cy, slot });
  }

  const laneY = 930, laneX0 = 160, laneX1 = 840, zoneW = 90;
  svg.append(kit.svg('line', { x1: laneX0, y1: laneY, x2: laneX1, y2: laneY, stroke: muted, 'stroke-width': 4, 'stroke-opacity': 0.4 }));
  const zone = kit.svg('rect', { x: (laneX0 + laneX1) / 2 - zoneW / 2, y: laneY - 26, width: zoneW, height: 52, rx: 10, fill: accent, 'fill-opacity': 0.25 });
  const needle = kit.svg('circle', { cx: laneX0, cy: laneY, r: 16, fill: ink });
  svg.append(zone, needle);

  const label = kit.svg('text', { x: 500, y: 985, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 22, fill: muted, text: 'tap in time with the needle' });
  svg.append(label);

  let count = 0, won = false, t0 = performance.now();
  kit.status(`0/${TOTAL}`);

  kit.loop(() => {
    if (won) return false;
    const t = (performance.now() - t0) % PERIOD;
    const p = t / PERIOD < 0.5 ? (t / PERIOD) * 2 : 2 - (t / PERIOD) * 2; // 0..1..0
    needle.setAttribute('cx', laneX0 + (laneX1 - laneX0) * p);
  });

  function inZone() {
    const cx = Number(needle.getAttribute('cx'));
    return Math.abs(cx - (laneX0 + laneX1) / 2) < zoneW / 2;
  }

  function tap() {
    if (won) return;
    if (!inZone()) { label.textContent = 'close — wait for the band.'; return; }
    const i = count;
    const { cx, cy, slot } = pips[i];
    slot.setAttribute('stroke-opacity', '0');
    if ((i + 1) % FACE_EVERY === 0) {
      const bot = createBot(kit, { cx, cy, r: 48, bg: card });
      bot.height(0.9);
      svg.append(bot.group);
    } else {
      svg.append(kit.svg('circle', { cx, cy, r: 10, fill: forest }));
    }
    count++;
    label.textContent = 'knitting.';
    kit.status(`${count}/${TOTAL}`);
    if (count >= TOTAL) { won = true; kit.status(`${TOTAL}/${TOTAL}`); kit.win('knit.'); }
  }

  kit.on(svg, 'pointerdown', tap);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(); } });
}

// B16 — bucket hat, "small face on the brim." Unlock: the sun crosses the sky; drag the
// brim so its shadow stays on the bot until sunset.
import { createBot } from './_bot.js';

const DAY_MS = 24000;
const TOL = 110;
const HEAT_MAX = 2600; // ms of continuous exposure before it gives up and resets

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const dusty = '#8FA6B8';
  const clay = '#C9764F';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  svg.append(kit.svg('path', { d: 'M 60,760 Q 500,900 940,760', fill: 'none', stroke: dusty, 'stroke-opacity': 0.35, 'stroke-width': 6 }));
  const sun = kit.svg('circle', { cx: 100, cy: 700, r: 34, fill: '#F2D98A' });
  svg.append(sun);

  const brimY = 420, brimW = 220;
  let brimX = 500;
  const brim = kit.svg('rect', { x: brimX - brimW / 2, y: brimY - 14, width: brimW, height: 28, rx: 14, fill: '#D9C9A3', stroke: ink, 'stroke-width': 5 });
  svg.append(brim);

  const bot = createBot(kit, { cx: 500, cy: 650, r: 150, bg: card });
  svg.append(bot.group);

  const meterBg = kit.svg('rect', { x: 300, y: 920, width: 400, height: 16, rx: 8, fill: muted, 'fill-opacity': 0.25 });
  const meter = kit.svg('rect', { x: 300, y: 920, width: 0, height: 16, rx: 8, fill: clay });
  svg.append(meterBg, meter);
  const caption = kit.svg('text', { x: 500, y: 980, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 22, fill: muted, text: 'drag the brim to keep the shade on it' });
  svg.append(caption);

  function setBrim(x) {
    brimX = Math.max(140, Math.min(860, x));
    brim.setAttribute('x', brimX - brimW / 2);
  }

  let dragging = false;
  kit.on(svg, 'pointerdown', (e) => { dragging = true; setBrim(kit.point(e).x * 1000); });
  kit.on(window, 'pointermove', (e) => { if (dragging) setBrim(kit.point(e).x * 1000); });
  kit.on(window, 'pointerup', () => { dragging = false; });
  kit.on(window, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setBrim(brimX - 24); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setBrim(brimX + 24); }
  });

  let heat = 0, t0 = performance.now(), running = true;

  function begin() {
    heat = 0; t0 = performance.now(); running = true;
    caption.textContent = 'drag the brim to keep the shade on it';
  }

  kit.loop((dt) => {
    if (!running) return;
    const elapsed = performance.now() - t0;
    const p = Math.min(1, elapsed / DAY_MS);
    const sx = 100 + 800 * p;
    const sy = 700 - 500 * Math.sin(Math.PI * p);
    sun.setAttribute('cx', sx);
    sun.setAttribute('cy', sy);

    const covered = Math.abs(brimX - sx) < TOL;
    bot.height(covered ? 1 : 1.25, covered ? 0 : 0.08);
    heat = Math.max(0, Math.min(HEAT_MAX, heat + (covered ? -dt * 1.4 : Math.max(0, dt))));
    meter.setAttribute('width', (heat / HEAT_MAX) * 400);
    kit.status(`${Math.round(p * 100)}% of the day`);

    if (heat >= HEAT_MAX) {
      running = false;
      caption.textContent = 'too much sun. try again.';
      kit.after(1100, begin);
    } else if (p >= 1) {
      running = false;
      caption.textContent = 'shaded, all day.';
      kit.status('sunset');
      kit.win('shaded, all day.');
    }
  });
}

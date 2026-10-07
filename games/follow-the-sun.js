// B16 — bucket hat, "small face on the brim." Unlock: a beach, the sky sliding from morning
// to sunset; drag a proper bucket hat so its shadow stays on the bot, sitting on its towel,
// until sunset.
import { createBot, shadow, heading, mix, shade, tint } from './_bot.js';
import { winBeat } from './_bot2.js';

const DAY_MS = 24000;
const TOL = 110;
const HEAT_MAX = 2600; // ms of continuous exposure before it gives up and resets

const MORNING = '#CFE3EE', MIDDAY = '#9FD2E8', SUNSET = '#E8B99A';

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const sand = '#E8DFCF';
  const sea = '#8FA6B8';
  const clay = '#C9764F';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const horizonY = 560;
  const sky = kit.svg('rect', { x: 0, y: 0, width: 1000, height: horizonY, fill: MORNING });
  const seaStrip = kit.svg('rect', { x: 0, y: horizonY, width: 1000, height: 40, fill: sea, opacity: 0.6 });
  const sandRect = kit.svg('rect', { x: 0, y: horizonY + 40, width: 1000, height: 1000 - horizonY - 40, fill: sand });
  svg.append(sky, seaStrip, sandRect);
  for (let i = 0; i < 3; i++) {
    svg.append(kit.svg('path', { d: `M ${200 + i * 260} ${horizonY + 60} Q ${230 + i * 260} ${horizonY + 44} ${260 + i * 260} ${horizonY + 60}`, fill: 'none', stroke: shade(sand, 0.1), 'stroke-width': 4, opacity: 0.5 }));
  }

  const sun = kit.svg('circle', { cx: 100, cy: horizonY - 60, r: 40, fill: '#F2D98A' });
  const sunGlow = kit.svg('circle', { cx: 100, cy: horizonY - 60, r: 70, fill: '#F2D98A', opacity: 0.25 });
  svg.append(sunGlow, sun);

  // a striped towel under the bot
  const towel = kit.svg('g', { transform: 'translate(500 720)' });
  shadow(kit, { cx: 0, cy: 70, rx: 200, ry: 20, opacity: 0.12, parent: towel });
  towel.append(kit.svg('rect', { x: -190, y: -20, width: 380, height: 100, rx: 14, fill: '#F7F5F1' }));
  for (let i = 0; i < 5; i++) towel.append(kit.svg('rect', { x: -190 + i * 76, y: -20, width: 36, height: 100, fill: clay, opacity: 0.85 }));
  svg.append(towel);

  const bot = createBot(kit, { cx: 500, cy: 650, r: 150, bg: card });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2400, max: 4000 });

  // a proper bucket hat, held above the bot, draggable
  const brimY = 400, brimW = 340;
  let brimX = 500;
  const hat = kit.svg('g', { transform: `translate(${brimX} ${brimY})` });
  shadow(kit, { cx: 0, cy: 54, rx: brimW * 0.5, ry: 12, opacity: 0.1, parent: hat });
  const hatColor = '#F2D98A', hatDark = shade(hatColor, 0.22);
  const crown = kit.svg('path', { d: `M ${-brimW * 0.3} -18 Q ${-brimW * 0.3} -96 0 -98 Q ${brimW * 0.3} -96 ${brimW * 0.3} -18 Z`, fill: hatColor, stroke: shade(hatColor, 0.1), 'stroke-width': 2 });
  const crownShade = kit.svg('path', { d: `M 0 -98 Q ${brimW * 0.3} -96 ${brimW * 0.3} -18 L ${brimW * 0.08} -18 Z`, fill: hatDark, opacity: 0.5 });
  const brim = kit.svg('ellipse', { cx: 0, cy: -6, rx: brimW / 2, ry: 30, fill: hatDark });
  const brimTop = kit.svg('ellipse', { cx: 0, cy: -16, rx: brimW * 0.46, ry: 20, fill: hatColor, stroke: shade(hatColor, 0.1), 'stroke-width': 2 });
  const band = kit.svg('rect', { x: -brimW * 0.27, y: -40, width: brimW * 0.54, height: 16, rx: 6, fill: '#00A862' });
  // a tiny stitched face on the brim, like the real product
  const faceEyeL = kit.svg('rect', { x: -14, y: -4, width: 9, height: 17, rx: 4, fill: '#0D0D0E', opacity: 0.8, transform: 'translate(0 -16)' });
  const faceEyeR = kit.svg('rect', { x: 5, y: -4, width: 9, height: 17, rx: 4, fill: '#0D0D0E', opacity: 0.8, transform: 'translate(0 -16)' });
  hat.append(crown, crownShade, brim, brimTop, band, faceEyeL, faceEyeR);
  svg.append(hat);
  const hatHit = kit.svg('rect', { x: -brimW / 2 - 10, y: -130, width: brimW + 20, height: 180, fill: 'transparent', transform: `translate(${brimX} ${brimY})`, style: { cursor: 'grab' } });
  svg.append(hatHit);

  const meterBg = kit.svg('rect', { x: 300, y: 920, width: 400, height: 16, rx: 8, fill: muted, 'fill-opacity': 0.25 });
  const meter = kit.svg('rect', { x: 300, y: 920, width: 0, height: 16, rx: 8, fill: clay });
  svg.append(meterBg, meter);

  const head = heading(kit, { parent: kit.stage, line: 'keep it in the shade.', hint: 'drag the hat over it.' });
  let hintHidden = false;
  const hideHint = () => { if (!hintHidden) { hintHidden = true; head.hide(); } };

  function setBrim(x) {
    brimX = Math.max(140, Math.min(860, x));
    hat.setAttribute('transform', `translate(${brimX} ${brimY})`);
    hatHit.setAttribute('transform', `translate(${brimX} ${brimY})`);
  }

  let dragging = false;
  kit.on(svg, 'pointerdown', (e) => { dragging = true; hideHint(); setBrim(kit.point(e).x * 1000); });
  kit.on(window, 'pointermove', (e) => { if (dragging) setBrim(kit.point(e).x * 1000); });
  kit.on(window, 'pointerup', () => { dragging = false; });
  kit.on(window, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); hideHint(); setBrim(brimX - 24); }
    if (e.key === 'ArrowRight') { e.preventDefault(); hideHint(); setBrim(brimX + 24); }
  });

  let heat = 0, t0 = performance.now(), running = true;

  function begin() {
    heat = 0; t0 = performance.now(); running = true;
  }

  kit.loop((dt) => {
    if (!running) return;
    const elapsed = performance.now() - t0;
    const p = Math.min(1, elapsed / DAY_MS);
    const sx = 100 + 800 * p;
    const sy = (horizonY - 60) - 420 * Math.sin(Math.PI * p);
    sun.setAttribute('cx', sx); sun.setAttribute('cy', sy);
    sunGlow.setAttribute('cx', sx); sunGlow.setAttribute('cy', sy);

    const skyColor = p < 0.5 ? mix(MORNING, MIDDAY, p * 2) : mix(MIDDAY, SUNSET, (p - 0.5) * 2);
    sky.setAttribute('fill', skyColor);

    const covered = Math.abs(brimX - sx) < TOL;
    bot.height(covered ? 1 : 1.25, covered ? 0 : 0.08);
    heat = Math.max(0, Math.min(HEAT_MAX, heat + (covered ? -dt * 1.4 : Math.max(0, dt))));
    meter.setAttribute('width', (heat / HEAT_MAX) * 400);
    kit.status(`${Math.round(p * 100)}% of the day`);

    if (heat >= HEAT_MAX) {
      running = false;
      kit.after(1100, begin);
    } else if (p >= 1) {
      running = false;
      kit.status('sunset');
      winBeat(kit, svg, 'shaded, all day.', { message: 'shaded, all day.', delay: 1100 });
    }
  });
}

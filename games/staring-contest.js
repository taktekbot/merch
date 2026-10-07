// B03 the eyes tee — "Win a staring contest."
// Close-up: the bot fills the stage, a tiny clock ticks in the corner, a sweat drop forms
// as the seconds run out, its eye trembles — then it blinks first, in dramatic slow motion.
import { createBot, heading, shade } from './_bot.js';

export default function mount(kit) {
  const o = kit.options || {};
  const seconds = o.seconds || 10;
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const vignette = kit.svg('radialGradient', { id: 'vig', cx: '50%', cy: '44%', r: '72%' }, [
    kit.svg('stop', { offset: '72%', 'stop-color': card }),
    kit.svg('stop', { offset: '100%', 'stop-color': shade(card, 0.14) }),
  ]);
  const defs = kit.svg('defs', {}, [vignette]);
  const bg = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: 'url(#vig)' });
  svg.append(defs, bg);

  const bot = createBot(kit, { cx: 500, cy: 540, r: 340, bg: card });
  svg.append(bot.group);

  const C = 2 * Math.PI * 420;
  const ring = kit.svg('circle', { cx: 500, cy: 540, r: 420, fill: 'none', stroke: accent, 'stroke-width': 10, 'stroke-dasharray': C, 'stroke-dashoffset': C, transform: 'rotate(-90 500 540)', 'stroke-linecap': 'round', opacity: 0.5 });
  svg.append(ring);

  // a tiny ticking wall clock in the corner, purely for flavour
  const clockG = kit.svg('g', { transform: 'translate(118 118)' });
  const clockFace = kit.svg('circle', { cx: 0, cy: 0, r: 56, fill: card, stroke: ink, 'stroke-width': 6 });
  const tick12 = kit.svg('line', { x1: 0, y1: -46, x2: 0, y2: -38, stroke: ink, 'stroke-width': 4 });
  const tick3 = kit.svg('line', { x1: 46, y1: 0, x2: 38, y2: 0, stroke: ink, 'stroke-width': 4 });
  const tick6 = kit.svg('line', { x1: 0, y1: 46, x2: 0, y2: 38, stroke: ink, 'stroke-width': 4 });
  const tick9 = kit.svg('line', { x1: -46, y1: 0, x2: -38, y2: 0, stroke: ink, 'stroke-width': 4 });
  const hand = kit.svg('line', { x1: 0, y1: 6, x2: 0, y2: -40, stroke: accent, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const pin = kit.svg('circle', { cx: 0, cy: 0, r: 4, fill: ink });
  clockG.append(clockFace, tick12, tick3, tick6, tick9, hand, pin);
  svg.append(clockG);

  // a sweat drop that forms near the temple as time runs out
  const sweat = kit.svg('path', { d: 'M 0 -16 C 10 0 10 14 0 18 C -10 14 -10 0 0 -16 Z', fill: '#8FA6B8', opacity: 0, transform: 'translate(726 420)' });
  svg.append(sweat);

  const head = heading(kit, { parent: kit.stage, line: 'win a staring contest.', hint: 'look at it. hold still.' });
  let hintHidden = false;

  let last = null, stillMs = 0, started = false, finished = false;
  const EPS = 0.006;
  let baseLook = { x: 0, y: 0 };
  let jitter = 0;

  function applyLook() {
    const j = (Math.random() - 0.5) * jitter;
    bot.look(baseLook.x + j, baseLook.y + j * 0.6);
  }

  kit.on(window, 'pointermove', (e) => {
    if (finished) return;
    const p = kit.point(e);
    baseLook = { x: Math.max(-1, Math.min(1, (p.x - 0.5) * 2)) * 16, y: Math.max(-1, Math.min(1, (p.y - 0.5) * 2)) * 12 };
    applyLook();
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (!last) { last = p; started = true; return; }
    const d = Math.hypot(p.x - last.x, p.y - last.y);
    if (d > EPS) { stillMs = 0; }
    last = p;
  }, { passive: true });
  kit.on(kit.stage, 'pointerleave', () => { if (started && !finished) { stillMs = 0; last = null; } });
  kit.on(window, 'keydown', () => { if (started && !finished) stillMs = 0; });

  bot.autoBlink(kit, { min: 3200, max: 5200 });

  kit.loop((dt, t) => {
    if (finished) return;
    hand.setAttribute('transform', `rotate(${(t / 1000) * 90})`);
    if (!started) return;
    stillMs += dt;
    const p = Math.min(1, stillMs / (seconds * 1000));
    const left = Math.max(0, seconds - stillMs / 1000);
    kit.status(`${left.toFixed(1)}s`);
    ring.setAttribute('stroke-dashoffset', C * (1 - p));
    jitter = p > 0.55 ? (p - 0.55) * 2.2 : 0;
    applyLook();
    sweat.setAttribute('opacity', p > 0.6 ? Math.min(0.9, (p - 0.6) * 2.4) : 0);
    if (p > 0.6) sweat.setAttribute('transform', `translate(726 ${420 + (p - 0.6) * 90})`);
    if (p > 0.7 && p < 0.99) bot.tilt(Math.sin(t / 90) * (p - 0.6) * 6);
    if (stillMs >= seconds * 1000) { finish(); return false; }
  });

  function finish() {
    finished = true;
    kit.status(`${seconds}s`);
    bot.look(0, 0);
    bot.tilt(0);
    bot.blink(kit, { duration: 420, dramatic: true });
    kit.after(260, () => {
      const big = kit.el('p', { class: 'g-big', style: { position: 'absolute', left: '0', right: '0', bottom: '10%', textAlign: 'center', margin: '0' }, text: 'it blinked first.' });
      kit.stage.append(big);
    });
    kit.after(1100, () => kit.win('it blinked first.'));
  }
}

// B05 sleeping pillow — "Put it to sleep."
// A small bed, a night light, the room dimming. Its eyes get heavy over 20 calm seconds and
// the blanket rises and falls with its breathing; a big move startles it awake and it has
// to settle again. Small twitches are forgiven.
import { createBot, room, bed, lamp, zParticles, heading } from './_bot.js';

export default function mount(kit) {
  const o = kit.options || {};
  const totalMs = (o.seconds || 20) * 1000;
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#2F4F46', floor: '#1B2230', floorY: 680 });
  const nightLamp = lamp(kit, { parent: svg, x: 790, y: 700, on: true, color: '#F2D98A' });

  const bedFixture = bed(kit, { parent: svg, x: 470, y: 560, w: 440, h: 230, cover: '#8FA6B8', frame: '#6E4A33' });
  // the bed's own blanket sits low in the frame (tucked around the feet); draw a second,
  // higher blanket edge in front of the bot so it reads as pulled up to the chin.
  bedFixture.blanket.setAttribute('opacity', 0.001);
  bedFixture.blanketDk.setAttribute('opacity', 0.001);
  const bx = bedFixture.x - bedFixture.w / 2, by = bedFixture.y, bw = bedFixture.w, bh = bedFixture.h;
  const bot = createBot(kit, { cx: bx + bw * 0.28, cy: by + 56, r: 118, bg: card });
  svg.append(bot.group);
  const frontCover = (lift) => `M ${bx} ${by + 150 - lift} Q ${bx + bw / 2} ${by + 118 - lift} ${bx + bw} ${by + 150 - lift} L ${bx + bw} ${by + bh} L ${bx} ${by + bh} Z`;
  const blanketFront = kit.svg('path', { d: frontCover(0), fill: '#8FA6B8' });
  const blanketFrontEdge = kit.svg('path', { d: `M ${bx} ${by + 150} Q ${bx + bw / 2} ${by + 118} ${bx + bw} ${by + 150}`, fill: 'none', stroke: '#6b86a0', 'stroke-width': 6, opacity: 0.6 });
  svg.append(blanketFront, blanketFrontEdge);
  const breatheFront = (p) => {
    const lift = Math.sin(p * Math.PI) * 10;
    blanketFront.setAttribute('d', frontCover(lift));
    blanketFrontEdge.setAttribute('transform', `translate(0 ${-lift})`);
  };

  const zz = zParticles(kit, { parent: svg, x: bx + bw * 0.6, y: by - 10, color: '#F7F5F1' });

  const dim = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#05070d', opacity: 0 });
  svg.append(dim);

  const head = heading(kit, { parent: kit.stage, line: 'put it to sleep.', hint: 'quiet now. stay calm.', color: '#F7F5F1', hintColor: '#8FA6B8' });
  let hintHidden = false;

  let progressMs = 0, last = null, startle = 0, wonAlready = false;
  const SOFT = 0.012, BIG = 0.05, PENALTY_MS = 4000;
  let zAt = 2600;

  const onMove = (e) => {
    if (wonAlready) return;
    const p = kit.point(e);
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (!last) { last = p; return; }
    const d = Math.hypot(p.x - last.x, p.y - last.y);
    last = p;
    if (d > BIG) {
      progressMs = Math.max(0, progressMs - PENALTY_MS);
      startle = 1;
      bot.blink(kit, { duration: 260, dramatic: true });
    }
  };
  kit.on(window, 'pointermove', onMove, { passive: true });
  kit.on(window, 'touchmove', onMove, { passive: true });

  kit.loop((dt, t) => {
    if (wonAlready) return;
    if (startle <= 0) progressMs = Math.min(totalMs, progressMs + dt);
    startle = Math.max(0, startle - dt / 500);
    const p = progressMs / totalMs;
    const wake = startle;
    bot.sleepy(Math.max(0, p * (1 - wake * 1.3)));
    if (wake > 0.05) bot.height(1.2, 0.08);
    const breathe = (Math.sin(t / 900) + 1) / 2;
    breatheFront(breathe * (0.4 + p * 0.6));
    dim.setAttribute('opacity', Math.min(0.5, p * 0.5));
    zAt -= dt;
    if (p > 0.35 && wake < 0.05 && zAt <= 0) {
      zz.spawn(0.7 + p * 0.6);
      zAt = Math.max(550, 2200 - p * 1600);
    }
    kit.status(p >= 1 ? 'asleep' : `${Math.ceil((totalMs - progressMs) / 1000)}s`);
    if (p >= 1) { finish(); return false; }
  });

  function finish() {
    wonAlready = true;
    bot.sleepy(1);
    breatheFront(0.3);
    kit.after(700, () => {
      const big = kit.el('p', { class: 'g-big', style: { position: 'absolute', left: '0', right: '0', bottom: '8%', textAlign: 'center', margin: '0', color: '#F7F5F1' }, text: 'asleep. shh.' });
      kit.stage.append(big);
    });
    kit.after(1500, () => kit.win('asleep. shh.'));
  }
}

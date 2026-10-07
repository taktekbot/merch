// B01 shy dad hat — "It's shy. Earn its trust."
// A cosy room: the bot is tucked behind the sofa arm. Hold still and it creeps out,
// peeking and blushing; move and it ducks back. Reach full trust and it crosses the rug
// to sit beside you.
import { createBot, room, hideBehind, shadow, heading, winBeat } from './_bot.js';

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#E8DFCF', floor: '#C9764F', floorY: 660 });
  // a soft rug, the "beside you" spot
  const rug = kit.svg('ellipse', { cx: 560, cy: 790, rx: 220, ry: 60, fill: '#F2D98A', opacity: 0.35 });
  const rugRing = kit.svg('ellipse', { cx: 560, cy: 790, rx: 220, ry: 60, fill: 'none', stroke: '#F2D98A', 'stroke-width': 4, opacity: 0.5 });
  svg.append(rug, rugRing);
  // a cushion waiting at the destination
  const cushion = kit.svg('ellipse', { cx: 560, cy: 706, rx: 64, ry: 24, fill: '#8FA6B8' });
  const cushionSeam = kit.svg('ellipse', { cx: 560, cy: 706, rx: 64, ry: 24, fill: 'none', stroke: '#8FA6B8', 'stroke-width': 3, opacity: 0.4 });
  svg.append(cushion, cushionSeam);

  const start = { x: 300, y: 702 };
  const dest = { x: 560, y: 698 };
  const bot = createBot(kit, { cx: start.x, cy: start.y, r: 140, bg: card, shadow: true });
  const limbs = bot.addLimbs({ arms: false, feet: true });
  svg.append(bot.group);

  // the door sits in front, so it occludes the bot's left side until it walks clear
  hideBehind(kit, { parent: svg, x: 50, y: 140, w: 190, h: 520, color: '#2F4F46' });
  // a little potted plant in the far corner, well clear of the bot
  const potX = 112, potY = 724;
  const leaf = (dx, dy, rot) => kit.svg('path', {
    d: `M 0 0 Q ${dx * 0.3} ${dy * 0.5} ${dx} ${dy}`,
    fill: 'none', stroke: '#2F4F46', 'stroke-width': 10, 'stroke-linecap': 'round',
    transform: `translate(${potX} ${potY}) rotate(${rot})`,
  });
  svg.append(
    shadow(kit, { cx: potX, cy: potY + 44, rx: 36, ry: 8 }),
    kit.svg('path', { d: `M ${potX - 28} ${potY} L ${potX + 28} ${potY} L ${potX + 22} ${potY + 42} L ${potX - 22} ${potY + 42} Z`, fill: '#6E4A33' }),
    leaf(-46, -70, -8), leaf(-10, -86, 6), leaf(30, -66, 20),
  );

  const head = heading(kit, { parent: kit.stage, line: 'earn its trust.', hint: 'hold still. it ducks if you move.' });
  bot.autoBlink(kit, { min: 2400, max: 4400 });

  let progress = 0, idleMs = 0, duckUntil = 0, hintHidden = false, finished = false, walkPhase = 0;
  const GRACE = 450, APPROACH_MS = 8600, DUCK_MOVE = 0.16;

  function place() {
    const x = start.x + (dest.x - start.x) * progress;
    const y = start.y + (dest.y - start.y) * progress;
    bot.moveTo(x, y);
    bot.blush(progress > 0.08 && progress < 0.98);
  }
  place();

  kit.onActivity(() => {
    if (finished) return;
    if (!hintHidden) { hintHidden = true; head.hide(); }
    idleMs = 0;
    duckUntil = performance.now() + 260;
    progress = Math.max(0, progress - DUCK_MOVE);
    place();
    bot.squash(kit, { amount: 0.14, duration: 160 });
  });

  kit.loop((dt) => {
    if (finished) return;
    const now = performance.now();
    if (now < duckUntil) { bot.look((Math.random() - 0.5) * 3, -0.6); bot.tilt(0); return; }
    idleMs += dt;
    if (idleMs > GRACE && progress < 1) {
      const before = progress;
      progress = Math.min(1, progress + dt / APPROACH_MS);
      place();
      if (before < 1 && progress >= 1) return finish();
      walkPhase += dt / 260;
      limbs.step(walkPhase % 1);
      bot.tilt(Math.sin(walkPhase) * 3);
    } else {
      bot.look(Math.sin(now / 1400) * 0.3, Math.cos(now / 1900) * 0.2);
    }
    kit.status(`${Math.round(progress * 100)}% trust`);
  });

  function finish() {
    finished = true;
    bot.blush(false);
    kit.status('100% trust');
    bot.walkTo(kit, dest.x, dest.y, 500, () => {
      bot.squash(kit, { amount: 0.26, duration: 260 });
      bot.tilt(-3);
      bot.look(0, -6);
      bot.height(0.42);
      bot.curl(24);
      kit.after(500, () => winBeat(kit, svg, 'it trusts you.'));
    });
  }
}

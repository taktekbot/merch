// B08 it-made-you-coffee mug — "It made you coffee. Stop it at the line."
// A kitchen counter: the bot sits on its stool holding a little pour-over kettle in both
// hands and won't stop pouring on its own. Press stop (click/tap/space) when the level
// sits in the band. Miss — too little or over the top — and it panics, mops up, and tries
// again.
import { createBot, room, shadow, heading, winBeat, shade, tint, animate, EASE } from './_bot.js';

export default function mount(kit) {
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const coffee = '#6E4A33';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#E8DFCF', floor: '#C9764F', floorY: 700 });
  svg.append(kit.svg('rect', { x: 0, y: 700, width: 1000, height: 14, fill: shade('#C9764F', 0.2) }));

  const mugX = 300, mugY = 440, mugW = 280, mugH = 280, rimY = mugY;
  const bandLo = 0.78, bandHi = 0.9;

  shadow(kit, { cx: mugX + mugW / 2 + 40, cy: mugY + mugH + 16, rx: mugW * 0.56, ry: 16, parent: svg });
  svg.append(kit.svg('rect', { x: mugX, y: mugY, width: mugW, height: mugH, rx: 18, fill: '#F7F5F1' }));
  svg.append(kit.svg('rect', { x: mugX, y: mugY, width: mugW * 0.3, height: mugH, rx: 18, fill: shade('#F7F5F1', 0.08), opacity: 0.6 }));
  svg.append(kit.svg('path', { d: `M ${mugX + mugW} ${mugY + 66} q 86 0 86 74 q 0 74 -86 74`, fill: 'none', stroke: '#F7F5F1', 'stroke-width': 24 }));
  svg.append(kit.svg('path', { d: `M ${mugX + mugW} ${mugY + 66} q 86 0 86 74 q 0 74 -86 74`, fill: 'none', stroke: shade('#F7F5F1', 0.1), 'stroke-width': 24, opacity: 0.35 }));

  const clip = `coffee-clip-${Math.random().toString(36).slice(2, 8)}`;
  svg.append(kit.svg('clipPath', { id: clip }, [kit.svg('rect', { x: mugX + 4, y: mugY + 4, width: mugW - 8, height: mugH - 8, rx: 14 })]));
  const liquid = kit.svg('rect', { x: mugX + 4, y: mugY + mugH - 4, width: mugW - 8, height: 0, fill: coffee, 'clip-path': `url(#${clip})` });
  svg.append(liquid);
  const bandY = mugY + mugH - mugH * bandHi;
  const bandH = mugH * (bandHi - bandLo);
  svg.append(kit.svg('rect', { x: mugX, y: bandY, width: mugW, height: bandH, fill: kit.colors.accent || '#00A862', opacity: 0.16 }));
  svg.append(kit.svg('rect', { x: mugX, y: mugY, width: mugW, height: mugH, rx: 18, fill: 'none', stroke: shade('#F7F5F1', 0.1), 'stroke-width': 6 }));

  // steam — little wisps that rise and fade
  kit.every(820, () => {
    const x = mugX + 60 + Math.random() * (mugW - 120);
    const wisp = kit.svg('path', { d: `M ${x} ${mugY - 10} q 14 -18 0 -36 q -14 -18 0 -36`, fill: 'none', stroke: '#F7F5F1', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 });
    svg.insertBefore(wisp, liquid.nextSibling);
    animate(kit, 1500, EASE.outCubic, (p) => {
      wisp.setAttribute('transform', `translate(0 ${-p * 60})`);
      wisp.setAttribute('opacity', Math.sin(p * Math.PI) * 0.55);
    }, () => wisp.remove());
  });

  // the bot on its stool, pouring with both hands
  const stoolX = 700, stoolY = 650;
  shadow(kit, { cx: stoolX, cy: stoolY + 70, rx: 90, ry: 14, parent: svg });
  svg.append(kit.svg('rect', { x: stoolX - 70, y: stoolY + 36, width: 140, height: 18, rx: 8, fill: '#6E4A33' }));
  svg.append(kit.svg('rect', { x: stoolX - 54, y: stoolY + 54, width: 10, height: 46, fill: shade('#6E4A33', 0.2) }));
  svg.append(kit.svg('rect', { x: stoolX + 44, y: stoolY + 54, width: 10, height: 46, fill: shade('#6E4A33', 0.2) }));

  const bot = createBot(kit, { cx: stoolX, cy: stoolY - 30, r: 120, bg: card });
  const limbs = bot.addLimbs({ arms: true, feet: false });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2600, max: 4400 });
  bot.look(-10, 2);
  bot.tilt(-4);
  limbs.waveL(34);
  limbs.waveR(-50);

  // a small pour-over kettle gripped between the arms, tipped toward the mug
  const kettleG = kit.svg('g', { transform: `translate(${stoolX - 96} ${stoolY - 108}) rotate(-34)` });
  kettleG.append(kit.svg('path', { d: 'M -46 10 Q -46 -36 0 -36 Q 46 -36 46 10 L 40 56 L -40 56 Z', fill: '#8FA6B8' }));
  kettleG.append(kit.svg('path', { d: 'M -46 10 Q -46 -36 0 -36 L -10 -36 Q -28 -30 -28 10 Z', fill: shade('#8FA6B8', 0.14), opacity: 0.6 }));
  kettleG.append(kit.svg('path', { d: 'M 40 -2 Q 86 -8 96 -40', fill: 'none', stroke: '#8FA6B8', 'stroke-width': 13, 'stroke-linecap': 'round' }));
  kettleG.append(kit.svg('path', { d: 'M -30 -40 Q 0 -58 30 -40', fill: 'none', stroke: shade('#8FA6B8', 0.1), 'stroke-width': 11, 'stroke-linecap': 'round' }));
  svg.append(kettleG);
  const streamStartX = stoolX - 96 + Math.cos((-40 * Math.PI) / 180) * 94, streamStartY = stoolY - 108 + Math.sin((-40 * Math.PI) / 180) * 94 + 2;
  const stream = kit.svg('path', { d: '', fill: 'none', stroke: coffee, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.9 });
  svg.append(stream);

  const head = heading(kit, { parent: kit.stage, line: 'stop it at the line.', hint: 'click, tap or press space to stop.' });
  let hintHidden = false;

  let level = 0, pouring = true, settled = false;

  function drawStream() {
    if (!pouring) { stream.setAttribute('d', ''); return; }
    const liquidTopY = mugY + mugH - 4 - Math.max(0, Math.min(mugH - 8, (mugH - 8) * level));
    const midX = (streamStartX + (mugX + mugW * 0.42)) / 2, midY = streamStartY + 30;
    stream.setAttribute('d', `M ${streamStartX} ${streamStartY} Q ${midX} ${midY} ${mugX + mugW * 0.42} ${Math.min(liquidTopY, mugY + mugH - 10)}`);
  }

  function panic() {
    bot.height(1.4, 0.18);
    const shiver = bot.startShiver(kit, { intensity: 9, speed: 40 });
    kit.after(520, () => { shiver.stop(); bot.height(1); });
  }

  const stopPour = () => {
    if (!pouring || kit.won || settled) return;
    pouring = false; settled = true;
    stream.setAttribute('d', '');
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (level >= bandLo && level <= bandHi) {
      bot.bounce(kit, { height: 24 });
      kit.status('right at the line');
      kit.after(400, () => winBeat(kit, svg, "right at the line. it's proud."));
    } else {
      panic();
      kit.status(level < bandLo ? 'too little' : 'over the top');
      kit.after(1000, () => { level = 0; pouring = true; settled = false; });
    }
  };
  kit.on(kit.stage, 'pointerdown', stopPour);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); stopPour(); } });

  const SPEED = 0.00032;
  kit.loop((dt) => {
    if (pouring) level = Math.min(1.15, level + dt * SPEED);
    const h = Math.max(0, Math.min(mugH - 8, (mugH - 8) * level));
    liquid.setAttribute('y', mugY + mugH - 4 - h);
    liquid.setAttribute('height', h);
    drawStream();
    kit.status(`${Math.round(Math.min(1, level) * 100)}%`);
    if (level > 1.08 && pouring) stopPour();
  });
  kit.status('0%');
}

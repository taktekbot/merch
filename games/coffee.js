// B08 it-made-you-coffee mug — "It made you coffee. Stop it at the line."
// It pours and won't stop on its own. Press stop (click/tap/space) when the level sits in
// the band. Miss it — too little or over the top — and it refills and tries again.
export default function mount(kit) {
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const mugX = 310, mugY = 360, mugW = 380, mugH = 420, rimY = mugY;
  const bandLo = 0.78, bandHi = 0.9; // fraction of mugH, from the bottom

  svg.append(kit.svg('rect', { x: mugX, y: mugY, width: mugW, height: mugH, rx: 18, fill: 'none', stroke: 'currentColor', 'stroke-width': 10 }));
  svg.append(kit.svg('path', { d: `M ${mugX + mugW} ${mugY + 90} q 120 0 120 100 q 0 100 -120 100`, fill: 'none', stroke: 'currentColor', 'stroke-width': 10 }));
  const clip = `coffee-clip-${Math.random().toString(36).slice(2)}`;
  const clipEl = kit.svg('clipPath', { id: clip }, [kit.svg('rect', { x: mugX + 5, y: mugY + 5, width: mugW - 10, height: mugH - 10, rx: 14 })]);
  svg.append(clipEl);
  const liquid = kit.svg('rect', { x: mugX + 5, y: mugY + mugH - 5, width: mugW - 10, height: 0, fill: '#C9764F', 'clip-path': `url(#${clip})` });
  svg.append(liquid);
  const bandY = mugY + mugH - mugH * bandHi;
  const bandH = mugH * (bandHi - bandLo);
  svg.append(kit.svg('rect', { x: mugX, y: bandY, width: mugW, height: bandH, fill: kit.colors.accent || '#00A862', opacity: 0.16 }));

  // the bot peeking over the rim
  const k = (1000 / 1024) * 0.42;
  const bcx = mugX + mugW / 2, bcy = rimY - 10;
  const body = kit.svg('circle', { cx: bcx, cy: bcy, r: 232 * k, fill: kit.colors.accent || '#00A862', 'clip-path': `url(#peek-${clip})` });
  const peekClip = kit.svg('clipPath', { id: `peek-${clip}` }, [kit.svg('rect', { x: mugX - 60, y: mugY - 220, width: mugW + 120, height: 230 })]);
  svg.append(peekClip);
  const eyeW = 56 * k, baseH = 120 * k, rx = 28 * k;
  const eyeL = kit.svg('rect', { x: bcx - 92 * k - eyeW / 2, y: bcy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeR = kit.svg('rect', { x: bcx + 36 * k - eyeW / 2, y: bcy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  svg.append(body, eyeL, eyeR);

  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '4%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: 'click, tap or press space to stop it' });
  kit.stage.append(label);

  let level = 0, pouring = true, settled = false;
  const SPEED = 0.00035; // fraction per ms

  const stopPour = () => {
    if (!pouring || kit.won || settled) return;
    pouring = false; settled = true;
    if (level >= bandLo && level <= bandHi) {
      label.textContent = "right at the line. it's proud.";
      kit.win("stopped it right at the line.");
    } else {
      label.textContent = level < bandLo ? 'too little. it pours again.' : 'over the top. it pours again.';
      if (level > 1) label.textContent = 'spilled. it pours again.';
      kit.after(1100, () => { level = 0; pouring = true; settled = false; label.textContent = 'click, tap or press space to stop it'; });
    }
  };
  kit.on(kit.stage, 'pointerdown', stopPour);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); stopPour(); } });

  kit.loop((dt) => {
    if (pouring) level = Math.min(1.15, level + dt * SPEED);
    const h = Math.max(0, Math.min(mugH - 10, (mugH - 10) * level));
    liquid.setAttribute('y', mugY + mugH - 5 - h);
    liquid.setAttribute('height', h);
    eyeL.setAttribute('height', pouring ? baseH : baseH * 1.1);
    eyeR.setAttribute('height', pouring ? baseH : baseH * 1.1);
    kit.status(`${Math.round(Math.min(1, level) * 100)}%`);
    if (level > 1.1 && pouring) stopPour();
  });
}

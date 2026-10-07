// B05 sleeping pillow — "It never sleeps. Put it to sleep."
// Dim, quiet page. Its eyes close over 20 seconds while you stay calm. Small twitches are
// forgiven; a big move wakes it and it has to settle again.
export default function mount(kit) {
  const o = kit.options || {};
  const totalMs = (o.seconds || 20) * 1000;
  const dim = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#1B2230', opacity: 0 });
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  const cx = 500, cy = 500, k = 1000 / 1024;
  const body = kit.svg('circle', { cx, cy, r: 232 * k, fill: kit.colors.accent || '#00A862' });
  const eyeW = 56 * k, baseH = 120 * k, rx = 28 * k;
  const eyeL = kit.svg('rect', { x: cx - 92 * k - eyeW / 2, y: cy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeR = kit.svg('rect', { x: cx + 36 * k - eyeW / 2, y: cy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const z = kit.svg('text', { x: cx + 150, y: cy - 220, 'font-family': 'var(--display)', 'font-size': 46, fill: 'var(--muted)', opacity: 0, 'text-anchor': 'middle' , text: 'z z z'});
  svg.append(dim, body, eyeL, eyeR, z);
  kit.stage.append(svg);
  const label = kit.el('p', { class: 'g-mono', style: { position: 'absolute', left: '0', right: '0', bottom: '6%', textAlign: 'center', margin: '0', color: 'var(--muted)' }, text: 'quiet now. stay calm.' });
  kit.stage.append(label);

  let progressMs = 0;
  let last = null;
  let startle = 0; // 0..1, pops eyes open briefly
  const SOFT = 0.012, BIG = 0.05, PENALTY_MS = 4000;

  const onMove = (e) => {
    if (kit.won) return;
    const p = kit.point(e);
    if (!last) { last = p; return; }
    const d = Math.hypot(p.x - last.x, p.y - last.y);
    last = p;
    if (d > BIG) {
      progressMs = Math.max(0, progressMs - PENALTY_MS);
      startle = 1;
      label.textContent = 'that woke it. gentler.';
    } else if (d > SOFT) {
      label.textContent = 'easy. easy.';
    }
  };
  kit.on(window, 'pointermove', onMove, { passive: true });
  kit.on(window, 'touchmove', onMove, { passive: true });

  kit.loop((dt) => {
    if (startle <= 0) progressMs = Math.min(totalMs, progressMs + dt);
    startle = Math.max(0, startle - dt / 500);
    const p = progressMs / totalMs;
    const wake = startle; // overrides closing briefly
    const h = Math.max(4 * k, baseH * (1 - p) * (1 - wake) + baseH * 1.1 * wake);
    const ey = cy - 70 * k - h / 2;
    eyeL.setAttribute('height', h); eyeL.setAttribute('y', ey);
    eyeR.setAttribute('height', h); eyeR.setAttribute('y', ey);
    dim.setAttribute('opacity', Math.min(0.5, p * 0.5));
    z.setAttribute('opacity', p > 0.55 ? Math.min(1, (p - 0.55) * 2.4) : 0);
    if (wake <= 0.02 && p > 0.1 && p < 0.98) label.textContent = 'stay calm. almost there.';
    kit.status(p >= 1 ? 'asleep' : `${Math.ceil((totalMs - progressMs) / 1000)}s`);
    if (p >= 1) {
      label.textContent = 'asleep. shh.';
      kit.win('asleep. shh.');
      return false;
    }
  });
}

// B02 still up hoodie — "Open from 1 to 5 in the morning, your time."
// Tiny face, eyes open. Only unlocks 1am–5am local time; otherwise it's a dry line.
function drawBot(kit, svg, { cx = 500, cy = 430, scale = 1 } = {}) {
  const k = scale * (1000 / 1024);
  const r = 232 * k, eyeW = 56 * k, baseH = 120 * k, rx = 28 * k;
  const body = kit.svg('circle', { cx, cy, r, fill: kit.colors.accent || '#00A862' });
  const eyeL = kit.svg('rect', { x: cx - 92 * k - eyeW / 2, y: cy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  const eyeR = kit.svg('rect', { x: cx + 36 * k - eyeW / 2, y: cy - 70 * k - baseH / 2, width: eyeW, height: baseH, rx, fill: 'var(--card)' });
  svg.append(body, eyeL, eyeR);
  return {
    openness(p) {
      const h = Math.max(4 * k, baseH * p), y = cy - 70 * k - h / 2;
      eyeL.setAttribute('height', h); eyeL.setAttribute('y', y);
      eyeR.setAttribute('height', h); eyeR.setAttribute('y', y);
    },
  };
}

const isWitchingHour = (date) => { const h = date.getHours(); return h >= 1 && h < 5; };

export default function mount(kit) {
  const o = kit.options || {};
  const box = kit.el('div', { class: 'g-center' });
  kit.stage.append(box);
  let bot, timeline;

  const draw = () => {
    const open = isWitchingHour(kit.now());
    box.replaceChildren();
    const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '56%', margin: '0 auto 18px', display: 'block' } });
    bot = drawBot(kit, svg, { scale: open ? 1 : 0.85 });
    bot.openness(open ? 1 : 0.12);
    const clock = kit.now().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lineText = open ? (o.open || "it's still up.") : (o.closed || 'still up.');
    const dotted = lineText.endsWith('.') ? lineText.slice(0, -1) : lineText;
    const dot = kit.el('span', { style: { display: 'inline-block', width: '0.22em', height: '0.22em', borderRadius: '50%', background: kit.colors.accent || '#00A862', marginLeft: '0.08em' } });
    const line = kit.el('p', { class: 'g-big', text: dotted }, [dot]);
    const sub = kit.el('p', { class: 'g-mono', text: open ? 'are you?' : `are you? (not yet — ${clock}, your time)` });
    box.append(svg, line, sub);
    if (open) box.append(kit.el('button', { class: 'g-btn solid', text: o.button || 'so am i.', onclick: () => kit.win("so are you. good.") }));
  };

  draw();
  timeline = kit.every(15000, draw);
  kit.status('checks itself every 15s');
}

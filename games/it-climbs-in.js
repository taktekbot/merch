// B14 — denim tote, "eyes peeking over the top edge." Unlock: you pack the bag with real
// things (a water bottle, a book, keys, an apple, sunglasses); it keeps climbing in from the
// side between packs. Make room for it and, at the end, only its eyes peek over the rim.
import { createBot, shadow, heading, shade, tint } from './_bot.js';
import { winBeat } from './_bot2.js';

function iconBottle(kit) {
  return [
    kit.svg('rect', { x: -9, y: -58, width: 18, height: 14, rx: 4, fill: '#8FA6B8' }),
    kit.svg('rect', { x: -22, y: -46, width: 44, height: 80, rx: 18, fill: '#8FA6B8' }),
    kit.svg('rect', { x: -22, y: -20, width: 44, height: 16, fill: shade('#8FA6B8', 0.16) }),
    kit.svg('rect', { x: -12, y: -38, width: 10, height: 50, rx: 5, fill: tint('#8FA6B8', 0.3), opacity: 0.7 }),
  ];
}
function iconBook(kit) {
  return [
    kit.svg('rect', { x: -30, y: -38, width: 60, height: 76, rx: 5, fill: '#C9764F' }),
    kit.svg('rect', { x: -26, y: -34, width: 52, height: 68, fill: '#F7F5F1' }),
    kit.svg('line', { x1: -26, y1: -34, x2: -26, y2: 34, stroke: shade('#C9764F', 0.1), 'stroke-width': 3 }),
    kit.svg('line', { x1: -16, y1: -20, x2: 16, y2: -20, stroke: '#C9764F', 'stroke-width': 3, opacity: 0.5 }),
    kit.svg('line', { x1: -16, y1: -6, x2: 16, y2: -6, stroke: '#C9764F', 'stroke-width': 3, opacity: 0.5 }),
    kit.svg('rect', { x: 10, y: -38, width: 10, height: 30, fill: '#00A862' }),
  ];
}
function iconKeys(kit) {
  const key = (rot, len) => kit.svg('g', { transform: `rotate(${rot})` }, [
    kit.svg('circle', { cx: 0, cy: -len, r: 11, fill: 'none', stroke: '#F2D98A', 'stroke-width': 6 }),
    kit.svg('line', { x1: 0, y1: -len + 11, x2: 0, y2: 6, stroke: '#F2D98A', 'stroke-width': 6 }),
    kit.svg('line', { x1: 0, y1: 0, x2: 8, y2: 0, stroke: '#F2D98A', 'stroke-width': 6 }),
    kit.svg('line', { x1: 0, y1: 6, x2: 10, y2: 6, stroke: '#F2D98A', 'stroke-width': 6 }),
  ]);
  return [
    kit.svg('circle', { cx: 0, cy: -34, r: 8, fill: 'none', stroke: '#0D0D0E', 'stroke-width': 4 }),
    key(-14, 24), key(10, 20),
  ];
}
function iconApple(kit) {
  return [
    kit.svg('path', { d: 'M 0 -18 C -28 -18 -34 20 -14 34 C -4 40 4 40 14 34 C 34 20 28 -18 0 -18 Z', fill: '#C9764F' }),
    kit.svg('path', { d: 'M 0 -18 C -28 -18 -34 20 -14 34 C -10 37 -6 38 -2 38 C -16 20 -14 -6 0 -18 Z', fill: shade('#C9764F', 0.18), opacity: 0.6 }),
    kit.svg('path', { d: 'M 0 -18 Q 2 -30 -6 -36', fill: 'none', stroke: '#6E4A33', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    kit.svg('path', { d: 'M -2 -30 Q 10 -36 14 -26 Q 2 -24 -2 -30 Z', fill: '#2F4F46' }),
  ];
}
function iconSunglasses(kit) {
  return [
    kit.svg('circle', { cx: -24, cy: 0, r: 22, fill: '#0D0D0E' }),
    kit.svg('circle', { cx: 24, cy: 0, r: 22, fill: '#0D0D0E' }),
    kit.svg('circle', { cx: -28, cy: -6, r: 7, fill: tint('#0D0D0E', 0.5), opacity: 0.5 }),
    kit.svg('circle', { cx: 20, cy: -6, r: 7, fill: tint('#0D0D0E', 0.5), opacity: 0.5 }),
    kit.svg('line', { x1: -4, y1: -2, x2: 4, y2: -2, stroke: '#0D0D0E', 'stroke-width': 6, 'stroke-linecap': 'round' }),
    kit.svg('line', { x1: -46, y1: -6, x2: -58, y2: -14, stroke: '#0D0D0E', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    kit.svg('line', { x1: 46, y1: -6, x2: 58, y2: -14, stroke: '#0D0D0E', 'stroke-width': 5, 'stroke-linecap': 'round' }),
  ];
}

const ITEMS = [
  { label: 'water bottle', icon: iconBottle },
  { label: 'book', icon: iconBook },
  { label: 'keys', icon: iconKeys },
  { label: 'apple', icon: iconApple },
  { label: 'sunglasses', icon: iconSunglasses },
];
const SLOTS = ITEMS.length + 1;

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const denim = '#4A5C78';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#E8DFCF' }));

  shadow(kit, { cx: 500, cy: 900, rx: 280, ry: 24, opacity: 0.14, parent: svg });

  // a real-looking denim tote: a body with a folded top rim, stitched handles, a pocket
  const bagColor = denim, bagDark = shade(denim, 0.16), bagLight = tint(denim, 0.14);
  const bag = kit.svg('path', { d: 'M 290,300 L 300,860 Q 500,900 700,860 L 710,300 Z', fill: bagColor });
  const bagShadeSide = kit.svg('path', { d: 'M 290,300 L 300,860 Q 360,872 420,878 L 405,300 Z', fill: bagDark, opacity: 0.45 });
  const rim = kit.svg('path', { d: 'M 280,300 Q 500,340 720,300 L 712,254 Q 500,292 288,254 Z', fill: bagLight });
  const stitchTop = kit.svg('path', { d: 'M 296,276 Q 500,314 704,276', fill: 'none', stroke: '#F2D98A', 'stroke-width': 3, 'stroke-dasharray': '7 7', opacity: 0.7 });
  const pocket = kit.svg('rect', { x: 400, y: 560, width: 200, height: 150, rx: 10, fill: 'none', stroke: bagLight, 'stroke-width': 4, 'stroke-dasharray': '2 8', opacity: 0.6 });
  const handle = kit.svg('path', { d: 'M 400,262 C 400,150 600,150 600,262', fill: 'none', stroke: bagDark, 'stroke-width': 20, 'stroke-linecap': 'round' });
  const handleHi = kit.svg('path', { d: 'M 400,262 C 400,150 600,150 600,262', fill: 'none', stroke: bagColor, 'stroke-width': 10, 'stroke-linecap': 'round' });
  svg.append(bag, bagShadeSide, pocket, rim, stitchTop, handle, handleHi);

  const slotXs = [370, 440, 510, 580, 630];
  const slotY = 630;
  const slots = slotXs.map((x) => kit.svg('circle', { cx: x, cy: slotY, r: 30, fill: 'none', stroke: '#F7F5F1', 'stroke-width': 4, 'stroke-dasharray': '5 7', opacity: 0.7 }));
  slots.forEach((s) => svg.append(s));

  const dropZone = kit.svg('g', { transform: 'translate(500 500) scale(2)' });
  svg.append(dropZone);

  const caption = kit.svg('text', { x: 500, y: 945, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 22, fill: '#0D0D0E', text: '' });
  svg.append(caption);

  const head = heading(kit, { parent: kit.stage, line: 'make room for it.', hint: 'pack the bag.' });
  let hintHidden = false;

  const btnWrap = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '3%', textAlign: 'center' } });
  const packBtn = kit.el('button', { class: 'g-btn solid', id: 'pack', text: 'Pack it' });
  btnWrap.append(packBtn);
  kit.stage.append(btnWrap);

  let bot;
  let step = 0, won = false;
  draw();

  function draw() {
    dropZone.replaceChildren();
    if (step < ITEMS.length) {
      const it = ITEMS[step];
      dropZone.append(...it.icon(kit));
      caption.textContent = it.label;
      kit.status(step === ITEMS.length - 1 ? 'one more space, then it.' : `${step}/${SLOTS} packed`);
      packBtn.textContent = 'Pack it';
    } else {
      caption.textContent = 'it wants in.';
      kit.status(`${ITEMS.length}/${SLOTS} — make room`);
      packBtn.textContent = 'Let it climb in';
      bot = createBot(kit, { cx: -40, cy: 60, r: 56, bg: card });
      dropZone.append(bot.group);
      bot.tilt(-10);
    }
  }

  function pack() {
    if (won) return;
    if (!hintHidden) { hintHidden = true; head.hide(); }
    const slot = slots[step];
    slot.setAttribute('fill', step < ITEMS.length ? tint(denim, 0.5) : accent);
    slot.setAttribute('stroke-dasharray', 'none');
    slot.setAttribute('opacity', 1);
    step++;
    if (step >= SLOTS) { finish(); return; }
    draw();
  }

  function finish() {
    won = true;
    btnWrap.remove();
    caption.textContent = 'room made.';
    kit.status(`${SLOTS}/${SLOTS}`);
    // the bot climbs down inside the bag until only its eyes peek over the rim
    const climb = () => {
      dropZone.setAttribute('transform', 'translate(500 500)');
      dropZone.replaceChildren();
      bot = createBot(kit, { cx: 0, cy: 150, r: 170, bg: bagColor });
      dropZone.append(bot.group);
      bot.height(1);
      animateIn();
    };
    climb();
    function animateIn() {
      let t = 0;
      kit.loop((dt) => {
        t += dt;
        const p = Math.min(1, t / 650);
        bot.moveTo(0, 150 - p * 120);
        if (p >= 1) {
          winBeat(kit, svg, 'there was room.', { message: 'there was room.', delay: 1100 });
          return false;
        }
      });
    }
  }

  kit.on(btnWrap, 'pointerdown', pack);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); pack(); } });
}

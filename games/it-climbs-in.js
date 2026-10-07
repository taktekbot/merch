// B14 — denim tote, "eyes peeking over the top edge." Unlock: you pack the bag; it keeps
// climbing in. Make room for it.
import { createBot } from './_bot.js';

function iconSunglasses(kit, ink) {
  return [
    kit.svg('circle', { cx: -24, cy: 0, r: 20, fill: 'none', stroke: ink, 'stroke-width': 7 }),
    kit.svg('circle', { cx: 24, cy: 0, r: 20, fill: 'none', stroke: ink, 'stroke-width': 7 }),
    kit.svg('line', { x1: -4, y1: -2, x2: 4, y2: -2, stroke: ink, 'stroke-width': 7, 'stroke-linecap': 'round' }),
  ];
}
function iconBook(kit, ink) {
  return [
    kit.svg('rect', { x: -26, y: -32, width: 52, height: 64, rx: 6, fill: 'none', stroke: ink, 'stroke-width': 7 }),
    kit.svg('line', { x1: 0, y1: -32, x2: 0, y2: 32, stroke: ink, 'stroke-width': 5 }),
  ];
}
function iconBottle(kit, ink) {
  return [
    kit.svg('rect', { x: -7, y: -48, width: 14, height: 12, rx: 3, fill: 'none', stroke: ink, 'stroke-width': 6 }),
    kit.svg('rect', { x: -16, y: -20, width: 32, height: 58, rx: 12, fill: 'none', stroke: ink, 'stroke-width': 7 }),
    kit.svg('line', { x1: -7, y1: -36, x2: 7, y2: -36, stroke: ink, 'stroke-width': 6 }),
  ];
}
function iconSocks(kit, ink) {
  return [
    kit.svg('rect', { x: -16, y: -34, width: 22, height: 40, rx: 8, fill: 'none', stroke: ink, 'stroke-width': 7 }),
    kit.svg('rect', { x: -2, y: 10, width: 34, height: 20, rx: 8, fill: 'none', stroke: ink, 'stroke-width': 7 }),
  ];
}

const ITEMS = [
  { label: 'sunglasses', icon: iconSunglasses },
  { label: 'book', icon: iconBook },
  { label: 'bottle', icon: iconBottle },
  { label: 'socks', icon: iconSocks },
];
const SLOTS = 5;

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const oat = '#E8DFCF';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const bag = kit.svg('path', { d: 'M 280,260 L 310,680 L 690,680 L 720,260 Z', fill: card, stroke: ink, 'stroke-width': 8 });
  const handle = kit.svg('path', { d: 'M 400,260 C 400,170 600,170 600,260', fill: 'none', stroke: ink, 'stroke-width': 14 });
  svg.append(bag, handle);

  const slotXs = [370, 440, 510, 580, 630];
  const slotY = 620;
  const slots = slotXs.map((x) => kit.svg('circle', { cx: x, cy: slotY, r: 28, fill: 'none', stroke: ink, 'stroke-width': 5, 'stroke-dasharray': '5 7' }));
  slots.forEach((s) => svg.append(s));

  const dropZone = kit.svg('g', { transform: 'translate(500 420)' });
  svg.append(dropZone);

  const caption = kit.svg('text', { x: 500, y: 745, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 24, fill: ink, text: '' });
  svg.append(caption);

  const btnGroup = kit.svg('g', { style: { cursor: 'pointer' }, id: 'pack' });
  const btnBg = kit.svg('rect', { x: 370, y: 820, width: 260, height: 90, rx: 45, fill: ink });
  const btnLabel = kit.svg('text', { x: 500, y: 875, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 700, 'font-size': 32, fill: card, text: 'Pack it' });
  btnGroup.append(btnBg, btnLabel);
  svg.append(btnGroup);

  let step = 0, won = false;
  draw();

  function draw() {
    dropZone.replaceChildren();
    if (step < ITEMS.length) {
      const it = ITEMS[step];
      dropZone.append(...it.icon(kit, ink));
      caption.textContent = it.label;
      kit.status(step === ITEMS.length - 1 ? 'one more space, then it.' : `${step}/${SLOTS} packed`);
      btnLabel.textContent = 'Pack it';
    } else {
      const bot = createBot(kit, { cx: 0, cy: 0, r: 70, bg: card });
      dropZone.append(bot.group);
      caption.textContent = 'it wants in.';
      kit.status('5/5 — make room');
      btnLabel.textContent = 'Let it climb in';
    }
  }

  function pack() {
    if (won) return;
    const slot = slots[step];
    slot.setAttribute('fill', step < ITEMS.length ? oat : accent);
    slot.setAttribute('stroke-dasharray', 'none');
    step++;
    if (step >= SLOTS) { finish(); return; }
    draw();
  }

  function finish() {
    won = true;
    dropZone.replaceChildren();
    caption.textContent = 'room made.';
    btnGroup.remove();
    kit.status(`${SLOTS}/${SLOTS}`);
    kit.win('there was room.');
  }

  kit.on(btnGroup, 'pointerdown', pack);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); pack(); } });
}

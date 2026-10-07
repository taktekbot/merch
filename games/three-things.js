// B18 — hardcover journal, "things i learned today." Unlock: teach it three true things,
// each in a sentence; it writes them in its journal, in its handwriting, at a desk with a
// lamp on, per POLISH.md's critique.
import { createBot, room, lamp, shadow, heading, shade, tint } from './_bot.js';
import { winBeat } from './_bot2.js';

const NEED = 3;
const TILTS = [-1.1, 0.9, -0.6];
const PAGE_W = 236, LINE_W = 20; // rough chars per line at the journal's font size

function wrap(text) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > LINE_W && cur) { lines.push(cur); cur = w; } else { cur = next; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

export default function mount(kit) {
  const entries = kit.memory.get('entries', []);
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const wood = '#6E4A33';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#2F4F46', floor: shade(wood, 0.1), floorY: 760 });
  const lampFixture = lamp(kit, { parent: svg, x: 830, y: 690, on: true, color: '#F2D98A' });

  shadow(kit, { cx: 500, cy: 800, rx: 440, ry: 18, opacity: 0.12, parent: svg });
  const deskTop = kit.svg('rect', { x: 60, y: 736, width: 880, height: 70, rx: 12, fill: tint(wood, 0.1) });
  const deskFront = kit.svg('rect', { x: 60, y: 780, width: 880, height: 120, fill: wood });
  svg.append(deskTop, deskFront);

  const bot = createBot(kit, { cx: 230, cy: 560, r: 150, bg: card });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2600, max: 4400 });
  // a small pencil held at the bot's side
  const pencil = kit.svg('g', { transform: 'translate(362 630) rotate(42)' }, [
    kit.svg('rect', { x: 0, y: -5, width: 86, height: 10, rx: 4, fill: '#F2D98A' }),
    kit.svg('path', { d: 'M 86 -5 L 104 0 L 86 5 Z', fill: '#0D0D0E' }),
    kit.svg('rect', { x: 0, y: -5, width: 14, height: 10, fill: '#F2A6A6' }),
  ]);

  // the open journal: two paper pages with a spine, laid on the desk at a gentle angle
  const journal = kit.svg('g', { transform: 'translate(500 600)' });
  const spine = kit.svg('rect', { x: -6, y: -150, width: 12, height: 300, fill: shade('#F7F5F1', 0.1) });
  const pageL = kit.svg('g', { transform: `rotate(-2.4) translate(${-PAGE_W - 6} -150)` });
  const pageR = kit.svg('g', { transform: `rotate(2.2) translate(6 -150)` });
  const mkPage = (g) => {
    const rect = kit.svg('rect', { x: 0, y: 0, width: PAGE_W, height: 300, rx: 8, fill: '#F7F5F1', stroke: shade('#F7F5F1', 0.1), 'stroke-width': 2 });
    g.append(rect);
    return rect;
  };
  mkPage(pageL); mkPage(pageR);
  journal.append(pageL, spine, pageR);
  svg.append(journal);
  svg.append(pencil);

  const title = kit.svg('text', { x: 500, y: 490, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-style': 'italic', 'font-size': 20, fill: '#0D0D0E', opacity: 0.7, text: 'things i learned today.' });
  svg.append(title);

  const entryLayer = kit.svg('g', {});
  journal.append(entryLayer);

  function renderPage() {
    entryLayer.replaceChildren();
    const slots = [[6, 46], [6, 136], [6, 226]]; // x,y within right page local space, one entry per block
    entries.forEach((entry, i) => {
      if (!slots[i]) return;
      const [sx, sy] = slots[i];
      const lines = wrap(entry);
      const t = kit.svg('text', {
        x: sx, y: sy, 'font-family': 'var(--mono)', 'font-style': 'italic', 'font-size': 15,
        fill: '#0D0D0E', transform: 'rotate(2.2) translate(6 -150)',
      });
      lines.forEach((ln, li) => {
        t.append(kit.svg('tspan', { x: sx, dy: li === 0 ? 0 : 19, text: ln }));
      });
      entryLayer.append(t);
    });
  }
  renderPage();

  const head = heading(kit, { parent: kit.stage, line: 'things i learned today.', hint: 'tell it something true you learned today.', color: '#F7F5F1', hintColor: '#B9C6D2' });
  let hintHidden = false;

  const row = kit.el('div', { style: { position: 'absolute', left: '6%', right: '6%', bottom: '4%', display: 'flex', gap: '8px' } });
  const input = kit.el('input', { type: 'text', placeholder: 'something true you learned today…', style: { flex: '1', font: '15px var(--display)', padding: '10px 12px', border: '1px solid var(--rule)', borderRadius: '10px', background: 'var(--paper)', color: 'var(--ink)' } });
  const add = kit.el('button', { class: 'g-btn solid', id: 'teach', text: 'Teach it' });
  row.append(input, add);
  kit.stage.append(row);

  kit.status(`${entries.length}/${NEED}`);

  function submit() {
    const text = input.value.trim();
    if (!text) return;
    if (!hintHidden) { hintHidden = true; head.hide(); }
    entries.push(text);
    kit.memory.set('entries', entries);
    input.value = '';
    renderPage();
    bot.tilt(TILTS[(entries.length - 1) % TILTS.length]);
    bot.squash(kit, { amount: 0.1, duration: 160 });
    kit.status(`${entries.length}/${NEED}`);
    if (entries.length >= NEED) finish();
  }

  function finish() {
    row.remove();
    bot.tilt(0);
    bot.look(0, -3);
    bot.squash(kit, { amount: 0.2, duration: 220 });
    winBeat(kit, svg, 'it knows three things now.', { message: 'it knows three things now.', delay: 1100 });
  }

  add.onclick = submit;
  kit.on(input, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  if (entries.length >= NEED) finish();
}

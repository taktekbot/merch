// B11 — luggage tag, "curious, not very independent. if found, please call."
// Unlock: follow the terminal signs to gate 12 before it closes.
import { createBot } from './_bot.js';

const DIRS = ['up', 'down', 'left', 'right'];
const ARROW = { up: '↑', down: '↓', left: '←', right: '→' };
const TOTAL_SIGNS = 5;
const TOTAL_MS = 26000;

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const muted = (kit.colors && kit.colors.muted) || '#6B6A66';
  const accent = (kit.colors && kit.colors.accent) || '#00A862';

  const wrap = kit.el('div', { class: 'g-center', style: { flexDirection: 'column', gap: '18px' } });
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '70%', maxWidth: '420px' } });
  const signBg = kit.svg('rect', { x: 140, y: 330, width: 720, height: 220, rx: 24, fill: card, stroke: ink, 'stroke-width': 6 });
  const signTitle = kit.svg('text', { x: 500, y: 400, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 28, fill: muted, text: 'GATE 12' });
  const arrow = kit.svg('text', { x: 500, y: 500, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 700, 'font-size': 150, fill: ink, text: '↑' });
  svg.append(signBg, signTitle, arrow);
  wrap.append(svg);

  const pad = kit.el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } });
  const row1 = kit.el('div', {}, [btn('up', '↑')]);
  const row2 = kit.el('div', { style: { display: 'flex', gap: '10px' } }, [btn('left', '←'), btn('down', '↓'), btn('right', '→')]);
  pad.append(row1, row2);
  wrap.append(pad);

  const line = kit.el('p', { class: 'g-mono', text: 'Will the owner of a small curious bot come to gate 12.' });
  wrap.append(line);
  kit.stage.append(wrap);

  function btn(dir, glyph) {
    const b = kit.el('button', { class: 'g-btn', text: glyph, 'data-dir': dir, style: { width: '56px', height: '56px', padding: '0' } });
    b.onclick = () => tryDir(dir);
    return b;
  }

  let signsDone = 0, need = pick(), startedAt = kit.now().getTime(), finished = false;
  kit.stage.dataset.need = need; // for scripted testing
  showSign();

  function pick() { return DIRS[Math.floor(Math.random() * DIRS.length)]; }

  function showSign() {
    arrow.textContent = ARROW[need];
    kit.status(`sign ${signsDone + 1}/${TOTAL_SIGNS}`);
  }

  function tryDir(dir) {
    if (finished) return;
    if (dir !== need) { kit.status(`sign ${signsDone + 1}/${TOTAL_SIGNS} · wrong way`); return; }
    signsDone++;
    if (signsDone >= TOTAL_SIGNS) { arrived(); return; }
    need = pick();
    kit.stage.dataset.need = need;
    showSign();
  }

  kit.on(window, 'keydown', (e) => {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) { e.preventDefault(); tryDir(map[e.key]); }
  });

  kit.loop(() => {
    if (finished) return false;
    const left = Math.max(0, TOTAL_MS - (kit.now().getTime() - startedAt));
    signBg.setAttribute('stroke', left < 5000 ? accent : ink);
    if (left <= 0) { closed(); return false; }
  });

  function closed() {
    if (finished) return;
    arrow.textContent = '·';
    signTitle.textContent = 'CLOSED';
    line.textContent = "Gate's closed. Try again.";
    kit.status('closed');
    const again = kit.el('button', { class: 'g-btn solid', text: 'Run for it again' });
    again.onclick = () => location.reload();
    wrap.append(again);
    finished = true;
  }

  function arrived() {
    finished = true;
    wrap.replaceChildren();
    const bsvg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '55%', maxWidth: '320px' } });
    const bot = createBot(kit, { cx: 500, cy: 500, r: 220, bg: card });
    bot.height(1.2, 0.1);
    bsvg.append(bot.group);
    wrap.append(bsvg, kit.el('p', { class: 'g-big', text: 'right on time.' }));
    kit.stage.append(wrap);
    kit.status(`${TOTAL_SIGNS}/${TOTAL_SIGNS}`);
    kit.win('right on time.');
  }
}

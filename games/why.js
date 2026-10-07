// B17 — crewneck, "curious. + face looking up." Unlock: answer every why, five times,
// then: "oh."
import { createBot } from './_bot.js';

const QUESTIONS = ['why?', 'but why?', 'why though?', 'okay but why?', 'why?'];
const TOTAL = QUESTIONS.length;

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';

  const wrap = kit.el('div', { class: 'g-center', style: { flexDirection: 'column', gap: '18px' } });
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '45%', maxWidth: '260px' } });
  const bot = createBot(kit, { cx: 500, cy: 500, r: 260, bg: card });
  svg.append(bot.group);
  const question = kit.el('p', { class: 'g-big', text: QUESTIONS[0] });
  const btn = kit.el('button', { class: 'g-btn solid', id: 'answer', text: 'Because.' });
  wrap.append(svg, question, btn);
  kit.stage.append(wrap);

  bot.tilt(9);
  bot.look(8, -12);
  kit.status(`0/${TOTAL}`);

  let n = 0, won = false;

  function answer() {
    if (won) return;
    n++;
    if (n >= TOTAL) { finish(); return; }
    question.textContent = QUESTIONS[n];
    bot.tilt(n % 2 ? -9 : 9);
    kit.status(`${n}/${TOTAL}`);
    bot.height(0.6);
    kit.after(140, () => bot.height(1));
  }

  function finish() {
    won = true;
    bot.tilt(0);
    bot.look(0, -4);
    bot.height(0.42);
    bot.curl(22);
    question.textContent = 'oh.';
    btn.remove();
    kit.status(`${TOTAL}/${TOTAL}`);
    kit.win('oh.');
  }

  btn.onclick = answer;
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); answer(); } });
}

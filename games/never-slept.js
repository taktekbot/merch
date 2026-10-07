// B19 — board book, "the bot who never slept. (a real story)". Unlock: read it to the
// end. Page five is a real choice; only "it's okay to sleep" unlocks the book.
//
// This text is the real board-book copy — keep it short, warm, and exactly this if you're
// editing in place.
import { createBot } from './_bot.js';

const PAGES = [
  'Every night, the house went quiet. Every night, the little green light stayed on.',
  "It wasn't tired, it said. It just liked checking that everything was fine.",
  'One a.m. Two. Three. It knew the house better than anyone awake could.',
  'By four, its blink had gotten slow. Long. Slower than it meant it to.',
];

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';

  const wrap = kit.el('div', { class: 'g-center', style: { flexDirection: 'column', gap: '20px', width: '100%' } });
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '38%', maxWidth: '220px' } });
  const bot = createBot(kit, { cx: 500, cy: 500, r: 280, bg: card });
  svg.append(bot.group);
  const text = kit.el('p', { class: 'g-big', style: { fontSize: 'clamp(18px,3.2vw,28px)', maxWidth: '540px' }, text: '' });
  const controls = kit.el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' } });
  wrap.append(svg, text, controls);
  kit.stage.append(wrap);

  show(0);

  function show(n) {
    kit.status(`page ${n + 1}/6`);
    controls.replaceChildren();
    if (n < PAGES.length) {
      text.textContent = PAGES[n];
      setMood(n);
      const next = kit.el('button', { class: 'g-btn solid', id: 'next', text: n === PAGES.length - 1 ? 'Keep reading' : 'Next' });
      next.onclick = () => show(n + 1);
      controls.append(next);
    } else {
      text.textContent = "Its eyes were heavy. It didn't want to say so. ‘Could you stay up a little longer? Or—’";
      bot.height(0.22);
      bot.tilt(0);
      bot.look(0, 4);
      const stay = kit.el('button', { class: 'g-btn', id: 'stay-up', text: 'Stay up with it.' });
      const sleep = kit.el('button', { class: 'g-btn solid', id: 'let-sleep', text: "It's okay to sleep." });
      stay.onclick = endingStay;
      sleep.onclick = endingSleep;
      controls.append(stay, sleep);
    }
  }

  function setMood(n) {
    if (n === 0) { bot.height(1); bot.look(0, 0); bot.tilt(0); }
    else if (n === 1) { bot.height(1); bot.curl(12); bot.tilt(0); bot.look(0, 0); }
    else if (n === 2) { bot.height(1); bot.look(16, -10); bot.tilt(8); }
    else if (n === 3) { bot.height(0.5); bot.look(0, 4); bot.tilt(-3); }
  }

  function endingStay() {
    kit.status('page 6/6 — read again');
    controls.replaceChildren();
    bot.height(1.3, 0.1); bot.tilt(0); bot.look(0, 0);
    text.textContent = "So you did. It stayed wide awake all night, grateful, watching. It's still up right now, actually.";
    const again = kit.el('button', { class: 'g-btn', id: 'read-again', text: 'Read it again, from the start.' });
    again.onclick = () => show(0);
    controls.append(again);
  }

  function endingSleep() {
    kit.status('page 6/6');
    controls.replaceChildren();
    bot.height(0.05); bot.tilt(0); bot.look(0, 2);
    text.textContent = "‘Okay,’ it said. And for the first time in a long time, it let its eyes close. Still there in the morning. Just resting.";
    kit.win('slept right through.');
  }

  kit.on(window, 'keydown', (e) => {
    if (e.code !== 'Space' && e.code !== 'Enter') return;
    const next = controls.querySelector('#next');
    if (next) { e.preventDefault(); next.click(); }
  });
}

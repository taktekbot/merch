// B20 — pin buttons, five moods: happy, sleepy, curious, side-eye, shocked. Unlock: a
// moment from life, pick the face. Five rounds.
import { createBot, MOODS } from './_bot.js';

const ROUNDS = [
  { prompt: 'the package arrived early.', mood: 'happy' },
  { prompt: "it's 1am and the house is finally quiet.", mood: 'sleepy' },
  { prompt: "a drawer that's never been opened.", mood: 'curious' },
  { prompt: '"it wasn\'t me," they said, next to the broken vase.', mood: 'side-eye' },
  { prompt: 'the bill was triple what it should be.', mood: 'shocked' },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const order = shuffle(ROUNDS);
  const moodNames = Object.keys(MOODS);

  const wrap = kit.el('div', { class: 'g-center', style: { flexDirection: 'column', gap: '16px' } });
  const prompt = kit.el('p', { style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: 'clamp(16px, 4.2vw, 24px)', lineHeight: '1.25', maxWidth: '36ch', margin: '0' }, text: '' });
  const facesRow = kit.el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } });
  wrap.append(prompt, facesRow);
  kit.stage.append(wrap);

  let round = 0, score = 0;

  function draw() {
    const r = order[round];
    prompt.textContent = r.prompt;
    kit.status(`${score}/${ROUNDS.length}`);
    facesRow.replaceChildren();
    const faces = shuffle(moodNames);
    for (const mood of faces) {
      const btn = kit.el('button', { class: 'g-btn', style: { padding: '6px', width: 'clamp(52px, 16vw, 92px)', height: 'clamp(52px, 16vw, 92px)', borderRadius: '50%', flex: '0 0 auto' } });
      if (mood === r.mood) btn.setAttribute('data-hit', '1');
      const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '100%', height: '100%' } });
      const bot = createBot(kit, { cx: 500, cy: 500, r: 300, bg: card });
      MOODS[mood](bot);
      svg.append(bot.group);
      btn.append(svg);
      btn.onclick = () => pick(mood, r.mood, btn);
      facesRow.append(btn);
    }
  }

  function pick(chosen, correct, btn) {
    if (chosen === correct) {
      score++;
      round++;
      if (round >= ROUNDS.length) { finish(); return; }
      draw();
    } else {
      btn.style.opacity = '0.35';
      kit.status(`${score}/${ROUNDS.length} — try another`);
    }
  }

  function finish() {
    wrap.replaceChildren(kit.el('p', { class: 'g-big', text: 'five for five.' }));
    kit.status(`${ROUNDS.length}/${ROUNDS.length}`);
    kit.win('five for five.');
  }

  draw();
}

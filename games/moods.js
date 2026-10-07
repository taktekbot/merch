// B20 — pin buttons, five moods: happy, sleepy, curious, side-eye, shocked. Unlock: a
// moment from life drawn as a tiny scene card, pick the matching face. Five rounds.
import { createBot, MOODS, shadow, heading, shade, tint } from './_bot.js';
import { winBeat, paperCard } from './_bot2.js';

function iconPackage(kit, ink) {
  return [
    kit.svg('rect', { x: -40, y: -32, width: 80, height: 64, rx: 6, fill: '#E8DFCF', stroke: ink, 'stroke-width': 6 }),
    kit.svg('line', { x1: -40, y1: 0, x2: 40, y2: 0, stroke: ink, 'stroke-width': 6 }),
    kit.svg('line', { x1: 0, y1: -32, x2: 0, y2: 32, stroke: ink, 'stroke-width': 6 }),
    kit.svg('path', { d: 'M -14 -32 Q 0 -54 14 -32', fill: 'none', stroke: '#C9764F', 'stroke-width': 7 }),
  ];
}
function iconMoon(kit, ink) {
  return [
    kit.svg('path', { d: 'M 18 -34 A 34 34 0 1 0 18 34 A 26 26 0 1 1 18 -34 Z', fill: ink }),
    kit.svg('circle', { cx: -34, cy: -18, r: 3, fill: ink, opacity: 0.6 }),
    kit.svg('circle', { cx: -42, cy: 6, r: 2.4, fill: ink, opacity: 0.5 }),
  ];
}
function iconDrawer(kit, ink) {
  return [
    kit.svg('rect', { x: -42, y: -36, width: 84, height: 72, rx: 6, fill: '#E8DFCF', stroke: ink, 'stroke-width': 6 }),
    kit.svg('rect', { x: -32, y: -10, width: 64, height: 34, rx: 4, fill: 'none', stroke: ink, 'stroke-width': 5 }),
    kit.svg('line', { x1: -8, y1: 7, x2: 8, y2: 7, stroke: ink, 'stroke-width': 6, 'stroke-linecap': 'round' }),
  ];
}
function iconVase(kit, ink) {
  return [
    kit.svg('path', { d: 'M -14 -40 Q -22 -10 -26 10 Q -26 34 0 34 Q 26 34 26 10 Q 22 -10 14 -40 Z', fill: '#8FA6B8', opacity: 0.85 }),
    kit.svg('line', { x1: -26, y1: 12, x2: -6, y2: 2, stroke: ink, 'stroke-width': 4, opacity: 0.8 }),
    kit.svg('line', { x1: -6, y1: 2, x2: 10, y2: 18, stroke: ink, 'stroke-width': 4, opacity: 0.8 }),
    kit.svg('circle', { cx: 32, cy: 30, r: 6, fill: '#8FA6B8', opacity: 0.6 }),
    kit.svg('circle', { cx: -30, cy: 34, r: 4, fill: '#8FA6B8', opacity: 0.6 }),
  ];
}
function iconBill(kit, ink) {
  return [
    kit.svg('path', { d: 'M -26 -40 L 26 -40 L 26 40 L 16 32 L 6 40 L -4 32 L -14 40 L -26 32 Z', fill: '#F7F5F1', stroke: ink, 'stroke-width': 5 }),
    kit.svg('line', { x1: -14, y1: -22, x2: 14, y2: -22, stroke: ink, 'stroke-width': 4, opacity: 0.5 }),
    kit.svg('line', { x1: -14, y1: -8, x2: 14, y2: -8, stroke: ink, 'stroke-width': 4, opacity: 0.5 }),
    kit.svg('text', { x: 0, y: 14, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-weight': 700, 'font-size': 20, fill: '#C9764F', text: '3×' }),
  ];
}

const ROUNDS = [
  { prompt: 'the package arrived early.', mood: 'happy', icon: iconPackage },
  { prompt: "it's 1am and the house is finally quiet.", mood: 'sleepy', icon: iconMoon },
  { prompt: "a drawer that's never been opened.", mood: 'curious', icon: iconDrawer },
  { prompt: '"it wasn\'t me," they said, next to the broken vase.', mood: 'side-eye', icon: iconVase },
  { prompt: 'the bill was triple what it should be.', mood: 'shocked', icon: iconBill },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = (kit.colors && kit.colors.ink) || '#0D0D0E';
  const order = shuffle(ROUNDS);
  const moodNames = Object.keys(MOODS);

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#F7F5F1' }));

  const sceneCard = paperCard(kit, { parent: svg, x: 180, y: 90, w: 640, h: 360, rx: 28, fill: '#EFECE6' });
  // a few quiet dots for texture, per POLISH.md rule 3
  for (let i = 0; i < 10; i++) {
    svg.append(kit.svg('circle', { cx: 220 + (i % 5) * 140, cy: 120 + Math.floor(i / 5) * 300, r: 3, fill: ink, opacity: 0.05 }));
  }
  const iconGroup = kit.svg('g', { transform: 'translate(500 270)' });
  svg.append(iconGroup);
  const promptText = kit.svg('text', {
    x: 500, y: 400, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 600,
    'font-size': 26, fill: ink, text: '',
  });
  svg.append(promptText);

  const head = heading(kit, { parent: kit.stage, line: 'match the mood.', hint: 'pick the face.' });
  let hintHidden = false;

  const facesRow = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '6%', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 5%' } });
  kit.stage.append(facesRow);

  let round = 0, score = 0;

  function draw() {
    const r = order[round];
    iconGroup.replaceChildren(...r.icon(kit, ink));
    promptText.textContent = r.prompt;
    kit.status(`${score}/${ROUNDS.length}`);
    facesRow.replaceChildren();
    const faces = shuffle(moodNames);
    for (const mood of faces) {
      const btn = kit.el('button', { class: 'g-btn', style: { padding: '6px', width: 'clamp(54px, 15vw, 90px)', height: 'clamp(54px, 15vw, 90px)', borderRadius: '50%', flex: '0 0 auto' } });
      const fsvg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: '100%', height: '100%' } });
      const bot = createBot(kit, { cx: 500, cy: 500, r: 300, bg: card });
      MOODS[mood](bot);
      fsvg.append(bot.group);
      btn.append(fsvg);
      btn.onclick = () => pick(mood, r.mood, btn);
      facesRow.append(btn);
    }
  }

  function pick(chosen, correct, btn) {
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (chosen === correct) {
      score++;
      round++;
      if (round >= ROUNDS.length) { finish(); return; }
      draw();
    } else {
      btn.style.opacity = '0.3';
      kit.status(`${score}/${ROUNDS.length} — try another`);
    }
  }

  function finish() {
    facesRow.remove();
    promptText.textContent = '';
    iconGroup.replaceChildren();
    kit.status(`${ROUNDS.length}/${ROUNDS.length}`);
    winBeat(kit, svg, 'five for five.', { message: 'five for five.', delay: 1000 });
  }

  draw();
}

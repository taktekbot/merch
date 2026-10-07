// B17 — crewneck, "curious. + face looking up." Unlock: answer every why, five times,
// each time picking one of three funny answers, then: "oh."
// A kitchen table scene: the bot sits up in a kid's-height chair, asking from a speech
// bubble. Its head tilts further with every "why?" per POLISH.md's critique.
import { createBot, room, sceneWindow, shadow, heading, shade, tint } from './_bot.js';
import { winBeat, speechBubble } from './_bot2.js';

const ROUNDS = [
  { q: 'why?', a: ['because gravity.', 'ask your father.', "because i said so."] },
  { q: 'but why?', a: ['still gravity.', 'google it.', 'because the sky is blue.'] },
  { q: 'why though?', a: ["it's complicated.", 'ask again later.', 'because bananas.'] },
  { q: 'okay but why?', a: ["i'll explain later.", 'because entropy.', 'no reason.'] },
  { q: 'why?', a: ['because.', 'just because.', "that's the rule."] },
];

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const wood = '#C9764F';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#E8DFCF', floor: shade(wood, 0.1), floorY: 760 });
  sceneWindow(kit, { parent: svg, x: 790, y: 190, w: 150, h: 150, sky: 'day', curtains: false });

  // a wooden high chair behind the bot: two posts + a crossbar, raised on short legs
  const chairX = 500, postW = 26, postGap = 260;
  const chairColor = shade(wood, 0.06);
  const postL = kit.svg('rect', { x: chairX - postGap / 2 - postW / 2, y: 330, width: postW, height: 420, rx: 10, fill: chairColor });
  const postR = kit.svg('rect', { x: chairX + postGap / 2 - postW / 2, y: 330, width: postW, height: 420, rx: 10, fill: chairColor });
  const crossbar = kit.svg('rect', { x: chairX - postGap / 2 - 10, y: 420, width: postGap + 20, height: 22, rx: 8, fill: shade(chairColor, 0.1) });
  svg.append(postL, postR, crossbar);

  // the table: a wide worktop crossing the foreground, with grain lines and a front edge
  shadow(kit, { cx: 500, cy: 804, rx: 440, ry: 18, opacity: 0.1, parent: svg });
  const tableTop = kit.svg('rect', { x: 60, y: 740, width: 880, height: 80, rx: 14, fill: tint(wood, 0.08) });
  const tableFront = kit.svg('rect', { x: 60, y: 788, width: 880, height: 110, fill: wood });
  const grain1 = kit.svg('line', { x1: 100, y1: 820, x2: 900, y2: 820, stroke: shade(wood, 0.16), 'stroke-width': 3, opacity: 0.5 });
  const grain2 = kit.svg('line', { x1: 100, y1: 850, x2: 900, y2: 850, stroke: shade(wood, 0.16), 'stroke-width': 3, opacity: 0.5 });
  svg.append(tableTop, tableFront, grain1, grain2);

  // a little bowl and spoon, for warmth
  const bowl = kit.svg('ellipse', { cx: 300, cy: 758, rx: 46, ry: 16, fill: '#F7F5F1' });
  const bowlIn = kit.svg('ellipse', { cx: 300, cy: 754, rx: 36, ry: 11, fill: '#8FA6B8', opacity: 0.6 });
  const spoon = kit.svg('g', { transform: 'translate(360 752) rotate(18)' }, [
    kit.svg('ellipse', { cx: 0, cy: 0, rx: 10, ry: 14, fill: '#8FA6B8' }),
    kit.svg('rect', { x: -3, y: 10, width: 6, height: 34, rx: 3, fill: '#8FA6B8' }),
  ]);
  svg.append(bowl, bowlIn, spoon);

  const bot = createBot(kit, { cx: 500, cy: 560, r: 210, bg: card, shadow: false });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2600, max: 4400 });

  const bubble = speechBubble(kit, { parent: svg, x: 500 - 170, y: 160, w: 340, h: 108, tailRight: false });
  const bubbleText = kit.svg('text', {
    x: 500, y: 220, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 700,
    'font-size': 44, fill: '#0D0D0E', text: ROUNDS[0].q,
  });
  svg.append(bubbleText);

  const head = heading(kit, { parent: kit.stage, line: 'curious.', hint: 'answer it. anything will do.' });
  let hintHidden = false;
  const hideHint = () => { if (!hintHidden) { hintHidden = true; head.hide(); } };

  const choices = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '4%', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 6%' } });
  kit.stage.append(choices);

  let n = 0, won = false;
  kit.status(`0/${ROUNDS.length}`);

  function draw() {
    const r = ROUNDS[n];
    bubbleText.textContent = r.q;
    bot.tilt(n % 2 ? -11 - n : 11 + n);
    bot.look(8, -12);
    choices.replaceChildren(...r.a.map((label) => kit.el('button', { class: 'g-btn', text: label, onclick: () => answer() })));
  }

  function answer() {
    if (won) return;
    hideHint();
    bot.height(0.55);
    kit.after(130, () => bot.height(1));
    n++;
    kit.status(`${n}/${ROUNDS.length}`);
    if (n >= ROUNDS.length) { finish(); return; }
    draw();
  }

  function finish() {
    won = true;
    choices.replaceChildren();
    bot.tilt(0);
    bot.look(0, -4);
    bot.height(0.42);
    bot.curl(22);
    bubbleText.textContent = 'oh.';
    kit.status(`${ROUNDS.length}/${ROUNDS.length}`);
    winBeat(kit, svg, 'oh.', { message: 'oh.', delay: 1100 });
  }

  draw();
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); const b = choices.querySelector('button'); if (b) b.click(); } });
}

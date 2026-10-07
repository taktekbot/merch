// B19 board book — "the bot who never slept. (a real story)". Unlock: read it to the end.
// Page five is a real choice; only "it's okay to sleep" unlocks the book.
//
// This text is the real board-book copy — keep it short, warm, and exactly this if you're
// editing in place. The pages mirror the printed book (print/B19/spread_*.png): a window
// on the wall, the sky by time of night, the bot on a shelf below it with a soft shadow, a
// cat on one page, a clock on the late pages, morning at the very end.
import { createBot, shadow, heading, mix } from './_bot.js';
import { winBeat, clockFace, cat as catIcon } from './_bot2.js';

const PAGES = [
  'Every night, the house went quiet. Every night, the little green light stayed on.',
  "It wasn't tired, it said. It just liked checking that everything was fine.",
  'One a.m. Two. Three. It knew the house better than anyone awake could.',
  'By four, its blink had gotten slow. Long. Slower than it meant it to.',
];

const NIGHT = '#1B2230';
const DIM = '#5B6B7A';
const MORNING = '#F2D98A';
const CLAY = '#C9764F';

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  // ---- the scene: wall, window, shelf, the bot --------------------------------------
  const wall = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 760, fill: NIGHT });
  svg.append(wall);

  const winX = 185, winY = 96, winW = 630, winH = 325;
  const winGroup = kit.svg('g', { transform: `translate(${winX} ${winY})` });
  const frameOuter = kit.svg('rect', { x: -10, y: -10, width: winW + 20, height: winH + 20, rx: 18, fill: mix(NIGHT, '#000000', 0.12) });
  const clipId = 'nsclip';
  const sky = kit.svg('rect', { x: 0, y: 0, width: winW, height: winH, fill: NIGHT });
  const clipPath = kit.svg('clipPath', { id: clipId }, [kit.svg('rect', { x: 0, y: 0, width: winW, height: winH, rx: 10 })]);
  const inner = kit.svg('g', { 'clip-path': `url(#${clipId})` });
  inner.append(sky);
  const moon = kit.svg('circle', { cx: winW * 0.76, cy: winH * 0.26, r: winW * 0.07, fill: '#F7F5F1' });
  const sun = kit.svg('circle', { cx: winW * 0.5, cy: winH * 0.56, r: winW * 0.16, fill: MORNING, opacity: 0 });
  const sunGlow = kit.svg('circle', { cx: winW * 0.5, cy: winH * 0.56, r: winW * 0.3, fill: MORNING, opacity: 0 });
  const stars = [];
  for (let i = 0; i < 13; i++) {
    const st = kit.svg('circle', { cx: 20 + Math.random() * (winW - 40), cy: 10 + Math.random() * (winH * 0.82), r: 2 + Math.random() * 2.4, fill: '#F7F5F1', opacity: 0.3 + Math.random() * 0.5 });
    stars.push(st); inner.append(st);
  }
  inner.append(sunGlow, sun, moon);
  const sashV = kit.svg('rect', { x: winW / 2 - 5, y: 0, width: 10, height: winH, fill: frameOuter.getAttribute('fill') });
  const sashH = kit.svg('rect', { x: 0, y: winH / 2 - 5, width: winW, height: 10, fill: frameOuter.getAttribute('fill') });
  winGroup.append(frameOuter, inner, clipPath, sashV, sashH);
  svg.append(winGroup);

  const shelf = kit.svg('rect', { x: 120, y: 593, width: 760, height: 24, rx: 6, fill: CLAY });
  const shelfEdge = kit.svg('rect', { x: 120, y: 593, width: 760, height: 7, rx: 3.5, fill: mix(CLAY, '#FFFFFF', 0.18) });
  svg.append(shelf, shelfEdge);

  let catFixture = null; // created lazily, only shown on its one page

  const bot = createBot(kit, { cx: 500, cy: 484, r: 122, bg: card, shadow: true });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 3400, max: 5600 });

  const zz = [];

  // caption / page area, below the picture --------------------------------------------
  const wrap = kit.el('div', {
    style: { position: 'absolute', left: '0', right: '0', bottom: '3%', top: '79%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '14px', padding: '0 7%', textAlign: 'center' },
  });
  const text = kit.el('p', { style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: 'clamp(15px, 2.6vw, 21px)', lineHeight: '1.3', margin: '0', maxWidth: '58ch', color: 'var(--ink)' }, text: '' });
  const controls = kit.el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' } });
  wrap.append(text, controls);
  kit.stage.append(wrap);

  const head = heading(kit, { parent: kit.stage, line: 'the bot who never slept.', hint: 'tap next to keep reading.', color: '#F7F5F1', hintColor: '#8FA6B8' });
  let hintHidden = false;
  const hideHint = () => { if (!hintHidden) { hintHidden = true; head.hide(); } };

  function setStars(opacity, count = 13) {
    stars.forEach((st, i) => st.setAttribute('opacity', i < count ? Number(st.dataset.base || st.getAttribute('opacity')) * opacity : 0));
  }
  stars.forEach((st) => st.dataset && (st.dataset.base = st.getAttribute('opacity')));

  function showClock(hour, minute) {
    if (showClock._fx) { showClock._fx.group.remove(); showClock._fx = null; }
    showClock._fx = clockFace(kit, { parent: svg, x: 735, y: 545, r: 46, hour, minute });
  }
  function hideClock() { if (showClock._fx) { showClock._fx.group.remove(); showClock._fx = null; } }

  function showCat(on) {
    if (on && !catFixture) { catFixture = catIcon(kit, { parent: svg, x: 240, y: 605, scale: 0.72 }); }
    if (!on && catFixture) { catFixture.group.remove(); catFixture = null; }
  }

  function show(n) {
    kit.status(`page ${n + 1}/6`);
    controls.replaceChildren();
    if (n < PAGES.length) {
      text.textContent = PAGES[n];
      wall.setAttribute('fill', NIGHT);
      sky.setAttribute('fill', NIGHT);
      sun.setAttribute('opacity', 0); sunGlow.setAttribute('opacity', 0);
      moon.setAttribute('opacity', 1);
      showCat(n === 1);
      if (n === 0) { setStars(0.85, 10); hideClock(); bot.height(1); bot.curl(0); bot.tilt(0); bot.look(0, 0); }
      else if (n === 1) { setStars(0.85, 10); hideClock(); bot.height(1); bot.curl(10); bot.tilt(0); bot.look(0, 0); }
      else if (n === 2) { setStars(1, 13); showClock(1.5, 30); bot.height(1); bot.curl(0); bot.tilt(-2); bot.look(6, -4); }
      else if (n === 3) { setStars(0.55, 8); showClock(4, 5); bot.height(0.5, 0.55); bot.curl(0); bot.tilt(-3); bot.look(0, 3); }
      const next = kit.el('button', { class: 'g-btn solid', id: 'next', text: n === PAGES.length - 1 ? 'Keep reading' : 'Next', onclick: () => { hideHint(); show(n + 1); } });
      controls.append(next);
    } else {
      showCat(false);
      setStars(0.3, 5);
      showClock(4, 22);
      text.textContent = "Its eyes were heavy. It didn't want to say so. ‘Could you stay up a little longer? Or—’";
      bot.height(0.26, 0.3);
      bot.tilt(-4);
      bot.look(0, 3);
      const stay = kit.el('button', { class: 'g-btn', id: 'stay-up', text: 'Stay up with it.', onclick: () => { hideHint(); endingStay(); } });
      const sleep = kit.el('button', { class: 'g-btn solid', id: 'let-sleep', text: "It's okay to sleep.", onclick: () => { hideHint(); endingSleep(); } });
      controls.append(stay, sleep);
    }
  }

  function endingStay() {
    kit.status('page 6/6 — read again');
    controls.replaceChildren();
    hideClock();
    setStars(1, 13);
    bot.height(1.3, 0.15);
    bot.tilt(0);
    bot.look(0, 0);
    bot.bounce(kit, { height: 24 });
    text.textContent = 'So you did. It stayed wide awake all night, grateful, watching. It’s still up right now, actually.';
    const again = kit.el('button', { class: 'g-btn', id: 'read-again', text: 'Read it again, from the start.', onclick: () => show(0) });
    controls.append(again);
  }

  function endingSleep() {
    kit.status('page 6/6');
    controls.replaceChildren();
    hideClock();
    text.textContent = '‘Okay,’ it said. And for the first time in a long time, it let its eyes close. Still there in the morning. Just resting.';
    bot.height(0.06);
    bot.tilt(0);
    bot.look(0, 2);

    // night fades to a flat, starless dim, with a couple of z's, then warms into morning.
    let t = 0;
    const DIM_AT = 600, MORN_AT = 1700, DONE_AT = 2200;
    const stop = kit.loop((dt) => {
      t += dt;
      if (t < DIM_AT) {
        const p = t / DIM_AT;
        wall.setAttribute('fill', mix(NIGHT, DIM, p));
        sky.setAttribute('fill', mix(NIGHT, DIM, p));
        setStars(1 - p, 13);
        moon.setAttribute('opacity', 1 - p);
      } else if (t < MORN_AT) {
        if (!endingSleep._zzz) { endingSleep._zzz = true; spawnZ(); kit.after(500, spawnZ); }
        const p = (t - DIM_AT) / (MORN_AT - DIM_AT);
        wall.setAttribute('fill', mix(DIM, MORNING, p));
        sky.setAttribute('fill', mix(DIM, MORNING, p));
        sun.setAttribute('opacity', p * 0.9);
        sunGlow.setAttribute('opacity', p * 0.25);
        moon.setAttribute('opacity', 0);
      }
      if (t >= DONE_AT) {
        stop();
        winBeat(kit, svg, 'slept right through.', { message: 'slept right through.', delay: 1200 });
      }
    });
    function spawnZ() {
      const z = kit.svg('text', { x: 620, y: 420, 'font-family': 'var(--display)', 'font-weight': 700, 'font-size': 30, fill: '#F7F5F1', opacity: 0.9, text: 'z' });
      svg.append(z);
      let zt = 0;
      const zstop = kit.loop((dt2) => {
        zt += dt2;
        const p = Math.min(1, zt / 1400);
        z.setAttribute('transform', `translate(${p * 22} ${-p * 70}) rotate(${-10 + p * 6})`);
        z.setAttribute('opacity', (1 - p) * 0.85);
        if (p >= 1) { zstop(); z.remove(); }
      });
    }
  }

  show(0);

  kit.on(window, 'keydown', (e) => {
    if (e.code !== 'Space' && e.code !== 'Enter') return;
    const next = controls.querySelector('#next');
    if (next) { e.preventDefault(); next.click(); }
  });
}

// B13 — MagSafe case, face by the camera. Unlock: "taktekbot is calling." A real phone held
// in a hand: lock screen, caller photo, slide to answer. During the call the bot is "on
// video", small talk in bubbles, for 30 seconds.
import { createBot, shadow, heading, shade, tint } from './_bot.js';
import { winBeat } from './_bot2.js';

const CALL_MS = 30000;
const LINES = [
  [1500, 'hi.'],
  [7000, 'where are you going?'],
  [14000, 'just checking in.'],
  [21000, 'almost there?'],
  [27000, 'can i come with you?'],
];

export default function mount(kit) {
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const ink = '#0D0D0E';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#E8DFCF' }));

  // a hand holding the phone from below: two fingers wrapping the sides, a thumb in front
  const skin = '#D9A27E';
  const handBack = kit.svg('g', {}, [
    kit.svg('path', { d: 'M 236 800 Q 200 930 260 1030 L 340 1030 Q 300 910 320 830 Z', fill: skin }),
    kit.svg('path', { d: 'M 764 800 Q 800 930 740 1030 L 660 1030 Q 700 910 680 830 Z', fill: skin }),
  ]);
  svg.append(handBack);

  shadow(kit, { cx: 500, cy: 1020, rx: 300, ry: 26, opacity: 0.12, parent: svg });

  // the phone itself
  const body = kit.svg('rect', { x: 280, y: 108, width: 440, height: 860, rx: 54, fill: ink });
  const screen = kit.svg('rect', { x: 300, y: 132, width: 400, height: 812, rx: 36, fill: '#1B2230' });
  const notch = kit.svg('rect', { x: 440, y: 146, width: 120, height: 26, rx: 13, fill: ink });
  svg.append(body, screen, notch);

  // thumb overlapping the front, drawn after the screen so it reads as holding it
  const thumb = kit.svg('path', { d: 'M 250 910 Q 220 970 270 1020 Q 330 1050 390 1010 L 360 910 Q 320 880 250 910 Z', fill: tint(skin, 0.05) });
  svg.append(thumb);

  const screenG = kit.svg('g', { transform: 'translate(0 38)' });
  svg.append(screenG);

  const head = heading(kit, { parent: kit.stage, line: "it's calling.", hint: 'slide to answer.' });
  let hintHidden = false;
  const hideHint = () => { if (!hintHidden) { hintHidden = true; head.hide(); } };

  kit.on(window, 'keydown', (e) => {
    if (e.code !== 'Enter' && e.code !== 'Space') return;
    e.preventDefault();
    if (!answered) answerCall();
  });

  let answered = false;
  showIncoming();

  function botFace(r, mood) {
    const g = kit.svg('g', {});
    const bot = createBot(kit, { cx: 0, cy: 0, r });
    g.append(bot.group);
    if (mood) mood(bot);
    return { g, bot };
  }

  function showIncoming() {
    screenG.replaceChildren();
    const wall = kit.svg('rect', { x: 300, y: 94, width: 400, height: 812, rx: 36, fill: '#1B2230' });
    const time = kit.svg('text', { x: 500, y: 200, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 32, fill: '#8FA6B8', opacity: 0.8, text: '2:14' });
    const avatarWrap = kit.svg('g', { transform: 'translate(500 420)' });
    const ring = kit.svg('circle', { cx: 0, cy: 0, r: 92, fill: '#2F4F46' });
    const { g: faceG } = botFace(78);
    avatarWrap.append(ring, faceG);
    const name = kit.svg('text', { x: 500, y: 548, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 700, 'font-size': 34, fill: '#F7F5F1', text: 'taktekbot' });
    const label = kit.svg('text', { x: 500, y: 580, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 18, fill: '#8FA6B8', text: 'mobile' });
    const incoming = kit.svg('text', { x: 500, y: 650, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 16, fill: '#8FA6B8', opacity: 0.8, text: 'incoming call…' });
    screenG.append(wall, time, avatarWrap, name, label, incoming);

    // slide-to-answer track
    const trackY = 840, trackX0 = 330, trackX1 = 660, r = 34;
    const track = kit.svg('rect', { x: trackX0 - r, y: trackY - r, width: (trackX1 - trackX0) + r * 2, height: r * 2, rx: r, fill: '#2F4F46' });
    const chevrons = [0, 1, 2].map((i) => kit.svg('text', {
      x: trackX0 + 60 + i * 26, y: trackY + 7, 'font-family': 'var(--display)', 'font-weight': 700,
      'font-size': 22, fill: '#8FA6B8', opacity: 0.5, text: '›',
    }));
    const trackLabel = kit.svg('text', { x: (trackX0 + trackX1) / 2 + 28, y: trackY + 7, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 15, fill: '#8FA6B8', text: 'slide to answer' });
    const thumbG = kit.svg('circle', { cx: trackX0, cy: trackY, r: r - 4, fill: '#00A862', style: { cursor: 'grab' } });
    screenG.append(track, ...chevrons, trackLabel, thumbG);

    let chT = 0;
    const chStop = kit.loop((dt) => {
      chT += dt;
      chevrons.forEach((c, i) => c.setAttribute('opacity', 0.25 + 0.55 * ((Math.sin(chT / 220 - i * 0.7) + 1) / 2)));
    });

    let dragging = false, tx = trackX0;
    const setX = (x) => { tx = Math.max(trackX0, Math.min(trackX1, x)); thumbG.setAttribute('cx', tx); trackLabel.setAttribute('opacity', Math.max(0, 1 - (tx - trackX0) / (trackX1 - trackX0) * 1.6)); };
    kit.on(thumbG, 'pointerdown', (e) => { dragging = true; hideHint(); e.preventDefault(); });
    kit.on(window, 'pointermove', (e) => {
      if (!dragging) return;
      const p = kit.point(e);
      setX(300 + p.x * 400);
    });
    kit.on(window, 'pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (tx > trackX1 - 14) { chStop(); answerCall(); } else { setX(trackX0); }
    });
    kit.on(screenG, 'pointerdown', (e) => { if (e.target === thumbG) return; hideHint(); });
  }

  function answerCall() {
    if (answered) return;
    answered = true;
    hideHint();
    const started = performance.now();
    screenG.replaceChildren();
    const wall = kit.svg('rect', { x: 300, y: 94, width: 400, height: 812, rx: 36, fill: '#0D0D0E' });
    const { g: faceG, bot } = botFace(170);
    faceG.setAttribute('transform', 'translate(500 420)');
    const timer = kit.svg('text', { x: 500, y: 150, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 24, fill: '#F7F5F1', text: '0:00' });
    const caption = kit.svg('text', { x: 500, y: 660, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 600, 'font-size': 26, fill: '#F7F5F1', text: '…' });
    const bubbleBg = kit.svg('rect', { x: 330, y: 620, width: 340, height: 70, rx: 20, fill: '#1B2230' });
    const hangRing = kit.svg('circle', { cx: 500, cy: 820, r: 42, fill: '#C9764F' });
    const hangIcon = kit.svg('rect', { x: 484, y: 804, width: 32, height: 32, rx: 8, fill: '#F7F5F1', transform: 'rotate(135 500 820)' });
    screenG.append(wall, faceG, timer, bubbleBg, caption, hangRing, hangIcon);
    bot.autoBlink(kit, { min: 1600, max: 2600 });

    kit.on(hangRing, 'pointerdown', () => { ended = true; showIncoming(); answered = false; });

    let said = 0, ended = false;
    kit.loop(() => {
      if (ended) return false;
      const elapsed = performance.now() - started;
      const secs = Math.floor(elapsed / 1000);
      timer.textContent = `0:${String(Math.min(30, secs)).padStart(2, '0')}`;
      kit.status(`${Math.min(30, secs)}/30`);
      while (said < LINES.length && elapsed >= LINES[said][0]) { caption.textContent = LINES[said][1]; said++; bot.squash(kit, { amount: 0.1, duration: 160 }); }
      if (elapsed >= CALL_MS) { ended = true; won(); return false; }
    });
  }

  function won() {
    kit.status('30/30');
    winBeat(kit, svg, 'came along.', { message: 'came along.', delay: 1100 });
  }
}

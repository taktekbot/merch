// B13 — MagSafe case, face by the camera. Unlock: "taktekbot is calling." Answer, keep
// the line open 30 seconds while it says small things, then "can i come with you?"
import { createBot } from './_bot.js';

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

  const wrap = kit.el('div', { class: 'g-center', style: { flexDirection: 'column', gap: '8px' } });
  kit.stage.append(wrap);

  kit.on(window, 'keydown', (e) => {
    if (e.code !== 'Enter' && e.code !== 'Space') return;
    const answer = wrap.querySelector('#answer');
    if (answer) { e.preventDefault(); answer.click(); }
  });

  showIncoming();

  function botSvg(px) {
    const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { width: `${px}px`, height: `${px}px` } });
    const bot = createBot(kit, { cx: 500, cy: 500, r: 420, bg: card });
    svg.append(bot.group);
    return { svg, bot };
  }

  function showIncoming() {
    wrap.replaceChildren();
    const { svg } = botSvg(100);
    wrap.append(
      svg,
      kit.el('p', { class: 'g-mono', text: 'taktekbot' }),
      kit.el('p', { class: 'g-big', text: 'is calling…' }),
    );
    const row = kit.el('div', { style: { display: 'flex', gap: '14px' } });
    const decline = kit.el('button', { class: 'g-btn', text: 'Decline', id: 'decline' });
    const answer = kit.el('button', { class: 'g-btn solid', text: 'Answer', id: 'answer' });
    decline.onclick = () => kit.status("it'll try again later.");
    answer.onclick = startCall;
    row.append(decline, answer);
    wrap.append(row);
  }

  function startCall() {
    const started = performance.now();
    wrap.replaceChildren();
    const { svg, bot } = botSvg(120);
    const timer = kit.el('p', { class: 'g-mono', text: '0:00' });
    const caption = kit.el('p', { class: 'g-big', text: '…' });
    const hang = kit.el('button', { class: 'g-btn', text: 'Hang up', id: 'hangup' });
    hang.onclick = showIncoming;
    wrap.append(svg, timer, caption, hang);

    let said = 0, blinkAt = performance.now() + 1500, ended = false;
    const stop = kit.loop(() => {
      if (ended) return false;
      const elapsed = performance.now() - started;
      const secs = Math.floor(elapsed / 1000);
      timer.textContent = `0:${String(Math.min(30, secs)).padStart(2, '0')}`;
      kit.status(`${Math.min(30, secs)}/30`);
      if (performance.now() >= blinkAt) { bot.height(0.1); kit.after(140, () => bot.height(1)); blinkAt = performance.now() + 1800 + Math.random() * 1500; }
      while (said < LINES.length && elapsed >= LINES[said][0]) { caption.textContent = LINES[said][1]; said++; }
      if (elapsed >= CALL_MS) { ended = true; won(); return false; }
    });
    kit.cleanup(() => { ended = true; });
  }

  function won() {
    kit.status('30/30');
    kit.win('came along.');
  }
}

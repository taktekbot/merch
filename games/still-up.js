// B02 still up hoodie — "Open from 1 to 5 in the morning, your time."
// A dark bedroom: the bot glows faintly on the bedside table next to a phone that keeps
// lighting up. Only unlocks 1am–5am local time; a lamp you can switch on together sits
// within reach the whole time, just for company.
import { createBot, room, sceneWindow, nightstand, lamp, phone, heading } from './_bot.js';

const isWitchingHour = (date) => { const h = date.getHours(); return h >= 1 && h < 5; };
const pad2 = (n) => String(n).padStart(2, '0');

export default function mount(kit) {
  const o = kit.options || {};
  const card = (kit.colors && kit.colors.card) || '#EFECE6';
  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  room(kit, { parent: svg, wall: '#1B2230', floor: '#15192a', floorY: 660, skirt: '#0D0D0E' });
  const win = sceneWindow(kit, { parent: svg, x: 620, y: 70, w: 260, h: 260, sky: 'night', curtains: true });
  const clockText = kit.svg('text', {
    x: win.x + win.w / 2, y: win.y + win.h + 40, 'text-anchor': 'middle',
    'font-family': 'var(--mono)', 'font-size': 26, fill: '#8FA6B8', opacity: 0.85, text: '',
  });
  svg.append(clockText);

  const table = nightstand(kit, { parent: svg, x: 430, y: 700, w: 280, h: 100, wood: '#6E4A33' });
  const lampX = table.x - 90;
  const lampFixture = lamp(kit, { parent: svg, x: lampX, y: table.y, color: '#F2D98A' });
  let lampOn = false;
  const lampHit = kit.svg('circle', { cx: lampX, cy: table.y - 50, r: 46, fill: 'transparent', style: { cursor: 'pointer' } });
  svg.append(lampHit);
  kit.on(lampHit, 'pointerdown', () => { lampOn = !lampOn; lampFixture.setOn(lampOn); });

  const phoneFixture = phone(kit, { parent: svg, x: table.x + 120, y: table.y - 48, w: 54, h: 96 });
  kit.every(3600 + Math.random() * 1400, () => {
    phoneFixture.setLit(true);
    kit.after(420, () => phoneFixture.setLit(false));
  });

  const bot = createBot(kit, { cx: table.x + 30, cy: table.y - 78, r: 92, bg: card, shadow: true });
  svg.append(bot.group);
  bot.autoBlink(kit, { min: 2600, max: 4600 });

  const dim = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#060a14', opacity: 0.55 });
  svg.insertBefore(dim, win.group.nextSibling);

  const head = heading(kit, { parent: kit.stage, line: o.closed || 'still up.', hint: 'open 1am to 5am, your time.', color: '#F7F5F1', hintColor: '#8FA6B8' });
  kit.after(4200, () => head.hide());

  const big = kit.el('p', {
    class: 'g-big', style: { position: 'absolute', left: '0', right: '0', top: '14%', textAlign: 'center', margin: '0', color: '#F7F5F1', pointerEvents: 'none' },
    text: '',
  });
  kit.stage.append(big);

  let controls;
  let wasOpen = null;

  function draw() {
    const now = kit.now();
    const open = isWitchingHour(now);
    clockText.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    dim.setAttribute('opacity', open ? 0.18 : 0.55);
    win.group.setAttribute('opacity', open ? 1 : 0.85);
    bot.sleepy(open ? 0 : 0.8);
    bot.look(0, open ? -4 : 6);

    if (open !== wasOpen) {
      wasOpen = open;
      big.textContent = open ? (o.open || "it's still up.") : '';
      if (controls) { controls.remove(); controls = null; }
      if (open) {
        head.hide();
        bot.bounce(kit, { height: 18 });
        controls = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', top: '82%', textAlign: 'center' } }, [
          kit.el('button', { class: 'g-btn solid', text: o.button || 'so am i.', onclick: () => win_() }),
        ]);
        kit.stage.append(controls);
      }
    }
  }

  function win_() {
    bot.bounce(kit, { height: 30 });
    if (controls) { controls.remove(); controls = null; }
    big.textContent = 'so are you. good.';
    kit.after(260, () => lampFixture.setOn(true));
    kit.after(900, () => kit.win('so are you. good.'));
  }

  draw();
  kit.every(15000, draw);
  kit.status('checks the clock every 15s');
}

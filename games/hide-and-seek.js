// B09 the patch — "It's hiding on this page. Find it four times."
// Three faces peek out of real page chrome (the header logo, the locked/Buy panel, the
// footer) — each one clearly half-visible with eyes darting side to side. The fourth hides
// in the stage itself, peeking out of a little cardboard box. Click each one to find it.
// All injected DOM is removed through kit.cleanup when the game resets.
import { createBot, heading, winBeat, shade } from './_bot.js';

function faceSvg(size, { closed = false } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  const body = document.createElementNS(ns, 'circle');
  body.setAttribute('cx', 512); body.setAttribute('cy', 512); body.setAttribute('r', 232);
  body.setAttribute('fill', '#00A862');
  const mkEye = (x, h, delay) => {
    const g = document.createElementNS(ns, 'g');
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', x); r.setAttribute('width', 56); r.setAttribute('rx', 28);
    r.setAttribute('height', h); r.setAttribute('y', 442 + (120 - h) / 2);
    r.setAttribute('fill', '#F7F5F1');
    g.append(r);
    if (!closed) {
      const anim = document.createElementNS(ns, 'animateTransform');
      anim.setAttribute('attributeName', 'transform');
      anim.setAttribute('type', 'translate');
      anim.setAttribute('values', '0,0; 10,0; 10,0; -8,0; -8,0; 0,0');
      anim.setAttribute('keyTimes', '0; 0.2; 0.45; 0.6; 0.85; 1');
      anim.setAttribute('dur', '3.2s');
      anim.setAttribute('begin', `${delay}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      g.append(anim);
    }
    return g;
  };
  const h = closed ? 10 : 120;
  svg.append(body, mkEye(420, h, 0), mkEye(548, h, 0.15));
  return svg;
}

export default function mount(kit) {
  const needed = 4;
  const found = new Set();
  const card = (kit.colors && kit.colors.card) || '#EFECE6';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000', style: { position: 'absolute', inset: '0' } });
  kit.stage.prepend(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: card }));
  svg.append(kit.svg('rect', { x: 0, y: 680, width: 1000, height: 320, fill: shade(card, 0.1) }));

  // the stage spot: a small cardboard box, flaps open, the bot peeking over the rim
  const boxColor = '#C9764F';
  const boxX = 800, boxY = 170, boxW = 160, boxH = 120;
  const bot = createBot(kit, { cx: boxX + boxW / 2, cy: boxY + 14, r: 76, bg: card });
  svg.append(bot.group);
  const box = kit.svg('g', { style: { cursor: 'pointer' }, 'data-hide-spot': 'stage' });
  const flapL = kit.svg('path', { d: `M ${boxX} ${boxY} L ${boxX + boxW * 0.5} ${boxY} L ${boxX + boxW * 0.08} ${boxY - 54} Z`, fill: shade(boxColor, 0.08) });
  const flapR = kit.svg('path', { d: `M ${boxX + boxW} ${boxY} L ${boxX + boxW * 0.5} ${boxY} L ${boxX + boxW * 0.92} ${boxY - 54} Z`, fill: shade(boxColor, 0.16) });
  const front = kit.svg('rect', { x: boxX, y: boxY, width: boxW, height: boxH, rx: 6, fill: boxColor });
  const frontShade = kit.svg('rect', { x: boxX, y: boxY, width: boxW * 0.32, height: boxH, rx: 6, fill: shade(boxColor, 0.14), opacity: 0.6 });
  const tape = kit.svg('rect', { x: boxX + boxW / 2 - 14, y: boxY, width: 28, height: boxH, fill: '#F2D98A', opacity: 0.8 });
  box.append(flapL, flapR, front, frontShade, tape);
  svg.append(box);
  bot.autoBlink(kit, { min: 2000, max: 3600 });
  kit.loop((dt, t) => { bot.look(Math.sin(t / 900) * 10, Math.cos(t / 1300) * 3); });

  const head = heading(kit, { parent: kit.stage, line: "it's hiding on this page.", hint: 'find it four times.' });
  let hintHidden = false;

  const markFound = (id, onFound) => {
    if (found.has(id)) return;
    found.add(id);
    if (!hintHidden) { hintHidden = true; head.hide(); }
    if (onFound) onFound();
    kit.status(`${found.size}/${needed} found`);
    if (found.size >= needed) {
      kit.after(300, () => winBeat(kit, svg, 'found you. all four.'));
    }
  };

  kit.on(box, 'pointerdown', (e) => {
    e.stopPropagation();
    bot.squash(kit, { amount: 0.3, duration: 240 });
    bot.blink(kit, { duration: 200, dramatic: true });
    flapL.setAttribute('transform', `rotate(-14 ${boxX + boxW * 0.08} ${boxY})`);
    flapR.setAttribute('transform', `rotate(14 ${boxX + boxW * 0.92} ${boxY})`);
    markFound('stage');
  });

  // Live, moving faces peeking out of real page chrome: logo, the lock/buy panel, footer.
  const targets = [
    { id: 'logo', el: document.querySelector('.top .brand'), corner: 'right', size: 30 },
    { id: 'panel', el: document.getElementById('lock') || document.getElementById('buy'), corner: 'left', size: 32 },
    { id: 'footer', el: document.querySelector('.foot'), corner: 'top', size: 30 },
  ].filter((t) => t.el);

  const injected = [];
  for (const t of targets) {
    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', 'find the bot');
    wrap.dataset.hideSpot = t.id;
    wrap.tabIndex = 0;
    Object.assign(wrap.style, {
      position: 'fixed', zIndex: 9999, width: `${t.size}px`, height: `${t.size * 0.6}px`,
      overflow: 'hidden', cursor: 'pointer', pointerEvents: 'auto', transition: 'transform .15s ease',
    });
    const inner = faceSvg(t.size);
    Object.assign(inner.style, { display: 'block' });
    wrap.append(inner);
    document.body.append(wrap);
    injected.push(wrap);

    const place = () => {
      const r = t.el.getBoundingClientRect();
      const peek = t.size * 0.4;
      const h = t.size * 0.6;
      if (t.corner === 'top') {
        wrap.style.top = `${Math.max(2, r.top - (h - peek))}px`;
        wrap.style.left = `${Math.max(2, r.left + 24)}px`;
        return;
      }
      const top = r.top + r.height / 2 - h / 2;
      const left = t.corner === 'right' ? r.right - peek : Math.max(2, r.left - (t.size - peek));
      wrap.style.top = `${Math.max(2, top)}px`;
      wrap.style.left = `${left}px`;
    };
    place();
    kit.on(window, 'scroll', place, { passive: true });
    kit.on(window, 'resize', place);

    const react = () => {
      inner.replaceChildren(...faceSvg(t.size, { closed: true }).childNodes);
      wrap.style.transform = 'scale(1.15)';
      markFound(t.id);
    };
    kit.on(wrap, 'pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); react(); });
    kit.on(wrap, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); react(); } });

    kit.every(2200, () => {
      if (found.has(t.id)) return;
      wrap.style.transform = wrap.style.transform === 'translateY(-3px)' ? 'translateY(0)' : 'translateY(-3px)';
    });
  }

  kit.cleanup(() => { for (const n of injected) n.remove(); });
  kit.status(`0/${needed} found`);
}

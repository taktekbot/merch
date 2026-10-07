// Small additions to _bot.js for the second polish pass, kept separate so the games here
// don't have to wait on edits landing in _bot.js (owned by someone else right now).
// Import alongside it: `import * as art from './_bot.js'; import * as art2 from './_bot2.js';`
import { animate, EASE, shade, tint, shadow } from './_bot.js';

const INK = '#0D0D0E';

// ---------------------------------------------------------------------------------------
// winBeat(kit, svg, line, opts) — POLISH.md rule 6: don't jump straight to the gallery.
// A big centred line on a soft rounded paper panel at ~92% opacity, ~1.2s, then kit.win.
// Local stand-in for the shared helper landing in _bot.js; same contract so games can swap
// to the real one later with no change at the call site.
export function winBeat(kit, svg, line, opts = {}) {
  const { message, delay = 1200, bg = '#F7F5F1', ink = INK, accent, fontSize = 44 } = opts;
  const text = line.endsWith('.') ? line.slice(0, -1) : line;
  const approxW = Math.min(880, 160 + text.length * fontSize * 0.56);
  const g = kit.svg('g', { opacity: 0 });
  const panel = kit.svg('rect', { x: 500 - approxW / 2, y: 500 - 85, width: approxW, height: 170, rx: 30, fill: bg });
  const label = kit.svg('text', {
    x: 500 - 9, y: 500 + fontSize * 0.34, 'text-anchor': 'middle', 'font-family': 'var(--display)',
    'font-weight': 700, 'font-size': fontSize, fill: ink, text,
  });
  const dotX = 500 - 9 + text.length * fontSize * 0.285 + fontSize * 0.22;
  const dot = kit.svg('circle', { cx: dotX, cy: 500 + fontSize * 0.08, r: fontSize * 0.1, fill: accent || (kit.colors && kit.colors.accent) || '#00A862' });
  g.append(panel, label, dot);
  svg.append(g);
  animate(kit, 260, EASE.outCubic, (p) => { g.setAttribute('opacity', p * 0.92 / 0.92); g.setAttribute('transform', `translate(0 ${(1 - p) * 10})`); });
  g.setAttribute('opacity', 0.92);
  kit.after(delay, () => kit.win(message || line));
  return g;
}

// ---------------------------------------------------------------------------------------
// A small round analogue clock (face, four ticks, hour + minute hands). hour/min are plain
// numbers (hour may be fractional so the hour hand creeps). Returns { group, setTime }.
export function clockFace(kit, { parent, x = 0, y = 0, r = 44, face = '#F7F5F1', ink = INK, hour = 2, minute = 0 } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  const rim = kit.svg('circle', { cx: 0, cy: 0, r, fill: face, stroke: ink, 'stroke-width': r * 0.11 });
  const ticks = [0, 90, 180, 270].map((deg) => kit.svg('line', {
    x1: 0, y1: -r * 0.82, x2: 0, y2: -r * 0.68, stroke: ink, 'stroke-width': r * 0.07,
    transform: `rotate(${deg})`,
  }));
  const hourHand = kit.svg('line', { x1: 0, y1: r * 0.12, x2: 0, y2: -r * 0.42, stroke: ink, 'stroke-width': r * 0.09, 'stroke-linecap': 'round' });
  const minHand = kit.svg('line', { x1: 0, y1: r * 0.14, x2: 0, y2: -r * 0.66, stroke: ink, 'stroke-width': r * 0.07, 'stroke-linecap': 'round' });
  const pin = kit.svg('circle', { cx: 0, cy: 0, r: r * 0.09, fill: ink });
  g.append(rim, ...ticks, hourHand, minHand, pin);
  if (parent) parent.append(g);
  function setTime(h, m) {
    hourHand.setAttribute('transform', `rotate(${(h % 12) * 30 + m * 0.5})`);
    minHand.setAttribute('transform', `rotate(${m * 6})`);
  }
  setTime(hour, minute);
  return { group: g, setTime };
}

// ---------------------------------------------------------------------------------------
// A small sleeping/walking cat silhouette, for never-slept's one quiet cat page.
export function cat(kit, { parent, x = 0, y = 0, scale = 1, color = '#0D0D0E', walking = false } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y}) scale(${scale})` });
  const body = kit.svg('ellipse', { cx: 0, cy: 0, rx: 58, ry: 26, fill: color });
  const head = kit.svg('circle', { cx: 56, cy: -14, r: 20, fill: color });
  const earL = kit.svg('path', { d: 'M 44 -28 L 50 -42 L 58 -27 Z', fill: color });
  const earR = kit.svg('path', { d: 'M 62 -28 L 70 -40 L 72 -25 Z', fill: color });
  const tail = kit.svg('path', { d: 'M -52 2 Q -90 -10 -78 -46', fill: 'none', stroke: color, 'stroke-width': 13, 'stroke-linecap': 'round' });
  g.append(body, earL, earR, head, tail);
  if (parent) parent.append(g);
  if (walking) {
    const legs = [-20, 4].map((dx) => kit.svg('rect', { x: dx, y: 16, width: 8, height: 16, rx: 4, fill: color }));
    legs.forEach((l) => g.append(l));
  }
  return { group: g };
}

// ---------------------------------------------------------------------------------------
// A soft rounded paper card — the generic "text sits here" backdrop used for captions and
// speech. Not a button; just a shape to put text or a button row on top of.
export function paperCard(kit, { parent, x = 0, y = 0, w = 400, h = 200, rx = 22, fill = '#F7F5F1', elevate = true } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  if (elevate) shadow(kit, { cx: w / 2, cy: h + 6, rx: w * 0.46, ry: 10, opacity: 0.08, parent: g });
  const card = kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx, fill });
  g.append(card);
  if (parent) parent.append(g);
  return { group: g, card, w, h };
}

// A small speech bubble with a tail pointing down-left (or flip with tailRight).
export function speechBubble(kit, { parent, x = 0, y = 0, w = 220, h = 90, fill = '#F7F5F1', tailRight = false } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  const body = kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx: h * 0.32, fill });
  const tx = tailRight ? w * 0.74 : w * 0.26;
  const tail = kit.svg('path', { d: `M ${tx - 14} ${h - 2} L ${tx + 14} ${h - 2} L ${tx} ${h + 20} Z`, fill });
  g.append(body, tail);
  if (parent) parent.append(g);
  return { group: g, w, h };
}

export default { winBeat, clockFace, cat, paperCard, speechBubble };

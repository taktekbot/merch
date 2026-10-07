// Shared character + scene library for the taktekbot unlock games (GAMES.md rule 9 +
// POLISH.md's taktekbot critique). The bot: a green circle with two pill-shaped eye
// cutouts. Brand geometry at the 1024 scale: circle r=232 at (512,512); eyes are rounded
// rects 56x120, rx 28, at x=420/x=548, y=442 — i.e. eye centres sit 64 units either side of
// the circle's centre and 10 units above it. createBot() scales that to whatever radius a
// game needs and draws into the 1000x1000 viewBox.
//
// createBot()'s returned shape (group/body/L/R/height/curl/look/tilt/scale/cx/cy/r) is
// unchanged from the original helper — gate-12, its-calling, it-climbs-in, follow-the-sun,
// why, moods, never-slept and knit-the-row all still work untouched. Everything below is
// additive: new methods on the same bot object, plus standalone scene/prop/particle
// helpers you call with (kit, opts) and append yourself (or that append for you when you
// pass `parent`).
//
// Read POLISH.md before using this on a new game: one light source top-left, a darker
// shade (~18% toward ink) on the shadow side, contact shadows under things that sit on a
// surface, idle motion everywhere, and a charming fail beat. The helpers here default to
// those choices so a game built from them starts out looking right.

const INK = '#0D0D0E';
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

// ---- colour -----------------------------------------------------------------------

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const v = parseInt(n, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => lerp(v, b[i], t)));
}
// POLISH.md rule 2: shadow side = base mixed ~18% toward ink; highlight = ~12% toward white.
export const shade = (hex, k = 0.18) => mix(hex, INK, k);
export const tint = (hex, k = 0.12) => mix(hex, '#FFFFFF', k);

// ---- small animation helper --------------------------------------------------------
// Every motion helper below (blink, squash, bounce, walkTo…) is built on this: run fn(p)
// from 0 to 1 over duration ms using kit.loop, so it's automatically cleaned up on reset.
const easeOutCubic = (p) => 1 - (1 - p) ** 3;
const easeOutBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2; };
export const EASE = { linear: (p) => p, outCubic: easeOutCubic, outBack: easeOutBack };

export function animate(kit, duration, ease, onFrame, onDone) {
  const start = performance.now();
  if (kit.reducedMotion) { onFrame(1); if (onDone) onDone(); return () => {}; }
  return kit.loop((dt, t) => {
    const p = clamp01((t - start) / Math.max(1, duration));
    onFrame(ease(p));
    if (p >= 1) { if (onDone) onDone(); return false; }
  });
}

// ---- shadow -------------------------------------------------------------------------

// A soft contact ellipse for anything sitting on a surface (POLISH.md rule 2: ink 8-12%).
export function shadow(kit, { cx = 0, cy = 0, rx = 120, ry, opacity = 0.1, fill = INK, parent } = {}) {
  const el = kit.svg('ellipse', { cx, cy, rx, ry: ry ?? rx * 0.26, fill, opacity });
  if (parent) parent.append(el);
  return el;
}

// ---- the bot --------------------------------------------------------------------------

export function createBot(kit, { cx = 500, cy = 500, r = 220, bg = '#EFECE6', color, shadow: wantShadow = false } = {}) {
  const green = color || (kit.colors && kit.colors.accent) || '#00A862';
  const s = r / 232;
  const baseW = 56 * s, baseH = 120 * s, rx = 28 * s;
  const offX = 64 * s, offY = -10 * s;

  // Position lives on an outer group so the whole bot (body, eyes, limbs, props, its own
  // shadow) can be moved as one with moveTo()/walkTo(). Everything inside is drawn in a
  // local frame centred on (0,0); tilt/squash/shiver below rotate and scale around that
  // same local origin, which is why they don't need a centre argument.
  let posX = cx, posY = cy;
  const posG = kit.svg('g', { transform: `translate(${posX} ${posY})` });
  const headG = kit.svg('g', {});
  const body = kit.svg('circle', { cx: 0, cy: 0, r, fill: green });
  const eyesG = kit.svg('g', {});
  const underG = kit.svg('g', {}); // feet, props that sit behind the body
  const overG = kit.svg('g', {}); // arms, props, blush that sit in front

  let shadowEl = null;
  if (wantShadow) shadowEl = shadow(kit, { cx: 0, cy: r * 0.98, rx: r * 0.72, ry: r * 0.17, parent: posG });

  function makeEye(sign) {
    const holder = kit.svg('g', { transform: `translate(${sign * offX} ${offY})` });
    const rect = kit.svg('rect', { x: -baseW / 2, y: -baseH / 2, width: baseW, height: baseH, rx, fill: bg });
    holder.append(rect);
    return { holder, rect };
  }
  const L = makeEye(-1), R = makeEye(1);
  eyesG.append(L.holder, R.holder);
  headG.append(underG, body, eyesG, overG);
  posG.append(headG);

  const each = (fn) => { fn(L, -1); fn(R, 1); };

  // mult: 1 = open, ~0.08 = blink/closed, >1 = widen (shocked). widen also fattens the pill.
  function height(mult, widen = 0) {
    const h = Math.max(2, baseH * mult);
    const w = baseW * (1 + widen);
    each(({ rect }) => {
      rect.setAttribute('height', h);
      rect.setAttribute('y', -h / 2);
      rect.setAttribute('width', w);
      rect.setAttribute('x', -w / 2);
      rect.setAttribute('rx', Math.min(rx * (1 + widen), w / 2, h / 2));
    });
  }
  // Spin each eye around its own centre, mirrored (deg>0 curls the outer edges up: happy).
  function curl(deg) { each(({ rect }, sign) => rect.setAttribute('transform', `rotate(${-deg * sign})`)); }
  // Shift both eyes together (gaze direction), in brand units.
  function look(dx = 0, dy = 0) { eyesG.setAttribute('transform', `translate(${dx * s} ${dy * s})`); }

  // ---- composed head transform: tilt (rotate) + squash (scale) + shiver (jitter) ----
  const state = { rotateDeg: 0, scaleX: 1, scaleY: 1, jx: 0, jy: 0, jumpY: 0 };
  function applyHead() {
    const parts = [];
    if (state.jx || state.jy) parts.push(`translate(${state.jx.toFixed(2)} ${state.jy.toFixed(2)})`);
    if (state.jumpY) parts.push(`translate(0 ${state.jumpY.toFixed(2)})`);
    if (state.rotateDeg) parts.push(`rotate(${state.rotateDeg})`);
    if (state.scaleX !== 1 || state.scaleY !== 1) parts.push(`scale(${state.scaleX.toFixed(3)} ${state.scaleY.toFixed(3)})`);
    headG.setAttribute('transform', parts.join(' '));
  }
  function tilt(deg) { state.rotateDeg = deg || 0; applyHead(); }

  // ---- position ----
  function moveTo(nx, ny) { posX = nx; posY = ny; posG.setAttribute('transform', `translate(${posX} ${posY})`); }
  function walkTo(kit, nx, ny, duration = 650, onDone) {
    const sx = posX, sy = posY;
    return animate(kit, duration, easeOutCubic, (p) => moveTo(lerp(sx, nx, p), lerp(sy, ny, p)), onDone);
  }

  // ---- blink / sleep ----
  function blink(kit, { duration = 110, dramatic = false } = {}) {
    height(dramatic ? 1.3 : 1, dramatic ? 0.12 : 0);
    animate(kit, duration * 0.4, easeOutCubic, () => height(0.06), () => {
      kit.after(60, () => animate(kit, duration * 0.6, easeOutBack, (p) => height(lerp(0.06, 1, p))));
    });
  }
  function autoBlink(kit, { min = 2200, max = 4200, duration = 110 } = {}) {
    let stopped = false;
    const schedule = () => {
      if (stopped) return;
      kit.after(min + Math.random() * (max - min), () => { if (stopped) return; blink(kit, { duration }); schedule(); });
    };
    schedule();
    return { stop: () => { stopped = true; } };
  }
  // 0 = wide awake, 1 = fully asleep (near-shut, curved-down lids via gentle curl).
  function sleepy(p) { height(Math.max(0.06, 1 - p * 0.94)); curl(-p * 6); }

  // ---- squash & stretch / happy bounce ----
  function squash(kit, { amount = 0.22, duration = 220 } = {}) {
    return animate(kit, duration, EASE.linear, (p) => {
      const w = Math.sin(p * Math.PI);
      state.scaleX = 1 + amount * w; state.scaleY = 1 - amount * 0.8 * w; applyHead();
    }, () => { state.scaleX = 1; state.scaleY = 1; applyHead(); });
  }
  function bounce(kit, { height: h = 46, duration = 420 } = {}) {
    return animate(kit, duration, EASE.linear, (p) => {
      state.jumpY = -h * Math.sin(p * Math.PI);
      const land = p > 0.78 ? (p - 0.78) / 0.22 : 0;
      const w = Math.sin(land * Math.PI) * 0.22;
      state.scaleX = 1 + w; state.scaleY = 1 - w * 0.8; applyHead();
    }, () => { state.jumpY = 0; state.scaleX = 1; state.scaleY = 1; applyHead(); });
  }

  // ---- shiver (cold, scared) ----
  function startShiver(kit, { intensity = 6, speed = 55 } = {}) {
    let amp = intensity, active = true;
    const h = kit.loop((dt, t) => {
      if (!active) { state.jx = 0; state.jy = 0; applyHead(); return false; }
      state.jx = Math.sin(t / speed) * amp;
      state.jy = Math.cos(t / (speed * 1.3)) * amp * 0.4;
      applyHead();
    });
    return { stop: () => { active = false; h && h(); }, setIntensity: (v) => { amp = v; } };
  }

  // ---- blush (lazy) ----
  let blushEls = null;
  function blush(show = true, { color = '#F2A6A6' } = {}) {
    if (!blushEls) {
      const mk = (sign) => kit.svg('ellipse', { cx: sign * r * 0.56, cy: r * 0.22, rx: r * 0.18, ry: r * 0.1, fill: color, opacity: 0 });
      blushEls = [mk(-1), mk(1)];
      overG.append(...blushEls);
    }
    blushEls.forEach((el) => el.setAttribute('opacity', show ? 0.55 : 0));
  }

  // ---- limbs (lazy) ----
  let limbs = null;
  function addLimbs({ arms = true, feet = true } = {}) {
    if (limbs) return limbs;
    const armColor = shade(green, 0.14);
    const out = {};
    if (arms) {
      const mkArm = (sign) => kit.svg('rect', {
        x: sign > 0 ? r * 0.7 : -r * 0.7 - r * 0.16, y: r * 0.05,
        width: r * 0.16, height: r * 0.46, rx: r * 0.08, fill: armColor,
      });
      out.armL = mkArm(-1); out.armR = mkArm(1);
      overG.append(out.armL, out.armR);
      out.waveR = (deg) => out.armR.setAttribute('transform', `rotate(${deg} ${r * 0.78} ${r * 0.05})`);
      out.waveL = (deg) => out.armL.setAttribute('transform', `rotate(${deg} ${-r * 0.78} ${r * 0.05})`);
    }
    if (feet) {
      const mkFoot = (sign) => kit.svg('ellipse', { cx: sign * r * 0.34, cy: r * 0.96, rx: r * 0.17, ry: r * 0.09, fill: armColor });
      out.footL = mkFoot(-1); out.footR = mkFoot(1);
      underG.append(out.footL, out.footR);
      out.step = (phase) => { // phase 0..1 loop, little waddle
        const a = Math.sin(phase * Math.PI * 2) * r * 0.05;
        out.footL.setAttribute('transform', `translate(0 ${a})`);
        out.footR.setAttribute('transform', `translate(0 ${-a})`);
      };
    }
    limbs = out;
    return out;
  }

  // ---- props ----
  function wearScarf({ color = '#C9764F' } = {}) {
    const y = r * 0.5, w = r * 1.5, h = r * 0.38;
    const g = kit.svg('g', {});
    const band = kit.svg('rect', { x: -w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: color });
    const dk = shade(color, 0.2);
    const stripe = kit.svg('rect', { x: -w / 2, y: y + h / 2 - h * 0.3, width: w, height: h * 0.3, rx: h * 0.15, fill: dk, opacity: 0.55 });
    const tail = kit.svg('rect', { x: w * 0.1, y: y + h * 0.26, width: w * 0.15, height: r * 0.4, rx: w * 0.075, fill: color, transform: `rotate(5 ${w * 0.1 + w * 0.075} ${y + h * 0.26})` });
    const tailDk = kit.svg('rect', { x: w * 0.1, y: y + h * 0.26 + r * 0.26, width: w * 0.15, height: h * 0.22, rx: h * 0.11, fill: dk, opacity: 0.55, transform: `rotate(5 ${w * 0.1 + w * 0.075} ${y + h * 0.26})` });
    g.append(band, stripe, tail, tailDk);
    overG.append(g);
    return g;
  }
  function wearHat({ kind = 'beanie', color = '#2F4F46' } = {}) {
    const g = kit.svg('g', {});
    const dk = shade(color, 0.2);
    if (kind === 'beanie') {
      const dome = kit.svg('path', { d: `M ${-r * 0.78} ${-r * 0.3} A ${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.78} ${-r * 0.3} L ${r * 0.78} ${-r * 0.14} L ${-r * 0.78} ${-r * 0.14} Z`, fill: color });
      const brim = kit.svg('rect', { x: -r * 0.8, y: -r * 0.2, width: r * 1.6, height: r * 0.18, rx: r * 0.09, fill: dk });
      const pom = kit.svg('circle', { cx: 0, cy: -r * 1.06, r: r * 0.13, fill: '#F7F5F1' });
      g.append(dome, brim, pom);
    } else { // bucket
      const crown = kit.svg('path', { d: `M ${-r * 0.62} ${-r * 0.32} Q 0 ${-r * 0.92} ${r * 0.62} ${-r * 0.32} Z`, fill: color });
      const brim = kit.svg('path', { d: `M ${-r * 0.95} ${-r * 0.26} Q 0 ${-r * 0.02} ${r * 0.95} ${-r * 0.26} L ${r * 0.78} ${-r * 0.38} Q 0 ${-r * 0.56} ${-r * 0.78} ${-r * 0.38} Z`, fill: dk });
      g.append(crown, brim);
    }
    overG.append(g);
    return g;
  }

  const bot = {
    group: posG, body, L, R, headG, overG, underG, shadowEl,
    height, curl, look, tilt, scale: s, get cx() { return posX; }, get cy() { return posY; }, r,
    moveTo, walkTo, blink, autoBlink, sleepy, squash, bounce, startShiver, blush, addLimbs, wearScarf, wearHat,
  };
  height(1);
  return bot;
}

// A handful of named moods, built from the primitives above. deg/dx/dy are already scaled
// relative to the bot's own radius by createBot, so these read the same at any size.
export const MOODS = {
  happy:    (bot) => { bot.height(0.42); bot.curl(26); bot.look(0, -6); bot.tilt(0); },
  sleepy:   (bot) => { bot.height(0.12); bot.curl(0); bot.look(0, 4); bot.tilt(-4); },
  curious:  (bot) => { bot.height(1); bot.curl(0); bot.look(10, -14); bot.tilt(9); },
  'side-eye': (bot) => { bot.height(0.7); bot.curl(0); bot.look(30, 2); bot.tilt(0); },
  shocked:  (bot) => { bot.height(1.45, 0.2); bot.curl(0); bot.look(0, 0); bot.tilt(0); },
};

// =======================================================================================
// Scene helpers — a small kit of rooms, furniture and weather so each game gets a real
// place to stand in, per POLISH.md's "light and depth" / "texture, quietly" rules. Pass a
// `parent` (your svg or a <g>) and each one appends itself and returns a handle; without
// `parent` it just returns the node(s) for you to append in whatever order you need.
// =======================================================================================

// A room: wall, floor, skirting line. floorY is where the floor starts (0-1000 scale).
export function room(kit, { parent, wall = '#E8DFCF', floor = '#C9764F', floorY = 700, skirt } = {}) {
  const g = kit.svg('g', {});
  const wallEl = kit.svg('rect', { x: 0, y: 0, width: 1000, height: floorY, fill: wall });
  const floorEl = kit.svg('rect', { x: 0, y: floorY, width: 1000, height: 1000 - floorY, fill: floor });
  const skirtEl = kit.svg('rect', { x: 0, y: floorY - 10, width: 1000, height: 10, fill: skirt || shade(wall, 0.16) });
  g.append(wallEl, floorEl, skirtEl);
  if (parent) parent.append(g);
  return { group: g, wall: wallEl, floor: floorEl, floorY };
}

// A window: frame, mullions, and a sky that's either 'day' or 'night' (stars + moon).
export function sceneWindow(kit, { parent, x = 650, y = 120, w = 240, h = 260, frame = INK,
  sky = 'night', curtains = false, glow = false } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  const skyColor = sky === 'night' ? '#1B2230' : '#CFE3EE';
  const pane = kit.svg('rect', { x: 0, y: 0, width: w, height: h, fill: skyColor });
  const clip = `clip-${Math.random().toString(36).slice(2, 8)}`;
  const clipPath = kit.svg('clipPath', { id: clip }, [kit.svg('rect', { x: 0, y: 0, width: w, height: h })]);
  const inner = kit.svg('g', { 'clip-path': `url(#${clip})` });
  inner.append(pane);
  let moon, stars = [];
  if (sky === 'night') {
    moon = kit.svg('circle', { cx: w * 0.72, cy: h * 0.28, r: w * 0.1, fill: '#F2D98A', opacity: 0.9 });
    inner.append(moon);
    for (let i = 0; i < 10; i++) {
      const star = kit.svg('circle', { cx: Math.random() * w, cy: Math.random() * h * 0.8, r: 1.4 + Math.random() * 1.6, fill: '#F7F5F1', opacity: 0.4 + Math.random() * 0.5 });
      stars.push(star); inner.append(star);
    }
  } else {
    const cloud = (cx, cy, s2) => kit.svg('g', { transform: `translate(${cx} ${cy}) scale(${s2})`, opacity: 0.8 }, [
      kit.svg('ellipse', { cx: 0, cy: 0, rx: 26, ry: 12, fill: '#F7F5F1' }),
      kit.svg('ellipse', { cx: 18, cy: -4, rx: 16, ry: 10, fill: '#F7F5F1' }),
    ]);
    inner.append(cloud(w * 0.3, h * 0.25, 1), cloud(w * 0.65, h * 0.45, 0.7));
  }
  if (glow) {
    const beam = kit.svg('polygon', { points: `0,${h} ${w},${h} ${w * 0.8},${h + 160} ${w * 0.2},${h + 160}`, fill: sky === 'night' ? '#8FA6B8' : '#F2D98A', opacity: 0.1 });
    g.append(beam);
  }
  g.append(inner, clipPath);
  const sashV = kit.svg('rect', { x: w / 2 - 4, y: 0, width: 8, height: h, fill: frame });
  const sashH = kit.svg('rect', { x: 0, y: h / 2 - 4, width: w, height: 8, fill: frame });
  const frameEl = kit.svg('rect', { x: -8, y: -8, width: w + 16, height: h + 16, fill: 'none', stroke: frame, 'stroke-width': 10, rx: 6 });
  g.append(sashV, sashH, frameEl);
  if (curtains) {
    const cc = '#8FA6B8';
    const curL = kit.svg('path', { d: `M -8 -8 Q ${w * 0.08} ${h * 0.5} -4 ${h + 8} L -40 ${h + 8} L -40 -8 Z`, fill: cc, opacity: 0.92 });
    const curR = kit.svg('path', { d: `M ${w + 8} -8 Q ${w - w * 0.08} ${h * 0.5} ${w + 4} ${h + 8} L ${w + 40} ${h + 8} L ${w + 40} -8 Z`, fill: cc, opacity: 0.92 });
    g.append(curL, curR);
  }
  if (parent) parent.append(g);
  return { group: g, moon, stars, w, h, x, y };
}

// Bedside table + lamp (lamp.on toggles the shade's glow and a warm pool of light).
export function nightstand(kit, { parent, x = 500, y = 760, w = 150, h = 90, wood = '#C9764F' } = {}) {
  const g = kit.svg('g', { transform: `translate(${x - w / 2} ${y})` });
  shadow(kit, { cx: w / 2, cy: h + 10, rx: w * 0.62, ry: 10, parent: g });
  const top = kit.svg('rect', { x: 0, y: 0, width: w, height: 14, fill: tint(wood, 0.12) });
  const body = kit.svg('rect', { x: 8, y: 14, width: w - 16, height: h - 14, fill: wood });
  const grainA = kit.svg('line', { x1: 8, y1: 34, x2: w - 8, y2: 34, stroke: shade(wood, 0.14), 'stroke-width': 2, opacity: 0.5 });
  const grainB = kit.svg('line', { x1: 8, y1: 58, x2: w - 8, y2: 58, stroke: shade(wood, 0.14), 'stroke-width': 2, opacity: 0.5 });
  const knob = kit.svg('circle', { cx: w / 2, cy: h * 0.6, r: 5, fill: shade(wood, 0.3) });
  g.append(top, body, grainA, grainB, knob);
  if (parent) parent.append(g);
  return { group: g, x, y, w, h };
}

export function lamp(kit, { parent, x = 500, y = 740, on = false, color = '#F2D98A' } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  const glow = kit.svg('circle', { cx: 0, cy: -36, r: 90, fill: color, opacity: on ? 0.28 : 0 });
  const pole = kit.svg('rect', { x: -4, y: -40, width: 8, height: 40, fill: INK });
  const base = kit.svg('ellipse', { cx: 0, cy: 0, rx: 20, ry: 6, fill: INK });
  const shadeEl = kit.svg('path', { d: 'M -22 -40 L 22 -40 L 30 -68 L -30 -68 Z', fill: on ? color : '#8FA6B8' });
  g.append(glow, pole, base, shadeEl);
  if (parent) parent.append(g);
  return { group: g, glow, shadeEl, set on_(v) {}, setOn(v) { glow.setAttribute('opacity', v ? 0.28 : 0); shadeEl.setAttribute('fill', v ? color : '#8FA6B8'); } };
}

// A small bed: frame, pillow, a blanket whose height can be animated to "breathe".
export function bed(kit, { parent, x = 500, y = 640, w = 420, h = 220, cover = '#8FA6B8', frame = '#C9764F' } = {}) {
  const g = kit.svg('g', { transform: `translate(${x - w / 2} ${y})` });
  shadow(kit, { cx: w / 2, cy: h + 14, rx: w * 0.56, ry: 14, parent: g });
  const frameEl = kit.svg('rect', { x: -10, y: 20, width: w + 20, height: h - 10, rx: 16, fill: frame });
  const sheet = kit.svg('rect', { x: 6, y: 34, width: w - 12, height: h - 30, rx: 12, fill: tint(cover, 0.5) });
  const pillow = kit.svg('ellipse', { cx: w * 0.22, cy: 56, rx: w * 0.17, ry: 30, fill: '#F7F5F1', stroke: shade('#F7F5F1', 0.08), 'stroke-width': 2 });
  const blanket = kit.svg('path', { d: `M 0 90 Q ${w / 2} 60 ${w} 90 L ${w} ${h} L 0 ${h} Z`, fill: cover });
  const blanketDk = kit.svg('path', { d: `M 0 90 Q ${w / 2} 60 ${w} 90`, fill: 'none', stroke: shade(cover, 0.14), 'stroke-width': 4, opacity: 0.6 });
  g.append(frameEl, sheet, pillow, blanket, blanketDk);
  if (parent) parent.append(g);
  // breathe(p): p 0..1 easing the blanket's rise/fall for one breath cycle.
  function breathe(p) {
    const lift = Math.sin(p * Math.PI) * 8;
    blanket.setAttribute('transform', `translate(0 ${-lift})`);
    blanketDk.setAttribute('transform', `translate(0 ${-lift})`);
  }
  return { group: g, pillow, blanket, blanketDk, breathe, x, y, w, h };
}

// Something to hide behind, for shy — a rounded armchair arm / sofa side, drawn with a
// darker ink-ward shadow side matching the top-left light.
// A door, ajar, to hide behind — frame on the wall, a dark gap where it's swung open, the
// panel itself facing us with trim and a brass handle.
export function hideBehind(kit, { parent, x = 160, y = 180, w = 200, h = 540, color = '#F7F5F1', frame = INK } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  shadow(kit, { cx: w * 0.42, cy: h + 10, rx: w * 0.78, ry: 15, parent: g });
  const frameW = w * 1.14;
  const frameOuter = kit.svg('rect', { x: -w * 0.06, y: -18, width: frameW, height: h + 30, rx: 4, fill: frame });
  const gap = kit.svg('rect', { x: -w * 0.02, y: -8, width: frameW - w * 0.08, height: h + 12, fill: shade(color, 0.6) });
  const doorW = w * 0.82;
  const doorX = w - doorW;
  const door = kit.svg('rect', { x: doorX, y: 0, width: doorW, height: h, rx: 6, fill: color, stroke: shade(color, 0.12), 'stroke-width': 3 });
  const panelHi = kit.svg('rect', { x: doorX + doorW * 0.16, y: h * 0.07, width: doorW * 0.68, height: h * 0.36, rx: 8, fill: 'none', stroke: tint(color, 0.3), 'stroke-width': 5, opacity: 0.8 });
  const panelLo = kit.svg('rect', { x: doorX + doorW * 0.16, y: h * 0.52, width: doorW * 0.68, height: h * 0.36, rx: 8, fill: 'none', stroke: tint(color, 0.3), 'stroke-width': 5, opacity: 0.8 });
  const knob = kit.svg('circle', { cx: doorX + doorW * 0.88, cy: h * 0.53, r: w * 0.045, fill: '#F2D98A', stroke: shade('#F2D98A', 0.25), 'stroke-width': 2 });
  g.append(frameOuter, gap, door, panelHi, panelLo, knob);
  if (parent) parent.append(g);
  return { group: g, x, y, w, h };
}

// "z z z" sleep particles that drift up and fade; call spawn() whenever you want a new one.
export function zParticles(kit, { parent, x = 0, y = 0, color } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  if (parent) parent.append(g);
  function spawn(size = 1) {
    const z = kit.svg('text', {
      x: 0, y: 0, 'font-family': 'var(--display)', 'font-weight': 700, 'font-size': 34 * size,
      fill: color || '#6B6A66', opacity: 0.9, text: 'z',
    });
    g.append(z);
    animate(kit, 1800, EASE.linear, (p) => {
      z.setAttribute('transform', `translate(${p * 26 * size} ${-p * 90 * size}) rotate(${-14 + p * 8})`);
      z.setAttribute('opacity', (1 - p) * 0.85);
    }, () => z.remove());
  }
  return { group: g, spawn };
}

// A short burst of spark lines (friction rubbing warmth back into something cold).
export function sparks(kit, { parent, x = 0, y = 0, color = '#F2D98A', count = 6 } = {}) {
  const g = kit.svg('g', { transform: `translate(${x} ${y})` });
  if (parent) parent.append(g);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const len = 14 + Math.random() * 16;
    const line = kit.svg('line', { x1: 0, y1: 0, x2: Math.cos(a) * len, y2: Math.sin(a) * len, stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.95 });
    g.append(line);
    animate(kit, 320 + Math.random() * 140, easeOutCubic, (p) => {
      const d = (1 + p * 1.6);
      line.setAttribute('transform', `scale(${d})`);
      line.setAttribute('opacity', 1 - p);
    }, () => line.remove());
  }
  return { group: g };
}

// Frost creeping on glass: a handful of soft white blobs in the corners whose combined
// opacity/reach tracks `coverage` (1 = fully frosted, 0 = clear). Call set(coverage).
export function frost(kit, { parent, w = 240, h = 260 } = {}) {
  const g = kit.svg('g', {});
  const corners = [
    { cx: 0, cy: 0, sx: 1, sy: 1 }, { cx: w, cy: 0, sx: -1, sy: 1 },
    { cx: 0, cy: h, sx: 1, sy: -1 }, { cx: w, cy: h, sx: -1, sy: -1 },
  ];
  // each corner is a little cluster of soft overlapping circles, like frost creeping in —
  // reads better at small sizes than a single curved blob.
  const clusters = corners.map(({ cx, cy, sx, sy }) => {
    const spots = [
      { dx: 0, dy: 0, r: w * 0.3 },
      { dx: w * 0.28 * sx, dy: h * 0.06 * sy, r: w * 0.2 },
      { dx: w * 0.06 * sx, dy: h * 0.3 * sy, r: w * 0.2 },
      { dx: w * 0.24 * sx, dy: h * 0.26 * sy, r: w * 0.13 },
    ];
    const els = spots.map((s) => kit.svg('circle', { cx: cx + s.dx, cy: cy + s.dy, r: s.r, fill: '#F7F5F1', opacity: 0 }));
    els.forEach((e) => g.append(e));
    return els;
  });
  if (parent) parent.append(g);
  function set(coverage) {
    const c = clamp01(coverage);
    clusters.forEach((els) => els.forEach((e, i) => {
      e.setAttribute('opacity', c <= 0 ? 0 : Math.max(0, Math.min(0.95, c * 1.15 - i * 0.14)));
    }));
  }
  set(0);
  return { group: g, set };
}

// A pocket phone lighting up, for still-up's "a phone lighting up" beat.
export function phone(kit, { parent, x = 0, y = 0, w = 60, h = 108, lit = false } = {}) {
  const g = kit.svg('g', { transform: `translate(${x - w / 2} ${y - h / 2})` });
  const glow = kit.svg('rect', { x: -14, y: -14, width: w + 28, height: h + 28, rx: 20, fill: '#F2D98A', opacity: lit ? 0.3 : 0 });
  const body = kit.svg('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: INK });
  const screen = kit.svg('rect', { x: 4, y: 4, width: w - 8, height: h - 8, rx: 7, fill: lit ? '#F2D98A' : '#1B2230' });
  g.append(glow, body, screen);
  if (parent) parent.append(g);
  return { group: g, setLit(v) { glow.setAttribute('opacity', v ? 0.3 : 0); screen.setAttribute('fill', v ? '#F2D98A' : '#1B2230'); } };
}

// Converts a distance expressed in "units at the 1000 scale" (the same scale every SVG
// in these games is drawn at) to real px, based on the stage's current rendered width —
// so HTML overlay text (which can't use viewBox units directly) still scales exactly like
// the SVG content around it.
function unitPx(kit, units) {
  const w = (kit.stage && kit.stage.clientWidth) || 1000;
  return (w / 1000) * units;
}

// Framing per POLISH.md rules 5 + 8: a small lowercase heading — Space Grotesk 600 at ~34
// units — with the green dot as its full stop, and a mono hint at ~22 units underneath
// that you remove once the player starts. Both re-measure against the stage on resize.
export function heading(kit, { parent, line, hint, accent, color, hintColor } = {}) {
  const wrap = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', top: '5%', textAlign: 'center', pointerEvents: 'none' } });
  const dot = kit.el('span', { style: { display: 'inline-block', width: '0.22em', height: '0.22em', borderRadius: '50%', background: accent || (kit.colors && kit.colors.accent) || '#00A862', marginLeft: '0.08em' } });
  const text = (line.endsWith('.') ? line.slice(0, -1) : line).toLowerCase();
  const h = kit.el('p', {
    style: {
      margin: '0', fontFamily: 'var(--display)', fontWeight: '600', letterSpacing: '-0.01em',
      color: color || 'var(--ink)', textTransform: 'lowercase',
    }, text,
  }, [dot]);
  wrap.append(h);
  let hintEl;
  if (hint) {
    hintEl = kit.el('p', { class: 'g-mono', style: { margin: '0.4em 0 0', color: hintColor || 'var(--muted)', transition: 'opacity .25s ease' }, text: hint });
    wrap.append(hintEl);
  }
  if (parent) parent.append(wrap);

  function resize() {
    h.style.fontSize = `${unitPx(kit, 34)}px`;
    if (hintEl) hintEl.style.fontSize = `${unitPx(kit, 22)}px`;
  }
  resize();
  try {
    const ro = new ResizeObserver(resize);
    ro.observe(kit.stage);
    kit.cleanup(() => ro.disconnect());
  } catch {}

  return { group: wrap, hide() { if (hintEl) hintEl.style.opacity = '0'; } };
}

// POLISH.md rule 6, "the win beat": the line big and centred on a soft rounded paper panel
// so it reads clearly over any scene, holds briefly, then calls kit.win(line). `svg` is the
// game's own root <svg> — the panel is drawn and appended last, so it always sits above the
// scenery. opts: delay (ms before it appears, to let an in-scene beat play first; default
// 0), hold (ms shown before kit.win fires; default 1200), cy (vertical centre, 1000 scale;
// default 500), message (what's passed to kit.win, defaults to the same line).
export function winBeat(kit, svg, line, opts = {}) {
  const { delay = 0, hold = 1200, cy = 500, message = line } = opts;
  const paper = opts.paper || '#F7F5F1';
  const inkColor = opts.ink || INK;
  const dotColor = opts.accent || (kit.colors && kit.colors.accent) || '#00A862';
  const text = (line.endsWith('.') ? line.slice(0, -1) : line).toLowerCase();

  const fs = 56;
  const estTextW = text.length * fs * 0.6;
  const panelW = Math.min(860, Math.max(420, estTextW + fs * 2.6));
  const panelH = fs * 2.5;

  const g = kit.svg('g', { opacity: 0 });
  shadow(kit, { cx: 500, cy: cy + panelH * 0.46, rx: panelW * 0.46, ry: panelH * 0.2, opacity: 0.14, parent: g });
  const panel = kit.svg('rect', { x: 500 - panelW / 2, y: cy - panelH / 2, width: panelW, height: panelH, rx: panelH * 0.32, fill: paper, opacity: 0.92 });
  const txt = kit.svg('text', {
    x: 500, y: cy + fs * 0.33, 'text-anchor': 'middle',
    'font-family': 'var(--display)', 'font-weight': 600, 'font-size': fs, fill: inkColor, text,
  });
  g.append(panel, txt);
  svg.append(g);

  kit.after(delay, () => {
    let dotX = 500 + estTextW / 2 + fs * 0.2, dotY = cy + fs * 0.12;
    try {
      const bbox = txt.getBBox();
      dotX = bbox.x + bbox.width + fs * 0.14;
      dotY = bbox.y + bbox.height - fs * 0.14;
    } catch {}
    g.append(kit.svg('circle', { cx: dotX, cy: dotY, r: fs * 0.08, fill: dotColor }));
    g.setAttribute('transform', 'translate(0 16)');
    animate(kit, 260, EASE.outCubic, (p) => {
      g.setAttribute('opacity', p);
      g.setAttribute('transform', `translate(0 ${16 * (1 - p)})`);
    });
    kit.after(hold, () => kit.win(message));
  });

  return { group: g };
}

export default { createBot, MOODS, shadow, room, sceneWindow, nightstand, lamp, bed, hideBehind, zParticles, sparks, frost, phone, heading, winBeat, shade, tint, mix, animate, EASE };

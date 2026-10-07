// Shared helper: draws taktekbot's face (green circle, two pill eye-cutouts) per GAMES.md
// rule 9. Brand geometry at the 1024 scale: circle r=232 at (512,512); eyes are rounded
// rects 56x120, rx 28, at x=420/x=548, y=442 — i.e. eye centres sit 64 units either side of
// the circle's centre and 10 units above it. We scale that geometry to whatever radius a
// game needs and draw straight into the 1000x1000 viewBox.
//
// Used by several of the taktekbot unlock games (gate-12, its-calling, it-climbs-in,
// follow-the-sun, why, moods, never-slept) so the face reads the same way everywhere.
export function createBot(kit, { cx = 500, cy = 500, r = 220, bg = '#EFECE6', color } = {}) {
  const green = color || (kit.colors && kit.colors.accent) || '#00A862';
  const s = r / 232;
  const baseW = 56 * s, baseH = 120 * s, rx = 28 * s;
  const offX = 64 * s, offY = -10 * s;

  const headG = kit.svg('g', {});
  const body = kit.svg('circle', { cx, cy, r, fill: green });
  const eyesG = kit.svg('g', {});

  function makeEye(sign) {
    const holder = kit.svg('g', { transform: `translate(${cx + sign * offX} ${cy + offY})` });
    const rect = kit.svg('rect', { x: -baseW / 2, y: -baseH / 2, width: baseW, height: baseH, rx, fill: bg });
    holder.append(rect);
    return { holder, rect };
  }
  const L = makeEye(-1), R = makeEye(1);
  eyesG.append(L.holder, R.holder);
  headG.append(body, eyesG);

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
  // Tilt the whole head (curious cock of the head), degrees, around its own centre.
  function tilt(deg) { headG.setAttribute('transform', deg ? `rotate(${deg} ${cx} ${cy})` : ''); }

  height(1);
  return { group: headG, body, L, R, height, curl, look, tilt, scale: s, cx, cy, r };
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

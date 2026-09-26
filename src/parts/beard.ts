import type { Geometry } from '../geometry.js';
import { stream, type Dice } from '../random.js';
import { f, type Pen } from '../svg.js';
import type { Beard, FaceConfig } from '../types.js';

/** Slanted hatching between x1 and x2; strokes sink a little towards the sides, following the jaw. */
function hatch(x1: number, x2: number, y1: number, y2: number, step = 1.3): string {
  let d = '';
  for (let x = x1; x <= x2; x += step) d += `M${f(x)} ${f(y1 + Math.abs(x - 24) * 0.12)}l-.8 ${f(y2 - y1)}`;
  return `<path d="${d}" class="detail soft"/>`;
}

type BeardDrawer = (g: Geometry, pen: Pen, d: Dice) => string;

const BEARDS: Record<Exclude<Beard, 'none'>, BeardDrawer> = {
  moustache: ({ mw, my, nb }, pen) =>
    `<path ${pen.bg} d="M${f(24 - mw - 0.6)} ${f(my - 0.6)}Q22 ${f(nb + 0.2)} 24 ${f(nb + 1)}Q26 ${f(nb + 0.2)} ${f(24 + mw + 0.6)} ${f(my - 0.6)}Q24 ${f(my - 1.4)} ${f(24 - mw - 0.6)} ${f(my - 0.6)}Z"/>` +
    hatch(24 - mw, 24 + mw, nb + 1.2, nb + 2.4, 1),
  // Two thick strokes curling up at the tips.
  handlebar: ({ mw, my, nb }) =>
    `<path d="M24 ${f(nb + 1)}Q21 ${f(nb + 0.2)} ${f(24 - mw - 1.4)} ${f(my - 0.4)}q-1 .6-.4-1.4M24 ${f(nb + 1)}Q27 ${f(nb + 0.2)} ${f(24 + mw + 1.4)} ${f(my - 0.4)}q1 .6.4-1.4" class="thick"/>`,
  // Full beard from cheek to cheek; the mouth stays free.
  full: ({ C, E, B, my }, pen) =>
    `<path ${pen.bg} d="M${f(24 - C + 0.4)} ${f(E + 2)}C${f(24 - C)} ${f(B + 3)} 19 ${f(B + 4)} 24 ${f(B + 4.4)}C29 ${f(B + 4)} ${f(24 + C)} ${f(B + 3)} ${f(24 + C - 0.4)} ${f(E + 2)}C${f(24 + C - 1.6)} ${f(my)} 28 ${f(my - 2)} 24 ${f(my - 2)}C20 ${f(my - 2)} ${f(24 - C + 1.6)} ${f(my)} ${f(24 - C + 0.4)} ${f(E + 2)}Z"/>` +
    hatch(24 - C + 2, 24 + C - 2, my + 1.2, my + 4),
  goatee: ({ my, B }, pen) =>
    `<path ${pen.bg} d="M21.4 ${f(my + 1.4)}Q24 ${f(my + 2.4)} 26.6 ${f(my + 1.4)}L24 ${f(B + 2.4)}Z"/>` +
    hatch(22.4, 25.6, my + 2, my + 3.6, 1),
  // Stubble: dots scattered along the jaw, denser in the middle of the chin.
  stubble: ({ J, my }, _pen, d) => {
    const dots = Array.from({ length: 16 }, () => {
      const a = d.between(-1, 1);
      return `<circle cx="${f(24 + a * (J + 1.6))}" cy="${f(my + 1 + (1 - a * a) * d.between(0.6, 3.4))}" r=".28"/>`;
    });
    return `<g class="fill detail">${dots.join('')}</g>`;
  },
};

export function beard(config: FaceConfig, g: Geometry, pen: Pen): string {
  if (config.beard === 'none') return '';
  return BEARDS[config.beard](g, pen, stream(config.jitter, 'beard'));
}

import type { Geometry } from '../geometry.js';
import { f, type Pen } from '../svg.js';
import type { Hat } from '../types.js';
import { dome } from './head.js';

const HATS: Record<Exclude<Hat, 'none'>, (g: Geometry, pen: Pen) => string> = {
  // Bobble hat: pompom, crown, and a ribbed turn-up.
  beanie: (g, pen) => {
    const { C, T, E } = g;
    const rib = E - 8.6;
    return (
      `<circle ${pen.bg} cx="24" cy="${f(T - 5)}" r="2.4"/>` +
      `<path ${pen.bg} d="${dome(g, 1.2, 5)}Z"/>` +
      `<path ${pen.bg} d="M${f(24 - C - 1.6)} ${f(rib)}H${f(24 + C + 1.6)}V${f(E - 5)}H${f(24 - C - 1.6)}Z"/>` +
      `<path d="M${f(24 - C + 1)} ${f(rib)}v3.6M${f(24 - C + 3)} ${f(rib)}v3.6M${f(24 + C - 1)} ${f(rib)}v3.6M${f(24 + C - 3)} ${f(rib)}v3.6M22 ${f(rib)}v3.6M26 ${f(rib)}v3.6" class="detail soft"/>`
    );
  },
  // Cap with the peak turned to the side.
  cap: (g, pen) => {
    const { C, T, E } = g;
    return (
      `<path ${pen.bg} d="${dome(g, 1, 6)}Z"/>` +
      `<path ${pen.bg} d="M24 ${f(E - 6)}H${f(24 + C + 6)}q-1 2.2-4 2.4H24z"/>` +
      `<path d="M24 ${f(T - 1)}v2" class="detail"/>`
    );
  },
  // Brimmed hat: the brim first, the crown on top, a band across it.
  brimmed: ({ C, T, E }, pen) =>
    `<path ${pen.bg} d="M${f(24 - C - 5)} ${f(E - 6)}Q24 ${f(E - 8.6)} ${f(24 + C + 5)} ${f(E - 6)}Q24 ${f(E - 4)} ${f(24 - C - 5)} ${f(E - 6)}Z"/>` +
    `<path ${pen.bg} d="M${f(24 - C + 1)} ${f(E - 7)}C${f(24 - C + 1)} ${f(T - 5)} ${f(24 + C - 1)} ${f(T - 5)} ${f(24 + C - 1)} ${f(E - 7)}Z"/>` +
    `<path d="M${f(24 - C + 1.2)} ${f(E - 9.4)}Q24 ${f(E - 11)} ${f(24 + C - 1.2)} ${f(E - 9.4)}" class="thick"/>`,
  // A curved band across the forehead, above the brows.
  headband: ({ C, by }, pen) =>
    `<path ${pen.bg} d="M${f(24 - C - 0.4)} ${f(by - 3.4)}Q24 ${f(by - 6)} ${f(24 + C + 0.4)} ${f(by - 3.4)}V${f(by - 1.4)}Q24 ${f(by - 4)} ${f(24 - C - 0.4)} ${f(by - 1.4)}Z"/>`,
};

export const hat = (kind: Hat, g: Geometry, pen: Pen): string => (kind === 'none' ? '' : HATS[kind](g, pen));

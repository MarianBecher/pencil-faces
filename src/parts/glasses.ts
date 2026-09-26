import type { Geometry } from '../geometry.js';
import { f, type Pen } from '../svg.js';
import type { Glasses } from '../types.js';

const GLASSES: Record<Exclude<Glasses, 'none'>, (g: Geometry, pen: Pen) => string> = {
  // Round lenses, a curved bridge and temples running back to the ears.
  round: ({ xL, xR, E, C, spread }) =>
    `<circle cx="${f(xL)}" cy="${f(E)}" r="3.4"/><circle cx="${f(xR)}" cy="${f(E)}" r="3.4"/>` +
    `<path d="M${f(xL + 3.4)} ${f(E - 0.4)}q${f(spread - 3.4)}-1.4 ${f((spread - 3.4) * 2)} 0M${f(xL - 3.4)} ${f(E - 0.4)}L${f(24 - C + 0.2)} ${f(E - 1)}M${f(xR + 3.4)} ${f(E - 0.4)}L${f(24 + C - 0.2)} ${f(E - 1)}"/>`,
  // Square frames with a glint on each lens.
  square: ({ xL, xR, E, C }) =>
    `<rect x="${f(xL - 3.6)}" y="${f(E - 2.6)}" width="7.2" height="5.2" rx="1"/><rect x="${f(xR - 3.6)}" y="${f(E - 2.6)}" width="7.2" height="5.2" rx="1"/>` +
    `<path d="M${f(xL + 3.6)} ${f(E - 1)}H${f(xR - 3.6)}M${f(xL - 3.6)} ${f(E - 1)}L${f(24 - C + 0.2)} ${f(E - 1.4)}M${f(xR + 3.6)} ${f(E - 1)}L${f(24 + C - 0.2)} ${f(E - 1.4)}"/>` +
    `<path d="M${f(xL - 2.6)} ${f(E + 1.8)}l2-3M${f(xR - 2.6)} ${f(E + 1.8)}l2-3" class="detail soft"/>`,
  // Sunglasses: filled lenses that hide the eyes, shaded with hatching.
  sunglasses: ({ xL, xR, E, C }, pen) =>
    `<path ${pen.bg} d="M${f(xL - 3.6)} ${f(E - 2)}H${f(xL + 3.4)}Q${f(xL + 3)} ${f(E + 3)} ${f(xL)} ${f(E + 3)}T${f(xL - 3.6)} ${f(E - 2)}ZM${f(xR - 3.4)} ${f(E - 2)}H${f(xR + 3.6)}Q${f(xR + 3.2)} ${f(E + 3)} ${f(xR)} ${f(E + 3)}T${f(xR - 3.4)} ${f(E - 2)}Z"/>` +
    `<path d="M${f(xL - 2.4)} ${f(E + 1)}l3-3M${f(xL - 0.8)} ${f(E + 2.2)}l3.4-3.6M${f(xR - 2.4)} ${f(E + 1)}l3-3M${f(xR - 0.8)} ${f(E + 2.2)}l3.4-3.6" class="soft"/>` +
    `<path d="M${f(xL + 3.4)} ${f(E - 1.6)}H${f(xR - 3.4)}M${f(xL - 3.6)} ${f(E - 1.8)}L${f(24 - C + 0.2)} ${f(E - 2.2)}M${f(xR + 3.6)} ${f(E - 1.8)}L${f(24 + C - 0.2)} ${f(E - 2.2)}"/>`,
  // A monocle on the right eye, with its chain.
  monocle: ({ xR, E }) =>
    `<circle cx="${f(xR)}" cy="${f(E)}" r="3"/><path d="M${f(xR + 2)} ${f(E + 2.2)}q2 5-1 12" class="detail soft"/>`,
};

export const glasses = (kind: Glasses, g: Geometry, pen: Pen): string =>
  kind === 'none' ? '' : GLASSES[kind](g, pen);

import type { Geometry } from '../geometry.js';
import { f } from '../svg.js';
import type { Nose } from '../types.js';

const NOSES: Record<Nose, (g: Geometry) => string> = {
  // A single curve down the side and a short base.
  plain: ({ nTop, nb, side }) =>
    `<path d="M24 ${f(nTop)}Q${f(24 + side * 2.4)} ${f(nb - 1)} ${f(24 + side * 0.6)} ${f(nb)}H${f(24 - side * 1.6)}"/>`,
  hook: ({ nTop, nb, side }) =>
    `<path d="M${f(24 - side * 0.4)} ${f(nTop)}Q${f(24 + side * 4.4)} ${f(nb - 2)} ${f(24 + side * 1.4)} ${f(nb + 0.6)}Q24 ${f(nb + 1)} ${f(24 - side * 0.6)} ${f(nb - 0.4)}"/>`,
  // A round tip with a faint bridge.
  bulb: ({ nTop, nLen, nb }) =>
    `<path d="M22.4 ${f(nb - 1.4)}a2.2 2 0 1 0 3.2 0"/><path d="M23.2 ${f(nTop + 1)}v${f(nLen - 3)}" class="detail soft"/>`,
  // Snub: only the underside and two nostrils.
  snub: ({ nb }) =>
    `<path d="M22.2 ${f(nb - 0.6)}q1.8 1.4 3.6 0"/><circle cx="23.1" cy="${f(nb - 0.9)}" r=".35" class="fill detail"/><circle cx="24.9" cy="${f(nb - 0.9)}" r=".35" class="fill detail"/>`,
  // Wide, with flared nostrils.
  wide: ({ nTop, nb }) =>
    `<path d="M23.4 ${f(nTop)}V${f(nb - 1.2)}"/><path d="M21.2 ${f(nb - 1.4)}q.2 1.8 1.8 1.4q1 .6 2 0q1.6.4 1.8-1.4"/>`,
  pointed: ({ nTop, nb, side }) =>
    `<path d="M24 ${f(nTop)}L${f(24 + side * 1.8)} ${f(nb)}L${f(24 - side * 0.4)} ${f(nb - 0.2)}"/>`,
};

export const nose = (kind: Nose, g: Geometry): string => NOSES[kind](g);

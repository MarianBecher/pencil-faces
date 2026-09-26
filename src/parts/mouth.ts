import type { Geometry } from '../geometry.js';
import { stream, type Dice } from '../random.js';
import { f, type Pen } from '../svg.js';
import type { FaceConfig, Mouth } from '../types.js';

type MouthDrawer = (g: Geometry, pen: Pen, d: Dice) => string;

const MOUTHS: Record<Mouth, MouthDrawer> = {
  // The right corner wobbles, so the line is never ruler-straight.
  line: ({ my, mw }, _pen, d) => `<path d="M${f(24 - mw)} ${f(my)}L${f(24 + mw)} ${d.wob(my, 0.3)}"/>`,
  smile: ({ my, mw }) => `<path d="M${f(24 - mw)} ${f(my - 0.4)}Q24 ${f(my + 2)} ${f(24 + mw)} ${f(my - 0.4)}"/>`,
  // An open grin with a row of teeth.
  grin: ({ my, mw }, pen) =>
    `<path ${pen.bg} d="M${f(24 - mw - 0.4)} ${f(my - 0.8)}Q24 ${f(my + 4)} ${f(24 + mw + 0.4)} ${f(my - 0.8)}Z"/><path d="M${f(24 - mw + 0.4)} ${f(my + 0.2)}H${f(24 + mw - 0.4)}" class="detail soft"/>`,
  // Astonished: a small "o".
  surprised: ({ my }) => `<ellipse cx="24" cy="${f(my + 0.2)}" rx="1.3" ry="1.6"/>`,
  crooked: ({ my, mw }) => `<path d="M${f(24 - mw)} ${f(my + 0.4)}Q24.6 ${f(my + 0.8)} ${f(24 + mw)} ${f(my - 1)}"/>`,
  pout: ({ my, mw }) => {
    const w = mw - 0.6;
    return `<path d="M${f(24 - w)} ${f(my)}q${f(w)}-1.2 ${f(w * 2)} 0q${f(-w)} 1.8 ${f(-w * 2)} 0z"/>`;
  },
  // Sceptical, corners down.
  frown: ({ my, mw }) => `<path d="M${f(24 - mw)} ${f(my + 0.8)}Q24 ${f(my - 1)} ${f(24 + mw)} ${f(my + 0.8)}"/>`,
  // A broad smile with a dimple at each corner.
  dimples: ({ my, mw }) =>
    `<path d="M${f(24 - mw - 0.6)} ${f(my - 0.8)}Q24 ${f(my + 2.6)} ${f(24 + mw + 0.6)} ${f(my - 0.8)}"/><path d="M${f(24 - mw - 1.4)} ${f(my - 1.2)}l.6 .8M${f(24 + mw + 1.4)} ${f(my - 1.2)}l-.6 .8" class="detail"/>`,
};

export function mouth(config: FaceConfig, g: Geometry, pen: Pen): string {
  return MOUTHS[config.mouth](g, pen, stream(config.jitter, 'mouth'));
}

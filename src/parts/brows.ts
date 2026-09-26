import type { Geometry } from '../geometry.js';
import { stream, type Dice } from '../random.js';
import { f } from '../svg.js';
import type { Brows, FaceConfig } from '../types.js';

/** One brow centred on x; `s` is -1 for the left and +1 for the right one, to mirror slanted brows. */
type BrowDrawer = (x: number, s: 1 | -1, by: number, d: Dice) => string;

const BROWS: Record<Exclude<Brows, 'unibrow'>, BrowDrawer> = {
  // Both ends wobble independently, so a straight brow is never quite level.
  straight: (x, _s, by, d) => `<path d="M${f(x - 2.4)} ${d.wob(by)}L${f(x + 2.4)} ${d.wob(by)}"/>`,
  arch: (x, _s, by) => `<path d="M${f(x - 2.6)} ${f(by + 0.6)}q2.6-2.4 5.2 0"/>`,
  // Inner ends pulled down...
  angry: (x, s, by) => `<path d="M${f(x - 2.4 * s)} ${f(by - 0.8)}L${f(x + 2.2 * s)} ${f(by + 0.8)}"/>`,
  // ...or up.
  worried: (x, s, by) => `<path d="M${f(x - 2.4 * s)} ${f(by + 0.6)}L${f(x + 2.2 * s)} ${f(by - 1)}"/>`,
  // Four short thick hairs instead of a line.
  bushy: (x, _s, by) =>
    `<path d="M${f(x - 2.8)} ${f(by + 0.4)}l1-1.4M${f(x - 1.4)} ${f(by + 0.2)}l1-1.6M${f(x)} ${f(by + 0.2)}l1-1.6M${f(x + 1.4)} ${f(by + 0.3)}l1-1.4" class="thick"/>`,
  thin: (x, _s, by) => `<path d="M${f(x - 2)} ${f(by - 0.6)}q2-1 4 0" class="detail"/>`,
  // One brow raised sceptically, the other flat.
  raised: (x, s, by) =>
    s < 0 ? `<path d="M${f(x - 2.4)} ${f(by - 1.2)}q2.4-2 4.8 0"/>` : `<path d="M${f(x - 2.4)} ${f(by + 0.2)}h4.8"/>`,
};

export function brows(config: FaceConfig, g: Geometry): string {
  const { xL, xR, by } = g;
  if (config.brows === 'unibrow') {
    return `<path d="M${f(xL - 2.6)} ${f(by + 0.4)}Q${f(xL)} ${f(by - 1.2)} 24 ${f(by + 0.2)}Q${f(xR)} ${f(by - 1.2)} ${f(xR + 2.6)} ${f(by + 0.4)}" class="thick"/>`;
  }
  const d = stream(config.jitter, 'brows');
  const draw = BROWS[config.brows];
  return draw(xL, -1, by, d) + draw(xR, 1, by, d);
}

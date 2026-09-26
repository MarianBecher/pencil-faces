import type { Geometry } from '../geometry.js';
import { stream } from '../random.js';
import { f } from '../svg.js';
import type { Eyes, FaceConfig } from '../types.js';

/** One eye at x/y; `i` is 0 for the left and 1 for the right eye. */
type EyeDrawer = (x: number, y: number, look: number, i: 0 | 1) => string;

const EYES: Record<Eyes, EyeDrawer> = {
  dot: (x, y, look) => `<circle cx="${f(x + look)}" cy="${y}" r="1.1" class="fill"/>`,
  // An almond outline with the pupil inside.
  open: (x, y, look) =>
    `<path d="M${f(x - 2.3)} ${y}q2.3-2.4 4.6 0q-2.3 2.2-4.6 0z"/><circle cx="${f(x + look)}" cy="${y}" r=".9" class="fill"/>`,
  // A heavy upper lid over a half-closed eye.
  lidded: (x, y, look) =>
    `<path d="M${f(x - 2.4)} ${f(y - 0.3)}q2.4-1.6 4.8 0"/><path d="M${f(x - 2)} ${f(y - 0.1)}q2 1.8 4 0"/><circle cx="${f(x + look)}" cy="${f(y + 0.4)}" r=".8" class="fill"/>`,
  // Closed with laughter: an upturned arc.
  happy: (x, y) => `<path d="M${f(x - 2)} ${f(y + 0.6)}q2-2.4 4 0"/>`,
  wide: (x, y, look) => `<circle cx="${f(x)}" cy="${y}" r="2.1"/><circle cx="${f(x + look)}" cy="${y}" r=".7" class="fill"/>`,
  squint: (x, y) =>
    `<path d="M${f(x - 2.2)} ${y}h4.4"/><path d="M${f(x - 1.4)} ${f(y + 1.1)}q1.4.7 2.8 0" class="detail soft"/>`,
  // Pupils with two soft bags underneath.
  tired: (x, y, look) =>
    `<circle cx="${f(x + look)}" cy="${y}" r="1" class="fill"/><path d="M${f(x - 2)} ${f(y + 1.8)}q2 1.2 4 0" class="detail soft"/><path d="M${f(x - 1.6)} ${f(y + 2.8)}q1.6.8 3.2 0" class="detail soft"/>`,
  // With one lash flicking outwards at the outer corner.
  lash: (x, y, look, i) =>
    `<path d="M${f(x - 2.2)} ${y}q2.2-2 4.4 0"/><circle cx="${f(x + look)}" cy="${f(y + 0.2)}" r=".9" class="fill"/><path d="M${f(i ? x + 2.2 : x - 2.2)} ${f(y - 0.2)}l${i ? 1 : -1}-.9" class="detail"/>`,
};

/** A closed eye: a downturned arc. */
const winking = (x: number, y: number): string => `<path d="M${f(x - 2)} ${f(y + 0.4)}q2-1.8 4 0"/>`;

export function eyes(config: FaceConfig, g: Geometry): string {
  // Each eye sits a hair higher or lower than the other.
  const d = stream(config.jitter, 'eyes');
  const yL = d.wob(g.E, 0.2);
  const yR = d.wob(g.E, 0.2);
  const draw = EYES[config.eyes];
  const right = config.wink ? winking(g.xR, yR) : draw(g.xR, yR, g.look, 1);
  return draw(g.xL, yL, g.look, 0) + right;
}

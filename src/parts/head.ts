import type { Geometry } from '../geometry.js';
import { f, type Pen } from '../svg.js';

/** The head outline: four curves through crown, cheeks and chin, filled so it hides the hair behind it. */
export function head(g: Geometry, pen: Pen): string {
  const { T, E, B, C, J, narrowTop } = g;
  const d =
    `M24 ${f(T)}C${f(24 + C * narrowTop)} ${f(T)} ${f(24 + C)} ${f(E - 7)} ${f(24 + C)} ${f(E)}` +
    `C${f(24 + C)} ${f(E + 7)} ${f(24 + J)} ${f(B - 1)} 24 ${f(B)}` +
    `C${f(24 - J)} ${f(B - 1)} ${f(24 - C)} ${f(E + 7)} ${f(24 - C)} ${f(E)}` +
    `C${f(24 - C)} ${f(E - 7)} ${f(24 - C * narrowTop)} ${f(T)} 24 ${f(T)}Z`;
  return `<path ${pen.bg} d="${d}"/>`;
}

/** One ear per side (-1 left, +1 right): the outer rim plus a small inner curl. */
function ear(g: Geometry, pen: Pen, side: 1 | -1): string {
  const x = 24 + side * (g.C - 0.6);
  const { earY, earOut } = g;
  return (
    `<path ${pen.bg} d="M${f(x)} ${f(earY - 3)}C${f(x + side * earOut)} ${f(earY - 4.4)} ${f(x + side * earOut)} ${f(earY + 3.6)} ${f(x)} ${f(earY + 2.6)}"/>` +
    `<path d="M${f(x + side * 1.2)} ${f(earY - 1.2)}q${f(side * 1.1)} 1 0 2.4" class="detail"/>`
  );
}

export const ears = (g: Geometry, pen: Pen): string => ear(g, pen, -1) + ear(g, pen, 1);

/**
 * The upper half of the head outline, pushed out by `grow` and ending `down`
 * units above the eye line on both sides - the base of every hairstyle and
 * of the beanie and cap. Slightly wider than the head and a bit higher on top.
 * Runs from the left side over the crown to the right side (no Z).
 */
export function dome(g: Geometry, grow: number, down: number): string {
  const { C, T, E, narrowTop } = g;
  return (
    `M${f(24 - C - grow)} ${f(E - down)}C${f(24 - C - grow)} ${f(E - 8)} ${f(24 - C * narrowTop - grow)} ${f(T - grow)} 24 ${f(T - grow)}` +
    `C${f(24 + C * narrowTop + grow)} ${f(T - grow)} ${f(24 + C + grow)} ${f(E - 8)} ${f(24 + C + grow)} ${f(E - down)}`
  );
}

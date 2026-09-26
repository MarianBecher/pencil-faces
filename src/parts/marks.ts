import type { Geometry } from '../geometry.js';
import { f } from '../svg.js';
import type { FaceMarks } from '../types.js';

/** Traces of life, all drawn soft so they read as shading rather than outlines. */
const MARKS: Record<keyof FaceMarks, (g: Geometry) => string> = {
  laughLines: ({ mw, nb }) =>
    `<path d="M${f(24 - mw - 2)} ${f(nb - 1)}q-1.2 2.4.2 4.4M${f(24 + mw + 2)} ${f(nb - 1)}q1.2 2.4-.2 4.4" class="detail soft"/>`,
  foreheadLines: ({ T }) => `<path d="M20 ${f(T + 3.6)}q4-1 8 0M21 ${f(T + 5.2)}q3-.8 6 0" class="detail soft"/>`,
  crowsFeet: ({ xL, xR, E }) =>
    `<path d="M${f(xL - 2.8)} ${f(E + 3)}l1.2-1M${f(xL - 1.8)} ${f(E + 3.6)}l1.2-1M${f(xR + 1.6)} ${f(E + 2)}l1.2 1M${f(xR + 0.6)} ${f(E + 2.6)}l1.2 1" class="detail soft"/>`,
  chinDimple: ({ B }) => `<path d="M23 ${f(B - 1.4)}q1 .7 2 0" class="detail soft"/>`,
  // Three dots under each eye, in a little zigzag.
  freckles: ({ xL, E, spread }) => {
    const dots = Array.from(
      { length: 6 },
      (_, i) =>
        `<circle cx="${f(xL - 1.6 + (i % 3) * 1.1 + (i > 2 ? spread * 2 : 0))}" cy="${f(E + 3 + (i % 2) * 0.8)}" r=".3"/>`,
    );
    return `<g class="fill detail">${dots.join('')}</g>`;
  },
};

const ORDER: readonly (keyof FaceMarks)[] = ['laughLines', 'foreheadLines', 'crowsFeet', 'chinDimple', 'freckles'];

export const marks = (set: FaceMarks, g: Geometry): string =>
  ORDER.filter((key) => set[key])
    .map((key) => MARKS[key](g))
    .join('');

import type { Geometry } from '../geometry.js';
import { f, type Pen } from '../svg.js';
import type { Extra } from '../types.js';

const EXTRAS: Record<Exclude<Extra, 'none'>, (g: Geometry, pen: Pen) => string> = {
  // Headphones: a thick band over the head and a cup on each ear.
  headphones: ({ C, T, earY }, pen) =>
    `<path d="M${f(24 - C - 1)} ${f(earY - 1)}C${f(24 - C - 1)} ${f(T - 6)} ${f(24 + C + 1)} ${f(T - 6)} ${f(24 + C + 1)} ${f(earY - 1)}" class="thick"/>` +
    `<rect ${pen.bg} x="${f(24 - C - 3)}" y="${f(earY - 3.2)}" width="4.2" height="7" rx="1.8"/>` +
    `<rect ${pen.bg} x="${f(24 + C - 1.2)}" y="${f(earY - 3.2)}" width="4.2" height="7" rx="1.8"/>`,
  // A small ring on the left earlobe.
  earring: ({ C, earY }) => `<circle cx="${f(24 - C - 1)}" cy="${f(earY + 3.8)}" r="1" class="detail"/>`,
  // A flower in the hair: five petals around a centre.
  flower: ({ C, T }, pen) => {
    const cx = 24 + C - 1;
    const cy = T + 3;
    const petals = [0, 72, 144, 216, 288].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return `<circle cx="${f(cx + Math.cos(a) * 1.7)}" cy="${f(cy + Math.sin(a) * 1.7)}" r="1" ${pen.bg}/>`;
    });
    return `<g class="detail">${petals.join('')}<circle cx="${f(cx)}" cy="${f(cy)}" r=".8" ${pen.bg}/></g>`;
  },
  // A pencil tucked behind the right ear.
  pencil: ({ C, earY }, pen) =>
    `<path ${pen.bg} d="M${f(24 + C - 0.6)} ${f(earY - 6)}l5.4 7.4-1.2.9-5.4-7.4z"/>` +
    `<path d="M${f(24 + C + 4.8)} ${f(earY + 1.4)}l.8 1.4-1.4-.4" class="detail"/>`,
};

export const extra = (kind: Extra, g: Geometry, pen: Pen): string => (kind === 'none' ? '' : EXTRAS[kind](g, pen));

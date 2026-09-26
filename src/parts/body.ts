import type { Geometry } from '../geometry.js';
import { f, type Pen } from '../svg.js';
import type { Clothes } from '../types.js';

/** Shoulders sloping out of the picture at the bottom edge. */
export function body(g: Geometry, pen: Pen): string {
  const { shoulder, collarY, neckW } = g;
  return `<path ${pen.bg} d="M${f(24 - shoulder)} 60C${f(24 - shoulder + 1)} ${f(collarY + 5)} ${f(24 - shoulder / 2)} ${f(collarY)} ${f(24 - neckW - 1)} ${f(collarY - 0.6)}H${f(24 + neckW + 1)}C${f(24 + shoulder / 2)} ${f(collarY)} ${f(24 + shoulder - 1)} ${f(collarY + 5)} ${f(24 + shoulder)} 60"/>`;
}

/** The neck is just two strokes - the neckline of the clothes closes it at the bottom. */
export function neck(g: Geometry, pen: Pen): string {
  const { neckW, neckTop, collarY } = g;
  return (
    `<rect ${pen.bg} stroke="none" x="${f(24 - neckW)}" y="${f(neckTop)}" width="${f(neckW * 2)}" height="${f(collarY + 0.4 - neckTop)}"/>` +
    `<path d="M${f(24 - neckW)} ${f(neckTop)}V${f(collarY - 0.4)}M${f(24 + neckW)} ${f(neckTop)}V${f(collarY - 0.4)}"/>`
  );
}

const CLOTHES: Record<Clothes, (g: Geometry, pen: Pen) => string> = {
  crewneck: ({ neckW, collarY }) =>
    `<path d="M${f(24 - neckW - 1.4)} ${f(collarY - 0.4)}Q24 ${f(collarY + 4)} ${f(24 + neckW + 1.4)} ${f(collarY - 0.4)}"/>`,
  vneck: ({ neckW, collarY }) =>
    `<path d="M${f(24 - neckW - 1.2)} ${f(collarY - 0.5)}L24 ${f(collarY + 6)}L${f(24 + neckW + 1.2)} ${f(collarY - 0.5)}"/>`,
  // Shirt collar with a tie: the tie first, the two collar tips on top of it.
  shirtTie: ({ neckW, collarY }, pen) =>
    `<path ${pen.bg} d="M23 ${f(collarY + 2.6)}h2l1 1.6-1.2 9h-1.6l-1.2-9z"/>` +
    `<path ${pen.bg} d="M${f(24 - neckW - 1)} ${f(collarY - 0.8)}L${f(24 - 1)} ${f(collarY + 3.4)}L${f(24 - neckW - 3.4)} ${f(collarY + 3)}ZM${f(24 + neckW + 1)} ${f(collarY - 0.8)}L${f(24 + 1)} ${f(collarY + 3.4)}L${f(24 + neckW + 3.4)} ${f(collarY + 3)}Z"/>`,
  // A turtleneck covers the lower neck, with one fold across it.
  turtleneck: ({ neckW, collarY, B }, pen) =>
    `<path ${pen.bg} d="M${f(24 - neckW - 0.6)} ${f(B - 0.6)}Q24 ${f(B + 1)} ${f(24 + neckW + 0.6)} ${f(B - 0.6)}V${f(collarY + 1.2)}Q24 ${f(collarY + 2.6)} ${f(24 - neckW - 0.6)} ${f(collarY + 1.2)}Z"/>` +
    `<path d="M${f(24 - neckW)} ${f(B + 1.6)}Q24 ${f(B + 3)} ${f(24 + neckW)} ${f(B + 1.6)}" class="detail"/>`,
  // Hoodie: a wide hood opening and two drawstrings of unequal length.
  hoodie: ({ neckW, collarY }) =>
    `<path d="M${f(24 - neckW - 4)} ${f(collarY + 1)}Q24 ${f(collarY + 7)} ${f(24 + neckW + 4)} ${f(collarY + 1)}"/>` +
    `<path d="M22 ${f(collarY + 3.6)}v6M26 ${f(collarY + 3.6)}v5" class="detail"/>`,
  // Striped shirt: a crew neck plus two soft stripes across the chest.
  stripes: ({ neckW, collarY, shoulder }) =>
    `<path d="M${f(24 - neckW - 1.4)} ${f(collarY - 0.4)}Q24 ${f(collarY + 3.6)} ${f(24 + neckW + 1.4)} ${f(collarY - 0.4)}"/>` +
    `<path d="M${f(24 - shoulder + 2)} 54.5H${f(24 + shoulder - 2)}M${f(24 - shoulder + 0.6)} 58H${f(24 + shoulder - 0.6)}" class="detail soft"/>`,
};

export const clothes = (kind: Clothes, g: Geometry, pen: Pen): string => CLOTHES[kind](g, pen);

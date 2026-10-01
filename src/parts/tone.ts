import type { HairTone } from '../types.js';

/** Distance between hatching strokes, in viewBox units. */
const SPACING: Record<Exclude<HairTone, 'light'>, number> = { mid: 1.5, dark: 0.85 };

/** Diagonal strokes ("/") across the whole canvas; a clip path keeps them inside the hair. */
function hatching(step: number): string {
  let d = '';
  for (let x = -60; x < 48; x += step) d += `M${Math.round(x * 100) / 100} 60l60-60`;
  return d;
}

/**
 * Shading for one layer of hair: hatching clipped to the layer's filled
 * shapes, which are the masses of hair (its strands and other lines are
 * not filled). Returns the clip path for `<defs>` and the strokes to paint
 * on top of the layer; nothing for light hair or a layer without shapes.
 */
export function shade(layer: string, tone: HairTone | undefined, id: string): { defs: string; strokes: string } {
  if (tone === undefined || tone === 'light') return { defs: '', strokes: '' };
  const shapes = layer.match(/<(?:path|circle|rect|ellipse)\b[^>]*\bfill="[^"]*"[^>]*\/>/g);
  if (!shapes) return { defs: '', strokes: '' };
  return {
    defs: `<clipPath id="${id}">${shapes.join('')}</clipPath>`,
    strokes: `<path d="${hatching(SPACING[tone])}" clip-path="url(#${id})" class="soft"/>`,
  };
}

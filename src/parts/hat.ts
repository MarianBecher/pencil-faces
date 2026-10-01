import type { Geometry } from '../geometry.js';
import { f, type Pen } from '../svg.js';
import type { FaceConfig, Hair, Hat } from '../types.js';
import { dome } from './head.js';

/** How far each hairstyle rises above the crown, so a kippah sits on the hair rather than in it. */
const HAIR_HEIGHT: Partial<Record<Hair, number>> = {
  bald: 0,
  buzz: 0.3,
  curly: 3.2,
  afro: 8,
  bun: 1.2,
  spiky: 2.6,
  mohawk: 0.6,
};

/** The fez's outline, shared by its drawing and the cut it makes in the hair. */
function fezShape({ C, T }: Geometry): { base: number; top: number; bw: number; tw: number; outline: string } {
  const base = T + 3.6;
  const top = T - 3.2;
  const bw = C - 1.4;
  const tw = C - 3.8;
  const outline = `M${f(24 - bw)} ${f(base)}L${f(24 - tw)} ${f(top)}Q24 ${f(top - 0.8)} ${f(24 + tw)} ${f(top)}L${f(24 + bw)} ${f(base)}Q24 ${f(base + 1.2)} ${f(24 - bw)} ${f(base)}Z`;
  return { base, top, bw, tw, outline };
}

/**
 * A hijab frames the face: a cloth over head, ears and neck, draped on the
 * shoulders, with an oval opening from the forehead to just below the chin.
 * The opening sits a little inside the cheeks, so the cloth covers the
 * sides of the head outline but leaves the jaw and chin in view.
 */
function hijab(g: Geometry, pen: Pen): string {
  const { C, J, T, E, B, collarY, narrowTop } = g;
  const w = C + 2.6;
  const top = T + 3.6;
  const ci = C - 0.6;
  const outer =
    `M${f(24 - w - 2.4)} ${f(collarY + 6)}C${f(24 - w - 1)} ${f(collarY + 1)} ${f(24 - w)} ${f(E + 6)} ${f(24 - w)} ${f(E)}` +
    `C${f(24 - w)} ${f(E - 8)} ${f(24 - C * narrowTop - 2.6)} ${f(T - 2.6)} 24 ${f(T - 2.6)}` +
    `C${f(24 + C * narrowTop + 2.6)} ${f(T - 2.6)} ${f(24 + w)} ${f(E - 8)} ${f(24 + w)} ${f(E)}` +
    `C${f(24 + w)} ${f(E + 6)} ${f(24 + w + 1)} ${f(collarY + 1)} ${f(24 + w + 2.4)} ${f(collarY + 6)}` +
    `Q24 ${f(collarY + 9)} ${f(24 - w - 2.4)} ${f(collarY + 6)}Z`;
  const opening =
    `M24 ${f(top)}C${f(24 + ci * 0.85)} ${f(top)} ${f(24 + ci)} ${f(E - 5)} ${f(24 + ci)} ${f(E + 1)}` +
    `C${f(24 + ci)} ${f(E + 6)} ${f(24 + J + 0.8)} ${f(B + 0.2)} 24 ${f(B + 0.8)}` +
    `C${f(24 - J - 0.8)} ${f(B + 0.2)} ${f(24 - ci)} ${f(E + 6)} ${f(24 - ci)} ${f(E + 1)}` +
    `C${f(24 - ci)} ${f(E - 5)} ${f(24 - ci * 0.85)} ${f(top)} 24 ${f(top)}Z`;
  return (
    `<path ${pen.bg} fill-rule="evenodd" d="${outer}${opening}"/>` +
    // A fold from under the chin to the shoulder, and one along the brow.
    `<path d="M${f(24 + J)} ${f(B + 1.6)}Q${f(24 + C + 1)} ${f(B + 3)} ${f(24 + w + 0.6)} ${f(collarY + 4)}M${f(24 - ci + 2.4)} ${f(top + 1.2)}Q24 ${f(top - 1.2)} ${f(24 + ci - 2.4)} ${f(top + 1.2)}" class="detail soft"/>`
  );
}

const HATS: Record<Exclude<Hat, 'none'>, (g: Geometry, pen: Pen, config: FaceConfig) => string> = {
  // Bobble hat: pompom, crown, and a ribbed turn-up.
  beanie: (g, pen) => {
    const { C, T, E } = g;
    const rib = E - 8.6;
    return (
      `<circle ${pen.bg} cx="24" cy="${f(T - 5)}" r="2.4"/>` +
      `<path ${pen.bg} d="${dome(g, 1.2, 5)}Z"/>` +
      `<path ${pen.bg} d="M${f(24 - C - 1.6)} ${f(rib)}H${f(24 + C + 1.6)}V${f(E - 5)}H${f(24 - C - 1.6)}Z"/>` +
      `<path d="M${f(24 - C + 1)} ${f(rib)}v3.6M${f(24 - C + 3)} ${f(rib)}v3.6M${f(24 + C - 1)} ${f(rib)}v3.6M${f(24 + C - 3)} ${f(rib)}v3.6M22 ${f(rib)}v3.6M26 ${f(rib)}v3.6" class="detail soft"/>`
    );
  },
  // Cap with the peak turned to the side.
  cap: (g, pen) => {
    const { C, T, E } = g;
    return (
      `<path ${pen.bg} d="${dome(g, 1, 6)}Z"/>` +
      `<path ${pen.bg} d="M24 ${f(E - 6)}H${f(24 + C + 6)}q-1 2.2-4 2.4H24z"/>` +
      `<path d="M24 ${f(T - 1)}v2" class="detail"/>`
    );
  },
  // Brimmed hat: the brim first, the crown on top, a band across it.
  brimmed: ({ C, T, E }, pen) =>
    `<path ${pen.bg} d="M${f(24 - C - 5)} ${f(E - 6)}Q24 ${f(E - 8.6)} ${f(24 + C + 5)} ${f(E - 6)}Q24 ${f(E - 4)} ${f(24 - C - 5)} ${f(E - 6)}Z"/>` +
    `<path ${pen.bg} d="M${f(24 - C + 1)} ${f(E - 7)}C${f(24 - C + 1)} ${f(T - 5)} ${f(24 + C - 1)} ${f(T - 5)} ${f(24 + C - 1)} ${f(E - 7)}Z"/>` +
    `<path d="M${f(24 - C + 1.2)} ${f(E - 9.4)}Q24 ${f(E - 11)} ${f(24 + C - 1.2)} ${f(E - 9.4)}" class="thick"/>`,
  // A curved band across the forehead, above the brows.
  headband: ({ C, by }, pen) =>
    `<path ${pen.bg} d="M${f(24 - C - 0.4)} ${f(by - 3.4)}Q24 ${f(by - 6)} ${f(24 + C + 0.4)} ${f(by - 3.4)}V${f(by - 1.4)}Q24 ${f(by - 4)} ${f(24 - C - 0.4)} ${f(by - 1.4)}Z"/>`,
  hijab,
  // Turban: wrapped up to a soft peak and flaring out above the temples. Its
  // edge comes down low over the temples and the tops of the ears and rises
  // to a point over the middle of the forehead; the layers above follow it.
  turban: ({ C, T, E, by }, pen) => {
    const side = E - 3;
    const arch = by - 3.6;
    const base = C + 1.2;
    const bulge = C + 3.4;
    const peak = T - 5.4;
    let layers = '';
    for (let k = 0; k < 4; k++) {
      // Each layer follows the edge: low at the sides, high in the middle,
      // where the left half runs a little past the right one.
      const low = side - 2 - k * 2.2;
      const high = arch - 2 - k * 2.2;
      const reach = base - 0.2 - k * 1.1;
      layers +=
        `M${f(24 - reach)} ${f(low)}Q${f(24 - reach * 0.5)} ${f((low + high) / 2 - 0.4)} ${f(24 + 1)} ${f(high - 0.3)}` +
        `M${f(24 + reach)} ${f(low)}Q${f(24 + reach * 0.5)} ${f((low + high) / 2 - 0.4)} 24 ${f(high + 0.2)}`;
    }
    return (
      `<path ${pen.bg} d="M${f(24 - base)} ${f(side)}C${f(24 - bulge)} ${f(side - 5)} ${f(24 - bulge)} ${f(peak + 2)} 24 ${f(peak)}` +
      `C${f(24 + bulge)} ${f(peak + 2)} ${f(24 + bulge)} ${f(side - 5)} ${f(24 + base)} ${f(side)}` +
      `Q${f(24 + base * 0.5)} ${f((side + arch) / 2 - 0.4)} 24 ${f(arch)}Q${f(24 - base * 0.5)} ${f((side + arch) / 2 - 0.4)} ${f(24 - base)} ${f(side)}Z"/>` +
      `<path d="${layers}" class="soft"/>`
    );
  },
  // Kippah: a small cap on the crown, rising above the hair, with a patterned rim.
  kippah: ({ T }, pen, config) => {
    const top = T - (HAIR_HEIGHT[config.hair] ?? 1);
    let rim = '';
    for (let x = 20.4; x < 27.6; x += 1.2) rim += `M${f(x)} ${f(top + 0.4)}l.6-.7.6.7`;
    return (
      `<path ${pen.bg} d="M19 ${f(top + 1.2)}Q24 ${f(top - 7)} 29 ${f(top + 1.2)}Q24 ${f(top + 2.2)} 19 ${f(top + 1.2)}Z"/>` +
      `<path d="${rim}" class="detail soft"/>`
    );
  },
  // Fez: a truncated cone with a flat top, pressed onto the hair, its tassel hanging to the side.
  fez: (g, pen) => {
    const { base, top, bw, tw, outline } = fezShape(g);
    // Where the tassel's cord ends, just outside the fez.
    const tx = 24 + bw + 1;
    const ty = base - 3.4;
    return (
      `<path ${pen.bg} d="${outline}"/>` +
      `<path d="M${f(24 - tw)} ${f(top)}Q24 ${f(top + 0.8)} ${f(24 + tw)} ${f(top)}" class="soft"/>` +
      `<path d="M24 ${f(top + 0.2)}Q${f(24 + tw + 2.4)} ${f(top - 0.6)} ${f(tx)} ${f(ty)}"/>` +
      `<path d="M${f(tx)} ${f(ty)}l-.8 3.4M${f(tx)} ${f(ty)}v3.6M${f(tx)} ${f(ty)}l.8 3.4" class="thick"/>`
    );
  },
};

/**
 * Where the hair may show under a hat that sits down on the head: inside
 * the hat's own outline (where the hat covers it anyway) and below `edge`,
 * a line running from x = 0 to x = 48 along the bottom of the hat. Hair that would stick out over the top - an afro, a bun, spikes -
 * is cut away; hair coming out underneath stays. Null for hats that sit on
 * the hair (headband, kippah) or hide it entirely (hijab, turban).
 */
export function hairClip(kind: Hat, g: Geometry): { edge: string; outline: string } | null {
  const { C, T, E } = g;
  const level = (y: number): string => `M0 ${f(y)}H48`;
  switch (kind) {
    case 'beanie':
      return { edge: level(E - 5), outline: `${dome(g, 1.2, 5)}Z` };
    case 'cap':
      return { edge: level(E - 6), outline: `${dome(g, 1, 6)}Z` };
    case 'brimmed':
      return {
        edge: level(E - 6),
        outline: `M${f(24 - C + 1)} ${f(E - 7)}C${f(24 - C + 1)} ${f(T - 5)} ${f(24 + C - 1)} ${f(T - 5)} ${f(24 + C - 1)} ${f(E - 7)}Z`,
      };
    case 'fez': {
      // The fez is narrower than the head: beside it the hair falls away
      // from its lower corners instead of being cut level.
      const { base, bw, outline } = fezShape(g);
      const edge =
        `M0 ${f(E + 2)}Q${f(24 - bw - 2.4)} ${f(base + 0.4)} ${f(24 - bw)} ${f(base)}` +
        `H${f(24 + bw)}Q${f(24 + bw + 2.4)} ${f(base + 0.4)} 48 ${f(E + 2)}`;
      return { edge, outline };
    }
    default:
      return null;
  }
}

export const hat = (config: FaceConfig, g: Geometry, pen: Pen): string =>
  config.hat === 'none' ? '' : HATS[config.hat](g, pen, config);

/** Head coverings that hide all the hair (a turban) or also the ears (a hijab). */
export const coversHair = (kind: Hat): boolean => kind === 'hijab' || kind === 'turban';
export const coversEars = (kind: Hat): boolean => kind === 'hijab';

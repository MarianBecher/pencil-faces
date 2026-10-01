import { geometry } from './geometry.js';
import { body, clothes, neck } from './parts/body.js';
import { beard } from './parts/beard.js';
import { brows } from './parts/brows.js';
import { extra } from './parts/extra.js';
import { eyes } from './parts/eyes.js';
import { glasses } from './parts/glasses.js';
import { hair } from './parts/hair.js';
import { coversEars, coversHair, hairClip, hat } from './parts/hat.js';
import { ears, head } from './parts/head.js';
import { marks } from './parts/marks.js';
import { mouth } from './parts/mouth.js';
import { nose } from './parts/nose.js';
import { shade } from './parts/tone.js';
import { fnv1a } from './random.js';
import { escapeAttr, pen as makePen, withClassDefaults } from './svg.js';
import type { FaceConfig, RenderOptions } from './types.js';

export const DEFAULT_FILTER_ID = 'pencil-face';

/**
 * Pure: the same config always yields the same SVG string. Draws with
 * `stroke` (default 'currentColor') on `background` (default 'var(--c)') so
 * it works on any coloured box; `filterId` defaults to 'pencil-face', null
 * disables the filter.
 *
 * The drawing lives on a 48 x 58 canvas; the viewBox moves in on head and
 * shoulders - like a passport photo, where the face fills the frame. Parts
 * are painted back to front, each covering what lies behind it.
 */
export function renderFace(config: FaceConfig, options: RenderOptions = {}): string {
  const { filterId = DEFAULT_FILTER_ID, className = 'face', background = 'var(--c)', stroke = 'currentColor' } = options;
  const pen = makePen(background);
  const g = geometry(config);

  // Under a hijab or turban there is no hair to draw, and the ears (with
  // anything worn on them) disappear under a hijab.
  let { back, front } = coversHair(config.hat) ? { back: '', front: '' } : hair(config, g, pen);
  // Ids for the clip paths below come from the config: the same face twice
  // in a page shares identical clips, different faces never share an id.
  const key = fnv1a(JSON.stringify(config)).toString(36);
  const defs: string[] = [];

  // Mid and dark hair is shaded with hatching inside the hair's shapes.
  const backTone = shade(back, config.hairTone, `pencil-face-tone-${key}-back`);
  const frontTone = shade(front, config.hairTone, `pencil-face-tone-${key}-front`);
  defs.push(backTone.defs, frontTone.defs);
  back += backTone.strokes;
  front += frontTone.strokes;

  // Under a beanie, cap, brimmed hat or fez the hair is cut to the hat, so
  // none sticks out over the top. Where hair is wider than the hat, a line
  // along the cut (drawn only inside the hair's own shapes) closes it off.
  const clip = back || front ? hairClip(config.hat, g) : null;
  let cut = '';
  if (clip) {
    const id = `pencil-face-hair-${key}`;
    // A clipPath may only hold shapes, so the hair's groups are flattened and its hatching left out.
    const shapes = (back + front).replace(/<\/?g[^>]*>/g, '').replace(/<path [^>]*clip-path="[^"]*"[^>]*\/>/g, '');
    defs.push(
      `<clipPath id="${id}"><path d="${clip.edge}L48 60H0Z"/><path d="${clip.outline}"/></clipPath>`,
      `<clipPath id="${id}-shape">${shapes}</clipPath>`,
    );
    const wrap = (layer: string): string => (layer ? `<g clip-path="url(#${id})">${layer}</g>` : '');
    back = wrap(back);
    front = wrap(front);
    cut = `<path d="${clip.edge}" clip-path="url(#${id}-shape)"/>`;
  }
  const defsMarkup = defs.join('') ? `<defs>${defs.join('')}</defs>` : '';

  const earsHidden = coversEars(config.hat);
  const worn = earsHidden && (config.extra === 'earring' || config.extra === 'pencil') ? 'none' : config.extra;

  const parts = [
    back,
    body(g, pen),
    neck(g, pen),
    clothes(config.clothes, g, pen),
    earsHidden ? '' : ears(g, pen),
    head(g, pen),
    marks(config.marks, g),
    beard(config, g, pen),
    eyes(config, g),
    brows(config, g),
    nose(config.nose, g),
    mouth(config, g, pen),
    front,
    cut,
    hat(config, g, pen),
    glasses(config.glasses, g, pen),
    extra(worn, g, pen),
  ];

  const filter = filterId === null ? '' : ` filter="url(#${escapeAttr(filterId)})"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="${escapeAttr(className)}" viewBox="5 3.5 38 46" aria-hidden="true" fill="none" stroke="${escapeAttr(stroke)}" stroke-linecap="round" stroke-linejoin="round">` +
    `${defsMarkup}<g${filter}>${withClassDefaults(parts.join(''), stroke)}</g></svg>`
  );
}

import { geometry } from './geometry.js';
import { body, clothes, neck } from './parts/body.js';
import { ears, head } from './parts/head.js';
import { escapeAttr, pen as makePen } from './svg.js';
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

  const parts = [body(g, pen), neck(g, pen), clothes(config.clothes, g, pen), ears(g, pen), head(g, pen)];

  const filter = filterId === null ? '' : ` filter="url(#${escapeAttr(filterId)})"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="${escapeAttr(className)}" viewBox="5 3.5 38 46" aria-hidden="true" fill="none" stroke="${escapeAttr(stroke)}" stroke-linecap="round" stroke-linejoin="round">` +
    `<g${filter}>${parts.join('')}</g></svg>`
  );
}

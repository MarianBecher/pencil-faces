/** Round to one decimal: plenty for a 38 x 46 viewBox and keeps the markup short. */
export const f = (n: number): number => Math.round(n * 10) / 10;

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

/** Escape a value for use inside a double-quoted XML attribute. */
export const escapeAttr = (value: string): string => value.replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);

/**
 * How a part is painted. Lines are drawn with the stroke of the root <svg>;
 * shapes that have to hide something behind them (the head in front of the
 * hair, a hat in front of the forehead) are filled with the background colour,
 * so the result stays a pure line drawing on any coloured box.
 */
export interface Pen {
  /** The ready-made `fill="..."` attribute for such covering shapes. */
  readonly bg: string;
}

export const pen = (background: string): Pen => ({ bg: `fill="${escapeAttr(background)}"` });

/**
 * The parts mark their lines with four classes that a stylesheet can target:
 * `fill` (solid dots such as pupils and freckles), `detail` (small extras a
 * tiny rendering may hide), `soft` (shading: thinner and lighter) and
 * `thick` (bold strokes such as bushy brows). So that a face also looks right
 * without any stylesheet, this adds matching presentation attributes after
 * each class attribute. Presentation attributes lose against every CSS rule,
 * so a stylesheet written for the classes keeps full control.
 */
export function withClassDefaults(markup: string, stroke: string): string {
  const ink = escapeAttr(stroke);
  return markup.replace(/class="([^"]*)"/g, (attr, classes: string) => {
    const set = new Set(classes.split(' '));
    let extra = '';
    if (set.has('fill')) extra += ` fill="${ink}" stroke="none"`;
    if (set.has('soft')) extra += ' stroke-width=".55" opacity=".75"';
    if (set.has('thick')) extra += ' stroke-width="1.3"';
    return attr + extra;
  });
}

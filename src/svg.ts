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

import { stream } from './random.js';
import type { FaceConfig, HeadShape } from './types.js';

/**
 * Head proportions per shape. T: crown, C: half the cheek width, J: half the
 * jaw width, B: chin. Everything else - the hairstyles and the collar
 * included - is derived from these and the eye line E.
 */
const SHAPES: Record<HeadShape, { C: number; J: number; T: number; B: number }> = {
  oval: { C: 11, J: 7.5, T: 11, B: 38 },
  square: { C: 12, J: 10, T: 11.5, B: 37.5 },
  // long, with a pointed chin
  long: { C: 10, J: 5.5, T: 10, B: 39.5 },
  round: { C: 12.5, J: 9, T: 12.5, B: 37 },
  // narrow at the top, wide jaw
  pear: { C: 10.5, J: 9.5, T: 9.5, B: 38.5 },
  heart: { C: 11.5, J: 6.5, T: 10.5, B: 38 },
};

/** All the landmarks the parts are drawn around, in viewBox units (the head is centred on x = 24). */
export interface Geometry {
  /** Crown, eye line and chin (y). */
  readonly T: number;
  readonly E: number;
  readonly B: number;
  /** Half the cheek width and half the jaw width. */
  readonly C: number;
  readonly J: number;
  /** How much the head narrows towards the crown (a wide jaw makes it pear-shaped). */
  readonly narrowTop: number;
  readonly neckW: number;
  readonly shoulder: number;
  readonly neckTop: number;
  readonly collarY: number;
  /** How far the ears stick out, and their height. */
  readonly earOut: number;
  readonly earY: number;
  /** Half the distance between the eyes, and the eye centres. */
  readonly spread: number;
  readonly xL: number;
  readonly xR: number;
  /** Where the pupils look, sideways. */
  readonly look: number;
  /** Brow line. */
  readonly by: number;
  /** Nose top, length and bottom; `side` is +1 when it points right. */
  readonly nTop: number;
  readonly nLen: number;
  readonly nb: number;
  readonly side: 1 | -1;
  /** Mouth line and half the mouth width. */
  readonly my: number;
  readonly mw: number;
}

/**
 * The proportions of a face. They come from their own stream of the jitter,
 * drawn in a fixed order, so they only depend on `jitter`, `shape`, `ears`
 * and `noseSide` - never on, say, the hairstyle.
 */
export function geometry(config: FaceConfig): Geometry {
  const d = stream(config.jitter, 'proportions');
  const base = SHAPES[config.shape];
  const C = base.C + d.between(-0.6, 0.6);
  const J = base.J + d.between(-0.6, 0.6);
  const T = base.T + d.between(-0.6, 0.6);
  const B = base.B + d.between(-0.6, 0.6);
  const E = d.between(23.4, 25.6);
  // A wide jaw makes the head narrower towards the top (pear).
  const narrowTop = base.J > base.C - 1 ? 0.8 : 0.95;

  const neckW = d.between(3.2, 4.6);
  const shoulder = d.between(18, 22);
  const earY = E + d.between(-0.5, 0.8);
  const spread = d.between(4, 5.4);
  const look = d.between(-0.5, 0.5);
  const by = E - d.between(3, 4.2);
  const nTop = E + 1;
  const nLen = d.between(4, 6.6);
  const nb = nTop + nLen;
  const my = Math.min(B - 3.4, nb + d.between(2.6, 3.8));
  const mw = d.between(2.4, 4.4);

  return {
    T,
    E,
    B,
    C,
    J,
    narrowTop,
    neckW,
    shoulder,
    neckTop: B - 3,
    collarY: B + 3.6,
    earOut: config.ears === 'big' ? 4.4 : 3,
    earY,
    spread,
    xL: 24 - spread,
    xR: 24 + spread,
    look,
    by,
    nTop,
    nLen,
    nb,
    side: config.noseSide === 'right' ? 1 : -1,
    my,
    mw,
  };
}

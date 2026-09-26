import { FACE_OPTIONS } from './options.js';
import { dice, mulberry32 } from './random.js';
import type { FaceConfig, FaceMarks, FaceOverrides } from './types.js';

const NO_MARKS: FaceMarks = {
  laughLines: false,
  foreheadLines: false,
  crowsFeet: false,
  chinDimple: false,
  freckles: false,
};

/** A plain, friendly face: a good starting point for editors. */
export function defaultFace(): FaceConfig {
  return {
    shape: 'oval',
    clothes: 'crewneck',
    ears: 'small',
    eyes: 'open',
    wink: false,
    brows: 'straight',
    nose: 'plain',
    noseSide: 'right',
    mouth: 'smile',
    marks: { ...NO_MARKS },
    beard: 'none',
    hair: 'short',
    longHairBehindBangs: false,
    hat: 'none',
    glasses: 'none',
    extra: 'none',
    jitter: 0,
  };
}

/** Everything in a list except the leading `'none'`. */
const some = <T>(list: readonly T[]): readonly T[] => list.slice(1);

/**
 * Deterministic: the same 32-bit seed always yields the same config.
 * `overrides` replace fields after the roll (partial marks are merged).
 *
 * The probabilities are those of the original game: most faces are clean
 * shaven (a beard in 26 %), bareheaded (a hat in 12 %), without glasses
 * (24 %) and without accessories (20 %); one in twelve winks.
 */
export function faceFromSeed(seed: number, overrides: FaceOverrides = {}): FaceConfig {
  const d = dice(mulberry32(seed));
  const shape = d.pick(FACE_OPTIONS.shape);
  const clothes = d.pick(FACE_OPTIONS.clothes);
  const ears = d.chance(0.2) ? 'big' : 'small';
  const eyes = d.pick(FACE_OPTIONS.eyes);
  const wink = d.chance(0.08);
  const brows = d.pick(FACE_OPTIONS.brows);
  const noseSide = d.chance(0.5) ? 'right' : 'left';
  const nose = d.pick(FACE_OPTIONS.nose);
  const mouth = d.pick(FACE_OPTIONS.mouth);
  const marks: FaceMarks = {
    laughLines: d.chance(0.18),
    foreheadLines: d.chance(0.14),
    crowsFeet: d.chance(0.14),
    chinDimple: d.chance(0.12),
    freckles: d.chance(0.1),
  };
  const beard = d.chance(0.26) ? d.pick(some(FACE_OPTIONS.beard)) : 'none';
  const hair = d.pick(FACE_OPTIONS.hair);
  // Always rolled, so the rest of the sequence does not depend on the hair.
  const longBehind = d.chance(0.5);
  const hat = d.chance(0.12) ? d.pick(some(FACE_OPTIONS.hat)) : 'none';
  const glasses = d.chance(0.24) ? d.pick(some(FACE_OPTIONS.glasses)) : 'none';
  const extra = d.chance(0.2) ? d.pick(some(FACE_OPTIONS.extra)) : 'none';
  const jitter = d.uint32();

  const rolled: FaceConfig = {
    shape,
    clothes,
    ears,
    eyes,
    wink,
    brows,
    nose,
    noseSide,
    mouth,
    marks,
    beard,
    hair,
    longHairBehindBangs: hair === 'bangs' && longBehind,
    hat,
    glasses,
    extra,
    jitter,
  };
  return applyOverrides(rolled, overrides);
}

/** Copies the defined fields of `patch` over `base`; `{ hair: undefined }` means "not overridden". */
function assignDefined<T extends object>(base: T, patch: Partial<T>): T {
  const defined = Object.entries(patch).filter(([, value]) => value !== undefined);
  return { ...base, ...(Object.fromEntries(defined) as Partial<T>) };
}

function applyOverrides(base: FaceConfig, overrides: FaceOverrides): FaceConfig {
  const { marks, ...fields } = overrides;
  return {
    ...assignDefined<Omit<FaceConfig, 'marks'>>(base, fields),
    marks: assignDefined(base.marks, marks ?? {}),
  };
}

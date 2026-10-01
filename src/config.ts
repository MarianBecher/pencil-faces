import { FACE_OPTIONS } from './options.js';
import { dice, fnv1a, mulberry32 } from './random.js';
import type { FaceConfig, FaceMarks, FaceOverrides, Hair, HairTone, Hat } from './types.js';

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
    hairTone: 'light',
    hat: 'none',
    glasses: 'none',
    extra: 'none',
    jitter: 0,
  };
}

/** Everything in a list except the leading `'none'`. */
const some = <T>(list: readonly T[]): readonly T[] => list.slice(1);

/**
 * The values of 0.1, which the main roll picks from. Values added later are
 * rolled at the end of the sequence instead: appending them here would shift
 * every pick and give every existing seed a different face.
 */
const HAIR_0_1: readonly Hair[] = FACE_OPTIONS.hair.slice(0, 12);
const HATS_0_1: readonly Hat[] = FACE_OPTIONS.hat.slice(1, 5);
const HAIR_0_2: readonly Hair[] = ['locs', 'cornrows', 'ponytail', 'buzz', 'receding'];
const HATS_0_2: readonly Hat[] = ['hijab', 'turban', 'kippah', 'fez'];

/**
 * Deterministic: the same seed always yields the same config. The seed is
 * a 32-bit number or any string, such as a user name, which is hashed to one.
 * `overrides` replace fields after the roll (partial marks are merged).
 *
 * The probabilities are those of the original game: most faces are clean
 * shaven (a beard in 26 %), bareheaded (a hat in 12 %), without glasses
 * (24 %) and without accessories (20 %); one in twelve winks.
 *
 * The hairstyles and head coverings of 0.2 are rolled last, so a seed keeps
 * its 0.1 face unless one of those rolls hits: then its hair or its hat
 * changes (and a hijab also takes off the beard). Each hairstyle is about
 * equally likely; one face in twenty gets one of the new head coverings.
 * The hair tone of 0.2 comes last: light 40 %, mid 30 %, dark 30 %.
 */
export function faceFromSeed(seed: number | string, overrides: FaceOverrides = {}): FaceConfig {
  const d = dice(mulberry32(typeof seed === 'string' ? fnv1a(seed) : seed));
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
  let beard = d.chance(0.26) ? d.pick(some(FACE_OPTIONS.beard)) : 'none';
  let hair = d.pick(HAIR_0_1);
  // Always rolled, so the rest of the sequence does not depend on the hair.
  const longBehind = d.chance(0.5);
  let hat = d.chance(0.12) ? d.pick(HATS_0_1) : 'none';
  const glasses = d.chance(0.24) ? d.pick(some(FACE_OPTIONS.glasses)) : 'none';
  const extra = d.chance(0.2) ? d.pick(some(FACE_OPTIONS.extra)) : 'none';
  const jitter = d.uint32();

  // Added in 0.2. Both picks are always drawn, so later additions can append theirs.
  const newHair = d.chance(HAIR_0_2.length / FACE_OPTIONS.hair.length);
  const pickedHair = d.pick(HAIR_0_2);
  const newHat = d.chance(0.05);
  const pickedHat = d.pick(HATS_0_2);
  if (newHair) hair = pickedHair;
  if (newHat) hat = pickedHat;
  if (hat === 'hijab') beard = 'none';
  const toneRoll = d.between(0, 1);
  const hairTone: HairTone = toneRoll < 0.4 ? 'light' : toneRoll < 0.7 ? 'mid' : 'dark';

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
    hairTone,
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

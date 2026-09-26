import { describe, expect, it } from 'vitest';
import {
  FACE_OPTIONS,
  defaultFace,
  faceFromSeed,
  type Beard,
  type Brows,
  type Clothes,
  type Ears,
  type Extra,
  type Eyes,
  type FaceConfig,
  type Glasses,
  type Hair,
  type Hat,
  type HeadShape,
  type Mouth,
  type Nose,
} from '../src/index.js';

/**
 * One object per union type; `satisfies Record<Union, true>` makes the
 * compiler reject a missing or unknown key, so these are exhaustive.
 */
const UNIONS = {
  shape: { oval: true, square: true, long: true, round: true, pear: true, heart: true } satisfies Record<HeadShape, true>,
  clothes: { crewneck: true, vneck: true, shirtTie: true, turtleneck: true, hoodie: true, stripes: true } satisfies Record<
    Clothes,
    true
  >,
  ears: { small: true, big: true } satisfies Record<Ears, true>,
  eyes: { dot: true, open: true, lidded: true, happy: true, wide: true, squint: true, tired: true, lash: true } satisfies Record<
    Eyes,
    true
  >,
  brows: {
    straight: true,
    arch: true,
    angry: true,
    worried: true,
    bushy: true,
    unibrow: true,
    thin: true,
    raised: true,
  } satisfies Record<Brows, true>,
  nose: { plain: true, hook: true, bulb: true, snub: true, wide: true, pointed: true } satisfies Record<Nose, true>,
  noseSide: { left: true, right: true } satisfies Record<FaceConfig['noseSide'], true>,
  mouth: {
    line: true,
    smile: true,
    grin: true,
    surprised: true,
    crooked: true,
    pout: true,
    frown: true,
    dimples: true,
  } satisfies Record<Mouth, true>,
  beard: { none: true, moustache: true, handlebar: true, full: true, goatee: true, stubble: true } satisfies Record<Beard, true>,
  hair: {
    bald: true,
    short: true,
    sidePart: true,
    curly: true,
    afro: true,
    bun: true,
    long: true,
    bangs: true,
    mohawk: true,
    spiky: true,
    braid: true,
    slickedBack: true,
  } satisfies Record<Hair, true>,
  hat: { none: true, beanie: true, cap: true, brimmed: true, headband: true } satisfies Record<Hat, true>,
  glasses: { none: true, round: true, square: true, sunglasses: true, monocle: true } satisfies Record<Glasses, true>,
  extra: { none: true, headphones: true, earring: true, flower: true, pencil: true } satisfies Record<Extra, true>,
};

describe('FACE_OPTIONS', () => {
  it('lists every value of every union type exactly once', () => {
    expect(Object.keys(FACE_OPTIONS).sort()).toEqual(Object.keys(UNIONS).sort());
    for (const [field, union] of Object.entries(UNIONS)) {
      const listed = FACE_OPTIONS[field as keyof typeof FACE_OPTIONS];
      expect(new Set(listed).size, field).toBe(listed.length);
      expect([...listed].sort(), field).toEqual(Object.keys(union).sort());
    }
  });

  it('puts "none" first where there is one', () => {
    for (const list of [FACE_OPTIONS.beard, FACE_OPTIONS.hat, FACE_OPTIONS.glasses, FACE_OPTIONS.extra]) {
      expect(list[0]).toBe('none');
    }
  });

  it('is frozen', () => {
    expect(Object.isFrozen(FACE_OPTIONS)).toBe(true);
    expect(Object.isFrozen(FACE_OPTIONS.hair)).toBe(true);
  });
});

describe('defaultFace', () => {
  it('returns a fresh, valid config each time', () => {
    const a = defaultFace();
    a.marks.freckles = true;
    expect(defaultFace().marks.freckles).toBe(false);
    expectValid(defaultFace());
  });
});

describe('faceFromSeed', () => {
  it('is deterministic', () => {
    for (const seed of [0, 1, 42, 0xdeadbeef, 2 ** 32 - 1]) {
      expect(faceFromSeed(seed)).toEqual(faceFromSeed(seed));
    }
  });

  it('gives different seeds different faces', () => {
    const faces = new Set(Array.from({ length: 200 }, (_, seed) => JSON.stringify(faceFromSeed(seed))));
    expect(faces.size).toBe(200);
  });

  it('only produces valid values and a 32-bit jitter', () => {
    for (let seed = 0; seed < 500; seed++) expectValid(faceFromSeed(seed * 7919));
  });

  it('keeps longHairBehindBangs off unless the hair is bangs', () => {
    for (let seed = 0; seed < 500; seed++) {
      const face = faceFromSeed(seed);
      if (face.hair !== 'bangs') expect(face.longHairBehindBangs).toBe(false);
    }
  });

  it('applies overrides after the roll', () => {
    const rolled = faceFromSeed(7);
    const face = faceFromSeed(7, { hair: 'mohawk', hat: 'cap', jitter: 123 });
    expect(face).toEqual({ ...rolled, hair: 'mohawk', hat: 'cap', jitter: 123 });
  });

  it('merges partial marks and ignores undefined overrides', () => {
    const rolled = faceFromSeed(99);
    const face = faceFromSeed(99, { marks: { freckles: true }, eyes: undefined } as never);
    expect(face.marks).toEqual({ ...rolled.marks, freckles: true });
    expect(face.eyes).toBe(rolled.eyes);
  });

  it('keeps the probabilities of the original drawing', () => {
    const n = 20000;
    const count = (test: (face: FaceConfig) => boolean): number => {
      let hits = 0;
      for (let seed = 0; seed < n; seed++) if (test(faceFromSeed(seed))) hits++;
      return hits / n;
    };
    expect(count((f) => f.beard !== 'none')).toBeCloseTo(0.26, 1);
    expect(count((f) => f.hat !== 'none')).toBeCloseTo(0.12, 1);
    expect(count((f) => f.glasses !== 'none')).toBeCloseTo(0.24, 1);
    expect(count((f) => f.extra !== 'none')).toBeCloseTo(0.2, 1);
    expect(count((f) => f.wink)).toBeCloseTo(0.08, 1);
    expect(count((f) => f.ears === 'big')).toBeCloseTo(0.2, 1);
    expect(count((f) => f.marks.laughLines)).toBeCloseTo(0.18, 1);
    expect(count((f) => f.marks.freckles)).toBeCloseTo(0.1, 1);
  });
});

function expectValid(face: FaceConfig): void {
  for (const field of Object.keys(FACE_OPTIONS) as (keyof typeof FACE_OPTIONS)[]) {
    expect(FACE_OPTIONS[field] as readonly string[], field).toContain(face[field]);
  }
  expect(Number.isInteger(face.jitter)).toBe(true);
  expect(face.jitter).toBeGreaterThanOrEqual(0);
  expect(face.jitter).toBeLessThan(2 ** 32);
  expect(Object.keys(face.marks).sort()).toEqual(['chinDimple', 'crowsFeet', 'foreheadLines', 'freckles', 'laughLines']);
}

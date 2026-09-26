/** A source of uniform numbers in [0, 1). */
export type Rng = () => number;

/** mulberry32: tiny, fast and random enough for faces. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** FNV-1a over a string, continued from `start`. */
function fnv1a(text: string, start = 0x811c9dc5): number {
  let h = start;
  for (const ch of text) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Convenience draws on top of an `Rng`, mirroring the helpers of the original drawing code. */
export interface Dice {
  /** Uniform in [a, b). */
  between(a: number, b: number): number;
  /** True with probability `p`. */
  chance(p: number): boolean;
  /** One element of a non-empty list. */
  pick<T>(list: readonly T[]): T;
  /** `v` nudged by up to +-`amount` and rounded to one decimal: nothing hand-drawn sits exactly symmetric. */
  wob(v: number, amount?: number): number;
  /** A fresh unsigned 32-bit integer. */
  uint32(): number;
}

export function dice(rng: Rng): Dice {
  return {
    between: (a, b) => a + rng() * (b - a),
    chance: (p) => rng() < p,
    pick: <T>(list: readonly T[]): T => {
      const item = list[Math.floor(rng() * list.length)];
      if (item === undefined) throw new RangeError('pick() needs a non-empty list');
      return item;
    },
    wob: (v, amount = 0.35) => Math.round((v + (rng() - 0.5) * 2 * amount) * 10) / 10,
    uint32: () => Math.floor(rng() * 2 ** 32) >>> 0,
  };
}

/**
 * An independent stream per named part of the drawing, all derived from one
 * seed. Changing the hair then never shifts the eyes: each part draws its
 * wobble from its own sequence.
 */
export function stream(seed: number, name: string): Dice {
  return dice(mulberry32(fnv1a(name, (0x811c9dc5 ^ (seed >>> 0)) >>> 0)));
}

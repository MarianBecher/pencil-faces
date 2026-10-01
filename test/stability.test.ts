import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { faceFromSeed, renderFace, type FaceConfig, type Hair, type Hat } from '../src/index.js';

/**
 * Faces as 0.1 rolled and drew them. Games store seeds and configs, so a
 * release must not quietly redraw them: a failure here means existing
 * players get a different face.
 */
interface Row {
  seed: number;
  face: FaceConfig;
  /** First 16 hex digits of the SHA-256 of `renderFace(face)`. */
  svg: string;
}
const ROWS = JSON.parse(readFileSync(new URL('fixtures/faces-0.1.json', import.meta.url), 'utf8')) as Row[];

const ADDED_HAIR: readonly Hair[] = ['locs', 'cornrows', 'ponytail', 'buzz', 'receding'];
const ADDED_HATS: readonly Hat[] = ['hijab', 'turban', 'kippah', 'fez'];
const HATS_CUTTING_HAIR: readonly Hat[] = ['beanie', 'cap', 'brimmed'];

const hash = (svg: string): string => createHash('sha256').update(svg).digest('hex').slice(0, 16);

describe('stability since 0.1', () => {
  it('draws the configs of 0.1 exactly as before', () => {
    let checked = 0;
    for (const { seed, face, svg } of ROWS) {
      // 0.2 fixed hair sticking out over the top of these hats, which redraws them on purpose.
      if (HATS_CUTTING_HAIR.includes(face.hat)) continue;
      expect(hash(renderFace(face)), `seed ${seed}`).toBe(svg);
      checked++;
    }
    expect(checked).toBeGreaterThan(50);
  });

  it('rolls the same faces, except where a hairstyle or head covering of 0.2 was rolled', () => {
    let kept = 0;
    for (const { seed, face: before } of ROWS) {
      const now = faceFromSeed(seed);
      // The hair tone is new in 0.2; configs of 0.1 do not have it.
      const expected = { ...before, hairTone: now.hairTone };
      if (ADDED_HAIR.includes(now.hair)) expected.hair = now.hair;
      if (ADDED_HATS.includes(now.hat)) {
        expected.hat = now.hat;
        if (now.hat === 'hijab') expected.beard = 'none';
      }
      if (expected.hair === before.hair && expected.hat === before.hat) kept++;
      expect(now, `seed ${seed}`).toEqual(expected);
    }
    // Most seeds keep their face entirely.
    expect(kept / ROWS.length).toBeGreaterThan(0.5);
  });
});

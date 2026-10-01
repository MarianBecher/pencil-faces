// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { FACE_OPTIONS, defaultFace, faceFromSeed, pencilDefs, pencilFilter, renderFace, type FaceConfig } from '../src/index.js';

/** Parses markup as XML and fails on any well-formedness error. */
function parse(markup: string): Document {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const error = doc.getElementsByTagName('parsererror')[0];
  if (error) throw new Error(`invalid XML: ${error.textContent}\n${markup}`);
  return doc;
}

/** Every config that differs from the base in exactly one categorical field. */
function* singleChanges(base: FaceConfig): Generator<[string, FaceConfig]> {
  for (const [field, values] of Object.entries(FACE_OPTIONS)) {
    for (const value of values) yield [`${field}=${value}`, { ...base, [field]: value }];
  }
  for (const mark of Object.keys(base.marks)) {
    yield [`marks.${mark}`, { ...base, marks: { ...base.marks, [mark]: true } }];
  }
  yield ['wink', { ...base, wink: true }];
  yield ['bangs with long hair', { ...base, hair: 'bangs', longHairBehindBangs: true }];
}

describe('parse', () => {
  it('rejects malformed markup, so the checks below mean something', () => {
    expect(() => parse('<svg xmlns="http://www.w3.org/2000/svg"><g></svg>')).toThrow(/invalid XML/);
    expect(() => parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')).not.toThrow();
  });
});

describe('renderFace', () => {
  it('returns the same string for the same config', () => {
    for (let seed = 0; seed < 50; seed++) {
      const face = faceFromSeed(seed);
      expect(renderFace(face)).toBe(renderFace(structuredClone(face)));
    }
  });

  it('renders every option value to well-formed SVG', () => {
    for (const jitter of [0, 1, 0xffffffff]) {
      for (const [label, face] of singleChanges({ ...defaultFace(), jitter })) {
        const svg = renderFace(face);
        expect(() => parse(svg), label).not.toThrow();
        expect(svg, label).not.toMatch(/NaN|undefined|Infinity|\[object/);
      }
    }
  });

  it('renders random faces to well-formed SVG', () => {
    for (let seed = 0; seed < 300; seed++) parse(renderFace(faceFromSeed(seed * 104729)));
  });

  it('uses the original viewBox and the pencil filter by default', () => {
    const svg = parse(renderFace(defaultFace())).documentElement;
    expect(svg.getAttribute('viewBox')).toBe('5 3.5 38 46');
    expect(svg.getAttribute('class')).toBe('face');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.firstElementChild?.getAttribute('filter')).toBe('url(#pencil-face)');
    expect(svg.querySelector('[fill="var(--c)"]')).not.toBeNull();
  });

  it('honours the render options and escapes them', () => {
    const markup = renderFace(defaultFace(), {
      filterId: 'my-filter',
      className: 'avatar "big"',
      background: '#fff',
      stroke: '#123',
    });
    const svg = parse(markup).documentElement;
    expect(svg.getAttribute('class')).toBe('avatar "big"');
    expect(svg.getAttribute('stroke')).toBe('#123');
    expect(svg.firstElementChild?.getAttribute('filter')).toBe('url(#my-filter)');
    expect(markup).not.toContain('var(--c)');
    expect(svg.querySelector('[fill="#fff"]')).not.toBeNull();
  });

  it('draws without a filter when filterId is null', () => {
    const svg = parse(renderFace(defaultFace(), { filterId: null })).documentElement;
    expect(svg.firstElementChild?.hasAttribute('filter')).toBe(false);
    expect(renderFace(defaultFace(), { filterId: null })).not.toContain('filter');
  });

  it('keeps the classes the stylesheet relies on', () => {
    const all = Array.from({ length: 200 }, (_, seed) => renderFace(faceFromSeed(seed))).join('');
    for (const cls of ['fill', 'detail', 'soft', 'thick']) expect(all).toMatch(new RegExp(`class="[^"]*\\b${cls}\\b`));
  });

  it('looks right without a stylesheet: dots are filled with the stroke colour', () => {
    const svg = parse(renderFace({ ...defaultFace(), eyes: 'dot', brows: 'bushy' }, { stroke: '#123' })).documentElement;
    const dots = svg.querySelectorAll('.fill');
    expect(dots.length).toBeGreaterThan(0);
    for (const dot of dots) {
      expect(dot.getAttribute('fill')).toBe('#123');
      expect(dot.getAttribute('stroke')).toBe('none');
    }
    expect(svg.querySelector('.thick')?.getAttribute('stroke-width')).toBe('1.3');
  });

  it('keeps the proportions when only an unrelated choice changes', () => {
    const base = faceFromSeed(5, { hat: 'none', glasses: 'none', extra: 'none' });
    const headOf = (face: FaceConfig): string | undefined =>
      renderFace(face).match(/<path fill="var\(--c\)" d="M24 [^"]*Z"\/>/g)?.join('');
    const head = headOf(base);
    expect(head).toBeDefined();
    for (const hair of FACE_OPTIONS.hair) expect(headOf({ ...base, hair, hat: 'none' })).toContain(head);
  });

  it('hides the hair under a hijab or turban, and the ears and earrings under a hijab', () => {
    const base: FaceConfig = { ...defaultFace(), hair: 'long', extra: 'earring' };
    const plain = renderFace({ ...base, hat: 'none' }, { filterId: null });
    const hairOnly = (hat: FaceConfig['hat']): string => renderFace({ ...base, hat, hair: 'bald' }, { filterId: null });
    for (const hat of ['hijab', 'turban'] as const) {
      // The hairstyle makes no difference any more.
      expect(renderFace({ ...base, hat }, { filterId: null }), hat).toBe(hairOnly(hat));
    }
    const earring = 'r="1" class="detail"';
    expect(plain).toContain(earring);
    expect(renderFace({ ...base, hat: 'turban' })).toContain(earring);
    expect(renderFace({ ...base, hat: 'hijab' })).not.toContain(earring);
    expect(renderFace({ ...base, hat: 'hijab', extra: 'headphones' })).toContain('rx="1.8"');
  });

  it('cuts the hair to beanies, caps, brimmed hats and fezzes, with an id that follows the config', () => {
    const face: FaceConfig = { ...defaultFace(), hair: 'afro' };
    for (const hat of ['beanie', 'cap', 'brimmed', 'fez'] as const) {
      const svg = parse(renderFace({ ...face, hat })).documentElement;
      const clipped = svg.querySelector('[clip-path]');
      const id = clipped?.getAttribute('clip-path')?.match(/^url\(#(.+)\)$/)?.[1];
      expect(id, hat).toBeDefined();
      expect(svg.querySelector(`clipPath[id="${id}"]`), hat).not.toBeNull();
      expect(svg.querySelector(`clipPath[id="${id}-shape"] g`), hat).toBeNull();
    }
    const idOf = (config: FaceConfig): string | undefined => /clipPath id="([^"]+)"/.exec(renderFace(config))?.[1];
    expect(idOf({ ...face, hat: 'cap' })).toBe(idOf({ ...face, hat: 'cap' }));
    expect(idOf({ ...face, hat: 'cap' })).not.toBe(idOf({ ...face, hat: 'cap', jitter: 1 }));
    for (const hat of ['none', 'headband', 'kippah', 'hijab', 'turban'] as const) {
      expect(renderFace({ ...face, hat }), hat).not.toContain('clip-path');
    }
  });

  it('shades mid and dark hair with hatching inside the hair, and light hair not at all', () => {
    const face: FaceConfig = { ...defaultFace(), hair: 'long' };
    const strokes = (svg: string): number => (/clip-path="url\(#pencil-face-tone-[^"]*"/.exec(svg) ? (svg.match(/M-?[\d.]+ 60l60-60/g) ?? []).length : 0);
    const light = renderFace({ ...face, hairTone: 'light' });
    const mid = renderFace({ ...face, hairTone: 'mid' });
    const dark = renderFace({ ...face, hairTone: 'dark' });
    expect(light).not.toContain('pencil-face-tone-');
    expect(strokes(mid)).toBeGreaterThan(0);
    expect(strokes(dark)).toBeGreaterThan(strokes(mid));
    // Both layers of long hair get their own clip, referenced from the same svg.
    const svg = parse(dark).documentElement;
    for (const ref of svg.querySelectorAll('[clip-path]')) {
      const id = /^url\(#(.+)\)$/.exec(ref.getAttribute('clip-path') ?? '')?.[1];
      expect(svg.querySelector(`clipPath[id="${id}"]`), id).not.toBeNull();
    }
    // Configs from before 0.2 have no tone and draw as light hair.
    const old: Partial<FaceConfig> = { ...face };
    delete old.hairTone;
    expect(renderFace(old as FaceConfig)).toBe(renderFace({ ...face, hairTone: 'light' }));
    // Nothing to shade under a hijab, or on a bald head.
    expect(renderFace({ ...face, hairTone: 'dark', hat: 'hijab' })).not.toContain('pencil-face-tone-');
    expect(renderFace({ ...face, hairTone: 'dark', hair: 'bald' })).not.toContain('pencil-face-tone-');
  });

  it('changes the drawing when the jitter changes', () => {
    const face = defaultFace();
    expect(renderFace({ ...face, jitter: 1 })).not.toBe(renderFace({ ...face, jitter: 2 }));
  });

  it('paints the parts back to front', () => {
    const face: FaceConfig = { ...defaultFace(), hair: 'long', hat: 'beanie', glasses: 'sunglasses', extra: 'earring' };
    const svg = renderFace(face, { filterId: null });
    const at = (needle: string): number => {
      const i = svg.indexOf(needle);
      expect(i, needle).toBeGreaterThan(-1);
      return i;
    };
    const hairBack = at('<g clip-path="url(#pencil-face-hair-');
    const body = at(' 60C');
    const hat = at('r="2.4"');
    const earring = at('r="1" class="detail"');
    expect(hairBack).toBeLessThan(body);
    expect(body).toBeLessThan(hat);
    expect(hat).toBeLessThan(earring);
  });
});

describe('pencil filter', () => {
  it('builds the filter with the given id', () => {
    expect(pencilFilter()).toMatch(/^<filter id="pencil-face"/);
    expect(pencilFilter('x&y')).toContain('id="x&amp;y"');
  });

  it('wraps it in a zero-size svg', () => {
    const svg = parse(pencilDefs('pf')).documentElement;
    expect(svg.getAttribute('width')).toBe('0');
    expect(svg.getAttribute('height')).toBe('0');
    expect(svg.querySelector('filter')?.getAttribute('id')).toBe('pf');
    expect(svg.querySelectorAll('filter > *')).toHaveLength(5);
  });
});

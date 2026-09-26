/**
 * pencil-faces: pencil-drawn passport-photo portraits as SVG strings.
 *
 * Two steps: a seed (or a hand-made config) becomes a `FaceConfig`, and a
 * config becomes SVG markup. Both are pure and deterministic.
 */
export type {
  Beard,
  Brows,
  Clothes,
  Ears,
  Extra,
  Eyes,
  FaceConfig,
  FaceMarks,
  FaceOverrides,
  Glasses,
  Hair,
  Hat,
  HeadShape,
  Mouth,
  Nose,
  RenderOptions,
} from './types.js';
export { FACE_OPTIONS } from './options.js';
export { defaultFace, faceFromSeed } from './config.js';
export { renderFace } from './render.js';
export { pencilDefs, pencilFilter } from './filter.js';

/** Outline of the head, from the crown down to the chin. */
export type HeadShape = 'oval' | 'square' | 'long' | 'round' | 'pear' | 'heart';
export type Clothes = 'crewneck' | 'vneck' | 'shirtTie' | 'turtleneck' | 'hoodie' | 'stripes';
export type Ears = 'small' | 'big';
export type Eyes = 'dot' | 'open' | 'lidded' | 'happy' | 'wide' | 'squint' | 'tired' | 'lash';
export type Brows = 'straight' | 'arch' | 'angry' | 'worried' | 'bushy' | 'unibrow' | 'thin' | 'raised';
export type Nose = 'plain' | 'hook' | 'bulb' | 'snub' | 'wide' | 'pointed';
export type Mouth = 'line' | 'smile' | 'grin' | 'surprised' | 'crooked' | 'pout' | 'frown' | 'dimples';
export type Beard = 'none' | 'moustache' | 'handlebar' | 'full' | 'goatee' | 'stubble';
export type Hair =
  | 'bald'
  | 'short'
  | 'sidePart'
  | 'curly'
  | 'afro'
  | 'bun'
  | 'long'
  | 'bangs'
  | 'mohawk'
  | 'spiky'
  | 'braid'
  | 'slickedBack';
export type Hat = 'none' | 'beanie' | 'cap' | 'brimmed' | 'headband';
export type Glasses = 'none' | 'round' | 'square' | 'sunglasses' | 'monocle';
export type Extra = 'none' | 'headphones' | 'earring' | 'flower' | 'pencil';

/** Traces of a life lived: wrinkles, dimples, freckles. Any combination is allowed. */
export interface FaceMarks {
  /** Nasolabial folds beside the mouth. */
  laughLines: boolean;
  /** Two soft lines across the forehead. */
  foreheadLines: boolean;
  /** Small ticks at the outer corners of the eyes. */
  crowsFeet: boolean;
  /** A little curve on the chin. */
  chinDimple: boolean;
  /** Three dots on each cheek. */
  freckles: boolean;
}

/** Everything that decides what a face looks like. */
export interface FaceConfig {
  shape: HeadShape;
  clothes: Clothes;
  ears: Ears;
  eyes: Eyes;
  /** The right eye (from the viewer) is closed in a wink. */
  wink: boolean;
  brows: Brows;
  nose: Nose;
  /** Which way the nose points (from the viewer). */
  noseSide: 'left' | 'right';
  mouth: Mouth;
  marks: FaceMarks;
  beard: Beard;
  hair: Hair;
  /** Only used with `hair: 'bangs'`: long hair falls behind the fringe. */
  longHairBehindBangs: boolean;
  hat: Hat;
  glasses: Glasses;
  extra: Extra;
  /** Seed for the sub-pixel wobble and proportions (head width, eye spacing, ...). Same jitter + same choices = identical drawing. */
  jitter: number;
}

/** What `faceFromSeed` accepts on top of the roll; `marks` may be partial. */
export type FaceOverrides = Partial<Omit<FaceConfig, 'marks'>> & { marks?: Partial<FaceMarks> };

export interface RenderOptions {
  /** Id of the pencil `<filter>` to reference. Defaults to `'pencil-face'`; `null` draws clean vector lines. */
  filterId?: string | null;
  /** Class attribute of the root `<svg>`. Defaults to `'face'`. */
  className?: string;
  /** Fill of the areas that must hide what lies behind them (head over hair, hat over forehead). Defaults to `'var(--c)'`. */
  background?: string;
  /** Line colour. Defaults to `'currentColor'`. */
  stroke?: string;
}

import type {
  Beard,
  Brows,
  Clothes,
  Ears,
  Extra,
  Eyes,
  Glasses,
  Hair,
  Hat,
  HeadShape,
  Mouth,
  Nose,
} from './types.js';

/**
 * Every value of every categorical field, in a stable order. The order is
 * the one `faceFromSeed` picks from, and `'none'` always comes first.
 */
export const FACE_OPTIONS: {
  readonly shape: readonly HeadShape[];
  readonly clothes: readonly Clothes[];
  readonly ears: readonly Ears[];
  readonly eyes: readonly Eyes[];
  readonly brows: readonly Brows[];
  readonly nose: readonly Nose[];
  readonly noseSide: readonly ('left' | 'right')[];
  readonly mouth: readonly Mouth[];
  readonly beard: readonly Beard[];
  readonly hair: readonly Hair[];
  readonly hat: readonly Hat[];
  readonly glasses: readonly Glasses[];
  readonly extra: readonly Extra[];
} = Object.freeze({
  shape: Object.freeze(['oval', 'square', 'long', 'round', 'pear', 'heart'] as const),
  clothes: Object.freeze(['crewneck', 'vneck', 'shirtTie', 'turtleneck', 'hoodie', 'stripes'] as const),
  ears: Object.freeze(['small', 'big'] as const),
  eyes: Object.freeze(['dot', 'open', 'lidded', 'happy', 'wide', 'squint', 'tired', 'lash'] as const),
  brows: Object.freeze(['straight', 'arch', 'angry', 'worried', 'bushy', 'unibrow', 'thin', 'raised'] as const),
  nose: Object.freeze(['plain', 'hook', 'bulb', 'snub', 'wide', 'pointed'] as const),
  noseSide: Object.freeze(['left', 'right'] as const),
  mouth: Object.freeze(['line', 'smile', 'grin', 'surprised', 'crooked', 'pout', 'frown', 'dimples'] as const),
  beard: Object.freeze(['none', 'moustache', 'handlebar', 'full', 'goatee', 'stubble'] as const),
  hair: Object.freeze([
    'bald',
    'short',
    'sidePart',
    'curly',
    'afro',
    'bun',
    'long',
    'bangs',
    'mohawk',
    'spiky',
    'braid',
    'slickedBack',
  ] as const),
  hat: Object.freeze(['none', 'beanie', 'cap', 'brimmed', 'headband'] as const),
  glasses: Object.freeze(['none', 'round', 'square', 'sunglasses', 'monocle'] as const),
  extra: Object.freeze(['none', 'headphones', 'earring', 'flower', 'pencil'] as const),
});

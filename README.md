# pencil-faces

Pencil-drawn passport-photo portraits as SVG strings. One number in, one little face out: a head, clothes, eyes, brows, nose, mouth, wrinkles, beards, a dozen hairstyles, hats, glasses and a few extras, drawn as a line drawing and roughened by an SVG filter so the lines tremble and pick up grain like graphite on paper.

![Thirty-two faces rolled from seeds](docs/faces.png)

<img src="docs/faces.gif" alt="One face after another, rolled from seeds" width="260" align="right">


- **Deterministic.** The same seed always gives the same face, and the same config always gives the same SVG string, on every machine. Send a 32-bit number over the wire and every client draws the same person.
- **Editable.** A seed only rolls a plain `FaceConfig` object. Change any part of it (or build one from scratch) and render that.
- **Tiny and dependency-free.** Pure functions that return strings. Works in the browser, in Node, in workers, in SSR.

The faces were first drawn for the geography game *geo-battle*, where every player gets a passport photo.

## Install

```sh
npm install pencil-faces
```

ESM only, ships its own type declarations, requires Node 22 or newer (or any modern bundler).

## Usage

```ts
import { faceFromSeed, renderFace, pencilDefs } from 'pencil-faces';

// Once per page: the pencil filter every face points at.
document.body.insertAdjacentHTML('beforeend', pencilDefs());

// Seed -> config -> SVG.
const face = faceFromSeed(1234567);
avatar.innerHTML = renderFace(face);
```

```css
.avatar {
  --c: #f3d9a4; /* the paper colour, used to fill covering shapes */
  color: #2b2622; /* the pencil colour */
  width: 96px;
  aspect-ratio: 38 / 46;
  background: var(--c);
}
.avatar svg {
  display: block;
  width: 100%;
  height: 100%;
}
```

### Seed -> config

```ts
function faceFromSeed(seed: number, overrides?: FaceOverrides): FaceConfig;
function defaultFace(): FaceConfig;
```

`faceFromSeed` rolls every choice from a 32-bit seed. Most faces are plain: a beard shows up in 26 % of faces, glasses in 24 %, an extra in 20 %, a hat in 12 % and a wink in 8 %; big ears in 20 %. `overrides` replace fields after the roll, so the rest of the face stays the same. `marks` may be given partially and is merged:

```ts
faceFromSeed(42, { hair: 'afro', glasses: 'round', marks: { freckles: true } });
```

`defaultFace()` returns a plain, friendly face, a good starting point for an editor.

A `FaceConfig` is plain JSON, so you can store it, send it or let people edit it:

```ts
interface FaceConfig {
  shape: HeadShape;
  clothes: Clothes;
  ears: Ears;
  eyes: Eyes;
  wink: boolean;
  brows: Brows;
  nose: Nose;
  noseSide: 'left' | 'right';
  mouth: Mouth;
  marks: FaceMarks;
  beard: Beard;
  hair: Hair;
  longHairBehindBangs: boolean;
  hat: Hat;
  glasses: Glasses;
  extra: Extra;
  jitter: number;
}
```

`jitter` seeds everything that is not a choice: the proportions (head width, eye spacing, nose length, mouth width, ...) and the sub-pixel wobble that keeps a hand drawing from being perfectly symmetric. Same jitter plus same choices means the identical drawing. The proportions depend only on `jitter`, `shape`, `ears` and `noseSide`, so swapping the hairstyle or adding glasses never moves the eyes.

### Config -> SVG

```ts
function renderFace(config: FaceConfig, options?: RenderOptions): string;

interface RenderOptions {
  filterId?: string | null; // default 'pencil-face'; null: clean vector lines, no filter
  className?: string; // class of the root <svg>, default 'face'
  background?: string; // fill of covering shapes, default 'var(--c)'
  stroke?: string; // line colour, default 'currentColor'
}
```

The result is a single `<svg>` element with `viewBox="5 3.5 38 46"` (a passport-photo crop of head and shoulders) and no fixed size, so it fills whatever box you put it in. It carries `aria-hidden="true"`; label the surrounding element if the portrait matters to screen readers.

### The pencil filter

```ts
function pencilFilter(id?: string): string; // the <filter> element
function pencilDefs(id?: string): string; // a zero-size <svg> carrying that filter
```

Faces reference the filter by id instead of each carrying a copy. Append `pencilDefs()` to the document once, or put `pencilFilter()` into your own `<defs>`. If you render several filters, give each an id and pass the same id as `filterId`. For a standalone `.svg` file, insert `pencilFilter()` into the face markup right after the opening `<svg ...>` tag.

## Options

| Field | Values |
| --- | --- |
| `shape` | `oval`, `square`, `long`, `round`, `pear`, `heart` |
| `clothes` | `crewneck`, `vneck`, `shirtTie`, `turtleneck`, `hoodie`, `stripes` |
| `ears` | `small`, `big` |
| `eyes` | `dot`, `open`, `lidded`, `happy`, `wide`, `squint`, `tired`, `lash` |
| `wink` | `true`, `false` (closes the right eye) |
| `brows` | `straight`, `arch`, `angry`, `worried`, `bushy`, `unibrow`, `thin`, `raised` |
| `nose` | `plain`, `hook`, `bulb`, `snub`, `wide`, `pointed` |
| `noseSide` | `left`, `right` |
| `mouth` | `line`, `smile`, `grin`, `surprised`, `crooked`, `pout`, `frown`, `dimples` |
| `marks` | any of `laughLines`, `foreheadLines`, `crowsFeet`, `chinDimple`, `freckles` |
| `beard` | `none`, `moustache`, `handlebar`, `full`, `goatee`, `stubble` |
| `hair` | `bald`, `short`, `sidePart`, `curly`, `afro`, `bun`, `long`, `bangs`, `mohawk`, `spiky`, `braid`, `slickedBack` |
| `longHairBehindBangs` | `true`, `false` (only drawn with `hair: 'bangs'`) |
| `hat` | `none`, `beanie`, `cap`, `brimmed`, `headband` |
| `glasses` | `none`, `round`, `square`, `sunglasses`, `monocle` |
| `extra` | `none`, `headphones`, `earring`, `flower`, `pencil` |
| `jitter` | any unsigned 32-bit integer |

The same lists are exported as `FACE_OPTIONS` (frozen, one array per field), handy for building pickers:

```ts
import { FACE_OPTIONS } from 'pencil-faces';
for (const hair of FACE_OPTIONS.hair) select.add(new Option(hair));
```

## Styling

The drawing is pure line art. Lines use `stroke` (default `currentColor`, so the CSS `color` of the container). Shapes that have to hide what is behind them, like the head in front of long hair or a hat in front of the forehead, are filled with `background` (default `var(--c)`), so set `--c` to the colour of the box the face sits on, or pass a colour directly:

```ts
renderFace(face, { background: '#fff', stroke: '#333' });
```

Four classes on the paths let a stylesheet tune the look. Each also gets matching presentation attributes, so faces look right with no CSS at all; any CSS rule overrides them.

| Class | Used for | Built-in default |
| --- | --- | --- |
| `fill` | solid dots: pupils, nostrils, freckles, stubble | filled with the stroke colour, no outline |
| `detail` | small extras: ear curls, creases, lashes, collar folds | none |
| `soft` | shading: wrinkles, strands of hair, hatching | `stroke-width: .55`, `opacity: .75` |
| `thick` | bold strokes: bushy brows, handlebar moustache, headphone band | `stroke-width: 1.3` |

Stroke widths are in viewBox units, so they scale with the picture. Small faces read better with thicker lines and fewer details:

```css
.face { stroke-width: 1.5; }
.face .soft { stroke-width: 0.8; }
.face .thick { stroke-width: 1.9; }
.tiny .face { stroke-width: 2.3; }
.tiny .face .detail { display: none; }
```

## Demo

```sh
git clone https://github.com/MarianBecher/pencil-faces.git
cd pencil-faces
npm install
npm run demo
```

The demo page has a seed field, a picker for every option, colour and filter toggles, and a gallery of random faces to click through.

## Development

```sh
npm run typecheck # tsc, strict
npm run lint # eslint with typescript-eslint
npm test # vitest
npm run build # compiles src/ to dist/
```

## Releasing

The first release is published by hand (`npm publish --access public`).
After that, configure a trusted publisher for the package on npmjs.com
(package settings -> Trusted publisher -> GitHub Actions, repository
`MarianBecher/pencil-faces`, workflow `publish.yml`). From then on a plain
semver tag releases:

```sh
npm version patch      # bumps package.json and creates the tag "0.1.1"
git push --follow-tags # CI publishes to npm with provenance
```

The `.npmrc` sets `tag-version-prefix=""`, so tags carry no `v`.

## License

[MIT](LICENSE) (c) 2026 Marian Becher

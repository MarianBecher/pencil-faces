import {
  FACE_OPTIONS,
  faceFromSeed,
  pencilDefs,
  renderFace,
  type FaceConfig,
  type FaceMarks,
  type RenderOptions,
} from '../src/index.js';

/** Pastel boxes for the gallery, like the player colours in the game this comes from. */
const COLOURS = ['#f3d9a4', '#bfe0c9', '#c9d8f2', '#f2c6c2', '#e3d0f0', '#f6e7a8', '#cde8e6', '#f1d2b0'];

function $<T extends HTMLElement>(id: string, type: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) throw new Error(`#${id} missing`);
  return el;
}

const portrait = $('portrait', HTMLDivElement);
const seedInput = $('seed', HTMLInputElement);
const pickers = $('pickers', HTMLFormElement);
const code = $('code', HTMLPreElement);
const gallery = $('gallery', HTMLDivElement);
const pencil = $('pencil', HTMLInputElement);
const paper = $('paper', HTMLInputElement);
const ink = $('ink', HTMLInputElement);

document.body.insertAdjacentHTML('beforeend', pencilDefs());

const randomSeed = (): number => (Math.random() * 2 ** 32) >>> 0;

let face: FaceConfig = faceFromSeed(0);

const renderOptions = (): RenderOptions => (pencil.checked ? {} : { filterId: null });

type SelectField = keyof typeof FACE_OPTIONS;
type BoolField = 'wink' | 'longHairBehindBangs';
const LABELS: Partial<Record<SelectField | BoolField | keyof FaceMarks, string>> = {
  noseSide: 'nose points',
  longHairBehindBangs: 'long hair behind bangs',
};
const label = (key: string): string => LABELS[key as SelectField] ?? key.replace(/[A-Z]/g, (c) => ` ${c.toLowerCase()}`);

function buildPickers(): void {
  for (const field of Object.keys(FACE_OPTIONS) as SelectField[]) {
    const select = document.createElement('select');
    select.name = field;
    for (const value of FACE_OPTIONS[field]) select.add(new Option(value, value));
    select.addEventListener('change', () => {
      update({ ...face, [field]: select.value });
    });
    const wrap = document.createElement('label');
    wrap.append(label(field), select);
    pickers.append(wrap);
  }

  const jitter = document.createElement('input');
  jitter.type = 'number';
  jitter.name = 'jitter';
  jitter.min = '0';
  jitter.max = String(2 ** 32 - 1);
  jitter.addEventListener('input', () => {
    update({ ...face, jitter: Number(jitter.value) >>> 0 });
  });
  const jitterWrap = document.createElement('label');
  jitterWrap.append('jitter', jitter);
  pickers.append(jitterWrap);

  const flags = document.createElement('fieldset');
  flags.innerHTML = '<legend>details</legend>';
  const checkbox = (name: string, onChange: (checked: boolean) => void): void => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = name;
    input.addEventListener('change', () => {
      onChange(input.checked);
    });
    const wrap = document.createElement('label');
    wrap.className = 'check';
    wrap.append(input, label(name));
    flags.append(wrap);
  };
  for (const flag of ['wink', 'longHairBehindBangs'] as const) {
    checkbox(flag, (checked) => {
      update({ ...face, [flag]: checked });
    });
  }
  for (const mark of Object.keys(face.marks) as (keyof FaceMarks)[]) {
    checkbox(mark, (checked) => {
      update({ ...face, marks: { ...face.marks, [mark]: checked } });
    });
  }
  pickers.append(flags);
}

/** Mirror the config into the form controls. */
function syncPickers(): void {
  for (const el of Array.from(pickers.elements)) {
    if (el instanceof HTMLSelectElement) el.value = face[el.name as SelectField];
    else if (el instanceof HTMLInputElement && el.type === 'number') el.value = String(face.jitter);
    else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      el.checked = el.name in face.marks ? face.marks[el.name as keyof FaceMarks] : face[el.name as BoolField];
    }
  }
}

function update(next: FaceConfig): void {
  face = next;
  portrait.innerHTML = renderFace(face, renderOptions());
  code.textContent = `renderFace(${JSON.stringify(face, null, 2)})`;
  syncPickers();
}

function loadSeed(seed: number): void {
  seedInput.value = String(seed);
  update(faceFromSeed(seed));
}

function fillGallery(): void {
  gallery.replaceChildren();
  for (let i = 0; i < 24; i++) {
    const seed = randomSeed();
    const button = document.createElement('button');
    button.type = 'button';
    button.title = `seed ${seed}`;
    button.style.setProperty('--c', COLOURS[i % COLOURS.length] ?? '#fff');
    button.innerHTML = renderFace(faceFromSeed(seed), renderOptions());
    button.addEventListener('click', () => {
      loadSeed(seed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    gallery.append(button);
  }
}

function applyColours(): void {
  portrait.style.setProperty('--c', paper.value);
  portrait.style.color = ink.value;
}

buildPickers();
loadSeed(randomSeed());
fillGallery();
applyColours();

seedInput.addEventListener('input', () => {
  if (seedInput.value !== '') loadSeed(Number(seedInput.value) >>> 0);
});
$('random', HTMLButtonElement).addEventListener('click', () => {
  loadSeed(randomSeed());
});
$('reroll', HTMLButtonElement).addEventListener('click', fillGallery);
pencil.addEventListener('change', () => {
  update(face);
  fillGallery();
});
paper.addEventListener('input', applyColours);
ink.addEventListener('input', applyColours);
$('copy-svg', HTMLButtonElement).addEventListener('click', () => {
  void navigator.clipboard.writeText(renderFace(face, { ...renderOptions(), background: paper.value, stroke: ink.value }));
});
$('copy-config', HTMLButtonElement).addEventListener('click', () => {
  void navigator.clipboard.writeText(JSON.stringify(face, null, 2));
});

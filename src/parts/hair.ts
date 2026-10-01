import type { Geometry } from '../geometry.js';
import { stream, type Dice } from '../random.js';
import { f, type Pen } from '../svg.js';
import type { FaceConfig, Hair } from '../types.js';
import { dome } from './head.js';

/** Hair is split in two layers: `back` is painted before the body and head, `front` over the face. */
export interface HairLayers {
  readonly back: string;
  readonly front: string;
}

/**
 * The hairline across the forehead, from right to left, continuing a path
 * that stands on the right side of a dome. `dip` lifts its middle. It ends
 * with a trailing space: the caller appends the final left-hand point.
 */
const hairline = ({ C }: Geometry, y: number, dip: number): string =>
  `C${f(24 + C - 1)} ${f(y - 2)} 27 ${f(y - dip)} 24 ${f(y - dip)}C21 ${f(y - dip)} ${f(24 - C + 1)} ${f(y - 2)} `;

/** `n` soft strands fanned across the top of the head, following its curve. */
function strands({ C, T }: Geometry, n: number, y1: number, y2: number, lean = 0.6): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = 24 - C * 0.7 + (i / (n - 1)) * C * 1.4;
    const top = T + 1 + Math.abs(x - 24) * 0.22;
    d += `M${f(x)} ${f(top + y1)}q${f(lean)} ${f((y2 - y1) / 2)} ${f(lean * 0.4)} ${f(y2 - y1)}`;
  }
  return `<path d="${d}" class="detail soft"/>`;
}

type HairDrawer = (g: Geometry, pen: Pen, d: Dice, config: FaceConfig) => HairLayers;

const HAIR: Record<Hair, HairDrawer> = {
  // Bald, with a fringe of hair above the ears.
  bald: ({ C, E }) => ({
    back: '',
    front: `<path d="M${f(24 - C - 0.3)} ${f(E - 1)}q.6-4 3-6M${f(24 + C + 0.3)} ${f(E - 1)}q-.6-4-3-6" class="thick"/>`,
  }),
  short: (g, pen) => ({
    back: '',
    front: `<path ${pen.bg} d="${dome(g, 1, 3)}${hairline(g, g.T + 6, 0)}${f(24 - g.C - 1)} ${f(g.E - 3)}Z"/>${strands(g, 6, 1, 3)}`,
  }),
  // Side parting with a sweep across the forehead.
  sidePart: (g, pen) => {
    const { C, T, E } = g;
    return {
      back: '',
      front:
        `<path ${pen.bg} d="${dome(g, 1.2, 2)}C${f(24 + C - 1)} ${f(T + 5)} 26 ${f(T + 3)} 21 ${f(T + 7.5)}C19 ${f(T + 9)} ${f(24 - C)} ${f(E - 5)} ${f(24 - C - 1.2)} ${f(E - 2)}Z"/>` +
        `<path d="M20 ${f(T - 0.6)}q2 3 1 6.6M25 ${f(T)}q3 2.4 7 3.4M27 ${f(T + 0.8)}q3 2 5.4 4.4" class="detail soft"/>`,
    };
  },
  curly: (g, pen, d) => {
    const { C, T, E } = g;
    let front = `<path ${pen.bg} d="${dome(g, 1.4, 3)}${hairline(g, T + 5, 0)}${f(24 - C - 1.4)} ${f(E - 3)}Z"/>`;
    // Packed tight and of uneven size - evenly spaced ones look like curlers.
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / (n - 1)) * Math.PI + d.between(-0.08, 0.08);
      const x = 24 + Math.cos(a) * (C + 0.6);
      const y = E - 3 + Math.sin(a) * (E - T + 0.8);
      front += `<path d="M${f(x - 1.6)} ${f(y + 0.6)}a${f(d.between(1.6, 2.4))} ${f(d.between(1.6, 2.2))} 0 1 1 ${f(3)} .4" ${pen.bg}/>`;
    }
    return { back: '', front: `${front}<path d="M21 ${f(T + 1.6)}q1 1 2 0M26 ${f(T + 2.4)}q1 1 2 0" class="detail soft"/>` };
  },
  // Afro: a scalloped cloud behind the head, a flat cap of hair in front.
  afro: (g, pen) => {
    const { C, T, E } = g;
    let back = `<path ${pen.bg} d="M${f(24 - C - 4)} ${f(E + 3)}`;
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * 0.9 + (i / n) * Math.PI * 1.2;
      back += `A3 3 0 0 1 ${f(24 + Math.cos(a) * (C + 4.6))} ${f(E - 4 + Math.sin(a) * (E - T + 4.4))}`;
    }
    return {
      back: `${back}Z"/>`,
      front: `<path ${pen.bg} d="${dome(g, 0.4, 3)}${hairline(g, T + 5, -1)}${f(24 - C - 0.4)} ${f(E - 3)}Z"/>`,
    };
  },
  bun: (g, pen, d) => {
    const { C, T, E } = g;
    return {
      back: `<circle ${pen.bg} cx="24" cy="${f(T - 3.2)}" r="${f(d.between(3.4, 4.4))}"/><path d="M22 ${f(T - 4)}q2 2 4 0" class="detail soft"/>`,
      front:
        `<path ${pen.bg} d="${dome(g, 0.8, 3)}${hairline(g, T + 5.6, 1)}${f(24 - C - 0.8)} ${f(E - 3)}Z"/>` +
        `<path d="M19 ${f(T + 2.4)}q5-2.6 10 0M21 ${f(T + 0.6)}q3-1.6 6 0" class="detail soft"/>`,
    };
  },
  // Long hair falls behind the shoulders; in front it parts in the middle.
  long: (g, pen) => {
    const { C, T, E, B } = g;
    return {
      back:
        `<path ${pen.bg} d="${dome(g, 1.6, -2)}L${f(24 + C + 2.6)} ${f(B + 4)}Q${f(24 + C - 1)} ${f(B + 6)} ${f(24 + C - 2)} ${f(B + 2)}H${f(24 - C + 2)}Q${f(24 - C + 1)} ${f(B + 6)} ${f(24 - C - 2.6)} ${f(B + 4)}Z"/>` +
        `<path d="M${f(24 + C + 1)} ${f(E + 2)}q.6 5 1 9M${f(24 - C - 1)} ${f(E + 2)}q-.6 5-1 9" class="detail soft"/>`,
      front: `<path ${pen.bg} d="${dome(g, 1.2, 1)}C${f(24 + C - 2)} ${f(T + 6)} 26 ${f(T + 4)} 24 ${f(T + 3)}C22 ${f(T + 4)} ${f(24 - C + 2)} ${f(T + 6)} ${f(24 - C - 1.2)} ${f(E - 1)}Z"/>`,
    };
  },
  // A straight fringe down to the brows, optionally with long hair behind it.
  bangs: (g, pen, _d, config) => {
    const { C, T, E, B, by } = g;
    return {
      back: config.longHairBehindBangs
        ? `<path ${pen.bg} d="${dome(g, 1.4, -4)}L${f(24 + C + 1.8)} ${f(B - 2)}H${f(24 - C - 1.8)}Z"/>`
        : '',
      front:
        `<path ${pen.bg} d="${dome(g, 1.2, 2)}C${f(24 + C - 1)} ${f(E - 4)} ${f(24 + C - 2)} ${f(E - 4.6)} ${f(24 + C - 3)} ${f(by - 1.4)}H${f(24 - C + 3)}C${f(24 - C + 2)} ${f(E - 4.6)} ${f(24 - C + 1)} ${f(E - 4)} ${f(24 - C - 1.2)} ${f(E - 2)}Z"/>` +
        strands(g, 7, 3, by - T - 3, 0.3),
    };
  },
  // Mohawk: five spikes of random height, the shaved sides hinted by stubble ticks.
  mohawk: ({ C, T, E }, pen, d) => {
    let path = `M21.6 ${f(T + 2)}`;
    for (let i = 0; i < 5; i++) path += `L${f(22 + i)} ${f(T - d.between(3.6, 5.6))}L${f(22.5 + i)} ${f(T + 0.6)}`;
    return {
      back: '',
      front:
        `<path ${pen.bg} d="${path}L26.4 ${f(T + 2)}Z"/>` +
        `<path d="M${f(24 - C + 1)} ${f(E - 4)}l.8 .6M${f(24 - C + 1.6)} ${f(E - 6)}l.8 .6M${f(24 + C - 1)} ${f(E - 4)}l-.8 .6M${f(24 + C - 1.6)} ${f(E - 6)}l-.8 .6" class="detail soft"/>`,
    };
  },
  // Spiky: uneven, leaning tufts rather than a crown.
  spiky: (g, pen, d) => {
    const { C, T, E } = g;
    let path = `M${f(24 - C - 0.6)} ${f(E - 3)}`;
    const n = 13;
    for (let i = 1; i < n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      const out = i % 2 ? d.between(1.8, 3.4) : 0.4;
      const lean = i % 2 ? (a - Math.PI * 1.5) * 1.6 : 0;
      path += `L${f(24 + Math.cos(a) * (C + out) + lean)} ${f(E - 3 + Math.sin(a) * (E - T + out))}`;
    }
    path += `L${f(24 + C + 0.6)} ${f(E - 3)}`;
    return { back: '', front: `<path ${pen.bg} d="${path}${hairline(g, T + 5.4, 0)}${f(24 - C - 0.6)} ${f(E - 3)}Z"/>` };
  },
  // A braid hanging over to the side.
  braid: (g, pen) => {
    const { C, T, E } = g;
    return {
      back:
        `<path ${pen.bg} d="M${f(24 + C - 1)} ${f(E - 4)}q6 2 4.6 9q2.8 2 1.4 5.2q-2.6 1-3.6-1.6-2.6-5.6-2.4-12.6z"/>` +
        `<path d="M${f(24 + C + 2)} ${f(E + 4)}l1.6-.4M${f(24 + C + 2.4)} ${f(E + 7)}l1.6-.4" class="detail soft"/>`,
      front:
        `<path ${pen.bg} d="${dome(g, 0.8, 3)}${hairline(g, T + 5.4, 1)}${f(24 - C - 0.8)} ${f(E - 3)}Z"/>` +
        `<path d="M20 ${f(T + 1)}q4 1 8 3.2" class="detail soft"/>`,
    };
  },
  slickedBack: (g, pen) => {
    const { C, T, E } = g;
    return {
      back: '',
      front:
        `<path ${pen.bg} d="${dome(g, 1.6, 3.4)}${hairline(g, T + 4.2, -0.6)}${f(24 - C - 1.6)} ${f(E - 3.4)}Z"/>` +
        `<path d="M19 ${f(T + 3)}Q24 ${f(T - 1.4)} 30 ${f(T + 2)}M20 ${f(T + 1.6)}Q24 ${f(T - 2.4)} 29 ${f(T + 0.6)}" class="detail soft"/>`,
    };
  },
  // Locs: wavy ropes of uneven length hanging down both sides to the shoulders.
  locs: (g, pen, d) => {
    const { C, T, E, B } = g;
    let back = '';
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        // The tops bunch up under the edge of the hair; the ropes fan out towards the shoulders.
        const x = 24 + s * (C - 0.2 + i * 0.7);
        const w = d.between(0.65, 0.85);
        const y0 = E - 6;
        const y1 = B + d.between(-1.5, 3.5);
        const drift = s * (i * 1.7 + d.between(0, 0.6));
        const wave = d.between(-0.8, 0.8);
        const mid = (y0 + y1) / 2;
        back +=
          `<path ${pen.bg} d="M${f(x - w)} ${f(y0)}Q${f(x - w + wave)} ${f(mid)} ${f(x - w + drift)} ${f(y1)}` +
          `A${f(w)} ${f(w)} 0 0 0 ${f(x + w + drift)} ${f(y1)}Q${f(x + w + wave)} ${f(mid)} ${f(x + w)} ${f(y0)}Z"/>` +
          `<path d="M${f(x - w * 0.6 + wave * 0.4)} ${f(mid)}l${f(w * 1.2)} .5M${f(x - w * 0.6 + drift * 0.8)} ${f(y1 - 2)}l${f(w * 1.2)} .5" class="detail soft"/>`;
      }
    }
    // On top, a slightly lumpy crown with the ropes running back from the hairline over it.
    const rx = C + 1.6;
    const ry = E - T + 0.4;
    let crown = `M${f(24 - rx)} ${f(E - 1.4)}`;
    const n = 13;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      const x = 24 + Math.cos(a) * rx;
      const y = E - 3 + Math.sin(a) * ry;
      crown += i === 0 ? `L${f(x)} ${f(y)}` : `A${f(d.between(1.1, 1.5))} 1 0 0 1 ${f(x)} ${f(y)}`;
    }
    crown += `L${f(24 + rx)} ${f(E - 1.4)}${hairline(g, T + 5, 0)}${f(24 - rx)} ${f(E - 1.4)}Z`;
    let ropes = '';
    for (let i = 0; i < 6; i++) {
      const x = 24 + (i - 2.5) * C * 0.3;
      const bottom = T + 4.8 + Math.abs(x - 24) * 0.25;
      const top = T - 1.8 + Math.abs(x - 24) * 0.3;
      const lean = (x - 24) * 0.3;
      const sway = d.between(-0.5, 0.5);
      for (const side of [-0.6, 0.6]) {
        ropes += `M${f(x + side)} ${f(bottom)}Q${f(x + side + sway)} ${f((top + bottom) / 2)} ${f(x + side + lean)} ${f(top)}`;
      }
    }
    return {
      back,
      front: `<path ${pen.bg} d="${crown}"/><path d="${ropes}" class="detail soft"/>`,
    };
  },
  // Cornrows: braided rows running from the hairline back over the crown.
  cornrows: (g, pen) => {
    const { C, T, E } = g;
    let rows = '';
    for (let i = 0; i < 5; i++) {
      const x = 24 + (i - 2) * C * 0.36;
      const bottom = T + 5 + Math.abs(x - 24) * 0.22;
      const top = T + 0.4 + Math.abs(x - 24) * 0.3;
      // Rows lean towards the middle as they run back over the head.
      const lean = (24 - x) * 0.12;
      for (let y = bottom; y > top; y -= 1.1) {
        const cx = x + lean * ((bottom - y) / (bottom - top));
        rows += `M${f(cx - 0.6)} ${f(y - 0.5)}l.6 .5.6-.5`;
      }
    }
    return {
      back: '',
      front: `<path ${pen.bg} d="${dome(g, 0.6, 3)}${hairline(g, T + 5.6, 0)}${f(24 - C - 0.6)} ${f(E - 3)}Z"/><path d="${rows}" class="detail soft"/>`,
    };
  },
  // Ponytail: pulled back tight, the tail swinging out behind the left side.
  ponytail: (g, pen) => {
    const { C, T, E, B } = g;
    const x = 24 - C;
    return {
      back:
        `<path ${pen.bg} d="M${f(x + 1)} ${f(T + 2)}C${f(x - 3)} ${f(T + 3)} ${f(x - 5)} ${f(E + 3)} ${f(x - 2.6)} ${f(B + 1)}C${f(x - 2)} ${f(E + 4)} ${f(x - 1)} ${f(E)} ${f(x + 0.4)} ${f(E - 3)}Z"/>` +
        `<path d="M${f(x - 1.6)} ${f(T + 3.6)}l1.4 1.2M${f(x - 3)} ${f(E + 1)}q.4 3 .4 5" class="detail soft"/>` +
        `<path d="M${f(x - 1.2)} ${f(T + 2.6)}l1.4 1.4" class="thick"/>`,
      front:
        `<path ${pen.bg} d="${dome(g, 0.8, 3.6)}${hairline(g, T + 4.6, -0.4)}${f(24 - C - 0.8)} ${f(E - 3.6)}Z"/>` +
        `<path d="M20 ${f(T + 2.6)}Q24 ${f(T - 0.6)} 29 ${f(T + 1.6)}M21 ${f(T + 1.2)}Q23 ${f(T - 0.6)} 27 ${f(T + 0.2)}" class="detail soft"/>`,
    };
  },
  // Buzz cut: no outline of its own, only a hairline and a stipple over the scalp.
  buzz: (g, _pen, d) => {
    const { C, T, E } = g;
    const dots = Array.from({ length: 22 }, () => {
      const x = 24 + d.between(-0.8, 0.8) * C;
      const top = T + 0.8 + Math.abs(x - 24) * 0.3;
      return `<circle cx="${f(x)}" cy="${f(d.between(top, T + 5))}" r=".22"/>`;
    });
    return {
      back: '',
      front:
        `<path d="M${f(24 - C + 0.2)} ${f(E - 4)}C${f(24 - C + 1)} ${f(T + 5)} 21 ${f(T + 5.4)} 24 ${f(T + 5.4)}C27 ${f(T + 5.4)} ${f(24 + C - 1)} ${f(T + 5)} ${f(24 + C - 0.2)} ${f(E - 4)}" class="soft"/>` +
        `<g class="fill detail">${dots.join('')}</g>`,
    };
  },
  // Receding: an M-shaped hairline with bare temples and a tuft in the middle.
  receding: (g, pen) => {
    const { C, T, E } = g;
    return {
      back: '',
      front:
        `<path ${pen.bg} d="${dome(g, 1, 3)}C${f(24 + C - 0.6)} ${f(T + 3)} ${f(24 + C - 2)} ${f(T + 1.4)} ${f(24 + C - 3.4)} ${f(T + 1.8)}` +
        `C${f(24 + 2.4)} ${f(T + 2.4)} 25 ${f(T + 4.6)} 24 ${f(T + 4.6)}C23 ${f(T + 4.6)} ${f(24 - 2.4)} ${f(T + 2.4)} ${f(24 - C + 3.4)} ${f(T + 1.8)}` +
        `C${f(24 - C + 2)} ${f(T + 1.4)} ${f(24 - C + 0.6)} ${f(T + 3)} ${f(24 - C - 1)} ${f(E - 3)}Z"/>` +
        strands(g, 4, 0.4, 2, 0.4),
    };
  },
};

export const hair = (config: FaceConfig, g: Geometry, pen: Pen): HairLayers =>
  HAIR[config.hair](g, pen, stream(config.jitter, 'hair'), config);

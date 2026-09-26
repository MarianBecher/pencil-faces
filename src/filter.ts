import { DEFAULT_FILTER_ID } from './render.js';
import { escapeAttr } from './svg.js';

/**
 * The <filter> element markup (id defaults to 'pencil-face').
 *
 * The pencil look is a filter, not part of the drawing: a low-frequency
 * noise displaces the lines so they tremble slightly, and a fine-grained
 * noise eats into them like the tooth of paper under graphite.
 */
export function pencilFilter(id: string = DEFAULT_FILTER_ID): string {
  return (
    `<filter id="${escapeAttr(id)}" x="-10%" y="-10%" width="120%" height="120%">` +
    `<feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="4" result="wobble"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="wobble" scale=".9" xChannelSelector="R" yChannelSelector="G" result="drawn"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="2.8" numOctaves="1" seed="9" result="grain"/>` +
    `<feColorMatrix in="grain" type="matrix" result="tooth" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.55"/>` +
    `<feComposite in="drawn" in2="tooth" operator="in"/>` +
    `</filter>`
  );
}

/**
 * A zero-size <svg> carrying the filter, to append once to document.body;
 * every face then references it by id. It is hidden by size rather than
 * `display: none`, because some browsers do not render filters that live in
 * an undisplayed subtree.
 */
export function pencilDefs(id: string = DEFAULT_FILTER_ID): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">` +
    `<defs>${pencilFilter(id)}</defs></svg>`
  );
}

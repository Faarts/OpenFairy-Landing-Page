// Global constants and shared mutable state
export const W=1440,H=900;                       // artboard size
export const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const RENDER=new URLSearchParams(location.search).get('render'); // ?render=1 → capture mode
export const OVR=window.OVR={};                  // debug overrides (OVR.blast, OVR.ry)
export const BREAKPOINT=1200;                    // below this width the page switches to the fluid (compact) layout
// wide screens: the canvas stops scaling at SMAX (1440 × 1.2 = 1728px of content); beyond that the canvas
// gets wider instead — sections stay 1440 and centre, full-bleed layers (hero scene, ribbons, rules) stretch.
export const SMAX=1.2;
export const HMAX=1200;                          // the desktop hero grows to the viewport height up to this (canvas px)
export const COMPACT_MQ=matchMedia(`(max-width:${BREAKPOINT-.02}px)`);
// S = page scale (desktop) · introT = intro start time
// hero scene box: W×H = hero size in px, wingX/Y = wing centre inside it, wingScale = wing size, compact = fluid layout
export const state={bleed:0,vpad:0,S:1,introT:-1,W,H,wingX:905,wingY:478,wingScale:1.8,compact:false};

// Global constants and shared mutable state
export const W=1440,H=900;                       // artboard size
export const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const RENDER=new URLSearchParams(location.search).get('render'); // ?render=1 → capture mode
export const OVR=window.OVR={};                  // debug overrides (OVR.blast, OVR.ry)
export const BREAKPOINT=1200;                    // below this width the page switches to the fluid (compact) layout
export const COMPACT_MQ=matchMedia(`(max-width:${BREAKPOINT-.02}px)`);
// S = page scale (desktop) · introT = intro start time
// hero scene box: W×H = hero size in px, wingX/Y = wing centre inside it, wingScale = wing size, compact = fluid layout
export const state={S:1,introT:-1,W,H,wingX:905,wingY:478,wingScale:1.8,compact:false};

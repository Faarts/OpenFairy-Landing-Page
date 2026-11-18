// Global constants and shared mutable state
export const W=1440,H=900;                       // artboard size
export const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const RENDER=new URLSearchParams(location.search).get('render'); // ?render=1 → capture mode
export const OVR=window.OVR={};                  // debug overrides (OVR.blast, OVR.ry)
export const state={S:1,introT:-1};              // S = artboard scale, introT = intro start time

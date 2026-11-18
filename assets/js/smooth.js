// Smooth, weighted wheel scrolling (Lenis, vendored in assets/libs/lenis). Mouse wheel / trackpad only —
// touch keeps native scrolling, and nothing changes with reduced motion. The page still scrolls natively
// underneath (Lenis animates window.scrollY), so every scroll listener on the page keeps working.
import Lenis from '../libs/lenis/lenis.mjs';

const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!REDUCE){
  const lenis=new Lenis({
    lerp:.07,                 // lower = heavier, longer glide
    wheelMultiplier:.9,
    smoothWheel:true,
    syncTouch:false,
    autoRaf:false
  });
  window.lenis=lenis;
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf);};
  requestAnimationFrame(raf);

  // the preloader locks the scroll (html.is-loading); hold Lenis too, or it would scroll the locked page
  const root=document.documentElement; let locked=null;
  const sync=()=>{const l=root.classList.contains('is-loading'); if(l===locked) return; locked=l; l?lenis.stop():lenis.start();};
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']}); sync();
}

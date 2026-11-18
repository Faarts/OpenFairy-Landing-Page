// Scroll pinning for the CSS-scaled desktop page.
// position:sticky is unreliable here (the page is transform-scaled and #stage clips overflow), so pinned
// layouts translate their pin element by the scrolled distance instead. All values are in canvas px (÷ state.S).
import { state, COMPACT_MQ } from './config.js';

/**
 * pin(section, pinEl, {travel, onProgress})
 *  travel(vh) → canvas px the pin stays fixed for (the section grows by this much)
 *  onProgress(p, vh) → called with 0…1 progress while scrolling through
 * Returns a teardown function. Inactive (and cleaned up) on the compact layout.
 */
export function pin(section,pinEl,{travel,onProgress}){
  function update(){
    if(COMPACT_MQ.matches){ section.style.removeProperty('height'); pinEl.style.removeProperty('height'); pinEl.style.removeProperty('transform'); return; }
    const vh=innerHeight/state.S, t=travel(vh);
    pinEl.style.height=vh+'px';
    section.style.height=(vh+t)+'px';
    const into=-section.getBoundingClientRect().top/state.S;
    const y=Math.min(t,Math.max(0,into));
    pinEl.style.transform=`translateY(${y}px)`;
    onProgress(t>0?y/t:0,vh);
  }
  addEventListener('scroll',update,{passive:true}); addEventListener('resize',update);
  COMPACT_MQ.addEventListener('change',update);
  requestAnimationFrame(update); update();
  return update;
}

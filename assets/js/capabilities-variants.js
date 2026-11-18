// Section 04 · layout explorations — ?s4=list (default) | tabs | rows | scroll
// Variants only change the desktop layout; below the compact breakpoint the stacked layout is used.
import { state, COMPACT_MQ } from './config.js';

const section=document.getElementById('capabilities');
const VARIANTS=['list','tabs','rows','scroll','stage','slides'];
const v=new URLSearchParams(location.search).get('s4');
const variant=VARIANTS.includes(v)?v:'list';

if(section){
  section.dataset.variant=variant;
  const api=section.capsApi;
  const items=[...section.querySelectorAll('.c-item')];
  const visual=section.querySelector('.c-visual');
  const pin=section.querySelector('.c-pin');
  const home=visual.parentElement, homeNext=visual.nextSibling;

  // ROWS: the visual lives inside the open row's panel (desktop); back in place on compact
  if(variant==='rows'){
    const place=()=>{
      if(COMPACT_MQ.matches){ if(visual.parentElement!==home) home.insertBefore(visual,homeNext); return; }
      const i=items.findIndex(it=>it.classList.contains('is-active'));
      const slot=items[Math.max(0,i)].querySelector('.c-panel-in');
      if(visual.parentElement!==slot) slot.appendChild(visual);
    };
    new MutationObserver(place).observe(section.querySelector('.c-list'),{subtree:true,attributes:true,attributeFilter:['class']});
    COMPACT_MQ.addEventListener('change',place); place();
  }

  // STAGE: the open capability's description sits centred under the pills
  if(variant==='stage'){
    const desc=document.createElement('p'); desc.className='c-stage-desc'; desc.setAttribute('aria-live','polite'); pin.appendChild(desc);
    const sync=()=>{const it=items.find(x=>x.classList.contains('is-active'))||items[0];
      desc.innerHTML='<span>'+it.querySelector('.c-desc').textContent+'</span>';
      desc.style.animation='none'; void desc.offsetWidth; desc.style.animation='';};
    new MutationObserver(sync).observe(section.querySelector('.c-list'),{subtree:true,attributes:true,attributeFilter:['class']}); sync();
  }

  // SLIDES: prev / next buttons + progress bars
  if(variant==='slides'&&api){
    const nav=document.createElement('div'); nav.className='c-slides-nav';
    nav.innerHTML='<button class="arrow" type="button" aria-label="Previous capability">←</button><button class="arrow" type="button" aria-label="Next capability">→</button><span class="bars" aria-hidden="true">'+items.map(()=>'<i></i>').join('')+'</span>';
    pin.appendChild(nav);
    const [prev,next]=nav.querySelectorAll('button'), bars=[...nav.querySelectorAll('.bars i')];
    prev.addEventListener('click',()=>api.open(api.active-1));
    next.addEventListener('click',()=>api.open(api.active+1));
    const sync=()=>bars.forEach((b,i)=>b.classList.toggle('on',i===api.active));
    new MutationObserver(sync).observe(section.querySelector('.c-list'),{subtree:true,attributes:true,attributeFilter:['class']}); sync();
  }

  // SCROLL: pin the content and open each capability as the section scrolls past
  if(variant==='scroll'&&api){
    api.stopAuto();
    const hint=document.createElement('span'); hint.className='c-scroll-hint'; hint.textContent='Scroll to explore ↓'; pin.appendChild(hint);
    const PIN_H=880;
    const range=()=>section.offsetHeight-PIN_H;                         // canvas px the pin travels
    function update(){
      if(COMPACT_MQ.matches){ pin.style.removeProperty('--pin'); return; }
      const top=-section.getBoundingClientRect().top/state.S;            // canvas px scrolled into the section
      const y=Math.min(range(),Math.max(0,top));
      pin.style.setProperty('--pin',y+'px');
      const p=y/range(), n=items.length;
      const i=Math.min(n-1,Math.floor(p*n));
      if(i!==api.active) api.open(i);
      items[i].style.setProperty('--item-p',Math.min(1,p*n-i).toFixed(3));
      hint.style.opacity=p>.95?0:1;
    }
    // clicking a title scrolls to that capability's part of the section
    items.forEach((it,i)=>it.querySelector('.c-trigger').addEventListener('click',()=>{
      if(COMPACT_MQ.matches) return;
      const docTop=section.getBoundingClientRect().top+scrollY;
      scrollTo({top:docTop+((i+.5)/items.length)*range()*state.S,behavior:'smooth'});
    }));
    addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();
  }
}

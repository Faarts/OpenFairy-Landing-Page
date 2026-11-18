// Section 02 · Metrics — active card switching, autoplay, count-up and scroll reveal.
// Independent of three.js, so the section still works if WebGL fails.
const section=document.getElementById('metrics');
if(section){
  const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards=[...section.querySelectorAll('.m-card')];
  const dots=[...section.querySelectorAll('.m-progress button')];
  const AUTOPLAY_MS=4500;
  let active=cards.findIndex(c=>c.classList.contains('is-active')); if(active<0) active=0;
  let hovering=false, visible=false, timer=null;

  function setActive(i){
    active=(i+cards.length)%cards.length;
    cards.forEach((c,k)=>c.classList.toggle('is-active',k===active));
    dots.forEach((d,k)=>{d.classList.toggle('on',k===active);d.setAttribute('aria-selected',k===active?'true':'false');});
  }
  function schedule(){
    clearTimeout(timer);
    if(REDUCE||hovering||!visible) return;
    timer=setTimeout(()=>{setActive(active+1);schedule();},AUTOPLAY_MS);
  }

  cards.forEach((c,i)=>{
    c.addEventListener('mouseenter',()=>{hovering=true;setActive(i);schedule();});
    c.addEventListener('focus',()=>{setActive(i);});
    c.addEventListener('click',()=>{setActive(i);});
  });
  section.querySelector('.m-cards').addEventListener('mouseleave',()=>{hovering=false;schedule();});
  dots.forEach((d,i)=>d.addEventListener('click',()=>{setActive(i);schedule();}));

  // count-up numbers (runs once, the first time the section scrolls into view)
  const nums=[...section.querySelectorAll('.m-num .n[data-value]')];
  const fmt=(v,dec)=>v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
  function countUp(){
    if(REDUCE) return;
    const t0=performance.now(), DUR=1600;
    const tick=now=>{
      const k=Math.min(1,(now-t0)/DUR), e=1-Math.pow(1-k,4);
      nums.forEach(n=>{const dec=+(n.dataset.decimals||0);n.textContent=fmt(+n.dataset.value*e,dec)+(n.dataset.suffix||'');});
      if(k<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  let revealed=false;
  new IntersectionObserver(([e])=>{
    visible=e.isIntersecting;
    if(visible&&!revealed){revealed=true;section.classList.add('in-view');countUp();}
    schedule();
  },{threshold:.18}).observe(section);   // low enough that the title shows while the section rises over the hero
}

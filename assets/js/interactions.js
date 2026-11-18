// Small interactions for sections 02–05. Mouse / pen only; nothing runs on touch or with reduced motion.
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;

if(FINE&&!REDUCE){
  // pointer position inside an element, 0…1 (works on the CSS-scaled desktop page)
  const rel=(e,el)=>{const r=el.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};

  // 1) spotlight on glass surfaces (S2 metric cards, S4 visual, S5 use-case cards, S3 diagram version)
  document.querySelectorAll('.m-card,.u-card,.c-visual,.b-diagram').forEach(el=>{
    const s=document.createElement('i'); s.className='spot'; s.setAttribute('aria-hidden','true');
    el.appendChild(s); el.classList.add('has-spot');
    el.addEventListener('pointermove',e=>{const [x,y]=rel(e,el);el.style.setProperty('--mx',(x*100).toFixed(1)+'%');el.style.setProperty('--my',(y*100).toFixed(1)+'%');});
  });

  // 2) gentle tilt toward the cursor (S2 metric cards, S5 use-case cards)
  document.querySelectorAll('.m-card,.u-card').forEach(el=>{
    const MAX=el.classList.contains('m-card')?3:4;
    el.addEventListener('pointermove',e=>{const [x,y]=rel(e,el);
      el.style.setProperty('--ry',((x-.5)*2*MAX).toFixed(2)+'deg');
      el.style.setProperty('--rx',((.5-y)*2*MAX).toFixed(2)+'deg');});
    el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});
  });

  // 3) S3 · the wing leans toward the cursor
  const bottom=document.querySelector('.s-bottom'), wing=document.querySelector('.s-figure img');
  if(bottom&&wing){
    bottom.addEventListener('pointermove',e=>{
      const f=wing.parentElement.getBoundingClientRect();
      const dx=(e.clientX-(f.left+f.width/2))/(f.width/2), dy=(e.clientY-(f.top+f.height/2))/(f.height/2);
      const cx=Math.max(-1,Math.min(1,dx)), cy=Math.max(-1,Math.min(1,dy));
      wing.style.setProperty('--gx',(cx*22).toFixed(1)+'px'); wing.style.setProperty('--gy',(cy*16).toFixed(1)+'px');
      wing.style.setProperty('--gr',(cx*5).toFixed(2)+'deg');
    });
    bottom.addEventListener('pointerleave',()=>{['--gx','--gy','--gr'].forEach(p=>wing.style.removeProperty(p));});
  }

  // 4) S4 · hovering a capability previews its scene in the visual (not for layouts where the visual follows the open row)
  const caps=document.getElementById('capabilities');
  if(caps){
    const visual=caps.querySelector('.c-visual'), triggers=[...caps.querySelectorAll('.c-trigger')];
    const restore=()=>{visual.classList.remove('peek'); if(caps.capsApi) visual.dataset.step=String(caps.capsApi.active+1);};
    triggers.forEach((t,i)=>{
      t.addEventListener('mouseenter',()=>{
        if(['rows','slides'].includes(caps.dataset.variant)||!caps.capsApi||i===caps.capsApi.active) return;
        visual.dataset.step=String(i+1); visual.classList.add('peek');
      });
      t.addEventListener('mouseleave',restore);
      t.addEventListener('click',()=>visual.classList.remove('peek'));
    });
  }
}

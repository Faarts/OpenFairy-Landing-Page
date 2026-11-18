// Sections 06 · Membership and 07 · Get Started.
// - S6: the member pass "connects" once the section is in view; perk tags drift with the pointer; ribbons speed up with scroll.
// - S7: the console walks through model → key → request; hovering a row holds it; a soft light follows the pointer.
// Mouse / pen only for pointer effects; reduced motion shows the finished states without animation.
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const once=(el,fn,threshold=.35)=>{const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();fn();}},{threshold});io.observe(el);};
const type=(el,text,ms=38)=>new Promise(res=>{let i=0;const t=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length){clearInterval(t);res();}},ms);});

/* ---------------- 06 · Membership ---------------- */
const mem=document.getElementById('membership');
if(mem){
  const pass=mem.querySelector('.mem-pass'), addr=mem.querySelector('.mem-addr-v');
  const connect=async()=>{
    pass.dataset.state='busy';
    if(!REDUCE) await new Promise(r=>setTimeout(r,900));
    pass.dataset.state='on';
    mem.querySelectorAll('.m-v').forEach(v=>{v.textContent=v.dataset.on;});
    if(REDUCE) addr.textContent=addr.dataset.addr; else await type(addr,addr.dataset.addr,55);
  };
  if(REDUCE) connect(); else once(mem.querySelector('.mem-stage'),()=>setTimeout(connect,500));

  if(FINE&&!REDUCE){
    const stage=mem.querySelector('.mem-stage'), perks=[...mem.querySelectorAll('.mem-perk')];
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      perks.forEach(p=>{const d=+p.dataset.depth||1;p.style.setProperty('--px',(-x*28*d).toFixed(1)+'px');p.style.setProperty('--py',(-y*22*d).toFixed(1)+'px');});
      const pr=pass.getBoundingClientRect(), px=(e.clientX-pr.left)/pr.width-.5, py=(e.clientY-pr.top)/pr.height-.5;
      pass.style.setProperty('--ry',(Math.max(-.5,Math.min(.5,px))*10).toFixed(2)+'deg');
      pass.style.setProperty('--rx',(Math.max(-.5,Math.min(.5,-py))*10).toFixed(2)+'deg');
    });
    stage.addEventListener('pointerleave',()=>{perks.forEach(p=>{p.style.removeProperty('--px');p.style.removeProperty('--py');});pass.style.removeProperty('--rx');pass.style.removeProperty('--ry');});
  }

  // ribbons: scroll nudges the tracks (front with the scroll, back against it)
  if(!REDUCE){
    const tracks=[...mem.querySelectorAll('.mem-track')];
    let raf=0;
    const upd=()=>{raf=0;const r=mem.getBoundingClientRect();const k=(innerHeight-r.top)*.25;
      tracks[0].style.setProperty('--shift',(k).toFixed(1)+'px');tracks[1].style.setProperty('--shift',(-k).toFixed(1)+'px');};
    addEventListener('scroll',()=>{if(!raf) raf=requestAnimationFrame(upd);},{passive:true}); upd();
  }
}

/* ---------------- 07 · Get started ---------------- */
const gs=document.getElementById('get-started');
if(gs){
  const con=gs.querySelector('.gs-console'), chips=[...gs.querySelectorAll('.gs-chip')];
  const keyEl=gs.querySelector('.gs-key-v'), modelEl=gs.querySelector('.gs-code-model'), codeKey=gs.querySelector('.gs-code-key');
  let step=1, mi=chips.findIndex(c=>c.classList.contains('on')), held=false, timer=0, keyed=false;
  const pick=i=>{mi=i;chips.forEach((c,j)=>c.classList.toggle('on',j===i));modelEl.textContent='"'+chips[i].dataset.model+'"';};
  const set=async s=>{
    step=s; con.dataset.step=String(s);
    if(s===1&&!REDUCE) pick((mi+1)%chips.length);
    if(s===2&&!keyed){keyed=true; if(REDUCE) keyEl.textContent=keyEl.dataset.key; else await type(keyEl,keyEl.dataset.key,30);}
    if(s===3) codeKey.textContent=keyEl.dataset.key;
  };
  const loop=()=>{clearTimeout(timer); timer=setTimeout(()=>{if(!held) set(step%3+1); loop();},2600);};
  if(REDUCE){keyEl.textContent=keyEl.dataset.key;codeKey.textContent=keyEl.dataset.key;con.dataset.step='3';}
  else once(gs,()=>{set(1);loop();},.3);

  if(FINE&&!REDUCE){
    gs.querySelectorAll('.gs-row').forEach(row=>{
      row.addEventListener('mouseenter',()=>{held=true;set(+row.dataset.row);});
      row.addEventListener('mouseleave',()=>{held=false;loop();});
    });
    chips.forEach((c,i)=>c.addEventListener('mouseenter',()=>pick(i)));
    const panel=gs.querySelector('.gs-panel');
    panel.addEventListener('pointermove',e=>{const r=panel.getBoundingClientRect();
      panel.style.setProperty('--gx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');panel.style.setProperty('--gy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');});
  }
}

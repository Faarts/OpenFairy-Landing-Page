// Section 04 · Capabilities
// 1) Accordion: one capability open at a time. Autoplays (with a timer line) while the section is
//    on screen; any click hands control to the visitor and stops autoplay.
// 2) The visual on the right swaps to the scene for the open capability (data-step → [data-scene]).
// 3) Each scene has its own small live loop, running only while that scene is showing:
//    1 · "In use" badge moves between providers      2 · model name in the SDK snippet cycles
//    3 · router console switches the active route    4 · request log streams new rows
const section=document.getElementById('capabilities');
if(section){
  const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list=section.querySelector('.c-list');
  const items=[...list.querySelectorAll('.c-item')];
  const visual=section.querySelector('.c-visual');
  const scenes=[...visual.querySelectorAll('.c-scene')];
  const AUTOPLAY_MS=6000;
  list.style.setProperty('--c-dur',AUTOPLAY_MS+'ms');
  let active=0, auto=!REDUCE, visible=false, timer=null, loop=null;
  const pick=a=>a[Math.floor(Math.random()*a.length)];

  // short "decoding" text swap (Figma note on Route Row: "cycles … with decoding text")
  const GLYPHS='abcdefghijklmnopqrstuvwxyz0123456789-./';
  function decode(el,text,ms=380){
    if(REDUCE){el.textContent=text;return;}
    const t0=performance.now();
    (function f(now){
      const k=Math.min(1,(now-t0)/ms), n=Math.floor(text.length*k);
      el.textContent=text.slice(0,n)+[...text.slice(n)].map(c=>c===' '||c==='"'?c:pick(GLYPHS)).join('');
      if(k<1) requestAnimationFrame(f);
    })(t0);
  }

  // ---- scene loops ----
  const loops={
    1(){ // provider badge
      const rows=[...visual.querySelectorAll('.c-row')], label=r=>r.querySelector('.c-status-t');
      let u=rows.findIndex(r=>r.classList.contains('is-use'));
      return setInterval(()=>{
        rows[u].classList.remove('is-use'); label(rows[u]).textContent='Connected';
        u=(u+1+Math.floor(Math.random()*(rows.length-1)))%rows.length;
        rows[u].classList.add('is-use'); label(rows[u]).textContent='In use';
      },2600);
    },
    2(){ // model name in the SDK snippet
      const el=visual.querySelector('[data-cycle]'), names=el.dataset.cycle.split('|'); let i=0;
      return setInterval(()=>{i=(i+1)%names.length;decode(el,'"'+names[i]+'"');},1800);
    },
    3(){ // router console: active route
      const rows=[...visual.querySelectorAll('[data-scene="3"] .c-route')];
      const target=visual.querySelector('.c-route-target'), req=visual.querySelector('.c-req');
      let i=rows.findIndex(r=>r.classList.contains('is-on'));
      return setInterval(()=>{
        rows[i].classList.remove('is-on');
        i=(i+1)%rows.length; const r=rows[i]; r.classList.add('is-on');
        decode(target,'"'+r.querySelector('.c-route-model').textContent.split(' / ')[1]+'"');
        decode(r.querySelector('.c-route-lat'),(180+Math.floor(Math.random()*480))+' ms');
        decode(req,'REQ_0X'+Math.floor(Math.random()*0xFFFF).toString(16).toUpperCase().padStart(4,'0'));
      },2200);
    },
    4(){ // request log
      const ol=visual.querySelector('.c-log-rows');
      const models=['openai/gpt-4.1','claude/claude-sonnet','deepseek/deepseek-v3','gemini/gemini-2.5','qwen/qwen-max','chatglm/glm-4','doubao/doubao-pro'];
      const two=n=>String(n).padStart(2,'0'); let t=12*3600+4*60+31;
      return setInterval(()=>{
        t+=1+Math.floor(Math.random()*2);
        const ts=`${two(Math.floor(t/3600))}:${two(Math.floor(t/60)%60)}:${two(t%60)}`;
        const limited=Math.random()<.12;
        const li=document.createElement('li');
        li.innerHTML=limited
          ?`<span>${ts}</span><span class="warn">429</span><span>production · rate limit</span><span>—</span>`
          :`<span>${ts}</span><span class="ok">200</span><span>${pick(models)}</span><span>${180+Math.floor(Math.random()*480)} ms</span>`;
        ol.prepend(li); while(ol.children.length>4) ol.lastElementChild.remove();
      },1600);
    },
  };
  function runScene(){
    clearInterval(loop); loop=null;
    if(visible&&!REDUCE) loop=loops[active+1]();
  }

  function open(i){
    active=(i+items.length)%items.length;
    items.forEach((it,k)=>{
      const on=k===active;
      it.classList.toggle('is-active',on);
      it.querySelector('.c-trigger').setAttribute('aria-expanded',on?'true':'false');
    });
    visual.dataset.step=String(active+1);
    scenes.forEach(sc=>{const on=sc.dataset.scene===String(active+1);sc.toggleAttribute('inert',!on);sc.setAttribute('aria-hidden',on?'false':'true');});
    runScene();
    // restart the timer-line animation on the newly active item
    list.classList.remove('is-auto'); void list.offsetWidth;
    if(auto&&visible) list.classList.add('is-auto');
  }
  function schedule(){
    clearTimeout(timer);
    list.classList.toggle('is-auto',auto&&visible);
    if(auto&&visible) timer=setTimeout(()=>{open(active+1);schedule();},AUTOPLAY_MS);
  }
  items.forEach((it,i)=>it.querySelector('.c-trigger').addEventListener('click',()=>{
    auto=false; clearTimeout(timer); open(i);
  }));
  // pause autoplay while the visitor is reading the list or the visual
  [list,visual].forEach(el=>{
    el.addEventListener('mouseenter',()=>{if(auto){clearTimeout(timer);list.classList.remove('is-auto');}});
    el.addEventListener('mouseleave',()=>{if(auto){open(active);schedule();}});
  });

  open(0);
  // used by capabilities-variants.js (layout explorations)
  section.capsApi={
    open(i){auto=false;clearTimeout(timer);list.classList.remove('is-auto');open(i);},
    get active(){return active;},
    stopAuto(){auto=false;clearTimeout(timer);list.classList.remove('is-auto');},
  };
  new IntersectionObserver(([e])=>{
    visible=e.isIntersecting;
    schedule(); runScene();
  },{threshold:.3}).observe(section);
}

// Section 05 · layouts — ?s5=panels (default) | rail | rows | bento | carousel | stack | split | hscroll
import { COMPACT_MQ, state } from './config.js';
import { pin } from './pin.js';
const section=document.getElementById('use-cases');
const VARIANTS=['panels','rail','rows','bento','carousel','stack','split','hscroll'];
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const v=new URLSearchParams(location.search).get('s5');
// pinned (scroll-driven) layouts fall back to the card rail for reduced motion
const PINNED=['stack','split','hscroll','panels'];
const want=VARIANTS.includes(v)?v:'panels';
const variant=REDUCE&&PINNED.includes(want)?'rail':want;
if(section){
  section.dataset.variant=variant;

  const title=section.querySelector('.u-title'), rail=section.querySelector('.u-rail'), list=section.querySelector('.u-cards');
  const cards=[...section.querySelectorAll('.u-card')];
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  if(PINNED.includes(variant)) section.classList.add('in-view');      // tall section: reveal immediately

  // wrap title + cards in a pin element (display:contents unless the desktop variant styles it)
  function wrapPin(){
    const w=document.createElement('div'); w.className='u-pin';
    title.before(w); w.append(title,rail,list); return w;
  }

  // STACK: cards slide up and stack on top of each other while the section is pinned
  if(variant==='stack'){
    const w=wrapPin();
    pin(section,w,{travel:vh=>vh*.85*(cards.length-1),onProgress:p=>{
      const n=cards.length-1, e=cards.map((_,k)=>k===0?1:clamp(p*n-(k-1)));
      cards.forEach((c,k)=>{
        if(COMPACT_MQ.matches){c.style.removeProperty('translate');c.style.removeProperty('scale');c.style.removeProperty('--dim');return;}
        const above=e.slice(k+1).reduce((a,b)=>a+b,0);          // how much is stacked on top of this card
        c.style.translate=`0 ${((1-e[k])*560+k*16).toFixed(1)}px`;
        c.style.scale=String((1-.04*above).toFixed(4));
        c.style.setProperty('--dim',Math.min(.5,above*.18).toFixed(3));
      });
    }});
  }

  // HSCROLL: vertical scroll drives the card row sideways while pinned
  if(variant==='hscroll'){
    const w=wrapPin();
    const bar=document.createElement('div'); bar.className='u-h-bar'; bar.setAttribute('aria-hidden','true'); bar.innerHTML='<i></i>'; w.appendChild(bar);
    const dist=()=>Math.max(0,list.scrollWidth-list.clientWidth);
    pin(section,w,{travel:()=>dist()*1.2,onProgress:p=>{
      list.style.transform=COMPACT_MQ.matches?'':`translateX(${(-p*dist()).toFixed(1)}px)`;
      bar.style.setProperty('--p',p.toFixed(4));
    }});
  }

  // SPLIT: preview stage pinned on the left while the use cases scroll on the right
  if(variant==='split'){
    const split=document.createElement('div'); split.className='u-split';
    const stage=document.createElement('div'); stage.className='u-stage'; stage.setAttribute('aria-hidden','true');
    list.before(split); split.append(stage,list);
    cards.forEach((c,i)=>{const viz=c.querySelector('.u-viz'); viz.dataset.n=String(i+1); stage.appendChild(viz);});   // move (keeps live loops)
    const vizzes=[...stage.querySelectorAll('.u-viz')];
    const restore=()=>cards.forEach((c,i)=>{if(vizzes[i].parentElement!==c) c.insertBefore(vizzes[i],c.querySelector('.u-name'));});
    const toStage=()=>vizzes.forEach(v=>{if(v.parentElement!==stage) stage.appendChild(v);});
    let active=-1;
    function update(){
      if(COMPACT_MQ.matches){restore();stage.style.removeProperty('transform');cards.forEach(c=>c.classList.remove('is-on'));active=-1;return;}
      toStage();
      const S=state.S, vh=innerHeight;
      const sr=split.getBoundingClientRect(), stH=stage.offsetHeight;
      const y=clamp((vh/2-stH*S/2-sr.top)/S,0,split.offsetHeight-stH);   // keep the stage centred on screen within the split area
      stage.style.transform=`translateY(${y}px)`;
      let best=0,bd=1e9; cards.forEach((c,i)=>{const r=c.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-vh/2);if(d<bd){bd=d;best=i;}});
      if(best!==active){active=best;cards.forEach((c,i)=>c.classList.toggle('is-on',i===best));vizzes.forEach((v,i)=>v.classList.toggle('is-on',i===best));}
    }
    addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); COMPACT_MQ.addEventListener('change',update); update();
  }

  // PANELS (agenciex-style): full-height split panels; each pins and the next slides over it.
  // Left: heading + copy. Right: a product window built for each use case (desktop only; compact keeps the cards).
  if(variant==='panels'){
    const TITLES=[['AI Application','Development.'],['Agents and','Automated Workflows.'],['AI Coding and','Developer Tools.'],['Teams and','Multiple Projects.']];
    const TAGS=[['models.svg','Apps & products'],['tokens.svg','Agents & workflows'],['&lt;/&gt;','Custom API tools'],['members.svg','Teams & projects']];
    const ICON='<img class="w-ico" src="assets/images/logo/icon-dark.svg" alt="" width="16" height="16">';
    const P='assets/images/providers/';
    const SCENES=[
      // 01 · an AI app answering in real time
      `<div class="u-win w-chat">
        <div class="w-bar">${ICON}<span>Feedback Assistant</span><em><i class="live"></i>deepseek-v3</em></div>
        <div class="w-body">
          <div class="w-msg me">Summarize this week’s customer feedback.</div>
          <div class="w-msg ai"><span class="w-who">${ICON}OpenFairy · deepseek-v3</span><p class="w-stream"></p>
            <span class="w-meta"><span>1.2s</span><span>412 tokens</span><span>$0.0004</span></span></div>
          <div class="w-input"><span>Ask about feedback, docs or tickets…</span><b>↑</b></div>
        </div></div>`,
      // 02 · an agent run: your orchestration, OpenFairy model calls
      `<div class="u-win w-run">
        <div class="w-bar">${ICON}<span>market-brief · run 2048</span><em class="w-run-state">running</em></div>
        <div class="w-body">
          <ol class="w-steps">
            <li><i></i><b>Trigger</b><span class="own">Your code</span><em>cron · 09:00</em><time>0.1s</time></li>
            <li><i></i><b>Research</b><span class="of">OpenFairy</span><em>claude-sonnet</em><time>4.8s</time></li>
            <li><i></i><b>Analyze</b><span class="of">OpenFairy</span><em>gpt-4.1</em><time>3.2s</time></li>
            <li><i></i><b>Act</b><span class="own">Your code</span><em>post to #research</em><time>0.4s</time></li>
          </ol>
          <div class="w-out"><span>Output</span><p>Weekly brief · 3 competitors · 12 sources</p><b>Sent ✓</b></div>
        </div></div>`,
      // 03 · a coding tool pointed at OpenFairy as a custom provider
      `<div class="u-win w-ide">
        <div class="w-bar">${ICON}<span>settings.json</span><em>custom API</em></div>
        <div class="w-body">
<pre class="w-code"><span class="cm">// any tool that accepts a custom OpenAI-compatible API</span>
{
  <span class="k">"provider"</span>: <span class="str">"openai-compatible"</span>,
  <span class="k">"apiBase"</span>:  <span class="str">"https://api.openfairy.ai/v1"</span>,
  <span class="k">"apiKey"</span>:   <span class="str">"$OPENFAIRY_API_KEY"</span>,
  <span class="k">"model"</span>:    <span class="str w-model">"deepseek-v3"</span><i class="u-caret"></i>
}</pre>
          <div class="w-pick">
            <span class="w-pick-h">Model</span>
            <div class="w-opt" data-m="deepseek-v3"><img src="${P}deepseek.svg" alt=""><em>deepseek-v3</em><small>Refactors</small></div>
            <div class="w-opt" data-m="claude-sonnet"><img src="${P}claude.svg" alt=""><em>claude-sonnet</em><small>Code review</small></div>
            <div class="w-opt" data-m="gpt-4.1"><img src="${P}openai.svg" alt=""><em>gpt-4.1</em><small>Tests</small></div>
            <div class="w-opt" data-m="qwen-max"><img src="${P}qwen.svg" alt=""><em>qwen-max</em><small>Docs</small></div>
          </div>
        </div></div>`,
      // 04 · keys, limits and a shared request log
      `<div class="u-win w-team">
        <div class="w-bar">${ICON}<span>Projects</span><em>3 keys active</em></div>
        <div class="w-body">
          <div class="w-proj"><b>chat-app</b><code>of-••••a91f</code><span class="w-lim"><i style="--w:72%"></i></span><small>$72 / $100</small></div>
          <div class="w-proj"><b>research-agent</b><code>of-••••7c2e</code><span class="w-lim"><i style="--w:48%"></i></span><small>$24 / $50</small></div>
          <div class="w-proj"><b>internal-tools</b><code>of-••••04bd</code><span class="w-lim"><i style="--w:26%"></i></span><small>$13 / $50</small></div>
          <div class="w-log"><span class="w-log-h">Request log</span><ul></ul></div>
        </div></div>`
    ];
    const wrap=document.createElement('div'); wrap.className='u-panels';
    cards.forEach((c,i)=>{
      const [a,b]=TITLES[i]||[c.querySelector('.u-name').textContent,''], [icon,label]=TAGS[i];
      const p=document.createElement('article'); p.className='u-panel'; p.dataset.n=String(i+1);
      p.innerHTML=`<div class="u-pl"><div class="u-pc">
          <span class="u-pidx">${String(i+1).padStart(2,'0')}</span>
          <div class="u-ph"><h3>${a} <b>${b}</b></h3><span class="u-arrow" aria-hidden="true">↘</span></div>
          <p class="u-pd">${c.querySelector('.u-desc').textContent}</p>
          <a class="btn dark u-pbtn" href="#">Launch Platform <span class="ar">→</span></a>
        </div></div>
        <div class="u-pr" aria-hidden="true">${SCENES[i]||''}
          <div class="u-ptag">${icon.endsWith('.svg')?`<img src="assets/images/metrics/${icon}" alt="" width="40" height="40">`:`<span class="glyph">${icon}</span>`}<span>${label}</span></div>
        </div>`;
      wrap.appendChild(p);
    });
    list.after(wrap);
    const panels=[...wrap.querySelectorAll('.u-panel')];
    function update(){
      if(COMPACT_MQ.matches){wrap.style.removeProperty('--ph');panels.forEach(p=>{p.style.removeProperty('transform');p.style.removeProperty('--cover');});return;}
      const S=state.S, ph=clamp(innerHeight/S,720,1000), n=panels.length;
      wrap.style.setProperty('--ph',ph+'px');
      const into=-wrap.getBoundingClientRect().top/S;
      panels.forEach((p,i)=>{
        const y=clamp(into-i*ph,0,(n-1-i)*ph);                 // stick at the top until the section ends
        p.style.transform=`translateY(${y.toFixed(1)}px)`;
        p.style.setProperty('--cover',i<n-1?clamp((into-i*ph)/ph).toFixed(3):'0');   // how far the next panel has covered it
      });
    }
    addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); COMPACT_MQ.addEventListener('change',update); update();

    // live loops — only tick while the section is on screen and the page is visible
    let on=false; new IntersectionObserver(es=>{on=es[0].isIntersecting;},{threshold:0}).observe(wrap);
    const every=(ms,fn)=>setInterval(()=>{if(on&&!document.hidden&&!COMPACT_MQ.matches) fn();},ms);
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));

    // 01 · streamed answer
    (async()=>{
      const out=panels[0].querySelector('.w-stream'), meta=panels[0].querySelector('.w-meta');
      const TEXT='Three themes stood out this week:\n• Faster exports — 38 mentions\n• Shared workspaces — 21 mentions\n• Clearer usage pricing — 14 mentions';
      for(;;){
        while(!on||document.hidden||COMPACT_MQ.matches) await sleep(400);
        out.textContent=''; meta.classList.remove('on'); out.classList.add('typing');
        for(let i=1;i<=TEXT.length;i++){out.textContent=TEXT.slice(0,i); await sleep(TEXT[i-1]==='\n'?220:22);}
        out.classList.remove('typing'); meta.classList.add('on'); await sleep(4200);
      }
    })();

    // 02 · agent run walks through its steps
    {const steps=[...panels[1].querySelectorAll('.w-steps li')], st=panels[1].querySelector('.w-run-state'), runEl=panels[1].querySelector('.w-run');
     let k=0; const paint=()=>{steps.forEach((s,i)=>{s.className=i<k?'done':i===k?'run':'';});
       const done=k>=steps.length; runEl.classList.toggle('is-done',done); st.textContent=done?'completed':'running';};
     paint(); every(1300,()=>{k=k>steps.length?0:k+1; paint();});}

    // 03 · model picker drives the config
    {const opts=[...panels[2].querySelectorAll('.w-opt')], m=panels[2].querySelector('.w-model'); let k=0;
     const pick=i=>{k=i;opts.forEach((o,j)=>o.classList.toggle('on',j===i)); m.textContent='"'+opts[i].dataset.m+'"';};
     pick(0); every(2200,()=>pick((k+1)%opts.length));
     opts.forEach((o,i)=>o.addEventListener('mouseenter',()=>pick(i)));}

    // 04 · request log streams in
    {const ul=panels[3].querySelector('.w-log ul');
     const PROJ=['chat-app','research-agent','internal-tools'], MOD=['deepseek-v3','claude-sonnet','gpt-4.1','qwen-max'];
     let t=new Date(2026,0,1,12,4,20);
     const add=()=>{t=new Date(t.getTime()+1000+Math.random()*3000);
       const li=document.createElement('li'); const ms=Math.round(180+Math.random()*600);
       li.innerHTML=`<time>${t.toTimeString().slice(0,8)}</time><b>${PROJ[Math.floor(Math.random()*3)]}</b><em>${MOD[Math.floor(Math.random()*4)]}</em><span>200</span><small>${ms}ms</small>`;
       ul.prepend(li); while(ul.children.length>4) ul.lastElementChild.remove();};
     for(let i=0;i<4;i++) add(); every(1600,add);}
  }

  if(variant==='carousel'){
    const track=section.querySelector('.u-cards');
    const nav=document.createElement('div'); nav.className='u-car-nav';
    nav.innerHTML='<button type="button" aria-label="Previous use case">←</button><button type="button" aria-label="Next use case">→</button>';
    section.appendChild(nav);
    const bar=document.createElement('div'); bar.className='u-car-bar'; bar.setAttribute('aria-hidden','true'); bar.innerHTML='<i></i>';
    track.after(bar);
    const [prev,next]=nav.querySelectorAll('button'), thumb=bar.querySelector('i');
    const step=()=>track.querySelector('.u-card').offsetWidth+16;
    prev.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
    next.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));
    function sync(){
      const max=track.scrollWidth-track.clientWidth, p=max>0?track.scrollLeft/max:0, w=track.clientWidth/track.scrollWidth;
      thumb.style.setProperty('--w',(w*100).toFixed(2)+'%');
      thumb.style.setProperty('--x',(p*(1/w-1)*100).toFixed(2)+'%');
      prev.disabled=track.scrollLeft<4; next.disabled=track.scrollLeft>max-4;
    }
    track.addEventListener('scroll',sync,{passive:true}); addEventListener('resize',sync); sync();

    // drag to scroll (mouse / pen); touch uses native scrolling
    let down=false, sx=0, sl=0, moved=false;
    track.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||COMPACT_MQ.matches)return;down=true;moved=false;sx=e.clientX;sl=track.scrollLeft;});
    addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;track.classList.add('dragging');}
      track.scrollLeft=sl-dx/(track.getBoundingClientRect().width/track.offsetWidth);});
    addEventListener('pointerup',()=>{if(!down)return;down=false;track.classList.remove('dragging');
      if(moved){const s=step();track.scrollTo({left:Math.round(track.scrollLeft/s)*s,behavior:'smooth'});}});
  }
}

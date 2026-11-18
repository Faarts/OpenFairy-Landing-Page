// Section 05 · layout explorations — ?s5=rail (default) | rows | bento | carousel
import { COMPACT_MQ, state } from './config.js';
import { pin } from './pin.js';
const section=document.getElementById('use-cases');
const VARIANTS=['rail','rows','bento','carousel','stack','split','hscroll','panels'];
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const v=new URLSearchParams(location.search).get('s5');
// pinned (scroll-driven) layouts fall back to the default for reduced motion
const PINNED=['stack','split','hscroll','panels'];
const variant=VARIANTS.includes(v)&&!(REDUCE&&PINNED.includes(v))?v:'rail';
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

  // PANELS (agenciex-style): full-height split panels; each pins and the next slides over it
  if(variant==='panels'){
    const TITLES=[['AI Application','Development.'],['Agents and','Automated Workflows.'],['AI Coding and','Developer Tools.'],['Teams and','Multiple Projects.']];
    const TAGS=[['models.svg','Apps & products'],['tokens.svg','Agents & workflows'],['&lt;/&gt;','Custom API tools'],['members.svg','Teams & projects']];
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
        <div class="u-pr"><div class="u-pcard"></div>
          <div class="u-ptag" aria-hidden="true">${icon.endsWith('.svg')?`<img src="assets/images/metrics/${icon}" alt="" width="40" height="40">`:`<span class="glyph">${icon}</span>`}<span>${label}</span></div>
        </div>`;
      wrap.appendChild(p);
    });
    list.after(wrap);
    const panels=[...wrap.querySelectorAll('.u-panel')], slots=panels.map(p=>p.querySelector('.u-pcard'));
    const vizzes=cards.map(c=>c.querySelector('.u-viz'));
    const toPanels=()=>vizzes.forEach((v,i)=>{if(v.parentElement!==slots[i]) slots[i].appendChild(v);});
    const toCards=()=>vizzes.forEach((v,i)=>{if(v.parentElement!==cards[i]) cards[i].insertBefore(v,cards[i].querySelector('.u-name'));});
    function update(){
      if(COMPACT_MQ.matches){toCards();wrap.style.removeProperty('--ph');panels.forEach(p=>{p.style.removeProperty('transform');p.style.removeProperty('--cover');});return;}
      toPanels();
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

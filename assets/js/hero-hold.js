// Hero → Section 02 transition (desktop only, not with reduced motion). ?hero=sheet (default) | off
//   sheet — the hero pins and holds while the wing scatters, then Section 02 rises over it like a sheet.
// Translate-based (position:sticky doesn't work inside the scaled #page). All values are canvas px (÷ state.S).
import { state, COMPACT_MQ, REDUCE } from './config.js';

const FX=(()=>{const v=new URLSearchParams(location.search).get('hero');return ['sheet','off'].includes(v)?v:'sheet';})();
const art=document.getElementById('art'), next=document.getElementById('metrics'), root=document.documentElement;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), ease=t=>t*t*(3-2*t);
let on=false;

function reset(){
  on=false; root.classList.remove('hero-hold'); delete root.dataset.heroFx;
  art.style.removeProperty('margin-bottom'); art.style.removeProperty('transform'); art.style.removeProperty('visibility');
  ['--hp','--hc'].forEach(p=>{art.style.removeProperty(p);next.style.removeProperty(p);});
  state.scrollBlast=0; state.heroCovered=false;
}
function setMargin(mb){mb=Math.max(0,Math.round(mb))+'px'; if(art.style.marginBottom!==mb) art.style.marginBottom=mb;}

// SHEET: pin → hold (wing scatters) → Section 02 slides over the hero
function sheet(S,vh,AH){
  const hold=Math.round(vh*.8); setMargin(hold);
  const off=Math.max(0,AH-vh), e=scrollY/S-off;             // a hero taller than the viewport pins at its bottom edge
  const y=clamp(e,0,hold+vh), p1=clamp(e/hold), p2=clamp((e-hold)/vh);
  art.style.transform=y>0?`translate3d(0,${y.toFixed(1)}px,0) scale(${(1-.07*p2).toFixed(4)})`:'';
  art.style.setProperty('--hp',p1.toFixed(3)); art.style.setProperty('--hc',p2.toFixed(3)); next.style.setProperty('--hc',p2.toFixed(3));
  state.scrollBlast=ease(p1)*.9; state.heroCovered=p2>=1;
  art.style.visibility=p2>=1?'hidden':'';
}

function update(){
  if(!art||!next) return;
  if(FX==='off'||COMPACT_MQ.matches||REDUCE){ if(on) reset(); return; }
  if(!on){ on=true; root.classList.add('hero-hold'); root.dataset.heroFx=FX; }
  const S=state.S, vh=innerHeight/S, AH=state.H;
  sheet(S,vh,AH);
}
addEventListener('scroll',update,{passive:true});
addEventListener('resize',update);
COMPACT_MQ.addEventListener('change',update);
new ResizeObserver(update).observe(document.getElementById('page'));
update();

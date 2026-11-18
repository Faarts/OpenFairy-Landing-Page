// Floating navigation: once the page scrolls, a copy of the hero nav stays pinned at the top on every section
// (on a glass bar so it reads on light, dark and orange sections). Links scroll to their section and the
// current section's link is highlighted. #fnav lives outside the scaled #page and is scaled with --s on desktop.
import { state } from './config.js';

const root=document.documentElement, fnav=document.getElementById('fnav'), art=document.getElementById('art');
const SHOW=80;                                                // px scrolled before the floating nav appears
const links=[...document.querySelectorAll('a[data-to]')];
const targets=['top','metrics','capabilities','get-started'];  // in page order

// document y of an element inside #page (transforms such as the hero transition are ignored on purpose)
const docY=id=>{ if(id==='top') return 0; const el=document.getElementById(id); if(!el) return 0;
  let y=0; for(let n=el;n&&n.id!=='page';n=n.offsetParent) y+=n.offsetTop; return y*state.S; };

links.forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  const id=a.dataset.to; let y=docY(id);
  if(id!=='top') y-=(state.compact?72:0);                    // compact sections start at their title; leave room for the bar
  y=Math.max(0,y);
  if(window.lenis) window.lenis.scrollTo(y,{duration:1.8,easing:t=>1-Math.pow(1-t,4)});
  else scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}));

let cur='';
function update(){
  const show=scrollY>SHOW&&art.classList.contains('ready');
  root.classList.toggle('nav-float',show); fnav.inert=!show;
  // active link: the last section whose top has passed 40% of the viewport
  const probe=scrollY+innerHeight*.4; let act='top';
  targets.forEach(id=>{ if(id!=='top'&&docY(id)<=probe) act=id; });
  if(act!==cur){ cur=act; links.forEach(a=>a.classList.toggle('on',a.dataset.to===act&&a.closest('.links'))); }
}
addEventListener('scroll',update,{passive:true}); addEventListener('resize',update);
new MutationObserver(update).observe(art,{attributes:true,attributeFilter:['class']});   // hero becomes .ready after the intro
update();

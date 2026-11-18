// Preloader counter → intro reveal
import { REDUCE, RENDER, state } from './config.js';

const art=document.getElementById('art');
const pre=document.getElementById('pre'), cnt=document.getElementById('count'), scan=document.getElementById('scan');
if(!RENDER) document.documentElement.classList.add('is-loading'); // lock scroll until the hero is revealed
const wordsEl=[...pre.querySelectorAll('.words span')];
const t0=performance.now(); const PRE=REDUCE?200:1900;
function preTick(now){
  if(RENDER){pre.classList.add('gone');pre.style.display='none';state.introT=performance.now()-6000;document.querySelectorAll('#art > :not(#gl)').forEach(e=>e.style.visibility='hidden');return;}
  const k=Math.min(1,(now-t0)/PRE); const e=1-Math.pow(1-k,3);
  cnt.textContent=String(Math.round(e*100)).padStart(3,'0');
  scan.style.top=(e*900)+'px';
  wordsEl.forEach((w,i)=>w.classList.toggle('on',e>=(i+1)/3.2));
  if(k<1) requestAnimationFrame(preTick);
  else{ setTimeout(()=>{pre.classList.add('gone');document.documentElement.classList.remove('is-loading');art.classList.add('ready');state.introT=performance.now();},250); }
}
requestAnimationFrame(preTick);

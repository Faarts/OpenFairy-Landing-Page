// Pointer tracking, custom cursor and HUD elements
import { W, H } from './config.js';
import { state } from './config.js';
import { art } from './renderer.js';

const ptr={x:W*.62,y:H*.5,tx:W*.62,ty:H*.5,in:false,down:false,downT:0};
const cur=document.getElementById('cur'), curT=document.getElementById('curT'), ring=document.getElementById('ring');
const coord=document.getElementById('coord'), stateEl=document.getElementById('state');
function toArt(e){const r=art.getBoundingClientRect();return [(e.clientX-r.left)/state.S,(e.clientY-r.top)/state.S];}
art.addEventListener('pointermove',e=>{const [x,y]=toArt(e);ptr.tx=x;ptr.ty=y;ptr.in=true;cur.classList.toggle('link',!!e.target.closest('a,button'));});
art.addEventListener('pointerleave',()=>{ptr.in=false;ptr.down=false;});
art.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;ptr.down=true;ptr.downT=performance.now();art.setPointerCapture?.(e.pointerId);});
addEventListener('pointerup',()=>{ptr.down=false;});
art.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault();});

export { ptr, cur, curT, ring, coord, stateEl };

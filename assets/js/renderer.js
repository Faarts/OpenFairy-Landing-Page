// WebGL renderer, artboard fitting, scene, camera and lights
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, H, SMAX, HMAX, RENDER, state, COMPACT_MQ } from './config.js';

export const art=document.getElementById('art');

const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.NoToneMapping;
renderer.setSize(W,H,false);
// Desktop (≥ BREAKPOINT): the 1440px design canvas is scaled to the viewport width.
// Compact (< BREAKPOINT): the page is fluid (see responsive.css); the hero scene is sized to the hero
// element and the wing is centred on the .wing-slot placeholder.
const page=document.getElementById('page'), stage=document.getElementById('stage');
const slot=document.querySelector('.wing-slot');
let camera=null;   // assigned below; fit() runs again once it exists
// Render resolution: capped at 1.5 device px per CSS px (the glass uses a transmission pass, which redraws the
// scene every frame), times an adaptive factor that main.js lowers when frames run slow.
const PR_MAX=1.5;
export const quality={k:1,apply(){renderer.setPixelRatio(RENDER?2:Math.max(.5,Math.min(PR_MAX,devicePixelRatio*state.S)*this.k));renderer.setSize(state.W,state.H,false);}};
function fit(){
  const compact=state.compact=COMPACT_MQ.matches;
  document.documentElement.classList.toggle('is-compact',compact);
  const root=document.documentElement;
  if(compact){
    state.S=1; page.style.transform=''; page.style.width='';
    state.bleed=state.vpad=0; ['--s','--cw','--ah','--bleed','--vpad'].forEach(p=>root.style.removeProperty(p)); root.classList.remove('is-wide');
    state.W=Math.max(1,art.clientWidth); state.H=Math.max(1,art.clientHeight);
    const sw=slot.offsetWidth, sh=slot.offsetHeight;
    state.wingX=slot.offsetLeft+sw/2; state.wingY=slot.offsetTop+sh/2;
    state.wingScale=Math.min(1.8,sh*.82/263,sw*.82/246);       // icon is 246×263 design units
  }else{
    // scale with the viewport up to SMAX; past that the canvas widens (CW > 1440) and sections centre in it.
    // The hero fills the viewport height (900 … HMAX canvas px); its content stays centred via --bleed / --vpad.
    const cw=root.clientWidth, S=state.S=Math.min(cw/W,SMAX), CW=cw/S;
    const AH=Math.round(Math.min(HMAX,Math.max(H,innerHeight/S)));
    const bleed=state.bleed=(CW-W)/2, vpad=state.vpad=(AH-H)/2;
    page.style.width=CW+'px'; page.style.transform=`scale(${S})`;
    root.style.setProperty('--s',String(S)); root.style.setProperty('--cw',CW+'px'); root.style.setProperty('--ah',AH+'px');
    root.style.setProperty('--bleed',bleed+'px'); root.style.setProperty('--vpad',vpad+'px');
    root.classList.toggle('is-wide',bleed>.5);
    state.W=Math.round(CW); state.H=AH; state.wingX=905+bleed; state.wingY=478+vpad; state.wingScale=1.8;
  }
  stage.style.height=(page.offsetHeight*state.S)+'px';
  quality.apply();
  if(camera){
    camera.fov=2*Math.atan((state.H/2)/Z)*180/Math.PI; camera.aspect=state.W/state.H; camera.updateProjectionMatrix();
  }
}
const Z=1600;
addEventListener('resize',fit); COMPACT_MQ.addEventListener('change',fit);
const ro=new ResizeObserver(fit); ro.observe(document.documentElement); ro.observe(page); fit();

const scene=new THREE.Scene();
camera=new THREE.PerspectiveCamera(2*Math.atan((state.H/2)/Z)*180/Math.PI,state.W/state.H,10,6000);
camera.position.set(0,0,Z);
const pm=new THREE.PMREMGenerator(renderer);
scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const key=new THREE.DirectionalLight(0xffffff,2.0); key.position.set(-600,800,900); scene.add(key);
const rim=new THREE.DirectionalLight(0xFFC48A,1.6); rim.position.set(700,-300,-500); scene.add(rim);
const P=(x,y,z=0)=>new THREE.Vector3(x-state.W/2,state.H/2-y,z);
fit();

export { canvas, renderer, scene, camera, P };

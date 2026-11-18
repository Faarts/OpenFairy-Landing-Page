// Orange light streaks
import * as THREE from 'three';
import { scene } from './renderer.js';

const stTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=8;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(247,127,6,0)');gr.addColorStop(.75,'rgba(247,127,6,.85)');gr.addColorStop(1,'rgba(255,214,150,1)');g.fillStyle=gr;g.fillRect(0,0,256,8);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const streaks=[];
for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:stTex,transparent:true,depthWrite:false,toneMapped:false,opacity:0}));m.visible=false;scene.add(m);streaks.push({m,life:0,max:1,v:new THREE.Vector3()});}
function spawnStreak(from,dir,speed=900,len=160){
  const s=streaks.find(s=>s.life<=0); if(!s) return;
  s.life=s.max=.7+Math.random()*.5; s.m.visible=true; s.m.position.copy(from);
  s.v.copy(dir).normalize().multiplyScalar(speed); s.m.scale.set(len,1.6,1); s.m.rotation.set(0,0,Math.atan2(dir.y,dir.x));
}

export function updateStreaks(dt){
  streaks.forEach(s=>{ if(s.life<=0) return; s.life-=dt; s.m.position.addScaledVector(s.v,dt);
    const k=s.life/s.max; s.m.material.opacity=Math.sin(k*Math.PI)*.95; if(s.life<=0) s.m.visible=false; });
}

export { spawnStreak };

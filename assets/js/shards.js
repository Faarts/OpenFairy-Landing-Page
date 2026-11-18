// Floating glass shards around the wing
import * as THREE from 'three';
import { scene } from './renderer.js';
import { rnd } from './utils.js';
import { state } from './config.js';

const shardN=30;
const shardGeo=new THREE.BoxGeometry(1,1,1);
const shardMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.12,metalness:0,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.4,transparent:true,opacity:.75});
const shardInk=new THREE.MeshPhysicalMaterial({color:0x2B2520,roughness:.2,metalness:.1,clearcoat:1,envMapIntensity:1});
const shardsW=new THREE.InstancedMesh(shardGeo,shardMat,shardN), shardsK=new THREE.InstancedMesh(shardGeo,shardInk,12);
scene.add(shardsW,shardsK);
const sh=[];
function mkShard(ink){
  const ang=rnd()*Math.PI*2, rad=380+rnd()*620;
  return {ink,base:new THREE.Vector3(Math.cos(ang)*rad*1.25+185,Math.sin(ang)*rad*.62,-500+rnd()*800),
    len:ink?24+rnd()*50:40+rnd()*130,w:ink?3+rnd()*3:2+rnd()*4,
    rot:new THREE.Euler(rnd()*6,rnd()*6,rnd()*6),spin:new THREE.Vector3((rnd()-.5)*.3,(rnd()-.5)*.3,(rnd()-.5)*.2),
    ph:rnd()*6.28,amp:10+rnd()*30,par:.4+rnd()*1.2,push:new THREE.Vector3()};
}
for(let i=0;i<shardN;i++) sh.push(mkShard(false));
for(let i=0;i<12;i++) sh.push(mkShard(true));
const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), sc=new THREE.Vector3(), tmpE=new THREE.Euler();

export function updateShards(t,dt,nx,ny,blast,heat,intro){
  // the shard field is laid out for the 1440×900 desktop scene; in the stacked compact layout it would cross the text
  shardsW.visible=shardsK.visible=!state.compact; if(state.compact) return;
  let iw=0,ik=0;
  sh.forEach(s=>{
    const away=new THREE.Vector3(s.base.x-185,s.base.y,0).normalize();
    s.push.lerp(away.multiplyScalar(blast*220+heat*20),Math.min(1,dt*3));
    const x=s.base.x+Math.sin(t*.4+s.ph)*s.amp-nx*40*s.par+s.push.x;
    const y=s.base.y+Math.cos(t*.33+s.ph)*s.amp+ny*30*s.par+s.push.y;
    tmpE.set(s.rot.x+t*s.spin.x*(1+blast*4),s.rot.y+t*s.spin.y*(1+blast*4),s.rot.z+t*s.spin.z);
    q.setFromEuler(tmpE); sc.set(s.w,s.len,s.w*.5*intro+.001);
    m4.compose(new THREE.Vector3(x,y,s.base.z),q,sc);
    if(s.ink) shardsK.setMatrixAt(ik++,m4); else shardsW.setMatrixAt(iw++,m4);
  });
  shardsW.instanceMatrix.needsUpdate=true; shardsK.instanceMatrix.needsUpdate=true;
  shardsW.material.opacity=.75*intro;
}

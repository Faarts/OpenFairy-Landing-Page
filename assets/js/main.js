// Entry point: animation loop that ties all modules together
import * as THREE from 'three';
import { W, H, REDUCE, RENDER, OVR, state } from './config.js';
import { art, canvas, renderer, scene, camera } from './renderer.js';
import { bg, bgU } from './background.js';
import { U, holder, wing, parts } from './wing.js';        // must load before shards.js (shared seeded random)
import { updateShards } from './shards.js';
import { spawnStreak, updateStreaks } from './streaks.js';
import { ptr, cur, curT, ring, coord, stateEl } from './pointer.js';
import './preloader.js';

const ray=new THREE.Raycaster(); const ndc=new THREE.Vector2();
let blast=1, hold=0, glow=0, heat=0, hovered=null, last=performance.now(), lastSpark=0, nextAmbient=0;
const hoverLocal=new THREE.Vector3(9999,9999,0);

function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now; const t=now/1000;
  U.uTime.value=t; bgU.uTime.value=t%10;
  ptr.x+=(ptr.tx-ptr.x)*Math.min(1,dt*14); ptr.y+=(ptr.ty-ptr.y)*Math.min(1,dt*14);
  const nx=(ptr.x/state.W)*2-1, ny=(ptr.y/state.H)*2-1;

  // hero scene box (desktop: the 1440×900 design; compact: measured in renderer.js fit())
  const ws=state.wingScale; wing.scale.set(ws,-ws,ws);
  holder.position.x=state.wingX-state.W/2;
  // background plane must cover the view at its depth (z -600 → 1.375× the screen size)
  const bsx=Math.max(1,state.W*1.4/2400), bsy=Math.max(1,state.H*1.4/1500);
  bg.scale.set(bsx,bsy,1); bgU.uAspect.value=(2400*bsx)/(1500*bsy);

  // intro: shards assemble into the wing
  let target=0;
  if(state.introT<0) target=1;
  const sinceIntro=state.introT<0?0:(now-state.introT)/1000;
  // hold → scatter
  if(ptr.down && state.introT>=0){ hold=Math.min(1,hold+dt/0.9); } else hold=Math.max(0,hold-dt*3);
  if(ptr.down && state.introT>=0) target=Math.max(target,hold*hold*(3-2*hold));
  if(OVR.blast!=null) target=OVR.blast;
  const spd = target>blast ? 5 : (state.introT>=0 && sinceIntro<2.2 ? 1.15 : 2.6);
  blast+=(target-blast)*Math.min(1,dt*spd);
  U.uBlast.value=blast;
  ring.style.strokeDashoffset=String(207.3*(1-hold));
  cur.classList.toggle('hold',hold>0.02);

  // wing motion (Trionn-like idle: slow turn + each feather breathing on its own wave)
  const turn=REDUCE?0:Math.sin(t*.32)*.42;
  holder.rotation.y+=((OVR.ry!=null?OVR.ry:turn+nx*.32)-holder.rotation.y)*Math.min(1,dt*3);
  holder.rotation.x+=((.1+ny*.18)-holder.rotation.x)*Math.min(1,dt*3);
  holder.rotation.z=Math.sin(t*.21)*.03;
  holder.position.y=state.H/2-state.wingY+Math.sin(t*.8)*8;
  parts.forEach((p,k)=>{
    const ph=k===0?0:k===1?2.3:k*1.1;
    const target=(hovered===p?1:0); p.lift+=(target-p.lift)*Math.min(1,dt*6);
    p.grp.rotation.z=REDUCE?0:Math.sin(t*1.05+ph)*.035;
    p.grp.position.z=(REDUCE?0:Math.sin(t*1.05+ph)*7)+p.lift*(k<2?22:34);
    p.grp.position.x=(k===0?-1:k===1?1:0)*p.lift*4;
    p.grp.position.y=(k===0?-1:k===1?1:0)*p.lift*5;
    p.lines.material.opacity=.42*Math.max(0,1-blast*3)+p.lift*.3;
    p.lines.material.color.set(p.lift>.5?0xD85C00:0x1A1714);
  });

  // raycast "touch the feathers"
  hovered=null;
  if(ptr.in && blast<.15){
    ndc.set(nx,-ny); ray.setFromCamera(ndc,camera);
    const hits=ray.intersectObjects(parts.map(p=>p.mesh),false);
    if(hits.length){
      const h=hits[0]; hovered=parts.find(p=>p.mesh===h.object);
      hoverLocal.copy(h.point); h.object.worldToLocal(hoverLocal);
      if(now-lastSpark>110 && heat>.3){lastSpark=now;
        const out=new THREE.Vector3().subVectors(h.point,holder.position); out.z=0; out.normalize().add(new THREE.Vector3((Math.random()-.5)*.6,(Math.random()-.5)*.6,0));
        spawnStreak(h.point.clone().setZ(h.point.z+20),out,700+Math.random()*500,90+Math.random()*120);}
    }
  }
  U.uHover.value.lerp(hoverLocal,Math.min(1,dt*18));
  heat+=((hovered?1:0)-heat)*Math.min(1,dt*(hovered?8:3)); U.uHeat.value=heat;
  cur.classList.toggle('hot',!!hovered||hold>.02);
  curT.textContent=hold>.02?(blast>.85?'Release':'Scattering'):(hovered?hovered.name:'Hold');

  // light behind glass follows the wing + cursor, flares on touch/scatter
  const intro=state.introT<0?0:Math.min(1,sinceIntro/1.4);
  glow+=(((.82+heat*.25+hold*.35)*intro)-glow)*Math.min(1,dt*3);
  bgU.uPow.value=glow;
  // glow sits behind the wing: desktop keeps the tuned .62/.5, compact projects the wing onto the bg plane
  const gx0=state.compact?.5+(state.wingX-state.W/2)*1.375/(2400*bsx):.62;
  const gy0=state.compact?.5+(state.H/2-state.wingY)*1.375/(1500*bsy):.5;
  const gx=gx0+nx*.04, gy=gy0-ny*.05; bgU.uGlow.value.x+=(gx-bgU.uGlow.value.x)*dt*2; bgU.uGlow.value.y+=(gy-bgU.uGlow.value.y)*dt*2;

  updateShards(t,dt,nx,ny,blast,heat,intro);

  // streaks
  if(state.introT>=0 && now>nextAmbient && !RENDER){nextAmbient=now+900+Math.random()*1600;
    const a=-.5+Math.random()*.3; const from=new THREE.Vector3(-900+Math.random()*700,250+Math.random()*250,-300);
    spawnStreak(from,new THREE.Vector3(Math.cos(a),Math.sin(a),0),1100,220);}
  if(hold>.6 && Math.random()<.5){const a=Math.random()*6.28;spawnStreak(holder.position.clone().setZ(60),new THREE.Vector3(Math.cos(a),Math.sin(a),0),1200,200);}
  updateStreaks(dt);

  coord.textContent=`X ${nx.toFixed(2)} · Y ${(-ny).toFixed(2)}`;
  stateEl.textContent=blast>.6?'SCATTERED · 7 PROVIDERS':hovered?'TOUCH · '+hovered.name.toUpperCase():'IDLE · ROUTE OPEN';

  cur.style.transform=`translate(${ptr.x}px,${ptr.y}px)`;
  cur.style.opacity=ptr.in?1:0;
  renderer.render(scene,camera);
}

/* ---------- dev / capture helpers (used with ?render=1) ---------- */
window.SIM=n=>{let t=last;if(state.introT<0)state.introT=t-6000;for(let i=0;i<n;i++){t+=33;frame(t);}return {glow,blast};};
window.CAP=name=>new Promise(res=>{renderer.render(scene,camera);canvas.toBlob(b=>fetch('/save?n='+name,{method:'POST',body:b}).then(r=>res(r.status)),'image/png');});

// Only render while the hero is on screen.
let heroOn=true;
new IntersectionObserver(([e])=>{heroOn=e.isIntersecting;}).observe(art);
function loop(now){requestAnimationFrame(loop);if(!heroOn&&!RENDER){last=now;return;}try{frame(now);}catch(err){console.error(err);}}
requestAnimationFrame(loop);

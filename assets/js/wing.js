// 3D glass wing: triangulated, blast-able fragments + edge lines
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { scene, P } from './renderer.js';
import { ICON } from './wing-icon.js';
import { rnd } from './utils.js';

const svg=new SVGLoader().parse(ICON);
const OFF=new THREE.Vector2(123,131.5);

function fragGeo(shapes,depth,z0){
  const pos=[],nor=[],cen=[],ran=[];
  const push=(a,b,c,n,C,R)=>{
    const e1=new THREE.Vector3().subVectors(b,a), e2=new THREE.Vector3().subVectors(c,a);
    if(e1.cross(e2).dot(n)<0){const t=b;b=c;c=t;}
    for(const v of [a,b,c]){pos.push(v.x,v.y,v.z);nor.push(n.x,n.y,n.z);cen.push(C.x,C.y,C.z);ran.push(R[0],R[1],R[2],R[3]);}
  };
  for(const sh of shapes){
    const ex=sh.extractPoints(20); let contour=ex.shape.map(p=>p.clone()), holes=ex.holes.map(h=>h.map(p=>p.clone()));
    if(THREE.ShapeUtils.isClockWise(contour)) contour.reverse();
    holes.forEach(h=>{if(!THREE.ShapeUtils.isClockWise(h)) h.reverse();});
    // drop duplicate closing point
    const clean=a=>{if(a.length>1&&a[0].distanceTo(a[a.length-1])<1e-4)a.pop();return a;};
    clean(contour); holes.forEach(clean);
    const verts=contour.concat(...holes).map(p=>new THREE.Vector2(p.x-OFF.x,p.y-OFF.y));
    const faces=THREE.ShapeUtils.triangulateShape(contour,holes);
    const ec=new Map(); const k=(i,j)=>i<j?i+'_'+j:j+'_'+i;
    faces.forEach(f=>{for(let e=0;e<3;e++){const kk=k(f[e],f[(e+1)%3]);ec.set(kk,(ec.get(kk)||0)+1);}});
    faces.forEach(f=>{
      const v=f.map(i=>verts[i]);
      const C=new THREE.Vector3((v[0].x+v[1].x+v[2].x)/3,(v[0].y+v[1].y+v[2].y)/3,z0+depth/2);
      const R=[rnd(),rnd(),rnd(),rnd()];
      const F=v.map(p=>new THREE.Vector3(p.x,p.y,z0+depth)), B=v.map(p=>new THREE.Vector3(p.x,p.y,z0));
      push(F[0],F[1],F[2],new THREE.Vector3(0,0,1),C,R);
      push(B[0],B[1],B[2],new THREE.Vector3(0,0,-1),C,R);
      for(let e=0;e<3;e++){
        if(ec.get(k(f[e],f[(e+1)%3]))!==1) continue;
        const a=v[e], b=v[(e+1)%3]; const d=new THREE.Vector2().subVectors(b,a);
        const n=new THREE.Vector3(d.y,-d.x,0).normalize();
        const mid=new THREE.Vector2((a.x+b.x)/2-C.x,(a.y+b.y)/2-C.y); if(n.x*mid.x+n.y*mid.y<0) n.negate();
        const a0=new THREE.Vector3(a.x,a.y,z0),b0=new THREE.Vector3(b.x,b.y,z0),a1=new THREE.Vector3(a.x,a.y,z0+depth),b1=new THREE.Vector3(b.x,b.y,z0+depth);
        push(a0,b0,b1,n,C,R); push(a0,b1,a1,n,C,R);
      }
    });
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('aCenter',new THREE.Float32BufferAttribute(cen,3));
  g.setAttribute('aRand',new THREE.Float32BufferAttribute(ran,4));
  g.computeBoundingSphere();
  return g;
}
function edgeGeo(shapes,depth,z0){
  const g=new THREE.ExtrudeGeometry(shapes,{depth,bevelEnabled:false,curveSegments:20});
  g.translate(-OFF.x,-OFF.y,z0);
  return new THREE.EdgesGeometry(g,28);
}

const U={uBlast:{value:1},uTime:{value:0},uHover:{value:new THREE.Vector3(9999,9999,0)},uHeat:{value:0},uHot:{value:new THREE.Color('#F77F06').multiplyScalar(1.3)}};
function blastMaterial(params){
  const m=new THREE.MeshPhysicalMaterial(params);
  m.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader=`uniform float uBlast;uniform float uTime;uniform vec3 uHover;uniform float uHeat;
attribute vec3 aCenter;attribute vec4 aRand;varying float vHeat;
mat3 rotAx(vec3 a,float t){float c=cos(t),s=sin(t),o=1.-c;return mat3(o*a.x*a.x+c,o*a.x*a.y+a.z*s,o*a.z*a.x-a.y*s,o*a.x*a.y-a.z*s,o*a.y*a.y+c,o*a.y*a.z+a.x*s,o*a.z*a.x+a.y*s,o*a.y*a.z-a.x*s,o*a.z*a.z+c);}
`+sh.vertexShader
    .replace('#include <beginnormal_vertex>',`
      float bt=clamp(uBlast*1.4-aRand.w*0.4,0.,1.); bt=bt*bt*(3.-2.*bt);
      vec3 ax=normalize(aRand.xyz*2.-1.+vec3(.001));
      float h=uHeat*(1.-bt)*smoothstep(46.,0.,distance(aCenter.xy,uHover.xy));
      mat3 R=rotAx(ax,bt*(2.5+aRand.x*7.)+h*.35*(aRand.y-.5));
      vec3 objectNormal=R*normal;`)
    .replace('#include <begin_vertex>',`
      vec3 transformed=R*(position-aCenter);
      vec2 dir=normalize(aCenter.xy+(aRand.xy-.5)*60.+vec2(.001));
      vec3 c=aCenter+vec3(dir*(50.+aRand.y*190.)*bt,(aRand.z-.35)*380.*bt);
      c.xy+=vec2(sin(uTime*.7+aRand.x*6.28),cos(uTime*.6+aRand.y*6.28))*6.*bt;
      c.z+=h*16.;
      vHeat=h;
      transformed+=c;`);
    sh.fragmentShader=`varying float vHeat;uniform vec3 uHot;
`+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      totalEmissiveRadiance+=uHot*vHeat*.9;`);
  };
  return m;
}
const matOrange=blastMaterial({color:new THREE.Color('#FFA24A'),roughness:.38,metalness:0,transmission:.86,thickness:34,ior:1.42,attenuationColor:new THREE.Color('#FFB463'),attenuationDistance:70,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1,side:THREE.DoubleSide});
const matInk=blastMaterial({color:new THREE.Color('#5A524B'),roughness:.32,metalness:0,transmission:.7,thickness:34,ior:1.45,attenuationColor:new THREE.Color('#1A1714'),attenuationDistance:22,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.1,side:THREE.DoubleSide});

const holder=new THREE.Group(); scene.add(holder);
const wing=new THREE.Group(); const WS=1.8; wing.scale.set(WS,-WS,WS); holder.add(wing);
holder.position.copy(P(905,478,0));
const parts=[];
const defs=[{i:0,mat:matOrange,depth:26,z:0,name:'Route feather'},{i:1,mat:matInk,depth:26,z:-6,name:'Access feather'},{i:2,mat:matInk,depth:14,z:24,name:'Node · in'},{i:3,mat:matOrange,depth:14,z:24,name:'Node · out'}];
defs.forEach(d=>{
  const shapes=SVGLoader.createShapes(svg.paths[d.i]);
  const grp=new THREE.Group();
  const mesh=new THREE.Mesh(fragGeo(shapes,d.depth,d.z),d.mat); mesh.frustumCulled=false;
  const lines=new THREE.LineSegments(edgeGeo(shapes,d.depth,d.z),new THREE.LineBasicMaterial({color:0x1A1714,transparent:true,opacity:.42}));
  grp.add(mesh,lines); wing.add(grp);
  parts.push({grp,mesh,lines,name:d.name,lift:0,i:d.i});
});

export { U, holder, wing, parts };

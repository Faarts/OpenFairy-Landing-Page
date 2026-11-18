// WebGL renderer, artboard fitting, scene, camera and lights
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, H, RENDER, state } from './config.js';

export const art=document.getElementById('art');

const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.NoToneMapping;
renderer.setSize(W,H,false);
function fit(){
  const pad=16, vw=innerWidth, vh=innerHeight;
  const S=state.S=Math.min((vw-pad*2)/W,(vh-pad*2-20)/H);
  const x=(vw-W*S)/2, y=(vh-20-H*S)/2;
  art.style.transform=`translate(${x}px,${y}px) scale(${S})`;
  renderer.setPixelRatio(RENDER?2:Math.min(2,devicePixelRatio*S));
  renderer.setSize(W,H,false);
}
addEventListener('resize',fit); fit();

const scene=new THREE.Scene();
const Z=1600;
const camera=new THREE.PerspectiveCamera(2*Math.atan((H/2)/Z)*180/Math.PI,W/H,10,6000);
camera.position.set(0,0,Z);
const pm=new THREE.PMREMGenerator(renderer);
scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const key=new THREE.DirectionalLight(0xffffff,2.0); key.position.set(-600,800,900); scene.add(key);
const rim=new THREE.DirectionalLight(0xFFC48A,1.6); rim.position.set(700,-300,-500); scene.add(rim);
const P=(x,y,z=0)=>new THREE.Vector3(x-W/2,H/2-y,z);

export { canvas, renderer, scene, camera, P };

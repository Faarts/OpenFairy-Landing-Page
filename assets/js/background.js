// Frost background with the ember glow behind the glass
import * as THREE from 'three';
import { scene } from './renderer.js';

const bgU={uGlow:{value:new THREE.Vector2(0.62,0.5)},uPow:{value:0},uTime:{value:0},uAspect:{value:2400/1500}};
const bg=new THREE.Mesh(new THREE.PlaneGeometry(2400,1500),new THREE.ShaderMaterial({
  uniforms:bgU, toneMapped:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
    uniform vec2 uGlow;uniform float uPow;uniform float uTime;uniform float uAspect;varying vec2 vUv;
    vec3 lin(vec3 c){return pow(c,vec3(2.2));}
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){
      vec2 p=vUv; p.x*=uAspect; vec2 g=uGlow; g.x*=uAspect;
      float d=distance(p,g);
      vec3 frost=lin(vec3(0.957,0.953,0.945));
      vec3 halo=lin(vec3(1.0,0.84,0.66));
      vec3 ember=lin(vec3(0.969,0.50,0.024));
      vec3 col=frost;
      col=mix(col,halo,0.55*uPow*exp(-d*d/0.055));
      col=mix(col,ember,0.62*uPow*exp(-d*d/0.012));
      vec2 tl=vec2(0.18*uAspect,0.8); col=mix(col,lin(vec3(1.)),0.35*exp(-pow(distance(p,tl),2.)/0.08));
      col+= (h(vUv*1000.+uTime)-.5)*0.012;
      gl_FragColor=vec4(col,1.);
      #include <colorspace_fragment>
    }`
}));
bg.position.set(0,0,-600); scene.add(bg);

export { bg, bgU };

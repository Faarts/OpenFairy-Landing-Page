// Section 03 · flow diagram
// Draws the wires (model services → OpenFairy → your work) from the live node positions, and routes a
// "request" through it: one service and one destination light up at a time.
const fig=document.querySelector('.b-diagram');
if(fig){
  const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg=fig.querySelector('.b-wires'), NS='http://www.w3.org/2000/svg';
  const srcs=[...fig.querySelectorAll('.b-src .b-node')], outs=[...fig.querySelectorAll('.b-out .b-node')];
  const hub=fig.querySelector('.b-tile');
  let inPaths=[], outPaths=[], si=0, oi=0, timer=null;

  function box(el,ref,k){const r=el.getBoundingClientRect();return {l:(r.left-ref.left)/k,t:(r.top-ref.top)/k,r:(r.right-ref.left)/k,b:(r.bottom-ref.top)/k,cx:(r.left+r.width/2-ref.left)/k,cy:(r.top+r.height/2-ref.top)/k};}
  function curve(a,b,vertical){
    if(vertical){const d=(b.y-a.y)/2;return `M${a.x},${a.y} C${a.x},${a.y+d} ${b.x},${b.y-d} ${b.x},${b.y}`;}
    const d=(b.x-a.x)/2;return `M${a.x},${a.y} C${a.x+d},${a.y} ${b.x-d},${b.y} ${b.x},${b.y}`;
  }
  function draw(){
    const ref=svg.getBoundingClientRect(); if(!ref.width) return;
    const k=ref.width/svg.clientWidth;                 // the desktop page is CSS-scaled
    const h=box(hub,ref,k);
    const vertical=box(fig.querySelector('.b-src'),ref,k).b<=h.t;   // whole services group above the hub = stacked (phone)
    svg.textContent='';
    const mk=d=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);svg.appendChild(p);return p;};
    if(vertical){
      // stacked (phone): one trunk from the services group into the hub, then branches from the OpenFairy pill
      const g=box(fig.querySelector('.b-src'),ref,k), of=box(fig.querySelector('.b-of'),ref,k);
      const trunk=mk(curve({x:h.cx,y:g.b+6},{x:h.cx,y:h.t},true)); trunk.classList.add('trunk');
      inPaths=srcs.map(()=>trunk);
      outPaths=outs.map(n=>{const b=box(n,ref,k);return mk(curve({x:of.cx,y:of.b},{x:b.cx,y:b.t},true));});
    }else{
      inPaths=srcs.map(n=>{const b=box(n,ref,k);return mk(curve({x:b.r,y:b.cy},{x:h.l,y:h.cy}));});
      outPaths=outs.map(n=>{const b=box(n,ref,k);return mk(curve({x:h.r,y:h.cy},{x:b.l,y:b.cy}));});
    }
    light();
  }
  function light(){
    srcs.forEach((n,i)=>n.classList.toggle('on',i===si)); outs.forEach((n,i)=>n.classList.toggle('on',i===oi));
    inPaths.forEach((p,i)=>{if(!p.classList.contains('trunk')) p.classList.toggle('on',i===si);}); outPaths.forEach((p,i)=>p.classList.toggle('on',i===oi));
    svg.querySelectorAll('.trunk').forEach(p=>p.classList.add('on'));
  }
  function step(){
    si=(si+1+Math.floor(Math.random()*(srcs.length-1)))%srcs.length;
    oi=(oi+1+Math.floor(Math.random()*(outs.length-1)))%outs.length;
    light(); fig.classList.add('pulse'); setTimeout(()=>fig.classList.remove('pulse'),500);
  }
  new ResizeObserver(draw).observe(fig);
  addEventListener('resize',draw);
  if(document.fonts) document.fonts.ready.then(draw);
  draw();
  if(!REDUCE) new IntersectionObserver(([e])=>{clearInterval(timer);if(e.isIntersecting) timer=setInterval(step,1800);},{threshold:.3}).observe(fig);
}

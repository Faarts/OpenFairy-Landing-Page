// Section 05 · Use cases
// - Progress rail fills as the section scrolls through the viewport; each node lights once reached.
// - Hovering a card lifts its rail node.
// - Small live loops in the previews (agent step, model name in the tool config), only while on screen.
const section=document.getElementById('use-cases');
if(section){
  const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rail=section.querySelector('.u-rail');
  const nodes=[...section.querySelectorAll('.u-rail-track b')];
  const cards=[...section.querySelectorAll('.u-card')];
  const STOPS=[162,502,842,1182].map(x=>x/1344);       // node positions along the 1344px track

  function update(){
    let p=1;
    if(!REDUCE){
      const r=rail.getBoundingClientRect(), vh=innerHeight;
      p=Math.min(1,Math.max(0,(vh*.85-r.top)/(vh*.6)));  // 0 when the rail enters, 1 a bit past mid-screen
    }
    rail.style.setProperty('--p',p.toFixed(4));
    nodes.forEach((n,i)=>n.classList.toggle('on',p>=STOPS[i]));
  }
  addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();

  cards.forEach((c,i)=>{
    c.addEventListener('mouseenter',()=>nodes[i].classList.add('hot'));
    c.addEventListener('mouseleave',()=>nodes[i].classList.remove('hot'));
  });

  // live loops
  const steps=[...section.querySelectorAll('.u-step')];
  const cyc=section.querySelector('.u-cfg [data-cycle]'), names=cyc.dataset.cycle.split('|');
  let s=0, m=0, t1=null, t2=null;
  function start(){
    if(REDUCE||t1) return;
    steps[s].classList.add('is-on');
    t1=setInterval(()=>{steps[s].classList.remove('is-on');s=(s+1)%steps.length;steps[s].classList.add('is-on');},1100);
    t2=setInterval(()=>{m=(m+1)%names.length;cyc.textContent='"'+names[m]+'"';},2000);
  }
  function stop(){clearInterval(t1);clearInterval(t2);t1=t2=null;}
  new IntersectionObserver(([e])=>{e.isIntersecting?start():stop();},{threshold:.2}).observe(section);
}

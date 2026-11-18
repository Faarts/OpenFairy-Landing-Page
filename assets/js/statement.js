// Section 03 · version B (editorial statement)
// - Words of the statement fill in one by one as the section scrolls through the viewport.
// - The wing render drifts slightly (parallax).
// - ?s3=diagram shows the previous flow-diagram version instead (kept for comparison).
const statement=document.getElementById('brand'), diagram=document.getElementById('brand-diagram');
const useDiagram=new URLSearchParams(location.search).get('s3')==='diagram';
if(statement&&diagram){ statement.hidden=useDiagram; diagram.hidden=!useDiagram; }

if(statement&&!useDiagram){
  const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words=[...statement.querySelectorAll('.s-title .w')];
  const title=statement.querySelector('.s-title'), img=statement.querySelector('.s-figure img');
  function update(){
    const vh=innerHeight, r=title.getBoundingClientRect();
    // 0 when the title's top reaches 85% of the screen, 1 when its bottom reaches 40%
    const p=REDUCE?1:Math.min(1,Math.max(0,(vh*.85-r.top)/((vh*.85-vh*.4)+r.height)));
    const n=Math.round(p*words.length);
    words.forEach((w,i)=>w.classList.toggle('lit',i<n));
    if(img&&!REDUCE){
      const f=img.parentElement.getBoundingClientRect();
      const q=(f.top+f.height/2-vh/2)/vh;               // -0.5 … 0.5 around screen centre
      img.style.setProperty('--py',(q*-60).toFixed(1)+'px');
    }
  }
  addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();
}

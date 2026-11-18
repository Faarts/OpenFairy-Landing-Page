// Generic scroll reveal: adds .in-view (once) to every [data-reveal] element when it enters the viewport.
const els=document.querySelectorAll('[data-reveal]');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}});
},{threshold:.25});
els.forEach(el=>io.observe(el));

// keep the footer year current
document.querySelectorAll('.foot-year').forEach(el=>{el.textContent=String(new Date().getFullYear());});

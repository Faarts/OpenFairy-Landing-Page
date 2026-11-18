// Exploration switcher — add ?explore to the URL to show a small panel for flipping between section variants.
const params=new URLSearchParams(location.search);
if(params.has('explore')){
  const groups={s3:['statement','diagram'],s4:['list','tabs','rows','scroll','stage','slides'],s5:['rail','rows','bento','carousel','stack','split','hscroll','panels']};
  const labels={s3:'Section 03',s4:'Section 04',s5:'Section 05'};
  const bar=document.createElement('nav'); bar.className='explore'; bar.setAttribute('aria-label','Design explorations');
  bar.innerHTML=Object.entries(groups).map(([k,opts])=>{
    const cur=params.get(k)||opts[0];
    return `<div><span>${labels[k]}</span>`+opts.map(o=>{const q=new URLSearchParams(params);q.set(k,o);
      const hash={s3:'#brand',s4:'#capabilities',s5:'#use-cases'}[k];
      return `<a href="?${q}${hash}" class="${o===cur?'on':''}">${o}</a>`;}).join('')+'</div>';
  }).join('');
  document.body.appendChild(bar);
  const st=document.createElement('style');
  st.textContent=`.explore{position:fixed;left:16px;bottom:16px;z-index:200;display:grid;gap:6px;padding:10px 12px;border-radius:14px;
    background:rgba(20,17,15,.92);color:#F4F3F1;font:500 11px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 20px 40px -20px rgba(0,0,0,.5)}
  .explore div{display:flex;align-items:center;gap:6px}
  .explore span{width:84px;color:rgba(244,243,241,.55)}
  .explore a{padding:6px 9px;border-radius:99px;color:#F4F3F1;text-decoration:none;background:rgba(244,243,241,.08)}
  .explore a.on{background:#F77F06;color:#fff}`;
  document.head.appendChild(st);
}

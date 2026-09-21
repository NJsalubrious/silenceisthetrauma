(() => {
 const variant=Number(document.body.dataset.subtleScanner||1);
 document.querySelector('.scanner-door')?.remove();
 document.querySelector('.scanner-choices')?.remove();
 const drawings={
  1:'<svg viewBox="0 0 56 12"><path d="M1 6h10l3-3 3 6 3-8 3 10 3-7 3 4 3-2h23"/></svg>',
  2:'<svg viewBox="0 0 60 60"><path d="m8 43 12-29 18 6 15 27-31 5-2-38m2 38 16-32"/><g><circle cx="8" cy="43" r="2"/><circle cx="20" cy="14" r="2"/><circle cx="38" cy="20" r="2"/><circle cx="53" cy="47" r="2"/><circle cx="22" cy="52" r="2"/></g></svg>',
  3:'<svg viewBox="0 0 18 18"><path class="fold" d="M0 18 18 0v18Z"/><path d="m5 13 7-7m-6 0h6v6"/></svg>',
  4:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 10v4m4-7v10m4-7v4"/></svg>',
  5:'<svg viewBox="0 0 100 100"><g class="listening-points"><path d="m12 68 15-50 43 8 18 48-54 14-7-70"/><circle cx="12" cy="68" r="1.5"/><circle cx="27" cy="18" r="2"/><circle cx="70" cy="26" r="1.5"/><circle cx="88" cy="74" r="2"/><circle cx="34" cy="88" r="1.5"/></g></svg>'
 };
 document.querySelectorAll('.vex-logo-img').forEach(img=>{
  img.src='logo/vex-clean.svg';img.dataset.restLogo='logo/vex-clean.svg';
  const button=document.createElement('button');button.type='button';button.className='scanner-mark mark-'+variant;button.setAttribute('aria-label','veX — open the audio scanner');button.setAttribute('aria-haspopup','dialog');
  img.before(button);button.append(img);['onclick','onmouseenter','onmouseleave','tabindex','role','aria-label'].forEach(a=>img.removeAttribute(a));img.onkeydown=null;
  const detail=document.createElement('span');detail.className='mark-detail';detail.setAttribute('aria-hidden','true');detail.innerHTML=drawings[variant];button.append(detail);
  const hint=document.createElement('span');hint.className='mark-hint';hint.textContent='Listen to the network';hint.setAttribute('aria-hidden','true');button.append(hint);
  button.onclick=()=>{button.focus({preventScroll:true});window.openScanner()};
  if(variant===5){
   const wordmark=document.createElement('span');wordmark.className='vex-home-wordmark';wordmark.textContent='veX';wordmark.setAttribute('aria-hidden','true');img.replaceWith(wordmark);
   const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const nodes=Array.from({length:64},(_,i)=>{const y=1-2*(i+.5)/64,r=Math.sqrt(1-y*y),a=i*Math.PI*(3-Math.sqrt(5));return [Math.cos(a)*r,y,Math.sin(a)*r]});
   const edges=new Set();nodes.forEach((p,i)=>nodes.map((q,j)=>({j,d:p.reduce((sum,v,k)=>sum+(v-q[k])**2,0)})).filter(x=>x.j!==i).sort((a,b)=>a.d-b.d).slice(0,3).forEach(({j})=>edges.add([Math.min(i,j),Math.max(i,j)].join(':'))));
   const globe=(yaw=.25,pitch=-.18)=>{
    const rotate=p=>{const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [x,p[1]*Math.cos(pitch)-z*Math.sin(pitch),p[1]*Math.sin(pitch)+z*Math.cos(pitch)]};
    const points=nodes.map(rotate),project=p=>[50+p[0]*44,50+p[1]*44];
    detail.innerHTML='<svg viewBox="0 0 100 100"><circle class="globe-rim" cx="50" cy="50" r="44"/>'+[...edges].map(edge=>{const [i,j]=edge.split(':').map(Number),p=points[i],q=points[j],mid=p.map((v,k)=>v+q[k]),len=Math.hypot(...mid),m=project(mid.map(v=>v/len)),a=project(p),b=project(q),alpha=.12+.32*((p[2]+q[2]+2)/4);return `<path class="globe-link" d="M${a} Q${m} ${b}" opacity="${alpha}"/>`}).join('')+points.map(p=>{const [x,y]=project(p);return `<circle class="globe-point" cx="${x}" cy="${y}" r="${.6+(p[2]+1)*.4}" opacity="${.25+(p[2]+1)*.35}"/>`}).join('')+'</svg>';
   };
   globe();
   document.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||!button.getClientRects().length)return;
    const r=button.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
    const near=Math.max(0,1-Math.hypot(dx,dy)/130);
    button.style.setProperty('--near',near.toFixed(3));
    button.style.setProperty('--drift-x',reduce?'0px':(dx*near*.15)+'px');button.style.setProperty('--drift-y',reduce?'0px':(dy*near*.15)+'px');
    if(!reduce)globe(.25+dx*near*.012,-.18+dy*near*.008);
   },{passive:true});
   document.addEventListener('pointerleave',()=>{button.style.setProperty('--near','0');button.style.setProperty('--drift-x','0px');button.style.setProperty('--drift-y','0px')});
  }
 });
 const back=document.getElementById('scanner-return');back.innerHTML='<span aria-hidden="true">←</span> Back to veX';
 document.querySelector('.room-context').textContent='Scanner';
 const alignDesktopLogo=()=>{
  const mark=document.querySelector('.nav-column .scanner-mark'),label=document.querySelector('.nav-column [data-tab="feed"]');
  if(!mark||!label||!mark.getClientRects().length)return;
  const text=[...label.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()==='Feed');
  if(!text)return;
  const range=document.createRange(),start=text.textContent.search(/\S/);range.setStart(text,start);range.setEnd(text,start+4);
  const r=range.getBoundingClientRect(),parent=mark.parentElement.getBoundingClientRect();
  mark.style.marginLeft=(r.left+r.width/2-parent.left-mark.offsetWidth/2)+'px';
 };
 alignDesktopLogo();document.fonts.ready.then(alignDesktopLogo);window.addEventListener('resize',alignDesktopLogo);
})();

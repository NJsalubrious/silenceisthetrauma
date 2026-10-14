/* SITT memory world · the page.
 * Opens the start memory under the title veil. The first click lifts the veil and Ethel speaks.
 * At her handover moment the picture quietly becomes the visitor's.
 *
 * Moving (Walk Left's feel): drag, swipe, scroll or the arrow keys glide the view through the
 * memory's stops. The picture follows the finger: in a row that runs left to right, dragging left goes on;
 * where the row turns ("direction": "left"), dragging right goes on. Let go and it comes to rest on the nearest one. Past the first or last stop the
 * picture resists, and pushing on through carries the visitor into the memory on that side.
 * Doors: clicking a door spot pushes into the picture and on into another memory.
 * Eggs: clicking a hidden spot drops into a short memory of Isla's or Dominic's, then back.
 * The timeline: near the bottom edge, a line of dates; drag along it to jump to a moment.
 * Every number comes from the memory's memory.json. ?tune=1 opens the studio.
 */
(() => {
 'use strict';
 const Q=new URLSearchParams(location.search);
 const $=s=>document.querySelector(s);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const smooth=t=>t*t*(3-2*t);
 const main=$('.world'),canvas=$('#stage'),poster=$('.poster'),veil=$('.veil'),note=$('.note'),skip=$('.skip');
 const phone=matchMedia('(max-width: 700px), (pointer: coarse)').matches;
 const W={list:null,memory:null,folder:null,set:Q.get('set')||(phone?'mobile':'desktop'),source:Q.get('source')||'copies',lock:false};
 window.SITTWorldState=W;
 let scene,voice,started=false,free=false,handTimer=0,busy=false,bed=null;
 const json=u=>fetch(u+(u.includes('?')?'&':'?')+'r='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(u+' '+r.status);return r.json();});
 const look=m=>({...scene.LOOK,...(m?.look||{})});
 const stops=m=>m?.stops?.length?m.stops:[{x:0,y:0,zoom:1}];
 W.stops=stops;

 // ---- opening a memory ----
 async function open(folder,how=null){
  const memory=await json('memories/'+folder+'/memory.json');
  // a sequence that plays by itself ("auto") is seen once per visit; after that the way on goes straight past it
  if(memory.auto&&seen.has(folder)&&how&&how.side!=='left'&&memory.exits?.right?.to)return open(memory.exits.right.to,how);
  const prev=W.memory;
  if(memory.auto&&how&&(how.side||how.push)){W.lock=true;main.classList.add('auto');}   // walked into a sequence that plays by itself: hands off from the first frame
  if(!W.memory&&memory.together)scene.resolve(memory,folder,memory.together,W.set).then(r=>{poster.src=r.url;}).catch(()=>{});
  scene.aim(null);
  const S=scene.settings;
  Object.assign(S,{opening:1,light:2,response:null,overscan:null},memory.depth||{});
  S.look=look(memory);
  W.memory=memory;W.folder=folder;
  // where the view starts: a given stop, the near end when arriving from a side, or the first stop
  const n=stops(memory).length;
  T.s=T.goal=how?.stop??(how?.side==='left'?n-1:how?.side==='right'?(memory.arriveStop??0):(memory.startStop??0));T.landing=null;T.reached=T.s;
  // where the row turns (the towel), the way just come in is closed until the visitor has moved one stop the new way,
  // so the old habit springs back instead of carrying them out again; the glint shows the new way at once
  const turned=!!(prev&&how&&(how.side||how.push)&&!memory.auto&&(prev.direction==='left')!==(memory.direction==='left'));
  T.guard=turned?{side:how.side==='left'?'right':'left',stop:T.s}:null;T.hint=turned?performance.now()+5000:0;T.lastDir=0;
  let cut={};
  if(how?.push||how?.jump){cut=arrival(memory,how);}   // forward or back, or a jump on the timeline: a dream cut, never a swipe
  else if(how?.side==='left'||how?.side==='right'){const c=memory.cut||{};cut={kind:c.kind??(how.side==='left'?1:3),duration:c.duration??1500,travel:(how.side==='left'?-1:1)*(c.travel??.07)};}
  else if(how?.door){cut={kind:0,duration:how.door.duration??1400,zoomTo:how.zoomTo};}
  else if(how?.egg){cut={kind:0,duration:how.duration??700};}
  const startCam=camAt(T.s);scene.settings.moment=null;
  const shown=scene.show(memory,{folder,set:W.set,source:W.source,cam:startCam},cut);
  if(!how)await shown;
  main.classList.add('ready');
  if(memory.sound?.after){SITTSound.preload(memory.sound.after);if(bed&&bed.url!==memory.sound.after){bed=SITTSound.fadeTo(bed,memory.sound.after,{volume:memory.sound.volume??1,overlap:memory.sound.overlap??2.5});W.bed=bed;}else if(!bed&&how&&free)startBed();}
  else if(bed&&how){bed.fadeOut(3);bed=null;W.bed=null;}   // a memory with no sound of its own is quiet (its sound comes later)
  if(how){await shown;applyCam();if(voice.load(memory.voice))voice.play();}
  else{applyCam();if(voice.load(memory.voice)){voice.onEnd=()=>{handOver();startBed();};}else{handOver();startBed();}}
  ahead(memory);timeline.update();glimpse.set(memory,null);way.set(memory);
  if(memory.exits?.right?.to)json('memories/'+memory.exits.right.to+'/memory.json').then(n=>{if(W.memory===memory)glimpse.set(memory,n);}).catch(()=>{});
  dispatchEvent(new CustomEvent('sitt:memory',{detail:{memory,folder}}));
  if(memory.auto&&how&&(how.side||how.push))setTimeout(()=>runAuto(memory,folder),0);   // walked into: it plays (opened from the studio: it holds still to be tuned)
  return memory;}
 W.open=open;
 // warm up the memories either side (and behind doors), so going there starts at once
 const warmed=new Set();
 function ahead(memory){const fs=[memory.exits?.left?.to,memory.exits?.right?.to,...(memory.doors||[]).map(d=>d.to)].filter(Boolean);
  for(const f of fs){if(warmed.has(f))continue;warmed.add(f);
   json('memories/'+f+'/memory.json').then(m=>{const n=stops(m).length;scene.warm(m,{folder:f,set:W.set,source:W.source},m.auto?[...Array(n).keys()]:[...new Set([m.startStop??0,0,n-1])]);}).catch(()=>warmed.delete(f));}}
 async function go(folder,how){if(!folder||busy)return false;busy=true;T.raw=0;scene.settings.motion.amt=0;
  try{await open(folder,how);}finally{busy=false;scene.settings.pan=0;T.pan=0;idleSince=performance.now();}return true;}
 W.go=go;
 // ---- how a memory arrives: each one through its own dream cut (memory.json "cut.style"), never the same twice running ----
 const DREAM={drift:{kind:11,ms:2300,label:'Drift: the view travels on and the next memory comes through it'},ink:{kind:4,ms:2300,label:'Ink in water'},flare:{kind:5,ms:2000,label:'Flare: it overexposes and burns through'},double:{kind:6,ms:2500,label:'Double exposure: light first, shadows last'},
  fracture:{kind:7,ms:1600,label:'Fracture: bands slip out of time'},pull:{kind:8,ms:1900,label:'Pulled in toward a face'},flicker:{kind:9,ms:2100,label:'Flicker: it keeps slipping back'},
  underwater:{kind:10,ms:2700,label:'Under water'},depth:{kind:0,ms:1500,label:'Through the depth (plain)'}};
 W.DREAM=DREAM;
 // every memory has its own drift, the same each time you arrive there and unlike its neighbours': angle, blots, haze, pace, push-in
 const hashOf=t=>{let h=2166136261;for(const ch of String(t))h=Math.imul(h^ch.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
 const rnd=(f,k)=>hashOf(f+'#'+k);
 function arrival(m,how){const c=m.cut||{},to=m.id||'';let name=how?.style||c.style||'drift';if(!DREAM[name])name='drift';
  const D=DREAM[name],f=(m.faces||[])[0],focal=f?[f[0],1-f[1]]:[(m.focal||[.5,.5])[0],1-(m.focal||[.5,.5])[1]];
  const back=how?.side==='left'||(how?.jump&&how.kind===3);
  const fromDir=W.memory?.direction==='left'?-1:1,toDir=m.direction==='left'?-1:1,turn=fromDir!==toDir;
  const along=turn?0:fromDir*(back?-1:1);           // the way the visitor was moving; where the row turns (after the gap) it drifts upward
  const tilt=turn?(back?-1:1):(c.tilt??((rnd(to,'tilt')-.5)*.5));
  const drift=[along,tilt,c.blots??(.3+rnd(to,'blots')*.4),c.haze??(.3+rnd(to,'haze')*.7),rnd(to,'seed')*10];
  const pace=c.arrive??(name==='drift'?Math.round(1900+rnd(to,'pace')*900):D.ms),push=1.12+rnd(to,'push')*.22;
  const zoomTo=c.push?(how.zoomTo?{...how.zoomTo,zoom:c.push}:null):null;   // no push-in unless a memory asks for one
  return {kind:D.kind,duration:pace,zoomTo,focal,settle:c.settle??0,travel:name==='drift'?along*.06:0,drift};}
 // a way out can slide sideways into the next memory, or push forward through the picture into it ("style": "push")
 function travel(side){const m=W.memory,ex=m?.exits?.[side];if(!ex?.to)return false;
  if(ex.style!=='push')return go(ex.to,{side});
  let zoomTo=null;if(side==='right'){const c=scene.settings.cam,z=m.cut?.push??ex.zoom??1.6;
   if(m.kind==='strip'){const f=c.frame||[0,0,1,m.height||1500];zoomTo={x:f[0]+f[2]/2,y:f[1]+f[3]/2,zoom:z};}else zoomTo={x:c.x||0,y:c.y||0,zoom:(c.zoom||1)*z};}
  return go(ex.to,{side,push:true,zoomTo});}
 W.travel=travel;

 // ---- the sound bed: after her voice, the memory's loop plays for as long as the visitor stays ----
 function startBed(){const S=W.memory?.sound;if(!S?.after||bed)return;bed=SITTSound.bed(S.after,{volume:S.volume??1,fadeIn:S.fadeIn??2.5,overlap:S.overlap??2.5});bed.start();W.bed=bed;}
 // ---- the veil: the title on dark, until the visitor clicks ----
 function begin(e){
  if(started||e?.target?.closest?.('.studio,.skip'))return;
  started=true;const rev=W.memory?.voice?.audio?(W.memory.voice.reveal??8.5):2.5;veil.style.transitionDuration=rev+'s';veil.classList.add('lifting');skip.classList.add('on');
  try{SITTSound.context().resume();}catch{}
  voice.play().then(ok=>{if(!ok){if(!W.memory?.voice?.audio){handOver();startBed();setTimeout(()=>veil.remove(),(rev+.6)*1000);return;}   // a memory with no voice: the veil just lifts
    started=false;veil.classList.remove('lifting');return;}
   const h=W.memory?.voice?.handover,lead=W.memory?.sound?.startBeforeEnd??1.5;
   clearInterval(handTimer);handTimer=setInterval(()=>{const A=voice.audio;if(!A)return;
    if(Number.isFinite(h)&&A.currentTime>=h)handOver();
    if(A.duration&&A.currentTime>=A.duration-lead)startBed();
    if(free&&bed)clearInterval(handTimer);},100);});
  setTimeout(()=>veil.remove(),(rev+.6)*1000);}
 veil.addEventListener('click',begin);
 addEventListener('keydown',e=>{if(!started&&(e.key==='Enter'||e.key===' ')&&!e.target.closest?.('.studio')){e.preventDefault();begin(e);}});
 skip.addEventListener('click',()=>{clearInterval(handTimer);voice.stop();veil.remove();started=true;try{SITTSound.context().resume();}catch{}handOver();startBed();});
 // ---- the handover: the picture becomes the visitor's, without a word ----
 function handOver(){if(free)return;free=true;skip.classList.remove('on');setTimeout(()=>skip.remove(),900);main.classList.add('free');idleSince=performance.now();}
 W.handOver=handOver;

 // ---- a sequence that plays by itself ("auto" in memory.json): Dominic's world ----
 // The visitor has no say: dragging, scrolling and the keys do nothing (moving the mouse still steers the depth).
 // Each picture holds for its time and cuts hard to the next through a blink of black. After the last, it erodes
 // to darkness and the next memory (exits.right) comes up out of it. Control comes back with the reveal.
 // auto: {hold: ms or [ms per stop], flash: ms of black between, dark: ms to erode, reveal: ms to come up}
 const seen=new Set();W.seen=seen;
 const dark=document.createElement('div');dark.className='dark';dark.setAttribute('aria-hidden','true');main.appendChild(dark);
 let autoOn=false;
 async function runAuto(m,folder){if(autoOn)return;autoOn=true;seen.add(folder);W.lock=true;main.classList.add('auto');
  const A=m.auto||{},n=stops(m).length,hold=i=>(Array.isArray(A.hold)?A.hold[i]:A.hold)??900,wait=ms=>new Promise(r=>setTimeout(r,ms));
  const blink=v=>{dark.style.transition='none';dark.style.opacity=v;};
  try{
   for(let i=0;i<n;i++){if(W.memory!==m)return;
    if(i>0){blink(1);await wait(A.flash??70);}
    T.s=T.goal=T.landing=i;T.reached=i;T.lastDir=0;applyCam();
    if(i>0)blink(0);
    if(i<n-1)scene.aim(camAt(i+1));   // the next picture loads while this one holds
    await wait(hold(i));}
   if(W.memory!==m)return;
   dark.style.transition='opacity '+(A.dark??2200)+'ms cubic-bezier(.5,0,.9,.6)';dark.style.opacity=1;await wait((A.dark??2200)+250);
   const to=m.exits?.right?.to;
   if(to)await go(to,{side:'right'});
  }finally{
   autoOn=false;W.lock=false;main.classList.remove('auto');
   dark.style.transition='opacity '+(A.reveal??1600)+'ms ease-out';dark.style.opacity=0;idleSince=performance.now();}}
 W.runAuto=runAuto;

 // ---- moving: Walk Left's glide and landing, across the memory's stops ----
 const T={s:0,goal:0,pan:0,landing:null,lastDir:0,lastIn:-1e9,holding:false,reached:0};W.track=T;
 // "oneWay": from where the visitor arrives there is no going back. Pushing back resists a little and springs forward again,
 // and the way out behind (exits.left) is never taken. The furthest stop reached is the floor.
 const oneWay=()=>!!W.memory?.oneWay;
 // "firstStop": where the memory begins for a visitor (earlier stops are kept for the studio only). Back past it is the way out behind.
 const firstOf=()=>W.memory?.firstStop??0;
 const floorOf=()=>Math.max(firstOf(),oneWay()?T.reached:0);
 const OVER=.6,EXIT=.15,PAN_K=.35,LIMIT=.06;   // past the last stop: a pull of about a twelfth of the screen carries on into the next memory; the picture gives up to 6% as you pull
 const soft=v=>Math.sign(v)*LIMIT*(1-Math.exp(-Math.abs(v)/LIMIT));
 let idleSince=0,lean=null;
 function input(ds){const n=stops(W.memory).length;T.goal=clamp(T.goal+ds,oneWay()?T.reached-.25:firstOf()-OVER,n-1+OVER);T.landing=null;T.lastDir=Math.sign(ds)||T.lastDir;T.lastIn=performance.now();idleSince=T.lastIn;lean=null;}
 function camAt(s){const st=stops(W.memory),n=st.length;const c=clamp(s,0,n-1);
  if(W.memory?.kind==='strip')return stripCam(c,st);
  if(n<2)return {x:st[0].x||0,y:st[0].y||0,zoom:st[0].zoom||1};const i=Math.min(n-2,Math.floor(c)),t=smooth(c-i),a=st[i],b=st[i+1];
  return {x:(a.x||0)+((b.x||0)-(a.x||0))*t,y:(a.y||0)+((b.y||0)-(a.y||0))*t,zoom:(a.zoom||1)*Math.pow((b.zoom||1)/(a.zoom||1),t)};}
 // a strip (Walk Left's way): the view slides along the world between stops. Two neighbouring stops with
 // the same "moment" name are one moment seen from two angles: the view holds and crossfades between them.
 function stripCam(c,st){const S=scene.settings,n=st.length,H=W.memory.height||1500;
  // a stop's "show": more than 1 zooms out from its frame (less cropped), less than 1 moves in
  const fitOf=p=>Number.isFinite(p?.fit)?p.fit:(W.memory.fit||0);   // how much of a picture shows: 0 fill the screen, 1 the whole picture
  const fr=p=>{const f=p.frame||[(p.x??H)-H*.7,0,H*1.4,H],k=p.show||1;return k===1?f:[f[0]+f[2]/2-f[2]*k/2,f[1]+f[3]/2-f[3]*k/2,f[2]*k,f[3]*k];};
  const lerp=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
  const i=Math.min(n-2,Math.max(0,Math.floor(c))),a=st[i],b=st[Math.min(n-1,i+1)];
  if(n<2){S.moment=null;const f=fr(a);return {frame:f,x:f[0]+f[2]/2,s:c,fit:fitOf(a),keep:a.keep?{a:a.keep,b:a.keep,t:0}:null};}
  const t=smooth(c-i),fa=fr(a),fb=fr(b);
  if(a.moment&&a.moment===b.moment&&t>0&&t<1){const d=W.memory.momentDrift??.12;
   const grow=(f,k,dx)=>{const w=f[2]*(1-.04*k),h=f[3]*(1-.04*k);return [f[0]+(f[2]-w)/2+dx,f[1]+(f[3]-h)/2,w,h];};
   const A=grow(fa,t,fa[2]*d*t),Bf=grow(fb,1-t,-fb[2]*d*(1-t));
   S.moment={a:{frame:A,s:c},b:{frame:Bf,s:c},t};const f=t<.5?A:Bf;return {frame:f,x:f[0]+f[2]/2,s:c};}
  S.moment=null;const f=lerp(fa,fb,t);return {frame:f,x:f[0]+f[2]/2,s:c,fit:fitOf(a)+(fitOf(b)-fitOf(a))*t,keep:(a.keep||b.keep)?{a:a.keep,b:b.keep,t}:null};}
 // a stop can carry its own look (Walk Left: warm inside the house, cool out on the street); it blends between stops
 function lookAt(s){const m=W.memory,st=m?.stops||[];if(!st.some(p=>p.look))return;const base=look(m),n=st.length,c=clamp(s,0,n-1),i=Math.min(Math.max(0,n-2),Math.floor(c)),t=n<2?0:smooth(c-i);
  const a=st[i]?.look||{},b=st[Math.min(n-1,i+1)]?.look||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const va=a[k]??base[k],vb=b[k]??base[k];scene.settings.look[k]=va+(vb-va)*t;}}
 const flip=()=>W.memory?.direction==='left'?-1:1;   // "direction": "left" for a memory walked right to left (Walk Left): the picture still follows the finger, so dragging right goes on
 function overshoot(s){const n=stops(W.memory).length,f=floorOf();return s<f?s-f:s>n-1?s-(n-1):0;}
 function applyCam(){const S=scene.settings;S.cam=camAt(T.s);lookAt(T.s);T.pan=soft(overshoot(T.s)*PAN_K)*flip();S.pan=T.pan;scene.changed();}
 W.goStop=i=>{T.s=T.goal=i;T.landing=i;T.reached=i;applyCam();};
 W.refresh=()=>{applyCam();};
 function release(){T.holding=false;const o=overshoot(T.goal);
  if(Math.abs(o)>EXIT){const side=o<0?'left':'right';if(!(side==='left'&&oneWay())&&T.guard?.side!==side&&W.memory?.exits?.[side]?.to){travel(side);return;}}
  const n=stops(W.memory).length;if(o)T.goal=clamp(T.goal,floorOf(),n-1);}
 let downX=null,downY=null,moved=0,holdX=null,pressX=null;
 main.addEventListener('pointerdown',e=>{if(!started||!free||busy||W.lock||e.button>0||e.target.closest('.timeline'))return;downX=e.clientX;downY=e.clientY;holdX=e.clientX;pressX=e.clientX;moved=0;T.holding=true;main.classList.add('held');try{main.setPointerCapture(e.pointerId);}catch{}});
 main.addEventListener('pointermove',e=>{
  if(downX!=null){holdX=e.clientX;const dx=e.clientX-downX;moved+=Math.abs(dx)+Math.abs(e.clientY-downY);downX=e.clientX;downY=e.clientY;input(-dx/main.clientWidth*1.8*flip());}
  else if(free&&!W.lock){const h=hit(e.clientX,e.clientY);main.classList.toggle('door',h?.kind==='door');}});
 const up=e=>{if(downX==null)return;downX=null;holdX=null;pressX=null;main.classList.remove('held');
  if(moved<6){T.holding=false;const h=hit(e.clientX,e.clientY);if(h){h.kind==='door'?enterDoor(h.item):enterEgg(h.item);return;}}
  release();};
 main.addEventListener('pointerup',up);main.addEventListener('pointercancel',up);
 let wheelT=0;
 addEventListener('wheel',e=>{if(!free||busy||W.lock||e.target.closest('.studio,.timeline'))return;const side=Math.abs(e.deltaX)>Math.abs(e.deltaY);input((side?e.deltaX*flip():e.deltaY)*.0011);T.holding=true;clearTimeout(wheelT);wheelT=setTimeout(release,240);},{passive:true});
 addEventListener('keydown',e=>{if(!free||busy||W.lock||W.studio||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.closest?.('.studio'))return;
  const fwd=['ArrowDown','PageDown',' '].includes(e.key),bk=['ArrowUp','PageUp'].includes(e.key);
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'||fwd||bk){if(fwd||bk)e.preventDefault();const d=fwd?1:bk?-1:(e.key==='ArrowRight'?1:-1)*flip();const n=stops(W.memory).length,r=Math.round(T.goal);
   if(d<0&&oneWay()&&r<=T.reached){input(-.12);setTimeout(release,240);}
   else if((d>0&&r>=n-1)||(d<0&&r<=firstOf())){if(W.memory?.exits?.[d>0?'right':'left']?.to&&T.guard?.side!==(d>0?'right':'left'))travel(d>0?'right':'left');else{input(d*.25);setTimeout(release,240);}}
   else{T.goal=r+d;T.landing=r+d;T.lastIn=performance.now();}}});
 function frame(now){requestAnimationFrame(frame);if(!scene||busy||!W.memory)return;
  const dt=Math.min(64,now-(frame.t||now));frame.t=now;const L=scene.settings.look,n=stops(W.memory).length;
  // landing: a moment after letting go, come to rest on the nearest stop (in the direction of travel)
  if(!T.holding&&now-T.lastIn>(L.landWait??480)){if(T.landing==null)T.landing=clamp(Math.round(T.goal+T.lastDir*(L.landReach??.32)),floorOf(),n-1);   // a drag of about a fifth of a stop is enough to reach the next one
   if(T.landing>T.reached)T.reached=T.landing;
   T.goal+=(T.landing-T.goal)*(1-Math.exp(-dt/(L.landEase??650)));}
  // weight to the distance: holding the button, the nearer the pointer is to an edge the faster the memories stream past
  // (near the edge the memory runs toward goes on); the middle of the screen is still, just the drag
  // it only streams toward the edge the drag is heading for: a swipe that starts near one edge and moves away from it is just a drag
  if(holdX!=null&&moved>6&&!W.lock){const r=main.getBoundingClientRect(),d=(holdX-r.left)/r.width-.5,m=clamp((Math.abs(d)-(L.edgeStill??.14))/(.5-(L.edgeStill??.14)),0,1);
   if(m>0&&Math.sign(holdX-pressX)===Math.sign(d)&&Math.abs(holdX-pressX)>8)input(-Math.sign(d)*flip()*(m*m)*(L.edgeSpeed??2.2)*dt/1000);}
  const prev=T.s;T.s+=(T.goal-T.s)*(1-Math.exp(-dt/(L.glide??260)));
  // the picture resists past the ends; resting at the end of a memory, it leans once toward what comes next and settles
  let pg=soft(overshoot(T.s)*PAN_K)*flip();
  const atEnd=Math.round(T.s)>=n-1&&!!W.memory.exits?.right?.to,canGo=Math.round(T.s)<n-1||atEnd;
  // resting anywhere the story goes on, the picture leans once the way it goes
  if(free&&!T.holding&&atEnd&&n===1&&Math.abs(T.goal-T.s)<.002&&now-idleSince>4500){if(!lean)lean=now;const t=(now-lean)/2600;
   if(t<1)pg=.022*flip()*Math.sin(Math.PI*t)**2;else{lean=null;idleSince=now+12000;}}
  if(T.guard&&Math.abs(T.s-T.guard.stop)>=.9){T.guard=null;T.hint=0;}
  glimpse.update(free&&atEnd&&!busy&&!autoOn,Math.max(0,overshoot(T.goal)));
  way.update(free&&!busy&&!autoOn&&((canGo&&!T.holding&&Math.abs(T.goal-T.s)<.004&&now-T.lastIn>2600)||(now<T.hint&&!T.holding)));
  const prevPan=T.pan;T.pan+=(pg-T.pan)*(1-Math.exp(-dt/(T.holding?60:300)));
  const S=scene.settings,before=S.cam,cam=camAt(T.s);
  if(W.memory?.kind==='strip'&&!busy&&!autoOn){const mo=S.moment;scene.aim(camAt(T.landing??T.goal));S.moment=mo;}   // where the view is heading (its pictures load first); asking must not end a moment's crossfade   // where the view is heading: its pictures load first
  const c=scene.crop(),momentMove=S.moment?((T.s-prev)*.6):0;
  const moveScreens=(S.moment?momentMove:((cam.x-(before.x||0))/Math.max(.05,c[0])))+(T.pan-prevPan);
  const v=Math.abs(moveScreens)/Math.max(.001,dt/1000);
  S.motion.amt=v>.02?v:0;S.motion.dir=-Math.sign(moveScreens)||1;
  if(Math.abs(T.s-prev)>1e-5||Math.abs(T.pan-prevPan)>1e-6||S.motion.amt){S.cam=cam;S.pan=T.pan;lookAt(T.s);scene.changed();}
  // a stop can carry one of Ethel's lines
  const at=Math.round(T.s);if(Math.abs(T.s-at)<.02){if(at>T.reached)T.reached=at;if(at!==frame.atStop){frame.atStop=at;const line=stops(W.memory)[at]?.line;if(line&&!voice.playing())voice.say(line);}}
  else if(Math.abs(T.s-at)>.3)frame.atStop=null;}

 // ---- the way on: a blurred glimpse of the next memory breathes at the forward edge, brighter as the visitor pushes toward it ----
 const glimpse=(()=>{const el=document.createElement('div');el.className='ahead';el.setAttribute('aria-hidden','true');el.innerHTML='<i></i>';main.appendChild(el);
  const img=el.querySelector('i');let src='';
  return {set(m,next){const side=m?.direction==='left'?'left':'right';el.classList.toggle('left',side==='left');el.classList.toggle('right',side==='right');
    const show=u=>{if(u!==src){src=u;img.style.backgroundImage=u?'url("'+u+'")':'none';}};
    if(next?.together)scene.resolve(next,m.exits.right.to,next.together,W.set).then(r=>show(r.url)).catch(()=>show(''));else show('');},
   update(on,push){on=on&&!!src;el.classList.toggle('on',on);el.style.setProperty('--push',on?Math.min(1,push/EXIT).toFixed(3):0);}};})();
 W.glimpse=glimpse;
 // ---- which way is forward: the cursor carries a spark on its forward side, and when the visitor pauses a glint of light
 //      runs along the bottom edge the way the story goes. Both change with the row (left to right, then right to left) ----
 const way=(()=>{const el=document.createElement('div');el.className='way';el.setAttribute('aria-hidden','true');el.innerHTML='<i></i>';main.appendChild(el);
  return {set(m){const left=m?.direction==='left';el.classList.toggle('left',left);main.dataset.forward=left?'left':'right';},update(on){el.classList.toggle('on',on);}};})();
 W.way=way;
 // ---- doors and eggs: spots in the picture ----
 function hit(x,y){const m=W.memory;if(!m)return null;const p=scene.toImage(x,y);if(!p)return null;
  const inR=r=>p[0]>=r[0]&&p[0]<=r[2]&&p[1]>=r[1]&&p[1]<=r[3];
  for(const d of m.doors||[])if(d.to&&inR(d.rect))return {kind:'door',item:d};
  for(const g of m.eggs||[])if(g.to&&inR(g.rect))return {kind:'egg',item:g};return null;}
 function enterDoor(d){const r=d.rect,c=scene.crop(),cam=scene.settings.cam;
  if(W.memory.kind==='strip'){const tot=W.memory._total,H=W.memory.height||1500,z=clamp(Math.min(c[0]/((r[2]-r[0])*tot),c[1]/((r[3]-r[1])*H))*(cam.zoom||1)*.9,1.2,5);
   return go(d.to,{door:d,zoomTo:{x:(r[0]+r[2])/2*tot,y:(r[1]+r[3])/2*H,zoom:z}});}
  const f=W.memory.focal||[.5,.5];
  const z=clamp(Math.min(c[0]/(r[2]-r[0]),c[1]/(r[3]-r[1]))*(cam.zoom||1)*.9,1.2,5);
  go(d.to,{door:d,zoomTo:{x:(r[0]+r[2])/2-f[0],y:(r[1]+r[3])/2-f[1],zoom:z}});}
 let eggUntil=0;
 async function enterEgg(g){const now=performance.now();if(now<eggUntil||busy)return;eggUntil=now+30000+(g.seconds??6)*1000;
  const back={folder:W.folder,stop:Math.round(T.s)};
  await go(g.to,{egg:true,duration:g.cut??700});busy=true;
  setTimeout(async()=>{busy=false;voice.stop();await go(back.folder,{egg:true,stop:back.stop,duration:g.back??900});},(g.seconds??6)*1000);}
 W.enterEgg=enterEgg;W.enterDoor=enterDoor;

 // ---- the timeline: dates from Ethel as a child into a future that clears as it is reached ----
 const timeline=(()=>{const el=$('.timeline');if(!el)return {update(){},build(){}};
  const track=el.querySelector('.track'),knob=el.querySelector('.knob'),label=el.querySelector('.date'),marks=el.querySelector('.marks');
  const day=s=>new Date(s+'T00:00:00').getTime();
  const fmt=s=>new Date(s+'T00:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});
  let from=0,to=1,list=[],drag=false;
  const x=d=>(day(d)-from)/(to-from);
  function build(){const L=W.list,tl=L.timeline||{};list=L.memories.filter(m=>m.date&&!m.egg&&!m.hidden);
   from=day(tl.from||'2001-11-14');to=day(tl.to||'2027-12-31');
   const last=Math.max(...list.map(m=>day(m.date)));el.style.setProperty('--known',((last-from)/(to-from)*100)+'%');
   marks.innerHTML=list.map(m=>`<i class="${m.key?'key':''}" style="left:${x(m.date)*100}%"></i>`).join('');}
  function update(){if(!W.list)return;build();const m=list.find(m=>m.folder===W.folder);if(m&&!drag){knob.style.left=x(m.date)*100+'%';label.textContent=fmt(m.date);}}
  function nearest(px){const r=track.getBoundingClientRect(),f=clamp((px-r.left)/r.width,0,1);let best=null,bd=1e9;
   for(const m of list){const d=Math.abs(x(m.date)-f);if(d<bd){bd=d;best=m;}}return {f,m:best};}
  function grab(e){if(!free||busy||autoOn)return;drag=true;el.classList.add('dragging');try{knob.setPointerCapture(e.pointerId);}catch{}move(e);e.stopPropagation();e.preventDefault();}
  function move(e){if(!drag)return;const {f,m}=nearest(e.clientX);knob.style.left=f*100+'%';if(m)label.textContent=fmt(m.date);el.dataset.to=m?.folder||'';}
  function drop(){if(!drag)return;drag=false;el.classList.remove('dragging');const f=el.dataset.to;
   if(f&&f!==W.folder){const a=list.find(m=>m.folder===W.folder),b=list.find(m=>m.folder===f);
    const later=b&&a&&(b.date>a.date||(b.date===a.date&&(b.order??0)>(a.order??0)));
    go(f,{jump:true,kind:later?1:3,travel:later?-.07:.07});}else update();}
  knob.addEventListener('pointerdown',grab);track.addEventListener('pointerdown',grab);
  knob.addEventListener('pointermove',move);knob.addEventListener('pointerup',drop);knob.addEventListener('pointercancel',drop);
  // it shows itself only when the pointer comes near the bottom edge (or a finger touches there)
  addEventListener('pointermove',e=>{if(!free)return;el.classList.toggle('near',innerHeight-e.clientY<innerHeight*.14||drag);},{passive:true});
  addEventListener('pointerdown',e=>{if(free&&e.pointerType==='touch')el.classList.toggle('near',innerHeight-e.clientY<innerHeight*.2);},{passive:true});
  return {update,build};})();
 W.timeline=timeline;

 async function boot(){
  try{
   scene=SITTScene.create(canvas);voice=SITTVoice.create($('.caption'));
   W.scene=scene;W.voice=voice;
   W.list=await json('memories/list.json');
   const start=Q.get('memory')||W.list.start||W.list.memories[0].folder;
   await open(start);requestAnimationFrame(frame);
   // a start memory with no voice of its own opens straight onto the picture: no dark, no title (the veil stays in the page for later)
   if(!W.memory?.voice?.audio){veil.remove();skip.remove();started=true;handOver();}
   // the studio: ?tune=1, or always on your own computer (localhost) unless ?tune=0
   const local=/^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname);
   // the studio is only fetched when it is wanted, so visitors never download it
   if((Q.has('tune')&&Q.get('tune')!=='0')||(local&&Q.get('tune')!=='0')){const go=()=>window.SITTStudio?.start(W);
    if(window.SITTStudio)go();else{const sc=document.createElement('script');sc.src='engine/studio.js?r='+Date.now();sc.onload=go;document.body.appendChild(sc);}}
  }catch(e){console.error(e);main.classList.add('ready');note.textContent='Could not load: '+e.message;note.classList.add('on');}
 }
 boot();
})();

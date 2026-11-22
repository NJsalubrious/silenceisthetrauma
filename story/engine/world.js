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
 /* SITT_STORY_TESTING: the flow engine with the studio switched on and every memory in story/memories.
 * FLOW TEST (story/lab/flow): a copy of the story engine with four changes, the live story untouched.
 *  FLOW 2: starts at the beginning. Steps that only zoom (homestead: closer; the office) move at once, take less drag and
 *  land quickly. A held crossing keeps drifting on. The journey goes straight to the towel; Dominic's world is the wrong
 *  turn there: pushing the old way from the towel (the first time) drops into it, and it comes back to the towel.
  * 1. Crossing by hand: past the end of a memory the next one comes in only as fast as the visitor moves.
  *    Stop and it holds as a double exposure; pull back and it goes back; let go and it finishes in a moment.
  * 2. One way of crossing for every ordinary move (the same drift each time), and a drop through black into a zone.
  * 3. The approach to Dominic's world: over the last picture before it the drag grows heavier and the colour cools.
  *    Control is taken only once the visitor lets go and the picture comes to rest.
  * 4. Inside the zone the visitor can still lean the depth, and a push gives a little and springs back. Nothing is
  *    ever still: each picture creeps in while it holds. Control comes back only after the towel has come up out of
  *    the dark, and the cold eases out of the picture over a few seconds. */
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
 // ERA: a memory of the earlier story ("era": "earlier" in its memory.json) moves, crosses and speaks as the earlier engine did; any other is the later story's
 const early=m=>/[?&]era=1/.test(location.search)&&m?.era==='earlier',E=()=>early(W.memory);
 W.early=early;
 // TESTING: the layers a shot really draws: in view at its frame (the part the screen shows), and not left out of it ("stops")
 W.shotLayers=(s=Math.round(T.s))=>{const m=W.memory;if(!m)return [];const p=stops(m)[s],cur=scene?.current?.(),off=l=>Array.isArray(l.stops)&&!l.stops.includes(s),all=m.layers.map((l,i)=>[l,i]);
  if(!cur?.strip||!p?.frame)return all.filter(([l])=>!off(l));
  const v=scene.view({frame:p.frame,fit:p.fit,keep:p.keep?{a:p.keep,b:p.keep,t:0}:null,s});if(!v)return all.filter(([l])=>!off(l));   // the exact view the engine draws for this shot
  const x0=v.cx-v.vw/2,x1=v.cx+v.vw/2,min=v.vw*.02;
  return all.filter(([l])=>{if(off(l))return false;const d=cur.layers.find(c=>c.layer===l);return !d||Math.min(x1,d.X0+d.W)-Math.max(x0,d.X0)>min;});};

 // ---- opening a memory ----
 // FLOW: where a memory lives: the new scenes in lab/flow/memories, the rest in the story's memories
 const HERE=new Set(),memDir=f=>'memories/'+f;   // TESTING: every memory (flow and story) lives in story/memories
window.SITT_MEMDIR=memDir;let prevVoiceFade=false,stopVoice=null,stopBed=null;
 // TESTING: a joined strip ("join": [memory folders]) is made here, each time it opens, from those memories side by side,
 // so the view slides from one to the next like the sections of Ethel at school instead of cutting. Each one stays its own
 // memory and folder: its pictures, stops and voice are read from it, and its pictures' real sizes place it, so a PNG saved
 // at a new size just moves everything after it along. A memory of another height is scaled to the strip's height
 // ("height", or the tallest of them). The first one's voice is the strip's; the others' play on their first stop.
 // The joined memory.json itself only holds what is its own (title, date, depth, look, cut, exits...): see W.joinSpec.
 // a memory's opening voice: one file (audio, with timed lines) or its lines as separate clips (parts), played in turn
 function hasVoice(v){return !!(v?.audio||v?.parts?.length);}
 const JOINED=['sections','layers','stops','voice'];
 async function joinUp(spec){
  const parts=await Promise.all(spec.join.map(async f=>({f,m:await json(memDir(f)+'/memory.json')})));
  const H=spec.height||Math.max(...parts.map(p=>p.m.height||1500)),first=parts[0].m,last=parts.at(-1).m;
  const m={depth:first.depth,look:first.look,cut:first.cut,...spec,kind:'strip',height:H,sections:[],layers:[],stops:[]};
  if(!spec.exits)m.exits={left:first.exits?.left||{to:null},right:last.exits?.right||{to:null}};
  const startAt=spec.startAt&&spec.join.includes(spec.startAt)?spec.startAt:spec.join[0];   // TESTING: "startAt": the memory the strip opens in
  let X=0;
  for(const [i,{f,m:p}] of parts.entries()){
   const h=p.height||1500,k=H/h,secs=p.sections?.length?p.sections:[{name:p.title,width:h*1.6}],base=m.sections.length;
   // each section's width from its background's real size, the way a strip measures its own (scene.js layout)
   const sizes=await Promise.all(secs.map((s,j)=>{const bg=(p.layers||[]).find(l=>(l.section||0)===j&&!l.rect);if(!bg)return null;
    const mm=bg.folder?{...p,desktopFolder:bg.desktopFolder,mobileFolder:bg.mobileFolder}:p;
    return scene.resolve(mm,bg.folder||f,bg.image,'desktop',W.source).then(r=>r.info?.w?[r.info.w,r.info.h]:null).catch(()=>null);}));
   let run=0;const geo=secs.map((s,j)=>{const sz=sizes[j],w=sz?sz[0]*h/sz[1]:(s.width||h*1.6),x0=Number.isFinite(s.x)?s.x:run;run=Math.max(run,x0+w);return {x0,w};});
   if(!p.sections?.length){const r=Math.max(0,...(p.layers||[]).filter(l=>l.rect&&!l.insert).map(l=>l.rect[0]+l.rect[2]));if(r){geo[0].w=r;run=Math.max(run,r);}}   // a reel: as long as its placed pictures
   if(Number.isFinite(p.extent))run=Math.max(run,p.extent);
   const at=v=>X+v*k;
   secs.forEach((s,j)=>m.sections.push({...s,name:s.name||p.title,x:at(geo[j].x0),width:geo[j].w*k}));
   const s0=m.stops.length,sh=v=>Number.isFinite(v)?v+s0:v;   // a layer's own stop numbers count from this part's first stop in the joined strip
   for(const l of p.layers||[]){const c={...l,section:base+(l.section||0),folder:l.folder||f};if(l.rect)c.rect=[at(l.rect[0]),l.rect[1]*k,l.rect[2]*k,l.rect[3]*k];
    if(Array.isArray(l.stops))c.stops=l.stops.map(sh);if(l.follow)c.follow={...l.follow,at:sh(l.follow.at),from:sh(l.follow.from),to:sh(l.follow.to)};if(l.insert)c.insert={...l.insert,stop:sh(l.insert.stop)};
    m.layers.push(c);}
   const own=stops(p).map(st=>{const c={...st,from:f};delete c.x;delete c.y;delete c.zoom;
    c.frame=st.frame?[at(st.frame[0]),st.frame[1]*k,st.frame[2]*k,st.frame[3]*k]:[X,0,run*k,H];return c;});
   if(f===startAt){m.startStop=m.stops.length;if(!spec.voice&&p.voice)m.voice=p.voice;if(!spec.sound&&p.sound)m.sound=p.sound;}   // it opens here, with this memory's voice (and its sound after it)
   else if(spec.handover?.[f]){}   // STRIP 02: a part that hands over (the arrival) keeps its voice and sounds for the memory it hands over to
   else if(p.voice&&!own[0].voice)own[0].voice=p.voice;   // the others' voices play on their first stop
   if(p.sound?.after)for(const [j,c] of own.entries())if(!Array.isArray(p.sound.stops)||p.sound.stops.includes(j))c.sound=p.sound;   // sound.stops: only on those of its own stops (the crash: its background is scene 1's; it fades as scene 2 begins)
   // each memory's sounds (cues) on its own stops, its stop numbers moved to where they sit in the joined strip
   if(p.cues?.list?.length&&!spec.handover?.[f]){if(!m.cues||m.cues===spec.cues)m.cues={...(spec.cues||{}),library:spec.cues?.library||'audio/',list:[...(spec.cues?.list||[])]};if(!m.cues.duck&&p.cues.duck)m.cues.duck=p.cues.duck;
    for(const q of p.cues.list)m.cues.list.push({...q,library:q.library||p.cues.library||'audio/',stops:Array.isArray(q.stops)?q.stops.map(sh):q.stops});}   // its sound bed plays on its own stops (after its voice), as when it was its own memory
   if(Number.isFinite(p.momentDrift)&&!Number.isFinite(m.momentDrift))m.momentDrift=p.momentDrift;
   m.stops.push(...own);X+=run*k;}
  m.extent=X;Object.defineProperty(m,'joinSpec',{value:spec,enumerable:false});
  return m;}
 // a memory as the story shows it (a joined strip made up from its parts)
 const load=async f=>{const m=await json(memDir(f)+'/memory.json');return m.join?joinUp(m):m;};
 W.load=load;
 // TESTING: after a PNG is saved, a joined strip is made again (its pictures' sizes may have changed) and reloaded where it was
 W.rejoin=async()=>{if(!W.memory?.joinSpec)return false;const s=T.s;scene.forget();const m=await load(W.folder);W.memory=m;
  await scene.reload(m,{folder:W.folder,set:W.set,source:W.source});T.s=T.goal=Math.min(s,stops(m).length-1);applyCam();return true;};
 // TESTING: which joined strip each memory lives in (from the story's visible joined strips)
 const joinOf=new Map();
 async function indexJoins(){for(const e of W.list?.memories||[]){if(e.hidden)continue;try{const j=await json(memDir(e.folder)+'/memory.json');if(Array.isArray(j.join))for(const f of j.join)if(!joinOf.has(f))joinOf.set(f,e.folder);}catch{}}}   // STRIP 02: a memory in two strips (the arrival) belongs to the first (the earlier story)
 W.joinOf=joinOf;
 // TESTING: the first picture is shown whole: every layer of the opening shot fully loaded (given up after 45 s)
 async function whole(){const t0=performance.now();for(;;){const cur=scene.current?.(),want=new Set((W.shotLayers?.(Math.round(T.s))||[]).map(([l])=>l));
   const ls=(cur?.layers||[]).filter(l=>want.has(l.layer));if(ls.length&&ls.every(l=>l.state==='ready'||l.state==='failed'))return;if(performance.now()-t0>45000)return;
   scene.aim(camAt(T.s));scene.changed();await new Promise(r=>setTimeout(r,120));}}
 async function open(folder,how=null){
  if((how?.side||how?.push)&&joinOf.has(folder)){const jf=joinOf.get(folder),jm=await load(jf),own=jm.stops.map((p,i)=>p.from===folder?i:-1).filter(i=>i>=0);   // walked into a memory that is part of a joined strip: arrive at its stops there
   if(own.length){const named=how.stopName!=null?jm.stops.findIndex(p=>p.from===folder&&p.name===how.stopName):-1;   // a way in that names its stop (a sequence landing back in the strip)
    return open(jf,{...how,stop:named>=0?named:how.side==='left'?own.at(-1):own[0]});}}
  if(prevVoiceFade)voice.fade(450);   // FLOW: leaving a scene, her voice fades out (finished or not)
  songOut();stopCuesOut();cueHold=true;   // a song over a stretch stops when its memory is left
  const memory=await load(folder);stopVoice=null;stopBed=null;frame.atStop=null;frame.told=null;memVoiceAt=null;
  // a sequence that plays by itself ("auto") is seen once per visit; after that the way on goes straight past it
  if(memory.auto&&seen.has(folder)&&how&&!how.goto&&how.side!=='left'&&memory.exits?.right?.to)return open(memory.exits.right.to,how);   // (a jump from the UI goes where it is sent)
  if(folder==='2008-07-01_before-the-crash')memory.exits.left={to:'2008-07-01_the-opening',style:'push'};   // FLOW: back from Gran and Pop's world goes to the opening scenes (TESTING: now one joined strip)
  if(folder==='2019-03-05_the-journey'&&memory.exits?.right)memory.exits.right={to:'2019-03-05_the-glass-house',style:'push'};   // FLOW: the zone is the wrong turn at the towel now
  const prev=W.memory;
  if(memory.auto&&how&&(how.side||how.push)){W.lock=true;main.classList.add('auto');cue(memory,'enter');}   // walked into a sequence that plays by itself: hands off from the first frame (and its sound comes in)
  if(!W.memory&&memory.together)scene.resolve(memory,folder,memory.together,W.set).then(r=>{poster.src=r.url;}).catch(()=>{});
  scene.aim(null);
  const S=scene.settings;
  Object.assign(S,{opening:1,light:2,response:null,overscan:null},memory.depth||{});
  S.look=look(memory);
  W.memory=memory;W.folder=folder;cueHold=!!how?.sharp;   // a sharp return (the towel after the wrong turn): its sounds wait until the shot is on screen
  voice.classic=early(memory);   // ERA: an earlier memory's next line cuts one still fading, as it did there
  try{const C=memory.cues;if(C?.list)for(const q of C.list)if(q.stops&&q.file)SITTSound.preload((C.library||'audio/')+q.file.split('/').map(encodeURIComponent).join('/'));}catch{}   // decoded ahead, so a stop's sounds land on time   // the stop sounds wait while one memory gives way to the next, then the new one's may start

  // where the view starts: a given stop, the near end when arriving from a side, or the first stop
  const n=stops(memory).length;
  T.s=T.goal=how?.stop??(how?.side==='left'?n-1:how?.side==='right'?(memory.arriveStop??0):(memory.startStop??0));T.landing=null;T.reached=T.s;
  if(how?.goto){T.s=T.goal=T.reached=clamp(Math.round(T.s)||0,0,n-1);}   // a jump from the UI: any stop it names, kept inside the memory
  // where the row turns (the towel), the way just come in is closed until the visitor has moved one stop the new way,
  // so the old habit springs back instead of carrying them out again; the glint shows the new way at once
  const turned=!!(prev&&how&&(how.side||how.push)&&!memory.auto&&(prev.direction==='left')!==(memory.direction==='left'));
  T.guard=turned?{side:how.side==='left'?'right':'left',stop:T.s}:null;T.hint=turned?performance.now()+5000:0;T.lastDir=0;
  let cut={};
  if(how?.sharp){cut={};}   // TESTING: a sharp return (a zone's "sharp"): no crossing at all, the picture is simply there
  else if(how?.push||how?.jump){cut=arrival(memory,how);}   // forward or back, or a jump on the timeline: a dream cut, never a swipe
  else if(how?.side==='left'||how?.side==='right'){cut=arrival(memory,how);}
  else if(how?.door){cut={kind:0,duration:how.door.duration??1400,zoomTo:how.zoomTo};}
  else if(how?.egg){cut={kind:0,duration:how.duration??700};}
  const startCam=camAt(T.s);scene.settings.moment=null;
  const shown=scene.show(memory,{folder,set:W.set,source:W.source,cam:startCam},cut);
  if(!how||how.goto){await shown;await whole();}   // the first picture, or a jump from the UI: shown whole
  main.classList.add('ready');
  if(memory.sound?.after){SITTSound.preload(memory.sound.after);if(bed&&bed.url!==memory.sound.after){bed=SITTSound.fadeTo(bed,memory.sound.after,(({fadeIn,...o})=>o)(bedOpts(memory.sound)));W.bed=bed;}else if(!bed&&how&&free)startBed();}
  else if(bed&&how){bed.fadeOut(3);bed=null;W.bed=null;}   // a memory with no sound of its own is quiet (its sound comes later)
  if(how){await shown;if(how.sharp){if(!early(memory))await whole();cueHold=false;}applyCam();if(!(how.goto&&how.stop!=null)&&!how.back&&voice.load(memory.voice))voice.play();}   // ERA: an earlier sharp return is there at once (its sequences time their own cuts), not held for the whole picture; a jump to a named stop: no opening voice
  else{applyCam();if(voice.load(memory.voice)){voice.onEnd=()=>{handOver();startBed();};}else{handOver();startBed();}}
  ahead(memory);timeline.update();glimpse.set(memory,null);way.set(memory);
  W.nextAuto=false;W.nextBlend=false;if(memory.exits?.right?.to){const nf=memory.exits.right.to;load(nf).then(n=>{if(W.memory===memory){glimpse.set(memory,n);W.nextAuto=!!n.auto&&!seen.has(nf);W.nextBlend=W.nextAuto&&!!DREAM[n.cut?.style]&&!early(n);}}).catch(()=>{});}   // nextBlend: the sequence ahead has its own dream cut   // ERA: the arriving memory's: an earlier sequence ahead is always crossed by hand
  dispatchEvent(new CustomEvent('sitt:memory',{detail:{memory,folder}}));
  if(memory.auto&&how&&(how.side||how.push))setTimeout(()=>runAuto(memory,folder),0);   // walked into: it plays (opened from the studio: it holds still to be tuned)
  return memory;}
 W.open=open;
 // warm up the memories either side (and behind doors), so going there starts at once
 const warmed=new Set();
 function ahead(memory){const fs=[memory.exits?.left?.to,memory.exits?.right?.to,...Object.values(memory.joinSpec?.handover||{}),   // STRIP 02: the memory a part hands over to, warmed so the handover is unseen
...(memory.doors||[]).map(d=>d.to),memory.id==='the-glass-house'?ZONE:null,...stops(memory).map(p=>p.sequence)].filter(Boolean);   // the glass house: also the wrong turn's zone; a stop's sequence too
  const named={};for(const sd of ['left','right']){const e=memory.exits?.[sd];if(e?.to&&e.stop)(named[e.to]=named[e.to]||[]).push(e.stop);}   // a way out that lands on a named stop: that stop's pictures too
  for(const f of fs){if(warmed.has(f))continue;warmed.add(f);
   load(f).then(m=>{if(f===ZONE){zoneBlend=!!DREAM[m.cut?.style];zoneMem=m;}const n=stops(m).length,at=(named[f]||[]).map(nm=>stops(m).findIndex(p=>p.name===nm)).filter(i=>i>=0);
    const fa=m.auto?.film?.audio;if(fa&&window.SITTSound)SITTSound.preload((m.cues?.library||'audio/')+fa.split('/').map(encodeURIComponent).join('/'));   // a film's music decoded ahead, so its first cut lands on time
    scene.warm(m,{folder:f,set:W.set,source:W.source},m.auto?[...Array(n).keys()]:[...new Set([m.startStop??0,0,n-1,...at])]);}).catch(()=>warmed.delete(f));}}
 async function go(folder,how){if(!folder||busy)return false;busy=true;prevVoiceFade=true;T.raw=0;scene.settings.motion.amt=0;
  try{await open(folder,how);}finally{prevVoiceFade=false;busy=false;X.fresh=true;scene.settings.pan=0;T.pan=0;idleSince=performance.now();if(X.on){X.on=false;X.flip=0;X.finishing=false;delete window.SITT_CUT_T;dark.style.transition='none';dark.style.opacity=autoOn||W.lock?dark.style.opacity:0;}}return true;}
 W.go=go;
 // ---- how a memory arrives: each one through its own dream cut (memory.json "cut.style"), never the same twice running ----
 const DREAM={drift:{kind:11,ms:2300,label:'Drift: the view travels on and the next memory comes through it'},ink:{kind:4,ms:2300,label:'Ink in water'},flare:{kind:5,ms:2000,label:'Flare: it overexposes and burns through'},double:{kind:6,ms:2500,label:'Double exposure: light first, shadows last'},
  fracture:{kind:7,ms:1600,label:'Fracture: bands slip out of time'},pull:{kind:8,ms:1900,label:'Pulled in toward a face'},flicker:{kind:9,ms:2100,label:'Flicker: it keeps slipping back'},
  underwater:{kind:10,ms:2700,label:'Under water'},depth:{kind:0,ms:1500,label:'Through the depth (plain)'}};
 W.DREAM=DREAM;
 // every memory has its own drift, the same each time you arrive there and unlike its neighbours': angle, blots, haze, pace, push-in
 const hashOf=t=>{let h=2166136261;for(const ch of String(t))h=Math.imul(h^ch.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
 const rnd=(f,k)=>hashOf(f+'#'+k);
 function arrival(m,how){
  const f=(m.faces||[])[0],focal=f?[f[0],1-f[1]]:[(m.focal||[.5,.5])[0],1-(m.focal||[.5,.5])[1]];
  const back=how?.side==='left'||(how?.jump&&how.kind===3);
  const fromDir=W.memory?.direction==='left'?-1:1,toDir=m.direction==='left'?-1:1,turn=fromDir!==toDir;
  const along=turn?0:fromDir*(back?-1:1),tilt=turn?(back?-1:1):0;
  if(early(m)){   // ERA: the crossing is the arriving memory's: an earlier memory arrives as it did there
   if(m.auto)return {kind:0,duration:900,zoomTo:null,focal,settle:0,travel:0,drift:null};   // into a zone: through the depth, under the dark
   if(m.cut?.style==='blend')return {kind:12,duration:m.cut.duration??180,settle:0,travel:0};
   const own=DREAM[m.cut?.style];   // STORYTELLING: a memory can name its own dream cut, and how long it takes
   if(own)return {kind:own.kind,duration:(m.cut.duration??own.ms)*(window.SITT_PACE||1),zoomTo:null,focal,settle:m.cut.settle??.04,travel:along*.06,drift:[along,tilt,.45,.5,3.7],seed:rnd(m.id||'',1)*10};}
  else if(m.auto){const d=DREAM[m.cut?.style];if(d)return {kind:d.kind,duration:m.cut.duration??d.ms,zoomTo:null,focal,settle:.04,travel:0,drift:null};   // into a zone with its own dream cut (cut.style): it blends in, no dark
   return {kind:0,duration:900,zoomTo:null,focal,settle:0,travel:0,drift:null};}   // into a zone: through the depth, under the dark
  return {kind:11,duration:1500,zoomTo:null,focal,settle:.04,travel:along*.06,drift:[along,tilt,.45,.5,3.7]};}   // every ordinary crossing: the same drift
 // a way out can slide sideways into the next memory, or push forward through the picture into it ("style": "push")
 function travel(side){const m=W.memory,ex=m?.exits?.[side];if(!exitTo(side))return false;
  if(side==='right'&&ex.to===ZONE&&!seen.has(ZONE))return wrongTurn(false);   // FLOW (linear): on from Isla is the wrong turn, the way it played at the towel (its stillness, its sound, the flare), landing on the towel
  if(ex.style!=='push')return go(ex.to,{side});
  let zoomTo=null;if(side==='right'){const c=scene.settings.cam,z=m.cut?.push??ex.zoom??1.6;
   if(m.kind==='strip'){const f=c.frame||[0,0,1,m.height||1500];zoomTo={x:f[0]+f[2]/2,y:f[1]+f[3]/2,zoom:z};}else zoomTo={x:c.x||0,y:c.y||0,zoom:(c.zoom||1)*z};}
  return go(ex.to,{side,push:true,zoomTo});}
 W.travel=travel;
 // STRIP 02 (21 Nov): the unseen handover (see "handover" in the update): the same stop of the memory the part belongs to, with no
 // crossing (sharp), its voice then playing as on arriving there; the depth's settings ease over (no jump), the glint shows the way on
 let handing=false;
 async function handOverTo(f,p){if(handing)return;handing=true;const from=W.folder,S0={...scene.settings};
  try{const m=await load(f),k=stops(m).findIndex(q=>q.from===p.from&&q.name===p.name),i=k>=0?k:stops(m).findIndex(q=>q.from===p.from);
   if(i<0||W.folder!==from)return;
   await go(f,{sharp:true,stop:i,handover:true});
   const S=scene.settings,keys=['strength','vertical'].filter(n=>Number.isFinite(S0[n])&&Number.isFinite(S[n])&&S0[n]!==S[n]),to=Object.fromEntries(keys.map(n=>[n,S[n]])),t0=performance.now();
   for(const n of keys)S[n]=S0[n];
   if(keys.length){const ease=()=>{const t=Math.min(1,(performance.now()-t0)/1200),e=t*t*(3-2*t);for(const n of keys)S[n]=S0[n]+(to[n]-S0[n])*e;scene.changed?.();if(t<1)requestAnimationFrame(ease);};requestAnimationFrame(ease);}
   T.hint=performance.now()+5000;
  }finally{handing=false;}}

 // ---- the sound bed: after her voice, the memory's loop plays for as long as the visitor stays ----
 // sound.afterLine: n — the bed comes in once her line n (from 0) has ended, not after all of them (the crash: after her first line)
 function afterLineDone(S){const n=S?.afterLine;return Number.isInteger(n)?voice.ends.length>n:null;}
 // (a joined strip: the bed starts only on the stops that have it, not on another scene's; a seamless one (sound.join) is started by its stop, on the frame its main ends)
 function startBed(){const S=W.memory?.sound;if(!S?.after||bed)return;if(S.join&&W.memory.joinSpec)return;if(W.memory.joinSpec&&stops(W.memory)[Math.round(T.s)]?.sound?.after!==S.after)return;bed=SITTSound.bed(S.after,bedOpts(S));bed.start();W.bed=bed;}
 // sound.lines (22 Nov 2026): the words heard in a baked loop, captioned each time round (never over her voice, and only while the view rests on its own shot)
 function bedOpts(S){return {volume:S.volume??1,fadeIn:S.fadeIn??2.5,overlap:S.overlap??2.5,lines:S.lines||null,onLine:S.lines?l=>{if(voice.playing()||Math.abs(T.goal-T.s)>.05||W.memory?.joinSpec&&stops(W.memory)[Math.round(T.s)]?.sound?.after!==S.after)return;voice.say(l.text,Math.max(1200,((l.end??l.t+2.5)-l.t)*1000),!!l.echo);}:null};}
 // ---- the veil: the title on dark, until the visitor clicks ----
 function begin(e){
  if(started||e?.target?.closest?.('.studio,.skip'))return;
  started=true;const rev=hasVoice(W.memory?.voice)?(W.memory.voice.reveal??8.5):2.5;veil.style.transitionDuration=rev+'s';veil.classList.add('lifting');skip.classList.add('on');
  try{SITTSound.context().resume();}catch{}
  voice.play().then(ok=>{if(!ok){if(!hasVoice(W.memory?.voice)){handOver();startBed();setTimeout(()=>veil.remove(),(rev+.6)*1000);return;}   // a memory with no voice: the veil just lifts
    started=false;veil.classList.remove('lifting');return;}
   const h=W.memory?.voice?.handover,lead=W.memory?.sound?.startBeforeEnd??1.5;
   clearInterval(handTimer);handTimer=setInterval(()=>{const A=voice.audio;if(!A)return;
    if(Number.isFinite(h)&&A.currentTime>=h)handOver();
    if(afterLineDone(W.memory?.sound)??(A.duration&&!voice.left&&A.currentTime>=A.duration-lead))startBed();
    if(free&&bed)clearInterval(handTimer);},100);});
  setTimeout(()=>veil.remove(),(rev+.6)*1000);}
 veil.addEventListener('click',begin);
 addEventListener('keydown',e=>{if(!started&&(e.key==='Enter'||e.key===' ')&&!e.target.closest?.('.studio')){e.preventDefault();begin(e);}});
 skip.addEventListener('click',()=>{clearInterval(handTimer);voice.stop();veil.remove();started=true;try{SITTSound.context().resume();}catch{}handOver();startBed();});
 // ---- the handover: the picture becomes the visitor's, without a word ----
 let memVoiceAt=null;   // where the view was when the memory's own line began
 function handOver(){if(free)return;free=true;skip.classList.remove('on');setTimeout(()=>skip.remove(),900);main.classList.add('free');idleSince=performance.now();}
 W.handOver=handOver;

 // ---- a sequence that plays by itself ("auto" in memory.json): Dominic's world ----
 // The visitor has no say: dragging, scrolling and the keys do nothing (moving the mouse still steers the depth).
 // Each picture holds for its time and cuts hard to the next through a blink of black. After the last, it erodes
 // to darkness and the next memory (exits.right) comes up out of it. Control comes back with the reveal.
 // auto: {hold: ms or [ms per stop], flash: ms of black between, dark: ms to erode, reveal: ms to come up,
 //  pan: {from, to, ms}: pictures that join (a panorama) are not cut between: after holding at "from" the view travels on to "to" in one move,
 //  beats: [...]: instead of the stops in order, a glimpse in flashes: framings of the strip, each arriving by a cut, a black or
 //   white flick or a whip pan, held under a push in, a drift and an unsteady hand. A beat: {stop} (that stop's picture) or
 //   {at:[x,y], w} (a framing: its middle and its width, in the strip's pixels); hold ms; push (how much closer by the end);
 //   drift [x,y] (pixels over the hold); shake (pixels); in: cut | black | white | whip | smear | dissolve; inMs; blur (smear: how
 //   much the movement smears, 1 as a whip)}. dissolve: the last framing melts into this one as a double exposure, still drifting; sway (0 to 1): the depth tilts slowly that far over the
 //   hold, the way of the drift, and eases back in the next move (it adds to the hand's tilt)
 const seen=new Set();W.seen=seen;
 // ---- a memory's sound cues ("cues" in memory.json): sounds from the library (story/audio), each on a moment ----
 // cues: {library, list:[{on, beat, file, offset, gain, fadeIn, fadeOut, delay, until, rate, lowpass, highpass, reverb, double}]}
 //  on: push (the push that starts it), enter (the way in), exit (the way out), beat (with beat: its number, from 1, as it
 //  arrives) or a way of arriving (dissolve, smear, white, black, whip, cut: every beat that arrives so). offset: seconds into
 //  the file to start from (to land its peak on the moment). duration: seconds it may sound (then fadeOut); at the way out every
 //  cue still sounding fades (fadeOut, or 0.4 s), only the way out's own plays on. until: exit marks the long ones (beds, voice).
 const liveCues=new Set();
 function cue(m,ev,info={}){const C=m?.cues;if(!C?.list||!window.SITTSound?.play)return;const lib=C.library||'audio/';
  for(const q of C.list){const on=q.on;
   const hit=on===ev&&ev!=='beat'||ev==='beat'&&(on==='beat'?q.beat===info.beat:on===info.how&&(q.beat==null||q.beat===info.beat));
   if(!hit||!q.file)continue;
   const go=()=>SITTSound.play((q.library||lib)+q.file.split('/').map(encodeURIComponent).join('/'),q).then(h=>{if(on!=='exit')liveCues.add({h,q});}).catch(()=>{});   // every cue but the way out's own stops at the way out
   if(q.delay)setTimeout(go,q.delay*1000);else go();}}
 function cuesOut(){for(const {h,q} of liveCues)h.stop(q.fadeOut??.4);liveCues.clear();}
 W.cue=cue;
 // a stop's sounds (cues with stops: [first, last]): a bed (no once) sounds while the view is within half a stop of its stops, fading in
 // (fadeIn) and out (fadeOut, or 1.5 s) as the visitor moves through; a once plays as the view arrives on its first stop (delay: seconds
 // after), and fades too if the visitor leaves its stops while it still sounds. Either plays again on coming back.
 const soundOn=()=>{try{return SITTSound.context().state==='running';}catch{return true;}};   // the browser allows sound (after the first click or key): until then a stop's voice and sounds wait, and start then
 const stopCues=new Map();let cueHold=false,restStop=null;
 function stopCueTick(){if(cueHold)return;if(!soundOn())return;const C=W.memory?.cues;if(!C?.list||!free||!window.SITTSound?.play)return;const lib=C.library||'audio/';
  const arrive=!T.holding&&T.landing!=null&&Math.abs(T.s-T.landing)<.25?T.landing:Math.abs(T.s-Math.round(T.s))<.02?Math.round(T.s):null;
  // leave: a cue that plays as the view moves off its stop (the swipe's movement), panned a little toward the way it goes; dir: 1 or -1 only that way
  let leaving=null;const restK=Math.abs(T.s-Math.round(T.s))<.02?Math.round(T.s):null;
  if(restK!=null)restStop=restK;else if(restStop!=null&&Math.abs(T.s-restStop)>.04){leaving={k:restStop,dir:Math.sign(T.s-restStop)};restStop=null;}
  for(const q of C.list){if(!q.stops||!q.file)continue;
   if(q.leave){if(leaving&&leaving.k===q.stops[0]&&(!q.dir||q.dir===leaving.dir))SITTSound.play((q.library||lib)+q.file.split('/').map(encodeURIComponent).join('/'),{...q,pan:(q.pan??.25)*leaving.dir}).catch(()=>{});continue;}
   const a=q.stops[0],b=q.stops[1]??a,inside=T.s>a-.5&&T.s<b+.5,live=stopCues.get(q);
   if(!inside){if(live){live.stop=true;live.h?.stop(q.fadeOut??1.5);stopCues.delete(q);}continue;}
   if(live||q.once&&arrive!==a)continue;
   // after: n waits for the stop's own voice to finish its part n (counted from 0), and delay counts from there
   let wait=q.delay||0;if(q.after!=null){const sv=stops(W.memory)[a]?.voice,end=stopVoice===sv?voice.ends[q.after]:null;if(end==null)continue;wait=Math.max(0,wait-(performance.now()-end)/1000);}
   const L={h:null,stop:false};stopCues.set(q,L);
   // say: the subtitle of a sound that is a voice (the officer); sayAt: seconds in, when the words start; sayFor: how long; sayEcho: shown as an echo (as hers)
   const go=()=>{if(L.stop)return;if(q.say)setTimeout(()=>{if(!L.stop&&!voice.playing())voice.say(q.say,(q.sayFor??3.5)*1000,q.sayEcho);},(q.sayAt||0)*1000);
    SITTSound.play((q.library||lib)+q.file.split('/').map(encodeURIComponent).join('/'),q).then(h=>{L.h=h;if(q.lead)leadVoice(a,q,h);if(L.stop)h.stop(q.fadeOut??1.5);}).catch(()=>{});};
   if(wait)setTimeout(go,wait*1000);else go();}}
 // the sounds and lines of the stops either side are fetched ahead, so a scene's sound and her first line start together on arrival (not a second late, loading)
 const warmedLines=new Set();function warmStops(k){try{const st=stops(W.memory),C=W.memory?.cues,lib=C?.library||'audio/';
  for(const q of C?.list||[])if(q.file&&Array.isArray(q.stops)&&Math.abs(q.stops[0]-k)<=1)SITTSound.preload?.((q.library||lib)+q.file.split('/').map(encodeURIComponent).join('/'));
  for(const j of [k,k+1,k-1])for(const p of st[j]?.voice?.parts||[])if(!warmedLines.has(p.audio)){warmedLines.add(p.audio);voice.warm?.(p.audio);}}catch{}}
 // lead: a scene's sound made with her lines on one timeline (Dynamic + Hits, from the same master as her voice). Her lines wait for it
 // and start from the moment it really starts (its first gap after it), so a slow load never pulls the two apart.
 let leadWait=null;
 function leadCue(k){return W.memory?.cues?.list?.find(q=>q.lead&&Array.isArray(q.stops)&&q.stops[0]===k);}
 function stopVoiceGo(k,sv){voice.load(sv);stopVoice=sv;const q=leadCue(k);if(!q){voice.play();return;}
  const L=stopCues.get(q);if(L?.h?.at!=null){leadVoice(k,q,L.h);return;}leadWait={sv,t:performance.now()};}
 function leadVoice(k,q,h){const sv=stops(W.memory)[k]?.voice;if(!sv||stopVoice!==sv||voice.playing())return;leadWait=null;
  const c=SITTSound.context(),since=c.currentTime-h.at;voice.play(Math.max(0,(sv.parts?.[0]?.gap||0)-since));}
 function stopCuesOut(){for(const [q,L] of stopCues){L.stop=true;L.h?.stop(q.fadeOut??1.5);}stopCues.clear();}
 // ---- a song over the memory: {file, library, gain, fadeOut, leave, holds}. It plays from the top when the memory opens and
 //  follows the visitor at its hold points (see SITTSound.song), the visitor moving as they like. Leaving the memory fades it
 //  (leave seconds). Once per visit to the memory.
 let song=null;
 function songTick(){const S=W.memory?.song;if(!S?.file||!window.SITTSound?.song)return;
  if(!song){try{if(SITTSound.context().state!=='running')return;}catch{return;}   // no sound allowed yet: it waits for it
   song=SITTSound.song((S.library||'audio/')+S.file.split('/').map(encodeURIComponent).join('/'),S);W.song=song;}
  song.tick(T.s);}
 function songOut(){if(!song)return;song.stop(W.memory?.song?.leave??3);song=null;W.song=null;}
 // ---- a beat loop over a stretch of stops (a stop's "loop": {file, library, lead, length, gain, fadeIn, fadeOut, held}) ----
 //  lead: the silence the mp3 adds before the music (s); length: the loop (s): it repeats lead to lead+length, sample-tight.
 //  It fades in on arriving at its stops, keeps its beat, and fades out on leaving them. A film that shares it (auto.film.loop)
 //  takes over from it on a bar line and hands back to it at its end, at the matching point of the loop (What Ethel saw: Subtle_loop).
 //  held: on that stop it plays only when handed back from the film, until the visitor swipes on (then it fades out).
 const BL={cur:null,held:false,busy:false};W.beatLoop=BL;
 const audioUrl=L=>(L.library||'audio/')+L.file.split('/').map(encodeURIComponent).join('/');
 function loopPlay(L,{at,phase=0,fadeIn}={}){const c=SITTSound.context(),len=L.length,ph=((phase%len)+len)%len,lead=L.lead||0;BL.busy=true;
  return SITTSound.play(audioUrl(L),{loop:true,offset:lead+ph,loopStart:lead,loopEnd:lead+len,at:at??c.currentTime+.05,gain:L.gain??1,fadeIn:fadeIn??L.fadeIn??2.5,duck:false})
   .then(h=>{BL.busy=false;BL.cur={L,h,t0:h.at-ph};return BL.cur;}).catch(()=>{BL.busy=false;return null;});}
 function loopOff(sec,at){if(!BL.cur)return;BL.cur.h.stop(sec??BL.cur.L.fadeOut??1.5,at);BL.cur=null;}
 const loopPhase=at=>{const len=BL.cur.L.length;return ((at-BL.cur.t0)%len+len)%len;};
 function loopTick(){if(!window.SITTSound||W.memory?.auto||autoOn||BL.busy)return;
  const k=Math.round(T.s),L=stops(W.memory)[k]?.loop;
  if(BL.held&&(!L?.held||T.goal>k+.12))BL.held=false;   // handed back from the film: it holds until the visitor swipes on
  const want=L&&soundOn()&&free&&(!L.held||BL.held)?L:null;
  if(!want){if(BL.cur)loopOff();return;}
  if(BL.cur&&BL.cur.L.file!==want.file)loopOff();
  if(!BL.cur&&Math.abs(T.s-k)<.06)loopPlay(want);}   // it starts only once the view is there (inside the bank), not on the way in
 const dark=document.createElement('div');dark.className='dark';dark.setAttribute('aria-hidden','true');main.appendChild(dark);
 const glare=document.createElement('div');glare.className='dark';glare.style.background='#fff';glare.setAttribute('aria-hidden','true');main.appendChild(glare);   // the white flick of a beat
 let autoOn=false;
 async function runAuto(m,folder){if(autoOn)return;autoOn=true;seen.add(folder);W.lock=true;main.classList.add('auto');
  const A=m.auto||{},n=stops(m).length,hold=i=>(Array.isArray(A.hold)?A.hold[i]:A.hold)??900,wait=ms=>new Promise(r=>setTimeout(r,ms));
  // the pan across joined pictures: one move, easing in and out, at an even pace through the stops between
  // (sInv undoes the easing the view has between two stops); the hand still steers the depth
  const pan=A.pan,sInv=u=>.5-Math.sin(Math.asin(1-2*u)/3);
  const panTo=(a,b,ms)=>new Promise(r=>{const t0=performance.now();(function tick(now){if(W.memory!==m)return r();const e=Math.min(1,(now-t0)/ms),p=a+(b-a)*(.5-.5*Math.cos(Math.PI*e)),k=Math.min(Math.floor(p),b-1);
    T.s=T.goal=k+sInv(clamp(p-k,0,1));T.lastIn=now;applyCam();if(e<1)requestAnimationFrame(tick);else r();})(t0);});
  const blink=v=>{dark.style.transition='none';dark.style.opacity=v;};
  // each picture creeps in a little while it holds, so the frame is never dead
  const creep=(i,ms)=>new Promise(r=>{const t0=performance.now();(function tick(now){if(W.memory!==m)return r();const e=Math.min(1,(now-t0)/ms);
    const c=camAt(i);if(c.frame){const k=1-.045*smooth(e),f=c.frame;c.frame=[f[0]+f[2]*(1-k)/2,f[1]+f[3]*(1-k)/2,f[2]*k,f[3]*k];}
    scene.settings.cam=c;scene.changed();if(e<1)requestAnimationFrame(tick);else r();})(t0);});
  // beats: the camera is held by the beats (the frame loop leaves it alone); see "beats" above
  const sAt=x=>{const st=stops(m),i=st.findIndex(p=>p.frame&&x>=p.frame[0]&&x<p.frame[0]+p.frame[2]);return i<0?0:i;};
  // a framing has the shape of the picture on screen (the canvas, not the page), and fills it (fit 0): what is framed is what is seen, in the hold and in a dissolve alike
  const aspect=()=>{const cv=document.getElementById('stage')||main.querySelector('canvas'),r=cv?.getBoundingClientRect();return r&&r.width?r.height/r.width:main.clientHeight/Math.max(1,main.clientWidth);};
  const frameOf=b=>{if(Number.isFinite(b.stop)){const p=stops(m)[b.stop].frame,A=aspect();let w=p[2],h=w*A;if(h>p[3]){h=p[3];w=h/A;}   // a stop's picture, filling the screen (never past its own edges)
    return {f:[p[0]+(p[2]-w)/2,p[1]+(p[3]-h)/2,w,h],s:b.stop,fit:0};}
   const h=b.w*aspect();return {f:[b.at[0]-b.w/2,b.at[1]-h/2,b.w,h],s:sAt(b.at[0]),fit:0};};
  const setCam=(f,s,fit)=>{scene.settings.cam={frame:f,x:f[0]+f[2]/2,s,fit};scene.changed();};
  let cur=null;
  const SW=scene.settings,sway0=()=>SW.sway?.x||0,swaySet=x=>{SW.sway=x?{x,y:0}:null;};
  const holdBeat=(b,fr)=>new Promise(r=>{const t0=performance.now(),ms=b.hold??500,p=b.push??.05,sh=b.shake||0,dr=b.drift||[0,0],sa=sway0(),st=(b.sway||0)*(Math.sign(dr[0])||1);(function tick(now){if(W.memory!==m)return r();const e=Math.min(1,(now-t0)/ms),k=1-p*(b.close?e*e:e),f=fr.f;   // the push: an even float in (close: true gathers pace, closing in)
    if(st||sa)swaySet(sa+(st-sa)*smooth(e));
    const jx=sh*(Math.sin(now/37)+Math.sin(now/23+1.3))*.5,jy=sh*(Math.sin(now/41+2)+Math.sin(now/29))*.5;   // an unsteady hand
    cur=[f[0]+f[2]*(1-k)/2+dr[0]*e+jx,f[1]+f[3]*(1-k)/2+dr[1]*e+jy,f[2]*k,f[3]*k];setCam(cur,fr.s,fr.fit);if(e<1)requestAnimationFrame(tick);else r();})(t0);});
  const whip=(fr,ms,blur=1,soft=false)=>new Promise(r=>{const a=cur||fr.f,b=fr.f,t0=performance.now(),S=scene.settings;let last=t0,px=a[0]+a[2]/2;(function tick(now){if(W.memory!==m)return r();const e=Math.min(1,(now-t0)/ms),u=soft?.5-.5*Math.cos(Math.PI*e):e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2;   // soft (smear): an even, gliding sweep
    if(e===0||!tick.s0)tick.s0=sway0();if(tick.s0)swaySet(tick.s0*(1-u));
    const f=a.map((v,k)=>v+(b[k]-v)*u),cx=f[0]+f[2]/2,dx=(cx-px)/f[2];S.motion.amt=e<1?blur*Math.abs(dx)/Math.max(.001,(now-last)/1000):0;S.motion.dir=-Math.sign(dx)||1;px=cx;last=now;   // blurred by its own speed
    cur=f;setCam(f,fr.s,fr.fit);if(e<1)requestAnimationFrame(tick);else{S.motion.amt=0;r();}})(t0);});
  const flick=async(el,ms,fr)=>{el.style.transition='none';el.style.opacity=1;await wait(ms);swaySet(0);cur=fr.f;setCam(fr.f,fr.s,fr.fit);
   el.style.transition=el===glare?'opacity 160ms ease-out':'none';el.style.opacity=0;};   // white leaves an afterglow
  // the double exposure: the framing left keeps drifting on as the next comes through it
  const dissolve=(fr,ms,drift)=>new Promise(r=>{const S=scene.settings,a=cur||fr.f,b=fr.f,t0=performance.now(),dx=(drift?.[0]||0),dy=(drift?.[1]||0);(function tick(now){if(W.memory!==m){S.moment=null;return r();}const e=Math.min(1,(now-t0)/ms),u=.5-.5*Math.cos(Math.PI*e),g=1-.03*e;if(e===0||tick.s0==null)tick.s0=sway0();if(tick.s0)swaySet(tick.s0*(1-u));
    const A=[a[0]+a[2]*(1-g)/2+dx*e,a[1]+a[3]*(1-g)/2+dy*e,a[2]*g,a[3]*g];S.moment={a:{frame:A,s:fr.s,fit:0},b:{frame:b,s:fr.s,fit:0},t:u};setCam(b,fr.s,fr.fit);
    if(e<1)requestAnimationFrame(tick);else{S.moment=null;cur=b;setCam(b,fr.s,fr.fit);r();}})(t0);});
  async function runBeats(){W.beatCam=true;
   try{for(const [k,b] of A.beats.entries()){if(W.memory!==m)return;const fr=frameOf(b),nx=A.beats[k+1];
     T.s=T.goal=T.landing=fr.s;T.reached=Math.max(T.reached,fr.s);T.lastDir=0;lookAt(fr.s);
     if(nx)scene.aim({frame:frameOf(nx).f,s:frameOf(nx).s});
     const how=k===0?'cut':(b.in||'cut');cue(m,'beat',{beat:k+1,how});
     if(how==='whip')await whip(fr,b.inMs??180);
     else if(how==='smear')await whip(fr,b.inMs??650,b.blur??2.5,true);
     else if(how==='dissolve')await dissolve(fr,b.inMs??700,A.beats[k-1]?.drift);
     else if(how==='white')await flick(glare,b.inMs??60,fr);
     else if(how==='black')await flick(dark,b.inMs??50,fr);
     else{cur=fr.f;setCam(fr.f,fr.s,fr.fit);}
     await holdBeat(b,{...fr,f:how==='whip'||how==='smear'?cur:fr.f});}}
   finally{W.beatCam=false;scene.settings.motion.amt=0;scene.settings.moment=null;scene.settings.sway=null;}}
  // film (What Ethel saw): the shots on the music's own clock. Each cuts in at its time exactly (the cuts sit on the beat),
  // its camera moving in straight lines between its keys [t, x, y, w, h] (t from its own cut), blurred with its speed.
  // Without sound allowed, the page's clock stands in. See make_what_ethel_saw.py (WorkingFiles/_tools).
  async function runFilm(){const F=A.film,shots=F.shots||[],S=scene.settings,url=F.audio?(m.cues?.library||'audio/')+F.audio.split('/').map(encodeURIComponent).join('/'):null;
   let c=null,t0=null,music=null,back=false;W.beatCam=true;const FL=F.loop;
   try{
    if(url&&window.SITTSound&&soundOn()){try{await SITTSound.preload(url);if(FL)await SITTSound.preload(audioUrl(FL));if(W.memory!==m)return;c=SITTSound.context();let at=c.currentTime+.06;
      // the loop already playing (the bank, the box): the music comes in on its next bar line, the loop dropping out there
      if(FL&&BL.cur&&BL.cur.L.file===FL.file){const step=(FL.beat||FL.length)*(FL.switchBeats||4),ph=loopPhase(at);at+=Math.ceil(ph/step-1e-6)*step-ph;loopOff(FL.switchFade??.03,at);}
      const h=await SITTSound.play(url,{gain:F.gain??1,duck:false,offset:F.lead||0,at});t0=h.at;W.filmAt=t0;music={h,q:{fadeOut:F.fadeOut??.5}};liveCues.add(music);}catch{c=null;t0=null;}}   // lead: the mp3's silence before the music, skipped
    const p0=performance.now(),clock=()=>(t0!=null?c.currentTime-t0:(performance.now()-p0)/1000)-(F.sync||0);
    // the hand back: the loop comes in at the film's last frame at the matching point of its beat (FL.at: where in the music the loop
    // begins again), sample-tight, the music dropping out there; it then holds on the stop it lands on (held) until the visitor swipes on
    const handBack=()=>{if(back||!FL||t0==null||!soundOn())return;back=true;const Te=t0+(F.sync||0)+F.end;
     loopPlay(FL,{at:Te,phase:F.end-(FL.at||0),fadeIn:FL.switchFade??.03}).then(r=>{if(r)BL.held=true;});
     if(music){liveCues.delete(music);music.h.stop(FL.switchFade??.03,Te);}};
    const camOf=(sh,t)=>{const k=sh.k;let j=0;while(j<k.length-1&&k[j+1][0]<=t)j++;const a=k[j],b=k[j+1];if(!b||t<=a[0])return a.slice(1);const u=(t-a[0])/(b[0]-a[0]);return [1,2,3,4].map(n=>a[n]+(b[n]-a[n])*u);};
    let cur=-1,lx=null,lt=0;
    await new Promise(r=>{(function tick(){if(W.memory!==m)return r();const t=clock();if(t>=(F.end??Infinity)-.6)handBack();if(t>=(F.end??Infinity))return r();
      let i=Math.max(0,cur);while(i<shots.length-1&&t>=shots[i+1].t)i++;const sh=shots[i];
      if(i!==cur){cur=i;lx=null;T.s=T.goal=T.landing=sh.stop;T.reached=Math.max(T.reached,sh.stop);T.lastDir=0;lookAt(sh.stop);const nx=shots[i+1];if(nx)scene.aim({frame:nx.k[0].slice(1),s:nx.stop});}   // a cut: the next shot's pictures first
      const f=camOf(sh,Math.max(0,t-sh.t)),cx=f[0]+f[2]/2;
      if(lx!=null&&t>lt){const dx=(cx-lx)/f[2];S.motion.amt=(F.blur??1)*Math.abs(dx)/(t-lt);S.motion.dir=-Math.sign(dx)||1;}else S.motion.amt=0;lx=cx;lt=t;
      setCam(f,sh.stop,0);requestAnimationFrame(tick);})();});}
   finally{W.beatCam=false;S.motion.amt=0;}}
  try{
   if(dark.style.opacity>.05){dark.style.transition='opacity 260ms ease-out';dark.style.opacity=0;}   // come up out of the drop
   if(A.film)await runFilm();
   else if(Array.isArray(A.beats))await runBeats();
   else for(let i=0;i<n;i++){if(W.memory!==m)return;
    if(i>0){blink(1);await wait(A.flash??70);}
    T.s=T.goal=T.landing=i;T.reached=i;T.lastDir=0;applyCam();
    if(i>0)blink(0);
    if(pan&&i===pan.from&&pan.to>i){scene.aim(camAt(pan.to));await wait(hold(i));await panTo(i,pan.to,pan.ms??6000);if(W.memory!==m)return;i=pan.to;T.s=T.goal=T.landing=i;T.reached=i;applyCam();}   // no creep before the pan: it leaves from the whole picture
    if(i<n-1)scene.aim(camAt(i+1));
    await creep(i,hold(i));}
   if(W.memory!==m)return;
   if(!A.sharp){dark.style.transition='opacity '+(A.dark??2200)+'ms cubic-bezier(.5,0,.9,.6)';dark.style.opacity=1;await wait((A.dark??2200)+250);}   // TESTING: "sharp": no erosion into the dark
   const to=m.exits?.right?.to;cuesOut();cue(m,'exit');
   const at=m.exits?.right?.stop;   // a sequence set off from a stop lands back on the stop it names
   if(to)await go(to,{side:'right',sharp:!!A.sharp,...(at?{stopName:at,back:true}:{})});
  }finally{
   if(A.sharp){dark.style.transition='none';dark.style.opacity=0;}   // TESTING: "sharp": straight back, no coming up out of the dark
   else{dark.style.transition='opacity '+(A.reveal??1600)+'ms ease-out';dark.style.opacity=0;
   await wait(A.reveal??1600);}   // the hand comes back only once she is there
   cuesOut();autoOn=false;W.lock=false;main.classList.remove('auto');zone.out=performance.now();idleSince=performance.now();}}
 W.runAuto=runAuto;

 // ---- moving: Walk Left's glide and landing, across the memory's stops ----
 const T={s:0,goal:0,pan:0,landing:null,lastDir:0,lastIn:-1e9,holding:false,reached:0};W.track=T;
 // crossing by hand (FLOW TEST 1)
 const X={on:false,t:0,side:'right',finishing:false,auto:false};W.cross=X;
 const CROSS=1.25;   // how much of a stop's drag carries the whole crossing (about one swipe)
 function crossTo(side){if(wrong()&&side===T.guard.side)return wrongTurn(true);const to=exitTo(side);if(!to||busy)return false;
  if(side==='right'&&W.nextBlend)return travel(side);   // into a sequence with its own dream cut: it blends in at its own pace, not the hand's
 X.flip=flip();X.on=true;X.t=0;X.side=side;X.finishing=false;X.auto=side==='right'&&!!W.nextAuto;X.early=E();window.SITT_CUT_T=0;travel(side);return true;}   // ERA: the hand's crossing keeps the era of the memory it leaves (its scroll's release)
 // TESTING: a way out marked "until": "never" is shut (the towel's no going back); "until": "end" would open it once the visitor has reached the last stop
 function exitTo(side){const m=W.memory,ex=m?.exits?.[side];if(!ex?.to)return null;if(ex.until==='never'||(ex.until==='end'&&T.reached<stops(m).length-1))return null;return ex.to;}
 const ZONE='2019-03-05_dominics-world';let zoneBlend=false,zoneMem=null,stilling=false;   // the zone has its own dream cut: the wrong turn blends into it instead of going under the dark
 // FLOW: the wrong turn is only there the first time, while the towel still has its spring-back (the visitor has not yet turned)
 const wrong=()=>W.folder==='2019-03-05_the-glass-house'&&!!T.guard&&!seen.has(ZONE);
 function wrongTurn(hand){if(busy||stilling)return false;if(hand&&!zoneBlend){X.flip=flip();X.on=true;X.t=0;X.side=T.guard.side;X.finishing=false;X.auto=true;X.early=E();window.SITT_CUT_T=0;}   // a zone with its own dream cut blends in at its own pace, not the hand's
  cue(zoneMem,'push');const still=zoneMem?.cut?.still||0;   // the push: its sound, and a moment where everything stops before the way in
  if(still&&!X.on){stilling=true;W.lock=true;setTimeout(()=>{stilling=false;W.lock=false;go(ZONE,{side:'right',push:true,zoomTo:null});},still);return true;}
  go(ZONE,{side:'right',push:true,zoomTo:null});return true;}
 function crossStep(ds){if(X.finishing)return;X.t=clamp(X.t+ds*(X.side==='right'?1:-1)*CROSS,0,1);window.SITT_CUT_T=X.t;}
 // the zone's cold (FLOW TEST 3, 4): rises over the last picture before it, holds inside, eases out after
 const zone={a:0,out:-1e9};
 // "oneWay": from where the visitor arrives there is no going back. Pushing back resists a little and springs forward again,
 // and the way out behind (exits.left) is never taken. The furthest stop reached is the floor.
 const oneWay=()=>!!W.memory?.oneWay;
 // "firstStop": where the memory begins for a visitor (earlier stops are kept for the studio only). Back past it is the way out behind.
 const firstOf=()=>W.memory?.firstStop??0;
 const floorOf=()=>Math.max(firstOf(),oneWay()?T.reached:0);
 const OVER=.6,PAN_K=.35,LIMIT=.06;   // past the last stop: a pull of about a twelfth of the screen carries on into the next memory; the picture gives up to 6% as you pull
 const EXIT=()=>E()?.09:.15;   // ERA: earlier .09 (EXPLORE: one notch of a mouse wheel, or a short swipe, past the end moves on); later .15
 const soft=v=>Math.sign(v)*LIMIT*(1-Math.exp(-Math.abs(v)/LIMIT));
 let idleSince=0,lean=null;
 // FLOW: a gesture that leaves a memory must begin on its first or last picture, so no picture is slid past unseen
 function atEdge(side,b=X.began){if(b==null)return true;const n=stops(W.memory).length;return side==='right'?b>=n-1-.3:b<=floorOf()+.3;}
 // a stop with "rest": true is never passed in one gesture: a drag, scroll or flick that began before it lands on it first
 const restCap=(a,b)=>{if(a==null||!Number.isFinite(b))return b;if(Math.abs(a-Math.round(a))<.05)a=Math.round(a);   // still settling onto a stop counts as on it
  const st=stops(W.memory);if(b>a){for(let k=Math.floor(a)+1;k<b;k++)if(st[k]?.rest)return k;}else for(let k=Math.ceil(a)-1;k>b;k--)if(st[k]?.rest)return k;return b;};
 function input(ds){if(X.on){crossStep(ds);return;}if(W.lock)return;if(X.began==null)X.began=T.s;
  if(wrong()?(T.goal+ds<firstOf()&&ds<0):ds>0)ds*=1-.55*zone.a;   // the approach to a zone (or the wrong way at the towel): the drag grows heavier
  const n=stops(W.memory).length;T.goal=restCap(X.began,clamp(T.goal+ds,oneWay()?T.reached-.25:firstOf()-OVER,n-1+OVER));T.landing=null;T.lastDir=Math.sign(ds)||T.lastDir;T.lastIn=performance.now();idleSince=T.lastIn;lean=null;
  // pulled far enough past the end (and still pulling): the crossing starts and follows the hand from here
  if(T.holding&&!busy&&!X.fresh){const o=overshoot(T.goal),side=o<0?'left':'right';if(Math.abs(o)>EXIT()&&atEdge(side)&&!(side==='left'&&oneWay())&&(T.guard?.side!==side||wrong())&&(exitTo(side)||wrong())){crossTo(side);}}}
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
  const i=Math.max(0,Math.min(n-2,Math.floor(c))),a=st[i],b=st[Math.min(n-1,i+1)];   // FLOW: a memory of one picture (one stop) works too
  if(n<2){S.moment=null;const f=fr(a);return {frame:f,x:f[0]+f[2]/2,s:c,fit:fitOf(a),keep:a.keep?{a:a.keep,b:a.keep,t:0}:null};}
  const fa=fr(a),fb=fr(b),zs=zoomish(fa,fb),u=c-i,t=zs?u*.65+smooth(u)*.35:smooth(u);   // a step that only moves in or out starts moving at once
  if(a.moment&&a.moment===b.moment&&t>0&&t<1){const d=W.memory.momentDrift??.12;
   const grow=(f,k,dx)=>{const w=f[2]*(1-.04*k),h=f[3]*(1-.04*k);return [f[0]+(f[2]-w)/2+dx,f[1]+(f[3]-h)/2,w,h];};
   const A=grow(fa,t,fa[2]*d*t),Bf=grow(fb,1-t,-fb[2]*d*(1-t));
   S.moment={a:{frame:A,s:c},b:{frame:Bf,s:c},t};const f=t<.5?A:Bf;return {frame:f,x:f[0]+f[2]/2,s:c};}
  S.moment=null;const f=lerp(fa,fb,t);return {frame:f,x:f[0]+f[2]/2,s:c,fit:fitOf(a)+(fitOf(b)-fitOf(a))*t,keep:(a.keep||b.keep)?{a:a.keep,b:b.keep,t}:null};}
 // FLOW: two stops whose pictures overlap almost completely (homestead: closer; the office): the step is a zoom, not a pan
 function zoomish(fa,fb){if(W.memory?.direction==='left')return false;const w=Math.min(fa[2],fb[2]);return Math.abs((fa[0]+fa[2]/2)-(fb[0]+fb[2]/2))<w*.35;}
 function zoomStep(){const m=W.memory,st=stops(m),n=st.length;if(m?.kind!=='strip'||n<2||m.direction==='left')return false;const i=clamp(Math.floor(T.s),0,n-2);
  const fr=p=>p.frame||[0,0,1,1];return zoomish(fr(st[i]),fr(st[i+1]))||(T.s-i>.6&&i+2<n&&zoomish(fr(st[i+1]),fr(st[i+2])));}
 // a stop can carry its own look (Walk Left: warm inside the house, cool out on the street); it blends between stops
 function lookAt(s){const m=W.memory,st=m?.stops||[];if(!st.some(p=>p.look))return;const base=look(m),n=st.length,c=clamp(s,0,n-1),i=Math.min(Math.max(0,n-2),Math.floor(c)),t=n<2?0:smooth(c-i);
  const a=st[i]?.look||{},b=st[Math.min(n-1,i+1)]?.look||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const va=a[k]??base[k],vb=b[k]??base[k];scene.settings.look[k]=va+(vb-va)*t;}}
 const flip=()=>X.on&&X.flip?X.flip:(W.memory?.direction==='left'?-1:1);   // FLOW: mid-crossing the hand keeps the way of the row it left   // "direction": "left" for a memory walked right to left (Walk Left): the picture still follows the finger, so dragging right goes on
 function overshoot(s){const n=stops(W.memory).length,f=floorOf();return s<f?s-f:s>n-1?s-(n-1):0;}
 function applyCam(){const S=scene.settings;S.cam=camAt(T.s);lookAt(T.s);T.pan=soft(overshoot(T.s)*PAN_K)*flip();S.pan=T.pan;scene.changed();}
 W.goStop=i=>{T.s=T.goal=i;T.landing=i;T.reached=i;applyCam();};
 W.refresh=()=>{applyCam();};
 // ---- for the UI: a jump straight to any memory and stop (a cut, no walk), as ?memory=&stop= opens the story ----
 // stop: a stop's number (kept inside the memory); left out, the memory's own start. In hand at once; a named stop skips the opening voice.
 W.goto=async(folder,stop)=>{if(!folder||busy)return false;const st=stop==null||!Number.isFinite(+stop)?undefined:+stop;clearInterval(handTimer);handOver();
  if(folder===W.folder){W.goStop(clamp(Math.round(st??W.memory?.startStop??0),0,stops(W.memory).length-1));return true;}
  return go(folder,{goto:true,stop:st});};
 // ---- for the UI: this memory's pictures and depth maps again from the server, the view staying where it is ----
 // (as the earlier corner bar's reload: load, scene.reload, W.refresh; then 'sitt:reload' for any module that sets itself from the memory)
 W.reload=async()=>{if(busy||autoOn||!W.folder)return false;busy=true;
  const folder=W.folder,was=W.memory,keep=v=>v==null?v:Math.min(v,stops(W.memory).length-1),s=T.s,goal=T.goal,landing=T.landing,reached=T.reached;
  try{scene.reloadPictures?.();const m=await load(folder);if(W.folder!==folder)return false;
   W.memory=m;await scene.reload(m,{folder,set:W.set,source:W.source,cam:scene.settings.cam});   // cam: the shot on screen swaps in place, never dark
   T.s=keep(s);T.goal=keep(goal);T.landing=keep(landing);T.reached=keep(reached);
   // what is playing carries over to the reloaded stops and cues, so nothing starts again
   const at=Math.round(T.s);if(stopVoice&&typeof stopVoice==='object'&&stopVoice===stops(was)[at]?.voice)stopVoice=stops(m)[at]?.voice||null;
   const oq=was?.cues?.list||[],nq=m.cues?.list||[];
   for(const [q,L] of [...stopCues]){stopCues.delete(q);const i=oq.indexOf(q);if(i>=0&&nq[i]?.file===q.file)stopCues.set(nq[i],L);else{L.stop=true;L.h?.stop(q.fadeOut??1.5);}}
   W.refresh?.();
   dispatchEvent(new CustomEvent('sitt:reload',{detail:{memory:m,folder}}));
   if(frame.told!=null)dispatchEvent(new CustomEvent('sitt:stop',{detail:{folder,stop:frame.told}}));   // the same stop again: its files may have changed
   return true;}
  finally{busy=false;}};
 function release(){T.holding=false;const began=X.began;X.began=null;if(X.on){X.finishing=true;return;}const o=overshoot(T.goal);
  if(Math.abs(o)>EXIT()&&!atEdge(o<0?'left':'right',began)){const n=stops(W.memory).length;T.goal=clamp(T.goal,floorOf(),n-1);return;}   // FLOW: a gesture that slid through the last picture rests on it first
  if(X.fresh){X.fresh=false;const n=stops(W.memory).length;if(o)T.goal=clamp(T.goal,floorOf(),n-1);return;}   // FLOW: the hand that carried the visitor in does not carry them on; a new touch or scroll does
  if(Math.abs(o)>EXIT()&&wrong()&&(o<0?'left':'right')===T.guard.side){wrongTurn(false);return;}
  if(Math.abs(o)>EXIT()){const side=o<0?'left':'right';if(!(side==='left'&&oneWay())&&T.guard?.side!==side&&exitTo(side)){travel(side);return;}}
  const n=stops(W.memory).length;if(o)T.goal=clamp(T.goal,floorOf(),n-1);}
 let downX=null,downY=null,moved=0,holdX=null,pressX=null;
 // a finger (phones, tablets) does two things, told apart by how the touch begins:
 //  - to look: touch and rest a moment (about a fifth of a second), or drag mostly up and down. The depth follows the
 //    finger and the story stays exactly where it is for the whole touch, however the finger moves after.
 //  - to move on: touch and move sideways straight away. The picture moves with the finger and a flick carries on to the
 //    next picture; the depth leans a little with it. Lifting the finger lets the depth ease back. No edge streaming for fingers.
 const LOOK_AFTER=220;
 const F={on:false,x0:0,y0:0,t0:0,axis:null,trail:[]};
 const perStop=()=>{const s=T.s,a=camAt(s-.05),b=camAt(s+.05),k=Math.abs((b.x||0)-(a.x||0))/.1,c=scene.crop?.();
  if(zoomStep())return 2.6;return k>1&&c?.[0]?clamp(c[0]/k,.35,3):1.8;};   // stops per screen width so the picture keeps pace with the finger; 1.8 where the view holds (a moment)
 const touchDepth=(e,k=1)=>{const r=main.getBoundingClientRect(),s=Math.min(r.width,r.height)*.45;scene.point?.(clamp((e.clientX-F.x0)/s,-1,1)*k,clamp(-(e.clientY-F.y0)/s,-1,1)*k);};
 main.addEventListener('pointerdown',e=>{if(autoOn&&e.button===0){give.down(e);return;}
  if(!started||!free||busy||W.lock||e.button>0||e.target.closest('.timeline'))return;X.fresh=false;downX=e.clientX;downY=e.clientY;holdX=e.clientX;pressX=e.clientX;moved=0;T.holding=true;
  F.on=e.pointerType==='touch';if(F.on){F.x0=e.clientX;F.y0=e.clientY;F.t0=performance.now();F.axis=null;F.trail=[[F.t0,e.clientX]];}main.classList.add('held');try{main.setPointerCapture(e.pointerId);}catch{}});
  main.addEventListener('pointermove',e=>{if(give.on){give.move(e);return;}
  if(downX!=null&&F.on){const dx=e.clientX-downX;moved+=Math.abs(dx)+Math.abs(e.clientY-downY);downX=e.clientX;downY=e.clientY;
   if(!F.axis&&Math.hypot(e.clientX-F.x0,e.clientY-F.y0)>10)F.axis=performance.now()-F.t0>LOOK_AFTER?'look':Math.abs(e.clientX-F.x0)>=Math.abs(e.clientY-F.y0)*.8?'x':'look';
   touchDepth(e,F.axis==='x'?.4:1);
   if(F.axis==='x'){input(-dx/main.clientWidth*perStop()*flip());const t=performance.now();F.trail.push([t,e.clientX]);while(F.trail.length>2&&t-F.trail[0][0]>120)F.trail.shift();}}
  else if(downX!=null){holdX=e.clientX;const dx=e.clientX-downX;moved+=Math.abs(dx)+Math.abs(e.clientY-downY);downX=e.clientX;downY=e.clientY;input(-dx/main.clientWidth*(zoomStep()?2.6:1.8)*flip());}
  else if(free&&!W.lock){const h=hit(e.clientX,e.clientY);main.classList.toggle('door',h?.kind==='door');}});
 const up=e=>{if(give.on){give.up();return;}if(downX==null)return;downX=null;holdX=null;pressX=null;main.classList.remove('held');
  if(moved<6){F.on=false;T.holding=false;const h=hit(e.clientX,e.clientY);if(h){h.kind==='door'?enterDoor(h.item):enterEgg(h.item);return;}}
  if(F.on&&F.axis==='x'&&F.trail.length>1){const a=F.trail[0],b=F.trail[F.trail.length-1],dt=Math.max(16,b[0]-a[0]),v=(b[1]-a[1])/dt;   // px a millisecond
   if(Math.abs(v)>.35&&e.type!=='pointercancel'){const d=-Math.sign(v)*flip(),n=stops(W.memory).length,r=Math.round(T.goal);T.lastDir=d;
    if(!overshoot(T.goal))T.landing=restCap(X.began,clamp(r+(Math.sign(T.goal-r)===d||T.goal===r?d:0),floorOf(),n-1));}}   // a flick goes on to the next picture
  F.on=false;release();};
 main.addEventListener('pointerup',up);main.addEventListener('pointercancel',up);
 let wheelT=0,lastWheel=0;
 addEventListener('wheel',e=>{if(X.on&&!X.finishing){const side=Math.abs(e.deltaX)>Math.abs(e.deltaY);crossStep((side?e.deltaX*flip():e.deltaY)*.0011);T.holding=true;clearTimeout(wheelT);wheelT=setTimeout(release,X.early?420:240);return;}   // ERA: let go as in the memory the crossing left (earlier 420 ms)
  if(autoOn&&!e.target.closest('.studio')){give.nudge((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*.0004);return;}
  if(!free||busy||W.lock||e.target.closest('.studio,.timeline'))return;const old=E();
  if(old){const t=performance.now();if(t-lastWheel>260)X.fresh=false;lastWheel=t;}   // ERA: earlier: a new scroll (after a pause) moves on straight away; only the scroll still running from the last crossing is held back
  const side=Math.abs(e.deltaX)>Math.abs(e.deltaY);input((side?e.deltaX*flip():e.deltaY)*.0011);T.holding=true;clearTimeout(wheelT);wheelT=setTimeout(release,old?420:240);},{passive:true});   // ERA: earlier 420 ms, later 240
 addEventListener('keydown',e=>{if(!free||busy||W.lock||W.studio||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.closest?.('.studio'))return;
  const fwd=['ArrowDown','PageDown',' '].includes(e.key),bk=['ArrowUp','PageUp'].includes(e.key);
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'||fwd||bk){if(fwd||bk)e.preventDefault();const d=fwd?1:bk?-1:(e.key==='ArrowRight'?1:-1)*flip();const n=stops(W.memory).length,r=Math.round(T.goal);
   if(d<0&&oneWay()&&r<=T.reached){input(-.12);setTimeout(release,240);}
   else if((d>0&&r>=n-1)||(d<0&&r<=firstOf())){if(exitTo(d>0?'right':'left')&&T.guard?.side!==(d>0?'right':'left'))travel(d>0?'right':'left');else{input(d*.25);setTimeout(release,240);}}
   else{T.goal=r+d;T.landing=r+d;T.lastIn=performance.now();}}});
 // in the zone a push gives a little and springs back; a finger still leans the depth (FLOW TEST 4)
 const give=(()=>{let x0=0,y0=0,v=0,goal=0;const o={on:false,
  down(e){o.on=true;x0=e.clientX;y0=e.clientY;try{main.setPointerCapture(e.pointerId);}catch{}},
  move(e){const w=main.clientWidth||1;goal=soft((e.clientX-x0)/w*.5);if(e.pointerType==='touch'){const s=Math.min(w,main.clientHeight)*.45;scene.point?.(clamp((e.clientX-x0)/s,-1,1),clamp(-(e.clientY-y0)/s,-1,1));}},
  up(){o.on=false;goal=0;},nudge(d){goal=soft(goal+d);clearTimeout(o.t);o.t=setTimeout(()=>goal=0,180);},
  tick(dt){v+=(goal-v)*(1-Math.exp(-dt/(o.on?70:260)));if(Math.abs(v)>1e-5||goal){scene.settings.pan=v;scene.changed();}}};return o;})();
 let zt=0;
 function flowTick(now){requestAnimationFrame(flowTick);const dt=Math.min(64,now-(zt||now));zt=now;if(!scene||!W.memory)return;
  // a crossing let go finishes in a moment (about a third of a second from halfway)
  if(X.on&&X.finishing){X.t=Math.min(1,X.t+dt/320);window.SITT_CUT_T=X.t;}
  else if(X.on){X.t=Math.min(1,X.t+dt/2400);if(X.t>.6)X.finishing=true;window.SITT_CUT_T=X.t;}   // held still mid-crossing, it carries on slowly; past .6 it goes
  // into a zone the crossing drops through black
  if(X.on&&X.auto){dark.style.transition='none';dark.style.opacity=(Math.sin(Math.PI*Math.min(1,X.t*1.15))*.97).toFixed(3);}
  // how cold the picture is: rising over the last picture before a zone, full inside, easing out after
  const n=stops(W.memory).length;
  const near=W.nextAuto&&!busy?smooth(clamp((T.s-(n-2))/1.15,0,1)):0;
  const after=1-smooth(clamp((now-zone.out)/2600,0,1));
  const wr=wrong()&&!busy?smooth(clamp(Math.abs(Math.min(0,overshoot(T.s)*(T.guard.side==='left'?1:-1)))/(EXIT()*1.6),0,1)):0;
  const a=Math.max(near,wr,X.on&&X.auto?1:0,autoOn?1:0,after);
  if(Math.abs(a-zone.a)>.002||a>0){zone.a=a;const base=look(W.memory),L=scene.settings.look;
   L.cold=(base.cold||0)+.5*a;L.warm=(base.warm||0)*(1-a);L.deepVignette=(base.deepVignette||0)+.4*a;L.vignette=(base.vignette??.13)+.08*a;scene.changed();}
  if(autoOn)give.tick(dt);}
 requestAnimationFrame(flowTick);
 function frame(now){requestAnimationFrame(frame);if(!scene||!W.memory)return;if(busy){stopCueTick();return;}   // a stop's sounds carry on through a move (and are there at once on coming back to the towel)
  const dt=Math.min(64,now-(frame.t||now));frame.t=now;const L=scene.settings.look,n=stops(W.memory).length;
  // landing: a moment after letting go, come to rest on the nearest stop (in the direction of travel)
  const zs=zoomStep();
  if(!T.holding&&now-T.lastIn>(zs?180:(L.landWait??480))){if(T.landing==null)T.landing=clamp(Math.round(T.goal+T.lastDir*(L.landReach??.32)),floorOf(),n-1);   // a drag of about a fifth of a stop is enough to reach the next one
   if(T.landing>T.reached)T.reached=T.landing;
   T.goal+=(T.landing-T.goal)*(1-Math.exp(-dt/(zs?380:(L.landEase??650))));}
  // weight to the distance: holding the button, the nearer the pointer is to an edge the faster the memories stream past
  // (near the edge the memory runs toward goes on); the middle of the screen is still, just the drag
  // it only streams toward the edge the drag is heading for: a swipe that starts near one edge and moves away from it is just a drag
  if(holdX!=null&&moved>6&&!W.lock&&!F.on){const r=main.getBoundingClientRect(),d=(holdX-r.left)/r.width-.5,m=clamp((Math.abs(d)-(L.edgeStill??.14))/(.5-(L.edgeStill??.14)),0,1);
   if(m>0&&Math.sign(holdX-pressX)===Math.sign(d)&&Math.abs(holdX-pressX)>8)input(-Math.sign(d)*flip()*(m*m)*(L.edgeSpeed??2.2)*dt/1000);}
  const prev=T.s;T.s+=(T.goal-T.s)*(1-Math.exp(-dt/(L.glide??260)));
  // the picture resists past the ends; resting at the end of a memory, it leans once toward what comes next and settles
  let pg=soft(overshoot(T.s)*PAN_K)*flip();
  const atEnd=Math.round(T.s)>=n-1&&!!W.memory.exits?.right?.to,canGo=Math.round(T.s)<n-1||atEnd;
  // resting anywhere the story goes on, the picture leans once the way it goes
  if(free&&!T.holding&&atEnd&&n===1&&Math.abs(T.goal-T.s)<.002&&now-idleSince>4500){if(!lean)lean=now;const t=(now-lean)/2600;
   if(t<1)pg=.022*flip()*Math.sin(Math.PI*t)**2;else{lean=null;idleSince=now+12000;}}
  if(T.guard&&Math.abs(T.s-T.guard.stop)>=.9){T.guard=null;T.hint=0;}
  // STRIP 02 (21 Nov): "handover" {part: memory}: landing on that part of a joined strip (the arrival, left of the crash) hands over,
  // unseen, to the memory it belongs to (the earlier story), on the same stop: same pictures, same view. From there its own ways go on.
  {const H=W.memory?.joinSpec?.handover,k=Math.round(T.s),p=stops(W.memory)[k];
   if(H&&p&&H[p.from]&&free&&!busy&&!T.holding&&!X.on&&Math.abs(T.s-k)<.004&&Math.abs(T.goal-k)<.004){handOverTo(H[p.from],p);return;}}
  // a stop with "sequence" (a memory that plays by itself, like the wrong turn): going on from it, the first time in a visit,
  // plays that sequence, which lands back on the stop its exits.right names (The box: What Ethel saw, then the evidence remains)
  loopTick();
  if(free&&!W.lock&&!autoOn&&!W.studio){const k=Math.round(T.s),q=stops(W.memory)[k]?.sequence;
   if(q&&!seen.has(q)&&Math.abs(T.s-k)<.35&&T.goal>k+.12){T.goal=T.landing=k;T.holding=false;go(q,{side:'right',push:true,zoomTo:null});return;}}
  glimpse.update(free&&atEnd&&!busy&&!autoOn&&!W.nextAuto,Math.max(0,overshoot(T.goal)));
  way.update(free&&!busy&&!autoOn&&!W.nextAuto&&((canGo&&!T.holding&&Math.abs(T.goal-T.s)<.004&&now-T.lastIn>2600)||(now<T.hint&&!T.holding)));
  const prevPan=T.pan;T.pan+=(pg-T.pan)*(1-Math.exp(-dt/(T.holding?60:300)));
  const S=scene.settings,before=S.cam,cam=W.beatCam?before:camAt(T.s);   // beats hold the camera (and a dissolve's double view)
  if(W.memory?.kind==='strip'&&!busy&&!autoOn){const mo=S.moment;scene.aim(camAt(T.landing??T.goal));S.moment=mo;}   // where the view is heading (its pictures load first); asking must not end a moment's crossfade   // where the view is heading: its pictures load first
  const c=scene.crop(),momentMove=S.moment?((T.s-prev)*.6):0;
  const moveScreens=(S.moment?momentMove:((cam.x-(before.x||0))/Math.max(.05,c[0])))+(T.pan-prevPan);
  const v=Math.abs(moveScreens)/Math.max(.001,dt/1000);
  if(!W.beatCam){S.motion.amt=v>.02?v:0;S.motion.dir=-Math.sign(moveScreens)||1;}
  if(!W.beatCam&&Math.abs(T.s-prev)>1e-5||Math.abs(T.pan-prevPan)>1e-6||S.motion.amt){S.cam=cam;S.pan=T.pan;lookAt(T.s);scene.changed();}
  songTick();
  stopCueTick();if(leadWait&&performance.now()-leadWait.t>2500){const p=leadWait;leadWait=null;if(stopVoice===p.sv&&!voice.playing())voice.play();}   // its scene sound never came: she speaks anyway
  const old=E();   // ERA: earlier: no ducking, and a stop's voice waits until the view has come to rest on it
  if(!old){const A=voice?.audio;try{SITTSound.duck?.(!!A&&!A.paused&&A.volume>.3,W.memory?.cues?.duck);}catch{}}   // her voice on top: the sounds dip while she speaks
  // FLOW: a stop's own voice starts as the view arrives (a quarter of a stop out, landing on it), not once the glide has fully settled
  if(!old){const k=!T.holding&&T.landing!=null&&Math.abs(T.s-T.landing)<.25?T.landing:Math.abs(T.s-Math.round(T.s))<.02?Math.round(T.s):null;   // arriving, or resting (and so once sound is allowed, if it was not yet)
   if(free&&k!=null&&soundOn()){const sv=stops(W.memory)[k]?.voice;if((sv?.audio||sv?.parts)&&stopVoice!==sv)stopVoiceGo(k,sv);}}
  // a stop can carry one of Ethel's lines
  const at=Math.round(T.s);if(Math.abs(T.s-at)<.02){if(at>T.reached)T.reached=at;if(at!==frame.atStop){frame.atStop=at;warmStops(at);const sv=stops(W.memory)[at]?.voice;
   if(old){if(sv?.audio&&free&&!(stopVoice===sv.audio&&voice.playing())){voice.load(sv);voice.play();stopVoice=sv.audio;}}   // ERA: earlier: by its file, and again once it has ended
   else if((sv?.audio||sv?.parts)&&free&&stopVoice!==sv&&soundOn())stopVoiceGo(at,sv);   // FLOW: a stop's own voice plays when the view comes to rest on it
   const line=stops(W.memory)[at]?.line;if(line&&!voice.playing())voice.say(line);
   if(W.memory.joinSpec&&free){const ss=stops(W.memory)[at]?.sound;   // TESTING: a joined strip: each memory's sound on its own stops
    if(ss?.after){if(!bed||bed.url!==ss.after){stopBed={...ss,since:performance.now()};SITTSound.preload(ss.after);if(bed&&ss.dropOld!=null){bed.fadeOut(ss.dropOld);bed=null;W.bed=null;}}}else{stopBed=null;if(bed){bed.fadeOut(3);bed=null;W.bed=null;}}}}}   // dropOld (s): a baked shot carries its own sound, so the shot before's loop fades as it arrives
  else if(Math.abs(T.s-at)>.3){frame.atStop=null;if(stopVoice){voice.fade(stopVoice.fadeOut??450);stopVoice=null;}}
  // MASTER: a memory's own opening line (memory.voice) fades out once the visitor moves away from where it began
  {const MV=W.memory?.voice,A=voice.audio,u=A?decodeURI(A.src):'',mine=!!A&&!!MV&&(MV.audio?u.includes(MV.audio.split('?')[0]):!!MV.parts?.some(p=>u.includes(p.audio)));if(mine&&(!A.paused||voice.left)){if(memVoiceAt==null){if(!A.paused)memVoiceAt=T.goal;}else if(free&&Math.abs(T.s-memVoiceAt)>.3){voice.fade(900);memVoiceAt=NaN;}}}
  // the view has settled on a stop (not just passing it): 'sitt:stop', once per stop, for the UI (its picture's files)
  if(Math.abs(T.s-at)<.02&&Math.abs(T.goal-at)<.02){if(frame.told!==at){frame.told=at;dispatchEvent(new CustomEvent('sitt:stop',{detail:{folder:W.folder,stop:at}}));}}
  else if(Math.abs(T.s-at)>.3)frame.told=null;
  // sound.join (22 Nov 2026, the baked crash): {main, at, from, to} the loop begins on the exact frame its main ends (at: main's last frame, in its file's time),
  // scheduled on the audio clock (main goes through the same sound card path); never both at once. from / to: the loop's exact bounds in its file
  const J=stopBed?.join,JA=voice.audio,Jm=!!(J&&JA&&!JA.ended&&decodeURI(JA.src).includes(J.main));
  if(Jm){if(!JA.paused&&JA.currentTime>0&&J.at-JA.currentTime<.8){const S=stopBed;stopBed=null;if(bed&&bed.url!==S.after)bed.fadeOut(1);if(!bed||bed.url!==S.after){const at=SITTSound.context().currentTime+Math.max(0,(J.at-JA.currentTime)/(JA.playbackRate||1));bed=SITTSound.bed(S.after,{...bedOpts(S),from:J.from,to:J.to,overlap:0,fadeIn:0});bed.start(at);W.bed=bed;}}}
  else if(stopBed&&performance.now()-stopBed.since>800){const A=voice.audio,lead=stopBed.startBeforeEnd??1.5;if(afterLineDone(stopBed)??(!voice.playing()&&!voice.left||(A&&A.duration&&!voice.left&&A.currentTime>=A.duration-lead))){const S=stopBed;stopBed=null;if(!bed||bed.url!==S.after){if(bed)bed.fadeOut(3);bed=SITTSound.bed(S.after,S.join?{...bedOpts(S),from:S.join.from,to:S.join.to,overlap:0,fadeIn:0}:bedOpts(S));bed.start();W.bed=bed;}}}}   // starts as her line ends   // FLOW: moving off it, the voice fades

 // ---- the way on: a blurred glimpse of the next memory breathes at the forward edge, brighter as the visitor pushes toward it ----
 const glimpse=(()=>{const el=document.createElement('div');el.className='ahead';el.setAttribute('aria-hidden','true');el.innerHTML='<i></i>';main.appendChild(el);
  const img=el.querySelector('i');let src='';
  return {set(m,next){const side=m?.direction==='left'?'left':'right';el.classList.toggle('left',side==='left');el.classList.toggle('right',side==='right');
    const show=u=>{if(u!==src){src=u;img.style.backgroundImage=u?'url("'+u+'")':'none';}};
    if(next?.together)scene.resolve(next,m.exits.right.to,next.together,W.set).then(r=>show(r.url)).catch(()=>show(''));else show('');},
   update(on,push){on=on&&!!src;el.classList.toggle('on',on);el.style.setProperty('--push',on?Math.min(1,push/EXIT()).toFixed(3):0);}};})();
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
   W.list=await json('memories/list.json');for(const m of W.list.memories)if(m.here)HERE.add(m.folder);   // FLOW: its own list; the new scenes live in lab/flow/memories
   veil.remove();   // TESTING: no title screen, not even while the first scene loads (the Skip button stays for her opening)
   await indexJoins();
   const start=Q.get('memory')||W.list.start;   // FLOW: from the very start
   await open(start);requestAnimationFrame(frame);
   const atStop=Q.has('stop')?+Q.get('stop'):!Q.get('memory')&&Number.isFinite(W.list.startStop)?W.list.startStop:null;   // TESTING: the list's startStop opens the story there
   if(atStop!=null){W.goStop(clamp(atStop,0,stops(W.memory).length-1));}
   if(W.folder==='2019-03-05_the-glass-house'&&!T.guard)T.guard={side:'left',stop:T.s};   // TESTING: opened straight on the glass house: the wrong turn is armed, as if just arrived from the journey
   // a start memory with no voice of its own opens straight onto the picture: no dark, no title (the veil stays in the page for later)
   // TESTING: no title screen: straight onto the scene. Her voice starts at once if the browser allows sound, otherwise at the first click or key
   started=true;
   const quick=Q.has('stop')&&!E();   // ERA: an earlier memory opened on a stop still has its opening voice, and the hand waits for it. MASTER: only an explicit ?stop= skips her opening line; the story opening on the crash (the list's startStop) plays it, as the live story did
   handOver();   // MASTER: the visitor can always move, forward or back, from the very start; her opening line plays on regardless
   if(hasVoice(W.memory?.voice)&&!quick){const h=W.memory.voice.handover,lead=W.memory.sound?.startBeforeEnd??1.5;clearInterval(handTimer);handTimer=setInterval(()=>{const A=voice.audio;if(!A||A.paused&&!A.currentTime)return;   // as begin() did: control at her handover, the sound bed just before she ends
    if(Number.isFinite(h)&&A.currentTime>=h)handOver();if(afterLineDone(W.memory?.sound)??(A.duration&&!voice.left&&A.currentTime>=A.duration-lead))startBed();if(free&&bed)clearInterval(handTimer);},100);}
   if(hasVoice(W.memory?.voice)&&!quick){const go=()=>{try{SITTSound.context().resume();}catch{}voice.play().then(ok=>{if(ok){if(!free)skip.classList.add('on');removeEventListener('pointerdown',go,true);removeEventListener('keydown',go,true);}});};
    addEventListener('pointerdown',go,true);addEventListener('keydown',go,true);go();}
   // the studio: only with ?tune=1 (MASTER: never on by itself; nothing may cover the picture)
   const local=/^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname);
   // the studio is only fetched when it is wanted, so visitors never download it
   if(Q.has('tune')&&Q.get('tune')!=='0'){const go=()=>window.SITTStudio?.start(W);   // TESTING: the studio is on (its Save writes into this testing copy only)
    if(window.SITTStudio)go();else{const sc=document.createElement('script');sc.src='engine/studio.js?r='+Date.now();sc.onload=go;document.body.appendChild(sc);}}
  }catch(e){console.error(e);main.classList.add('ready');note.textContent='Could not load: '+e.message;note.classList.add('on');}
 }
 boot();
})();

/* SITT memory world · the studio (?tune=1).
 * Everything depth-map-test has, at the top and in the same order, then everything else a memory
 * holds: the scene's framing and depth fallbacks, Walk Left's look, layers and elements, stops,
 * the ways out, doors, eggs, sound and captions, the memory's details, and new memories.
 * Every control changes the open memory only. Save writes that memory's memory.json (and the
 * memory list), so nothing here can change any other memory.
 */
(() => {
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let dir=null;   // the RND_NEW_SITT folder, picked once per session for saving
 function start(W){
  W.studio=true;
  const S=W.scene.settings,DS=window.SITT_DEPTH_SETTINGS;
  document.documentElement.classList.add('tuning');
  const el=document.createElement('aside');el.className='studio';document.body.appendChild(el);
  // the overlay on the picture: doors, eggs, faces, the chosen layer, and drawing or dragging on it
  const ov=document.createElement('canvas');ov.className='studio-overlay';document.querySelector('.world').appendChild(ov);
  // the fold: tucks the studio away to see the memory full screen, and brings it back (also the \ key)
  const fold=document.createElement('button');fold.className='studio-fold';fold.type='button';document.body.appendChild(fold);
  const setFold=on=>{document.documentElement.classList.toggle('folded',on);fold.textContent=on?'‹':'›';fold.title=on?'Show the studio (\\)':'Fold the studio away (\\)';try{localStorage.setItem('sitt-studio-folded',on?'1':'0');}catch{}};
  let folded=false;try{folded=localStorage.getItem('sitt-studio-folded')==='1';}catch{}
  setFold(folded);fold.addEventListener('click',()=>setFold(!document.documentElement.classList.contains('folded')));
  const st={layer:0,stop:0,mode:'none',open:new Set(['scene','look','layers','stops','ways','doors','eggs','sound','details','new'])};   // every group open to begin with
  let C=[],dirty=false;
  const M=()=>W.memory;
  // ---- the story's shots, in the order a visitor meets them: from the first memory, each way on (exits.right) in turn.
  //      Hidden memories (old pieces, stand-in pictures) are not in it. A memory's "firstStop" is where it begins.
  let story=[];
  const shortName=f=>f.replace(/^\d{4}-\d\d-\d\d_/,'').replace(/^\d+-/,'').replace(/-/g,' ');
  async function buildStory(){const vis=W.list.memories.filter(x=>!x.hidden),get=f=>fetch('memories/'+f+'/memory.json?r='+Date.now(),{cache:'no-store'}).then(r=>r.json());
   const ms={};await Promise.all(vis.map(async x=>{try{ms[x.folder]=await get(x.folder);}catch{}}));
   const order=[],seen=new Set();let f=vis.find(x=>ms[x.folder]&&!ms[x.folder].exits?.left?.to)?.folder||vis[0]?.folder;
   while(f&&ms[f]&&!seen.has(f)){seen.add(f);order.push(f);f=ms[f].exits?.right?.to;}
   for(const x of vis)if(ms[x.folder]&&!seen.has(x.folder))order.push(x.folder);
   story=[];let n=0;
   for(const f of order){const m=ms[f],st=W.stops(m),secs=m.sections||[];
    for(let i=m.firstStop??0;i<st.length;i++){const p=st[i];n++;
     const nm=p.name||(secs.length===st.length?secs[i]?.name:'')||('shot '+(i+1));
     story.push({folder:f,stop:i,label:String(n).padStart(2,'0')+' · '+(m.title||shortName(f)).replace(/\s*\(.*\)$/,'')+' · '+nm});}}
   render();}
  let shotJob=0;   // a dropdown fires both input and change: only the latest pick lands
  async function goShot(k){const t=story[k];if(!t)return;const job=++shotJob;if(t.folder!==W.folder){if(goShot.to===t.folder)return;if(dirty&&!confirmLeave())return render();goShot.to=t.folder;try{await W.open(t.folder);}finally{goShot.to=null;}dirty=false;st.layer=0;}
   if(job!==shotJob&&story[k]!==t)return;st.stop=t.stop;W.goStop(t.stop);render();}
  function stepShot(d){if(!story.length)return;let k=shotNow();if(k<0){const j=story.findIndex(t=>t.folder===W.folder);k=j<0?(d>0?-1:story.length):j-(d>0?1:0);}goShot((k+d+story.length)%story.length);}
  const shotNow=()=>story.findIndex(t=>t.folder===W.folder&&t.stop===Math.round(W.track.s));
  const say=t=>{const s=el.querySelector('.st');if(s)s.textContent=t;};
  const changed=()=>{dirty=true;say('Unsaved changes.');M().depth={profile:S.profile,strength:S.strength,opening:S.opening,vertical:S.vertical,framing:S.framing,
    ...(S.light!==2?{light:S.light}:{}),...(S.response!=null?{response:S.response}:{}),...(S.overscan!=null?{overscan:S.overscan}:{})};
   W.scene.changed();W.refresh?.();drawOverlay();};
  // ---- control builders ----
  function slider(label,min,max,step,get,set,fmt=v=>(+v).toFixed(step<.01?4:step<1?2:0)){const i=C.push({get,set,fmt})-1;
   return `<label>${label} <output data-o="${i}">${fmt(get())}</output><input type="range" data-c="${i}" min="${min}" max="${max}" step="${step}" value="${get()}"></label>`;}
  function num(label,get,set,step=.01){const i=C.push({get,set,num:true})-1;return `<label class="inline">${label}<input type="number" step="${step}" data-c="${i}" value="${esc(get())}"></label>`;}
  function text(label,get,set){const i=C.push({get,set,text:true})-1;return `<label>${label}<input type="text" data-c="${i}" value="${esc(get())}"></label>`;}
  function check(label,get,set){const i=C.push({get,set,check:true})-1;return `<label class="check"><input type="checkbox" data-c="${i}" ${get()?'checked':''}> ${label}</label>`;}
  function select(label,opts,get,set){const i=C.push({get,set,select:true})-1;return `<label>${label}<select data-c="${i}">${opts.map(([v,n])=>`<option value="${esc(v)}" ${String(get())===String(v)?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;}
  const btn=(b,t,cls='')=>`<button data-b="${b}" class="${cls}">${t}</button>`;
  const group=(id,title,body)=>`<details data-g="${id}" ${st.open.has(id)?'open':''}><summary>${title}</summary>${body}</details>`;
  const memOpts=(none='None')=>[['',none],...W.list.memories.map(x=>[x.folder,x.date+' · '+x.folder.replace(/^\d{4}-\d\d-\d\d_/,'')])];
  const pct=v=>Math.round(v*100)+'%';
  const LOOK=W.scene.LOOK,lk=()=>{M().look=M().look||{};return M().look;};
  const lget=k=>()=>(M().look?.[k]??LOOK[k]),lset=k=>v=>{lk()[k]=+v;S.look[k]=+v;};
  const layerName=(l,i)=>(Number.isFinite(l.section)?(l.section+1)+' · ':'')+(l.name||l.role||('layer '+(i+1)));
  function render(){
   const m=M();C=[];st.layer=clamp(st.layer,0,m.layers.length-1);const stops=W.stops(m);st.stop=clamp(st.stop,0,stops.length-1);
   const L=m.layers[st.layer],P=stops[st.stop];
   const inspect=[['scene','Complete scene'],['depth','Combined depth'],...m.layers.flatMap((l,i)=>[['layer:'+i,layerName(l,i)+' image'],['layer-depth:'+i,layerName(l,i)+' depth']])];
   el.innerHTML=`<h1>Studio</h1>
   <div class="row">${btn('openAll','Expand all')}${btn('closeAll','Collapse all')}${btn('hideStudio','Hide studio')}</div>
   <p>Move the mouse over the image. Choose any shot of the story directly. After saving a map in Photoshop, reload the files here.</p>
   ${story.length?select('Shot (the live story, in order)',story.map((t,k)=>[k,t.label]),()=>shotNow(),v=>goShot(+v)):'<p>Reading the story…</p>'}
   <div class="row">${btn('prev','← Previous shot')}${btn('next','Next shot →')}</div>
   ${select('Memory',W.list.memories.filter(x=>!x.hidden||x.folder===W.folder).map(x=>[x.folder,x.date+' · '+x.folder.replace(/^\d{4}-\d\d-\d\d_/,'')+(x.hidden?' (old piece, not in the story)':'')]),()=>W.folder,v=>openMem(v))}
   ${select('Image / map to inspect',inspect,()=>S.view,v=>{S.view=v;W.scene.changed();})}
   ${select('Pictures from',[['desktop','This memory\'s folder: desktop set'],['mobile','This memory\'s folder: phone set'],['originals','Photoshop originals'+(m.source?'':' (no folder set)')]],()=>W.source==='originals'?'originals':W.set,v=>pictures(v))}
   ${m.kind==='strip'?'':select('Framing',[['full','Full image'],['cover','Homepage framing']],()=>S.framing,v=>{S.framing=v;changed();})}
   ${select('Depth treatment',Object.entries(DS.presets).map(([v,p])=>[v,p.label]),()=>S.profile,v=>{S.profile=v;S.strength=1;S.opening=1;S.vertical=DS.presets[v].verticalScale;changed();render();})}
   ${slider('Overall depth',0,1.5,.1,()=>S.strength,v=>{S.strength=+v;changed();},pct)}
   ${slider('Opening depth',.5,1.5,.1,()=>S.opening??1,v=>{S.opening=+v;changed();},pct)}
   ${slider('Vertical movement',0,1,.05,()=>S.vertical,v=>{S.vertical=+v;changed();},pct)}
   <div class="row">${btn('resetDepth','Reset treatment')}${btn('reload','Reload image &amp; maps')}</div>
   <p class="st" aria-live="polite">${dirty?'Unsaved changes.':''}</p><p>Shortcuts: ← / → previous or next shot; R reloads the files; \ tucks the studio away.</p>
   <details data-g="files" ${st.open.has('files')?'open':''}><summary>Files used for this memory</summary><div class="files">${m.layers.map((l,i)=>`<strong>${esc(layerName(l,i))}</strong><div>Image: ${esc(l.image)}</div><div class="${l.depth?'':'source-note'}">Depth: ${esc(l.depth||(!l.rigid&&m.depthMap?m.depthMap+' (combined map fallback; covered foreground regions filled as distant background)':'No separate map; constant distance'))}</div>`).join('')}<div>Folder: memories/${esc(W.folder)}/${esc(m.desktopFolder||'desktop')}/</div>${(W.scene.current()?.layers||[]).filter(l=>l.note).map(l=>`<div class="source-note">${esc(l.layer.image)}: ${esc(l.note)}</div>`).join('')}<div>Originals: ${esc(m.source||'not set')}</div></div></details>
   <div class="row">${btn('save','Save this memory','primary')}</div>
   ${group('scene','Scene: framing and depth',`
    ${m.kind==='strip'?'':slider('Zoom into the canvas',1,2,.01,()=>m.zoom||1,v=>{m.zoom=+v;changed();})}
    ${slider(m.kind==='strip'?'Arrival: where the dream cut gathers, across (when no face is drawn)':'Focal point across',0,1,.005,()=>(m.focal||[.5,.5])[0],v=>{m.focal=[+v,(m.focal||[.5,.5])[1]];changed();})}
    ${slider(m.kind==='strip'?'Arrival: where the dream cut gathers, down':'Focal point down',0,1,.005,()=>(m.focal||[.5,.5])[1],v=>{m.focal=[(m.focal||[.5,.5])[0],+v];changed();})}
    ${m.kind==='strip'?'':`<p>Picture shape: read from the background picture each time it loads (${(()=>{const b=W.scene.current()?.layers[0];return b?b.nw+' × '+b.nh+' px':'loading';})()}). Every other picture is drawn at its own size against it.</p>
    ${text('Combined depth map (fallback for layers without a map)',()=>m.depthMap||'',v=>{m.depthMap=v||undefined;changed();})}`}
    ${slider('Pointer response (ms, 0 = instant)',0,600,10,()=>S.response??DS.presets[S.profile].responseMs??0,v=>{S.response=+v;changed();})}
    ${slider('Overscan',1,1.3,.005,()=>S.overscan??DS.presets[S.profile].overscan,v=>{S.overscan=+v;changed();})}
    <p>Faces to keep clear (no words over them): ${(m.faces||[]).length}</p>
    <div class="row">${btn('drawFace',st.mode==='face'?'Drawing a face… (click done)':'Draw a face on the picture')}${btn('clearFaces','Clear faces')}</div>`)}
   ${group('look','Look: motion and finish',`
    ${slider('Motion blur',0,3,.05,lget('blur'),lset('blur'))}
    ${slider('Motion trail',0,3,.05,lget('trail'),lset('trail'))}
    ${slider('Warmth',0,.8,.01,lget('warm'),lset('warm'))}
    ${slider('Coolness',0,.8,.01,lget('cold'),lset('cold'))}
    ${slider('Vignette (soft, depth-map-test)',0,.6,.01,lget('vignette'),lset('vignette'))}
    ${slider('Vignette (deep, Walk Left)',0,1.2,.01,lget('deepVignette'),lset('deepVignette'))}
    ${slider('Grain',0,.06,.001,lget('grain'),lset('grain'))}
    ${slider('Glide (ms, higher is softer)',60,800,5,lget('glide'),lset('glide'))}
    ${slider('Wait before landing on a stop (ms)',100,2000,10,lget('landWait'),lset('landWait'))}
    ${slider('Landing ease (ms)',100,2000,10,lget('landEase'),lset('landEase'))}
    ${slider('Holding near an edge: how fast it streams (stops a second)',0,6,.1,()=>M().look?.edgeSpeed??2.2,lset('edgeSpeed'))}
    ${slider('Holding: still zone in the middle (share of the screen)',0,.45,.01,()=>M().look?.edgeStill??.14,lset('edgeStill'))}
    <div class="row">${btn('lookWL','Walk Left\'s finish')}${btn('lookDM','depth-map-test\'s finish')}</div>`)}
   ${group('layers','Layers and elements',`
    ${select('Layer',m.layers.map((l,i)=>[i,(i+1)+'. '+layerName(l,i)+(l.hidden?' (hidden)':'')]),()=>st.layer,v=>{st.layer=+v;render();})}
    ${text('Name',()=>L.name||L.role||'',v=>{L.name=v;})}
    ${text('Picture file',()=>L.image,v=>{L.image=v;})}
    ${text('Depth map file (blank for none)',()=>L.depth||'',v=>{L.depth=v||null;})}
    <div class="row">${btn('reload','Load these files')}</div>
    ${slider('Distance (plane, far 0 · near 1)',0,1,.01,()=>L.plane,v=>{L.plane=+v;changed();})}
    ${slider('Whole-layer travel (slide)',0,.04,.0002,()=>Number.isFinite(L.travel)?L.travel:L.plane*(DS.presets[S.profile].layerParallax||0),v=>{L.travel=+v;changed();render();})}
    ${check('travel set by distance (as depth-map-test)',()=>!Number.isFinite(L.travel),v=>{L.travel=v?null:L.plane*(DS.presets[S.profile].layerParallax||0);changed();render();})}
    ${m.kind==='strip'?'':select('Fit against the background',[['','Same canvas as the background (default)'],['size','True size: place it yourself']],()=>L.fit||'',v=>{L.fit=v||undefined;reload().then(render);})}
    ${select('Depth map lines up with the picture\'s',[['','Automatic (matched to the picture)'],['left','Left edge'],['right','Right edge']],()=>L.depthAnchor||'',v=>{L.depthAnchor=v||undefined;reload().then(render);})}
    ${m.kind==='strip'?stripLayer(m,L,stops):''}
    ${check('rigid (a picture laid on top; unticked, a background tile stretches under its neighbours at the joins)',()=>!!L.rigid,v=>{L.rigid=v;changed();})}
    ${slider('Move across',-.5,.5,.001,()=>L.x||0,v=>{L.x=+v;changed();})}
    ${slider('Move down',-.5,.5,.001,()=>L.y||0,v=>{L.y=+v;changed();})}
    ${slider('Size',.3,2,.005,()=>L.scale||1,v=>{L.scale=+v;changed();})}
    ${slider('Opacity',0,1,.01,()=>L.opacity??1,v=>{L.opacity=+v;changed();})}
    ${check('hidden',()=>!!L.hidden,v=>{L.hidden=v;changed();render();})}
    <div class="row">${btn('dragLayer',st.mode==='layer'?'Dragging this layer (click to stop)':'Drag this layer on the picture')}</div>
    <div class="row">${btn('layerUp','Move nearer')}${btn('layerDown','Move further')}</div>
    <div class="row">${btn('layerCopy','Duplicate')}${btn('layerRemove','Remove')}</div>
    <p>New element: put its picture (and _Depth map) in this memory's desktop folder or the originals folder, then:</p>
    ${text('Picture file for the new element',()=>st.newImage||'',v=>{st.newImage=v;})}
    <div class="row">${btn('layerAdd','Add element')}</div>`)}
   ${group('stops','Stops: where the view comes to rest',`
    ${select('Stop',stops.map((p,i)=>[i,(i+1)+(p.name?' · '+p.name:'')+(p.line?' · '+p.line.slice(0,28):'')]),()=>st.stop,v=>{st.stop=+v;W.goStop(st.stop);render();})}
    ${m.stops?.length?`
    ${m.kind==='strip'?(()=>{const H=m.height||1500,F=()=>P.frame||(P.frame=[(P.x??H)-H*.7,0,H*1.4,H]);return '<p>The view frames this rectangle of the strip, filling the screen the way the homepage framing does.</p>'
     +slider('Frame left edge (px along the strip)',0,Math.round(m._total||18000),1,()=>F()[0],v=>{F()[0]=+v;W.goStop(st.stop);changed();},v=>Math.round(v))
     +slider('Frame width (px)',300,6000,1,()=>F()[2],v=>{const f=F(),c=f[0]+f[2]/2;f[2]=+v;f[0]=c-f[2]/2;W.goStop(st.stop);changed();},v=>Math.round(v))
     +slider('Frame top (px; moves the picture up or down)',-400,H,1,()=>F()[1],v=>{F()[1]=+v;W.goStop(st.stop);changed();},v=>Math.round(v))
     +slider('Frame height (px)',200,H,1,()=>F()[3],v=>{F()[3]=+v;W.goStop(st.stop);changed();},v=>Math.round(v));})()
     +slider('This picture: fill the screen (0) to the whole picture (1)',0,1,.01,()=>Number.isFinite(P.fit)?P.fit:(m.fit||0),v=>{P.fit=+v;W.goStop(st.stop);changed();})
     +(Number.isFinite(P.fit)?`<div class="row">${btn('fitClear','Use the strip\'s setting here')}</div>`:'')
     +slider('Every picture in this strip: fill (0) to whole (1)',0,1,.01,()=>m.fit||0,v=>{m.fit=+v||undefined;W.goStop(st.stop);changed();})
     +slider('Zoom (1 is the frame; higher shows more, lower moves in)',.6,2,.01,()=>P.show||1,v=>{P.show=+v===1?undefined:+v;W.goStop(st.stop);changed();})
     +text('Moment (give two neighbouring stops the same name to crossfade them)',()=>P.moment||'',v=>{P.moment=v||undefined;changed();})
     :slider('Across',-.5,.5,.001,()=>P.x||0,v=>{P.x=+v;W.goStop(st.stop);changed();})+slider('Down',-.5,.5,.001,()=>P.y||0,v=>{P.y=+v;W.goStop(st.stop);changed();})}
    ${m.kind==='strip'?'':slider('Zoom',.8,4,.01,()=>P.zoom||1,v=>{P.zoom=+v;W.goStop(st.stop);changed();})}
    ${slider('This stop\'s warmth',0,.8,.01,()=>P.look?.warm??lget('warm')(),v=>{P.look={...(P.look||{}),warm:+v};W.refresh();changed();})}
    ${slider('This stop\'s coolness',0,.8,.01,()=>P.look?.cold??lget('cold')(),v=>{P.look={...(P.look||{}),cold:+v};W.refresh();changed();})}
    ${P.look?`<div class="row">${btn('stopLookClear','Use the memory\'s look here')}</div>`:''}
    ${text('Ethel\'s line here (optional)',()=>P.line||'',v=>{P.line=v||undefined;})}
    <div class="row">${btn('dragStop',st.mode==='stop'?'Dragging the view (click to stop)':'Drag the view on the picture')}</div>
    <div class="row">${btn('stopUp','Earlier')}${btn('stopDown','Later')}${btn('stopRemove','Remove')}</div>`:'<p>One stop (the whole picture). Add stops to glide between parts of it.</p>'}
    <div class="row">${btn('stopAdd','Add a stop here')}</div>
    ${slider('Start at stop',0,Math.max(0,stops.length-1),1,()=>m.startStop||0,v=>{m.startStop=+v;changed();},v=>(+v+1))}`)}
   ${group('ways','Ways out',`
    <p>${m.direction==='left'?'This memory runs right to left: "before the first stop" is its right end.':'Before the first stop is the left end, after the last stop the right end.'}</p>
    ${select('Before the first stop, push into',memOpts(),()=>m.exits?.left?.to||'',v=>{m.exits=m.exits||{};m.exits.left={...(m.exits.left||{}),to:v||null};changed();})}
    ${select('…the way it goes',[['','Slide sideways'],['push','Back through the depth']],()=>m.exits?.left?.style||'',v=>{m.exits=m.exits||{};m.exits.left={...(m.exits.left||{}),style:v||undefined};changed();})}
    ${select('After the last stop, push into',memOpts(),()=>m.exits?.right?.to||'',v=>{m.exits=m.exits||{};m.exits.right={...(m.exits.right||{}),to:v||null};changed();})}
    ${select('…the way it goes',[['','Slide sideways'],['push','Push forward through the picture']],()=>m.exits?.right?.style||'',v=>{m.exits=m.exits||{};m.exits.right={...(m.exits.right||{}),style:v||undefined};changed();})}
    ${select('Arrive into this memory through',[['','Drift, in this memory\'s own way (default)'],...Object.entries(W.DREAM||{}).filter(([k])=>k!=='drift').map(([k,d])=>[k,d.label])],()=>m.cut?.style||'',v=>{m.cut=m.cut||{};if(v)m.cut.style=v;else delete m.cut.style;changed();render();})}
    ${slider('How long the arrival takes (ms)',600,5000,50,()=>m.cut?.arrive??(W.DREAM?.[m.cut?.style]?.ms??2200),v=>{m.cut=m.cut||{};m.cut.arrive=+v;changed();})}
    ${slider('The new memory settles in from (zoom)',0,.2,.005,()=>m.cut?.settle??.07,v=>{m.cut=m.cut||{};m.cut.settle=+v;changed();})}
    <div class="row">${btn('tryArrive','See it arrive')}</div>
    ${(m.exits?.left?.to&&m.exits.left.style!=='push')||(m.exits?.right?.to&&m.exits.right.style!=='push')?`<p>Sideways slides (a way out here is set to slide):</p>
    ${select('Slide into this memory',[['','Sweep the way the visitor pushed'],['0','Through the depth'],['1','Sweep from the left'],['3','Sweep from the right'],['2','From the top']],()=>m.cut?.kind??'',v=>{m.cut=m.cut||{};if(v==='')delete m.cut.kind;else m.cut.kind=+v;changed();})}
    ${slider('Cut length (ms)',300,4000,50,()=>m.cut?.duration??1500,v=>{m.cut=m.cut||{};m.cut.duration=+v;changed();})}
    ${slider('Slide through the cut',0,.2,.005,()=>m.cut?.travel??.07,v=>{m.cut=m.cut||{};m.cut.travel=+v;changed();})}`:''}
    <div class="row">${btn('tryLeft','Try left')}${btn('tryRight','Try right')}</div>`)}
   ${group('doors','Doors: push forward into a scene',`
    ${(m.doors||[]).map((d,i)=>`<div class="item"><b>Door ${i+1}</b>${select('Leads into',memOpts('Nowhere yet'),()=>d.to||'',v=>{d.to=v||null;changed();})}
     ${slider('Push-in length (ms)',600,4000,50,()=>d.duration??1400,v=>{d.duration=+v;changed();})}
     <div class="row">${btn('doorTry:'+i,'Try it')}${btn('doorRemove:'+i,'Remove')}</div></div>`).join('')}
    ${check('Show door and egg spots on the picture',()=>!!st.spots,v=>{st.spots=v;drawOverlay();})}
    <div class="row">${btn('drawDoor',st.mode==='door'?'Draw the door spot on the picture…':'Add a door (draw its spot)')}</div>`)}
   ${group('eggs','Easter eggs: Isla and Dominic',`
    ${(m.eggs||[]).map((g,i)=>`<div class="item"><b>Egg ${i+1}</b>${select('Drops into',memOpts('Nowhere yet'),()=>g.to||'',v=>{g.to=v||null;changed();})}
     ${slider('Lasts (s)',2,15,.5,()=>g.seconds??6,v=>{g.seconds=+v;changed();})}
     <div class="row">${btn('eggTry:'+i,'Try it')}${btn('eggRemove:'+i,'Remove')}</div></div>`).join('')}
    <div class="row">${btn('drawEgg',st.mode==='egg'?'Draw the egg spot on the picture…':'Add an egg (draw its spot)')}</div>
    <p>An egg's memory is made like any other (give it its own nightmare look) and ticked "egg" in its details so it stays off the timeline.</p>`)}
   ${group('sound','Sound and Ethel\'s lines',`
    ${text('Voice file',()=>m.voice?.audio||'',v=>{m.voice=m.voice||{lines:[]};m.voice.audio=v||undefined;})}
    ${slider('Dark lifts over (s)',0,15,.5,()=>m.voice?.reveal??8.5,v=>{m.voice=m.voice||{lines:[]};m.voice.reveal=+v;})}
    ${num('Hand the picture over at (s)',()=>m.voice?.handover??'',v=>{m.voice=m.voice||{lines:[]};m.voice.handover=+v;},.05)}
    <p>Press <b>Time the lines</b>, then Space as each line starts. Esc stops.</p>
    <div class="row">${btn('time','Time the lines')}${btn('play','Play')}${btn('stopVoice','Stop')}</div>
    <ol class="lines">${(m.voice?.lines||[]).map((x,i)=>`<li>${num('',()=>x.t,v=>{x.t=+v;W.voice.lines=m.voice.lines;},.05)} ${esc(x.text)}${x.echo?' <i>(echo)</i>':''}</li>`).join('')}</ol>
    ${text('Loop file (plays after her voice)',()=>m.sound?.after||'',v=>{m.sound=m.sound||{};m.sound.after=v||undefined;})}
    ${slider('Loop volume',0,1.5,.01,()=>m.sound?.volume??1,v=>{m.sound=m.sound||{};m.sound.volume=+v;})}
    ${slider('Loop fades in over (s)',0,10,.1,()=>m.sound?.fadeIn??2.5,v=>{m.sound=m.sound||{};m.sound.fadeIn=+v;})}
    ${slider('Loop repeats fade across (s)',0,8,.1,()=>m.sound?.overlap??2.5,v=>{m.sound=m.sound||{};m.sound.overlap=+v;})}
    ${slider('Loop starts before her voice ends (s)',0,10,.1,()=>m.sound?.startBeforeEnd??1.5,v=>{m.sound=m.sound||{};m.sound.startBeforeEnd=+v;})}`)}
   ${group('details','This memory\'s details',`
    ${text('Title',()=>m.title||'',v=>{m.title=v;})}
    ${text('Date (YYYY-MM-DD)',()=>m.date||'',v=>{m.date=v;listEntry().date=v;})}
    ${num('Order on that date',()=>listEntry().order??m.order??1,v=>{m.order=+v;listEntry().order=+v;},.1)}
    ${check('key moment (a bigger mark on the timeline)',()=>!!listEntry().key,v=>{listEntry().key=v||undefined;W.timeline.build();})}
    ${check('egg (kept off the timeline)',()=>!!listEntry().egg,v=>{listEntry().egg=v||undefined;m.egg=v||undefined;W.timeline.build();})}
    ${select('The story runs',[['','Left to right (drag left to go on)'],['left','Right to left (drag right to go on)']],()=>m.direction||'',v=>{m.direction=v||undefined;changed();render();})}
    ${check('placeholder (to be replaced)',()=>!!m.placeholder,v=>{m.placeholder=v||undefined;listEntry().placeholder=v||undefined;})}
    ${check('the visitor starts here',()=>W.list.start===W.folder,v=>{W.list.start=v?W.folder:undefined;})}
    ${text('Photoshop originals folder (from RND_NEW_SITT)',()=>m.source||'',v=>{m.source=v||undefined;})}
    <div class="row">${btn('copyIn','Copy originals into this memory')}${btn('makePhone','Make the phone set')}</div>`)}
   ${group('new','New memory',`
    ${text('Date (YYYY-MM-DD)',()=>st.nd||'',v=>{st.nd=v;})}
    ${text('Short name (e.g. police-at-the-gate)',()=>st.nn||'',v=>{st.nn=v;})}
    ${text('Photoshop originals folder (e.g. ../assets/entry-experiment/FinalsForTest_01/22_Name/)',()=>st.ns||'',v=>{st.ns=v;})}
    ${text('File name start (e.g. Police_At_the_gate_)',()=>st.np||'',v=>{st.np=v;})}
    <p>Finds <i>Background, Mid, Top</i> and each <i>_Depth</i> map by that start.</p>
    <div class="row">${btn('create','Create the memory','primary')}</div>`)}
   <div class="row">${btn('save','Save this memory','primary')}</div>`;
   for(const d of el.querySelectorAll('details[data-g]'))d.addEventListener('toggle',()=>{d.open?st.open.add(d.dataset.g):st.open.delete(d.dataset.g);});
   drawOverlay();}
  // a strip layer's place and choreography (Walk Left's): where it sits, the stops it shows at, travelling with the view, inserts
  const list1=a=>(a||[]).map(k=>k+1).join(', '),parse1=v=>String(v).split(/[^0-9]+/).filter(Boolean).map(n=>+n-1).filter(n=>n>=0);
  function stripLayer(m,L,stops){const H=m.height||1500,tot=Math.round(m._total||H*6),apply=()=>{W.scene.current()?.layers.forEach(l=>{if(l.layer===L&&L.rect){[l.X0,l.Y0,l.W,l.Hh]=L.rect;}});changed();};
   let h='';
   if(L.rect)h+='<p>Placed freely in the strip (px):</p>'
    +slider('Left edge',-2000,tot,1,()=>L.rect[0],v=>{L.rect[0]=+v;apply();},v=>Math.round(v))
    +slider('Top',-600,H,1,()=>L.rect[1],v=>{L.rect[1]=+v;apply();},v=>Math.round(v))
    +slider('Width',100,8000,1,()=>L.rect[2],v=>{const a=L.rect[3]/L.rect[2];L.rect[2]=+v;L.rect[3]=Math.round(+v*a);apply();},v=>Math.round(v))
    +slider('Height',100,4000,1,()=>L.rect[3],v=>{L.rect[3]=+v;apply();},v=>Math.round(v));
   else h+=`<div class="row">${btn('placeFree','Place it freely in the strip')}</div>`;
   const F4=()=>{const f=L.feather||[0,0,0,0];return f.length===2?[f[0],f[0],f[1],f[1]]:f.slice();},setF=(i,v)=>{const f=F4();f[i]=+v;L.feather=f;if(!f.some(Boolean))delete L.feather;changed();};
   h+=slider('Soft left side (melts into what is beside it)',0,.25,.005,()=>F4()[0],v=>setF(0,v))+slider('Soft right side',0,.25,.005,()=>F4()[1],v=>setF(1,v))
    +slider('Soft top',0,.25,.005,()=>F4()[2],v=>setF(2,v))+slider('Soft bottom',0,.25,.005,()=>F4()[3],v=>setF(3,v));
   h+=text('Shown only at stops (e.g. 1, 2; blank for always)',()=>list1(L.stops),v=>{const a=parse1(v);if(a.length)L.stops=a;else delete L.stops;W.scene.changed();dirty=true;});
   if(L.stops)h+=slider('Crossfade starts (share of the move)',0,.95,.01,()=>(L.fade||[0,1])[0],v=>{L.fade=[+v,Math.max(+v+.05,(L.fade||[0,1])[1])];changed();})
    +slider('Crossfade ends',.05,1,.01,()=>(L.fade||[0,1])[1],v=>{L.fade=[Math.min((L.fade||[0,1])[0],+v-.05),+v];changed();});
   // two ways a layer travels with the view: around one stop ("at": drifts toward either neighbour), or between two stops ("from"-"to")
   const kOf=f=>Array.isArray(f.k)?f.k[0]:(f.k??.85);
   h+=text('Travels with the view: around one stop (e.g. 4) or between two (e.g. 1-3); blank for no',()=>!L.follow?'':Number.isFinite(L.follow.at)?String(L.follow.at+1):(L.follow.from+1)+'-'+(L.follow.to+1),v=>{const a=parse1(v),k=L.follow?kOf(L.follow):.85;
    if(a.length>=2)L.follow={from:a[0],to:a[1],k};else if(a.length===1)L.follow={at:a[0],k:[k,k]};else delete L.follow;W.scene.changed();dirty=true;});
   if(L.follow)h+=slider('How much it travels with the view',0,1,.01,()=>kOf(L.follow),v=>{L.follow.k=Array.isArray(L.follow.k)?[+v,+v]:+v;changed();});
   h+=num('A different angle, filling the screen at stop (blank for no)',()=>L.insert?L.insert.stop+1:'',v=>{if(v===''||!(+v>0)){delete L.insert;}else{L.insert={...(L.insert||{}),stop:+v-1};}W.scene.changed();dirty=true;},1);
   if(L.insert)h+=slider('Held fully for (px of travel)',0,1500,5,()=>L.insert.hold??80,v=>{L.insert.hold=+v;changed();},v=>Math.round(v))
    +slider('Dissolves over (px of travel)',50,3000,5,()=>L.insert.fade??480,v=>{L.insert.fade=+v;changed();},v=>Math.round(v))
    +slider('Drifts with the view',0,1,.01,()=>L.insert.drift??.35,v=>{L.insert.drift=+v;changed();})
    +slider('Grows as the view leaves it',0,2,.01,()=>L.insert.spread??.7,v=>{L.insert.spread=+v;changed();});
   return h;}
  const listEntry=()=>W.list.memories.find(x=>x.folder===W.folder)||{};
  el.addEventListener('input',e=>{const c=C[e.target.dataset.c];if(!c||c.select)return;
   const v=c.check?e.target.checked:c.text?e.target.value:e.target.value;c.set(v);
   const o=el.querySelector(`[data-o="${e.target.dataset.c}"]`);if(o)o.textContent=c.fmt(e.target.value);
   if(!c.text&&!c.num)changed();else{dirty=true;say('Unsaved changes.');}});
  el.addEventListener('change',e=>{const c=C[e.target.dataset.c];if(c?.select)c.set(e.target.value);});
  async function openMem(f){if(dirty&&!confirmLeave())return render();await W.open(f);dirty=false;st.layer=0;st.stop=0;render();}
  function confirmLeave(){say('Unsaved changes here: save first, or choose again to leave them.');if(confirmLeave.armed){confirmLeave.armed=false;return true;}confirmLeave.armed=true;setTimeout(()=>confirmLeave.armed=false,4000);return false;}
  // Previous and Next walk the memories visitors see; hidden ones (old pieces, stand-ins) are only in the list above
  function step(d){const L=W.list.memories.filter(x=>!x.hidden);if(!L.length)return;let i=L.findIndex(x=>x.folder===W.folder);if(i<0){const A=W.list.memories,j=A.findIndex(x=>x.folder===W.folder);i=L.findIndex(x=>A.indexOf(x)>j);i=i<0?(d>0?-1:L.length):(d>0?i-1:i);}openMem(L[(i+d+L.length)%L.length].folder);}
  async function pictures(v){if(v==='originals')W.source='originals';else{W.source='copies';W.set=v;}say('Loading pictures…');await reload();}
  async function reload(){say('Reloading…');try{await W.scene.reload(M(),{folder:W.folder,set:W.set,source:W.source});W.refresh();say('Reloaded '+new Date().toLocaleTimeString());}catch(e){say('Could not load: '+e.message);}}
  W.studioReload=reload;
  // ---- buttons ----
  let timing=null;
  el.addEventListener('click',async e=>{const b=e.target.dataset?.b;if(!b)return;const m=M();const [name,arg]=b.split(':');const i=+arg;
   const L=m.layers[st.layer];
   switch(name){
    case 'openAll':st.open=new Set(['files','scene','look','layers','stops','ways','doors','eggs','sound','details','new']);render();break;
    case 'closeAll':st.open=new Set();render();break;
    case 'hideStudio':{const u=new URL(location.href);u.searchParams.set('tune','0');location.href=u.toString();break;}
    case 'prev':case 'next':stepShot(name==='next'?1:-1);break;
    case 'reload':reload();break;
    case 'resetDepth':S.profile=DS.defaultProfile;S.strength=1;S.opening=1;S.vertical=DS.presets[S.profile].verticalScale;S.light=2;S.response=null;S.overscan=null;changed();render();break;
    case 'aspect':{const bg=W.scene.current()?.layers[0];if(bg?.colorTexture){const im=new Image();im.onload=()=>{m.aspect=+(im.width/im.height).toFixed(4);changed();render();};
     im.src=W.source==='originals'&&m.source?m.source+m.layers[0].image:'memories/'+W.folder+'/desktop/'+m.layers[0].image;}break;}
    case 'drawFace':mode(st.mode==='face'?'none':'face');break;case 'clearFaces':m.faces=[];changed();render();break;
    case 'lookWL':Object.assign(lk(),{blur:1,trail:1,warm:.15,cold:0,vignette:0,deepVignette:.5,grain:.03});Object.assign(S.look,m.look);changed();render();break;
    case 'lookDM':Object.assign(lk(),{blur:1,trail:1,warm:0,cold:0,vignette:.13,deepVignette:0,grain:.011});Object.assign(S.look,m.look);changed();render();break;
    case 'dragLayer':mode(st.mode==='layer'?'none':'layer');break;
    case 'layerUp':if(st.layer<m.layers.length-1){[m.layers[st.layer],m.layers[st.layer+1]]=[m.layers[st.layer+1],m.layers[st.layer]];st.layer++;await reload();changed();render();}break;
    case 'layerDown':if(st.layer>0){[m.layers[st.layer],m.layers[st.layer-1]]=[m.layers[st.layer-1],m.layers[st.layer]];st.layer--;await reload();changed();render();}break;
    case 'layerCopy':m.layers.splice(st.layer+1,0,{...JSON.parse(JSON.stringify(L)),name:(L.name||L.role)+' copy',x:(L.x||0)+.02});st.layer++;await reload();changed();render();break;
    case 'layerRemove':if(m.layers.length>1){m.layers.splice(st.layer,1);st.layer=Math.max(0,st.layer-1);await reload();changed();render();}break;
    case 'layerAdd':{const f=(st.newImage||'').trim();if(!f){say('Type the picture file name first.');break;}
     const d=f.replace(/\.(png|webp)$/i,'_Depth.$1');m.layers.push({role:'element',name:f.replace(/\.(png|webp)$/i,''),image:f,depth:d,plane:.8,rigid:true,travel:null,x:0,y:0,scale:1,opacity:1});
     st.layer=m.layers.length-1;st.newImage='';await reload();changed();render();break;}
    case 'stopAdd':{const cam=S.cam;m.stops=m.stops||[];if(!m.stops.length)m.stops.push({x:0,y:0,zoom:1});
     m.stops.splice(st.stop+1,0,m.kind==='strip'?{frame:(cam.frame||[0,0,2000,1500]).map(v=>Math.round(v))}:{x:+(cam.x||0).toFixed(4),y:+(cam.y||0).toFixed(4),zoom:+(cam.zoom||1).toFixed(3)});st.stop++;W.goStop(st.stop);changed();render();break;}
    case 'stopRemove':m.stops.splice(st.stop,1);st.stop=Math.max(0,st.stop-1);if(m.stops.length<2)delete m.stops;W.goStop(st.stop);changed();render();break;
    case 'stopUp':if(st.stop>0){[m.stops[st.stop],m.stops[st.stop-1]]=[m.stops[st.stop-1],m.stops[st.stop]];st.stop--;changed();render();}break;
    case 'stopDown':if(st.stop<m.stops.length-1){[m.stops[st.stop],m.stops[st.stop+1]]=[m.stops[st.stop+1],m.stops[st.stop]];st.stop++;changed();render();}break;
    case 'stopLookClear':{const P=W.stops(m)[st.stop];delete P.look;S.look={...LOOK,...(m.look||{})};W.refresh();changed();render();break;}
    case 'fitClear':{const P=W.stops(m)[st.stop];delete P.fit;W.goStop(st.stop);changed();render();break;}
    case 'placeFree':{const l=W.scene.current()?.layers[st.layer];if(l){L.rect=[Math.round(l.X0),Math.round(l.Y0||0),Math.round(l.W),Math.round(l.Hh||m.height||1500)];changed();render();}break;}
    case 'dragStop':mode(st.mode==='stop'?'none':'stop');break;
    case 'tryArrive':{const back=W.list.memories.find(x=>x.folder!==W.folder&&!x.hidden);if(!back)break;const here=W.folder;W.handOver();await W.go(back.folder,{jump:true,kind:1});setTimeout(()=>W.go(here,{jump:true,kind:1}),400);break;}
    case 'tryLeft':W.handOver();W.travel('left');break;case 'tryRight':W.handOver();W.travel('right');break;
    case 'drawDoor':mode(st.mode==='door'?'none':'door');break;case 'doorRemove':m.doors.splice(i,1);changed();render();break;
    case 'doorTry':W.handOver();if(m.doors[i]?.to)W.enterDoor(m.doors[i]);else say('Choose where the door leads first.');break;
    case 'drawEgg':mode(st.mode==='egg'?'none':'egg');break;case 'eggRemove':m.eggs.splice(i,1);changed();render();break;
    case 'eggTry':W.handOver();if(m.eggs[i]?.to)W.enterEgg(m.eggs[i]);else say('Choose which memory the egg drops into first.');break;
    case 'play':W.voice.stop();W.voice.load(m.voice);W.voice.play();break;
    case 'stopVoice':W.voice.stop();break;
    case 'time':W.voice.stop();W.voice.load(m.voice);timing=0;W.voice.play();say('Press Space as each line starts. Esc stops.');break;
    case 'copyIn':copyIn();break;case 'makePhone':makePhone();break;
    case 'create':create();break;
    case 'save':save();break;}});
  addEventListener('keydown',e=>{
   if(timing!=null&&(e.code==='Space'||e.key==='Escape')){e.preventDefault();
    if(e.key==='Escape'){timing=null;W.voice.stop();say('Stopped timing. Save to keep the times.');render();return;}
    const L=M().voice.lines,now=W.voice.audio.currentTime;if(timing>0)L[timing-1].end=+Math.max(L[timing-1].t+.3,now-.1).toFixed(2);
    if(timing<L.length){L[timing].t=+now.toFixed(2);delete L[timing].end;timing++;say('Line '+timing+' of '+L.length+' at '+now.toFixed(2)+' s');}
    if(timing>=L.length){W.voice.audio.addEventListener('ended',()=>{L[L.length-1].end=+W.voice.audio.duration.toFixed(2);},{once:true});timing=null;dirty=true;say('All lines timed. Save to keep them.');setTimeout(render,50);}
    W.voice.lines=L;return;}
   if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
   if(e.key==='\\'){e.preventDefault();fold.click();return;}
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stepShot(e.key==='ArrowLeft'?-1:1);}
   else if(e.key.toLowerCase()==='r'){e.preventDefault();reload();}});
  // ---- drawing and dragging on the picture ----
  function mode(m){st.mode=m;ov.classList.toggle('on',m!=='none');W.lock=m!=='none';render();}
  let drag=null;
  ov.addEventListener('pointerdown',e=>{const p=W.scene.toImage(e.clientX,e.clientY);if(!p)return;ov.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,p,cur:p};});
  ov.addEventListener('pointermove',e=>{if(!drag)return;const m=M(),c=W.scene.crop(),r=ov.getBoundingClientRect();
   const dx=(e.clientX-drag.x)/r.width*c[0],dy=(e.clientY-drag.y)/r.height*c[1];drag.x=e.clientX;drag.y=e.clientY;drag.cur=W.scene.toImage(e.clientX,e.clientY);
   if(st.mode==='layer'){const L=m.layers[st.layer],lc=W.scene.layerCrop(st.layer);const lx=(e.movementX||0)/r.width*lc[0],ly=(e.movementY||0)/r.height*lc[1];
    L.x=+((L.x||0)+(m.kind==='strip'?lx:dx)).toFixed(4);L.y=+((L.y||0)+(m.kind==='strip'?ly:dy)).toFixed(4);changed();}
   else if(st.mode==='stop'&&m.stops?.length){const P=m.stops[st.stop];
    if(m.kind==='strip'){const H=m.height||1500,f=P.frame||(P.frame=[(P.x??H)-H*.7,0,H*1.4,H]);f[0]=Math.round(f[0]-dx);f[1]=Math.round(clamp(f[1]-dy,0,H-f[3]));}
    else{P.x=+((P.x||0)-dx).toFixed(4);P.y=+((P.y||0)-dy).toFixed(4);}W.goStop(st.stop);changed();}
   else drawOverlay();});
  ov.addEventListener('pointerup',()=>{if(!drag)return;const m=M(),a=drag.p,b=drag.cur;drag=null;
   const rect=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])].map(v=>+v.toFixed(4));
   const big=rect[2]-rect[0]>.005&&rect[3]-rect[1]>.005;
   if(st.mode==='door'&&big){m.doors=m.doors||[];m.doors.push({rect,to:null,duration:1400});st.open.add('doors');changed();mode('none');}
   else if(st.mode==='egg'&&big){m.eggs=m.eggs||[];m.eggs.push({rect,to:null,seconds:6});st.open.add('eggs');changed();mode('none');}
   else if(st.mode==='face'&&big){m.faces=m.faces||[];m.faces.push([+((rect[0]+rect[2])/2).toFixed(4),+((rect[1]+rect[3])/2).toFixed(4),+((rect[2]-rect[0])/2).toFixed(4),+((rect[3]-rect[1])/2).toFixed(4)]);changed();render();}
   else if(st.mode==='layer'||st.mode==='stop')render();});
  function drawOverlay(){const r=ov.getBoundingClientRect();ov.width=r.width*devicePixelRatio;ov.height=r.height*devicePixelRatio;const g=ov.getContext('2d');g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);g.clearRect(0,0,r.width,r.height);
   const m=M();if(!m)return;const ox=r.left,oy=r.top;
   const box=(rc,col,label)=>{const a=W.scene.fromImage(rc[0],rc[1]),b=W.scene.fromImage(rc[2],rc[3]);if(!a)return;g.strokeStyle=col;g.lineWidth=1.5;g.setLineDash([5,4]);g.strokeRect(a[0]-ox,a[1]-oy,b[0]-a[0],b[1]-a[1]);g.setLineDash([]);g.fillStyle=col;g.font='11px system-ui';g.fillText(label,a[0]-ox+4,a[1]-oy+13);};
   // nothing is drawn over the picture unless you are working on it: spots only while placing them (or with "Show spots")
   if(st.mode==='door'||st.spots)(m.doors||[]).forEach((d,i)=>box(d.rect,'#8fd3ff','door '+(i+1)));
   if(st.mode==='egg'||st.spots)(m.eggs||[]).forEach((d,i)=>box(d.rect,'#ff8f8f','egg '+(i+1)));
   if(st.mode==='face')(m.faces||[]).forEach(f=>box([f[0]-f[2],f[1]-f[3],f[0]+f[2],f[1]+f[3]],'rgba(230,230,210,.7)','face'));
   if(st.mode==='layer'){const L=m.layers[st.layer],s=L.scale||1;box([.5+(L.x||0)-s/2,.5+(L.y||0)-s/2,.5+(L.x||0)+s/2,.5+(L.y||0)+s/2],'#e8c98f',layerName(L,st.layer));}
   if(drag&&['door','egg','face'].includes(st.mode)){const a=drag.p,b=drag.cur;box([Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])],'#fff','');}}
  addEventListener('resize',drawOverlay);addEventListener('sitt:memory',()=>{if(!el.contains(document.activeElement))render();});
  buildStory();W.studioStory=()=>story;
  // ---- files: saving, copying originals in, making the phone set, new memories ----
  async function folder(){if(!window.showDirectoryPicker)throw Error('This browser cannot save files directly. Use Chrome or Edge.');
   if(!dir)dir=await showDirectoryPicker({id:'sitt-story',mode:'readwrite'});
   try{await dir.getDirectoryHandle('memories');}catch{dir=null;throw Error('Pick the story folder (the one with memories inside).');}return dir;}
  async function write(path,data){const d=await folder();const parts=path.split('/');let h=d;for(const p of parts.slice(0,-1))h=await h.getDirectoryHandle(p,{create:true});
   const w=await (await h.getFileHandle(parts.at(-1),{create:true})).createWritable();await w.write(data);await w.close();}
  const clean=m=>JSON.stringify(m,(k,v)=>k==='colorTexture'||k==='depthTexture'?undefined:v,1);
  async function save(){try{await write('memories/'+W.folder+'/memory.json',clean(M()));await write('memories/list.json',JSON.stringify(W.list,null,1));dirty=false;buildStory();say('Saved memories/'+W.folder+'/memory.json and the memory list.');}
   catch(err){say('Not saved: '+err.message);}}
  const files=m=>[...new Set(m.layers.flatMap(l=>[l.image,l.depth]).concat([m.together,m.depthMap]).filter(Boolean))];
  async function copyIn(){const m=M();if(!m.source){say('Set the Photoshop originals folder first.');return;}let n=0;
   try{for(const f of files(m)){const r=await fetch(m.source+f+'?r='+Date.now(),{cache:'no-store'});if(!r.ok)continue;await write('memories/'+W.folder+'/'+(m.desktopFolder||'desktop')+'/'+f,await r.blob());n++;say('Copied '+n+'…');}
    say('Copied '+n+' files into memories/'+W.folder+'/desktop/. Now make the phone set.');}catch(err){say('Not copied: '+err.message);}}
  async function makePhone(){const m=M();let n=0;
   try{for(const f of files(m)){let r=await fetch('memories/'+W.folder+'/'+(m.desktopFolder||'desktop')+'/'+f+'?r='+Date.now(),{cache:'no-store'});if(!r.ok&&m.source)r=await fetch(m.source+f,{cache:'no-store'});if(!r.ok)continue;
     const bmp=await createImageBitmap(await r.blob());const w=Math.min(1000,bmp.width),h=Math.round(bmp.height*w/bmp.width);const c=new OffscreenCanvas(w,h);c.getContext('2d').drawImage(bmp,0,0,w,h);
     const blob=await c.convertToBlob({type:'image/webp',quality:.82});await write('memories/'+W.folder+'/mobile/'+f.replace(/\.png$/i,'.webp'),blob);n++;say('Phone set: '+n+'…');}
    say('Made '+n+' phone pictures in memories/'+W.folder+'/mobile/.');}catch(err){say('Not made: '+err.message);}}
  async function create(){const date=(st.nd||'').trim(),name=(st.nn||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-'),src=(st.ns||'').trim(),pre=(st.np||'').trim();
   if(!/^\d{4}-\d\d-\d\d$/.test(date)||!name){say('Give a date (YYYY-MM-DD) and a short name.');return;}
   const f=date+'_'+name;if(W.list.memories.some(x=>x.folder===f)){say('That memory already exists.');return;}
   const source=src&&!src.endsWith('/')?src+'/':src;
   const exists=async n=>{try{return (await fetch(source+n,{method:'HEAD',cache:'no-store'})).ok;}catch{return false;}};
   const layers=[];for(const [role,plane,rigid] of [['background',.16,false],['mid',.64,true],['top',.88,true]]){
    const cap=role[0].toUpperCase()+role.slice(1);let img=null;for(const n of [pre+cap+'.png',pre+role+'.png'])if(await exists(n)){img=n;break;}
    if(!img)continue;let dep=null;for(const n of [img.replace(/\.png$/i,'_Depth.png'),img.replace(/\.png$/i,'_depth.png')])if(await exists(n)){dep=n;break;}
    layers.push({role,image:img,depth:dep,plane,rigid,travel:role==='top'?.0132:null});}
   if(!layers.length){say('No Background, Mid or Top pictures found with that file name start in that folder.');return;}
   const prev=M(),m={id:name,title:name.replace(/-/g,' '),date,order:1,kind:'scene',source,aspect:prev.aspect,focal:[.5,.5],zoom:1,faces:[],
    depth:{...prev.depth},look:{...(prev.look||{})},layers,exits:{left:{to:null},right:{to:null}},cut:{duration:1500,travel:.07}};
   try{await write('memories/'+f+'/memory.json',JSON.stringify(m,null,1));
    const sameDay=W.list.memories.filter(x=>x.date===date);const order=sameDay.length?Math.max(...sameDay.map(x=>x.order||1))+1:1;m.order=order;
    W.list.memories.push({folder:f,date,order});W.list.memories.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.order||0)-(b.order||0));
    await write('memories/'+f+'/memory.json',JSON.stringify(m,null,1));await write('memories/list.json',JSON.stringify(W.list,null,1));
    W.source='originals';await W.open(f);W.timeline.build();render();say('Created memories/'+f+'/. It reads your originals for now; Copy originals in and Make the phone set when ready.');}
   catch(err){say('Not created: '+err.message);}}
  render();
 }
 window.SITTStudio={start};
})();

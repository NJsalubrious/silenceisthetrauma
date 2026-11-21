/* SITT memory world · Ethel's voice.
 * Plays a memory's audio and shows its lines as captions in time with it.
 * Line times live in the memory's memory.json ("voice.lines"); the studio can time them by ear.
 */
(() => {
 'use strict';
 function create(el){
  let audio=null,lines=[],raf=0,shown=-1,onEnd=null,from=0,to=null,fadeIn=0,soft=0,dying=null,skip=[],classic=false;   // classic: the earlier story's way (a new line cuts one still fading)
  const line=el.querySelector('p');
  function show(i){if(i===shown)return;shown=i;
   if(i<0){el.classList.remove('on');return;}
   line.textContent=lines[i].text;el.classList.toggle('echo',!!lines[i].echo);el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
  function tick(){raf=requestAnimationFrame(tick);if(!audio||shown===-3)return;const t=audio.currentTime;
   const jump=skip.find(([a,b])=>t>=a&&t<b);if(jump){audio.currentTime=jump[1];return;}   // a stretch left out between two parts
   if(to!=null&&t>=to&&!audio.paused&&dying!==audio){if(queue.length){audio.pause();next();return;}fade(300);return;}   // a part of a longer file ends at its own "to" (in her pause, so the next part's words never bleed in)
   let i=-1;for(let k=0;k<lines.length;k++)if(t>=lines[k].t&&t<(lines[k].end??(lines[k+1]?.t??1e9)))i=k;if(lines[i]?.part&&audio.paused)i=-1;show(i);}   // a part's subtitle only while she is actually speaking it
  // from / to (seconds): play only that part of the file (one narration cut into a stop's worth); fadeIn (ms) eases it in; skip: [[from,to],…] stretches jumped over, so two parts play as one;
  // fadeOut (ms): it drifts off into the silence like a thought (a soft curve), and keeps fading under the next one instead of being cut
  // parts: [{audio, from, to, gap}, …] a stop's lines as separate clips, played in turn; gap (seconds) is the silence before each
  // (before the first, it holds her back while something else happens first)
  // ends[i]: when part i finished (performance.now), so sounds can answer a line once it is really over, however long the clips took to load
  let queue=[],gapT=0,root='',wait=0,ends=[];
  // fx: a sound made for this line, the same length as it (Ethel_Talks_Crash_To_Saftey_Dep_Box, "_FX"): it plays, pauses, seeks and fades with her
  // line, as one; fxGain (0 to 1) how loud against her
  function withFx(a,p){const x=new Audio(root+p.fx),g=Math.max(0,Math.min(1,p.fxGain??1));x.preload='auto';a.fx=x;
   const sync=()=>{if(Math.abs(x.currentTime-a.currentTime)>.06)try{x.currentTime=a.currentTime;}catch{}};
   a.addEventListener('play',()=>{sync();x.volume=a.volume*g;x.play().catch(()=>{});});a.addEventListener('pause',()=>x.pause());
   a.addEventListener('seeked',sync);a.addEventListener('volumechange',()=>{x.volume=a.volume*g;});}
  // tone: a line made softer and stranger, through the sound card's own chain: {gain (0-1), lowpass / highpass (Hz), pan (-1 left … 1 right), rate (slower is lower, pitch goes with it),
  // reverb (wet 0-1), room (s), echo: {time, feedback, wet}}. Fades still work (the player's volume comes first).
  const rooms={};function roomIR(c,sec){if(rooms[sec])return rooms[sec];const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);}return rooms[sec]=b;}
  function withTone(a,t){try{const c=window.SITTSound.context(),src=c.createMediaElementSource(a),out=c.createGain();out.gain.value=t.gain??1;out.connect(c.destination);
   let head=out;if(t.pan||t.drift){const p=c.createStereoPanner();p.pan.value=t.drift?.from??t.pan;p.connect(head);head=p;
    // drift: {from, to, sec} the voice moves slowly across the space while she speaks (floating)
    if(t.drift)a.addEventListener('play',()=>{const n=c.currentTime;p.pan.cancelScheduledValues(n);p.pan.setValueAtTime(t.drift.from,n);p.pan.linearRampToValueAtTime(t.drift.to,n+(t.drift.sec||a.duration||6));},{once:true});}
   if(t.highpass){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=t.highpass;f.connect(head);head=f;}
   if(t.lowpass){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=t.lowpass;f.connect(out);head=f;}
   const into=c.createGain();into.connect(head);src.connect(into);
   if(t.reverb){const cv=c.createConvolver(),w=c.createGain();cv.buffer=roomIR(c,t.room??3);w.gain.value=t.reverb;into.connect(cv);cv.connect(w);w.connect(head);}
   if(t.echo){const d=c.createDelay(3),fb=c.createGain(),w=c.createGain();d.delayTime.value=t.echo.time??.35;fb.gain.value=t.echo.feedback??.3;w.gain.value=t.echo.wet??.3;into.connect(d);d.connect(fb);fb.connect(d);d.connect(w);w.connect(head);}
   // fadeTo (21 Nov): the line fades as it plays, from its gain down to gain × fadeTo by its end (a memory slipping away)
   if(t.fadeTo!=null)a.addEventListener('play',()=>{const n=c.currentTime,g=t.gain??1,len=Math.max(.3,((a.duration||3)-a.currentTime)/(t.rate||1));out.gain.cancelScheduledValues(n);out.gain.setValueAtTime(g,n);out.gain.linearRampToValueAtTime(g*t.fadeTo,n+len);},{once:true});
   if(t.rate){a.preservesPitch=false;a.playbackRate=t.rate;a.defaultPlaybackRate=t.rate;}
   // (18 Nov) once the line has stopped and its room and echo have rung out, the chain is taken off the sound card, so a story of many lines
   // does not keep every one's reverb and echo working; it goes back on if the line plays again
   const tail=((t.reverb?t.room??3:0)+(t.echo?(t.echo.time??.35)*10:0)+.5)*1000;let off=0,on=true;
   const rest=()=>{clearTimeout(off);off=setTimeout(()=>{if(a.paused||a.ended){try{out.disconnect();}catch{}on=false;}},tail);};
   a.addEventListener('pause',rest);a.addEventListener('ended',rest);a.addEventListener('play',()=>{clearTimeout(off);if(!on){out.connect(c.destination);on=true;}});}catch(e){console.warn('voice tone',e);}}
  // warm(url): a line's player made ahead (loading), so it starts at once when its stop comes (one() takes it)
  const warmPlayers=new Map();function warm(url){if(warmPlayers.has(url)||warmPlayers.size>40)return;const a=new Audio(url);a.preload='auto';a.load();warmPlayers.set(url,a);}
  function one(p){const pre=warmPlayers.get(root+p.audio);warmPlayers.delete(root+p.audio);audio=pre||new Audio(root+p.audio);audio.preload='auto';from=p.from||0;to=p.to??null;skip=p.skip||[];if(from)audio.currentTime=from;
   if(p.fx)withFx(audio,p);if(p.tone)withTone(audio,p.tone);
   if(p.lines)lines=p.lines.map(l=>({...l,echo:l.echo??!!p.echo,part:true}));   // a part's subtitles in short phrases, each shown with her words
   else if(p.text)lines=[{t:0,end:1e9,text:p.text,echo:!!p.echo,part:true}];   // a part's own subtitle, shown while it plays
   const a=audio;a.addEventListener('ended',()=>{if(a!==audio)return;if(p.text||p.lines){show(-1);lines=[];}if(queue.length)next();else{ends.push(performance.now());show(-1);onEnd?.();}});}   // (one still fading out under the next stop's voice moves nothing on)
  function next(){ends.push(performance.now());const p=queue.shift();clearTimeout(gapT);gapT=setTimeout(()=>{gapT=0;one(p);audio.play().catch(()=>{});},(p.gap||0)*1000);}
  function load(voice,base=''){if(!classic&&dying&&dying===audio){fading=0;audio=null;}stop();root=base;ends=[];   // ERA: classic (earlier): stop() cuts the one still fading
   const parts=voice?.parts||(voice?.audio?[voice]:null);if(!parts?.length)return null;queue=parts.slice(1);lines=voice.lines||[];one(parts[0]);wait=parts===voice.parts?parts[0].gap||0:0;
   fadeIn=voice.fadeIn||0;soft=voice.fadeOut||0;return audio;}
  function play(w){if(!audio)return Promise.resolve(false);if(!audio.paused)return Promise.resolve(true);if(w!=null)wait=w;   // already playing (or starting): a second call (the first click after a reload) must not restart her fade-in   // w: seconds before the first part, instead of its own gap (a scene sound it is locked to has just started)
  cancelAnimationFrame(raf);tick();
   if(fadeIn){const a=audio,t0=performance.now()+wait*1000;a.volume=0;clearInterval(fading);fading=setInterval(()=>{const k=Math.max(0,Math.min(1,(performance.now()-t0)/fadeIn));a.volume=k;if(k>=1){clearInterval(fading);fading=0;}},16);}
   if(wait){const a=audio;clearTimeout(gapT);return new Promise(r=>{gapT=setTimeout(()=>{gapT=0;if(a===audio)a.play().then(()=>r(true)).catch(()=>r(false));else r(false);},wait*1000);});}
   return audio.play().then(()=>true).catch(()=>false);}
  function stop(){queue=[];clearTimeout(gapT);gapT=0;if(fading){clearInterval(fading);fading=0;}if(audio){audio.pause();audio.currentTime=0;}cancelAnimationFrame(raf);show(-1);}
  // FLOW: fade out over ms and stop (the caption goes with it); the next load or play starts clean
  let fading=0;function fade(ms=450){queue=[];clearTimeout(gapT);gapT=0;if(!audio||audio.paused){show(-1);return;}const a=audio,v0=a.volume,t0=performance.now(),s=soft,end=to;el.classList.remove('on');clearInterval(fading);dying=a;
   const id=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);a.volume=v0*(s?Math.cos(k*Math.PI/2)**2:(1-k)*(1-k));
    if(k>=1||end!=null&&a.currentTime>=end){clearInterval(id);a.pause();if(dying===a)dying=null;if(a===audio){fading=0;a.volume=v0;cancelAnimationFrame(raf);shown=-1;}}},16);fading=id;}
  // a line with no audio (a stop's words): shown for a few seconds
  let sayT=0;function say(text,ms=4200,echo=false){if(!text)return;clearTimeout(sayT);line.textContent=text;el.classList.toggle('echo',!!echo);el.classList.remove('on');void el.offsetWidth;el.classList.add('on');shown=-3;sayT=setTimeout(()=>{if(shown===-3)show(-1);},ms);}
  return {load,play,stop,say,fade,warm,get audio(){return audio;},get ends(){return ends;},get left(){return queue.length+(gapT?1:0);},set lines(v){lines=v;shown=-2;},get lines(){return lines;},set onEnd(f){onEnd=f;},set classic(v){classic=!!v;},get classic(){return classic;},playing:()=>!!audio&&!audio.paused};
 }
 window.SITTVoice={create};
})();

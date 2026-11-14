/* SITT memory world · the sound bed.
 * Plays a sound under a memory for as long as the visitor stays, without a gap or a bump:
 * each repeat starts before the last one ends and the two fade across each other.
 * Later, moving to another memory fades this bed out and that memory's bed in.
 *
 *   const bed = SITTSound.bed('assets/Audio/loop.mp3', {volume:1, fadeIn:2, overlap:2.5})
 *   bed.start()        bed.fadeOut(3)        SITTSound.fadeTo(bed, nextUrl, opts)
 *   SITTSound.play(url, {offset, gain, fadeIn, rate, lowpass, highpass, reverb, double})   a cue, once
 */
(() => {
 'use strict';
 let ctx=null;
 const audio=()=>ctx||(ctx=new (window.AudioContext||window.webkitAudioContext)());
 const cache=new Map();
 function decode(url){if(!cache.has(url))cache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error(url+' '+r.status);return r.arrayBuffer();}).then(b=>audio().decodeAudioData(b)));return cache.get(url);}
 // find where the sound really starts and ends (MP3 files carry a little silence at each end)
 function edges(buf){const d=buf.getChannelData(0),sr=buf.sampleRate;let a=0,b=d.length-1;
  while(a<d.length&&Math.abs(d[a])<1e-4)a++;while(b>a&&Math.abs(d[b])<1e-4)b--;return [a/sr,(b+1)/sr];}
 function bed(url,{volume=1,fadeIn=2,overlap=2.5}={}){
  const c=audio(),out=c.createGain();out.gain.value=volume;out.connect(c.destination);
  let buf=null,on=false,timer=0,next=0,first=true;const live=new Set();
  function cycle(at){
   const [a,b]=edges(buf),len=b-a,ov=Math.min(overlap,len/3);
   const src=c.createBufferSource(),g=c.createGain();src.buffer=buf;src.connect(g);g.connect(out);
   const fin=first?fadeIn:ov;first=false;
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(1,at+fin);
   g.gain.setValueAtTime(1,at+len-ov);g.gain.linearRampToValueAtTime(0,at+len);
   src.start(at,a,len);live.add(src);src.onended=()=>live.delete(src);
   next=at+len-ov;}
  function pump(){if(!on)return;while(next-c.currentTime<4)cycle(Math.max(next,c.currentTime+.02));timer=setTimeout(pump,1000);}
  return {
   async start(){if(on)return;on=true;if(c.state==='suspended')await c.resume();buf=buf||await decode(url);if(!on)return;next=c.currentTime+.05;pump();},
   fadeOut(sec=3){on=false;clearTimeout(timer);const t=c.currentTime;out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(out.gain.value,t);out.gain.linearRampToValueAtTime(0,t+sec);
    setTimeout(()=>{for(const s of live){try{s.stop();}catch{}}out.disconnect();},sec*1000+100);},
   get playing(){return on;},url};
 }
 // ---- one sound, once (a cue): from offset seconds into the file, with its own gain and fades, and optionally
 // coloured: rate (slower is lower), lowpass / highpass (Hz), reverb (0 to 1, a dark room), double (a second voice a
 // little lower and late, 0 to 1); loop (repeats offset to loopEnd until stopped). play(url, opts) returns {stop(fadeSec)}.
 const irs=new Map();let master=null;   // every cue goes through one gentle compressor, so stacked sounds never clip
 let ducker=null;   // under Ethel: while she speaks every cue dips (duck), so her voice is never drowned
 const bus=()=>{if(ducker)return ducker;const c=audio();master=c.createDynamicsCompressor();master.threshold.value=-14;master.knee.value=12;master.ratio.value=4;master.attack.value=.004;master.release.value=.25;master.connect(c.destination);ducker=c.createGain();ducker.connect(master);return ducker;};
 function duck(on,{depth=.35,attack=.25,release=1.2}={}){const g=bus().gain,t=audio().currentTime,v=on?depth:1;if(duck.v===v)return;duck.v=v;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(v,t+(on?attack:release));}
 function room(sec){const c=audio(),k=sec.toFixed(2);if(irs.has(k))return irs.get(k);const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);}irs.set(k,b);return b;}
 async function play(url,o={}){const c=audio();if(c.state!=='running'){try{await Promise.race([c.resume(),new Promise(r=>setTimeout(r,120))]);}catch{}}
  if(c.state!=='running')return {stop(){}};   // the browser has not allowed sound yet (no click or key on the page): this cue is skipped, never saved up
  const buf=await decode(url),t=c.currentTime+.01,out=c.createGain();out.connect(o.duck===false?(bus(),master):bus());   // duck: false keeps it out of the dip under her voice
  const g=o.gain??1,fi=o.fadeIn||0;out.gain.setValueAtTime(fi?0:g,t);if(fi)out.gain.linearRampToValueAtTime(g,t+fi);
  let chain=out;   // filters sit before the out gain
  if(o.lowpass){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lowpass;f.connect(chain);chain=f;}
  if(o.highpass){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=o.highpass;f.connect(chain);chain=f;}
  if(o.pan){const p=c.createStereoPanner();p.pan.value=o.pan;p.connect(chain);chain=p;}   // pan: -1 left … 1 right
  const into=c.createGain();into.connect(chain);
  // echo: {time, feedback, wet} the line repeats and dies away (a thought, or a voice that won't leave her head)
  if(o.echo){const d=c.createDelay(3),fb=c.createGain(),w=c.createGain();d.delayTime.value=o.echo.time??.32;fb.gain.value=o.echo.feedback??.35;w.gain.value=o.echo.wet??.45;
   into.connect(d);d.connect(fb);fb.connect(d);d.connect(w);w.connect(chain);}
  if(o.reverb){const cv=c.createConvolver();cv.buffer=room(o.roomSec??2.6);const w=c.createGain();w.gain.value=o.reverb;into.connect(cv);cv.connect(w);w.connect(chain);}
  const srcs=[];const src=(rate,detune,delay,gain)=>{const s=c.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.detune.value=detune;const sg=c.createGain();sg.gain.value=gain;s.connect(sg);sg.connect(into);if(o.loop){s.loop=true;s.loopStart=o.offset||0;s.loopEnd=o.loopEnd??buf.duration;}s.start(t+delay,o.offset||0);srcs.push(s);return s;};
  // loop with x (seconds): the stretch offset to loopEnd repeats as overlapping copies crossfaded over x, so a take that swells
  // and fades (a drive-by) can loop just its steady part without a seam
  if(o.loop&&o.x){const a=o.offset||0,b=o.loopEnd??buf.duration,len=b-a,x=Math.min(o.x,len/3);let next=t,alive=true;
   const one=at=>{const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.connect(g);g.connect(into);
    g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(1,at+x);g.gain.setValueAtTime(1,at+len-x);g.gain.linearRampToValueAtTime(0,at+len);
    s.start(at,a,len);srcs.push(s);s.onended=()=>{const i=srcs.indexOf(s);if(i>=0)srcs.splice(i,1);};next=at+len-x;};
   one(t);const pump=()=>{if(!alive)return;while(next-c.currentTime<3)one(Math.max(next,c.currentTime+.02));setTimeout(pump,1000);};pump();
   return {stop(sec=.3){alive=false;const n=c.currentTime;out.gain.cancelScheduledValues(n);out.gain.setValueAtTime(out.gain.value,n);out.gain.linearRampToValueAtTime(0,n+sec);for(const s of [...srcs]){try{s.stop(n+sec+.05);}catch{}}}};}
  const main=src(o.rate??1,0,0,1);if(o.double)src(o.rate??1,o.doubleDetune??-45,o.doubleDelay??.035,o.double);
  const tail=(o.reverb?o.roomSec??2.6:0)+(o.echo?(o.echo.time??.32)*10:0);   // the reverb and echo ring on after the clip itself ends
  let done=false;main.onended=()=>{done=true;setTimeout(()=>{try{out.disconnect();}catch{}},tail*1000);};
  if(o.fadeOut&&o.duration&&!o.loop){const e=t+o.duration;out.gain.setValueAtTime(g,e-o.fadeOut);out.gain.linearRampToValueAtTime(0,e);for(const s of srcs)s.stop(e+.05);}
  return {stop(sec=.3){if(done)return;const n=c.currentTime;out.gain.cancelScheduledValues(n);out.gain.setValueAtTime(out.gain.value,n);out.gain.linearRampToValueAtTime(0,n+sec);for(const s of srcs){try{s.stop(n+sec+.05);}catch{}}}};}
 // cross from one bed into another (for moving between memories)
 function fadeTo(from,url,opts={}){from?.fadeOut(opts.fadeOut??3);const b=bed(url,{fadeIn:opts.fadeIn??3,...opts});b.start();return b;}
 // ---- a song that follows the visitor: it plays from the top and, at each of its hold points, carries straight on if the
 // visitor has already reached that hold's shot ("go", the view's stop position), or holds there until they do:
 //   loop     [a,b] repeats a to b (x: crossfade seconds at the join; sink: {after, gain, lowpass, over} muffles it after so
 //            many repeats); it leaves at the end of a repeat, into b. auto: leaves by itself after that many repeats.
 //   silence  [a,b] stops at a, carries on from b.        stop     a: cuts dead at a, starts hard a frame later.
 //   restart  a: cuts at a, starts again at a with a very short fade in (fadeIn).
 // A visitor further ahead than the next hold: at that hold the song jumps to the part for the shot they are on (never mid-line).
 // It never plays backwards. The last fadeOut seconds of the file fade. song(url, plan) returns {tick(s), stop(sec)}.
 function song(url,{holds=[],gain=1,fadeOut=4,ahead=.25}={}){
  const c=audio(),out=c.createGain();out.gain.value=gain;out.connect(c.destination);
  const F=1/30,resume=H=>H.kind==='loop'||H.kind==='silence'?H.b:H.kind==='stop'?H.a+F:H.a,point=H=>H.kind==='loop'?H.b:H.a;
  let buf=null,cur=null,i=0,mode='wait',hold=null,dead=false;const all=new Set();
  decode(url).then(b=>{buf=b;}).catch(()=>{dead=true;});
  const voice=(off,at,fin,chain=out)=>{const n=c.createBufferSource(),g=c.createGain();n.buffer=buf;n.connect(g);g.connect(chain);
   if(fin>0){g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(1,at+fin);}n.start(at,off);all.add(n);n.onended=()=>all.delete(n);return {n,g,off,t0:at};};
  const cut=(v,at,x)=>{v.g.gain.setValueAtTime(1,at);v.g.gain.linearRampToValueAtTime(0,at+x);v.n.stop(at+x+.01);};
  function play(off,at,fin){cur=voice(off,at,fin);mode='play';i=holds.findIndex(H=>point(H)>off+.001);if(i<0)i=holds.length;}
  const reached=(s,k)=>{let j=-1;while(k<holds.length&&s>=holds[k].go){j=k;k++;}return j;};   // the furthest hold, from k on, the visitor has passed
  function tick(s){if(dead||!buf)return;const now=c.currentTime;
   if(mode==='wait')return play(0,now+.05,0);
   if(mode==='play'){const H=holds[i];
    if(!H){const end=cur.t0+(buf.duration-cur.off);cur.g.gain.setValueAtTime(1,Math.max(now,end-fadeOut));cur.g.gain.linearRampToValueAtTime(0,end);mode='done';return;}
    const Tp=cur.t0+(point(H)-cur.off);if(Tp-now>ahead)return;
    const j=reached(s,i);
    if(j===i){i++;return;}   // they are on (or past) its shot: straight on
    const x=H.kind==='loop'?(H.x??.008):.004;
    if(j>i){cut(cur,Tp,x);play(resume(holds[j]),Tp,x);return;}   // further ahead: jump at this hold to the part for their shot
    cut(cur,Tp,x);
    if(H.kind==='loop'){const ch=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000;ch.connect(lp);lp.connect(out);
     const L=H.b-H.a;hold={H,T0:Tp,L,k:0,ch,lp,inst:[]};
     if(H.sink){const t=Tp+H.sink.after*L,o=H.sink.over??2;ch.gain.setValueAtTime(1,t);ch.gain.linearRampToValueAtTime(H.sink.gain??.4,t+o);lp.frequency.setValueAtTime(20000,t);lp.frequency.exponentialRampToValueAtTime(H.sink.lowpass??800,t+o);}}
    else hold={H,T0:Tp};
    mode='hold';return;}
   if(mode==='hold'){const H=hold.H;
    if(H.kind==='loop'){const {L}=hold,x=H.x??.008;
     while(hold.T0+hold.k*L<now+1){const at=hold.T0+hold.k*L,v=voice(H.a,at,x,hold.ch);v.g.gain.setValueAtTime(1,at+L);v.g.gain.linearRampToValueAtTime(0,at+L+x);v.n.stop(at+L+x+.01);hold.inst.push({v,at});hold.k++;}
     let j=reached(s,i);if(j<0&&H.auto&&now>=hold.T0+H.auto*L-.3)j=i;
     if(j<0)return;
     const k=Math.ceil((now+.05-hold.T0)/L),Tr=hold.T0+k*L;   // leave at the end of the repeat now playing
     for(const q of hold.inst)if(q.at>=Tr-1e-6){q.v.g.disconnect();try{q.v.n.stop();}catch{}}
     hold=null;play(resume(holds[j]),Tr,x);i=Math.max(i,j+1);return;}
    const j=reached(s,i);if(j<0)return;
    hold=null;play(resume(holds[j]),now+.02,H.kind==='restart'?(H.fadeIn??.04):.004);i=Math.max(i,j+1);}}
  function stop(sec=1){dead=true;const n=c.currentTime;out.gain.cancelScheduledValues(n);out.gain.setValueAtTime(out.gain.value,n);out.gain.linearRampToValueAtTime(0,n+sec);
   setTimeout(()=>{for(const s of all){try{s.stop();}catch{}}out.disconnect();},sec*1000+100);}
  return {tick,stop,get pos(){return cur&&mode!=='hold'?cur.off+(c.currentTime-cur.t0):hold?'hold '+(hold.H.kind)+' at '+point(hold.H):null;}};
 }
 // a click or key anywhere on the page lets sound play (browsers need one; scrolling does not count)
 ['pointerdown','keydown'].forEach(e=>addEventListener(e,()=>{if(ctx&&ctx.state!=='running')ctx.resume().catch(()=>{});else if(!ctx)audio();},{capture:true,passive:true}));
 window.SITTSound={bed,fadeTo,play,song,duck,preload:url=>decode(url).catch(()=>null),context:audio};
})();

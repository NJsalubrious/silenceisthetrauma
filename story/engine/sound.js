/* SITT memory world · the sound bed.
 * Plays a sound under a memory for as long as the visitor stays, without a gap or a bump:
 * each repeat starts before the last one ends and the two fade across each other.
 * Later, moving to another memory fades this bed out and that memory's bed in.
 *
 *   const bed = SITTSound.bed('assets/Audio/loop.mp3', {volume:1, fadeIn:2, overlap:2.5})
 *   bed.start()        bed.fadeOut(3)        SITTSound.fadeTo(bed, nextUrl, opts)
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
 // cross from one bed into another (for moving between memories)
 function fadeTo(from,url,opts={}){from?.fadeOut(opts.fadeOut??3);const b=bed(url,{fadeIn:opts.fadeIn??3,...opts});b.start();return b;}
 window.SITTSound={bed,fadeTo,preload:url=>decode(url).catch(()=>null),context:audio};
})();

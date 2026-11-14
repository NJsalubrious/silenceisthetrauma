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
   let i=-1;for(let k=0;k<lines.length;k++)if(t>=lines[k].t&&t<(lines[k].end??(lines[k+1]?.t??1e9)))i=k;show(i);}
  // from / to (seconds): play only that part of the file (one narration cut into a stop's worth); fadeIn (ms) eases it in; skip: [[from,to],…] stretches jumped over, so two parts play as one;
  // fadeOut (ms): it drifts off into the silence like a thought (a soft curve), and keeps fading under the next one instead of being cut
  // parts: [{audio, from, to, gap}, …] a stop's lines as separate clips, played in turn; gap (seconds) is the silence before each
  // (before the first, it holds her back while something else happens first)
  // ends[i]: when part i finished (performance.now), so sounds can answer a line once it is really over, however long the clips took to load
  let queue=[],gapT=0,root='',wait=0,ends=[];
  function one(p){audio=new Audio(root+p.audio);audio.preload='auto';from=p.from||0;to=p.to??null;skip=p.skip||[];if(from)audio.currentTime=from;
   const a=audio;a.addEventListener('ended',()=>{if(a!==audio)return;if(queue.length)next();else{ends.push(performance.now());show(-1);onEnd?.();}});}   // (one still fading out under the next stop's voice moves nothing on)
  function next(){ends.push(performance.now());const p=queue.shift();clearTimeout(gapT);gapT=setTimeout(()=>{gapT=0;one(p);audio.play().catch(()=>{});},(p.gap||0)*1000);}
  function load(voice,base=''){if(!classic&&dying&&dying===audio){fading=0;audio=null;}stop();root=base;ends=[];   // ERA: classic (earlier): stop() cuts the one still fading
   const parts=voice?.parts||(voice?.audio?[voice]:null);if(!parts?.length)return null;queue=parts.slice(1);one(parts[0]);wait=parts===voice.parts?parts[0].gap||0:0;lines=voice.lines||[];
   fadeIn=voice.fadeIn||0;soft=voice.fadeOut||0;return audio;}
  function play(){if(!audio)return Promise.resolve(false);cancelAnimationFrame(raf);tick();
   if(fadeIn){const a=audio,t0=performance.now()+wait*1000;a.volume=0;clearInterval(fading);fading=setInterval(()=>{const k=Math.max(0,Math.min(1,(performance.now()-t0)/fadeIn));a.volume=k;if(k>=1){clearInterval(fading);fading=0;}},16);}
   if(wait){const a=audio;return new Promise(r=>{gapT=setTimeout(()=>{gapT=0;if(a===audio)a.play().then(()=>r(true)).catch(()=>r(false));else r(false);},wait*1000);});}
   return audio.play().then(()=>true).catch(()=>false);}
  function stop(){queue=[];clearTimeout(gapT);gapT=0;if(fading){clearInterval(fading);fading=0;}if(audio){audio.pause();audio.currentTime=0;}cancelAnimationFrame(raf);show(-1);}
  // FLOW: fade out over ms and stop (the caption goes with it); the next load or play starts clean
  let fading=0;function fade(ms=450){queue=[];clearTimeout(gapT);gapT=0;if(!audio||audio.paused){show(-1);return;}const a=audio,v0=a.volume,t0=performance.now(),s=soft,end=to;el.classList.remove('on');clearInterval(fading);dying=a;
   const id=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);a.volume=v0*(s?Math.cos(k*Math.PI/2)**2:(1-k)*(1-k));
    if(k>=1||end!=null&&a.currentTime>=end){clearInterval(id);a.pause();if(dying===a)dying=null;if(a===audio){fading=0;a.volume=v0;cancelAnimationFrame(raf);shown=-1;}}},16);fading=id;}
  // a line with no audio (a stop's words): shown for a few seconds
  let sayT=0;function say(text,ms=4200){if(!text)return;clearTimeout(sayT);line.textContent=text;el.classList.remove('echo');el.classList.add('on');shown=-3;sayT=setTimeout(()=>{if(shown===-3)show(-1);},ms);}
  return {load,play,stop,say,fade,get audio(){return audio;},get ends(){return ends;},set lines(v){lines=v;shown=-2;},get lines(){return lines;},set onEnd(f){onEnd=f;},set classic(v){classic=!!v;},get classic(){return classic;},playing:()=>!!audio&&!audio.paused};
 }
 window.SITTVoice={create};
})();

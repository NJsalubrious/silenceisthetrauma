/* SITT memory world · Ethel's voice.
 * Plays a memory's audio and shows its lines as captions in time with it.
 * Line times live in the memory's memory.json ("voice.lines"); the studio can time them by ear.
 */
(() => {
 'use strict';
 function create(el){
  let audio=null,lines=[],raf=0,shown=-1,onEnd=null;
  const line=el.querySelector('p');
  function show(i){if(i===shown)return;shown=i;
   if(i<0){el.classList.remove('on');return;}
   line.textContent=lines[i].text;el.classList.toggle('echo',!!lines[i].echo);el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
  function tick(){raf=requestAnimationFrame(tick);if(!audio||shown===-3)return;const t=audio.currentTime;
   let i=-1;for(let k=0;k<lines.length;k++)if(t>=lines[k].t&&t<(lines[k].end??(lines[k+1]?.t??1e9)))i=k;show(i);}
  function load(voice,base=''){stop();if(!voice?.audio)return null;audio=new Audio(base+voice.audio);audio.preload='auto';lines=voice.lines||[];
   audio.addEventListener('ended',()=>{show(-1);onEnd?.();});return audio;}
  function play(){if(!audio)return Promise.resolve(false);cancelAnimationFrame(raf);tick();return audio.play().then(()=>true).catch(()=>false);}
  function stop(){if(audio){audio.pause();audio.currentTime=0;}cancelAnimationFrame(raf);show(-1);}
  // a line with no audio (a stop's words): shown for a few seconds
  let sayT=0;function say(text,ms=4200){if(!text)return;clearTimeout(sayT);line.textContent=text;el.classList.remove('echo');el.classList.add('on');shown=-3;sayT=setTimeout(()=>{if(shown===-3)show(-1);},ms);}
  return {load,play,stop,say,get audio(){return audio;},set lines(v){lines=v;shown=-2;},get lines(){return lines;},set onEnd(f){onEnd=f;},playing:()=>!!audio&&!audio.paused};
 }
 window.SITTVoice={create};
})();

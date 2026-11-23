/* SOUND DRIVES THE DEPTH (23 Nov 2026; from the drive test of 22 Nov, the author's settings). Only on the opening shot (the crash),
 * only while its own sound plays and the view rests on it: the author's two silent audio drivers (its main and loop without her voice,
 * 01_Crash_Opening_main_audioDriver.mp3 / _loop_audioDriver.mp3) play unheard in step with what is heard, and what rises above the level
 * moves ONE shared viewpoint, added to the visitor's own mouse or tilt (scene.settings.drive, used by scene.js before the depth is worked
 * out), so every layer moves together and the perspective never breaks. When the sound lets go the view is back where the visitor has it.
 * Costs nothing elsewhere: off the opening shot nothing is measured and drive is null (the picture is exactly as without it).
 * ?drive=0 turns it off (the way back if it is ever not wanted).
 * How it listens (the laptop test, 25 Oct 2026, "rupture"): sudden change in the high frequencies (glitches), not loudness. */
(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('drive') === '0') return;
  const D = { thr: .20, amount: .57, vert: .55, attack: 55, release: 190 };   // the author's settings (22 Nov 2026 drive test)
  const DIR = 'audio/Scenes/02_The_Crash_Sequence/01_Crash_Opening/', DRV = { main: DIR + '01_Crash_Opening_main_audioDriver.mp3', loop: DIR + '01_Crash_Opening_loop_audioDriver.mp3' };
  let an = null, actx = null, bufs = {}, mainSrc = null, mainAt = 0, mainOff = 0, loopSrc = null, openingEl = null;
  // the opening's main is her voice's own player (voice.js): known when it starts
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (/01_Crash_Opening_main\.mp3/.test(decodeURI(this.src || ''))) openingEl = this; return play.call(this); };
  function setup() {   // once the story's sound has its context (the drivers run on the same clock as what is heard)
    const SS = window.SITTSound; if (an || !SS?.context) return !!an;
    actx = SS.context(); an = actx.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0;
    const mute = actx.createGain(); mute.gain.value = 0; an.connect(mute); mute.connect(actx.destination);   // never heard
    for (const k of ['main', 'loop']) fetch(DRV[k]).then(r => r.arrayBuffer()).then(b => actx.decodeAudioData(b)).then(b => { bufs[k] = b; }).catch(e => console.warn('drive: no driver', k, e));
    const bed = SS.bed; SS.bed = function (url, o = {}) {   // the loop's driver begins on the loop's own first frame and repeats with it
      const h = bed.apply(this, arguments); if (!/01_Crash_Opening_loop\.mp3/.test(url)) return h;
      const st = h.start, fo = h.fadeOut;
      h.start = function (at) { const r = st.apply(this, arguments); const b = bufs.loop; if (b) { stopLoop(); const s = actx.createBufferSource(); s.buffer = b; s.loop = true;
        const a = o.from ?? 0, z = Math.min(o.to ?? b.duration, b.duration); s.loopStart = a; s.loopEnd = z; s.connect(an); s.start(Math.max(at ?? actx.currentTime + .05, actx.currentTime), a); loopSrc = s; } return r; };
      h.fadeOut = function () { stopLoop(); return fo.apply(this, arguments); };
      return h; };
    return true;
  }
  const stopLoop = () => { try { loopSrc?.stop(); } catch {} loopSrc = null; };
  const stopMain = () => { try { mainSrc?.stop(); } catch {} mainSrc = null; };
  function follow() {   // the main's driver kept on the main's player (restarted if they ever drift apart, or the player is moved)
    const el = openingEl, on = el && !el.paused && !el.ended && bufs.main;
    if (!on) { if (mainSrc) stopMain(); return; }
    const pos = mainSrc ? mainOff + (actx.currentTime - mainAt) : -1;
    if (!mainSrc || Math.abs(pos - el.currentTime) > .06) { stopMain(); const s = actx.createBufferSource(); s.buffer = bufs.main; s.connect(an); mainAt = actx.currentTime; mainOff = el.currentTime; s.start(mainAt, mainOff); mainSrc = s; }
  }
  // glitches: sudden change in the high bands; the way of each hit from the sound's brightness rising or falling
  const wave = new Float32Array(2048), spec = new Float32Array(1024), bands = new Float32Array(24), prev = new Float32Array(24);
  function measure() {
    an.getFloatTimeDomainData(wave); an.getFloatFrequencyData(spec);
    let s = 0; for (const v of wave) s += v * v; const rms = Math.sqrt(s / wave.length), sr = actx.sampleRate;
    bands.fill(0);
    for (let i = 1; i < spec.length; i++) { const hz = i * sr / 2048; if (hz < 50 || hz > 11000) continue; const p = Number.isFinite(spec[i]) ? Math.pow(10, spec[i] / 10) : 0; bands[Math.min(23, Math.floor(Math.log(hz / 50) / Math.log(220) * 24))] += p; }
    let ch = 0, tot = 0, tl = 0;
    for (let i = 0; i < 24; i++) { bands[i] = Math.log1p(40 * Math.sqrt(bands[i])); const d = bands[i] - prev[i]; if (i >= 12) { ch += Math.abs(d); tot += bands[i] + prev[i]; } tl += d * (i / 23 - .5); prev[i] = bands[i]; }
    return { glitch: rms > .004 ? Math.min(1, ch / Math.max(.3, tot) / .6) : 0, tilt: tl };
  }
  // is the opening's own sound playing, with the view resting on the opening shot?
  let s0 = null;
  function where() {
    const W = window.SITTWorldState, T = W?.track; if (!T) return '';
    const main = openingEl && !openingEl.paused && !openingEl.ended, loop = !!(W.bed?.playing && /01_Crash_Opening_loop/.test(W.bed.url || ''));
    if (main && s0 == null) s0 = Math.round(T.s);
    const rest = s0 != null && Math.round(T.s) === s0 && Math.abs(T.s - s0) < .02;
    return rest && main ? 'main' : rest && loop ? 'loop' : '';
  }
  // every picture: only what rises above the level counts, quick to strike, slower to let go
  let env = 0, dir = 1, last = 0, off = null;
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(100, now - (last || now)); last = now;
    if (setup()) follow();
    const w = an ? where() : '';
    let e = 0;
    if (w) { const a = measure(); e = a.glitch > D.thr ? (a.glitch - D.thr) / Math.max(.05, 1 - D.thr) : 0; if (e > 0 && env < .03) dir = a.tilt < 0 ? -1 : 1; }
    env += (e - env) * (1 - Math.exp(-dt / Math.max(1, e > env ? D.attack : D.release)));
    if (env < 1e-4) env = 0;
    const was = off; off = env ? [env * dir * D.amount, -env * dir * D.amount * D.vert] : null;
    const S = window.SITTWorldState?.scene; if (!S?.settings) return;
    if (S.settings.drive !== off) S.settings.drive = off;
    if (w && (off || was)) S.changed?.();   // the engine draws only when something moved: tell it (the camera is never touched). Only while resting on the opening
  }
  window.SITTDrive = { D, get off() { return off; }, get env() { return env; }, where: () => (an ? where() : '') };   // (for testing)
  requestAnimationFrame(tick);
})();

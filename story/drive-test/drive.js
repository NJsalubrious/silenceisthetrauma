/* DRIVE TEST (22 Nov 2026). A TEST ONLY, never part of the story: the opening shot's sound (its main, then its loop) moves the depth,
 * on top of the visitor's own mouse or tilt. Only drive-test.html loads this; the story (index.html) and the engine are untouched.
 *
 * How (after the laptop test, 25 Oct 2026, "Test crash audio perspective motion"): the author's audio drivers (the opening's main and loop
 * without her voice, rendered from After Effects as 01_Crash_Opening_main_audioDriver.mp3 and 01_Crash_Opening_loop_audioDriver.mp3) play silently in step with what is heard, and only they are listened to.
 * Below a level you set, the sound does nothing at all; only what rises above it moves the view, and the higher it rises the further.
 * The movement is ONE shared viewpoint added to the visitor's, before the depth is worked out, so every layer moves together
 * (never breaking the perspective), and when the sound lets go the view is back wherever the visitor has it.
 * Only on the opening shot, only while its own sound plays.
 */
(() => {
  'use strict';
  const LS = 'sittDriveTest1';
  const DEF = { on: true, measure: 'glitch', thr: .20, amount: .57, vert: .55, attack: 55, release: 190, open: true, hud: true };   // (22 Nov 2026) the author's settings
  const D = Object.assign({}, DEF, (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })());
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(D)); } catch {} };
  let off = [0, 0], cropX = 1, tilting = false;   // off: the sound's viewpoint, in the hand's units (1 = the hand's full reach)
  addEventListener('deviceorientation', e => { if (e.beta != null) tilting = true; });

  // 1. the depth viewpoint: the engine sets 'pointer' (the hand × strength × the strip's scale); the sound's offset is added in the same units
  for (const G of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!G) continue; const P = G.prototype;
    const gul = P.getUniformLocation; P.getUniformLocation = function (p, n) { const l = gul.call(this, p, n); if (l) l.__n = n; return l; };
    const u4 = P.uniform4f; P.uniform4f = function (l, a, b, c, d) { if (l && l.__n === 'crop') cropX = a; return u4.call(this, l, a, b, c, d); };
    const u2 = P.uniform2f; P.uniform2f = function (l, x, y) {
      if (l && l.__n === 'pointer' && (off[0] || off[1])) { const S = window.SITTWorldState?.scene?.settings || {}, k = (S.strength ?? 1) * (tilting ? (S.tiltGain || 1) : 1) * cropX;
        x += off[0] * k; y += off[1] * k * (S.vertical ?? 1); }
      return u2.call(this, l, x, y); };
  }

  // 2. listening: the author's two audio drivers (the main and the loop without her voice, same lengths), played SILENTLY in step with
  // what is heard: the main's driver follows the main's own player, the loop's driver starts with the loop and repeats with it
  const DIR = 'audio/Scenes/02_The_Crash_Sequence/01_Crash_Opening/', DRV = { main: DIR + '01_Crash_Opening_main_audioDriver.mp3', loop: DIR + '01_Crash_Opening_loop_audioDriver.mp3' };
  let an = null, actx = null, bufs = {}, mainSrc = null, mainAt = 0, mainOff = 0, loopSrc = null;
  let openingEl = null; const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (/01_Crash_Opening_main/.test(decodeURI(this.src || ''))) openingEl = this; return play.call(this); };
  function setup() {   // once the story's sound has its context (the drivers run on the same clock as what is heard)
    const SS = window.SITTSound; if (an || !SS?.context) return !!an;
    actx = SS.context(); an = actx.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0;
    const mute = actx.createGain(); mute.gain.value = 0; an.connect(mute); mute.connect(actx.destination);   // never heard
    for (const k of ['main', 'loop']) fetch(DRV[k]).then(r => r.arrayBuffer()).then(b => actx.decodeAudioData(b)).then(b => { bufs[k] = b; }).catch(e => console.warn('drive test: no driver', k, e));
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

  // 3. the two measures, per picture: loudness, and glitches (sudden change in the high frequencies, as the laptop test's "rupture")
  const wave = new Float32Array(2048), spec = new Float32Array(1024), bands = new Float32Array(24), prev = new Float32Array(24);
  function measure() {
    an.getFloatTimeDomainData(wave); an.getFloatFrequencyData(spec);
    let s = 0; for (const v of wave) s += v * v; const rms = Math.sqrt(s / wave.length), sr = actx.sampleRate;
    bands.fill(0);
    for (let i = 1; i < spec.length; i++) { const hz = i * sr / 2048; if (hz < 50 || hz > 11000) continue; const p = Number.isFinite(spec[i]) ? Math.pow(10, spec[i] / 10) : 0; bands[Math.min(23, Math.floor(Math.log(hz / 50) / Math.log(220) * 24))] += p; }
    let ch = 0, tot = 0, tl = 0;
    for (let i = 0; i < 24; i++) { bands[i] = Math.log1p(40 * Math.sqrt(bands[i])); const d = bands[i] - prev[i]; if (i >= 12) { ch += Math.abs(d); tot += bands[i] + prev[i]; } tl += d * (i / 23 - .5); prev[i] = bands[i]; }
    return { loud: rms > 1e-5 ? Math.max(0, Math.min(1, (20 * Math.log10(rms) + 60) / 60)) : 0, glitch: rms > .004 ? Math.min(1, ch / Math.max(.3, tot) / .6) : 0, tilt: tl };
  }

  // 4. is the opening's own sound playing, with the view resting on the opening shot?
  let s0 = null;
  function where() {
    const W = window.SITTWorldState, T = W?.track; if (!T) return '';
    const main = openingEl && !openingEl.paused && !openingEl.ended, loop = !!(W.bed?.playing && /01_Crash_Opening_loop/.test(W.bed.url || ''));
    if (main && s0 == null) s0 = Math.round(T.s);
    const rest = s0 != null && Math.round(T.s) === s0 && Math.abs(T.s - s0) < .02;
    return rest && main ? 'main' : rest && loop ? 'loop' : '';
  }

  // 5. every picture: measure, keep only what rises above the level, shape it (quick to strike, slower to let go), move the viewpoint
  let env = 0, dir = 1, last = 0; const hist = [];
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(100, now - (last || now)); last = now;
    if (setup()) follow();
    const w = an ? where() : '', a = an ? measure() : { loud: 0, glitch: 0, tilt: 0 };
    const m = D.measure === 'loud' ? a.loud : a.glitch, e = w && D.on && m > D.thr ? (m - D.thr) / Math.max(.05, 1 - D.thr) : 0;
    if (e > 0 && env < .03) dir = a.tilt < 0 ? -1 : 1;   // each hit takes its way from the sound (its brightness rising or falling)
    env += (e - env) * (1 - Math.exp(-dt / Math.max(1, e > env ? D.attack : D.release)));
    if (env < 1e-4) env = 0;
    const was = off[0] + off[1]; off = env ? [env * dir * D.amount, -env * dir * D.amount * D.vert] : [0, 0];
    if (w && off[0] + off[1] !== was) { const S = window.SITTWorldState?.scene; S?.changed?.(); }   // the engine draws only when something moved: tell it (its own signal; the camera is never touched). Only while resting on the opening
    hist.push([now, a.loud, a.glitch, env, w]); while (hist.length && now - hist[0][0] > 15000) hist.shift();
    draw(w);
  }

  // 6. the panel
  let cv, g, info;
  function draw(w) {
    if (!cv || !D.open) return;
    const W = cv.width, H = cv.height, now = hist.at(-1)?.[0] || 0, X = t => W - (now - t) / 15000 * W, Y = v => H - 4 - v * (H - 8);
    g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.moveTo(X(hist[0]?.[0] || now), H);   // the movement it gives (white)
    for (const h of hist) g.lineTo(X(h[0]), H - h[3] * (H - 8) * .5 - 0); g.lineTo(W, H); g.fill();
    const line = (k, col) => { g.strokeStyle = col; g.lineWidth = 1.5; g.beginPath(); hist.forEach((h, i) => i ? g.lineTo(X(h[0]), Y(h[k])) : g.moveTo(X(h[0]), Y(h[k]))); g.stroke(); };
    line(1, D.measure === 'loud' ? '#6cf' : 'rgba(102,204,255,.35)'); line(2, D.measure === 'glitch' ? '#f93' : 'rgba(255,153,51,.35)');
    g.setLineDash([5, 4]); g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(0, Y(D.thr)); g.lineTo(W, Y(D.thr)); g.stroke(); g.setLineDash([]);
    info.textContent = (w === 'main' ? 'listening: the opening, main' : w === 'loop' ? 'listening: the opening, loop' : 'not the opening shot (no movement)') + (D.on ? '' : ' | OFF');
  }
  function panel() {
    const css = document.createElement('style'); css.textContent = `
.dt{position:fixed;right:8px;top:44px;z-index:99999;width:min(92vw,360px);background:rgba(10,12,13,.82);color:#ddd;font:12px/1.35 system-ui,sans-serif;border-radius:8px;padding:8px 10px;box-sizing:border-box;touch-action:manipulation}
.dt b{color:#fff;font-weight:600}.dt .row{display:flex;align-items:center;gap:8px;margin:5px 0}.dt .row label{flex:0 0 74px;color:#aaa}
.dt input[type=range]{flex:1;min-width:0;height:26px}.dt output{flex:0 0 44px;text-align:right;font-variant-numeric:tabular-nums}
.dt canvas{width:100%;height:96px;display:block;border-radius:4px;margin:6px 0;cursor:ns-resize;touch-action:none}
.dt .key{color:#999;font-size:11px}.dt .key i{font-style:normal}.dt button,.dt select{font:inherit;background:#222;color:#ddd;border:1px solid #444;border-radius:4px;padding:3px 8px}
.dt.shut{width:34px;height:34px;padding:0;border-radius:50%;background:rgba(10,12,13,.45);overflow:hidden}.dt.shut>*{display:none}.dt.shut::after{content:"◐";display:block;text-align:center;line-height:34px;font-size:16px;color:#ccc;cursor:pointer}
.dt-nohud [style*="monospace"][style*="pointer-events: none"],.dt-nohud .test-bar,.dt-nohud .xbar{display:none!important}`;
    document.head.appendChild(css);
    const el = document.createElement('div'); el.className = 'dt' + (D.open ? '' : ' shut');
    el.innerHTML = `<div class="row" style="margin:0"><b>Sound drives the depth (test)</b><span style="flex:1"></span><button data-k="hud">readout: ${D.hud ? 'on' : 'off'}</button><button data-k="open">hide</button></div>
<div class="body"><div class="row"><label><input type="checkbox" data-k="on" ${D.on ? 'checked' : ''}> on</label>
<select data-k="measure"><option value="glitch">glitches (high sounds)</option><option value="loud">loudness</option></select></div>
<canvas width="680" height="192"></canvas>
<div class="key"><i style="color:#f93">orange</i> glitches · <i style="color:#6cf">blue</i> loudness · dashed: the level (drag it) · white: the movement it gives</div>
<div class="row"><label>level</label><input type="range" data-k="thr" min="0" max="1" step=".01"><output></output></div>
<div class="row"><label>amount</label><input type="range" data-k="amount" min="0" max="1" step=".01"><output></output></div>
<div class="row"><label>up / down</label><input type="range" data-k="vert" min="0" max="1" step=".01"><output></output></div>
<div class="row"><label>strike ms</label><input type="range" data-k="attack" min="1" max="300" step="1"><output></output></div>
<div class="row"><label>let go ms</label><input type="range" data-k="release" min="20" max="2000" step="10"><output></output></div>
<div class="row"><span class="info"></span><span style="flex:1"></span><button data-k="reset">reset</button></div></div>`;
    document.body.appendChild(el); document.documentElement.classList.toggle('dt-nohud', !D.hud);
    for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'keydown', 'touchstart', 'touchmove', 'click']) el.addEventListener(ev, e => e.stopPropagation());   // the panel never swipes the story
    cv = el.querySelector('canvas'); g = cv.getContext('2d'); info = el.querySelector('.info');
    const sync = () => { el.querySelectorAll('input[type=range]').forEach(r => { r.value = D[r.dataset.k]; r.nextElementSibling.value = (+D[r.dataset.k]).toFixed(r.step < 1 ? 2 : 0); }); el.querySelector('select').value = D.measure; el.querySelector('[data-k=on]').checked = D.on; };
    sync();
    el.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; D[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.tagName === 'SELECT' ? e.target.value : +e.target.value; sync(); save(); });
    el.addEventListener('click', e => { const k = e.target.dataset?.k;
      if (k === 'open' || (!D.open && e.target === el)) { D.open = !D.open; el.classList.toggle('shut', !D.open); save(); }   // hide: only a small round button is left (tap it to bring the panel back)
      if (k === 'hud') { D.hud = !D.hud; document.documentElement.classList.toggle('dt-nohud', !D.hud); e.target.textContent = 'readout: ' + (D.hud ? 'on' : 'off'); save(); }   // the speed readout and the test bar, off for a clear picture
      if (k === 'reset') { Object.assign(D, DEF); sync(); save(); } });
    const setThr = e => { const r = cv.getBoundingClientRect(); D.thr = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)); sync(); save(); };
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); setThr(e); }); cv.addEventListener('pointermove', e => { if (e.buttons) setThr(e); });
    requestAnimationFrame(tick);
  }
  window.SITTDriveTest = { D, get off() { return off; }, get env() { return env; }, get listening() { return !!an; }, where: () => (an ? where() : '') };   // (for testing)
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', panel); else panel();
})();

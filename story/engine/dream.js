/* SITT STORYTELLING TEST · the pool sequence as a shocking dream. Only runs when the address has &seq=dream.
 * Nothing else changes (the sledgehammer version, &seq=1, is untouched).
 *
 * The swipe on from 013 drops the visitor into what the mother is going through (story/sequence-dream.json):
 *  - the world loses its footing: the window rolls very slowly and the depth leans by itself, against the visitor's
 *    hand, like the floor tipping;
 *  - 014, the realisation: she stays the same size while the world behind her is pulled away (the depth's version
 *    of a dolly zoom: the camera moves in while the view widens);
 *  - 014b: tunnel vision. Only the mother and the boy stay sharp; everything behind them blurs and goes dark;
 *  - the pictures do not cut, they slide into each other through the dream crossings, each one wrong in its own way,
 *    and once in the middle the boy comes back unbidden, then is gone;
 *  - the sound: a low, sour drone that beats against itself, muffled, with a thin ringing over 014b;
 *  - 016: the drone stops dead. Silence. The world settles back and the picture is the visitor's again.
 * All the rooms are loaded onto the graphics card while the visitor is at 013, so nothing waits.
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.get('seq') !== 'dream') return;
  let cfg = null, last = null, running = false, mouse = [0, 0];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const W = () => window.SITTWorldState;
  const ease = e => e * e * (3 - 2 * e);

  // each room of the sequence arrives through its own dream crossing (set here, while this test runs; the files are untouched)
  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, o) => {
    const r = await realFetch(url, o), u = String(url?.url || url);
    if (!cfg || !/memory\.json/.test(u)) return r;
    const shot = cfg.shots.find(s => new RegExp('/' + s.room + '/memory\\.json').test(u)), from = new RegExp('/' + cfg.from + '/memory\\.json').test(u);
    if (!shot?.cut && !from) return r;
    try {
      const m = await r.clone().json();
      if (shot?.cut) m.cut = { ...(m.cut || {}), style: shot.cut, duration: shot.cutMs };
      if (from) m.cut = { ...(m.cut || {}), push: cfg.firstPush ?? 1.15 };
      return new Response(JSON.stringify(m), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch { return r; }
  };

  // ---- the sound: a sour drone that beats against itself, muffled; a thin ringing; then nothing ----
  let ctx = null, drone = null;
  const audio = () => ctx || (ctx = (window.SITTSound?.context?.() || new AudioContext()));
  function startDrone() {
    const D = cfg.drone || {}; if (D.on === false) return;
    const c = audio(); try { c.resume(); } catch {}
    const t = c.currentTime, out = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = D.muffle ?? 520; out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(D.volume ?? .5, t + (D.rise ?? 1.6));
    lp.connect(out); out.connect(c.destination);
    const parts = [];
    for (const [f, g] of D.tones || [[55, .5], [58.2, .42], [77.8, .22], [110.6, .12]]) {   // close tones that beat, and one that does not belong
      const o = c.createOscillator(), og = c.createGain(), wob = c.createOscillator(), wg = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = f; og.gain.value = g;
      wob.frequency.value = .07 + Math.random() * .09; wg.gain.value = f * .012; wob.connect(wg); wg.connect(o.frequency);   // the pitch never quite holds still
      o.connect(og); og.connect(lp); o.start(t); wob.start(t); parts.push(o, wob);
    }
    // a breath of air under it
    const n = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain(); ns.buffer = n; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 300; nf.Q.value = .7; ng.gain.value = .25;
    ns.connect(nf); nf.connect(ng); ng.connect(lp); ns.start(t); parts.push(ns);
    drone = { c, out, parts, ring: null };
  }
  function ring(on) {
    if (!drone || cfg.drone?.ring === false) return;
    const c = drone.c, t = c.currentTime;
    if (on && !drone.ring) { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = cfg.drone?.ringHz ?? 3150; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(cfg.drone?.ringVolume ?? .025, t + 1.2); o.connect(g); g.connect(c.destination); o.start(t); drone.ring = { o, g }; }
    if (!on && drone.ring) { const { o, g } = drone.ring; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 1.5); o.stop(t + 1.6); drone.ring = null; }
  }
  function stopDrone() {   // dead: no fade
    if (!drone) return; const t = drone.c.currentTime;
    drone.out.gain.cancelScheduledValues(t); drone.out.gain.setValueAtTime(0, t); for (const p of drone.parts) { try { p.stop(t + .02); } catch {} }
    if (drone.ring) { drone.ring.g.gain.setValueAtTime(0, t); try { drone.ring.o.stop(t + .02); } catch {} }
    drone = null;
  }

  // ---- the floor tipping: the window rolls slowly, the depth leans by itself ----
  let sway = null;
  function startSway() {
    const win = document.querySelector('.xwin'), t0 = performance.now(), SW = cfg.sway || {};
    let amt = 0, goal = 1;
    sway = { stop: () => { goal = 0; } };
    (function tick(now) {
      if (!sway) return;
      const t = (now - t0) / 1000; amt += (goal - amt) * .02;
      if (win) win.style.rotate = ((SW.roll ?? .7) * amt * Math.sin(t * .55) * Math.sin(t * .23 + 1)).toFixed(3) + 'deg';
      const lx = (SW.lean ?? .55) * amt * Math.sin(t * .41) * Math.cos(t * .17), ly = (SW.lean ?? .55) * .6 * amt * Math.sin(t * .29 + 2);
      W().scene.point(mouse[0] * (1 - amt * .85) + lx, mouse[1] * (1 - amt * .85) + ly); W().scene.changed();
      if (goal === 0 && amt < .01) { if (win) win.style.rotate = ''; W().scene.point(mouse[0], mouse[1]); sway = null; return; }
      requestAnimationFrame(tick);
    })(t0);
  }

  // ---- 014: the world pulled away behind her ----
  function vertigo(ms, k) {   // starts close in; the view widens while the camera drives in, so the near stays, the far recedes
    return new Promise(r => {
      const S = W().scene.settings, c0 = JSON.parse(JSON.stringify(S.cam || {})), here = W().folder, t0 = performance.now(), near = .88;
      const D = (1 - 1 / k) / near;   // the drive that grows the near plane by k
      (function tick(now) {
        if (W().folder !== here) return r();
        const e = ease(Math.min(1, (now - t0) / ms)), z = 1 / (k + (1 - k) * e);   // frame from 1/k of the view to all of it
        if (c0.frame) { const f = c0.frame; S.cam = { ...c0, frame: [f[0] + f[2] * (1 - z) / 2, f[1] + f[3] * (1 - z) / 2, f[2] * z, f[3] * z] }; }
        S.dolly = D * e; W().scene.changed();
        if (e < 1) requestAnimationFrame(tick); else r();
      })(t0);
    });
  }
  // ---- 014b: tunnel vision ----
  function tunnel(on, s) {
    const S = W().scene.settings;
    if (!on) { S.haze = null; S.focus = null; S.blur = null; W().scene.changed(); return; }
    S.focus = s.focus ?? .86; S.blur = s.blur ?? .007; S.haze = [0, 0, 0, s.dark ?? .55]; W().scene.changed();
  }

  const ready = new Map();
  function preload() {
    const w = W();
    for (const s of cfg.shots.slice(1)) {
      if (ready.has(s.room)) continue;
      ready.set(s.room, w.load(s.room).then(m => w.scene.preload(m, { folder: s.room, set: w.set, source: w.source })).catch(() => ready.delete(s.room)));
    }
  }

  async function play() {
    if (running) return; running = true;
    const w = W(), main = document.querySelector('.world'), S = w.scene.settings;
    w.lock = true; main?.classList.add('auto');
    startDrone(); startSway();
    try {
      const shots = cfg.shots;
      for (let i = 0; i < shots.length; i++) {
        const s = shots[i], end = i === shots.length - 1;
        if (i > 0) {
          if (end) { stopDrone(); ring(false); }   // silence, at the instant 016 begins to come
          await w.go(s.room, { side: 'right' });   // through its dream crossing
          S.dolly = 0; w.scene.changed();   // the pull of 014 lets go only once the next picture is there
        }
        tunnel(!!s.tunnel, s); ring(!!s.ring);
        if (end) { sway?.stop(); await wait(s.hold ?? 2500); break; }
        if (s.intrude) w.load(s.intrude.room).then(m => w.scene.preload(m, { folder: s.intrude.room, set: w.set, source: w.source })).catch(() => {});   // ready for its flash back
        if (s.vertigo) await vertigo(s.hold, s.vertigo); else await wait(s.hold);
        if (s.intrude) {   // the boy comes back, unbidden, for a moment
          await w.go(s.intrude.room, { sharp: true }); tunnel(true, s.intrude); await wait(s.intrude.ms ?? 280); tunnel(false);
        }
      }
    } finally {
      stopDrone(); ring(false); tunnel(false); sway?.stop(); S.dolly = 0; w.scene.changed?.();
      w.lock = false; main?.classList.remove('auto'); running = false;
      w.scene.dropPreloaded?.(); ready.clear();
    }
  }

  async function boot() {
    cfg = await (await realFetch('sequence-dream.json', { cache: 'no-store' })).json();
    while (!W()?.memory) await new Promise(r => setTimeout(r, 50));
    const stage = document.getElementById('stage');
    addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); mouse = [Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), Math.max(-1, Math.min(1, 1 - (e.clientY - r.top) / r.height * 2))]; }, { passive: true });
    last = W().folder; if (last === cfg.from) preload();
    addEventListener('sitt:memory', e => {
      const now = e.detail?.folder, before = last; last = now;
      if (now === cfg.from) preload();
      if (!running && before === cfg.from && now === cfg.shots[0].room) setTimeout(play, 0);   // the swipe on from 013
    });
  }
  boot().catch(e => console.error('dream', e));
})();

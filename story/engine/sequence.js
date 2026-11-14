/* SITT STORYTELLING TEST · the pool sequence. Only runs when the address has &seq=1. Nothing else changes.
 *
 * The swipe on from 013 is the first blow. From there the pictures come down one on top of the other by themselves
 * (story/sequence.json): 014 → 014b → 015 → 015b → 015c → 016. There are no transitions and no gaps: each picture is
 * simply there, and it lands with weight, through the depth.
 *  - A blow is a sledgehammer: the window is struck off its place and twisted and shudders back; the near things are
 *    punched at the viewer through the depth and snap back; the picture blows out for an instant; a deep dull impact.
 *    All of it inside about a quarter of a second, then nothing moves.
 *  - The next blow lands before the last has finished settling, so it never stops and starts.
 *  - 014b is held a fraction longer than is bearable before the next blow takes it away.
 *  - 016 is the last blow, and then stillness. The picture is the visitor's again.
 * All six rooms are loaded onto the graphics card before the first blow, so nothing waits.
 * The visitor cannot move on or back while it plays (moving the mouse still leans the depth).
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (!Q.has('seq') || Q.get('seq') === 'dream') return;   // &seq=dream is the dream version (dream.js)
  let cfg = null, last = null, running = false;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const W = () => window.SITTWorldState;

  // the swipe from 013 into 014 must be a blow, not one of the dream crossings: while this test runs, 014 arrives
  // through a cut so short it reads as a hard cut, and 013 pushes only a little way in as it goes
  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, o) => {
    const r = await realFetch(url, o), u = String(url?.url || url);
    if (!cfg || !/memory\.json/.test(u)) return r;
    const into = cfg.shots[0].room, from = cfg.from;
    const which = new RegExp('/' + into + '/memory\\.json').test(u) ? 'into' : new RegExp('/' + from + '/memory\\.json').test(u) ? 'from' : null;
    if (!which) return r;
    try {
      const m = await r.clone().json();
      if (which === 'into') m.cut = { ...(m.cut || {}), style: 'depth', duration: cfg.firstCut ?? 110 };
      else m.cut = { ...(m.cut || {}), push: cfg.firstPush ?? 1.2 };
      return new Response(JSON.stringify(m), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch { return r; }
  };

  // ---- one blow: a sledgehammer. Everything takes it at once, for a fraction of a second, then it is still ----
  //  - the window itself is struck: knocked off its place and twisted, shuddering back in about a quarter second
  //  - the depth is smashed: the near things punched at the viewer and snapped back, jarring sideways
  //  - the picture blows out: contrast and light spike and fall away
  //  - the sound: a deep, dull impact you feel more than hear (made here, or a file named in sequence.json)
  let ctx = null, thudBuf = null;
  const audio = () => ctx || (ctx = (window.SITTSound?.context?.() || new AudioContext()));
  async function loadThud() { if (!cfg.thudFile) return; try { thudBuf = await audio().decodeAudioData(await (await realFetch('soundscape/' + encodeURIComponent(cfg.thudFile))).arrayBuffer()); } catch (e) { console.error('sequence thud', e); } }
  function thud(weight) {
    if (cfg.thud === false) return;
    const c = audio(); try { c.resume(); } catch {}
    const t = c.currentTime + .005, out = c.createGain(); out.gain.value = Math.min(1, (cfg.thudVolume ?? .8) * weight); out.connect(c.destination);
    if (thudBuf) { const s = c.createBufferSource(); s.buffer = thudBuf; s.connect(out); s.start(t); return; }
    // the body of the blow: a low pitch that drops and dies
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(28, t + .32);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .004); g.gain.exponentialRampToValueAtTime(.001, t + .55); o.connect(g); g.connect(out); o.start(t); o.stop(t + .6);
    // the hit itself: a short dull crack, filtered dark
    const n = c.createBuffer(1, Math.round(c.sampleRate * .09), c.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const ns = c.createBufferSource(), f = c.createBiquadFilter(), ng = c.createGain(); ns.buffer = n; f.type = 'lowpass'; f.frequency.value = 700; ng.gain.value = .9;
    ns.connect(f); f.connect(ng); ng.connect(out); ns.start(t);
  }
  let run = 0;
  function blow(s) {
    const id = ++run, S = W().scene.settings, w = s.weight ?? 1, win = document.querySelector('.xwin'), stage = document.getElementById('stage');
    const A = (cfg.strike ?? 26) * w, R = (cfg.twist ?? 1.1) * w * (s.side ?? 1), D = (cfg.drive ?? .45) * w, T = (cfg.shudder ?? .08) * w * (s.side ?? 1), X = cfg.blowout ?? .7;
    const dir = s.dir || [(s.side ?? 1) * .55, 1];   // which way the window is knocked (x, y), y down
    const len = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / len, dy = dir[1] / len, t0 = performance.now();
    thud(w);
    return new Promise(r => {
      (function tick(now) {
        if (id !== run) return r();   // the next blow has already landed
        const t = Math.max(0, now - t0);
        const shake = Math.exp(-t / 75) * Math.cos(t / 95 * Math.PI * 2);           // struck, then a hard damped shudder
        const punch = t < 90 ? Math.pow(1 - t / 90, 2) : 0;                          // the depth smashed in and snapped back
        const flash = Math.exp(-t / 55);                                              // the picture blows out and falls away
        if (win) { win.style.translate = `${(dx * A * shake).toFixed(2)}px ${(dy * A * shake).toFixed(2)}px`; win.style.rotate = `${(R * shake).toFixed(3)}deg`; win.style.scale = (1 + .025 * w * punch).toFixed(4); }
        if (stage && X > 0) stage.style.filter = flash > .02 ? `contrast(${(1 + X * flash).toFixed(3)}) brightness(${(1 + X * .35 * flash).toFixed(3)})` : '';
        S.dolly = D * punch; S.truck = T * Math.exp(-t / 90) * Math.sin(t / 70 * Math.PI * 2);
        W().scene.changed();
        if (t < 420) requestAnimationFrame(tick);
        else { settle(); r(); }
      })(t0);
    });
  }
  function settle() {
    const S = W().scene.settings, win = document.querySelector('.xwin'), stage = document.getElementById('stage');
    S.dolly = 0; S.truck = 0; if (win) { win.style.translate = ''; win.style.rotate = ''; win.style.scale = ''; } if (stage) stage.style.filter = ''; W().scene.changed?.();
  }

  // all the rooms of the sequence onto the graphics card, before the first blow can land
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
    const w = W(), main = document.querySelector('.world');
    w.lock = true; main?.classList.add('auto');
    try {
      await Promise.all([...ready.values()]);   // normally done long before: they load while the visitor is at 013
      const shots = cfg.shots;
      for (let i = 0; i < shots.length; i++) {
        const s = shots[i];
        if (i > 0) await w.go(s.room, { sharp: true });   // simply there
        const b = blow(s);
        if (i === shots.length - 1) { await b; break; }   // the last blow, then stillness
        await wait(s.hold);   // the next blow comes when this one's time is up, whether or not the last has settled
      }
    } finally {
      run++; settle();
      w.lock = false; main?.classList.remove('auto'); running = false;
      w.scene.dropPreloaded?.(); ready.clear();
    }
  }

  async function boot() {
    cfg = await (await realFetch('sequence.json', { cache: 'no-store' })).json();
    while (!W()?.memory) await new Promise(r => setTimeout(r, 50));
    last = W().folder; if (last === cfg.from) preload(); loadThud();
    addEventListener('sitt:memory', e => {
      const now = e.detail?.folder, before = last; last = now;
      if (now === cfg.from) preload();
      if (!running && before === cfg.from && now === cfg.shots[0].room) setTimeout(play, 0);   // the swipe on from 013
    });
  }
  boot().catch(e => console.error('sequence', e));
})();

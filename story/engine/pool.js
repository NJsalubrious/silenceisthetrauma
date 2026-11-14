/* SITT STORYTELLING TEST · the pool, four ways. Only runs when the address has &seq=pool&opt=A|B|C|D. Nothing else changes.
 *
 * Built from the research ("Withhold the body, subtract the sound"):
 *  - the swipe on from 013 is the visitor's last act; from there it plays by itself and control comes back at 016;
 *  - nothing is added to the pictures: no shake, no effects, no score, no ringing;
 *  - the depth is the instrument, used by taking it away: at the worst moments the picture stops answering the
 *    hand (frozen, no parallax), and the one real movement is saved for the aftermath (016), small and slow;
 *  - the death is never on screen; black is where the unseen happens;
 *  - the crisis runs too fast; the slowness belongs to afterwards.
 * Each option (story/pool.json) is a list of steps: how the picture arrives (cut, dissolve or out of black), how long
 * it holds, how much depth it keeps, whether the background falls soft, how dark it is, and whether it breathes.
 * Every room is loaded onto the graphics card ahead, so a cut never waits.
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (['off', 'dream', 'quiet', 'sequence'].includes(Q.get('seq')) || Q.get('pool') === 'off') return;   // MASTER: on by default, as the earlier story plays it (E: Carried through); ?opt=A..I picks another, ?pool=off none
  const OPT = (Q.get('opt') || 'E').toUpperCase();
  let cfg = null, plan = null, last = null, running = false, shade = null, mouse = [0, 0];
  const pending = new Map();   // room -> how it must arrive (its crossing and its depth), applied as its memory.json is read
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const W = () => window.SITTWorldState;
  const ease = e => e * e * (3 - 2 * e);

  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, o) => {
    const r = await realFetch(url, o), u = String(url?.url || url);
    if (!plan || !/memory\.json/.test(u)) return r;
    if ((plan.drift || plan.noLunge) && new RegExp('/' + cfg.from + '/memory\\.json').test(u)) {   // leaving 013 must not lunge into it: no zoom on that swipe
      try { const m = await r.clone().json(); m.cut = { ...(m.cut || {}), push: 1 }; return new Response(JSON.stringify(m), { status: 200, headers: { 'Content-Type': 'application/json' } }); } catch { return r; }
    }
    const room = [...pending.keys()].find(k => new RegExp('/' + k + '/memory\\.json').test(u));
    if (!room) return r;
    try {
      const m = await r.clone().json(), p = pending.get(room);
      m.cut = { ...(m.cut || {}), style: plan.flash ? 'blend' : 'depth', duration: p.ms, ...(plan.flash ? { settle: 0 } : {}) };
      m.depth = { ...(m.depth || {}), strength: (m.depth?.strength ?? 1.5) * p.depth };
      return new Response(JSON.stringify(m), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch { return r; }
  };
  const base = () => 1.5;
  function arriveAs(s) { pending.set(s.room, { ms: s.in === 'dissolve' ? (s.ms ?? 1500) : 40, depth: s.ease ? 1 : (s.depth ?? 1) }); }

  function dim(v, ms) {
    if (!shade) { shade = document.createElement('div'); shade.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none'; document.getElementById('stage').after(shade); }
    shade.style.transition = ms ? `opacity ${ms}ms ease-in-out` : 'none'; shade.style.opacity = v;
  }
  function depthTo(v, ms) {   // how much the picture answers the hand, eased
    const S = W().scene.settings, a = S.strength ?? base(), b = base() * v, t0 = performance.now();
    return new Promise(r => { (function tick(now) { const e = ms ? Math.min(1, (now - t0) / ms) : 1; S.strength = a + (b - a) * ease(e); W().scene.changed(); if (e < 1) requestAnimationFrame(tick); else r(); })(t0); });
  }
  function soft(on) { const S = W().scene.settings; if (on) { S.focus = .86; S.blur = cfg.softBlur ?? .0045; } else { S.focus = null; S.blur = null; } W().scene.changed(); }
  // the one movement: the depth comes slowly back and the view drifts once, like a breath, then rests
  function breath(ms) {
    const S = W().scene.settings, t0 = performance.now(), B = cfg.breath || {}, to = B.depth ?? .7, a = S.strength ?? 0, dx = B.x ?? .22, dy = B.y ?? .06;
    return new Promise(r => { (function tick(now) {
      const e = Math.min(1, (now - t0) / ms), k = Math.sin(Math.PI * Math.min(1, e * 1.15));
      S.strength = a + (base() * to - a) * ease(e); W().scene.point(mouse[0] * e + dx * k, mouse[1] * e + dy * k); W().scene.changed();
      if (e < 1) requestAnimationFrame(tick); else r(); })(t0); });
  }
  // carried: the view pushes forward through the depth for the whole of a picture's time, faster and faster ('push': [from, to])
  function push(a, b, ms) {
    const S = W().scene.settings, t0 = performance.now(), here = W().folder; a = Math.max(a, S.dolly || 0);   // carried on from where the last picture left off: never a step back
    (function tick(now) { if (W().folder !== here) return; const e = Math.min(1, (now - t0) / ms); S.dolly = a + (b - a) * e * e; W().scene.changed(); if (e < 1) requestAnimationFrame(tick); })(t0);
  }
  // coming to rest: the push runs out, slowly and heavily ('land': ms)
  function land(ms) {
    const S = W().scene.settings, a = S.dolly || 0, t0 = performance.now();
    return new Promise(r => { (function tick(now) { const e = Math.min(1, (now - t0) / ms); S.dolly = a * Math.pow(1 - e, 3); W().scene.changed(); if (e < 1) requestAnimationFrame(tick); else r(); })(t0); });
  }
  // ---- dissociated: the viewpoint moves on its own, on one unbroken path through every picture; the depth maps do the rest ----
  // u runs 0 to 1 with no stops in the middle (it eases only at its very start and end), so the cuts never interrupt the motion
  const along = t => t - Math.sin(2 * Math.PI * t) / (2 * Math.PI);
  const pathAt = (D, u) => { const a = D.from, b = D.to, w = D.sway ?? 0; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + w * Math.sin(Math.PI * u)]; };
  window.SITTPoolPath = { along, pathAt };   // for the frame-by-frame preview
  let drifting = false;
  function drift(D, ms) {
    drifting = true; const t0 = performance.now();
    return new Promise(r => { (function tick(now) {
      if (!drifting) return r();
      const t = Math.min(1, (now - t0) / ms), [x, y] = pathAt(D, along(t));
      W().scene.point(x, y); W().scene.changed();
      if (t < 1) requestAnimationFrame(tick); else { drifting = false; r(); }
    })(t0); });
  }
  function handBack(D, ms) {   // from the end of the path back to wherever the visitor's hand is, slowly
    const t0 = performance.now(), [x0, y0] = pathAt(D, 1);
    return new Promise(r => { (function tick(now) { const e = ease(Math.min(1, (now - t0) / ms)); W().scene.point(x0 + (mouse[0] - x0) * e, y0 + (mouse[1] - y0) * e); W().scene.changed(); if (e < 1) requestAnimationFrame(tick); else r(); })(t0); });
  }
  // a zoom inside a picture: the view closes in on (or opens out from) a point, [from, to] in how many times closer
  function zoom(z, ms, at, out) {
    const sc = W().scene, c0 = sc.getCam(), t0 = performance.now(), here = W().folder, [fx, fy] = at || [.5, .5];
    if (!c0.frame) return Promise.resolve();
    return new Promise(r => { (function tick(now) {
      if (W().folder !== here) return r();
      const e = Math.min(1, (now - t0) / ms), k = out ? 1 - Math.pow(1 - e, 3) : e * e, m = z[0] + (z[1] - z[0]) * k, f = c0.frame, w = f[2] / m, h = f[3] / m;
      sc.setCam({ ...c0, frame: [f[0] + (f[2] - w) * fx, f[1] + (f[3] - h) * fy, w, h] }); sc.changed();
      if (e < 1) requestAnimationFrame(tick); else r();
    })(t0); });
  }
  const warmed = new Map();
  function retreat([a, b], ms) {
    const w = W(), here = w.folder, start = performance.now();
    (function tick(now) {
      if (!running || w.folder !== here) return;
      const t = Math.min(1, (now - start) / ms);
      w.scene.settings.dolly = a + (b - a) * ease(t); w.scene.changed();
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  function ready(room) {
    if (plan.restrained) {
      if (!warmed.has(room)) warmed.set(room, W().load(room).then(m => W().scene.preload(m, { folder: room, set: W().set, source: W().source })));
      return warmed.get(room);
    } const w = W(); return w.load(room).then(m => w.scene.preload(m, { folder: room, set: w.set, source: w.source })).catch(() => {}); }

  // I: one continuous depth drag shared by both images and their plain blend.
  async function playFlash() {
    if (running) return;
    running = true;
    const w = W(), S = w.scene.settings, main = document.querySelector('.world'), f = plan.flash;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saved = { response: S.response, truck: S.truck, edgeBlur: S.edgeBlur, radialBlur: S.radialBlur, dragFocus: S.dragFocus, dragVelocity: S.dragVelocity, filmPan: S.filmPan, filmZoom: S.filmZoom, filmAnchor: S.filmAnchor, poolDrag: S.poolDrag };
    let moving = false, raf = 0;
    // The image and its exposure trail share the same camera trajectory.
    // Zero velocity means zero trail; no independently animated blur envelope.
    let motionStart = 0, motionDuration = 1, motionTruck = 0, motionDolly = 0, pairMotion = false;
    function moveCamera(now) {
      const t = Math.max(0, Math.min(1, (now - motionStart) / motionDuration));
      const u = pairMotion ? .35 * t + .65 * (t - Math.sin(2 * Math.PI * t) / (2 * Math.PI)) : t - Math.sin(2 * Math.PI * t) / (2 * Math.PI);
      const velocity = t >= 1 ? 0 : (pairMotion ? .35 + .65 * (1 - Math.cos(2 * Math.PI * t)) : 1 - Math.cos(2 * Math.PI * t)) / (motionDuration / 1000);
      const dolly = reduced ? 0 : motionDolly * u;
      S.poolDrag = true; S.response = 0; S.strength = 0;
      // One optical camera over the composed scene: no relative layer translation.
      S.dolly = 0; S.truck = 0;
      S.filmAnchor = [.5, .68];
      S.filmZoom = reduced ? 0 : .18 + motionDolly * u;
      S.filmPan = reduced ? 0 : motionTruck * (1 - 2 * u);
      if (pairMotion) {
        const b = ease(Math.max(0, Math.min(1, ((now - motionStart) - f.hold) / f.blend)));
        S.dragFocus = f.focusFrom.map((v, i) => v + (f.focusTo[i] - v) * b);
      }

      // Positive screen-space x is the actual rightward travel of the near planes.
      S.dragVelocity = reduced ? [0, 0] : [2 * motionTruck * velocity * Math.exp(S.filmZoom), motionDolly * velocity];
      S.radialBlur = velocity > .001 && !reduced ? (f.shutter ?? .22) : 0;
      S.edgeBlur = 0;
      w.scene.point(0, 0); w.scene.changed();
    }
    function startMove(ms, truck, dolly) {
      motionStart = performance.now(); motionDuration = ms; motionTruck = truck; motionDolly = dolly;
      moving = true;
      const tick = now => { if (!moving) return; moveCamera(now); if (now - motionStart < ms) raf = requestAnimationFrame(tick); };
      tick(motionStart);
    }
    w.lock = true; w.poolDetached = true; main?.classList.add('auto');
    try {
      await Promise.all(plan.steps.slice(1).map(s => ready(s.room)));
      // Keep the discovery and call readable before the two brief nightmare fragments.
      const lead = plan.steps.slice(0, plan.steps.findIndex(s => s.room === 'x-014b'));
      S.edgeBlur = 0; S.radialBlur = 0; S.truck = 0; S.dolly = 0;
      for (let i = 0; i < lead.length; i++) {
        if (i > 0) await w.go(lead[i].room, { sharp: true });
        S.strength = 0; w.scene.point(0, 0);
        const nightmare = lead[i].room === 'x-015';
        S.dragFocus = f.phoneFocus || [.47, .65];
        if (nightmare) startMove(lead[i].hold, .035, .13);
        else { S.radialBlur = 0; S.edgeBlur = 0; w.scene.changed(); }
        await wait(lead[i].hold);
        moving = false; cancelAnimationFrame(raf);
      }
      const total = f.hold + f.blend + f.secondHold;
      S.dragFocus = f.focusFrom;
      pairMotion = true;
      startMove(total, f.truck, f.dolly ?? .18);
      await w.go('x-014b', { sharp: true });
      await wait(f.hold);
      // Keep the same camera trajectory across both sides of the blend.
      await w.go('x-015d', { side: 'right' });
      await wait(f.secondHold);
      moving = false; cancelAnimationFrame(raf);
      S.poolDrag = false; S.edgeBlur = 0; S.radialBlur = 0; S.dragVelocity = [0, 0]; S.filmPan = 0; S.filmZoom = 0; S.dolly = 0; S.truck = 0; S.strength = 0; w.scene.point(0, 0);
      await w.go('x-016', { sharp: true });
      S.strength = 0; w.scene.changed();
      await wait(f.aftermath);
    } finally {
      moving = false; cancelAnimationFrame(raf);
      Object.assign(S, saved); S.dolly = 0; soft(false);
      await depthTo(1, cfg.restoreMs ?? 2500); w.scene.point(mouse[0], mouse[1]);
      w.lock = false; w.poolDetached = false; main?.classList.remove('auto');
      running = false; pending.clear(); warmed.clear(); w.scene.dropPreloaded?.();
    }
  }

  async function play() {
    if (plan.flash) return playFlash();
    if (running) return; running = true;
    const w = W(), main = document.querySelector('.world'), steps = plan.steps;
    w.lock = true; main?.classList.add('auto');
    w.poolDetached = !!plan.restrained;
    if (plan.restrained) { w.scene.settings.dolly = 0; w.scene.point(0, 0); }
    if (plan.look) window.SITTAge?.set(plan.look, plan.lookIn ?? 300);   // the whole passage as one old photo set
    let drove = null;
    const useDrift = plan.drift && !matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      if (plan.restrained) await Promise.all(steps.slice(1).map(s => ready(s.room)));
    if (useDrift) { const D = plan.drift, total = steps.slice(0, -1).reduce((a, s) => a + s.hold, 0) + (D.settle ?? 2500); drove = drift(D, total); }
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i], next = steps[i + 1];
        if (i > 0) {
          if (s.in === 'black') { dim(1, 90); await wait(s.ms ?? 1000); await w.go(s.room, { sharp: true }); dim(s.shade ?? 0, s.up ?? 0); }
          else if (s.in === 'dissolve') { dim(s.shade ?? 0, s.ms ?? 1500); await w.go(s.room, { side: 'right' }); }
          else { await w.go(s.room, { sharp: true }); dim(s.shade ?? 0, 0); }
        } else dim(s.shade ?? 0, 400);
        if (next) { arriveAs(next); ready(next.room); }
        if (plan.restrained) w.scene.settings.dolly = 0;
        soft(!!s.soft);
        if (s.depthMove && !matchMedia('(prefers-reduced-motion: reduce)').matches) retreat(s.depthMove, s.hold);
        const D = s.depth ?? 1;
        if (s.push) push(s.push[0], s.push[1], s.hold);
        if (s.zoom) zoom(s.zoom, s.zoomMs ?? s.land ?? s.hold, s.zoomAt, !!s.land);
        if (s.land) { const t = performance.now(); await land(s.land); await wait(Math.max(0, s.hold - (performance.now() - t))); }
        else if (s.breath) { W().scene.settings.strength = base() * D; await wait(s.still ?? 1500); await breath(s.hold - (s.still ?? 1500)); }
        else { if (s.ease) depthTo(D, s.ease); else { W().scene.settings.strength = base() * D; w.scene.changed(); } await wait(s.hold); }
      }
    if (drove) { await drove; await handBack(plan.drift, plan.drift.handBack ?? 2500); }
    } finally {
      drifting = false; soft(false); W().scene.settings.dolly = 0; await depthTo(1, cfg.restoreMs ?? 2500); W().scene.point(mouse[0], mouse[1]);
      dim(0, cfg.restoreMs ?? 2500);
      if (plan.look) window.SITTAge?.clear(plan.lookOut ?? 3000);
      w.lock = false; main?.classList.remove('auto'); running = false; pending.clear(); warmed.clear(); w.poolDetached = false; w.scene.dropPreloaded?.();
    }
  }

  async function boot() {
    cfg = await (await realFetch('pool.json', { cache: 'no-store' })).json(); plan = cfg.options[OPT === 'G-ORIGINAL' ? 'G-original' : OPT] || cfg.options.A;
    while (!W()?.memory) await new Promise(r => setTimeout(r, 50));
    const stage = document.getElementById('stage');
    addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); mouse = [Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), Math.max(-1, Math.min(1, 1 - (e.clientY - r.top) / r.height * 2))]; }, { passive: true });
    const armed = () => {
      if (plan.noLunge && W().folder === cfg.from) W().memory.cut = { ...W().memory.cut, push: 1 };
      if (plan.flash && W().folder === cfg.from) W().memory.exits.right = { ...W().memory.exits.right, to: plan.steps[0].room };
      plan.steps.forEach(arriveAs);
      const preload = plan.restrained ? plan.steps : plan.steps.slice(1, 2);
      preload.forEach(s => ready(s.room).catch(e => console.error('pool preload', e)));
    };   // at 013: the swipe will cut, and the next room is ready
    last = W().folder; if (last === cfg.from) armed();
    addEventListener('sitt:memory', e => {
      const now = e.detail?.folder, before = last; last = now;
      if (running) return;
      if (now === cfg.from) armed();
      if (before === cfg.from && now === plan.steps[0].room) setTimeout(() => play().catch(e => console.error('pool playback', e)), 0);   // the swipe on from 013
    });
  }
  boot().catch(e => console.error('pool', e));
})();

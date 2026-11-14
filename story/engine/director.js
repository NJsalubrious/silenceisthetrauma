/* STORYTELLING TESTS · the director.
 * Plays one version of 001 to 006 by itself, on the story's own depth engine (each picture is its image and its
 * depth map). From versions.json it takes, for each picture: how it arrives (a dream cut, out of black, or
 * developing out of white), how long it holds (heavier pictures longer), where the camera goes while it holds
 * (between the memory's two stops, slowly), and how it leaves.
 * Nothing here changes the engine's rendering: it only drives the camera and the crossings the engine already has.
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  // PACE: every hold, fade and camera move is multiplied by this. 1 = the timings written in versions.json; ?pace=0.7 slower, ?pace=0.4 faster
  const PACE = window.SITT_PACE = Math.max(.1, +(Q.get('pace') || .35));   // snapshots: each picture is a moment, not a slide
  const wait = ms => new Promise(r => setTimeout(r, ms * PACE));
  const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  let V = null, W = null, run = 0;

  /* ---------- what sits over the picture: black or white, and the print developing ---------- */
  const css = document.createElement('style');
  css.textContent = `
   body.story .test-bar,body.story .timeline,body.story .note,body.story .skip,body.story .caption{display:none!important}
   body.story main.world{cursor:none}
   .fx{position:fixed;inset:0;z-index:40;pointer-events:none;opacity:0;background:#000}
   .menu{position:fixed;inset:0;z-index:2147483000;background:#000;color:#b9b3a7;display:flex;align-items:safe center;justify-content:center;overflow:auto;padding:28px 0;font:14px/1.5 ui-sans-serif,system-ui,"Segoe UI",sans-serif}
   .menu .in{width:min(760px,calc(100vw - 32px))}
   .menu h1{font-weight:400;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#6b655b;margin:0 0 22px}
   .menu a{display:block;text-decoration:none;color:inherit;border-top:1px solid #1e1c19;padding:11px 0}
   .menu a:last-of-type{border-bottom:1px solid #1e1c19}
   .menu b{display:block;font-weight:400;font-size:19px;color:#ebe5d9;margin-bottom:3px}
   .menu span{color:#827c71;font-size:13.5px}.menu a:hover b{color:#fff}
   .menu i{float:right;font-style:normal;color:#5b564d;font-size:12px;margin-top:6px}
   .menu p{color:#59544b;font-size:12px;margin-top:18px}
   .end{position:fixed;inset:0;z-index:55;display:flex;align-items:center;justify-content:center;gap:28px;opacity:0;transition:opacity 1.6s;pointer-events:none;font:13px ui-sans-serif,system-ui,sans-serif;letter-spacing:.12em}
   .end.on{opacity:1;pointer-events:auto}.end a{color:#7d776c;text-decoration:none;text-transform:uppercase}.end a:hover{color:#e8e1d3}`;
  document.head.appendChild(css);
  const fx = document.createElement('div'); fx.className = 'fx'; document.body.appendChild(fx);
  const stage = () => document.getElementById('stage');
  function cover(color, to, ms, curve) {
    fx.style.background = color; fx.style.transition = ms ? `opacity ${ms * PACE}ms ${curve || 'ease-in-out'}` : 'none';
    fx.offsetWidth; fx.style.opacity = to; return wait(ms || 0);
  }
  /* a print developing: out of white, flat and pale, the tones come up and the contrast with them */
  function develop(ms) {
    const c = stage(); const t0 = performance.now();
    fx.style.background = '#f3f0ea'; fx.style.transition = 'none'; fx.style.opacity = 1;
    return new Promise(r => { (function tick(now) {
      const t = Math.min(1, (now - t0) / (ms * PACE)), e = ease(t);
      fx.style.opacity = String(Math.pow(1 - e, 1.6));
      c.style.filter = `contrast(${(.35 + .65 * e).toFixed(3)}) brightness(${(1 + .9 * (1 - e)).toFixed(3)})`;
      if (t < 1) requestAnimationFrame(tick); else { c.style.filter = ''; r(); }
    })(t0); });
  }

  /* ---------- s7 to s12: a value moving over time, the print in the dark room, the light over the depth ---------- */
  const scn = () => W.scene.settings;
  function tween(ms, step, curve) {
    const t0 = performance.now(), f = curves[curve] || ease;
    return new Promise(r => { (function tick(now) { const t = Math.min(1, (now - t0) / (ms * PACE)); step(f(t)); W.scene.changed?.(); if (t < 1) requestAnimationFrame(tick); else r(); })(t0); });
  }
  const lerp = (a, b, e) => a + (b - a) * e;
  /* the photograph: a small print lying in the dark, flat; as it comes close it fills the frame and its depth opens */
  function printAt(e, pr) {   // e = 0: the print, 1: the scene itself
    const c = stage(); const sc = lerp(pr.scale || .6, 1, e), b = lerp(pr.border || 16, 0, e);
    c.style.transform = `scale(${sc.toFixed(4)}) rotate(${lerp(pr.tilt || 0, 0, e).toFixed(3)}deg)`;
    c.style.boxShadow = b > .2 ? `0 0 0 ${b.toFixed(1)}px #e8e2d6, 0 ${(30 * (1 - e)).toFixed(1)}px ${(70 * (1 - e)).toFixed(1)}px rgba(0,0,0,${(.8 * (1 - e)).toFixed(2)})` : 'none';
    c.style.filter = e < 1 ? `brightness(${lerp(pr.dim || .78, 1, e).toFixed(3)})` : '';
    scn().opening = lerp(0, 1, e);
  }
  /* the lens: focus moves through the picture's own depth (keys: [time 0-1, 'far' | 'subject' | 'near' | a depth value]) */
  function lensAt(t, L, P) {
    const val = k => typeof k === 'number' ? k : k === 'far' ? (P.far ?? .1) : k === 'near' ? 1 : (P.subject ?? .6);
    const K = L.keys || [[0, 'far'], [1, 'subject']]; let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
    const [a, b] = [K[i], K[i + 1] || K[i]], u = b[0] > a[0] ? ease(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])))) : 1;
    return { focus: lerp(val(a[1]), val(b[1]), u), blur: L.blur ?? .007, haze: L.haze || null };
  }
  function lightAt(t, L) {
    const a = L.from || [.15, .4], b = L.to || [.85, .4];
    scn().relight = { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), k: L.k ?? .9, soft: L.soft ?? .42 };
  }

  /* ---------- the camera: from the first stop to the second, slowly, while the picture holds ---------- */
  const curves = { linear: t => t, ease, in: t => t * t * t, out: t => 1 - Math.pow(1 - t, 3) };
  function glide(ms, linear, token, each) {
    const T = W.track, t0 = performance.now(), f = curves[linear === true ? 'linear' : linear] || ease;
    return new Promise(r => { (function tick(now) {
      if (token !== run) return r();
      const t = Math.min(1, (now - t0) / (ms * PACE)), e = f(t);
      if (each) each(t);
      T.goal = e; T.landing = null; T.lastIn = now; W.nextAuto = true;   // the director holds the view; the engine's own glide follows it
      if (t < 1) requestAnimationFrame(tick); else r();
    })(t0); });
  }

  /* ---------- one picture ---------- */
  async function play(m, token) {
    const S = m.storytelling, P = V.pictures[S.picture] || {}; let v = V.versions[S.version];
    if (v.relight && P.light) v = { ...v, relight: { ...v.relight, ...P.light } };   // each picture's light crosses its own subject
    const say = (...a) => { if (Q.has('log')) console.log('[director]', (performance.now() / 1000).toFixed(1), S.picture, ...a); };
    say('arrived', 'token', token);
    W.nextAuto = true;   // no glimpse of the next memory, no arrows: it plays by itself
    const weight = P.weight || 1, hold = (v.hold || 6500) * weight, cam = v.camera || {};
    // how it arrives (the dream cut has already played, if this version uses one)
    const c = stage();
    c.style.filter = v.filter || ''; if (v.print) { document.querySelector('main.world')?.style.setProperty('background', '#050505'); printAt(0, v.print); }
    if (v.relight) lightAt(0, v.relight); else scn().relight = null;
    scn().enter = null; if (v.lens) Object.assign(scn(), lensAt(0, v.lens, P)); else Object.assign(scn(), { focus: null, haze: null });
    if (v.relight && S.index > 0 && v.exit === 'light') { await tween((v.relight.rise) || 1800, e => { scn().relight.k = (v.relight.k ?? .9) * e; fx.style.opacity = String(.94 * (1 - e)); }, 'out'); }
    else if (S.index === 0 || v.enter) {
      if (v.enter === 'white' || (S.index === 0 && v.exit === 'white')) await develop((v.develop?.rise) || 3600);
      else await cover('#000', 0, (v.dark?.rise) || (S.index === 0 ? 2200 : 0), 'ease-out');
    }
    if (token !== run) return;
    if (v.print) { await wait(v.print.lie || 1400); if (token !== run) return; await tween(v.print.open || 2800, e => printAt(e, v.print)); c.style.filter = v.filter || ''; }
    if (cam.start) await wait(cam.start);
    say('glide', Math.round(hold)); await glide(Math.max(1200, hold - (cam.start || 0)), cam.curve || cam.linear, token, v.relight ? t => lightAt(t, v.relight) : v.lens ? t => { Object.assign(scn(), lensAt(t, v.lens, P)); W.scene.changed?.(); } : null); say('glide done', token === run);
    if (token !== run) return;
    const next = m.exits?.right?.to;
    const nextPic = next ? next.split('-')[1] : null;
    const black = (v.blackBefore || []).includes(nextPic);
    if (v.print) {   // it goes back to being a photograph, and is put down in the dark
      await tween(v.print.close || 2200, e => printAt(1 - e, v.print)); await wait(600);
      await cover('#000', 1, next ? 1400 : 2600, 'ease-in');
      if (!next) { end(S.version); return; }
      W.lock = false; await W.go(next, { side: 'right', sharp: true }); W.lock = true; printAt(0, v.print); await cover('#000', 0, 1600, 'ease-out'); return;
    }
    if (v.exit === 'light' && v.relight) {   // the light goes; in the dark the room changes; the light comes back on the next one
      await tween((v.relight.sink) || 2000, e => { scn().relight.k = (v.relight.k ?? .9) * (1 - e); fx.style.background = '#000'; fx.style.transition = 'none'; fx.style.opacity = String(.94 * e); }, 'in');
      if (!next) { await cover('#000', 1, 1200); end(S.version); return; }
      await wait(v.relight.between || 500);
      W.lock = false; await W.go(next, { side: 'right', sharp: true }); W.lock = true; return;
    }
    if (!next) { await cover('#000', 1, 3200, 'cubic-bezier(.5,0,.9,.6)'); end(S.version); return; }
    if (v.exit === 'black' || black) {
      await cover('#000', 1, (v.dark?.sink) || 2200, 'cubic-bezier(.5,0,.9,.6)');
      await wait((v.dark?.between) || 900);
      W.lock = false; await W.go(next, { side: 'right', sharp: true }); W.lock = true;
      if (black && v.exit !== 'black') await cover('#000', 0, 2000, 'ease-out');
      return;
    }
    if (v.exit === 'white') {
      await cover('#f3f0ea', 1, (v.develop?.sink) || 2000, 'cubic-bezier(.6,0,.9,.5)');
      await wait((v.develop?.between) || 300);
      W.lock = false; await W.go(next, { side: 'right', sharp: true }); W.lock = true;
      return;
    }
    // through the engine's own crossing, with this version's dream cut (the memory names it)
    if (v.lens && nextPic) scn().enter = lensAt(0, v.lens, V.pictures[nextPic] || {});   // the next picture comes in with its own focus
    say('leaving by the cut'); W.lock = false; W.travel('right'); W.lock = true;
  }

  /* ---------- the end, and the start screen ---------- */
  const endEl = document.createElement('div'); endEl.className = 'end'; document.body.appendChild(endEl);
  function end(vid) {
    const keys = Object.keys(V.versions), i = keys.indexOf(vid), nx = keys[(i + 1) % keys.length];
    endEl.innerHTML = `<a href="?v=${vid}&tune=0">again</a><a href="?v=${nx}&tune=0">next: ${V.versions[nx].name}</a><a href="?tune=0">all of them</a>`;
    endEl.classList.add('on'); document.body.style.cursor = 'default';
  }
  function menu() {
    const el = document.createElement('div'); el.className = 'menu';
    el.innerHTML = `<div class="in"><h1>Elizabeth &middot; 001 to 006 &middot; twelve ways of telling it</h1>${
      Object.entries(V.versions).map(([k, v], i) => `<a href="?v=${k}&tune=0"><i>${i + 1}</i><b>${v.name}</b><span>${v.about}</span></a>`).join('')}
      <a href="?explore=1&tune=0"><i>&#9679;</i><b>Explore: you move through it</b><span>Every picture, 001 to 062, in layers (background, top, over) the way your story works: the viewer moves, and each room answers differently. The weight of the hand, how much depth opens, the light the viewer carries, focus where they look, the air.</span></a>
      <a href="?explore=plain&tune=0"><i>&#9679;</i><b>Story: just the pictures</b><span>The same rooms, 001 to 062, in the same layers and depth, moving with the viewer. No light, no focus effect, no particles. Only the pictures.</span></a>
      <a href="?explore=frame&tune=0"><i>&#9679;</i><b>Story in a window (test)</b><span>The same pictures inside a quiet frame on a black page. The frame turns very slightly as the viewer moves, the way a real window does, and gives a little when dragged.</span></a>
      <a href="?explore=frame&sound=1&tune=0"><i>&#9679;</i><b>Story in a window, with soundscape (test)</b><span>The window test, with the soundscapes from the SoundScape folder. Rooms are grouped into passages; inside a passage the sound keeps running, and crossing into the next passage fades across. Click once to start the sound. M mutes.</span></a>
      <a href="?explore=frame&sound=1&age=1&tune=0"><i>&#9679;</i><b>Story in a window, aged (test)</b><span>The same window with the soundscape, and the pictures aged like old photographic prints: blacks faded a little towards brown, whites yellowed, a fine grain. The age eases off slowly as the story moves on. A turns it off and on.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=I&memory=x-013&tune=0"><i>I</i><b>The pool, I: Dragged fragments (new)</b><span>013 ? 014 ? 015 ? fleeting 014b ? blend into 015d ? 016. Discovery establishes what happened; the nightmare blur begins on the phone call. 014b holds for 0.9 seconds, blends over 0.22 seconds into 015d, which holds for 0.65 seconds. A continuous depth drag and shorter radial streaks carry the two images.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=F&memory=x-013&tune=0"><i>F</i><b>The pool, F: Missing time (new)</b><span>A clear look at the mother and child, then a missing interval. The call and responders pass in uneven fragments; 016 stays still. Start here.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=G&memory=x-013&tune=0"><i>G</i><b>The pool, G: Out of reach (new)</b><span>A slight sideways drift continues across the cuts, independent of your hand. The people remain readable while the viewpoint feels detached.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=H&memory=x-013&tune=0"><i>H</i><b>The pool, H: The moment stays (new)</b><span>Time catches on 014b for 3.2 seconds as the viewpoint subtly retreats through its depth. Everything after it rushes by, followed by a single gap and a long, motionless aftermath.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=G-original&tune=0"><i>&#9679;</i><b>The pool, G original: One photo set (test)</b><span>As E, carried through in hard cuts, but the whole passage aged to the full, as one old photo set. No zoom on the swipe out of 013. 015c closes in and cuts to 015d, the same scene closer; 016 lands opening out, the inverse, coming slowly to rest.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=E&tune=0"><i>&#9679;</i><b>The pool, E: Carried through (test)</b><span>From the swipe at 013 you are carried, and cannot stop: each picture pushing forward through its depth, cut away before it can finish, about four seconds from 014 to 016. In silence. At 016 the push runs out and comes to rest.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=A&tune=0"><i>&#9679;</i><b>The pool, A: Witness (test)</b><span>From the swipe at 013 it plays by itself. The picture stops answering your hand. 014b held, frozen. A short black, then the call, the responders, a long black, and 016, where the picture slowly breathes again.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=B&tune=0"><i>&#9679;</i><b>The pool, B: Too fast (test)</b><span>Hard cuts, every picture frozen, each gone before it can be taken in. 014b barely half a second. Then a long black, and the slowness only comes at 016.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=C&tune=0"><i>&#9679;</i><b>The pool, C: Withheld (test)</b><span>014b is there for a fifth of a second and gone into three seconds of black, where the unseen happens. Then the call, the responders, and 016.</span></a>
      <a href="?explore=frame&sound=1&age=1&seq=pool&opt=D&tune=0"><i>&#9679;</i><b>The pool, D: Remembered (test)</b><span>The whole of it as it is remembered: slow dissolves, frozen pictures darkening, 014b held longest, and 016 the one movement.</span></a><p>Each one plays by itself, on the story's own depth engine, with each picture's own depth map. About a minute each. Press Escape to come back here. Add &amp;tune=1 to the address to have the studio open while it plays.</p></div>`;
    document.body.appendChild(el);
  }



  /* ---------- STORY IN A WINDOW (test): the picture set in a quiet frame on a black page; the frame turns a little with the viewer, the way a real window does ----------
     Only the page around the picture changes. The depth engine, the layers and the depth maps are exactly as in the other versions.
     Address options for trying it: &tilt=3 (degrees at the edge of the screen, default 2.5), &give=14 (pixels the frame gives when dragged, default 12). */
  function windowFrame() {
    const world = document.querySelector('.world'), canvas = document.getElementById('stage');
    if (!world || !canvas) return;
    const TILT = Math.max(0, +(Q.get('tilt') ?? 2.5)), GIVE = Math.max(0, +(Q.get('give') ?? 12));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const css = document.createElement('style');
    css.textContent = `html.framed,html.framed body,html.framed .world{background:#000}
html.framed .world .poster{display:none}
.xwin{position:absolute;transform-origin:50% 50%;will-change:transform}
.xwin canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}
.xwin svg{position:absolute;left:-40px;top:-40px;overflow:visible;pointer-events:none}
.xticks{position:absolute;left:0;right:0;pointer-events:none;font:11px/1 'Courier Prime',ui-monospace,monospace;color:rgba(255,255,255,.34);letter-spacing:.06em}
.xticks .row{position:relative;height:14px}.xticks .row span{position:absolute;transform:translateX(-50%)}.xticks .row span.now{color:rgba(255,255,255,.7)}
.xticks .line{position:relative;height:1px;margin-top:8px;background:rgba(255,255,255,.14)}.xticks .line i{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.5)}
.xbrand{position:fixed;left:28px;top:20px;z-index:50;font:700 15px/1 'Space Grotesk',system-ui,sans-serif;letter-spacing:-.03em;color:rgba(255,255,255,.32);pointer-events:none}`;
    const fonts = document.createElement('link'); fonts.rel = 'stylesheet'; fonts.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime&family=Space+Grotesk:wght@700&display=swap'; document.head.appendChild(fonts);   // the website's two typefaces
    document.head.appendChild(css);
    document.documentElement.classList.add('framed');
    const win = document.createElement('div'); win.className = 'xwin';
    world.insertBefore(win, canvas); win.appendChild(canvas);
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); win.appendChild(svg);
    const ticks = document.createElement('div'); ticks.className = 'xticks'; ticks.innerHTML = '<div class="row"></div><div class="line"><i></i></div>'; win.appendChild(ticks);
    const brand = document.createElement('div'); brand.className = 'xbrand'; brand.textContent = 'PIXELSTORTION'; document.body.appendChild(brand);
    const rooms = (W.list?.memories || []).filter(e => /^x-/.test(e.folder)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(e => e.folder);
    let bw = 0, bh = 0;
    const layout = () => {
      const m = W.memory, pw = m?.sections?.[0]?.width || 2000, ph = m?.height || 1024, ar = pw / ph;
      const aw = innerWidth * .9, ah = innerHeight - 64 - 70;
      bw = Math.min(aw, ah * ar); bh = bw / ar;
      const left = (innerWidth - bw) / 2, top = 64 + (ah - bh) / 2;
      const was = win.style.transform; win.style.transform = 'none';   // measure flat, so the engine sizes itself to the real box
      Object.assign(win.style, { left: left + 'px', top: top + 'px', width: bw + 'px', height: bh + 'px' });
      requestAnimationFrame(() => { win.style.transform = was; });
      // a hairline rule just outside the picture, running a little past each corner like crop marks
      const g = 9, ext = 26, W2 = bw + 80, H2 = bh + 80, x0 = 40 - g, y0 = 40 - g, x1 = 40 + bw + g, y1 = 40 + bh + g;
      svg.setAttribute('width', W2); svg.setAttribute('height', H2);
      const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
      svg.innerHTML = `<g stroke="rgba(255,255,255,.16)" stroke-width="1" shape-rendering="crispEdges">${L(x0 - ext + g, y0, x1, y0)}${L(x0, y0 - ext + g, x0, y1)}${L(x0, y1, x1 + ext - g, y1)}${L(x1, y0, x1, y1 + ext - g)}</g>`;
      ticks.style.top = (bh + g + 14) + 'px';
      const i = Math.max(0, rooms.indexOf(W.folder)), n = Math.max(1, rooms.length - 1);
      const marks = 11, row = ticks.firstChild;
      row.innerHTML = Array.from({ length: marks }, (_, k) => { const r = Math.round(k * n / (marks - 1)); return `<span class="${r === i ? 'now' : ''}" style="left:${k / (marks - 1) * 100}%">${(rooms[r] || '').slice(2)}</span>`; }).join('');
      ticks.querySelector('.line i').style.width = (i / n * 100) + '%';
    };
    layout(); addEventListener('resize', layout); addEventListener('sitt:memory', () => setTimeout(layout, 0));
    // the turn: the viewer's position, eased; and the give when dragged
    let tx = 0, ty = 0, cx = 0, cy = 0, down = null, gx = 0, gy = 0, dx = 0, dy = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'touch') { tx = Math.max(-1, Math.min(1, e.clientX / innerWidth * 2 - 1)); ty = Math.max(-1, Math.min(1, 1 - e.clientY / innerHeight * 2)); }
      if (down) { const k = GIVE / 160; gx = Math.max(-GIVE, Math.min(GIVE, (e.clientX - down.x) * k)); gy = Math.max(-GIVE * .5, Math.min(GIVE * .5, (e.clientY - down.y) * k * .5)); }
    }, { passive: true });
    addEventListener('pointerdown', e => { if (!e.target.closest?.('.xbar')) down = { x: e.clientX, y: e.clientY }; }, { passive: true });
    const up = () => { down = null; gx = 0; gy = 0; };
    addEventListener('pointerup', up); addEventListener('pointercancel', up); document.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const tick = () => {
      const still = reduce.matches || !!W.poolDetached;
      cx += ((still ? 0 : tx) - cx) * .07; cy += ((still ? 0 : ty) - cy) * .07;
      dx += ((still ? 0 : gx) - dx) * .18; dy += ((still ? 0 : gy) - dy) * .18;
      // the viewer moving right sees the window's left edge fall away (and moving up, its bottom edge), as a real window does
      win.style.transform = `perspective(${Math.round(Math.max(bw, 600) * 1.6)}px) translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) rotateY(${(-cx * TILT).toFixed(3)}deg) rotateX(${(-cy * TILT * .5).toFixed(3)}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  /* ---------- EXPLORE TESTING: a small corner bar (room by number, reload this room's pictures) ---------- */
  function testBar(apply) {
    const css = document.createElement('style');
    css.textContent = `.xbar{position:fixed;left:8px;bottom:8px;z-index:99999;display:flex;gap:4px;align-items:center;opacity:.18;transition:opacity .2s;font:12px/1 system-ui,sans-serif}
.xbar:hover,.xbar:focus-within{opacity:.9}
.xbar select,.xbar button{background:rgba(0,0,0,.55);color:#eee;border:1px solid rgba(255,255,255,.25);border-radius:4px;padding:3px 5px;font:inherit;cursor:pointer}
.xbar button:disabled{opacity:.5;cursor:wait}
.xbar .ok{color:#cfc;min-width:1em}`;
    document.head.appendChild(css);
    const bar = document.createElement('div'); bar.className = 'xbar';
    const sel = document.createElement('select'); sel.title = 'Go to room';
    const btn = document.createElement('button'); btn.textContent = '↻'; btn.title = 'Reload this room’s pictures and depth maps (R)';
    const ok = document.createElement('span'); ok.className = 'ok';
    bar.append(sel, btn, ok); document.body.appendChild(bar);
    for (const ev of ['pointerdown', 'pointerup', 'click', 'wheel', 'touchstart', 'touchmove', 'keydown']) bar.addEventListener(ev, e => e.stopPropagation());
    const rooms = (W.list?.memories || []).filter(e => /^x-/.test(e.folder)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const e of rooms) { const o = document.createElement('option'); o.value = e.folder; o.textContent = e.folder.slice(2); sel.appendChild(o); }
    const mark = () => { if (W.folder) sel.value = W.folder; };
    mark(); addEventListener('sitt:memory', () => setTimeout(mark, 0));
    sel.addEventListener('change', async () => { const f = sel.value; sel.blur(); if (!W.lock && f && f !== W.folder) { if (!(await W.go(f))) mark(); } });
    let busy = false;
    const reload = async () => {
      if (busy || W.lock || !W.folder) return; busy = true; btn.disabled = true; ok.textContent = '';
      try { const m = await W.load(W.folder); W.memory = m; await W.scene.reload(m, { folder: W.folder, set: W.set, source: W.source }); W.refresh?.(); apply(m); ok.textContent = '✓'; setTimeout(() => ok.textContent = '', 1200); }
      catch (e) { console.error('reload', e); ok.textContent = '!'; }
      finally { busy = false; btn.disabled = false; }
    };
    btn.addEventListener('click', reload);
    addEventListener('keydown', e => { if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); reload(); } });
  }
  /* ---------- start ---------- */
  async function boot() {
    V = await (await fetch('versions.json', { cache: 'no-cache' })).json();
    if (Q.has('explore')) {   // EXPLORE: the viewer moves through the pictures themselves; each memory's "feel" sets how the room answers them
      document.body.classList.add('story');
      while (!(W = window.SITTWorldState) || !W.memory || !W.scene) await wait(50);
      const plain = Q.get('explore') === 'plain' || Q.get('explore') === 'frame';   // STORY: the same rooms with every effect stripped out
      const apply = m => { const S = W.scene.settings; S.feel = plain ? null : (m?.feel || null); if (!S.feel?.light) S.relight = null; S.focus = null; S.haze = null; S.enter = null; W.scene.changed?.(); };
      addEventListener('sitt:memory', e => apply(e.detail.memory)); apply(W.memory);
      testBar(apply);
      if (Q.get('explore') === 'frame') windowFrame();
      if (Q.get('seq') === 'pool') { const s = document.createElement('script'); s.src = 'engine/pool.js'; document.head.appendChild(s); }   // STORYTELLING: the pool tests, only with &seq=pool&opt=A..D
      if (Q.has('age') || Q.get('seq') === 'pool') { const s = document.createElement('script'); s.src = 'engine/age.js'; document.head.appendChild(s); }   // STORYTELLING: the aged-print test, only with &age=1
      if (Q.has('sound')) { const s = document.createElement('script'); s.src = 'engine/soundscape.js'; document.head.appendChild(s); }   // STORYTELLING: the soundscape test, only with &sound=1
      return;
    }
    const vid = Q.get('v');
    if (!vid || !V.versions[vid]) { document.body.classList.add('story'); menu(); return; }
    document.body.classList.add('story');
    fx.style.opacity = 1;   // it begins in the dark
    while (!(W = window.SITTWorldState) || !W.memory || !W.track) await wait(50);
    W.lock = true;
    let current = null;   // each arrival is played once, however the director hears of it
    const start = m => { if (!m || m.storytelling?.version !== vid || current === m) return; current = m; const tok = ++run; play(m, tok); };
    addEventListener('sitt:memory', e => start(e.detail.memory));
    start(W.memory);
    addEventListener('keydown', e => { if (e.key === 'Escape') location.href = '?tune=0'; });
  }
  // the story opens on this version's first picture (the engine reads ?memory=)
  if (Q.has('explore') && !Q.get('memory')) { Q.set('memory', 'x-001'); history.replaceState(null, '', '?' + Q); }
  if (Q.get('v') && !Q.get('memory')) { Q.set('memory', Q.get('v') + '-001'); history.replaceState(null, '', '?' + Q); }
  boot().catch(e => console.error('director', e));
})();

/* THE FULL TIMELINE · the page around the story (both stories, one engine, one timeline).
 *
 * The window (desktop): the picture in a quiet frame on a black page, PIXELSTORTION top left; the frame turns very slightly
 *   as the viewer moves, the way a real window does, and gives a little when dragged (the earlier story's "Story in a
 *   window", unchanged: ?tilt= ?give= as before).
 * Full view: the picture fills the screen (the browser's full screen); leaving full screen goes back to the window.
 * The date line: under the picture in the window, over it in full view. Dates only (no names), not numbers: the key moments
 *   (timeline.json), evenly spaced, in story order. Click one to go straight there. A crowded one is a mark; hover for its date.
 * Bottom left, barely there until the pointer comes near:
 *   - the drop-down: every picture in story order by its web file's name, the one on screen selected; pick one to go there;
 *   - locations: every picture on screen, with the exact place of its web file, its master PNG and its PSDs (select, copy);
 *   - reload: the pictures on screen again, fresh from the server (save a web image over its file, press it, see it). R does the same;
 *   - edges: new / old, the depth-edge search (new is the working version; old kept to compare, e.g. performance). E flips.
 * Top right: [ full ] / [ window ] (or F).
 * Phones: always full view, landscape (asks to turn the phone); a black start, [load story] and under it
 *   [Silence Is The Trauma]; then the phone's tilt moves the depth, as depthy.stamina.pl.
 * Options in the address: ?feel=1 each earlier room's own "feel" (light, focus, air: the earlier Explore), ?ui=0 no bar.
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;
  const ROOT = 'D:\\SITT_STORY_TESTING\\Full_Timeline\\', WEB = ROOT + 'silenceisthetrauma\\story\\pictures\\', MASTER = ROOT + 'WorkingFiles\\Master_PNGS_PSDS\\';
  const TILT = Math.max(0, +(Q.get('tilt') ?? 2.5)), GIVE = Math.max(0, +(Q.get('give') ?? 12));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isPath = n => typeof n === 'string' && n.includes('/');
  const base = n => n.split('/').pop();
  let W = null, TL = null, full = phone;

  const css = document.createElement('style');
  css.textContent = `html.framed,html.framed body,html.framed .world{background:#000}
html.framed .world .poster{display:none}
.world .timeline{display:none!important}
.xwin{position:absolute;transform-origin:50% 50%;will-change:transform}
.xwin canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}
.xwin svg{position:absolute;left:-40px;top:-40px;overflow:visible;pointer-events:none}
.xbrand{position:fixed;left:28px;top:20px;z-index:50;font:700 15px/1 'Space Grotesk',system-ui,sans-serif;letter-spacing:-.03em;color:rgba(255,255,255,.32);pointer-events:none}
html.full .xbrand,html.full .xwin svg{display:none}
html.later .xage-box,html.later .xsnd,html.phone .xage-box,html.phone .xsnd{display:none}
.xdates{position:absolute;left:0;right:0;z-index:60;font:11px/1 'Courier Prime',ui-monospace,monospace;color:rgba(255,255,255,.34);letter-spacing:.06em;user-select:none}
html.full .xdates{position:fixed;left:24%;right:4%;top:auto!important;bottom:16px;opacity:.55;transition:opacity .3s}
html.full .xdates:hover{opacity:1}
.xdates .row{position:relative;height:14px}
.xdates .m{position:absolute;transform:translateX(-50%);cursor:pointer;padding:6px 4px;margin-top:-6px;white-space:nowrap;background:none;border:0;color:inherit;font:inherit;letter-spacing:inherit}
.xdates .m:hover,.xdates .m:focus-visible,.xdates .m.now{color:rgba(255,255,255,.75);outline:none}
.xdates .m .tip{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:4px;padding:3px 6px;background:rgba(0,0,0,.8);color:#ddd;border-radius:3px;opacity:0;pointer-events:none;transition:opacity .15s;white-space:nowrap}
.xdates .m:hover .tip,.xdates .m:focus-visible .tip{opacity:1}
.xdates .line{position:relative;height:1px;margin-top:8px;background:rgba(255,255,255,.14)}
.xdates .line i{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.5)}
.xdates .line b{position:absolute;top:-2px;width:1px;height:5px;background:rgba(255,255,255,.35);transform:translateX(-50%)}
.xbar{position:fixed;left:8px;bottom:8px;z-index:99999;display:flex;gap:4px;align-items:center;opacity:.14;transition:opacity .2s;font:12px/1 system-ui,sans-serif;max-width:min(46vw,520px)}
.xbar:hover,.xbar:focus-within,.xbar.open{opacity:.92}
.xbar select,.xbar button{background:rgba(0,0,0,.55);color:#eee;border:1px solid rgba(255,255,255,.25);border-radius:4px;padding:3px 5px;font:inherit;cursor:pointer}
.xbar select{min-width:0;max-width:100%;flex:1 1 auto;text-overflow:ellipsis}
.xbar button:disabled{opacity:.5;cursor:wait}
.xbar .ok{color:#cfc;min-width:1em}
.xfull{position:fixed;right:28px;top:16px;z-index:99999;background:none;border:0;padding:4px 0;cursor:pointer;font:12px/1 'Courier Prime',ui-monospace,monospace;letter-spacing:.08em;color:rgba(255,255,255,.38);transition:color .2s}
.xfull:hover,.xfull:focus-visible{color:rgba(255,255,255,.85);outline:none}
html.full .xfull{color:rgba(255,255,255,.22)}html.full .xfull:hover{color:rgba(255,255,255,.85)}
.xloc{position:fixed;left:8px;bottom:40px;z-index:99999;width:min(820px,calc(100vw - 16px));max-height:min(70vh,640px);overflow:auto;background:rgba(10,10,10,.94);color:#ddd;border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:10px 12px;font:12px/1.5 ui-monospace,Consolas,monospace;display:none;user-select:text}
.xloc.on{display:block}
.xloc h4{margin:10px 0 4px;font:600 12px system-ui,sans-serif;color:#fff}.xloc h4:first-child{margin-top:0}
.xloc .pic{margin:0 0 8px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:4px}
.xloc .pic div{white-space:pre-wrap;word-break:break-all}.xloc .k{color:#888;user-select:none;display:inline-block;min-width:5.5em}
.xloc .tools{position:sticky;top:-10px;display:flex;gap:6px;justify-content:flex-end;background:rgba(10,10,10,.94);padding:2px 0 6px}
.xloc .tools button{background:rgba(255,255,255,.08);color:#eee;border:1px solid rgba(255,255,255,.25);border-radius:4px;padding:3px 8px;font:12px system-ui,sans-serif;cursor:pointer}
.xstart{position:fixed;inset:0;z-index:2147483000;background:#000;color:#bdb7ab;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font:14px/1.4 'Courier Prime',ui-monospace,monospace;letter-spacing:.08em;cursor:pointer;-webkit-tap-highlight-color:transparent}
.xstart b{font-weight:400;color:#ece6da;font-size:16px}.xstart span{color:#6d675d}
.xturn{position:fixed;inset:0;z-index:2147483001;background:#000;color:#bdb7ab;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;font:14px/1.5 'Courier Prime',ui-monospace,monospace;letter-spacing:.06em}
@media (orientation:portrait){html.phone .xturn{display:flex}}`;
  document.head.appendChild(css);
  const fonts = document.createElement('link'); fonts.rel = 'stylesheet'; fonts.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime&family=Space+Grotesk:wght@700&display=swap'; document.head.appendChild(fonts);   // the website's two typefaces
  if (phone) document.documentElement.classList.add('phone');

  /* ---------- the phone's start: black, [load story], [Silence Is The Trauma]; the tap gives full screen, landscape, sound and tilt ---------- */
  let started = !phone;
  const startDone = new Promise(res => {
    if (!phone) return res();
    const s = document.createElement('div'); s.className = 'xstart'; s.setAttribute('role', 'button'); s.tabIndex = 0;
    s.innerHTML = '<b>[load story]</b><span>[Silence Is The Trauma]</span>'; document.body.appendChild(s);
    const turn = document.createElement('div'); turn.className = 'xturn'; turn.textContent = 'Turn your phone sideways'; document.body.appendChild(turn);
    const go = async () => {
      s.removeEventListener('click', go);
      try { await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }); } catch {}
      try { await screen.orientation?.lock?.('landscape'); } catch {}
      try { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) await DeviceOrientationEvent.requestPermission(); } catch {}
      try { window.SITTSound?.context?.().resume(); } catch {}
      s.remove(); started = true; res();
    };
    s.addEventListener('click', go);
  });

  /* ---------- the phone's tilt moves the depth (as depthy): the way it is held when the story starts is the middle ----------
     The phone's three angles (alpha, beta, gamma) wrap: held near upright, gamma jumps from +90 to -90 and beta by 180, which
     flicked the depth. So the whole orientation is used instead (a rotation, which never wraps), measured against the one the
     phone had at the start, and smoothed a little so the sensor's own jitter doesn't shake the picture. */
  const D2R = Math.PI / 180;
  function rot(a, b, g) {   // the device's orientation as a matrix (W3C: Rz(alpha) Rx(beta) Ry(gamma))
    const ca = Math.cos(a * D2R), sa = Math.sin(a * D2R), cb = Math.cos(b * D2R), sb = Math.sin(b * D2R), cg = Math.cos(g * D2R), sg = Math.sin(g * D2R);
    return [[ca * cg - sa * sb * sg, -sa * cb, ca * sg + sa * sb * cg], [sa * cg + ca * sb * sg, ca * cb, sa * sg - ca * sb * cg], [-cb * sg, sb, cb * cg]];
  }
  const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const tr = A => [0, 1, 2].map(i => [A[0][i], A[1][i], A[2][i]]);
  function turned(B, R) {   // how far the phone has turned since B, about its own x and y axes, in degrees
    const M = mul(tr(B), R), c = clamp((M[0][0] + M[1][1] + M[2][2] - 1) / 2, -1, 1), th = Math.acos(c), k = th < 1e-6 ? .5 : th / (2 * Math.sin(th));
    return [(M[2][1] - M[1][2]) * k / D2R, (M[0][2] - M[2][0]) * k / D2R];
  }
  function axis(w, deg) {   // a small rotation about an axis in the phone's frame (Rodrigues)
    const t = Math.hypot(...w) * deg * D2R; if (t < 1e-9) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const n = Math.hypot(...w), [x, y, z] = w.map(v => v / n), c = Math.cos(t), s = Math.sin(t), C = 1 - c;
    return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]];
  }
  function tiltFrom(B, R, ang) {   // the depth's x, y (right, up) in degrees, for the way the screen is turned
    const [rx, ry] = turned(B, R);
    return ang === 90 ? [rx, -ry] : ang === 270 || ang === -90 ? [-rx, ry] : ang === 180 ? [-ry, -rx] : [ry, rx];
  }
  window.SITTTiltMath = { rot, turned, tiltFrom };   // (for testing)
  function tilt() {
    const RANGE = Math.max(1, +(Q.get('tiltrange') ?? 8));   // degrees of tilt from the middle to the full depth (?tiltrange= to try others)
    const SMOOTH = Math.max(0, +(Q.get('tiltsmooth') ?? 70));   // ms: how much the sensor's jitter is evened out (0 = raw)
    W.scene.settings.tiltGain = Math.max(.2, +(Q.get('tiltgain') ?? 2.4));   // the depth a full tilt gives, against the mouse at the screen's edge (1 = the same); ?tiltgain= to try others
    let B = null, sx = 0, sy = 0, rx = 0, ry = 0, seen = false, last = 0, scene = '', settle = 0;
    addEventListener('deviceorientation', e => {
      if (e.beta == null || e.gamma == null || !W?.scene?.tilt) return;
      const R = rot(e.alpha || 0, e.beta, e.gamma), ang = (screen.orientation?.angle ?? window.orientation ?? 0) % 360;
      if (!B) { B = R; sx = sy = 0; }
      const ts = W.track?.s ?? 0, here = W.folder + '|' + Math.round(ts); if (Math.abs(ts - Math.round(ts)) < .02 && here !== scene) { if (scene) settle = e.timeStamp + 2500; scene = here; }   // arrived on a new scene (resting on it, not mid-swipe): the middle glides, over about two seconds, to however the phone is held now (standing, sitting, lying)
      let [r0, r1] = turned(B, R);
      const o0 = r0 - clamp(r0, -RANGE, RANGE), o1 = r1 - clamp(r1, -RANGE, RANGE);   // tilted past the full depth (most people lift the phone once they notice the effect):
      if (o0 || o1) { B = mul(B, axis([o0, o1, 0], 1)); [r0, r1] = turned(B, R); }   // the middle is dragged along, so the depth waits at its edge and answers the moment the phone tilts back
      B = mul(B, axis([r0, r1, 0], e.timeStamp < settle ? .02 : .0004));   // otherwise the middle follows how the phone is held very slowly (about half a minute), so a held tilt keeps its depth but the view never sticks at an edge for good
      [rx, ry] = tiltFrom(B, R, ang); seen = true;   // the latest reading; the glide below follows it on every frame
    });
    // phones report their tilt in steps (often 20 to 30 a second): the depth glides towards the latest reading on every frame instead of jumping at each one
    const glide = now => { requestAnimationFrame(glide); if (!seen) return; const dt = Math.min(100, now - (last || now)); last = now;
      const k = SMOOTH > 0 ? 1 - Math.exp(-dt / SMOOTH) : 1; sx += (rx - sx) * k; sy += (ry - sy) * k;
      W.scene.tilt(clamp(sx / RANGE, -1, 1), clamp(-sy / RANGE, -1, 1)); };
    requestAnimationFrame(glide);
    addEventListener('orientationchange', () => { B = null; });
  }

  /* ---------- where a picture is on its memory's strip: the stop that shows it ---------- */
  function sectionX(m, s) { if (Number.isFinite(m.sections?.[s]?.x)) return m.sections[s].x; let x = 0; for (let k = 0; k < s; k++) x += m.sections?.[k]?.width || 0; return x; }
  function stopOfSection(m, s) {
    const st = m.stops || []; if (!st.length) return 0;
    const a = sectionX(m, s), b = a + (m.sections?.[s]?.width || 0);
    let best = -1; st.forEach((p, k) => { if (best < 0 && p.frame) { const c = p.frame[0] + p.frame[2] / 2; if (c >= a && c < b) best = k; } });
    return best < 0 ? 0 : best;
  }
  function stopOfPicture(m, pic) {
    const l = (m.layers || []).find(l => l.image === pic || l.depth === pic);
    return l && Number.isFinite(l.section) ? stopOfSection(m, l.section) : 0;
  }
  function sectionsOfStop(m, k) {   // the sections a stop's frame shows
    const f = m.stops?.[k]?.frame; if (!f || !m.sections?.length) return [0];
    const out = []; for (let s = 0; s < m.sections.length; s++) { const a = sectionX(m, s), b = a + m.sections[s].width; if (f[0] < b && f[0] + f[2] > a) out.push(s); }
    return out.length ? out : [0];
  }
  const layersOfStop = (m, k) => { const S = sectionsOfStop(m, k); return (m.layers || []).filter(l => !Number.isFinite(l.section) || S.includes(l.section)); };
  const centreSection = (m, k) => { const f = m.stops?.[k]?.frame; if (!f || !m.sections?.length) return null; const c = f[0] + f[2] / 2; for (let s = 0; s < m.sections.length; s++) { const a = sectionX(m, s); if (c >= a && c < a + m.sections[s].width) return s; } return null; };
  const shotLayers = (m, k) => { const cs = centreSection(m, k), f = m.stops?.[k]?.frame;   // the layers of the shot the frame is on
    let L = cs == null ? layersOfStop(m, k) : (m.layers || []).filter(l => l.section === cs);
    if (cs != null && f) { const c = f[0] + f[2] / 2, inR = L.filter(l => l.rect && c >= l.rect[0] && c < l.rect[0] + l.rect[2]);   // a picture placed in its own part of the strip (rect, strip pixels): the one the frame is on
      L = inR.length ? inR : L.filter(l => !l.rect).length ? L.filter(l => !l.rect) : L; }
    return L; };
  const mainPicture = (m, k) => { const L = shotLayers(m, k).filter(l => isPath(l.image)); return (L.find(l => /_Background\./.test(l.image)) || L[0])?.image || null; };

  /* the story as it is walked: the earlier rooms, then the opening (the joined strip), Dominic's world, the glass house */
  const memCache = new Map();
  const loadMem = f => { if (!memCache.has(f)) memCache.set(f, W.load(f).catch(() => null)); return memCache.get(f); };
  function walkOrder() {
    const L = W.list?.memories || [], parts = new Set();
    return (async () => {
      for (const e of L) { const m = await loadMem(e.folder); for (const j of m?.joinSpec?.join || []) parts.add(j); }
      const seen = new Set(), out = []; let f = [...L].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.folder;   // the story's own beginning (x-001), wherever it opens
      while (f && !seen.has(f)) { seen.add(f); out.push(f); const m = await loadMem(f); f = m?.exits?.right?.to; }
      for (const e of L) if (!seen.has(e.folder) && !parts.has(e.folder)) { seen.add(e.folder); out.push(e.folder); }   // anything off the main line, at the end
      return out;
    })();
  }

  /* ---------- the window ---------- */
  let win, svg, dates, bw = 0, bh = 0;
  function windowFrame() {
    const world = document.querySelector('.world'), canvas = document.getElementById('stage');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    document.documentElement.classList.add('framed');
    win = document.createElement('div'); win.className = 'xwin';
    world.insertBefore(win, canvas); win.appendChild(canvas);
    const NS = 'http://www.w3.org/2000/svg'; svg = document.createElementNS(NS, 'svg'); win.appendChild(svg);
    const brand = document.createElement('div'); brand.className = 'xbrand'; brand.textContent = 'PIXELSTORTION'; document.body.appendChild(brand);
    layout(); addEventListener('resize', layout); addEventListener('sitt:memory', () => setTimeout(layout, 0));
    // the turn: the viewer's position, eased; and the give when dragged
    let tx = 0, ty = 0, cx = 0, cy = 0, down = null, gx = 0, gy = 0, dx = 0, dy = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'touch') { tx = clamp(e.clientX / innerWidth * 2 - 1, -1, 1); ty = clamp(1 - e.clientY / innerHeight * 2, -1, 1); }
      if (down) { const k = GIVE / 160; gx = clamp((e.clientX - down.x) * k, -GIVE, GIVE); gy = clamp((e.clientY - down.y) * k * .5, -GIVE * .5, GIVE * .5); }
    }, { passive: true });
    addEventListener('pointerdown', e => { if (!e.target.closest?.('.xbar,.xloc,.xdates')) down = { x: e.clientX, y: e.clientY }; }, { passive: true });
    const up = () => { down = null; gx = 0; gy = 0; };
    addEventListener('pointerup', up); addEventListener('pointercancel', up); document.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const tick = () => {
      const still = full || reduce.matches || !!W?.poolDetached;
      cx += ((still ? 0 : tx) - cx) * .07; cy += ((still ? 0 : ty) - cy) * .07;
      dx += ((still ? 0 : gx) - dx) * .18; dy += ((still ? 0 : gy) - dy) * .18;
      // the viewer moving right sees the window's left edge fall away (and moving up, its bottom edge), as a real window does
      win.style.transform = full ? 'none' : `perspective(${Math.round(Math.max(bw, 600) * 1.6)}px) translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) rotateY(${(-cx * TILT).toFixed(3)}deg) rotateX(${(-cy * TILT * .5).toFixed(3)}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function layout() {
    if (!win) return;
    document.documentElement.classList.toggle('full', full); if (W?.memory) document.documentElement.classList.toggle('later', W.memory.era !== 'earlier');
    const was = win.style.transform; win.style.transform = 'none';   // measure flat, so the engine sizes itself to the real box
    if (full) { bw = innerWidth; bh = innerHeight; Object.assign(win.style, { left: '0px', top: '0px', width: bw + 'px', height: bh + 'px' }); }
    else {
      const m = W?.memory, pw = m?.sections?.[0]?.width || 2000, ph = m?.height || 1024, aw = innerWidth * .9, ah = innerHeight - 64 - 70;
      const ar = m?.era === 'earlier' ? pw / ph : innerWidth / innerHeight;   // the earlier rooms: the picture's own shape (as the window test); the later story: the screen's (as it plays full screen)
      bw = Math.min(aw, ah * ar); bh = bw / ar;
      Object.assign(win.style, { left: (innerWidth - bw) / 2 + 'px', top: 64 + (ah - bh) / 2 + 'px', width: bw + 'px', height: bh + 'px' });
      // a hairline rule just outside the picture, running a little past each corner like crop marks
      const g = 9, ext = 26, W2 = bw + 80, H2 = bh + 80, x0 = 40 - g, y0 = 40 - g, x1 = 40 + bw + g, y1 = 40 + bh + g;
      svg.setAttribute('width', W2); svg.setAttribute('height', H2);
      const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
      svg.innerHTML = `<g stroke="rgba(255,255,255,.16)" stroke-width="1" shape-rendering="crispEdges">${L(x0 - ext + g, y0, x1, y0)}${L(x0, y0 - ext + g, x0, y1)}${L(x0, y1, x1 + ext - g, y1)}${L(x1, y0, x1, y1 + ext - g)}</g>`;
      if (dates) dates.style.top = (bh + g + 14) + 'px';
    }
    if (dates) { if (full) document.body.appendChild(dates); else if (dates.parentNode !== win) win.appendChild(dates); requestAnimationFrame(fit); }
    requestAnimationFrame(() => { win.style.transform = was; window.dispatchEvent(new Event('sitt:layout')); });
  }
  function setFull(on) {
    if (phone) on = true;
    full = on; layout(); setTimeout(() => dispatchEvent(new Event('resize')), 30);   // the engine sizes itself again
  }

  /* ---------- the date line: the key moments, evenly spaced, in story order ---------- */
  let moments = [], order = [];
  async function dateLine() {
    dates = document.createElement('div'); dates.className = 'xdates';
    dates.innerHTML = '<div class="row"></div><div class="line"><i></i></div>';
    for (const ev of ['pointerdown', 'pointerup', 'click', 'wheel', 'touchstart', 'touchmove']) dates.addEventListener(ev, e => e.stopPropagation());
    if (!full) win.appendChild(dates); layout();
    const n = moments.length, row = dates.firstChild, line = dates.lastChild;
    row.innerHTML = moments.map((m, i) => {
      const same = i > 0 && moments[i - 1].date === m.date;   // a run of moments on one day: the date once, the rest a mark
      return `<button class="m" type="button" data-i="${i}"${same ? ' data-same="1"' : ''} style="left:${n > 1 ? i / (n - 1) * 100 : 50}%">${same ? '·' : esc(m.date)}<span class="tip">${esc(m.date)}</span></button>`;
    }).join('');
    line.insertAdjacentHTML('beforeend', moments.map((m, i) => `<b style="left:${n > 1 ? i / (n - 1) * 100 : 50}%"></b>`).join(''));
    row.addEventListener('click', e => { const b = e.target.closest('.m'); if (b) go(moments[+b.dataset.i].memory, moments[+b.dataset.i].stop); });
    requestAnimationFrame(fit);
  }
  function fit() {   // a date that would run into the one before it shows as a mark (its date on hover), so the line never crowds
    if (!dates) return; let right = -1e9;
    dates.querySelectorAll('.m').forEach((el, i) => { const t = el.firstChild; t.textContent = el.dataset.same ? '·' : moments[i].date;
      const r = el.getBoundingClientRect(); if (r.left < right + 10) t.textContent = '·'; else if (t.textContent !== '·') right = r.right; });
  }
  const at = () => [order.indexOf(W.folder), W.track?.s ?? 0];
  const before = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1] - 1e-3);
  function markNow() {
    if (!dates || !moments.length || !W?.folder) return;
    const cur = at(), n = moments.length; let p = 0;
    for (let i = 0; i < n; i++) {
      const a = [order.indexOf(moments[i].memory), moments[i].stop];
      if (!before(cur, a)) { p = i; const nx = moments[i + 1]; if (nx) { const b = [order.indexOf(nx.memory), nx.stop];
        if (before(cur, b) && a[0] === b[0] && b[1] > a[1]) p = i + clamp((cur[1] - a[1]) / (b[1] - a[1]), 0, 1); } }
    }
    const k = Math.round(p);
    dates.querySelectorAll('.m').forEach((el, i) => el.classList.toggle('now', i === Math.floor(p) && Math.abs(p - k) < .5 && i === k));
    dates.querySelector('.line i').style.width = (n > 1 ? p / (n - 1) * 100 : 0) + '%';
  }

  /* ---------- going somewhere: a cut, straight there ---------- */
  async function go(folder, stop) {
    if (!folder) return;
    if (W.goto) return W.goto(folder, stop || 0);
    if (W.folder !== folder) await W.go(folder);   // (an engine without goto: the memory, then the stop)
    if (Number.isFinite(stop)) W.goStop?.(stop);
  }

  /* ---------- the bar: the drop-down, locations, reload, full view ---------- */
  let sel, loc, okEl, built = false, current = '';
  function bar() {
    const b = document.createElement('div'); b.className = 'xbar';
    sel = document.createElement('select'); sel.title = 'The picture on screen (its web file). Pick any picture to go there.';
    const bl = document.createElement('button'); bl.type = 'button'; bl.textContent = '⌖'; bl.title = 'Where the pictures on screen are: web file, master PNG, PSDs';
    const br = document.createElement('button'); br.type = 'button'; br.textContent = '↻'; br.title = 'Reload the pictures on screen (R)';
    const bf = document.createElement('button'); bf.type = 'button'; bf.className = 'xfull'; bf.title = 'Full view (F)';   // top right, opposite the brand
    const be = document.createElement('button'); be.type = 'button';   // the depth-edge search: new (the working version) or old, to compare (also on phones, for performance)
    const edgesNow = () => W.scene.settings.edges || 'new', showEdges = () => { be.textContent = 'edges: ' + edgesNow(); be.title = 'Depth edges of cut-outs: new (the working version) or old, to compare. E flips. This browser remembers it. (The earlier rooms always play with the new, as their story did.)'; };
    const flipEdges = () => { const v = edgesNow() === 'new' ? 'old' : 'new'; W.scene.settings.edges = v; try { localStorage.setItem('sitt-edges', v); } catch {} W.scene.changed?.(); showEdges(); };
    showEdges(); be.addEventListener('click', flipEdges);
    addEventListener('keydown', e => { if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !document.documentElement.classList.contains('tuning') && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); flipEdges(); } });   // (the studio, when open, flips it itself)
    okEl = document.createElement('span'); okEl.className = 'ok';
    b.append(sel, bl, br, be, okEl); document.body.appendChild(b); document.body.appendChild(bf);
    const label = () => { bf.textContent = full ? '[ window ]' : '[ full ]'; bf.title = full ? 'Back to the window (F)' : 'Full view (F)'; }; label(); addEventListener('sitt:layout', label);
    if (phone) bf.style.display = 'none';
    loc = document.createElement('div'); loc.className = 'xloc'; document.body.appendChild(loc);
    for (const el of [b, loc, bf]) for (const ev of ['pointerdown', 'pointerup', 'click', 'wheel', 'touchstart', 'touchmove', 'keydown']) el.addEventListener(ev, e => e.stopPropagation());
    sel.addEventListener('pointerdown', fillAll); sel.addEventListener('focus', fillAll);
    sel.addEventListener('change', () => { const [f, k] = sel.value.split('|'); sel.blur(); go(f, +k); });
    bl.addEventListener('click', () => { loc.classList.toggle('on'); b.classList.toggle('open', loc.classList.contains('on')); if (loc.classList.contains('on')) locations(); });
    br.addEventListener('click', reload);
    bf.addEventListener('click', async () => { if (!full) { try { await document.documentElement.requestFullscreen?.(); } catch {} setFull(true); } else { try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {} setFull(false); } });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && full && !phone) setFull(false); });
    addEventListener('keydown', e => { if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); reload(); } });
    addEventListener('keydown', e => { if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) bf.click(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') { loc.classList.remove('on'); b.classList.remove('open'); } });
  }
  async function fillAll() {   // every picture of the story, in story order, by its web file's name (made the first time it is opened)
    if (built) return; built = true;
    const groups = [];
    for (const f of order) {
      const m = await loadMem(f); if (!m) continue;
      const opts = (m.stops?.length ? m.stops : [null]).map((_, k) => ({ k, pic: mainPicture(m, k) })).filter(o => o.pic);
      const seen = new Set(); const uniq = opts.filter(o => !seen.has(o.pic) && seen.add(o.pic));
      groups.push(uniq.map(o => `<option value="${esc(f)}|${o.k}">${esc(base(o.pic).replace(/\.webp$/, ''))}</option>`).join(''));   // the file names only, no headings
    }
    sel.innerHTML = groups.join(''); showCurrent(true);
  }
  function showCurrent(force) {
    if (!W?.memory || !sel) return;
    const k = Math.round(W.track?.s ?? 0), pic = mainPicture(W.memory, k), key = W.folder + '|' + k;
    if (!force && key === current) return; current = key;
    if (!pic) return;
    let opt = [...sel.options].find(o => o.textContent === base(pic).replace(/\.webp$/, ''));
    if (!opt) { opt = new Option(base(pic).replace(/\.webp$/, ''), key); sel.insertBefore(opt, sel.firstChild); }
    sel.value = opt.value;
    if (loc?.classList.contains('on')) locations();
  }
  function locations() {   // every picture on screen: web file, master PNG, PSD folder
    const m = W.memory; if (!m) return;
    const k = Math.round(W.track?.s ?? 0), here = shotLayers(m, k);
    const pics = [...new Set(here.flatMap(l => [l.image, l.depth]).filter(isPath))];
    const rest = [...new Set((m.layers || []).flatMap(l => [l.image, l.depth]).filter(isPath))].filter(p => !pics.includes(p));
    const block = p => { const win = p.replace(/\//g, '\\'), dir = win.split('\\').slice(0, -1).join('\\');
      return `<div class="pic"><div><span class="k">web</span>${esc(WEB + win)}</div><div><span class="k">master</span>${esc(MASTER + win.replace(/\.webp$/, '.png'))}</div><div><span class="k">PSDs</span>${esc(MASTER + dir + '\\workingFiles\\')}</div><div><span class="k">site</span>story/pictures/${esc(p)}</div></div>`; };
    loc.innerHTML = `<div class="tools"><button type="button" data-c="here">copy these</button><button type="button" data-c="all">copy all</button></div>
<h4>On screen · ${esc(m.title || W.folder)} · stop ${k}</h4>${pics.map(block).join('') || '<p>(no pictures named by path here)</p>'}
${rest.length ? `<h4>The rest of this memory</h4>${rest.map(block).join('')}` : ''}`;
    const text = list => list.map(p => { const w = p.replace(/\//g, '\\'); return `${WEB + w}\r\n${MASTER + w.replace(/\.webp$/, '.png')}`; }).join('\r\n');
    loc.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => navigator.clipboard?.writeText(text(b.dataset.c === 'all' ? [...pics, ...rest] : pics)).then(() => { b.textContent = 'copied'; setTimeout(() => b.textContent = b.dataset.c === 'all' ? 'copy all' : 'copy these', 1000); }).catch(() => {})));
  }
  let busy = false;
  async function reload() {
    if (busy || !W?.folder) return; busy = true; okEl.textContent = '…';
    try { if (W.reload) await W.reload(); else { W.scene.reloadPictures?.(); const m = await W.load(W.folder); W.memory = m; await W.scene.reload(m, { folder: W.folder, set: W.set, source: W.source }); W.refresh?.(); }
      memCache.delete(W.folder); okEl.textContent = '✓'; setTimeout(() => okEl.textContent = '', 1200); }
    catch (e) { console.error('reload', e); okEl.textContent = '!'; }
    finally { busy = false; }
  }

  /* ---------- the earlier Explore's "feel" (light, focus, air), only when asked: ?feel=1 ---------- */
  function feel() {
    if (Q.get('feel') !== '1') return;
    const apply = () => { const S = W.scene.settings; S.feel = W.memory?.era === 'earlier' ? (W.memory?.feel || null) : null; W.scene.changed?.(); };
    apply(); addEventListener('sitt:memory', () => setTimeout(apply, 0));
  }

  async function boot() {
    while (!(W = window.SITTWorldState) || !W.memory || !W.scene || !W.list) await wait(50);
    layout();   // now the memory is known: its window shape
    feel();
    try { TL = await (await fetch('timeline.json', { cache: 'no-cache' })).json(); } catch { TL = { moments: [] }; }
    order = await walkOrder();
    moments = [];
    for (const t of TL.moments || []) { const m = await loadMem(t.memory); moments.push({ ...t, stop: m ? stopOfPicture(m, t.picture) : 0 }); }
    await dateLine();
    if (Q.get('ui') !== '0') bar();
    let laid = W.memory; setInterval(() => { markNow(); showCurrent(false); if (W.memory !== laid) { laid = W.memory; layout(); } }, 250);   // a new memory: its window shape (whatever way it arrived)
    addEventListener('sitt:memory', () => setTimeout(() => { markNow(); showCurrent(true); }, 0));
    await startDone; if (phone) tilt();
  }
  // the window is made at once, before anything else is drawn, so whatever sits on the picture (the aged print's sheets) goes into it
  windowFrame(); if (phone) { full = true; layout(); }
  boot().catch(e => console.error('timeline-ui', e));
})();

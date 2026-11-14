/* SITT STORYTELLING TEST · the aged print. Only runs when the address has &age=1. Nothing else in the engine changes.
 *
 * The pictures are made to look like old photographic prints, the way real prints age (story/age.json):
 *  - faded blacks: the darkest tones lift a little, towards a warm brown (prints lose density);
 *  - yellowed highlights: the whites take on a warm paper tone (silver prints yellow from the highlights);
 *  - a fine grain, fixed to the print (it does not crawl);
 *  - marks: each print's own few blemishes, the way old prints carry them: tiny white specks (dust on the negative
 *    when it was printed), one or two faint hairline scratches, a few dark specks of surface dust, and on some
 *    prints a faint brown foxing spot. They are drawn once per room (the same room always has the same marks)
 *    in the picture itself: the engine puts each mark on whatever is at that spot, so it moves with it in depth.
 * The tone, fade and grain sit on the finished picture as see-through sheets, like a tint over a photograph; the
 * marks go into the picture through the engine (off in every other version). How old the print looks follows the room's place in the story (age.json
 * 'points'), and it changes slowly ('change' seconds) so the audience never sees a step.
 * Three tiny sliders at the left edge (a thin line and a dot each) set each effect's amount while testing (tone, fade = faded blacks, grain, and one for each kind of mark: specks, scratches, dust, foxing; 0 = off, 1 = as set, up to 3 = stronger; the mark sliders fade the same marks, never add or remove any).
 * They are remembered on this computer; double-click one to put it back. A hides or shows all of it.
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.get('age') === '0') return;   // MASTER: on by default for the earlier story (as it plays), ?age=0 off
  let cfg = null, on = true, sheets = null, age = 1, marksFor = '';
  const amt = { tone: 1, fade: 1, grain: 1, specks: 1, scratches: 1, dust: 1, foxing: 1 }, shown = {};
  const MARKS = ['specks', 'scratches', 'dust', 'foxing'];
  let over = null;   // a passage of the story can set its own amounts for a while (window.SITTAge), without touching the sliders
  const A = () => over || amt;
  const KEY = 'sitt-age-amounts';

  function grainTile() {   // a fixed field of fine grain, made once
    const n = 256, c = document.createElement('canvas'); c.width = c.height = n;
    const g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data;
    for (let i = 0; i < n * n; i++) { const v = 128 + ((Math.random() + Math.random() + Math.random() - 1.5) * 90); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); return c.toDataURL();
  }
  function build() {
    const css = document.createElement('style');
    css.textContent = `.xage-sheet{position:absolute;inset:0;pointer-events:none;transition:opacity var(--age-change,4s) ease}
.xage-lift{mix-blend-mode:screen}.xage-paper{mix-blend-mode:multiply}.xage-grain{mix-blend-mode:overlay;background-size:256px 256px;image-rendering:pixelated}
.xage-box{position:fixed;left:10px;bottom:84px;z-index:99999;display:flex;flex-direction:column;gap:9px;font:8px/1 'Courier Prime',ui-monospace,monospace;letter-spacing:.06em;color:rgba(255,255,255,.3)}
.xage-box label{display:flex;flex-direction:column;gap:3px;cursor:pointer}
.xage-box input{-webkit-appearance:none;appearance:none;width:44px;height:7px;margin:0;background:transparent;cursor:pointer}
.xage-box input::-webkit-slider-runnable-track{height:1px;background:rgba(255,255,255,.22)}
.xage-box input::-webkit-slider-thumb{-webkit-appearance:none;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.55);margin-top:-2px;border:0}
.xage-box input::-moz-range-track{height:1px;background:rgba(255,255,255,.22)}
.xage-box input::-moz-range-thumb{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.55);border:0}
.xage-box input:focus{outline:none}`;
    document.head.appendChild(css);
    const canvas = document.getElementById('stage'), holder = canvas.closest('.xwin');
    const wrap = document.createElement('div');
    wrap.style.cssText = holder ? 'position:absolute;inset:0;pointer-events:none' : 'position:fixed;inset:0;pointer-events:none;z-index:1';
    wrap.style.setProperty('--age-change', (cfg.change ?? 4) + 's');
    const mk = (cls, style) => { const d = document.createElement('div'); d.className = 'xage-sheet ' + cls; d.style.cssText = style; wrap.appendChild(d); return d; };
    sheets = {
      lift: mk('xage-lift', `background:${cfg.lift}`),
      paper: mk('xage-paper', `background:${cfg.paper}`),
      grain: mk('xage-grain', `background-image:url(${grainTile()})`)
    };
    if (holder) holder.insertBefore(wrap, canvas.nextSibling); else canvas.after(wrap);
    // the testing sliders, small and faint on the left: each effect's amount, 0 = off (remembered on this computer)
    try { Object.assign(amt, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
    const box = document.createElement('div'); box.className = 'xage-box'; box.title = 'Aged print, for testing. 0 turns an effect off. A hides or shows all of it.';
    for (const [k, name] of [['tone', 'tone'], ['fade', 'fade'], ['grain', 'grain'], ['specks', 'specks'], ['scratches', 'scratch'], ['dust', 'dust'], ['foxing', 'foxing']]) {   // each: its name and amount in tiny type, a thin line and a dot
      const l = document.createElement('label'), t = document.createElement('span'), r = document.createElement('input');
      r.type = 'range'; r.min = 0; r.max = MARKS.includes(k) ? 3 : 2; r.step = .05; r.value = amt[k];
      const changed = () => { try { localStorage.setItem(KEY, JSON.stringify(amt)); } catch {} paint(true); if (MARKS.includes(k)) redraw(); };
      r.addEventListener('input', () => { amt[k] = +r.value; changed(); });
      r.addEventListener('dblclick', () => { r.value = amt[k] = cfg.amounts?.[k] ?? 1; changed(); });
      shown[k] = { t, name }; l.append(t, r); box.appendChild(l);
    }
    document.body.appendChild(box);
    for (const ev of ['pointerdown', 'pointerup', 'click', 'wheel', 'touchstart', 'touchmove', 'keydown']) box.addEventListener(ev, e => e.stopPropagation());
    addEventListener('keydown', e => { if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); on = !on; paint(true); } });
  }
  /* ---------- marks: this print's own blemishes, drawn from the room's name so they never change ---------- */
  function rng(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  let redrawQueued = false;
  function redraw() { if (redrawQueued) return; redrawQueued = true; requestAnimationFrame(() => { redrawQueued = false; drawMarks(true); }); }
  // The marks are drawn in the picture's own coordinates and handed to the engine, which puts each one on whatever layer
  // is showing at that spot, so a scratch on a coat moves with the coat. Each kind has its own fixed list for this room,
  // so moving one slider never shifts the others; each slider only fades its marks in and out (how many there are is in age.json).
  function drawMarks(force) {
    const W = window.SITTWorldState, room = W?.folder || '', m = W?.memory, scene = W?.scene;
    if (!room || !m || !scene?.setMarks) return;
    if (!force && room === marksFor) return; marksFor = room;
    const M = cfg.marks || {}, w = m.sections?.[0]?.width || 2000, h = m.height || 1024, u = w / 1260;   // sizes as they look in a 1400-wide window
    const sheet = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, w, h); return [c, g]; };
    const [lc, lg] = sheet(), [dc, dg] = sheet(), [fc, fg] = sheet();
    const kind = (name, range, draw) => {
      const R = rng(room + ':' + name), a = A()[name] ?? 1, n = ([lo, hi]) => lo + Math.floor(R() * (hi - lo + 1)), rr = (x, y) => x + R() * (y - x);
      const count = n(range), k = a;   // the same marks always; the slider only sets how strong they are (0 gone, 1 as set, up to 3)
      for (let i = 0; i < count; i++) draw(R, rr, n, k);
    };
    const grey = v => `rgba(255,255,255,${v})`;
    // pale specks: dust on the negative, printed as tiny pale points, now and then a small cluster
    kind('specks', M.specks || [5, 12], (R, rr, n, k) => {
      const x = R() * w, y = R() * h, parts = R() < .25 ? n([2, 3]) : 1, al = Math.min(.9, rr(.25, .6) * k);
      for (let j = 0; j < parts; j++) { const cx = x + rr(-1.2, 1.2) * u, cy = y + rr(-1.2, 1.2) * u, r = rr(.5, 1.3) * u, gr = lg.createRadialGradient(cx, cy, 0, cx, cy, r);   // a soft edge, as a speck printed through the enlarger
        gr.addColorStop(0, grey(al)); gr.addColorStop(.55, grey(al * .8)); gr.addColorStop(1, grey(0)); lg.fillStyle = gr; lg.beginPath(); lg.arc(cx, cy, r, 0, 7); lg.fill(); }
    });
    // hairline scratches: very fine, pale, mostly long and nearly straight, sometimes a short curl
    kind('scratches', M.scratches || [1, 2], (R, rr, n, k) => {
      const long = R() < .6, len = long ? rr(.25, .7) * h : rr(20, 90) * u, ang = long ? rr(-.18, .18) + (R() < .3 ? Math.PI / 2 : 0) : rr(0, Math.PI * 2);
      const x0 = R() * w, y0 = R() * h, dx = Math.sin(ang) * len, dy = Math.cos(ang) * len, bend = rr(-.12, .12) * len;
      lg.strokeStyle = grey(Math.min(.6, rr(.08, .2) * k)); lg.lineWidth = rr(.45, .8) * u; lg.lineCap = 'round';
      lg.beginPath(); lg.moveTo(x0, y0); lg.quadraticCurveTo(x0 + dx / 2 + bend, y0 + dy / 2 - bend, x0 + dx, y0 + dy); lg.stroke();
    });
    // dark specks: dust that settled on the print itself
    kind('dust', M.dust || [2, 6], (R, rr, n, k) => { dg.fillStyle = grey(Math.min(.9, rr(.25, .55) * k)); dg.beginPath(); dg.arc(R() * w, R() * h, rr(.3, .8) * u, 0, 7); dg.fill(); });
    // foxing: faint brown blooms that old paper gets from damp (many prints have none)
    kind('foxing', M.foxing || [0, 2], (R, rr, n, k) => {
      const x = R() * w, y = R() * h, r = rr(3, 9) * u, gr = fg.createRadialGradient(x, y, 0, x, y, r), al = Math.min(.5, rr(.12, .22) * k);
      gr.addColorStop(0, grey(al)); gr.addColorStop(1, grey(0)); fg.fillStyle = gr; fg.beginPath(); fg.arc(x, y, r, 0, 7); fg.fill();
    });
    // one picture for the engine: red = pale marks, green = dark dust, blue = foxing
    const [out, og] = sheet(), O = og.getImageData(0, 0, w, h), L = lg.getImageData(0, 0, w, h).data, D = dg.getImageData(0, 0, w, h).data, F = fg.getImageData(0, 0, w, h).data, P = O.data;
    for (let i = 0; i < P.length; i += 4) { P[i] = L[i]; P[i + 1] = D[i]; P[i + 2] = F[i]; P[i + 3] = 255; }
    og.putImageData(O, 0, 0); scene.setMarks(m.id || room, out); paint(true);
  }
  // how old this room's print is: from the points in age.json, by the room's place in the story
  function ageHere() {
    if (window.SITTWorldState?.memory?.era !== 'earlier') return 0;   // MASTER: only the earlier story is an old print
    const W = window.SITTWorldState, rooms = (W.list?.memories || []).filter(e => /^x-/.test(e.folder)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(e => e.folder);
    const at = rooms.indexOf(W.folder), pts = cfg.points.map(p => ({ i: rooms.indexOf(p.room), a: p.age })).filter(p => p.i >= 0).sort((a, b) => a.i - b.i);
    if (at < 0 || !pts.length) return pts[0]?.a ?? 1;
    if (at <= pts[0].i) return pts[0].a;
    for (let k = 1; k < pts.length; k++) if (at <= pts[k].i) { const p = pts[k - 1], q = pts[k]; return p.a + (q.a - p.a) * (at - p.i) / Math.max(1, q.i - p.i); }
    return pts[pts.length - 1].a;
  }
  function paint(now, ms) {
    if (!sheets) return;
    age = ageHere();
    const f = k => on ? Math.min(1, Math.max(0, age * A()[k])) : 0;
    for (const s of Object.values(sheets)) s.style.transitionDuration = ms != null ? ms + 'ms' : now ? '.2s' : '';
    sheets.paper.style.opacity = f('tone');
    sheets.lift.style.opacity = f('fade');
    sheets.grain.style.opacity = on ? Math.min(1, Math.max(0, age * A().grain * (cfg.grain ?? .035))) : 0;
    const SC = window.SITTWorldState?.scene; if (SC?.settings) { SC.settings.marksOn = on ? Math.min(1, age) : 0; SC.changed?.(); }   // the marks live in the picture (the engine draws them)
    for (const k in shown) shown[k].t.textContent = shown[k].name + ' ' + (on ? amt[k].toFixed(2) : 'off');
  }
  async function boot() {
    cfg = await (await fetch('age.json', { cache: 'no-store' })).json();
    Object.assign(amt, cfg.amounts || {});
    while (!window.SITTWorldState?.memory) await new Promise(r => setTimeout(r, 50));
    await new Promise(r => setTimeout(r, 0));   // after the window frame has moved the picture into it
    build(); paint(true); drawMarks();
    addEventListener('sitt:memory', () => setTimeout(() => { paint(false); drawMarks(); }, 0));
  }
  // for a passage that must look like one old photo set: its own amounts while it plays, then back to the sliders
  window.SITTAge = {
    set(amounts, ms = 300) { over = { ...amt, ...amounts }; paint(false, ms); drawMarks(true); },
    clear(ms = 3000) { over = null; paint(false, ms); drawMarks(true); }
  };
  boot().catch(e => console.error('age', e));
})();

/* SITT STORYTELLING TEST · soundscapes by passage.
 * Only runs when the address has &sound=1. Nothing else in the engine changes.
 *
 * The rooms are grouped into emotional passages (story/soundscape.json). Each passage has one soundscape file.
 *  - Moving between rooms inside a passage leaves the sound running, wherever it is in its loop.
 *  - Crossing into another passage fades the old soundscape out and the new one in, over the same time (fade).
 *  - A room in no passage fades to silence.
 *  - Going back into a passage while its sound is still fading out brings that same sound back up from where it is.
 *  - The first time a soundscape starts it plays from its beginning (its own soft intro). After that it loops
 *    only its body: the part after its fade-in and before its fade-out, found from the file itself. Each repeat
 *    starts before the last one ends and the two cross (seam), so there is no gap, click or dip.
 * Files are read live from pre_lab_hostory/SoundScape (the test server's /soundscape/ address).
 * Browsers only allow sound after a click or a key, so the first click or key anywhere starts it.
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.get('sound') === '0') return;   // MASTER: on by default (the earlier story's passages; the later story's rooms are in none, so it falls silent there), ?sound=0 off
  const fading = new Map();
  let cfg = null, ctx = null, master = null, cur = null, muted = false, live = false, label = null;
  const cache = new Map();
  const audio = () => ctx || (ctx = (window.SITTSound?.context?.() || new (window.AudioContext || window.webkitAudioContext)()));

  /* where the file reaches its steady level, and where it starts fading out (within 6 dB of its typical level) */
  function body(buf) {
    const d = buf.getChannelData(0), sr = buf.sampleRate, w = Math.round(sr * .25), n = Math.floor(d.length / w), r = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0, k = 0; for (let j = i * w; j < (i + 1) * w; j += 4) { s += d[j] * d[j]; k++; } r[i] = Math.sqrt(s / k); }
    const typical = [...r].sort((a, b) => a - b)[n >> 1], floor = typical * .5;
    let a = 0; while (a < n && r[a] < floor) a++;
    let b = n - 1; while (b > a && r[b] < floor) b--;
    return { start: a * w / sr, end: (b + 1) * w / sr };
  }
  function load(file) {
    if (!cache.has(file)) cache.set(file, fetch('audio/soundscape/' + encodeURIComponent(file), { cache: 'no-store' })
      .then(r => { if (!r.ok) throw Error(file + ' ' + r.status); return r.arrayBuffer(); })
      .then(b => audio().decodeAudioData(b)).then(buf => ({ buf, ...body(buf) })));
    return cache.get(file);
  }
  // equal-power curves: two unrelated textures crossing keep the same loudness through the cross
  const curve = up => { const n = 64, c = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / (n - 1); c[i] = up ? Math.sin(t * Math.PI / 2) : Math.cos(t * Math.PI / 2); } return c; };
  const UP = curve(true), DOWN = curve(false);

  function bed(p) {
    const c = audio(), out = c.createGain(), X = cfg.seam ?? 3;
    out.gain.value = 0; out.connect(master);
    let on = true, info = null, next = 0, timer = 0, first = true; const srcs = new Set();
    function piece(at) {
      const from = first ? 0 : info.start, to = info.end, len = to - from, x = Math.min(X, (info.end - info.start) / 3);
      const s = c.createBufferSource(), g = c.createGain(); s.buffer = info.buf; s.connect(g); g.connect(out);
      if (first) g.gain.setValueAtTime(1, at); else g.gain.setValueCurveAtTime(UP, at, x);
      g.gain.setValueCurveAtTime(DOWN, at + len - x, x);
      s.start(at, from, len); srcs.add(s); s.onended = () => srcs.delete(s);
      first = false; next = at + len - x;
    }
    function pump() { if (!on) return; while (next - c.currentTime < 6) piece(Math.max(next, c.currentTime + .05)); timer = setTimeout(pump, 1000); }
    let end = 0;
    // move the level from wherever it is now (even mid-fade) to v, over sec: no jump
    function ramp(v, sec) { const t = c.currentTime, g = out.gain; if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t); else { const now = g.value; g.cancelScheduledValues(t); g.setValueAtTime(now, t); } g.linearRampToValueAtTime(v, t + sec); }
    const b = {
      p,
      async start(fade) {
        info = await load(p.file); if (!on) return;
        ramp(p.volume ?? 1, fade);
        next = c.currentTime + .05; pump();
      },
      stop(fade) {
        on = false; clearTimeout(timer); ramp(0, fade);
        clearTimeout(end); end = setTimeout(() => { for (const s of srcs) { try { s.stop(); } catch {} } out.disconnect(); b.gone = true; }, fade * 1000 + 200);
      },
      // back into this passage while it is still fading out: bring the same sound back up, from where it is
      revive(fade) { if (b.gone || !info) return false; clearTimeout(end); on = true; ramp(p.volume ?? 1, fade); pump(); return true; }
    };
    return b;
  }

  const passageOf = folder => cfg.passages.find(p => p.rooms.includes(folder)) || null;
  function show() { if (label) label.textContent = (muted ? '♪ off' : '♪ ') + (muted ? '' : (cur ? cur.p.name : live ? 'silence' : 'click to start sound')); }
  function update() {
    if (!live) { show(); return; }
    const W = window.SITTWorldState, p = passageOf(W?.folder), fade = cfg.fade ?? 6;
    if (cur && p && cur.p === p) return;   // same passage: the sound keeps running
    const from = !!cur;
    if (cur) { cur.stop(fade); fading.set(cur.p, cur); cur = null; }
    if (p) {
      const old = fading.get(p); fading.delete(p);
      if (old && old.revive(fade)) cur = old;   // came straight back: the same sound rises again, no restart
      else { cur = bed(p); cur.start(from ? fade : (cfg.firstFade ?? 2)).catch(e => console.error('soundscape', e)); }
    }
    for (const [k, v] of fading) if (v.gone) fading.delete(k);
    show();
  }
  async function go() {
    if (live) return;
    try { await audio().resume(); } catch {}
    if (audio().state !== 'running') return;
    live = true; removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true); update();
  }
  function bar() {
    const css = document.createElement('style');
    css.textContent = `.xsnd{position:fixed;right:8px;bottom:8px;z-index:99999;opacity:.18;transition:opacity .2s;font:12px/1 system-ui,sans-serif}
.xsnd:hover{opacity:.9}.xsnd button{background:rgba(0,0,0,.55);color:#eee;border:1px solid rgba(255,255,255,.25);border-radius:4px;padding:3px 7px;font:inherit;cursor:pointer}`;
    document.head.appendChild(css);
    const box = document.createElement('div'); box.className = 'xsnd';
    label = document.createElement('button'); label.title = 'Soundscape: click to mute or unmute (M)';
    box.appendChild(label); document.body.appendChild(box);
    for (const ev of ['pointerdown', 'pointerup', 'click', 'wheel', 'touchstart', 'touchmove']) box.addEventListener(ev, e => e.stopPropagation());
    const mute = () => { if (!live) { go(); return; } muted = !muted; const t = audio().currentTime, g = master.gain; if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t); else { const now = g.value; g.cancelScheduledValues(t); g.setValueAtTime(now, t); } g.linearRampToValueAtTime(muted ? 0 : (cfg.volume ?? 1), t + .6); show(); };
    label.addEventListener('click', mute);
    addEventListener('keydown', e => { if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); mute(); } });
    show();
  }
  async function boot() {
    cfg = await (await fetch('soundscape.json', { cache: 'no-store' })).json();
    while (!window.SITTWorldState?.memory) await new Promise(r => setTimeout(r, 50));
    master = audio().createGain(); master.gain.value = cfg.volume ?? 1; master.connect(audio().destination);
    for (const p of cfg.passages) load(p.file).catch(e => console.error('soundscape', e));   // decode them all ahead, so a change never waits
    bar();
    addEventListener('sitt:memory', () => setTimeout(update, 0));
    addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
    go();
  }
  boot().catch(e => console.error('soundscape', e));
})();

/* SITT_STORY_TESTING · the test bar (top left).
 * - Jump to any scene at once (every memory, hidden ones too), and to any shot in it.
 * - Jump by the FinalPNGsForTesting folder you have open in Photoshop, which is usually what you
 *   are actually looking for. One folder over several scenes shows as _1, _2 ... in story order.
 *   ?png=00_lab_construction in the address bar does the same.
 * - Reload the pictures of the open scene (button, or R in the studio).
 * - Live reload: when you save a PNG in FinalPNGsForTesting (or a memory.json changes), the open scene
 *   reloads its pictures by itself, without losing your place.
 * - Shows how many of the open scene's pictures come straight from your PNGs.
 * Only on the testing server; it does nothing on the live site.
 */
(() => {
 'use strict';
 if (!/^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname)) return;
 const W = () => window.SITTWorldState;
 const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
 const bar = document.createElement('div'); bar.className = 'test-bar'; document.body.appendChild(bar);
 let folded = false; try { folded = localStorage.getItem('sitt-test-bar-folded') === '1'; } catch {}
 let uses = { folder: null, stems: [], fromPng: 0, total: 0, missing: [], ambiguous: [] }, info = { png: true, pngCount: 0 }, lastReload = '', live = 'connecting';
 let pngDirs = { folders: [], unused: [] };

 async function loadInfo() { try { info = await (await fetch('/__test/info', { cache: 'no-store' })).json(); } catch {} }
 async function loadPngDirs() { try { pngDirs = await (await fetch('/__test/pngfolders', { cache: 'no-store' })).json(); } catch {} }
 // what the browser is actually drawing: pictures on the graphics card, any that failed (and why), and a lost graphics context
 let glLost = false;
 setTimeout(function hook() { const c = document.querySelector('canvas'); if (!c) return setTimeout(hook, 300); c.addEventListener('webglcontextlost', () => { glLost = true; render(); }); c.addEventListener('webglcontextrestored', () => { glLost = false; render(); }); }, 0);
 function drawNote() {
  const cur = W()?.scene?.current?.(); if (glLost) return '<p class="warn"><b>The browser dropped the graphics (WebGL context lost): nothing can be drawn. Press F5.</b></p>';
  if (!cur?.strip) return '';
  const ls = cur.layers, ready = ls.filter(l => l.state === 'ready').length, failed = ls.filter(l => l.state === 'failed');
  return '<p class="small">On screen: ' + ready + ' of ' + ls.length + ' layers loaded (the rest load as you get near them)' + (failed.length ? '</p><p class="warn">' + failed.length + ' failed to load:<br>' + failed.slice(0, 6).map(l => esc(l.layer.image + ': ' + (l.note || 'unknown error'))).join('<br>') : '') + '</p>';
 }
 async function loadUses() {
  const w = W(); if (!w?.folder) return;
  try { uses = await (await fetch('/__test/uses?folder=' + encodeURIComponent(w.folder), { cache: 'no-store' })).json(); } catch {}
  render();
 }
 function memOptions() {
  const w = W(); const L = w?.list?.memories || [];
  const vis = L.filter(x => !x.hidden), hid = L.filter(x => x.hidden);
  const opt = x => `<option value="${esc(x.folder)}" ${x.folder === w?.folder ? 'selected' : ''}>${esc(x.folder)}</option>`;
  return `<optgroup label="In the story">${vis.map(opt).join('')}</optgroup>${hid.length ? `<optgroup label="Hidden / parts / stand-ins">${hid.map(opt).join('')}</optgroup>` : ''}`;
 }
 /* the folder you have open in Photoshop, as the way in: the scene it feeds is one pick away */
 function pngDirOptions() {
  const w = W(), want = new URL(location.href).searchParams.get('png');
  const here = pngDirs.folders.filter(f => f.folder === w?.folder);
  // the folder the shot on screen draws from (most of its pictures), so it follows you through a sequence
  const tops = {}; for (const [l] of (w?.shotLayers?.() || [])) for (const n of [l.image]) { const x = uses.files?.find(u => u.folder === (l.folder || w.folder) && u.name === n); const t = x?.path?.startsWith('FinalPNGsForTesting/') ? x.path.split('/')[1] : null; if (t) tops[t] = (tops[t] || 0) + (l.role === 'top' || /side fill/.test(l.name || '') ? 1 : 2); }   // the main picture (background, mid) counts most
  const top = Object.entries(tops).sort((a, b) => b[1] - a[1])[0]?.[0];
  const sel = (top && here.find(f => f.top === top)) || here.find(f => f.label === want) || here[0];
  const opt = f => `<option value="${esc(f.label)}" ${f === sel ? 'selected' : ''}>${esc(f.label)} · ${f.pictures} pic${f.pictures > 1 ? 's' : ''}${f.hidden ? ' · hidden' : ''}</option>`;
  const idle = pngDirs.unused.length
   ? `<optgroup label="No scene draws from these yet">${pngDirs.unused.map(t => `<option disabled>${esc(t)}</option>`).join('')}</optgroup>` : '';
  return `<option value="" ${sel ? '' : 'selected'}>— pick a PNG folder —</option>${pngDirs.folders.map(opt).join('')}${idle}`;
 }
 function stopOptions() {
  const w = W(); if (!w?.memory || !w.stops) return '';
  const st = w.stops(w.memory), cur = Math.round(w.track?.s ?? 0);
  return st.map((p, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${i + 1}${p.name ? ' · ' + esc(p.name) : ''}</option>`).join('');
 }
 function render() {
  const w = W();
  if (folded) { bar.innerHTML = `<button data-a="unfold" title="Show the test bar">TEST ▸</button>`; return; }
  const pngNote = !info.png ? '<b class="off">PNGs OFF (showing the copied WebPs)</b>'
   : `${uses.fromPng}/${uses.total} pictures from your PNGs${uses.missing.length ? ` · <span class="warn" title="${esc(uses.missing.join('\n'))}">${uses.missing.length} not found as PNG (using the copy)</span>` : ''}${uses.ambiguous.length ? ` · <span class="warn" title="${esc(uses.ambiguous.join('\n'))}">${uses.ambiguous.length} ambiguous</span>` : ''}`;
  bar.innerHTML = `
   <div class="row"><strong>TEST</strong>
    <span class="dot ${live}" title="Live reload: ${live}"></span>
    <a href="/__test/" target="_blank" title="Every scene, and where each picture comes from">scenes &amp; files</a>
    <button data-a="fold" title="Tuck the test bar away">◂</button></div>
   <label>PNG folder <select data-a="pngdir">${pngDirOptions()}</select></label>
   <label>Scene <select data-a="mem">${memOptions()}</select></label>
   <label>Shot <select data-a="stop">${stopOptions()}</select></label>
   <div class="row"><button data-a="reload">Reload pictures</button>
    <button data-a="png">${info.png ? 'Turn PNGs off' : 'Turn PNGs on'}</button></div>
   <p>${pngNote}</p>${drawNote()}
   <p class="small">${lastReload ? 'Last reload ' + esc(lastReload) + ' · ' : ''}Save a PNG and this scene reloads itself.</p>`;
 }
 async function reload(why) {
  const w = W(); if (!w?.memory) return;
  try {
   if (w.studioReload) await w.studioReload();
   else if (!(await w.rejoin?.())) { await w.scene.reload(w.memory, { folder: w.folder, set: w.set, source: w.source }); w.refresh?.(); }   // a joined strip is made again (sizes may have changed)
   lastReload = new Date().toLocaleTimeString() + (why ? ' (' + why + ')' : '');
  } catch (e) { lastReload = 'failed: ' + e.message; }
  loadUses();
 }
 async function jump(folder, pngLabel, stop) {
  const w = W(); if (!w) return;
  if (folder === w.folder && !pngLabel) return;   // as before: picking the scene you are already on does nothing
  if (folder !== w.folder) { try { await w.open(folder); } catch (e) { lastReload = 'could not open: ' + e.message; } }
  if (Number.isFinite(stop) && w.goStop) w.goStop(stop);   // a PNG folder inside a joined strip: straight to its shot
  const u = new URL(location.href); u.searchParams.set('memory', folder); u.searchParams.delete('stop');
  if (pngLabel) u.searchParams.set('png', pngLabel); else u.searchParams.delete('png');
  history.replaceState(null, '', u);
  loadUses();
 }
 /* ?png=00_lab_construction (or ..._2) opens the scene that folder feeds, straight from the address bar */
 async function openPngParam() {
  const want = new URL(location.href).searchParams.get('png'); if (!want) return;
  const low = want.toLowerCase();
  const f = pngDirs.folders.find(x => x.label.toLowerCase() === low) || pngDirs.folders.find(x => x.top.toLowerCase() === low);
  if (!f) { lastReload = 'no scene draws from "' + want + '"'; return; }
  if (f.folder !== W()?.folder || Number.isFinite(f.stop)) await jump(f.folder, f.label, f.stop);
 }
 bar.addEventListener('change', e => {
  const a = e.target.dataset.a;
  if (a === 'mem') jump(e.target.value);
  else if (a === 'pngdir') { const f = pngDirs.folders.find(x => x.label === e.target.value); if (f) jump(f.folder, f.label, f.stop); else render(); }
  else if (a === 'stop') { const w = W(); w?.goStop?.(+e.target.value); const u = new URL(location.href); u.searchParams.set('stop', e.target.value); history.replaceState(null, '', u); }
 });
 bar.addEventListener('click', async e => {
  const a = e.target.dataset?.a; if (!a) return;
  if (a === 'reload') reload('button');
  else if (a === 'png') { await fetch('/__test/png?on=' + (info.png ? 0 : 1), { method: 'POST' }); await loadInfo(); reload(info.png ? 'PNGs on' : 'PNGs off'); }
  else if (a === 'fold' || a === 'unfold') { folded = a === 'fold'; try { localStorage.setItem('sitt-test-bar-folded', folded ? '1' : '0'); } catch {} render(); }
 });
 // keep the bar in step with the story
 addEventListener('sitt:memory', () => {
  const u = new URL(location.href), f = W()?.folder;
  if (f) {
   u.searchParams.set('memory', f);
   const p = u.searchParams.get('png');   // the story moved on by itself: a PNG folder from before is stale
   if (p && !pngDirs.folders.some(x => x.label === p && x.folder === f)) u.searchParams.delete('png');
   history.replaceState(null, '', u);
  }
  loadUses();
 });
 let drawSig = '';
 setInterval(() => { const w0 = W(), t0 = w0?.track; if (!t0 || Math.abs(t0.s - Math.round(t0.s)) > .01 || Math.abs((t0.goal ?? t0.s) - t0.s) > .01 || w0.scene?.busy?.()) return;   // never while the view is moving
  if (!bar.contains(document.activeElement)) { const s = bar.querySelector('[data-a=stop]'); const w = W(); const ls = w?.scene?.current?.()?.layers || [], sig = ls.filter(l => l.state === 'ready').length + '/' + ls.filter(l => l.state === 'failed').length; if ((s && w?.track && +s.value !== Math.round(w.track.s)) || sig !== drawSig) { drawSig = sig; render(); } } }, 700);

 // live reload: the server says which PNGs / memory.json files changed
 let pending = new Set(), t = null;
 function connect() {
  const es = new EventSource('/__test/events');
  es.onopen = () => { live = 'on'; render(); };
  es.onerror = () => { live = 'off'; render(); };
  es.addEventListener('changed', ev => {
   let d = {}; try { d = JSON.parse(ev.data); } catch {}
   loadPngDirs().then(() => { if (!bar.contains(document.activeElement)) render(); });   // a saved PNG can wire up a folder nothing used
   const w = W(); if (!w?.folder) return;
   const mine = new Set(uses.stems.map(s => s.toLowerCase()));
   const hit = (d.stems || []).some(s => mine.has(s.toLowerCase())) || d.all;   // memory.json saves (the studio's own) do not reload
   if (!hit) return;
   (d.stems || []).forEach(s => pending.add(s));
   clearTimeout(t); t = setTimeout(() => { const n = pending.size; pending.clear(); reload(n + ' file' + (n > 1 ? 's' : '') + ' saved'); }, 250);
  });
 }
 const ready = setInterval(() => { if (W()?.memory && W()?.list) { clearInterval(ready); Promise.all([loadInfo(), loadPngDirs()]).then(openPngParam).then(loadUses); connect(); render(); } }, 200);
 render();
})();

/* SITT · a performance readout (18 Nov 2026), only with ?perf=1 in the address: frames per second, the longest frames,
 * how many frames froze, the graphics chip the browser is using, and how many pixels the picture is drawn at.
 * For testing on a laptop or phone; it changes nothing else. */
(() => {
 'use strict';
 const el = document.createElement('div');
 el.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99999;font:12px/1.35 monospace;color:#0f0;background:rgba(0,0,0,.75);padding:6px 8px;border-radius:4px;pointer-events:none;white-space:pre';
 const gpu = (() => { try { const g = document.createElement('canvas').getContext('webgl'), x = g.getExtension('WEBGL_debug_renderer_info'); return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); } catch { return '?'; } })();
 let last = performance.now(), times = [], longs = 0, worst = 0, t0 = last;
 // the engine's own pictures (not the browser's refreshes): how many a second, the script time of each, and once a second
 // how long the graphics chip takes to finish one (a 1-pixel read waits for it); plus the phone's tilt readings a second
 let draws = 0, js = [], tilts = 0, gpuMs = 0, ask = false; const px = new Uint8Array(4);
 window.SITTPerf = { gpu(ms) { gpuMs = ms; }, draw(n, g) { draws++; const t = performance.now(); js.push(t - n);
  if (ask && g) { ask = false; g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, px); gpuMs = performance.now() - t; } } };
 addEventListener('deviceorientation', () => tilts++);
 const frame = n => { const d = n - last; last = n; times.push(d); if (d > 50) longs++; if (d > worst) worst = d; requestAnimationFrame(frame); };
 requestAnimationFrame(frame);
 setInterval(() => {
  if (!el.isConnected && document.body) document.body.appendChild(el);
  const s = times.slice().sort((a, b) => a - b), n = s.length || 1, fps = 1000 / (s[Math.floor(n / 2)] || 16.7);
  const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  el.textContent = `fps ${fps.toFixed(0)}   slowest 10% ${(s[Math.floor(n * .9)] || 0).toFixed(0)} ms   worst ${worst.toFixed(0)} ms\n` +
   `pictures drawn ${draws}/s   script ${(js.reduce((x, y) => x + y, 0) / (js.length || 1)).toFixed(1)} ms   graphics chip ${gpuMs.toFixed(0)} ms (${window.SITTGLMode || ''})   tilt ${tilts}/s
` +
   `freezes (>50 ms) ${longs} in ${((performance.now() - t0) / 1000).toFixed(0)} s\n` +
   `drawn ${c ? c.width + 'x' + c.height : '?'}  screen ${innerWidth}x${innerHeight} x${devicePixelRatio}\n` +
   `gpu ${gpu}`;
  times = []; worst = 0; draws = 0; js = []; tilts = 0; ask = true;
 }, 1000);
})();

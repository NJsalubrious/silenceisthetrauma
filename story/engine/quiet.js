/* SITT STORYTELLING TEST · the pool, quiet. Only runs when the address has &seq=quiet. Nothing else changes.
 *
 * The opposite of everything tried before: nothing is added to the pictures, nothing moves on its own, and the
 * visitor keeps walking at their own pace (story/sequence-quiet.json).
 *  - From the swipe on from 013 there is no sound at all.
 *  - The pictures darken a little, slowly, as the visitor goes on: a dimming they may not notice until it is there.
 *  - 014b is there only for a split second. Swiping on from 014, it flashes, a little darker than the rest, and is
 *    gone, and the visitor is at 015. Coming back from 015, the same, the other way. No crossing in or out of it:
 *    the mind does not let it stay.
 *  - Back at 013, or on past 016, the dimming lifts, slowly.
 */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  if (Q.get('seq') !== 'quiet') return;
  let cfg = null, shade = null, flashing = false, cameFrom = null;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const W = () => window.SITTWorldState;

  // 014b comes in and goes out with no crossing at all (set here while this test runs; the files are untouched)
  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, o) => {
    const r = await realFetch(url, o), u = String(url?.url || url);
    if (!cfg || !new RegExp('/' + cfg.flash.room + '/memory\\.json').test(u)) return r;
    try { const m = await r.clone().json(); m.cut = { ...(m.cut || {}), style: 'depth', duration: cfg.flash.inMs ?? 40 };
      return new Response(JSON.stringify(m), { status: 200, headers: { 'Content-Type': 'application/json' } }); } catch { return r; }
  };

  function dim(v, ms) {
    if (!shade) { const host = document.querySelector('.xwin') || document.querySelector('.world'); shade = document.createElement('div');
      shade.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none'; const c = document.getElementById('stage'); c.after(shade); }
    shade.style.transition = ms ? `opacity ${ms}ms ease-in-out` : 'none'; shade.style.opacity = v;
  }
  const ready = room => { const w = W(); return w.load(room).then(m => w.scene.preload(m, { folder: room, set: w.set, source: w.source })).catch(() => {}); };

  async function flash(back) {   // there for a split second, then gone
    flashing = true; const w = W(), F = cfg.flash; w.lock = true;
    dim(F.dark ?? .3, 0);
    await wait(F.ms ?? 300);
    const to = back ? F.before : F.after;
    await w.go(to, { sharp: true });
    dim(cfg.dark[to] ?? 0, 0);
    w.lock = false; flashing = false;
  }

  async function boot() {
    cfg = await (await realFetch('sequence-quiet.json', { cache: 'no-store' })).json();
    while (!W()?.memory) await new Promise(r => setTimeout(r, 50));
    let last = W().folder;
    addEventListener('sitt:memory', e => {
      const now = e.detail?.folder, before = last; last = now;
      if (flashing) return;
      if (now === cfg.flash.before || now === cfg.flash.after) ready(cfg.flash.room);   // the flash never waits for its picture
      if (now === cfg.flash.room) { const back = before === cfg.flash.after; ready(back ? cfg.flash.before : cfg.flash.after); setTimeout(() => flash(back), 0); return; }
      dim(cfg.dark[now] ?? 0, cfg.dimMs ?? 3500);
    });
    if (cfg.dark[last] != null) dim(cfg.dark[last], 0);
  }
  boot().catch(e => console.error('quiet', e));
})();

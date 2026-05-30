/**
 * generate_song_pages.mjs
 * ADDITIVE song throughput pages for SEO + video detection.
 *
 * For each song in zones/ethel_gallery/ethel_lyrics_data.js it emits a standalone
 * /songs/<slug>.html that:
 *   - reuses the ethel_gallery <head> CSS verbatim (identical look)
 *   - renders the cover, a STATIC youtube-nocookie embed, the description/story
 *     and the full lyrics as crawlable text (lyrics become searchable)
 *   - injects VideoObject + MusicRecording JSON-LD with a real YouTube uploadDate
 *   - has a top-right "More Songs" button -> /zones/ethel_gallery/
 *
 * Touches nothing existing. Run with:  node scripts/generate_song_pages.mjs [--limit N] [--no-fetch]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const GALLERY = join(REPO, 'zones', 'ethel_gallery', 'index.html');
const DATA = join(REPO, 'zones', 'ethel_gallery', 'ethel_lyrics_data.js');
const OUT_DIR = join(REPO, 'songs');
const ORIGIN = 'https://silenceisthetrauma.com';
const IMG_ABS = `${ORIGIN}/library/media_covers_song/`;

const argv = process.argv.slice(2);
const LIMIT = argv.includes('--limit') ? parseInt(argv[argv.indexOf('--limit') + 1], 10) : Infinity;
const NO_FETCH = argv.includes('--no-fetch');

// ---- helpers ----
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const slugify = (s) => String(s).toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ---- load song data (eval the JS data file safely in a function scope) ----
const dataSrc = readFileSync(DATA, 'utf8'); // data file is UTF-8 (gallery html is CP-1252, this is not)
const ARCHIVE_DATA = new Function(`${dataSrc}\n; return (typeof ARCHIVE_DATA!=='undefined')?ARCHIVE_DATA:[];`)();

// ---- extract the gallery's big <style> block + header for identical look ----
const galleryHtml = readFileSync(GALLERY, 'latin1');
const styleBlock = (galleryHtml.match(/<style>[\s\S]*?<\/style>/) || [''])[0];

// real YouTube uploadDate
async function ytDate(videoId) {
  if (NO_FETCH || !videoId) return null;
  try {
    const r = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'CONSENT=YES+1; SOCS=CAISEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg'
      }
    });
    const t = await r.text();
    const m = t.match(/"uploadDate":"([^"]+)"/) || t.match(/itemprop="datePublished"[^>]*content="([^"]+)"/) || t.match(/"publishDate":"([^"]+)"/);
    return m ? m[1].slice(0, 10) : null;
  } catch { return null; }
}

// PRIMARY lyrics source: zones/ethel_gallery/song_content.txt  (the "songs" file; .js is "descriptions")
// Format per song:  === SONG <n>: <title> ===  ... --- LYRICS --- <lyrics until next "=== SONG">
const SONG_CONTENT = join(REPO, 'zones', 'ethel_gallery', 'song_content.txt');
const SC_LYRICS = {}; // keyed by song number (id)
if (existsSync(SONG_CONTENT)) {
  const raw = readFileSync(SONG_CONTENT, 'utf8');
  const parts = raw.split(/^=== SONG (\d+):[^\n]*$/m); // [pre, "1", block1, "2", block2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const num = parseInt(parts[i], 10);
    const block = parts[i + 1] || '';
    const seg = block.split(/^--- LYRICS ---\s*$/m);
    const lyr = (seg.length > 1 ? seg[1] : '').replace(/\r/g, '').trim();
    if (lyr) SC_LYRICS[num] = lyr;
  }
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')); // tolerate BOM

// optional additive override file (for any songs not in song_content.txt): { "<videoId>": "lyrics", ... }
const LYRICS_FILE = join(REPO, 'scripts', 'songs_lyrics.json');
let LYRICS_OVERRIDE = {};
if (existsSync(LYRICS_FILE)) { try { LYRICS_OVERRIDE = readJson(LYRICS_FILE); } catch {} }

const lyricsFor = (song) => (SC_LYRICS[song.id] || LYRICS_OVERRIDE[song.videoId] || song.lyrics || '');

// pre-fetched YouTube upload dates (PowerShell writes this; Node fetch is TLS-blocked in this env)
const DATES_FILE = join(REPO, 'scripts', 'songs_dates.json');
let DATES = {};
if (existsSync(DATES_FILE)) { try { DATES = readJson(DATES_FILE); } catch {} }

// per-song canon-grounded SEO metadata: { "<slug>": { title, description, keywords:[...] } }
const SEO_FILE = join(REPO, 'sitt_song_seo.json');
let SEO_META = {};
if (existsSync(SEO_FILE)) { try { SEO_META = readJson(SEO_FILE); } catch {} }

// additive extra songs (spoken-word etc.) with explicit slug + img
const EXTRA_FILE = join(REPO, 'scripts', 'extra_songs.json');
let EXTRA = [];
if (existsSync(EXTRA_FILE)) { try { EXTRA = readJson(EXTRA_FILE); } catch {} }
const ALL_SONGS = ARCHIVE_DATA.filter(s => s && s.title).concat(EXTRA);

// Map each song slug -> its (character-renamed) cover file in songs/covers/, cover-centric longest-slug match.
const COVERS_DIR = join(OUT_DIR, 'covers');
const COVER_BY_SLUG = {};
{
  const allSlugs = ALL_SONGS.map(s => s.slug || slugify(s.title)).filter(Boolean);
  const normf = (f) => f.toLowerCase().replace(/\.(jpe?g|png|webp)$/, '').replace(/_+/g, '-').replace(/-+/g, '-');
  const files = existsSync(COVERS_DIR) ? readdirSync(COVERS_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f)) : [];
  for (const f of files) {
    const n = normf(f);
    const cand = allSlugs.filter(sl => n === sl || n.endsWith('-' + sl)).sort((a, b) => b.length - a.length)[0];
    if (cand && !COVER_BY_SLUG[cand]) COVER_BY_SLUG[cand] = f;
  }
}

// Page slug is derived from the cover filename (lowercased) so the URL matches the cover name,
// e.g. cover "Dominic-Ryker-Hero-complex.jpg" -> /songs/dominic-ryker-hero-complex
function resolveCover(song) {
  const matchKey = song.slug || slugify(song.title);
  const coverFile = (song.img && existsSync(join(COVERS_DIR, song.img))) ? song.img : COVER_BY_SLUG[matchKey];
  const slug = coverFile ? coverFile.replace(/\.[^.]+$/, '').toLowerCase() : matchKey;
  return { coverFile, slug };
}

const titleColor = (artist) => artist === 'Isla' ? 'text-pink-500' : artist === 'Dominic' ? 'text-blue-500' : 'text-white';

function storyHtml(story = '') {
  return String(story).split('\n').filter(p => p.trim()).map(p => `<p>${esc(p)}</p>`).join('\n');
}
function lyricsHtml(lyrics = '') {
  const txt = String(lyrics || '').trim();
  if (!txt) return '<div class="lyric-line opacity-30">[NO AUDIO TRANSCRIPT AVAILABLE]</div>';
  return txt.split('\n').map(line => line.trim()
    ? `<div class="lyric-line">${esc(line)}</div>`
    : `<div class="lyric-line empty-line"></div>`).join('\n');
}

function page(song, uploadDate) {
  const { title, artist = 'Ethel', date = '', subtitle = '', videoId = '', img = '', story = '' } = song;
  const lyrics = lyricsFor(song);
  const { coverFile, slug } = resolveCover(song);
  const url = `${ORIGIN}/songs/${slug}`;
  let cover = '', coverAbs = '';
  if (coverFile) {
    const enc = encodeURIComponent(coverFile);
    cover = `covers/${enc}`;
    coverAbs = `${ORIGIN}/songs/covers/${enc}`;
  } else if (img) {
    const imgEnc = encodeURIComponent(img);
    cover = `../library/media_covers_song/${imgEnc}`;
    coverAbs = IMG_ABS + imgEnc;
  }
  const thumb = coverAbs || (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '');
  const lyricSnippet = String(lyrics || story || '').split('\n').filter(l => l.trim()).slice(0, 2).join(' ').slice(0, 160);
  const autoDesc = `${title} by ${artist}: lyrics, video and story. ${subtitle || ''} ${lyricSnippet}`.replace(/\s+/g, ' ').trim().slice(0, 300);
  // canon-grounded SEO metadata (per-slug) overrides the auto values
  const meta = SEO_META[slug] || {};
  const pageTitle = meta.title || `${title}: ${artist} Lyrics and Video | Silence Is The Trauma`;
  const desc = meta.description || autoDesc;
  const keywordsStr = Array.isArray(meta.keywords) ? meta.keywords.join(', ') : '';

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MusicRecording', name: title,
        byArtist: { '@type': 'MusicGroup', name: artist },
        url, ...(uploadDate ? { datePublished: uploadDate } : {}),
        isPartOf: { '@type': 'CreativeWorkSeries', name: 'Silence Is The Trauma', url: ORIGIN + '/' },
        ...(videoId ? { recordingOf: { '@type': 'MusicComposition', name: title } } : {})
      },
      ...(videoId ? [{
        '@type': 'VideoObject', name: `${title} — ${artist}`,
        description: desc, thumbnailUrl: thumb,
        ...(uploadDate ? { uploadDate } : {}),
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
        isFamilyFriendly: true
      }] : [])
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(desc)}">
    ${keywordsStr ? `<meta name="keywords" content="${esc(keywordsStr)}">` : ''}
    <link rel="canonical" href="${url}">
    <meta name="classification" content="Fiction, Satire, Art Installation">
    <meta name="author" content="Silence Is The Trauma">
    <meta name="genre" content="Concept Album">
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(pageTitle)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:image" content="${esc(thumb)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(pageTitle)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${esc(thumb)}">

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-34H8LS884F"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-34H8LS884F');
    </script>

    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0" />

    ${styleBlock}

    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
</head>

<body class="ethel-mode transition-colors duration-500">
    <div class="scanlines"></div>
    <div class="crt-flicker"></div>

    <!-- HEADER (branding left, More Songs right) -->
    <header class="fixed top-0 w-full z-40 bg-black/90 border-b border-white/10 backdrop-blur-md">
        <div class="container mx-auto px-4 py-3 flex flex-wrap gap-y-2 justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#00ff41]"></div>
                <h1 class="text-xl md:text-2xl font-bold tracking-widest font-tech text-white flex items-center gap-2">
                    <div class="brand-dropdown-container">
                        <button onclick="toggleBrandMenu(event)" class="brand-trigger text-left" style="background:none;border:none;cursor:pointer;text-decoration:none;padding:0;">
                            <span class="ps-brand glitch-text" data-text="PIXELSTORTION" style="position:relative;top:0;left:0;">PIXELSTORTION</span>
                        </button>
                        <div id="brandDropdown" class="brand-dropdown-menu" onclick="event.stopPropagation()">
                            <a href="https://silenceisthetrauma.com/veX_social_network/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">veX: Social Network</a>
                            <a href="https://silenceisthetrauma.com/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">Silence is the trauma</a>
                            <a href="https://islaband.com/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">Isla</a>
                            <a href="https://ethelryker.com/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">Ethel Ryker</a>
                            <a href="https://dominicryker.com/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">Dominic Ryker</a>
                            <a href="https://pixelstortion.com/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">Nalani</a>
                            <a href="https://pixelstortion.com/bio/" class="brand-dropdown-item" style="border-bottom:1px solid #222;margin-bottom:4px;">BIO</a>
                        </div>
                    </div>
                    <span class="text-[10px] opacity-50 align-top mt-1 font-sans">ARCHIVE_V.9</span>
                </h1>
            </div>
            <a href="https://silenceisthetrauma.com/zones/ethel_gallery/"
               class="px-4 py-1 text-xs font-tech border border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest no-underline">
               More Songs &rsaquo;
            </a>
        </div>
    </header>

    <!-- MAIN: single song -->
    <main class="container mx-auto px-4 pt-24 pb-20 relative z-10 min-h-screen">
      <article class="w-full max-w-7xl mx-auto bg-[#0a0a0a] border border-white/10 flex flex-col md:flex-row shadow-2xl overflow-hidden">

        <!-- LEFT: video + cover + meta (pinned so it stays in view while lyrics scroll) -->
        <div class="w-full md:w-5/12 flex flex-col bg-black/40 border-r border-white/10 md:self-start md:sticky md:top-0">
            <div class="w-full aspect-video bg-black border-b border-white/10">
                ${videoId ? `<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${videoId}" title="${esc(title)} — ${esc(artist)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="origin" allowfullscreen></iframe>` : ''}
            </div>
            <div class="relative overflow-hidden flex flex-col p-6">
                ${cover ? `<div class="flex items-center justify-center relative">
                    <img src="${esc(cover)}" alt="${esc(title)} cover art" class="max-h-[200px] md:max-h-[300px] w-auto shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 z-10">
                </div>` : ''}
                <div class="mt-4 font-tech text-xs text-gray-400 space-y-1 z-10">
                    <div class="flex justify-between border-b border-white/5 pb-1"><span>FILE_ID</span><span class="text-white">${esc(String(song.id ?? '000'))}</span></div>
                    <div class="flex justify-between border-b border-white/5 pb-1"><span>TIMESTAMP</span><span class="text-white">${esc(date)}</span></div>
                    <div class="flex justify-between"><span>SUBJECT</span><span class="uppercase">${esc(artist)}</span></div>
                </div>
            </div>
        </div>

        <!-- RIGHT: title + description/story + lyrics -->
        <div class="w-full md:w-7/12 flex flex-col bg-[#0f0f0f]">
            <div class="p-6 md:p-8 border-b border-white/10">
                <h2 class="text-2xl md:text-4xl font-bold ${titleColor(artist)} font-tech uppercase leading-none tracking-tighter">${esc(title)}</h2>
                ${subtitle ? `<p class="text-[10px] md:text-xs text-gray-500 font-tech italic mt-1 tracking-wider opacity-70">${esc(subtitle)}</p>` : ''}
            </div>

            <div class="p-6 md:p-10 space-y-10">
                <section>
                    <h3 class="font-tech text-xs md:text-sm uppercase tracking-widest text-green-400 mb-4 border-b border-white/10 pb-2">Decoded Story</h3>
                    <div class="text-gray-300 font-light text-sm md:text-base leading-relaxed space-y-6">
                        ${storyHtml(story)}
                    </div>
                </section>

                <section>
                    <h3 class="font-tech text-xs md:text-sm uppercase tracking-widest text-green-400 mb-4 border-b border-white/10 pb-2">Audio Transcript — Lyrics</h3>
                    <div class="lyrics-container">
                        <div class="lyrics-scanline"></div>
                        <div class="lyrics-header text-center">[START_TRANSCRIPT]</div>
                        <div class="font-tech text-xs md:text-sm leading-loose text-center">
                            ${lyricsHtml(lyrics)}
                        </div>
                        <div class="lyrics-footer text-center">[EOF_SIGNAL_LOSS]</div>
                    </div>
                </section>
            </div>
        </div>
      </article>
    </main>

    <script>
        function toggleBrandMenu(e){e.stopPropagation();var m=document.getElementById('brandDropdown');if(m)m.classList.toggle('active');}
        document.addEventListener('click',function(){var m=document.getElementById('brandDropdown');if(m)m.classList.remove('active');});
    </script>
</body>
</html>
`;
}

// ---- scaffold mode: emit a fill-in lyrics file + readable checklist, then exit ----
if (argv.includes('--scaffold')) {
  const all = ARCHIVE_DATA.filter(s => s && s.title);
  const haveData = all.filter(s => (s.lyrics || '').trim());
  const need = all.filter(s => !((LYRICS_OVERRIDE[s.videoId] || s.lyrics || '').trim()));
  const scaffold = {};
  for (const s of all) scaffold[s.videoId || slugify(s.title)] = (LYRICS_OVERRIDE[s.videoId] || s.lyrics || '');
  if (!existsSync(LYRICS_FILE)) writeFileSync(LYRICS_FILE, JSON.stringify(scaffold, null, 2), 'utf8');
  const checklist = all.map((s, i) => `${String(i + 1).padStart(2, '0')}. [${(LYRICS_OVERRIDE[s.videoId] || s.lyrics || '').trim() ? 'x' : ' '}] ${s.title}  ::  ${s.videoId}  ::  ${slugify(s.title)}`).join('\n');
  writeFileSync(join(REPO, 'scripts', 'songs_lyrics_CHECKLIST.txt'), `SONG LYRICS CHECKLIST (${haveData.length}/${all.length} already have lyrics)\nFill scripts/songs_lyrics.json — key = videoId, value = lyrics text.\n\n${checklist}\n`, 'utf8');
  console.log(`Total songs: ${all.length} | already have lyrics: ${haveData.length} | still need lyrics: ${need.length}`);
  console.log(`Wrote scripts/songs_lyrics.json (if absent) and scripts/songs_lyrics_CHECKLIST.txt`);
  process.exit(0);
}

// ---- sitemap helpers ----
const TODAY = new Date().toISOString().slice(0, 10);
const xe = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function sitemapEntry(song, uploadDate) {
  const { coverFile, slug } = resolveCover(song);
  const loc = `${ORIGIN}/songs/${slug}`;                       // extensionless canonical
  const meta = SEO_META[slug] || {};
  const title = song.title, artist = song.artist || 'Ethel';
  const vtitle = meta.title ? meta.title.split(' | ')[0] : `${title} by ${artist}`;
  const vdesc = (meta.description || `${title} by ${artist}. A song from Silence Is The Trauma.`).slice(0, 2040);
  const coverAbs = coverFile ? `${ORIGIN}/songs/covers/${encodeURIComponent(coverFile)}` : '';
  const thumb = song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/maxresdefault.jpg` : coverAbs;
  let s = `  <url>\n    <loc>${xe(loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n`;
  if (coverAbs) s += `    <image:image>\n      <image:loc>${xe(coverAbs)}</image:loc>\n      <image:title>${xe(`${title} by ${artist}`)}</image:title>\n    </image:image>\n`;
  if (song.videoId) s += `    <video:video>\n      <video:thumbnail_loc>${xe(thumb)}</video:thumbnail_loc>\n      <video:title>${xe(vtitle)}</video:title>\n      <video:description>${xe(vdesc)}</video:description>\n      <video:player_loc allow_embed="yes">https://www.youtube-nocookie.com/embed/${song.videoId}</video:player_loc>\n${uploadDate ? `      <video:publication_date>${uploadDate}T00:00:00+00:00</video:publication_date>\n` : ''}      <video:family_friendly>yes</video:family_friendly>\n    </video:video>\n`;
  s += `  </url>\n`;
  return s;
}

// ---- run ----
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const songs = ALL_SONGS.slice(0, LIMIT);
const manifest = [];
const smEntries = [];
let i = 0;
for (const song of songs) {
  const uploadDate = DATES[song.videoId] || await ytDate(song.videoId);
  const html = page(song, uploadDate);
  const { slug } = resolveCover(song);
  writeFileSync(join(OUT_DIR, `${slug}.html`), html, { encoding: 'utf8' });
  manifest.push({ slug, title: song.title, artist: song.artist, videoId: song.videoId, uploadDate });
  smEntries.push(sitemapEntry(song, uploadDate));
  i++;
  console.log(`  [${i}/${songs.length}] /songs/${slug}  (${song.videoId || 'no-video'}, date=${uploadDate || 'none'})`);
}
writeFileSync(join(OUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

// combined song sitemap (page + cover image + video per entry)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Per-song pages for Silence Is The Trauma. Each entry carries the page, its cover image and its video. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${smEntries.join('')}</urlset>
`;
writeFileSync(join(REPO, 'sitemap-songs.xml'), sitemap, { encoding: 'utf8' });
console.log(`Done. ${manifest.length} page(s) -> ${OUT_DIR}  |  sitemap-songs.xml written (${smEntries.length} urls)`);

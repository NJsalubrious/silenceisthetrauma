# How to add a new story or article to the site

A self-contained, hand-this-to-an-agent guide. Read top to bottom once and a new article or story is on the site in under five minutes.

> **Adding a narrated short story (spoken-word mp3, beat format, per-story colour arc)?**
> Read `ADD_NARRATED_STORY_AND_STYLE.md` in this folder as well. This file covers the unison shell
> and the conversion scripts. That one covers the `raw-story` beat tags, the `[theme]` arc markers,
> how to build a palette that belongs to the story instead of the page it was copied from, three
> rendering bugs that present as ugly styling, and how to prove the prose was copied word for word.

---

## The one-paragraph architecture

Every page on this site is a **standalone HTML document** (so search engines see full content on every URL) that ALSO carries the **persistent shell** — top nav, Dominic chatbot, music players, modals, scripts — wrapped around its unique content. When a user clicks an internal link, **Barba.js** intercepts the click, fetches the next page, and swaps **only the `<main>` element** into the existing shell. Music keeps playing, Dominic stays awake. The shell is duplicated in every page on purpose — that duplication is what makes both direct-URL landings AND seamless cross-page navigation work simultaneously.

**The only two routes outside this method**: `/zones/ethel_gallery/` (poetry) and `/zones/silentcinema/` (cinema). These are deliberate hard cuts to mini-sites with their own headers/audio. Declared in `js/barba-router.js` `prevent` callback.

---

## Where things live

```
NETWORK_PEOPLE_SANDBOX/                    <- production sandbox; the only folder that matters
├── index.html, files.html, ...            <- the 7 SEO pages (the canonical shell reference)
├── master-hub.css                         <- shared styles for the shell
├── site-manifest.js                       <- manifests: zones, library paths, STORIES list, games, etc.
├── master-nav.js                          <- shared nav JS incl. nav-href root-relative normalizer
├── dominic-library.js, dominic-lite.js    <- chatbot
├── js/ambient-audio.js, js/barba-router.js
├── short_stories/<slug>.html              <- where short stories live
├── library/loc_archives/<slug>.html       <- where articles ("archives") live
├── library/...                            <- per-character image folders, JSON maps, etc.
├── assets/...                             <- audio, character avatars
├── _convert_archives.py                   <- THE TOOL for adding a new article
├── _convert_stories.py                    <- THE TOOL for adding a new story
├── _UNISON_METHOD.md                      <- full method spec (for deep questions)
└── IMPORTANT_NOTES/                       <- this folder; quick-reference docs
    └── ADD_STORY_OR_ARTICLE.md            <- this file
```

When in doubt about the shell shape, look at `files.html` — it's the canonical reference for what every unison page should contain.

---

## The workflow for a NEW ARTICLE (archive)

### Step 1 — drop the file

Place the new HTML article into `library/loc_archives/<slug>.html`. The file should be a **plain standalone HTML page** with whatever bespoke styling, fonts, layout you want — newspaper, clinical report, magazine, whatever. The conversion script will preserve every byte of the article's design.

Minimum the article needs to have in its HTML:
- `<title>...</title>`
- `<meta name="description" content="...">` (one sentence)
- Optional but ideal: a `<link rel="canonical" href="...">`
- Optional but ideal: a `<script type="application/ld+json">...</script>` schema block
- The bespoke font `<link>` to Google Fonts
- A `<style>` block in the head with the article's CSS (body rules, theme classes, etc.)
- The article markup itself inside `<body>...</body>`

### Step 2 — add the article to the conversion script

Open `_convert_archives.py`. Add an entry to the `ARCHIVES` list:

```python
{
    'filename': '<your-slug>.html',
    'og_title_fallback': 'A fallback title used only if the article\'s own <title> is missing',
    'desc_fallback': 'A one-sentence fallback description (only used if the article\'s own <meta description> is missing).',
},
```

### Step 3 — run the conversion

From `NETWORK_PEOPLE_SANDBOX/` open a terminal and run:

```
python _convert_archives.py
```

The script will:
- Back the original up as `<slug>.html.PRE_UNISON.bak` (only if no backup yet exists).
- Extract from the original: title, description, canonical, JSON-LD, the bespoke font `<link>`, the `<style>` block, and the body content.
- Use `files.html` as the shell template and stitch the article into it.
- Output the unison-compliant file in place.

The new file will have:
- The full PIXELSTORTION top nav (with depth-aware `../../` prefix for sub-folder navigation).
- The full persistent shell (Dominic, music, modals, scripts).
- The article's bespoke font `<link>` and `<style>` block placed **inside `<main>`** so Barba carries them on container swap.
- The article's body content placed after the styles, inside `<main>`.
- `data-barba-namespace="archive"`.

### Step 4 — register the article on the Files page

Open `files.html` and find the `articles` array (around line 324). Add a new object — copy the pattern from the existing entries. Example:

```javascript
{
    title: "YOUR ARTICLE TITLE",
    date: "MAR 14, 2024",
    sortDate: "2024-03-14",                  // YYYY-MM-DD for chronological sorting
    author: "Writer's Name",
    excerpt: "One or two sentence preview that shows on the card.",
    thumbnail: "https://github.com/.../thumbs/your-thumb.jpg",
    url: "https://njsalubrious.github.io/pixelstortion-assets/archives/<your-slug>.html",
    altText: "Image alt text describing the thumbnail."
},
```

The `url` field is **the public/CDN URL where the article lives on the live deployment**. The renderFiles function in `files.html` strips the GitHub Pages prefix and replaces it with `library/loc_archives/` so the local file is found. Just keep the URL pattern matching the existing entries.

### Step 5 — verify

Open in an incognito window (to avoid stale cache):
- `http://127.0.0.1:8000/library/loc_archives/<your-slug>.html` — should render the article with the PIXELSTORTION nav fixed at the top.
- `http://127.0.0.1:8000/files.html` — your new article should appear in the THE ARCHIVES grid. Click it — Barba swaps in your article, the URL changes, music keeps playing.

If both work, you're done.

---

## The workflow for a NEW SHORT STORY

### Step 1 — drop the file

Place the new HTML story into `short_stories/<slug>.html`. Same shape as an article: title, description, fonts, `<style>`, content.

### Step 2 — add the story to the conversion script

Open `_convert_stories.py`. Add an entry to the `STORIES` list:

```python
{
    'filename': '<your-slug>.html',
    'desc_fallback': 'One-sentence fallback description (only used if the story\'s own <meta description> is missing).',
},
```

### Step 3 — run the conversion

```
python _convert_stories.py
```

The script reads the story's existing head + main content, wraps it in the shell, and writes the unison-compliant file in place. Backup is saved as `<slug>.html.PRE_UNISON.bak`.

### Step 4 — register the story on the Stories page

Open `site-manifest.js`. Find `PIXEL_MANIFEST.STORIES` (around line 125). Add a new entry:

```javascript
Your_Slug_Key: {
    title: 'Your Story Title',
    track: 'STORY 06 // YOUR STORY SUBTITLE',
    description: 'One short sentence shown on the story card.',
    cover: 'https://silenceisthetrauma.com/short_stories/<your-slug>.jpg',
    href: '/short_stories/<your-slug>.html'
},
```

The `cover` is the social-preview image — keep it as an absolute URL to the public CDN/live site. The `href` MUST be a **root-relative path** (`/short_stories/...`), not an absolute URL. This is what makes clicking a story card from `stories.html` stay on the same origin so Barba can intercept the navigation (music keeps playing, shell stays mounted). If you put an absolute URL here, the click goes off-site to the live deployment and the music cuts — that's the failure mode we hit and fixed.

### Step 5 — verify

In incognito:
- `http://127.0.0.1:8000/short_stories/<your-slug>.html` — story renders with the nav at top.
- `http://127.0.0.1:8000/stories.html` — story card appears in the grid. Click — Barba swap, music continues.

Done.

---

## Critical rules to never break (the lessons learned the hard way)

1. **Page-specific CSS and the bespoke font `<link>` MUST live inside `<main>`**, not in the `<head>`. Barba only swaps the `<main>` element on navigation. Anything in `<head>` doesn't transfer on a Barba navigation, so the bespoke styles vanish when the page is reached via internal link. The conversion scripts handle this automatically — but if you ever hand-edit a converted page, keep the bespoke CSS/fonts inside `<main>`.

2. **The full persistent shell is duplicated in every unison page**. Yes, ~1900 lines repeated per file. That duplication is what lets both direct-URL landings AND seamless cross-page navigation work. Don't try to consolidate it into includes or partials — that broke the site before.

3. **Internal nav anchor hrefs can be bare relative (`stories.html`), depth-aware relative (`../stories.html`), or root-relative (`/stories.html`).** `master-nav.js` normalizes all three forms to root-relative on every page load, so whichever form the script emits will work. Just don't use absolute URLs to a different host for internal nav.

4. **Browser cache is your enemy when testing**. Python's `http.server` doesn't set no-cache headers. Always test in an **incognito window** when verifying a conversion, OR open DevTools → right-click the refresh button → "Empty Cache and Hard Reload."

5. **Don't touch the 7 SEO pages or `master-hub.css` lightly.** They took serious effort to get right. The conversion script never touches them — it only reads `files.html` as a template and writes the new file in a different location.

6. **Exclusions:** the only routes that should NOT be in the unison are `/zones/ethel_gallery/` and `/zones/silentcinema/`. These are declared in `js/barba-router.js` `prevent` callback as hard-cut mini-sites. If you ever add another mini-site, add a new `if (href.includes('your-path')) return true;` line in that callback — and never put a unison page (article/story/SEO page) on that list.

---

## Troubleshooting

| Symptom | Most likely cause | Fix |
|---|---|---|
| 404 on an article/story URL that should exist | Browser cached an earlier 404 | Test in incognito or Empty Cache and Hard Reload |
| Article looks unstyled (no bespoke fonts/colors) on internal click but fine on direct load | The bespoke `<style>` block is in `<head>` instead of `<main>` | Re-run the conversion script, which puts it in `<main>` |
| Article doesn't show in the Files grid | Missing entry in `files.html`'s `articles` array (or wrong URL pattern) | Add it; URL should match other entries' pattern |
| Story doesn't show in the Stories grid | Missing entry in `site-manifest.js`'s `PIXEL_MANIFEST.STORIES` | Add it |
| Top nav click goes to wrong URL like `/short_stories/games.html` | `master-nav.js` nav-href normalizer didn't run | Check `master-nav.js` still has the `UNISON NAV-HREF NORMALIZE` block at the top |
| Clicking an archive card on Files shows empty grid afterward | Cached version of `files.html` from before conversion | Hard-refresh `files.html` |
| Music cuts when navigating between unison pages | The new page's `<main>` doesn't have `data-barba="container" data-barba-namespace="..."` | Verify the conversion completed; re-run script if needed |
| Modal X-button or dropdown menu items appear randomly on the page | Tailwind CDN flipped the cascade on the override rules | Re-run `_patch_unison_overrides.py` |

---

## When in doubt

- The canonical shell is `files.html`. Compare any broken page against it side-by-side; whatever's in the shell of files.html should also be in the converted page's shell (everything outside `<main>`).
- `_UNISON_METHOD.md` has the full deep-dive on the architecture and why each rule exists.
- The PRE_UNISON.bak files (originals before conversion) live in `c:\SILENCE_IS_THE_TRAUMA\backups\pre_unison_originals_2026_05_21\` mirroring their source paths. If a conversion goes wrong, copy the .bak back over the converted file and re-run the script.

---

## What I (the agent reading this later) should NOT do

- Do not rewrite the 7 SEO pages.
- Do not rewrite or consolidate the persistent shell.
- Do not put page-specific CSS in `<head>`.
- Do not use root-relative paths (`/files.html`) in the article/story body content — though they're fine in the shell because the normalizer handles them.
- Do not propose moving stories/archives to root unless explicitly asked. The current folder structure mirrors the live deployment's SEO URLs and that's load-bearing.
- Do not invoke any conversion or modify any file without first checking that the localhost server is running (so you can verify the result by fetching it).





notes 
[Written. The doc is self-contained — anyone (you, me later, a fresh agent) can read it top-to-bottom and add a new article or story in five minutes:

NETWORK_PEOPLE_SANDBOX/IMPORTANT_NOTES/ADD_STORY_OR_ARTICLE.md

It covers:

One-paragraph architecture summary so the reader knows why the workflow is shaped this way.
File-tree map showing where everything lives and what each top-level file is for.
Step-by-step for adding a new article (drop in library/loc_archives/ → add list entry to _convert_archives.py → run script → add to articles array in files.html → verify in incognito).
Step-by-step for adding a new story (drop in short_stories/ → add list entry to _convert_stories.py → run script → add to PIXEL_MANIFEST.STORIES in site-manifest.js → verify in incognito).
The 6 critical rules that took today's pain to learn — each phrased so a future agent won't undo them.
A troubleshooting table for the symptoms we hit today (cached 404s, missing CSS after Barba swap, wrong nav resolution, dropdown leakage, etc.) with the fix for each.
An explicit "don't do this" section for future agents — don't rewrite the 7 pages, don't consolidate the shell, don't put bespoke CSS in <head>, don't move things to root unless asked.
Hand this back to me (or any agent) when you have new stories/articles to add. It should be all the context needed.]]

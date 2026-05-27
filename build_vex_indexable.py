"""
build_vex_indexable.py
======================
Make veX posts crawlable + AI-readable. Generates:

  1. veX_social_network/feed/<handle>.html
     One static HTML page per character with all of their veX posts
     rendered server-side (no JS needed). Includes JSON-LD Person +
     SocialMediaPosting array, canonical URL, OG/Twitter cards.

  2. veX_social_network/feed/index.html
     Index of all the per-handle pages.

  3. sitemap-vex.xml
     Sitemap listing every per-handle page (one entry per character).

  4. llms-full.txt
     Replaces the existing file with one that includes a NEW section
     "## veX Network — Full Public Posts" containing every post grouped
     by character. Existing content above that section is preserved.

Idempotent: re-run to refresh generated files when posts.json updates.
Only writes the files listed above; never touches posts.json or
profiles.json (those are point-of-truth).
"""
import json, os, html, re, datetime
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
POSTS_FILE = os.path.join(ROOT, 'veX_social_network', 'posts.json')
PROFILES_FILE = os.path.join(ROOT, 'veX_social_network', 'profiles.json')
FEED_DIR = os.path.join(ROOT, 'veX_social_network', 'feed')
SITEMAP_VEX = os.path.join(ROOT, 'sitemap-vex.xml')
LLMS_FULL = os.path.join(ROOT, 'llms-full.txt')

SITE = 'https://silenceisthetrauma.com'
TODAY = datetime.date.today().isoformat()

# ----------------------------------------------------------------------------
# Per-character SEO archetype map (per veX SEO research doc).
# Tier 1 + 2 characters get archetype-matched titles, descriptions, and
# meta-keywords drawn from the doc's keyword clusters. Unmapped characters
# fall back to a generic descriptor + the GENERIC_KEYWORDS shared by every
# character page (Australian noir transmedia / fictional social network art /
# character-driven ARG / etc.).
#
# Deliberately avoids doc Section K-flagged inflammatory phrasings
# (pop-trauma TikTok vocab, manosphere-curious, "expose the real X").
# ----------------------------------------------------------------------------
ARCHETYPE_BY_HANDLE = {
    '@ethel_ryker': {
        'phrase': 'the consequence-mapper, sister to Dominic Ryker',
        'cluster': 'Moral Thermodynamics, fawn response in fiction, the social contract of silence, Ayn Rand critique fiction, structural psychopathy novel, cognitive discipline, weaponised politeness, harm reduction politics fiction, books better than The Body Keeps the Score',
    },
    '@dominic_ryker': {
        'phrase': 'the structural-psychopath antagonist',
        'cluster': 'corporate psychopath CEO fiction, structural psychopathy novel, billionaire fugitive fiction, fictional Australian billionaire criminal, escaped Australian prisoner story, Long Bay prison fiction, white-collar crime psychology, Carlos Ghosn-style escape fiction',
    },
    '@isla_band': {
        'phrase': 'the trauma-core musician',
        'cluster': 'female-fronted metal, dark folk meets metal, songs as testimony, female rage, anti-victim music, songs about a controlling father, songs about running away at 15, concept album novel, bands like Spiritbox Jinjer Poppy',
    },
    '@marcus_vane': {
        'phrase': 'the Zurich finance operator who weaponises audit fatigue',
        'cluster': 'financial crime novel literary, money laundering thriller literary, audit-fatigue as weapon, transaction velocity, white-collar crime fiction, oligarch noir',
    },
    '@arthur_penn': {
        'phrase': 'the code-enforcement bureaucrat',
        'cluster': 'bureaucratic compliance as weapon, code enforcement fiction, weaponised politeness, the slow poison of paperwork, institutional silence',
    },
    '@ash': {
        'phrase': 'the apathetic North Sydney temp who accidentally deletes the records',
        'cluster': 'data entry temp character, accidental records deletion, apathy as resistance, fictional whistleblower by accident',
    },
    '@spud': {
        'phrase': 'a spaced-out small-time chemist using pool cleaning as cover',
        'cluster': 'dodgy tradie fiction, Sydney Eastern Suburbs fiction, illicit chemical work, small-time crime fiction, accidental evidence comedy',
    },
    '@bigmarge': {
        'phrase': 'the Redfern publican',
        'cluster': 'Sydney pub character, Redfern fiction, working-class noir, Sydney crime novels',
    },
    '@jack_shiv': {
        'phrase': 'investigative journalist tracking the Ryker case',
        'cluster': 'investigative journalist fiction, Sydney noir journalism, fictional reporter, Australian crime journalism',
    },
    '@sarah_k': {
        'phrase': 'investigative journalist',
        'cluster': 'investigative journalist fiction, Sydney crime journalism, fictional reporter',
    },
    '@pop_ryker': {
        'phrase': 'grandfather figure to Ethel',
        'cluster': 'fictional grandfather character, Sydney working-class character, generational fiction',
    },
    '@cert_gary': {
        'phrase': 'a private certifier with very flexible standards',
        'cluster': 'dodgy certifier fiction, NSW construction certification corruption, white-collar fraud minor character',
    },
    '@strata_gary': {
        'phrase': 'the strata manager',
        'cluster': 'strata management fiction, Sydney property noir, working-class crime fiction',
    },
    '@the_evaluator': {
        'phrase': 'the discreet psychiatric intake on the North Shore',
        'cluster': 'forensic psychiatry novel, buried psych evaluation scandal, fictional clinician character, North Shore Sydney',
    },
    '@inspector_klaus_weber': {
        'phrase': 'the inspector',
        'cluster': 'fictional inspector character, European police procedural element, transnational crime fiction',
    },
    '@iron_irene': {
        'phrase': 'Iron Irene',
        'cluster': 'fictional supporting character, female character in transmedia crime fiction',
    },
    '@pieter_the_block': {
        'phrase': "Pieter 'The Block'",
        'cluster': 'fictional supporting character, transnational organised crime fiction',
    },
    '@silas_kovic': {
        'phrase': 'Silas Kovic',
        'cluster': 'fictional supporting character, transnational crime fiction',
    },
}

# Shared keyword spine appended to every character's keywords block.
GENERIC_KEYWORDS = (
    'Australian noir transmedia, fictional social network art installation, '
    'character-driven ARG, satirical crime fiction online, transmedia crime fiction, '
    'Silence Is The Trauma, Pixelstortion'
)

# ----------------------------------------------------------------------------
# Load source data
# ----------------------------------------------------------------------------
with open(POSTS_FILE, 'r', encoding='utf-8') as f:
    posts = json.load(f)
with open(PROFILES_FILE, 'r', encoding='utf-8') as f:
    profiles = json.load(f)

profiles_by_handle = {p['handle']: p for p in profiles}

# Group posts by handle; sort each group newest-first by timestamp.
posts_by_handle = defaultdict(list)
for p in posts:
    h = p.get('handle')
    if h:
        posts_by_handle[h].append(p)
for h in posts_by_handle:
    posts_by_handle[h].sort(key=lambda x: x.get('timestamp', ''), reverse=True)

# Map post id -> post for resolving reply_to references.
posts_by_id = {p['id']: p for p in posts if 'id' in p}

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def slug(handle):
    return handle.lstrip('@')

def fmt_ts(ts):
    if not ts:
        return ''
    try:
        dt = datetime.datetime.fromisoformat(ts.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M UTC')
    except Exception:
        return ts

def safe_text(s):
    return html.escape(s or '', quote=True)

def linkify(s):
    """Turn @handle mentions into linked spans (text only, no anchors,
    to keep crawlable markup simple)."""
    return re.sub(r'@(\w+)', r'<span class="m">@\1</span>', safe_text(s))

# ----------------------------------------------------------------------------
# Per-handle page template
# ----------------------------------------------------------------------------
PAGE_CSS = """
:root{--bg:#0a0a0a;--ink:#e4e4e7;--mute:#888;--accent:#c6a25a;--card:#15151a;--rule:#24242a;--link:#c6a25a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;padding:24px 16px}
.wrap{max-width:760px;margin:0 auto}
nav.top{font-size:13px;margin-bottom:32px}
nav.top a{color:var(--mute);text-decoration:none}
nav.top a:hover{color:var(--accent)}
header.h{border-bottom:1px solid var(--rule);padding-bottom:24px;margin-bottom:24px}
header.h h1{margin:0 0 4px;font-size:28px;font-weight:600;letter-spacing:.02em}
header.h .handle{color:var(--accent);font-size:14px;font-family:ui-monospace,monospace}
header.h .bio{color:var(--mute);font-size:14px;margin-top:12px;max-width:640px}
.count{color:var(--mute);font-size:12px;margin-top:14px;letter-spacing:.04em;text-transform:uppercase}
.post{border-bottom:1px solid var(--rule);padding:18px 0}
.post time{color:var(--mute);font-size:12px;font-family:ui-monospace,monospace;display:block;margin-bottom:6px}
.post .body{white-space:pre-wrap;word-wrap:break-word}
.post .body .m{color:var(--accent)}
.post .link{display:inline-block;margin-top:8px;color:var(--link);font-size:13px;word-break:break-all}
.post .reply{color:var(--mute);font-size:12px;margin-bottom:4px;font-style:italic}
footer.f{margin-top:48px;padding-top:24px;border-top:1px solid var(--rule);color:var(--mute);font-size:12px}
footer.f a{color:var(--mute)}
"""

def build_page(profile, profile_posts):
    handle = profile['handle']
    display = profile.get('display_name', handle)
    bio = profile.get('bio', '')
    avatar = profile.get('avatar', '')
    canonical = f'{SITE}/veX_social_network/feed/{slug(handle)}.html'
    post_count = len(profile_posts)

    # Per-archetype SEO enrichment. Mapped characters get a phrase + cluster
    # terms drawn from the veX research doc; unmapped fall back to generic.
    archetype = ARCHETYPE_BY_HANDLE.get(handle, {})
    arch_phrase = archetype.get('phrase', 'a character')
    cluster_terms = archetype.get('cluster', '').strip()

    # Title: keep the readable structure but, for mapped characters, append
    # the archetype phrase so the SERP title carries cluster vocabulary.
    if archetype:
        title = f'{display} ({handle}), {arch_phrase}, on veX | Silence Is The Trauma'
    else:
        title = f'{display} ({handle}) on veX | Silence Is The Trauma'

    # Description: same readable opening, then a tail of cluster terms (which
    # Google indexes for topical relevance even past the SERP display limit).
    base_desc = (
        f'All public veX posts by {display} ({handle}), {arch_phrase} in the '
        f'Silence Is The Trauma fictional social network. {post_count} posts.'
    )
    if cluster_terms:
        desc = f'{base_desc} {cluster_terms}.'
    else:
        desc = base_desc

    # Keywords meta: archetype cluster (if any) + the generic veX spine.
    if cluster_terms:
        page_keywords = f'{cluster_terms}, {GENERIC_KEYWORDS}'
    else:
        page_keywords = GENERIC_KEYWORDS

    og_image = f'{SITE}/veX_social_network/VexSocialnetworkPreview.jpg'

    # JSON-LD: Person + ItemList of SocialMediaPosting
    posting_items = []
    for i, p in enumerate(profile_posts[:50], 1):  # cap at 50 for schema
        posting_items.append({
            '@type': 'ListItem',
            'position': i,
            'item': {
                '@type': 'SocialMediaPosting',
                'datePublished': p.get('timestamp', ''),
                'articleBody': p.get('content', ''),
                'author': {
                    '@type': 'Person',
                    'name': display,
                    'alternateName': handle,
                    'description': 'Fictional character in Silence Is The Trauma.'
                },
                'isPartOf': {
                    '@type': 'WebSite',
                    'name': 'veX',
                    'url': f'{SITE}/veX_social_network/'
                }
            }
        })
    schema = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        'name': f'{display} on veX',
        'url': canonical,
        'description': desc,
        'keywords': page_keywords,
        'isPartOf': {
            '@type': 'WebSite',
            'name': 'veX Network',
            'url': f'{SITE}/veX_social_network/',
        },
        'mainEntity': {
            '@type': 'Person',
            'name': display,
            'alternateName': handle,
            'description': 'Fictional character in the Silence Is The Trauma transmedia art installation. All posts are part of the fiction; no real person is depicted.',
            'image': f'{SITE}/veX_social_network/{avatar.lstrip("../")}' if avatar else None,
        },
        'hasPart': {
            '@type': 'ItemList',
            'numberOfItems': post_count,
            'itemListElement': posting_items
        }
    }
    schema_json = json.dumps(schema, ensure_ascii=False, indent=2)

    # Render posts
    parts = []
    for p in profile_posts:
        reply_html = ''
        if p.get('reply_to') and p['reply_to'] in posts_by_id:
            parent = posts_by_id[p['reply_to']]
            parent_handle = parent.get('handle', '@?')
            reply_html = f'<div class="reply">in reply to <span class="m">{safe_text(parent_handle)}</span></div>'
        link_html = ''
        if p.get('link'):
            link_html = f'<a class="link" href="{safe_text(p["link"])}" rel="nofollow noopener" target="_blank">{safe_text(p["link"])}</a>'
        parts.append(
            '<article class="post">'
            f'<time datetime="{safe_text(p.get("timestamp",""))}">{safe_text(fmt_ts(p.get("timestamp","")))}</time>'
            f'{reply_html}'
            f'<div class="body">{linkify(p.get("content",""))}</div>'
            f'{link_html}'
            '</article>'
        )
    posts_html = '\n'.join(parts)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{safe_text(title)}</title>
<meta name="description" content="{safe_text(desc)}">
<meta name="keywords" content="{safe_text(page_keywords)}">
<link rel="canonical" href="{canonical}">

<meta property="og:title" content="{safe_text(display)} on veX">
<meta property="og:description" content="{safe_text(desc)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="veX Network">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og_image}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{safe_text(display)} on veX">
<meta name="twitter:description" content="{safe_text(desc)}">
<meta name="twitter:image" content="{og_image}">

<meta name="genre" content="Fiction">
<meta name="classification" content="Entertainment, Fiction, Art Installation">

<script type="application/ld+json">
{schema_json}
</script>

<style>{PAGE_CSS}</style>
</head>
<body>
<div class="wrap">
<nav class="top"><a href="../">&larr; Back to the veX feed</a></nav>
<header class="h">
<h1>{safe_text(display)}</h1>
<div class="handle">{safe_text(handle)}</div>
{f'<div class="bio">{safe_text(bio)}</div>' if bio else ''}
<div class="count">{post_count} post{"s" if post_count != 1 else ""}</div>
</header>
<main>
{posts_html}
</main>
<footer class="f">
<p>All content on this page is part of the <a href="{SITE}/">Silence Is The Trauma</a> fictional art installation. All characters, posts, and interactions are fictional. No real persons are depicted.</p>
<p><a href="../">View the live veX feed</a> &middot; <a href="index.html">All character feeds</a></p>
</footer>
</div>
</body>
</html>"""

def build_index(handles_in_order):
    items = []
    for h in handles_in_order:
        profile = profiles_by_handle.get(h)
        if not profile:
            continue
        display = profile.get('display_name', h)
        count = len(posts_by_handle[h])
        items.append(
            f'<li><a href="{slug(h)}.html"><span class="n">{safe_text(display)}</span> '
            f'<span class="hdl">{safe_text(h)}</span> '
            f'<span class="ct">{count} post{"s" if count != 1 else ""}</span></a></li>'
        )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>veX Character Feeds | Silence Is The Trauma</title>
<meta name="description" content="Per-character public post feeds for the veX fictional social network. {len(handles_in_order)} characters, {sum(len(posts_by_handle[h]) for h in handles_in_order)} total public posts.">
<link rel="canonical" href="{SITE}/veX_social_network/feed/">
<meta property="og:title" content="veX Character Feeds">
<meta property="og:description" content="Per-character post archives for the veX fictional social network.">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}/veX_social_network/feed/">
<meta property="og:image" content="{SITE}/veX_social_network/VexSocialnetworkPreview.jpg">
<meta name="genre" content="Fiction">
<style>{PAGE_CSS}
ul.feeds{{list-style:none;padding:0;margin:0}}
ul.feeds li{{border-bottom:1px solid var(--rule);padding:12px 0}}
ul.feeds a{{display:flex;align-items:baseline;gap:12px;text-decoration:none;color:var(--ink)}}
ul.feeds a:hover .n{{color:var(--accent)}}
.n{{font-weight:600;flex:1}}
.hdl{{color:var(--accent);font-family:ui-monospace,monospace;font-size:13px}}
.ct{{color:var(--mute);font-size:12px;font-family:ui-monospace,monospace}}
</style>
</head>
<body>
<div class="wrap">
<nav class="top"><a href="../">&larr; Back to the veX feed</a></nav>
<header class="h">
<h1>veX character feeds</h1>
<div class="count">{len(handles_in_order)} characters &middot; {sum(len(posts_by_handle[h]) for h in handles_in_order)} public posts total</div>
</header>
<main><ul class="feeds">
{chr(10).join(items)}
</ul></main>
<footer class="f"><p>All posts are fictional and part of the <a href="{SITE}/">Silence Is The Trauma</a> art installation.</p></footer>
</div>
</body>
</html>"""

# ----------------------------------------------------------------------------
# Generate per-handle pages + index
# ----------------------------------------------------------------------------
os.makedirs(FEED_DIR, exist_ok=True)

# Handles with at least one post, sorted by post count desc then handle asc
handles_with_posts = sorted(
    posts_by_handle.keys(),
    key=lambda h: (-len(posts_by_handle[h]), h)
)

pages_written = 0
for h in handles_with_posts:
    profile = profiles_by_handle.get(h)
    if not profile:
        # Posts from a handle not in profiles.json; synthesize a stub
        profile = {'handle': h, 'display_name': h.lstrip('@'), 'bio': '', 'avatar': ''}
    page_html = build_page(profile, posts_by_handle[h])
    path = os.path.join(FEED_DIR, f'{slug(h)}.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page_html)
    pages_written += 1

index_html = build_index(handles_with_posts)
with open(os.path.join(FEED_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(index_html)
pages_written += 1
print(f'OK  generated {pages_written} pages under veX_social_network/feed/')

# ----------------------------------------------------------------------------
# sitemap-vex.xml
# ----------------------------------------------------------------------------
sitemap_parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '   <!-- veX per-character feed pages. Auto-generated by build_vex_indexable.py. -->',
    f'   <url><loc>{SITE}/veX_social_network/feed/</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>',
]
for h in handles_with_posts:
    sitemap_parts.append(
        f'   <url><loc>{SITE}/veX_social_network/feed/{slug(h)}.html</loc>'
        f'<lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>'
    )
sitemap_parts.append('</urlset>')
with open(SITEMAP_VEX, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sitemap_parts) + '\n')
print(f'OK  wrote sitemap-vex.xml ({len(handles_with_posts) + 1} URLs)')

# ----------------------------------------------------------------------------
# llms-full.txt: replace any existing 'veX Network — Full Public Posts' section
#                 with a fresh dump; preserve everything else.
# ----------------------------------------------------------------------------
SECTION_MARKER = '## veX Network — Full Public Posts'

new_section_lines = [SECTION_MARKER, '']
new_section_lines.append(
    'This section bundles every public veX post by character. veX is a '
    'fictional social network within the Silence Is The Trauma art '
    'installation. Every handle, every post, every interaction is part of '
    'the fiction; no real persons are depicted.'
)
new_section_lines.append('')
new_section_lines.append(f'_Posts shown: {len(posts)} across {len(handles_with_posts)} characters. '
                         f'Generated {TODAY}._')
new_section_lines.append('')

for h in handles_with_posts:
    profile = profiles_by_handle.get(h, {})
    display = profile.get('display_name', h.lstrip('@'))
    bio = profile.get('bio', '')
    chars_posts = posts_by_handle[h]
    new_section_lines.append(f'### {display} ({h})')
    if bio:
        new_section_lines.append(f'> {bio}')
    new_section_lines.append(
        f'_Profile page: [{SITE}/veX_social_network/feed/{slug(h)}.html]({SITE}/veX_social_network/feed/{slug(h)}.html). '
        f'{len(chars_posts)} public posts._'
    )
    new_section_lines.append('')
    # Sort posts oldest -> newest for readability
    for p in sorted(chars_posts, key=lambda x: x.get('timestamp', '')):
        ts = p.get('timestamp', '')
        body = (p.get('content', '') or '').strip()
        body_clean = body.replace('\n', ' ')
        line = f'- **{ts}**: {body_clean}'
        if p.get('link'):
            line += f' (link: {p["link"]})'
        new_section_lines.append(line)
    new_section_lines.append('')

new_section_text = '\n'.join(new_section_lines).rstrip() + '\n'

# Read existing llms-full.txt; strip any prior section starting at SECTION_MARKER.
existing = ''
if os.path.exists(LLMS_FULL):
    with open(LLMS_FULL, 'r', encoding='utf-8') as f:
        existing = f.read()
# Strip everything from SECTION_MARKER onwards if present
idx = existing.find(SECTION_MARKER)
if idx >= 0:
    existing = existing[:idx].rstrip() + '\n'

combined = existing.rstrip() + '\n\n' + new_section_text
with open(LLMS_FULL, 'w', encoding='utf-8') as f:
    f.write(combined)
print(f'OK  llms-full.txt updated ({len(combined)} bytes; section "{SECTION_MARKER}" refreshed)')

print()
print('Done.')

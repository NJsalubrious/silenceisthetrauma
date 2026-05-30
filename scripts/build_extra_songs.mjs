/**
 * build_extra_songs.mjs
 * Parses the temporary spoken-word .md files in songs/covers/ and bakes them into
 * a permanent scripts/extra_songs.json (so the data survives once the .md files are deleted).
 * Each entry: explicit slug + img (the user's character-named cover) + lyrics + one-line description.
 * Run: node scripts/build_extra_songs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const COVERS = join(REPO, 'songs', 'covers');

// id, file base (= cover .jpg + .md name), display title, slug, one-line description (spoken by Ethel Ryker)
const META = [
  {
    id: 46,
    base: 'Ethel-Ryker-Isla-Burnt-My-Fathers-Bridge-Spoken-Word',
    title: "Ethel Ryker — Isla Burnt My Father's Bridge (Spoken Word)",
    slug: 'ethel-ryker-isla-burnt-my-fathers-bridge-spoken-word',
    subtitle: 'Spoken word · evidence walked out · the cold, court-proof turn',
    description: "Ethel Ryker's spoken-word account of the night Isla walked out with the evidence — and Ethel turned hurt into a cold, documented, court-proof case against her father.",
  },
  {
    id: 47,
    base: 'Ethel-Ryker-Hero-Killer-Spoken-Word',
    title: 'Ethel Ryker — Hero Killer (Spoken Word)',
    slug: 'ethel-ryker-hero-killer-spoken-word',
    subtitle: 'Spoken word · the trial · myth vs. documents',
    description: 'Ethel Ryker at the trial, stripping the builder-protector-visionary myth down to documents and patterns: builder, protector, hero, killer — labels do not matter, patterns do.',
  },
  {
    id: 48,
    base: 'Ethel-Ryker-Isla-Hates-Married-Bankers-Spoken-Word',
    title: 'Ethel Ryker — Isla Hates Married Bankers (Spoken Word)',
    slug: 'ethel-ryker-isla-hates-married-bankers-spoken-word',
    subtitle: 'Spoken word · survival mind-blindness · Isla, the chaos funnel',
    description: "Ethel Ryker on survival-mode mind-blindness inside her father's house, and Isla — the chaos funnel who can open anything — distilled into the night of the married banker.",
  },
  {
    id: 49,
    base: 'Ethel-Ryker-Platform-18',
    title: 'Ethel Ryker — Platform 18',
    slug: 'ethel-ryker-platform-18',
    subtitle: 'Spoken word · the amber alert · intent cuts true',
    description: "Ethel Ryker on Platform 18: an amber alert flickers behind a victim's name, the crowd rewrites her in real time, and intent cuts true.",
  },
];

const ytId = (s) => {
  const m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/) || s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
};

const out = [];
for (const m of META) {
  const md = readFileSync(join(COVERS, `${m.base}.md`), 'utf8');
  const videoId = ytId(md);
  // lyrics = everything after the "Lyrics:" line, minus stray Image:/Dir:/vid: lines
  const after = md.split(/^\s*lyrics:\s*$/im)[1] ?? md;
  const lyrics = after
    .split('\n')
    .filter((l) => !/^\s*(image|dir|vid)\s*:/i.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  out.push({
    id: m.id,
    title: m.title,
    slug: m.slug,
    artist: 'Ethel Ryker',
    date: 'Spoken Word',
    subtitle: m.subtitle,
    videoId,
    img: `${m.base}.jpg`,
    story: m.description,
    lyrics,
  });
  console.log(`  ${m.slug}  -> video=${videoId}  lyricChars=${lyrics.length}`);
}
writeFileSync(join(REPO, 'scripts', 'extra_songs.json'), JSON.stringify(out, null, 2), 'utf8');
console.log(`Wrote scripts/extra_songs.json (${out.length} spoken-word entries)`);

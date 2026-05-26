# How to add Q&A for Dominic's chatbot

A self-contained guide for authoring and shipping new chatbot Q&A. Adding 40 more questions to an existing page = minutes. Adding Q&A for a new page = minutes. No code changes if the page namespace already exists.

---

## The mental model

1. Each main page where Dominic appears (stories, files, subjects, etc.) has **one dictionary file** at `NETWORK_PEOPLE_SANDBOX/dict/<page>.json`.
2. The dictionary file is **generated**, not hand-edited. The source of truth is the markdown Q&A files under `MISC_files/Chatbot/Dominics_Chatbot/`.
3. A small builder (`NETWORK_PEOPLE_SANDBOX/_build_dict.py`) reads the markdown sources and writes the JSON.
4. To add or change Q&A: edit a markdown file → run the builder → done. No JS or HTML changes.

The runtime (`dominic-predict.js`) lazy-loads the page's dictionary on first chat open. If the file doesn't exist for a page, the chat panel still works visually — just no ghost-text suggestions or answer matching on that page. Silent fallback.

---

## The Q&A markdown format

Each Q&A block is a numbered list item. Two shapes are accepted:

**Simple — one phrasing per answer:**

```markdown
1. **What is The Equation about?**
   **Dominic Ryker:** The Equation is the cleanest piece of work I've seen committed to a child. A bright young man encounters a problem larger than himself, and a patient tutor helps him learn the smaller shape his mind has to be to live comfortably inside it.
```

**With aliases — multiple phrasings, ONE answer:**

```markdown
1. **What is The Equation about?**
   **Also:** the equation | tell me about the equation | what happens in the equation | is the equation a real story
   **Dominic Ryker:** The Equation is the cleanest piece of work I've seen committed to a child. A bright young man encounters a problem larger than himself, and a patient tutor helps him learn the smaller shape his mind has to be to live comfortably inside it.
```

The `**Also:**` line is optional. Aliases can be separated by either `|` or `,`. Every phrasing — the bolded canonical question plus each alias — becomes its own indexed suggestion, but they all point back to the same Dominic answer. Use this whenever a single answer should satisfy multiple natural visitor phrasings ("what is X about" / "tell me about X" / "X" / "is X true" → all show the same one-window reveal).

### Three non-negotiable content rules

1. **Title-lock every question.** Never write `what is this story about` or `is this story dark`. Always name the title: `what is The Equation about`, `is ISLA 4-7-2 dark`. Aliases must also be title-locked (`the equation`, `tell me about the equation`). The visitor on `stories.html` is staring at five story cards — there is no "this" until they pick one with their phrasing. Generic prefixes like `what is` would otherwise collide across every story and turn the typeahead into chaos. The whole point of the typeahead is to help them narrow toward a specific story; the questions must give them the title to grab.

2. **Lean per page — curate, don't dump.** Aim for **5–8 canonical questions per source piece**, not 40. Each canonical question with ~6–8 natural aliases is plenty. The point of the chat is a series of *tiny windows* into the story; if the panel offers 40 questions per story the visitor scrolls past, drowns, and clicks away. Keep what's most revelatory; archive the rest. If you ever need the deeper bench, keep it in a separate `<slug>_qa_deep.md` file that isn't pointed at by `_build_dict.py` — out of sight from the dictionary, available for future use.

3. **Alphabet coverage via aliases — leading letters matter.** The typeahead indexes each phrasing by its first letter. If every alias for "what is X about" starts with `w`, then visitors who instinctively type `s` (for *summary*), `t` (for *tell me*), `e` (for *explain*), `a` (for *about*), `o` (for *overview*), `g` (for *give me*) get nothing for that question. Each canonical question should have aliases that **deliberately lead with different letters**. A worked pattern for any "what is X about" question:

   ```
   **Also:** the X | tell me about X | about X | overview of X | summary of X | give me a summary of X | explain X | what happens in X
   ```

   For "is X dark / should I read X":

   ```
   **Also:** is X dark | is X sad | is X scary | is X safe to read | can i read X | how dark is X | recommend X | will X upset me
   ```

   For "is X true":

   ```
   **Also:** is X real | based on real events X | did X happen | really happen X | is X autobiographical
   ```

   These three template lines alone cover starting letters `t, a, o, s, g, e, w, i, c, h, r, b, d` — a visitor opening the chat with almost any natural starting word lands on something useful. **The builder interleaves across stories per letter bucket**, so the cycle reveals story 1 / story 2 / story 3 / story 1's next question / etc. on every keystroke — that only works if those leading-letter aliases exist for every story in parallel.

### Voice + length rules of thumb

- Keep answers to **1–3 sentences**. Tiny windows, not paragraphs.
- The answer should naturally name (or restate) the title being discussed, so a visitor mid-flow doesn't lose track of which story is being talked about.
- Voice is Dominic's: calm, knowing, slightly admiring of things that should be disquieting, never melodramatic. Avoid all-caps menace, avoid horror-game clichés, avoid hand-wringing.
- Reveal a **single core theme** or hook per answer. Not the whole plot.

---

## File layout

```
c:\SILENCE_IS_THE_TRAUMA\
├── MISC_files\Chatbot\Dominics_Chatbot\
│   ├── pixelstortion_ISLA_4-7-2_qa.md         <- source: questions about ISLA 4-7-2
│   ├── pixelstortion_The_Equation_qa.md       <- source: The Equation
│   ├── the_evaluation_qa.md                   <- source: The Evaluator
│   └── (more *_qa.md files as content grows)
└── NETWORK_PEOPLE_SANDBOX\
    ├── _build_dict.py                         <- THE TOOL
    ├── dict\
    │   └── stories.json                       <- generated; do not hand-edit
    └── IMPORTANT_NOTES\
        └── ADD_DOMINIC_QA.md                  <- this file
```

Source files live in `MISC_files\` so they're outside the production sandbox (the sandbox stays clean / deployable). The generated dict ships inside the sandbox because the page fetches it at runtime.

---

## Workflow for adding new Q&A

### Case A: more Q&A for an existing story (or existing page)

1. Open the relevant `*_qa.md` file under `MISC_files/Chatbot/Dominics_Chatbot/`.
2. Add new numbered Q&A blocks at the bottom (or anywhere in the list — order doesn't matter, the builder doesn't care).
3. From `NETWORK_PEOPLE_SANDBOX/`, run:
   ```
   python _build_dict.py
   ```
4. The builder reports how many Q&A blocks it found per file and writes the updated `dict/<page>.json`.
5. Hard-refresh `stories.html` in an incognito window. The new Q&A is live.

That's the whole loop.

### Case B: a new story (or other source) within an EXISTING page

E.g. you've written a new short story `the_new_one.html` and want Dominic to be able to answer about it from `stories.html`:

1. Create the new Q&A markdown at `MISC_files/Chatbot/Dominics_Chatbot/the_new_one_qa.md`.
2. Open `NETWORK_PEOPLE_SANDBOX/_build_dict.py`. Find the `PAGE_SOURCES` dict near the top:
   ```python
   PAGE_SOURCES = {
       'stories': [
           ('the_evaluation_qa.md',           'the_evaluation'),
           ('pixelstortion_ISLA_4-7-2_qa.md', 'pixelstortion_ISLA_4-7-2'),
           ('pixelstortion_The_Equation_qa.md', 'pixelstortion_The_Equation'),
       ],
   }
   ```
3. Add the new source tuple inside the `'stories'` list:
   ```python
   ('the_new_one_qa.md', 'the_new_one'),
   ```
   The first value is the markdown filename. The second is the story's slug — the `tags` on the resulting entries get this slug so Dominic can tell which story an answer is referencing.
4. Run `python _build_dict.py`. Done.

### Case C: Q&A for a brand-new main page

E.g. you want Dominic to answer about archives when on `files.html`:

1. Author one or more `*_qa.md` files for that page's content. The Q&A should be about whatever the visitor sees on that page (article titles, themes, etc.).
2. Open `_build_dict.py` and add a new top-level entry to `PAGE_SOURCES`:
   ```python
   PAGE_SOURCES = {
       'stories': [
           ...
       ],
       'files': [
           ('the_ryker_report_qa.md', 'the_ryker_report'),
           ('pymble_to_the_pit_qa.md', 'pymble_to_the_pit'),
           # ...one tuple per article
       ],
   }
   ```
3. Run `python _build_dict.py`. It writes `dict/files.json`.
4. No JS change required. `dominic-lite.js` automatically tries to fetch `/dict/<page>.json` for whatever main page the visitor is on; if the file exists, the predict engine wires up.

Page namespace keys map to filenames:
- `home` → matches `index.html` (URL `/` or `/index.html`)
- `files` → `files.html`
- `subjects` → `subjects.html`
- `games` → `games.html`
- `podcast` → `podcast.html`
- `stories` → `stories.html`
- `songs` → `songs.html`

---

## Quick sanity checks after running the builder

After every build, sanity-check by hitting the dict over the localhost server:

```
http://127.0.0.1:8000/dict/stories.json
```

You should see your JSON. Then in an incognito tab on `http://127.0.0.1:8000/stories.html`, open Dominic's chat, type the first letter of any question you authored — the ghost-text suggestion should match. Tab to accept, Enter to deliver the answer.

If a question doesn't appear as a suggestion: most likely you forgot the bold (`**Question?**`) wrap on either the question line or the `**Also:**` line, and the regex skipped that block. Re-check the markdown shape against the template above.

---

## What NOT to do

- Don't hand-edit `dict/<page>.json`. It's overwritten on every build. Edit the markdown, run the builder.
- Don't put Q&A markdown files anywhere other than `MISC_files/Chatbot/Dominics_Chatbot/`. The builder looks only there.
- Don't try to use this for the archive or short-story sub-folder pages — Dominic doesn't live on those (he only appears on the 7 main pages). Q&A about an archive belongs in the dictionary for `files.html` (the page that links to that archive). Q&A about a story belongs in `stories.json`.
- Don't author answers longer than 3 sentences. The chat panel is small and the experience is "tiny window of reveal", not "wall of text."

---

## Where the runtime code lives (for the curious; no edits required to add Q&A)

| File | Role |
|---|---|
| `NETWORK_PEOPLE_SANDBOX/_build_dict.py` | Reads markdown, writes JSON. Run after every Q&A edit. |
| `NETWORK_PEOPLE_SANDBOX/dict/<page>.json` | Generated. Fetched by the chatbot at runtime. |
| `NETWORK_PEOPLE_SANDBOX/dominic-lite.js` | Shows the chat panel on the 7 main pages. On first open, fetches the page's dict and bootstraps the predict engine. |
| `NETWORK_PEOPLE_SANDBOX/dominic-predict.js` | Ghost-text suggestions + answer delivery. Pure pattern matching against the loaded dict. |

You should not need to touch any of these to add content. If you do, it means the format spec above is missing something — flag it and we'll extend.

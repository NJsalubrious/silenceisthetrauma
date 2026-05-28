/**
 * DOMINIC RYKER — chatbot shell for the unison pages.
 *
 * Phase 1 (current): attach to the existing inline monolith markup
 *   (#dominic-orb, #dominic-chat-panel, etc.) on the 7 main SEO pages
 *   ONLY. Sub-folder pages (archives in /library/loc_archives/, stories
 *   in /short_stories/) inherit the markup from the shared shell but
 *   this script returns early on them — no orb, no panel, no listeners.
 *
 * Phase 2 (future): on first chat-panel open, lazy-load
 *   dominic-predict.js + the page's /dict/<page>.json to power the
 *   ghost-text suggestions and the response delivery.
 *
 * Phase 1 visual is driven entirely by master-hub.css. This file does
 * not inject any CSS.
 */

(function () {
    'use strict';

    // Page-key map — only these URLs activate Dominic.
    // The path is matched after stripping the leading slash; values are
    // the namespace string used by Barba and by the future dict files.
    const PAGE_BY_PATH = {
        '': 'home',
        'index.html': 'home',
        'files.html': 'files',
        'subjects.html': 'subjects',
        'games.html': 'games',
        'podcast.html': 'podcast',
        'stories.html': 'stories',
        'songs.html': 'songs'
    };

    function getMainPageKey() {
        const filename = (window.location.pathname.split('/').pop() || '').toLowerCase();
        // Only main-page paths are accepted. Anything in /short_stories/ or
        // /library/loc_archives/ etc. produces a non-root pathname and is
        // rejected here regardless of filename.
        const path = window.location.pathname;
        const isAtRoot =
            path === '/' ||
            path === '' ||
            (path.startsWith('/') && path.indexOf('/', 1) === -1);
        if (!isAtRoot) return null;
        // Cloudflare Pages serves clean URLs (e.g. /files for files.html).
        // Normalize so the lookup matches whether or not the extension is present.
        const normalized = filename === '' ? '' :
            (filename.endsWith('.html') ? filename : filename + '.html');
        return PAGE_BY_PATH[normalized] || null;
    }

    // Barba data-barba-namespace -> our page key (the filename in dict/).
    // Most line up 1:1 with the page filename, but songs.html uses
    // namespace "audio" historically, so we map it explicitly here.
    const NAMESPACE_TO_PAGE = {
        home: 'home',
        files: 'files',
        subjects: 'subjects',
        games: 'games',
        podcast: 'podcast',
        stories: 'stories',
        audio: 'songs'
    };

    function init() {
        let page = getMainPageKey();
        if (!page) {
            // Sub-folder page (archive / story / etc). Dominic does not run
            // here. Markup may be present from the shared shell but we leave
            // it dormant — the orb's default state is display:none, so it
            // stays invisible.
            return;
        }

        const orb = document.getElementById('dominic-orb');
        const panel = document.getElementById('dominic-chat-panel');
        const hibernate = document.getElementById('dominic-hibernate-btn');
        const input = document.getElementById('dominic-input');
        const typewriter = document.getElementById('dominic-typewriter');

        if (!orb || !panel) {
            // Shell markup missing — bail silently. No reason to throw on a
            // page that for whatever reason doesn't have the structure.
            return;
        }

        // Phase 1: surface the orb. CSS .visible adds display:flex + opacity.
        orb.classList.add('visible');

        function openPanel() {
            orb.classList.remove('visible');
            panel.classList.add('open');
            playOpeningLine();
            // Practical "ask about a specific X" hint in the input itself.
            // `page` is kept current by init() + onDominicPageChange.
            if (input) input.placeholder = PLACEHOLDER_HINTS[page] || '';
            if (input) setTimeout(function () { input.focus(); }, 350);
            // Phase 2: lazy-load predict engine + per-page dictionary
            // on first open. Subsequent opens are no-ops because
            // DominicPredict.init is idempotent.
            ensurePredictLoaded();
        }

        function closePanel() {
            panel.classList.remove('open');
            orb.classList.add('visible');
            if (typewriter) typewriter.textContent = '';
            if (input) input.value = '';
        }

        orb.addEventListener('click', openPanel);
        if (hibernate) hibernate.addEventListener('click', closePanel);

        // Barba doesn't unmount the shell, but on cross-page nav we want
        // the panel hidden again so the new page starts fresh. popstate
        // catches browser back/forward; Barba's onDominicPageChange hook
        // catches the PJAX navigations.
        window.addEventListener('popstate', function () {
            if (panel.classList.contains('open')) closePanel();
        });

        // barba-router.js calls window.onDominicPageChange(namespace) on
        // every successful container swap. Use that to:
        //   - hide the orb when entering a sub-folder page (archive/standalone)
        //   - re-show it AND update the page key + reset the predict engine
        //     when entering another main page, so the dict for the new page
        //     gets fetched and DominicPredict gets re-initialised with it
        //   - close any open panel on every navigation so each page starts clean
        window.onDominicPageChange = function (namespace) {
            if (panel.classList.contains('open')) closePanel();
            const newPage = NAMESPACE_TO_PAGE[namespace] || null;
            if (newPage) {
                orb.classList.add('visible');
                page = newPage;  // update the closure so ensurePredictLoaded fetches the right dict
                if (window.DominicShell) window.DominicShell.page = newPage;
                // Reset the lazy-load flag — next openPanel will re-fetch
                // /dict/<newPage>.json and re-init the predict engine.
                _predictBootStarted = false;
            } else {
                orb.classList.remove('visible');
            }
        };

        // Per-page opening line, in Dominic's voice. Each one tells the
        // visitor what they can ask on this page (ask about X by name) while
        // staying in character: cold, controlling, everything-is-a-system.
        // The `page` closure var is kept current by init() and by
        // onDominicPageChange, so the right line is picked on each open.
        let _typing = false;
        // Single architectural aphorism per page, per the Dominic bible:
        // one sentence, true in general, concealing a move, no instruction,
        // no question, no explanation. Each is about its page's domain, so it
        // orients the visitor by what it concerns rather than by telling them
        // what to do. (Functional "ask about X" hints belong in the input
        // ghost-text, not in Dominic's voice.)
        const OPENING_LINES = {
            home:     "A transmission. Read between the noise. I'm here to help.",
            files:    'The Archives. Ask me about them.',
            subjects: 'Me. My daughter Ethel and my step-daughter Isla. Ask me about them.',
            games:    'Games. Safe little escapism. I prefer reality.',
            podcast:  'The narratives people tell themselves. I prefer mine. Ask me about them.',
            stories:  "It's all about who controls the narrative. Give me a story by title.",
            songs:    "You're free to listen; they were never arranged for your understanding."
        };
        // Practical guidance for the visitor, kept OUT of Dominic's spoken line
        // (which stays pure aphorism). This is plain UI placeholder text in the
        // input field, telling them what they can actually ask about per page.
        // Hints match what Dominic's per-page dictionary can actually answer:
        //   files / subjects / stories  -> have item-specific Q&A -> "a specific X"
        //   home                         -> case + character coverage
        //   podcast                      -> the two named shows (not "episodes")
        //   games / songs                -> by design he DEFLECTS specifics
        //     ("You chose to listen. Press play.") so people engage the work
        //     directly; the hint stays general and promises nothing per-item.
        const PLACEHOLDER_HINTS = {
            home:     'ask about anyone in the case...',
            files:    'ask about a specific file...',
            subjects: 'ask about a specific subject...',
            games:    'ask about the games...',
            podcast:  'ask about the podcast...',
            stories:  'The Equation shows my better side. Listen to it...',
            songs:    "listen to 'Structural Psychopathy'..."
        };
        const DEFAULT_OPENING_LINE = 'Go on.';
        function playOpeningLine() {
            if (!typewriter) return;
            if (_typing || typewriter.textContent) return;
            _typing = true;
            const line = OPENING_LINES[page] || DEFAULT_OPENING_LINE;
            typewriter.textContent = '';
            let i = 0;
            (function step() {
                if (i >= line.length) { _typing = false; return; }
                typewriter.textContent += line[i++];
                setTimeout(step, 55);
            })();
        }

        // ===== Phase 2: lazy-load predict engine + per-page dictionary =====
        // The first time the chat panel opens on a main page, we fetch the
        // dictionary for that page (e.g. /dict/stories.json). If found, we
        // dynamically inject dominic-predict.js and hand it the dict + shell
        // references. If 404, we silently skip — the chat panel still works
        // visually, just without ghost-text suggestions or answer delivery.
        let _predictBootStarted = false;

        function ensurePredictLoaded() {
            if (_predictBootStarted) return;
            _predictBootStarted = true;
            const dictUrl = '/dict/' + page + '.json';
            fetch(dictUrl, { cache: 'no-cache' })
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (dict) {
                    if (!dict) return; // 404 / parse failure -> silent no-op
                    loadScriptOnce('/dominic-predict.js?v=20260528c').then(function () {
                        if (window.DominicPredict && window.DominicShell) {
                            window.DominicPredict.init({ dict: dict, shell: window.DominicShell });
                        }
                    });
                })
                .catch(function () { /* network/parse error: silent */ });
        }

        function loadScriptOnce(src) {
            return new Promise(function (resolve, reject) {
                if (document.querySelector('script[data-dominic-predict]')) {
                    // already loaded — wait until window.DominicPredict is defined
                    if (window.DominicPredict) { resolve(); return; }
                    const t = setInterval(function () {
                        if (window.DominicPredict) { clearInterval(t); resolve(); }
                    }, 50);
                    return;
                }
                const s = document.createElement('script');
                s.src = src;
                s.async = true;
                s.dataset.dominicPredict = 'true';
                s.onload = function () { resolve(); };
                s.onerror = function () { reject(new Error('failed to load ' + src)); };
                document.head.appendChild(s);
            });
        }

        // Phase 2 hook surface — the predict/respond engines will reach in here.
        window.DominicShell = {
            page: page,
            panel: panel,
            orb: orb,
            input: input,
            hibernate: hibernate,
            typewriter: typewriter,
            get submit() { return document.getElementById('dominic-submit'); },
            get responseArea() { return document.getElementById('dominic-response-area'); },
            get ghostTyped() { return document.querySelector('#dominic-ghost-text .ghost-typed'); },
            get ghostCompletion() { return document.querySelector('#dominic-ghost-text .ghost-completion'); },
            get actionBar() { return document.getElementById('dominic-action-bar'); },
            openPanel: openPanel,
            closePanel: closePanel
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();

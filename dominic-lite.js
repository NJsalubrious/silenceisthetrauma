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

        // Placeholder opening line. Single short, low-key, voice-neutral.
        // Phase 2 will replace this when the predict/respond engine loads.
        let _typing = false;
        const OPENING_LINE = 'Go on.';
        function playOpeningLine() {
            if (!typewriter) return;
            if (_typing || typewriter.textContent) return;
            _typing = true;
            typewriter.textContent = '';
            let i = 0;
            (function step() {
                if (i >= OPENING_LINE.length) { _typing = false; return; }
                typewriter.textContent += OPENING_LINE[i++];
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
                    loadScriptOnce('/dominic-predict.js').then(function () {
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

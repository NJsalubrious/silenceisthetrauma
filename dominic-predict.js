/**
 * DOMINIC PREDICT — ghost-text engine + response delivery.
 *
 * Lazy-loaded by dominic-lite.js on first chat-panel open. Reads a
 * page-specific dictionary (e.g. /dict/stories.json) and powers:
 *
 *   - Inline ghost-text suggestions as the user types (Tab/Right-arrow
 *     to accept; tap on mobile).
 *   - Answer delivery on Enter or paper-plane click — matches the
 *     submitted text against the dictionary's `entries[].q` (exact,
 *     case-insensitive) and types the matching `a` into the typewriter.
 *
 * Ported from index_huge_monolith.html lines ~6765-6920, with all of
 * the stateful library hooks removed (dominicGetSuggestionPolicy,
 * currentConversationState, dominicSession, tracks, currentTrackId,
 * inferDominicActiveObjectsFromDOM, etc. — none of those exist on a
 * clean main page). The remaining engine is straight pattern matching.
 *
 * Public API (exposed via window.DominicPredict.init):
 *   DominicPredict.init({dict, shell})
 *     dict  : the JSON loaded from /dict/<page>.json
 *     shell : window.DominicShell (built by dominic-lite.js)
 *
 * Idempotent: calling init twice is a no-op the second time.
 */

(function () {
    'use strict';

    if (window.DominicPredict) return; // idempotent guard

    let _attached = false;
    let _dict = null;
    let _shell = null;
    let _currentSuggestion = null;
    let _typing = false;
    let _answerTimer = null;

    // Multi-match cycling: when the typed prefix matches more than one
    // dictionary question, we rotate through them so the visitor sees the
    // options instead of being stuck with whatever sorted first.
    let _matches = [];
    let _matchIndex = 0;
    let _cycleTimer = null;
    const MAX_MATCHES = 8;
    const CYCLE_MS = 1800;

    function init(opts) {
        if (!opts || !opts.dict || !opts.shell) return;
        // ALWAYS refresh _dict — this is the per-page dictionary; when the
        // visitor navigates between main pages via Barba, dominic-lite.js
        // calls init again with the new page's dict and we must update.
        _dict = opts.dict;
        _shell = opts.shell;
        if (!_shell.input || !_shell.ghostTyped || !_shell.ghostCompletion) return;
        // Attach listeners only on the FIRST init. Subsequent calls just
        // swap the dictionary; the listeners stay bound to the persistent
        // shell elements (input, ghost spans, etc.).
        if (!_attached) {
            attach();
            _attached = true;
        }
        // Clear any in-flight cycle state from the previous page's dict
        // so stale matches don't leak across the page change.
        _matches = [];
        _matchIndex = 0;
        if (_cycleTimer) { clearInterval(_cycleTimer); _cycleTimer = null; }
        if (_shell.ghostTyped) _shell.ghostTyped.textContent = '';
        if (_shell.ghostCompletion) _shell.ghostCompletion.textContent = '';
        _currentSuggestion = null;
    }

    function getSuggestions(typed) {
        if (!_dict || !_dict.index) return [];
        const lc = typed.toLowerCase();
        const first = lc[0];
        if (!first) return [];
        const bucket = _dict.index[first] || [];
        // Return only suggestions that START WITH the typed text. The ghost
        // text is always a valid continuation of what's already typed.
        const out = [];
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].startsWith(lc) && bucket[i].length > lc.length) {
                out.push(bucket[i]);
            }
        }
        // Easter egg: 'secret' is never first. Appended as the LAST
        // cyclable option when the typed text is a prefix of it, so a
        // visitor only finds it by cycling the 's' suggestions to the
        // end or by typing the word out.
        const SECRET = 'secret';
        if (lc.length > 0 && lc.length < SECRET.length && SECRET.startsWith(lc) && out.indexOf(SECRET) === -1) {
            const capped = out.slice(0, MAX_MATCHES - 1);
            capped.push(SECRET);
            return capped;
        }
        return out;
    }

    function stopCycle() {
        if (_cycleTimer) { clearInterval(_cycleTimer); _cycleTimer = null; }
    }

    function startCycle() {
        stopCycle();
        if (_matches.length <= 1) return;
        _cycleTimer = setInterval(function () {
            _matchIndex = (_matchIndex + 1) % _matches.length;
            renderCurrent();
        }, CYCLE_MS);
    }

    function renderCurrent() {
        const ghostTyped = _shell.ghostTyped;
        const ghostCompletion = _shell.ghostCompletion;
        const typed = _shell.input.value || '';
        if (!_matches.length || !typed) {
            ghostTyped.textContent = '';
            ghostCompletion.textContent = '';
            _currentSuggestion = null;
            return;
        }
        const m = _matches[_matchIndex] || _matches[0];
        ghostTyped.textContent = typed;
        ghostCompletion.textContent = m.substring(typed.length);
        _currentSuggestion = m;
    }

    function updateGhostText() {
        const typed = _shell.input.value || '';
        if (!typed) {
            _matches = [];
            _matchIndex = 0;
            stopCycle();
            renderCurrent();
            return;
        }
        _matches = getSuggestions(typed).slice(0, MAX_MATCHES);
        _matchIndex = 0;
        renderCurrent();
        startCycle();
    }

    function clearGhostText() {
        _matches = [];
        _matchIndex = 0;
        stopCycle();
        renderCurrent();
    }

    function acceptCurrentSuggestion() {
        if (!_currentSuggestion) return false;
        _shell.input.value = _currentSuggestion;
        clearGhostText();
        // Re-evaluate (the now-complete text may itself be a full question).
        setTimeout(updateGhostText, 10);
        return true;
    }

    function lookupAnswer(text) {
        if (!_dict || !_dict.entries) return null;
        // Strip trailing sentence punctuation so typing "ethel" matches
        // canonical "Ethel." and typing "hello." matches "hello". Keep in
        // sync with _build_dict.py's q_lc normalisation.
        const lc = (text || '').toLowerCase().replace(/[?.!]+$/, '').trim();
        // Easter egg answer, independent of the per-page dictionary.
        if (lc === 'secret') {
            return { q: 'secret', a: 'A secret? Here is my entire global network. Link: [NETWORK SECRETS](https://silenceisthetrauma.com/audit_gallery)' };
        }
        for (let i = 0; i < _dict.entries.length; i++) {
            if (_dict.entries[i].q === lc) return _dict.entries[i];
        }
        return null;
    }

    function typewriteAnswer(text) {
        const tw = _shell.typewriter;
        if (!tw) return;
        // Cancel any answer already being typed and replace it, rather than
        // dropping the new one (which the old `if (_typing) return` did).
        if (_answerTimer) { clearTimeout(_answerTimer); _answerTimer = null; }
        _typing = true;
        tw.textContent = '';

        // Tokenise the answer into plain-text runs and [label](url) anchors.
        // Plain answers (no markdown links) hit the same path as before.
        const tokens = [];
        const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
        let lastIdx = 0;
        let m;
        while ((m = linkRe.exec(text)) !== null) {
            if (m.index > lastIdx) tokens.push({ t: 'text', v: text.slice(lastIdx, m.index) });
            tokens.push({ t: 'link', label: m[1], url: m[2] });
            lastIdx = m.index + m[0].length;
        }
        if (lastIdx < text.length) tokens.push({ t: 'text', v: text.slice(lastIdx) });

        let tokenIdx = 0;
        let charIdx = 0;
        let activeText = null;

        (function step() {
            if (tokenIdx >= tokens.length) { _typing = false; return; }
            const tok = tokens[tokenIdx];
            if (tok.t === 'text') {
                if (!activeText) {
                    activeText = document.createTextNode('');
                    tw.appendChild(activeText);
                }
                if (charIdx >= tok.v.length) {
                    tokenIdx++; charIdx = 0; activeText = null;
                    _answerTimer = setTimeout(step, 0);
                    return;
                }
                activeText.appendData(tok.v[charIdx++]);
                _answerTimer = setTimeout(step, 28);
            } else {
                // Anchor pops in as a unit — the visual cue is meant to be seen.
                // Always open in a new tab: bypasses Barba's PJAX interception
                // for internal targets (the void), and is what we want for
                // external character sites anyway.
                const a = document.createElement('a');
                a.href = tok.url;
                a.textContent = tok.label;
                a.className = 'dominic-link';
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.style.textDecoration = 'underline';
                a.style.cursor = 'pointer';
                tw.appendChild(a);
                activeText = null;
                tokenIdx++;
                _answerTimer = setTimeout(step, 28);
            }
        })();
    }

    function submitCurrent() {
        const typed = (_shell.input.value || '').trim();
        if (!typed) return;
        // Kill any in-progress opening line before delivering an answer, or the
        // two typewriters fight over #dominic-typewriter and produce garbled
        // output (e.g. the opener's leftover "...e me a story by title").
        if (_shell.cancelOpeningLine) _shell.cancelOpeningLine();
        const entry = lookupAnswer(typed);
        if (entry) {
            typewriteAnswer(entry.a);
        } else {
            // No matching dictionary entry — gentle non-cliché fallback.
            typewriteAnswer('Try another question.');
        }
        _shell.input.value = '';
        clearGhostText();
    }

    function attach() {
        const input = _shell.input;

        input.addEventListener('input', updateGhostText);
        input.addEventListener('focus', function () { setTimeout(updateGhostText, 30); });
        input.addEventListener('blur', function () {
            if (!input.value || !input.value.trim()) setTimeout(clearGhostText, 150);
        });

        input.addEventListener('keydown', function (e) {
            // Tab or right-arrow at end of input -> accept currently shown ghost.
            if (_currentSuggestion) {
                if (e.key === 'Tab' || (e.key === 'ArrowRight' && input.selectionStart === input.value.length)) {
                    e.preventDefault();
                    acceptCurrentSuggestion();
                    return;
                }
            }
            // Arrow Down / Up: manually cycle through multi-match suggestions
            // without waiting for the rotation timer.
            if (_matches.length > 1) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    _matchIndex = (_matchIndex + 1) % _matches.length;
                    renderCurrent();
                    startCycle(); // reset timer
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    _matchIndex = (_matchIndex - 1 + _matches.length) % _matches.length;
                    renderCurrent();
                    startCycle();
                    return;
                }
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                // If a ghost suggestion is currently shown and the visitor
                // hasn't typed it out in full, treat Enter as "accept + submit"
                // — so typing `w` and pressing Enter delivers the answer to
                // whichever question is currently in the ghost. Without this,
                // Enter would submit the literal `w`, which never matches any
                // entry, and the visitor would get the fallback even though
                // a perfectly valid suggestion was visible.
                if (_currentSuggestion && input.value.length < _currentSuggestion.length) {
                    input.value = _currentSuggestion;
                    clearGhostText();
                }
                submitCurrent();
            }
        });

        // Paper-plane submit button.
        const submit = _shell.submit;
        if (submit) submit.addEventListener('click', function () { submitCurrent(); });

        // Mobile: tap the ghost-text region to accept the current suggestion.
        // The ghost overlay sits ON TOP of the input on mobile (pointer-events:
        // auto, z-index 5), so it intercepts taps meant for the field. If there
        // is no suggestion to accept, the tap must still fall through to focusing
        // the input, or the user can't re-enter the field after blurring it.
        // focus() is called synchronously inside the gesture so the mobile
        // keyboard reopens.
        const ghost = document.getElementById('dominic-ghost-text');
        if (ghost) {
            ghost.addEventListener('click', function (e) {
                if (!_currentSuggestion) {
                    input.focus();
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                acceptCurrentSuggestion();
                input.focus();
            });
        }

        // Show an idle hint when the panel is empty and freshly opened.
        if (!input.value) clearGhostText();
    }

    window.DominicPredict = { init: init };
})();

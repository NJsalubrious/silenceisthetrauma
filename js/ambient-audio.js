/**
 * SILENCE IS THE TRAUMA — Ambient Audio Player
 * Plays the four theme songs in order in the persistent shell.
 * Each entry starts with track 1 or 2; Barba navigation keeps playback intact.
 * Fades out when the user navigates to the Songs page.
 * Respects browser autoplay policy.
 */

(function () {
    'use strict';

    // Resolve once against this script, not the current page: Barba can move
    // into nested story/archive URLs while this same player keeps running.
    const SITE_URL = new URL('../', document.currentScript.src);
    const TRACKS = [
        'theme_songs/1_Silence_Is_The_Trauma_Theme_Song.mp3',
        'theme_songs/2_Ethel_Wont_Break_Where_Others_End.mp3',
        'theme_songs/3_Isla_Keep_the_Music_On.mp3',
        "theme_songs/4_Dominic_You'll_Do_It_Yourself.mp3"
    ].map(src => new URL(src, SITE_URL).href);
    let audio = null;
    let currentTrackIndex = Math.floor(Math.random() * 2);
    let isFadedOut = false;
    let fadeInterval = null;
    let muteToggles = []; // one button in the desktop nav, one in the mobile burger row
    let isMuted = false;
    let fadedByNarration = false; // true only while a story narration has ducked us
    const TARGET_VOLUME = 0.25; // Ambient, not dominant

    /**
     * Advance in playlist order, looping back to the first track after the last.
     */
    function advanceTrack(shouldPlay) {
        if (!audio) return;
        currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
        audio.src = TRACKS[currentTrackIndex];
        if (shouldPlay && !isMuted && !isFadedOut && !fadedByNarration) {
            audio.play().catch(() => {});
        }
        refreshToggleUI();
    }

    /**
     * Create the audio element in the persistent shell
     */
    function createAudioElement() {
        audio = document.createElement('audio');
        audio.id = 'ambient-audio';
        audio.preload = 'auto';
        audio.setAttribute('playsinline', ''); // iOS: allow inline (non-fullscreen) playback
        audio.volume = TARGET_VOLUME;

        // Preload the selected starting song before the entry gesture. Never change the source
        // merely because the user navigated to another Barba page.
        audio.src = TRACKS[currentTrackIndex];

        audio.addEventListener('ended', () => advanceTrack(true));
        audio.addEventListener('play', refreshToggleUI);
        audio.addEventListener('pause', refreshToggleUI);

        document.body.appendChild(audio);
    }

    /**
     * Build a single mute/unmute toggle button (styled, wired to toggleMute).
     */
    function buildToggleButton() {
        const btn = document.createElement('button');
        btn.className = 'ambient-mute-toggle';
        btn.setAttribute('aria-label', 'Toggle ambient music');
        btn.setAttribute('title', 'Toggle ambient music');
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">volume_up</span>';

        Object.assign(btn.style, {
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#00ff41',
            transition: 'all 0.3s ease',
            marginLeft: '12px',
            opacity: '0.6',
            flexShrink: '0'
        });

        btn.addEventListener('mouseover', () => {
            btn.style.opacity = '1';
            btn.style.borderColor = '#00ff41';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.opacity = '0.6';
            btn.style.borderColor = 'rgba(255,255,255,0.15)';
        });
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMute();
        });

        return btn;
    }

    function buildControls() {
        const controls = document.createElement('div');
        controls.className = 'ambient-audio-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Background music');
        Object.assign(controls.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: '0'
        });

        const playButton = buildToggleButton();
        playButton.style.marginLeft = '0';
        muteToggles.push(playButton);

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'ambient-next-track';
        nextButton.setAttribute('aria-label', 'Skip to next song');
        nextButton.setAttribute('title', 'Skip to next song');
        nextButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true" style="font-size:20px;">skip_next</span>';
        Object.assign(nextButton.style, {
            background: 'none',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '36px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#00ff41',
            opacity: '0.6',
            transition: 'opacity 0.2s ease'
        });
        nextButton.addEventListener('mouseover', () => { nextButton.style.opacity = '1'; });
        nextButton.addEventListener('mouseout', () => { nextButton.style.opacity = '0.6'; });
        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Selecting another track while paused leaves the player paused.
            advanceTrack(!audio.paused);
        });

        controls.appendChild(playButton);
        controls.appendChild(nextButton);
        return controls;
    }

    /**
     * Reflect the current play/pause state on every toggle button.
     */
    function refreshToggleUI() {
        const playing = audio && !audio.paused && !isMuted;
        muteToggles.forEach(btn => {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = playing ? 'pause' : 'play_arrow';
            btn.style.color = playing ? '#00ff41' : '#666';
            btn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
            btn.setAttribute('title', playing ? 'Pause background music' : 'Play background music');
        });
    }

    /**
     * Create mute/unmute toggles in BOTH the desktop nav and the mobile burger
     * row, so the control is reachable on every breakpoint. The desktop nav
     * group is hidden on mobile (hidden md:block), so a mobile-only copy is
     * placed next to the hamburger button (.flex.md:hidden).
     */
    function createMuteToggle() {
        muteToggles = [];

        const desktopNav = document.querySelector('.ml-10.flex.items-baseline');
        if (desktopNav) {
            const controls = buildControls();
            controls.style.marginLeft = '12px';
            desktopNav.appendChild(controls);
        }

        // Mobile: the hamburger lives in a `-mr-2 flex md:hidden` container.
        const mobileBurgerRow = document.querySelector('.flex.md\\:hidden');
        if (mobileBurgerRow) {
            const controls = buildControls();
            controls.style.marginRight = '8px';
            mobileBurgerRow.insertBefore(controls, mobileBurgerRow.firstChild);
        }
        refreshToggleUI();
    }

    /**
     * Toggle mute state
     */
    function toggleMute() {
        if (!audio) return;
        // An explicit button click takes priority over an in-progress page or
        // narration fade, including a manual pause while entering Songs.
        clearInterval(fadeInterval);
        fadeInterval = null;
        isFadedOut = false;
        fadedByNarration = false;
        
        if (audio.paused) {
            // Restore volume in case a narration fade left it at 0, and pause any
            // story narration — the two are mutually exclusive.
            audio.volume = TARGET_VOLUME;
            isMuted = false;
            if (typeof window.pauseStoryNarration === 'function') window.pauseStoryNarration();
            startPlayback().catch(e => console.log('Audio play failed:', e));
        } else {
            audio.pause();
            isMuted = true;
        }

        refreshToggleUI();
    }

    /**
     * Bind the first-gesture starter. Named and idempotent so it can be re-armed
     * after a bfcache restore, where the original binding has already unbound.
     */
    let interactionArmed = false;
    let disarmFirstInteraction = () => {};
    function armFirstInteraction() {
        if (interactionArmed) return;
        interactionArmed = true;
        // Mobile (esp. iOS) is fussy: touchstart often does NOT unlock audio, but
        // touchend / click / pointerup do. Run in the CAPTURE phase so an inner
        // stopPropagation() (brand dropdown, mute button) cannot swallow the
        // gesture, and only unbind once play() actually RESOLVES, so a blocked
        // first tap retries on the next interaction instead of giving up.
        const interactionEvents = ['pointerup', 'touchend', 'click', 'keydown'];
        const onFirstInteraction = (event) => {
            // These buttons handle their own gesture. A capture-phase play()
            // here would turn the very first Play click into a Pause click.
            if (event.target.closest && event.target.closest('.ambient-audio-controls')) return;
            if (isMuted || isFadedOut) return;
            startPlayback().catch(() => {
                // Still blocked — keep the listeners attached to retry.
            });
        };
        disarmFirstInteraction = () => {
            interactionArmed = false;
            interactionEvents.forEach(evt =>
                document.removeEventListener(evt, onFirstInteraction, true));
        };
        interactionEvents.forEach(evt =>
            document.addEventListener(evt, onFirstInteraction, true));
    }

    /**
     * Start playback after first user interaction
     */
    function startPlayback() {
        if (!audio) return Promise.reject(new Error('no audio element'));
        return Promise.resolve(audio.play()).then(() => {
            disarmFirstInteraction();
            // If a story narration is already playing (e.g. both unlocked on the
            // same first gesture), immediately duck back out.
            if (typeof window.isStoryNarrationPlaying === 'function' && window.isStoryNarrationPlaying()) {
                fadedByNarration = true;
                fadeTo(0, 800, () => { audio.pause(); refreshToggleUI(); });
            }
            refreshToggleUI();
        });
    }

    /**
     * Fade audio volume smoothly
     */
    function fadeTo(targetVol, durationMs, callback) {
        if (!audio || fadeInterval) clearInterval(fadeInterval);
        
        const startVol = audio.volume;
        const diff = targetVol - startVol;
        const steps = 20;
        const stepTime = durationMs / steps;
        let step = 0;

        fadeInterval = setInterval(() => {
            step++;
            audio.volume = Math.max(0, Math.min(1, startVol + (diff * (step / steps))));
            
            if (step >= steps) {
                clearInterval(fadeInterval);
                fadeInterval = null;
                audio.volume = targetVol;
                if (callback) callback();
            }
        }, stepTime);
    }

    /**
     * Called by barba-router when page changes
     */
    window.onBarbaPageChange = function (namespace) {
        // Any navigation ends the current story's narration (its <audio> lives in
        // the swapped container and could otherwise keep playing detached). Stop
        // it, and lift the duck it placed on the ambient theme.
        if (typeof window.pauseStoryNarration === 'function') {
            try { window.pauseStoryNarration(); } catch (e) {}
        }
        if (fadedByNarration && namespace !== 'audio') {
            window.resumeAmbientMusic(1200);
        }
        if (namespace === 'audio') {
            // Entering Songs page — fade out ambient
            // A stopped narration dispatches its pause event asynchronously.
            // Retire that duck before it can resume music over the Songs page.
            fadedByNarration = false;
            isFadedOut = true;
            if (audio && !audio.paused) {
                fadeTo(0, 2000, () => {
                    audio.pause();
                });
            } else if (audio) {
                clearInterval(fadeInterval);
                fadeInterval = null;
                audio.volume = 0;
            }
        } else {
            // Leaving Songs page — fade back in
            if (isFadedOut && audio) {
                isFadedOut = false;
                if (isMuted) return;
                audio.play().then(() => {
                    fadeTo(TARGET_VOLUME, 1500);
                    refreshToggleUI();
                }).catch(() => {});
            }
        }
    };

    /**
     * Initialize
     */
    function init() {
        createAudioElement();
        createMuteToggle();

        // If the user landed directly on the Songs page, suppress ambient at
        // start so the YouTube track isn't fighting the theme song. Flag it
        // as faded-out so onBarbaPageChange will fade it in when they navigate away.
        const initialContainer = document.querySelector('[data-barba="container"]');
        const initialNamespace = initialContainer && initialContainer.getAttribute('data-barba-namespace');
        if (initialNamespace === 'audio') {
            isFadedOut = true;
            audio.volume = 0; // so the fade-in on leaving Songs is smooth
            refreshToggleUI();
            // Don't bind the first-interaction starter on this page.
        } else {
            // Start playback on the first real user gesture. Mobile (esp. iOS)
            // is fussy: touchstart often does NOT unlock audio, but touchend /
            // click / pointerup do. So we:
            //   - listen for several gesture types,
            //   - run in the CAPTURE phase so inner stopPropagation() (brand
            //     dropdown, mute button) can't swallow the gesture,
            //   - only unbind once play() actually RESOLVES, so a blocked first
            //     tap retries on the next interaction instead of giving up.
            armFirstInteraction();
        }

        // A page restored from the back/forward cache does not re-run init():
        // no scripts execute, DOMContentLoaded never fires, and the browser has
        // paused the <audio>. The starter above has already unbound itself, so
        // nothing is left that can start the theme and the toggle shows a state
        // that is no longer true. Poetry and veX are deliberate hard cuts, so
        // coming back from them is exactly this case. Re-sync and re-arm.
        window.addEventListener('pageshow', function (e) {
            if (!e.persisted) return;
            if (audio && audio.paused && !isMuted && !isFadedOut) {
                armFirstInteraction();
            }
            refreshToggleUI();
        });

        // Expose to window so other scripts can pause it
        window.pauseAmbientMusic = function() {
            if (audio && !audio.paused) {
                audio.pause();
                isMuted = true;
                refreshToggleUI();
            }
        };

        // Story narration ducks the ambient theme: fade out while narration plays,
        // fade back in when it stops. Only auto-resumes a fade WE caused (so a
        // manual mute is respected). The theme is a loop, so resume position
        // doesn't matter — it just fades back up wherever it is.
        window.fadeOutAmbientMusic = function (ms) {
            if (!audio || audio.paused) return;
            fadedByNarration = true;
            fadeTo(0, ms || 1200, () => { audio.pause(); refreshToggleUI(); });
        };
        window.resumeAmbientMusic = function (ms) {
            if (!audio || !fadedByNarration) return;
            fadedByNarration = false;
            if (isMuted || isFadedOut) return;
            audio.volume = 0;
            audio.play().then(() => {
                fadeTo(TARGET_VOLUME, ms || 1500);
                refreshToggleUI();
            }).catch(() => {});
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

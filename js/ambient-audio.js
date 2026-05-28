/**
 * SILENCE IS THE TRAUMA — Ambient Audio Player
 * Plays two theme songs on loop in the persistent shell.
 * Fades out when the user navigates to the Songs page.
 * Respects browser autoplay policy.
 */

(function () {
    'use strict';

    const TRACKS = [
        'theme_songs/1_Silence_Is_The_Trauma_Theme_Song.mp3',
        'theme_songs/2_Ethel_Wont_Break_Where_Others_End.mp3'
    ];

    let audio = null;
    let currentTrackIndex = 0;
    let userHasInteracted = false;
    let isFadedOut = false;
    let fadeInterval = null;
    let muteToggles = []; // one button in the desktop nav, one in the mobile burger row
    let isMuted = false;
    const TARGET_VOLUME = 0.25; // Ambient, not dominant

    /**
     * Create the audio element in the persistent shell
     */
    function createAudioElement() {
        audio = document.createElement('audio');
        audio.id = 'ambient-audio';
        audio.preload = 'auto';
        audio.volume = TARGET_VOLUME;
        audio.src = TRACKS[currentTrackIndex];

        // When one track ends, play the next and loop
        audio.addEventListener('ended', () => {
            currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
            audio.src = TRACKS[currentTrackIndex];
            audio.play().catch(() => {});
        });

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

    /**
     * Reflect the current play/pause state on every toggle button.
     */
    function refreshToggleUI() {
        const playing = audio && !audio.paused && !isMuted;
        muteToggles.forEach(btn => {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = playing ? 'pause' : 'play_arrow';
            btn.style.color = playing ? '#00ff41' : '#666';
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
            const b = buildToggleButton();
            desktopNav.appendChild(b);
            muteToggles.push(b);
        }

        // Mobile: the hamburger lives in a `-mr-2 flex md:hidden` container.
        const mobileBurgerRow = document.querySelector('.flex.md\\:hidden');
        if (mobileBurgerRow) {
            const b = buildToggleButton();
            b.style.marginLeft = '0';
            b.style.marginRight = '8px';
            mobileBurgerRow.insertBefore(b, mobileBurgerRow.firstChild);
            muteToggles.push(b);
        }
    }

    /**
     * Toggle mute state
     */
    function toggleMute() {
        if (!audio) return;
        
        if (audio.paused) {
            audio.play().catch(e => console.log('Audio play failed:', e));
            isMuted = false;
        } else {
            audio.pause();
            isMuted = true;
        }

        refreshToggleUI();
    }

    /**
     * Start playback after first user interaction
     */
    function startPlayback() {
        if (userHasInteracted || !audio) return;
        userHasInteracted = true;

        // Try to resume from sessionStorage
        const savedPos = sessionStorage.getItem('ambient_position');
        const savedTrack = sessionStorage.getItem('ambient_track');
        
        if (savedTrack !== null) {
            currentTrackIndex = parseInt(savedTrack, 10) || 0;
            audio.src = TRACKS[currentTrackIndex];
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (savedPos) {
                    audio.currentTime = parseFloat(savedPos) || 0;
                }
                refreshToggleUI();
            }).catch(() => {
                // Autoplay blocked — will try again on next interaction
                userHasInteracted = false;
            });
        }
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
        if (namespace === 'audio') {
            // Entering Songs page — fade out ambient
            if (!isFadedOut && audio && !audio.paused) {
                isFadedOut = true;
                fadeTo(0, 2000, () => {
                    audio.pause();
                });
            }
        } else {
            // Leaving Songs page — fade back in
            if (isFadedOut && audio) {
                isFadedOut = false;
                userHasInteracted = true;
                audio.play().then(() => {
                    fadeTo(TARGET_VOLUME, 1500);
                    refreshToggleUI();
                }).catch(() => {});
            }
        }
    };

    /**
     * Save state before page unload (hard refresh)
     */
    function saveState() {
        if (audio) {
            sessionStorage.setItem('ambient_position', audio.currentTime.toString());
            sessionStorage.setItem('ambient_track', currentTrackIndex.toString());
        }
    }

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
            // Still allow saveState etc. to attach below; just don't bind the
            // first-interaction starter on this page.
        } else {
            // Listen for first interaction to start playback
            const interactionEvents = ['click', 'touchstart', 'keydown'];
            const onFirstInteraction = () => {
                startPlayback();
                interactionEvents.forEach(evt => {
                    document.removeEventListener(evt, onFirstInteraction);
                });
            };
            interactionEvents.forEach(evt => {
                document.addEventListener(evt, onFirstInteraction, { once: false });
            });
        }

        // Save state before unload
        window.addEventListener('beforeunload', saveState);

        // Continuously save position
        setInterval(saveState, 2000);
        
        // Expose to window so other scripts can pause it
        window.pauseAmbientMusic = function() {
            if (audio && !audio.paused) {
                audio.pause();
                isMuted = true;
                refreshToggleUI();
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

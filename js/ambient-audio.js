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
    let muteToggle = null;
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
     * Create the mute/unmute toggle button in the nav
     */
    function createMuteToggle() {
        muteToggle = document.createElement('button');
        muteToggle.id = 'ambient-mute-toggle';
        muteToggle.setAttribute('aria-label', 'Toggle ambient music');
        muteToggle.setAttribute('title', 'Toggle ambient music');
        muteToggle.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">volume_up</span>';
        
        // Style it
        Object.assign(muteToggle.style, {
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

        muteToggle.addEventListener('mouseover', () => {
            muteToggle.style.opacity = '1';
            muteToggle.style.borderColor = '#00ff41';
        });
        muteToggle.addEventListener('mouseout', () => {
            muteToggle.style.opacity = '0.6';
            muteToggle.style.borderColor = 'rgba(255,255,255,0.15)';
        });

        muteToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMute();
        });

        // Insert into the nav bar, after the desktop nav links
        const navLinks = document.querySelector('.ml-10.flex.items-baseline');
        if (navLinks) {
            navLinks.appendChild(muteToggle);
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
        
        if (muteToggle) {
            const icon = muteToggle.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = audio.paused ? 'play_arrow' : 'pause';
            }
            muteToggle.style.color = audio.paused ? '#666' : '#00ff41';
        }
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
                audio.play().then(() => {
                    fadeTo(TARGET_VOLUME, 1500);
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

        // Save state before unload
        window.addEventListener('beforeunload', saveState);

        // Continuously save position
        setInterval(saveState, 2000);
        
        // Expose to window so other scripts can pause it
        window.pauseAmbientMusic = function() {
            if (audio && !audio.paused) {
                audio.pause();
                isMuted = true;
                if (muteToggle) {
                    const icon = muteToggle.querySelector('.material-symbols-outlined');
                    if (icon) icon.textContent = 'play_arrow';
                    muteToggle.style.color = '#666';
                }
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

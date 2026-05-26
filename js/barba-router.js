/**
 * SILENCE IS THE TRAUMA — Barba.js PJAX Router
 * Intercepts navigation, swaps <main> content, preserves persistent shell
 * (nav, branding, Dominic chatbot, audio player, modals)
 */

(function () {
    'use strict';

    // Page-specific init functions mapped by barba namespace
    const PAGE_INIT = {
        home: ['initNoiseCanvas', 'loadGalleryMap'],
        files: ['renderFiles'],
        subjects: ['renderProfiles'],
        games: ['renderGames'],
        podcast: ['renderPodcasts'],
        stories: ['renderStories'],
        audio: ['renderPlaylist', 'createVisualizerBars']
    };

    // Map namespace to nav button IDs
    const NAV_MAP = {
        home: 'nav-home',
        files: 'nav-files',
        subjects: 'nav-profiles',
        games: 'nav-games',
        podcast: 'nav-podcast',
        stories: 'nav-stories',
        audio: 'nav-audio'
    };

    /**
     * Update the active tab highlight in the navigation
     */
    function setActiveNav(namespace) {
        // Remove active from all
        Object.values(NAV_MAP).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active-tab');
        });

        // Add to current
        const activeId = NAV_MAP[namespace];
        if (activeId) {
            const el = document.getElementById(activeId);
            if (el) el.classList.add('active-tab');
        }
    }

    /**
     * Update <title> and meta tags from the fetched page
     */
    function updateHead(data) {
        // data.next.html contains the full HTML string of the fetched page
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.next.html, 'text/html');

        // Update title
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.textContent;

        // Update meta description
        const newDesc = doc.querySelector('meta[name="description"]');
        const curDesc = document.querySelector('meta[name="description"]');
        if (newDesc && curDesc) curDesc.setAttribute('content', newDesc.getAttribute('content'));

        // Update canonical
        const newCanonical = doc.querySelector('link[rel="canonical"]');
        const curCanonical = document.querySelector('link[rel="canonical"]');
        if (newCanonical && curCanonical) curCanonical.setAttribute('href', newCanonical.getAttribute('href'));

        // Update OG tags
        ['og:title', 'og:description', 'og:url', 'og:image'].forEach(prop => {
            const newTag = doc.querySelector(`meta[property="${prop}"]`);
            const curTag = document.querySelector(`meta[property="${prop}"]`);
            if (newTag && curTag) curTag.setAttribute('content', newTag.getAttribute('content'));
        });

        // Update Schema.org JSON-LD
        const newSchema = doc.querySelector('script[type="application/ld+json"]');
        const curSchema = document.querySelector('script[type="application/ld+json"]');
        if (newSchema && curSchema) curSchema.textContent = newSchema.textContent;
    }

    /**
     * Fire Google Analytics pageview
     */
    function trackPageView(url) {
        if (typeof gtag === 'function') {
            gtag('config', 'G-34H8LS884F', { page_path: url });
        }
    }

    /**
     * Cancel any active DominicParasite sequences and ghost engine timers
     */
    function cleanupPageState() {
        if (typeof cancelActiveOutput === 'function') cancelActiveOutput();
        if (typeof profilesSequenceActive !== 'undefined') window.profilesSequenceActive = false;
        if (typeof podcastSequenceActive !== 'undefined') window.podcastSequenceActive = false;
        if (typeof observerAutoCloseTimer !== 'undefined' && observerAutoCloseTimer) {
            clearTimeout(observerAutoCloseTimer);
        }
    }

    /**
     * Re-initialize page-specific scripts after DOM swap
     */
    function initPageScripts(namespace) {
        const funcs = PAGE_INIT[namespace] || [];
        funcs.forEach(fnName => {
            if (typeof window[fnName] === 'function') {
                try {
                    window[fnName]();
                } catch (e) {
                    console.warn(`[Barba] Failed to init ${fnName}:`, e);
                }
            }
        });
    }

    /**
     * Execute inline <script> tags from the swapped container
     * (Barba doesn't execute scripts in the new container by default)
     */
    function executeContainerScripts(container) {
        const scripts = container.querySelectorAll('script');
        
        // Intercept DOMContentLoaded listeners attached during script injection
        // This ensures all legacy and future content scripts run without requiring rewrites
        const pendingCallbacks = [];
        
        const originalDocAddEventListener = document.addEventListener;
        const originalWinAddEventListener = window.addEventListener;
        
        function interceptListener(type, listener, options, original) {
            if (type === 'DOMContentLoaded' || type === 'load') {
                pendingCallbacks.push(listener);
            } else {
                original.call(this, type, listener, options);
            }
        }

        document.addEventListener = function(type, listener, options) {
            interceptListener.call(this, type, listener, options, originalDocAddEventListener);
        };
        
        window.addEventListener = function(type, listener, options) {
            interceptListener.call(this, type, listener, options, originalWinAddEventListener);
        };

        scripts.forEach(oldScript => {
            // Do not execute markdown content scripts
            if (oldScript.type === 'text/markdown') return;

            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            // Copy attributes
            Array.from(oldScript.attributes).forEach(attr => {
                if (attr.name !== 'src') {
                    newScript.setAttribute(attr.name, attr.value);
                }
            });
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Restore original listeners and execute captured callbacks
        document.addEventListener = originalDocAddEventListener;
        window.addEventListener = originalWinAddEventListener;
        
        setTimeout(() => {
            pendingCallbacks.forEach(fn => {
                try {
                    if (typeof fn === 'function') fn();
                    else if (fn && typeof fn.handleEvent === 'function') fn.handleEvent(new Event('DOMContentLoaded'));
                } catch(e) { 
                    console.error('Error executing injected script:', e); 
                }
            });
        }, 10);
    }

    /**
     * Notify ambient audio player of page change
     */
    function notifyAudioPlayer(namespace) {
        if (typeof window.onBarbaPageChange === 'function') {
            window.onBarbaPageChange(namespace);
        }
    }

    /**
     * Notify Dominic engine of page change for context-aware responses
     */
    function notifyDominic(namespace) {
        if (typeof window.onDominicPageChange === 'function') {
            window.onDominicPageChange(namespace);
        }
    }

    // =========================================================
    // INIT BARBA
    // =========================================================
    function initBarba() {
        if (typeof barba === 'undefined') {
            console.warn('[Barba] barba.js not loaded, falling back to standard navigation');
            return;
        }

        barba.init({
            // Prefetch on hover for near-instant transitions
            prefetchIgnore: false,

            // Prevent Barba from intercepting external links
            prevent: ({ el }) => {
                // Don't intercept external links
                if (el.hostname && el.hostname !== window.location.hostname) return true;
                // Don't intercept links with target="_blank"
                if (el.getAttribute('target') === '_blank') return true;
                // Don't intercept hash links
                if (el.getAttribute('href') && el.getAttribute('href').startsWith('#')) return true;
                
                // Force hard cuts to specific mini-sites that require their native headers
                const href = el.getAttribute('href') || '';
                if (href.includes('ethel_gallery')) return true;

                return false;
            },

            transitions: [{
                name: 'silence-transition',

                // Fade out current content
                leave(data) {
                    cleanupPageState();

                    return new Promise(resolve => {
                        data.current.container.style.transition = 'opacity 0.2s ease';
                        data.current.container.style.opacity = '0';
                        setTimeout(resolve, 200);
                    });
                },

                // Fade in new content
                enter(data) {
                    const namespace = data.next.namespace;

                    // Update head tags
                    updateHead(data);

                    // Update nav
                    setActiveNav(namespace);

                    // Scroll to top
                    window.scrollTo(0, 0);

                    // Execute scripts in the new container
                    executeContainerScripts(data.next.container);

                    // Re-init page-specific functions
                    initPageScripts(namespace);

                    // Notify subsystems
                    notifyAudioPlayer(namespace);
                    notifyDominic(namespace);

                    // Track pageview
                    trackPageView(window.location.pathname);

                    // Fade in
                    data.next.container.style.opacity = '0';
                    data.next.container.style.transition = 'opacity 0.3s ease';

                    return new Promise(resolve => {
                        requestAnimationFrame(() => {
                            data.next.container.style.opacity = '1';
                            setTimeout(resolve, 300);
                        });
                    });
                }
            }]
        });

        // Set initial active nav on first load
        const initialContainer = document.querySelector('[data-barba="container"]');
        if (initialContainer) {
            const initialNamespace = initialContainer.getAttribute('data-barba-namespace');
            setActiveNav(initialNamespace);
            initPageScripts(initialNamespace);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBarba);
    } else {
        initBarba();
    }
})();

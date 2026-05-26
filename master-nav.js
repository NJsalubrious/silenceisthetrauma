
        class BrandingGlitch {
            constructor(el) {
                this.el = el;
                this.chars = '!<>-_\\\\/[]{}-=+*^?#_01';
                this.update = this.update.bind(this);
            }
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise((resolve) => this.resolve = resolve);
                this.queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 15);
                    const end = start + Math.floor(Math.random() * 15);
                    this.queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            update() {
                let output = '';
                let complete = 0;
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.randomChar();
                            this.queue[i].char = char;
                        }
                        output += char;
                    } else {
                        output += from;
                    }
                }
                this.el.innerText = output;
                this.el.setAttribute('data-text', output);
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
            randomChar() {
                return this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }

        // ============================================================
        // UNISON NAV-HREF NORMALIZE (one-shot, on initial DOM load)
        // ------------------------------------------------------------
        // Top-nav anchors in the 7 SEO pages use bare hrefs ("stories.html").
        // Archives and stories use depth-aware relative hrefs ("../stories.html").
        // Both forms break after Barba pushes a sub-folder URL because the
        // nav stays from the original page-load while the address bar has
        // moved into /short_stories/ or /library/loc_archives/, and browsers
        // resolve bare/relative hrefs against the NEW URL.
        //
        // Solution: rewrite all nav hrefs to ROOT-RELATIVE ("/stories.html")
        // exactly once on initial load. After that they resolve identically
        // from any URL depth, so Barba navigation between root pages and
        // sub-folder pages always reaches the right target.
        // ============================================================
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('nav .font-mono-custom a[href], #mobile-menu a[href]').forEach(a => {
                let href = a.getAttribute('href');
                if (!href) return;
                if (href.startsWith('http') || href.startsWith('#') || href.startsWith('/')) return;
                // Strip leading ../ segments, then anchor to root.
                href = href.replace(/^(\.\.\/)+/, '');
                a.setAttribute('href', '/' + href);
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            const brandEl = document.querySelector('.brand-title');
            if (brandEl) {
                const brandFx = new BrandingGlitch(brandEl);
                const brandWords = [
                    'PIXELSTORTION', 'PROJECTS', 'BIO', 'SILENCE', 'MATAALA', 
                    'CINEMA', 'MUSIC', 'VEX', 'SOCIAL NETWORK', 'PIXELSTORTION', 
                    'NALANI', 'REDFERN', 'TURNBULL', 'PIXELSTORTION', 
                    'ETHEL', 'ISLA', 'DOMINIC', 'STICKY', 'KINLEY', 'PIXELSTORTION'
                ];
                let wordIndex = 0;

                function nextBrandWord() {
                    wordIndex = (wordIndex + 1) % brandWords.length;
                    brandFx.setText(brandWords[wordIndex]).then(() => {
                        let delay = 1500;
                        if (brandWords[wordIndex] === 'PIXELSTORTION') delay = 6000;
                        setTimeout(nextBrandWord, delay);
                    });
                }
                setTimeout(nextBrandWord, 6000);
            }

            // Highlight Active Link (Universal Matcher)
            const currentUrl = window.location.href.toLowerCase();
            const dropdownLinks = document.querySelectorAll('.brand-dropdown-item');

            dropdownLinks.forEach(link => {
                let href = link.getAttribute('href');
                if (!href) return;
                href = href.toLowerCase();
                
                let isMatch = false;
                if (href.includes('vex_social_network') && currentUrl.includes('vex_social_network')) isMatch = true;
                else if (href.includes('ethelryker.com') && currentUrl.includes('ethelryker')) isMatch = true;
                else if (href.includes('dominicryker.com') && currentUrl.includes('dominicryker')) isMatch = true;
                else if (href.includes('isla_album') && currentUrl.includes('isla_album')) isMatch = true;
                else if (href === 'https://islaband.com' && currentUrl.includes('islaband') && !currentUrl.includes('isla_album')) isMatch = true;
                else if (href.includes('zones/silence') && currentUrl.includes('silence') && !currentUrl.includes('silenceisthetrauma')) isMatch = true;
                else if (href === 'https://silenceisthetrauma.com' && currentUrl.includes('silenceisthetrauma') && !currentUrl.includes('vex_social_network')) isMatch = true;
                else if (href.includes('zones/mataala') && currentUrl.includes('mataala')) isMatch = true;
                else if (href.includes('ethel_gallery') && currentUrl.includes('ethel_gallery')) isMatch = true;
                else if (href.includes('silentcinema') && currentUrl.includes('silentcinema')) isMatch = true;
                else if (href.includes('bio') && currentUrl.includes('bio')) isMatch = true;

                if (isMatch) {
                    link.removeAttribute('href');
                    link.style.opacity = '0.4';
                    link.style.cursor = 'default';
                    link.style.pointerEvents = 'none';
                    link.innerHTML += ' <span style="font-size:9px; letter-spacing:1px; margin-left:8px; color:#666;">[ACTIVE]</span>';
                }
            });
        });

        window.toggleBrandMenu = function(e) {
            e.stopPropagation();
            const menu = document.getElementById('brandDropdown');
            if (menu) menu.classList.toggle('active');
        };

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('brandDropdown');
            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
            }
        });
        // ============================================================
        // BRAND DROPDOWN
        // ============================================================
        // ============================================================
        // BRAND DROPDOWN
        // ============================================================
        function toggleBrandMenu(e) {
            e.stopPropagation();
            const menu = document.getElementById('brandDropdown');
            menu.classList.toggle('active');
        }

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('brandDropdown');
            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            const currentUrl = window.location.href.toLowerCase();
            const dropdownLinks = document.querySelectorAll('.brand-dropdown-item');

            dropdownLinks.forEach(link => {
                const href = link.getAttribute('href') || '';
                const isSilenceLink = href.includes('/silence/');
                const isMataalaLink = href.includes('/mataala/');
                const isCinemaLink = href.includes('/silentcinema/');
                const isBioLink = href.includes('/bio/');

                if ((currentUrl.includes('silence') && !currentUrl.includes('silentcinema') && isSilenceLink) ||
                    (currentUrl.includes('mataala') && isMataalaLink) ||
                    (currentUrl.includes('silentcinema') && isCinemaLink) ||
                    (currentUrl.includes('bio') && isBioLink)) {
                    link.removeAttribute('href');
                    link.style.opacity = '0.4';
                    link.style.cursor = 'default';
                    link.style.pointerEvents = 'none';
                    link.innerHTML += ' <span style="font-size:9px; letter-spacing:1px; margin-left:8px; color:#666;">[ACTIVE]</span>';
                }
            });
        });
    

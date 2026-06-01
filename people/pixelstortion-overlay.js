// pixelstortion-overlay.js
// Dynamically injects the "Chameleon" Network Overlay into the site.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        /* 1. The Disclaimer - Fixed at the bottom, styled like corporate fine print */
        #pxl-disclaimer-bar {
            position: fixed;
            bottom: 0; left: 0; width: 100%;
            background: rgba(10, 10, 10, 0.95);
            color: #d4d4d4;
            text-align: center;
            padding: 12px 16px;
            font-size: 14px;
            line-height: 1.45;
            font-weight: 500;
            font-family: 'Courier New', Courier, monospace;
            z-index: 2147483647;
            backdrop-filter: blur(5px);
            border-top: 1px solid rgba(255,255,255,0.2);
            pointer-events: auto;
        }

        #pxl-disclaimer-bar strong { color: #fff; }

        /* 2. The Chameleon Wrapper - Inherits layout from the host site */
        .pxl-chameleon-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            margin-right: 20px; /* Breathing room between dropdown and native logo */
            z-index: 2147483647;
        }

        /* 3. The Button - Stripped of heavy colors so it blends perfectly */
        .pxl-chameleon-btn {
            background: transparent;
            border: none;
            color: inherit; /* Magic line: absorbs the host site's text color */
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 2px;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            opacity: 0.6; /* Subdued until interacted with */
            transition: opacity 0.3s ease, transform 0.2s ease;
        }

        .pxl-chameleon-btn:hover {
            opacity: 1;
        }

        /* 4. The Menu - Sleek, dark, and universally applicable */
        .pxl-chameleon-menu {
            display: none;
            position: absolute;
            top: 100%; left: 0;
            margin-top: 10px;
            background: rgba(15, 15, 20, 0.98);
            border: 1px solid rgba(255,255,255,0.1);
            min-width: 240px;
            backdrop-filter: blur(10px);
            text-align: left;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        }

        .pxl-chameleon-wrapper.active .pxl-chameleon-menu {
            display: block;
            animation: pxlFade 0.2s ease-out;
        }

        .pxl-chameleon-menu a {
            color: #ccc;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            font-size: 0.8rem;
            font-family: sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: background 0.2s, padding-left 0.2s;
        }

        .pxl-chameleon-menu a:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
            padding-left: 20px;
        }

        .pxl-muted-header {
            color: #666;
            padding: 12px 16px;
            display: block;
            font-size: 0.7rem;
            font-family: sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            cursor: default;
        }

        @keyframes pxlFade {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleElement);

    // 2. Prevent disclaimer from covering native footer content
    document.body.style.paddingBottom = '56px';

    // 3. Inject Disclaimer
    const disclaimer = document.createElement('div');
    disclaimer.id = 'pxl-disclaimer-bar';
    disclaimer.innerHTML = '<a href="https://silenceisthetrauma.com" style="color: inherit; text-decoration: none;"><strong>SILENCE IS THE TRAUMA:</strong> Nothing on this site is real. This site is a satirical commentary on power and manipulation. All characters, entities, and events are fictional constructs. No real persons are depicted.</a>';
    document.body.appendChild(disclaimer);

    // 4. Build the Dropdown Node
    const wrapper = document.createElement('div');
    wrapper.className = 'pxl-chameleon-wrapper';
    wrapper.innerHTML = `
        <button class="pxl-chameleon-btn">PIXELSTORTION ▼</button>
        <div class="pxl-chameleon-menu">
            <span class="pxl-muted-header">Network Architecture</span>
            <a href="https://silenceisthetrauma.com/veX_social_network/">veX: Social Network</a>
            <a href="https://silenceisthetrauma.com/">Silence Is The Trauma</a>
            <a href="https://islaband.com/">Isla</a>
            <a href="https://ethelryker.com/">Ethel Ryker</a>
            <a href="https://dominicryker.com/">Dominic Ryker</a>
            <a href="https://pixelstortion.com/">Nalani</a>
            <a href="https://pixelstortion.com/bio/">Bio</a>
        </div>
    `;

    // 5. Interaction Logic
    const btn = wrapper.querySelector('.pxl-chameleon-btn');
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) wrapper.classList.remove('active');
    });

    // 6. Intelligent Injection Logic
    // Looks for your specific brand containers across the 40 sites
    const brandElement = document.querySelector('.logo, .brand, .header-title, .masthead');
    
    if (brandElement) {
        // Force the host's brand container to allow side-by-side flex layout
        brandElement.style.display = 'flex';
        brandElement.style.alignItems = 'center';
        
        // Inject the Pixelstortion dropdown right before the native logo text
        brandElement.insertBefore(wrapper, brandElement.firstChild);
    } else {
        // Fallback for sites with non-standard header classes
        const header = document.querySelector('header') || document.body;
        if(header.firstChild) {
             header.insertBefore(wrapper, header.firstChild);
        } else {
             header.appendChild(wrapper);
        }
    }


    // 8. Text Switching Glitch Class (The Original Reference)
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

    const pxlBtn = wrapper.querySelector('.pxl-chameleon-btn');
    if (pxlBtn) {
        pxlBtn.setAttribute('data-text', 'PIXELSTORTION ▼');
        const brandFx = new BrandingGlitch(pxlBtn);
        
        const glitchPhrases = [
            "PIXELSTORTION ▼",
            "THIS IS NOT REAL ▼",
            "PIXELSTORTION ▼",
            "THIS IS FICTION ▼",
            "PIXELSTORTION ▼",
            "SILENCE IS THE TRAUMA ▼"
        ];
        
        let wordIndex = 0;

        function nextBrandWord() {
            wordIndex = (wordIndex + 1) % glitchPhrases.length;
            brandFx.setText(glitchPhrases[wordIndex]).then(() => {
                let delay = 4000; // Hold the satire phrases longer (4 seconds)
                if (glitchPhrases[wordIndex] === 'PIXELSTORTION ▼') {
                    delay = 8000; // Hold longer on the main brand (8 seconds)
                }
                setTimeout(nextBrandWord, delay);
            });
        }

        setTimeout(nextBrandWord, 5000); // Start cycle
    }
});

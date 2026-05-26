/**
 * DOMINIC RYKER - LITE ENGINE v1.0
 * Lightweight presence for segmented SEO pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Dominic UI
    const dominicContainer = document.createElement('div');
    dominicContainer.id = 'dominic-lite-container';
    dominicContainer.innerHTML = `
        <div id="dominic-minimized" style="position: fixed; bottom: 30px; right: 30px; z-index: 9999; cursor: pointer;">
            <div id="dominic-pulse" style="width: 40px; height: 40px; border-radius: 50%; background: #000; border: 2px solid #ff0055; display: flex; align-items: center; justify-content: center; color: #ff0055; font-family: monospace; font-weight: bold; box-shadow: 0 0 10px rgba(255,0,85,0.5); transition: all 0.3s ease;">
                D
            </div>
        </div>
        <div id="dominic-chat-window" style="position: fixed; bottom: 80px; right: 30px; width: 320px; background: rgba(5,5,5,0.95); border: 1px solid #333; z-index: 9999; display: none; flex-direction: column; font-family: 'Courier Prime', monospace; color: #aaa; font-size: 13px;">
            <div style="border-bottom: 1px solid #333; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ff0055; font-weight: bold; letter-spacing: 2px;">DOMINIC RYKER</span>
                <span id="dominic-close" style="cursor: pointer; color: #666;">[x]</span>
            </div>
            <div id="dominic-dialogue" style="padding: 15px; min-height: 100px;">
                <p>Hi. I'm Dominic Ryker.</p>
            </div>
            <div style="padding: 10px; border-top: 1px solid #333; display: flex; gap: 10px;">
                <button id="btn-tour" style="flex: 1; background: transparent; border: 1px solid #555; color: #aaa; padding: 8px; cursor: pointer; transition: all 0.2s; font-family: monospace;">[ TOUR? ]</button>
                <button id="btn-thoughts" style="flex: 1; background: transparent; border: 1px solid #555; color: #aaa; padding: 8px; cursor: pointer; transition: all 0.2s; font-family: monospace;">[ MY THOUGHTS? ]</button>
            </div>
        </div>
    `;
    document.body.appendChild(dominicContainer);

    // Elements
    const minBtn = document.getElementById('dominic-minimized');
    const pulse = document.getElementById('dominic-pulse');
    const chatWindow = document.getElementById('dominic-chat-window');
    const closeBtn = document.getElementById('dominic-close');
    const dialogue = document.getElementById('dominic-dialogue');
    const btnTour = document.getElementById('btn-tour');
    const btnThoughts = document.getElementById('btn-thoughts');

    // Hover effects for buttons
    [btnTour, btnThoughts].forEach(btn => {
        btn.addEventListener('mouseover', () => {
            btn.style.borderColor = '#ff0055';
            btn.style.color = '#ff0055';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.borderColor = '#555';
            btn.style.color = '#aaa';
        });
    });

    // 2. Periodic Glow
    setInterval(() => {
        if(chatWindow.style.display === 'none') {
            pulse.style.boxShadow = '0 0 25px rgba(255,0,85,0.9)';
            pulse.style.transform = 'scale(1.1)';
            setTimeout(() => {
                pulse.style.boxShadow = '0 0 10px rgba(255,0,85,0.5)';
                pulse.style.transform = 'scale(1)';
            }, 1000);
        }
    }, 15000); // Glows every 15 seconds

    // 3. Interactions
    minBtn.addEventListener('click', () => {
        chatWindow.style.display = 'flex';
        minBtn.style.display = 'none';
        dialogue.innerHTML = `<p style="color:#ff0055;">>> Connection established.</p><p style="margin-top:10px;">What do you require?</p>`;
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
        minBtn.style.display = 'block';
    });

    // TOUR OPTION
    btnTour.addEventListener('click', () => {
        // Pass current page so Tour can offer a back button
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        window.location.href = `tour.html?return=${currentPage}`;
    });

    // MY THOUGHTS OPTION (The Rewriting Trick)
    btnThoughts.addEventListener('click', () => {
        dialogue.innerHTML = `<p style="color:#ff0055;">>> Analyzing viewport...</p>
                              <p style="margin-top:10px;">Hover your cursor over the section you wish me to evaluate.</p>`;
        
        // Enable hover detection on cards/content blocks
        const targets = document.querySelectorAll('.grid > div, article, .card'); // Generic selectors matching the site
        
        const rewriteHandler = function(e) {
            const target = e.currentTarget;
            
            // The rewrite trick: Scramble text to reveal the "truth"
            const paragraphs = target.querySelectorAll('p, span, h2, h3');
            if(paragraphs.length > 0) {
                const el = paragraphs[paragraphs.length - 1]; // Pick a paragraph to rewrite
                const originalText = el.innerText;
                
                // Visual glitch effect
                el.style.color = '#ff0055';
                el.style.textShadow = '0 0 5px #ff0055';
                
                let scrambles = 0;
                const interval = setInterval(() => {
                    const chars = '!<>-_\\\\/[]{}—=+*^?#_';
                    let scrambled = '';
                    for(let i=0; i<originalText.length; i++) {
                        scrambled += Math.random() > 0.5 ? chars[Math.floor(Math.random() * chars.length)] : originalText[i];
                    }
                    el.innerText = scrambled;
                    scrambles++;
                    
                    if(scrambles > 10) {
                        clearInterval(interval);
                        // Final rewritten message
                        el.innerText = "YOU MISTAKE PROCEDURE FOR PROTECTION.";
                        
                        // Update chat window
                        dialogue.innerHTML = `<p style="color:#ff0055;">>> Rewrite complete.</p>
                                              <p style="margin-top:10px;">The documentation is merely a consequence of the structure. I am the structure.</p>`;
                        
                        // Clean up listeners
                        targets.forEach(t => t.removeEventListener('mouseenter', rewriteHandler));
                        
                        // Minimize after a delay
                        setTimeout(() => {
                            chatWindow.style.display = 'none';
                            minBtn.style.display = 'block';
                        }, 5000);
                    }
                }, 50);
            }
        };

        targets.forEach(t => {
            t.addEventListener('mouseenter', rewriteHandler, {once: true});
        });
    });
});

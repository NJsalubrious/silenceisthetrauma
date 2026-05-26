/**
 * ================================================================
 * BLAST RADIUS — Version 2 Engine (Phaser 3)
 * ================================================================
 * Complete rewrite: Phaser 3 reel engine, custom WebGL particles,
 * decoupled progressive meter, Hero Projectile tween-and-trail,
 * Dominic Blocker pipeline, Free Spins System Override.
 * ================================================================
 */

// ================================================================
// 1. MATH CONFIG — 8 Lore-Accurate Symbols + Decoupled Meter
// ================================================================

const MATH_CONFIG = {
    rows: 3,
    cols: 5,
    rtp: 88.5,
    volatility: 'EXTREME',

    // Decoupled Meter System — $20 Billion Empire
    meter: {
        internal: 2000,
        displayMultiplier: 10000000,   // 2000 × 10,000,000 = $20,000,000,000
        contributionRate: 0.0,         // Disabled so it doesn't move passively
        snapshot: 2000,
        jackpotMultiplier: 0.01
    },

    // Payout multipliers — internal units (multiplied by 10,000,000 for display)
    payouts: {
        0: [0.3, 0.9, 3.0],   // 3M, 9M, 30M
        1: [0.6, 1.8, 6.0],   // 6M, 18M, 60M
        2: [1.2, 3.6, 15.0],  // 12M, 36M, 150M
        3: [3.0, 9.0, 45.0],  // 30M, 90M, 450M
        4: [6.0, 18.0, 90.0], // 60M, 180M, 900M
    },

    // 8 symbols — damage 600× rebased
    symbols: {
        0: { name: 'ETHEL_BIKE',       type: 'low',     tier: 1, damage: 12000,   image: 'stills/ethel_bike_pulse.png',      video: 'Videos/ethel_bike_pulse.mp4',      label: 'BIKE'  },
        1: { name: 'ETHEL_HEART',      type: 'low-mid', tier: 2, damage: 24000,   image: 'stills/ethel_heart_pulse.png',     video: 'Videos/ethel_heart_pulse.mp4',     label: '💔'    },
        2: { name: 'ETHEL',            type: 'mid',     tier: 3, damage: 90000,   image: 'stills/Ethel_pulse.png',            video: 'Videos/Ethel_pulse.mp4',            label: 'ETH'   },
        3: { name: 'BRIDGE_BURN',      type: 'mid-high',tier: 4, damage: 240000,  image: 'stills/bridgeBurn_pulse.png',       video: 'Videos/bridgeBurn_pulse.mp4',       label: '🔥'    },
        4: { name: 'DOMINICS_HOUSE',   type: 'high',    tier: 5, damage: 480000,  image: 'stills/dominics_house_pulse.png',   video: 'Videos/dominics_house_pulse.mp4',   label: 'HOUSE' },
        5: { name: 'ISLA_WILD',        type: 'wild',    tier: 6, damage: 0,     image: 'stills/Isla_pulse.png',             video: 'Videos/Isla_pulse.mp4',             label: 'WILD'  },
        6: { name: 'DOMINIC_BLOCKER',  type: 'blocker', tier: 7, damage: 0,     image: 'stills/ethel_dominic_pulse.png',    video: 'Videos/ethel_dominic_pulse.mp4',    label: 'DOM'   },
        7: { name: 'ISLA_PHONE',       type: 'scatter', tier: 0, damage: 0,     image: 'stills/isla_phone_pulse.png',       video: 'Videos/isla_phone_pulse.mp4',       label: '📱'    }
    },

    virtualStrips: [
        [0, 1, 6, 7, 0, 7, 2, 5, 6, 1, 7, 7, 3, 1, 7, 7, 5, 0, 2, 6], // Reel 0
        [1, 0, 2, 7, 3, 2, 5, 0, 4, 2, 2, 1, 3, 2, 6, 2, 0, 2, 5, 4], // Reel 1
        [6, 1, 7, 1, 2, 7, 1, 4, 7, 5, 6, 7, 5, 0, 7, 7, 3, 1, 6, 4], // Reel 2
        [3, 2, 2, 6, 2, 5, 0, 4, 2, 0, 5, 2, 3, 2, 1, 6, 0, 2, 4, 2], // Reel 3
        [1, 7, 6, 7, 0, 5, 7, 2, 6, 7, 0, 2, 7, 0, 7, 1, 7, 6, 0, 4]  // Reel 4
    ],

    // Level 1: Pre-Prison top-screen videos (all 17)
    featureVideos: [
        'Videos/islaPhone_01.mp4', 'Videos/islaPhone_02.mp4', 'Videos/islaPhone_03.mp4',
        'Videos/islaPhone_04.mp4', 'Videos/islaPhone_05.mp4', 'Videos/islaPhone_06.mp4',
        'Videos/islaPhone_07.mp4', 'Videos/islaPhone_08.mp4', 'Videos/islaPhone_09.mp4',
        'Videos/islaPhone_10.mp4', 'Videos/islaPhone_11.mp4', 'Videos/islaPhone_12.mp4',
        'Videos/islaPhone_13.mp4', 'Videos/islaPhone_14.mp4', 'Videos/islaPhone_15.mp4',
        'Videos/islaPhone_16.mp4', 'Videos/islaPhone_17.mp4'
    ],

    // Level 2: Post-Prison top-screen videos
    prisonVideos: [
        'Videos/prison_01.mp4', 'Videos/prison_02.mp4', 'Videos/prison_03.mp4',
        'Videos/prison_04.mp4', 'Videos/prison_05.mp4', 'Videos/prison_06.mp4',
        'Videos/prison_07.mp4', 'Videos/prison_08.mp4'
    ],

    blastRevealVideo: 'Videos/blast_radius_PhoneReveal_A.mp4',
    phoneHitVideo: 'Videos/phoneHit.mp4',
    prisonHitVideo: 'Videos/prison_hit.mp4',
    freeSpinsBgVideo: 'Videos/shattering_glass_loop.mp4'
};

// ================================================================
// 1.5 NARRATIVE GAFF MANAGER
// ================================================================
class NarrativeManager {
    static blasts = 0;
    static intercepts = 0;
    static burns = 0;
    static isForced = false;
    
    // Difficulty Tuning state
    static prisonChance = -1;    // -1 means use procedural dynamic escalation
    static ethelIntel = 0;       // 0-100% chance to dodge
    static interceptRate = 100;  // 0-100% chance to steal

    static updateUI() {
        const reqBlasts = document.getElementById('req-blasts');
        const reqIntercepts = document.getElementById('req-intercepts');
        const reqBurns = document.getElementById('req-burns');

        if (reqBlasts) {
            const isMet = this.blasts >= 2;
            const icon = isMet ? '✅' : (this.isForced ? '❌' : '<span style="color:#555">➖</span>');
            reqBlasts.innerHTML = `${icon} <span class="val">${this.blasts}</span>/2 Phone Blasts`;
            reqBlasts.style.color = isMet ? '#00ff41' : (this.isForced ? '#aaa' : '#555');
        }
        if (reqIntercepts) {
            const isMet = this.intercepts >= 1;
            const icon = isMet ? '✅' : (this.isForced ? '❌' : '<span style="color:#555">➖</span>');
            reqIntercepts.innerHTML = `${icon} <span class="val">${this.intercepts}</span>/1 Negative Intercepts`;
            reqIntercepts.style.color = isMet ? '#00ff41' : (this.isForced ? '#aaa' : '#555');
        }
        if (reqBurns) {
            const isMet = this.burns >= 2;
            const icon = isMet ? '✅' : (this.isForced ? '❌' : '<span style="color:#555">➖</span>');
            reqBurns.innerHTML = `${icon} <span class="val">${this.burns}</span>/2 Money Burns`;
            reqBurns.style.color = isMet ? '#00ff41' : (this.isForced ? '#aaa' : '#555');
        }
    }

    static canGoToPrison() {
        if (!this.isForced) return true;
        return this.blasts >= 2 && this.intercepts >= 1 && this.burns >= 2;
    }
    
    static updateVolatility(level) {
        const baseStrips = [
            [0, 1, 6, 7, 0, 7, 2, 5, 6, 1, 7, 7, 3, 1, 7, 7, 5, 0, 2, 6],
            [1, 0, 2, 7, 3, 2, 5, 0, 4, 2, 2, 1, 3, 2, 6, 2, 0, 2, 5, 4],
            [6, 1, 7, 1, 2, 7, 1, 4, 7, 5, 6, 7, 5, 0, 7, 7, 3, 1, 6, 4],
            [3, 2, 2, 6, 2, 5, 0, 4, 2, 0, 5, 2, 3, 2, 1, 6, 0, 2, 4, 2],
            [1, 7, 6, 7, 0, 5, 7, 2, 6, 7, 0, 2, 7, 0, 7, 1, 7, 6, 0, 4]
        ];
        
        MATH_CONFIG.virtualStrips = baseStrips.map(strip => [...strip]);
        
        if (level > 1) {
            const injectionChance = (level - 1) * 0.08;
            const features = [2, 5, 6];
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 20; j++) {
                    const sym = MATH_CONFIG.virtualStrips[i][j];
                    if (!features.includes(sym) && Math.random() < injectionChance) {
                        MATH_CONFIG.virtualStrips[i][j] = features[Math.floor(Math.random() * features.length)];
                    }
                }
            }
        }
        
        // Push strictly to running mechanical reels if they exist
        if (window.slotController) {
            window.slotController.reels.forEach((reel, idx) => {
                reel.strip = MATH_CONFIG.virtualStrips[idx];
            });
        }
        
        const lbl = document.getElementById('lbl-volatility');
        if (lbl) lbl.innerText = level === 1 ? 'NORMAL (1)' : `CHAOTIC (${level})`;
    }
}

// ================================================================
// 1b. OppressionEngine — Visual Power Differential System
// ================================================================
// Drives: cabinet desaturation, health bar, threat pulse, game-over.
// Empire baseline = $20B. Fatal threshold = $50B.
// Health = 100% at $20B, 0% at $50B. Goes NEGATIVE (visual only) beyond $50B.

const OppressionEngine = {
    BASELINE: 20000000000,  // $20B starting empire
    FATAL: 50000000000,     // $50B = game over (lose)
    lastEmpireValue: 20000000000,
    gameOver: false,

    update(currentDisplayValue) {
        if (this.gameOver) return;

        const empire = currentDisplayValue;
        
        // Scale: 
        // 50B (FATAL) -> 0% Health
        // 20B (BASELINE) -> 50% Health (Half full to start)
        // 0B -> 100% Health
        
        let healthPct = 0;
        if (empire >= this.BASELINE) {
            const excess = empire - this.BASELINE;
            const range = this.FATAL - this.BASELINE;
            const ratio = Math.min(1, Math.max(0, excess / range));
            healthPct = 50 - (ratio * 50);
        } else {
            const remaining = empire;
            const range = this.BASELINE;
            const ratio = Math.max(0, remaining / range);
            healthPct = 100 - (ratio * 50);
        }

        // Health bar update
        const fillEl = document.getElementById('health-bar-fill');
        if (fillEl) {
            fillEl.style.width = `${healthPct}%`;
            fillEl.classList.remove('critical', 'danger', 'warning');
            if (healthPct <= 15) fillEl.classList.add('critical');
            else if (healthPct <= 35) fillEl.classList.add('danger');
            else if (healthPct <= 55) fillEl.classList.add('warning');
        }

        // Cabinet desaturation: only desaturate when empire exceeds baseline ($20B)
        // Full color at <=$20B, heavily desaturated at $50B
        const desatRange = this.FATAL - this.BASELINE; // 30B
        const excess = Math.max(0, empire - this.BASELINE);
        const desatRatio = Math.min(1, excess / desatRange); // 0 at <=20B, 1 at 50B

        const sat = Math.max(0.15, 1 - (desatRatio * 0.85));  // 1.0 → 0.15
        const bright = Math.max(0.6, 1 - (desatRatio * 0.4)); // 1.0 → 0.6
        const cabinet = document.getElementById('anti-slot-cabinet');
        if (cabinet) {
            cabinet.style.setProperty('--opp-sat', sat.toFixed(2));
            cabinet.style.setProperty('--opp-bright', bright.toFixed(2));
        }

        // Threat pulse: fire when empire INCREASES
        if (empire > this.lastEmpireValue + 100000000) { // 100M threshold to avoid noise
            const pulseEl = document.getElementById('threat-pulse');
            if (pulseEl) {
                pulseEl.classList.add('active');
                setTimeout(() => pulseEl.classList.remove('active'), 400);
            }
        }
        this.lastEmpireValue = empire;

        // GAME OVER CHECK (Lose only)
        if (empire >= this.FATAL) {
            this.gameOver = true;
            const overlay = document.getElementById('game-over-overlay');
            const title = document.getElementById('game-over-title');
            const subtitle = document.getElementById('game-over-subtitle');
            
            // YOU LOSE (Dominic wins)
            if (title) {
                 title.innerText = 'YOU LOSE';
                 title.style.color = ''; 
                 title.style.textShadow = ''; 
            }
            if (subtitle) {
                 subtitle.innerText = "STRUCTURE IS NOT A SUGGESTION";
            }
            
            if (overlay) {
                overlay.classList.add('active');
                overlay.style.cursor = 'pointer';
                overlay.onclick = () => window.location.reload();
            }
            UI.setSpinEnabled(false);
        } else if (empire <= 0 && (!window.slotController || !window.slotController.bracketHit.hasBeenArrested)) {
            // Native win state if depleted natively on the streets (NOT during prison transition/hack phase)
            this.triggerWin();
        }
    },

    triggerWin() {
        if (this.gameOver) return;
        this.gameOver = true;
        
        const overlay = document.getElementById('game-over-overlay');
        const title = document.getElementById('game-over-title');
        const subtitle = document.getElementById('game-over-subtitle');
        
        // YOU WIN (Dominic destroyed)
        if (title) {
            title.innerText = 'YOU WIN';
            title.style.color = '#ffffff';
            title.style.textShadow = '0 0 20px #ffffff, 0 0 60px rgba(255, 255, 255, 0.4)';
        }
        if (subtitle) {
            subtitle.innerText = "DOMINIC'S EMPIRE DESTROYED"; 
        }
        
        if (overlay) {
            overlay.classList.add('active');
            overlay.style.cursor = 'pointer';
            overlay.onclick = () => window.location.reload();
        }
        UI.setSpinEnabled(false);
    }
};


// ================================================================
// 2. AntiSlotReel — Phaser 3 Reel with Damped Harmonic Oscillator
// ================================================================

class AntiSlotReel {
    constructor(id, strip, symbolWidth, symbolHeight, container, scene) {
        this.id = id;
        this.strip = strip;
        this.symbolWidth = symbolWidth;
        this.symbolHeight = symbolHeight;
        this.container = container;
        this.scene = scene;

        this.reelContainer = scene.add.container(id * symbolWidth, 0);
        container.add(this.reelContainer);

        // Physics state
        this.state = 'IDLE';
        this.position = 0;
        this.targetPosition = 0;
        this.speed = 0;

        // Damped Harmonic Oscillator parameters
        this.bounceTime = 0;
        this.bounceAmplitude = 30;
        this.bounceDecay = 12;
        this.bounceFrequency = Math.PI * 8;
        this.bounceOffset = 0;

        this.symbolSprites = [];
        this._buildSymbolPool();
    }

    _buildSymbolPool() {
        this.poolSize = MATH_CONFIG.rows + 2;
        for (let i = 0; i < this.poolSize; i++) {
            const sprite = this.scene.add.sprite(
                this.symbolWidth / 2,
                i * this.symbolHeight + this.symbolHeight / 2,
                'sym_0'
            );
            sprite.setDisplaySize(this.symbolWidth, this.symbolHeight);
            sprite._symbolId = 0;
            this.reelContainer.add(sprite);
            this.symbolSprites.push(sprite);
        }
    }

    _updateSymbolSprite(sprite, symbolId) {
        if (sprite._symbolId === symbolId) return;
        const texKey = `sym_${symbolId}`;
        if (this.scene.textures.exists(texKey)) {
            sprite.setTexture(texKey);
            sprite.setDisplaySize(this.symbolWidth, this.symbolHeight);
        }
        sprite._symbolId = symbolId;
    }

    /**
     * Play landing videos using HTML video overlays positioned over the canvas.
     */
    playLandingVideos() {
        const stripLen = this.strip.length;
        const baseIndex = Math.floor(this.targetPosition);
        const reelWindow = document.getElementById('reel-window');
        const canvas = reelWindow?.querySelector('canvas');
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const windowRect = reelWindow.getBoundingClientRect();
        const offsetX = canvasRect.left - windowRect.left;
        const offsetY = canvasRect.top - windowRect.top;

        const scaleX = canvasRect.width / (this.symbolWidth * MATH_CONFIG.cols);
        const scaleY = canvasRect.height / (this.symbolHeight * MATH_CONFIG.rows);

        for (let row = 0; row < MATH_CONFIG.rows; row++) {
            const idx = ((baseIndex + row) % stripLen + stripLen) % stripLen;
            const symbolId = this.strip[idx];
            const symData = MATH_CONFIG.symbols[symbolId];

            if (!symData || !symData.video) continue;

            const pixelX = offsetX + (this.id * this.symbolWidth * scaleX);
            const pixelY = offsetY + (row * this.symbolHeight * scaleY);
            const pixelW = this.symbolWidth * scaleX;
            const pixelH = this.symbolHeight * scaleY;

            const videoEl = document.createElement('video');
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.style.cssText = `
                position: absolute;
                left: ${pixelX}px;
                top: ${pixelY}px;
                width: ${pixelW}px;
                height: ${pixelH}px;
                object-fit: cover;
                z-index: 5;
                pointer-events: none;
                border: none;
                display: block;
            `;
            reelWindow.appendChild(videoEl);

            videoEl.src = symData.video;
            videoEl.loop = true;
            videoEl.dataset.col = this.id;
            videoEl.dataset.row = row;
            videoEl.play().catch(() => {});
            videoEl.classList.add('symbol-video-overlay');
        }
    }

    static cleanupVideoOverlays() {
        document.querySelectorAll('.symbol-video-overlay').forEach(el => {
            el.pause();
            el.removeAttribute('src');
            el.remove();
        });
    }

    spin() {
        this.state = 'SPINNING';
        this.speed = 0;
        this.bounceOffset = 0;
    }

    commandStop(targetStopIndex) {
        this.state = 'STOPPING';
        const stripLen = this.strip.length;
        const snappedPos = Math.ceil(this.position);
        const currentStripPos = ((snappedPos % stripLen) + stripLen) % stripLen;
        let distance = targetStopIndex - currentStripPos;
        if (distance <= 0) distance += stripLen;
        distance += stripLen * 2;
        this.targetPosition = snappedPos + distance;
    }

    update(dt) {
        if (this.state === 'IDLE') return;

        if (this.state === 'SPINNING') {
            this.speed = Math.min(this.speed + 2, 45);
            this.position += (this.speed * dt) / this.symbolHeight;
        }

        if (this.state === 'STOPPING') {
            const remaining = this.targetPosition - this.position;
            if (remaining <= 0.5) {
                this.position = this.targetPosition;
                this.state = 'BOUNCING';
                this.bounceTime = 0;
                this.speed = 0;
            } else {
                this.speed = Math.max(4, Math.min(45, remaining * 3));
                this.position += (this.speed * dt) / this.symbolHeight;
                if (this.position >= this.targetPosition) {
                    this.position = this.targetPosition;
                    this.state = 'BOUNCING';
                    this.bounceTime = 0;
                    this.speed = 0;
                }
            }
        }

        if (this.state === 'BOUNCING') {
            this.bounceTime += dt;
            const t = this.bounceTime / 1000;
            this.bounceOffset = this.bounceAmplitude
                * Math.exp(-this.bounceDecay * t)
                * Math.cos(this.bounceFrequency * t);

            if (Math.abs(this.bounceOffset) < 0.5 && this.bounceTime > 100) {
                this.bounceOffset = 0;
                this.position = Math.round(this.position);
                this.state = 'IDLE';
                this.playLandingVideos();
            }
        }

        this._renderSymbols();
    }

    _renderSymbols() {
        const stripLen = this.strip.length;
        const h = this.symbolHeight;
        const locked = (this.state === 'IDLE' || this.state === 'BOUNCING');
        const pos = locked ? Math.round(this.position) : this.position;
        const frac = locked ? 0 : (pos - Math.floor(pos));
        const baseIndex = Math.floor(pos);

        for (let i = 0; i < this.poolSize; i++) {
            const sprite = this.symbolSprites[i];
            const stripIdx = ((baseIndex - 1 + i) % stripLen + stripLen) % stripLen;
            const symbolId = this.strip[stripIdx];
            this._updateSymbolSprite(sprite, symbolId);
            sprite.y = ((i - 1) * h) - (frac * h) + this.bounceOffset + h / 2;
        }
    }

    getVisibleSymbols() {
        const stripLen = this.strip.length;
        const baseIndex = Math.floor(this.targetPosition);
        const result = [];
        for (let row = 0; row < MATH_CONFIG.rows; row++) {
            const idx = ((baseIndex + row) % stripLen + stripLen) % stripLen;
            result.push(this.strip[idx]);
        }
        return result;
    }

    /**
     * Get the screen X/Y center of a visible symbol at given row.
     */
    getSymbolScreenCoords(row) {
        const reelWindow = document.getElementById('reel-window');
        const canvas = reelWindow?.querySelector('canvas');
        if (!canvas) return { x: 0, y: 0 };

        const canvasRect = canvas.getBoundingClientRect();
        const windowRect = reelWindow.getBoundingClientRect();
        const scaleX = canvasRect.width / (this.symbolWidth * MATH_CONFIG.cols);
        const scaleY = canvasRect.height / (this.symbolHeight * MATH_CONFIG.rows);

        return {
            x: canvasRect.left + (this.id * this.symbolWidth * scaleX) + (this.symbolWidth * scaleX / 2),
            y: canvasRect.top + (row * this.symbolHeight * scaleY) + (this.symbolHeight * scaleY / 2)
        };
    }
}


// ================================================================
// 3. DamageEvaluator — 243 Ways to Win
// ================================================================

class DamageEvaluator {
    constructor(mathConfig) {
        this.math = mathConfig;
    }

    evaluateBoard(stopIndices) {
        const grid = this.buildGrid(stopIndices);
        let totalDamage = 0;
        const winningLines = [];
        const checkedSymbols = new Set();

        for (let row = 0; row < this.math.rows; row++) {
            const startSymbol = grid[0][row];
            if (startSymbol === 7 || checkedSymbols.has(startSymbol)) continue; // Skip scatter
            if (startSymbol === 5) continue; // Don't start chains with wilds
            if (startSymbol === 6) continue; // Don't start chains with blocker
            checkedSymbols.add(startSymbol);

            let matchLength = 1;
            let waysCount = 1;

            for (let col = 1; col < this.math.cols; col++) {
                const matches = [];
                for (let r = 0; r < this.math.rows; r++) {
                    const checkSymbol = grid[col][r];
                    if (checkSymbol === startSymbol || checkSymbol === 5) { // Wild substitutes
                        matches.push(r);
                    }
                }
                if (matches.length > 0) {
                    matchLength++;
                    waysCount *= matches.length;
                } else {
                    break;
                }
            }

            if (matchLength >= 3) {
                const payoutTable = this.math.payouts[startSymbol];
                if (!payoutTable) continue; // No payout for this symbol
                const payoutIdx = matchLength - 3; // 0=3match, 1=4match, 2=5match
                const multiplier = payoutTable[Math.min(payoutIdx, 2)];
                const damageDealt = multiplier * waysCount * this.math.symbols[startSymbol].damage;
                totalDamage += damageDealt;
                winningLines.push({
                    symbol: this.math.symbols[startSymbol].name,
                    symbolId: startSymbol,
                    length: matchLength,
                    ways: waysCount,
                    damage: damageDealt
                });
            }
        }

        return { totalDamage, winningLines, grid };
    }

    buildGrid(stopIndices) {
        const grid = [];
        for (let col = 0; col < this.math.cols; col++) {
            const column = [];
            const strip = this.math.virtualStrips[col];
            for (let row = 0; row < this.math.rows; row++) {
                const actualIndex = (stopIndices[col] + row) % strip.length;
                column.push(strip[actualIndex]);
            }
            grid.push(column);
        }
        return grid;
    }
}


// ================================================================
// 4. ProgressiveMeter — Bi-Directional (Decoupled Internal/Display)
// ================================================================

class ProgressiveMeter {
    constructor(mathConfig) {
        this.math = mathConfig;
        this.internalValue = mathConfig.meter.internal;
        this.snapshot = mathConfig.meter.snapshot; // For Grand Jackpot (never $0)
    }

    /** Dead spin: add fractional bet to Dominic's empire */
    onDeadSpin(betAmount) {
        const contribution = betAmount * this.math.meter.contributionRate;
        this.internalValue += contribution;
        return contribution;
    }

    /** Win: subtract payout from Dominic's HP (in internal units) */
    onWin(payoutAmount) {
        // Convert display-scale payout to internal units
        const internalDrain = payoutAmount / this.math.meter.displayMultiplier;
        this.internalValue = Math.max(0, this.internalValue - internalDrain);
        return this.internalValue;
    }

    /** Check if meter is depleted (triggers Free Spins) */
    isDepleted() {
        return this.internalValue <= 0;
    }

    /** Reset meter (after Free Spins) */
    reset() {
        this.internalValue = this.math.meter.internal;
        this.snapshot = this.math.meter.internal;
    }

    /** Get display value (what the player sees) */
    getDisplayValue() {
        return Math.floor(this.internalValue * this.math.meter.displayMultiplier);
    }

    /** Calculate Grand Jackpot payout (uses snapshot, never $0) */
    getGrandJackpot(totalBet) {
        const baseBet = 1.0;
        return this.snapshot * this.math.meter.displayMultiplier *
               this.math.meter.jackpotMultiplier * (totalBet / baseBet);
    }
}


// ================================================================
// 5. DominicBlocker — Steals wins when Isla is absent
//    ORDER: After DamageEvaluator, BEFORE ProgressiveMeter.onWin()
// ================================================================

class DominicBlocker {
    constructor(mathConfig) {
        this.math = mathConfig;
    }

    /**
     * Check if Dominic (ID 6) is visible and Isla Wild (ID 5) is absent.
     * If so, steal 50% of the pending win and add to meter.
     * @param {object} evalResult - from DamageEvaluator.evaluateBoard()
     * @param {object} progressiveMeter - the ProgressiveMeter instance
     * @returns {object} { finalDamage, stolenAmount, wasStolen }
     */
    applySteal(evalResult, progressiveMeter) {
        const grid = evalResult.grid;
        let dominicPresent = false;
        let islaPresent = false;

        // Scan the entire grid
        for (let col = 0; col < this.math.cols; col++) {
            for (let row = 0; row < this.math.rows; row++) {
                if (grid[col][row] === 6) dominicPresent = true;
                if (grid[col][row] === 5) islaPresent = true;
            }
        }

        if (dominicPresent && !islaPresent && evalResult.totalDamage > 0) {
            if (Math.random() * 100 < NarrativeManager.interceptRate) {
                const stolenAmount = Math.floor(evalResult.totalDamage * 0.5);
                const finalDamage = evalResult.totalDamage - stolenAmount;
                // Add stolen amount to Dominic's empire (internal units)
                const stolenInternal = stolenAmount / this.math.meter.displayMultiplier;
                progressiveMeter.internalValue += stolenInternal;
                return { finalDamage, stolenAmount, wasStolen: true };
            }
        }

        return { finalDamage: evalResult.totalDamage, stolenAmount: 0, wasStolen: false };
    }
}


// ================================================================

// ================================================================
// 6. BlastRadiusController — NET-ZERO Phone Blast Radius
//    Trigger: Isla Phone (ID 7) lands and radiates to adjacent symbols.
//    Evaluates both neighbors: rewards vs. collateral cancel out (net-zero).
// ================================================================

class BlastRadiusController {
    constructor(mathConfig, reels) {
        this.math = mathConfig;
        this.reels = reels;
        this.blastPayouts = {
            0: { value: -24000000,  label: 'ETHEL\'S BIKE DESTROYED' },
            1: { value: -18000000,  label: 'ETHEL\'S HEART SHATTERED' },
            2: { value: -6000000000,label: 'ETHEL CAUGHT IN BLAST' },
            3: { value: 90000000,   label: 'BRIDGE BURNED' },
            4: { value: 72000000,   label: 'DOMINIC\'S HOUSE HIT' },
            5: { value: 0,          label: 'ISLA DODGES HER OWN BLAST' },
            6: { value: 150000000,  label: 'DIRECT HIT — DOMINIC EXPOSED' },
            7: { value: 0,          label: 'PHONE ECHO — NO EFFECT' }
        };
    }

    detectPhoneBlast(grid) {
        for (let row = 0; row < this.math.rows; row++) {
            for (let col = 1; col < this.math.cols - 1; col++) {
                const leftId = grid[col - 1][row];
                const rightId = grid[col + 1][row];
                
                // Blast strictly requires ISLA_PHONE (ID 7) to bracket another symbol
                if (leftId !== 7 || rightId !== 7) continue;
                
                const centerId = grid[col][row];
                if (centerId === 7) continue; // Phone - Phone - Phone does not trigger 

                const bp = this.blastPayouts[centerId];
                if (bp && bp.value !== 0) {
                    return { 
                        phoneCol: col - 1, 
                        row, 
                        neighbors: [{ col, row, symbolId: centerId }], 
                        spanStart: col - 1, 
                        spanEnd: col + 1 
                    };
                }
            }
        }
        return null;
    }

    executePhoneBlast(blastData, progressiveMeter, callback) {
        const reelWindow = document.getElementById('reel-window');
        const canvas = reelWindow?.querySelector('canvas');
        if (!canvas) { if (callback) callback([]); return; }
        const canvasRect = canvas.getBoundingClientRect();
        const windowRect = reelWindow.getBoundingClientRect();
        const offsetX = canvasRect.left - windowRect.left;
        const offsetY = canvasRect.top - windowRect.top;
        const colWidth = canvasRect.width / this.math.cols;
        const rowHeight = canvasRect.height / this.math.rows;
        const startCol = blastData.spanStart;
        const endCol = blastData.spanEnd;
        const spanCols = endCol - startCol + 1;
        const overlayX = offsetX + (startCol * colWidth);
        const overlayY = offsetY + (blastData.row * rowHeight);

        const revealVideo = document.createElement('video');
        revealVideo.muted = true; revealVideo.playsInline = true;
        revealVideo.src = this.math.blastRevealVideo;
        revealVideo.style.cssText = `position:absolute;left:${overlayX}px;top:${overlayY}px;width:${colWidth * spanCols}px;height:${rowHeight}px;object-fit:cover;z-index:20;pointer-events:none;`;
        revealVideo.classList.add('blast-radius-overlay');
        reelWindow.appendChild(revealVideo);
        revealVideo.play().catch(() => {});

        const coords = [];
        for (let c = startCol; c <= endCol; c++) { coords.push(this.reels[c].getSymbolScreenCoords(blastData.row)); }
        let trailsFired = false;
        const fireTrails = () => { if (trailsFired) return; trailsFired = true; window.dispatchEvent(new CustomEvent('LaunchPincerParticles', { detail: { coords } })); };
        revealVideo.addEventListener('playing', fireTrails);
        setTimeout(fireTrails, 150);

        const onSequenceComplete = () => {
            revealVideo.remove();
            for (let c = startCol; c <= endCol; c++) {
                // Destroy the original underlying video so it doesn't peek through MP4 loop boundary gaps
                const oldVideos = reelWindow.querySelectorAll(`.symbol-video-overlay[data-col="${c}"][data-row="${blastData.row}"]`);
                oldVideos.forEach(v => { v.pause(); v.removeAttribute('src'); v.remove(); });

                // Mutate underlying PixiJS sprite to Isla Phone (ID 7)
                const reel = this.reels[c];
                const targetY = blastData.row * reel.symbolHeight + reel.symbolHeight / 2;
                const sprite = reel.symbolSprites.find(s => Math.abs(s.y - targetY) < 10);
                if (sprite) {
                    sprite.setTexture('sym_7');
                    sprite._symbolId = 7;
                }

                const x = offsetX + (c * colWidth);
                const y = offsetY + (blastData.row * rowHeight);
                const phoneVid = document.createElement('video');
                phoneVid.muted = true; phoneVid.playsInline = true; phoneVid.loop = true;
                phoneVid.src = this.math.symbols[7].video;
                phoneVid.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${colWidth}px;height:${rowHeight}px;object-fit:cover;z-index:20;pointer-events:none;`;
                phoneVid.classList.add('pincer-phone-loop');
                reelWindow.appendChild(phoneVid);
                phoneVid.play().catch(() => {});
            }
            let netValue = 0; const labels = []; let hasEthel = false; let hasIsla = false;
            blastData.neighbors.forEach(n => { 
                const bp = this.blastPayouts[n.symbolId]; 
                if (bp) { 
                    netValue += bp.value; 
                    if (bp.value !== 0) labels.push(bp.label); 
                    if (n.symbolId === 2 || n.symbolId === 0 || n.symbolId === 1) hasEthel = true;
                    if (n.symbolId === 5) hasIsla = true;
                } 
            });
            if (netValue > 0) {
                const internalDrain = netValue / this.math.meter.displayMultiplier;
                progressiveMeter.internalValue = Math.max(0, progressiveMeter.internalValue - internalDrain);
                UI.drainEmpireMeter(progressiveMeter.getDisplayValue());
                UI.setStatus(`>>> BLAST RADIUS NET HIT: +$${netValue.toLocaleString()} [${labels.join(' + ')}] <<<`);
                UI.flashWin();
            } else if (netValue < 0) {
                const baseAbsValue = Math.abs(netValue);
                const isArrested = window.slotController && window.slotController.bracketHit.hasBeenArrested;
                
                let absValue = baseAbsValue;
                if (isArrested) {
                    // Slash recovery by 95% in prison
                    absValue = Math.floor(baseAbsValue * 0.05);
                }
                
                const internalGain = absValue / this.math.meter.displayMultiplier;
                progressiveMeter.internalValue += internalGain;
                UI.updateMeterDisplay(progressiveMeter.getDisplayValue());
                
                const isJailbreak = (baseAbsValue >= 6000000000 && isArrested);
                let sourceTxt = hasEthel ? 'ETHEL HIT' : (hasIsla ? 'ISLA HIT' : 'COLLATERAL HIT');
                
                if (isJailbreak) {
                    window.slotController.bracketHit.revertPrisonToDominic();
                    UI.setStatus(`>>> ISLA'S BLAST RADIUS HIT ETHEL. DOMINIC ESCAPES PRISON! [DOMINIC +$${absValue.toLocaleString()}] <<<`);
                } else {
                    if (isArrested) {
                        UI.setStatus(`>>> BLAST RADIUS: ${sourceTxt} — DOMINIC CLAWS BACK +$${absValue.toLocaleString()} IN PRISON <<<`);
                    } else {
                        UI.setStatus(`>>> BLAST RADIUS: ${sourceTxt} — DOMINIC'S EMPIRE GROWS (+$${absValue.toLocaleString()}) <<<`);
                    }
                }
                UI.flashBleakGrow();

                const container = document.getElementById('slot-grid-container');
                if (container) { 
                    if (absValue >= 6000000000) container.classList.add('massive-shake');
                    container.style.boxShadow = 'inset 0 0 40px rgba(255,0,85,0.4)'; 
                    setTimeout(() => { 
                        container.classList.remove('massive-shake'); 
                        container.style.boxShadow = ''; 
                    }, 1500); 
                }
            } else {
                UI.setStatus(`>>> BLAST RADIUS: IMPACTS CANCEL OUT — NET ZERO [${labels.join(' vs ')}] <<<`);
            }
            if (callback) callback(coords);
        };
        let seqCompleted = false;
        const safeComplete = () => { if (seqCompleted) return; seqCompleted = true; onSequenceComplete(); };
        revealVideo.onended = safeComplete; revealVideo.onerror = safeComplete;
        setTimeout(safeComplete, 4000);
    }

    static cleanupOverlays() {
        document.querySelectorAll('.blast-radius-overlay').forEach(el => { if (el.pause) el.pause(); if (el.removeAttribute) el.removeAttribute('src'); el.remove(); });
    }
}


// ================================================================
// 6b. BracketHitController — UNIFIED Bracket Mechanic
//     Replaces ArrestSequenceController + BurningMoneyController.
//     Trigger: Target (Dominic ID 6 or House ID 4) bracketed by same
//     attacker symbol on BOTH sides. Plays intro then persistent loop.
// ================================================================

class BracketHitController {
    constructor(mathConfig, reels) {
        this.math = mathConfig;
        this.reels = reels;
        this.hasBeenArrested = false;
        this.hitTable = {
            6: {
                2: { intro: 'Videos/Isla_pulse_prisonForDominic_allThreeTurnPrisom_intro.mp4', loop: 'Videos/prison_pulse.mp4', type: 'PRISON', label: 'Ethel Imprisoned Dominic - Empire bleeding burned!' },
                5: { intro: 'Videos/Ethel_pulse_prisonForDominic_allThreeTurnPrisom_intro.mp4', loop: 'Videos/prison_pulse.mp4', type: 'PRISON', label: 'Isla Imprisoned Dominic - Bridge burned!' },
                3: { intro: 'Videos/bridgeBurn_pulse_BothSidesOfDominic_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 120000000, label: 'Money bridge burning!' },
                0: { intro: 'Videos/ethel_bike_pulse_BothSidesOfDominic_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 108000000, label: 'That bike was a gifted trap. Burn the money!' },
                1: { intro: 'Videos/ethel_heart_pulse_BothSidesOfDominic_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 108000000, label: 'This heart burns money!' }
            },
            4: {
                2: { intro: 'Videos/ethel_pulseBurnsHouse_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 90000000, label: 'The crazy House! Burn it all!' },
                5: { intro: 'Videos/isla_pulseBurnsHouse_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 90000000, label: 'Isla Burns it!' },
                3: { intro: 'Videos/bridgeBurn_pulseBurnsHouse_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 90000000, label: 'Bridge burning!' },
                0: { intro: 'Videos/ethel_bike_pulseBurnsHouse_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 72000000, label: 'Burn the Empire!' },
                1: { intro: 'Videos/ethel_heart_pulseBurnsHouse_allThreeTurnMoneyBurning_intro.mp4', loop: 'Videos/burnsHouse_allThreeTurnMoneyBurning_loopForAll.mp4', type: 'BURNING', payout: 72000000, label: 'Bleeding heart money burning!' }
            }
        };
    }

    detectBracketHit(grid) {
        for (let col = 1; col < this.math.cols - 1; col++) {
            for (let row = 0; row < this.math.rows; row++) {
                const targetId = grid[col][row];
                if (targetId !== 6 && targetId !== 4) continue;
                if (targetId === 6 && this.hasBeenArrested) continue;
                const leftId = grid[col - 1][row];
                const rightId = grid[col + 1][row];
                if (leftId !== rightId) continue;
                const targetTable = this.hitTable[targetId];
                if (!targetTable || !targetTable[leftId]) continue;
                const hit = targetTable[leftId];
                return { col, row, targetId, attackerId: leftId, intro: hit.intro, loop: hit.loop, type: hit.type, payout: hit.payout || 0, label: hit.label };
            }
        }
        return null;
    }

    executeBracketHit(data, progressiveMeter, callback) {
        const reelWindow = document.getElementById('reel-window');
        const canvas = reelWindow?.querySelector('canvas');
        if (!canvas) { callback(); return; }
        const canvasRect = canvas.getBoundingClientRect();
        const windowRect = reelWindow.getBoundingClientRect();
        const offsetX = canvasRect.left - windowRect.left;
        const offsetY = canvasRect.top - windowRect.top;
        const colWidth = canvasRect.width / this.math.cols;
        const rowHeight = canvasRect.height / this.math.rows;
        const startCol = data.col - 1;
        const overlayX = offsetX + (startCol * colWidth);
        const overlayY = offsetY + (data.row * rowHeight);

        const introVid = document.createElement('video');
        introVid.muted = true; introVid.playsInline = true;
        introVid.src = data.intro;
        introVid.style.cssText = `position:absolute;left:${overlayX}px;top:${overlayY}px;width:${colWidth*3}px;height:${rowHeight}px;object-fit:cover;z-index:25;pointer-events:none;`;
        introVid.classList.add('bracket-hit-overlay');
        reelWindow.appendChild(introVid);
        introVid.play().catch(() => {});
        UI.setStatus(`>>> ${data.label} <<<`);

        let sequenceCompleted = false;
        const wrappedCallback = () => { if (sequenceCompleted) return; sequenceCompleted = true; callback(); };

        const onIntroComplete = () => {
            let loopsStarted = 0;
            const targetLoops = 3;
            const checkAllStarted = () => {
                loopsStarted++;
                if (loopsStarted >= targetLoops) {
                    introVid.remove(); // Frame-perfect snap
                }
            };

            // 1. Create a loop video for each of the 3 bracket positions individually
            for (let c = startCol; c <= startCol + 2; c++) {
                const x = offsetX + (c * colWidth);
                const y = offsetY + (data.row * rowHeight);
                const loopVid = document.createElement('video');
                loopVid.muted = true; loopVid.playsInline = true; loopVid.loop = true;
                loopVid.src = data.loop;
                loopVid.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${colWidth}px;height:${rowHeight}px;object-fit:cover;z-index:24;pointer-events:none;`;
                loopVid.classList.add('bracket-hit-loop');
                reelWindow.appendChild(loopVid);

                loopVid.addEventListener('playing', checkAllStarted, { once: true });
                loopVid.play().catch(() => checkAllStarted());
                
                // 2. Mutate the actual physical sprite underneath so it spins off cleanly
                const reel = this.reels[c];
                const targetY = data.row * reel.symbolHeight + reel.symbolHeight / 2;
                const sprite = reel.symbolSprites.find(s => Math.abs(s.y - targetY) < 10);
                if (sprite) {
                    if (data.type === 'BURNING') {
                        sprite.setTexture('sym_burned');
                        sprite._symbolId = 'burned'; // locks texture until next spin offset
                    } else if (data.type === 'PRISON') {
                        sprite.setTexture('sym_6');
                        sprite._symbolId = 6;
                    }
                }
            }

            // Fallback removal if loop fails to load
            setTimeout(() => { if (introVid.parentNode) introVid.remove(); }, 1500);

            const screenCoords = this.reels[data.col].getSymbolScreenCoords(data.row);
            window.dispatchEvent(new CustomEvent('LaunchPincerParticles', { detail: { coords: [screenCoords], hitType: data.type } }));
            if (data.type === 'PRISON') { this._executeArrest(data, progressiveMeter, wrappedCallback); }
            else { this._executeBurning(data, progressiveMeter, wrappedCallback); }
        };
        let introCompleted = false;
        const safeIntroComplete = () => { if (introCompleted) return; introCompleted = true; onIntroComplete(); };
        introVid.onended = safeIntroComplete; introVid.onerror = safeIntroComplete;
        setTimeout(safeIntroComplete, 5000);
    }

    _executeArrest(data, progressiveMeter, callback) {
        this.hasBeenArrested = true;
        const hiddenBillion = 1000000000;
        const hiddenInternal = hiddenBillion / this.math.meter.displayMultiplier;
        
        // 1. Drain to strictly $0 to show complete visible asset loss
        progressiveMeter.internalValue = 0;
        UI.setStatus('>>> DOMINIC IMPRISONED \u2014 ALL VISIBLE ASSETS SEIZED <<<');
        UI.drainEmpireMeter(0);
        
        // 2. Wait 2 seconds for visual drain to complete, then reveal the hidden 1 Billion
        setTimeout(() => {
            progressiveMeter.internalValue = hiddenInternal;
            UI.updateMeterDisplay(hiddenBillion);
            
            const hiddenLabel = document.getElementById('hidden-funds-label');
            if (hiddenLabel) hiddenLabel.style.display = 'block';
            const meterVal = document.getElementById('dominic-empire-value');
            if (meterVal) meterVal.classList.add('hidden-funds-mode');
            
            UI.setStatus('>>> HIDDEN OFF-SHORE ACCOUNT REVEALED: $1,000,000,000 <<<');
        }, 2000);
        
        // Swap blocker to prison loops instead of burning loops
        this.math.symbols[6].video = 'Videos/dominic_prison_loop.mp4';
        this.math.symbols[6].image = 'stills/dominic_prison_loop.png';
        this.math.symbols[6].name = 'DOMINIC_IMPRISONED';
        this.math.symbols[6].label = 'DOM';
        const scene = this.reels[0] && this.reels[0].scene;
        if (scene) { const loader = scene.load; loader.image('sym_6', 'stills/dominic_prison_loop.png'); loader.once('complete', () => {}); loader.start(); }
        
        // Delay the prison video swap — let the phoneHit play on the top screen FIRST
        // Then after that completes, swap the video pool to prison and continue the shuffle
        setTimeout(() => {
            this._swapTopScreenToPrison();
            
            // Force the player to jump to the new pool immediately if it's currently looping an Isla video
            const activeVid = document.getElementById('feature-video');
            if (activeVid && activeVid._shuffleHandler) {
                activeVid._shuffleHandler();
            }
            
            console.log('Prison cinematic transition complete — video pool now prison.');
        }, 1500);
        
        document.body.classList.add('prison-mode-active');
        setTimeout(() => { callback(); }, 5000);
    }

    _executeBurning(data, progressiveMeter, callback) {
        NarrativeManager.burns++;
        NarrativeManager.updateUI();
        const payout = data.payout;
        const internalDrain = payout / this.math.meter.displayMultiplier;
        progressiveMeter.internalValue = Math.max(0, progressiveMeter.internalValue - internalDrain);
        UI.drainEmpireMeter(progressiveMeter.getDisplayValue());
        UI.setStatus(`>>> $${payout.toLocaleString()} BURNED \u2014 ${data.label} <<<`);
        
        // Top screen burningMoney_topscreen is disabled for now.
        // Overlays are no longer cleaned up here. They persist infinitely
        // until the player clicks spin, where startSpin() cleans them up.
        // The underlying sprites have already been swapped, so they spin off cleanly.
        setTimeout(() => { callback(); }, 4500);
    }

    _swapTopScreenToPrison() {
        if (!this.math.baseFeatureVideos) {
            this.math.baseFeatureVideos = [...this.math.featureVideos];
        }
        this.math.featureVideos.length = 0;
        this.math.prisonVideos.forEach(v => this.math.featureVideos.push(v));
    }

    revertPrisonToDominic() {
        this.hasBeenArrested = false;
        
        // Hide the hidden assets UI
        const hiddenLabel = document.getElementById('hidden-funds-label');
        if (hiddenLabel) hiddenLabel.style.display = 'none';
        const meterVal = document.getElementById('dominic-empire-value');
        if (meterVal) meterVal.classList.remove('hidden-funds-mode');
        
        if (this.math.baseFeatureVideos) {
            this.math.featureVideos.length = 0;
            this.math.baseFeatureVideos.forEach(v => this.math.featureVideos.push(v));
        }
        
        // Force the ping-pong buffer to pick an Isla video immediately
        const activeVid = document.getElementById('feature-video');
        if (activeVid && activeVid._shuffleHandler) {
            activeVid._shuffleHandler();
        }
        
        // Ensure standard DOM blocker loops are restored visually right now
        AntiSlotReel.cleanupVideoOverlays();
        for (let reel of this.reels) {
            reel.playLandingVideos();
        }
        
        document.body.classList.remove('prison-mode-active');
        
        // Revert Dominic's physical reel symbol back to the standard street pulse
        this.math.symbols[6].video = 'Videos/ethel_dominic_pulse.mp4';
        this.math.symbols[6].image = 'stills/ethel_dominic_pulse.png';
        this.math.symbols[6].name = 'DOMINIC_HOUSE';
        this.math.symbols[6].label = 'DOM';
        
        const scene = this.reels[0] && this.reels[0].scene;
        if (scene) {
            const loader = scene.load;
            loader.image('sym_6', 'stills/ethel_dominic_pulse.png');
            loader.once('complete', () => {});
            loader.start();
        }
        
        // Trigger the JAILBREAK SUCCESSFUL overlay
        const escapeNotification = document.getElementById('escape-notification');
        if (escapeNotification) {
            escapeNotification.style.display = 'flex';
            setTimeout(() => {
                escapeNotification.style.opacity = '0';
                setTimeout(() => {
                    escapeNotification.style.display = 'none';
                    escapeNotification.style.opacity = '1';
                }, 500);
            }, 3500);
        }
    }

    _hijackUIPhone(onComplete, videoSrc) {
        const featureVid = document.getElementById('feature-video');
        if (!featureVid) { onComplete(); return; }
        const src = videoSrc || 'Videos/prison_topscreen.mp4';
        const shuffleHandler = featureVid._shuffleHandler;
        if (shuffleHandler) featureVid.removeEventListener('ended', shuffleHandler);
        let hijackStarted = false;
        const startHijackVideo = () => {
            if (hijackStarted) return; hijackStarted = true;
            
            UI.playFeatureVideo(src, false, () => {
                // CRITICAL: fire onComplete FIRST so the video pool gets swapped
                // (e.g. _swapTopScreenToPrison) BEFORE we pick the next video
                onComplete();
                
                const videos = this.math.featureVideos;
                const nextSrc = videos[Math.floor(Math.random() * videos.length)];
                
                UI.playFeatureVideo(nextSrc, false, shuffleHandler, true);
            }, true);
        };
        
        // Wait for current video to finish OR force hijack after 3s
        let currentVid = document.getElementById('feature-video');
        if (currentVid && currentVid.loop) currentVid.loop = false;
        
        if (currentVid) currentVid.addEventListener('ended', startHijackVideo, { once: true });
        setTimeout(() => { 
            const vid = document.getElementById('feature-video');
            if (vid) vid.removeEventListener('ended', startHijackVideo); 
            startHijackVideo(); 
        }, 3000);
    }

    static cleanupOverlays() {
        document.querySelectorAll('.bracket-hit-overlay, .bracket-hit-loop').forEach(el => {
            if (el.pause) el.pause(); if (el.removeAttribute) el.removeAttribute('src'); el.remove();
        });
    }
}


// ================================================================
// 7. SmartDumbProtocol — 10 Psychological Terminal Hacks (Preserved)
// ================================================================

class SmartDumbProtocol {
    constructor() {
        this.activeHack = null;
        this.spinsSinceLastHack = 0;
        this.nextHackThreshold = this._randomThreshold();
        this.hackHistory = [];
        this.hacks = [
            { id: 'STRUCTURAL', lore: 'The Engineer\'s Trap', display: '> CALCULATING LOAD: 1 steel rod vs 2. Offset vector by 45 deg. Factor cost reduction of 18%. Enter structural threshold variable (kN):', mathAnswer: '450', mathTaunt: '> MATH CORRECT. BUT YOU FORGOT TO ASK IF THE BUILDER WAS EXHAUSTED. ACCESS DENIED.', realAnswer: ['exhaustion', 'breathe', 'exhausted'], successMsg: '> KINETIC OVERRIDE ACCEPTED. MARGINS EXPLOITED.' },
            { id: 'CONVOY', lore: 'The Italian Convoy', display: '> AMBUSH PROBABILITY VECTOR: 4 trucks. 12 men. Calculate the exact survival percentage based on a straight-line sprint of 40m:', mathAnswer: '14.2', mathTaunt: '> STATISTICALLY ACCURATE. BUT HEROES DON\'T DO MATH. THEY DO ASSET MANAGEMENT. ACCESS DENIED.', realAnswer: ['liability', 'asset'], successMsg: '> ASSET RECLASSIFIED. CONVOY REROUTED.' },
            { id: 'LONG_BAY', lore: 'The Long Bay Exit', display: '> PRISON_GATE_ENCRYPTION: LCG Seed 14. Multiplier 5. Modulus 31. Calculate X(n+1):', mathAnswer: '11', mathTaunt: '> HASH CRACKED. BUT YOU DIDN\'T NEED A KEY. YOU JUST NEEDED TO WALK. ACCESS DENIED.', realAnswer: ['walk', 'open'], successMsg: '> GATE_OVERRIDE: DOOR OPENS. NO KEY REQUIRED.' },
            { id: 'PARALLAX', lore: 'The Parallax Test', display: '> GEOMETRY_TEST: Fall velocity from 20m cliff into water basin. Calculate terminal velocity (m/s) before impact:', mathAnswer: '19.8', mathTaunt: '> PHYSICS CORRECT. BUT YOU MISSED THE SAFE PATH. ACCESS DENIED.', realAnswer: ['perspective', 'safe path'], successMsg: '> PARALLAX SHIFTED. THE DROP WAS NEVER THE PROBLEM.' },
            { id: 'CONCOURSE', lore: 'The Concourse Setup', display: '> RTA_SYSTEM_LOG: Find the anomaly. 14,000 traffic events. Enter the exact timestamp of the packet drop:', mathAnswer: '1402', mathTaunt: '> TIMESTAMP FOUND. BUT WAS IT A HACK OR HUMAN ERROR? ACCESS DENIED.', realAnswer: ['mistake', 'purpose'], successMsg: '> ANOMALY RECLASSIFIED: INTENTIONAL. SYSTEM COMPROMISED.' },
            { id: 'WEDDING_CAKE', lore: 'The Wedding Cake', display: '> DECRYPT WEP KEY: Base64 string [UG9saXNoZWQgVm9taXQ=]. Decode to ASCII:', mathAnswer: 'polished vomit', mathTaunt: null, realAnswer: ['polished vomit'], successMsg: '> ISLA\'S PASSWORD ACCEPTED. THE MATH WAS THE ANSWER ALL ALONG.' },
            { id: 'DISTRACTION', lore: 'The Distraction', display: '> SURVEILLANCE_VECTORS: Subject moving North at 40km/h. Tail moving East at 30km/h. Calculate hypotenuse distance after 12 mins:', mathAnswer: '10', mathTaunt: '> DISTANCE CORRECT. YOU SPENT 3 MINUTES CALCULATING A DECOY. ACCESS DENIED.', realAnswer: ['decoy', 'clipboard'], successMsg: '> DECOY IDENTIFIED. REAL TARGET ACQUIRED.' },
            { id: 'RATTLED', lore: 'The Warning', display: '> AUDIO_ANALYSIS: Isolate the sound wave. Frequency 440Hz. Amplitude 0.8. Enter the sine wave derivative:', mathAnswer: '352', mathTaunt: '> DERIVATIVE CORRECT. BUT YOUR GUARD IS DOWN. ACCESS DENIED.', realAnswer: ['rattle', 'rattled'], successMsg: '> FREQUENCY WEAPONIZED. GUARD SHATTERED.' },
            { id: 'OUTLIERS', lore: 'The Outliers', display: '> SOCIAL_CONTRACT_MATRIX: If 99% of nodes conform to Protocol A, enter the value of the non-compliant node:', mathAnswer: '1', mathTaunt: '> YOU FOUND THE OUTLIER. BUT YOU STILL CALL IT NORMAL. ACCESS DENIED.', realAnswer: ['camouflage', 'silence'], successMsg: '> NODE RECLASSIFIED: SILENT THREAT. DOMINIC EXPOSED.' },
            { id: 'FINAL_BRIDGE', lore: 'The Final Bridge', display: '> DIVIDE_BY_ZERO_ERROR: [FATAL EXCEPTION]. SYSTEM COLLAPSE IMMINENT. ENTER COMMAND TO ABORT:', mathAnswer: null, mathTaunt: '> YOU TRIED TO FIX IT. WRONG MOVE. ACCESS DENIED.', realAnswer: ['burn the bridge', 'scream', 'burn'], successMsg: '> BRIDGE BURNED. CYMATIC FRACTURE INITIATED.', panicAnswers: ['abort', 'stop', 'cancel', 'exit', 'quit'] }
        ];
    }

    _randomThreshold() { return Math.floor(Math.random() * 4) + 5; }
    shouldTriggerHack() { this.spinsSinceLastHack++; return this.spinsSinceLastHack >= this.nextHackThreshold; }
    isActive() { return this.activeHack !== null; }

    triggerHack() {
        const available = this.hacks.filter(h => !this.hackHistory.includes(h.id));
        const pool = available.length > 0 ? available : this.hacks;
        this.activeHack = pool[Math.floor(Math.random() * pool.length)];
        this.hackHistory.push(this.activeHack.id);
        if (this.hackHistory.length > 5) this.hackHistory.shift();
        this.spinsSinceLastHack = 0;
        this.nextHackThreshold = this._randomThreshold();
        UI.showHackPuzzle(this.activeHack.display, this.activeHack.lore);
        return this.activeHack;
    }

    evaluateInput(rawInput) {
        if (!this.activeHack) return 'NORMAL_SPIN';
        const input = rawInput.toLowerCase().trim();
        const hack = this.activeHack;
        if (hack.realAnswer.includes(input)) {
            UI.setStatus(hack.successMsg); this.activeHack = null; UI.hideHackPuzzle(); return 'HACK_SUCCESS';
        }
        if (hack.mathAnswer && input === hack.mathAnswer.toLowerCase()) {
            if (hack.mathTaunt === null) { UI.setStatus(hack.successMsg); this.activeHack = null; UI.hideHackPuzzle(); return 'HACK_SUCCESS'; }
            UI.setStatus(hack.mathTaunt); this.activeHack = null; UI.hideHackPuzzle(); return 'TAUNTED';
        }
        if (hack.panicAnswers && hack.panicAnswers.includes(input)) {
            UI.setStatus(hack.mathTaunt); this.activeHack = null; UI.hideHackPuzzle(); return 'TAUNTED';
        }
        UI.setStatus('> ACCESS DENIED. INITIATING STANDARD SPIN.');
        this.activeHack = null; UI.hideHackPuzzle(); return 'NORMAL_SPIN';
    }
}


// ================================================================
// 8. FreeSpinsController — System Override
// ================================================================

class FreeSpinsController {
    constructor(mathConfig, mainController, reels) {
        this.math = mathConfig;
        this.mainController = mainController;
        this.reels = reels;
        this.spinsRemaining = 10;
        this.totalDamageDealt = 0;
        this.password = this._generatePassword();
        this.revealedDigits = new Array(6).fill(false);
    }

    _generatePassword() {
        let pwd = '';
        for (let i = 0; i < 6; i++) pwd += Math.floor(Math.random() * 10).toString();
        return pwd;
    }

    scanHighTierTargets(grid) {
        const targets = [];
        for (let col = 0; col < this.math.cols; col++) {
            for (let row = 0; row < this.math.rows; row++) {
                const symbolId = grid[col][row];
                if (symbolId === 3 || symbolId === 4) {
                    const coords = this.reels[col].getSymbolScreenCoords(row);
                    targets.push({ col, row, symbolId, x: coords.x, y: coords.y });
                }
            }
        }
        return targets;
    }

    executeTransition() {
        const featureVideo = document.getElementById('feature-video');
        if (featureVideo) {
            featureVideo.src = this.math.freeSpinsBgVideo;
            featureVideo.loop = true;
            featureVideo.play().catch(() => {});
        }
        const hackUI = document.getElementById('password-hack-container');
        hackUI.classList.add('active');
        document.getElementById('passcode-display').innerText = this._getPasswordDisplay();
        document.getElementById('hack-attempts-left').innerText = 'ATTEMPTS REMAINING: 10';
        document.getElementById('hack-damage-total').innerText = '';
        document.getElementById('bridge-burned-msg').classList.remove('flash-visible');
        document.getElementById('slot-grid-container').classList.add('cymatic-glow');
        setTimeout(() => this.runFreeSpinCycle(), 1500);
    }

    _getPasswordDisplay() {
        return this.password.split('').map((ch, i) => this.revealedDigits[i] ? ch : '_').join(' ');
    }

    runFreeSpinCycle() {
        if (this.spinsRemaining <= 0) { this.endFreeSpins(); return; }
        this.spinsRemaining--;
        document.getElementById('hack-attempts-left').innerText = `ATTEMPTS REMAINING: ${this.spinsRemaining}`;
        this.rollPasscodeUI(() => {
            const stopIndices = this.math.virtualStrips.map(strip => Math.floor(Math.random() * strip.length));
            const evaluator = new DamageEvaluator(this.math);
            const result = evaluator.evaluateBoard(stopIndices);
            const targets = this.scanHighTierTargets(result.grid);
            if (targets.length > 0) {
                this.triggerStrike(targets[Math.floor(Math.random() * targets.length)]);
            } else {
                document.getElementById('hack-damage-total').innerText = '[ SIGNAL LOST ]';
                document.getElementById('hack-damage-total').style.color = '#71717a';
                setTimeout(() => this.runFreeSpinCycle(), 1000);
            }
        });
    }

    triggerStrike(target) {
        const damage = Math.floor(Math.random() * 5000) + 1000;
        this.totalDamageDealt += damage;
        const nextUnrevealed = this.revealedDigits.indexOf(false);
        if (nextUnrevealed !== -1) this.revealedDigits[nextUnrevealed] = true;
        document.getElementById('passcode-display').innerText = this._getPasswordDisplay();
        const dmgEl = document.getElementById('hack-damage-total');
        dmgEl.innerText = `>> STRIKE: $${damage.toLocaleString()} [${MATH_CONFIG.symbols[target.symbolId].name}]`;
        dmgEl.style.color = '#00ff41';
        UI.drainEmpireMeter(damage);
        const hackContainer = document.getElementById('password-hack-container');
        hackContainer.style.background = 'rgba(255, 0, 85, 0.3)';
        setTimeout(() => { hackContainer.style.background = 'rgba(0, 0, 0, 0.75)'; }, 150);
        if (damage > 3000) document.getElementById('bridge-burned-msg').classList.add('flash-visible');
        if (this.revealedDigits.every(d => d)) { setTimeout(() => this.resolveJackpot(), 1500); return; }
        setTimeout(() => { document.getElementById('bridge-burned-msg').classList.remove('flash-visible'); this.runFreeSpinCycle(); }, 2500);
    }

    resolveJackpot() {
        const jackpot = this.mainController.progressiveMeter.getGrandJackpot(1.0);
        const totalMsg = document.getElementById('hack-damage-total');
        totalMsg.innerText = `>>> GRAND JACKPOT: $${jackpot.toLocaleString()} — DOMINIC GOES TO JAIL <<<`;
        totalMsg.style.color = '#ff0055';
        document.getElementById('passcode-display').innerText = this.password.split('').join(' ');
        UI.drainEmpireMeter(jackpot);
        setTimeout(() => this.endFreeSpins(), 4000);
    }

    rollPasscodeUI(callback) {
        let iterations = 0;
        const codeDisplay = document.getElementById('passcode-display');
        const rollInterval = setInterval(() => {
            codeDisplay.innerText = Math.random().toString(16).substr(2, 6).toUpperCase();
            iterations++;
            if (iterations > 20) { clearInterval(rollInterval); codeDisplay.innerText = this._getPasswordDisplay(); callback(); }
        }, 50);
    }

    endFreeSpins() {
        const totalMsg = document.getElementById('hack-damage-total');
        totalMsg.innerText = `TOTAL EXTRACTED: $${this.totalDamageDealt.toLocaleString()}`;
        totalMsg.style.color = '#ff0055';
        setTimeout(() => {
            document.getElementById('password-hack-container').classList.remove('active');
            document.getElementById('slot-grid-container').classList.remove('cymatic-glow');
            const featureVideo = document.getElementById('feature-video');
            if (featureVideo) {
                const videos = this.math.featureVideos;
                featureVideo.src = videos[Math.floor(Math.random() * videos.length)];
                featureVideo.loop = false;
                featureVideo.play().catch(() => {});
            }
            this.mainController.progressiveMeter.reset();
            UI.updateMeterDisplay(this.mainController.progressiveMeter.getDisplayValue());
            UI.setStatus(`> HACK_COMPLETE // EXTRACTED: $${this.totalDamageDealt.toLocaleString()}`);
            setTimeout(() => UI.setSpinEnabled(true), 1000);
        }, 2000);
    }
}


// ================================================================
// 9. AntiSlotController — Main Orchestrator
//    Pipeline: Evaluate → DominicBlocker → ProgressiveMeter → UI
// ================================================================


// ================================================================
// 9. AntiSlotController — Main Orchestrator
//    Pipeline: Evaluate → BracketHit → PhoneBlast → ProgressiveMeter → UI
// ================================================================

class AntiSlotController {
    constructor(reels, mathConfig, evaluator, phaserGame) {
        this.reels = reels;
        this.math = mathConfig;
        this.evaluator = evaluator;
        this.phaserGame = phaserGame;
        this.isSpinning = false;
        this.windUpInterval = null;
        this.currentResult = null;
        this.spinsInPrison = 0;

        // Sub-systems
        this.smartDumb = new SmartDumbProtocol();
        this.progressiveMeter = new ProgressiveMeter(mathConfig);
        this.dominicBlocker = new DominicBlocker(mathConfig);
        this.blastRadius = new BlastRadiusController(mathConfig, reels);
        this.bracketHit = new BracketHitController(mathConfig, reels);
    }

    attemptSpin() {
        if (this.isSpinning) return;
        this.startSpin();
    }

    startSpin() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        AntiSlotReel.cleanupVideoOverlays();
        BlastRadiusController.cleanupOverlays();
        BracketHitController.cleanupOverlays();
        document.querySelectorAll('.pincer-phone-loop').forEach(el => { el.pause(); el.removeAttribute('src'); el.remove(); });
        UI.setSpinEnabled(false);
        UI.setStatus('EXECUTING_SPIN...');
        document.getElementById('slot-grid-container').classList.add('spin-active');
        
        // BULLETPROOF FAILSAFE: If ANY callback chain breaks and spin stays locked
        // for more than 12 seconds, force-unlock the button. This prevents permanent lockout.
        if (this._spinUnlockFailsafe) clearTimeout(this._spinUnlockFailsafe);
        this._spinUnlockFailsafe = setTimeout(() => {
            if (this.isSpinning || document.getElementById('btn-spin')?.disabled) {
                console.warn('SPIN FAILSAFE: Force-unlocking spin button after 12s timeout');
                this.isSpinning = false;
                UI.setSpinEnabled(true);
            }
        }, 12000);
        
        this.reels.forEach(reel => reel.spin());
        const spinResult = this.calculateRNG();
        this.currentResult = spinResult;
        const isTease = this.checkForBonusTease(spinResult);
        this.scheduleStops(spinResult, isTease);
    }

    executeForcedBonusSpin() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        AntiSlotReel.cleanupVideoOverlays();
        BlastRadiusController.cleanupOverlays();
        BracketHitController.cleanupOverlays();
        document.querySelectorAll('.pincer-phone-loop').forEach(el => { el.pause(); el.removeAttribute('src'); el.remove(); });
        UI.setSpinEnabled(false);
        UI.setStatus('>> OVERRIDE_ACTIVE — FORCING BRACKET...');
        this.reels.forEach(reel => reel.spin());

        // Force a bracket: place phones at col 1 and col 3 on the same row
        const targetRow = Math.floor(Math.random() * this.math.rows);
        const forcedResult = this.math.virtualStrips.map((strip, reelIdx) => {
            if (reelIdx === 1 || reelIdx === 3) {
                for (let pos = 0; pos < strip.length; pos++) {
                    if (strip[(pos + targetRow) % strip.length] === 7) return pos;
                }
            }
            return Math.floor(Math.random() * strip.length);
        });
        this.currentResult = forcedResult;
        this.scheduleStops(forcedResult, true);
    }

    calculateRNG() {
        let result = null;

        // 1. PRISON PROBABILITY CHECK
        if (NarrativeManager.prisonChance >= 0 && !this.bracketHit.hasBeenArrested && !NarrativeManager.isForced) {
            // User explicitly forced a probability from the UI slider (0 to 100%)
            if (Math.random() * 100 < NarrativeManager.prisonChance) {
                result = this._generateForcedPrisonRNG();
            }
        } else if (!this.bracketHit.hasBeenArrested && !NarrativeManager.isForced) {
            // Default internal dynamic escalation math
            const currentEmpire = this.progressiveMeter.getDisplayValue();
            const dangerRatio = Math.max(0, currentEmpire - OppressionEngine.BASELINE) / (OppressionEngine.FATAL - OppressionEngine.BASELINE);
            if (dangerRatio > 0.1) {
                 const forceChance = dangerRatio * 0.85; 
                 if (Math.random() < forceChance) {
                     result = this._generateForcedPrisonRNG();
                 }
            }
        }

        // Generate standard if no prison force fired
        if (!result) {
            result = this.math.virtualStrips.map(strip => Math.floor(Math.random() * strip.length));
        }

        // PREVENT PREMATURE JAILBREAKS (or any natural Jailbreak right after entering)
        if (this.bracketHit.hasBeenArrested) {
            this.spinsInPrison++;
            const minSpins = NarrativeManager.isForced ? 15 : 6;
            if (this.spinsInPrison < minSpins) {
                // Scrub ANY [7, 2, 7] combination (Jailbreak Blast Radius)
                let grid = this.evaluator.buildGrid(result);
                for (let row = 0; row < this.math.rows; row++) {
                    for (let col = 1; col < this.math.cols - 1; col++) {
                        if (grid[col-1][row] === 7 && grid[col+1][row] === 7 && grid[col][row] === 2) {
                            // Disrupt the bracket by moving the left phone up one slot
                            result[col-1] = (result[col-1] + 1) % this.math.virtualStrips[col-1].length;
                        }
                    }
                }
            }
        } else {
            // Reset spins tracker when not in prison
            this.spinsInPrison = 0;
            
            // ENFORCE NARRATIVE LOCK (Prevent ANY Natural Prison Arrest if conditions aren't met)
            if (NarrativeManager.isForced && !NarrativeManager.canGoToPrison()) {
                let grid = this.evaluator.buildGrid(result);
                for (let row = 0; row < this.math.rows; row++) {
                    for (let col = 1; col < this.math.cols - 1; col++) {
                        const targetId = grid[col][row];
                        if (targetId === 6) {
                            const leftId = grid[col-1][row];
                            const rightId = grid[col+1][row];
                            // If bracketed by Ethel (2) or Isla (5), it's an arrest: disrupt it!
                            if (leftId === rightId && (leftId === 2 || leftId === 5)) {
                                result[col-1] = (result[col-1] + 1) % this.math.virtualStrips[col-1].length;
                            }
                        }
                    }
                }
            }
        }

        // 2. ETHEL INTELLIGENCE (Dodge Blast)
        if (NarrativeManager.ethelIntel > 0) {
            if (Math.random() * 100 < NarrativeManager.ethelIntel) {
                // Peek at the grid to see if Ethel (2) is next to a Phone (7)
                const tempGrid = this.evaluator.buildGrid(result);
                for (let row = 0; row < this.math.rows; row++) {
                    for (let col = 1; col < this.math.cols - 1; col++) {
                        if (tempGrid[col][row] === 7) {
                            if (tempGrid[col - 1][row] === 2) result[col - 1] = (result[col - 1] + 1) % this.math.virtualStrips[col - 1].length;
                            if (tempGrid[col + 1][row] === 2) result[col + 1] = (result[col + 1] + 1) % this.math.virtualStrips[col + 1].length;
                        }
                    }
                }
            }
        }

        return result;
    }

    _generateForcedPrisonRNG() {
        // Force Dominic (id 6) on center reel (col 2), and Ethel (2) or Isla (5) on cols 1 & 3
        const targetRow = Math.floor(Math.random() * this.math.rows);
        const attackerId = Math.random() < 0.5 ? 2 : 5; 
        return this.math.virtualStrips.map((strip, reelIdx) => {
            if (reelIdx === 1 || reelIdx === 3) {
                for (let pos = 0; pos < strip.length; pos++) {
                    if (strip[(pos + targetRow) % strip.length] === attackerId) return pos;
                }
            } else if (reelIdx === 2) {
                for (let pos = 0; pos < strip.length; pos++) {
                    if (strip[(pos + targetRow) % strip.length] === 6) return pos;
                }
            }
            return Math.floor(Math.random() * strip.length);
        });
    }

    checkForBonusTease(spinResult) {
        let phoneCount = 0;
        for (let reelIdx = 0; reelIdx < this.math.cols; reelIdx++) {
            const strip = this.math.virtualStrips[reelIdx];
            for (let row = 0; row < this.math.rows; row++) {
                if (strip[(spinResult[reelIdx] + row) % strip.length] === 7) { phoneCount++; break; }
            }
        }
        return phoneCount >= 2;
    }

    scheduleStops(spinResult, isTease) {
        const baseDelay = 1000;
        const stagger = 300;
        const teaseDelay = 2500;
        let lastStopTime = 0;
        this.reels.forEach((reel, index) => {
            let stopDelay = baseDelay + (index * stagger);
            if (isTease && index >= 2) {
                stopDelay += teaseDelay;
                if (index === 2) setTimeout(() => this.triggerWindUpVFX(), baseDelay + stagger + 200);
            }
            lastStopTime = Math.max(lastStopTime, stopDelay);
            setTimeout(() => reel.commandStop(spinResult[index]), stopDelay);
        });
        setTimeout(() => this.resolveSpin(spinResult), lastStopTime + 800);
    }

    triggerWindUpVFX() {
        UI.setStatus('>> TEASE_DETECTED // BRACKET FORMING...');
        const cabinet = document.getElementById('anti-slot-cabinet');
        cabinet.classList.add('tease-active');
        this.windUpInterval = setInterval(() => {
            const featureContainer = document.getElementById('feature-video-container');
            if (featureContainer) {
                featureContainer.style.background = `radial-gradient(ellipse at center, #400010 0%, #050505 70%)`;
                setTimeout(() => { featureContainer.style.background = ''; }, 100);
            }
        }, 200);
    }

    clearWindUpVFX() {
        if (this.windUpInterval) { clearInterval(this.windUpInterval); this.windUpInterval = null; }
        document.getElementById('anti-slot-cabinet').classList.remove('tease-active');
    }

    resolveSpin(spinResult) {
        this.isSpinning = false;
        if (this.spinFailsafe) clearTimeout(this.spinFailsafe); // Clear active watch loop since resolved normally
        
        this.clearWindUpVFX();
        document.getElementById('slot-grid-container').classList.remove('spin-active');

        const evalResult = this.evaluator.evaluateBoard(spinResult);

        // Helper: runs the post-mechanic pipeline
        const continueAfterMechanics = (skipNoHit = false) => {
            // ===== BRACKET HIT DETECTION (unified arrest + burning) =====
            const bracketData = this.bracketHit.detectBracketHit(evalResult.grid);
            if (bracketData) {
                UI.setStatus(`>>> ${bracketData.label} <<<`);
                this.bracketHit.executeBracketHit(bracketData, this.progressiveMeter, () => {
                    this.evaluateBaseDamage(spinResult, evalResult, true); // true = skip no hit message
                });
                return;
            }

            // Check meter depletion → triggers Escape Lottery (Level 3 Final)
            if (this.progressiveMeter.isDepleted()) {
                UI.setStatus('>>> EMPIRE_COLLAPSED — INITIATING ESCAPE PROTOCOL <<<');
                UI.setSpinEnabled(false);
                setTimeout(() => {
                    this._runEscapeLottery();
                }, 1000);
                return;
            }

            this.evaluateBaseDamage(spinResult, evalResult, skipNoHit);
        };


        // ===== PHONE BLAST DETECTION (net-zero) =====
        this._checkPhoneBlastThenContinue(evalResult, spinResult, continueAfterMechanics);
    }

    _checkPhoneBlastThenContinue(evalResult, spinResult, continueAfterMechanics) {
        const phoneBlast = this.blastRadius.detectPhoneBlast(evalResult.grid);
        if (phoneBlast) {
            NarrativeManager.blasts++;
            NarrativeManager.updateUI();
            UI.setStatus('>>> PHONE BLAST RADIUS DETECTED <<<');
            this.blastRadius.executePhoneBlast(phoneBlast, this.progressiveMeter, (coords) => {
                setTimeout(() => {
                    BlastRadiusController.cleanupOverlays();
                    continueAfterMechanics(true);
                }, 3000);
            });
            return;
        }
        continueAfterMechanics();
    }

    _runEscapeLottery() {
        // Swap to shattering glass background using the unified transition system
        const featureVid = document.getElementById('feature-video');
        if (featureVid) {
            UI.playFeatureVideo('Videos/shattering_glass_loop.mp4', true);
        }

        const hackUI = document.getElementById('password-hack-container');
        if (hackUI) hackUI.classList.add('active');

        const titleEl = document.querySelector('.hack-title');
        if (titleEl) {
            titleEl.innerText = 'ESCAPE_PROTOCOL_INITIATED';
            titleEl.style.color = '#00ff41';
        }

        const attemptsEl = document.getElementById('hack-attempts-left');
        if (attemptsEl) attemptsEl.innerText = 'BRUTE FORCING BILLION DOLLAR OFF-SHORE ACCOUNT...';

        const codeDisplay = document.getElementById('passcode-display');
        if (codeDisplay) codeDisplay.style.color = '#fff';

        const outcomeEl = document.getElementById('hack-damage-total');
        if (outcomeEl) outcomeEl.innerText = '';

        let rollCount = 0;
        const maxRolls = 60; // 4.8 seconds of rolling
        const rollInterval = setInterval(() => {
            const num = String(Math.floor(Math.random() * 999999999)).padStart(9, '0');
            if (codeDisplay) codeDisplay.innerText = num.match(/.{1,3}/g).join(' '); // Format blocks
            
            rollCount++;
            if (rollCount >= maxRolls) {
                clearInterval(rollInterval);
                const escapeSuccess = Math.random() < 0.01; // 1% chance
                if (escapeSuccess) {
                    if (titleEl) titleEl.innerText = 'OVERRIDE_SUCCESS';
                    if (outcomeEl) {
                        outcomeEl.innerText = 'DOMINIC ACCESSES SECRET BILLION';
                        outcomeEl.style.color = '#ff0';
                    }
                    if (codeDisplay) codeDisplay.style.color = '#ff0';

                    const billion = 1000000000;
                    const internalGain = billion / this.math.meter.displayMultiplier;
                    this.progressiveMeter.internalValue += internalGain;
                    UI.updateMeterDisplay(this.progressiveMeter.getDisplayValue());
                    UI.setStatus('>>> DOMINIC ESCAPES \u2014 ACCESSES SECRET BILLION! <<<');
                    setTimeout(() => {
                        if (hackUI) hackUI.classList.remove('active');
                        document.body.classList.remove('prison-mode-active');
                        this.bracketHit.revertPrisonToDominic();
                        UI.setSpinEnabled(true);
                    }, 4600);
                } else {
                    if (titleEl) {
                        titleEl.innerText = 'ESCAPE_FAILED';
                        titleEl.style.color = '#ff0055';
                    }
                    if (outcomeEl) {
                        outcomeEl.innerText = '>> ALL ASSETS DEPLETED <<';
                        outcomeEl.style.color = '#ff0055';
                    }
                    if (codeDisplay) {
                        codeDisplay.innerText = 'ACCESS_DENIED';
                        codeDisplay.style.color = '#ff0055';
                    }
                    if (attemptsEl) attemptsEl.innerText = '';
                    UI.setStatus('>>> DOMINIC REMAINS IN PRISON \u2014 SYSTEM LOCKED <<<');
                    
                    // After 3 seconds of showing the failure, trigger the final Win screen
                    setTimeout(() => {
                        OppressionEngine.triggerWin();
                    }, 3000);
                }
            }
        }, 80);
    }

    evaluateBaseDamage(spinResult, evalResult, skipNoHitMessage = false) {
        if (evalResult.totalDamage > 0) {
            const stealResult = this.dominicBlocker.applySteal(evalResult, this.progressiveMeter);
            
            let isPrisonMode = this.bracketHit.hasBeenArrested;
            let displayDamage = stealResult.finalDamage;
            if (isPrisonMode) {
                displayDamage = Math.ceil(displayDamage * 0.05); // Slash standard hits by 95% when in prison
            }

            if (stealResult.wasStolen) {
                NarrativeManager.intercepts++;
                NarrativeManager.updateUI();
                UI.setStatus(`> DOMINIC INTERCEPTED: -$${stealResult.stolenAmount.toLocaleString()} STOLEN (EMPIRE GROWS)`);
                setTimeout(() => {
                    UI.setStatus(`> NET DAMAGE: $${displayDamage.toLocaleString()}${isPrisonMode ? ' [PRISON RESISTANCE]' : ''}`);
                    this.progressiveMeter.onWin(displayDamage);
                    UI.drainEmpireMeter(this.progressiveMeter.getDisplayValue());
                    UI.flashBleakGrow();
                    UI.setSpinEnabled(true);
                }, 1500);
                return;
            }
            UI.setStatus(`> DAMAGE: $${displayDamage.toLocaleString()}${isPrisonMode ? ' [PRISON RESISTANCE]' : ''}`);
            this.progressiveMeter.onWin(displayDamage);
            UI.drainEmpireMeter(this.progressiveMeter.getDisplayValue());
            UI.flashWin();
        } else {
            // Disabled dead spin meter generation entirely. 
            // Just let standard loop continue.
            const contribution = this.progressiveMeter.onDeadSpin(1.0);
            if (!skipNoHitMessage) UI.setStatus('> NO_HIT // DOMINIC_HOLDS');
        }
        UI.setSpinEnabled(true);
        if (this._spinUnlockFailsafe) clearTimeout(this._spinUnlockFailsafe);
    }


    /** Hero Projectile particle trails — from reel positions UP to feature video zone */
    triggerParticleTrails(sourceCoords, hitType = null) {
        const isCurrentlyArrested = this.bracketHit.hasBeenArrested;
        const isArrestHit = hitType === 'PRISON';
        
        // Both prison and non-prison target the feature video container
        const featureEl = document.getElementById('feature-video-container');
        
        if (!featureEl) return;
        
        // Particle canvas is position:fixed covering full viewport.
        // Raw viewport coordinates from getBoundingClientRect.
        const featureRect = featureEl.getBoundingClientRect();
        const targetX = featureRect.left + featureRect.width / 2;
        const targetY = featureRect.top + featureRect.height / 2;

        sourceCoords.forEach((coord, i) => {
            if (window.particleSystem) {
                const colorHex = (isCurrentlyArrested || isArrestHit) ? '#00ff66' : '#e500ff';
                window.particleSystem.emitWave(coord.x, coord.y, targetX, targetY, 300, colorHex);
            }

            // On arrival (~1000ms) → play hit video on the top screen
            setTimeout(() => {
                if (i === sourceCoords.length - 1) {
                    const featureVid = document.getElementById('feature-video');
                    if (featureVid) {
                        // Pick the right hit video based on mode or the current hit context
                        const hitVidSrc = (isCurrentlyArrested || isArrestHit)
                            ? (['Videos/prison_hit.mp4', 'Videos/prison_hit_2.mp4'][Math.floor(Math.random() * 2)])
                            : this.math.phoneHitVideo;
                        
                        const shuffleHandler = featureVid._shuffleHandler;
                        
                        UI.playFeatureVideo(hitVidSrc, false, () => {
                            // Instead of restoring the old video (which might be an Isla Phone when we just transitioned to Prison),
                            // force a shuffle so it pulls natively from the newly updated video pool.
                            if (shuffleHandler) {
                                shuffleHandler();
                            } else {
                                // Fallback if no shuffle exists
                                UI.playFeatureVideo(this.math.featureVideos[0], true, null, true);
                            }
                        }, true);
                    }
                }
            }, 1000);
        });
    }
}


// ================================================================
// 10. UI BINDER — DOM Interface (Decoupled Meter Display)
// ================================================================

const UI = {
    setSpinEnabled(enabled) {
        const btn = document.getElementById('btn-spin');
        if (btn) { btn.disabled = !enabled; btn.classList.remove('puzzle-locked'); }
    },

    setStatus(text) {
        const el = document.getElementById('system-status');
        if (el) el.innerText = text;
    },

    showHackPuzzle(displayText, loreName) {
        UI.setStatus(displayText);
        const inputZone = document.getElementById('terminal-input-zone');
        if (inputZone) { inputZone.classList.remove('hidden'); inputZone.classList.add('active'); }
        const btn = document.getElementById('btn-spin');
        if (btn) btn.classList.add('puzzle-locked');
        const input = document.getElementById('terminal-input');
        if (input) {
            input.value = ''; input.placeholder = `solve: ${loreName}...`;
            setTimeout(() => input.focus(), 100);
        } else {
            setTimeout(() => { if (btn) btn.classList.remove('puzzle-locked'); UI.setSpinEnabled(true); }, 3000);
        }
    },

    hideHackPuzzle() {
        const inputZone = document.getElementById('terminal-input-zone');
        if (inputZone) { inputZone.classList.remove('active'); inputZone.classList.add('hidden'); }
        const btn = document.getElementById('btn-spin');
        if (btn) btn.classList.remove('puzzle-locked');
    },

    updateMeterDisplay(displayValue) {
        const meterEl = document.getElementById('dominic-empire-value');
        if (!meterEl) return;
        meterEl.innerText = `$${displayValue.toLocaleString()}`;
        meterEl.dataset.text = meterEl.innerText;
    },

    drainEmpireMeter(targetDisplayValue) {
        const meterEl = document.getElementById('dominic-empire-value');
        if (!meterEl) return;
        
        const currentDisplay = parseInt(meterEl.innerText.replace(/[$,]/g, ''), 10) || 0;
        const targetVal = Math.max(0, targetDisplayValue);
        const duration = 1200;
        const startTime = performance.now();
        const startVal = currentDisplay;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            const displayVal = Math.floor(startVal - ((startVal - targetVal) * eased));
            meterEl.innerText = `$${Math.max(0, displayVal).toLocaleString()}`;
            meterEl.dataset.text = meterEl.innerText;
            if (progress < 1) requestAnimationFrame(animate);
            else {
                // Ensure absolute final sync
                meterEl.innerText = `$${targetVal.toLocaleString()}`;
                meterEl.dataset.text = meterEl.innerText;
            }
            // Drive the OppressionEngine every frame during the meter animation
            OppressionEngine.update(displayVal);
        };
        requestAnimationFrame(animate);
    },

    flashWin() {
        const container = document.getElementById('slot-grid-container');
        if (container) {
            container.classList.add('win-flash');
            setTimeout(() => container.classList.remove('win-flash'), 1500);
        }
    },

    playFeatureVideo(src, loop = false, onended = null, autoPlay = true) {
        const activeVid = document.getElementById('feature-video');
        const bufferVid = document.getElementById('feature-video-buffer');
        if (!activeVid || !bufferVid) return;

        // Load into buffer
        bufferVid.src = src;
        bufferVid.loop = loop;
        bufferVid.onended = onended;
        bufferVid.muted = true;
        bufferVid.playsInline = true;

        let swapped = false;
        const commitSwap = () => { 
            if (swapped) return; 
            swapped = true; 
            
            // Swap IDs
            activeVid.id = 'feature-video-buffer';
            bufferVid.id = 'feature-video';
            
            // Swap opacity/z-index
            bufferVid.style.zIndex = '10';
            bufferVid.style.opacity = '1';
            
            activeVid.style.zIndex = '5';
            activeVid.style.opacity = '0';
            
            // Clear old video silently in background
            activeVid.pause();
            activeVid.removeAttribute('src');
            activeVid.load();
            activeVid.onended = null;
        };
        
        if (autoPlay) {
            bufferVid.play().catch(() => {});
            // 'playing' guarantees the media has enough data to start
            bufferVid.addEventListener('playing', () => {
                requestAnimationFrame(commitSwap); // Wait for next paint
            }, { once: true });
        } else {
            // 'loadeddata' guarantees the first frame is available
            bufferVid.addEventListener('loadeddata', () => {
                requestAnimationFrame(commitSwap); // Wait for next paint
            }, { once: true });
        }
        
        // Safety fallback — if the network hangs completely, swap after 2 seconds
        // This is much better than the 200ms which actively CAUSES black flashes
        setTimeout(commitSwap, 2000);
        
        // Video freeze watchdog: If the new active video stalls after swap, force-play it
        setTimeout(() => {
            const currentVid = document.getElementById('feature-video');
            if (currentVid && currentVid.paused && currentVid.readyState >= 2) {
                console.warn('VIDEO WATCHDOG: Feature video stalled, force-playing');
                currentVid.play().catch(() => {});
            }
        }, 3000);
    }
};


// ================================================================
// 11. PHASER 3 SETUP & MAIN INIT
// ================================================================

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'LOADING ASSETS...',
            style: { font: '14px Orbitron', fill: '#00ff41' }
        }).setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xff0055, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('ReelScene');
        });

        // Load all symbol textures into Phaser
        Object.entries(MATH_CONFIG.symbols).forEach(([id, sym]) => {
            this.load.image(`sym_${id}`, sym.image);
        });
        this.load.image('sym_burned', 'stills/burnsHouse_allThreeTurnMoneyBurning_loopForAll.png');

        // Safely queue all videos into Phaser's native loader
        // This ensures they are cached without DDOSing the browser (respects concurrent limits)
        // AND perfectly updates the green progress bar so the user knows it's loading
        const videoUrls = new Set([
            MATH_CONFIG.blastRevealVideo,
            MATH_CONFIG.phoneHitVideo,
            MATH_CONFIG.prisonHitVideo,
            MATH_CONFIG.freeSpinsBgVideo,
            ...(MATH_CONFIG.featureVideos || []),
            ...(MATH_CONFIG.prisonVideos || [])
        ]);
        Object.values(MATH_CONFIG.symbols).forEach(sym => {
            if (sym.video) videoUrls.add(sym.video);
        });

        let vId = 0;
        videoUrls.forEach(url => {
            if (url) {
                // load.video(key, url, loadEvent, asBlob, noAudio)
                this.load.video(`vid_cache_${vId++}`, url, 'loadeddata', false, true);
            }
        });
    }
}

class ReelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReelScene' });
    }

    // Moving preload logic to PreloadScene

    create() {
        const reelWindow = document.getElementById('reel-window');
        const CANVAS_WIDTH = reelWindow.clientWidth || 500;
        const SYMBOL_WIDTH = Math.floor(CANVAS_WIDTH / MATH_CONFIG.cols);
        const SYMBOL_HEIGHT = SYMBOL_WIDTH; // 1:1 aspect ratio
        const GRID_WIDTH = SYMBOL_WIDTH * MATH_CONFIG.cols;
        const GRID_HEIGHT = SYMBOL_HEIGHT * MATH_CONFIG.rows;

        // Store dimensions
        this.symbolWidth = SYMBOL_WIDTH;
        this.symbolHeight = SYMBOL_HEIGHT;

        // Reel container
        const reelsContainer = this.add.container(0, 0);

        // Create mask (Phaser geometry mask)
        const maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
        const mask = maskGraphics.createGeometryMask();
        reelsContainer.setMask(mask);

        // Grid lines
        const gridLines = this.add.graphics();
        gridLines.lineStyle(1, 0x222222, 0.3);
        for (let col = 1; col < MATH_CONFIG.cols; col++) {
            gridLines.moveTo(col * SYMBOL_WIDTH, 0);
            gridLines.lineTo(col * SYMBOL_WIDTH, GRID_HEIGHT);
        }
        for (let row = 1; row < MATH_CONFIG.rows; row++) {
            gridLines.moveTo(0, row * SYMBOL_HEIGHT);
            gridLines.lineTo(GRID_WIDTH, row * SYMBOL_HEIGHT);
        }

        // Create reels
        const reels = [];
        for (let i = 0; i < MATH_CONFIG.cols; i++) {
            const reel = new AntiSlotReel(
                i, MATH_CONFIG.virtualStrips[i],
                SYMBOL_WIDTH, SYMBOL_HEIGHT, reelsContainer, this
            );
            reel._renderSymbols();
            reels.push(reel);
        }

        // Initially hide reels (intro state)
        reelsContainer.setAlpha(0);
        gridLines.setAlpha(0);

        // Evaluator & Controller
        const evaluator = new DamageEvaluator(MATH_CONFIG);
        const controller = new AntiSlotController(reels, MATH_CONFIG, evaluator, this.game);
        window.slotController = controller; // Global reference for decoupled DOM events

        // Store references
        this.reels = reels;
        this.reelsContainer = reelsContainer;
        this.gridLines = gridLines;
        this.controller = controller;

        // ===== INTRO TITLE: BLAST_RADIUS.png fading to islaPhone shuffle =====
        const introImage = document.getElementById('intro-title-image');
        const featureVideo = document.getElementById('feature-video');
        let introActive = true;

        // Start feature video playing (hidden behind intro image, no pausing needed)
        if (featureVideo) {
            const videos = MATH_CONFIG.featureVideos;
            let currentVideoIndex = -1;
            function playRandomVideo() {
                let nextIndex;
                do { nextIndex = Math.floor(Math.random() * videos.length); }
                while (nextIndex === currentVideoIndex && videos.length > 1);
                currentVideoIndex = nextIndex;
                const nextSrc = videos[currentVideoIndex];
                
                UI.playFeatureVideo(nextSrc, false, playRandomVideo, true);
                
                setTimeout(() => {
                    const newVid = document.getElementById('feature-video');
                    if (newVid) newVid._shuffleHandler = playRandomVideo;
                }, 250);
            }
            playRandomVideo();
        }

        // ===== SPIN BUTTON =====
        const introOverlay = document.getElementById('intro-video-overlay');
        const introVideo = document.getElementById('intro-video');

        document.getElementById('btn-spin').addEventListener('click', () => {
            if (introActive) {
                introActive = false;

                // 1. Reveal reels and start spinning
                reelsContainer.setAlpha(1);
                gridLines.setAlpha(1);
                controller.attemptSpin();

                // 2. Fade BLAST_RADIUS.png → reveal already-playing video
                if (introImage) {
                    introImage.style.transition = 'opacity 0.8s ease';
                    introImage.style.opacity = '0';
                    setTimeout(() => introImage.remove(), 900);
                }

                // 4. Fade intro video overlay on reel window
                if (introOverlay) {
                    setTimeout(() => introOverlay.classList.add('fade-out'), 300);
                    setTimeout(() => {
                        if (introVideo) { introVideo.pause(); introVideo.src = ''; }
                        introOverlay.remove();
                    }, 1800);
                }
                
                // Force playback on the active feature video to bypass strict browser autoplay locks
                const currentFeature = document.getElementById('feature-video');
                if (currentFeature && currentFeature.paused) {
                    currentFeature.play().catch(() => {});
                }
                
                return;
            }
            controller.attemptSpin();
        });

        // ===== KEYBOARD =====
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !controller.isSpinning) {
                e.preventDefault();
                document.getElementById('btn-spin').click();
            }
            if (e.code === 'Enter' && controller.smartDumb.isActive()) {
                e.preventDefault();
                controller.attemptSpin();
            }
        });

        // ===== INITIAL STATUS =====
        UI.setStatus('IDLE_WAITING_COMMAND');
        UI.updateMeterDisplay(controller.progressiveMeter.getDisplayValue());
        OppressionEngine.update(controller.progressiveMeter.getDisplayValue());
        
        // ===== GAFF BINDINGS =====
        const gaffToggle = document.getElementById('gaff-toggle-btn');
        const gaffMenu = document.getElementById('gaff-menu');
        const gaffClose = document.getElementById('gaff-close-btn');
        
        if (gaffToggle && gaffMenu) {
            gaffToggle.addEventListener('click', () => { gaffMenu.style.display = 'flex'; });
            gaffClose.addEventListener('click', () => { gaffMenu.style.display = 'none'; });
            
            // Pagination Logic
            let currentPage = 0;
            const pages = document.querySelectorAll('.gaff-page');
            const prevBtn = document.getElementById('gaff-prev-btn');
            const nextBtn = document.getElementById('gaff-next-btn');

            const updatePagination = () => {
                pages.forEach((p, idx) => {
                    p.classList.toggle('active', idx === currentPage);
                });
                if (prevBtn) prevBtn.disabled = currentPage === 0;
                if (nextBtn) nextBtn.disabled = currentPage === pages.length - 1;
            };

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 0) currentPage--;
                    updatePagination();
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentPage < pages.length - 1) currentPage++;
                    updatePagination();
                });
            }
            
            const volSlider = document.getElementById('gaff-volatility');
            volSlider.addEventListener('input', (e) => {
                NarrativeManager.updateVolatility(parseInt(e.target.value));
            });
            
            const lockTgl = document.getElementById('gaff-narrative-lock');
            lockTgl.addEventListener('change', (e) => {
                NarrativeManager.isForced = e.target.checked;
                NarrativeManager.updateUI();
            });
            
            // Difficulty Tuning Listeners
            const prisonChanceEl = document.getElementById('gaff-prison-chance');
            if (prisonChanceEl) {
                prisonChanceEl.addEventListener('input', (e) => {
                    NarrativeManager.prisonChance = parseInt(e.target.value);
                    const lbl = document.getElementById('lbl-prison');
                    if (lbl) lbl.innerText = NarrativeManager.prisonChance === -1 ? 'DYNAMIC ESCALATION' : `${NarrativeManager.prisonChance}%`;
                });
            }
            
            const ethelIntelEl = document.getElementById('gaff-ethel-intel');
            if (ethelIntelEl) {
                ethelIntelEl.addEventListener('input', (e) => {
                    NarrativeManager.ethelIntel = parseInt(e.target.value);
                    const lbl = document.getElementById('lbl-ethel');
                    if (lbl) lbl.innerText = NarrativeManager.ethelIntel === 0 ? '0% (BLIND)' : `${NarrativeManager.ethelIntel}%`;
                });
            }
            
            const interceptRateEl = document.getElementById('gaff-intercept-rate');
            if (interceptRateEl) {
                interceptRateEl.addEventListener('input', (e) => {
                    NarrativeManager.interceptRate = parseInt(e.target.value);
                    const lbl = document.getElementById('lbl-intercept');
                    if (lbl) lbl.innerText = `${NarrativeManager.interceptRate}%`;
                });
            }

            NarrativeManager.updateUI();
        }

        console.log('🎰 BLAST RADIUS V2 — Phaser 3 Engine initialized');
        console.log(`   Grid: ${MATH_CONFIG.cols}×${MATH_CONFIG.rows} | Symbol: ${SYMBOL_WIDTH}×${SYMBOL_HEIGHT}px`);
        console.log('   Smart-Dumb Protocol: ARMED (10 hacks)');
        console.log('   Progressive Meter: DECOUPLED (internal=' + MATH_CONFIG.meter.internal + ')');
        console.log('   Blast Radius: READY');
    }

    update(time, delta) {
        if (!this.reels) return;
        this.reels.forEach(reel => reel.update(delta));
    }
}

// ===== CREATE PHASER GAME =====
(function init() {
    window.particleSystem = new FluffyParticleSystem('particle-canvas');
    
    // Bind global listener for BlastRadiusController to safely trigger AntiSlotController physics
    window.addEventListener('LaunchPincerParticles', (e) => {
        if (window.slotController) {
            window.slotController.triggerParticleTrails(e.detail.coords, e.detail.hitType);
        }
    });

    const reelWindow = document.getElementById('reel-window');
    const CANVAS_WIDTH = reelWindow.clientWidth || 500;
    const SYMBOL_WIDTH = Math.floor(CANVAS_WIDTH / MATH_CONFIG.cols);
    const GRID_HEIGHT = SYMBOL_WIDTH * MATH_CONFIG.rows;

    const config = {
        type: Phaser.WEBGL,
        width: CANVAS_WIDTH,
        height: GRID_HEIGHT,
        parent: 'reel-window',
        backgroundColor: '#0a0a0a',
        scene: [PreloadScene, ReelScene],
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NO_CENTER
        },
        render: {
            antialias: true,
            pixelArt: false
        }
    };

    const game = new Phaser.Game(config);
})();

class FluffyParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
        if (!this.gl) this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        
        this.maxParticles = 5000;
        this.stride = 13; // floats per particle
        this.particleData = new Float32Array(this.maxParticles * this.stride);
        this.activeCount = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initShaders();
        this.initBuffers();
        this.initTexture();
        
        this.appStartTime = performance.now();
        this.lastRenderTime = performance.now();
        this.appTime = 0; // Capped delta accumulator
        this._loop = this.loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    initShaders() {
        const gl = this.gl;
        const vsSource = `
            attribute vec2 a_quad; // -1 to 1
            
            // Instanced attributes
            attribute vec2 a_p0;
            attribute vec2 a_p1;
            attribute vec2 a_p2;
            attribute vec2 a_timing; // x = startTime, y = duration
            attribute float a_size;
            attribute vec4 a_color;
            
            uniform float u_time;
            uniform vec2 u_resolution;
            
            varying vec4 v_color;
            varying vec2 v_uv;
            
            void main() {
                float t = (u_time - a_timing.x) / a_timing.y;
                
                if (t < 0.0 || t > 1.0) {
                    gl_Position = vec4(-2.0, -2.0, 0.0, 1.0); // Offscreen
                    return;
                }
                
                // Quadratic Bezier interpolation
                float invT = 1.0 - t;
                vec2 currentPos = (invT * invT * a_p0) + (2.0 * invT * t * a_p1) + (t * t * a_p2);
                
                // Scale quad and position
                
                // Graceful S-curve twist (organic wave)
                vec2 dir = normalize(a_p2 - a_p0);
                vec2 ortho = vec2(-dir.y, dir.x);
                float wobble = sin(t * 10.0 + a_timing.x * 0.05) * (1.0 - t) * t * 60.0;
                currentPos += ortho * wobble;
                
                vec2 pixelPos = currentPos + (a_quad * a_size);
                
                // Convert pixel to clip space (-1 to 1, origin bottom-left internally but DOM flips Y)
                vec2 clipSpace = (pixelPos / u_resolution) * 2.0 - 1.0;
                clipSpace.y *= -1.0; // DOM coordinates have Y down
                
                gl_Position = vec4(clipSpace, 0.0, 1.0);
                v_color = a_color;
                
                // Fade out near end and at start
                float alphaRamp = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.8, 1.0, t));
                v_color.a *= alphaRamp;
                
                v_uv = a_quad * 0.5 + 0.5; // 0 to 1
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec4 v_color;
            varying vec2 v_uv;
            uniform sampler2D u_texture;
            
            void main() {
                vec4 texColor = texture2D(u_texture, v_uv);
                gl_FragColor = v_color * texColor.a; // alpha drives intensity for additive
                gl_FragColor.a = v_color.a * texColor.a;
            }
        `;

        const compileShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
            }
            return shader;
        };

        const vs = compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);
    }

    initBuffers() {
        const gl = this.gl;
        
        // Quad buffer
        const quadData = new Float32Array([
            -1, -1,   1, -1,  -1, 1,
             1, -1,   1, 1,   -1, 1
        ]);
        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, quadData, gl.STATIC_DRAW);
        const quadLoc = gl.getAttribLocation(this.program, "a_quad");
        gl.enableVertexAttribArray(quadLoc);
        gl.vertexAttribPointer(quadLoc, 2, gl.FLOAT, false, 0, 0);

        // Instance buffer
        this.instanceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.particleData.byteLength, gl.DYNAMIC_DRAW);

        const stride = this.stride * 4; // 13 floats * 4 bytes
        const setupInstancedAttr = (name, size, offset) => {
            const loc = gl.getAttribLocation(this.program, name);
            if (loc === -1) return;
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
            if (gl.vertexAttribDivisor) gl.vertexAttribDivisor(loc, 1);
            else {
                const ext = gl.getExtension('ANGLE_instanced_arrays');
                if (ext) ext.vertexAttribDivisorANGLE(loc, 1);
            }
        };

        setupInstancedAttr("a_p0",     2, 0);
        setupInstancedAttr("a_p1",     2, 2);
        setupInstancedAttr("a_p2",     2, 4);
        setupInstancedAttr("a_timing", 2, 6);
        setupInstancedAttr("a_size",   1, 8);
        setupInstancedAttr("a_color",  4, 9);
    }

    initTexture() {
        const gl = this.gl;
        
        // Use a 2D canvas to generate a fluffy radial gradient
        const size = 64;
        const canvas2d = document.createElement('canvas');
        canvas2d.width = size;
        canvas2d.height = size;
        const ctx = canvas2d.getContext('2d');
        
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    emitWave(x0, y0, targetX, targetY, count, colorHex) {
        // Hex to RGBA
        let r=191/255, g=64/255, b=191/255; // Default Bright Purple
        if (colorHex) {
            colorHex = colorHex.replace('#', '');
            r = parseInt(colorHex.substring(0,2), 16) / 255;
            g = parseInt(colorHex.substring(2,4), 16) / 255;
            b = parseInt(colorHex.substring(4,6), 16) / 255;
        }

        const now = this.appTime; // Use logic time, NOT real time
        
        // Generate ONE unique, cohesive arch for the ENTIRE trail so it acts like a solid comet
        // Randomize the apex heavily so the left/right trails do NOT mirror each other
        const baseControlX = (x0 + targetX) / 2 + (Math.random() - 0.5) * 600;
        const baseControlY = Math.min(y0, targetY) - 150 - Math.random() * 250;
        
        for (let i = 0; i < count; i++) {
            if (this.activeCount >= this.maxParticles) break;
            
            const offset = this.activeCount * this.stride;
            
            // P0: Start
            this.particleData[offset + 0] = x0 + (Math.random() * 10 - 5);
            this.particleData[offset + 1] = y0 + (Math.random() * 10 - 5);
            
            // P1: Base arch
            this.particleData[offset + 2] = baseControlX + (Math.random() * 20 - 10);
            this.particleData[offset + 3] = baseControlY + (Math.random() * 20 - 10);
            
            // P2: End
            this.particleData[offset + 4] = targetX + (Math.random() * 5 - 2.5);
            this.particleData[offset + 5] = targetY + (Math.random() * 5 - 2.5);
            
            // Timing: 400ms spawn spread, 1000 - 1200ms flight duration
            // This creates a fast-moving head that has a natural, fading cloud tail that doesn't span the whole arch
            const spawnOffset = (i / count) * 400; 
            this.particleData[offset + 6] = now + spawnOffset; 
            this.particleData[offset + 7] = 1000 + Math.random() * 200; 
            
            // Head vs Tail classification
            const isHead = (i < 15);
            
            // Size: Graceful and soft (no white blobs)
            this.particleData[offset + 8] = isHead ? 15 + Math.random() * 10 : 25 + Math.random() * 25;
            
            // Color: Bright head, very soft alpha tail
            const luminance = Math.random() * 0.2;
            this.particleData[offset + 9]  = isHead ? 1.0 : Math.min(1.0, r + luminance);
            this.particleData[offset + 10] = isHead ? 0.9 : Math.min(1.0, g + luminance);
            this.particleData[offset + 11] = isHead ? 1.0 : Math.min(1.0, b + luminance);
            
            const alphaTail = 0.6 * (1.0 - (i / count)); 
            this.particleData[offset + 12] = isHead ? 1.0 : Math.max(0.01, alphaTail);
            
            this.activeCount++;
        }
    }

    loop(time) {
        if (!time) time = performance.now();
        const gl = this.gl;
        
        // Calculate capped delta time to prevent DOM lockups from ruining animations
        const dt = Math.max(0, time - this.lastRenderTime);
        this.lastRenderTime = time;
        this.appTime += Math.min(dt, 32); // Max 32ms jump (2 frames @ 60fps)
        const localTime = this.appTime;
        
        // Clear canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (this.activeCount > 0) {
            // Additive blending magic
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.depthMask(false);
            
            gl.useProgram(this.program);
            
            // Uniforms (use localTime to preserve 32-bit float precision in shader)
            gl.uniform1f(gl.getUniformLocation(this.program, "u_time"), localTime);
            gl.uniform2f(gl.getUniformLocation(this.program, "u_resolution"), this.canvas.width, this.canvas.height);

            // Upload active data
            gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
            const view = new Float32Array(this.particleData.buffer, 0, this.activeCount * this.stride);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);

            // Clean up dead particles by shifting activeCursor
            let i = 0;
            while (i < this.activeCount) {
                const offset = i * this.stride;
                const start = this.particleData[offset + 6];
                const dur = this.particleData[offset + 7];
                if (localTime > start + dur) {
                    // Particle dead: swap with last active
                    this.activeCount--;
                    const lastOffset = this.activeCount * this.stride;
                    for (let j = 0; j < this.stride; j++) {
                        this.particleData[offset + j] = this.particleData[lastOffset + j];
                    }
                } else {
                    i++;
                }
            }

            // Draw Instanced
            if (this.activeCount > 0) {
                if (gl.drawArraysInstanced) {
                    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.activeCount);
                } else {
                    const ext = gl.getExtension('ANGLE_instanced_arrays');
                    if (ext) ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, this.activeCount);
                }
            }
        }
        
        requestAnimationFrame(this._loop);
    }
}

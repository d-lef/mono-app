/**
 * Animated background for mono-ai.uk
 *
 * Desktop: Mouse-reactive waveform bars
 * Mobile: Floating particles drifting upward
 *
 * Usage:
 *   <script src="/components/waveform-bg.js" defer></script>
 */

(function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        initParticles();
    } else {
        initWaveform();
    }

    // ========== MOBILE: FLOATING PARTICLES ==========
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;transition:opacity 1.5s ease';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        let W, H;
        const PARTICLE_COUNT = 35;
        const particles = [];

        function resize() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function isDark() {
            const root = document.documentElement;
            if (root.classList.contains('light')) return false;
            if (root.classList.contains('dark')) return true;
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        function spawn(y) {
            return {
                x: Math.random() * W,
                y: y != null ? y : Math.random() * H,
                r: 1.5 + Math.random() * 2,
                speed: 0.15 + Math.random() * 0.35,
                drift: (Math.random() - 0.5) * 0.3,
                opacity: 0.15 + Math.random() * 0.25,
                phase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.003 + Math.random() * 0.005,
            };
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(spawn());
        }

        let animId = null;
        let visible = true;

        function draw() {
            if (!visible) return;

            ctx.clearRect(0, 0, W, H);
            const dark = isDark();
            const base = dark ? 180 : 120;

            for (const p of particles) {
                p.y -= p.speed;
                p.phase += p.wobbleSpeed;
                const wx = Math.sin(p.phase) * 0.4;
                p.x += p.drift + wx;

                // Fade out near top and bottom edges
                let fade = 1;
                if (p.y < H * 0.15) fade = p.y / (H * 0.15);
                if (p.y > H * 0.85) fade = (H - p.y) / (H * 0.15);
                fade = Math.max(0, Math.min(1, fade));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${base},${base},${base},${p.opacity * fade})`;
                ctx.fill();

                // Respawn at bottom when off top
                if (p.y < -10) {
                    Object.assign(p, spawn(H + 10));
                }
                // Wrap horizontally
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
            }

            animId = requestAnimationFrame(draw);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                visible = false;
                if (animId) { cancelAnimationFrame(animId); animId = null; }
            } else {
                visible = true;
                if (!animId) draw();
            }
        });

        window.addEventListener('resize', resize);
        resize();

        requestAnimationFrame(() => {
            canvas.style.opacity = '1';
            draw();
        });
    }

    // ========== DESKTOP: WAVEFORM ==========
    function initWaveform() {
        const CONFIG = {
            barWidth: 3,
            barGap: 4,
            barRadius: 1.5,
            baseAmplitude: 0.35,
            animationSpeed: 0.02,
            lightColor: 'rgba(189, 189, 189, 0.35)',
            darkColor: 'rgba(96, 96, 96, 0.25)',
            mouseSoundRadius: 350,
        };

        const style = document.createElement('style');
        style.textContent = `
            .waveform-bg-canvas {
                position: fixed;
                top: 50%;
                left: 0;
                width: 100%;
                height: 300px;
                transform: translateY(-50%);
                z-index: -1;
                pointer-events: none;
                opacity: 0;
                transition: opacity 1s ease;
            }
            .waveform-bg-canvas.active {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        const canvas = document.createElement('canvas');
        canvas.className = 'waveform-bg-canvas';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let phase = 0;
        let animationId = null;
        let isVisible = true;
        let mouseX = -1000;
        let mouseY = -1000;
        let isMouseNear = false;
        let screenCenterX = window.innerWidth / 2;

        function isDarkTheme() {
            const root = document.documentElement;
            if (root.classList.contains('light')) return false;
            if (root.classList.contains('dark')) return true;
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = 300 * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = '300px';
            screenCenterX = window.innerWidth / 2;
        }

        function getBarHeight(index, totalBars, maxHeight, barX) {
            const canvasRect = canvas.getBoundingClientRect();
            const canvasCenterY = canvasRect.top + canvasRect.height / 2;
            const dx = barX - mouseX;
            const dy = canvasCenterY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= CONFIG.mouseSoundRadius) return 0;

            const influence = 1 - (distance / CONFIG.mouseSoundRadius);
            const smoothInfluence = influence * influence;
            const x = index / totalBars;

            const wave1 = Math.sin((x * 4 * Math.PI) - phase) * 0.25;
            const wave2 = Math.sin((x * 2 * Math.PI) - phase * 0.7) * 0.15;
            const wave3 = Math.sin((x * 8 * Math.PI) - phase * 1.3) * 0.08;
            const noise = Math.sin(index * 0.7 + phase * 0.3) * 0.05;

            let amplitude = CONFIG.baseAmplitude + wave1 + wave2 + wave3 + noise;
            amplitude = Math.max(0.1, Math.min(0.95, amplitude));

            return amplitude * maxHeight * smoothInfluence;
        }

        function getCenterFadeOpacity(barX) {
            const dx = Math.abs(barX - screenCenterX);
            const innerRadius = 300;
            const outerRadius = 500;

            if (dx < innerRadius) return 0;
            if (dx < outerRadius) {
                const t = (dx - innerRadius) / (outerRadius - innerRadius);
                return t * t;
            }
            return 1;
        }

        function draw() {
            const width = window.innerWidth;
            const height = 300;
            const centerY = height / 2;
            const baseColor = isDarkTheme() ? CONFIG.darkColor : CONFIG.lightColor;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = baseColor;

            const totalBarWidth = CONFIG.barWidth + CONFIG.barGap;
            const barsNeeded = Math.ceil(width / totalBarWidth) + 2;
            const startX = (width - (barsNeeded * totalBarWidth)) / 2;

            for (let i = 0; i < barsNeeded; i++) {
                const barX = startX + (i * totalBarWidth);

                const centerOpacity = getCenterFadeOpacity(barX);
                if (centerOpacity < 0.01) continue;

                const barHeight = getBarHeight(i, barsNeeded, centerY * 0.8, barX);
                if (barHeight < 1) continue;

                const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
                if (match) {
                    const a = parseFloat(match[4] || 1) * centerOpacity;
                    ctx.fillStyle = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${a})`;
                }

                ctx.beginPath();
                ctx.roundRect(barX, centerY - barHeight, CONFIG.barWidth, barHeight, CONFIG.barRadius);
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(barX, centerY, CONFIG.barWidth, barHeight, CONFIG.barRadius);
                ctx.fill();
            }
        }

        function animate() {
            if (!isVisible) return;
            if (isMouseNear) phase += CONFIG.animationSpeed;
            draw();
            animationId = requestAnimationFrame(animate);
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                isVisible = false;
                if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
            } else {
                isVisible = true;
                if (!animationId) animate();
            }
        }

        function handleMouseMove(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            const canvasRect = canvas.getBoundingClientRect();
            const canvasCenterY = canvasRect.top + canvasRect.height / 2;
            isMouseNear = Math.abs(e.clientY - canvasCenterY) < 250;
        }

        function watchThemeChanges() {
            const observer = new MutationObserver(() => draw());
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
        }

        resize();
        watchThemeChanges();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        requestAnimationFrame(() => {
            canvas.classList.add('active');
            animate();
        });
    }
})();

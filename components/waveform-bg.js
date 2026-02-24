/**
 * Animated waveform background for mono-ai.uk
 *
 * Matches the desktop app's waveform animation algorithm:
 * - Three overlapping sine waves for organic "swimming" motion
 * - Monochromatic grey palette
 * - Respects prefers-reduced-motion
 *
 * Usage:
 *   <script src="/components/waveform-bg.js" defer></script>
 */

(function() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Configuration
    const CONFIG = {
        barCount: 80,
        barWidth: 3,
        barGap: 4,
        barRadius: 1.5,
        baseAmplitude: 0.35,
        animationSpeed: 0.02,
        // Colors from app theme
        lightColor: 'rgba(189, 189, 189, 0.15)',  // #BDBDBD at 15% opacity
        darkColor: 'rgba(96, 96, 96, 0.12)',      // #606060 at 12% opacity
    };

    // Inject minimal styles
    const style = document.createElement('style');
    style.textContent = `
        .waveform-bg-canvas {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 200px;
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

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'waveform-bg-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let phase = 0;
    let animationId = null;
    let isVisible = true;

    // Detect theme
    function isDarkTheme() {
        const root = document.documentElement;
        if (root.classList.contains('light')) return false;
        if (root.classList.contains('dark')) return true;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Resize handler
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = 200 * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = '200px';
    }

    // Calculate bar height using the app's swimming animation algorithm
    function getBarHeight(index, totalBars, maxHeight) {
        const x = index / totalBars;

        // Three overlapping sine waves (matching desktop app)
        const wave1 = Math.sin((x * 4 * Math.PI) - phase) * 0.25;
        const wave2 = Math.sin((x * 2 * Math.PI) - phase * 0.7) * 0.15;
        const wave3 = Math.sin((x * 8 * Math.PI) - phase * 1.3) * 0.08;

        // Subtle noise
        const noise = Math.sin(index * 0.7 + phase * 0.3) * 0.05;

        // Combined amplitude
        let amplitude = CONFIG.baseAmplitude + wave1 + wave2 + wave3 + noise;
        amplitude = Math.max(0.1, Math.min(0.9, amplitude));

        return amplitude * maxHeight;
    }

    // Draw waveform
    function draw() {
        const width = window.innerWidth;
        const height = 200;
        const color = isDarkTheme() ? CONFIG.darkColor : CONFIG.lightColor;

        ctx.clearRect(0, 0, width, height);

        // Calculate bar positioning
        const totalBarWidth = CONFIG.barWidth + CONFIG.barGap;
        const barsNeeded = Math.ceil(width / totalBarWidth) + 2;
        const startX = (width - (barsNeeded * totalBarWidth)) / 2;

        ctx.fillStyle = color;

        for (let i = 0; i < barsNeeded; i++) {
            const barHeight = getBarHeight(i, barsNeeded, height * 0.7);
            const x = startX + (i * totalBarWidth);
            const y = height - barHeight;

            // Draw rounded rectangle
            ctx.beginPath();
            ctx.roundRect(x, y, CONFIG.barWidth, barHeight, CONFIG.barRadius);
            ctx.fill();
        }
    }

    // Animation loop
    function animate() {
        if (!isVisible) return;

        phase += CONFIG.animationSpeed;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    // Visibility change handler (pause when tab not visible)
    function handleVisibilityChange() {
        if (document.hidden) {
            isVisible = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            isVisible = true;
            if (!animationId) {
                animate();
            }
        }
    }

    // Theme change observer
    function watchThemeChanges() {
        const observer = new MutationObserver(() => {
            draw();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also watch system preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
    }

    // Initialize
    function init() {
        resize();
        watchThemeChanges();

        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Fade in after load
        requestAnimationFrame(() => {
            canvas.classList.add('active');
            animate();
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

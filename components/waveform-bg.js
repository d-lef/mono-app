/**
 * Animated waveform background for mono-ai.uk
 *
 * Matches the desktop app's waveform animation algorithm:
 * - Three overlapping sine waves for organic "swimming" motion
 * - Monochromatic grey palette
 * - Respects prefers-reduced-motion
 * - Mouse hover reveals the waveform
 * - Center fade for text readability
 *
 * Usage:
 *   <script src="/components/waveform-bg.js" defer></script>
 */

(function() {
    // Disable on mobile
    if (window.innerWidth < 768) {
        return;
    }

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
        // Colors
        lightColor: 'rgba(189, 189, 189, 0.35)',  // #BDBDBD at 35% opacity
        darkColor: 'rgba(96, 96, 96, 0.25)',      // #606060 at 25% opacity
        // Mouse interaction - waveform only visible near mouse
        mouseRevealRadius: 350,
        mouseInfluenceStrength: 0.4,
        // Center fade - bars fade out toward center of screen
        centerFadeRadius: 250,
    };

    // Inject minimal styles
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

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'waveform-bg-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let phase = 0;
    let animationId = null;
    let isVisible = true;

    // Mouse tracking
    let mouseX = -1000; // Start off-screen so nothing shows initially
    let mouseY = -1000;

    // Screen center
    let screenCenterX = window.innerWidth / 2;
    let screenCenterY = window.innerHeight / 2;

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
        canvas.height = 300 * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = '300px';

        // Update screen center
        screenCenterX = window.innerWidth / 2;
        screenCenterY = window.innerHeight / 2;
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
        amplitude = Math.max(0.1, Math.min(0.95, amplitude));

        return amplitude * maxHeight;
    }

    // Calculate mouse reveal opacity - bars only visible near cursor
    function getMouseRevealOpacity(barX) {
        const canvasRect = canvas.getBoundingClientRect();
        const canvasCenterY = canvasRect.top + canvasRect.height / 2;
        const dx = barX - mouseX;
        const dy = canvasCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.mouseRevealRadius) {
            // Smooth reveal using cosine for natural falloff
            const t = distance / CONFIG.mouseRevealRadius;
            return 1 - (t * t); // Quadratic falloff for softer edge
        }
        return 0;
    }

    // Calculate opacity for center fade effect
    function getCenterFadeOpacity(barX) {
        const dx = Math.abs(barX - screenCenterX);
        if (dx < CONFIG.centerFadeRadius) {
            // Smooth fade using cosine for natural falloff
            const t = dx / CONFIG.centerFadeRadius;
            return 0.15 + (0.85 * t); // Fade from 15% at center to 100% at edge
        }
        return 1;
    }

    // Parse color and apply opacity
    function applyOpacity(baseColor, opacity) {
        // Extract rgba values
        const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
        if (match) {
            const r = match[1];
            const g = match[2];
            const b = match[3];
            const a = parseFloat(match[4] || 1) * opacity;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return baseColor;
    }

    // Draw waveform
    function draw() {
        const width = window.innerWidth;
        const height = 300;
        const centerY = height / 2;
        const baseColor = isDarkTheme() ? CONFIG.darkColor : CONFIG.lightColor;

        ctx.clearRect(0, 0, width, height);

        // Calculate bar positioning
        const totalBarWidth = CONFIG.barWidth + CONFIG.barGap;
        const barsNeeded = Math.ceil(width / totalBarWidth) + 2;
        const startX = (width - (barsNeeded * totalBarWidth)) / 2;

        for (let i = 0; i < barsNeeded; i++) {
            const barX = startX + (i * totalBarWidth);
            const barHeight = getBarHeight(i, barsNeeded, centerY * 0.8);

            // Combine mouse reveal and center fade
            const mouseOpacity = getMouseRevealOpacity(barX);
            const centerOpacity = getCenterFadeOpacity(barX);
            const finalOpacity = mouseOpacity * centerOpacity;

            // Skip if fully transparent
            if (finalOpacity < 0.01) continue;

            ctx.fillStyle = applyOpacity(baseColor, finalOpacity);

            // Draw top bar (mirrored upward from center)
            ctx.beginPath();
            ctx.roundRect(barX, centerY - barHeight, CONFIG.barWidth, barHeight, CONFIG.barRadius);
            ctx.fill();

            // Draw bottom bar (mirrored downward from center)
            ctx.beginPath();
            ctx.roundRect(barX, centerY, CONFIG.barWidth, barHeight, CONFIG.barRadius);
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

    // Mouse move handler
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
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
        window.addEventListener('mousemove', handleMouseMove);
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

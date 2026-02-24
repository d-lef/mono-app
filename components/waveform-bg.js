/**
 * Animated waveform background for mono-ai.uk
 *
 * Matches the desktop app's waveform animation algorithm:
 * - Three overlapping sine waves for organic "swimming" motion
 * - Monochromatic grey palette
 * - Static until mouse hovers - then animates
 * - Large center cutout for text readability
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
        barWidth: 3,
        barGap: 4,
        barRadius: 1.5,
        baseAmplitude: 0.35,
        animationSpeed: 0.02,
        // Colors
        lightColor: 'rgba(189, 189, 189, 0.35)',
        darkColor: 'rgba(96, 96, 96, 0.25)',
        // Mouse interaction - animation only happens near cursor
        mouseAnimateRadius: 300,
        // Center cutout - sharp edge, no bars in this zone
        centerCutoutRadius: 450,
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
    let mouseX = -1000;
    let mouseY = -1000;
    let isMouseNear = false;

    // Screen center
    let screenCenterX = window.innerWidth / 2;

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

        screenCenterX = window.innerWidth / 2;
    }

    // Calculate bar height - static base with animation only near mouse
    function getBarHeight(index, totalBars, maxHeight, barX) {
        const x = index / totalBars;

        // Base static wave pattern
        const staticWave1 = Math.sin(x * 4 * Math.PI) * 0.25;
        const staticWave2 = Math.sin(x * 2 * Math.PI) * 0.15;
        const staticWave3 = Math.sin(x * 8 * Math.PI) * 0.08;
        const staticNoise = Math.sin(index * 0.7) * 0.05;

        let amplitude = CONFIG.baseAmplitude + staticWave1 + staticWave2 + staticWave3 + staticNoise;

        // Check distance from mouse
        const canvasRect = canvas.getBoundingClientRect();
        const canvasCenterY = canvasRect.top + canvasRect.height / 2;
        const dx = barX - mouseX;
        const dy = canvasCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Add animation only near mouse
        if (distance < CONFIG.mouseAnimateRadius) {
            const influence = 1 - (distance / CONFIG.mouseAnimateRadius);

            // Animated waves (using phase)
            const animWave1 = Math.sin((x * 4 * Math.PI) - phase) * 0.25;
            const animWave2 = Math.sin((x * 2 * Math.PI) - phase * 0.7) * 0.15;
            const animWave3 = Math.sin((x * 8 * Math.PI) - phase * 1.3) * 0.08;
            const animNoise = Math.sin(index * 0.7 + phase * 0.3) * 0.05;

            const animAmplitude = CONFIG.baseAmplitude + animWave1 + animWave2 + animWave3 + animNoise;

            // Blend static and animated based on proximity
            amplitude = amplitude * (1 - influence) + animAmplitude * influence;

            // Also boost amplitude near cursor
            amplitude += influence * 0.3;
        }

        amplitude = Math.max(0.1, Math.min(0.95, amplitude));
        return amplitude * maxHeight;
    }

    // Check if bar is in center cutout zone
    function isInCenterCutout(barX) {
        const dx = Math.abs(barX - screenCenterX);
        return dx < CONFIG.centerCutoutRadius;
    }

    // Parse color and apply opacity
    function applyOpacity(baseColor, opacity) {
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
        ctx.fillStyle = baseColor;

        // Calculate bar positioning
        const totalBarWidth = CONFIG.barWidth + CONFIG.barGap;
        const barsNeeded = Math.ceil(width / totalBarWidth) + 2;
        const startX = (width - (barsNeeded * totalBarWidth)) / 2;

        for (let i = 0; i < barsNeeded; i++) {
            const barX = startX + (i * totalBarWidth);

            // Skip bars in center cutout
            if (isInCenterCutout(barX)) continue;

            const barHeight = getBarHeight(i, barsNeeded, centerY * 0.8, barX);

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

        // Only advance phase if mouse is near the canvas
        if (isMouseNear) {
            phase += CONFIG.animationSpeed;
        }

        draw();
        animationId = requestAnimationFrame(animate);
    }

    // Visibility change handler
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

        // Check if mouse is near the canvas
        const canvasRect = canvas.getBoundingClientRect();
        const canvasCenterY = canvasRect.top + canvasRect.height / 2;
        const dy = Math.abs(e.clientY - canvasCenterY);
        isMouseNear = dy < 200;
    }

    // Theme change observer
    function watchThemeChanges() {
        const observer = new MutationObserver(() => draw());
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
    }

    // Initialize
    function init() {
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

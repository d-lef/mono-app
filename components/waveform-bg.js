/**
 * Animated waveform background for mono-ai.uk
 *
 * Matches the desktop app's waveform animation algorithm:
 * - Three overlapping sine waves for organic "swimming" motion
 * - Monochromatic grey palette
 * - Silent by default (no bars) - mouse hover triggers the "sound"
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
        // Mouse interaction - sound only happens near cursor
        mouseSoundRadius: 350,
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

    // Calculate bar height - zero by default, only appears near mouse
    function getBarHeight(index, totalBars, maxHeight, barX) {
        // Check distance from mouse
        const canvasRect = canvas.getBoundingClientRect();
        const canvasCenterY = canvasRect.top + canvasRect.height / 2;
        const dx = barX - mouseX;
        const dy = canvasCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // No sound by default - bars only appear near mouse
        if (distance >= CONFIG.mouseSoundRadius) {
            return 0;
        }

        // Calculate influence based on proximity (closer = louder)
        const influence = 1 - (distance / CONFIG.mouseSoundRadius);
        const smoothInfluence = influence * influence; // Quadratic for smoother falloff

        const x = index / totalBars;

        // Animated waves (using phase)
        const wave1 = Math.sin((x * 4 * Math.PI) - phase) * 0.25;
        const wave2 = Math.sin((x * 2 * Math.PI) - phase * 0.7) * 0.15;
        const wave3 = Math.sin((x * 8 * Math.PI) - phase * 1.3) * 0.08;
        const noise = Math.sin(index * 0.7 + phase * 0.3) * 0.05;

        let amplitude = CONFIG.baseAmplitude + wave1 + wave2 + wave3 + noise;
        amplitude = Math.max(0.1, Math.min(0.95, amplitude));

        // Scale by mouse influence - farther = smaller bars
        return amplitude * maxHeight * smoothInfluence;
    }

    // Get center fade opacity - soft gradient from center
    function getCenterFadeOpacity(barX) {
        const dx = Math.abs(barX - screenCenterX);
        const innerRadius = 300;  // Fully transparent inside this
        const outerRadius = 500;  // Fully visible outside this

        if (dx < innerRadius) {
            return 0;
        } else if (dx < outerRadius) {
            // Smooth gradient between inner and outer
            const t = (dx - innerRadius) / (outerRadius - innerRadius);
            return t * t; // Quadratic for softer fade
        }
        return 1;
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

            // Get center fade opacity
            const centerOpacity = getCenterFadeOpacity(barX);
            if (centerOpacity < 0.01) continue;

            const barHeight = getBarHeight(i, barsNeeded, centerY * 0.8, barX);

            // Skip if bar is too small
            if (barHeight < 1) continue;

            // Apply center fade to color
            const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
            if (match) {
                const a = parseFloat(match[4] || 1) * centerOpacity;
                ctx.fillStyle = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${a})`;
            }

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
        isMouseNear = dy < 250;
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

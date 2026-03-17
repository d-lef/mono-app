/**
 * 3D fold effect for blog articles
 *
 * Elements fade and rotate as they scroll toward the top of the viewport.
 *
 * Usage:
 *   <script src="/components/article-fold.js" defer></script>
 */

(function() {
    const foldZoneStart = 140;
    const foldZoneEnd = 60;
    const maxRotation = 25;

    const isMobile = () => window.innerWidth < 768;
    const canSlide = el => !isMobile() && el.tagName === 'P';

    function updateFoldEffect() {
        const elements = document.querySelectorAll(
            '.article-wrap .back-link, .article-wrap header, ' +
            '.article-body p, .article-body h2, .article-body h3, ' +
            '.article-body ul, .article-body ol, .article-body blockquote, ' +
            '.article-body .table-wrap, .article-body .tldr, ' +
            '.article-body .decision-list li, .article-body .lawsuit-card, ' +
            '.article-body .cta-card'
        );

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top;

            if (elementTop <= foldZoneEnd - rect.height) {
                if (canSlide(el)) {
                    el.style.transform = 'perspective(800px) rotateX(' + maxRotation + 'deg)';
                    el.style.transformOrigin = 'center top';
                }
                el.style.opacity = '0';
            } else if (elementTop < foldZoneStart) {
                let progress = 1 - (elementTop - foldZoneEnd) / (foldZoneStart - foldZoneEnd);
                progress = Math.max(0, Math.min(1, progress));
                progress = progress * progress;
                if (canSlide(el)) {
                    el.style.transform = 'perspective(800px) rotateX(' + (progress * maxRotation) + 'deg)';
                    el.style.transformOrigin = 'center top';
                } else {
                    el.style.transform = '';
                }
                el.style.opacity = 1 - (progress * 0.85);
            } else {
                el.style.transform = '';
                el.style.opacity = '';
            }
        });
    }

    window.addEventListener('scroll', updateFoldEffect, { passive: true });
    updateFoldEffect();
})();

/**
 * 3D fold effect on scroll for pages
 *
 * Usage:
 *   <script src="/components/fold-effect.js" defer></script>
 *
 * Automatically detects page type and applies appropriate fold effects:
 * - Blog articles: .article-wrap elements with slide effect for paragraphs (desktop)
 * - Privacy page: .container elements with uniform fold effect
 */

(function() {
    const foldZoneStart = 140;
    const foldZoneEnd = 60;
    const maxRotation = 25;

    const isMobile = () => window.innerWidth < 768;

    // Detect page type based on DOM structure
    const isArticlePage = document.querySelector('.article-wrap') !== null;
    const isPrivacyPage = document.querySelector('.container h1') !== null && !isArticlePage;

    // For article pages, only paragraphs get the slide effect on desktop
    const canSlide = el => isArticlePage && !isMobile() && el.tagName === 'P';

    function updateFoldEffect() {
        let elements;

        if (isArticlePage) {
            elements = document.querySelectorAll(
                '.article-wrap .back-link, .article-wrap header, ' +
                '.article-body p, .article-body h2, .article-body h3, ' +
                '.article-body .table-wrap, .article-body .tldr, .article-body .tip-box, ' +
                '.article-body .steps-list li, .article-body .result-list li, ' +
                '.article-body .article-figure, .article-body .decision-list li, .article-body .cta-card'
            );
        } else if (isPrivacyPage) {
            elements = document.querySelectorAll('.container h1, .container h2, .container p, .container li');
        } else {
            return; // No applicable elements
        }

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top;

            if (elementTop <= foldZoneEnd - rect.height) {
                if (canSlide(el)) {
                    el.style.transform = 'perspective(800px) rotateX(' + maxRotation + 'deg)';
                    el.style.transformOrigin = 'center top';
                } else if (isPrivacyPage) {
                    el.style.transform = 'perspective(800px) rotateX(' + maxRotation + 'deg)';
                    el.style.transformOrigin = 'center top';
                }
                el.style.opacity = '0';
            } else if (elementTop < foldZoneStart) {
                let progress = 1 - (elementTop - foldZoneEnd) / (foldZoneStart - foldZoneEnd);
                progress = Math.max(0, Math.min(1, progress));
                progress = progress * progress;

                if (canSlide(el) || isPrivacyPage) {
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

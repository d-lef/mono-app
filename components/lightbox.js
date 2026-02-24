/**
 * Lightbox component for article images
 *
 * Usage:
 *   <script src="/components/lightbox.js" defer></script>
 *
 * Automatically makes all .article-figure img elements clickable.
 * Click to open full-size in overlay, click overlay or press Escape to close.
 */

(function() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        .article-figure img { cursor: zoom-in; transition: opacity 0.15s ease; }
        .article-figure img:hover { opacity: 0.9; }

        .lightbox {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            cursor: zoom-out;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }
        .lightbox.active { opacity: 1; visibility: visible; }
        .lightbox img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .lightbox-close {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s ease;
        }
        .lightbox-close:hover { background: rgba(255, 255, 255, 0.2); }
        .lightbox-close::before, .lightbox-close::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 2px;
            background: white;
        }
        .lightbox-close::before { transform: rotate(45deg); }
        .lightbox-close::after { transform: rotate(-45deg); }
    `;
    document.head.appendChild(style);

    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close"></button><img src="" alt="">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Click on image to open
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.article-figure img');
        if (img) {
            e.preventDefault();
            openLightbox(img.src, img.alt);
        }
    });

    // Click overlay or close button to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === closeBtn || closeBtn.contains(e.target)) {
            closeLightbox();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
})();

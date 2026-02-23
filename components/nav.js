/**
 * <site-nav> Web Component
 * Unified navigation for all pages.
 *
 * Usage:
 *   <script src="/components/nav.js"></script>
 *   <site-nav></site-nav>
 *
 * For pages in subdirectories (e.g., /blog/):
 *   <site-nav base-path="../"></site-nav>
 */

class SiteNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const basePath = this.getAttribute('base-path') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                /* CSS Variables - inherit from document or use defaults */
                :host {
                    --nav-bg-primary: var(--bg-primary, #252525);
                    --nav-bg-secondary: var(--bg-secondary, #2D2D2D);
                    --nav-bg-hover: var(--bg-hover, #3A3A3A);
                    --nav-bg-pressed: var(--bg-pressed, #454545);
                    --nav-text-primary: var(--text-primary, #FFFFFF);
                    --nav-text-secondary: var(--text-secondary, #B0B0B0);
                }

                /* Top fade gradient */
                .top-fade {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 100px;
                    background: linear-gradient(to bottom, var(--nav-bg-primary) 0%, var(--nav-bg-primary) 30%, transparent 100%);
                    pointer-events: none;
                    z-index: 99;
                }

                /* Navigation buttons */
                .nav-btn {
                    position: fixed;
                    top: 20px;
                    z-index: 100;
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: translateX(-50%);
                    transition: background-color 0.15s ease;
                    text-decoration: none;
                }

                .nav-btn:hover {
                    background-color: var(--nav-bg-hover);
                }

                .nav-btn:active {
                    background-color: var(--nav-bg-pressed);
                }

                .nav-btn svg {
                    width: 20px;
                    height: 20px;
                    stroke: var(--nav-text-secondary);
                    fill: none;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                /* Button positions - 5 buttons centered: theme, home, buy, blog, lang */
                .theme-toggle { left: calc(50% - 88px); }
                .home-btn { left: calc(50% - 44px); }
                .buy-btn { left: 50%; }
                .blog-btn { left: calc(50% + 44px); }

                /* Theme toggle icons */
                .theme-toggle .icon-sun { display: block; }
                .theme-toggle .icon-moon { display: none; }

                :host(.light) .theme-toggle .icon-sun { display: none; }
                :host(.light) .theme-toggle .icon-moon { display: block; }

                /* Language selector */
                .lang-selector {
                    position: fixed;
                    top: 20px;
                    left: calc(50% + 88px);
                    transform: translateX(-50%);
                    z-index: 100;
                }

                .lang-button {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Comfortaa', sans-serif;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--nav-text-secondary);
                    text-transform: uppercase;
                }

                .lang-button:hover {
                    background-color: var(--nav-bg-hover);
                }

                .lang-button:active {
                    background-color: var(--nav-bg-pressed);
                }

                .lang-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 8px;
                    background-color: var(--nav-bg-secondary);
                    border-radius: 8px;
                    padding: 4px;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.15s ease, visibility 0.15s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .lang-selector.open .lang-dropdown {
                    opacity: 1;
                    visibility: visible;
                }

                .lang-option {
                    display: block;
                    width: 100%;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    cursor: pointer;
                    font-family: 'Comfortaa', sans-serif;
                    font-size: 13px;
                    color: var(--nav-text-primary);
                    text-align: left;
                    white-space: nowrap;
                }

                .lang-option:hover {
                    background-color: var(--nav-bg-hover);
                }

                .lang-option.active {
                    color: var(--nav-text-secondary);
                }
            </style>

            <div class="top-fade"></div>

            <button class="nav-btn theme-toggle" aria-label="Toggle theme">
                <svg class="icon-moon" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <svg class="icon-sun" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
            </button>

            <a href="${basePath}" class="nav-btn home-btn" aria-label="Home">
                <svg viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
            </a>

            <a href="${basePath}?buy" class="nav-btn buy-btn" aria-label="Buy">
                <svg viewBox="0 0 24 24">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
            </a>

            <a href="${basePath}blog/" class="nav-btn blog-btn" aria-label="Blog">
                <svg viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
            </a>

            <div class="lang-selector">
                <button class="lang-button" aria-label="Select language">EN</button>
                <div class="lang-dropdown">
                    <button class="lang-option active" data-lang="en">English</button>
                    <button class="lang-option" data-lang="es">Español</button>
                    <button class="lang-option" data-lang="fr">Français</button>
                    <button class="lang-option" data-lang="de">Deutsch</button>
                    <button class="lang-option" data-lang="zh">中文</button>
                    <button class="lang-option" data-lang="ru">Русский</button>
                </div>
            </div>
        `;

        this.initThemeToggle();
        this.initNavButtons();
        this.initLanguageSelector();
        this.syncThemeFromDocument();
    }

    initNavButtons() {
        // Emit events for nav button clicks so pages can intercept
        const homeBtn = this.shadowRoot.querySelector('.home-btn');
        const buyBtn = this.shadowRoot.querySelector('.buy-btn');

        homeBtn.addEventListener('click', (e) => {
            const event = new CustomEvent('nav-home', {
                bubbles: true,
                composed: true,
                cancelable: true
            });
            if (!this.dispatchEvent(event)) {
                e.preventDefault();
            }
        });

        buyBtn.addEventListener('click', (e) => {
            const event = new CustomEvent('nav-buy', {
                bubbles: true,
                composed: true,
                cancelable: true
            });
            if (!this.dispatchEvent(event)) {
                e.preventDefault();
            }
        });
    }

    syncThemeFromDocument() {
        // Sync initial theme state from document
        const root = document.documentElement;
        const isLight = root.classList.contains('light') ||
            (!root.classList.contains('dark') && window.matchMedia('(prefers-color-scheme: light)').matches);

        if (isLight) {
            this.classList.add('light');
        }

        // Watch for changes on document root
        const observer = new MutationObserver(() => {
            const isNowLight = root.classList.contains('light') ||
                (!root.classList.contains('dark') && window.matchMedia('(prefers-color-scheme: light)').matches);
            this.classList.toggle('light', isNowLight);
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    }

    initThemeToggle() {
        const themeToggle = this.shadowRoot.querySelector('.theme-toggle');
        const root = document.documentElement;

        themeToggle.addEventListener('click', () => {
            const isLight = root.classList.contains('light') ||
                (!root.classList.contains('dark') && window.matchMedia('(prefers-color-scheme: light)').matches);

            if (isLight) {
                root.classList.remove('light');
                root.classList.add('dark');
                this.classList.remove('light');
            } else {
                root.classList.remove('dark');
                root.classList.add('light');
                this.classList.add('light');
            }
        });
    }

    initLanguageSelector() {
        const langSelector = this.shadowRoot.querySelector('.lang-selector');
        const langButton = this.shadowRoot.querySelector('.lang-button');
        const langOptions = this.shadowRoot.querySelectorAll('.lang-option');

        langButton.addEventListener('click', (e) => {
            e.stopPropagation();
            langSelector.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langSelector.classList.remove('open');
        });

        // Language codes for display
        const langCodes = {
            en: 'EN', es: 'ES', fr: 'FR', de: 'DE', zh: '中', ru: 'RU'
        };

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;

                // Update button text
                langButton.textContent = langCodes[lang] || lang.toUpperCase();

                // Update active state
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                langSelector.classList.remove('open');

                // Dispatch event for the page to handle
                this.dispatchEvent(new CustomEvent('language-change', {
                    detail: { language: lang },
                    bubbles: true,
                    composed: true
                }));
            });
        });
    }
}

customElements.define('site-nav', SiteNav);

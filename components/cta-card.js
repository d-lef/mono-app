/**
 * <cta-card> Web Component
 * "Try Mono free" call-to-action card for blog articles.
 *
 * Usage:
 *   <script src="/components/cta-card.js" defer></script>
 *   <cta-card></cta-card>
 *
 * For pages in subdirectories:
 *   <cta-card base-path="../"></cta-card>
 */

class CtaCard extends HTMLElement {
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

                :host {
                    --cta-bg: var(--bg-secondary, #2D2D2D);
                    --cta-border: rgba(255,255,255,0.08);
                    --cta-text: var(--text-primary, #FFFFFF);
                    --cta-text-secondary: var(--text-secondary, #B0B0B0);
                    --cta-btn-bg: var(--text-primary, #FFFFFF);
                    --cta-btn-text: var(--bg-primary, #252525);
                }

                .cta-card {
                    background: var(--cta-bg);
                    border: 1px solid var(--cta-border);
                    border-radius: 12px;
                    padding: 32px;
                    margin-top: 48px;
                    text-align: center;
                }

                .cta-title {
                    font-family: 'Comfortaa', sans-serif;
                    font-weight: 500;
                    font-size: 22px;
                    color: var(--cta-text);
                    margin: 0 0 8px 0;
                }

                .cta-sub {
                    font-family: 'Comfortaa', sans-serif;
                    font-size: 14px;
                    color: var(--cta-text-secondary);
                    margin: 0 0 24px 0;
                    line-height: 1.6;
                }

                .cta-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .cta-btn-primary {
                    display: inline-block;
                    background: var(--cta-btn-bg);
                    color: var(--cta-btn-text);
                    padding: 10px 24px;
                    border-radius: 8px;
                    font-family: 'Comfortaa', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: opacity 0.15s ease, transform 0.15s ease;
                }

                .cta-btn-primary:hover {
                    opacity: 0.88;
                    transform: scale(1.02);
                }

                .cta-btn-secondary {
                    display: inline-block;
                    background: transparent;
                    color: var(--cta-text-secondary);
                    padding: 10px 24px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.2);
                    font-family: 'Comfortaa', sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    text-decoration: none;
                    transition: border-color 0.15s ease, color 0.15s ease;
                }

                .cta-btn-secondary:hover {
                    border-color: rgba(255,255,255,0.4);
                    color: var(--cta-text);
                }

                /* Light theme adjustments */
                :host-context(:root.light) .cta-card,
                :host-context(:root:not(.dark)) .cta-card {
                    border-color: rgba(0,0,0,0.08);
                }

                :host-context(:root.light) .cta-btn-secondary,
                :host-context(:root:not(.dark)) .cta-btn-secondary {
                    border-color: rgba(0,0,0,0.2);
                }

                :host-context(:root.light) .cta-btn-secondary:hover,
                :host-context(:root:not(.dark)) .cta-btn-secondary:hover {
                    border-color: rgba(0,0,0,0.4);
                }
            </style>

            <div class="cta-card">
                <p class="cta-title">Try Mono free</p>
                <p class="cta-sub">One recording limit, no account needed. $50 to unlock everything — local AI, no subscription.</p>
                <div class="cta-buttons">
                    <a href="https://buy.polar.sh/polar_cl_nkpagGRrKv1j0VVif4wPQqWJH3frKM6qSjoOB2FsWXO"
                       class="cta-btn-primary" target="_blank" rel="noopener sponsored">Buy Mono — $50</a>
                    <a href="${basePath}?buy" class="cta-btn-secondary">Download free</a>
                </div>
            </div>
        `;
    }
}

customElements.define('cta-card', CtaCard);

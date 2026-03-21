class DiscountFloat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --df-bg: var(--bg-secondary, #2D2D2D);
                --df-bg-primary: var(--bg-primary, #252525);
                --df-text: var(--text-primary, #FFFFFF);
                --df-text-sec: var(--text-secondary, #B0B0B0);
            }

            .float-btn {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                font-family: 'Comfortaa', sans-serif;
                font-size: 13px;
                font-weight: 500;
                color: var(--df-text);
                background: var(--df-bg);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 40px;
                cursor: pointer;
                transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
                box-shadow: 0 2px 12px rgba(0,0,0,0.3);
            }

            .float-btn:hover {
                transform: scale(1.04);
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            }

            .float-btn.hidden {
                display: none;
            }

            :host-context(:root.light) .float-btn {
                border-color: rgba(0,0,0,0.1);
                box-shadow: 0 2px 12px rgba(0,0,0,0.1);
            }

            :host-context(:root.light) .float-btn:hover {
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }

            @media (prefers-color-scheme: light) {
                :host-context(:root:not(.dark)) .float-btn {
                    border-color: rgba(0,0,0,0.1);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                }
                :host-context(:root:not(.dark)) .float-btn:hover {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
            }

            .overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.6);
                z-index: 1000;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .overlay.active {
                display: flex;
            }

            .popup {
                background: var(--df-bg);
                border-radius: 12px;
                padding: 32px;
                max-width: 360px;
                width: 100%;
                position: relative;
                text-align: center;
            }

            .close {
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                color: var(--df-text-sec);
                font-size: 22px;
                cursor: pointer;
                line-height: 1;
                padding: 4px;
            }

            .close:hover { color: var(--df-text); }

            .title {
                font-family: 'Comfortaa', sans-serif;
                font-size: 20px;
                font-weight: 500;
                margin: 0 0 8px;
                color: var(--df-text);
            }

            .desc {
                font-family: 'Comfortaa', sans-serif;
                font-size: 13px;
                color: var(--df-text-sec);
                margin: 0 0 20px;
                line-height: 1.5;
            }

            .email {
                width: 100%;
                padding: 12px 14px;
                border: 1px solid var(--df-text-sec);
                border-radius: 8px;
                font-family: 'Comfortaa', sans-serif;
                font-size: 14px;
                background: var(--df-bg-primary);
                color: var(--df-text);
                outline: none;
                margin-bottom: 10px;
                box-sizing: border-box;
            }

            .email:focus { border-color: var(--df-text); }

            .submit {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 8px;
                background: var(--df-text);
                color: var(--df-bg-primary);
                font-family: 'Comfortaa', sans-serif;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: opacity 0.15s;
            }

            .submit:hover { opacity: 0.85; }
            .submit:disabled { opacity: 0.5; cursor: not-allowed; }

            .status {
                font-family: 'Comfortaa', sans-serif;
                font-size: 13px;
                color: var(--df-text-sec);
                margin-top: 12px;
                min-height: 18px;
            }

            @media (max-width: 768px) {
                .float-btn { display: none; }
            }
        </style>

        <button class="float-btn" id="btn">Early bird: 15% off</button>

        <div class="overlay" id="overlay">
            <div class="popup">
                <button class="close" id="close">&times;</button>
                <h3 class="title">Get 15% off mono</h3>
                <p class="desc">mono is in early release — grab 15% off as an early bird. Enter your email and we'll send you a promo code with download links.</p>
                <form id="form">
                    <input type="email" class="email" id="email" placeholder="your@email.com" required autocomplete="email">
                    <button type="submit" class="submit" id="submit">Send my discount</button>
                </form>
                <p class="status" id="status"></p>
            </div>
        </div>
        `;

        const btn = this.shadowRoot.getElementById('btn');
        const overlay = this.shadowRoot.getElementById('overlay');
        const close = this.shadowRoot.getElementById('close');
        const form = this.shadowRoot.getElementById('form');
        const email = this.shadowRoot.getElementById('email');
        const submit = this.shadowRoot.getElementById('submit');
        const status = this.shadowRoot.getElementById('status');

        // Hide if already dismissed this session
        if (sessionStorage.getItem('df_dismissed')) {
            btn.classList.add('hidden');
        }

        btn.addEventListener('click', () => {
            overlay.classList.add('active');
            email.focus();
        });

        close.addEventListener('click', () => {
            overlay.classList.remove('active');
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        const showFallback = () => {
            form.style.display = 'none';
            status.innerHTML =
                '<div style="margin-top:4px">' +
                '<p style="font-size:12px;color:var(--df-text-sec);margin-bottom:12px">Couldn\'t send email, but here\'s your code:</p>' +
                '<div style="background:var(--df-bg-primary);border-radius:8px;padding:14px;margin-bottom:14px">' +
                '<p style="font-size:24px;font-weight:700;letter-spacing:0.02em;margin:0">MONOWELCOME</p>' +
                '<p style="font-size:11px;color:var(--df-text-sec);margin:4px 0 0">15% off — enter at checkout</p>' +
                '</div>' +
                '<a href="https://buy.polar.sh/polar_cl_nkpagGRrKv1j0VVif4wPQqWJH3frKM6qSjoOB2FsWXO?discount=MONOWELCOME" ' +
                'style="display:inline-block;padding:12px 24px;background:var(--df-text);color:var(--df-bg-primary);border-radius:8px;text-decoration:none;font-family:Comfortaa,sans-serif;font-size:14px;font-weight:500" target="_blank">Buy — $42.50</a>' +
                '</div>';
            if (typeof gtag === 'function') gtag('event', 'email_captured', { event_category: 'discount', event_label: 'float_discount_fallback' });
            if (typeof ma === 'function') ma('email_captured', { label: 'float_discount_fallback' });
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = email.value.trim();
            if (!val) return;

            submit.disabled = true;
            status.textContent = 'Sending...';

            try {
                const r = await fetch('https://t.mono-ai.uk/api/send-discount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: val }),
                });
                const data = await r.json();
                if (data.ok) {
                    status.textContent = 'Sent! Check your inbox.';
                    email.value = '';
                    if (typeof gtag === 'function') gtag('event', 'email_captured', { event_category: 'discount', event_label: 'float_discount' });
                    if (typeof ma === 'function') ma('email_captured', { label: 'float_discount' });
                    btn.classList.add('hidden');
                    sessionStorage.setItem('df_dismissed', '1');
                    setTimeout(() => overlay.classList.remove('active'), 2000);
                } else {
                    showFallback();
                }
            } catch {
                showFallback();
            }
        });
    }
}

customElements.define('discount-float', DiscountFloat);

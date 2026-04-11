class DiscountFloat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._t = {
            en: { btn: 'Early bird: 15% off', title: 'Get 15% off mono', desc: 'mono is in early release — grab 15% off as an early bird. Enter your email and we\'ll send you a promo code with download links.', submit: 'Send my discount', sending: 'Sending...', sent: 'Sent! Check your inbox.', fallback: 'Couldn\'t send email, but here\'s your code:', code_note: '15% off — enter at checkout', buy: 'Buy — $42.50' },
            es: { btn: 'Early bird: 15% dto.', title: '15% de descuento en mono', desc: 'mono esta en lanzamiento anticipado — obtene un 15% de descuento. Ingresa tu email y te enviaremos un codigo promocional con enlaces de descarga.', submit: 'Enviar mi descuento', sending: 'Enviando...', sent: 'Enviado! Revisa tu bandeja.', fallback: 'No pudimos enviar el email, pero aqui esta tu codigo:', code_note: '15% de descuento — ingresalo en el checkout', buy: 'Comprar — $42.50' },
            fr: { btn: 'Early bird : -15%', title: '15% de reduction sur mono', desc: 'mono est en acces anticipe — profitez de 15% de reduction en tant qu\'early bird. Entrez votre email et nous vous enverrons un code promo avec les liens de telechargement.', submit: 'Envoyer mon code', sending: 'Envoi...', sent: 'Envoye ! Verifiez votre boite.', fallback: 'Impossible d\'envoyer l\'email, mais voici votre code :', code_note: '15% de reduction — a entrer au checkout', buy: 'Acheter — 42,50$' },
            de: { btn: 'Early Bird: 15% Rabatt', title: '15% Rabatt auf mono', desc: 'mono ist im Early Release — sichern Sie sich 15% Rabatt als Early Bird. Geben Sie Ihre E-Mail ein und wir senden Ihnen einen Promo-Code mit Download-Links.', submit: 'Rabatt senden', sending: 'Wird gesendet...', sent: 'Gesendet! Prufen Sie Ihren Posteingang.', fallback: 'E-Mail konnte nicht gesendet werden, aber hier ist Ihr Code:', code_note: '15% Rabatt — beim Checkout eingeben', buy: 'Kaufen — 42,50$' },
            zh: { btn: 'Early bird: 85折', title: 'mono 85折优惠', desc: 'mono 处于早期发布阶段——作为早期用户享受85折优惠。输入您的邮箱，我们将发送优惠码和下载链接。', submit: '发送优惠码', sending: '发送中...', sent: '已发送！请查收邮箱。', fallback: '邮件发送失败，但这是您的优惠码：', code_note: '85折——在结账时输入', buy: '购买 — $42.50' },
            ru: { btn: 'Early bird: скидка 15%', title: 'Скидка 15% на mono', desc: 'mono в раннем доступе — получите скидку 15% как ранний пользователь. Введите email, и мы отправим промокод со ссылками для скачивания.', submit: 'Отправить скидку', sending: 'Отправка...', sent: 'Отправлено! Проверьте почту.', fallback: 'Не удалось отправить email, но вот ваш код:', code_note: 'Скидка 15% — введите при оплате', buy: 'Купить — $42.50' }
        };
    }

    _getT(lang) {
        return this._t[lang] || this._t.en;
    }

    _applyLang(lang) {
        var t = this._getT(lang);
        var s = this.shadowRoot;
        s.getElementById('btn').textContent = t.btn;
        s.getElementById('title').textContent = t.title;
        s.getElementById('desc').textContent = t.desc;
        s.getElementById('submit').textContent = t.submit;
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
                display: inline-flex;
                align-items: center;
                justify-content: center;
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

            .float-btns {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                gap: 8px;
            }

            @media (max-width: 768px) {
                .float-btns { display: none; }
            }
        </style>

        <div class="float-btns">
            <button class="float-btn" id="btn">Early bird: 15% off</button>
            <button class="float-btn" id="student-btn">Student? 70% off</button>
        </div>

        <div class="overlay" id="overlay">
            <div class="popup">
                <button class="close" id="close">&times;</button>
                <h3 class="title" id="title">Get 15% off mono</h3>
                <p class="desc" id="desc">mono is in early release — grab 15% off as an early bird. Enter your email and we'll send you a promo code with download links.</p>
                <form id="form">
                    <input type="email" class="email" id="email" placeholder="your@email.com" required autocomplete="email">
                    <button type="submit" class="submit" id="submit">Send my discount</button>
                </form>
                <p class="status" id="status"></p>
            </div>
        </div>

        <div class="overlay" id="student-overlay">
            <div class="popup">
                <button class="close" id="student-close">&times;</button>
                <h3 class="title">Student discount — 70% off</h3>
                <p class="desc">Enter your details and we'll verify your student status. The discount code will be sent to your student email.</p>
                <form id="student-form">
                    <input type="text" class="email" id="student-name" placeholder="Your name" required autocomplete="name">
                    <input type="text" class="email" id="student-school" placeholder="University / school name" required>
                    <input type="email" class="email" id="student-email" placeholder="Student email (.edu or university domain)" required autocomplete="email">
                    <button type="submit" class="submit" id="student-submit">Send for verification</button>
                </form>
                <p class="status" id="student-status"></p>
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

        // Apply saved language
        var lang = localStorage.getItem('mono-lang') || 'en';
        this._applyLang(lang);

        // Listen for language changes from nav
        document.addEventListener('language-change', (e) => {
            this._applyLang(e.detail.language);
        });

        // Hide if already dismissed this session
        if (sessionStorage.getItem('df_dismissed')) {
            btn.classList.add('hidden');
        }

        btn.addEventListener('click', () => {
            overlay.classList.add('active');
            email.focus();
            if (typeof ym === 'function') ym(108199724, 'reachGoal', 'discount_float_click');
        });

        close.addEventListener('click', () => {
            overlay.classList.remove('active');
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        var self = this;
        const showFallback = () => {
            var t = self._getT(localStorage.getItem('mono-lang') || 'en');
            form.style.display = 'none';
            status.innerHTML =
                '<div style="margin-top:4px">' +
                '<p style="font-size:12px;color:var(--df-text-sec);margin-bottom:12px">' + t.fallback + '</p>' +
                '<div style="background:var(--df-bg-primary);border-radius:8px;padding:14px;margin-bottom:14px">' +
                '<p style="font-size:24px;font-weight:700;letter-spacing:0.02em;margin:0">MONOWELCOME</p>' +
                '<p style="font-size:11px;color:var(--df-text-sec);margin:4px 0 0">' + t.code_note + '</p>' +
                '</div>' +
                '<a href="https://buy.polar.sh/polar_cl_nkpagGRrKv1j0VVif4wPQqWJH3frKM6qSjoOB2FsWXO?discount=MONOWELCOME" ' +
                'style="display:inline-block;padding:12px 24px;background:var(--df-text);color:var(--df-bg-primary);border-radius:8px;text-decoration:none;font-family:Comfortaa,sans-serif;font-size:14px;font-weight:500" target="_blank">' + t.buy + '</a>' +
                '</div>';
            if (typeof gtag === 'function') gtag('event', 'email_captured', { event_category: 'discount', event_label: 'float_discount_fallback' });
            if (typeof ma === 'function') ma('email_captured', { label: 'float_discount_fallback' });
            if (typeof ym === 'function') ym(108199724, 'reachGoal', 'discount_email_fallback');
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = email.value.trim();
            if (!val) return;

            var t = self._getT(localStorage.getItem('mono-lang') || 'en');
            submit.disabled = true;
            status.textContent = t.sending;

            try {
                const r = await fetch('https://t.mono-ai.uk/api/send-discount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: val }),
                });
                const data = await r.json();
                if (data.ok) {
                    status.textContent = t.sent;
                    email.value = '';
                    if (typeof gtag === 'function') gtag('event', 'email_captured', { event_category: 'discount', event_label: 'float_discount' });
                    if (typeof ma === 'function') ma('email_captured', { label: 'float_discount' });
                    if (typeof ym === 'function') ym(108199724, 'reachGoal', 'discount_email_captured');
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

        // --- Student discount popup ---
        const studentBtn = this.shadowRoot.getElementById('student-btn');
        const studentOverlay = this.shadowRoot.getElementById('student-overlay');
        const studentClose = this.shadowRoot.getElementById('student-close');
        const studentForm = this.shadowRoot.getElementById('student-form');
        const studentName = this.shadowRoot.getElementById('student-name');
        const studentSchool = this.shadowRoot.getElementById('student-school');
        const studentEmail = this.shadowRoot.getElementById('student-email');
        const studentSubmit = this.shadowRoot.getElementById('student-submit');
        const studentStatus = this.shadowRoot.getElementById('student-status');

        studentBtn.addEventListener('click', () => {
            studentOverlay.classList.add('active');
            studentName.focus();
        });

        studentClose.addEventListener('click', () => {
            studentOverlay.classList.remove('active');
        });

        studentOverlay.addEventListener('click', (e) => {
            if (e.target === studentOverlay) studentOverlay.classList.remove('active');
        });

        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameVal = studentName.value.trim();
            const schoolVal = studentSchool.value.trim();
            const emailVal = studentEmail.value.trim();
            if (!nameVal || !schoolVal || !emailVal) return;

            studentSubmit.disabled = true;
            studentStatus.textContent = 'Sending...';

            try {
                const r = await fetch('https://t.mono-ai.uk/api/send-student-discount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameVal,
                        school: schoolVal,
                        email: emailVal,
                        session_id: sessionStorage.getItem('_ma_sid') || '',
                    }),
                });
                const data = await r.json();
                if (data.ok) {
                    studentStatus.textContent = 'Sent! We\'ll verify and email your discount code soon.';
                    studentName.value = '';
                    studentSchool.value = '';
                    studentEmail.value = '';
                    if (typeof gtag === 'function') gtag('event', 'student_email_captured', { event_category: 'discount', event_label: 'float_student' });
                    if (typeof ma === 'function') ma('student_email_captured', { label: 'float_student' });
                    setTimeout(() => studentOverlay.classList.remove('active'), 3000);
                } else {
                    studentStatus.textContent = 'Something went wrong. Please try again.';
                    studentSubmit.disabled = false;
                }
            } catch {
                studentStatus.textContent = 'Something went wrong. Please try again.';
                studentSubmit.disabled = false;
            }
        });
    }
}

customElements.define('discount-float', DiscountFloat);

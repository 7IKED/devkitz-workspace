/**
 * DkZ Landing Pages – Context Detection Engine
 * Auto-detects browser, device, context, and applies CSS classes to <body>
 */
const DkZDetect = (() => {
    const ctx = {
        browser: 'unknown',
        device: 'desktop',
        mode: 'home',
        profile: 'personal',
        incognito: false,
        pwa: false,
        touch: false,
        width: window.innerWidth,
        height: window.innerHeight
    };

    // ── Browser Detection ──
    function detectBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('vivaldi')) return 'vivaldi';
        if (ua.includes('edg/')) return 'edge';
        if (ua.includes('opr/') || ua.includes('opera')) return 'opera';
        if (ua.includes('firefox')) return 'firefox';
        if (ua.includes('chrome')) return 'chrome';
        if (ua.includes('safari')) return 'safari';
        return 'unknown';
    }

    // ── Device Detection ──
    function detectDevice() {
        const w = window.innerWidth;
        const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        ctx.touch = touch;

        // User-Agent mobile/tablet hints
        const ua = navigator.userAgent;
        const isMobileUA = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);

        if (isMobileUA || (touch && w <= 480)) return 'mobile';
        if (isTabletUA || (touch && w <= 1024 && w > 480)) return 'tablet';
        return 'desktop';
    }

    // ── Context from URL Params ──
    function detectContext() {
        const params = new URLSearchParams(window.location.search);

        // Mode: home | newtab | sidepanel
        if (params.has('mode')) {
            ctx.mode = params.get('mode');
        }

        // Profile: personal | business
        if (params.has('profile')) {
            ctx.profile = params.get('profile');
        }

        // Incognito flag
        if (params.has('incognito') && params.get('incognito') === '1') {
            ctx.incognito = true;
        }
    }

    // ── PWA Detection ──
    function detectPWA() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            ctx.pwa = true;
        }
        if (window.navigator.standalone === true) {
            ctx.pwa = true;
        }
    }

    // ── Incognito Heuristic (async) ──
    async function detectIncognitoHeuristic() {
        if (ctx.incognito) return; // already set by param
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const est = await navigator.storage.estimate();
                // In incognito, quota is often very limited
                if (est.quota && est.quota < 120000000) {
                    ctx.incognito = true;
                }
            }
        } catch (e) {
            // Ignore
        }
    }

    // ── Apply Classes to Body ──
    function applyClasses() {
        const body = document.body;
        const classes = [
            ctx.browser,
            ctx.device,
            ctx.mode,
            ctx.profile
        ];

        if (ctx.incognito) classes.push('incognito');
        if (ctx.pwa) classes.push('pwa');
        if (ctx.touch) classes.push('touch');

        body.className = classes.join(' ');
        body.dataset.context = JSON.stringify(ctx);
    }

    // ── Build Context Badge Text ──
    function getBadgeText() {
        const parts = [];
        parts.push(ctx.browser.charAt(0).toUpperCase() + ctx.browser.slice(1));
        parts.push(ctx.device.charAt(0).toUpperCase() + ctx.device.slice(1));

        const modeLabels = {
            home: 'Homepage',
            newtab: 'New Tab',
            sidepanel: 'Side Panel'
        };
        parts.push(modeLabels[ctx.mode] || ctx.mode);

        if (ctx.profile === 'business') parts.push('Business');
        if (ctx.incognito) parts.push('Inkognito');
        if (ctx.pwa) parts.push('PWA');

        return parts.join(' · ');
    }

    // ── Init ──
    async function init() {
        ctx.browser = detectBrowser();
        ctx.device = detectDevice();
        detectContext();
        detectPWA();
        await detectIncognitoHeuristic();
        applyClasses();

        // Listen for resize to re-detect device
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                ctx.width = window.innerWidth;
                ctx.height = window.innerHeight;
                ctx.device = detectDevice();
                applyClasses();
                window.dispatchEvent(new CustomEvent('dkz-context-change', { detail: ctx }));
            }, 250);
        });

        // Dispatch initial context event
        window.dispatchEvent(new CustomEvent('dkz-context-ready', { detail: ctx }));

        return ctx;
    }

    return { init, getContext: () => ctx, getBadgeText };
})();

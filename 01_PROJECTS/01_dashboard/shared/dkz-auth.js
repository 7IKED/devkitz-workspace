/**
 * DEVKiTZ™ - Global GitHub OAuth & Session Manager
 * Zwingend fuer alle Module unter dkz.app (R98 / VPS Multi-Repo)
 */
(function() {
    window.DkzAuth = {
        sessionKey: 'dkz_github_session',
        oauthUrl: 'https://github.com/login/oauth/authorize',
        clientId: 'DKZ_PENDING_OAUTH_CLIENT_ID_WAITING_FOR_ADMIN', // Wird nach Reboot vom Admin gesetzt
        redirectUri: 'https://hub.dkz.app/oauth-callback',

        init: function() {
            this.checkSession();
            this.injectLoginButton();
        },

        checkSession: function() {
            const session = localStorage.getItem(this.sessionKey);
            if (!session) {
                console.warn("[DkZ Auth] User nicht eingeloggt. Redirect zur Auth koennte erforderlich sein.");
                // Optionale Redirect-Logik:
                // if (window.location.hostname.includes('dkz.app')) { this.login(); }
            }
        },

        login: function() {
            const url = `${this.oauthUrl}?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=repo,user`;
            window.location.href = url;
        },

        logout: function() {
            localStorage.removeItem(this.sessionKey);
            window.location.reload();
        },

        injectLoginButton: function() {
            // Wartet bis die navbar gerendert ist
            setTimeout(() => {
                const navbar = document.querySelector('.glass-header');
                if (navbar && !document.getElementById('dkz-auth-btn')) {
                    const session = localStorage.getItem(this.sessionKey);
                    const btn = document.createElement('button');
                    btn.id = 'dkz-auth-btn';
                    btn.style.marginLeft = 'auto';
                    btn.style.background = 'transparent';
                    btn.style.border = '1px solid var(--accent, #fa1e4e)';
                    btn.style.color = '#fff';
                    btn.style.padding = '5px 10px';
                    btn.style.borderRadius = '5px';
                    btn.style.cursor = 'pointer';
                    btn.style.fontFamily = 'Inter, sans-serif';
                    
                    if (session) {
                        btn.innerText = 'GitHub Logout';
                        btn.onclick = () => this.logout();
                    } else {
                        btn.innerText = 'Login via GitHub';
                        btn.onclick = () => this.login();
                    }
                    navbar.appendChild(btn);
                }
            }, 500);
        }
    };

    // Auto-init
    document.addEventListener('DOMContentLoaded', () => {
        window.DkzAuth.init();
    });
})();

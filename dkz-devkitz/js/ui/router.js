import { bus } from '../core/event-bus.js';
import { EVENTS, ROUTES } from '../core/config.js';

/**
 * Router Module
 * Handles visibility of views based on hash or events.
 */
export const Router = {
    init() {
        // Listen for navigation events
        bus.on(EVENTS.NAVIGATE, (route) => this.navigate(route));

        // Initial route
        const initial = window.location.hash.slice(1) || ROUTES.DASHBOARD;
        this.navigate(initial);

        // Bind click events for navigation
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action^="nav:"]');
            if (btn) {
                e.preventDefault();
                const route = btn.dataset.action.split(':')[1];
                this.navigate(route);
            }
        });
    },

    navigate(route) {
        console.log(`[Router] Navigating to: ${route}`);

        // Hide all views
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));

        // Show target view
        const target = document.getElementById(`view-${route}`);
        if (target) {
            target.classList.remove('hidden');
            // Update hash without triggering reload
            if (window.location.hash.slice(1) !== route) {
                history.pushState(null, null, `#${route}`);
            }
        } else {
            console.error(`[Router] View not found: ${route}`);
        }
    }
};

// Initialize when App is ready
bus.on(EVENTS.APP_INIT, () => Router.init());

import { CONFIG, EVENTS } from './config.js';
import { bus } from './event-bus.js';
import '../controller.js'; // Import controller to start listeners

/**
 * Main Application Orchestrator
 * Handles specific high-level coordination logic.
 */
const App = {
    init() {
        console.log(`[App] Initializing ${CONFIG.APP_NAME} v${CONFIG.VERSION}...`);

        // Error trap
        window.addEventListener('error', (e) => {
            console.error('[Global Error]', e.message);
            bus.emit(EVENTS.NOTIFY, { type: 'error', message: 'An unexpected error occurred.' });
        });

        // Initialize sub-systems (mock functionality for now)
        this.setupRoutes();

        // Ready
        bus.emit(EVENTS.APP_INIT);
        console.log('[App] Ready.');
    },

    setupRoutes() {
        // Basic router stub - will be replaced by Router module
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            bus.emit(EVENTS.NAVIGATE, hash);
        });

        // Global Action Dispatcher
        document.body.addEventListener('click', (e) => {
            const el = e.target.closest('[data-action]');
            if (el) {
                const action = el.dataset.action;
                // If it's a nav action, Router handles it via its own listener or we emit
                // But Router already listens to clicks? Let's unify.
                // Router listens to `nav:` clicks.
                // We will emit ALL actions to the bus so Controller can pick them up.
                // e.g. "editor:save" -> emit("editor:save")

                // Prevent default for links/buttons
                // e.preventDefault(); // careful with inputs/labels
                if (el.tagName === 'BUTTON' || el.tagName === 'A') e.preventDefault();

                bus.emit(action);
            }
        });
    }
};

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

export default App;

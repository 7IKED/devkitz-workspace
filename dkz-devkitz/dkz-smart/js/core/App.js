import { bus } from './EventBus.js';

/**
 * App.js
 * Main Entry Point and Orchestrator
 */
class App {
    constructor() {
        this.name = "DkZ devkitz Smart";
        this.version = "2.0.0";
        this.bus = bus;
        this.modules = {};
    }

    async init() {
        console.log(`🚀 ${this.name} v${this.version} Initializing...`);

        try {
            // 1. Initialize Storage
            // await this.initStorage();

            // 2. Initialize UI
            // await this.initUI();

            // 3. Load Modules
            // await this.loadModules();

            this.bus.emit('app:ready', { version: this.version });
            console.log("✅ Initialization Complete");
        } catch (error) {
            console.error("❌ Initialization Failed:", error);
            document.body.innerHTML = `<h1 style="color:red; padding:20px">Fatal Error: ${error.message}</h1>`;
        }
    }

    registerModule(name, moduleInstance) {
        this.modules[name] = moduleInstance;
        if (moduleInstance.init) {
            moduleInstance.init();
        }
    }
}

// Start the App
const app = new App();
window.dkz = app; // Expose to window for debugging

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

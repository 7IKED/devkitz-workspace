import { CONFIG, EVENTS } from './config.js';
import { bus } from './event-bus.js';

/**
 * Settings Manager
 * Handles user preferences via LocalStorage.
 */
class SettingsManager {
    constructor() {
        this.defaults = {
            theme: CONFIG.DEFAULT_THEME,
            editorMode: 'smart', // 'smart' (markdown) or 'extended' (wysiwyg)
            userName: 'User',
            driveConnected: false,
            driveToken: null
        };
        this.cache = this.load();
    }

    /**
     * Load settings from LocalStorage
     */
    load() {
        const stored = localStorage.getItem('dkz_settings');
        return stored ? { ...this.defaults, ...JSON.parse(stored) } : { ...this.defaults };
    }

    /**
     * Save settings to LocalStorage
     */
    save() {
        localStorage.setItem('dkz_settings', JSON.stringify(this.cache));
    }

    /**
     * Get a setting value
     * @param {string} key 
     */
    get(key) {
        return this.cache[key];
    }

    /**
     * Set a setting value and notify listeners
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        this.cache[key] = value;
        this.save();

        if (key === 'theme') {
            bus.emit(EVENTS.THEME_CHANGE, value);
        }
    }
}

export const settings = new SettingsManager();

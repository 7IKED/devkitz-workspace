/**
 * Core Configuration & State
 * Central source of truth for app constants and default state.
 */

export const CONFIG = {
    APP_NAME: 'DkZ devkitz',
    VERSION: '2.0.0',
    DB_NAME: 'dkz_devkitz_db',
    DB_VERSION: 1,
    AUTOSAVE_DELAY_MS: 2000,
    THEMES: ['dark', 'light', 'neon'],
    DEFAULT_THEME: 'dark'
};

export const ROUTES = {
    DASHBOARD: 'dashboard',
    EDITOR: 'editor',
    SETTINGS: 'settings'
};

export const EVENTS = {
    APP_INIT: 'app:init',
    NAVIGATE: 'nav:go',
    PROJECT_SAVE: 'project:save',
    PROJECT_LOAD: 'project:load',
    THEME_CHANGE: 'ui:theme',
    NOTIFY: 'ui:notify'
};

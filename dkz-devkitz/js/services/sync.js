import { settings } from '../core/settings.js';
import { bus } from '../core/event-bus.js';
import { EVENTS } from '../core/config.js';

/**
 * Sync Service (Google Drive)
 * Validates credentials and handles mock uploads.
 */
export const DriveSync = {
    isAuthenticated: false,

    init() {
        const token = settings.get('driveToken');
        if (token) {
            this.isAuthenticated = true;
            // Validate token...
        }
    },

    /**
     * Connect functionality (Mock)
     */
    async connect(clientId, apiKey) {
        console.log('[Drive] Connecting with', clientId);
        // In a real app, this would trigger gapi.auth2.init()
        // Here we simulate a success after a delay

        return new Promise((resolve) => {
            setTimeout(() => {
                this.isAuthenticated = true;
                settings.set('driveToken', 'mock-token-123');
                settings.set('driveConnected', true);
                bus.emit(EVENTS.NOTIFY, { type: 'success', message: 'Connected to Google Drive' });
                resolve(true);
            }, 1000);
        });
    },

    /**
     * Upload Data (Mock)
     * @param {object} fileData 
     */
    async upload(fileData) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        console.log('[Drive] Uploading...', fileData);
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: 'drive-file-id-123', name: fileData.name });
            }, 1500);
        });
    }
};

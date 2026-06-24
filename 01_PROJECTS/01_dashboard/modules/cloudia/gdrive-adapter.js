/**
 * CLOUDIA2 Google Drive Provider-Adapter (MVP)
 * Verbindet das Frontend mit dem Backend-Server zur Verarbeitung von Google Drive Dateien.
 */

class GDriveAdapter {
    constructor(baseUrl = 'http://localhost:3040/api/v1/cloudia/gdrive') {
        this.baseUrl = baseUrl;
        this.isConnected = false;
        this.providerId = 'gdrive';
    }

    /**
     * Simuliert den Connect-Vorgang via Backend
     */
    async connect() {
        console.log('[GDriveAdapter] Connecting...');
        // In einem echten OAuth Flow wuerden wir hier zum Backend leiten oder ein Popup oeffnen.
        // MVP: Wir tun so, als waere die Verbindung erfolgreich.
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                resolve({ success: true, status: 'online' });
            }, 600);
        });
    }

    /**
     * Laedt die unsortierte Queue von Google Drive via Backend
     */
    async fetchQueue() {
        if (!this.isConnected) {
            console.warn('[GDriveAdapter] Not connected. Call connect() first.');
            return [];
        }

        try {
            const response = await fetch(`${this.baseUrl}/queue`);
            const data = await response.json();
            
            if (data.success && data.files) {
                return data.files;
            } else {
                console.error('[GDriveAdapter] Fetch failed:', data);
                return [];
            }
        } catch (err) {
            console.error('[GDriveAdapter] Fetch error:', err);
            return [];
        }
    }

    /**
     * Sortiert eine Datei in Google Drive ueber das Backend
     */
    async sortFile(fileId, targetPath, ruleId) {
        if (!this.isConnected) return false;

        try {
            const response = await fetch(`${this.baseUrl}/sort`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, targetPath, ruleId })
            });
            const data = await response.json();
            return data.success;
        } catch (err) {
            console.error('[GDriveAdapter] Sort error:', err);
            return false;
        }
    }
}

// Global verfuegbar machen
window.CLOUDIA_GDrive = new GDriveAdapter();

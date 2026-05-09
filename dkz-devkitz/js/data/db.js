import { CONFIG } from '../core/config.js';

/**
 * IndexedDB Wrapper
 * Promisified wrapper for IDB operations.
 */
export const DB = {
    db: null,

    /**
     * Open the database
     */
    open() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve(this.db);

            const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

            request.onerror = (e) => {
                console.error('[DB] Open Error:', e.target.error);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.log('[DB] Opened successfully.');
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                console.log('[DB] Upgrade needed. Creating stores...');

                // Projects Store
                if (!db.objectStoreNames.contains('projects')) {
                    const store = db.createObjectStore('projects', { keyPath: 'id' });
                    store.createIndex('updated', 'updated', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                }

                // Exports Store
                if (!db.objectStoreNames.contains('exports')) {
                    db.createObjectStore('exports', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    },

    /**
     * Add or Update an item
     * @param {string} storeName 
     * @param {object} data 
     */
    put(storeName, data) {
        return this.runTx(storeName, 'readwrite', store => store.put(data));
    },

    /**
     * Get an item by Key
     * @param {string} storeName 
     * @param {string|number} key 
     */
    get(storeName, key) {
        return this.runTx(storeName, 'readonly', store => store.get(key));
    },

    /**
     * Get all items from a store
     * @param {string} storeName 
     */
    getAll(storeName) {
        return this.runTx(storeName, 'readonly', store => store.getAll());
    },

    /**
     * Delete an item
     * @param {string} storeName 
     * @param {string|number} key 
     */
    delete(storeName, key) {
        return this.runTx(storeName, 'readwrite', store => store.delete(key));
    },

    /**
     * Helper to run a transaction
     */
    runTx(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('DB not initialized'));

            const tx = this.db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const request = callback(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

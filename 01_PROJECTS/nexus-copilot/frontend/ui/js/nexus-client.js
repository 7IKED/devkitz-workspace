/**
 * Nexus Copilot — Offline-First Client
 * @DKZ:RULES -> Keine Frameworks
 */

class NexusClient {
  constructor() {
    this.API_URL = 'http://localhost:7778/api'; // Standardmaessig PS (Local) Backend
    this.isOnline = false;
    this.checkInterval = null;
    
    // Elemente
    this.chatArea = document.getElementById('chat');
    this.input = document.getElementById('msg-input');
    this.statusDot = document.getElementById('net-status');
    this.statusText = document.getElementById('status-text');
    this.queueStatus = document.getElementById('queue-status');
    
    this.init();
  }

  init() {
    this.startHealthCheck();
    this.updateQueueStatus();
    
    // Wenn wir wieder online kommen -> Queue syncen
    window.addEventListener('online', () => this.checkBackendStatus());
  }

  // 1. Health Check (Ist das Backend da?)
  async checkBackendStatus() {
    try {
      const res = await fetch(`${this.API_URL}/health`, { method: 'GET' });
      if (res.ok) {
        this.setOnline(true);
        this.syncQueue();
      } else {
        this.setOnline(false);
      }
    } catch (e) {
      this.setOnline(false);
    }
  }

  startHealthCheck() {
    this.checkBackendStatus();
    // Alle 5 Sekunden prüfen
    this.checkInterval = setInterval(() => this.checkBackendStatus(), 5000);
  }

  setOnline(status) {
    if (this.isOnline !== status) {
      this.isOnline = status;
      if (status) {
        this.statusDot.className = 'status-dot online';
        this.statusText.textContent = 'Backend verbunden (VPS/PS)';
      } else {
        this.statusDot.className = 'status-dot offline';
        this.statusText.textContent = 'Offline-Modus';
      }
    }
  }

  // 2. Chat Logik
  async sendMsg() {
    const text = this.input.value.trim();
    if (!text) return;

    // User Nachricht anzeigen
    this.appendMessage(text, 'user');
    this.input.value = '';

    if (this.isOnline) {
      // Direkt ans Backend schicken
      try {
        const response = await fetch(`${this.API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.appendMessage(data.reply, 'ai');
        } else {
          throw new Error('Backend Fehler');
        }
      } catch (e) {
        // Fallback wenn Request failt
        this.addToQueue(text);
        this.appendMessage('Verbindung abgebrochen. Nachricht in Offline-Queue gespeichert.', 'ai');
      }
    } else {
      // Offline -> In Queue packen
      this.addToQueue(text);
      this.appendMessage('[Offline] Nachricht gespeichert. Wird gesendet sobald das Backend erreichbar ist.', 'ai');
    }
  }

  appendMessage(text, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.textContent = text; // Simpler XSS Schutz via textContent
    this.chatArea.appendChild(div);
    this.chatArea.scrollTop = this.chatArea.scrollHeight;
  }

  // 3. Offline Queue System
  getQueue() {
    try {
      return JSON.parse(localStorage.getItem('nexus_queue') || '[]');
    } catch (e) {
      return [];
    }
  }

  addToQueue(message) {
    const queue = this.getQueue();
    queue.push({ message, timestamp: Date.now() });
    localStorage.setItem('nexus_queue', JSON.stringify(queue));
    this.updateQueueStatus();
  }

  updateQueueStatus() {
    const count = this.getQueue().length;
    this.queueStatus.textContent = `${count} Nachricht(en) in der Offline-Queue`;
  }

  async syncQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log('Syncing offline queue...');
    try {
      const response = await fetch(`${this.API_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue })
      });

      if (response.ok) {
        localStorage.setItem('nexus_queue', '[]');
        this.updateQueueStatus();
        this.appendMessage(`[System] ${queue.length} Offline-Nachricht(en) synchronisiert.`, 'ai');
      }
    } catch (e) {
      console.warn('Sync fehlgeschlagen', e);
    }
  }
}

// Global instance
const nexus = new NexusClient();

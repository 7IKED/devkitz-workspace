/* ============================================================
   DEVKiTZ DomainControl — Application Logic
   ============================================================ */

// ── State ─────────────────────────────────────────────────
const STATE_KEY = 'anticrav_domaincontrol';

const defaultState = {
    // Provider tokens
    tokens: {
        ionos: '',
        hostinger: '',
        cloudflare: '',
        google: '',
        googleServiceAccount: '',
        github: '',
        adsense: '',
        nextcloud: ''
    },
    // Domains per provider
    domains: {
        ionos: [
            { id: 'i1', name: 'beispiel.de', status: 'active', expires: '2027-03-15', dns: [] },
            { id: 'i2', name: 'mein-projekt.com', status: 'active', expires: '2026-11-20', dns: [] }
        ],
        hostinger: [
            { id: 'h1', name: 'startup-site.de', status: 'active', expires: '2027-01-10', dns: [] },
            { id: 'h2', name: 'business-portal.com', status: 'active', expires: '2026-08-05', dns: [] }
        ],
        cloudflare: [
            { id: 'c1', name: 'cloudapp.io', status: 'active', expires: '2027-06-30', dns: [] }
        ]
    },
    // SSH profiles
    ssh: {
        startup: { host: '', port: '22', user: '', pass: '' },
        business: { host: '', port: '22', user: '', pass: '' },
        kvm4: { host: '', port: '22', user: '', n8n: '' },
        kvm8: { host: '', port: '22', user: '', n8n: '' }
    },
    // Google services connected state
    googleServices: {
        blogger: false,
        drive: false,
        sites: false,
        adsense: false,
        search: false,
        analytics: false
    },
    // Blogs
    blogs: [],
    // Published pages
    pages: [],
    // Sites config
    sitesConfig: {
        url: '',
        template: '',
        domain: '',
        dnsPrefix: '',
        dnsType: 'CNAME',
        dnsTarget: 'ghs.googlehosted.com'
    },
    // Publishing integrations
    integrations: {
        cloudflare: { connected: false, cdnEnabled: false, sslEnabled: false },
        github: { connected: false, repo: '', branch: 'main', preview: true },
        adsense: { connected: false, publisherId: '', autoAds: false },
        drive: { connected: false, folderId: '', syncMode: 'manual', htmlSync: false },
        nextcloud: { connected: false, url: '', user: '', syncDir: '' }
    },
    // NextCloud server
    ncServer: { host: '', port: '22', user: '', os: 'ubuntu' }
};

let state = loadState();

function loadState() {
    try {
        const stored = localStorage.getItem(STATE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Deep merge with defaults to ensure new fields exist
            return deepMerge(defaultState, parsed);
        }
    } catch (e) {
        console.warn('State load error:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('State save error:', e);
    }
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// ── Panel Navigation ──────────────────────────────────────
let currentPanel = 'dashboard';
let currentProvider = 'ionos';

const panelTitles = {
    dashboard: { icon: '⚡', text: 'Dashboard' },
    domains: { icon: '🔗', text: 'Domain-Verwaltung' },
    dns: { icon: '🌐', text: 'DNS Control Center' },
    ssh: { icon: '🖥️', text: 'SSH & Server' },
    google: { icon: '🔐', text: 'Google API & Tokens' },
    blogger: { icon: '📄', text: 'Blogger / Blogspot' },
    sites: { icon: '🛠️', text: 'Google Sites' },
    publishing: { icon: '🚀', text: 'Publishing & Integrationen' },
    nextcloud: { icon: '☁️', text: 'NextCloud' }
};

function switchPanel(panelId) {
    currentPanel = panelId;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.panel === panelId);
    });

    // Update panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${panelId}`);
    });

    // Update header
    const meta = panelTitles[panelId];
    if (meta) {
        document.getElementById('headerIcon').textContent = meta.icon;
        document.getElementById('headerText').textContent = meta.text;
    }

    // Refresh panel-specific data
    refreshPanel(panelId);
}

function refreshPanel(panelId) {
    switch (panelId) {
        case 'dashboard': refreshDashboard(); break;
        case 'domains': renderDomainList(); break;
        case 'dns': populateDnsDropdown(); break;
        case 'ssh': loadSSHProfiles(); break;
        case 'google': refreshGoogleServices(); break;
        case 'blogger': renderBlogList(); break;
        case 'sites': populateSitesDropdowns(); break;
        case 'publishing': refreshPublishing(); break;
        case 'nextcloud': loadNextCloudConfig(); break;
    }
}

// ── Clock ─────────────────────────────────────────────────
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('headerClock').textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// ── Toast Notifications ───────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-text">${message}</span>
  `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Modal ─────────────────────────────────────────────────
function openModal(title, bodyHtml, footerHtml = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

// ── Token Visibility Toggle ───────────────────────────────
function toggleTokenVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ── Toggle Switch ─────────────────────────────────────────
function toggleSwitch(el) {
    el.classList.toggle('active');
}

// ── Dashboard ─────────────────────────────────────────────
function refreshDashboard() {
    const totalDomains = Object.values(state.domains).reduce((sum, arr) => sum + arr.length, 0);
    const sshCount = Object.values(state.ssh).filter(s => s.host).length;
    const blogCount = state.blogs.length;
    const intCount = Object.values(state.integrations).filter(i => i.connected).length +
        Object.values(state.googleServices).filter(v => v).length;

    document.getElementById('statDomains').textContent = totalDomains;
    document.getElementById('statSSH').textContent = sshCount;
    document.getElementById('statBlogs').textContent = blogCount;
    document.getElementById('statIntegrations').textContent = intCount;
    document.getElementById('domainCount').textContent = totalDomains;
    document.getElementById('ionosCount').textContent = state.domains.ionos.length;
    document.getElementById('hostingerCount').textContent = state.domains.hostinger.length;
    document.getElementById('cloudflareCount').textContent = state.domains.cloudflare.length;
}

// ── Domain Management ─────────────────────────────────────
function switchDomainProvider(provider) {
    currentProvider = provider;
    document.querySelectorAll('.provider-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.provider === provider);
    });

    const icons = { ionos: '🟦', hostinger: '🟪', cloudflare: '🟧' };
    const names = { ionos: 'Ionos', hostinger: 'Hostinger', cloudflare: 'Cloudflare' };
    document.getElementById('domainProviderTitle').textContent = `${icons[provider]} ${names[provider]} API`;
    document.getElementById('domainTokenLabel').textContent = `${names[provider]} API Token`;
    document.getElementById('providerTokenInput').value = state.tokens[provider] || '';

    renderDomainList();
}

function saveProviderToken() {
    const token = document.getElementById('providerTokenInput').value.trim();
    state.tokens[currentProvider] = token;
    saveState();
    showToast(`${currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)} Token gespeichert`, 'success');
}

function renderDomainList() {
    const domains = state.domains[currentProvider] || [];
    const container = document.getElementById('domainList');
    document.getElementById('activeDomainCount').textContent = `${domains.length} Domains`;

    if (domains.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌐</div>
        <p>Keine Domains bei diesem Provider registriert.</p>
        <button class="btn btn-primary" onclick="openAddDomainModal()">Domain hinzufügen</button>
      </div>`;
        return;
    }

    const icons = { ionos: '🟦', hostinger: '🟪', cloudflare: '🟧' };
    const colors = { ionos: 'rgba(59,130,246,0.15)', hostinger: 'rgba(168,85,247,0.15)', cloudflare: 'rgba(245,158,11,0.15)' };

    container.innerHTML = domains.map(d => `
    <div class="domain-item">
      <div class="domain-favicon" style="background:${colors[currentProvider]}">${icons[currentProvider]}</div>
      <div class="domain-info">
        <div class="domain-name">${d.name}</div>
        <div class="domain-meta">
          <span>Läuft ab: ${d.expires || '—'}</span>
          <span>DNS: ${(d.dns || []).length} Einträge</span>
        </div>
      </div>
      <span class="badge badge-active">${d.status === 'active' ? '● Aktiv' : '○ Inaktiv'}</span>
      <div class="domain-actions" style="margin-left:12px">
        <button class="btn btn-sm btn-icon" title="DNS bearbeiten" onclick="editDomainDns('${d.id}')">🔗</button>
        <button class="btn btn-sm btn-icon btn-danger" title="Entfernen" onclick="removeDomain('${d.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openAddDomainModal() {
    const body = `
    <div class="form-group">
      <label class="form-label">Domain Name</label>
      <input type="text" class="form-input" id="newDomainName" placeholder="z.B. meine-seite.de">
    </div>
    <div class="form-group">
      <label class="form-label">Ablaufdatum</label>
      <input type="date" class="form-input" id="newDomainExpiry">
    </div>
  `;
    const footer = `
    <button class="btn" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="addDomain()">Hinzufügen</button>
  `;
    openModal('Domain hinzufügen', body, footer);
}

function addDomain() {
    const name = document.getElementById('newDomainName').value.trim();
    const expires = document.getElementById('newDomainExpiry').value;
    if (!name) { showToast('Bitte Domain-Name eingeben', 'error'); return; }

    const id = currentProvider[0] + Date.now();
    state.domains[currentProvider].push({ id, name, status: 'active', expires, dns: [] });
    saveState();
    renderDomainList();
    refreshDashboard();
    closeModal();
    showToast(`Domain "${name}" hinzugefügt`, 'success');
}

function removeDomain(domainId) {
    const domains = state.domains[currentProvider];
    const idx = domains.findIndex(d => d.id === domainId);
    if (idx === -1) return;
    const name = domains[idx].name;
    state.domains[currentProvider].splice(idx, 1);
    saveState();
    renderDomainList();
    refreshDashboard();
    showToast(`Domain "${name}" entfernt`, 'info');
}

function editDomainDns(domainId) {
    switchPanel('dns');
    setTimeout(() => {
        const select = document.getElementById('dnsDomainSelect');
        select.value = domainId;
        loadDnsRecords();
    }, 100);
}

// ── DNS Control Center ────────────────────────────────────
function populateDnsDropdown() {
    const select = document.getElementById('dnsDomainSelect');
    const currentVal = select.value;
    select.innerHTML = '<option value="">— Domain wählen —</option>';
    const providerIcons = { ionos: '🟦', hostinger: '🟪', cloudflare: '🟧' };

    for (const [provider, domains] of Object.entries(state.domains)) {
        for (const d of domains) {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${providerIcons[provider]} ${d.name} (${provider})`;
            select.appendChild(opt);
        }
    }

    if (currentVal) select.value = currentVal;
}

function loadDnsRecords() {
    const select = document.getElementById('dnsDomainSelect');
    const domainId = select.value;
    const container = document.getElementById('dnsRecordList');

    if (!domainId) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔗</div>
        <p>Wähle eine Domain aus, um DNS-Einträge zu verwalten</p>
      </div>`;
        return;
    }

    const domain = findDomainById(domainId);
    if (!domain) return;

    const records = domain.dns || [];
    if (records.length === 0) {
        container.innerHTML = `
      <div class="empty-state" style="padding:24px">
        <p>Keine DNS-Einträge vorhanden.</p>
        <button class="btn btn-sm btn-primary" onclick="openAddDnsRecordModal()">Eintrag erstellen</button>
      </div>`;
        return;
    }

    container.innerHTML = records.map((r, i) => `
    <div class="dns-record">
      <span class="dns-type">${r.type}</span>
      <span class="dns-name">${r.name}</span>
      <span class="dns-value" title="${r.value}">${r.value}</span>
      <span class="dns-ttl">${r.ttl || '3600'}</span>
      <button class="btn btn-sm btn-icon btn-danger" onclick="removeDnsRecord(${i})">🗑️</button>
    </div>
  `).join('');
}

function findDomainById(id) {
    for (const domains of Object.values(state.domains)) {
        const found = domains.find(d => d.id === id);
        if (found) return found;
    }
    return null;
}

function findDomainProviderById(id) {
    for (const [provider, domains] of Object.entries(state.domains)) {
        if (domains.find(d => d.id === id)) return provider;
    }
    return null;
}

function openAddDnsRecordModal() {
    const body = `
    <div class="form-group">
      <label class="form-label">Record-Typ</label>
      <select class="form-select" id="newDnsType">
        <option value="A">A</option>
        <option value="AAAA">AAAA</option>
        <option value="CNAME">CNAME</option>
        <option value="MX">MX</option>
        <option value="TXT">TXT</option>
        <option value="NS">NS</option>
        <option value="SRV">SRV</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Name / Host</label>
      <input type="text" class="form-input" id="newDnsName" placeholder="@ oder subdomain">
    </div>
    <div class="form-group">
      <label class="form-label">Wert / Ziel</label>
      <input type="text" class="form-input" id="newDnsValue" placeholder="IP-Adresse oder Ziel-Host">
    </div>
    <div class="form-group">
      <label class="form-label">TTL (Sekunden)</label>
      <input type="text" class="form-input" id="newDnsTtl" value="3600">
    </div>
  `;
    const footer = `
    <button class="btn" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="addDnsRecord()">Hinzufügen</button>
  `;
    openModal('DNS-Eintrag hinzufügen', body, footer);
}

function addDnsRecord() {
    const domainId = document.getElementById('dnsDomainSelect').value;
    if (!domainId) { showToast('Bitte zuerst eine Domain auswählen', 'error'); return; }

    const type = document.getElementById('newDnsType').value;
    const name = document.getElementById('newDnsName').value.trim();
    const value = document.getElementById('newDnsValue').value.trim();
    const ttl = document.getElementById('newDnsTtl').value.trim() || '3600';

    if (!name || !value) { showToast('Name und Wert sind erforderlich', 'error'); return; }

    const domain = findDomainById(domainId);
    if (!domain) return;

    if (!domain.dns) domain.dns = [];
    domain.dns.push({ type, name, value, ttl });
    saveState();
    loadDnsRecords();
    closeModal();
    showToast(`DNS ${type} Eintrag hinzugefügt`, 'success');
}

function removeDnsRecord(index) {
    const domainId = document.getElementById('dnsDomainSelect').value;
    const domain = findDomainById(domainId);
    if (!domain || !domain.dns) return;
    domain.dns.splice(index, 1);
    saveState();
    loadDnsRecords();
    showToast('DNS-Eintrag entfernt', 'info');
}

// ── SSH & Server ──────────────────────────────────────────
function loadSSHProfiles() {
    const profiles = ['startup', 'business', 'kvm4', 'kvm8'];
    profiles.forEach(profile => {
        const data = state.ssh[profile] || {};
        const prefix = profile === 'startup' || profile === 'business' ? `ssh${capitalize(profile)}` : `ssh${profile.charAt(0).toUpperCase() + profile.slice(1)}`;

        const hostEl = document.getElementById(`${prefix}Host`);
        const portEl = document.getElementById(`${prefix}Port`);
        const userEl = document.getElementById(`${prefix}User`);

        if (hostEl) hostEl.value = data.host || '';
        if (portEl) portEl.value = data.port || '22';
        if (userEl) userEl.value = data.user || '';

        if (profile === 'startup' || profile === 'business') {
            const passEl = document.getElementById(`${prefix}Pass`);
            if (passEl) passEl.value = data.pass || '';
        } else {
            const n8nEl = document.getElementById(`${prefix}N8n`);
            if (n8nEl) n8nEl.value = data.n8n || '';
        }

        // Update status
        const statusId = profile === 'startup' ? 'sshStartupStatus' :
            profile === 'business' ? 'sshBusinessStatus' :
                profile === 'kvm4' ? 'sshKvm4Status' : 'sshKvm8Status';
        const statusEl = document.getElementById(statusId);
        if (statusEl) {
            if (data.host) {
                statusEl.textContent = 'Konfiguriert';
                statusEl.className = 'badge badge-active';
            } else {
                statusEl.textContent = 'Getrennt';
                statusEl.className = 'badge badge-warning';
            }
        }
    });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function saveSSHProfile(profile) {
    const prefix = profile === 'startup' || profile === 'business' ? `ssh${capitalize(profile)}` : `ssh${profile.charAt(0).toUpperCase() + profile.slice(1)}`;

    state.ssh[profile] = {
        host: document.getElementById(`${prefix}Host`)?.value || '',
        port: document.getElementById(`${prefix}Port`)?.value || '22',
        user: document.getElementById(`${prefix}User`)?.value || '',
    };

    if (profile === 'startup' || profile === 'business') {
        state.ssh[profile].pass = document.getElementById(`${prefix}Pass`)?.value || '';
    } else {
        state.ssh[profile].n8n = document.getElementById(`${prefix}N8n`)?.value || '';
    }

    saveState();
    loadSSHProfiles();
    showToast(`SSH-Profil "${profile}" gespeichert`, 'success');
}

function copySSHCommand(profile) {
    const data = state.ssh[profile];
    if (!data.host) {
        showToast('Bitte zuerst Host konfigurieren', 'error');
        return;
    }
    const port = data.port !== '22' ? ` -p ${data.port}` : '';
    const cmd = `ssh ${data.user || 'root'}@${data.host}${port}`;
    navigator.clipboard.writeText(cmd).then(() => {
        showToast(`SSH Befehl kopiert: ${cmd}`, 'success');
    }).catch(() => {
        showToast(`SSH Befehl: ${cmd}`, 'info');
    });
}

function openN8nPanel(profile) {
    const data = state.ssh[profile];
    if (data.n8n) {
        window.open(data.n8n, '_blank');
    } else {
        showToast('Bitte zuerst n8n URL konfigurieren', 'error');
    }
}

// ── Google API & Services ─────────────────────────────────
function saveGoogleToken() {
    state.tokens.google = document.getElementById('googleApiToken').value.trim();
    saveState();
    showToast('Google API Token gespeichert', 'success');
}

function saveGoogleServiceAccount() {
    state.tokens.googleServiceAccount = document.getElementById('googleServiceAccount').value.trim();
    saveState();
    showToast('Service Account gespeichert', 'success');
}

function toggleGoogleService(service) {
    state.googleServices[service] = !state.googleServices[service];
    saveState();
    refreshGoogleServices();

    const name = service.charAt(0).toUpperCase() + service.slice(1);
    if (state.googleServices[service]) {
        showToast(`${name} verbunden`, 'success');
    } else {
        showToast(`${name} getrennt`, 'info');
    }
}

function refreshGoogleServices() {
    document.getElementById('googleApiToken').value = state.tokens.google || '';
    document.getElementById('googleServiceAccount').value = state.tokens.googleServiceAccount || '';

    const services = ['blogger', 'drive', 'sites', 'adsense', 'search', 'analytics'];
    services.forEach(svc => {
        const card = document.getElementById(`svc-${svc}`);
        const status = document.getElementById(`svc${capitalize(svc)}Status`);
        const connected = state.googleServices[svc];

        if (card) card.classList.toggle('connected', connected);
        if (status) {
            status.textContent = connected ? '● Verbunden' : 'Nicht verbunden';
            status.className = connected ? 'badge badge-active' : 'badge badge-warning';
        }
    });
}

// ── Blogger ───────────────────────────────────────────────
function renderBlogList() {
    const container = document.getElementById('blogList');
    const blogs = state.blogs;

    if (blogs.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Noch keine Blogs registriert. Füge einen Blog hinzu oder verbinde die Blogger API.</p>
        <button class="btn btn-primary" onclick="openAddBlogModal()">Ersten Blog hinzufügen</button>
      </div>`;
        return;
    }

    container.innerHTML = blogs.map((blog, i) => `
    <div class="blog-item">
      <div class="blog-thumb">${blog.icon || '📝'}</div>
      <div class="blog-info">
        <div class="blog-title">${blog.name}</div>
        <div class="blog-url">${blog.url}</div>
      </div>
      <span class="badge ${blog.published ? 'badge-active' : 'badge-info'}">${blog.published ? 'Veröffentlicht' : 'Entwurf'}</span>
      <div class="blog-actions">
        <button class="btn btn-sm btn-icon" title="Öffnen" onclick="window.open('${blog.url}','_blank')">🔗</button>
        <button class="btn btn-sm btn-icon" title="Seite veröffentlichen" onclick="openPublishPageForBlog(${i})">📄</button>
        <button class="btn btn-sm btn-icon btn-danger" title="Entfernen" onclick="removeBlog(${i})">🗑️</button>
      </div>
    </div>
  `).join('');

    renderPageList();
}

function renderPageList() {
    const container = document.getElementById('pageList');
    const pages = state.pages;

    if (pages.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p>Hier kannst du index.html Seiten unter deinen Blogs veröffentlichen.</p>
      </div>`;
        return;
    }

    container.innerHTML = pages.map((page, i) => `
    <div class="blog-item">
      <div class="blog-thumb" style="background:var(--grad-warm);font-size:18px">📄</div>
      <div class="blog-info">
        <div class="blog-title">${page.title}</div>
        <div class="blog-url">${page.blogName} — ${page.date}</div>
      </div>
      <span class="badge badge-active">Live</span>
      <div class="blog-actions">
        <button class="btn btn-sm btn-icon btn-danger" onclick="removePage(${i})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openAddBlogModal() {
    const body = `
    <div class="form-group">
      <label class="form-label">Blog Name</label>
      <input type="text" class="form-input" id="newBlogName" placeholder="Mein Blog">
    </div>
    <div class="form-group">
      <label class="form-label">Blog URL (Blogspot)</label>
      <input type="text" class="form-input" id="newBlogUrl" placeholder="https://mein-blog.blogspot.com">
    </div>
    <div class="form-group">
      <label class="form-label">Blog ID (optional)</label>
      <input type="text" class="form-input" id="newBlogId" placeholder="Blogger API Blog-ID">
    </div>
    <div class="form-group">
      <label class="form-label">Status</label>
      <select class="form-select" id="newBlogPublished">
        <option value="true">Veröffentlicht</option>
        <option value="false">Entwurf / Persönlich</option>
      </select>
    </div>
  `;
    const footer = `
    <button class="btn" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="addBlog()">Blog hinzufügen</button>
  `;
    openModal('Blog hinzufügen', body, footer);
}

function addBlog() {
    const name = document.getElementById('newBlogName').value.trim();
    const url = document.getElementById('newBlogUrl').value.trim();
    const blogId = document.getElementById('newBlogId').value.trim();
    const published = document.getElementById('newBlogPublished').value === 'true';

    if (!name || !url) { showToast('Name und URL sind erforderlich', 'error'); return; }

    state.blogs.push({ name, url, blogId, published, icon: '📝' });
    saveState();
    renderBlogList();
    closeModal();
    showToast(`Blog "${name}" hinzugefügt`, 'success');
}

function removeBlog(index) {
    const name = state.blogs[index].name;
    state.blogs.splice(index, 1);
    saveState();
    renderBlogList();
    showToast(`Blog "${name}" entfernt`, 'info');
}

function openPublishPageModal() {
    if (state.blogs.length === 0) {
        showToast('Bitte zuerst einen Blog hinzufügen', 'error');
        return;
    }
    const blogOptions = state.blogs.map((b, i) => `<option value="${i}">${b.name}</option>`).join('');
    const body = `
    <div class="form-group">
      <label class="form-label">Blog auswählen</label>
      <select class="form-select" id="publishBlogSelect">${blogOptions}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Seiten-Titel</label>
      <input type="text" class="form-input" id="publishPageTitle" placeholder="z.B. Startseite">
    </div>
    <div class="form-group">
      <label class="form-label">HTML Inhalt / Dateiname</label>
      <textarea class="form-textarea" id="publishPageHtml" placeholder="&lt;html&gt;...&lt;/html&gt; oder index.html"></textarea>
    </div>
  `;
    const footer = `
    <button class="btn" onclick="closeModal()">Abbrechen</button>
    <button class="btn btn-primary" onclick="publishPage()">📄 Seite veröffentlichen</button>
  `;
    openModal('Seite veröffentlichen', body, footer);
}

function openPublishPageForBlog(blogIndex) {
    openPublishPageModal();
    setTimeout(() => {
        const select = document.getElementById('publishBlogSelect');
        if (select) select.value = blogIndex;
    }, 100);
}

function publishPage() {
    const blogIdx = document.getElementById('publishBlogSelect').value;
    const title = document.getElementById('publishPageTitle').value.trim();
    const html = document.getElementById('publishPageHtml').value.trim();

    if (!title) { showToast('Bitte Seiten-Titel eingeben', 'error'); return; }

    const blog = state.blogs[blogIdx];
    const now = new Date().toLocaleDateString('de-DE');
    state.pages.push({
        title,
        blogName: blog.name,
        blogUrl: blog.url,
        html: html || '<html><body><h1>' + title + '</h1></body></html>',
        date: now
    });
    saveState();
    renderBlogList();
    closeModal();
    showToast(`Seite "${title}" veröffentlicht`, 'success');
}

function removePage(index) {
    state.pages.splice(index, 1);
    saveState();
    renderPageList();
    showToast('Seite entfernt', 'info');
}

// ── Google Sites ──────────────────────────────────────────
function populateSitesDropdowns() {
    // Populate hostinger domain dropdown
    const select = document.getElementById('sitesHostingerDomain');
    select.innerHTML = '<option value="">— Domain wählen —</option>';
    for (const [provider, domains] of Object.entries(state.domains)) {
        for (const d of domains) {
            const opt = document.createElement('option');
            opt.value = d.name;
            opt.textContent = `${d.name} (${provider})`;
            select.appendChild(opt);
        }
    }

    // Load saved values
    const cfg = state.sitesConfig;
    document.getElementById('googleSitesUrl').value = cfg.url || '';
    document.getElementById('sitesHostingerDomain').value = cfg.domain || '';
    document.getElementById('sitesDnsPrefix').value = cfg.dnsPrefix || '';
    document.getElementById('sitesDnsType').value = cfg.dnsType || 'CNAME';
    document.getElementById('sitesDnsTarget').value = cfg.dnsTarget || 'ghs.googlehosted.com';

    // Highlight selected template
    document.querySelectorAll('.template-card').forEach(card => card.classList.remove('selected'));
    if (cfg.template) {
        const cards = document.querySelectorAll('.template-card');
        // Template detection via onclick attribute
    }
}

function selectTemplate(el, templateId) {
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    state.sitesConfig.template = templateId;
    saveState();
    showToast(`Vorlage "${templateId}" ausgewählt`, 'success');
}

function saveSitesUrl() {
    state.sitesConfig.url = document.getElementById('googleSitesUrl').value.trim();
    saveState();
    showToast('Google Sites URL gespeichert', 'success');
}

function bindSitesDomain() {
    const domain = document.getElementById('sitesHostingerDomain').value;
    const prefix = document.getElementById('sitesDnsPrefix').value.trim();
    const type = document.getElementById('sitesDnsType').value;
    const target = document.getElementById('sitesDnsTarget').value.trim();

    if (!domain) { showToast('Bitte eine Domain auswählen', 'error'); return; }

    state.sitesConfig.domain = domain;
    state.sitesConfig.dnsPrefix = prefix;
    state.sitesConfig.dnsType = type;
    state.sitesConfig.dnsTarget = target;

    // Auto-create DNS record on the domain
    for (const domains of Object.values(state.domains)) {
        const found = domains.find(d => d.name === domain);
        if (found) {
            if (!found.dns) found.dns = [];
            // Check if record already exists
            const exists = found.dns.find(r => r.type === type && r.name === (prefix || '@'));
            if (!exists) {
                found.dns.push({
                    type,
                    name: prefix || '@',
                    value: target,
                    ttl: '3600'
                });
            }
            break;
        }
    }

    saveState();
    showToast(`Domain "${prefix ? prefix + '.' : ''}${domain}" mit Google Sites verbunden`, 'success');
}

// ── Publishing Panel ──────────────────────────────────────
function refreshPublishing() {
    // Cloudflare
    document.getElementById('cloudflareToken').value = state.tokens.cloudflare || '';
    const cfCdn = document.getElementById('cfCdnToggle');
    const cfSsl = document.getElementById('cfSslToggle');
    if (state.integrations.cloudflare.cdnEnabled) cfCdn.classList.add('active');
    else cfCdn.classList.remove('active');
    if (state.integrations.cloudflare.sslEnabled) cfSsl.classList.add('active');
    else cfSsl.classList.remove('active');

    // CF status
    updateBadgeStatus('cfStatus', state.integrations.cloudflare.connected);

    // GitHub
    document.getElementById('githubToken').value = state.tokens.github || '';
    document.getElementById('ghRepo').value = state.integrations.github.repo || '';
    document.getElementById('ghBranch').value = state.integrations.github.branch || 'main';
    const ghPreview = document.getElementById('ghPreviewToggle');
    if (state.integrations.github.preview) ghPreview.classList.add('active');
    else ghPreview.classList.remove('active');
    updateBadgeStatus('ghStatus', state.integrations.github.connected);

    // AdSense
    document.getElementById('adsenseId').value = state.integrations.adsense.publisherId || '';
    const adsAutoAds = document.getElementById('adsenseAutoAds');
    if (state.integrations.adsense.autoAds) adsAutoAds.classList.add('active');
    else adsAutoAds.classList.remove('active');
    updateBadgeStatus('adsenseStatus', state.integrations.adsense.connected);

    // Drive
    document.getElementById('driveFolderId').value = state.integrations.drive.folderId || '';
    document.getElementById('driveSyncMode').value = state.integrations.drive.syncMode || 'manual';
    const driveHtml = document.getElementById('driveHtmlSync');
    if (state.integrations.drive.htmlSync) driveHtml.classList.add('active');
    else driveHtml.classList.remove('active');
    updateBadgeStatus('driveStatus', state.integrations.drive.connected);

    // Populate CF domain dropdown
    const cfSelect = document.getElementById('cfZoneDomain');
    cfSelect.innerHTML = '<option value="">— Domain wählen —</option>';
    for (const [provider, domains] of Object.entries(state.domains)) {
        for (const d of domains) {
            const opt = document.createElement('option');
            opt.value = d.name;
            opt.textContent = `${d.name} (${provider})`;
            cfSelect.appendChild(opt);
        }
    }

    // Populate AdSense domain select
    const adsSelect = document.getElementById('adsenseDomain');
    adsSelect.innerHTML = '';
    for (const [provider, domains] of Object.entries(state.domains)) {
        for (const d of domains) {
            const opt = document.createElement('option');
            opt.value = d.name;
            opt.textContent = `${d.name} (${provider})`;
            adsSelect.appendChild(opt);
        }
    }
}

function updateBadgeStatus(elementId, connected) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = connected ? '● Verbunden' : 'Nicht verbunden';
    el.className = connected ? 'badge badge-active' : 'badge badge-warning';
}

function saveCloudflareConfig() {
    state.tokens.cloudflare = document.getElementById('cloudflareToken').value.trim();
    state.integrations.cloudflare.connected = !!state.tokens.cloudflare;
    state.integrations.cloudflare.cdnEnabled = document.getElementById('cfCdnToggle').classList.contains('active');
    state.integrations.cloudflare.sslEnabled = document.getElementById('cfSslToggle').classList.contains('active');
    saveState();
    refreshPublishing();
    showToast('Cloudflare Konfiguration gespeichert', 'success');
}

function saveGithubConfig() {
    state.tokens.github = document.getElementById('githubToken').value.trim();
    state.integrations.github.connected = !!state.tokens.github;
    state.integrations.github.repo = document.getElementById('ghRepo').value.trim();
    state.integrations.github.branch = document.getElementById('ghBranch').value;
    state.integrations.github.preview = document.getElementById('ghPreviewToggle').classList.contains('active');
    saveState();
    refreshPublishing();
    showToast('GitHub Konfiguration gespeichert', 'success');
}

function saveAdsenseConfig() {
    state.integrations.adsense.publisherId = document.getElementById('adsenseId').value.trim();
    state.integrations.adsense.connected = !!state.integrations.adsense.publisherId;
    state.integrations.adsense.autoAds = document.getElementById('adsenseAutoAds').classList.contains('active');
    saveState();
    refreshPublishing();
    showToast('AdSense Konfiguration gespeichert', 'success');
}

function saveDriveConfig() {
    state.integrations.drive.folderId = document.getElementById('driveFolderId').value.trim();
    state.integrations.drive.connected = !!state.integrations.drive.folderId;
    state.integrations.drive.syncMode = document.getElementById('driveSyncMode').value;
    state.integrations.drive.htmlSync = document.getElementById('driveHtmlSync').classList.contains('active');
    saveState();
    refreshPublishing();
    showToast('Google Drive Konfiguration gespeichert', 'success');
}

// ── NextCloud ─────────────────────────────────────────────
function loadNextCloudConfig() {
    const nc = state.integrations.nextcloud;
    document.getElementById('ncUrl').value = nc.url || '';
    document.getElementById('ncUser').value = nc.user || '';
    document.getElementById('ncToken').value = state.tokens.nextcloud || '';
    document.getElementById('ncSyncDir').value = nc.syncDir || '';
    updateBadgeStatus('ncStatus', nc.connected);

    const srv = state.ncServer || {};
    document.getElementById('ncServerHost').value = srv.host || '';
    document.getElementById('ncServerPort').value = srv.port || '22';
    document.getElementById('ncServerUser').value = srv.user || '';
    document.getElementById('ncServerOs').value = srv.os || 'ubuntu';
}

function saveNextCloudConfig() {
    state.integrations.nextcloud.url = document.getElementById('ncUrl').value.trim();
    state.integrations.nextcloud.user = document.getElementById('ncUser').value.trim();
    state.tokens.nextcloud = document.getElementById('ncToken').value.trim();
    state.integrations.nextcloud.syncDir = document.getElementById('ncSyncDir').value.trim();
    state.integrations.nextcloud.connected = !!(state.integrations.nextcloud.url && state.tokens.nextcloud);
    saveState();
    loadNextCloudConfig();
    showToast('NextCloud Konfiguration gespeichert', 'success');
}

function saveNCServer() {
    state.ncServer = {
        host: document.getElementById('ncServerHost').value.trim(),
        port: document.getElementById('ncServerPort').value.trim() || '22',
        user: document.getElementById('ncServerUser').value.trim(),
        os: document.getElementById('ncServerOs').value
    };
    saveState();
    showToast('Server-Details gespeichert', 'success');
}

// ── Sidebar Navigation Binding ────────────────────────────
document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
    item.addEventListener('click', () => {
        switchPanel(item.dataset.panel);
    });
});

// ── Keyboard Shortcuts ────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.key === 'Escape') closeModal();

    // Alt+1..9 to switch panels
    if (e.altKey) {
        const panels = ['dashboard', 'domains', 'dns', 'ssh', 'google', 'blogger', 'sites', 'publishing', 'nextcloud'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= panels.length) {
            e.preventDefault();
            switchPanel(panels[num - 1]);
        }
    }
});

// ── Initialize ────────────────────────────────────────────
function init() {
    refreshDashboard();
    renderDomainList();
    loadSSHProfiles();
    refreshGoogleServices();
    renderBlogList();
}

init();

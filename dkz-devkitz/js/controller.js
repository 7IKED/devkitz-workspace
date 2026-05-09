import { SmartEditor } from './features/editor/smart.js';
import { ExtendedEditor } from './features/editor/extended.js';
import { Store } from './data/store.js';
import { settings } from './core/settings.js';
import { bus } from './core/event-bus.js';
import { EVENTS } from './core/config.js';
import { Renderer } from './ui/renderer.js';
import { ExportEngine } from './features/export.js';
import { DriveSync } from './services/sync.js';

/**
 * Core Logic Controller
 * Connects UI events to Data/Editor logic.
 */
class Controller {
    constructor() {
        this.currentEditor = null;
        this.currentProjectId = null;

        // Listeners
        bus.on(EVENTS.APP_INIT, () => this.init());
        bus.on(EVENTS.NAVIGATE, (route) => this.handleRoute(route));
        bus.on('editor:save', () => this.saveProject());
        bus.on('project:new', () => this.createProject());

        // New Listeners
        bus.on('editor:export', () => this.handleExport());
        bus.on('drive:connect', () => this.handleDriveConnect());
    }

    async init() {
        await Store.init();
        await DriveSync.init();
        this.loadDashboard();
    }

    handleRoute(route) {
        if (route === 'dashboard') {
            this.loadDashboard();
        } else if (route.startsWith('editor')) {
            // Check for ID in hash (e.g. #editor?id=123)
            const parts = window.location.hash.split('?');
            if (parts.length > 1) {
                const urlParams = new URLSearchParams(parts[1]);
                const id = urlParams.get('id');
                if (id) {
                    this.openEditor(id);
                }
            } else {
                // Determine if we should clear editor or redirect
            }
        }
    }

    async loadDashboard() {
        const list = document.getElementById('project-list');
        Renderer.clear(list);

        const projects = await Store.getProjects();
        if (projects.length === 0) {
            list.innerHTML = '<p class="text-muted">No projects yet. Click + New to start.</p>';
            return;
        }

        projects.forEach(p => {
            const card = Renderer.projectCard(p);
            list.appendChild(card);
        });
    }

    async createProject() {
        const p = await Store.createProject('Untitled Project');
        this.openEditor(p.id);
    }

    async openEditor(id) {
        this.currentProjectId = id;
        const project = await Store.getProject(id);
        if (!project) return;

        // Set Title
        const titleInput = document.getElementById('project-title');
        if (titleInput) titleInput.value = project.title;

        // Init Editor based on Mode
        const mode = settings.get('editorMode');
        const containerId = 'editor-container';

        if (this.currentEditor) this.currentEditor.unmount(); // cleanup

        if (mode === 'extended') {
            this.currentEditor = new ExtendedEditor(containerId);
        } else {
            this.currentEditor = new SmartEditor(containerId);
        }

        this.currentEditor.setContent(project.content || '');
        this.currentEditor.mount();

        // Navigate url update handled by logic calling this event usually, but here we enforce
        bus.emit(EVENTS.NAVIGATE, 'editor');
    }

    async saveProject() {
        if (!this.currentProjectId || !this.currentEditor) return;

        const project = await Store.getProject(this.currentProjectId);
        project.content = this.currentEditor.getContent();
        project.title = document.getElementById('project-title').value || 'Untitled';

        await Store.updateProject(project);
        console.log('Project Saved');

        // Simple toast using native alert for now or implement a toast renderer
        bus.emit(EVENTS.NOTIFY, { type: 'success', message: 'Saved!' });
    }

    async handleExport() {
        if (!this.currentProjectId || !this.currentEditor) return;

        // Sync content
        const content = this.currentEditor.getContent();
        const project = await Store.getProject(this.currentProjectId);
        project.content = content;

        // Default export to Markdown for Smart, HTML for Extended for V1
        const mode = settings.get('editorMode');
        const format = mode === 'extended' ? 'html' : 'md';

        ExportEngine.export(project, format);
    }

    async handleDriveConnect() {
        const clientIdInput = document.getElementById('drive-client-id');
        const clientId = clientIdInput ? clientIdInput.value : '';

        if (!clientId) {
            alert('Please enter a Client ID');
            return;
        }

        await DriveSync.connect(clientId, 'mock-key');
        const btn = document.getElementById('btn-connect-drive');
        if (btn) {
            btn.textContent = 'Connected ✅';
            btn.disabled = true;
        }
    }
}

// Start Controller
const controller = new Controller();
export default controller;

import { DB } from './db.js';
import { Models } from './models.js';
import { bus } from '../core/event-bus.js';
import { EVENTS } from '../core/config.js';

/**
 * Main Data Store
 * Abstraction layer over DB for App Logic.
 */
export const Store = {
    async init() {
        await DB.open();
    },

    /**
     * Create and save a new project
     * @param {string} title 
     */
    async createProject(title) {
        const project = Models.createProject(title);
        await DB.put('projects', project);
        bus.emit(EVENTS.PROJECT_SAVE, project);
        return project;
    },

    /**
     * Update an existing project
     * @param {object} project 
     */
    async updateProject(project) {
        project.updated = new Date().toISOString();
        await DB.put('projects', project);
        bus.emit(EVENTS.PROJECT_SAVE, project);
        return project;
    },

    /**
     * Get all projects
     */
    async getProjects() {
        return await DB.getAll('projects');
    },

    /**
     * Get a single project
     * @param {string} id 
     */
    async getProject(id) {
        return await DB.get('projects', id);
    },

    /**
     * Delete a project
     * @param {string} id 
     */
    async deleteProject(id) {
        await DB.delete('projects', id);
        // Maybe emit delete event?
    }
};

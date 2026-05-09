/**
 * Data Models
 * Factory functions to create consistent data objects.
 */

export const Models = {
    /**
     * Create a new Project
     * @param {string} title 
     */
    createProject(title = 'New Project') {
        const now = new Date().toISOString();
        return {
            id: crypto.randomUUID(),
            title,
            description: '',
            content: '', // Markdown or HTML depending on mode
            mode: 'smart', // 'smart' | 'extended'
            status: 'draft',
            created: now,
            updated: now,
            tags: [],
            version: '1.0.0'
        };
    },

    /**
     * Create an Export Record
     * @param {string} projectId 
     * @param {string} format 'pdf' | 'md' | 'html'
     */
    createExport(projectId, format) {
        return {
            projectId,
            format,
            date: new Date().toISOString()
        };
    }
};

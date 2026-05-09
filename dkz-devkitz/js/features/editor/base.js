/**
 * Abstract Editor Class
 * Interface for different editor modes.
 */
export class Editor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.content = '';
    }

    /**
     * Mount the editor into the DOM
     */
    mount() {
        throw new Error('Method "mount" must be implemented');
    }

    /**
     * Unmount/Cleanup
     */
    unmount() {
        this.container.innerHTML = '';
    }

    /**
     * Set content
     * @param {string} content 
     */
    setContent(content) {
        this.content = content;
    }

    /**
     * Get content
     * @returns {string}
     */
    getContent() {
        return this.content;
    }

    /**
     * Focus the editor
     */
    focus() {
        // Optional
    }
}

import { bus } from '../core/event-bus.js';

/**
 * UI Renderer Helper
 * Functional DOM manipulation utilities.
 */
export const Renderer = {
    /**
     * Create an HTML element with attributes/children
     * @param {string} tag 
     * @param {object} attrs 
     * @param {string|Array} children 
     */
    h(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);

        // Set attributes
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') el.className = val;
            else if (key.startsWith('data-')) el.setAttribute(key, val);
            else if (key === 'onclick') el.addEventListener('click', val);
            else el[key] = val;
        });

        // Append children
        if (typeof children === 'string') {
            el.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (child instanceof Node) el.appendChild(child);
                else if (child) el.appendChild(document.createTextNode(String(child)));
            });
        }

        return el;
    },

    /**
     * Clear an element
     * @param {HTMLElement} el 
     */
    clear(el) {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
    },

    /**
     * Render a Project Card
     * @param {object} project 
     */
    projectCard(project) {
        return this.h('div', { className: 'card project-card' }, [
            this.h('h3', {}, project.title),
            this.h('p', { className: 'text-muted text-sm' }, `Last updated: ${new Date(project.updated).toLocaleDateString()}`),
            this.h('div', { className: 'flex justify-between mt-md' }, [
                this.h('span', { className: 'badge' }, project.status),
                this.h('button', {
                    className: 'btn btn-sm btn-ghost',
                    onclick: () => bus.emit('nav:go', `editor?id=${project.id}`)
                }, 'Open')
            ])
        ]);
    }
};

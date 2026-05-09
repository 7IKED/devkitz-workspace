import { Editor } from './base.js';

/**
 * Smart Editor (Markdown)
 * Simple Textarea with basic features.
 */
export class SmartEditor extends Editor {
    mount() {
        this.container.innerHTML = '';

        // Create Textarea
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'editor-textarea';
        this.textarea.placeholder = '# Start writing markdown...';
        this.textarea.value = this.content;

        // Add basic styles directly for now (should be in CSS)
        this.textarea.style.width = '100%';
        this.textarea.style.height = '100%';
        this.textarea.style.minHeight = '60vh';
        this.textarea.style.padding = '1rem';
        this.textarea.style.fontFamily = 'monospace';
        this.textarea.style.border = 'none';
        this.textarea.style.outline = 'none';
        this.textarea.style.resize = 'none';
        this.textarea.style.background = 'var(--bg-card)';
        this.textarea.style.color = 'var(--text-main)';

        // Event Listeners
        this.textarea.addEventListener('input', (e) => {
            this.content = e.target.value;
            // Optionally trigger auto-save or preview update here
        });

        this.container.appendChild(this.textarea);
    }

    setContent(content) {
        super.setContent(content);
        if (this.textarea) {
            this.textarea.value = content;
        }
    }

    focus() {
        if (this.textarea) this.textarea.focus();
    }
}

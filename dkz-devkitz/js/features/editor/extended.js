import { Editor } from './base.js';

/**
 * Extended Editor (WYSIWYG)
 * ContentEditable div with basic toolbar.
 */
export class ExtendedEditor extends Editor {
    mount() {
        this.container.innerHTML = '';

        // 1. Create Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar flex gap-sm mb-sm';
        toolbar.style.padding = '0.5rem';
        toolbar.style.background = 'var(--bg-card)';
        toolbar.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

        const tools = [
            { icon: 'B', cmd: 'bold' },
            { icon: 'I', cmd: 'italic' },
            { icon: 'U', cmd: 'underline' },
            { icon: 'H1', cmd: 'formatBlock', arg: 'H1' },
            { icon: 'H2', cmd: 'formatBlock', arg: 'H2' },
            { icon: 'List', cmd: 'insertUnorderedList' }
        ];

        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.textContent = tool.icon;
            btn.className = 'btn btn-sm btn-ghost';
            btn.onclick = (e) => {
                e.preventDefault();
                document.execCommand(tool.cmd, false, tool.arg || null);
                this.updateContent();
            };
            toolbar.appendChild(btn);
        });

        // 2. Create Editable Area
        this.editable = document.createElement('div');
        this.editable.className = 'editor-content';
        this.editable.contentEditable = true;
        this.editable.innerHTML = this.content || '<p><br></p>';

        // Styling
        this.editable.style.minHeight = '60vh';
        this.editable.style.outline = 'none';
        this.editable.style.padding = '1rem';
        this.editable.style.lineHeight = '1.6';

        // 3. Events
        this.editable.addEventListener('input', () => this.updateContent());
        this.editable.addEventListener('blur', () => this.updateContent());

        // Append
        this.container.appendChild(toolbar);
        this.container.appendChild(this.editable);
    }

    updateContent() {
        this.content = this.editable.innerHTML;
        // Notify change if needed
    }

    setContent(content) {
        super.setContent(content);
        if (this.editable) {
            this.editable.innerHTML = content;
        }
    }

    focus() {
        if (this.editable) this.editable.focus();
    }
}

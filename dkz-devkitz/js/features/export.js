/**
 * Export Engine
 * Handles file generation and downloading.
 */
export const ExportEngine = {
    /**
     * Export Project
     * @param {object} project 
     * @param {string} format 'md' | 'html' | 'pdf'
     */
    export(project, format) {
        const filename = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;

        switch (format) {
            case 'md':
                this.downloadFile(`${filename}.md`, project.content, 'text/markdown');
                break;
            case 'html':
                const html = `<html><body>${project.content}</body></html>`; // Basic wrapper
                this.downloadFile(`${filename}.html`, html, 'text/html');
                break;
            case 'pdf':
                this.printToPdf(project);
                break;
        }
    },

    /**
     * Trigger browser download
     */
    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Print to PDF via Browser API
     */
    printToPdf(project) {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>${project.title}</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <h1>${project.title}</h1>
                    ${project.content} <!-- Assumes content is accessible HTML/Text -->
                </body>
            </html>
        `);
        win.document.close();
        win.focus();
        // Give time for styles to parse (optional)
        setTimeout(() => win.print(), 500);
    }
};

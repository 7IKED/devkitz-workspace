const fs = require('fs');
const path = require('path');

const licenseText = `MIT License

Copyright (c) 2026 DkZ Ecosystem / AntiCrav

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const installText = (modName) => `# Installation & Usage: ${modName}

This module is a core component of the DkZ Ecosystem.

## Setup
1. Ensure the overarching \`api-server.js\` is running at the port \`3040\`.
2. Do not run this module standalone, it requires the local Node server to perform actions like Git Sync and Data Processing safely.
3. Once the server is online, you can open the \`index.html\` found in this specific module directory or navigate to it via the central BAZE Hub Dashboard.

## Dependencies
- React (Loaded via CDN)
- Tailwind CSS (Loaded via CDN)
- Local API NodeJS Server (Port 3040)
`;

const readmeText = (modName) => `# DkZ Ecosystem Module: ${modName}

Welcome to the ${modName} module.

## Core Features
- Adheres to DkZ visual brand guidelines (Dark Glassmorphism).
- Integrated UI-level Git automated sync (\`/api/sync\`).
- Process driven by the central \`api-server.js\` without relying on Puter.js integrations.

## Architecture
See the main ecosystem documentation for overarching implementation details.
`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    let hasHtml = false;

    // Check if this directory is a module (has index.html)
    if (files.includes('index.html') && dir !== path.join(__dirname, 'dashboard', 'hub')) {
        const modName = path.basename(dir);
        fs.writeFileSync(path.join(dir, 'LICENSE'), licenseText);
        fs.writeFileSync(path.join(dir, 'INSTALL.md'), installText(modName));
        fs.writeFileSync(path.join(dir, 'README.md'), readmeText(modName));
        console.log('Generated metadata for module:', modName);
    }

    files.forEach(f => {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory() && f !== 'node_modules' && f !== '.git') {
            processDir(fullPath);
        }
    });
}

processDir(__dirname);
console.log('Full recursive metadata generation complete.');

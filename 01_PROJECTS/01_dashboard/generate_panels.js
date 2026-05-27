const fs = require('fs');
const path = require('path');

const generatePanelHTML = (moduleName, color) => `<!-- 
=============================================================================
DKZ ECOSYSTEM - VIVALDI PANEL
MODULE: ${moduleName.toUpperCase()}
=============================================================================
-->
<!DOCTYPE html>
<html lang="de" class="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${moduleName} Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: { extend: { colors: { brand: '${color}', darkBg: '#0f172a' }, fontFamily: { sans: ['Inter', 'sans-serif'] } } }
        }
    </script>
    <style>
        body { margin: 0; background-color: #0f172a; color: white; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .iframe-container { flex: 1; border: none; width: 100%; height: 100%; border-top: 1px solid rgba(255,255,255,0.05); }
        .panel-header { background: rgba(0,0,0,0.4); padding: 8px 12px; font-size: 11px; font-weight: bold; color: ${color}; text-transform: uppercase; letter-spacing: 2px; text-align: center; border-bottom: 1px solid rgba(${color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.2); }
    </style>
</head>
<body>
    <div class="panel-header">■ ${moduleName.replace(/_/g, ' ')} Module</div>
    <!-- Load the actual index.html in a full-height iframe, bypassing need to rewrite 9 react apps -->
    <iframe src="index.html" class="iframe-container"></iframe>
</body>
</html>`;

const modulesDir = path.join(__dirname, 'modules');
const modulesList = [
    { dir: 'ai_chat/chat_version_1', color: '#3b82f6', name: 'Core_Chat' },
    { dir: 'ai_chat/chat_version_2', color: '#f59e0b', name: 'Multi_Model' },
    { dir: 'analyser', color: '#3b82f6', name: 'Analyser' },
    { dir: 'converter', color: '#a855f7', name: 'Code_Converter' },
    { dir: 'html_viewer', color: '#ef4444', name: 'HTML_Viewer' },
    { dir: 'markdown_converter', color: '#f59e0b', name: 'MD_Converter' },
    { dir: 'speech_to_text', color: '#06b6d4', name: 'Voice_Engine' },
    { dir: 'text_summary', color: '#10b981', name: 'Text_Summary' },
    { dir: 'text_to_speech', color: '#ec4899', name: 'Audio_Synth' }
];

modulesList.forEach(m => {
    const targetDir = path.join(modulesDir, m.dir);
    if (fs.existsSync(targetDir)) {
        fs.writeFileSync(path.join(targetDir, 'index_panel.html'), generatePanelHTML(m.name, m.color));
        console.log('Created panel for:', m.name);
    }
});
console.log('Panel generation complete.');

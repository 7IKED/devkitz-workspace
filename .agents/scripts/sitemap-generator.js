/**
 * DkZ™ Global Sitemap Generator
 * 
 * Scannt alle 140+ Module in 01_PROJECTS und baut eine dynamische global-sitemap.json.
 * Wird vom dkz-mesh.js Frontend-Script geladen, um Querverweise zu bauen.
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../../01_PROJECTS');
const OUTPUT_FILE = path.join(__dirname, '../../01_PROJECTS/global-sitemap.json');

const BASE_DOMAIN = 'devkitz.eu';

function generateSitemap() {
    console.warn('[Sitemap] Starte DkZ Global Mesh Scan...');
    let sitemap = [];

    const items = fs.readdirSync(PROJECTS_DIR);
    
    items.forEach(item => {
        const itemPath = path.join(PROJECTS_DIR, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory() && !item.startsWith('.')) {
            // Wir prüfen, ob eine index.html existiert (Zeichen für ein Web-Modul)
            const indexPath = path.join(itemPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                
                // Versuche einen "schönen" Titel aus der features.json oder index.html zu holen
                let title = item.replace(/^[0-9]+_|-/g, ' ').trim().toUpperCase();
                
                sitemap.push({
                    id: item,
                    title: title,
                    url: `https://${item}.${BASE_DOMAIN}/`,
                    localPath: `/${item}/`
                });
            }
        }
    });

    // Sub-Module aus 01_dashboard/modules scannen
    const dashboardModulesDir = path.join(PROJECTS_DIR, '01_dashboard', 'modules');
    if (fs.existsSync(dashboardModulesDir)) {
        const subItems = fs.readdirSync(dashboardModulesDir);
        subItems.forEach(item => {
            const subPath = path.join(dashboardModulesDir, item);
            if (fs.statSync(subPath).isDirectory() && fs.existsSync(path.join(subPath, 'index.html'))) {
                let title = item.replace(/^[0-9]+_|-/g, ' ').trim().toUpperCase();
                sitemap.push({
                    id: item,
                    title: title,
                    url: `https://${item}.${BASE_DOMAIN}/`,
                    localPath: `/01_dashboard/modules/${item}/`
                });
            }
        });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sitemap, null, 2), 'utf8');
    console.warn('[Sitemap] Global Sitemap generiert: ' + sitemap.length + ' Module erfasst.');
}

generateSitemap();

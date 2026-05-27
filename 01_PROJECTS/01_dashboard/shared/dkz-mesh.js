/**
 * DkZ™ Global Mesh Injektor
 * @DKZ:TAG → [SHARED:mesh] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Lädt die global-sitemap.json und baut einen dynamischen SEO-Footer (Cross-Links) 
 * auf jeder Seite auf, die dieses Skript einbindet.
 */

(async function initDkzMesh() {
    console.log('🌐 [DkZ Mesh] Lade Global-Sitemap...');

    try {
        // Pfad variiert je nach Host (VPS vs Lokal). Wir probieren relativ aus Root.
        let jsonPath = '/global-sitemap.json';
        if (window.location.protocol === 'file:') {
            // Lokaler Fallback
            jsonPath = '../../global-sitemap.json'; 
        }

        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Sitemap nicht gefunden');
        const sitemap = await response.json();

        if (sitemap && sitemap.length > 0) {
            buildMeshFooter(sitemap);
        }
    } catch (err) {
        console.warn('⚠️ [DkZ Mesh] Konnte Sitemap nicht laden:', err);
    }
})();

function buildMeshFooter(sitemap) {
    const footer = document.createElement('footer');
    footer.id = 'dkz-global-mesh';
    footer.style.cssText = `
        background: #060608;
        border-top: 1px solid rgba(250, 30, 78, 0.2);
        padding: 40px 20px;
        margin-top: 60px;
        font-family: 'Inter', sans-serif;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 15px;
    `;

    const title = document.createElement('h4');
    title.innerText = 'DkZ™ Ecosystem Explorer';
    title.style.cssText = `
        grid-column: 1 / -1;
        color: #fa1e4e;
        margin-bottom: 20px;
        font-size: 0.9rem;
        letter-spacing: 2px;
        text-transform: uppercase;
    `;
    container.appendChild(title);

    sitemap.forEach(site => {
        const a = document.createElement('a');
        a.href = site.url;
        a.innerText = site.title;
        a.target = '_blank';
        a.style.cssText = `
            color: #a1a1aa;
            text-decoration: none;
            font-size: 0.8rem;
            transition: color 0.2s;
        `;
        a.onmouseover = () => a.style.color = '#00ff88';
        a.onmouseout = () => a.style.color = '#a1a1aa';
        container.appendChild(a);
    });

    footer.appendChild(container);
    document.body.appendChild(footer);
    console.log(`✅ [DkZ Mesh] ${sitemap.length} Cross-Links injected.`);
}

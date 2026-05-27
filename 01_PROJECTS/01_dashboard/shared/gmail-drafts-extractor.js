/**
 * Gmail Drafts Extractor fuer DevTools Console
 * @DKZ:TAG → [SHARED:gmail-drafts-extractor] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * ------------------------------------------
 * Anleitung:
 * 1. Gmail "Entwürfe" (Drafts) Ordner öffnen
 * 2. F12 drücken -> Console öffnen
 * 3. Dieses Script einfügen und ENTER drücken
 * 4. Das Ergebnis wird als JSON ausgegeben und in die Zwischenablage kopiert.
 */
(() => {
  try {
    const drafts = Array.from(document.querySelectorAll('tr.zA')).map(row => {
      const subjectEl = row.querySelector('.bog span');
      const snippetEl = row.querySelector('.y2');
      const dateEl = row.querySelector('.xW.xY span');
      
      return {
        subject: subjectEl ? subjectEl.innerText.trim() : 'Kein Betreff',
        snippet: snippetEl ? snippetEl.innerText.trim().replace(/^-\s*/, '') : '',
        date: dateEl ? dateEl.innerText.trim() : new Date().toLocaleDateString()
      };
    }).filter(d => d.subject !== 'Kein Betreff' || d.snippet !== '');

    const jsonOutput = JSON.stringify(drafts, null, 2);
    console.table(drafts);
    
    // Versuch, in die Zwischenablage zu kopieren (funktioniert nur, wenn das Dokument fokussiert ist)
    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = jsonOutput;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      console.log('%c[OK] Entwürfe in die Zwischenablage kopiert!', 'color: #00ff88; font-weight: bold; font-size: 14px;');
    } catch (err) {
      console.log('%c[INFO] Konnte nicht in Zwischenablage kopieren. JSON oben kopieren.', 'color: #ffb800;');
    }
    
    return "Extraktion abgeschlossen. " + drafts.length + " Entwürfe gefunden.";
  } catch (e) {
    console.error("Fehler beim Extrahieren der Entwürfe:", e);
    return "Fehler.";
  }
})();

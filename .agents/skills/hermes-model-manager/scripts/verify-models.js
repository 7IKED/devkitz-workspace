/**
 * Hermes Model Verifier — Prüft alle Free-Modelle gegen OpenRouter API
 * Usage: node verify-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_JSON = path.join(process.env.USERPROFILE, '.hermes', 'models.json');

async function fetchFreeModels() {
  return new Promise((resolve, reject) => {
    https.get('https://openrouter.ai/api/v1/models', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const models = JSON.parse(data);
        const free = models.data
          .filter(m => m.id.endsWith(':free'))
          .map(m => m.id);
        resolve(free);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 Lade verfügbare Free-Modelle von OpenRouter...\n');
  const available = await fetchFreeModels();
  
  console.log(`✅ ${available.length} Free-Modelle verfügbar:\n`);
  available.forEach(m => console.log(`   ${m}`));
  
  // Prüfe models.json
  if (fs.existsSync(MODELS_JSON)) {
    console.log('\n📋 Prüfe ~/.hermes/models.json...\n');
    const local = JSON.parse(fs.readFileSync(MODELS_JSON, 'utf8'));
    const freeLocal = local.filter(m => m.model?.endsWith(':free'));
    
    let broken = 0;
    freeLocal.forEach(m => {
      const ok = available.includes(m.model);
      const icon = ok ? '✅' : '❌';
      console.log(`   ${icon} ${m.name} → ${m.model}`);
      if (!ok) broken++;
    });
    
    if (broken > 0) {
      console.log(`\n⚠️  ${broken} kaputte Model-IDs gefunden! Bitte aktualisieren.`);
    } else {
      console.log('\n✅ Alle lokalen Free-Modelle sind gültig!');
    }
  }
}

main().catch(console.error);

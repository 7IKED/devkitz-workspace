/**
 * BET TRACKER — DkZ Live Command Center v2.1
 * @version 2.1 — Pre-loaded Tipico data, better integrations
 */
(function(){
'use strict';

const DB_KEY = 'dkz-bet-tracker';
const TIPPS_KEY = 'dkz-bet-tipps';

// ═══ DEFAULT DATA from Tipico Photos ═══
const DEFAULT_SCHEINE = [
  {
    id: 'W-6419516',
    code: '2810',
    date: '2026-03-18T22:54:58',
    einsatz: 100.00,
    maxAusz: 910.39,
    gesamtQuote: '19.17',
    status: 'live',
    systemwette: '2 Wege',
    games: [
      { home:'Boston Celtics', away:'Golden State Warriors', league:'NBA', wettart:'Handicap (0:9.5)', quote:1.60, date:'2026-03-19', time:'00:00', score:'', minute:'', status:'pending', sofaId:'boston-celtics-golden-state-warriors' },
      { home:'New York Rangers', away:'New Jersey Devils', league:'NHL', wettart:'Ueber/Unter 5.5', quote:1.62, date:'2026-03-19', time:'00:00', score:'', minute:'', status:'pending', sofaId:'new-york-rangers-new-jersey-devils' },
      { home:'Washington Capitals', away:'Ottawa Senators', league:'NHL', wettart:'Ueber/Unter 4.5+', quote:1.33, date:'2026-03-19', time:'00:30', score:'', minute:'', status:'pending', sofaId:'washington-capitals-ottawa-senators' },
      { home:'Memphis Grizzlies', away:'Denver Nuggets', league:'NBA', wettart:'Nikola Jokic Ueber/Unter 27.5 Punkte', quote:1.80, date:'2026-03-19', time:'01:30', score:'', minute:'', status:'pending', sofaId:'memphis-grizzlies-denver-nuggets' },
      { home:'Anaheim Ducks', away:'Philadelphia Flyers', league:'NHL', wettart:'2-Weg (inkl. Verl./Penalty) + Ueber/Unter 5.5', quote:1.57, date:'2026-03-19', time:'03:00', score:'', minute:'', status:'pending', sofaId:'anaheim-ducks-philadelphia-flyers' }
    ]
  },
  {
    id: 'W-6209265',
    code: '7790',
    date: '2026-03-11T22:57:05',
    einsatz: 2.00,
    maxAusz: 324.58,
    gesamtQuote: '171.74',
    status: 'live',
    games: [
      { home:'Atletico Mineiro', away:'SC Internacional', league:'Brasileirao Serie A', wettart:'Ergebnis 2:2', quote:14.00, date:'2026-03-11', time:'23:00', score:'', minute:'', status:'pending', sofaId:'atletico-mineiro-sc-internacional' },
      { home:'Orlando Magic', away:'Cleveland Cavaliers', league:'NBA', wettart:'Handicap (1.5:0) 1. HZ', quote:1.80, date:'2026-03-12', time:'00:30', score:'', minute:'', status:'pending', sofaId:'orlando-magic-cleveland-cavaliers' },
      { home:'Ottawa Senators', away:'Montreal Canadiens', league:'NHL', wettart:'Ueber/Unter 7.5', quote:2.90, date:'2026-03-12', time:'00:30', score:'', minute:'', status:'pending', sofaId:'ottawa-senators-montreal-canadiens' },
      { home:'Philadelphia Flyers', away:'Washington Capitals', league:'NHL', wettart:'Ueber/Unter 6.5', quote:2.35, date:'2026-03-12', time:'00:30', score:'', minute:'', status:'pending', sofaId:'philadelphia-flyers-washington-capitals' }
    ]
  }
];

let state = { scheine: [], history: [], tipps: [], activeTab: 'upload' };

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(DB_KEY));
    if(saved && saved.scheine && saved.scheine.length > 0) {
      state = saved;
    } else {
      // Pre-load from Tipico photos
      state.scheine = JSON.parse(JSON.stringify(DEFAULT_SCHEINE));
      saveState();
    }
  } catch(e) {
    state.scheine = JSON.parse(JSON.stringify(DEFAULT_SCHEINE));
    saveState();
  }
}

function saveState(){
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

// ═══ XSS ═══
function esc(s){ if(!s)return ''; const d=document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

// ═══ TABS ═══
window.switchTab = function(t){
  state.activeTab = t;
  document.querySelectorAll('.tab').forEach((b,i)=>{
    const tabs=['upload','dashboard','live','history'];
    b.classList.toggle('active', tabs[i]===t);
  });
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const panel = document.getElementById('panel-'+t);
  if(panel) panel.classList.add('active');
  if(t==='dashboard') renderDashboard();
  if(t==='history') renderHistory();
  if(t==='live') renderLive();
};

// ═══ TOAST ═══
window.showToast = function(msg, dur){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), dur||3000);
};

// ═══ UPLOAD ZONE ═══
const dropZone = document.getElementById('dropZone');
if(dropZone){
  dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('dragover');});
  dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop',e=>{
    e.preventDefault(); dropZone.classList.remove('dragover');
    if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);
  });
}

window.handleUpload = async function(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(e){
    const imgData = e.target.result;
    document.getElementById('ocrImage').src = imgData;
    document.getElementById('ocrPreview').style.display = 'block';
    document.getElementById('ocrResult').textContent = '⏳ Analysiere Bild mit KI...';

    // QR decode
    const qr = await tryQRDecode(imgData);
    if(qr){
      document.getElementById('ocrResult').textContent = '✅ QR-Code erkannt:\n' + qr;
      showToast('QR-Code erkannt!');
      return;
    }

    // OCR via Puter.js
    try {
      const prompt = 'Analysiere diesen Tipico Wettschein. Extrahiere alle Spiele mit Teams, Wettart, Quote. Gib JSON zurueck: {"id":"X","einsatz":X,"maxAusz":X,"games":[{"home":"","away":"","wettart":"","quote":X,"league":"","date":"","time":""}]}';
      const resp = await puter.ai.chat(prompt, {vision: imgData});
      const text = resp?.message?.content || String(resp);
      document.getElementById('ocrResult').textContent = text;
      const m = text.match(/\{[\s\S]*\}/);
      if(m){ window._ocrParsed = JSON.parse(m[0]); document.getElementById('ocrResult').textContent += '\n\n✅ Klicke "Uebernehmen"'; }
    } catch(err){
      document.getElementById('ocrResult').textContent = '⚠ OCR Fehler: '+err.message+'\nManuelle Eingabe empfohlen.';
    }
  };
  reader.readAsDataURL(file);
};

async function tryQRDecode(imgData){
  return new Promise(resolve=>{
    const img = new Image();
    img.onload = function(){
      const cv = document.createElement('canvas');
      cv.width=img.width; cv.height=img.height;
      const ctx=cv.getContext('2d');
      ctx.drawImage(img,0,0);
      const id=ctx.getImageData(0,0,cv.width,cv.height);
      if(typeof jsQR!=='undefined'){ const c=jsQR(id.data,cv.width,cv.height); resolve(c?c.data:null); }
      else resolve(null);
    };
    img.src=imgData;
  });
}

window.confirmOCR = function(){
  if(!window._ocrParsed) return;
  const d = window._ocrParsed;
  const schein = {
    id: 'OCR-'+(d.id||Date.now()), date: new Date().toISOString(),
    einsatz: d.einsatz||2, maxAusz: d.maxAusz||0, status:'live',
    games: (d.games||[]).map(g=>({home:g.home,away:g.away,league:g.league||'',wettart:g.wettart||'',quote:g.quote||1,date:g.date||'',time:g.time||'',score:'',minute:'',status:'pending',sofaId:''}))
  };
  schein.gesamtQuote = schein.games.reduce((a,g)=>a*g.quote,1).toFixed(2);
  state.scheine.push(schein);
  saveState();
  showToast('✅ Wettschein gespeichert!');
  switchTab('dashboard');
};

// ═══ LINK / MANUAL ═══
window.toggleLinkInput = function(){ const el=document.getElementById('linkInput'); el.style.display=el.style.display==='none'?'block':'none'; };
window.toggleManualForm = function(){ const el=document.getElementById('manualForm'); el.style.display=el.style.display==='none'?'block':'none'; if(!document.querySelectorAll('#manualGames > div').length) addManualGame(); };
window.loadFromLink = function(){
  const url=document.getElementById('scheinLink').value.trim();
  if(!url){showToast('Bitte Link eingeben');return;}
  state.scheine.push({id:'L-'+Date.now(),date:new Date().toISOString(),einsatz:0,maxAusz:0,status:'live',link:url,games:[{home:'Via Link',away:'',wettart:'Tipico Link',quote:1,status:'pending',score:'',minute:'',sofaId:''}],gesamtQuote:'1.00'});
  saveState(); showToast('✅ Link gespeichert!'); switchTab('dashboard');
};

let mgCount=0;
window.addManualGame = function(){
  mgCount++;
  document.getElementById('manualGames').insertAdjacentHTML('beforeend',
    `<div style="background:var(--card2);padding:.75rem;border-radius:8px;margin-bottom:.5rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:.5rem"><span style="font-size:.7rem;font-weight:800;color:var(--green)">Spiel ${mgCount}</span><button class="btn btn-ghost" style="padding:2px 6px;font-size:.6rem" onclick="this.parentElement.parentElement.remove()">✕</button></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem"><input class="form-input mg-home" placeholder="Heim"><input class="form-input mg-away" placeholder="Gast"></div>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin-top:.5rem"><input class="form-input mg-wettart" placeholder="Wettart"><input class="form-input mg-quote" type="number" step="0.01" placeholder="Quote"><input class="form-input mg-league" placeholder="Liga"></div>
    </div>`);
};
window.saveManualSchein = function(){
  const games=[];
  document.querySelectorAll('#manualGames > div').forEach(el=>{
    const h=el.querySelector('.mg-home')?.value||'';
    const a=el.querySelector('.mg-away')?.value||'';
    const w=el.querySelector('.mg-wettart')?.value||'';
    const q=parseFloat(el.querySelector('.mg-quote')?.value)||1;
    const l=el.querySelector('.mg-league')?.value||'';
    if(h) games.push({home:h,away:a,league:l,wettart:w,quote:q,status:'pending',score:'',minute:'',sofaId:''});
  });
  if(!games.length){showToast('Mindestens 1 Spiel!');return;}
  const e=parseFloat(document.getElementById('manEinsatz').value)||2;
  const gq=games.reduce((a,g)=>a*g.quote,1);
  state.scheine.push({id:'M-'+Date.now(),date:new Date().toISOString(),einsatz:e,maxAusz:parseFloat(document.getElementById('manAusz').value)||(e*gq),status:'live',games,gesamtQuote:gq.toFixed(2)});
  saveState(); showToast('✅ Gespeichert!'); document.getElementById('manualGames').innerHTML=''; mgCount=0; switchTab('dashboard');
};
window.startQRScan = function(){
  const input=document.getElementById('fileInput');
  input.setAttribute('capture','environment');
  input.click();
  setTimeout(()=>input.removeAttribute('capture'),1000);
};

// ═══ DASHBOARD ═══
function renderDashboard(){
  const grid=document.getElementById('scheinGrid');
  const empty=document.getElementById('emptyDash');
  if(!state.scheine.length){grid.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';

  let actC=0, totE=0, totP=0, totProb=0;
  grid.innerHTML = state.scheine.map((s,idx)=>{
    const prob=calcProb(s);
    const pCol = prob>60?'var(--green)':prob>30?'var(--yellow)':'var(--red)';
    const sc = s.status==='won'?'won':s.status==='lost'?'lost':'live';
    if(s.status!=='won'&&s.status!=='lost'){actC++;totProb+=prob;}
    totE+=s.einsatz; totP+=parseFloat(s.maxAusz)||0;

    return `<div class="schein-card ${sc}">
      <div class="sc-header">
        <span class="sc-id">#${esc(s.id)} ${s.code?'(Code '+esc(s.code)+')':''}</span>
        <div style="display:flex;gap:4px;align-items:center">
          <span class="sc-badge ${sc}">${sc==='live'?'⚡ LIVE':sc==='won'?'✅ WON':'❌ LOST'}</span>
          <button class="btn btn-ghost" style="padding:2px 6px;font-size:.55rem" onclick="deleteSchein(${idx})" title="Loeschen">🗑</button>
        </div>
      </div>
      <div class="sc-prob">
        <div class="sc-prob-val" style="color:${pCol}">${prob}%</div>
        <div class="sc-prob-label">Gewinn-Chance</div>
      </div>
      <div class="sc-games">${s.games.map((g,gi)=>{
        const dot = g.status==='won'?'won':g.status==='lost'?'lost':g.status==='live'?'live':'pending';
        return `<div class="sc-game" onclick="openSofaGame('${esc(g.home)}','${esc(g.away)}')" style="cursor:pointer" title="Klick: SofaScore oeffnen">
          <div class="status-dot ${dot}"></div>
          <div class="teams">${esc(g.home)} vs ${esc(g.away)}<br><span style="font-size:.55rem;color:var(--muted)">${esc(g.league)} · ${esc(g.wettart)} · ${g.quote}x</span></div>
          <div class="score">${g.score||'—'}</div>
          <div class="minute">${g.minute?g.minute+"'":(g.status==='pending'?'⏳':'')}</div>
        </div>`}).join('')}
      </div>
      <div class="sc-footer">
        <span class="sc-einsatz">💶 ${s.einsatz.toFixed(2)}€</span>
        <span class="sc-auszahlung">🏆 Max: ${parseFloat(s.maxAusz).toFixed(2)}€ (${s.gesamtQuote}x)</span>
      </div>
      <div style="margin-top:.5rem;display:flex;gap:4px;flex-wrap:wrap">
        <button class="btn btn-ghost" style="flex:1;font-size:.6rem" onclick="watchSchein(${idx})">📺 Stream</button>
        <button class="btn btn-ghost" style="flex:1;font-size:.6rem" onclick="openSofaSchein(${idx})">⚽ SofaScore</button>
        <button class="btn btn-ghost" style="flex:1;font-size:.6rem" onclick="openOddsSchein(${idx})">📊 Odds</button>
        <button class="btn btn-ghost" style="flex:1;font-size:.6rem" onclick="updateScores(${idx})">✏️ Scores</button>
        <button class="btn btn-ghost" style="font-size:.6rem;color:var(--green)" onclick="markSchein(${idx},'won')">✅</button>
        <button class="btn btn-ghost" style="font-size:.6rem;color:var(--red)" onclick="markSchein(${idx},'lost')">❌</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('st-active').textContent = actC;
  document.getElementById('st-prob').textContent = actC?(totProb/actC).toFixed(0)+'%':'—';
  document.getElementById('st-einsatz').textContent = totE.toFixed(2)+'€';
  document.getElementById('st-potential').textContent = totP.toFixed(2)+'€';
}

function calcProb(s){
  if(s.status==='won')return 100;
  if(s.status==='lost')return 0;
  let won=0, total=s.games.length;
  s.games.forEach(g=>{
    if(g.status==='won')won++;
    else if(g.status==='live')won+=0.6;
    else if(g.status==='pending')won+=0.4;
  });
  return Math.round((won/total)*100);
}

// ═══ SCHEIN ACTIONS ═══
window.deleteSchein = function(i){ if(confirm('Schein loeschen?')){state.scheine.splice(i,1);saveState();renderDashboard();} };
window.markSchein = function(i,st){
  state.scheine[i].status=st;
  if(st==='won'||st==='lost'){state.history.push({...state.scheine[i],resolvedAt:new Date().toISOString()});state.scheine.splice(i,1);}
  saveState(); renderDashboard();
};
window.updateScores = function(i){
  const s=state.scheine[i];
  s.games.forEach((g,gi)=>{
    const input = prompt(`${g.home} vs ${g.away}\nAktueller Stand (z.B. 2:1):`);
    if(input!==null){
      g.score=input.trim();
      const min = prompt('Minute (z.B. 78):');
      if(min!==null) g.minute=min.trim();
      const st = prompt('Status? (live/won/lost/pending):','live');
      if(st) g.status=st.trim();
    }
  });
  saveState(); renderDashboard();
};

// ═══ EXTERNAL LINKS — SMART ═══
window.openSofaGame = function(home, away){
  const q = encodeURIComponent(home + ' ' + away);
  window.open('https://www.sofascore.com/de/suche?q='+q, '_blank');
};
window.openSofaSchein = function(i){
  const g = state.scheine[i].games[0];
  openSofaGame(g.home, g.away);
};
window.openOddsSchein = function(i){
  const g = state.scheine[i].games[0];
  const q = encodeURIComponent(g.home + ' ' + g.away);
  window.open('https://oddspedia.com/de/suche?q='+q, '_blank');
};
window.watchSchein = function(i){
  switchTab('live');
  setTimeout(()=>{
    const g = state.scheine[i].games.find(g=>g.status!=='won'&&g.status!=='lost') || state.scheine[i].games[0];
    loadStream(g.home, g.away);
  },200);
};

window.openSofaScore = function(){ window.open('https://www.sofascore.com/de/','_blank'); };
window.openOddspedia = function(){ window.open('https://oddspedia.com/de/','_blank'); };

// ═══ LIVE MONITOR ═══
function renderLive(){
  const container = document.getElementById('liveGames');
  const allGames = [];
  state.scheine.forEach((s,si)=>{
    s.games.forEach((g,gi)=>{
      allGames.push({...g, scheinIdx:si, gameIdx:gi, scheinId:s.id});
    });
  });

  if(!allGames.length){
    container.innerHTML='<div style="text-align:center;padding:2rem;color:var(--muted)">Keine Spiele geladen</div>';
    return;
  }

  container.innerHTML = allGames.map((g,i)=>{
    const dot = g.status==='won'?'won':g.status==='lost'?'lost':g.status==='live'?'live':'pending';
    return `<div class="score-widget" onclick="loadStream('${esc(g.home)}','${esc(g.away)}')">
      <div class="sw-header">
        <span>${esc(g.league)}</span>
        <span style="display:flex;align-items:center;gap:4px"><div class="status-dot ${dot}" style="width:5px;height:5px"></div>${esc(g.scheinId)}</span>
      </div>
      <div class="sw-teams">
        <div class="sw-team">${esc(g.home)}</div>
        <div class="sw-score">${g.score||'vs'}</div>
        <div class="sw-team">${esc(g.away)}</div>
      </div>
      <div class="sw-minute">${g.minute?'⚽ '+g.minute+"'":'📊 '+g.wettart+' ('+g.quote+'x)'}</div>
      <div style="display:flex;gap:4px;margin-top:.5rem;justify-content:center">
        <button class="btn btn-ghost" style="font-size:.55rem;padding:2px 8px" onclick="event.stopPropagation();openSofaGame('${esc(g.home)}','${esc(g.away)}')">⚽ SofaScore</button>
        <button class="btn btn-ghost" style="font-size:.55rem;padding:2px 8px" onclick="event.stopPropagation();window.open('https://oddspedia.com/de/suche?q='+encodeURIComponent('${esc(g.home)} ${esc(g.away)}'),'_blank')">📊 Oddspedia</button>
      </div>
    </div>`;
  }).join('');

  // Render ticker
  renderTicker(allGames);
  renderOddsMonitor(allGames);
}

function loadStream(home, away){
  const search = home + ' ' + (away||'');
  const overlay = document.getElementById('streamOverlay');
  const url = 'https://livetv.sx/de/search/?q=' + encodeURIComponent(search);
  overlay.innerHTML = `
    <div class="so-icon">📺</div>
    <div style="font-size:1rem;font-weight:800;margin-bottom:.25rem">${esc(home)} vs ${esc(away)}</div>
    <div class="so-text">Stream-Suche auf livetv.sx</div>
    <div style="display:flex;gap:8px;margin-top:.75rem;flex-wrap:wrap;justify-content:center">
      <a href="${url}" target="_blank" class="btn btn-blue" style="text-decoration:none">🔗 livetv.sx oeffnen</a>
      <a href="https://www.sofascore.com/de/suche?q=${encodeURIComponent(search)}" target="_blank" class="btn btn-green" style="text-decoration:none;color:#000">⚽ SofaScore</a>
      <a href="https://oddspedia.com/de/suche?q=${encodeURIComponent(search)}" target="_blank" class="btn btn-ghost" style="text-decoration:none">📊 Oddspedia</a>
    </div>`;
}

window.autoFindStream = function(){
  const live = [];
  state.scheine.forEach(s=>s.games.forEach(g=>{ if(g.status!=='won'&&g.status!=='lost') live.push(g); }));
  if(live.length) loadStream(live[0].home, live[0].away);
  else showToast('Keine aktiven Spiele');
};

function renderTicker(games){
  const el = document.getElementById('liveTicker');
  const liveGames = games.filter(g=>g.score && g.score!=='—');
  if(!liveGames.length){
    el.innerHTML = games.slice(0,8).map(g=>`
      <div class="ticker-event">
        <span class="te-min">${g.time||'—'}</span>
        <span class="te-icon">⏳</span>
        <span class="te-text"><b>${esc(g.home)}</b> vs <b>${esc(g.away)}</b> · ${esc(g.league)}</span>
      </div>`).join('');
    return;
  }
  el.innerHTML = liveGames.map(g=>`
    <div class="ticker-event">
      <span class="te-min">${g.minute||'—'}'</span>
      <span class="te-icon">⚽</span>
      <span class="te-text"><b>${esc(g.home)}</b> ${g.score} <b>${esc(g.away)}</b></span>
    </div>`).join('');
}

function renderOddsMonitor(games){
  const el = document.getElementById('oddsMonitor');
  el.innerHTML = games.slice(0,6).map(g=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.03);font-size:.65rem">
      <span style="flex:1">${esc(g.home)} vs ${esc(g.away)}</span>
      <span style="color:var(--yellow);font-family:var(--mono);font-weight:800">${g.quote}x</span>
    </div>`).join('');
}

// ═══ TIPPS ═══
window.openTipps = function(){ document.getElementById('tippsPopup').classList.add('show'); loadTipps(); };
window.closeTipps = function(){ document.getElementById('tippsPopup').classList.remove('show'); };
window.loadTipps = function(){
  const el=document.getElementById('tippsContent');
  el.innerHTML = `
    <div style="text-align:center;padding:.75rem">
      <a href="https://www.wetttippsheute.com" target="_blank" class="btn btn-blue" style="text-decoration:none;display:inline-block;margin-bottom:.75rem">🔗 wetttippsheute.com oeffnen</a>
      <div style="font-size:.65rem;color:var(--muted)">Trage Tipps hier ein fuer dein Tracking:</div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin:.5rem 0">
      <input class="form-input" id="tippGame" placeholder="Spiel">
      <input class="form-input" id="tippType" placeholder="Tipp">
      <input class="form-input" id="tippQuote" placeholder="Quote" type="number" step="0.01">
    </div>
    <button class="btn btn-green" onclick="saveTipp()" style="width:100%">💾 Tipp speichern</button>
    <div id="tippsList" style="margin-top:.75rem"></div>`;
  renderTipps();
};

window.saveTipp = function(){
  const g=document.getElementById('tippGame').value, t=document.getElementById('tippType').value, q=document.getElementById('tippQuote').value;
  if(!g){showToast('Spiel eingeben!');return;}
  state.tipps.push({game:g,type:t,quote:parseFloat(q)||0,date:new Date().toISOString(),result:null});
  saveState(); showToast('✅ Tipp gespeichert!'); renderTipps();
};

function renderTipps(){
  const el=document.getElementById('tippsList'); if(!el)return;
  if(!state.tipps.length){el.innerHTML='<div style="color:var(--muted);font-size:.65rem;text-align:center;padding:.5rem">Keine Tipps</div>';return;}
  el.innerHTML = state.tipps.slice(-15).reverse().map((t,i)=>{
    const ri = state.tipps.length-1-i;
    return `<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;background:var(--card2);border-radius:6px;margin-bottom:3px;font-size:.65rem">
      <span style="flex:1;font-weight:700">${esc(t.game)}</span>
      <span style="color:var(--blue)">${esc(t.type)}</span>
      <span style="color:var(--yellow);font-family:var(--mono)">${t.quote?t.quote.toFixed(2):'—'}</span>
      <span>${t.result===true?'✅':t.result===false?'❌':'⏳'}</span>
      <button style="border:none;background:none;color:var(--green);cursor:pointer" onclick="resolveTipp(${ri},true)">✓</button>
      <button style="border:none;background:none;color:var(--red);cursor:pointer" onclick="resolveTipp(${ri},false)">✗</button>
    </div>`;
  }).join('');
  const resolved=state.tipps.filter(t=>t.result!==null), wins=resolved.filter(t=>t.result).length;
  const s=document.getElementById('tippsStats');
  if(s) s.innerHTML = resolved.length ? `${wins}/${resolved.length} richtig (${(wins/resolved.length*100).toFixed(0)}%) — ${state.tipps.length} gesamt` : 'Noch keine Daten';
}
window.resolveTipp = function(i,r){ state.tipps[i].result=r; saveState(); renderTipps(); };

// ═══ HISTORY ═══
function renderHistory(){
  const tbody=document.getElementById('histBody'), empty=document.getElementById('emptyHist');
  if(!state.history.length){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  let wC=0,lC=0,tE=0,tG=0;
  tbody.innerHTML = state.history.slice().reverse().map(s=>{
    const w=s.status==='won'; if(w){wC++;tG+=parseFloat(s.maxAusz)||0;}else lC++;
    tE+=s.einsatz;
    const gStr=s.games.map(g=>g.home+(g.away?' vs '+g.away:'')).join(', ');
    return `<tr><td>${new Date(s.date).toLocaleDateString('de-DE')}</td><td title="${esc(gStr)}">${esc(gStr.slice(0,45))}</td><td>${s.einsatz.toFixed(2)}€</td><td>${s.gesamtQuote}x</td><td><span class="sc-badge ${s.status}">${w?'✅ WON':'❌ LOST'}</span></td><td style="color:${w?'var(--green)':'var(--red)'};">${w?'+'+parseFloat(s.maxAusz).toFixed(2):'-'+s.einsatz.toFixed(2)}€</td></tr>`;
  }).join('');
  const b=tG-tE;
  document.getElementById('hs-won').textContent=wC;
  document.getElementById('hs-lost').textContent=lC;
  document.getElementById('hs-roi').textContent=tE?((b/tE)*100).toFixed(0)+'%':'0%';
  document.getElementById('hs-total').textContent=(b>=0?'+':'')+b.toFixed(2)+'€';
  document.getElementById('hs-total').style.color=b>=0?'var(--green)':'var(--red)';
}

// ═══ INFO ═══
window.showModuleInfo = function(){ document.getElementById('info-modal').classList.add('show'); };

// ═══ AUTO-START on Dashboard ═══
loadState();
// Auto-switch to dashboard if scheine exist
if(state.scheine.length > 0){
  switchTab('dashboard');
}

})();

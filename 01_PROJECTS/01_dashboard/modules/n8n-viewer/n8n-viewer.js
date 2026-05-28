// ═══════════════════════════════════════
// n8n Viewer™ v2 — Core Engine
// ═══════════════════════════════════════
var NODES=[],WIRES=[],nextId=1,selNode=null,dragNode=null,dragOff={x:0,y:0};
var zoom=1,panX=0,panY=0,isPanning=false,panStart={x:0,y:0};
var catalog=[],filteredCatalog=[],activeTag=null,simRunning=false;
var idleTimer=null,IDLE_MS=45000;

// ── XSS Protection ──
function esc(s){if(!s)return'';var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

// ── NODE CATEGORIES (n8n Built-in + awesome-n8n Community) ──
var CATS=[
{name:'Trigger',icon:'⚡',nodes:[
  {n:'Webhook',icon:'🌐',badge:'api',desc:'HTTP Webhook',ports:{in:[],out:['main']}},
  {n:'Schedule',icon:'⏰',badge:'api',desc:'Cron/Intervall',ports:{in:[],out:['main']}},
  {n:'Email Trigger',icon:'📧',badge:'api',desc:'IMAP Trigger',ports:{in:[],out:['main']}},
  {n:'Telegram Trigger',icon:'✈️',badge:'api',desc:'Bot Update',ports:{in:[],out:['main']}},
  {n:'Chat Trigger',icon:'💬',badge:'api',desc:'Chat Message',ports:{in:[],out:['main']}},
  {n:'Manual Trigger',icon:'👆',badge:'api',desc:'Manuell starten',ports:{in:[],out:['main']}},
  {n:'Form Trigger',icon:'📝',badge:'api',desc:'HTML Formular',ports:{in:[],out:['main']}}
]},
{name:'AI & LLM',icon:'🧠',nodes:[
  {n:'OpenAI GPT',icon:'🟢',badge:'ai',desc:'GPT-4o/4.5',ports:{in:['prompt'],out:['response']}},
  {n:'Claude',icon:'🟤',badge:'ai',desc:'Sonnet 4',ports:{in:['prompt'],out:['response']}},
  {n:'Gemini',icon:'🔵',badge:'ai',desc:'Gemini 2.5 Pro',ports:{in:['prompt'],out:['response']}},
  {n:'Mistral OCR',icon:'🟠',badge:'ai',desc:'Vision + OCR',ports:{in:['image'],out:['text']}},
  {n:'LangChain',icon:'🦜',badge:'ai',desc:'Agent Chain',ports:{in:['input'],out:['output']}},
  {n:'Vector Store',icon:'🔮',badge:'ai',desc:'Qdrant/Pinecone',ports:{in:['doc'],out:['results']}},
  {n:'AI Agent',icon:'🤖',badge:'ai',desc:'Autonomous Agent',ports:{in:['task'],out:['result']}}
]},
{name:'AI Voice & TTS',icon:'🎙️',nodes:[
  {n:'ElevenLabs TTS',icon:'🔊',badge:'ai',desc:'800K+ Downloads · Voice AI',ports:{in:['text'],out:['audio']}},
  {n:'MCP Nodes',icon:'🔌',badge:'ai',desc:'765K+ DL · Model Context Protocol',ports:{in:['input'],out:['output']}},
  {n:'DeepSeek',icon:'🌊',badge:'ai',desc:'155K+ DL · DeepSeek Chat/Coder',ports:{in:['prompt'],out:['response']}},
  {n:'Palatine Speech',icon:'🎤',badge:'ai',desc:'134K+ DL · Transcription+Sentiment',ports:{in:['audio'],out:['text']}},
  {n:'AI Scraper',icon:'🕷️',badge:'ai',desc:'Parsera AI Web Scraping',ports:{in:['url'],out:['data']}}
]},
{name:'WhatsApp & Chat',icon:'💚',nodes:[
  {n:'Evolution API',icon:'💚',badge:'api',desc:'6.6M+ DL · WhatsApp Hub',ports:{in:['msg'],out:['sent']}},
  {n:'ChatWoot',icon:'💬',badge:'api',desc:'615K+ DL · Open Chat',ports:{in:['msg'],out:['sent']}},
  {n:'WAHA',icon:'💚',badge:'api',desc:'70K+ DL · WhatsApp HTTP API',ports:{in:['msg'],out:['sent']}},
  {n:'Quepasa',icon:'💬',badge:'api',desc:'WhatsApp Multi-Device',ports:{in:['msg'],out:['sent']}},
  {n:'WhatsAble',icon:'📱',badge:'api',desc:'WhatsApp Automation',ports:{in:['msg'],out:['sent']}}
]},
{name:'Web Scraping',icon:'🕷️',nodes:[
  {n:'Firecrawl',icon:'🔥',badge:'api',desc:'283K+ DL · Web Crawler',ports:{in:['url'],out:['data']}},
  {n:'Puppeteer',icon:'🎭',badge:'api',desc:'33K+ DL · Browser Automation',ports:{in:['config'],out:['result']}},
  {n:'SerpAPI',icon:'🔍',badge:'api',desc:'21K+ DL · Google Search API',ports:{in:['query'],out:['results']}},
  {n:'Brave Search',icon:'🦁',badge:'api',desc:'105K+ DL · Search API',ports:{in:['query'],out:['results']}},
  {n:'Tavily',icon:'🔎',badge:'api',desc:'77K+ DL · AI Web Search',ports:{in:['query'],out:['results']}},
  {n:'Browserless',icon:'🖥️',badge:'api',desc:'Headless Chrome API',ports:{in:['config'],out:['result']}}
]},
{name:'Docker & Infra',icon:'🐳',nodes:[
  {n:'Docker Run',icon:'🐳',badge:'docker',desc:'Container starten',ports:{in:['trigger'],out:['status']}},
  {n:'PostgreSQL',icon:'🐘',badge:'db',desc:'SQL Query',ports:{in:['query'],out:['rows']}},
  {n:'Redis',icon:'🔴',badge:'db',desc:'Cache',ports:{in:['key'],out:['value']}},
  {n:'MongoDB',icon:'🍃',badge:'db',desc:'Document DB',ports:{in:['filter'],out:['docs']}},
  {n:'SSH Command',icon:'🔒',badge:'docker',desc:'Remote Execute',ports:{in:['cmd'],out:['output']}},
  {n:'HTTP Request',icon:'🌐',badge:'api',desc:'REST API',ports:{in:['config'],out:['response']}},
  {n:'Minio S3',icon:'⚡',badge:'docker',desc:'15K+ DL · S3 Storage',ports:{in:['data'],out:['url']}}
]},
{name:'Communication',icon:'💬',nodes:[
  {n:'Telegram Send',icon:'✈️',badge:'api',desc:'Nachricht senden',ports:{in:['msg'],out:['sent']}},
  {n:'Slack',icon:'💜',badge:'api',desc:'Channel Message',ports:{in:['msg'],out:['sent']}},
  {n:'Email Send',icon:'📧',badge:'api',desc:'SMTP senden',ports:{in:['mail'],out:['sent']}},
  {n:'Discord',icon:'🎮',badge:'api',desc:'Bot Message',ports:{in:['msg'],out:['sent']}},
  {n:'WeCom',icon:'🏢',badge:'api',desc:'WeChat Work',ports:{in:['msg'],out:['sent']}},
  {n:'Feishu',icon:'🐦',badge:'api',desc:'Feishu/Lark',ports:{in:['msg'],out:['sent']}}
]},
{name:'Data & Logic',icon:'🛠️',nodes:[
  {n:'Google Sheets',icon:'📊',badge:'api',desc:'Spreadsheet',ports:{in:['data'],out:['rows']}},
  {n:'Notion',icon:'📝',badge:'api',desc:'Pages/DB',ports:{in:['data'],out:['pages']}},
  {n:'Airtable',icon:'📋',badge:'api',desc:'Database',ports:{in:['data'],out:['rows']}},
  {n:'Code (JS)',icon:'💻',badge:'api',desc:'Custom Code',ports:{in:['input'],out:['output']}},
  {n:'Set Data',icon:'📦',badge:'api',desc:'Transform',ports:{in:['input'],out:['output']}},
  {n:'IF',icon:'🔀',badge:'api',desc:'Bedingung',ports:{in:['input'],out:['true','false']}},
  {n:'Switch',icon:'🔃',badge:'api',desc:'Multi-Route',ports:{in:['input'],out:['out1','out2','out3']}},
  {n:'Merge',icon:'🔗',badge:'api',desc:'Zusammenführen',ports:{in:['in1','in2'],out:['merged']}}
]},
{name:'Cloud & API',icon:'☁️',nodes:[
  {n:'Kommo CRM',icon:'📇',badge:'api',desc:'294K+ DL · CRM API',ports:{in:['data'],out:['result']}},
  {n:'Apify',icon:'🤖',badge:'api',desc:'32K+ DL · Web Actor',ports:{in:['config'],out:['data']}},
  {n:'CloudConvert',icon:'🔄',badge:'api',desc:'22K+ DL · File Convert',ports:{in:['file'],out:['converted']}},
  {n:'PowerBI',icon:'📊',badge:'api',desc:'13K+ DL · Dashboards',ports:{in:['data'],out:['result']}},
  {n:'Instagram',icon:'📸',badge:'api',desc:'8K+ DL · Social API',ports:{in:['config'],out:['data']}},
  {n:'Binance',icon:'💰',badge:'api',desc:'7K+ DL · Crypto Exchange',ports:{in:['pair'],out:['price']}}
]},
{name:'Documents',icon:'📄',nodes:[
  {n:'QR Code Generator',icon:'📱',badge:'api',desc:'34K+ DL · Generate QR',ports:{in:['data'],out:['image']}},
  {n:'PDForge',icon:'📄',badge:'api',desc:'5K+ DL · AI PDF Generator',ports:{in:['template'],out:['pdf']}},
  {n:'Doc Generator',icon:'📋',badge:'api',desc:'Handlebars Templates',ports:{in:['data'],out:['doc']}},
  {n:'AI Media Generate',icon:'🎨',badge:'ai',desc:'5K+ DL · Image/Video AI',ports:{in:['prompt'],out:['media']}},
  {n:'PDF Toolkit',icon:'📄',badge:'api',desc:'PDF Bearbeitung',ports:{in:['pdf'],out:['result']}}
]},
{name:'DevOps',icon:'⚙️',nodes:[
  {n:'GitHub',icon:'🐙',badge:'api',desc:'GitHub API',ports:{in:['trigger'],out:['data']}},
  {n:'n8n Sub-Workflow',icon:'⚡',badge:'api',desc:'Sub-Workflow',ports:{in:['input'],out:['output']}},
  {n:'Wait',icon:'⏳',badge:'api',desc:'Pause/Delay',ports:{in:['trigger'],out:['continue']}},
  {n:'Twitch',icon:'🟣',badge:'api',desc:'4K+ DL · Streaming API',ports:{in:['config'],out:['data']}},
  {n:'ComfyUI',icon:'🎨',badge:'ai',desc:'7K+ DL · AI Workflow',ports:{in:['prompt'],out:['image']}}
]}
];

// ── DOCKER SERVICES (from HOOD™) ──
var DOCKER=[
{n:'n8n',icon:'⬛',desc:'Workflow Automation',port:'5678',status:'running'},
{n:'PostgreSQL',icon:'🐘',desc:'SQL Database',port:'5432',status:'running'},
{n:'Redis',icon:'🔴',desc:'Cache & Queue',port:'6379',status:'running'},
{n:'Traefik',icon:'🔥',desc:'Reverse Proxy',port:'80/443',status:'running'},
{n:'MongoDB',icon:'🍃',desc:'NoSQL DB',port:'27017',status:'stopped'},
{n:'Qdrant',icon:'🔮',desc:'Vector DB (AI)',port:'6333',status:'stopped'},
{n:'Grafana',icon:'📊',desc:'Monitoring',port:'3000',status:'stopped'},
{n:'Ollama',icon:'🦙',desc:'Local LLM',port:'11434',status:'stopped'},
{n:'Portainer',icon:'🖥️',desc:'Docker GUI',port:'9000',status:'stopped'},
{n:'Minio',icon:'⚡',desc:'S3 Storage',port:'9000',status:'stopped'},
{n:'RabbitMQ',icon:'📨',desc:'Message Queue',port:'5672',status:'stopped'},
{n:'Caddy',icon:'🟢',desc:'Webserver',port:'80',status:'stopped'},
{n:'Prometheus',icon:'🔥',desc:'Metrics',port:'9090',status:'stopped'},
{n:'Nginx',icon:'🌐',desc:'Web/Proxy',port:'80',status:'stopped'},
{n:'OpenClaw',icon:'🦀',desc:'WhatsApp Bot',port:'3000',status:'stopped'}
];

// ── SERVERS ──
var SERVERS=[
{name:'KVM 8 (n8n)',host:'kvm8',ip:'72.61.93.129',status:'pending',role:'n8n Queue Mode'},
{name:'KVM 4 (OpenClaw)',host:'openclaw',ip:'srv1368349.hstgr.cloud',status:'pending',role:'WhatsApp Bot'},
{name:'KVM 4 (Test)',host:'test-server',ip:'187.77.70.115',status:'pending',role:'Workflow Tests'}
];

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
function init(){
    renderNodeLib();renderDockerList();renderServerList();renderGuide();
    loadCatalog();resetIdle();
    log('[n8n Viewer™] v2.0 gestartet');
    log('[System] '+CATS.reduce(function(a,c){return a+c.nodes.length},0)+' Node-Typen geladen');
    log('[Docker] '+DOCKER.length+' Services verfügbar');
}

// ── CATALOG (DEEPKEEP Integration) ──
function loadCatalog(){
    // Load from n8n-catalog.js (global N8N_CATALOG)
    if(typeof N8N_CATALOG !== 'undefined' && N8N_CATALOG.length > 0){
        catalog = N8N_CATALOG;
        log('[DEEPKEEP] '+catalog.length+' Workflows aus Katalog geladen');
    } else {
        catalog = genDemoData();
        log('[Catalog] Demo-Daten geladen (Katalog nicht verfügbar)');
    }
    filteredCatalog=[].concat(catalog);
    document.getElementById('sTpl').textContent=catalog.length;
    buildTagBar();renderTemplateList();
    toast('✅ '+catalog.length+' Workflows geladen');
}

function genDemoData(){
    return[
        {i:'d1',nc:5,f:'telegram_bot.json',t:['telegramTrigger','openAi','set','telegram','stickyNote'],n:'🤖 AI Telegram Bot',tg:['ai-agent','telegram'],s:'demo'},
        {i:'d2',nc:8,f:'email_processor.json',t:['gmailTrigger','openAi','if','googleSheets','set','gmail','stickyNote','code'],n:'📧 Email Auto-Processor',tg:['google','openai'],s:'demo'},
        {i:'d3',nc:12,f:'webhook_pipeline.json',t:['webhook','httpRequest','code','if','merge','set','agent','lmChatOpenAi','notion','slack','stickyNote','respondToWebhook'],n:'🔗 Webhook Data Pipeline',tg:['http','webhook','ai-agent'],s:'demo'},
        {i:'d4',nc:6,f:'github_notifier.json',t:['githubTrigger','if','slack','telegram','set','stickyNote'],n:'🐙 GitHub Issue Notifier',tg:['github','slack','telegram'],s:'demo'},
        {i:'d5',nc:15,f:'content_creator.json',t:['scheduleTrigger','httpRequest','openAi','code','wordpress','googleDrive','set','if','merge','stickyNote','agent','lmChatOpenAi','markdown','html','convertToFile'],n:'✍️ AI Content Creator',tg:['ai-agent','openai','wordpress'],s:'demo'},
        {i:'d6',nc:7,f:'whatsapp_bot.json',t:['webhook','openAi','if','httpRequest','set','code','respondToWebhook'],n:'💚 WhatsApp AI Bot',tg:['whatsapp','ai-agent'],s:'demo'},
        {i:'d7',nc:10,f:'docker_monitor.json',t:['scheduleTrigger','sshCommand','code','if','telegram','slack','set','merge','stickyNote','httpRequest'],n:'🐳 Docker Monitor',tg:['docker','devops'],s:'demo'},
        {i:'d8',nc:9,f:'seo_checker.json',t:['scheduleTrigger','httpRequest','code','googleSheets','if','set','gmail','stickyNote','merge'],n:'🔍 SEO Health Checker',tg:['seo','google'],s:'demo'}
    ];
}

// ── NODE LIBRARY ──
function renderNodeLib(filter){
    var h='';
    CATS.forEach(function(c,ci){
        var nodes=c.nodes.filter(function(n){return!filter||n.n.toLowerCase().includes(filter.toLowerCase())});
        if(!nodes.length)return;
        h+='<div class="lib-cat"><div class="cat-head" onclick="toggleCat('+ci+')"><span class="cat-icon">'+c.icon+'</span><span class="cat-name">'+c.name+'</span><span class="cat-count">'+nodes.length+'</span><span class="cat-arrow" id="arrow-'+ci+'">▸</span></div>';
        h+='<div class="cat-body'+(ci<3?' open':'')+ '" id="cat-'+ci+'">';
        nodes.forEach(function(n){
            h+='<div class="lib-node" onclick="addNodeFromLib(\''+esc(n.n).replace(/'/g,"\\'")+'\',\''+n.icon+'\',\''+n.badge+'\',\''+esc(n.desc).replace(/'/g,"\\'")+'\','+JSON.stringify(n.ports).replace(/"/g,'&quot;')+')">';
            h+='<span class="ln-icon">'+n.icon+'</span><span class="ln-name">'+esc(n.n)+'</span><span class="ln-badge badge-'+n.badge+'">'+n.badge.toUpperCase()+'</span></div>';
        });
        h+='</div></div>';
    });
    document.getElementById('nodeLib').innerHTML=h;
}
function toggleCat(i){var b=document.getElementById('cat-'+i),a=document.getElementById('arrow-'+i);b.classList.toggle('open');a.textContent=b.classList.contains('open')?'▾':'▸';}

// ── ADD NODE ──
function addNodeFromLib(name,icon,badge,desc,ports){
    var x=300+Math.random()*400-panX,y=150+Math.random()*250-panY;
    NODES.push({id:nextId++,name:name,icon:icon,badge:badge,desc:desc,ports:ports,x:x,y:y,status:'idle'});
    renderCanvas();updateStats();
    document.getElementById('emptyState').style.display='none';
    toast('🧩 '+name+' hinzugefügt');log('[Node] '+name+' hinzugefügt (#'+(nextId-1)+')');resetIdle();
}

// ── RENDER CANVAS ──
function renderCanvas(){
    var h='';
    NODES.forEach(function(n){
        var cls='c-node';
        if(n.id===selNode)cls+=' selected';
        if(n.status==='running')cls+=' running';
        if(n.status==='done')cls+=' done';
        if(n.status==='error')cls+=' error';
        h+='<div class="'+cls+'" id="n-'+n.id+'" style="left:'+n.x+'px;top:'+n.y+'px" onmousedown="nodeDown(event,'+n.id+')" onclick="selectNode('+n.id+')">';
        h+='<div class="cn-head" style="background:linear-gradient(135deg,'+getNodeColor(n.badge)+'22,transparent)"><span class="cn-icon">'+n.icon+'</span><span class="cn-title">'+esc(n.name)+'</span>';
        h+='<button class="cn-del" onclick="event.stopPropagation();removeNode('+n.id+')">✕</button></div>';
        h+='<div class="cn-body">';
        (n.ports.in||[]).forEach(function(p){h+='<div class="cn-port port-in"><div class="port-dot" data-node="'+n.id+'" data-port="'+p+'" data-dir="in"></div><span class="port-label">'+p+'</span></div>';});
        (n.ports.out||[]).forEach(function(p){h+='<div class="cn-port port-out"><span class="port-label">'+p+'</span><div class="port-dot" data-node="'+n.id+'" data-port="'+p+'" data-dir="out"></div></div>';});
        h+='</div><div style="padding:.15rem .5rem"><span class="cn-tag badge-'+n.badge+'">'+n.badge.toUpperCase()+'</span></div></div>';
    });
    document.getElementById('nodesContainer').innerHTML=h;
    renderWires();updateMinimap();
}

function getNodeColor(badge){return{api:'#fa1e4e',ai:'#a855f7',docker:'#2496ed',db:'#336791'}[badge]||'#666';}
function removeNode(id){NODES=NODES.filter(function(n){return n.id!==id});WIRES=WIRES.filter(function(w){return w.from!==id&&w.to!==id});renderCanvas();updateStats();toast('🗑️ Node entfernt');log('[Node] #'+id+' entfernt');}
function selectNode(id){selNode=id;renderCanvas();showNodeProps(id);}

function showNodeProps(id){
    var n=NODES.find(function(x){return x.id===id});if(!n)return;
    document.getElementById('selTitle').textContent='⚙ '+n.name;
    var h='<div style="margin-bottom:.4rem"><label style="font-size:.55rem;color:var(--mt);font-weight:600">Name</label><input class="search" style="margin:2px 0;width:100%" value="'+esc(n.name)+'" onchange="renameNode('+id+',this.value)"></div>';
    h+='<div style="font-size:.6rem;color:var(--mt);margin-bottom:.3rem">'+esc(n.desc)+'</div>';
    h+='<div style="margin-bottom:.2rem"><span class="ln-badge badge-'+n.badge+'" style="font-size:.55rem">'+n.badge.toUpperCase()+'</span></div>';
    h+='<div style="font-size:.55rem;color:var(--mt)">Inputs: '+(n.ports.in.join(', ')||'—')+'</div>';
    h+='<div style="font-size:.55rem;color:var(--mt)">Outputs: '+(n.ports.out.join(', ')||'—')+'</div>';
    h+='<div style="font-size:.55rem;color:var(--mt);margin-top:.2rem">Status: <span style="color:'+(n.status==='done'?'var(--gr)':n.status==='error'?'var(--rd)':'var(--mt)')+'">'+n.status+'</span></div>';
    document.getElementById('selProps').innerHTML=h;
}
function renameNode(id,val){var n=NODES.find(function(x){return x.id===id});if(n){n.name=val;renderCanvas();}}

// ── DRAG NODES ──
function nodeDown(e,id){e.stopPropagation();dragNode=id;var el=document.getElementById('n-'+id);dragOff={x:e.clientX/zoom-el.offsetLeft,y:e.clientY/zoom-el.offsetTop};}
function canvasDown(e){if(!dragNode){isPanning=true;panStart={x:e.clientX-panX,y:e.clientY-panY};document.getElementById('canvas').classList.add('grabbing');}}
function canvasMove(e){
    if(dragNode){var nd=NODES.find(function(n){return n.id===dragNode});if(nd){nd.x=e.clientX/zoom-dragOff.x;nd.y=e.clientY/zoom-dragOff.y;var el=document.getElementById('n-'+dragNode);if(el){el.style.left=nd.x+'px';el.style.top=nd.y+'px';}renderWires();updateMinimap();}}
    else if(isPanning){panX=e.clientX-panStart.x;panY=e.clientY-panStart.y;applyTransform();}
}
function canvasUp(){dragNode=null;isPanning=false;document.getElementById('canvas').classList.remove('grabbing');}
function canvasWheel(e){e.preventDefault();var d=e.deltaY>0?-0.05:0.05;zoom=Math.max(.2,Math.min(3,zoom+d));applyTransform();}
function applyTransform(){document.getElementById('canvas').style.transform='translate('+panX+'px,'+panY+'px) scale('+zoom+')';document.getElementById('zoomLvl').textContent=Math.round(zoom*100)+'%';}

// ── WIRES ──
function autoConnect(){
    WIRES=[];
    for(var i=0;i<NODES.length-1;i++){var a=NODES[i],b=NODES[i+1];if(a.ports.out.length>0&&b.ports.in.length>0)WIRES.push({from:a.id,fPort:a.ports.out[0],to:b.id,tPort:b.ports.in[0]});}
    renderWires();updateStats();toast('🔗 '+WIRES.length+' Verbindungen');log('[Wires] '+WIRES.length+' auto-connected');
}
function renderWires(){
    var svg='';
    WIRES.forEach(function(w){
        var fe=document.getElementById('n-'+w.from),te=document.getElementById('n-'+w.to);if(!fe||!te)return;
        var x1=fe.offsetLeft+fe.offsetWidth,y1=fe.offsetTop+fe.offsetHeight/2;
        var x2=te.offsetLeft,y2=te.offsetTop+te.offsetHeight/2;
        var cx=(x1+x2)/2;
        var cls=simRunning?'wire wire-running':'wire wire-active';
        svg+='<path class="'+cls+'" d="M'+x1+','+y1+' C'+cx+','+y1+' '+cx+','+y2+' '+x2+','+y2+'"/>';
    });
    document.getElementById('wires').innerHTML=svg;
    document.getElementById('sWires').textContent=WIRES.length;
}

// ── ZOOM ──
function zoomIn(){zoom=Math.min(zoom+.15,3);applyTransform();}
function zoomOut(){zoom=Math.max(zoom-.15,.2);applyTransform();}
function zoomReset(){zoom=1;panX=0;panY=0;applyTransform();}

// ── MINIMAP ──
function updateMinimap(){
    var h='';
    NODES.forEach(function(n){var x=Math.min(n.x/15,110),y=Math.min(n.y/12,60);var cls='minimap-dot'+(n.status==='running'?' running':'');h+='<div class="'+cls+'" style="left:'+x+'px;top:'+y+'px"></div>';});
    document.getElementById('minimap').innerHTML=h;
    document.getElementById('minimapPanel').innerHTML=h;
}

// ══════════════════════════════════════
// RUN SIMULATOR
// ══════════════════════════════════════
function runSimulator(){
    if(NODES.length===0)return toast('⚠️ Keine Nodes vorhanden');
    if(simRunning)return toast('⚠️ Simulation läuft bereits');
    simRunning=true;
    document.querySelector('.btn-run').classList.add('running');
    document.querySelector('.btn-run').textContent='⏳ Running...';
    document.getElementById('simOverlay').classList.add('active');
    log('[Simulator] ▶ Start — '+NODES.length+' Nodes');
    autoConnect();

    var total=NODES.length,done=0,startTime=Date.now();
    NODES.forEach(function(n){n.status='idle';});
    renderCanvas();

    function runNext(){
        if(done>=total){finishSim(startTime);return;}
        var node=NODES[done];node.status='running';
        renderCanvas();
        document.getElementById('simStep').textContent='▶ '+node.name+' ('+(done+1)+'/'+total+')';
        document.getElementById('simProgress').style.width=((done+1)/total*100)+'%';
        document.getElementById('simTime').textContent=((Date.now()-startTime)/1000).toFixed(1)+'s';
        log('[Run] ▶ '+node.icon+' '+node.name);

        var delay=300+Math.random()*700;
        if(node.badge==='ai')delay=800+Math.random()*1200;

        setTimeout(function(){
            var success=Math.random()>0.08;
            node.status=success?'done':'error';
            if(!success)log('[Run] ❌ '+node.name+' — Error!');
            else log('[Run] ✅ '+node.name+' — OK ('+Math.round(delay)+'ms)');
            done++;renderCanvas();runNext();
        },delay);
    }
    runNext();
}

function finishSim(startTime){
    simRunning=false;
    var elapsed=((Date.now()-startTime)/1000).toFixed(1);
    var errors=NODES.filter(function(n){return n.status==='error'}).length;
    var ok=NODES.filter(function(n){return n.status==='done'}).length;
    document.querySelector('.btn-run').classList.remove('running');
    document.querySelector('.btn-run').textContent='▶ Run Simulator';
    document.getElementById('simStep').textContent='✅ Fertig — '+ok+' OK, '+errors+' Fehler';
    log('[Simulator] ✅ Fertig nach '+elapsed+'s — '+ok+' OK, '+errors+' Fehler');
    toast(errors?'⚠️ Simulation fertig: '+errors+' Fehler':'✅ Simulation erfolgreich: '+elapsed+'s');
    setTimeout(function(){document.getElementById('simOverlay').classList.remove('active');},3000);
    renderCanvas();
}

// ══════════════════════════════════════
// TEMPLATE LIST
// ══════════════════════════════════════
function buildTagBar(){
    var tc={};catalog.forEach(function(w){(w.tg||[]).forEach(function(t){tc[t]=(tc[t]||0)+1;});});
    var top=Object.entries(tc).sort(function(a,b){return b[1]-a[1]}).slice(0,12);
    var h='<span class="tag '+(!activeTag?'active':'')+'" onclick="setTag(null)">Alle</span>';
    top.forEach(function(t){h+='<span class="tag '+(activeTag===t[0]?'active':'')+'" onclick="setTag(\''+esc(t[0])+'\')">'+esc(t[0])+' ('+t[1]+')</span>';});
    document.getElementById('tagBar').innerHTML=h;
}
function setTag(t){activeTag=t;filterAll();buildTagBar();}

function filterAll(){
    var q=(document.getElementById('searchInput').value||'').toLowerCase().trim();
    filteredCatalog=catalog.filter(function(w){
        var ms=!q||(w.n||'').toLowerCase().includes(q)||(w.t||[]).some(function(t){return t.toLowerCase().includes(q)})||(w.tg||[]).some(function(t){return t.toLowerCase().includes(q)});
        var mt=!activeTag||(w.tg||[]).includes(activeTag);
        return ms&&mt;
    });
    renderTemplateList();
}

function renderTemplateList(){
    var items=filteredCatalog.slice(0,200),h='';
    items.forEach(function(wf,i){
        var name=esc(wf.n||wf.f||'Unbekannt');
        var tags=(wf.tg||[]).slice(0,3);
        var tagHtml=tags.map(function(t){var c=t.includes('ai')?'ai':t.includes('telegram')||t.includes('whatsapp')||t.includes('comm')?'comm':t.includes('docker')||t.includes('devops')?'devops':'data';return'<span class="wf-tag '+c+'">'+esc(t)+'</span>';}).join('');
        var stars=wf.st||wf.stars||3;
        var starHtml='<span class="wf-stars">'+('★'.repeat(stars)+'☆'.repeat(5-stars))+'</span>';
        h+='<div class="wf-item" onclick="loadTemplate('+i+')" ondblclick="showDetail('+i+')" style="animation-delay:'+(i*10)+'ms" title="Doppelklick für Details">';
        h+='<div style="display:flex;justify-content:space-between;align-items:center"><div class="wf-name">'+name+'</div>'+starHtml+'</div>';
        h+='<div class="wf-meta"><span class="wf-nodes">🧩 '+(wf.nc||0)+'</span><span>'+esc(wf.s||'tpl')+'</span><span class="wf-icons">'+(wf.icons||wf.catIcons||'')+'</span></div>';
        h+=(tagHtml?'<div class="wf-tags">'+tagHtml+'</div>':'')+'</div>';
    });
    document.getElementById('tplList').innerHTML=h;
    document.getElementById('wfCount').textContent=filteredCatalog.length+' / '+catalog.length+' Workflows';
}

function loadTemplate(idx){
    var wf=filteredCatalog[idx];if(!wf)return;
    NODES=[];WIRES=[];nextId=1;selNode=null;
    document.getElementById('emptyState').style.display='none';
    var nodes=wf.t||[];
    var cols=Math.min(4,Math.ceil(Math.sqrt(nodes.length)));
    nodes.forEach(function(type,i){
        var col=i%cols,row=Math.floor(i/cols);
        var cat=findNodeDef(type);
        NODES.push({id:nextId++,name:cat?cat.n:type,icon:cat?cat.icon:'⬡',badge:cat?cat.badge:'api',desc:cat?cat.desc:type,ports:cat?cat.ports:{in:i>0?['input']:[],out:i<nodes.length-1?['output']:[]},x:150+col*230,y:100+row*150,status:'idle'});
    });
    autoConnect();renderCanvas();updateStats();
    toast('⚡ '+esc(wf.n||wf.f)+' geladen');log('[Template] '+esc(wf.n||wf.f)+' — '+nodes.length+' Nodes');resetIdle();
}

function findNodeDef(type){
    var t=type.toLowerCase();
    for(var ci=0;ci<CATS.length;ci++){for(var ni=0;ni<CATS[ci].nodes.length;ni++){if(CATS[ci].nodes[ni].n.toLowerCase().replace(/\s/g,'').includes(t.replace(/\s/g,'')))return CATS[ci].nodes[ni];}}
    return null;
}

// ── DOCKER LIST ──
function renderDockerList(){
    var h='';DOCKER.forEach(function(d){
        h+='<div class="svc '+(d.status==='running'?'running':'stopped')+'" onclick="addDockerNode(\''+esc(d.n)+'\')">';
        h+='<span class="svc-icon">'+d.icon+'</span><div class="svc-info"><div class="svc-name">'+esc(d.n)+'</div><div class="svc-desc">'+esc(d.desc)+'</div></div>';
        h+='<div class="svc-dot '+(d.status==='running'?'on':'off')+'"></div></div>';
    });
    document.getElementById('dockerList').innerHTML=h;
}
function addDockerNode(name){
    var d=DOCKER.find(function(x){return x.n===name});
    addNodeFromLib(name,d?d.icon:'🐳','docker',d?d.desc+' :'+d.port:name,{in:['trigger'],out:['status']});
}

// ── SERVER LIST ──
function renderServerList(){
    var h='';SERVERS.forEach(function(s){
        h+='<div class="srv-card '+(s.status==='online'?'connected':'')+'"><span class="svc-icon">🖥️</span><div class="svc-info"><div class="svc-name">'+esc(s.name)+'</div><div class="svc-desc">'+esc(s.role)+' — '+esc(s.ip)+'</div></div>';
        h+='<div class="svc-dot '+(s.status==='online'?'on':'off')+'"></div></div>';
    });
    document.getElementById('serverList').innerHTML=h;
}

// ══════════════════════════════════════
// GUIDE
// ══════════════════════════════════════
function renderGuide(){
    var h='';
    h+='<div class="guide-section"><div class="guide-title">⚡ n8n Viewer™ v2.0</div><div class="guide-text">Visueller Workflow Viewer und Builder mit Run-Simulator, Docker H00D™ Integration und 4.600+ Templates.</div></div>';
    h+='<div class="guide-section"><div class="guide-title">🧩 Nodes hinzufügen</div><div class="guide-text">Klicke auf einen Node in der Bibliothek (Nodes-Tab) oder einen Docker-Service (Docker-Tab) um ihn auf den Canvas zu platzieren.</div></div>';
    h+='<div class="guide-section"><div class="guide-title">📋 Templates laden</div><div class="guide-text">Wechsle zum Templates-Tab und klicke auf ein Template. Die Suche filtert nach Name, Node-Typ und Tags.</div></div>';
    h+='<div class="guide-section"><div class="guide-title">▶ Run Simulator</div><div class="guide-text">Klicke auf "▶ Run Simulator" um den Workflow visuell durchlaufen zu lassen. Jeder Node wird nacheinander ausgeführt mit Timing und Status.</div></div>';
    h+='<div class="guide-section"><div class="guide-title">🐳 Docker Integration</div><div class="guide-text">Docker-Tab zeigt alle Services aus H00D™. Server-Status für KVM 8 (n8n), KVM 4 (OpenClaw) und Test-Server.</div></div>';
    h+='<div class="guide-section"><div class="guide-title">⌨️ Shortcuts</div>';
    [['Ctrl+E','Export JSON'],['Ctrl+I','Import JSON'],['Ctrl+F','Suche fokussieren'],['Ctrl+R','Run Simulator'],['Ctrl+A','Auto Connect'],['Esc','Abbrechen/Schließen'],['Mausrad','Zoom'],['Drag Canvas','Verschieben']].forEach(function(s){
        h+='<div class="guide-shortcut"><span class="guide-key">'+s[0]+'</span><span class="guide-desc">'+s[1]+'</span></div>';
    });
    h+='</div>';
    h+='<div class="guide-section"><div class="guide-title">📦 DEEPKEEP Archive</div><div class="guide-text">4 ZIP-Archive mit 790MB n8n Templates:<br>• n8n-master.zip (44MB)<br>• n8n-workflow-templates-main.zip (7MB)<br>• n8n-workflow-manager-main.zip (71KB)<br>• n8nworkflows.xyz-main.zip (741MB)</div></div>';
    document.getElementById('guideContent').innerHTML=h;
}

// ══════════════════════════════════════
// TOOLBAR ACTIONS
// ══════════════════════════════════════
function clearCanvas(){NODES=[];WIRES=[];selNode=null;nextId=1;renderCanvas();updateStats();document.getElementById('emptyState').style.display='';toast('🗑️ Canvas geleert');log('[Canvas] geleert');}
function exportWorkflow(){
    var wf={name:'n8n Viewer Export',version:'2.0',nodes:NODES,wires:WIRES,created:new Date().toISOString()};
    var blob=new Blob([JSON.stringify(wf,null,2)],{type:'application/json'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='n8n_workflow_'+Date.now()+'.json';a.click();
    toast('📤 Workflow exportiert');log('[Export] JSON gespeichert');
}
function importWorkflow(){
    var inp=document.createElement('input');inp.type='file';inp.accept='.json';
    inp.onchange=async function(e){
        var f=e.target.files[0];if(!f)return;
        try{var txt=await f.text();var data=JSON.parse(txt);
            if(data.nodes&&Array.isArray(data.nodes)&&data.nodes[0]&&data.nodes[0].type){loadN8nJson(data);}
            else if(data.nodes&&data.wires){NODES=data.nodes;WIRES=data.wires;nextId=Math.max.apply(null,NODES.map(function(n){return n.id}))+1;renderCanvas();updateStats();}
            document.getElementById('emptyState').style.display='none';
            toast('📥 Importiert: '+(data.nodes||[]).length+' Nodes');log('[Import] '+f.name);
        }catch(err){toast('❌ Import fehlgeschlagen');log('[Import] ERROR: '+err.message);}
    };inp.click();
}
function loadN8nJson(data){
    NODES=[];WIRES=[];nextId=1;
    (data.nodes||[]).forEach(function(node,i){
        var type=node.type||'unknown',name=node.name||type;
        var cat=findNodeDef(type.split('.').pop());
        NODES.push({id:nextId++,name:name,icon:cat?cat.icon:'⬡',badge:cat?cat.badge:'api',desc:type,ports:cat?cat.ports:{in:i>0?['input']:[],out:i<data.nodes.length-1?['output']:[]},x:node.position?node.position[0]:150+(i%4)*230,y:node.position?node.position[1]:100+Math.floor(i/4)*150,status:'idle'});
    });
    autoConnect();renderCanvas();updateStats();
}

// ── TABS ──
function showSideTab(t){
    document.querySelectorAll('.side-l .stab').forEach(function(b){b.classList.remove('active')});
    document.querySelectorAll('.side-l .side-panel').forEach(function(p){p.classList.remove('active')});
    event.target.classList.add('active');
    document.getElementById('tab-'+t).classList.add('active');
}
function showRightTab(t){
    document.querySelectorAll('.side-r .stab').forEach(function(b){b.classList.remove('active')});
    document.querySelectorAll('.side-r .side-panel').forEach(function(p){p.classList.remove('active')});
    event.target.classList.add('active');
    document.getElementById('tab-'+t).classList.add('active');
}

// ── SEARCH ──
function onSearch(){
    var q=document.getElementById('searchInput').value.toLowerCase();
    var activeLeft=document.querySelector('.side-l .side-panel.active');
    if(activeLeft&&activeLeft.id==='tab-nodes')renderNodeLib(q);
    else filterAll();
}

// ── STATS ──
function updateStats(){
    document.getElementById('sNodes').textContent=NODES.length;
    document.getElementById('sWires').textContent=WIRES.length;
    document.getElementById('nodeCount').textContent=NODES.length+' Nodes';
}

// ── LOG ──
function log(msg){
    var el=document.getElementById('logOutput');
    var ts=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    el.textContent+='['+ts+'] '+msg+'\n';el.scrollTop=el.scrollHeight;
}

// ── TOAST ──
function toast(m){var t=document.getElementById('toast');document.getElementById('tt').textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},3000);}

// ── IDLE ──
function resetIdle(){clearTimeout(idleTimer);document.getElementById('idleHint').classList.remove('show');idleTimer=setTimeout(showIdle,IDLE_MS);}
function showIdle(){var hints=['Wähle ein Template aus','Füge einen Docker Service hinzu','Starte den Run Simulator','Importiere eine n8n JSON-Datei','Verbinde Nodes mit Auto-Connect'];document.getElementById('idleStep').textContent=hints[Math.floor(Math.random()*hints.length)];document.getElementById('idleHint').classList.add('show');}
function dismissIdle(){document.getElementById('idleHint').classList.remove('show');resetIdle();}

// ── INFO POPUPS ──
document.addEventListener('mouseover',function(e){
    var btn=e.target.closest('.info-btn');if(!btn)return;
    var info=btn.getAttribute('data-info');if(!info)return;
    var p=document.getElementById('infoPop');
    p.innerHTML='<div class="info-pop-title">ℹ️ Info</div><div>'+esc(info)+'</div>';
    p.style.left=Math.min(e.clientX+10,window.innerWidth-280)+'px';
    p.style.top=Math.min(e.clientY-10,window.innerHeight-100)+'px';
    p.classList.add('show');
});
document.addEventListener('mouseout',function(e){if(e.target.closest('.info-btn'))document.getElementById('infoPop').classList.remove('show');});

// ── KEYBOARD ──
document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&e.key==='e'){e.preventDefault();exportWorkflow();}
    if(e.ctrlKey&&e.key==='i'){e.preventDefault();importWorkflow();}
    if(e.ctrlKey&&e.key==='f'){e.preventDefault();document.getElementById('searchInput').focus();}
    if(e.ctrlKey&&e.key==='r'){e.preventDefault();runSimulator();}
    if(e.ctrlKey&&e.key==='a'){e.preventDefault();autoConnect();}
    if(e.key==='Delete'&&selNode){removeNode(selNode);selNode=null;}
    resetIdle();
});

// ══════════════════════════════════════
// DETAIL PANEL (Pro/Contra, Stars, Tools, Anweisungen)
// ══════════════════════════════════════
function showDetail(idx){
    var wf=filteredCatalog[idx];if(!wf)return;
    var h='<div class="det-close" onclick="closeDetail()">✕</div>';
    h+='<div class="det-title">'+(wf.icons||wf.catIcons||'')+' '+esc(wf.n||wf.f)+'</div>';
    // Stars
    var s=wf.st||wf.stars||3;
    h+='<div class="det-stars">'+('★'.repeat(s)+'☆'.repeat(5-s))+' <span class="det-stars-num">'+s+'/5</span></div>';
    // Description
    h+='<div class="det-section"><div class="det-label">📋 Beschreibung</div><div class="det-text">'+esc(wf.description||wf.desc||'Keine Beschreibung')+' Nodes: '+(wf.nc||0)+', Quelle: '+esc(wf.s||'unbekannt')+'</div></div>';
    // Instructions
    if(wf.instructions)h+='<div class="det-section"><div class="det-label">📘 Anweisungen</div><div class="det-text">'+esc(wf.instructions)+'</div></div>';
    // Tools
    if(wf.tools&&wf.tools.length){h+='<div class="det-section"><div class="det-label">🛠️ Werkzeuge & Nodes ('+wf.tools.length+')</div><div class="det-tools">';
        wf.tools.forEach(function(t){h+='<div class="det-tool"><span>'+t.icon+' '+esc(t.tech)+'</span><span class="det-tool-cat">'+esc(t.cat)+'</span><span class="det-tool-stars">'+('★'.repeat(t.stars)+'☆'.repeat(5-t.stars))+'</span></div>';});
        h+='</div></div>';}
    // Techs
    if(wf.techs&&wf.techs.length){h+='<div class="det-section"><div class="det-label">⚙️ Technologien</div><div class="det-chips">';
        wf.techs.forEach(function(t){h+='<span class="det-chip">'+esc(t)+'</span>';});h+='</div></div>';}
    // Tags
    if(wf.tg&&wf.tg.length){h+='<div class="det-section"><div class="det-label">🏷️ Tags</div><div class="det-chips">';
        wf.tg.forEach(function(t){h+='<span class="det-chip tag-chip">'+esc(t)+'</span>';});h+='</div></div>';}
    // Pro/Contra
    if(wf.pros&&wf.pros.length){h+='<div class="det-section"><div class="det-label">✅ Pro</div><ul class="det-list pro">';
        wf.pros.forEach(function(p){h+='<li>'+esc(p)+'</li>';});h+='</ul></div>';}
    if(wf.contras&&wf.contras.length){h+='<div class="det-section"><div class="det-label">⚠️ Contra</div><ul class="det-list contra">';
        wf.contras.forEach(function(c){h+='<li>'+esc(c)+'</li>';});h+='</ul></div>';}
    // Complexity
    h+='<div class="det-section"><div class="det-label">📊 Komplexität</div><div class="det-bar"><div class="det-bar-fill" style="width:'+(wf.complexity||3)*20+'%"></div><span>'+(wf.complexity||3)+'/5</span></div></div>';
    // Actions
    h+='<div class="det-actions"><button class="btn btn-run" onclick="closeDetail();loadTemplate('+idx+')">⚡ Laden & Anzeigen</button><button class="btn btn-s" onclick="closeDetail();loadTemplate('+idx+');setTimeout(runSimulator,500)">▶ Laden & Simulieren</button></div>';
    document.getElementById('detailPanel').innerHTML=h;
    document.getElementById('detailOverlay').classList.add('show');
}
function closeDetail(){document.getElementById('detailOverlay').classList.remove('show');}

// ══════════════════════════════════════
// GALLERY — n8n Infographic Boards
// ══════════════════════════════════════
var GAL_BOARDS=[
    {id:1,img:'infographics/01_ai_agents.png',title:'AI Agents & LLM',desc:'GPT-4o, Claude Sonnet, Gemini, LangChain, Vector Stores — KI-gesteuerte Workflow-Automatisierung mit autonomen Agenten.',count:847,cat:'AI'},
    {id:2,img:'infographics/02_trigger_engine.png',title:'Trigger Engine',desc:'Webhooks, Cron Schedules, Email/Chat/Form Trigger — 2.485 Trigger-basierte Workflows fuer Event-driven Automation.',count:2485,cat:'Trigger'},
    {id:3,img:'infographics/03_data_pipeline.png',title:'Data Pipeline',desc:'ETL, Google Sheets, Notion, Airtable, Transform — 1.879 Data Processing Workflows fuer Daten-Migration und Transformation.',count:1879,cat:'Data'},
    {id:4,img:'infographics/04_comm_hub.png',title:'Communication Hub',desc:'Telegram, WhatsApp, Slack, Discord, Email — 1.524 Messaging-Workflows fuer Multi-Channel Kommunikation.',count:1524,cat:'Comm'},
    {id:5,img:'infographics/05_logic_engine.png',title:'Logic Engine',desc:'IF/Switch, Merge, Code (JS), Sub-Workflows — 2.479 Custom Logic Workflows fuer Business Rules und Routing.',count:2479,cat:'Logic'},
    {id:6,img:'infographics/06_devops_cloud.png',title:'DevOps & Cloud',desc:'Docker, GitHub, SSH, CI/CD, Monitoring — 892 DevOps-Workflows fuer Infrastructure-as-Code und Deployment.',count:892,cat:'DevOps'},
    {id:7,img:'infographics/07_ecosystem_overview.png',title:'Ecosystem Overview',desc:'Das komplette n8n Oekosystem: 3.815 Workflows, 11 Kategorien, 156 Node-Typen — die Gesamtuebersicht.',count:3815,cat:'Overview'},
    {id:8,img:'infographics/08_database_storage.png',title:'Database & Storage',desc:'PostgreSQL, MongoDB, Redis, S3/Minio, Qdrant — 743 Datenbank-Workflows fuer Persistenz und Caching.',count:743,cat:'Database'}
];
var galCurrent=0;

function renderGallery(){
    var h='';
    GAL_BOARDS.forEach(function(b,i){
        h+='<div class="gal-card" onclick="openLightbox('+i+')" title="'+esc(b.title)+'">';
        h+='<img class="gal-card-img" src="'+b.img+'" alt="'+esc(b.title)+'" loading="lazy">';
        h+='<div class="gal-card-overlay"></div>';
        h+='<div class="gal-card-num">'+(i+1)+'</div>';
        h+='<div class="gal-card-info">';
        h+='<div class="gal-card-title">'+esc(b.title)+'</div>';
        h+='<div class="gal-card-meta">';
        h+='<span class="gal-card-count">'+b.count.toLocaleString('de-DE')+' Workflows</span>';
        h+='<span class="gal-card-cat">'+esc(b.cat)+'</span>';
        h+='</div></div></div>';
    });
    var el=document.getElementById('galGrid');
    if(el) el.innerHTML=h;
}

function openLightbox(idx){
    galCurrent=idx;
    var b=GAL_BOARDS[idx];if(!b)return;
    document.getElementById('galLbImg').src=b.img;
    document.getElementById('galLbImg').alt=b.title;
    document.getElementById('galLbTitle').textContent=b.title;
    document.getElementById('galLbDesc').textContent=b.desc;
    var stats='<span class="gal-lb-stat">'+b.count.toLocaleString('de-DE')+' Workflows</span>';
    stats+='<span class="gal-lb-stat">'+b.cat+'</span>';
    stats+='<span class="gal-lb-stat">Board '+(idx+1)+'/'+GAL_BOARDS.length+'</span>';
    document.getElementById('galLbStats').innerHTML=stats;
    document.getElementById('galLightbox').classList.add('show');
    log('[Gallery] '+b.title+' geoeffnet');
}

function closeLightbox(){document.getElementById('galLightbox').classList.remove('show');}

function galNav(dir){
    galCurrent=(galCurrent+dir+GAL_BOARDS.length)%GAL_BOARDS.length;
    openLightbox(galCurrent);
}

// Keyboard for lightbox
document.addEventListener('keydown',function(e){
    if(!document.getElementById('galLightbox').classList.contains('show'))return;
    if(e.key==='Escape')closeLightbox();
    if(e.key==='ArrowLeft')galNav(-1);
    if(e.key==='ArrowRight')galNav(1);
});

// ── INIT ──
document.addEventListener('DOMContentLoaded',function(){
    init();
    renderGallery();
});


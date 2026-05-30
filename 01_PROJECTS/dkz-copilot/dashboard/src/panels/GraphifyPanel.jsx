import { useState, useEffect, useRef, useCallback } from 'react'

const CAT_COLORS = {
  output:'#3b82f6', backend:'#8b5cf6', git:'#f59e0b', module:'#10b981',
  rules:'#ef4444', nlm:'#ec4899', design:'#06b6d4', data:'#84cc16',
  security:'#f97316', agent:'#a855f7', research:'#14b8a6', infra:'#6366f1',
  general:'#6b7280', openhumans:'#a855f7', participant:'#ec4899',
  genomics:'#06b6d4', file:'#f97316', 'class':'#3b82f6', 'function':'#00ff88',
  dependency:'#8b5cf6', actor:'#3b82f6', policy:'#fa1e4e', topic:'#00ff88', factor:'#ffb800',
  gitnexus:'#06b6d4', mirofish:'#ec4899', openhands:'#f59e0b', skill:'#10b981'
}

// Built-in graph data per source (Fallback wenn kein JSON/localStorage)
const BUILTIN_DATA = {
  playbook: {
    nodes: [
      { id:'pb-root', label:'DEVKiTZ', category:'rules', level:1 },
      { id:'pb-bmad', label:'BMAD Methodik', category:'rules', level:2 },
      { id:'pb-ralph', label:'Ralph-Loop', category:'rules', level:2 },
      { id:'pb-james', label:'James Guardian', category:'agent', level:3 },
      { id:'pb-pm', label:'DkZ PM', category:'agent', level:3 },
      { id:'pb-dev', label:'DkZ Developer', category:'agent', level:3 },
      { id:'pb-review', label:'DkZ Reviewer', category:'agent', level:3 },
      { id:'pb-test', label:'DkZ Tester', category:'agent', level:3 },
      { id:'pb-doc', label:'DkZ Dokumentar', category:'agent', level:3 },
      { id:'pb-design', label:'DkZ Design System', category:'design', level:2 },
      { id:'pb-css', label:'CSS Variables', category:'design', level:3 },
      { id:'pb-glass', label:'Glassmorphism', category:'design', level:3 },
      { id:'pb-font', label:'Inter + JetBrains', category:'design', level:3 },
      { id:'pb-shared', label:'Shared Scripts', category:'module', level:2 },
      { id:'pb-debug', label:'dkz-debug.js', category:'module', level:3 },
      { id:'pb-guide', label:'dkz-guide.js', category:'module', level:3 },
      { id:'pb-navbar', label:'dkz-navbar.js', category:'module', level:3 },
      { id:'pb-event', label:'dkz-eventlog.js', category:'module', level:3 },
      { id:'pb-gate', label:'Gateway v2', category:'backend', level:2 },
      { id:'pb-nano', label:'NanoChat Bridge', category:'backend', level:3 },
      { id:'pb-webhook', label:'Webhook Server', category:'backend', level:3 },
      { id:'pb-vps', label:'VPS KVM8', category:'infra', level:2 },
      { id:'pb-health', label:'Health System', category:'infra', level:3 },
      { id:'pb-rednote', label:'REDNOTE.json', category:'data', level:3 },
    ],
    edges: [
      { source:'pb-root', target:'pb-bmad' }, { source:'pb-root', target:'pb-ralph' },
      { source:'pb-root', target:'pb-design' }, { source:'pb-root', target:'pb-shared' },
      { source:'pb-root', target:'pb-gate' }, { source:'pb-root', target:'pb-vps' },
      { source:'pb-bmad', target:'pb-james' }, { source:'pb-bmad', target:'pb-pm' },
      { source:'pb-bmad', target:'pb-dev' }, { source:'pb-bmad', target:'pb-review' },
      { source:'pb-bmad', target:'pb-test' }, { source:'pb-bmad', target:'pb-doc' },
      { source:'pb-design', target:'pb-css' }, { source:'pb-design', target:'pb-glass' },
      { source:'pb-design', target:'pb-font' },
      { source:'pb-shared', target:'pb-debug' }, { source:'pb-shared', target:'pb-guide' },
      { source:'pb-shared', target:'pb-navbar' }, { source:'pb-shared', target:'pb-event' },
      { source:'pb-gate', target:'pb-nano' }, { source:'pb-gate', target:'pb-webhook' },
      { source:'pb-vps', target:'pb-health' }, { source:'pb-health', target:'pb-rednote' },
      { source:'pb-ralph', target:'pb-dev' }, { source:'pb-ralph', target:'pb-test' },
    ]
  },
  gitnexus: {
    nodes: [
      { id:'gn-root', label:'devkitz-workspace', category:'gitnexus', level:1 },
      { id:'gn-proj', label:'01_PROJECTS', category:'gitnexus', level:2 },
      { id:'gn-dash', label:'01_dashboard', category:'module', level:3 },
      { id:'gn-copilot', label:'dkz-copilot', category:'module', level:3 },
      { id:'gn-keep', label:'dkz-keep', category:'module', level:3 },
      { id:'gn-sys', label:'04_SYSTEM', category:'infra', level:2 },
      { id:'gn-scripts', label:'scripts/', category:'infra', level:3 },
      { id:'gn-agents', label:'.agents/', category:'agent', level:2 },
      { id:'gn-skills', label:'skills/ (53)', category:'skill', level:3 },
      { id:'gn-workflows', label:'workflows/ (77)', category:'skill', level:3 },
      { id:'gn-mods', label:'modules/ (130+)', category:'module', level:2 },
      { id:'gn-wiki', label:'devkitz-wiki', category:'module', level:3 },
      { id:'gn-kanban', label:'kanban-board', category:'module', level:3 },
      { id:'gn-graphify', label:'graphify', category:'module', level:3 },
      { id:'gn-wissen', label:'wissen-hub', category:'data', level:3 },
      { id:'gn-archive', label:'99_ARCHIVE', category:'data', level:2 },
      { id:'gn-github', label:'GitHub Actions', category:'git', level:2 },
      { id:'gn-ci', label:'CI/CD Pipeline', category:'git', level:3 },
      { id:'gn-labels', label:'Labels (26)', category:'git', level:3 },
    ],
    edges: [
      { source:'gn-root', target:'gn-proj' }, { source:'gn-root', target:'gn-sys' },
      { source:'gn-root', target:'gn-agents' }, { source:'gn-root', target:'gn-mods' },
      { source:'gn-root', target:'gn-archive' }, { source:'gn-root', target:'gn-github' },
      { source:'gn-proj', target:'gn-dash' }, { source:'gn-proj', target:'gn-copilot' },
      { source:'gn-proj', target:'gn-keep' },
      { source:'gn-sys', target:'gn-scripts' },
      { source:'gn-agents', target:'gn-skills' }, { source:'gn-agents', target:'gn-workflows' },
      { source:'gn-mods', target:'gn-wiki' }, { source:'gn-mods', target:'gn-kanban' },
      { source:'gn-mods', target:'gn-graphify' }, { source:'gn-mods', target:'gn-wissen' },
      { source:'gn-github', target:'gn-ci' }, { source:'gn-github', target:'gn-labels' },
      { source:'gn-dash', target:'gn-mods' }, { source:'gn-copilot', target:'gn-graphify' },
    ]
  },
  mirofish: {
    nodes: [
      { id:'mf-root', label:'MiroFish Sim', category:'mirofish', level:1 },
      { id:'mf-agent', label:'Agent Network', category:'agent', level:2 },
      { id:'mf-james', label:'James Node', category:'agent', level:3 },
      { id:'mf-swarm', label:'Swarm Controller', category:'agent', level:3 },
      { id:'mf-nano', label:'NanoBot Fleet', category:'agent', level:3 },
      { id:'mf-sim', label:'Simulation', category:'mirofish', level:2 },
      { id:'mf-pool', label:'Fish Pool', category:'mirofish', level:3 },
      { id:'mf-eco', label:'Ecosystem', category:'mirofish', level:3 },
      { id:'mf-data', label:'Data Feed', category:'data', level:2 },
      { id:'mf-api', label:'REST API', category:'backend', level:3 },
      { id:'mf-ws', label:'WebSocket', category:'backend', level:3 },
    ],
    edges: [
      { source:'mf-root', target:'mf-agent' }, { source:'mf-root', target:'mf-sim' },
      { source:'mf-root', target:'mf-data' },
      { source:'mf-agent', target:'mf-james' }, { source:'mf-agent', target:'mf-swarm' },
      { source:'mf-agent', target:'mf-nano' },
      { source:'mf-sim', target:'mf-pool' }, { source:'mf-sim', target:'mf-eco' },
      { source:'mf-data', target:'mf-api' }, { source:'mf-data', target:'mf-ws' },
      { source:'mf-swarm', target:'mf-nano' }, { source:'mf-pool', target:'mf-eco' },
    ]
  },
  openhands: {
    nodes: [
      { id:'oh-root', label:'OpenHands', category:'openhands', level:1 },
      { id:'oh-agent', label:'Agent Runtime', category:'agent', level:2 },
      { id:'oh-code', label:'CodeAct Agent', category:'agent', level:3 },
      { id:'oh-browse', label:'Browser Agent', category:'agent', level:3 },
      { id:'oh-plan', label:'Planner Agent', category:'agent', level:3 },
      { id:'oh-sand', label:'Sandbox', category:'infra', level:2 },
      { id:'oh-docker', label:'Docker Runtime', category:'infra', level:3 },
      { id:'oh-shell', label:'Shell Executor', category:'infra', level:3 },
      { id:'oh-vps', label:'VPS Integration', category:'infra', level:3 },
      { id:'oh-brain', label:'Second Brain', category:'research', level:2 },
      { id:'oh-obsidian', label:'Obsidian Vault', category:'research', level:3 },
      { id:'oh-daily', label:'Daily Notes', category:'research', level:3 },
      { id:'oh-logs', label:'Session Logs', category:'research', level:3 },
      { id:'oh-learn', label:'Learnings DB', category:'data', level:3 },
      { id:'oh-tasks', label:'Task Queue', category:'data', level:2 },
      { id:'oh-issues', label:'GitHub Issues', category:'git', level:3 },
      { id:'oh-prs', label:'Auto PRs', category:'git', level:3 },
    ],
    edges: [
      { source:'oh-root', target:'oh-agent' }, { source:'oh-root', target:'oh-sand' },
      { source:'oh-root', target:'oh-brain' }, { source:'oh-root', target:'oh-tasks' },
      { source:'oh-agent', target:'oh-code' }, { source:'oh-agent', target:'oh-browse' },
      { source:'oh-agent', target:'oh-plan' },
      { source:'oh-sand', target:'oh-docker' }, { source:'oh-sand', target:'oh-shell' },
      { source:'oh-sand', target:'oh-vps' },
      { source:'oh-brain', target:'oh-obsidian' }, { source:'oh-brain', target:'oh-daily' },
      { source:'oh-brain', target:'oh-logs' }, { source:'oh-brain', target:'oh-learn' },
      { source:'oh-tasks', target:'oh-issues' }, { source:'oh-tasks', target:'oh-prs' },
      { source:'oh-code', target:'oh-shell' }, { source:'oh-plan', target:'oh-tasks' },
      { source:'oh-daily', target:'oh-logs' }, { source:'oh-learn', target:'oh-obsidian' },
    ]
  },
  openhumans: {
    nodes: [
      { id:'ohu-root', label:'OpenHumans Hub', category:'openhumans', level:1 },
      { id:'ohu-data', label:'Data Sources', category:'data', level:2 },
      { id:'ohu-genome', label:'Genomics', category:'genomics', level:3 },
      { id:'ohu-fitness', label:'Fitness API', category:'data', level:3 },
      { id:'ohu-survey', label:'Surveys', category:'data', level:3 },
      { id:'ohu-parts', label:'Participants', category:'participant', level:2 },
      { id:'ohu-dash', label:'Dashboard', category:'module', level:2 },
      { id:'ohu-viz', label:'Visualizer', category:'module', level:3 },
      { id:'ohu-export', label:'Export Engine', category:'module', level:3 },
    ],
    edges: [
      { source:'ohu-root', target:'ohu-data' }, { source:'ohu-root', target:'ohu-parts' },
      { source:'ohu-root', target:'ohu-dash' },
      { source:'ohu-data', target:'ohu-genome' }, { source:'ohu-data', target:'ohu-fitness' },
      { source:'ohu-data', target:'ohu-survey' },
      { source:'ohu-dash', target:'ohu-viz' }, { source:'ohu-dash', target:'ohu-export' },
      { source:'ohu-parts', target:'ohu-survey' }, { source:'ohu-viz', target:'ohu-genome' },
    ]
  }
}

export default function GraphifyPanel() {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [chatMsgs, setChatMsgs] = useState([{ role:'system', text:'Waehle einen Knoten und stelle eine Frage...' }])
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sources, setSources] = useState(SOURCES)
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState(null)
  const camRef = useRef({ x:0, y:0, zoom:1 })
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const simRef = useRef({ alpha:1, running:false })
  const dragRef = useRef(null)
  const panRef = useRef(null)

  // Export to Second Brain
  const exportToSecondBrain = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      sources: sources.filter(s => s.active).map(s => s.id),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      categories: [...new Set(nodes.map(n => n.category))],
      nodes: nodes.map(n => ({ id:n.id, label:n.label, category:n.category, source:n.source, level:n.level })),
      edges: edges.map(e => ({ source:e.source, target:e.target })),
    }
    localStorage.setItem('graphify_second_brain_export', JSON.stringify(data))
    localStorage.setItem('graphify_last_export', new Date().toISOString())
    setChatMsgs(prev => [...prev, { role:'system', text:`Second Brain Export: ${data.nodeCount} Knoten, ${data.edgeCount} Kanten, ${data.sources.length} Quellen gespeichert.` }])
  }, [nodes, edges, sources])

  // Load graph data from all active sources
  useEffect(() => {
    const load = async () => {
      try {
        let allNodes = [], allEdges = []
        let sourceResults = [...sources]

        // 1. Playbook JSON (try fetch, fallback to built-in)
        try {
          const r = await fetch('/modules/graphify/playbook-graph.json', { signal: AbortSignal.timeout(2000) })
          if (r.ok) {
            const data = await r.json()
            allNodes.push(...(data.nodes || []).map(n => ({ ...n, source:'playbook' })))
            allEdges.push(...(data.edges || []))
            sourceResults = sourceResults.map(s => s.id === 'playbook' ? { ...s, active:true, count: data.nodes?.length } : s)
          } else { throw new Error('fetch failed') }
        } catch {
          // Fallback: Built-in Playbook
          const pb = BUILTIN_DATA.playbook
          allNodes.push(...pb.nodes.map(n => ({ ...n, source:'playbook' })))
          allEdges.push(...pb.edges)
          sourceResults = sourceResults.map(s => s.id === 'playbook' ? { ...s, active:true, count: pb.nodes.length } : s)
        }

        // 2. localStorage imports OR built-in fallback
        for (const src of sources.filter(s => s.storageKey)) {
          try {
            const raw = localStorage.getItem(src.storageKey)
            if (raw) {
              const data = JSON.parse(raw)
              const importNodes = (data.nodes || []).map(n => ({ ...n, source: src.id, category: n.category || src.id }))
              allNodes.push(...importNodes)
              allEdges.push(...(data.edges || []))
              sourceResults = sourceResults.map(s => s.id === src.id ? { ...s, active:true, count: importNodes.length } : s)
            } else if (BUILTIN_DATA[src.id]) {
              // Fallback: Built-in data
              const bd = BUILTIN_DATA[src.id]
              allNodes.push(...bd.nodes.map(n => ({ ...n, source: src.id })))
              allEdges.push(...bd.edges)
              sourceResults = sourceResults.map(s => s.id === src.id ? { ...s, active:true, count: bd.nodes.length } : s)
            }
          } catch {}
        }

        const nodeList = allNodes.map((n, i) => ({
          ...n, id: n.id || `n-${i}`,
          x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000,
          vx: 0, vy: 0,
          radius: n.level === 1 ? 18 : n.level === 2 ? 12 : n.level === 3 ? 8 : 6,
          visible: true
        }))

        nodesRef.current = nodeList
        edgesRef.current = allEdges
        setNodes(nodeList)
        setEdges(allEdges)
        setSources(sourceResults)
        setLoading(false)

        // Compute stats
        computeStats(nodeList, allEdges)

        simRef.current = { alpha: 1, running: true }
        requestAnimationFrame(tick)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }
    load()
  }, [])

  const computeStats = (ns, es) => {
    const catCount = {}
    const sourceCount = {}
    const levelCount = { 1:0, 2:0, 3:0, 4:0 }
    ns.forEach(n => {
      catCount[n.category] = (catCount[n.category] || 0) + 1
      sourceCount[n.source || 'unknown'] = (sourceCount[n.source || 'unknown'] || 0) + 1
      levelCount[n.level] = (levelCount[n.level] || 0) + 1
    })
    const edgeTypes = {}
    es.forEach(e => { edgeTypes[e.type || 'parent'] = (edgeTypes[e.type || 'parent'] || 0) + 1 })
    const topCats = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0, 8)
    setStats({ catCount, sourceCount, levelCount, edgeTypes, topCats, total: ns.length, totalEdges: es.length })
  }

  // Physics
  const simStep = useCallback(() => {
    const ns = nodesRef.current, es = edgesRef.current, alpha = simRef.current.alpha, N = ns.length
    for (let i = 0; i < N; i++) {
      if (!ns[i].visible) continue
      for (let j = i + 1; j < N; j++) {
        if (!ns[j].visible) continue
        let dx = ns[j].x - ns[i].x, dy = ns[j].y - ns[i].y
        let d2 = dx*dx + dy*dy + 1, f = 300*alpha/d2
        ns[i].vx -= dx*f; ns[i].vy -= dy*f; ns[j].vx += dx*f; ns[j].vy += dy*f
      }
    }
    const map = {}; ns.forEach(n => map[n.id] = n)
    es.forEach(e => {
      const s = map[e.source], t = map[e.target]
      if (!s || !t || !s.visible || !t.visible) return
      let dx = t.x-s.x, dy = t.y-s.y, d = Math.sqrt(dx*dx+dy*dy)+1, f = (d-80)*0.005*alpha
      s.vx += dx/d*f; s.vy += dy/d*f; t.vx -= dx/d*f; t.vy -= dy/d*f
    })
    ns.forEach(n => {
      if (!n.visible) return
      n.vx -= n.x*0.001*alpha; n.vy -= n.y*0.001*alpha; n.vx *= 0.85; n.vy *= 0.85; n.x += n.vx; n.y += n.vy
    })
  }, [])

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, cam = camRef.current
    const ns = nodesRef.current, es = edgesRef.current
    ctx.clearRect(0, 0, W, H)
    ctx.save(); ctx.translate(W/2 + cam.x, H/2 + cam.y); ctx.scale(cam.zoom, cam.zoom)
    // Edges
    const map = {}; ns.forEach(n => map[n.id] = n); ctx.lineWidth = 0.5/cam.zoom
    es.forEach(e => {
      const s = map[e.source], t = map[e.target]
      if (!s || !t || !s.visible || !t.visible) return
      ctx.strokeStyle = e.type === 'cross-reference' ? 'rgba(250,30,78,0.3)' : 'rgba(255,255,255,0.08)'
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke()
    })
    // Nodes
    ns.forEach(n => {
      if (!n.visible) return
      const col = CAT_COLORS[n.category] || '#6b7280'
      const isSel = selected && selected.id === n.id
      // Glow for selected
      if (isSel) {
        ctx.shadowColor = '#fa1e4e'; ctx.shadowBlur = 20
      }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI*2)
      ctx.fillStyle = isSel ? '#fff' : col; ctx.globalAlpha = 0.85; ctx.fill()
      if (isSel) { ctx.strokeStyle = '#fa1e4e'; ctx.lineWidth = 3/cam.zoom; ctx.stroke(); ctx.shadowBlur = 0 }
      ctx.globalAlpha = 1
      // Source indicator ring
      if (n.source && n.source !== 'playbook') {
        ctx.strokeStyle = CAT_COLORS[n.source] || '#888'; ctx.lineWidth = 1.5/cam.zoom
        ctx.setLineDash([3/cam.zoom, 2/cam.zoom]); ctx.beginPath(); ctx.arc(n.x, n.y, n.radius+3, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([])
      }
      // Labels
      if (cam.zoom > 0.4 || n.level <= 2) {
        ctx.fillStyle = isSel ? '#fff' : 'rgba(232,232,236,0.7)'
        ctx.font = `${Math.max(9, 11/cam.zoom)}px Inter`; ctx.textAlign = 'center'
        const label = n.title.length > 30 ? n.title.substring(0, 28)+'...' : n.title
        ctx.fillText(label, n.x, n.y + n.radius + 12/cam.zoom)
      }
    })
    ctx.restore()
  }, [selected])

  const tick = useCallback(() => {
    if (!simRef.current.running) return
    for (let i = 0; i < 3; i++) simStep()
    simRef.current.alpha *= 0.995
    if (simRef.current.alpha < 0.001) { simRef.current.running = false; simRef.current.alpha = 0 }
    draw(); requestAnimationFrame(tick)
  }, [simStep, draw])

  // Resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current; if (!canvas) return
      const wrap = canvas.parentElement; canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight; draw()
    }
    resize(); window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  // Mouse
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const s2w = (sx, sy) => ({ x: (sx-canvas.width/2-camRef.current.x)/camRef.current.zoom, y: (sy-canvas.height/2-camRef.current.y)/camRef.current.zoom })
    const findN = (wx, wy) => { for (let i = nodesRef.current.length-1; i >= 0; i--) { const n = nodesRef.current[i]; if (!n.visible) continue; if ((n.x-wx)**2+(n.y-wy)**2 < (n.radius+4)**2) return n } return null }
    const onDown = e => { const r = canvas.getBoundingClientRect(); const w = s2w(e.clientX-r.left, e.clientY-r.top); const n = findN(w.x, w.y); if (n) { setSelected(n); dragRef.current = { node:n, ox:n.x-w.x, oy:n.y-w.y } } else { panRef.current = { sx:e.clientX-camRef.current.x, sy:e.clientY-camRef.current.y } } }
    const onMove = e => { const r = canvas.getBoundingClientRect(); const w = s2w(e.clientX-r.left, e.clientY-r.top); if (dragRef.current) { const n = dragRef.current.node; n.x = w.x+dragRef.current.ox; n.y = w.y+dragRef.current.oy; if (!simRef.current.running) draw() } else if (panRef.current) { camRef.current.x = e.clientX-panRef.current.sx; camRef.current.y = e.clientY-panRef.current.sy; if (!simRef.current.running) draw() } else { canvas.style.cursor = findN(w.x, w.y) ? 'pointer' : 'grab' } }
    const onUp = () => { dragRef.current = null; panRef.current = null }
    const onWheel = e => { e.preventDefault(); camRef.current.zoom = Math.max(0.1, Math.min(5, camRef.current.zoom*(e.deltaY < 0 ? 1.1 : 0.9))); if (!simRef.current.running) draw() }
    canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseup', onUp); canvas.addEventListener('wheel', onWheel, { passive:false })
    return () => { canvas.removeEventListener('mousedown', onDown); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseup', onUp); canvas.removeEventListener('wheel', onWheel) }
  }, [draw])

  // Filter
  useEffect(() => {
    nodesRef.current.forEach(n => { let vis = true; if (filter && n.category !== filter) vis = false; if (search && !n.title.toLowerCase().includes(search.toLowerCase())) vis = false; n.visible = vis })
    if (!simRef.current.running) draw()
  }, [filter, search, draw])

  // Chat
  const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim(); setChatInput('')
    setChatMsgs(p => [...p, { role:'user', text:msg }])
    const context = selected ? `Kontext: "${selected.title}" [${selected.category}] Source: ${selected.source||'playbook'}\n${selected.content_preview || ''}\n\nFrage: ${msg}` : msg
    setChatMsgs(p => [...p, { role:'system', text:'Denke nach...' }])
    try {
      const r = await fetch(CHAT_API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message:context, max_tokens:500 }), signal:AbortSignal.timeout(8000) })
      const data = await r.json()
      setChatMsgs(p => [...p.slice(0,-1), { role:'ai', text: data.response || data.content || JSON.stringify(data) }])
    } catch { setChatMsgs(p => [...p.slice(0,-1), { role:'system', text:'API offline — NanoChat (3040) nicht erreichbar.' }]) }
  }

  const categories = [...new Set(nodesRef.current.map(n => n.category))].sort()

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-center"><div className="text-4xl mb-3 animate-pulse-dot">{'\ud83d\udcc8'}</div><div className="text-sm" style={{color:'var(--color-text-dim)'}}>Graphify laedt...</div></div></div>
  if (error) return <div className="glass-card text-center py-8"><div className="text-3xl mb-3">{'\u26a0\ufe0f'}</div><div className="text-sm font-semibold mb-2">Graphify Fehler</div><div className="text-xs" style={{color:'var(--color-text-dim)'}}>{error}</div></div>

  return (
    <div className="flex flex-col" style={{height:'calc(100vh - 130px)'}}>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-wrap" style={{borderColor:'var(--color-border)', background:'rgba(18,18,24,0.6)', backdropFilter:'blur(12px)'}}>
        <span className="text-sm font-bold" style={{color:'var(--color-accent)'}}>{'\u25c6'} Graphify</span>

        {/* Source Badges */}
        <div className="flex gap-1">
          {sources.filter(s => s.active).map(s => (
            <span key={s.id} className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:`${CAT_COLORS[s.id] || '#666'}20`, color:CAT_COLORS[s.id] || '#888', border:`1px solid ${CAT_COLORS[s.id] || '#666'}40`}}>
              {s.icon} {s.label} {s.count ? `(${s.count})` : ''}
            </span>
          ))}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="px-3 py-1 rounded-lg text-xs outline-none" style={{background:'rgba(0,0,0,0.3)', border:'1px solid var(--color-border)', color:'var(--color-text)', width:140}} />

        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilter(null)} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${!filter ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)]'}`}>Alle</button>
          {categories.slice(0, 10).map(c => (
            <button key={c} onClick={() => setFilter(f => f === c ? null : c)} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{ borderColor: filter === c ? CAT_COLORS[c] : 'var(--color-border)', color: filter === c ? CAT_COLORS[c] : 'var(--color-text-dim)', background: filter === c ? `${CAT_COLORS[c]}15` : 'transparent' }}>
              {c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportToSecondBrain} className="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all hover:border-[var(--color-neon-green)]" style={{borderColor:'var(--color-border)', color:'var(--color-text-dim)'}} title="Graph nach Second Brain exportieren">{'\ud83e\udde0'} Brain</button>
          <button onClick={() => { setChatMsgs(prev => [...prev, { role:'system', text:'MiroFish Chat verbunden (Port 3041). Frag mich ueber Agenten, Ecosystem oder Simulation.' }]) }} className="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all hover:border-[#ec4899]" style={{borderColor:'var(--color-border)', color:'#ec4899'}} title="MiroFish Chat oeffnen">{'\ud83d\udc1f'} MiroChat</button>
          <button onClick={() => { setChatMsgs(prev => [...prev, { role:'system', text:'GitNexus Chat verbunden (Port 3042). Frag mich ueber Commits, Branches, Issues oder Struktur.' }]) }} className="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all hover:border-[#06b6d4]" style={{borderColor:'var(--color-border)', color:'#06b6d4'}} title="GitNexus Chat oeffnen">{'\ud83d\udd0d'} GitNexus</button>
          <button onClick={() => setShowStats(s => !s)} className="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all hover:border-[var(--color-accent)]" style={{borderColor:'var(--color-border)', color: showStats ? 'var(--color-accent)' : 'var(--color-text-dim)'}}>{'\ud83d\udcca'} Stats</button>
          <span className="text-xs" style={{color:'var(--color-text-dim)'}}>
            <span style={{color:'var(--color-neon-green)', fontWeight:600}}>{nodes.length}</span> N · <span style={{color:'var(--color-neon-green)', fontWeight:600}}>{edges.length}</span> E
          </span>
        </div>
      </div>

      {/* Stats Overlay */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 py-2 border-b" style={{borderColor:'var(--color-border)', background:'rgba(18,18,24,0.8)', backdropFilter:'blur(12px)'}}>
          {/* Top Categories */}
          <div className="glass-card p-2">
            <div className="text-[10px] font-bold mb-1" style={{color:'var(--color-text-dim)'}}>Top Kategorien</div>
            {stats.topCats.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-1 text-[10px] mb-0.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:CAT_COLORS[cat]||'#666'}} />
                <span className="flex-1 truncate">{cat}</span>
                <span className="font-bold" style={{color:CAT_COLORS[cat]||'#888'}}>{count}</span>
              </div>
            ))}
          </div>
          {/* Sources */}
          <div className="glass-card p-2">
            <div className="text-[10px] font-bold mb-1" style={{color:'var(--color-text-dim)'}}>Quellen</div>
            {Object.entries(stats.sourceCount).map(([src, count]) => (
              <div key={src} className="flex items-center gap-1 text-[10px] mb-0.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:CAT_COLORS[src]||'#666'}} />
                <span className="flex-1 truncate">{src}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
          {/* Levels */}
          <div className="glass-card p-2">
            <div className="text-[10px] font-bold mb-1" style={{color:'var(--color-text-dim)'}}>Ebenen</div>
            {Object.entries(stats.levelCount).filter(([,v]) => v > 0).map(([lvl, count]) => (
              <div key={lvl} className="flex justify-between text-[10px] mb-0.5">
                <span>Level {lvl}</span>
                <span className="font-bold" style={{color:'var(--color-neon-green)'}}>{count}</span>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="glass-card p-2 flex flex-col items-center justify-center">
            <div className="text-2xl font-black" style={{color:'var(--color-accent)'}}>{stats.total}</div>
            <div className="text-[10px]" style={{color:'var(--color-text-dim)'}}>Knoten</div>
            <div className="text-lg font-bold mt-1" style={{color:'var(--color-neon-green)'}}>{stats.totalEdges}</div>
            <div className="text-[10px]" style={{color:'var(--color-text-dim)'}}>Kanten</div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative" style={{background:'var(--color-bg)'}}>
          <canvas ref={canvasRef} style={{display:'block', width:'100%', height:'100%', cursor:'grab'}} />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button onClick={() => { camRef.current.zoom = Math.min(5, camRef.current.zoom*1.3); draw() }} className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm" style={{background:'rgba(18,18,24,0.9)', borderColor:'var(--color-border)', color:'var(--color-text)'}}>+</button>
            <button onClick={() => { camRef.current.zoom = Math.max(0.1, camRef.current.zoom/1.3); draw() }} className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm" style={{background:'rgba(18,18,24,0.9)', borderColor:'var(--color-border)', color:'var(--color-text)'}}>{'\u2212'}</button>
            <button onClick={() => { camRef.current = {x:0,y:0,zoom:1}; setFilter(null); setSearch(''); draw() }} className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm" style={{background:'rgba(18,18,24,0.9)', borderColor:'var(--color-border)', color:'var(--color-text)'}}>{'\u2302'}</button>
          </div>
          <div className="absolute bottom-2 left-2 flex gap-2 flex-wrap px-2 py-1 rounded-lg" style={{background:'rgba(6,6,8,0.7)', backdropFilter:'blur(8px)'}}>
            {Object.entries(CAT_COLORS).filter(([k]) => nodes.some(n => n.category === k)).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1 text-[9px] cursor-pointer hover:opacity-100 transition-opacity" style={{color:'var(--color-text-dim)', opacity:0.7}} onClick={() => setFilter(f => f === k ? null : k)}>
                <div className="w-2 h-2 rounded-full" style={{background:v}} /> {k}
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-72 border-l overflow-y-auto p-3 flex-shrink-0" style={{background:'rgba(18,18,24,0.92)', backdropFilter:'blur(16px)', borderColor:'var(--color-border)'}}>
          {!selected ? (
            <div className="text-center py-6 text-xs" style={{color:'var(--color-text-dim)'}}>
              <div className="text-3xl mb-3">{'\ud83d\udcca'}</div>Klicke einen Knoten
              {/* Quick Import */}
              <div className="mt-6 border-t pt-4" style={{borderColor:'var(--color-border)'}}>
                <div className="text-[10px] font-bold mb-2">{'\ud83d\udd17'} Daten importieren</div>
                {SOURCES.filter(s => s.storageKey).map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-[10px] mb-1.5">
                    <span>{s.icon}</span>
                    <span className="flex-1">{s.label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px]" style={{background: localStorage.getItem(s.storageKey) ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)', color: localStorage.getItem(s.storageKey) ? 'var(--color-neon-green)' : 'var(--color-text-dim)'}}>
                      {localStorage.getItem(s.storageKey) ? 'Ready' : 'Empty'}
                    </span>
                  </div>
                ))}
                <div className="text-[9px] mt-2 italic" style={{color:'var(--color-text-dim)'}}>
                  {'\u2192'} Export in GitNexus / MiroFish / OpenHumans ausloesen
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white" style={{background:CAT_COLORS[selected.category]||'#666'}}>{selected.category}</span>
                {selected.source && selected.source !== 'playbook' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{background:`${CAT_COLORS[selected.source]||'#666'}20`, color:CAT_COLORS[selected.source]||'#888'}}>{selected.source}</span>
                )}
                <span className="text-[10px]" style={{color:'var(--color-text-dim)'}}>L{selected.line_start}-{selected.line_end}</span>
              </div>
              <div className="text-sm font-bold mb-2">{selected.title}</div>
              <div className="p-2 rounded-lg text-[11px] mb-3 max-h-48 overflow-y-auto" style={{background:'rgba(0,0,0,0.3)', fontFamily:'var(--font-mono)', color:'var(--color-text-dim)', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>
                {selected.content_preview || '(kein Inhalt)'}
              </div>
              {selected.children && selected.children.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold mb-2" style={{color:'var(--color-text-dim)'}}>Sub-Knoten ({selected.children.length})</div>
                  <div className="max-h-40 overflow-y-auto">
                    {selected.children.map(cid => {
                      const cn = nodesRef.current.find(n => n.id === cid)
                      if (!cn) return null
                      return <div key={cid} onClick={() => { setSelected(cn); camRef.current.x = -cn.x*camRef.current.zoom; camRef.current.y = -cn.y*camRef.current.zoom; draw() }}
                        className="px-2 py-1.5 rounded-lg text-xs cursor-pointer border mb-1 transition-all hover:border-[var(--color-accent)]" style={{borderColor:'var(--color-border)'}}>{cn.title}</div>
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Bar — Glassmorphism */}
      <div className="border-t" style={{borderColor:'rgba(250,30,78,0.15)', background:'rgba(18,18,24,0.85)', backdropFilter:'blur(16px)'}}>
        <div className="flex items-center gap-2 px-3 py-1.5 border-b text-[11px]" style={{borderColor:'var(--color-border)', color:'var(--color-text-dim)'}}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{background:'var(--color-neon-green)'}} /> Chat {'\u2014'} {selected ? `"${selected.title}"` : 'Kein Knoten'}
          {selected?.source && selected.source !== 'playbook' && <span className="px-1 py-0.5 rounded text-[8px]" style={{background:`${CAT_COLORS[selected.source]||'#666'}20`, color:CAT_COLORS[selected.source]||'#888'}}>via {selected.source}</span>}
        </div>
        <div className="max-h-28 overflow-y-auto px-3 py-1">
          {chatMsgs.map((m, i) => (
            <div key={i} className="text-xs py-0.5" style={{color: m.role === 'user' ? '#93c5fd' : m.role === 'ai' ? 'var(--color-neon-green)' : 'var(--color-text-dim)', fontStyle: m.role === 'system' ? 'italic' : 'normal'}}>
              <span className="font-bold text-[10px] mr-1" style={{fontFamily:'var(--font-mono)'}}>{m.role === 'user' ? '777' : m.role === 'ai' ? 'Bot' : 'SYS'}</span>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2 px-3 py-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder={selected ? `Frage zu "${selected.title}"...` : 'Waehle einen Knoten...'}
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{background:'rgba(0,0,0,0.3)', border:'1px solid var(--color-border)', color:'var(--color-text)'}} />
          <button onClick={sendChat} className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:shadow-lg" style={{background:'var(--color-accent)', color:'#fff', boxShadow:'0 0 15px rgba(250,30,78,0.2)'}}>Senden</button>
        </div>
      </div>
    </div>
  )
}

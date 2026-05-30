import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import DashboardPanel from './panels/DashboardPanel'
import GitHubPanel from './panels/GitHubPanel'
import IntegrationsPanel from './panels/IntegrationsPanel'
import ChatPanel from './panels/ChatPanel'
import VPSPanel from './panels/VPSPanel'
import WebhookPanel from './panels/WebhookPanel'

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'Home' },
  { id: 'github', icon: '📋', label: 'GitHub' },
  { id: 'integrations', icon: '🔌', label: 'Module' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'vps', icon: '🖥', label: 'VPS' },
  { id: 'webhooks', icon: '🔗', label: 'Hooks' },
]

const API = localStorage.getItem('dkz-copilot-api') || '/api'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [status, setStatus] = useState('idle')
  const [integrations, setIntegrations] = useState(() => {
    const saved = localStorage.getItem('dkz-integrations')
    return saved ? JSON.parse(saved) : {
      'computer-use': true, 'playwright': true, 'openhands': true,
      'openhumans': false, 'browser-use': false, 'open-manus': false,
      'pico-claw': false, 'pico-auto': false, 'swarm': true,
      'swarm-auto': true, 'mirofish': true, 'gitnexus': true,
      'second-brain': true, 'brain-auto': true, 'cloudia2': true,
      'aiaikirk': true, 'pr-agent': true, 'auto-update': true
    }
  })
  const [webhookLog, setWebhookLog] = useState([])

  // Toggle Integration
  const toggleInteg = useCallback((name, state) => {
    setIntegrations(prev => {
      const next = { ...prev, [name]: state }
      localStorage.setItem('dkz-integrations', JSON.stringify(next))
      // API call
      fetch(`${API}/integrations/toggle`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, enabled: state })
      }).catch(() => {})
      return next
    })
  }, [])

  // Local Webhook Handler
  const handleLocalWebhook = useCallback((event) => {
    const entry = {
      id: Date.now(),
      type: event.type || 'custom',
      payload: event.payload || {},
      source: 'local',
      timestamp: new Date().toISOString()
    }
    setWebhookLog(prev => [entry, ...prev].slice(0, 100))
    // Process webhook locally
    processWebhook(entry)
  }, [])

  const processWebhook = (entry) => {
    const { type, payload } = entry
    if (type === 'issue.assigned' || type === 'issue.labeled') {
      setStatus('working')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  // AutoUpdate bei Start
  useEffect(() => {
    if (integrations['auto-update']) {
      fetch(`${API}/update/check`).catch(() => {})
    }
    // Status polling
    const interval = setInterval(() => {
      fetch(`${API}/status`).then(r => r.json())
        .then(d => setStatus(d.status || 'idle'))
        .catch(() => setStatus('offline'))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Context Menu (Rechtsklick)
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('.context-trigger')) {
        e.preventDefault()
        const menu = document.getElementById('context-menu')
        if (menu) {
          menu.style.display = 'block'
          menu.style.left = e.pageX + 'px'
          menu.style.top = e.pageY + 'px'
        }
      }
    }
    const hide = () => {
      const menu = document.getElementById('context-menu')
      if (menu) menu.style.display = 'none'
    }
    document.addEventListener('contextmenu', handler)
    document.addEventListener('click', hide)
    return () => {
      document.removeEventListener('contextmenu', handler)
      document.removeEventListener('click', hide)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header status={status} onRefresh={() => fetch(`${API}/status`).catch(() => {})} />
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <main className="p-4 pb-20 max-w-4xl mx-auto animate-fade-in" key={activeTab}>
        {activeTab === 'dashboard' && <DashboardPanel status={status} integrations={integrations} />}
        {activeTab === 'github' && <GitHubPanel />}
        {activeTab === 'integrations' && <IntegrationsPanel integrations={integrations} onToggle={toggleInteg} />}
        {activeTab === 'chat' && <ChatPanel integrations={integrations} />}
        {activeTab === 'vps' && <VPSPanel />}
        {activeTab === 'webhooks' && <WebhookPanel log={webhookLog} onSend={handleLocalWebhook} />}
      </main>

      {/* Context Menu (Rechtsklick unten rechts) */}
      <div id="context-menu" className="fixed z-50 hidden glass-card p-2 min-w-48" style={{background:'rgba(6,6,8,0.95)'}}>
        <button onClick={() => fetch(`${API}/update/local`)} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5">🔄 Update jetzt</button>
        <button onClick={() => fetch(`${API}/update/vps`)} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5">🚀 VPS Update</button>
        <button onClick={() => fetch(`${API}/update/models`)} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5">🧠 LLM Models Update</button>
        <hr className="border-white/10 my-1" />
        <button onClick={() => fetch(`${API}/sync/all`)} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5">🔄 Alles synchronisieren</button>
        <button onClick={() => fetch(`${API}/health`)} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5">🏥 Health Check</button>
      </div>

      {/* Update Trigger (unten rechts) */}
      <button className="context-trigger fixed bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-lg cursor-pointer z-40 transition-all hover:scale-110"
        style={{background:'linear-gradient(135deg, #fa1e4e, #7c3aed)', boxShadow:'0 4px 20px rgba(250,30,78,0.4)'}}>
        ⚡
      </button>
    </div>
  )
}

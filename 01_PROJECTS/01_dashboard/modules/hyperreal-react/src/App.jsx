import { useState, useEffect, useRef, useCallback } from 'react'

const TITLE = 'DEVKiTZ'
const TAGLINE = 'Hyperreal UI Engine v2 — React + Tailwind'
const NF = 160
const HX = 12
const HY = 8
const STANDBY_DELAY = 4000

function rand(a, b) { return Math.random() * (b - a) + a }
function hsl(i, s, l) { return `hsl(${i}, ${s}%, ${l}%)` }

function useMouse() {
  const [m, s] = useState({ x: 0, y: 0 })
  const h = useCallback((e) => s({ x: e.clientX, y: e.clientY }), [])
  useEffect(() => { addEventListener('mousemove', h); return () => removeEventListener('mousemove', h) }, [h])
  return m
}

function useStandby(delay) {
  const [a, s] = useState(false)
  useEffect(() => {
    let t = setTimeout(() => s(true), delay)
    const r = () => { s(false); clearTimeout(t); t = setTimeout(() => s(true), delay) }
    addEventListener('mousemove', r); addEventListener('click', r)
    return () => { clearTimeout(t); removeEventListener('mousemove', r); removeEventListener('click', r) }
  }, [delay])
  return a
}

function NebulaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(250,30,78,0.15),transparent_70%)]" style={{ animation: 'nebula-float 12s ease-in-out infinite' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]" style={{ animation: 'nebula-float 16s ease-in-out infinite reverse' }} />
      <div className="absolute top-[40%] left-[50%] w-[60%] h-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.05),transparent_70%)]" style={{ animation: 'nebula-float 20s ease-in-out infinite' }} />
    </div>
  )
}

function LightRays() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-30">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute top-1/2 left-1/2 w-[1px] h-[200vh] origin-bottom"
          style={{ transform: `translate(-50%,-100%) rotate(${i * 30}deg)`, background: `linear-gradient(to top, transparent, rgba(250,30,78,${0.02 + i * 0.005}), transparent)`, animation: `hex-rotate ${20 + i * 4}s linear infinite` }} />
      ))}
    </div>
  )
}

function ParticleCanvas({ mouse }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let W, H, particles = [], raf
    function resize() { W = c.width = innerWidth; H = c.height = innerHeight }
    function init() {
      particles = Array.from({ length: NF }, () => ({
        x: rand(0, W), y: rand(0, H), vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5),
        r: rand(1, 3), s: rand(0.2, 0.8)
      }))
    }
    function draw() {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy)
        if (d < 150) { p.x -= dx * 0.02; p.y -= dy * 0.02 }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(250,30,78,${p.s})`; ctx.fill()

        particles.forEach(q => {
          if (p === q) return
          const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy)
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(250,30,78,${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    resize(); init(); draw()
    addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [mouse])
  return <canvas ref={ref} className="fixed inset-0 z-[2] pointer-events-none" />
}

function HexCanvas({ mouse }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let W, H, raf, t = 0
    function resize() { W = c.width = innerWidth; H = c.height = innerHeight }
    function draw() {
      t += 0.005
      ctx.clearRect(0, 0, W, H)
      const sz = 50, w2 = sz * Math.sqrt(3)
      for (let row = -1; row < H / sz + 1; row++) {
        for (let col = -1; col < W / w2 + 2; col++) {
          const cx = col * w2 + (row % 2) * w2 / 2, cy = row * sz * 0.75
          const dx = mouse.x - cx, dy = mouse.y - cy, d = Math.hypot(dx, dy)
          const pulse = 0.4 + 0.6 * Math.sin(t + col * 0.5 + row * 0.3)
          const near = Math.max(0, 1 - d / 250)
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const a = Math.PI / 3 * i - Math.PI / 6, x = cx + sz * 0.4 * Math.cos(a), y = cy + sz * 0.4 * Math.sin(a)
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.strokeStyle = `rgba(250,30,78,${0.06 + near * 0.2 * pulse})`
          ctx.lineWidth = 0.5 + near * 1.5; ctx.stroke()
          if (near > 0.3) {
            ctx.fillStyle = `rgba(250,30,78,${near * 0.05})`; ctx.fill()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    resize(); draw()
    addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [mouse])
  return <canvas ref={ref} className="fixed inset-0 z-[1] pointer-events-none" />
}

function Stars() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let W, H, stars = []
    function resize() { W = c.width = innerWidth; H = c.height = innerHeight; init() }
    function init() {
      stars = Array.from({ length: 200 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(0.3, 1.5), a: rand(0.3, 1) }))
    }
    function draw() {
      ctx.clearRect(0, 0, W, H)
      stars.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.a * (0.5 + 0.5 * Math.sin(Date.now() * 0.001 + s.x))})`
        ctx.fill()
      })
      requestAnimationFrame(draw)
    }
    resize(); draw()
    addEventListener('resize', resize)
    return () => removeEventListener('resize', resize)
  }, [])
  return <canvas ref={ref} className="fixed inset-0 z-[1] pointer-events-none" />
}

function NebulaFlocken() {
  const n = useRef(null)
  useEffect(() => {
    const el = n.current; if (!el) return
    const ps = el.children
    Array.from(ps).forEach(p => {
      const x = rand(0, 100), y = rand(0, 100), d = rand(10, 30), t = rand(8, 20)
      p.style.left = `${x}%`; p.style.top = `${y}%`
      p.style.width = `${d}px`; p.style.height = `${d}px`
      p.style.animationDuration = `${t}s`
    })
  }, [])
  return (
    <div ref={n} className="fixed inset-0 pointer-events-none z-[1]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(250,30,78,0.3), transparent)', filter: 'blur(8px)', animation: `nebula-float ${12 + i * 2}s ease-in-out infinite ${i * 0.5}s` }} />
      ))}
    </div>
  )
}

function Logo() {
  return (
    <h1 className="text-7xl md:text-9xl font-black tracking-tighter animate-pulse select-none"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #fa1e4e 0%, #3b82f6 50%, #00ff88 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 40px rgba(250,30,78,0.3))' }}>
      {TITLE}
    </h1>
  )
}

function Claim() {
  return (
    <p className="text-sm md:text-base text-dkz-textsec tracking-[0.3em] uppercase mt-2 font-light select-none">
      DEVKiTZ<sup className="text-dkz-accent">™</sup> <span className="text-dkz-textsec/50">|</span> {TAGLINE}
    </p>
  )
}

function AccentLine() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dkz-accent/40 to-transparent" />
      <div className="w-2 h-2 rounded-full bg-dkz-accent animate-ping" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dkz-accent/40 to-transparent" />
    </div>
  )
}

function StatusBar() {
  return (
    <div className="flex items-center gap-2 text-xs text-dkz-textsec font-mono mb-6">
      <span className="w-2 h-2 rounded-full bg-dkz-green animate-pulse inline-block" />
      <span>SYSTEM ONLINE</span>
      <span className="text-dkz-textsec/40">|</span>
      <span className="text-dkz-textsec/60">v2.4.1</span>
      <span className="text-dkz-textsec/40">|</span>
      <span className="text-dkz-textsec/60">4K @ 240fps</span>
      <div className="ml-4 h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-dkz-accent via-dkz-blue to-dkz-green animate-pulse" style={{ animationDuration: '3s' }} />
      </div>
    </div>
  )
}

function HDIcon({ type }) {
  if (type === 'sparkles') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" fill="currentColor"/><path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="currentColor" opacity="0.6"/></svg>
  )
  if (type === 'zap') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg>
  )
  if (type === 'layers') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
  )
  if (type === 'cpu') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M9 9h6v6H9z" fill="currentColor" opacity="0.3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2"/></svg>
  )
  return null
}

function RippleButton({ children, onClick, icon, color = 'accent' }) {
  const [ripples, setRipples] = useState([])
  const clr = color === 'accent' ? 'rgba(250,30,78,0.4)' : 'rgba(0,255,136,0.4)'

  function handleClick(e) {
    const r = { x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top, id: Date.now() }
    setRipples(prev => [...prev, r])
    setTimeout(() => setRipples(prev => prev.filter(rr => rr.id !== r.id)), 600)
    if (onClick) onClick(e)
  }

  return (
    <button onClick={handleClick} className="group relative px-6 py-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-dkz-text hover:text-white hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(250,30,78,0.2)] transition-all duration-300 overflow-hidden text-sm font-medium">
      {ripples.map(r => (
        <span key={r.id} className="absolute rounded-full pointer-events-none" style={{ left: r.x - 50, top: r.y - 50, width: 100, height: 100, background: `radial-gradient(circle, ${clr}, transparent)`, animation: 'ripple-expand 0.6s ease-out forwards' }} />
      ))}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <HDIcon type={icon} />}
        {children}
      </span>
    </button>
  )
}

function Explosion() {
  const [exps, setExps] = useState([])

  function explode(e) {
    const cx = e.clientX, cy = e.clientY
    const id = Date.now()
    const pieces = Array.from({ length: 80 }, (_, i) => ({
      id: `${id}-${i}`, x: cx, y: cy,
      dx: rand(-200, 200), dy: rand(-200, 200),
      r: rand(2, 6), color: hsl(rand(0, 360), 80, 60),
      rot: rand(0, 360), t: rand(600, 1200)
    }))
    setExps(prev => [...prev, ...pieces])
    setTimeout(() => setExps(prev => prev.filter(p => !p.id.startsWith(id))), 1200)
  }

  return (
    <>
      <RippleButton onClick={explode} icon="zap">
        EXPLODE
      </RippleButton>
      {exps.map(p => (
        <div key={p.id} className="fixed pointer-events-none z-50 rounded-full"
          style={{ left: p.x, top: p.y, width: p.r * 2, height: p.r * 2, background: p.color, transform: `rotate(${p.rot}deg)`, '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, animation: `particle-drift ${p.t}ms ease-out forwards` }} />
      ))}
    </>
  )
}

function ButtonRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      <RippleButton icon="sparkles">NEURAL MESH</RippleButton>
      <RippleButton icon="layers">HOLO DECK</RippleButton>
      <RippleButton icon="cpu">QUANTUM FX</RippleButton>
      <Explosion />
    </div>
  )
}

function HamburgerMenu({ open, setOpen }) {
  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed top-6 left-6 z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 hover:border-dkz-accent/50 transition-all duration-300 group">
        <span className={`block w-5 h-0.5 bg-dkz-text group-hover:bg-dkz-accent transition-all duration-300 ${open ? 'rotate-45 translate-y-1' : ''}`} />
        <span className={`block w-5 h-0.5 bg-dkz-text group-hover:bg-dkz-accent transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-dkz-text group-hover:bg-dkz-accent transition-all duration-300 ${open ? '-rotate-45 -translate-y-1' : ''}`} />
      </button>
      <div className={`fixed top-0 left-0 h-full w-72 z-40 bg-black/60 backdrop-blur-2xl border-r border-white/5 transform transition-all duration-500 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-2 pt-24 px-6">
          {['Dashboard', 'Neural Mesh', 'Holo Deck', 'Quantum Core', 'Settings', 'System Status', 'Help'].map((item, i) => (
            <div key={item} className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer"
              style={{ animation: open ? `nebula-float 0.5s ease-out ${i * 0.05}s both` : 'none' }}>
              <div className="w-1 h-6 rounded-full bg-dkz-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm text-dkz-textsec group-hover:text-white transition-colors">{item}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-8 left-6 right-6 p-4 rounded-xl bg-dkz-accent/10 border border-dkz-accent/20">
          <p className="text-xs text-dkz-textsec font-mono">DEVKiTZ™ Ecosystem</p>
          <p className="text-[10px] text-dkz-textsec/50 mt-1">React + Tailwind • Hyperreal UI</p>
        </div>
      </div>
    </>
  )
}

function StandbyOverlay({ active }) {
  const texts = ['AWAITING INPUT', 'STANDBY MODE', 'SYSTEM IDLE', 'SENSOR SLEEP', 'NEURAL HIBERNATION']
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!active) return
    const i = setInterval(() => setT(prev => (prev + 1) % texts.length), 2000)
    return () => clearInterval(i)
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center select-none" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="text-center">
        <p className="text-4xl md:text-6xl font-black text-dkz-textsec/30 tracking-widest animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>
          {texts[t]}
        </p>
        <div className="mt-8 flex gap-1 items-center justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-dkz-accent/40 animate-ping" style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.5s' }} />
          ))}
        </div>
        <p className="mt-6 text-xs text-dkz-textsec/20 font-mono tracking-widest uppercase">Move mouse to resume</p>
      </div>
    </div>
  )
}

function NanobotText({ mouse }) {
  const chars = TITLE.split('')
  return (
    <div className="flex items-center justify-center gap-1 mt-8 select-none">
      {chars.map((ch, i) => {
        const dx = mouse.x - (innerWidth / 2 - (chars.length * 20) / 2 + i * 40)
        const dy = mouse.y - innerHeight / 2
        const d = Math.hypot(dx, dy)
        const near = Math.max(0, 1 - d / 200)
        return (
          <span key={i} className="inline-block text-2xl font-black font-mono transition-all duration-300"
            style={{
              color: `rgba(232,232,236,${0.3 + near * 0.7})`,
              transform: near > 0 ? `translate(${dx * 0.1}px, ${-dy * 0.1 - near * 30}px) scale(${1 + near * 0.5})` : 'none',
              filter: near > 0 ? `blur(${(1 - near) * 2}px)` : 'blur(2px)',
              textShadow: near > 0 ? `0 0 ${20 * near}px rgba(250,30,78,${near})` : 'none'
            }}>
            {ch}
          </span>
        )
      })}
    </div>
  )
}

function CornerDots() {
  const corners = ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2']
  return (
    <>
      {corners.map((c, i) => (
        <div key={i} className={`fixed ${c} z-40`}>
          <div className="w-2 h-2 rounded-full bg-dkz-accent/60 animate-ping" style={{ animationDelay: `${i * 0.3}s` }} />
          <div className="w-2 h-2 rounded-full bg-dkz-accent/40 absolute inset-0" />
        </div>
      ))}
    </>
  )
}

function Badge8K() {
  return (
    <div className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-dkz-textsec tracking-wider">
      <span className="text-dkz-accent">8K</span> <span className="text-dkz-textsec/40">|</span> <span className="text-dkz-green">240FPS</span>
    </div>
  )
}

function NebulaParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-dkz-accent/10"
          style={{
            width: rand(2, 6), height: rand(2, 6),
            left: `${rand(0, 100)}%`, top: `${rand(0, 100)}%`,
            filter: 'blur(1px)',
            animation: `nebula-float ${rand(8, 20)}s ease-in-out infinite ${rand(0, 10)}s`
          }} />
      ))}
    </div>
  )
}

function IntroOverlay() {
  const [show, setShow] = useState(true)
  useEffect(() => { const t = setTimeout(() => setShow(false), 2000); return () => clearTimeout(t) }, [])
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[60] bg-dkz-bg flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter animate-pulse"
          style={{ background: 'linear-gradient(135deg, #fa1e4e, #3b82f6, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          HYPERREAL
        </h2>
        <p className="text-sm text-dkz-textsec/50 mt-4 font-mono tracking-widest uppercase"
          style={{ animation: 'nebula-float 1s ease-out 0.5s both' }}>
          Initializing Neural Interface...
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const mouse = useMouse()
  const [menuOpen, setMenuOpen] = useState(false)
  const standby = useStandby(STANDBY_DELAY)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dkz-bg select-none">
      <NebulaBackground />
      <LightRays />
      <NebulaParticles />
      <Stars />
      <NebulaFlocken />
      <HexCanvas mouse={mouse} />
      <ParticleCanvas mouse={mouse} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <Logo />
          <Claim />
          <AccentLine />
          <StatusBar />
          <ButtonRow />
          <NanobotText mouse={mouse} />
        </div>
      </div>

      <HamburgerMenu open={menuOpen} setOpen={setMenuOpen} />
      <CornerDots />
      <Badge8K />
      <StandbyOverlay active={standby} />
      <IntroOverlay />
    </div>
  )
}

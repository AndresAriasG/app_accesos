import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine, ArrowUpRight, BarChart3, Bell, Building2, CalendarDays,
  ChevronDown, CircleHelp, Clock3, FileText, Grid2X2, LogOut, Menu,
  MoreHorizontal, Plus, Search, Settings, ShieldCheck, Users, X
} from 'lucide-react'

const today = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())

const seedRecords = [
  { id: 1, initials: 'MR', name: 'Mariana Restrepo', company: 'Inversiones Atlas', purpose: 'Reunión comercial', time: '09:42', status: 'Dentro' },
  { id: 2, initials: 'JD', name: 'Juan David Ospina', company: 'TechNova S.A.S.', purpose: 'Visita técnica', time: '09:18', status: 'Dentro' },
  { id: 3, initials: 'CV', name: 'Carlos Valencia', company: 'Proveedor externo', purpose: 'Entrega de documentación', time: '08:56', status: 'Dentro' },
  { id: 4, initials: 'LS', name: 'Laura Sánchez', company: 'Grupo Prisma', purpose: 'Entrevista', time: '08:31', status: 'Salida' },
]

const navItems = [
  { label: 'Resumen', icon: Grid2X2 }, { label: 'Registrar entrada', icon: ArrowDownToLine },
  { label: 'Reportes', icon: BarChart3 }, { label: 'Usuarios', icon: Users },
]

function Avatar({ initials, tone = 'blue' }) { return <span className={`avatar ${tone}`}>{initials}</span> }
const toRecord = (entry) => ({
  id: entry.id,
  initials: entry.full_name.split(' ').slice(0, 2).map((name) => name[0]).join('').toUpperCase(),
  name: entry.full_name,
  company: entry.company || 'Visitante',
  purpose: entry.purpose || 'Sin especificar',
  time: new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(entry.entry_at)),
  status: entry.status === 'inside' ? 'Dentro' : 'Salida',
})

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [active, setActive] = useState('Resumen')
  const [menu, setMenu] = useState(false)
  const [records, setRecords] = useState(seedRecords)
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', purpose: '' })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => records.filter(r => `${r.name} ${r.company}`.toLowerCase().includes(search.toLowerCase())), [records, search])
  const visitorsInside = records.filter(r => r.status === 'Dentro').length

  useEffect(() => {
    if (!loggedIn) return
    fetch('/api/entries')
      .then((response) => response.ok ? response.json() : [])
      .then((entries) => { if (entries.length) setRecords(entries.map(toRecord)) })
      .catch(() => {})
  }, [loggedIn])

  const login = async ({ email, password }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'No fue posible iniciar sesión')
    setUser(data.user)
    setLoggedIn(true)
  }

  const saveEntry = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      const response = await fetch('/api/entries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.name, company: form.company, purpose: form.purpose, created_by: user?.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'No fue posible guardar la entrada')
      setRecords([toRecord(data), ...records])
      setForm({ name: '', company: '', purpose: '' }); setModal(false)
    } catch (error) { window.alert(error.message) }
  }

  if (!loggedIn) return <Login onLogin={login} />

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={21}/></div><span>acceso<span className="brand-dot">.</span></span><button className="close-menu" onClick={() => setMenu(false)}><X size={19}/></button></div>
      <div className="workspace"><Building2 size={16}/><span>Edificio Central</span><ChevronDown size={14}/></div>
      <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'active' : ''} onClick={() => { setActive(label); setMenu(false) }}><Icon size={18}/><span>{label}</span>{label === 'Registrar entrada' && <span className="nav-plus">+</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button><CircleHelp size={18}/><span>Centro de ayuda</span></button><button><Settings size={18}/><span>Configuración</span></button><div className="profile"><Avatar initials="AA" tone="violet"/><div><strong>Andrés Arias</strong><small>Administrador</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    {menu && <div className="scrim" onClick={() => setMenu(false)} />}
    <main>
      <header className="topbar"><button className="mobile-menu" onClick={() => setMenu(true)}><Menu size={21}/></button><div className="breadcrumb"><span>Operación</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><button className="date-chip"><CalendarDays size={16}/><span>{today}</span><ChevronDown size={14}/></button><button className="bell"><Bell size={19}/><i/></button><Avatar initials="AA" tone="violet"/></div></header>
      <section className="content">
        <div className="heading-row"><div><p className="eyebrow">PANEL DE CONTROL</p><h1>{active === 'Resumen' ? 'Buenos días, Andrés.' : active}</h1><p className="subtitle">{active === 'Resumen' ? 'Esto es lo que está pasando en tus accesos hoy.' : 'Administra los movimientos de acceso de tu organización.'}</p></div><button className="primary-btn" onClick={() => setModal(true)}><Plus size={18}/>Registrar entrada</button></div>
        <section className="kpis"><Kpi icon={Users} label="Ingresos hoy" value="128" trend="12.5%" type="up" note="vs. ayer"/><Kpi icon={ArrowUpRight} label="Personas dentro" value={String(visitorsInside + 42)} trend="En tiempo real" type="neutral"/><Kpi icon={Clock3} label="Tiempo promedio" value="01:34" trend="-8 min" type="down" note="vs. ayer"/><Kpi icon={ShieldCheck} label="Accesos autorizados" value="96.8%" trend="2.4%" type="up" note="vs. ayer"/></section>
        <section className="dashboard-grid"><div className="panel traffic"><div className="panel-head"><div><h2>Flujo de ingresos</h2><p>Movimientos registrados durante el día</p></div><button className="select-btn">Hoy <ChevronDown size={14}/></button></div><div className="chart-wrap"><div className="chart-y"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div><div className="chart"><div className="grid-lines"/><svg viewBox="0 0 640 200" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5474f1" stopOpacity=".22"/><stop offset="1" stopColor="#5474f1" stopOpacity="0"/></linearGradient></defs><path d="M0 164 C38 160 45 132 75 140 S112 118 134 126 S163 96 188 110 S225 112 248 94 S288 56 318 75 S350 104 374 86 S408 28 433 43 S462 75 489 70 S525 92 550 82 S583 48 610 61 S630 36 640 34 L640 200 L0 200Z" fill="url(#fill)"/><path d="M0 164 C38 160 45 132 75 140 S112 118 134 126 S163 96 188 110 S225 112 248 94 S288 56 318 75 S350 104 374 86 S408 28 433 43 S462 75 489 70 S525 92 550 82 S583 48 610 61 S630 36 640 34" fill="none" stroke="#5474f1" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="chart-tooltip"><b>11:00 AM</b><span>32 ingresos</span></div><div className="chart-x"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span></div></div></div></div>
          <div className="panel occupancy"><div className="panel-head"><div><h2>Ocupación actual</h2><p>Personas en el edificio</p></div><button className="dots"><MoreHorizontal size={19}/></button></div><div className="occupancy-body"><div className="donut"><div><b>{visitorsInside + 42}</b><span>personas</span></div></div><div className="legend"><p><i className="blue-dot"/>Colaboradores <strong>42</strong></p><p><i className="violet-dot"/>Visitantes <strong>{visitorsInside}</strong></p><p><i className="gray-dot"/>Capacidad <strong>120</strong></p></div></div><div className="capacity"><span>Ocupación total</span><b>38%</b><div><i/></div></div></div></section>
        <section className="panel table-panel"><div className="panel-head"><div><h2>Ingresos recientes</h2><p>Últimos movimientos registrados</p></div><button className="link-btn" onClick={() => setActive('Reportes')}>Ver todos <ArrowUpRight size={15}/></button></div><div className="table-tools"><div className="search"><Search size={17}/><input placeholder="Buscar por nombre o empresa..." value={search} onChange={e => setSearch(e.target.value)}/></div><button className="filter"><FileText size={16}/>Exportar</button></div><div className="table-scroll"><table><thead><tr><th>PERSONA</th><th>EMPRESA</th><th>MOTIVO</th><th>HORA DE ENTRADA</th><th>ESTADO</th><th/></tr></thead><tbody>{filtered.map((r, idx) => <tr key={r.id}><td><div className="person"><Avatar initials={r.initials} tone={idx % 2 ? 'amber' : 'blue'}/><b>{r.name}</b></div></td><td>{r.company}</td><td>{r.purpose}</td><td>{r.time}</td><td><span className={`status ${r.status === 'Dentro' ? 'inside' : 'out'}`}><i/>{r.status}</span></td><td><button className="row-more"><MoreHorizontal size={19}/></button></td></tr>)}</tbody></table></div></section>
      </section>
    </main>
    {modal && <EntryModal form={form} setForm={setForm} onClose={() => setModal(false)} onSave={saveEntry}/>} 
  </div>
}

function Kpi({ icon: Icon, label, value, trend, type, note }) { return <article className="kpi"><div className={`kpi-icon ${type}`}><Icon size={20}/></div><div className="kpi-content"><p>{label}</p><h3>{value}</h3><span className={`trend ${type}`}>{type === 'up' && <ArrowUpRight size={13}/>} {trend} {note && <em>{note}</em>}</span></div></article> }
function Login({ onLogin }) { const [show, setShow] = useState(false); const [email, setEmail] = useState('admin@appaccesos.com'); const [password, setPassword] = useState('Acceso2026!'); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const submit = async (e) => { e.preventDefault(); setError(''); setLoading(true); try { await onLogin({ email, password }) } catch (err) { setError(err.message) } finally { setLoading(false) } }; return <div className="login-page"><div className="login-art"><div className="ambient a1"/><div className="ambient a2"/><div className="login-brand"><div className="brand-mark"><ShieldCheck size={21}/></div>acceso<span>.</span></div><div className="login-copy"><p className="eyebrow">BIENVENIDO A ACCESO</p><h1>El control de ingresos,<br/><i>en buenas manos.</i></h1><p>Una manera simple, segura y elegante de gestionar cada entrada a tu organización.</p><div className="login-stats"><div><b>98.4%</b><span>accesos seguros</span></div><div><b>24/7</b><span>información al día</span></div></div></div><p className="login-footer">© 2026 Acceso. Todos los derechos reservados.</p></div><div className="login-form-side"><div className="login-card"><div className="mobile-login-brand"><div className="brand-mark"><ShieldCheck size={19}/></div>acceso<span>.</span></div><div><h2>Inicia sesión</h2><p>Ingresa tus datos para continuar.</p></div><form onSubmit={submit}><label>Correo electrónico<input type="email" placeholder="nombre@empresa.com" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Contraseña<div className="password"><input type={show ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)}/><button type="button" onClick={() => setShow(!show)}>{show ? 'Ocultar' : 'Mostrar'}</button></div></label><div className="form-options"><label className="remember"><input type="checkbox" defaultChecked/>Recordarme</label><a href="#">¿Olvidaste tu contraseña?</a></div>{error && <p className="login-error">{error}</p>}<button className="login-btn" disabled={loading}>{loading ? 'Validando...' : <>Ingresar al panel <ArrowUpRight size={18}/></>}</button></form><p className="support">¿Necesitas ayuda? <a href="#">Contacta a soporte</a></p></div></div></div> }
function EntryModal({ form, setForm, onClose, onSave }) { return <div className="modal-backdrop"><form className="entry-modal" onSubmit={onSave}><button type="button" className="modal-close" onClick={onClose}><X size={19}/></button><div className="modal-icon"><ArrowDownToLine size={22}/></div><h2>Registrar entrada</h2><p>Completa los datos del visitante para registrar su acceso.</p><label>Nombre completo <span className="required">*</span><input autoFocus required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Ej. María González"/></label><label>Empresa <span className="required">*</span><input required value={form.company} onChange={e => setForm({...form, company:e.target.value})} placeholder="Ej. Compañía S.A.S."/></label><label>Motivo de visita <span className="required">*</span><input required value={form.purpose} onChange={e => setForm({...form, purpose:e.target.value})} placeholder="Ej. Reunión de trabajo"/></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary-btn">Guardar entrada</button></div></form></div> }

export default App

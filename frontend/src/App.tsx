import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'

const API = 'https://amusing-forgiveness-production-a787.up.railway.app/api'
const AuthCtx = createContext<any>(null)

function useAuth() { return useContext(AuthCtx) }

function AuthProvider({ children }: any) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jf_user') || 'null') } catch { return null }
  })
  const login = async (email: string, password: string) => {
    const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password}) })
    if (!r.ok) throw new Error('Credenciais inválidas')
    const d = await r.json()
    localStorage.setItem('jf_token', d.token)
    localStorage.setItem('jf_user', JSON.stringify(d.user))
    setUser(d.user)
  }
  const register = async (data: any) => {
    const r = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
    if (!r.ok) throw new Error('Erro ao cadastrar')
    const d = await r.json()
    localStorage.setItem('jf_token', d.token)
    localStorage.setItem('jf_user', JSON.stringify(d.user))
    setUser(d.user)
  }
  const logout = () => { localStorage.clear(); setUser(null) }
  return <AuthCtx.Provider value={{user, login, register, logout}}>{children}</AuthCtx.Provider>
}

function Protected({ children }: any) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const s: any = {
  page: { minHeight:'100vh', background:'#f9fafb', fontFamily:'system-ui,sans-serif' },
  center: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' },
  card: { background:'white', padding:'2rem', borderRadius:'12px', border:'1px solid #e5e7eb', width:'100%', maxWidth:'380px' },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', marginTop:'4px', boxSizing:'border-box' as any },
  btn: { width:'100%', padding:'11px', background:'#1d4ed8', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor:'pointer', marginTop:'12px' },
  label: { display:'block', fontSize:'12px', fontWeight:'500', color:'#374151', marginTop:'12px' },
  err: { color:'#dc2626', fontSize:'12px', marginTop:'8px', background:'#fef2f2', padding:'8px', borderRadius:'6px' },
  sidebar: { width:'200px', minWidth:'200px', background:'white', borderRight:'1px solid #e5e7eb', height:'100vh', display:'flex', flexDirection:'column' as any },
  navItem: (active: boolean) => ({ display:'flex', alignItems:'center', gap:'8px', padding:'9px 16px', fontSize:'13px', color: active ? '#1d4ed8' : '#6b7280', background: active ? '#eff6ff' : 'transparent', borderLeft: active ? '2px solid #1d4ed8' : '2px solid transparent', cursor:'pointer', textDecoration:'none' }),
  main: { flex:1, overflow:'auto' as any },
  header: { padding:'1.5rem 1.5rem 0', display:'flex', justifyContent:'space-between', alignItems:'center' },
  h1: { fontSize:'18px', fontWeight:'500', color:'#111827' },
  metricGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', padding:'1rem 1.5rem' },
  metric: { background:'#f3f4f6', borderRadius:'10px', padding:'12px 14px' },
  metricLabel: { fontSize:'11px', color:'#6b7280', textTransform:'uppercase' as any, letterSpacing:'0.5px' },
  metricVal: { fontSize:'22px', fontWeight:'500', color:'#111827', marginTop:'4px' },
}

function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    setErr(''); setLoading(true)
    try { await login(email, pass) } catch(e: any) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <div style={s.center}>
      <div style={s.card}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1d4ed8'}}/>
            <span style={{fontSize:'20px', fontWeight:'500'}}>JurisFlow</span>
          </div>
          <p style={{fontSize:'13px', color:'#6b7280', marginTop:'4px'}}>Gestão jurídica inteligente</p>
        </div>
        <h1 style={{fontSize:'16px', fontWeight:'500', marginBottom:'1rem'}}>Entrar na conta</h1>
        <label style={s.label}>E-mail</label>
        <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
        <label style={s.label}>Senha</label>
        <input style={s.input} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&submit()}/>
        {err && <div style={s.err}>{err}</div>}
        <button style={s.btn} onClick={submit} disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
        <p style={{textAlign:'center', fontSize:'13px', color:'#6b7280', marginTop:'1rem'}}>Não tem conta? <a href="/register" style={{color:'#1d4ed8'}}>Cadastre-se</a></p>
      </div>
    </div>
  )
}

function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({name:'', email:'', password:'', oabNumber:'', oabState:'AL'})
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: any) => setForm(f=>({...f,[k]:e.target.value}))
  const submit = async () => {
    setErr(''); setLoading(true)
    try { await register(form) } catch(e: any) { setErr(e.message) }
    setLoading(false)
  }
  const estados = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
  return (
    <div style={s.center}>
      <div style={s.card}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:'8px'}}>
            <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1d4ed8'}}/>
            <span style={{fontSize:'20px', fontWeight:'500'}}>JurisFlow</span>
          </div>
        </div>
        <h1 style={{fontSize:'16px', fontWeight:'500', marginBottom:'1rem'}}>Criar conta</h1>
        <label style={s.label}>Nome completo</label>
        <input style={s.input} value={form.name} onChange={set('name')} placeholder="Dr. Ricardo Mendes"/>
        <label style={s.label}>E-mail</label>
        <input style={s.input} type="email" value={form.email} onChange={set('email')} placeholder="contato@escritorio.com"/>
        <label style={s.label}>Senha</label>
        <input style={s.input} type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres"/>
        <div style={{display:'flex', gap:'8px'}}>
          <div style={{flex:1}}>
            <label style={s.label}>Nº OAB</label>
            <input style={s.input} value={form.oabNumber} onChange={set('oabNumber')} placeholder="123456"/>
          </div>
          <div style={{width:'80px'}}>
            <label style={s.label}>Estado</label>
            <select style={s.input} value={form.oabState} onChange={set('oabState')}>
              {estados.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
        </div>
        {err && <div style={s.err}>{err}</div>}
        <button style={s.btn} onClick={submit} disabled={loading}>{loading?'Cadastrando...':'Criar conta'}</button>
        <p style={{textAlign:'center', fontSize:'13px', color:'#6b7280', marginTop:'1rem'}}>Já tem conta? <a href="/login" style={{color:'#1d4ed8'}}>Entrar</a></p>
      </div>
    </div>
  )
}

function Layout({ children, page }: any) {
  const { user, logout } = useAuth()
  const nav = [
    {href:'/dashboard', label:'Dashboard', icon:'▦'},
    {href:'/crm', label:'CRM', icon:'⊡'},
    {href:'/documents', label:'Documentos', icon:'◻'},
    {href:'/whatsapp', label:'WhatsApp + IA', icon:'◉'},
    {href:'/ads', label:'Ads & Pixel', icon:'◈'},
    {href:'/social', label:'Redes Sociais', icon:'◎'},
  ]
  return (
    <div style={{display:'flex', height:'100vh', overflow:'hidden', fontFamily:'system-ui,sans-serif'}}>
      <div style={s.sidebar}>
        <div style={{padding:'16px', borderBottom:'1px solid #e5e7eb'}}>
          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#1d4ed8'}}/>
            <span style={{fontSize:'15px', fontWeight:'500'}}>JurisFlow</span>
          </div>
          <p style={{fontSize:'11px', color:'#9ca3af', marginTop:'2px', paddingLeft:'14px'}}>Gestão jurídica</p>
        </div>
        <nav style={{flex:1, paddingTop:'8px'}}>
          {nav.map(n=>(
            <a key={n.href} href={n.href} style={s.navItem(page===n.href.slice(1))}>
              <span style={{fontSize:'13px'}}>{n.icon}</span>{n.label}
            </a>
          ))}
        </nav>
        <div style={{padding:'12px 16px', borderTop:'1px solid #e5e7eb'}}>
          <p style={{fontSize:'12px', fontWeight:'500', color:'#111827'}}>{user?.name}</p>
          <p style={{fontSize:'11px', color:'#9ca3af'}}>{user?.oabNumber ? `OAB/${user.oabState} ${user.oabNumber}` : user?.email}</p>
          <button onClick={logout} style={{marginTop:'8px', fontSize:'11px', color:'#9ca3af', background:'none', border:'none', cursor:'pointer', padding:0}}>Sair</button>
        </div>
      </div>
      <div style={s.main}>{children}</div>
    </div>
  )
}

function Dashboard() {
  const token = localStorage.getItem('jf_token')
  const [clients, setClients] = useState<any[]>([])
  const headers = {'Content-Type':'application/json', 'Authorization':`Bearer ${token}`}
  useEffect(() => {
    fetch(`${API}/clients`, {headers}).then(r=>r.json()).then(d=>setClients(Array.isArray(d)?d:[])).catch(()=>{})
  }, [])
  const areaLabel: any = {PREVIDENCIARIO:'Previdenciário',FAMILIA:'Família',CRIMINAL:'Criminal',TRABALHISTA:'Trabalhista',CIVIL:'Civil',OUTRO:'Outro'}
  const statusColor: any = {NEW:'#dbeafe',QUALIFIED:'#ede9fe',NEGOTIATING:'#fef3c7',WON:'#dcfce7',LOST:'#fee2e2'}
  const statusLabel: any = {NEW:'Novo',QUALIFIED:'Qualificado',NEGOTIATING:'Negociando',WON:'Ganho',LOST:'Perdido'}
  return (
    <Layout page="dashboard">
      <div style={{padding:'1.5rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
          <h1 style={s.h1}>Visão geral</h1>
          <a href="/crm" style={{padding:'8px 16px', background:'#1d4ed8', color:'white', borderRadius:'8px', fontSize:'13px', fontWeight:'500', textDecoration:'none'}}>+ Novo cliente</a>
        </div>
        <div style={s.metricGrid}>
          {[{label:'Clientes',val:clients.length},{label:'Ativos',val:clients.filter(c=>c.status!=='LOST').length},{label:'Ganhos',val:clients.filter(c=>c.status==='WON').length},{label:'Novos',val:clients.filter(c=>c.status==='NEW').length}].map(m=>(
            <div key={m.label} style={s.metric}><div style={s.metricLabel}>{m.label}</div><div style={s.metricVal}>{m.val}</div></div>
          ))}
        </div>
        <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem', margin:'0 1.5rem'}}>
          <h2 style={{fontSize:'14px', fontWeight:'500', marginBottom:'1rem'}}>Clientes recentes</h2>
          {clients.length===0 ? <p style={{fontSize:'13px', color:'#9ca3af', textAlign:'center', padding:'2rem'}}>Nenhum cliente ainda. <a href="/crm" style={{color:'#1d4ed8'}}>Adicionar</a></p> : clients.slice(0,5).map(c=>(
            <div key={c.id} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #f3f4f6'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'500', color:'#5b21b6'}}>
                {c.name.split(' ').map((n:string)=>n[0]).slice(0,2).join('')}
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:'13px', fontWeight:'500', color:'#111827'}}>{c.name}</p>
                <p style={{fontSize:'11px', color:'#9ca3af'}}>{areaLabel[c.legalArea]}</p>
              </div>
              <span style={{fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:statusColor[c.status], color:'#374151'}}>{statusLabel[c.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function CRM() {
  const token = localStorage.getItem('jf_token')
  const headers = {'Content-Type':'application/json', 'Authorization':`Bearer ${token}`}
  const [clients, setClients] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({name:'',phone:'',cpf:'',email:'',legalArea:'PREVIDENCIARIO',caseDesc:'',dealValue:'',source:''})
  const [saving, setSaving] = useState(false)
  const load = () => fetch(`${API}/clients`,{headers}).then(r=>r.json()).then(d=>setClients(Array.isArray(d)?d:[])).catch(()=>{})
  useEffect(()=>{load()},[])
  const set = (k:string)=>(e:any)=>setForm(f=>({...f,[k]:e.target.value}))
  const save = async()=>{setSaving(true);try{await fetch(`${API}/clients`,{method:'POST',headers,body:JSON.stringify({...form,dealValue:form.dealValue?parseFloat(form.dealValue):undefined})});setModal(false);setForm({name:'',phone:'',cpf:'',email:'',legalArea:'PREVIDENCIARIO',caseDesc:'',dealValue:'',source:''});load()}catch{}setSaving(false)}
  const move = async(id:string,status:string)=>{await fetch(`${API}/clients/${id}`,{method:'PATCH',headers,body:JSON.stringify({status})});load()}
  const stages = ['NEW','QUALIFIED','NEGOTIATING','WON','LOST']
  const stageLabel:any={NEW:'Novo',QUALIFIED:'Qualificado',NEGOTIATING:'Negociando',WON:'Ganho',LOST:'Perdido'}
  const areaOpts=[{value:'PREVIDENCIARIO',label:'Previdenciário'},{value:'FAMILIA',label:'Família'},{value:'CRIMINAL',label:'Criminal'},{value:'TRABALHISTA',label:'Trabalhista'},{value:'CIVIL',label:'Civil'},{value:'OUTRO',label:'Outro'}]
  return (
    <Layout page="crm">
      <div style={{padding:'1.5rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
          <h1 style={s.h1}>CRM</h1>
          <button onClick={()=>setModal(true)} style={{padding:'8px 16px', background:'#1d4ed8', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer'}}>+ Novo cliente</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px'}}>
          {stages.map(stage=>(
            <div key={stage} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'12px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <span style={{fontSize:'11px', fontWeight:'500', color:'#374151'}}>{stageLabel[stage]}</span>
                <span style={{fontSize:'11px', background:'#f3f4f6', padding:'1px 6px', borderRadius:'10px', color:'#6b7280'}}>{clients.filter(c=>c.status===stage).length}</span>
              </div>
              {clients.filter(c=>c.status===stage).map(c=>(
                <div key={c.id} style={{background:'#f9fafb', borderRadius:'8px', padding:'10px', marginBottom:'8px'}}>
                  <p style={{fontSize:'12px', fontWeight:'500', color:'#111827', marginBottom:'4px'}}>{c.name}</p>
                  <p style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>{areaOpts.find(a=>a.value===c.legalArea)?.label}</p>
                  {c.dealValue && <p style={{fontSize:'11px', color:'#16a34a', fontWeight:'500'}}>R$ {Number(c.dealValue).toLocaleString('pt-BR')}</p>}
                  <div style={{display:'flex', gap:'4px', marginTop:'6px', flexWrap:'wrap' as any}}>
                    {stages.filter(s=>s!==stage).slice(0,2).map(ns=>(
                      <button key={ns} onClick={()=>move(c.id,ns)} style={{fontSize:'10px', padding:'2px 6px', border:'1px solid #e5e7eb', borderRadius:'4px', background:'white', cursor:'pointer', color:'#6b7280'}}>→{stageLabel[ns]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'white',borderRadius:'12px',padding:'1.5rem',width:'100%',maxWidth:'460px',maxHeight:'90vh',overflow:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1rem'}}>
              <h2 style={{fontSize:'15px',fontWeight:'500'}}>Novo cliente</h2>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#9ca3af'}}>✕</button>
            </div>
            {[{k:'name',l:'Nome *',p:'Maria Santos'},{k:'phone',l:'Telefone *',p:'82 99999-0000'},{k:'cpf',l:'CPF',p:'000.000.000-00'},{k:'email',l:'E-mail',p:'maria@email.com'},{k:'caseDesc',l:'Descrição do caso',p:'Descreva o caso...'},{k:'dealValue',l:'Valor (R$)',p:'3500'}].map(f=>(
              <div key={f.k} style={{marginBottom:'10px'}}>
                <label style={s.label}>{f.l}</label>
                <input style={s.input} value={(form as any)[f.k]} onChange={set(f.k)} placeholder={f.p}/>
              </div>
            ))}
            <div style={{marginBottom:'10px'}}>
              <label style={s.label}>Área do direito *</label>
              <select style={s.input} value={form.legalArea} onChange={set('legalArea')}>
                {areaOpts.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:'8px',marginTop:'1rem'}}>
              <button onClick={()=>setModal(false)} style={{flex:1,padding:'10px',border:'1px solid #e5e7eb',borderRadius:'8px',background:'white',cursor:'pointer',fontSize:'13px'}}>Cancelar</button>
              <button onClick={save} disabled={saving||!form.name||!form.phone} style={{flex:1,padding:'10px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'500',opacity:saving?0.6:1}}>{saving?'Salvando...':'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function SimplePage({title, page}: any) {
  return (
    <Layout page={page}>
      <div style={{padding:'1.5rem'}}>
        <h1 style={s.h1}>{title}</h1>
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'3rem',textAlign:'center',marginTop:'1.5rem'}}>
          <p style={{fontSize:'14px',color:'#9ca3af'}}>Módulo em configuração. Em breve disponível!</p>
        </div>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/crm" element={<Protected><CRM /></Protected>} />
          <Route path="/documents" element={<Protected><SimplePage title="Documentos" page="documents"/></Protected>} />
          <Route path="/whatsapp" element={<Protected><SimplePage title="WhatsApp + IA" page="whatsapp"/></Protected>} />
          <Route path="/ads" element={<Protected><SimplePage title="Ads & Pixel" page="ads"/></Protected>} />
          <Route path="/social" element={<Protected><SimplePage title="Redes Sociais" page="social"/></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

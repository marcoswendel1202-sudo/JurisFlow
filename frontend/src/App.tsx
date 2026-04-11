import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'

const API = 'https://amusing-forgiveness-production-a787.up.railway.app/api'
const AuthCtx = createContext<any>(null)
function useAuth() { return useContext(AuthCtx) }

function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    try { const u = localStorage.getItem('jf_user'); if (u) setUser(JSON.parse(u)) } catch {}
    setLoading(false)
  }, [])
  const login = async (email: string, password: string) => {
    const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error||'Erro ao entrar')
    localStorage.setItem('jf_token', d.token)
    localStorage.setItem('jf_user', JSON.stringify(d.user))
    setUser(d.user)
  }
  const register = async (data: any) => {
    const r = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error||'Erro ao cadastrar')
    localStorage.setItem('jf_token', d.token)
    localStorage.setItem('jf_user', JSON.stringify(d.user))
    setUser(d.user)
  }
  const logout = () => { localStorage.removeItem('jf_token'); localStorage.removeItem('jf_user'); setUser(null) }
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'14px',color:'#6b7280'}}>Carregando...</div>
  return <AuthCtx.Provider value={{user,login,register,logout}}>{children}</AuthCtx.Provider>
}

function Protected({ children }: any) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const inp = {width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',marginTop:'4px',boxSizing:'border-box' as any}
const lbl = {display:'block',fontSize:'12px',fontWeight:'500',color:'#374151',marginTop:'12px'} as any
const areaOpts = [{value:'PREVIDENCIARIO',label:'Previdenciário'},{value:'FAMILIA',label:'Família'},{value:'CRIMINAL',label:'Criminal'},{value:'TRABALHISTA',label:'Trabalhista'},{value:'CIVIL',label:'Civil'},{value:'OUTRO',label:'Outro'}]
const areaLabel: any = {PREVIDENCIARIO:'Previdenciário',FAMILIA:'Família',CRIMINAL:'Criminal',TRABALHISTA:'Trabalhista',CIVIL:'Civil',OUTRO:'Outro'}
const statusLabel: any = {NEW:'Novo',QUALIFIED:'Qualificado',NEGOTIATING:'Negociando',WON:'Ganho',LOST:'Perdido'}
const statusColor: any = {NEW:'#dbeafe',QUALIFIED:'#ede9fe',NEGOTIATING:'#fef3c7',WON:'#dcfce7',LOST:'#fee2e2'}

function Login() {
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  const submit = async () => {
    if (!email||!pass) return setErr('Preencha todos os campos')
    setErr(''); setLoading(true)
    try { await login(email,pass) } catch(e:any) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',border:'1px solid #e5e7eb',width:'100%',maxWidth:'380px'}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px'}}><div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#1d4ed8'}}/><span style={{fontSize:'20px',fontWeight:'500'}}>JurisFlow</span></div>
          <p style={{fontSize:'13px',color:'#6b7280',marginTop:'4px'}}>Gestão jurídica inteligente</p>
        </div>
        <h1 style={{fontSize:'16px',fontWeight:'500',marginBottom:'1rem'}}>Entrar na conta</h1>
        <label style={lbl}>E-mail</label>
        <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
        <label style={lbl}>Senha</label>
        <input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="••••••••"/>
        {err&&<div style={{color:'#dc2626',fontSize:'12px',marginTop:'8px',background:'#fef2f2',padding:'8px',borderRadius:'6px'}}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{width:'100%',padding:'10px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',marginTop:'16px'}}>{loading?'Entrando...':'Entrar'}</button>
        <p style={{textAlign:'center',fontSize:'13px',color:'#6b7280',marginTop:'1rem'}}>Não tem conta? <a href="/register" style={{color:'#1d4ed8'}}>Cadastre-se</a></p>
      </div>
    </div>
  )
}

function Register() {
  const { register, user } = useAuth()
  const [form, setForm] = useState({name:'',email:'',password:'',oabNumber:'',oabState:'AL'})
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k:string)=>(e:any)=>setForm(f=>({...f,[k]:e.target.value}))
  const estados = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
  if (user) return <Navigate to="/dashboard" replace />
  const submit = async () => {
    if (!form.name||!form.email||!form.password) return setErr('Preencha nome, e-mail e senha')
    setErr(''); setLoading(true)
    try { await register(form) } catch(e:any) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',border:'1px solid #e5e7eb',width:'100%',maxWidth:'380px'}}>
        <div style={{textAlign:'center',marginBottom:'1rem'}}><span style={{fontSize:'18px',fontWeight:'500'}}>● JurisFlow</span></div>
        <h1 style={{fontSize:'16px',fontWeight:'500',marginBottom:'1rem'}}>Criar conta</h1>
        <label style={lbl}>Nome completo</label><input style={inp} value={form.name} onChange={set('name')} placeholder="Dr. João Silva"/>
        <label style={lbl}>E-mail</label><input style={inp} type="email" value={form.email} onChange={set('email')} placeholder="joao@escritorio.com"/>
        <label style={lbl}>Senha</label><input style={inp} type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres"/>
        <div style={{display:'flex',gap:'8px'}}>
          <div style={{flex:1}}><label style={lbl}>Nº OAB</label><input style={inp} value={form.oabNumber} onChange={set('oabNumber')} placeholder="123456"/></div>
          <div style={{width:'80px'}}><label style={lbl}>Estado</label><select style={inp} value={form.oabState} onChange={set('oabState')}>{estados.map(e=><option key={e}>{e}</option>)}</select></div>
        </div>
        {err&&<div style={{color:'#dc2626',fontSize:'12px',marginTop:'8px',background:'#fef2f2',padding:'8px',borderRadius:'6px'}}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{width:'100%',padding:'10px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',marginTop:'16px'}}>{loading?'Cadastrando...':'Criar conta'}</button>
        <p style={{textAlign:'center',fontSize:'13px',color:'#6b7280',marginTop:'1rem'}}>Já tem conta? <a href="/login" style={{color:'#1d4ed8'}}>Entrar</a></p>
      </div>
    </div>
  )
}

function Layout({ children, page }: any) {
  const { user, logout } = useAuth()
  const nav = [{href:'/dashboard',label:'Dashboard',icon:'▦'},{href:'/crm',label:'CRM',icon:'⊡'},{href:'/documents',label:'Documentos',icon:'◻'},{href:'/whatsapp',label:'WhatsApp + IA',icon:'◉'},{href:'/ads',label:'Ads & Pixel',icon:'◈'},{href:'/social',label:'Redes Sociais',icon:'◎'}]
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'200px',minWidth:'200px',background:'white',borderRight:'1px solid #e5e7eb',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1d4ed8'}}/><span style={{fontSize:'15px',fontWeight:'500'}}>JurisFlow</span></div>
        </div>
        <nav style={{flex:1,paddingTop:'8px',overflowY:'auto'}}>
          {nav.map(n=>(
            <a key={n.href} href={n.href} style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 16px',fontSize:'13px',color:page===n.href.slice(1)?'#1d4ed8':'#6b7280',background:page===n.href.slice(1)?'#eff6ff':'transparent',borderLeft:page===n.href.slice(1)?'2px solid #1d4ed8':'2px solid transparent',textDecoration:'none'}}>
              <span>{n.icon}</span>{n.label}
            </a>
          ))}
        </nav>
        <div style={{padding:'12px 16px',borderTop:'1px solid #e5e7eb'}}>
          <p style={{fontSize:'12px',fontWeight:'500',color:'#111827',margin:0}}>{user?.name}</p>
          <p style={{fontSize:'11px',color:'#9ca3af',margin:'2px 0 8px'}}>{user?.email}</p>
          <button onClick={logout} style={{fontSize:'11px',color:'#9ca3af',background:'none',border:'none',cursor:'pointer',padding:0}}>Sair</button>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto'}}>{children}</div>
    </div>
  )
}

function Dashboard() {
  const token = localStorage.getItem('jf_token')
  const [clients, setClients] = useState<any[]>([])
  useEffect(()=>{
    fetch(`${API}/clients`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setClients(d)}).catch(()=>{})
  },[])
  return (
    <Layout page="dashboard">
      <div style={{padding:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:0}}>Visão geral</h1>
          <a href="/crm" style={{padding:'8px 16px',background:'#1d4ed8',color:'white',borderRadius:'8px',fontSize:'13px',fontWeight:'500',textDecoration:'none'}}>+ Novo cliente</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'1.5rem'}}>
          {[{l:'Total clientes',v:clients.length},{l:'Ativos',v:clients.filter(c=>c.status!=='LOST').length},{l:'Ganhos',v:clients.filter(c=>c.status==='WON').length},{l:'Novos',v:clients.filter(c=>c.status==='NEW').length}].map(m=>(
            <div key={m.l} style={{background:'#f3f4f6',borderRadius:'10px',padding:'12px 14px'}}>
              <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>{m.l}</div>
              <div style={{fontSize:'22px',fontWeight:'500',color:'#111827',marginTop:'4px'}}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem'}}>
          <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Clientes recentes</h2>
          {clients.length===0
            ? <p style={{fontSize:'13px',color:'#9ca3af',textAlign:'center',padding:'2rem 0'}}>Nenhum cliente ainda. <a href="/crm" style={{color:'#1d4ed8'}}>Adicionar</a></p>
            : clients.slice(0,5).map(c=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'500',color:'#5b21b6',flexShrink:0}}>
                  {c.name.split(' ').map((n:string)=>n[0]).slice(0,2).join('')}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'13px',fontWeight:'500',color:'#111827',margin:0}}>{c.name}</p>
                  <p style={{fontSize:'11px',color:'#9ca3af',margin:0}}>{areaLabel[c.legalArea]} · {c.phone}</p>
                </div>
                <span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'20px',background:statusColor[c.status]||'#f3f4f6',color:'#374151',whiteSpace:'nowrap'}}>{statusLabel[c.status]}</span>
              </div>
            ))
          }
        </div>
      </div>
    </Layout>
  )
}

function ClientModal({ client, onClose, onUpdate }: any) {
  const token = localStorage.getItem('jf_token')
  const headers = {'Content-Type':'application/json',Authorization:`Bearer ${token}`}
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({...client})
  const [saving, setSaving] = useState(false)
  const set = (k:string)=>(e:any)=>setForm((f:any)=>({...f,[k]:e.target.value}))
  const stages = ['NEW','QUALIFIED','NEGOTIATING','WON','LOST']
  const save = async () => {
    setSaving(true)
    await fetch(`${API}/clients/${client.id}`,{method:'PATCH',headers,body:JSON.stringify(form)})
    setSaving(false); setEditing(false); onUpdate()
  }
  const moveStage = async (status: string) => {
    await fetch(`${API}/clients/${client.id}`,{method:'PATCH',headers,body:JSON.stringify({status})})
    onUpdate(); onClose()
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'1rem'}}>
      <div style={{background:'white',borderRadius:'12px',width:'100%',maxWidth:'500px',maxHeight:'90vh',overflow:'auto'}}>
        <div style={{padding:'1.25rem 1.5rem',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'500',color:'#5b21b6'}}>
              {client.name.split(' ').map((n:string)=>n[0]).slice(0,2).join('')}
            </div>
            <div>
              <p style={{fontSize:'15px',fontWeight:'500',margin:0}}>{client.name}</p>
              <p style={{fontSize:'12px',color:'#9ca3af',margin:0}}>{areaLabel[client.legalArea]}</p>
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'#9ca3af'}}>✕</button>
        </div>
        <div style={{padding:'1.25rem 1.5rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'1rem'}}>
            {[{l:'Telefone',v:client.phone},{l:'E-mail',v:client.email||'—'},{l:'CPF',v:client.cpf||'—'},{l:'Valor',v:client.dealValue?`R$ ${Number(client.dealValue).toLocaleString('pt-BR')}`:'—'}].map(f=>(
              <div key={f.l} style={{background:'#f9fafb',borderRadius:'8px',padding:'10px 12px'}}>
                <p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 2px'}}>{f.l}</p>
                <p style={{fontSize:'13px',fontWeight:'500',color:'#111827',margin:0}}>{f.v}</p>
              </div>
            ))}
          </div>
          {client.caseDesc&&<div style={{background:'#f9fafb',borderRadius:'8px',padding:'10px 12px',marginBottom:'1rem'}}><p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 4px'}}>Caso</p><p style={{fontSize:'13px',color:'#111827',margin:0}}>{client.caseDesc}</p></div>}
          <div style={{marginBottom:'1rem'}}>
            <p style={{fontSize:'12px',fontWeight:'500',color:'#374151',margin:'0 0 8px'}}>Pipeline</p>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {stages.map(s=>(
                <button key={s} onClick={()=>moveStage(s)} style={{padding:'5px 12px',border:'1px solid',borderColor:client.status===s?'#1d4ed8':'#e5e7eb',borderRadius:'20px',fontSize:'12px',background:client.status===s?'#1d4ed8':'white',color:client.status===s?'white':'#6b7280',cursor:'pointer'}}>
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>
          {editing?(
            <div>
              <label style={lbl}>Nome</label><input style={inp} value={form.name} onChange={set('name')}/>
              <label style={lbl}>Telefone</label><input style={inp} value={form.phone||''} onChange={set('phone')}/>
              <label style={lbl}>E-mail</label><input style={inp} value={form.email||''} onChange={set('email')}/>
              <label style={lbl}>Valor (R$)</label><input style={inp} value={form.dealValue||''} onChange={set('dealValue')}/>
              <label style={lbl}>Descrição</label><input style={inp} value={form.caseDesc||''} onChange={set('caseDesc')}/>
              <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                <button onClick={()=>setEditing(false)} style={{flex:1,padding:'9px',border:'1px solid #e5e7eb',borderRadius:'8px',background:'white',cursor:'pointer',fontSize:'13px'}}>Cancelar</button>
                <button onClick={save} disabled={saving} style={{flex:1,padding:'9px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>{saving?'Salvando...':'Salvar'}</button>
              </div>
            </div>
          ):(
            <button onClick={()=>setEditing(true)} style={{width:'100%',padding:'9px',border:'1px solid #e5e7eb',borderRadius:'8px',background:'white',cursor:'pointer',fontSize:'13px',color:'#374151'}}>Editar cliente</button>
          )}
        </div>
      </div>
    </div>
  )
}

function CRM() {
  const token = localStorage.getItem('jf_token')
  const headers = {'Content-Type':'application/json',Authorization:`Bearer ${token}`}
  const [clients, setClients] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({name:'',phone:'',cpf:'',email:'',legalArea:'PREVIDENCIARIO',caseDesc:'',dealValue:'',source:''})
  const [saving, setSaving] = useState(false)
  const load = ()=>fetch(`${API}/clients`,{headers}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setClients(d)}).catch(()=>{})
  useEffect(()=>{load()},[])
  const set = (k:string)=>(e:any)=>setForm(f=>({...f,[k]:e.target.value}))
  const save = async()=>{
    if(!form.name||!form.phone) return
    setSaving(true)
    try{await fetch(`${API}/clients`,{method:'POST',headers,body:JSON.stringify({...form,dealValue:form.dealValue?parseFloat(form.dealValue):undefined})});setModal(false);setForm({name:'',phone:'',cpf:'',email:'',legalArea:'PREVIDENCIARIO',caseDesc:'',dealValue:'',source:''});load()}catch{}
    setSaving(false)
  }
  const move = async(id:string,status:string)=>{await fetch(`${API}/clients/${id}`,{method:'PATCH',headers,body:JSON.stringify({status})});load()}
  const stages = ['NEW','QUALIFIED','NEGOTIATING','WON','LOST']
  return (
    <Layout page="crm">
      <div style={{padding:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:0}}>CRM</h1>
          <button onClick={()=>setModal(true)} style={{padding:'8px 16px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>+ Novo cliente</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px'}}>
          {stages.map(stage=>(
            <div key={stage} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'10px',padding:'12px',minWidth:'130px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                <span style={{fontSize:'11px',fontWeight:'500',color:'#374151'}}>{statusLabel[stage]}</span>
                <span style={{fontSize:'11px',background:'#f3f4f6',padding:'1px 6px',borderRadius:'10px',color:'#6b7280'}}>{clients.filter(c=>c.status===stage).length}</span>
              </div>
              {clients.filter(c=>c.status===stage).map(c=>(
                <div key={c.id} onClick={()=>setSelected(c)} style={{background:'#f9fafb',borderRadius:'8px',padding:'10px',marginBottom:'8px',cursor:'pointer'}}>
                  <p style={{fontSize:'12px',fontWeight:'500',color:'#111827',margin:'0 0 3px'}}>{c.name}</p>
                  <p style={{fontSize:'11px',color:'#9ca3af',margin:'0 0 4px'}}>{areaOpts.find(a=>a.value===c.legalArea)?.label}</p>
                  {c.dealValue&&<p style={{fontSize:'11px',color:'#16a34a',fontWeight:'500',margin:'0 0 6px'}}>R$ {Number(c.dealValue).toLocaleString('pt-BR')}</p>}
                  <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                    {stages.filter(s=>s!==stage).slice(0,2).map(ns=>(
                      <button key={ns} onClick={e=>{e.stopPropagation();move(c.id,ns)}} style={{fontSize:'10px',padding:'2px 5px',border:'1px solid #e5e7eb',borderRadius:'4px',background:'white',cursor:'pointer',color:'#6b7280'}}>→{statusLabel[ns]}</button>
                    ))}
                  </div>
                </div>
              ))}
              {clients.filter(c=>c.status===stage).length===0&&<p style={{fontSize:'11px',color:'#d1d5db',textAlign:'center',padding:'12px 0'}}>Vazio</p>}
            </div>
          ))}
        </div>
      </div>
      {selected&&<ClientModal client={selected} onClose={()=>setSelected(null)} onUpdate={()=>{load();setSelected(null)}}/>}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'1rem'}}>
          <div style={{background:'white',borderRadius:'12px',padding:'1.5rem',width:'100%',maxWidth:'460px',maxHeight:'90vh',overflow:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h2 style={{fontSize:'15px',fontWeight:'500',margin:0}}>Novo cliente</h2>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#9ca3af'}}>✕</button>
            </div>
            <label style={lbl}>Nome completo *</label><input style={inp} value={form.name} onChange={set('name')} placeholder="Maria Santos"/>
            <label style={lbl}>Telefone *</label><input style={inp} value={form.phone} onChange={set('phone')} placeholder="82 99999-0000"/>
            <label style={lbl}>CPF</label><input style={inp} value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00"/>
            <label style={lbl}>E-mail</label><input style={inp} value={form.email} onChange={set('email')} placeholder="maria@email.com"/>
            <label style={lbl}>Área do direito *</label>
            <select style={inp} value={form.legalArea} onChange={set('legalArea')}>{areaOpts.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}</select>
            <label style={lbl}>Descrição do caso</label><input style={inp} value={form.caseDesc} onChange={set('caseDesc')} placeholder="Descreva o caso..."/>
            <label style={lbl}>Valor estimado (R$)</label><input style={inp} value={form.dealValue} onChange={set('dealValue')} placeholder="3500"/>
            <div style={{display:'flex',gap:'8px',marginTop:'1.25rem'}}>
              <button onClick={()=>setModal(false)} style={{flex:1,padding:'10px',border:'1px solid #e5e7eb',borderRadius:'8px',background:'white',cursor:'pointer',fontSize:'13px'}}>Cancelar</button>
              <button onClick={save} disabled={saving||!form.name||!form.phone} style={{flex:1,padding:'10px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'500',opacity:saving?0.6:1}}>{saving?'Salvando...':'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function Documents() {
  const token = localStorage.getItem('jf_token')
  const headers = {'Content-Type':'application/json',Authorization:`Bearer ${token}`}
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [docType, setDocType] = useState('PROCURACAO')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  useEffect(()=>{
    fetch(`${API}/clients`,{headers}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setClients(d)}).catch(()=>{})
  },[])
  const docTypes = [{value:'PROCURACAO',label:'Procuração',desc:'Autorização para representação legal'},{value:'CONTRATO_HONORARIOS',label:'Contrato de honorários',desc:'Prestação de serviços advocatícios'},{value:'PETICAO_INICIAL',label:'Petição inicial',desc:'Petição para distribuição judicial'}]
  const client = clients.find(c=>c.id===selectedClient)

  const generate = async () => {
    if (!selectedClient) return setResult('Selecione um cliente primeiro.')
    setGenerating(true); setResult('')
    try {
      const r = await fetch(`${API}/documents/generate`,{method:'POST',headers,body:JSON.stringify({clientId:selectedClient,type:docType})})
      const d = await r.json()
      if (d.downloadUrl) {
        setResult(`Documento gerado! Baixar: ${d.downloadUrl}`)
      } else {
        setResult(d.error||'Documento criado com sucesso!')
      }
    } catch { setResult('Erro ao gerar documento.') }
    setGenerating(false)
  }

  return (
    <Layout page="documents">
      <div style={{padding:'1.5rem'}}>
        <h1 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:'0 0 1.5rem'}}>Documentos automáticos</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem'}}>
            <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Gerar documento</h2>
            <label style={lbl}>Cliente do CRM</label>
            <select style={inp} value={selectedClient} onChange={e=>setSelectedClient(e.target.value)}>
              <option value="">Selecione o cliente...</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {areaLabel[c.legalArea]}</option>)}
            </select>
            {client&&(
              <div style={{background:'#f0f9ff',borderRadius:'8px',padding:'10px 12px',marginTop:'10px'}}>
                <p style={{fontSize:'12px',color:'#0369a1',margin:0,fontWeight:'500'}}>{client.name}</p>
                <p style={{fontSize:'11px',color:'#0284c7',margin:'2px 0 0'}}>{client.phone} · {areaLabel[client.legalArea]}</p>
              </div>
            )}
            <label style={{...lbl,marginTop:'16px'}}>Tipo de documento</label>
            <div style={{marginTop:'8px',display:'flex',flexDirection:'column',gap:'8px'}}>
              {docTypes.map(d=>(
                <label key={d.value} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px 12px',border:'1px solid',borderColor:docType===d.value?'#1d4ed8':'#e5e7eb',borderRadius:'8px',cursor:'pointer',background:docType===d.value?'#eff6ff':'white'}}>
                  <input type="radio" name="doc" value={d.value} checked={docType===d.value} onChange={()=>setDocType(d.value)} style={{marginTop:'2px'}}/>
                  <div><p style={{fontSize:'13px',fontWeight:'500',margin:0,color:'#111827'}}>{d.label}</p><p style={{fontSize:'11px',color:'#9ca3af',margin:'2px 0 0'}}>{d.desc}</p></div>
                </label>
              ))}
            </div>
            {result&&<div style={{marginTop:'12px',padding:'10px 12px',background:result.includes('Erro')?'#fef2f2':'#f0fdf4',borderRadius:'8px',fontSize:'12px',color:result.includes('Erro')?'#dc2626':'#16a34a'}}>{result}</div>}
            <button onClick={generate} disabled={generating||!selectedClient} style={{width:'100%',padding:'10px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',marginTop:'16px',opacity:generating?0.6:1}}>{generating?'Gerando...':'Gerar documento'}</button>
          </div>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem'}}>
            <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Como funciona</h2>
            {[{n:'1',t:'Selecione o cliente',d:'Escolha um cliente cadastrado no CRM — os dados são importados automaticamente.'},{n:'2',t:'Escolha o documento',d:'Procuração, contrato de honorários ou petição inicial.'},{n:'3',t:'Gere e baixe',d:'O sistema preenche o template com os dados do cliente e gera o PDF.'}].map(s=>(
              <div key={s.n} style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
                <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'500',color:'#1d4ed8',flexShrink:0}}>{s.n}</div>
                <div><p style={{fontSize:'13px',fontWeight:'500',color:'#111827',margin:'0 0 2px'}}>{s.t}</p><p style={{fontSize:'12px',color:'#9ca3af',margin:0}}>{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function WhatsApp() {
  const [msgs, setMsgs] = useState([
    {role:'bot',text:'Olá! Sou o assistente JurisFlow. Como posso ajudar com sua questão jurídica hoje?',area:''},
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const areas = ['PREVIDENCIARIO','FAMILIA','CRIMINAL','TRABALHISTA','CIVIL']
  const [area, setArea] = useState('PREVIDENCIARIO')

  const send = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMsgs(m=>[...m,{role:'user',text:userMsg,area:''}])
    setLoading(true)
    try {
      const history = msgs.filter(m=>m.role!=='system').map(m=>({role:m.role==='bot'?'assistant':'user',content:m.text}))
      history.push({role:'user',content:userMsg})
      const r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:400,
          system:`Você é um assistente jurídico especializado em ${area === 'PREVIDENCIARIO' ? 'Direito Previdenciário' : area === 'FAMILIA' ? 'Direito de Família' : area === 'CRIMINAL' ? 'Direito Criminal' : area === 'TRABALHISTA' ? 'Direito Trabalhista' : 'Direito Civil'} brasileiro. Atenda com empatia, clareza e objetividade. Explique de forma simples, sem jargão. Máximo 3 parágrafos. Ao final, ofereça consulta gratuita.`,
          messages:history
        })
      })
      const d = await r.json()
      const text = d.content?.[0]?.text || 'Desculpe, não consegui processar. Tente novamente.'
      setMsgs(m=>[...m,{role:'bot',text,area}])
    } catch {
      setMsgs(m=>[...m,{role:'bot',text:'Configure a ANTHROPIC_API_KEY no Railway para ativar a IA de atendimento.',area:''}])
    }
    setLoading(false)
  }

  return (
    <Layout page="whatsapp">
      <div style={{padding:'1.5rem',height:'calc(100vh - 0px)',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h1 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:0}}>WhatsApp + IA</h1>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'12px',color:'#6b7280'}}>Área:</span>
            <select value={area} onChange={e=>setArea(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px'}}>
              {areas.map(a=><option key={a} value={a}>{areaLabel[a]}</option>)}
            </select>
          </div>
        </div>
        <div style={{flex:1,background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{background:'#075e54',padding:'12px 16px',display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#25d366',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'500',color:'#075e54'}}>JF</div>
            <div><p style={{fontSize:'13px',fontWeight:'500',color:'white',margin:0}}>JurisFlow IA</p><p style={{fontSize:'11px',color:'#9de3d4',margin:0}}>Assistente jurídico • {areaLabel[area]}</p></div>
          </div>
          <div style={{flex:1,overflow:'auto',padding:'16px',background:'#f0f0f0',display:'flex',flexDirection:'column',gap:'8px'}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'75%',padding:'8px 12px',borderRadius:'10px',fontSize:'13px',lineHeight:'1.5',background:m.role==='user'?'#dcf8c6':'white',color:'#111827',borderBottomRightRadius:m.role==='user'?'2px':'10px',borderBottomLeftRadius:m.role==='bot'?'2px':'10px'}}>
                  {m.role==='bot'&&m.area&&<p style={{fontSize:'10px',color:'#1d4ed8',fontWeight:'500',margin:'0 0 4px'}}>{areaLabel[m.area]}</p>}
                  {m.text}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:'flex',justifyContent:'flex-start'}}><div style={{background:'white',padding:'8px 12px',borderRadius:'10px',fontSize:'13px',color:'#9ca3af'}}>Digitando...</div></div>}
          </div>
          <div style={{padding:'12px',borderTop:'1px solid #e5e7eb',display:'flex',gap:'8px'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Digite sua mensagem..." style={{flex:1,padding:'9px 12px',border:'1px solid #e5e7eb',borderRadius:'20px',fontSize:'13px'}}/>
            <button onClick={send} disabled={loading||!input.trim()} style={{padding:'9px 16px',background:'#25d366',color:'white',border:'none',borderRadius:'20px',cursor:'pointer',fontSize:'13px',fontWeight:'500',opacity:loading?0.6:1}}>Enviar</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Ads() {
  const metrics = [{l:'Investido',v:'R$ 1.840',d:'+12%'},{l:'Leads gerados',v:'47',d:'+8 hoje'},{l:'Custo/lead',v:'R$ 39',d:'-R$6'},{l:'Conversões',v:'12',d:'+3 hoje'},{l:'ROAS',v:'4.2x',d:'+0.4x'}]
  const campaigns = [{name:'Previdenciário — INSS negado',platform:'Meta',spend:'R$ 640',leads:21,conv:6,cpa:'R$ 107'},{name:'Divórcio rápido — Família',platform:'Meta',spend:'R$ 410',leads:14,conv:4,cpa:'R$ 103'},{name:'Defesa criminal 24h',platform:'Google',spend:'R$ 790',leads:8,conv:2,cpa:'R$ 395'}]
  const funnel = [{s:'Impressões',v:24800},{s:'Cliques',v:1340},{s:'Leads',v:47},{s:'Atendidos IA',v:39},{s:'Convertidos',v:12}]
  return (
    <Layout page="ads">
      <div style={{padding:'1.5rem'}}>
        <h1 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:'0 0 1.5rem'}}>Ads & Pixel</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px',marginBottom:'1.5rem'}}>
          {metrics.map(m=>(
            <div key={m.l} style={{background:'#f3f4f6',borderRadius:'10px',padding:'12px 14px'}}>
              <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>{m.l}</div>
              <div style={{fontSize:'20px',fontWeight:'500',color:'#111827',marginTop:'4px'}}>{m.v}</div>
              <div style={{fontSize:'11px',color:'#16a34a',marginTop:'2px'}}>{m.d}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem'}}>
            <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Campanhas ativas</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto auto',gap:'8px',fontSize:'11px',color:'#9ca3af',marginBottom:'8px',padding:'0 0 8px',borderBottom:'1px solid #f3f4f6'}}>
              <span>Campanha</span><span>Plataforma</span><span>Gasto</span><span>Leads</span><span>CPA</span>
            </div>
            {campaigns.map((c,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr auto auto auto auto',gap:'8px',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f9fafb',fontSize:'13px'}}>
                <span style={{color:'#111827',fontWeight:'500'}}>{c.name}</span>
                <span style={{fontSize:'11px',padding:'2px 7px',borderRadius:'10px',background:c.platform==='Meta'?'#dbeafe':'#fef3c7',color:c.platform==='Meta'?'#1e40af':'#92400e'}}>{c.platform}</span>
                <span style={{color:'#374151'}}>{c.spend}</span>
                <span style={{color:'#374151'}}>{c.leads}</span>
                <span style={{color:'#6b7280'}}>{c.cpa}</span>
              </div>
            ))}
          </div>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem'}}>
            <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Funil de conversão</h2>
            {funnel.map((f,i)=>{
              const pct = Math.round((f.v/funnel[0].v)*100)
              return (
                <div key={i} style={{marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                    <span style={{color:'#374151'}}>{f.s}</span>
                    <span style={{fontWeight:'500',color:'#111827'}}>{f.v.toLocaleString('pt-BR')}</span>
                  </div>
                  <div style={{height:'6px',background:'#f3f4f6',borderRadius:'3px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:'#1d4ed8',borderRadius:'3px'}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'10px',padding:'12px 16px',fontSize:'13px',color:'#92400e'}}>
          Para conectar Meta Ads e Google Ads reais, adicione META_ACCESS_TOKEN e GOOGLE_ADS_DEVELOPER_TOKEN nas variáveis do Railway.
        </div>
      </div>
    </Layout>
  )
}

function Social() {
  const posts = [
    {emoji:'⚖',title:'INSS negou seu benefício? Saiba seus direitos',area:'PREVIDENCIARIO',likes:847,comments:63,shares:120},
    {emoji:'👨‍👩‍👧',title:'Divórcio consensual: tudo que você precisa saber',area:'FAMILIA',likes:612,comments:41,shares:98},
    {emoji:'🔒',title:'Preso em flagrante? Veja o que fazer nas primeiras 24h',area:'CRIMINAL',likes:1200,comments:89,shares:204},
    {emoji:'📋',title:'5 documentos para garantir sua aposentadoria',area:'PREVIDENCIARIO',likes:503,comments:37,shares:87},
    {emoji:'💰',title:'Como calcular a pensão alimentícia corretamente',area:'FAMILIA',likes:428,comments:52,shares:73},
    {emoji:'📱',title:'Habeas corpus: o que é e quando usar',area:'CRIMINAL',likes:389,comments:28,shares:61},
  ]
  const suggestions = [
    {format:'Carrossel',title:'5 erros que fazem o INSS negar seu benefício',area:'PREVIDENCIARIO',horario:'Seg–Sex 19h'},
    {format:'Reels',title:'O que fazer nas primeiras 24h após uma prisão',area:'CRIMINAL',horario:'Ter ou Qui 19h'},
    {format:'Story',title:'Você sabe seus direitos na separação?',area:'FAMILIA',horario:'Qua 12h'},
  ]
  const areaColor: any = {PREVIDENCIARIO:'#ede9fe',FAMILIA:'#dcfce7',CRIMINAL:'#fef3c7'}
  const areaText: any = {PREVIDENCIARIO:'#5b21b6',FAMILIA:'#15803d',CRIMINAL:'#92400e'}
  return (
    <Layout page="social">
      <div style={{padding:'1.5rem'}}>
        <h1 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:'0 0 1.5rem'}}>Redes Sociais</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'1.5rem'}}>
          {[{l:'Seguidores',v:'4.820'},{l:'Engajamento',v:'6.3%'},{l:'Alcance (7d)',v:'12.4k'},{l:'Leads via bio',v:'23'}].map(m=>(
            <div key={m.l} style={{background:'#f3f4f6',borderRadius:'10px',padding:'12px 14px'}}>
              <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>{m.l}</div>
              <div style={{fontSize:'22px',fontWeight:'500',color:'#111827',marginTop:'4px'}}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'1rem'}}>
          <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem'}}>
            <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Posts com maior engajamento</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
              {posts.map((p,i)=>(
                <div key={i} style={{border:'1px solid #e5e7eb',borderRadius:'10px',overflow:'hidden'}}>
                  <div style={{height:'64px',background:areaColor[p.area]||'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>{p.emoji}</div>
                  <div style={{padding:'8px'}}>
                    <p style={{fontSize:'11px',color:'#374151',margin:'0 0 6px',lineHeight:'1.4',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{p.title}</p>
                    <div style={{display:'flex',gap:'6px',fontSize:'10px',color:'#9ca3af'}}>
                      <span>❤ {p.likes}</span><span>💬 {p.comments}</span><span>↗ {p.shares}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
              <h2 style={{fontSize:'14px',fontWeight:'500',margin:'0 0 1rem'}}>Sugestões de conteúdo IA</h2>
              {suggestions.map((s,i)=>(
                <div key={i} style={{padding:'10px 0',borderBottom:i<suggestions.length-1?'1px solid #f3f4f6':'none'}}>
                  <div style={{display:'flex',gap:'6px',marginBottom:'4px'}}>
                    <span style={{fontSize:'10px',padding:'2px 6px',borderRadius:'6px',background:'#f3f4f6',color:'#374151'}}>{s.format}</span>
                    <span style={{fontSize:'10px',padding:'2px 6px',borderRadius:'6px',background:areaColor[s.area],color:areaText[s.area]}}>{areaLabel[s.area]}</span>
                  </div>
                  <p style={{fontSize:'12px',fontWeight:'500',color:'#111827',margin:'0 0 2px'}}>{s.title}</p>
                  <p style={{fontSize:'11px',color:'#3b82f6',margin:0}}>Melhor horário: {s.horario}</p>
                </div>
              ))}
            </div>
            <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'10px',padding:'12px 16px',fontSize:'12px',color:'#92400e'}}>
              Para sincronizar posts reais, configure INSTAGRAM_ACCESS_TOKEN nas variáveis do Railway.
            </div>
          </div>
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
          <Route path="/documents" element={<Protected><Documents /></Protected>} />
          <Route path="/whatsapp" element={<Protected><WhatsApp /></Protected>} />
          <Route path="/ads" element={<Protected><Ads /></Protected>} />
          <Route path="/social" element={<Protected><Social /></Protected>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

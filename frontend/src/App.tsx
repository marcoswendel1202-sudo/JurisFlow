import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
function Login() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',border:'1px solid #e5e7eb',width:'100%',maxWidth:'360px'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#1d4ed8'}}/>
            <span style={{fontSize:'20px',fontWeight:'500'}}>JurisFlow</span>
          </div>
          <p style={{fontSize:'13px',color:'#6b7280',marginTop:'4px'}}>Gestão jurídica inteligente</p>
        </div>
        <h1 style={{fontSize:'16px',fontWeight:'500',marginBottom:'1.5rem'}}>Entrar na conta</h1>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block',fontSize:'12px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>E-mail</label>
          <input type="email" placeholder="seu@email.com" style={{width:'100%',padding:'10px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{display:'block',fontSize:'12px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Senha</label>
          <input type="password" placeholder="••••••••" style={{width:'100%',padding:'10px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/>
        </div>
        <button style={{width:'100%',padding:'10px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer'}}>Entrar</button>
        <p style={{textAlign:'center',fontSize:'13px',color:'#6b7280',marginTop:'1rem'}}>Não tem conta? <a href="/register" style={{color:'#1d4ed8'}}>Cadastre-se</a></p>
      </div>
    </div>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

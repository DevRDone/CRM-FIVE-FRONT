import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      
      if (data && data.session) {
        localStorage.setItem('fiveforms_token', data.session.access_token);
        navigate('/crm');
      }
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h1 className="logo-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <img src="/logo_five.PNG" alt="Five" style={{ height: '48px' }} />
            <span className="neon-dot" style={{ marginLeft: '-4px' }}>.</span>FORMS
          </h1>
          <p>Faça login para acessar o CRM</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {import.meta.env.DEV && (
            <button 
              type="button" 
              className="btn-secondary w-full" 
              style={{ marginTop: '1rem', border: '1px dashed #666', background: 'transparent' }}
              onClick={async () => {
                setError('');
                setLoading(true);
                try {
                  const { data, error: devError } = await supabase.auth.signInWithPassword({ 
                    email: 'admin@fiveforms.com', 
                    password: 'FiveFormsProd2026!' 
                  });
                  if (devError) throw devError;
                  
                  if (data && data.session) {
                    localStorage.setItem('fiveforms_token', data.session.access_token);
                    navigate('/crm');
                  }
                } catch (err) {
                  console.error(err);
                  setError(err.message || 'Erro no login automático.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Acesso Rápido (Dev)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

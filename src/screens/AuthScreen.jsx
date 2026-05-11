import React, { useState, useCallback } from 'react';
import { THEME } from '../constants/theme';
import { signup, login } from '../services/storage';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const AuthScreen = React.memo(({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill all fields.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = mode === 'signup'
        ? signup({ name, email, password })
        : login({ email, password });
      setLoading(false);
      if (result.success) onAuth(result.session);
      else setError(result.error);
    }, 400);
  }, [mode, name, email, password, onAuth]);

  const handleKey = useCallback((e) => { if (e.key === 'Enter') handleSubmit(); }, [handleSubmit]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: THEME.bg, padding: '24px',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(200,245,53,0.03) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(111,168,26,0.04) 0%, transparent 50%)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px', background: THEME.accent, borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(200,245,53,0.3)',
          }}>
            <span style={{ fontSize: '26px', color: '#060606', fontWeight: 700 }}>E</span>
          </div>
          <h1 style={{ fontFamily: THEME.fontHeading, fontSize: '36px', fontWeight: 700, color: THEME.textPrimary, letterSpacing: '0.08em' }}>ELEVATE</h1>
          <p style={{ fontFamily: THEME.fontMono, fontSize: '11px', color: THEME.textMuted, letterSpacing: '0.15em', marginTop: '4px' }}>SELF-IMPROVEMENT TRACKER</p>
        </div>

        {/* Card */}
        <div style={{
          background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: THEME.radiusLg,
          padding: '32px', boxShadow: THEME.shadow,
        }}>
          {/* Toggle */}
          <div style={{ display: 'flex', background: THEME.bg, borderRadius: THEME.radiusSm, padding: '3px', marginBottom: '28px', border: `1px solid ${THEME.border}` }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  background: mode === m ? THEME.accent : 'transparent',
                  color: mode === m ? '#060606' : THEME.textSecondary,
                  fontSize: '12px', fontFamily: THEME.fontMono, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase', transition: THEME.transition,
                }}
              >{m === 'login' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey} placeholder="Your name" />
            )}
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} placeholder="you@example.com" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'} error={error} />

            <Button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '4px', padding: '12px' }}>
              {loading ? '...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </Button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          Data stored locally in your browser
        </p>
      </div>
    </div>
  );
});

AuthScreen.displayName = 'AuthScreen';
export default AuthScreen;

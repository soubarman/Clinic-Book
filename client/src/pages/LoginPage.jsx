import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Stethoscope, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPwd, setAdminPwd] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleAfterLogin = (token, user) => {
    login(token, user);
    if (!user.profileComplete) {
      navigate('/profile-setup', { replace: true, state: { from } });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post('/auth/google-login', { idToken });
      toast.success(`Welcome, ${res.data.user.name || res.data.user.email}!`);
      handleAfterLogin(res.data.token, res.data.user);
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(err.response?.data?.message || err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim()) return toast.error('Enter your email');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (mode === 'signup') {
      if (!name.trim()) return toast.error('Enter your name');
      if (phone.length < 10) return toast.error('Enter a valid 10-digit phone number');
    }
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/email-signup' : '/auth/email-login';
      const payload = mode === 'signup' ? { email, password, name, phone } : { email, password };
      const res = await api.post(endpoint, payload);
      toast.success(mode === 'signup' ? 'Account created!' : 'Welcome back!');
      handleAfterLogin(res.data.token, res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin-login', { phone: adminPhone, password: adminPwd });
      login(res.data.token, res.data.user);
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0EA5E9 0%, #6366F1 50%, #8B5CF6 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'Inter, sans-serif',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <Stethoscope size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 28, margin: 0 }}>
            ClinicBook
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>
            {isAdmin ? 'Admin portal' : mode === 'signup' ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 28,
          padding: 28,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}>
          <AnimatePresence mode="wait">
            {isAdmin ? (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, color: '#1e293b' }}>Admin Login</h2>
                <input className="input" type="tel" placeholder="Admin phone number"
                  value={adminPhone} onChange={e => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ marginBottom: 12 }} />
                <input className="input" type="password" placeholder="Password"
                  value={adminPwd} onChange={e => setAdminPwd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  style={{ marginBottom: 20 }} />
                <button className="btn-primary" style={{ width: '100%' }} onClick={handleAdminLogin} disabled={loading}>
                  {loading ? 'Signing in...' : 'Login as Admin'}
                </button>
                <button onClick={() => setIsAdmin(false)} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                  ← Back
                </button>
              </motion.div>
            ) : (
              <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Google Button */}
                <button onClick={handleGoogle} disabled={loading} style={{
                  width: '100%', padding: '13px 16px',
                  border: '2px solid #e2e8f0', borderRadius: 14,
                  background: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 15, fontWeight: 600, color: '#334155',
                  transition: 'all 0.2s', marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#0EA5E9'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                {/* Tab switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20 }}>
                  {['signin', 'signup'].map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
                      background: mode === m ? 'white' : 'transparent',
                      color: mode === m ? '#1e293b' : '#64748b',
                      fontWeight: mode === m ? 700 : 500, fontSize: 14,
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}>
                      {m === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>

                {/* Name & Phone (signup only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ position: 'relative', marginBottom: 12 }}>
                        <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input className="input" placeholder="Your full name" value={name}
                          onChange={e => setName(e.target.value)}
                          style={{ paddingLeft: 40 }} />
                      </div>
                      <div style={{ position: 'relative', marginBottom: 12 }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>+91</div>
                        <input className="input" type="tel" placeholder="Phone number" value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          style={{ paddingLeft: 46 }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="input" type="email" placeholder="Email address" value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: 40 }} />
                </div>

                {/* Password */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="input" type={showPwd ? 'text' : 'password'} placeholder="Password (min 6 chars)"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                    style={{ paddingLeft: 40, paddingRight: 40 }} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                  }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleEmailAuth} disabled={loading}>
                  {loading ? 'Please wait...' : <>{mode === 'signup' ? 'Create Account' : 'Sign In'} <ArrowRight size={16} /></>}
                </button>

                <button onClick={() => setIsAdmin(true)} style={{
                  width: '100%', marginTop: 16, background: 'none', border: 'none',
                  color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                }}>
                  🔒 Admin Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* reCAPTCHA container — required by Firebase, kept hidden */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0 }}></div>
    </div>
  );
}

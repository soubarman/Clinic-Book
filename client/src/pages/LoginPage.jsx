import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [step, setStep] = useState('phone'); // phone | otp | name
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (phone.length < 10) return toast.error('Enter valid 10-digit phone number');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone });
      setDevOtp(res.data.devOtp || '');
      setStep('otp');
      toast.success('OTP sent! (Dev: 123456)');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp, name });
      login(res.data.token, res.data.user);
      toast.success(`Welcome ${res.data.user.name || 'back'}!`);
      // Redirect based on role
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'clinic') navigate('/clinic/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin-login', { phone, password: adminPwd });
      login(res.data.token, res.data.user);
      toast.success('Welcome Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #E0F2FE 0%, #F0FDF4 100%)',
      maxWidth: 420, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
        padding: '40px 24px 60px',
        borderRadius: '0 0 40px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Stethoscope size={22} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>ClinicBook</span>
        </div>
        <h1 style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 26, marginBottom: 8 }}>
          {step === 'phone' ? 'Sign in to your account' : step === 'otp' ? 'Verify your number' : 'Tell us your name'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          {step === 'phone' ? 'Enter your mobile number to continue' : step === 'otp' ? `OTP sent to +91 ${phone}` : 'Just one more step!'}
        </p>
      </div>

      {/* Form card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'white', margin: '-20px 20px 0', borderRadius: 24,
          padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}
      >
        {!isAdmin ? (
          <>
            {step === 'phone' && (
              <>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Mobile Number
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <div style={{
                    background: '#F8FAFC', border: '2px solid var(--border)', borderRadius: 14,
                    padding: '12px 14px', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}>+91</div>
                  <input
                    className="input" type="tel" maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  />
                </div>
                <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={sendOtp} disabled={loading}>
                  {loading ? 'Sending...' : <>Send OTP <ArrowRight size={16} /></>}
                </button>
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button onClick={() => setIsAdmin(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                    🔒 Admin Login
                  </button>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Enter OTP {devOtp && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>(Dev: {devOtp})</span>}
                </label>
                <input className="input" type="tel" maxLength={6} placeholder="6-digit OTP"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                  style={{ marginBottom: 16, letterSpacing: 8, fontSize: 20, textAlign: 'center' }}
                  autoFocus
                />
                <input className="input" placeholder="Your name (optional)" value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ marginBottom: 20 }}
                />
                <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={verifyOtp} disabled={loading}>
                  {loading ? 'Verifying...' : <>Verify & Login <ArrowRight size={16} /></>}
                </button>
                <button onClick={() => setStep('phone')} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                  ← Change number
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Admin Login</h3>
            <input className="input" type="tel" placeholder="Admin phone number" value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} style={{ marginBottom: 12 }} />
            <input className="input" type="password" placeholder="Password (admin123)" value={adminPwd}
              onChange={e => setAdminPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adminLogin()}
              style={{ marginBottom: 20 }}
            />
            <button className="btn-primary" style={{ width: '100%' }} onClick={adminLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
            <button onClick={() => setIsAdmin(false)} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
              ← Back to OTP login
            </button>
          </>
        )}
      </motion.div>

      {/* Footer note */}
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, margin: '24px', lineHeight: 1.6 }}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, MapPin, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ClinicSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', city: 'Sivasagar', phone: '', email: '', description: '' });
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(0);

  useEffect(() => {
    api.get('/clinics/mine/info')
      .then(res => {
        const c = res.data.clinic;
        setClinic(c);
        if (c) {
          setForm({ name: c.name, address: c.address, city: c.city, phone: c.phone, email: c.email, description: c.description || '' });
          if (c.rejectionDate) {
            const diff = (new Date() - new Date(c.rejectionDate)) / (1000 * 60 * 60);
            if (diff < 24) setHoursLeft(Math.ceil(24 - diff));
          }
        }
      })
      .catch(() => {}) // Ignore if no clinic exists yet
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.phone) return toast.error('Fill all required fields');
    setSubmitting(true);
    try {
      await api.post('/clinics/register', form);
      setDone(true);
      toast.success('Clinic registration updated! Awaiting admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#D1FAE5,#E0F2FE)', padding: 32, textAlign: 'center' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
      <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>Update Received!</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
        Your clinic update is under review. You'll receive full access once the admin approves your registration.
      </p>
      <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  const fields = [
    { key: 'name', label: 'Clinic Name *', placeholder: 'Apollo Clinic', icon: Building2 },
    { key: 'address', label: 'Full Address *', placeholder: 'AT Road, Sivasagar, Assam', icon: MapPin },
    { key: 'phone', label: 'Contact Phone *', placeholder: '98765 43210', icon: Phone, type: 'tel' },
    { key: 'email', label: 'Email (optional)', placeholder: 'clinic@example.com', icon: FileText, type: 'email' },
  ];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%', background: 'white', minHeight: '100vh', boxShadow: '0 0 40px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#10B981,#0EA5E9)', padding: '48px 20px 40px', borderRadius: '0 0 32px 32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
          {clinic?.rejectionDate ? 'Re-apply for Verification' : 'Register Your Clinic'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Join ClinicBook and connect with thousands of patients</p>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Case 1: Blocked by 24h timer */}
        {hoursLeft > 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: 32 }}>⏱️</span>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: '#991B1B', marginBottom: 12 }}>Re-application Locked</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32, fontSize: 14 }}>
              Your clinic was recently rejected. You must wait 24 hours to address the issues and reapply.
            </p>
            <div style={{ background: '#F8FAFC', borderRadius: 20, padding: '24px 16px', border: '1px dashed #CBD5E1' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Available In</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#1E293B' }}>{hoursLeft} Hours</p>
            </div>
            <button className="btn-outline" style={{ marginTop: 40, width: '100%' }} onClick={() => navigate('/')}>Back to Home</button>
          </div>
        ) : (
          <>
            {/* Disclaimer */}
            <div style={{ background: '#FEF9C3', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚖️</span>
              <p style={{ fontSize: 13, color: '#854D0E', lineHeight: 1.5 }}>
                {clinic?.rejectionDate 
                  ? 'Since you were previously rejected, please ensure you have fixed the issues mentioned in the rejection remark before reapplying.' 
                  : 'After registration, an admin will verify your clinic within 24 hours. You\'ll get full dashboard access upon approval.'}
              </p>
            </div>

            {/* Rejection Note (if any) */}
            {clinic?.rejectionDate && clinic?.adminNote && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: 4 }}>Last Rejection Reason</p>
                <p style={{ fontSize: 13, color: '#B91C1C' }}>{clinic.adminNote}</p>
              </div>
            )}

            {/* Fields */}
            {fields.map(({ key, label, placeholder, icon: Icon, type = 'text' }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input" type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
                    style={{ paddingLeft: 40 }} />
                </div>
              </div>
            ))}

            {/* City */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>City *</label>
              <select className="input" value={form.city} onChange={set('city')}>
                {['Sivasagar', 'Guwahati', 'Jorhat', 'Dibrugarh', 'Nagaon', 'Tezpur'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description (optional)</label>
              <textarea className="input" placeholder="Tell patients about your clinic..." value={form.description} onChange={set('description')}
                style={{ height: 80, resize: 'vertical' }} />
            </div>

            <button className="btn-primary" style={{ width: '100%', fontSize: 16 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : clinic?.rejectionDate ? '🏥 Update & Re-apply' : '🏥 Register Clinic'}
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

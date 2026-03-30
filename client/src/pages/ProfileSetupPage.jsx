import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ASSAM_CITIES = ['Sivasagar', 'Guwahati', 'Jorhat', 'Dibrugarh', 'Nagaon', 'Tezpur', 'Bongaigaon', 'Silchar', 'Tinsukia', 'Other'];

export default function ProfileSetupPage() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [area, setArea] = useState(user?.area || '');
  const [city, setCity] = useState(user?.city || 'Sivasagar');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/';

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.phone && !phone) setPhone(user.phone);
    if (user?.area && !area) setArea(user.area);
    if (user?.city && city === 'Sivasagar') setCity(user.city || 'Sivasagar');
  }, [user]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Please enter your full name');
    if (phone.length < 10) return toast.error('Enter a valid 10-digit phone number');
    if (!area.trim()) return toast.error('Please enter your area/locality');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.patch('/auth/profile', { name, phone, area, city });
      login(token, res.data.user);
      toast.success('Profile saved! Welcome to ClinicBook 🎉');
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0EA5E9 0%, #6366F1 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'Inter, sans-serif',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <User size={36} color="white" />
          </motion.div>
          <h1 style={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, margin: 0 }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 }}>
            Just a few details to get you started
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 28, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          {/* Full Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Mobile Number *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 14,
                padding: '12px 14px', fontSize: 14, fontWeight: 600, color: '#64748b', flexShrink: 0,
              }}>+91</div>
              <input
                className="input"
                type="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {/* Area */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Area / Locality *
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="input"
                placeholder="e.g. Nazira, Amguri, Lakhi Pathar"
                value={area}
                onChange={e => setArea(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          {/* City */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              City
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{
                  width: '100%', padding: '13px 16px 13px 40px',
                  borderRadius: 14, border: '2px solid #e2e8f0',
                  fontSize: 14, color: '#1e293b', background: 'white',
                  cursor: 'pointer', outline: 'none', appearance: 'none',
                }}
              >
                {ASSAM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : <><CheckCircle size={18} /> Save & Continue</>}
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
            You can update these details anytime in your profile settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

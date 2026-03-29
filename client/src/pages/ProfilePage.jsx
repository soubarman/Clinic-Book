import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, LogOut, Settings, LayoutDashboard, Shield, ChevronRight, Stethoscope, MapPin, Building2, Save, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import api from '../lib/api';

const ASSAM_CITIES = ['Sivasagar', 'Guwahati', 'Jorhat', 'Dibrugarh', 'Nagaon', 'Tezpur', 'Bongaigaon', 'Silchar', 'Tinsukia', 'Other'];

const AVATAR_COLORS = ['#0EA5E9', '#6366F1', '#EC4899', '#F59E0B', '#10B981'];

export default function ProfilePage() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [area, setArea] = useState(user?.area || '');
  const [city, setCity] = useState(user?.city || 'Sivasagar');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setArea(user.area || '');
      setCity(user.city || 'Sivasagar');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Name is required');
    if (phone && phone.length < 10) return toast.error('Enter a valid phone number');
    if (!area.trim()) return toast.error('Area is required');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.patch('/auth/profile', { name, phone, area, city });
      login(token, res.data.user);
      toast.success('Profile updated! ✨');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const navColor = AVATAR_COLORS[user?.name?.charCodeAt(0) % AVATAR_COLORS.length || 0];

  const menuItems = [
    ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', onClick: () => navigate('/admin'), color: '#6366F1' }] : []),
    ...(user?.role === 'clinic' ? [{ icon: LayoutDashboard, label: 'Clinic Dashboard', onClick: () => navigate('/clinic/dashboard'), color: '#10B981' }] : []),
    ...(user?.role === 'patient' ? [{ icon: Stethoscope, label: 'Register Clinic', onClick: () => navigate('/clinic/register'), color: '#0EA5E9' }] : []),
    { icon: Settings, label: 'Settings', onClick: () => toast('Coming soon!'), color: '#64748B' },
    { icon: LogOut, label: 'Logout', onClick: handleLogout, color: '#EF4444' },
  ];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }} className="has-bottom-nav">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
        padding: '48px 20px 80px',
        borderRadius: '0 0 40px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 4, position: 'relative' }}>My Profile</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, position: 'relative' }}>Manage your account</p>
      </div>

      {/* Avatar card (floating) */}
      <div style={{ padding: '0 20px', marginTop: -60 }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-lg)', marginBottom: 16, textAlign: 'center', position: 'relative' }}>
          
          <button onClick={() => setIsEditing(!isEditing)} style={{
            position: 'absolute', top: 16, right: 16, background: 'var(--surface)',
            border: 'none', padding: 8, borderRadius: 12, cursor: 'pointer',
            color: isEditing ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600
          }}>
            {isEditing ? <X size={16} /> : <Edit2 size={16} />}
            {isEditing ? 'Cancel' : 'Edit'}
          </button>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: navColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 28, margin: '12px auto 12px',
                  boxShadow: `0 8px 24px ${navColor}40`,
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{user?.name || 'User'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {user?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>+91 {user?.phone}</span>
                    </div>
                  )}
                  {user?.area && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.area}, {user?.city}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 12 }}>
                  <span style={{
                    background: user?.role === 'admin' ? '#EDE9FE' : user?.role === 'clinic' ? '#D1FAE5' : '#E0F2FE',
                    color: user?.role === 'admin' ? '#7C3AED' : user?.role === 'clinic' ? '#065F46' : '#0369A1',
                    borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                  }}>{user?.role}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'left', marginTop: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" style={{ paddingLeft: 40 }} value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" style={{ paddingLeft: 40 }} maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1.5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>Area</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input className="input" style={{ paddingLeft: 40 }} value={area} onChange={e => setArea(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>City</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <select value={city} onChange={e => setCity(e.target.value)} style={{ paddingLeft: 40, width: '100%', height: 48, borderRadius: 14, border: '2px solid #e2e8f0', appearance: 'none', background: 'white', fontWeight: 600 }}>
                        {ASSAM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleSave} disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {menuItems.map((item, i) => (
            <motion.button key={item.label}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              onClick={item.onClick}
              style={{
                background: 'white', border: 'none', borderRadius: 18, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)', textAlign: 'left', width: '100%',
                transition: 'all 0.2s',
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: item.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={18} color={item.color} />
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: item.color === '#EF4444' ? '#EF4444' : 'var(--text-primary)' }}>
                {item.label}
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </motion.button>
          ))}
        </div>

        {/* App info */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 24 }}>
          ClinicBook v1.0 · Sivasagar, Assam 🌿
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

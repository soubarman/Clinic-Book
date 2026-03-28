import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const ROLE_CONFIG = {
  patient: { bg: '#E0F2FE', color: '#0369A1', label: '🏠 Patient' },
  clinic: { bg: '#D1FAE5', color: '#065F46', label: '🏥 Clinic' },
  admin: { bg: '#EDE9FE', color: '#7C3AED', label: '🛡️ Admin' },
};

const TABS = ['All', 'Patients', 'Clinics'];

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.users || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/block`);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success(res.data.message);
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = users.filter(u => {
    if (tab === 'All') return true;
    if (tab === 'Patients') return u.role === 'patient';
    if (tab === 'Clinics') return u.role === 'clinic';
    return true;
  });

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,#6366F1,#0EA5E9)', padding: '48px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 20, flex: 1 }}>Manage Users</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: tab === t ? 'white' : 'rgba(255,255,255,0.2)',
              color: tab === t ? 'var(--primary)' : 'white',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>{filtered.length} users</p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((user, i) => {
              const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.patient;
              const initial = user.name?.[0]?.toUpperCase() || user.phone?.[0];
              return (
                <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ background: 'white', borderRadius: 18, padding: '14px 16px', boxShadow: 'var(--shadow-sm)', opacity: user.isBlocked ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>{user.name || 'Unknown'}</p>
                        <span style={{ background: rc.bg, color: rc.color, borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{rc.label}</span>
                        {user.isBlocked && <span style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>🚫 Blocked</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <Phone size={11} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>+91 {user.phone}</span>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <button onClick={() => handleBlock(user._id)} style={{
                        padding: '6px 12px', borderRadius: 100, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: user.isBlocked ? '#DCFCE7' : '#FEE2E2',
                        color: user.isBlocked ? '#15803D' : '#991B1B',
                      }}>
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

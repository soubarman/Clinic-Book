import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ToggleLeft, ToggleRight, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const TABS = ['All', 'Pending', 'Verified', 'Rejected'];

export default function ManageClinicsPage() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    api.get('/admin/clinics').then(res => setClinics(res.data.clinics || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id, verified) => {
    let adminNote = '';
    if (!verified) {
      adminNote = prompt('Reason for rejection?');
      if (!adminNote) return; // Cancel if no reason given
    }

    try {
      const res = await api.put(`/admin/clinics/${id}/verify`, { verified, adminNote });
      setClinics(prev => prev.map(c => c._id === id ? res.data.clinic : c));
      toast.success(res.data.message);
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/admin/clinics/${id}/toggle`);
      setClinics(prev => prev.map(c => c._id === id ? res.data.clinic : c));
      toast.success(res.data.message);
    } catch (err) { toast.error('Failed to toggle'); }
  };

  const filtered = clinics.filter(c => {
    if (tab === 'All') return true;
    if (tab === 'Pending') return !c.verified && !c.rejectionDate;
    if (tab === 'Verified') return c.verified;
    if (tab === 'Rejected') return !c.verified && c.rejectionDate;
    return true;
  });

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#6366F1,#0EA5E9)', padding: '48px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 20, flex: 1 }}>Manage Clinics</h1>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: tab === t ? 'white' : 'rgba(255,255,255,0.2)',
              color: tab === t ? 'var(--primary)' : 'white',
              transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>{filtered.length} clinics</p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((clinic, i) => (
              <motion.div key={clinic._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: 'white', borderRadius: 20, padding: '16px 18px', boxShadow: 'var(--shadow-sm)' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontWeight: 800, fontSize: 15 }}>{clinic.name}</p>
                      <span style={{
                        background: clinic.verified ? '#DCFCE7' : clinic.rejectionDate ? '#FEE2E2' : '#FEF9C3',
                        color: clinic.verified ? '#15803D' : clinic.rejectionDate ? '#991B1B' : '#854D0E',
                        borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                      }}>{clinic.verified ? '✅ Verified' : clinic.rejectionDate ? '❌ Rejected' : '⏳ Pending'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{clinic.address}, {clinic.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{clinic.phone}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ background: clinic.active ? '#D1FAE5' : '#FEE2E2', color: clinic.active ? '#065F46' : '#991B1B', borderRadius: 100, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>
                      {clinic.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Owner */}
                {clinic.owner && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Owner: <strong>{clinic.owner.name}</strong> · {clinic.owner.phone}
                  </p>
                )}

                {clinic.rejectionDate && (
                  <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: '#C2410C', fontWeight: 700, marginBottom: 2 }}>Rejection Remark:</p>
                    <p style={{ fontSize: 12, color: '#9A3412' }}>{clinic.adminNote || 'No reason provided'}</p>
                    <p style={{ fontSize: 10, color: '#C2410C', marginTop: 4, opacity: 0.7 }}>Rejected on: {new Date(clinic.rejectionDate).toLocaleDateString()}</p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {!clinic.verified ? (
                    <>
                      <button onClick={() => handleVerify(clinic._id, true)} style={{ flex: 1, padding: '8px', borderRadius: 12, border: 'none', background: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => handleVerify(clinic._id, false)} style={{ flex: 1, padding: '8px', borderRadius: 12, border: 'none', background: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleVerify(clinic._id, false)} style={{ flex: 1, padding: '8px', borderRadius: 12, border: 'none', background: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Revoke Verification
                    </button>
                  )}
                  <button onClick={() => handleToggle(clinic._id)} style={{ padding: '8px 14px', borderRadius: 12, border: 'none', background: 'var(--surface)', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {clinic.active ? <ToggleRight size={16} color="#10B981" /> : <ToggleLeft size={16} color="var(--text-muted)" />}
                    {clinic.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

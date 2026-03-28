import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Stethoscope, Calendar, TrendingUp, ChevronRight, LogOut, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { StatCardSkeleton } from '../../components/Skeletons';
import api from '../../lib/api';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Patients', value: stats.totalUsers, icon: Users, color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'Total Clinics', value: stats.totalClinics, icon: Building2, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Verified Clinics', value: stats.verifiedClinics, icon: Building2, color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: '#EC4899', bg: '#FCE7F3' },
    { label: 'Platform Revenue', value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: '#84CC16', bg: '#ECFCCB' },
  ] : [];

  const quickLinks = [
    { label: 'Manage Clinics', desc: 'Approve & verify clinics', to: '/admin/clinics', color: '#10B981', emoji: '🏥' },
    { label: 'All Bookings', desc: 'View all platform bookings', to: '/admin/bookings', color: '#0EA5E9', emoji: '📅' },
    { label: 'Manage Users', desc: 'Block/unblock users', to: '/admin/users', color: '#6366F1', emoji: '👥' },
  ];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
        padding: '48px 20px 28px',
        borderRadius: '0 0 32px 32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 2 }}>Super Admin</p>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22 }}>Admin Panel</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>ClinicBook Platform Control</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LogOut size={18} color="white" />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Revenue highlight */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg,#0F172A,#1E293B)',
              borderRadius: 24, padding: '20px 24px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Total Platform Revenue</p>
              <p style={{ color: '#A3E635', fontWeight: 800, fontSize: 32 }}>₹{stats.totalRevenue}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>{stats.confirmedBookings} paid bookings × ₹20</p>
            </div>
            <div style={{ fontSize: 48 }}>💰</div>
          </motion.div>
        )}

        {/* Stats grid */}
        <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>Platform Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {loading ? [...Array(6)].map((_, i) => <StatCardSkeleton key={i} />) :
            statCards.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 24 }}>{s.value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.label}</p>
              </motion.div>
            ))
          }
        </div>

        {/* Quick links */}
        <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quickLinks.map((l, i) => (
            <motion.button key={l.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              onClick={() => navigate(l.to)}
              style={{
                background: 'white', border: 'none', borderRadius: 18, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)', width: '100%', textAlign: 'left',
              }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: l.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {l.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{l.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.desc}</p>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

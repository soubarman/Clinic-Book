import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, TrendingUp, Bell, Stethoscope, Clock, ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { StatCardSkeleton, BookingCardSkeleton } from '../../components/Skeletons';
import api from '../../lib/api';

const STATUS_COLORS = {
  confirmed: { bg: '#DCFCE7', color: '#15803D' },
  pending: { bg: '#FEF9C3', color: '#854D0E' },
  completed: { bg: '#DBEAFE', color: '#1D4ED8' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function ClinicDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clinicRes, bookingsRes] = await Promise.all([
        api.get('/clinics/mine/info'),
        api.get('/bookings/clinic'),
      ]);
      setClinic(clinicRes.data.clinic);
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/bookings/${id}/complete`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'completed' } : b));
      toast.success('Marked as completed');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const todayBookings = bookings.filter(b => b.slotDate === new Date().toISOString().split('T')[0]);
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const revenue = bookings.filter(b => b.paymentStatus === 'paid').length * 20;

  const stats = [
    { label: 'Total Bookings', value: clinic?.totalBookings || 0, icon: Calendar, color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'Today\'s Bookings', value: todayBookings.length, icon: Clock, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Pending', value: confirmedCount, icon: Users, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Platform Revenue', value: `₹${revenue}`, icon: TrendingUp, color: '#6366F1', bg: '#EEF2FF' },
  ];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#10B981,#0EA5E9)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 2 }}>Clinic Dashboard</p>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
              {loading ? 'Loading...' : clinic?.name || 'Your Clinic'}
            </h1>
            {clinic && (
              <span style={{ background: clinic.verified ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.3)', color: 'white', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                {clinic.verified ? '✅ Verified' : '⏳ Pending Verification'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => logout() || navigate('/login')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <LogOut size={16} color="white" />
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {loading ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />) :
            stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: 'white', borderRadius: 20, padding: '18px 16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>{s.value}</p>
              </motion.div>
            ))
          }
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button onClick={() => navigate('/clinic/doctors')} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Stethoscope size={16} /> Manage Doctors
          </button>
          <button className="btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Bell size={16} /> Notifications
          </button>
        </div>

        {/* Today's bookings */}
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>
            Today's Appointments <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 14 }}>({todayBookings.length})</span>
          </h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(3)].map((_, i) => <BookingCardSkeleton key={i} />)}
            </div>
          ) : todayBookings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={40} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p>No bookings today</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayBookings.map(b => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                return (
                  <div key={b._id} style={{ background: 'white', borderRadius: 18, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: 16, flexShrink: 0 }}>
                        #{b.tokenNumber}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>{b.userId?.name || 'Patient'}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.doctorId?.name} · {b.slotTime}</p>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                        {b.status}
                      </span>
                    </div>
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleComplete(b._id)} style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 12, border: 'none', background: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        ✓ Mark as Completed
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

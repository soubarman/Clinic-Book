import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import BottomNav from '../../components/BottomNav';
import { BookingCardSkeleton } from '../../components/Skeletons';
import api from '../../lib/api';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', bg: '#DCFCE7', color: '#15803D', emoji: '✅' },
  pending: { label: 'Pending', bg: '#FEF9C3', color: '#854D0E', emoji: '⏳' },
  completed: { label: 'Completed', bg: '#DBEAFE', color: '#1D4ED8', emoji: '💙' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B', emoji: '❌' },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

function getInitials(name) { return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DR'; }
const AVATAR_COLORS = ['#0EA5E9', '#6366F1', '#EC4899', '#F59E0B', '#10B981'];

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bookings/mine').then(res => setBookings(res.data.bookings || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = bookings.filter(b => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return b.status === 'confirmed' && b.slotDate >= today;
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }} className="has-bottom-nav">
      {/* Header */}
      <div style={{ background: 'white', padding: '48px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontWeight: 800, fontSize: 20 }}>My Bookings</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 100, border: 'none',
              background: activeTab === tab ? '#0F172A' : 'var(--surface)',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(4)].map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Ticket size={48} color="#CBD5E1" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No bookings found</p>
            <p style={{ fontSize: 13 }}>Book your first appointment!</p>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/doctors')}>Find Doctors</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((b, i) => {
              const statusConfig = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              const doctorColor = AVATAR_COLORS[b.doctorId?.name?.charCodeAt(0) % AVATAR_COLORS.length || 0];

              return (
                <motion.div key={b._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: 'white', borderRadius: 20, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 50, height: 50, borderRadius: '50%', background: doctorColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>
                      {getInitials(b.doctorId?.name)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 1 }}>{b.doctorId?.name || 'Doctor'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{b.doctorId?.specialization}</p>
                        </div>
                        <span style={{
                          background: statusConfig.bg, color: statusConfig.color,
                          borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>{statusConfig.emoji} {statusConfig.label}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.clinicId?.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.slotDate}</span>
                          <Clock size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.slotTime}</span>
                        </div>
                        {b.tokenNumber && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Ticket size={11} color="var(--primary)" />
                            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>Token #{b.tokenNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {b.status === 'confirmed' && (
                    <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleCancel(b._id)} style={{
                        padding: '6px 16px', borderRadius: 100, border: '1.5px solid #FCA5A5',
                        background: 'transparent', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>Cancel</button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

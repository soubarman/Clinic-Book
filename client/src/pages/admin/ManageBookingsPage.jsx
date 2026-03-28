import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', bg: '#DCFCE7', color: '#15803D' },
  pending: { label: 'Pending', bg: '#FEF9C3', color: '#854D0E' },
  completed: { label: 'Completed', bg: '#DBEAFE', color: '#1D4ED8' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B' },
};

export default function ManageBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/bookings').then(res => setBookings(res.data.bookings || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const paid = bookings.filter(b => b.paymentStatus === 'paid').length;

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#6366F1,#0EA5E9)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 20, flex: 1 }}>All Bookings</h1>
        </div>
        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Total', value: bookings.length, icon: Calendar },
            { label: 'Paid', value: paid, icon: IndianRupee },
            { label: 'Revenue', value: `₹${paid * 20}`, icon: Ticket },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 12px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map((b, i) => {
              const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ background: 'white', borderRadius: 18, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{b.userId?.name || 'Patient'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>+91 {b.userId?.phone}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 100, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{sc.label}</span>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        {b.paymentStatus === 'paid' ? '💳 ₹20 Paid' : '⏳ Unpaid'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.clinicId?.name} · {b.clinicId?.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.slotDate}</span>
                      <Clock size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.slotTime}</span>
                      {b.tokenNumber && (
                        <><Ticket size={11} color="var(--primary)" /><span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>#{b.tokenNumber}</span></>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dr. {b.doctorId?.name} · {b.doctorId?.specialization}</p>
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

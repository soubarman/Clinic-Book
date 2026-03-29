import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Calendar, Ticket, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import BottomNav from '../../components/BottomNav';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const TIMES = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AVATAR_COLORS = ['#0EA5E9', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'];

function getInitials(name) { return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DR'; }
function getColor(name) { return AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length || 0]; }

function getNextDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      date: d.toISOString().split('T')[0],
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      display: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }),
    });
  }
  return dates;
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dates = getNextDates();

  useEffect(() => {
    api.get(`/doctors/${id}`).then(res => {
      setDoctor(res.data.doctor);
      setSelectedDate(dates[0]);
    }).catch(() => toast.error('Doctor not found')).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    // If profile is incomplete, send to profile setup first
    if (!user.profileComplete || !user.phone || !user.area) {
      navigate('/profile-setup', { state: { from: `/doctors/${id}` } });
      toast('Please complete your profile to book', { icon: '👤' });
      return;
    }
    if (!selectedDate || !selectedTime) return toast.error('Select date and time');
    setBooking(true);
    try {
      const orderRes = await api.post('/payments/create-order');
      const { order } = orderRes.data;
      await api.post('/payments/verify', {
        razorpay_order_id: order.id,
        razorpay_payment_id: 'mock_pay_' + Date.now(),
        razorpay_signature: 'mock_sig',
      });
      await api.post('/bookings', {
        doctorId: id,
        slotDate: selectedDate.date,
        slotDay: selectedDate.day,
        slotTime: selectedTime,
        paymentId: 'mock_pay_' + Date.now(),
        razorpayOrderId: order.id,
      });
      setBooked(true);
      toast.success('🎉 Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E0F2FE', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (booked) return (
    <motion.div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#D1FAE5,#E0F2FE)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', maxWidth: 420, margin: '0 auto' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
        style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 16px 48px rgba(16,185,129,0.3)' }}>
        <CheckCircle size={52} color="white" strokeWidth={2.5} />
      </motion.div>
      <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 26, marginBottom: 10 }}>Booking Confirmed!</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
        Your appointment with <strong>{doctor?.name}</strong><br/>on {selectedDate?.display} {selectedDate?.month} at {selectedTime}<br/>has been booked. Platform fee ₹20 paid.
      </p>
      <button className="btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={() => navigate('/bookings')}>
        View My Bookings
      </button>
      <button className="btn-outline" style={{ width: '100%' }} onClick={() => navigate('/')}>Back to Home</button>
    </motion.div>
  );

  const availableTimes = selectedDate ? TIMES.filter((_, i) => {
    const doctorSlots = doctor?.slots || [];
    const hasSlot = doctorSlots.some(s => s.day === selectedDate.day);
    return hasSlot || !doctorSlots.length;
  }) : [];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', maxWidth: 420, margin: '0 auto' }} className="has-bottom-nav">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
        padding: '40px 20px 80px', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', left: 20, top: 40,
          width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <ArrowLeft size={20} color="white" />
        </button>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'Poppins, sans-serif' }}>Doctor Details</h1>
      </div>

      {/* Doctor Card (floating) */}
      <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ background: 'white', borderRadius: 24, padding: '24px 20px', boxShadow: '0 20px 48px rgba(0,0,0,0.1)', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: getColor(doctor?.name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 24, flexShrink: 0,
            }}>
              {getInitials(doctor?.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 2, color: 'var(--text-primary)' }}>{doctor?.name}</h2>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{doctor?.specialization}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{doctor?.qualification} • {doctor?.experience} yrs exp</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FEF3C7', padding: '2px 8px', borderRadius: 6 }}>
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#92400E' }}>{doctor?.rating?.toFixed(1)}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>({doctor?.totalPatients} patients)</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            {[
              { label: 'Experience', value: `${doctor?.experience} yrs`, icon: '🏆' },
              { label: 'Patients', value: doctor?.totalPatients, icon: '👥' },
              { label: 'Consult Fee', value: `₹${doctor?.fee}`, icon: '💊' },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, textAlign: 'center', background: 'var(--surface)', borderRadius: 14, padding: '10px 4px' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Clinic */}
          {doctor?.clinicId && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{doctor.clinicId.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doctor.clinicId.address}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Date Selector */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Select Date</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                {selectedDate ? `${selectedDate.display} ${selectedDate.month}` : 'Choose date'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {dates.map(d => {
              const isSelected = selectedDate?.date === d.date;
              return (
                <button key={d.date} onClick={() => { setSelectedDate(d); setSelectedTime(null); }} style={{
                  flexShrink: 0, padding: '10px 14px', borderRadius: 14, border: 'none',
                  background: isSelected ? 'linear-gradient(135deg,#0EA5E9,#6366F1)' : 'var(--surface)',
                  color: isSelected ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, opacity: isSelected ? 0.8 : 0.6, marginBottom: 2 }}>{d.day}</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{d.display}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="var(--primary)" /> Available Slots
          </h3>
          {availableTimes.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableTimes.map(t => {
                const isSel = selectedTime === t;
                return (
                  <button key={t} onClick={() => setSelectedTime(t)} style={{
                    padding: '8px 14px', borderRadius: 100, border: 'none',
                    background: isSel ? 'var(--accent)' : 'var(--surface)',
                    color: isSel ? '#1a2e05' : 'var(--text-primary)',
                    fontWeight: isSel ? 700 : 500, fontSize: 13, cursor: 'pointer',
                    border: isSel ? '2px solid var(--accent-dark)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}>{t}</button>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No slots available for {selectedDate?.day}</p>
          )}
        </div>

        {/* Booking Summary + CTA */}
        {selectedDate && selectedTime && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Booking Summary</h3>
            {[
              ['Doctor', doctor?.name],
              ['Date', `${selectedDate.display} ${selectedDate.month}, ${selectedDate.day}`],
              ['Time', selectedTime],
              ['Platform Fee', '₹20'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹20</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 420, padding: '0 20px', zIndex: 40 }}>
        <button className="btn-primary" style={{
          width: '100%', fontSize: 16, padding: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: selectedDate && selectedTime ? 1 : 0.5,
        }}
          onClick={handleBook} disabled={!selectedDate || !selectedTime || booking}>
          <Ticket size={18} />
          {booking ? 'Processing...' : 'Book Ticket — ₹20'}
        </button>
      </div>

      <BottomNav />

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              zIndex: 100, padding: '0 16px 24px',
            }}
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white', borderRadius: 28, padding: 28,
                width: '100%', maxWidth: 420,
                boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <LogIn size={26} color="white" />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Sign in to Book</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Create a free account or sign in to book your appointment with {doctor?.name}.
                </p>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', marginBottom: 10 }}
                onClick={() => navigate('/login', { state: { from: `/doctors/${id}` } })}
              >
                Sign In / Sign Up
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}
              >
                Continue Browsing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

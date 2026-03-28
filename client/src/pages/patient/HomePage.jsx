import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin, Star, ChevronRight, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '../../components/BottomNav';
import DoctorCard from '../../components/DoctorCard';
import { DoctorCardSkeleton, ClinicCardSkeleton } from '../../components/Skeletons';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const SPECIALIZATIONS = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Orthopedic'];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSpec, setActiveSpec] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docRes, clinicRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/clinics'),
      ]);
      setDoctors(docRes.data.doctors || []);
      setClinics(clinicRes.data.clinics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(d => {
    const matchSpec = activeSpec === 'All' || d.specialization === activeSpec;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  const topDoctors = filtered.slice(0, 6);
  const nearClinics = clinics.slice(0, 4);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }} className="has-bottom-nav">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
        padding: '48px 20px 28px',
        borderRadius: '0 0 32px 32px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 2 }}>Good day 👋</p>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Hi, {user?.name?.split(' ')[0] || 'Friend'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPin size={12} color="rgba(255,255,255,0.7)" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Sivasagar, Assam</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Bell size={18} color="white" />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, color: 'var(--primary)',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'P'}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            placeholder="Search doctor or specialization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', background: 'transparent' }}
          />
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Specialization filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', marginBottom: 24 }}>
          {SPECIALIZATIONS.map(spec => (
            <button key={spec} onClick={() => setActiveSpec(spec)} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 100, border: 'none',
              background: activeSpec === spec ? 'var(--gradient-primary)' : 'white',
              backgroundImage: activeSpec === spec ? 'linear-gradient(135deg, #0EA5E9, #6366F1)' : 'none',
              color: activeSpec === spec ? 'white' : 'var(--text-muted)',
              fontWeight: activeSpec === spec ? 700 : 500,
              fontSize: 13, cursor: 'pointer',
              boxShadow: activeSpec === spec ? '0 4px 12px rgba(14,165,233,0.3)' : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}>{spec}</button>
          ))}
        </div>

        {/* Top Doctors */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18 }}>Top Doctors</h2>
            <button onClick={() => navigate('/doctors')} style={{
              background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
            }}>See All <ChevronRight size={14} /></button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[...Array(4)].map((_, i) => <DoctorCardSkeleton key={i} />)}
            </div>
          ) : topDoctors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {topDoctors.map((doc, i) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <DoctorCard doctor={doc} selected={i === 3} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Stethoscope size={40} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <p>No doctors found</p>
            </div>
          )}
        </div>

        {/* Nearby Clinics */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18 }}>Nearby Clinics</h2>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              See All <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: 200 }}><ClinicCardSkeleton /></div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {nearClinics.map((clinic, i) => (
                <motion.div
                  key={clinic._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    flexShrink: 0, width: 200,
                    background: 'white', borderRadius: 20, overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/doctors?clinicId=${clinic._id}`)}
                >
                  {/* Color banner */}
                  <div style={{
                    height: 90,
                    background: ['linear-gradient(135deg,#0EA5E9,#6366F1)', 'linear-gradient(135deg,#10B981,#0EA5E9)', 'linear-gradient(135deg,#A3E635,#22D3EE)', 'linear-gradient(135deg,#F59E0B,#EF4444)'][i % 4],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 32 }}>🏥</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>{clinic.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{clinic.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{clinic.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

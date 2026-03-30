import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import DoctorCard from '../../components/DoctorCard';
import { DoctorCardSkeleton } from '../../components/Skeletons';
import BottomNav from '../../components/BottomNav';
import api, { getCached } from '../../lib/api';

const SPECS = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Psychiatrist', 'Orthopedic', 'Pediatrician', 'General Physician', 'ENT Specialist', 'Nephrologist'];

export default function DoctorListPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const clinicId = params.get('clinicId');

  useEffect(() => {
    loadDoctors();
  }, [clinicId]);

  const loadDoctors = async () => {
    // Only show full loading if we have no data at all
    if (doctors.length === 0) setLoading(true);
    try {
      const query = clinicId ? `?clinicId=${clinicId}` : '';
      const data = await getCached(`/doctors${query}`, 300000); // 5 min TTL
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors
    .filter(d => {
      const ms = activeSpec === 'All' || d.specialization === activeSpec;
      const mq = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase());
      return ms && mq;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee_low') return a.fee - b.fee;
      if (sortBy === 'fee_high') return b.fee - a.fee;
      return 0;
    });

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', position: 'relative' }} className="has-bottom-nav">
      <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', minHeight: '100vh', boxShadow: '0 0 40px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{
        background: 'white', padding: '48px 20px 16px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={() => navigate(-1)} style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontWeight: 800, fontSize: 20, flex: 1 }}>Doctors List</h1>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: showFilters ? 'var(--primary)' : 'var(--surface)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <SlidersHorizontal size={18} color={showFilters ? 'white' : 'var(--text-muted)'} />
          </button>
        </div>

        {/* Search */}
        <div style={{
          background: 'var(--surface)', borderRadius: 14, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
        </div>

        {/* Sort filter */}
        {showFilters && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {[['rating', '⭐ Top Rated'], ['fee_low', '💰 Fee: Low'], ['fee_high', '💰 Fee: High']].map(([val, label]) => (
              <button key={val} onClick={() => setSortBy(val)} style={{
                padding: '6px 12px', borderRadius: 100, border: 'none',
                background: sortBy === val ? 'var(--primary)' : 'var(--surface)',
                color: sortBy === val ? 'white' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* Spec pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {SPECS.map(spec => (
            <button key={spec} onClick={() => setActiveSpec(spec)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 100, border: 'none',
              background: activeSpec === spec ? '#0F172A' : 'var(--surface)',
              color: activeSpec === spec ? 'white' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>{spec}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '16px 16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
          {loading ? 'Loading...' : `${filtered.length} doctors found`}
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>
            {[...Array(6)].map((_, i) => <DoctorCardSkeleton key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>
            {filtered.map((doc, i) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DoctorCard doctor={doc} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
      </div>
    </div>
  );
}

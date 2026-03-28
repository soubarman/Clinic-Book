import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVATAR_COLORS = ['#0EA5E9','#6366F1','#EC4899','#F59E0B','#10B981','#8B5CF6'];

function getInitials(name) {
  return name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || 'DR';
}

function getColor(name) {
  const idx = name?.charCodeAt(0) % AVATAR_COLORS.length || 0;
  return AVATAR_COLORS[idx];
}

export default function DoctorCard({ doctor, selected, onClick }) {
  const navigate = useNavigate();

  const bg = selected ? 'var(--accent)' : 'white';
  const textColor = selected ? '#1a2e05' : 'var(--text-primary)';
  const mutedColor = selected ? '#3a5c10' : 'var(--text-muted)';

  return (
    <div
      onClick={onClick || (() => navigate(`/doctors/${doctor._id}`))}
      style={{
        background: bg,
        borderRadius: 20,
        padding: 16,
        cursor: 'pointer',
        boxShadow: selected ? '0 6px 24px rgba(163,230,53,0.3)' : 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
        border: selected ? '2px solid var(--accent-dark)' : '2px solid transparent',
      }}
    >
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: getColor(doctor.name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 18,
          flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {doctor.avatar
            ? <img src={doctor.avatar} alt={doctor.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : getInitials(doctor.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {doctor.name}
          </p>
          <p style={{ fontSize: 12, color: mutedColor, fontWeight: 500 }}>{doctor.specialization}</p>
        </div>
      </div>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <Star size={13} fill={selected ? '#1a2e05' : '#F59E0B'} color={selected ? '#1a2e05' : '#F59E0B'} />
        <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>{doctor.rating?.toFixed(1)}</span>
        <span style={{ fontSize: 11, color: mutedColor }}>({doctor.totalPatients || 0})</span>
      </div>

      {/* Clinic */}
      {doctor.clinicId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <MapPin size={12} color={mutedColor} />
          <span style={{ fontSize: 11, color: mutedColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {doctor.clinicId.name || 'Clinic'}
          </span>
        </div>
      )}

      {/* Fee */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `1px solid ${selected ? 'rgba(0,0,0,0.1)' : 'var(--border)'}`,
        paddingTop: 10, marginTop: 4,
      }}>
        <span style={{ fontSize: 12, color: mutedColor }}>Consultation</span>
        <span style={{ fontWeight: 700, color: selected ? '#1a2e05' : 'var(--primary)', fontSize: 14 }}>
          ₹{doctor.fee}
        </span>
      </div>
    </div>
  );
}

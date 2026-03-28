import React from 'react';

export function DoctorCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 54, height: 54, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, borderRadius: 8, marginBottom: 6, width: '70%' }} />
          <div className="skeleton" style={{ height: 12, borderRadius: 8, width: '50%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, borderRadius: 8, marginBottom: 8, width: '40%' }} />
      <div className="skeleton" style={{ height: 12, borderRadius: 8, marginBottom: 12, width: '60%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
        <div className="skeleton" style={{ height: 12, borderRadius: 8, width: '40%' }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 8, width: '20%' }} />
      </div>
    </div>
  );
}

export function ClinicCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 16 }}>
      <div className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, borderRadius: 8, marginBottom: 8, width: '70%' }} />
      <div className="skeleton" style={{ height: 12, borderRadius: 8, width: '50%' }} />
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, borderRadius: 8, marginBottom: 8, width: '60%' }} />
          <div className="skeleton" style={{ height: 12, borderRadius: 8, width: '40%' }} />
        </div>
        <div className="skeleton" style={{ width: 70, height: 28, borderRadius: 100 }} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 20 }}>
      <div className="skeleton" style={{ height: 12, borderRadius: 8, marginBottom: 12, width: '50%' }} />
      <div className="skeleton" style={{ height: 32, borderRadius: 8, width: '60%' }} />
    </div>
  );
}

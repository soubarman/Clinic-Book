import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Stethoscope, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { user } = useAuth();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      padding: '8px 0 env(safe-area-inset-bottom)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4, padding: '8px 4px', textDecoration: 'none',
          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
          transition: 'all 0.2s ease',
          position: 'relative',
        })}>
          {({ isActive }) => (
            <>
              <div style={{
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderRadius: 12,
                padding: '6px 20px',
                transition: 'all 0.3s ease',
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

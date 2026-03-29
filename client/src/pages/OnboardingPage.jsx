import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, CreditCard, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    icon: MapPin,
    title: 'Find Doctors Near You',
    subtitle: 'Discover top-rated doctors and clinics in Sivasagar & Guwahati, right at your fingertips.',
    gradient: 'linear-gradient(160deg, #0EA5E9 0%, #6366F1 100%)',
    lightGradient: 'linear-gradient(160deg, #E0F2FE 0%, #EEF2FF 100%)',
    accent: '#0EA5E9',
  },
  {
    id: 2,
    icon: Clock,
    title: 'Skip the Long Queues',
    subtitle: 'Book your slot in advance. Know your token number before you even leave home.',
    gradient: 'linear-gradient(160deg, #10B981 0%, #0EA5E9 100%)',
    lightGradient: 'linear-gradient(160deg, #D1FAE5 0%, #E0F2FE 100%)',
    accent: '#10B981',
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'Book Instantly for ₹20',
    subtitle: 'A tiny platform fee. No hidden charges. Your health, our priority.',
    gradient: 'linear-gradient(160deg, #A3E635 0%, #22D3EE 100%)',
    lightGradient: 'linear-gradient(160deg, #ECFCCB 0%, #CFFAFE 100%)',
    accent: '#84CC16',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigate('/login');
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: slide.lightGradient, transition: 'background 0.6s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 24px' }}>
        <button onClick={() => navigate('/login')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 100,
          padding: '8px 18px', color: 'var(--text-muted)', fontWeight: 600,
          fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>Skip</button>
      </div>

      {/* Illustration */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ textAlign: 'center' }}
          >
            {/* Icon bubble */}
            <div style={{
              width: 160, height: 160, borderRadius: '50%',
              background: slide.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 40px',
              boxShadow: `0 20px 60px ${slide.accent}40`,
              position: 'relative',
            }}>
              <Icon size={64} color="white" strokeWidth={1.5} />
              {/* Decorative rings */}
              <div style={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                border: `2px solid ${slide.accent}30`, pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', inset: -32, borderRadius: '50%',
                border: `2px solid ${slide.accent}15`, pointerEvents: 'none',
              }} />
            </div>

            <h1 style={{
              fontFamily: 'Poppins, Inter, sans-serif',
              fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
              marginBottom: 16, lineHeight: 1.2,
            }}>{slide.title}</h1>

            <p style={{
              fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7,
              maxWidth: 300, margin: '0 auto',
            }}>{slide.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div style={{ padding: '0 24px 48px' }}>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 24 : 8, height: 8, borderRadius: 100,
              background: i === current ? slide.accent : '#CBD5E1',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* CTA */}
        <button onClick={handleNext} style={{
          width: '100%', padding: '16px 0',
          background: slide.gradient,
          border: 'none', borderRadius: 100, color: 'white',
          fontSize: 16, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 6px 24px ${slide.accent}40`,
          transition: 'all 0.3s ease',
        }}>
          {current === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
    </div>
  );
}

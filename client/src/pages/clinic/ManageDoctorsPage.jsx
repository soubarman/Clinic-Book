import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const SPECS = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Psychiatrist', 'Orthopedic', 'Pediatrician', 'General Physician', 'ENT Specialist', 'Nephrologist', 'Endocrinologist'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const QUALIFICATIONS = ['MBBS', 'MD', 'MS', 'MBBS, DM', 'MBBS, MS', 'BDS', 'MDS'];

const emptyForm = { name: '', specialization: 'General Physician', qualification: 'MBBS', experience: 3, fee: 300, bio: '' };

export default function ManageDoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const res = await api.get('/doctors/clinic/mine');
      setDoctors(res.data.doctors || []);
    } catch (err) { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.fee) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const slots = DAYS.filter(d => form[d]).map(day => ({
        day, startTime: form[`${day}_start`] || '09:00', endTime: form[`${day}_end`] || '13:00', maxPatients: 20,
      }));
      const payload = { ...form, slots };
      if (editId) {
        await api.put(`/doctors/${editId}`, payload);
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', payload);
        toast.success('Doctor added');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      loadDoctors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      setDoctors(prev => prev.filter(d => d._id !== id));
      toast.success('Doctor deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const startEdit = (doc) => {
    setForm({ name: doc.name, specialization: doc.specialization, qualification: doc.qualification, experience: doc.experience, fee: doc.fee, bio: doc.bio || '' });
    setEditId(doc._id);
    setShowForm(true);
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#10B981,#0EA5E9)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate('/clinic/dashboard')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 20, flex: 1 }}>Manage Doctors</h1>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} style={{
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 100, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#10B981',
          }}>
            <Plus size={16} /> Add
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{doctors.length} doctors in your clinic</p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Doctor list */}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</p>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20 }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>👨‍⚕️</span>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No doctors added yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Add your first doctor to start accepting bookings</p>
            <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
              <Plus size={16} style={{ marginRight: 6 }} /> Add Doctor
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {doctors.map(doc => (
              <motion.div key={doc._id} layout style={{ background: 'white', borderRadius: 20, padding: '16px 18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {doc.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{doc.name}</p>
                    <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>{doc.specialization}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{doc.qualification} · {doc.experience} yrs exp · ₹{doc.fee}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(doc)} style={{ width: 34, height: 34, borderRadius: '50%', background: '#E0F2FE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit3 size={15} color="var(--primary)" />
                    </button>
                    <button onClick={() => handleDelete(doc._id)} style={{ width: 34, height: 34, borderRadius: '50%', background: '#FEE2E2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={15} color="#EF4444" />
                    </button>
                  </div>
                </div>
                {/* Slots */}
                {doc.slots?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {doc.slots.map(s => (
                      <span key={s.day} style={{ background: '#E0F2FE', color: 'var(--primary)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                        {s.day}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
              onClick={() => setShowForm(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
                background: 'white', borderRadius: '28px 28px 0 0', padding: '20px',
                maxHeight: '85vh', overflowY: 'auto', maxWidth: 480, margin: '0 auto',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: 18 }}>{editId ? 'Edit Doctor' : 'Add Doctor'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'var(--surface)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              {[
                { k: 'name', l: 'Doctor Name *', p: 'Dr. Arun Kumar' },
                { k: 'bio', l: 'Bio (optional)', p: 'Experienced cardiologist...' },
              ].map(({ k, l, p }) => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{l}</label>
                  <input className="input" placeholder={p} value={form[k]} onChange={set(k)} />
                </div>
              ))}

              {/* Select fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Specialization *</label>
                  <select className="input" value={form.specialization} onChange={set('specialization')}>
                    {SPECS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Qualification</label>
                  <select className="input" value={form.qualification} onChange={set('qualification')}>
                    {QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Experience (yrs)</label>
                  <input className="input" type="number" min={1} value={form.experience} onChange={set('experience')} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Consult Fee (₹) *</label>
                  <input className="input" type="number" min={0} value={form.fee} onChange={set('fee')} />
                </div>
              </div>

              {/* Available days */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Available Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAYS.map(d => (
                    <button key={d} type="button" onClick={() => setForm(f => ({ ...f, [d]: !f[d] }))}
                      style={{
                        padding: '6px 14px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: form[d] ? 'var(--primary)' : 'var(--surface)',
                        color: form[d] ? 'white' : 'var(--text-muted)',
                        transition: 'all 0.2s',
                      }}>{d}</button>
                  ))}
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={handleSave} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : editId ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

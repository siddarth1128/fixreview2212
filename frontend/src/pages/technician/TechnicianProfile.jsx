import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const TechnicianProfile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', skills: [], experience: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/profile', profile);
      const updatedUser = response.data.user || response.data;
      updateUser(updatedUser);
      setProfile(updatedUser);
      alert('✅ Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error updating profile: ' + (error.response?.data?.message || 'Please try again'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Tech</h2></div>
        <ul>
          <li><Link to="/technician">🏠 Dashboard</Link></li>
          <li><Link to="/technician/jobs">📋 All Jobs</Link></li>
          <li><Link to="/technician/schedule">📅 Schedule</Link></li>
          <li><Link to="/technician/earnings">💰 Earnings</Link></li>
          <li><Link to="/technician/reviews">⭐ Reviews</Link></li>
          <li><Link to="/technician/profile" className="active">👤 Profile</Link></li>
          <li><button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, font: 'inherit' }}>🚪 Logout</button></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>👤 My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your professional information</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          <div className="card" style={{ animation: 'scaleIn 0.6s ease-out', textAlign: 'center' }}>
            <div style={{ width: '150px', height: '150px', margin: '0 auto 1.5rem', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '4rem', boxShadow: '0 8px 24px var(--shadow-lg)' }}>
              {user?.name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{user?.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user?.email}</p>
            <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Technician</span>
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Member since</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
          <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Profile Information</h2>
              {!isEditing && !loading && (
                <button onClick={handleEdit} className="btn btn-secondary" style={{ padding: '0.5rem 0.4rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  ✏️ Edit
                </button>
              )}
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name *</label>
                  <input type="text" required placeholder="Enter your full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} readOnly={!isEditing} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', background: isEditing ? 'var(--card-bg)' : 'var(--progress-bg)', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address *</label>
                  <input type="email" required placeholder="your.email@example.com" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} readOnly={!isEditing} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', background: isEditing ? 'var(--card-bg)' : 'var(--progress-bg)', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 123-4567" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} readOnly={!isEditing} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', background: isEditing ? 'var(--card-bg)' : 'var(--progress-bg)', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Skills (comma-separated)</label>
                  <input type="text" placeholder="Plumbing, Electrical, Carpentry" value={profile.skills?.join(', ') || ''} onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })} readOnly={!isEditing} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', background: isEditing ? 'var(--card-bg)' : 'var(--progress-bg)', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Years of Experience</label>
                  <input type="number" placeholder="5" value={profile.experience || ''} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} readOnly={!isEditing} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', background: isEditing ? 'var(--card-bg)' : 'var(--progress-bg)', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                {isEditing && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn" disabled={saving} style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}>
                      {saving ? '⏳ Saving...' : '💾 Save Changes'}
                    </button>
                    <button type="button" onClick={handleCancel} className="btn btn-secondary" disabled={saving} style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}>
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianProfile;

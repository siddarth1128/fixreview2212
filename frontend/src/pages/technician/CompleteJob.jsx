import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const CompleteJob = () => {
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await api.get(`/technician/job/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/technician/complete/${id}`, { notes });
      alert('Job completed successfully!');
      navigate('/technician/jobs');
    } catch (error) {
      alert('Error completing job');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  if (!job) return <div style={{ padding: '4rem', textAlign: 'center' }}>Job not found</div>;

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
          <li><Link to="/technician/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>✅ Complete Job</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Mark this job as completed</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          <div className="card" style={{ animation: 'scaleIn 0.6s ease-out' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Job Details</h3>
            <p style={{ margin: '0.5rem 0' }}><strong>Job ID:</strong> #{job._id.slice(-6)}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Customer:</strong> {job.customer?.name}</p>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{job.description}</p>
            {job.scheduledDate && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>Scheduled:</strong> {new Date(job.scheduledDate).toLocaleString()}</p>
            )}
            {job.address && <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>📍</strong> {job.address}</p>}
            <span className="badge badge-warning" style={{ marginTop: '1rem' }}>{job.status.toUpperCase()}</span>
          </div>
          <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Completion Notes</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Work Completed</label>
                <textarea rows="6" required placeholder="Describe the work you completed..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div style={{ padding: '1rem', background: 'var(--progress-bg)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>💡 Tip: Provide detailed notes about the work completed, parts used, and any recommendations for the customer.</p>
              </div>
              <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>✅ Mark as Completed</button>
            </form>
          </div>
        </div>
      </main>
      <footer><p>&copy; 2025 FixAll. All rights reserved. | Complete Job</p></footer>
    </div>
  );
};

export default CompleteJob;

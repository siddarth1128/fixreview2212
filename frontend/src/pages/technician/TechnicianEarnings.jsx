import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const TechnicianEarnings = () => {
  const [earnings, setEarnings] = useState({ total: 0, thisMonth: 0, lastMonth: 0, jobs: [] });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const response = await api.get('/technician/earnings');
      setEarnings(response.data);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
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
          <li><Link to="/technician/earnings" className="active">💰 Earnings</Link></li>
          <li><Link to="/technician/reviews">⭐ Reviews</Link></li>
          <li><Link to="/technician/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>💰 My Earnings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Track your income and completed jobs</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading earnings...</div>
        ) : (
          <>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.1s both' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💵</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>${earnings.total || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Earnings</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.2s both' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>${earnings.thisMonth || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>This Month</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.3s both' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>${earnings.lastMonth || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Last Month</p>
              </div>
            </div>
            <div className="card" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Completed Jobs</h2>
              {earnings.jobs && earnings.jobs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {earnings.jobs.map((job, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'var(--progress-bg)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ marginBottom: '0.25rem' }}>Job #{job._id?.slice(-6)}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.description}</p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>{job.customer?.name} • {job.completedDate ? new Date(job.completedDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--highlight)' }}>${job.price || 50}</div>
                        <span className="badge badge-success">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
                  <p>No completed jobs yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <footer><p>&copy; 2025 FixAll. All rights reserved. | Earnings</p></footer>
    </div>
  );
};

export default TechnicianEarnings;

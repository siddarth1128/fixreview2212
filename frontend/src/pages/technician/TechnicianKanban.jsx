import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const TechnicianKanban = () => {
  const [jobs, setJobs] = useState({ pending: [], inProgress: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/technician/jobs');
      const allJobs = response.data;
      setJobs({
        pending: allJobs.filter(j => j.status === 'pending'),
        inProgress: allJobs.filter(j => j.status === 'in-progress'),
        completed: allJobs.filter(j => j.status === 'completed')
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderColumn = (title, jobList, emoji) => (
    <div className="card" style={{ minHeight: '500px' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{emoji}</span> {title} <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{jobList.length}</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {jobList.map(job => (
          <div key={job._id} style={{ padding: '1rem', background: 'var(--progress-bg)', borderRadius: '8px', border: '2px solid var(--card-border)' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>#{job._id.slice(-6)}</h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.description}</p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}><strong>Customer:</strong> {job.customer?.name}</p>
            {job.scheduledDate && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {new Date(job.scheduledDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
        {jobList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>No jobs</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Tech</h2></div>
        <ul>
          <li><Link to="/technician">🏠 Dashboard</Link></li>
          <li><Link to="/technician/jobs">📋 All Jobs</Link></li>
          <li><Link to="/technician/kanban" className="active">📊 Kanban</Link></li>
          <li><Link to="/technician/schedule">📅 Schedule</Link></li>
          <li><Link to="/technician/earnings">💰 Earnings</Link></li>
          <li><Link to="/technician/reviews">⭐ Reviews</Link></li>
          <li><Link to="/technician/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📊 Kanban Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Visualize your workflow</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', animation: 'fadeInUp 0.8s ease-out' }}>
            {renderColumn('Pending', jobs.pending, '⏳')}
            {renderColumn('In Progress', jobs.inProgress, '🔄')}
            {renderColumn('Completed', jobs.completed, '✅')}
          </div>
        )}
      </main>
      <footer><p>&copy; 2025 FixAll. All rights reserved. | Kanban</p></footer>
    </div>
  );
};

export default TechnicianKanban;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const TechnicianSchedule = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/technician/jobs');
      setJobs(response.data.filter(j => j.status !== 'completed' && j.status !== 'cancelled'));
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = () => {
    const grouped = {};
    jobs.forEach(job => {
      const date = new Date(job.scheduledDate).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(job);
    });
    return grouped;
  };

  const groupedJobs = groupByDate();

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Tech</h2></div>
        <ul>
          <li><Link to="/technician">🏠 Dashboard</Link></li>
          <li><Link to="/technician/jobs">📋 All Jobs</Link></li>
          <li><Link to="/technician/schedule" className="active">📅 Schedule</Link></li>
          <li><Link to="/technician/earnings">💰 Earnings</Link></li>
          <li><Link to="/technician/reviews">⭐ Reviews</Link></li>
          <li><Link to="/technician/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📅 My Schedule</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>View your upcoming jobs</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading schedule...</div>
        ) : Object.keys(groupedJobs).length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No upcoming jobs</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your schedule is clear!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {Object.entries(groupedJobs).map(([date, dateJobs]) => (
              <div key={date} style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--highlight)' }}>{date}</h2>
                <div className="grid">
                  {dateJobs.map(job => (
                    <div key={job._id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Job #{job._id.slice(-6)}</h3>
                        <span className={`badge badge-${job.status === 'in-progress' ? 'warning' : 'success'}`}>{job.status.toUpperCase()}</span>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{job.description}</p>
                      <p style={{ margin: '0.5rem 0' }}><strong>Customer:</strong> {job.customer?.name}</p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>🕐</strong> {new Date(job.scheduledDate).toLocaleTimeString()}</p>
                      {job.address && <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>📍</strong> {job.address}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer><p>&copy; 2025 FixAll. All rights reserved. | Schedule</p></footer>
    </div>
  );
};

export default TechnicianSchedule;

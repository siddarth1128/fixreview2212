import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const AdminStats = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalTechnicians: 0, totalBookings: 0, pendingApprovals: 0, completedBookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Admin</h2></div>
        <ul>
          <li><Link to="/admin">📊 Dashboard</Link></li>
          <li><Link to="/admin/users">👥 All Users</Link></li>
          <li><Link to="/admin/bookings">📅 All Bookings</Link></li>
          <li><Link to="/admin/technicians">🔧 Technicians</Link></li>
          <li><Link to="/admin/stats" className="active">📈 Statistics</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📈 Platform Statistics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Comprehensive platform analytics</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading statistics...</div>
        ) : (
          <>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.1s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>{stats.totalUsers || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Users</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.2s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔧</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>{stats.totalTechnicians || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Technicians</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.3s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>{stats.totalBookings || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Bookings</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.4s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{stats.pendingApprovals || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Pending Approvals</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.5s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{stats.completedBookings || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Completed Jobs</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.6s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💰</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>${stats.revenue || 0}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
              </div>
            </div>
            <div className="card" style={{ animation: 'fadeInUp 0.8s ease-out 0.7s both', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <h2 style={{ marginBottom: '1rem' }}>Platform Overview</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Your platform is growing! Monitor key metrics and make data-driven decisions to improve service quality.
              </p>
            </div>
          </>
        )}
      </main>
      <footer><p>&copy; 2025 FixAll. All rights reserved. | Statistics</p></footer>
    </div>
  );
};

export default AdminStats;

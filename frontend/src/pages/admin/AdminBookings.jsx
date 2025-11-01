import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const loadBookings = async () => {
    try {
      const response = await api.get('/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = booking.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.tech?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredBookings(filtered);
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Admin</h2></div>
        <ul>
          <li><Link to="/admin">📊 Dashboard</Link></li>
          <li><Link to="/admin/users">👥 All Users</Link></li>
          <li><Link to="/admin/bookings" className="active">📅 All Bookings</Link></li>
          <li><Link to="/admin/technicians">🔧 Technicians</Link></li>
          <li><Link to="/admin/stats">📈 Statistics</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📅 All Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Monitor and manage all service bookings</p>
        </div>
        <div className="card" style={{ marginBottom: '2rem', animation: 'scaleIn 0.6s ease-out' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input type="text" placeholder="🔍 Search bookings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn" onClick={loadBookings} style={{ padding: '0.75rem 1.5rem' }}>🔄 Refresh</button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3>No bookings found</h3>
          </div>
        ) : (
          <div className="grid" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            {filteredBookings.map((booking, index) => (
              <div key={booking._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3>Booking #{booking._id.slice(-6)}</h3>
                  <span className={`badge badge-${booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'}`}>{booking.status.toUpperCase()}</span>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{booking.description}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Customer:</strong> {booking.customer?.name}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Technician:</strong> {booking.tech?.name || 'Not assigned'}</p>
                {booking.scheduledDate && (
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Scheduled:</strong> {new Date(booking.scheduledDate).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <footer><p>&copy; 2025 FixAll. All rights reserved. | Admin Bookings</p></footer>
    </div>
  );
};

export default AdminBookings;

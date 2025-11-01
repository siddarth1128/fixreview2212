import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalTechnicians: 0, totalBookings: 0, pendingApprovals: 0 });
  const [pendingTechnicians, setPendingTechnicians] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsResponse = await api.get('/admin/stats');
      const pendingResponse = await api.get('/admin/pending-technicians');
      const bookingsResponse = await api.get('/admin/bookings');
      const usersResponse = await api.get('/admin/users');

      setStats({
        totalUsers: statsResponse.data.users.total,
        totalTechnicians: statsResponse.data.users.technicians,
        totalBookings: statsResponse.data.bookings.total,
        pendingApprovals: statsResponse.data.users.pendingTechnicians
      });

      setPendingTechnicians(pendingResponse.data);
      setRecentBookings(bookingsResponse.data.slice(0, 6));
      setRecentUsers(usersResponse.data.slice(0, 6));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTechnician = async (id) => {
    try {
      await api.put(`/admin/approve/${id}`);
      alert('Technician approved successfully');
      loadDashboardData();
    } catch (error) {
      alert('Error approving technician');
    }
  };

  const handleRejectTechnician = async (id) => {
    if (!window.confirm('Are you sure you want to reject this technician?')) return;
    try {
      await api.delete(`/admin/user/${id}`);
      alert('Technician rejected');
      loadDashboardData();
    } catch (error) {
      alert('Error rejecting technician');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': 'success',
      'cancelled': 'danger',
      'pending': 'warning',
      'in-progress': 'warning'
    };
    return badges[status] || 'warning';
  };

  const getRoleBadge = (role) => {
    const badges = {
      'admin': 'danger',
      'technician': 'warning',
      'customer': 'success'
    };
    return badges[role] || 'success';
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Admin</h2>
        </div>
        <ul>
          <li><Link to="/admin" className="active">📊 Dashboard</Link></li>
          <li><Link to="/admin/users">👥 All Users</Link></li>
          <li><Link to="/admin/bookings">📅 All Bookings</Link></li>
          <li><Link to="/admin/technicians">🔧 Pending Technicians</Link></li>
          <li><Link to="/admin/stats">📈 Statistics</Link></li>
          <li><button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, font: 'inherit' }}>🚪 Logout</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Welcome Header */}
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Welcome, Admin</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your platform from this central dashboard</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.1s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.totalUsers}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Users</p>
          </div>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.2s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔧</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.totalTechnicians}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Technicians</p>
          </div>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.3s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.totalBookings}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Bookings</p>
          </div>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.4s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.pendingApprovals}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Approvals</p>
          </div>
        </div>

        {/* Pending Technician Approvals */}
        <section style={{ marginBottom: '3rem', animation: 'fadeInUp 0.8s ease-out 0.5s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>⏳ Pending Technician Approvals</h2>
            <span className="badge badge-warning">{pendingTechnicians.length} Pending</span>
          </div>
          
          {pendingTechnicians.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ fontSize: '1.2rem' }}>No pending approvals at the moment</p>
            </div>
          ) : (
            <div className="grid">
              {pendingTechnicians.map(tech => (
                <div key={tech._id} className="card" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginRight: '1rem' }}>
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.25rem' }}>{tech.name}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{tech.email}</p>
                    </div>
                  </div>
                  <p style={{ margin: '0.5rem 0' }}><strong>Skills:</strong> {tech.skills?.join(', ') || 'Not specified'}</p>
                  <p style={{ margin: '0.5rem 0' }}><strong>Registered:</strong> {new Date(tech.createdAt).toLocaleDateString()}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => handleApproveTechnician(tech._id)} style={{ flex: 1, padding: '0.75rem' }}>
                      ✅ Approve
                    </button>
                    <button className="btn btn-danger" onClick={() => handleRejectTechnician(tech._id)} style={{ flex: 1, padding: '0.75rem' }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Bookings */}
        <section style={{ marginBottom: '3rem', animation: 'fadeInUp 0.8s ease-out 0.6s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>📅 Recent Bookings</h2>
            <Link to="/admin/bookings" style={{ color: 'var(--highlight)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div className="grid">
            {recentBookings.map(booking => (
              <div key={booking._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{booking.customer?.name || 'Unknown'}</h3>
                  <span className={`badge badge-${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0' }}><strong>Technician:</strong> {booking.tech?.name || 'Not assigned'}</p>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{booking.description}</p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Users */}
        <section style={{ animation: 'fadeInUp 0.8s ease-out 0.7s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>👥 Recent Users</h2>
            <Link to="/admin/users" style={{ color: 'var(--highlight)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div className="grid">
            {recentUsers.map(user => (
              <div key={user._id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--decoration-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginRight: '1rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{user.name}</h3>
                    <span className={`badge badge-${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const AdminTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const response = await api.get('/admin/pending-technicians');
      setTechnicians(response.data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (techId) => {
    try {
      await api.put(`/admin/approve/${techId}`);
      alert('Technician approved!');
      loadTechnicians();
    } catch (error) {
      alert('Error approving technician');
    }
  };

  const handleReject = async (techId) => {
    if (!window.confirm('Are you sure you want to reject this technician?')) return;
    try {
      await api.delete(`/admin/user/${techId}`);
      alert('Technician rejected');
      loadTechnicians();
    } catch (error) {
      alert('Error rejecting technician');
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
          <li><Link to="/admin/technicians" className="active">🔧 Technicians</Link></li>
          <li><Link to="/admin/stats">📈 Statistics</Link></li>
          <li><button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, font: 'inherit' }}>🚪 Logout</button></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🔧 Pending Technicians</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Review and approve technician applications</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
        ) : technicians.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3>No pending technicians</h3>
            <p style={{ color: 'var(--text-secondary)' }}>All technicians have been reviewed</p>
          </div>
        ) : (
          <div className="grid" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            {technicians.map((tech, index) => (
              <div key={tech._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', marginRight: '1rem' }}>
                    {tech.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.25rem' }}>{tech.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{tech.email}</p>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--progress-bg)', borderRadius: '8px' }}>
                  <p style={{ margin: '0.5rem 0' }}><strong>Skills:</strong> {tech.skills?.join(', ') || 'Not specified'}</p>
                  {tech.experience && <p style={{ margin: '0.5rem 0' }}><strong>Experience:</strong> {tech.experience} years</p>}
                  {tech.phone && <p style={{ margin: '0.5rem 0' }}><strong>Phone:</strong> {tech.phone}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-success" onClick={() => handleApprove(tech._id)} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}>✅ Approve</button>
                  <button className="btn btn-danger" onClick={() => handleReject(tech._id)} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}>❌ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminTechnicians;

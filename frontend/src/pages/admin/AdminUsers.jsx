import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const filterUsers = useCallback(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/user/${userId}`);
      alert('User deleted successfully');
      loadUsers();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Admin</h2></div>
        <ul>
          <li><Link to="/admin">📊 Dashboard</Link></li>
          <li><Link to="/admin/users" className="active">👥 All Users</Link></li>
          <li><Link to="/admin/bookings">📅 All Bookings</Link></li>
          <li><Link to="/admin/technicians">🔧 Technicians</Link></li>
          <li><Link to="/admin/stats">📈 Statistics</Link></li>
          <li><button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, font: 'inherit' }}>🚪 Logout</button></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>👥 All Users</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage all platform users</p>
        </div>
        <div className="card" style={{ marginBottom: '2rem', animation: 'scaleIn 0.6s ease-out' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input type="text" placeholder="🔍 Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }} />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }}>
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="technician">Technicians</option>
              <option value="admin">Admins</option>
            </select>
            <button className="btn" onClick={loadUsers} style={{ padding: '0.75rem 1.5rem' }}>🔄 Refresh</button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="grid" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            {filteredUsers.map((user, index) => (
              <div key={user._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginRight: '1rem' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.25rem' }}>{user.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'technician' ? 'primary' : 'success'}`}>{user.role.toUpperCase()}</span>
                  {user.role === 'technician' && (
                    <span className={`badge badge-${user.approved ? 'success' : 'warning'}`}>{user.approved ? 'APPROVED' : 'PENDING'}</span>
                  )}
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <button className="btn btn-danger" onClick={() => handleDeleteUser(user._id)} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}>🗑️ Delete User</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;

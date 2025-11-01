import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const CustomerDashboard = () => {
  const [stats, setStats] = useState({ pending: 0, completed: 0, reviews: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/customer/bookings');
      const bookings = response.data;

      // Calculate stats
      const pending = bookings.filter(b => b.status === 'pending' || b.status === 'in-progress');
      const completed = bookings.filter(b => b.status === 'completed');
      const reviewed = bookings.filter(b => b.review);

      setStats({
        pending: pending.length,
        completed: completed.length,
        reviews: reviewed.length
      });

      setRecentActivity(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModal.bookingId) return;
    
    console.log('Cancelling booking:', cancelModal.bookingId);
    try {
      await api.put(`/customer/cancel/${cancelModal.bookingId}`);
      alert('Booking cancelled successfully!');
      setCancelModal({ show: false, bookingId: null });
      loadDashboard();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'in-progress': '🔄'
    };
    return icons[status] || '📅';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'in-progress': 'warning',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'warning';
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ 
            background: 'var(--accent-gradient)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '2rem'
          }}>FixAll</h2>
        </div>
        <ul>
          <li><Link to="/customer" className="active">🏠 Dashboard</Link></li>
          <li><Link to="/customer/book">🔍 Book Service</Link></li>
          <li><Link to="/customer/history">📋 My Bookings</Link></li>
          <li><Link to="/customer/invoices">💰 Invoices</Link></li>
          <li><Link to="/customer/profile">👤 My Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Personalized Greeting */}
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Welcome back, {user?.name || 'Customer'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem' }}>
            Here's what's happening with your services
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
          <div 
            className="card stat-card" 
            style={{ animation: 'scaleIn 0.6s ease-out 0.1s both', cursor: 'pointer' }}
            onClick={() => navigate('/customer/history?filter=pending')}
          >
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.pending}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.2rem' }}>Pending Bookings</p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Click to view</p>
          </div>
          
          <div 
            className="card stat-card" 
            style={{ animation: 'scaleIn 0.6s ease-out 0.2s both', cursor: 'pointer' }}
            onClick={() => navigate('/customer/history?filter=completed')}
          >
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.completed}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.2rem' }}>Completed Services</p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Click to view</p>
          </div>
          
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.3s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.reviews}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.2rem' }}>Reviews Given</p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Your feedback</p>
          </div>
        </div>

        {/* Quick Actions */}
        <section style={{ marginBottom: '3rem', animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Quick Actions</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div 
              className="card" 
              style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onClick={() => navigate('/customer/book')}
            >
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 2s ease-in-out infinite' }}>🔧</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Book a Service</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                  Find and book verified technicians for your home repairs
                </p>
                <button className="btn" style={{ width: '100%' }}>Book Now →</button>
              </div>
            </div>
            
            <div 
              className="card" 
              style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onClick={() => navigate('/customer/history')}
            >
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 2s ease-in-out infinite 0.5s' }}>📋</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>View History</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                  Check your past bookings, invoices, and service details
                </p>
                <button className="btn btn-secondary" style={{ width: '100%' }}>View History →</button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>📅 Recent Activity</h2>
            <Link to="/customer/history" style={{ color: 'var(--highlight)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>No recent activity</h3>
              <p style={{ marginBottom: '2rem' }}>Start by booking your first service!</p>
              <button className="btn" onClick={() => navigate('/customer/book')} style={{ maxWidth: '300px', margin: '0 auto' }}>
                Book a Service
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((booking, index) => (
                <div 
                  key={booking._id} 
                  className="card" 
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <div style={{ fontSize: '2rem' }}>{getStatusIcon(booking.status)}</div>
                        )}
                        <div>
                          <h3 style={{ marginBottom: '0.25rem' }}>Booking #{booking._id.slice(-6)}</h3>
                          <span 
                            className={`badge badge-${getStatusColor(booking.status)}`}
                            style={booking.status === 'completed' ? { background: '#10b981', color: 'white', fontWeight: 600 } : {}}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{booking.description}</p>
                      <p style={{ margin: '0.5rem 0', fontSize: '1.05rem' }}>
                        <strong>Technician:</strong> {booking.tech?.name || 'Not assigned yet'}
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        {new Date(booking.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 10 }}>
                      {booking.status === 'pending' && (
                        <button 
                          className="btn btn-danger" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelModal({ show: true, bookingId: booking._id });
                          }}
                          style={{ padding: '0.5rem 1rem', fontSize: '1.05rem', width: 'auto', cursor: 'pointer', pointerEvents: 'auto' }}
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'completed' && !booking.review && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customer/history?review=${booking._id}`);
                          }}
                          style={{ padding: '0.5rem 1rem', fontSize: '1.05rem', width: 'auto', cursor: 'pointer', pointerEvents: 'auto' }}
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Cancel Booking Modal */}
      {cancelModal.show && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setCancelModal({ show: false, bookingId: null })}>
          <div className="modal-content" style={{ animation: 'scaleIn 0.4s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setCancelModal({ show: false, bookingId: null })}>&times;</span>
            <h2 style={{ marginBottom: '1rem' }}>Cancel Booking</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-danger" onClick={handleCancelBooking} style={{ flex: 1 }}>
                Yes, Cancel Booking
              </button>
              <button className="btn btn-secondary" onClick={() => setCancelModal({ show: false, bookingId: null })} style={{ flex: 1 }}>
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CustomerDashboard;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const TechnicianDashboard = () => {
  const [stats, setStats] = useState({ todayJobs: 0, completed: 0, totalEarnings: 0, monthEarnings: 0, avgRating: 0, reviewCount: 0 });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState({ show: false, image: null, index: 0, allImages: [] });
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/technician/jobs');
      const jobs = response.data;

      // Calculate stats
      const today = new Date().toDateString();
      const todayJobs = jobs.filter(j => {
        const jobDate = j.scheduledDate ? new Date(j.scheduledDate).toDateString() : null;
        return jobDate === today && (j.status === 'pending' || j.status === 'in-progress');
      });
      const completed = jobs.filter(j => j.status === 'completed');
      
      // Calculate earnings
      const totalEarnings = completed.reduce((sum, j) => sum + (j.price || 0), 0);
      const thisMonth = new Date();
      const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      const monthEarnings = completed
        .filter(j => new Date(j.completedDate) >= monthStart)
        .reduce((sum, j) => sum + (j.price || 0), 0);

      // Calculate rating - only count reviews with actual ratings
      const reviews = jobs.filter(j => j.review && j.review.rating);
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, j) => sum + (j.review.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';

      setStats({
        todayJobs: todayJobs.length,
        completed: completed.length,
        totalEarnings,
        monthEarnings,
        avgRating,
        reviewCount: reviews.length
      });

      setTodaySchedule(todayJobs);
      setRecentJobs(jobs.slice(0, 6));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async (jobId) => {
    console.log('Starting job:', jobId);
    try {
      await api.put(`/technician/start/${jobId}`);
      alert('Job started successfully!');
      loadDashboard();
    } catch (error) {
      console.error('Error starting job:', error);
      alert(error.response?.data?.message || 'Error starting job');
    }
  };

  const getStatusIcon = (status) => {
    const icons = { 'pending': '⏳', 'in-progress': '🔄', 'completed': '✅', 'cancelled': '❌' };
    return icons[status] || '📅';
  };

  const getStatusColor = (status) => {
    const colors = { 'pending': 'warning', 'in-progress': 'warning', 'completed': 'success', 'cancelled': 'danger' };
    return colors[status] || 'warning';
  };

  const openImageModal = (images, index) => {
    setImageModal({ show: true, image: images[index], index, allImages: images });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, image: null, index: 0, allImages: [] });
  };

  const nextImage = () => {
    const newIndex = (imageModal.index + 1) % imageModal.allImages.length;
    setImageModal({ ...imageModal, index: newIndex, image: imageModal.allImages[newIndex] });
  };

  const prevImage = () => {
    const newIndex = (imageModal.index - 1 + imageModal.allImages.length) % imageModal.allImages.length;
    setImageModal({ ...imageModal, index: newIndex, image: imageModal.allImages[newIndex] });
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Pro</h2>
        </div>
        <ul>
          <li><Link to="/technician" className="active">🏠 Dashboard</Link></li>
          <li><Link to="/technician/jobs">📋 My Jobs</Link></li>
          <li><Link to="/technician/schedule">📅 Today's Schedule</Link></li>
          <li><Link to="/technician/earnings">💰 Earnings</Link></li>
          <li><Link to="/technician/profile">⚙️ My Profile</Link></li>
          <li><Link to="/technician/reviews">⭐ Reviews</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Approval Status Banner */}
        {user && (
          <div style={{ marginBottom: '2rem', animation: 'slideDown 0.6s ease-out' }}>
            {user.approved ? (
              <div className="card" style={{ background: 'linear-gradient(135deg, #4e5d4e, #3e4d3e)', color: '#f0e4d4', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>✅</div>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', color: '#f0e4d4' }}>Account Approved!</h3>
                    <p style={{ margin: 0, color: 'rgba(240, 228, 212, 0.9)' }}>You can now accept and complete jobs. Start earning today!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ background: 'linear-gradient(135deg, #d6c9a4, #c4b594)', color: '#0b1a34', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>⏳</div>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', color: '#0b1a34' }}>Pending Approval</h3>
                    <p style={{ margin: 0, color: 'rgba(11, 26, 52, 0.8)' }}>Your account is under review. You'll be notified once approved by our admin team.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Welcome Header */}
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Welcome back, {user?.name || 'Technician'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Here's your performance overview</p>
        </div>

        {/* Performance Stats */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.1s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.todayJobs}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Today's Jobs</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Scheduled for today</p>
          </div>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.2s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.completed}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Jobs</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>All time</p>
          </div>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.3s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>${stats.totalEarnings}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Earnings</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>This month: ${stats.monthEarnings}</p>
          </div>
          <div className="card stat-card" style={{ animation: 'scaleIn 0.6s ease-out 0.4s both' }}>
            <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.avgRating}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Average Rating</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{stats.reviewCount} reviews</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <section style={{ marginBottom: '3rem', animation: 'fadeInUp 0.8s ease-out 0.5s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>📅 Today's Schedule</h2>
            <Link to="/technician/schedule" style={{ color: 'var(--highlight)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          {todaySchedule.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No jobs scheduled for today</h3>
              <p>Enjoy your free time or check upcoming bookings!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todaySchedule.map((job, index) => (
                <div key={job._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>📅</div>
                        <div>
                          <h3 style={{ marginBottom: '0.25rem' }}>Job #{job._id.slice(-6)}</h3>
                          <span className={`badge badge-${getStatusColor(job.status)}`}>{job.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{job.description}</p>
                      <p style={{ margin: '0.5rem 0' }}><strong>Customer:</strong> {job.customer?.name || 'Unknown'}</p>
                      <p style={{ margin: '0.5rem 0' }}><strong>Time:</strong> {new Date(job.scheduledDate).toLocaleTimeString()}</p>
                      {job.address && <p style={{ margin: '0.5rem 0' }}><strong>Address:</strong> {job.address}</p>}
                      
                      {job.images && job.images.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>📷 Images ({job.images.length})</p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {job.images.slice(0, 3).map((img, idx) => (
                              <img 
                                key={idx}
                                src={img.data} 
                                alt={`Job ${idx + 1}`}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover', 
                                  borderRadius: '6px', 
                                  border: '2px solid var(--card-border)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                                onClick={() => openImageModal(job.images, idx)}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.15)';
                                  e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                                  e.target.style.zIndex = '10';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                  e.target.style.boxShadow = 'none';
                                  e.target.style.zIndex = '1';
                                }}
                                title="Click to view full size"
                              />
                            ))}
                            {job.images.length > 3 && (
                              <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '6px', 
                                border: '2px solid var(--card-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--progress-bg)',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}>
                                +{job.images.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 10 }}>
                      {job.status === 'pending' && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartJob(job._id);
                          }} 
                          style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', cursor: 'pointer', pointerEvents: 'auto' }}
                        >
                          ▶️ Start Job
                        </button>
                      )}
                      {job.status === 'in-progress' && (
                        <button 
                          className="btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Complete button clicked, navigating to:', `/technician/payment/${job._id}`);
                            navigate(`/technician/payment/${job._id}`);
                          }} 
                          style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', cursor: 'pointer', pointerEvents: 'auto' }}
                        >
                          ✅ Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Jobs */}
        <section style={{ marginBottom: '3rem', animation: 'fadeInUp 0.8s ease-out 0.6s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>📋 Recent Jobs</h2>
            <Link to="/technician/jobs" style={{ color: 'var(--highlight)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          <div className="grid">
            {recentJobs.map((job, index) => (
              <div key={job._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{getStatusIcon(job.status)}</div>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>Job #{job._id.slice(-6)}</h3>
                    <span className={`badge badge-${getStatusColor(job.status)}`}>{job.status.toUpperCase()}</span>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{job.description}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Customer:</strong> {job.customer?.name || 'Unknown'}</p>
                {job.scheduledDate && (
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(job.scheduledDate).toLocaleString()}
                  </p>
                )}
                {job.review && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--progress-bg)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#f59e0b' }}>⭐</span>
                      <strong>{job.review.rating}/5</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{ animation: 'fadeInUp 0.8s ease-out 0.7s both' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>⚡ Quick Actions</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }} onClick={() => navigate('/technician/schedule')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ marginBottom: '0.5rem' }}>View Schedule</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Check your upcoming jobs</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }} onClick={() => navigate('/technician/earnings')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Track Earnings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View your income details</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }} onClick={() => navigate('/technician/profile')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Edit Profile</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Update your information</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }} onClick={() => navigate('/technician/reviews')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ marginBottom: '0.5rem' }}>View Reviews</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>See customer feedback</p>
            </div>
          </div>
        </section>
      </main>

      {/* Image Viewer Modal */}
      {imageModal.show && (
        <div 
          className="modal" 
          style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.95)', zIndex: 9999 }} 
          onClick={closeImageModal}
        >
          <div 
            style={{ 
              position: 'relative', 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              margin: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <span 
              className="close" 
              onClick={closeImageModal}
              style={{ 
                position: 'absolute', 
                top: '-40px', 
                right: '0', 
                fontSize: '2.5rem', 
                color: 'white',
                cursor: 'pointer',
                zIndex: 10000
              }}
            >
              &times;
            </span>

            {imageModal.allImages.length > 1 && (
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  zIndex: 10000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ‹
              </button>
            )}

            <img 
              src={imageModal.image?.data} 
              alt="Full size view"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh', 
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}
            />

            {imageModal.allImages.length > 1 && (
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  zIndex: 10000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ›
              </button>
            )}

            <div
              style={{
                position: 'absolute',
                bottom: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {imageModal.index + 1} / {imageModal.allImages.length}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TechnicianDashboard;

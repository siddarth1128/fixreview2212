import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';
import ChatModal from '../../components/chat/ChatModal';

const TechnicianJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState({ show: false, image: null, index: 0, allImages: [] });
  const [chatModal, setChatModal] = useState({ show: false, jobId: null });
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [statusFilter, jobs]);

  const loadJobs = async () => {
    try {
      const response = await api.get('/technician/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    if (statusFilter === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === statusFilter));
    }
  };

  const handleStartJob = async (jobId) => {
    try {
      await api.put(`/technician/start/${jobId}`);
      alert('Job started!');
      loadJobs();
    } catch (error) {
      alert('Error starting job');
    }
  };

  const handleCompleteJob = (jobId) => {
    navigate(`/technician/payment/${jobId}`);
  };

  const getStatusIcon = (status) => {
    const icons = { 'pending': '⏳', 'in-progress': '🔄', 'completed': '✅', 'cancelled': '❌' };
    return icons[status] || '📋';
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
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Tech</h2></div>
        <ul>
          <li><Link to="/technician">🏠 Dashboard</Link></li>
          <li><Link to="/technician/jobs" className="active">📋 My Jobs</Link></li>
          <li><Link to="/technician/schedule">📅 Schedule</Link></li>
          <li><Link to="/technician/earnings">💰 Earnings</Link></li>
          <li><Link to="/technician/reviews">⭐ Reviews</Link></li>
          <li><Link to="/technician/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📋 All Jobs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage all your service bookings</p>
        </div>
        <div className="card" style={{ marginBottom: '2rem', animation: 'scaleIn 0.6s ease-out' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }}>
              <option value="all">All Jobs</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button className="btn" onClick={loadJobs} style={{ padding: '0.75rem 1.5rem' }}>🔄 Refresh</button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No jobs found</h3>
            <p>Jobs will appear here when customers book your services</p>
          </div>
        ) : (
          <div className="grid" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            {filteredJobs.map((job, index) => (
              <div key={job._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem' }}>{getStatusIcon(job.status)}</div>
                    <div>
                      <h3 style={{ marginBottom: '0.25rem' }}>Job #{job._id.slice(-6)}</h3>
                      <span className={`badge badge-${getStatusColor(job.status)}`}>{job.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{job.description}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Customer:</strong> {job.customer?.name}</p>
                {job.scheduledDate && (
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Scheduled:</strong> {new Date(job.scheduledDate).toLocaleString()}
                  </p>
                )}
                {job.address && <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>📍</strong> {job.address}</p>}
                
                {job.images && job.images.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>📷 Uploaded Images ({job.images.length})</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                      {job.images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}
                        >
                          <img 
                            src={img.data} 
                            alt={`Job attachment ${idx + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '80px', 
                              objectFit: 'cover', 
                              borderRadius: '8px', 
                              border: '2px solid var(--card-border)',
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                            onClick={() => openImageModal(job.images, idx)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.1)';
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {job.status === 'pending' && (
                    <button className="btn" onClick={() => handleStartJob(job._id)} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}>▶️ Start Job</button>
                  )}
                  {job.status === 'in-progress' && (
                    <>
                      <button className="btn" onClick={() => setChatModal({ show: true, jobId: job._id })} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}>💬 Chat</button>
                      <button className="btn btn-success" onClick={() => handleCompleteJob(job._id)} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}>✅ Complete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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

            {/* Previous Button */}
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

            {/* Image */}
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

            {/* Next Button */}
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

            {/* Image Counter */}
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

      {/* Chat Modal */}
      {chatModal.show && (
        <ChatModal 
          bookingId={chatModal.jobId}
          userRole="technician"
          onClose={() => setChatModal({ show: false, jobId: null })}
        />
      )}

      <Footer />
    </div>
  );
};

export default TechnicianJobs;

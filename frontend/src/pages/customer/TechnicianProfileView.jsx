import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const TechnicianProfileView = () => {
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const loadTechnician = useCallback(async () => {
    try {
      const response = await api.get(`/customer/technician/${id}`);
      setTechnician(response.data);
    } catch (error) {
      console.error('Error loading technician:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTechnician();
  }, [loadTechnician]);

  const handleBookNow = () => {
    navigate('/customer/book');
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  if (!technician) return <div style={{ padding: '4rem', textAlign: 'center' }}>Technician not found</div>;

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll</h2></div>
        <ul>
          <li><Link to="/customer">🏠 Dashboard</Link></li>
          <li><Link to="/customer/book">🔍 Book Service</Link></li>
          <li><Link to="/customer/history">📋 My Bookings</Link></li>
          <li><Link to="/customer/invoices">💰 Invoices</Link></li>
          <li><Link to="/customer/profile">👤 My Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>👨‍🔧 Technician Profile</h1>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          <div className="card" style={{ animation: 'scaleIn 0.6s ease-out', textAlign: 'center' }}>
            <div style={{ width: '150px', height: '150px', margin: '0 auto 1.5rem', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '4rem', boxShadow: '0 8px 24px var(--shadow-lg)' }}>
              {technician.name.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{technician.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{technician.email}</p>
            <span className={`badge ${technician.approved ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {technician.approved ? 'Verified Technician' : 'Pending Approval'}
            </span>
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#f59e0b', fontSize: '1.5rem' }}>⭐</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{technician.averageRating || 'New'}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{technician.reviews?.length || 0} reviews</p>
            </div>
            {technician.approved && (
              <button className="btn" onClick={handleBookNow} style={{ width: '100%', marginTop: '2rem' }}>📅 Book Now</button>
            )}
          </div>
          <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>About</h2>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🔧 Skills & Expertise</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {technician.skills?.map((skill, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>{skill}</span>
                ))}
              </div>
            </div>
            {technician.experience && (
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--progress-bg)', borderRadius: '10px' }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💼</span>
                  <strong>{technician.experience} years of experience</strong>
                </p>
              </div>
            )}
            {technician.phone && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>📞</span>
                  <span>{technician.phone}</span>
                </p>
              </div>
            )}
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⭐ Customer Reviews 
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                  ({technician.reviews?.length || 0})
                </span>
              </h3>
              {technician.reviews && technician.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {technician.reviews.slice().reverse().map((review, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '1.25rem', 
                        background: 'var(--card-bg)', 
                        borderRadius: '12px',
                        border: '1px solid var(--card-border)',
                        boxShadow: '0 2px 8px var(--shadow)',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.15rem' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ color: i < review.rating ? '#f59e0b' : '#d1d5db', fontSize: '1.2rem' }}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--highlight)' }}>{review.rating}/5</strong>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <p style={{ 
                        margin: '0 0 0.75rem 0', 
                        color: 'var(--text-primary)', 
                        fontSize: '1.05rem',
                        lineHeight: '1.6',
                        fontStyle: 'italic'
                      }}>
                        "{review.comment}"
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--card-border)'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--accent-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}>
                          {review.from?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {review.from?.name || 'Customer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem 2rem',
                  background: 'var(--progress-bg)',
                  borderRadius: '12px',
                  border: '1px dashed var(--card-border)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    No reviews yet
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Be the first to review this technician!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianProfileView;

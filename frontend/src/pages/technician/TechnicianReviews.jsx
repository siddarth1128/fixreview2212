import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const TechnicianReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await api.get('/technician/reviews');
      console.log('Reviews response:', response.data);
      setReviews(response.data.reviews || []);
      setStats({ 
        average: parseFloat(response.data.stats?.average || 0), 
        total: response.data.stats?.total || 0 
      });
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}><h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Tech</h2></div>
        <ul>
          <li><Link to="/technician">🏠 Dashboard</Link></li>
          <li><Link to="/technician/jobs">📋 All Jobs</Link></li>
          <li><Link to="/technician/schedule">📅 Schedule</Link></li>
          <li><Link to="/technician/earnings">💰 Earnings</Link></li>
          <li><Link to="/technician/reviews" className="active">⭐ Reviews</Link></li>
          <li><Link to="/technician/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>⭐ My Reviews</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>See what customers are saying</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading reviews...</div>
        ) : (
          <>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.1s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--highlight)' }}>{stats.average ? stats.average.toFixed(1) : '0.0'}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Average Rating</p>
              </div>
              <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.2s both' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💬</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{stats.total}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Reviews</p>
              </div>
            </div>
            <div className="card" style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Customer Reviews</h2>
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((review, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', background: 'var(--progress-bg)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ marginBottom: '0.25rem' }}>{review.customer?.name || 'Customer'}</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>⭐</span>
                          <strong style={{ fontSize: '1.2rem' }}>{review.rating}/5</strong>
                        </div>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.6 }}>{review.comment}</p>
                      {review.booking && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Job: {review.booking.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                  <p>No reviews yet. Complete jobs to receive reviews!</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianReviews;

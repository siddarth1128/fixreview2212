import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChatModal from '../../components/chat/ChatModal';
import Footer from '../../components/common/Footer';

const BookingHistory = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });
  const [reviewModal, setReviewModal] = useState({ show: false, bookingId: null, rating: 0, comment: '' });
  const [clearModal, setClearModal] = useState(false);
  const [chatModal, setChatModal] = useState({ show: false, bookingId: null });
  const [loading, setLoading] = useState(true);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filterBookings = useCallback(() => {
    let filtered = allBookings.filter(booking => {
      const matchesSearch = booking.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.tech?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredBookings(filtered);
  }, [allBookings, searchTerm, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  // Handle review query parameter from dashboard
  useEffect(() => {
    const reviewId = searchParams.get('review');
    const filterParam = searchParams.get('filter');
    
    if (filterParam) {
      setStatusFilter(filterParam);
    }
    
    if (reviewId && allBookings.length > 0) {
      const booking = allBookings.find(b => b._id === reviewId);
      if (booking && booking.status === 'completed' && !booking.review) {
        setReviewModal({ show: true, bookingId: reviewId, rating: 0, comment: '' });
      }
      // Clear the query parameter
      navigate('/customer/history', { replace: true });
    }
  }, [searchParams, allBookings, navigate]);

  const loadBookings = async () => {
    try {
      const response = await api.get('/customer/bookings');
      const bookings = response.data;
      
      // Debug: Log bookings to check review status
      console.log('📋 Loaded bookings:', bookings);
      bookings.forEach(b => {
        if (b.status === 'completed') {
          console.log(`Booking ${b._id.slice(-6)}: status=${b.status}, hasReview=${!!b.review}, review=`, b.review);
        }
      });
      
      setAllBookings(bookings);
      
      setStats({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending' || b.status === 'in-progress').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.put(`/customer/cancel/${cancelModal.bookingId}`);
      alert('Booking cancelled successfully');
      setCancelModal({ show: false, bookingId: null });
      loadBookings();
    } catch (error) {
      alert('Error cancelling booking');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (reviewModal.rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (!reviewModal.comment.trim()) {
      alert('Please write a review comment');
      return;
    }
    
    try {
      await api.post(`/customer/review/${reviewModal.bookingId}`, {
        rating: reviewModal.rating,
        comment: reviewModal.comment.trim()
      });
      alert('✅ Review submitted successfully! Thank you for your feedback.');
      setReviewModal({ show: false, bookingId: null, rating: 0, comment: '' });
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    }
  };

  const handleClearHistory = async () => {
    console.log('Clearing all booking history...');
    try {
      await api.delete('/customer/bookings/clear');
      alert('All booking history cleared successfully!');
      setClearModal(false);
      loadBookings();
    } catch (error) {
      console.error('Error clearing history:', error);
      alert(error.response?.data?.message || 'Error clearing booking history');
    }
  };

  const getStatusColor = (status) => {
    const colors = { 'pending': 'warning', 'in-progress': 'warning', 'completed': 'success', 'cancelled': 'danger' };
    return colors[status] || 'warning';
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll</h2>
        </div>
        <ul>
          <li><Link to="/customer">🏠 Dashboard</Link></li>
          <li><Link to="/customer/book">🔍 Book Service</Link></li>
          <li><Link to="/customer/history" className="active">📋 My Bookings</Link></li>
          <li><Link to="/customer/invoices">💰 Invoices</Link></li>
          <li><Link to="/customer/profile">👤 My Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>

      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📋 My Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem' }}>View and manage all your service bookings</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem', animation: 'scaleIn 0.6s ease-out' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input type="text" placeholder="🔍 Search bookings..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid var(--card-border)' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              className="btn" 
              onClick={(e) => {
                e.stopPropagation();
                setStatusFilter('all');
                setSearchTerm('');
                setLoading(true);
                loadBookings();
              }} 
              style={{ width: 'auto', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              🔄 Refresh
            </button>
            <button 
              className="btn btn-danger" 
              onClick={(e) => {
                e.stopPropagation();
                setClearModal(true);
              }} 
              style={{ width: 'auto', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
              disabled={allBookings.length === 0}
            >
              🗑️ Clear History
            </button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.1s both' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.total}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Total Bookings</p>
          </div>
          <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.2s both' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.pending}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Pending</p>
          </div>
          <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.3s both' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.completed}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Completed</p>
          </div>
          <div className="card" style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease-out 0.4s both' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.cancelled}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Cancelled</p>
          </div>
        </div>

        {/* Pending Reviews Alert */}
        {allBookings.filter(b => b.status === 'completed' && !b.review).length > 0 && (
          <div className="card" style={{ 
            marginBottom: '2rem', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
            border: '2px solid #f59e0b',
            animation: 'scaleIn 0.6s ease-out 0.5s both'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>⭐</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#d97706', fontSize: '1.4rem' }}>
                  {allBookings.filter(b => b.status === 'completed' && !b.review).length} Completed Service{allBookings.filter(b => b.status === 'completed' && !b.review).length > 1 ? 's' : ''} Awaiting Your Review
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                  Help other customers by sharing your experience! Your feedback helps us maintain quality service.
                </p>
              </div>
              <button 
                className="btn" 
                onClick={() => setStatusFilter('completed')}
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                View Completed
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No bookings found</h3>
            <p style={{ marginBottom: '2rem' }}>Start by booking your first service!</p>
            <button className="btn" onClick={() => navigate('/customer/book')} style={{ maxWidth: '300px', margin: '0 auto' }}>Book a Service</button>
          </div>
        ) : (
          <div className="grid" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            {filteredBookings.map((booking, index) => (
              <div key={booking._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Booking #{booking._id.slice(-6)}</h3>
                    <span 
                      className={`badge badge-${getStatusColor(booking.status)}`}
                      style={booking.status === 'completed' ? { background: '#10b981', color: 'white', fontWeight: 600 } : {}}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '1.3rem' }}>{booking.description}</p>
                <p style={{ margin: '0.5rem 0', fontSize: '1.3rem' }}><strong>Technician:</strong> {booking.tech?.name || 'Not assigned'}</p>
                {booking.scheduledDate && (
                  <p style={{ margin: '0.5rem 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    <strong>Scheduled:</strong> {new Date(booking.scheduledDate).toLocaleString()}
                  </p>
                )}
                {booking.address && (
                  <p style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}><strong>📍</strong> {booking.address}</p>
                )}
                {booking.review && booking.review.rating && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))', 
                    borderRadius: '10px', 
                    border: '2px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      padding: '0.4rem 0.9rem', 
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap'
                    }}>
                      REVIEWED
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: '1.4rem' }}>
                          {i < booking.review.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                      <strong style={{ fontSize: '1.3rem', marginLeft: '0.5rem', color: '#10b981' }}>
                        {booking.review.rating}/5
                      </strong>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {booking.status === 'pending' && (
                    <button className="btn btn-danger" onClick={() => setCancelModal({ show: true, bookingId: booking._id })} style={{ flex: 1, padding: '0.75rem', fontSize: '1.3rem' }}>Cancel</button>
                  )}
                  {booking.status === 'in-progress' && (
                    <button className="btn" onClick={() => setChatModal({ show: true, bookingId: booking._id })} style={{ flex: 1, padding: '0.75rem', fontSize: '1.05rem' }}>
                      💬 Chat with Technician
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <>
                      {booking.receipt && (
                        <button className="btn" onClick={() => navigate(`/customer/invoice/${booking._id}`)} style={{ flex: 1, padding: '0.75rem', fontSize: '1.05rem' }}>
                          💰 View Receipt
                        </button>
                      )}
                      {(!booking.review || !booking.review.rating) && (
                        <button 
                          className="btn" 
                          onClick={() => {
                            console.log('Opening review modal for booking:', booking._id);
                            console.log('Current review status:', booking.review);
                            setReviewModal({ show: true, bookingId: booking._id, rating: 0, comment: '' });
                          }} 
                          style={{ 
                            flex: 1, 
                            padding: '0.75rem', 
                            fontSize: '1.1rem',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: '150px'
                          }}
                        >
                          ⭐ Leave Review
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {cancelModal.show && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setCancelModal({ show: false, bookingId: null })}>
          <div className="modal-content" style={{ animation: 'scaleIn 0.4s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setCancelModal({ show: false, bookingId: null })}>&times;</span>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Cancel Booking</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-danger" onClick={handleCancelBooking} style={{ flex: 1 }}>Yes, Cancel Booking</button>
              <button className="btn btn-secondary" onClick={() => setCancelModal({ show: false, bookingId: null })} style={{ flex: 1 }}>No, Keep It</button>
            </div>
          </div>
        </div>
      )}

      {reviewModal.show && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setReviewModal({ show: false, bookingId: null, rating: 0, comment: '' })}>
          <div className="modal-content" style={{ animation: 'scaleIn 0.4s ease-out', maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setReviewModal({ show: false, bookingId: null, rating: 0, comment: '' })}>&times;</span>
            <h2 style={{ marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>⭐ Leave a Review</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Share your experience to help other customers</p>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>How would you rate this service? *</label>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '2.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setReviewModal({ ...reviewModal, rating: star })} 
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      style={{ 
                        cursor: 'pointer', 
                        opacity: star <= reviewModal.rating ? 1 : 0.3,
                        transition: 'all 0.2s ease',
                        filter: star <= reviewModal.rating ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' : 'none'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {reviewModal.rating > 0 && (
                  <p style={{ color: 'var(--highlight)', fontWeight: 600, fontSize: '1.1rem' }}>
                    {reviewModal.rating === 5 ? '🎉 Excellent!' : 
                     reviewModal.rating === 4 ? '😊 Great!' : 
                     reviewModal.rating === 3 ? '👍 Good' : 
                     reviewModal.rating === 2 ? '😐 Fair' : '😞 Poor'}
                  </p>
                )}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '1.05rem' }}>Tell us more about your experience *</label>
                <textarea 
                  required 
                  rows="5" 
                  placeholder="What did you like? What could be improved? Your feedback helps us maintain quality service..." 
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    border: '2px solid var(--card-border)', 
                    fontFamily: 'inherit', 
                    resize: 'vertical',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                  }} 
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {reviewModal.comment.length} characters
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ flex: 1, fontSize: '1.05rem', padding: '0.875rem' }}
                  disabled={reviewModal.rating === 0 || !reviewModal.comment.trim()}
                >
                  ✅ Submit Review
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setReviewModal({ show: false, bookingId: null, rating: 0, comment: '' })} 
                  style={{ flex: 1, fontSize: '1.05rem', padding: '0.875rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {clearModal && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setClearModal(false)}>
          <div className="modal-content" style={{ animation: 'scaleIn 0.4s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setClearModal(false)}>&times;</span>
            <h2 style={{ marginBottom: '1rem', color: '#dc2626' }}>⚠️ Clear All History?</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This will permanently delete <strong>ALL</strong> your booking records from the database.
            </p>
            <p style={{ marginBottom: '2rem', color: '#dc2626', fontWeight: 600 }}>
              ⚠️ This action cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-danger" 
                onClick={handleClearHistory} 
                style={{ flex: 1 }}
              >
                Yes, Delete All
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setClearModal(false)} 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatModal.show && (
        <ChatModal 
          bookingId={chatModal.bookingId}
          userRole="customer"
          onClose={() => setChatModal({ show: false, bookingId: null })}
        />
      )}

      <Footer />
    </div>
  );
};

export default BookingHistory;

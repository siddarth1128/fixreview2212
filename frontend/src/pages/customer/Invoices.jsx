import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await api.get('/customer/bookings');
      // Filter only completed bookings with receipts
      const completedWithReceipts = response.data.filter(
        booking => booking.status === 'completed' && booking.receipt
      );
      setInvoices(completedWithReceipts);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (bookingId) => {
    try {
      await api.post(`/customer/booking/${bookingId}/pay`);
      alert('Payment successful!');
      loadInvoices();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'Error processing payment');
    }
  };

  const getPaymentStatusBadge = (payment) => {
    const badges = {
      'pending': { text: 'Pending Payment', class: 'badge-warning' },
      'completed': { text: 'Paid', class: 'badge-success' },
      'failed': { text: 'Failed', class: 'badge-danger' }
    };
    return badges[payment] || badges['pending'];
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll</h2>
        </div>
        <ul>
          <li><Link to="/customer">🏠 Dashboard</Link></li>
          <li><Link to="/customer/book">🔧 Book Service</Link></li>
          <li><Link to="/customer/history">📋 Booking History</Link></li>
          <li><Link to="/customer/invoices" className="active">💰 Invoices</Link></li>
          <li><Link to="/customer/profile">👤 Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>

      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰 My Invoices</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>View and pay your service invoices</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
            <h2 style={{ marginBottom: '1rem' }}>No Invoices Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Your completed service invoices will appear here
            </p>
            <button className="btn" onClick={() => navigate('/customer/book')}>
              Book a Service
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {invoices.map((invoice, index) => (
              <div key={invoice._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {/* Left Section - Invoice Details */}
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '2.5rem' }}>🧾</div>
                      <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>Invoice #{invoice._id.slice(-8).toUpperCase()}</h3>
                        <span 
                          className={`badge ${getPaymentStatusBadge(invoice.payment).class}`}
                          style={invoice.payment === 'completed' ? { 
                            background: '#10b981', 
                            color: 'white',
                            fontWeight: 600,
                            padding: '0.5rem 1rem'
                          } : {}}
                        >
                          {getPaymentStatusBadge(invoice.payment).text}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--progress-bg)', borderRadius: '10px' }}>
                      <p style={{ margin: '0.5rem 0' }}><strong>Service:</strong> {invoice.description}</p>
                      <p style={{ margin: '0.5rem 0' }}><strong>Technician:</strong> {invoice.tech?.name}</p>
                      <p style={{ margin: '0.5rem 0' }}><strong>Completed:</strong> {new Date(invoice.completedDate).toLocaleString()}</p>
                      {invoice.receipt?.timeSpent && (
                        <p style={{ margin: '0.5rem 0' }}><strong>Time Spent:</strong> {invoice.receipt.timeSpent}</p>
                      )}
                    </div>

                    {/* Cost Breakdown */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>💵 Cost Breakdown</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--card-bg)', borderRadius: '6px' }}>
                          <span>Labor Cost:</span>
                          <strong>₹{invoice.receipt?.laborCost?.toFixed(2) || '0.00'}</strong>
                        </div>
                        {invoice.receipt?.materialCost > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--card-bg)', borderRadius: '6px' }}>
                            <span>Material Cost:</span>
                            <strong>₹{invoice.receipt.materialCost.toFixed(2)}</strong>
                          </div>
                        )}
                        {invoice.receipt?.additionalCharges > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--card-bg)', borderRadius: '6px' }}>
                            <span>Additional Charges:</span>
                            <strong>₹{invoice.receipt.additionalCharges.toFixed(2)}</strong>
                          </div>
                        )}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '0.75rem', 
                          background: 'var(--accent-gradient)', 
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 700
                        }}>
                          <span>Total Amount:</span>
                          <span>₹{invoice.receipt?.totalAmount?.toFixed(2) || invoice.price?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {invoice.receipt?.notes && (
                      <div style={{ padding: '1rem', background: 'var(--progress-bg)', borderRadius: '8px' }}>
                        <strong>📝 Notes:</strong>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{invoice.receipt.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                    {invoice.payment === 'pending' && (
                      <button 
                        className="btn"
                        onClick={() => handlePayNow(invoice._id)}
                        style={{ padding: '1rem', fontSize: '1.1rem', whiteSpace: 'nowrap' }}
                      >
                        💳 Pay Now
                      </button>
                    )}
                    {invoice.payment === 'completed' && (
                      <div style={{ 
                        padding: '1rem', 
                        background: '#10b981', 
                        color: 'white', 
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        ✅ Payment Completed
                      </div>
                    )}
                  </div>
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

export default Invoices;

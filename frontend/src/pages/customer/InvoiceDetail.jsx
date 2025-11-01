import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const response = await api.get(`/customer/booking/${invoiceId}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Error loading invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    try {
      await api.post(`/customer/booking/${invoiceId}/pay`);
      alert('Payment successful!');
      loadInvoice();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'Error processing payment');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <p>Invoice not found</p>
        <button className="btn" onClick={() => navigate('/customer/invoices')} style={{ marginTop: '1rem' }}>
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="sidebar no-print">
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
        <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button className="btn btn-secondary" onClick={() => navigate('/customer/invoices')} style={{ marginBottom: '0.5rem' }}>
              ← Back to Invoices
            </button>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Invoice Details</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              🖨️ Print
            </button>
            {invoice.payment === 'pending' && (
              <button className="btn" onClick={handlePayNow} style={{ padding: '0.875rem 1.5rem' }}>
                💳 Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Invoice Card */}
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--card-border)' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                FixAll Services
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Professional Home Services</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>INVOICE</h3>
              <p><strong>#{invoice._id.slice(-8).toUpperCase()}</strong></p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {new Date(invoice.receipt?.sentAt || invoice.completedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Technician Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>BILL TO:</h4>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{invoice.customer?.name}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{invoice.customer?.email}</p>
              {invoice.address && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{invoice.address}</p>}
            </div>
            <div>
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>SERVICE BY:</h4>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{invoice.tech?.name}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{invoice.tech?.email}</p>
            </div>
          </div>

          {/* Service Details */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--progress-bg)', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Service Details</h4>
            <p style={{ marginBottom: '0.5rem' }}><strong>Description:</strong> {invoice.description}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Scheduled:</strong> {new Date(invoice.scheduledDate).toLocaleString()}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Completed:</strong> {new Date(invoice.completedDate).toLocaleString()}</p>
            {invoice.receipt?.timeSpent && (
              <p style={{ marginBottom: '0.5rem' }}><strong>Time Spent:</strong> {invoice.receipt.timeSpent}</p>
            )}
          </div>

          {/* Cost Breakdown Table */}
          <div style={{ marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>DESCRIPTION</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '1rem' }}>Labor Cost</td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>₹{invoice.receipt?.laborCost?.toFixed(2) || '0.00'}</td>
                </tr>
                {invoice.receipt?.materialCost > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '1rem' }}>Material Cost</td>
                    <td style={{ textAlign: 'right', padding: '1rem' }}>₹{invoice.receipt.materialCost.toFixed(2)}</td>
                  </tr>
                )}
                {invoice.receipt?.additionalCharges > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '1rem' }}>Additional Charges</td>
                    <td style={{ textAlign: 'right', padding: '1rem' }}>₹{invoice.receipt.additionalCharges.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--card-border)' }}>
                  <td style={{ padding: '1rem', fontSize: '1.3rem', fontWeight: 700 }}>TOTAL</td>
                  <td style={{ textAlign: 'right', padding: '1rem', fontSize: '1.3rem', fontWeight: 700 }}>
                    ₹{invoice.receipt?.totalAmount?.toFixed(2) || invoice.price?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Status */}
          <div style={{ 
            padding: '1.5rem', 
            background: invoice.payment === 'completed' ? '#10b981' : '#f59e0b', 
            color: 'white', 
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {invoice.payment === 'completed' ? '✅ PAID' : '⏳ PAYMENT PENDING'}
            </h3>
            {invoice.payment === 'pending' && (
              <p style={{ margin: 0, opacity: 0.9 }}>Please complete the payment to close this invoice</p>
            )}
          </div>

          {/* Notes */}
          {invoice.receipt?.notes && (
            <div style={{ padding: '1.5rem', background: 'var(--progress-bg)', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Additional Notes</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{invoice.receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid var(--card-border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <p>Thank you for choosing FixAll Services!</p>
            <p style={{ marginTop: '0.5rem' }}>For any queries, contact us at support@fixall.com</p>
          </div>
        </div>
      </main>

      <footer className="no-print">
        <p>&copy; 2025 FixAll. All rights reserved. | Invoice Details</p>
      </footer>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .sidebar { display: none !important; }
          main { margin-left: 0 !important; padding: 1rem !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetail;

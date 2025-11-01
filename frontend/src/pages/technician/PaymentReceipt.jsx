import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

console.log('PaymentReceipt module loaded');

const PaymentReceipt = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [receipt, setReceipt] = useState({
    laborCost: '',
    materialCost: '',
    additionalCharges: '',
    notes: '',
    timeSpent: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  console.log('PaymentReceipt component loaded, jobId:', jobId);

  const loadJobDetails = async () => {
    try {
      console.log('Loading job details for ID:', jobId);
      const response = await api.get(`/technician/job/${jobId}`);
      console.log('Job data received:', response.data);
      setJob(response.data);
      
      // Calculate time spent if job has start and completion times
      if (response.data.startedAt && response.data.completedDate) {
        const timeSpent = calculateTimeSpent(response.data.startedAt, response.data.completedDate);
        setReceipt(prev => ({ ...prev, timeSpent }));
      }
    } catch (error) {
      console.error('Error loading job:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Error loading job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const calculateTimeSpent = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateTotal = () => {
    const labor = parseFloat(receipt.laborCost) || 0;
    const material = parseFloat(receipt.materialCost) || 0;
    const additional = parseFloat(receipt.additionalCharges) || 0;
    return (labor + material + additional).toFixed(2);
  };

  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    
    if (!receipt.laborCost || parseFloat(receipt.laborCost) <= 0) {
      alert('Please enter a valid labor cost');
      return;
    }

    setSubmitting(true);
    try {
      const totalAmount = calculateTotal();
      
      await api.post(`/technician/job/${jobId}/receipt`, {
        ...receipt,
        totalAmount,
        laborCost: parseFloat(receipt.laborCost),
        materialCost: parseFloat(receipt.materialCost) || 0,
        additionalCharges: parseFloat(receipt.additionalCharges) || 0
      });

      alert('Receipt sent to customer successfully!');
      navigate('/technician/jobs');
    } catch (error) {
      console.error('Error submitting receipt:', error);
      alert(error.response?.data?.message || 'Error submitting receipt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <p>Job not found</p>
        <button className="btn" onClick={() => navigate('/technician/jobs')} style={{ marginTop: '1rem' }}>
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll Tech</h2>
        </div>
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

      <main style={{ marginLeft: '250px', padding: '2rem', minHeight: '100vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/technician/jobs')} style={{ marginBottom: '1rem' }}>
            ← Back to Jobs
          </button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰 Payment Receipt</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Generate invoice for completed job</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Job Details Summary */}
          <div style={{ padding: '1.5rem', background: 'var(--progress-bg)', borderRadius: '12px', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>📋 Job Details</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <p><strong>Job ID:</strong> #{job._id.slice(-8).toUpperCase()}</p>
              <p><strong>Customer:</strong> {job.customer?.name}</p>
              <p><strong>Email:</strong> {job.customer?.email}</p>
              <p><strong>Description:</strong> {job.description}</p>
              {job.address && <p><strong>Address:</strong> {job.address}</p>}
              <p><strong>Scheduled:</strong> {new Date(job.scheduledDate).toLocaleString()}</p>
              {job.completedDate && (
                <p><strong>Completed:</strong> {new Date(job.completedDate).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Receipt Form */}
          <form onSubmit={handleSubmitReceipt}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>🧾 Invoice Details</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Time Spent on Job
              </label>
              <input
                type="text"
                placeholder="e.g., 2h 30m"
                value={receipt.timeSpent}
                onChange={(e) => setReceipt({ ...receipt, timeSpent: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Labor Cost * <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(₹)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Enter labor charges"
                value={receipt.laborCost}
                onChange={(e) => setReceipt({ ...receipt, laborCost: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Material Cost <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(₹, Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter material/parts cost"
                value={receipt.materialCost}
                onChange={(e) => setReceipt({ ...receipt, materialCost: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Additional Charges <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(₹, Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Transport, emergency fees, etc."
                value={receipt.additionalCharges}
                onChange={(e) => setReceipt({ ...receipt, additionalCharges: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Notes (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="Add any additional notes for the customer..."
                value={receipt.notes}
                onChange={(e) => setReceipt({ ...receipt, notes: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            {/* Total Amount Display */}
            <div style={{ 
              padding: '1.5rem', 
              background: 'var(--accent-gradient)', 
              borderRadius: '12px', 
              marginBottom: '2rem',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Total Amount:</h3>
                <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>₹{calculateTotal()}</h2>
              </div>
              {receipt.timeSpent && (
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Time Spent: {receipt.timeSpent}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn" 
                disabled={submitting}
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
              >
                {submitting ? '⏳ Sending...' : '✅ Send Receipt to Customer'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/technician/jobs')}
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer style={{ marginLeft: '250px' }}>
        <p>&copy; 2025 FixAll. All rights reserved. | Payment Receipt</p>
      </footer>
    </div>
  );
};

export default PaymentReceipt;

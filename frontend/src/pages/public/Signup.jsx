import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/common/Footer';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    skills: '',
    secret: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate phone number format (basic validation)
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'technician' && formData.skills) {
        userData.skills = formData.skills.split(',').map(s => s.trim());
      }

      if (formData.role === 'admin') {
        userData.secret = formData.secret;
      }

      const data = await authService.signup(userData);
      
      // Show success message
      alert('✅ ' + (data.message || 'Account created successfully! Please login to continue.'));
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header>
          <nav>
            <div className="logo">FixAll</div>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </nav>
        </header>

        <main>
        <section className="form-section">
          <h2>Create Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Join FixAll and get started today
          </p>

          {error && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              background: 'rgba(139,58,58,0.2)',
              border: '1px solid rgba(139,58,58,0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (e.g., +1234567890)"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Your Role</option>
              <option value="customer">Customer - I need services</option>
              <option value="technician">Technician - I provide services</option>
              <option value="admin">Admin - Platform management</option>
            </select>

            {formData.role === 'technician' && (
              <input
                type="text"
                name="skills"
                placeholder="Your Skills (e.g., Plumbing, Electrical, Carpentry)"
                value={formData.skills}
                onChange={handleChange}
              />
            )}

            {formData.role === 'admin' && (
              <input
                type="text"
                name="secret"
                placeholder="Admin Secret Key"
                value={formData.secret}
                onChange={handleChange}
                required
              />
            )}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--highlight)', fontWeight: 600 }}>Login</Link>
          </p>
        </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Signup;

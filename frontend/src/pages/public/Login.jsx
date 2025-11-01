import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/common/Footer';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      login(data.user, data.token);
      
      // Redirect based on role
      const dashboardMap = {
        admin: '/admin',
        customer: '/customer',
        technician: '/technician',
      };
      navigate(dashboardMap[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </nav>
        </header>

        <main>
        <section className="form-section">
          <h2>Welcome Back!</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Login to access your FixAll account
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
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--highlight)', fontWeight: 600 }}>Sign Up</Link>
          </p>
        </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Login;

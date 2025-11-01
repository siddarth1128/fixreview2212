import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';

const Landing = () => {
  return (
    <div>
      <header>
        <nav>
          <div className="logo">FixAll</div>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </nav>
      </header>
      
      <main>
        <section className="hero">
          <h1>Welcome to FixAll</h1>
          <p>Your trusted home repair and maintenance services platform. Connect with verified technicians for all your repair needs.</p>
          <div>
            <Link to="/signup" className="btn">Get Started</Link>
            <Link to="/login" className="btn">Login</Link>
          </div>
        </section>

        <section style={{ maxWidth: '1400px', margin: '4rem auto', padding: '0 2rem' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '3rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Why Choose FixAll?
          </h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="card">
              <h3>🔧 Verified Technicians</h3>
              <p>All technicians are thoroughly vetted and approved by our admin team. Only skilled professionals with proven experience join our platform.</p>
            </div>
            
            <div className="card">
              <h3>⭐ Ratings & Reviews</h3>
              <p>Read genuine reviews from customers who have used our services. Make informed decisions based on real experiences and ratings.</p>
            </div>
            
            <div className="card">
              <h3>📅 Easy Booking</h3>
              <p>Schedule repairs at your convenience. Book services in just a few clicks and track your booking status in real-time.</p>
            </div>
            
            <div className="card">
              <h3>💳 Secure Payments</h3>
              <p>Transparent pricing with secure payment processing. Pay only after the job is completed to your satisfaction.</p>
            </div>
            
            <div className="card">
              <h3>🕒 Real-Time Tracking</h3>
              <p>Monitor your booking status from pending to in-progress to completion. Stay updated every step of the way.</p>
            </div>
            
            <div className="card">
              <h3>🛡️ Quality Guarantee</h3>
              <p>We ensure high-quality service delivery. Rate and review technicians to help maintain our standards of excellence.</p>
            </div>
          </div>
        </section>

        <section style={{ 
          maxWidth: '1400px', 
          margin: '4rem auto', 
          padding: '3rem 2rem',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid var(--card-border)',
          boxShadow: '0 10px 40px var(--shadow-lg)'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '2rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            How It Works
          </h2>
          
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '0.5rem' }}>Sign Up</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Create your account as a customer or technician. Quick and easy registration process.</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '0.5rem' }}>Browse & Book</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Search for technicians by skills and ratings. Book the service that fits your needs.</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '0.5rem' }}>Get It Fixed</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Technician arrives at scheduled time. Track job progress from start to completion.</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold'
              }}>
                4
              </div>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '0.5rem' }}>Pay & Review</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Complete secure payment and leave a review to help other customers.</p>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1400px', margin: '4rem auto', padding: '0 2rem' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '3rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Services We Offer
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gap: '1.5rem', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            marginBottom: '3rem'
          }}>
            {[
              '🔌 Electrical Repairs',
              '🚰 Plumbing Services',
              '🎨 Painting & Decoration',
              '🪛 Carpentry Work',
              '❄️ AC & Appliance Repair',
              '🏠 Home Maintenance',
              '🔧 General Repairs',
              '🛠️ Installation Services'
            ].map((service, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                background: 'var(--card-bg)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                boxShadow: '0 4px 15px var(--shadow)',
                textAlign: 'center',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow)';
              }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{service}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ 
          maxWidth: '900px', 
          margin: '4rem auto', 
          padding: '3rem 2rem',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid var(--card-border)',
          boxShadow: '0 10px 40px var(--shadow-lg)',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1.5rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Join as a Technician
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            marginBottom: '2rem', 
            color: 'var(--text-secondary)',
            lineHeight: '1.8'
          }}>
            Are you a skilled technician? Join our platform and connect with customers who need your expertise. 
            Manage your bookings, set your availability, and grow your business with FixAll.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn" style={{ width: 'auto', minWidth: '200px' }}>
              Register as Technician
            </Link>
          </div>
        </section>

        <section style={{ 
          maxWidth: '1400px', 
          margin: '4rem auto 2rem', 
          padding: '0 2rem'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '3rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Platform Features
          </h2>
          
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '1rem' }}>For Customers</h3>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Browse verified technicians
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> View ratings and reviews
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Easy booking management
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Track booking status
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Secure payment system
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Booking history access
                </li>
              </ul>
            </div>
            
            <div style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '1rem' }}>For Technicians</h3>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Manage your profile & skills
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> View and accept jobs
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Track job progress
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Set availability status
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Build your reputation
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Earnings dashboard
                </li>
              </ul>
            </div>
            
            <div style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '1rem' }}>Admin Control</h3>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Approve technicians
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Monitor all bookings
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> User management
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Platform statistics
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> Quality assurance
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>✓</span> System oversight
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;

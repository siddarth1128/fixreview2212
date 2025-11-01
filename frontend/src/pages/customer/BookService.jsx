import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Footer from '../../components/common/Footer';

const BookService = () => {
  const [allTechnicians, setAllTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState({ show: false, techId: null, techName: '', tech: null });
  const [bookingForm, setBookingForm] = useState({ description: '', scheduledDate: '', address: '', images: [] });
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const filterTechnicians = useCallback(() => {
    let filtered = allTechnicians.filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tech.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSkill = skillFilter === 'all' || tech.skills?.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
      return matchesSearch && matchesSkill && tech.approved;
    });
    setFilteredTechnicians(filtered);
  }, [allTechnicians, searchTerm, skillFilter]);

  useEffect(() => {
    loadTechnicians();
    // Set minimum date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDate = now.toISOString().slice(0, 16);
    setBookingForm(prev => ({ ...prev, scheduledDate: minDate }));
  }, []);

  useEffect(() => {
    filterTechnicians();
  }, [filterTechnicians]);

  const loadTechnicians = async () => {
    try {
      const response = await api.get('/customer/technicians');
      setAllTechnicians(response.data);
    } catch (error) {
      console.error('Error loading technicians:', error);
      alert('Error loading technicians');
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (techId, techName) => {
    const tech = allTechnicians.find(t => t._id === techId);
    setBookingModal({ show: true, techId, techName, tech });
  };

  const closeBookingModal = () => {
    setBookingModal({ show: false, techId: null, techName: '', tech: null });
    setBookingForm({ description: '', scheduledDate: '', address: '', images: [] });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + bookingForm.images.length > 5) {
      alert('Maximum 5 images allowed');
      e.target.value = ''; // Clear the input
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`${file.name} is too large. Maximum size is 5MB`);
        e.target.value = ''; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBookingForm(prev => ({
          ...prev,
          images: [...prev.images, {
            data: reader.result,
            contentType: file.type,
            uploadedAt: new Date()
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the file input after processing
    e.target.value = '';
  };

  const removeImage = (index) => {
    setBookingForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting booking with', bookingForm.images.length, 'images');
      await api.post('/customer/book', {
        techId: bookingModal.techId,
        ...bookingForm
      });
      alert('Booking created successfully!');
      closeBookingModal();
      navigate('/customer');
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || error.message || 'Error creating booking');
    }
  };

  const viewProfile = (techId) => {
    navigate(`/customer/technician/${techId}`);
  };

  return (
    <div>
      <div className="sidebar">
        <div style={{ padding: '1rem' }}>
          <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '2rem' }}>FixAll</h2>
        </div>
        <ul>
          <li><Link to="/customer">🏠 Dashboard</Link></li>
          <li><Link to="/customer/book" className="active">🔍 Book Service</Link></li>
          <li><Link to="/customer/history">📋 My Bookings</Link></li>
          <li><Link to="/customer/invoices">💰 Invoices</Link></li>
          <li><Link to="/customer/profile">👤 My Profile</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Logout</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🔍 Find a Technician</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Search and book verified professionals for your home repairs</p>
        </div>

        {/* Search and Filter Section */}
        <div className="card" style={{ marginBottom: '2rem', animation: 'scaleIn 0.6s ease-out' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search by name or skill..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', fontSize: '1rem' }}
              />
            </div>
            <select 
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              style={{ padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', fontSize: '1rem' }}
            >
              <option value="all">All Skills</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="carpentry">Carpentry</option>
              <option value="painting">Painting</option>
              <option value="hvac">HVAC</option>
              <option value="appliance">Appliance Repair</option>
            </select>
            <button className="btn" onClick={loadTechnicians} style={{ width: 'auto', padding: '0.875rem 1.5rem' }}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Available Technicians Count */}
        <div style={{ marginBottom: '1.5rem', animation: 'fadeInUp 0.8s ease-out 0.3s both' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--highlight)' }}>{filteredTechnicians.length}</span> technicians available
          </p>
        </div>

        {/* Technicians Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading technicians...</div>
        ) : filteredTechnicians.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No technicians found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
            {filteredTechnicians.map((tech, index) => (
              <div key={tech._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', marginRight: '1rem' }}>
                    {tech.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.3rem' }}>{tech.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>⭐</span>
                      <span style={{ fontWeight: 600 }}>{tech.averageRating || 'New'}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>({tech.reviews?.length || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--progress-bg)', borderRadius: '10px' }}>
                  <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>🔧</span> 
                    <span style={{ fontSize: '0.95rem' }}>{tech.skills?.join(', ') || 'General services'}</span>
                  </p>
                  <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>📧</span> 
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{tech.email}</span>
                  </p>
                  {tech.experience && (
                    <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>💼</span> 
                      <span style={{ fontSize: '0.95rem' }}>{tech.experience} years experience</span>
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button className="btn" onClick={() => openBookingModal(tech._id, tech.name)} style={{ flex: 1 }}>
                    📅 Book Now
                  </button>
                  <button className="btn btn-secondary" onClick={() => viewProfile(tech._id)} style={{ flex: 1 }}>
                    👁️ View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModal.show && (
        <div className="modal" style={{ display: 'flex' }} onClick={closeBookingModal}>
          <div className="modal-content" style={{ animation: 'scaleIn 0.4s ease-out', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeBookingModal}>&times;</span>
            <h2 style={{ marginBottom: '1.5rem' }}>Book Service</h2>
            
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--progress-bg)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.8rem' }}>
                  {bookingModal.techName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{bookingModal.techName}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{bookingModal.tech?.skills?.join(', ') || 'General services'}</p>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              <form onSubmit={handleSubmitBooking}>
                <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Service Description *</label>
                <textarea 
                  required 
                  rows="4" 
                  placeholder="Describe the issue or service you need..."
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Preferred Date & Time *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={bookingForm.scheduledDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Address *</label>
                <textarea 
                  required 
                  rows="2" 
                  placeholder="Enter your service address..."
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '2px solid var(--card-border)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Upload Images (Optional) 
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}> - Max 5 images, 5MB each</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="image-upload"
                    style={{ 
                      display: 'block',
                      width: '100%', 
                      padding: '0.875rem', 
                      borderRadius: '10px', 
                      border: '2px solid var(--card-border)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'var(--card-bg)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'var(--card-border)'}
                  >
                    📷 {bookingForm.images.length > 0 
                      ? `${bookingForm.images.length} image${bookingForm.images.length > 1 ? 's' : ''} selected` 
                      : 'Click to upload images'}
                  </label>
                </div>
                
                {bookingForm.images.length > 0 && (
                  <div style={{ 
                    marginTop: '1rem', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                    gap: '0.75rem' 
                  }}>
                    {bookingForm.images.map((img, index) => (
                      <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--card-border)' }}>
                        <img 
                          src={img.data} 
                          alt={`Upload ${index + 1}`} 
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>Confirm Booking</button>
                  <button type="button" className="btn btn-secondary" onClick={closeBookingModal} style={{ flex: 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookService;

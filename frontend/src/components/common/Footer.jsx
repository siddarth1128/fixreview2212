import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-column">
            <div className="footer-logo">
              <i className="fas fa-tools" aria-hidden="true"></i>
              FixAll
            </div>
            <p className="footer-description">
              Your trusted partner for professional home services. 
              We connect you with verified providers for all your home maintenance and repair needs.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-link" aria-label="Visit our Facebook page" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a href="https://twitter.com" className="social-link" aria-label="Visit our Twitter page" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Visit our Instagram page" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a href="https://linkedin.com" className="social-link" aria-label="Visit our LinkedIn page" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/"><i className="fas fa-chevron-right" aria-hidden="true"></i> Home</Link></li>
              <li><Link to="/login"><i className="fas fa-chevron-right" aria-hidden="true"></i> Login</Link></li>
              <li><Link to="/signup"><i className="fas fa-chevron-right" aria-hidden="true"></i> Sign Up</Link></li>
              <li><a href="#services"><i className="fas fa-chevron-right" aria-hidden="true"></i> Services</a></li>
              <li><a href="#contact"><i className="fas fa-chevron-right" aria-hidden="true"></i> Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Our Services</h3>
            <ul className="footer-links">
              <li><a href="#plumbing"><i className="fas fa-chevron-right" aria-hidden="true"></i> Plumbing</a></li>
              <li><a href="#electrical"><i className="fas fa-chevron-right" aria-hidden="true"></i> Electrical</a></li>
              <li><a href="#carpentry"><i className="fas fa-chevron-right" aria-hidden="true"></i> Carpentry</a></li>
              <li><a href="#appliance"><i className="fas fa-chevron-right" aria-hidden="true"></i> Appliance Repair</a></li>
              <li><a href="#cleaning"><i className="fas fa-chevron-right" aria-hidden="true"></i> Cleaning</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Contact Info</h3>
            <ul className="footer-links">
              <li><a href="tel:+916303048612"><i className="fas fa-phone" aria-hidden="true"></i> +91 6303048612</a></li>
              <li><a href="mailto:sahakarweb@gmail.com"><i className="fas fa-envelope" aria-hidden="true"></i> sahakarweb@gmail.com</a></li>
              <li><span><i className="fas fa-map-marker-alt" aria-hidden="true"></i> Hyderabad, Telangana, India</span></li>
              <li><span><i className="fas fa-clock" aria-hidden="true"></i> 24/7 Customer Support</span></li>
              <li><span><i className="fas fa-star" aria-hidden="true"></i> 4.8/5 Rating</span></li>
            </ul>
          </div>
        </div>
        
        <div className="copyright">
          <p>© 2024 FixAll. All rights reserved. | Web Based Application Project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

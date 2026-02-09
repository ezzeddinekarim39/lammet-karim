// src/Footer.jsx
import React from 'react';
import { FaPhoneAlt, FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">

        {/* Column 1: Brand Info */}
        <div className="footer-col">
          <h3>Lammet Karim</h3>
          <p className="footer-desc">
            The generous gathering. We serve the tastiest snacks with love and high-quality ingredients.
            Order now and enjoy the taste of home.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Our Menu</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <FaPhoneAlt className="icon" />
            <span>+961 76 896 635</span>
          </div>
          <div className="contact-item">
            <FaEnvelope className="icon" />
            <span>lammetkarim@gmail.com</span>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt className="icon" />
            <span>Beirut, Lebanon</span>
          </div>
        </div>

        {/* Column 4: Social Media */}
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="social-icons">
            {/* Replace '#' with your real profile links */}
            <a href="https://wa.me/96176896635" target="_blank" className="social-icon whatsapp"><FaWhatsapp /></a>
            <a href="#" className="social-icon instagram"><FaInstagram /></a>
            <a href="#" className="social-icon facebook"><FaFacebookF /></a>
            <a href="#" className="social-icon tiktok"><FaTiktok /></a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Lammet Karim. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
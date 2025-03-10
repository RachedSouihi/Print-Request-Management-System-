import React from 'react';
import { Container, Row, Col, Form, Nav } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope, FaPhone, FaMapMarker } from 'react-icons/fa';
import './Footer.scss';
import Button from '../components/Button/Button';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="g-5 py-5">
          {/* Branding Section */}
          <Col lg={3} md={6}>
            <div className="branding">
              <h3 className="logo">EduPlatform</h3>
              <p className="tagline">Empowering lifelong learning</p>
            </div>
          </Col>

          {/* Navigation Links */}
          <Col lg={2} md={6}>
            <h5 className="section-title">Quick Links</h5>
            <Nav className="flex-column">
              <Nav.Link href="/about">About Us</Nav.Link>
              <Nav.Link href="/courses">Courses</Nav.Link>
              <Nav.Link href="/contact">Contact</Nav.Link>
              <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
              <Nav.Link href="/terms">Terms of Service</Nav.Link>
            </Nav>
          </Col>

          {/* Contact Information */}
          <Col lg={4} md={6}>
            <h5 className="section-title">Contact Us</h5>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarker className="contact-icon" />
                <span>123 Education Street, Learning City</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href="mailto:support@eduplatform.com">support@eduplatform.com</a>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <a href="tel:+11234567890">+1 (123) 456-7890</a>
              </div>
            </div>
          </Col>

          {/* Newsletter & Social */}
          <Col lg={3} md={6}>
            <h5 className="section-title">Stay Updated</h5>
            <Form className="newsletter-form">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                className="mb-3"
              />
              <Button text="Subscribe"/>
            </Form>
            
            <div className="social-links">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaLinkedin /></a>
            </div>
          </Col>
        </Row>

        {/* Legal Information */}
        <Row className="legal-section">
          <Col className="text-center">
            <p className="copyright">
              © {new Date().getFullYear()} EduPlatform. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
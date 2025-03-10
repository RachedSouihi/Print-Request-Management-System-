import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiLock, FiX } from 'react-icons/fi';
import { useTransition, animated } from '@react-spring/web';
import './modal.scss';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

const AuthModal = ({ show, onClose, onLogin, onSignup }: AuthModalProps) => {
  const transitions = useTransition(show, {
    from: { opacity: 0, transform: 'translateY(-20px) scale(0.98)' },
    enter: { opacity: 1, transform: 'translateY(0) scale(1)' },
    leave: { opacity: 0, transform: 'translateY(20px) scale(0.98)' },
    config: { tension: 300, friction: 25 }
  });

  return transitions((style, item) => item && (
    <animated.div style={style}>
      <Modal
        show={show}
        onHide={onClose}
        centered
        aria-labelledby="auth-modal-title"
        className="auth-modal"
      >
        <div className="modal-overlay" onClick={onClose} />
        
        <Modal.Body className="modal-content">
          <div className="modal-header">
            <FiLock className="header-icon" />
            <button 
              className="close-btn" 
              onClick={onClose}
              aria-label="Close modal"
            >
              <FiX />
            </button>
          </div>

          <div className="modal-body">
            <h2 id="auth-modal-title">Sign In Required</h2>
            <p className="modal-description">
              You must log in or sign up to continue.
            </p>

            <div className="auth-actions">
              <Button 
                variant="primary" 
                className="action-btn login-btn"
                onClick={onLogin}
              >
                Log In
              </Button>
              <Button 
                variant="outline-primary" 
                className="action-btn signup-btn"
                onClick={onSignup}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </animated.div>
  ));
};

export default AuthModal;
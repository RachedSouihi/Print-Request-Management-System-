import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertOctagon,
  FiX
} from 'react-icons/fi';
import './Toast.scss';

interface CustomToastProps {
  show: boolean;
  onClose: () => void;
  type: 'success' | 'danger' | 'warning';
  message: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ show, onClose, type, message }) => {
  const toastConfig = {
    success: {
      icon: <FiCheckCircle />,
      title: 'Success!',
      color: 'success'
    },
    danger: {
      icon: <FiAlertTriangle />,
      title: 'Error!',
      color: 'danger'
    },
    warning: {
      icon: <FiAlertOctagon />,
      title: 'Warning!',
      color: 'warning'
    }
  };

  const { icon, title, color } = toastConfig[type] || toastConfig.warning;

  return (
    <ToastContainer position="top-end" className="toast-container">
      <Toast
        show={show}

        onClose={onClose}
        autohide={type === 'success'}
        delay={5000}
        className={`custom-toast ${color}`}
      >
        <div className="toast-header">
          <span className="toast-icon">{icon}</span>
          <strong className="me-auto">{title}</strong>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <Toast.Body className="toast-body">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default CustomToast;
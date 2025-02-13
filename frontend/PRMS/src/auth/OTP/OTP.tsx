import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiClock, FiMail } from 'react-icons/fi';
import './OTP.scss';

const OtpModal = ({ show, onClose, email }: any) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let interval: any;
    if (timer > 0 && show) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, show]);

  const handleOtpChange = (index: number, value: any) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const checkCode = (): void => {
    const code = otp.join('');
    if (code === '1234') {
      alert('OTP verified!');
    } else {
      alert('Invalid OTP!');
    }
  };

  const handleResend = () => {
    setTimer(30);
    setIsResendDisabled(true);
  };

  return (
    <Modal show={show} onHide={onClose} centered className="otp-modal">
      <Modal.Header closeButton>
        <Modal.Title className="modal-title">
          <FiMail className="title-icon" />
          Verify Your Email
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="otp-instructions">
          <p>We've sent a 4-digit code to <strong>{email}</strong></p>
        </div>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-digit"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div className="timer">
          <FiClock className="clock-icon" />
          <span>Code expires in: {timer}s</span>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="verify-btn"
          disabled={otp.join('').length !== 4}
          onClick={checkCode}
        >
          Verify
        </Button>
        <Button
          variant="link"
          className="resend-btn"
          onClick={handleResend}
          disabled={isResendDisabled}
        >
          Resend Code
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OtpModal;
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, InputGroup, ProgressBar } from 'react-bootstrap';
import { FiLock, FiKey, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './style.scss';
import Loading from '../../common/Loading';

interface ChangePasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => void;
  error: string | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ show, onClose, onSubmit, error }) => {
  const [success, setSuccess] = useState(false);

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/\d/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return (score / 4) * 100;
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/\d/, 'Password must contain a number')
      .matches(/[A-Z]/, 'Password must contain an uppercase letter')
      .matches(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      strength: 0
    },
    validationSchema,
    onSubmit: (values) => {
      // Simulate API call

      console.log(values)

      onSubmit(values.currentPassword, values.newPassword);
      /*setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      }, 1000);*/
    },
  });

  useEffect(() => {
    if (!show) {
      formik.resetForm();
    }
  }, [show]);

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      size="lg"
      aria-labelledby="password-modal-title"
      className="password-modal"
    >
      {/* Modal Header */}
      <Modal.Header className="modal-header-gradient border-0">
        <div className="security-icon">
          <FiLock aria-hidden="true" />
        </div>
        <Button 
          variant="link" 
          onClick={onClose} 
          className="close-button"
          aria-label="Close"
        >
          <FiX />
        </Button>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body className="px-4 pb-4">
        <h2 id="password-modal-title" className="text-center mb-4">
          Update Your Password
        </h2>

        {success ? (
          <div className="success-state text-center py-4">
            <FiCheckCircle className="success-icon" />
            <h3 className="mt-3">Password Updated!</h3>
            <p className="text-muted">Your changes have been saved successfully</p>
          </div>
        ) : (
          <Form onSubmit={formik.handleSubmit} noValidate>
            {/* Error Messages */}
            {formik.errors.currentPassword && formik.touched.currentPassword && (
              <Alert variant="danger" className="mb-4">
                <div className="d-flex align-items-center gap-2">
                  <FiAlertCircle aria-hidden="true" />
                  {formik.errors.currentPassword}
                </div>
              </Alert>
            )}
            {formik.errors.newPassword && formik.touched.newPassword && (
              <Alert variant="danger" className="mb-4">
                <div className="d-flex align-items-center gap-2">
                  <FiAlertCircle aria-hidden="true" />
                  {formik.errors.newPassword}
                </div>
              </Alert>
            )}
            {formik.errors.confirmPassword && formik.touched.confirmPassword && (
              <Alert variant="danger" className="mb-4">
                <div className="d-flex align-items-center gap-2">
                  <FiAlertCircle aria-hidden="true" />
                  {formik.errors.confirmPassword}
                </div>
              </Alert>
            )}

            {/* Current Password Field */}
            <Form.Group className="mb-4" controlId="currentPassword">
              <Form.Label>Current Password</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <FiKey aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  {...formik.getFieldProps('currentPassword')}
                  isInvalid={formik.touched.currentPassword && !!formik.errors.currentPassword}
                  placeholder="Enter current password"
                  aria-describedby="currentPasswordHelp"
                />
                <Form.Control.Feedback type="invalid">
                  <FiAlertCircle aria-hidden="true" /> {formik.errors.currentPassword}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* New Password Field */}
            <Form.Group className="mb-4" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <FiLock aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  {...formik.getFieldProps('newPassword')}
                  isInvalid={formik.touched.newPassword && !!formik.errors.newPassword}
                  placeholder="Create new password"
                  aria-describedby="passwordHelp"
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue('newPassword', e.target.value);
                    formik.setFieldValue('strength', calculateStrength(e.target.value));
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  <FiAlertCircle aria-hidden="true" /> {formik.errors.newPassword}
                </Form.Control.Feedback>
              </InputGroup>
              <ProgressBar 
                now={formik.values.strength} 
                className="mt-2" 
                variant={
                  formik.values.strength < 25 ? 'danger' :
                  formik.values.strength < 50 ? 'warning' :
                  formik.values.strength < 75 ? 'info' : 'success'
                }
                aria-label="Password strength"
              />
            </Form.Group>
            

            {/* Confirm Password Field */}
            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label>Confirm New Password</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <FiLock aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  {...formik.getFieldProps('confirmPassword')}
                  isInvalid={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
                  placeholder="Confirm new password"
                  aria-describedby="confirmPasswordHelp"
                />
                <Form.Control.Feedback type="invalid">
                  <FiAlertCircle aria-hidden="true" /> {formik.errors.confirmPassword}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex gap-3 mt-5">
              <Button
                variant="outline-secondary"
                onClick={onClose}
                className="flex-grow-1"
                aria-label="Cancel password change"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="flex-grow-1"
                aria-label="Submit password change"
              >
                Update Password
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};


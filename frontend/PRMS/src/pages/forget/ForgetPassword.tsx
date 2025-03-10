import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

interface ForgetPasswordProps {
  show: boolean;
  handleClose: () => void;
}

const ForgetPassword = ({ show, handleClose }: ForgetPasswordProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Send email, 2: Verify + New password
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Send verification code via email
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!email) {
      setLocalError("Please enter a valid email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/user/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send the verification code.");

      console.log("Email sent successfully.");
      setStep(2); // Move to the next step
    } catch (error) {
      console.error("Error sending the code:", error);
      setLocalError("Unable to send the verification code.");
    }
  };

  // Step 2: Verify the code and update the password
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!verificationCode || verificationCode.length !== 4) {
      setLocalError("Please enter a valid 4-digit code.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:8081/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, verificationCode }),
      });

      if (!response.ok) throw new Error("Failed to update the password.");

      console.log("Password updated successfully.");
      handleClose();
    } catch (error) {
      console.error("Error updating password:", error);
      setLocalError("Failed to update the password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" animation={true}>
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">
          {step === 1 ? "Password Reset" : "Verification Code"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 ? (
          <Form onSubmit={handleSubmitEmail}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>
            {localError && <Alert variant="danger" className="mt-3">{localError}</Alert>}
            <Button variant="primary" type="submit" className="mt-4 w-100 btn-lg">
              Send Code
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleSubmitVerification}>
            <Form.Group controlId="formVerificationCode">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the code received"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength={4}
                className="form-control-lg"
              />
            </Form.Group>
            <Form.Group controlId="formNewPassword" className="mt-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword" className="mt-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>
            {localError && <Alert variant="danger" className="mt-3">{localError}</Alert>}
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            <Button variant="primary" type="submit" className="mt-4 w-100 btn-lg" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? <Spinner animation="border" size="sm" /> : "Confirm"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ForgetPassword;

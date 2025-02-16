import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import "./forget.css";

interface ForgetPasswordProps {
  show: boolean;
  handleClose: () => void;
}

const ForgetPassword = ({ show, handleClose }: ForgetPasswordProps) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Étape 1: Email, Étape 2: Code de vérification et Nouveau mot de passe
  const [error, setError] = useState("");

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email soumis:", email);
    setStep(2); // Passer à l'étape suivante
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    console.log("Code de vérification soumis:", verificationCode);
    console.log("Nouveau mot de passe:", newPassword);

    // Logic to verify code and update password here

    handleClose(); // Fermeture du modal après succès
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      animation={true}
      className="forget-password-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">
          {step === 1 ? "Réinitialisation du mot de passe" : "Vérification du code"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 ? (
          <Form onSubmit={handleSubmitEmail}>
            <Form.Group controlId="formEmail">
              <Form.Label>Adresse e-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control-lg pulse"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-4 w-100 btn-lg shadow-lg hover-btn">
              Envoyer le code
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleSubmitVerification}>
            <Form.Group controlId="formVerificationCode">
              <Form.Label>Code de vérification</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le code de 4 chiffres"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength={4}
                className="form-control-lg pulse"
              />
            </Form.Group>
            <Form.Group controlId="formNewPassword">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-control-lg pulse"
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-control-lg pulse"
              />
            </Form.Group>
            {error && <p className="text-danger">{error}</p>}
            <Button variant="primary" type="submit" className="mt-4 w-100 btn-lg shadow-lg hover-btn">
              Confirmer
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ForgetPassword;

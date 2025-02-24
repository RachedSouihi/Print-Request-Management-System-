import React, { useState } from "react";
import Header from "../../layouts/Header";
import ExamsOverview from "../../components/ExamsOverview";
import TestimonialCarousel from "../../components/Testimonials";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col, Button } from "react-bootstrap";
import CustomToast from "../../common/Toast";
import DocumentOverview from "../../components/DocumentOverview";
import { useNavigate } from "react-router-dom"; 

const Home: React.FC = () => {
  const [showToast, setShowToast] = useState<boolean>(true);
  const [toastType, setToastType] = useState<'success' | 'danger' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState<string>('Operation completed successfully!');
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem("token"); // Supprimer le token
    navigate("/"); // Rediriger vers la page de connexion
  };

  return (
    <div className="d-flex gap-0">
      <CustomToast
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        message={toastMessage}
      />

      <Col md={3}>
        <Sidebar />
      </Col>

      <Col md={9}>
        <Header />
        <Button onClick={handleLogout} variant="danger" className="mt-3">
          Se déconnecter
        </Button>

        <DocumentOverview />
        <ExamsOverview />
        <TestimonialCarousel />
        <Footer />
      </Col>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col } from "react-bootstrap";
import CustomToast from "../../common/Toast";

const Home: React.FC = () => {
  const [showToast, setShowToast] = useState<boolean>(true);
  const [toastType, setToastType] = useState<'success' | 'danger' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState<string>('Operation completed successfully!');

  return (
    <div className="d-flex gap-0">
      <Col md={3}>
        <Sidebar />
      </Col>

      <Col md={9}>
        <Header />
        <Button onClick={handleLogout} variant="danger" className="mt-3">
          Se déconnecter
        </Button>

        <ExamsOverview />

        <TestimonialCarousel />

        <Footer />
      </Col>
    </div>
  );
};

export default Home;

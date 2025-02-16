import React, { useState } from "react";
import Header from "../../layouts/Header";
import ExamsOverview from "../../components/ExamsOverview";
import TestimonialCarousel from "../../components/Testimonials";
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

        <ExamsOverview />

        <TestimonialCarousel />

        <Footer />
      </Col>
    </div>
  );
};

export default Home;

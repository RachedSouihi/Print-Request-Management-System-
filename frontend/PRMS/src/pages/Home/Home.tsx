import React, { useState, useEffect } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col, Button } from "react-bootstrap";
import CustomToast from "../../common/Toast";
import DocumentOverview from "../../components/DocumentOverview";
import { PrintRequestModal } from "../../components/PrintRequest/PrintRequest";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { fetchDocuments } from "../../store/documentsSlice";

const Home: React.FC = () => {
  const [showToast, setShowToast] = useState<boolean>(true);
  const [toastType, setToastType] = useState<'success' | 'danger' | 'warning'>('success');
  const [toastMessage, setToastMessage] = useState<string>('Operation completed successfully!');
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Supprimer le token
    navigate("/"); // Rediriger vers la page de connexion
  };

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
        {/* Composant pour afficher un aperçu des documents */}
        <DocumentOverview />
        {/* Outlet pour afficher le contenu des routes enfants */}
        <Outlet />
        <Footer />
      </Col>
    </div>
  );
};

export default Home;
